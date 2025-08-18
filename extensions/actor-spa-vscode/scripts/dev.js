#!/usr/bin/env node

const { spawn } = require('node:child_process');
const fs = require('node:fs');

console.log('🚀 Starting Actor-SPA Extension Development');

// Clean previous builds
if (fs.existsSync('out')) {
  fs.rmSync('out', { recursive: true });
  console.log('🧹 Cleaned previous build');
}

// Start TypeScript compilation in watch mode
const tsc = spawn('npx', ['tsc', '--watch'], {
  stdio: 'inherit',
  shell: true,
});

console.log('👀 TypeScript compiler watching for changes...');
console.log('💡 Press F5 in VS Code to launch Extension Development Host');
console.log('🔄 Make changes to your source files and they will be compiled automatically');

// Handle process termination
process.on('SIGINT', () => {
  console.log('\n🛑 Stopping development server...');
  tsc.kill();
  process.exit(0);
});

tsc.on('close', (code) => {
  if (code !== 0) {
    console.error(`❌ TypeScript compilation failed with code ${code}`);
    process.exit(1);
  }
});
