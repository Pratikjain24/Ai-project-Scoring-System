import { spawn, execSync } from 'node:child_process';

console.log('====================================================');
console.log('🚀 Starting ProjectX-Ray AI (Full-Stack Dev Engine)');
console.log('📡 Frontend: http://localhost:5173');
console.log('📡 Backend:  http://localhost:3001');
console.log('====================================================\n');

const isWin = process.platform === 'win32';
const npxCmd = isWin ? 'npx.cmd' : 'npx';

const killProcessTree = (child) => {
  if (!child || !child.pid) return;
  try {
    if (isWin) {
      execSync(`taskkill /pid ${child.pid} /T /F`, { stdio: 'ignore' });
    } else {
      process.kill(-child.pid, 'SIGTERM');
    }
  } catch {
    try {
      child.kill('SIGTERM');
    } catch {
      // Ignore if already exited
    }
  }
};

const backend = spawn(npxCmd, ['tsx', 'watch', 'backend/src/server.ts'], {
  stdio: 'inherit',
  shell: true,
});

const frontend = spawn(npxCmd, ['vite'], {
  stdio: 'inherit',
  shell: true,
});

let isCleaningUp = false;
const cleanup = () => {
  if (isCleaningUp) return;
  isCleaningUp = true;
  console.log('\nStopping servers...');
  killProcessTree(backend);
  killProcessTree(frontend);
  process.exit(0);
};

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
process.on('exit', cleanup);
