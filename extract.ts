import fs from 'fs';

const appCode = fs.readFileSync('src/App.tsx', 'utf8');
const lines = appCode.split('\n');

// Find boundaries of "ai", "calendar", "tasks"
// Basically we can extract the JSX parts by matching the indents and braces, but a simple script can do this.
// Or we just write strings. I'll read App.tsx to know the exact content.

const logLines = () => {
    console.log("calendar start", lines[3956-1]);
    console.log("calendar end", lines[4736-1]);
};
logLines();
