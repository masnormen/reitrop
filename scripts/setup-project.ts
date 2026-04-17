import fs from 'fs';
import path from 'path';

/**
 * Copy each .env.example file to .env if it doesn't already exist
 */

const __dirname = path.dirname(new URL(import.meta.url).pathname);

const envExampleFiles = fs.globSync(`${__dirname}/../**/.env.example`, {
  exclude: ['**/node_modules/**', '**/dist/**'],
});

for (const envExampleFile of envExampleFiles) {
  const envFile = envExampleFile.replace('.env.example', '.env');
  if (!fs.existsSync(envFile)) {
    fs.copyFileSync(envExampleFile, envFile);
    console.log(`Copied ${envExampleFile} to ${envFile}`);
  } else {
    console.log(`${envFile} already exists, skipping.`);
  }
}