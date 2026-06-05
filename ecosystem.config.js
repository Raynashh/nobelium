const fs = require('fs');
const path = require('path');

const envDevPath = path.join(__dirname, '.env.dev');
const envConfig = {};

if (fs.existsSync(envDevPath)) {
  const fileContent = fs.readFileSync(envDevPath, 'utf-8');
  fileContent.split('\n').forEach(line => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) {
      let key = match[1].trim();
      let value = match[2].trim();
      if (value.startsWith('"') && value.endsWith('"')) {
        value = value.slice(1, -1);
      }
      envConfig[key] = value;
    }
  });
}

module.exports = {
  apps: [
    {
      name: "nobelium",
      script: "npm",
      args: "start",
      env: {
        NODE_ENV: "production",
        ...envConfig
      },
    },
  ],
};
