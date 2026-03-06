const path = require('path');
const fs = require('fs');

const appRoot = __dirname;

function loadEnvFile(filePath) {
  const vars = {};
  if (fs.existsSync(filePath)) {
    const lines = fs.readFileSync(filePath, 'utf8').split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const eqIndex = trimmed.indexOf('=');
        if (eqIndex > 0) {
          const key = trimmed.substring(0, eqIndex).trim();
          const value = trimmed.substring(eqIndex + 1).trim();
          vars[key] = value;
        }
      }
    }
  }
  return vars;
}

const envVars = loadEnvFile(path.join(appRoot, '.env'));
const stagingEnvVars = loadEnvFile(path.join(appRoot, '.env.staging'));

// DO NOT CHANGE: Nginx proxies depend on these ports
const prodPort = '5003';    // itopsconsole.com
const stagingPort = '5006'; // staging.itopsconsole.com

module.exports = {
  apps: [
    {
      name: 'itops-api',
      script: 'dist/index.cjs',
      cwd: appRoot,
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',
      env: {
        ...envVars,
        NODE_ENV: 'production',
        PORT: prodPort
      }
    },
    {
      name: 'itops-staging',
      script: 'dist/index.cjs',
      cwd: appRoot,
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',
      env: {
        ...stagingEnvVars,
        NODE_ENV: 'production',
        STAGING: 'true',
        PORT: stagingPort
      }
    }
  ]
};
