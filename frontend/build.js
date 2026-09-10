const fs = require('fs');
const path = require('path');

const srcDir = path.resolve(__dirname, '../public');
const destDir = path.resolve(__dirname, 'dist');

function copyDir(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

if (fs.existsSync(srcDir)) {
  if (fs.existsSync(destDir)) {
    fs.rmSync(destDir, { recursive: true, force: true });
  }
  copyDir(srcDir, destDir);
  console.log('✅ Synchronized public/ into frontend/dist for Vercel deployment');
} else {
  console.log('ℹ️ public/ directory not found in parent, keeping existing dist');
}
