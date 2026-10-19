import { execSync } from 'node:child_process';

execSync('npm run start --prefix apps/web', { stdio: 'inherit' });
