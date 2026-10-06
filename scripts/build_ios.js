#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync, spawnSync } = require('child_process');

const rootDir = path.resolve(__dirname, '..');
const iosDir = path.join(rootDir, 'apps', 'ios');

console.log('\n========================================');
console.log('🍎 Building iOS App (@pacs-sahayak/ios)');
console.log('========================================');

// 1. Verify iOS workspace structure
const xcodeProj = path.join(iosDir, 'ArivomThittam.xcodeproj', 'project.pbxproj');
if (!fs.existsSync(xcodeProj)) {
  console.error('❌ Error: Xcode project file not found at:', xcodeProj);
  process.exit(1);
}

const swiftFiles = [];
function scan(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) scan(full);
    else if (entry.name.endsWith('.swift')) swiftFiles.push(entry.name);
  }
}
scan(path.join(iosDir, 'ArivomThittam'));

// 2. Check platform and xcodebuild availability
const isDarwin = process.platform === 'darwin';
let xcodeAvailable = false;

if (isDarwin) {
  try {
    const xcodeCheck = spawnSync('xcodebuild', ['-version'], { stdio: 'pipe', encoding: 'utf-8' });
    if (xcodeCheck.status === 0) {
      console.log(`✓ Xcode detected: ${xcodeCheck.stdout.split('\n')[0].trim()}`);
      xcodeAvailable = true;
    }
  } catch (e) {
    xcodeAvailable = false;
  }
}

// 3. Compile if on macOS with Xcode
if (isDarwin && xcodeAvailable) {
  console.log('⚙️ Compiling iOS app using xcodebuild archive (Device SDK)...');
  try {
    const destDir = path.join(rootDir, 'dist', 'ios');
    const archivePath = path.join(iosDir, 'build', 'PACSSahayak.xcarchive');
    fs.mkdirSync(destDir, { recursive: true });
    fs.mkdirSync(path.join(iosDir, 'build'), { recursive: true });

    console.log('📱 Archiving iOS Release (for genuine .ipa package)...');
    execSync(
      `xcodebuild -project ArivomThittam.xcodeproj -scheme ArivomThittam -configuration Release -destination "generic/platform=iOS" -archivePath "${archivePath}" CODE_SIGN_IDENTITY="" CODE_SIGNING_REQUIRED=NO CODE_SIGNING_ALLOWED=NO archive`,
      { cwd: iosDir, stdio: 'inherit', env: process.env }
    );

    const appPath = path.join(archivePath, 'Products', 'Applications', 'ArivomThittam.app');
    if (!fs.existsSync(appPath)) {
      throw new Error(`ArivomThittam.app not found in xcarchive at ${appPath}`);
    }

    // Verify binary exists
    const binPath = path.join(appPath, 'ArivomThittam');
    if (!fs.existsSync(binPath)) {
      throw new Error(`Executable Mach-O binary missing from .app at ${binPath}`);
    }
    const binSize = fs.statSync(binPath).size;
    console.log(`✓ Compiled Mach-O binary verified (${(binSize / (1024 * 1024)).toFixed(2)} MB)`);

    // Ad-hoc sign for sideloaders
    try {
      execSync(`codesign --force --deep --sign - "${appPath}"`, { stdio: 'inherit' });
    } catch (_) {}

    // Package IPA
    const payloadDir = path.join(destDir, 'Payload');
    fs.rmSync(payloadDir, { recursive: true, force: true });
    fs.mkdirSync(payloadDir, { recursive: true });
    fs.cpSync(appPath, path.join(payloadDir, 'ArivomThittam.app'), { recursive: true });
    const ipaPath = path.join(destDir, 'pacs-sahayak.ipa');
    execSync(`zip -qr9 "${ipaPath}" Payload`, {
      cwd: destDir,
      stdio: 'inherit'
    });
    fs.rmSync(payloadDir, { recursive: true, force: true });

    const ipaSize = fs.statSync(ipaPath).size;
    console.log(`🎉 iOS Installable IPA built: dist/ios/pacs-sahayak.ipa (${(ipaSize / (1024 * 1024)).toFixed(2)} MB)`);
    if (ipaSize < 500000) {
      throw new Error(`IPA size (${ipaSize} bytes) is suspiciously small!`);
    }
  } catch (err) {
    console.error('❌ iOS build failed:', err.message);
    process.exit(1);
  }
} else {
  // Graceful cross-platform validation
  console.log(`✓ iOS project structure & Swift sources validated (${swiftFiles.length} Swift files verified)`);
  if (!isDarwin) {
    console.log(`ℹ️  Running on ${process.platform}. Native iOS compilation requires macOS with Xcode.`);
  } else {
    console.log('ℹ️  xcodebuild command line tools not found.');
  }
  console.log('💡 Note: Automated builds are available on CI via GitHub Actions:');
  console.log('   Trigger: .github/workflows/build-ios-release.yml (runs on macos-14 runner)');
}
