const fs = require('fs');
const path = require('path');

const srcDir = path.resolve(__dirname, '..');
const destDir = path.resolve(__dirname, 'www');

const excludeList = [
    'usuario',
    'node_modules',
    'package.json',
    'package-lock.json',
    '.git',
    '.gemini'
];

function copyRecursiveSync(src, dest) {
    const exists = fs.existsSync(src);
    const stats = exists && fs.statSync(src);
    const isDirectory = exists && stats.isDirectory();

    const basename = path.basename(src);
    if (excludeList.includes(basename)) {
        return;
    }

    if (isDirectory) {
        if (!fs.existsSync(dest)) {
            fs.mkdirSync(dest);
        }
        fs.readdirSync(src).forEach(childItemName => {
            copyRecursiveSync(path.join(src, childItemName), path.join(dest, childItemName));
        });
    } else {
        // Exclude specific files if necessary, or just copy
        if (!excludeList.includes(basename)) {
            fs.copyFileSync(src, dest);
        }
    }
}

// Clean destDir if it exists
if (fs.existsSync(destDir)) {
    fs.rmSync(destDir, { recursive: true, force: true });
}
fs.mkdirSync(destDir);

console.log('Copying web assets to www...');
fs.readdirSync(srcDir).forEach(child => {
    copyRecursiveSync(path.join(srcDir, child), path.join(destDir, child));
});
console.log('Build complete!');
