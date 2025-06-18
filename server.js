#!/usr/bin/env node

// Coolify Wrapper - leitet zum Next.js Start um
console.log('Starting Next.js application via wrapper...');

const { spawn } = require('child_process');

const child = spawn('npm', ['run', 'start'], {
  stdio: 'inherit',
  env: process.env,
  shell: true
});

child.on('error', (error) => {
  console.error('Failed to start application:', error);
  process.exit(1);
});

child.on('exit', (code) => {
  process.exit(code);
});
