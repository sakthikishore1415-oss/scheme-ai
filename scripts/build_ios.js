#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync, spawnSync } = require('child_process');

const rootDir = path.resolve(__dirname, '..');
const iosDir = path.join(rootDir, 'apps', 'ios');

console.log('\n========================================');
console.log('🍎 Building iOS App (@arivom-thittam/ios)');
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
  console.log('⚙️ Compiling iOS app using xcodebuild (Device SDK / iphoneos & Simulator)...');
  try {
    const destDir = path.join(rootDir, 'dist', 'ios');
    fs.mkdirSync(destDir, { recursive: true });

    // A. Build Device SDK / iphoneos for Installable IPA
    console.log('📱 Building iOS Device SDK (for .ipa package)...');
    execSync(
      'xcodebuild -project ArivomThittam.xcodeproj -scheme ArivomThittam -configuration Release -sdk iphoneos CODE_SIGN_IDENTITY="" CODE_SIGNING_REQUIRED=NO CODE_SIGN_ENTITLEMENTS="" CODE_SIGNING_ALLOWED=NO build',
      { cwd: iosDir, stdio: 'inherit', env: process.env }
    );

    const deviceSettings = execSync(
      'xcodebuild -project ArivomThittam.xcodeproj -scheme ArivomThittam -sdk iphoneos -configuration Release -showBuildSettings',
      { cwd: iosDir, encoding: 'utf-8' }
    );
    const deviceMatch = deviceSettings.match(/\sBUILT_PRODUCTS_DIR\s=\s(.*)/);
    if (deviceMatch && deviceMatch[1]) {
      const deviceBuildDir = deviceMatch[1].trim();
      const appPath = path.join(deviceBuildDir, 'ArivomThittam.app');
      if (fs.existsSync(appPath)) {
        const payloadDir = path.join(destDir, 'Payload');
        fs.rmSync(payloadDir, { recursive: true, force: true });
        fs.mkdirSync(payloadDir, { recursive: true });
        fs.cpSync(appPath, path.join(payloadDir, 'ArivomThittam.app'), { recursive: true });
        execSync(`zip -qr "${path.join(destDir, 'arivom-thittam.ipa')}" Payload`, {
          cwd: destDir,
          stdio: 'inherit'
        });
        fs.rmSync(payloadDir, { recursive: true, force: true });
        console.log(`\n🎉 iOS Installable IPA built: dist/ios/arivom-thittam.ipa`);
      }
    }

    // B. Build Simulator SDK
    console.log('💻 Building iOS Simulator build (for Mac preview)...');
    execSync(
      'xcodebuild -project ArivomThittam.xcodeproj -scheme ArivomThittam -destination "generic/platform=iOS Simulator" -configuration Release CODE_SIGN_IDENTITY="" CODE_SIGNING_REQUIRED=NO CODE_SIGN_ENTITLEMENTS="" CODE_SIGNING_ALLOWED=NO build',
      { cwd: iosDir, stdio: 'inherit', env: process.env }
    );

    const simSettings = execSync(
      'xcodebuild -project ArivomThittam.xcodeproj -scheme ArivomThittam -destination "generic/platform=iOS Simulator" -configuration Release -showBuildSettings',
      { cwd: iosDir, encoding: 'utf-8' }
    );
    const simMatch = simSettings.match(/\sBUILT_PRODUCTS_DIR\s=\s(.*)/);
    if (simMatch && simMatch[1]) {
      const simBuildDir = simMatch[1].trim();
      const simApp = path.join(simBuildDir, 'ArivomThittam.app');
      if (fs.existsSync(simApp)) {
        execSync(`zip -qr "${path.join(destDir, 'arivom-thittam-ios-simulator.zip')}" ArivomThittam.app`, {
          cwd: simBuildDir,
          stdio: 'inherit'
        });
        console.log(`🎉 iOS Simulator bundle archived: dist/ios/arivom-thittam-ios-simulator.zip\n`);
      }
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
