import { exec } from 'node:child_process';

const currentProcessArgs = process.argv.slice(2);

const { stdout, stderr } = exec(
  `tsnd ${__dirname}/run-with-ts-support ${currentProcessArgs.join(' ')}`
);
stdout?.on('data', (data) => console.log(data));
stderr?.on('data', (data) => console.error(data));
