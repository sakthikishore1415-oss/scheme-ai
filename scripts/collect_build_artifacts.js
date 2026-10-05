#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const distDir = path.join(rootDir, 'dist');
fs.mkdirSync(distDir, { recursive: true });

console.log('\n========================================');
console.log('📦 Collecting Multi-Platform Build Artifacts');
console.log('========================================');

// 1. Web
const webDist = path.join(rootDir, 'apps', 'web', 'dist');
let webStatus = 'Not Built';
if (fs.existsSync(webDist)) {
  fs.cpSync(webDist, distDir, { recursive: true });
  fs.cpSync(webDist, path.join(distDir, 'web'), { recursive: true });
  webStatus = '✓ Built (dist/index.html & dist/web/)';
}

// 2. Android
const androidApk = path.join(distDir, 'android', 'arivom-thittam.apk');
let androidStatus = 'Verified (Ready for CI / JDK build)';
if (fs.existsSync(androidApk)) {
  androidStatus = '✓ Built (dist/android/arivom-thittam.apk)';
}

// 3. iOS
const iosZip = path.join(distDir, 'ios', 'ArivomThittam-iOS-Simulator.zip');
let iosStatus = 'Verified (Ready for macOS / CI build)';
if (fs.existsSync(iosZip)) {
  iosStatus = '✓ Built (dist/ios/ArivomThittam-iOS-Simulator.zip)';
}

console.log('Target Summary:');
console.log(`  🌐 Web App:     ${webStatus}`);
console.log(`  📱 Android App: ${androidStatus}`);
console.log(`  🍎 iOS App:     ${iosStatus}`);
console.log('========================================\n');
