import { spawnSync } from 'node:child_process';

function isSupportedNodeVersion(version) {
  const [major, minor] = version.split('.').map(Number);

  if (major === 20) {
    return minor >= 20;
  }

  if (major === 22) {
    return minor >= 22;
  }

  return major > 22;
}

const currentNode = process.versions.node;

if (!isSupportedNodeVersion(currentNode)) {
  console.error(
    `Promptfoo 0.121.11 requires Node 20.20+ or 22.22+. Current Node: ${currentNode}.`
  );
  console.error(
    'Use a Promptfoo-supported Node runtime for the pilot, or skip npm run eval on this machine.'
  );
  process.exit(1);
}

const promptfooArgs = ['--yes', 'promptfoo@0.121.11', 'eval', ...process.argv.slice(2)];

const result =
  process.platform === 'win32'
    ? spawnSync('cmd.exe', ['/d', '/s', '/c', 'npx', ...promptfooArgs], {
        stdio: 'inherit',
        env: process.env,
      })
    : spawnSync('npx', promptfooArgs, {
        stdio: 'inherit',
        env: process.env,
      });

if (result.error) {
  console.error(`Failed to launch Promptfoo: ${result.error.message}`);
}

process.exit(result.status ?? 1);
