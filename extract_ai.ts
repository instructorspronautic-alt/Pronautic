import fs from 'fs';

const appCode = fs.readFileSync('src/App.tsx', 'utf8');
const lines = appCode.split('\n');

const aiStart = 3942 - 1; // approx
const aiEnd = 3977 - 1;
// Wait I don't know the exact lines anymore because I injected code!

// Let's find the start and end by markers
const aiStartIdx = lines.findIndex(l => l.includes('activeTab === "ai" && ('));
const calStartIdx = lines.findIndex(l => l.includes('activeTab === "calendar" && ('));
const tasksStartIdx = lines.findIndex(l => l.includes('activeTab === "tasks" && ('));
const docStartIdx = lines.findIndex(l => l.includes('activeTab === "doc-generator" && ('));

fs.writeFileSync('src/views/AIAnalysisView.tsx', `
import React from 'react';
import ScheduleSummary from "../components/ScheduleSummary";
import { Sparkles, Bot, RefreshCw } from "lucide-react";

export default function AIAnalysisView(props: any) {
  return (
    <>
      ` + lines.slice(aiStartIdx + 1, calStartIdx).join('\n') + `
    </>
  );
}
`);
console.log("ai done");
