import fs from 'fs';

let code = fs.readFileSync('src/App.tsx', 'utf8');

const endOfApp = code.indexOf('{/* Dynamic Detail & Linking Portal Modal */}');
if(endOfApp !== -1) {
    const endStr = '  );\\n}\\n';
    const finalReturn = code.lastIndexOf(endStr);
    
    // We want to extract from '{/* Dynamic Detail' to the end of the last modal?
    // Let's just find each block.
}

