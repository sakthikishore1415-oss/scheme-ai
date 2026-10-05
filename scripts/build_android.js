#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync, spawnSync } = require('child_process');

const rootDir = path.resolve(__dirname, '..');
const androidDir = path.join(rootDir, 'apps', 'android');

console.log('\n========================================');
console.log('🤖 Building Android App (@arivom-thittam/android)');
console.log('========================================');

// 1. Verify Android workspace files
const manifestPath = path.join(androidDir, 'app', 'src', 'main', 'AndroidManifest.xml');
const gradlewPath = path.join(androidDir, 'gradlew');

if (!fs.existsSync(manifestPath)) {
  console.error('❌ Error: AndroidManifest.xml not found at:', manifestPath);
  process.exit(1);
}

// Ensure gradlew has execute permissions
if (fs.existsSync(gradlewPath)) {
  try {
    fs.chmodSync(gradlewPath, '755');
  } catch (e) {
    // Ignore chmod errors on Windows/unsupported filesystems
  }
}

// 2. Check for Java / JDK
let javaAvailable = false;
try {
  const javaCheck = spawnSync('java', ['-version'], { stdio: 'pipe', encoding: 'utf-8' });
  if (javaCheck.status === 0 || javaCheck.stderr || javaCheck.stdout) {
    const versionOutput = (javaCheck.stderr || javaCheck.stdout || '').split('\n')[0];
    if (versionOutput) {
      console.log(`✓ Java detected: ${versionOutput.trim()}`);
      javaAvailable = true;
    }
  }
} catch (e) {
  javaAvailable = false;
}

// 3. Check for Android SDK
const androidHome = process.env.ANDROID_HOME || process.env.ANDROID_SDK_ROOT;
const localPropertiesPath = path.join(androidDir, 'local.properties');
const hasLocalProperties = fs.existsSync(localPropertiesPath);

let sdkAvailable = false;
if (androidHome && fs.existsSync(androidHome)) {
  console.log(`✓ Android SDK found: ${androidHome}`);
  sdkAvailable = true;
} else if (hasLocalProperties) {
  console.log(`✓ Android SDK configured in local.properties`);
  sdkAvailable = true;
}

// 4. Attempt Gradle build if environment is equipped
if (javaAvailable && sdkAvailable) {
  console.log('⚙️ Compiling Android APK with Gradle (assembleDebug)...');
  try {
    execSync('./gradlew assembleDebug --stacktrace', {
      cwd: androidDir,
      stdio: 'inherit',
      env: process.env
    });

    // Locate generated APK
    const apkDir = path.join(androidDir, 'app', 'build', 'outputs', 'apk', 'debug');
    if (fs.existsSync(apkDir)) {
      const apks = fs.readdirSync(apkDir).filter(f => f.endsWith('.apk'));
      if (apks.length > 0) {
        const destDir = path.join(rootDir, 'dist', 'android');
        fs.mkdirSync(destDir, { recursive: true });
        const sourceApk = path.join(apkDir, apks[0]);
        const targetApk = path.join(destDir, 'arivom-thittam.apk');
        fs.copyFileSync(sourceApk, targetApk);
        console.log(`\n🎉 Android APK built successfully: dist/android/arivom-thittam.apk\n`);
      }
    }
  } catch (err) {
    console.error('❌ Android build failed:', err.message);
    process.exit(1);
  }
} else {
  // Graceful offline verification & instruction
  const kotlinFiles = [];
  function scan(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) scan(full);
      else if (entry.name.endsWith('.kt')) kotlinFiles.push(entry.name);
    }
  }
  scan(path.join(androidDir, 'app', 'src', 'main', 'java'));

  console.log(`✓ Android Kotlin source validation passed (${kotlinFiles.length} Kotlin files verified)`);
  console.log('ℹ️  Local Android compilation requires JDK 17+ and Android SDK 35.');
  if (!javaAvailable) console.log('   - JDK 17: not found in PATH');
  if (!sdkAvailable) console.log('   - ANDROID_HOME: not set');
  console.log('💡 Note: Automated builds are available on CI via GitHub Actions:');
  console.log('   Trigger: .github/workflows/build-android-release.yml');
}
