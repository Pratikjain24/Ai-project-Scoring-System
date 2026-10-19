#!/usr/bin/env node

// =========================================================================
// PROJECTX-RAY AI — RUNTIME ENVIRONMENT VALIDATOR
// Enforces Node.js >= 22.0.0 for native SQLite (node:sqlite) compatibility
// =========================================================================

const currentVersion = process.versions.node;
const [major] = currentVersion.split('.').map(Number);
const REQUIRED_NODE_MAJOR = 22;

export function validateNodeRuntime(versionString = currentVersion) {
  const [majorVer] = versionString.split('.').map(Number);
  return {
    isValid: majorVer >= REQUIRED_NODE_MAJOR,
    currentVersion: versionString,
    majorVersion: majorVer,
    requiredVersion: `>= ${REQUIRED_NODE_MAJOR}.0.0`,
  };
}

if (major < REQUIRED_NODE_MAJOR) {
  console.error('\n' + '='.repeat(70));
  console.error('\x1b[41m\x1b[37m [FATAL RUNTIME ERROR] UNSUPPORTED NODE.JS RUNTIME DETECTED \x1b[0m');
  console.error('='.repeat(70));
  console.error(`❌ Current Version:  v${currentVersion}`);
  console.error(`✅ Required Version: Node.js >= ${REQUIRED_NODE_MAJOR}.0.0`);
  console.error('\n🔍 Reason for requirement:');
  console.error('   ProjectX-Ray AI relies on native high-performance SQLite');
  console.error('   (node:sqlite DatabaseSync) and modern ECMAScript features introduced in Node 22.');
  console.error('   Running on Node 18 or 20 will cause runtime crashes.\n');
  console.error('💡 Solution:');
  console.error('   - Using nvm:   nvm install 22 && nvm use 22');
  console.error('   - Using fnm:   fnm use 22');
  console.error('   - Direct:      Download Node 22 LTS from https://nodejs.org/');
  console.error('='.repeat(70) + '\n');
  process.exit(1);
} else {
  // Only log success when executed directly as script, not when imported
  const isDirect = process.argv[1]?.endsWith('checkNodeVersion.js');
  if (isDirect) {
    console.log(`\x1b[32m✔ Node.js runtime validated: v${currentVersion} (native node:sqlite supported)\x1b[0m`);
  }
}
