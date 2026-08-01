const fs = require('fs');
const path = require('path');

function processDir(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        if (['node_modules', '.git', 'Git'].includes(file)) continue;
        
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
            processDir(fullPath);
        } else if (stat.isFile() && /\.(ts|tsx|js|jsx|json|css|html|md)$/.test(file)) {
            let content = fs.readFileSync(fullPath, 'utf8');
            
            // Regex to find conflict blocks and keep the bottom (incoming) part
            const regex = /<<<<<<< [^\n\r]+\r?\n([\s\S]*?)=======\r?\n([\s\S]*?)>>>>>>> [^\n\r]+\r?\n/g;
            
            if (regex.test(content)) {
                console.log('Fixing conflicts in ' + fullPath);
                content = content.replace(regex, '$2');
                fs.writeFileSync(fullPath, content, 'utf8');
            }
        }
    }
}

processDir(__dirname);
console.log('Done fixing conflicts.');
