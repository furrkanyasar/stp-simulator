import fs from 'fs';
import path from 'path';

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`✅ PASS: ${message}`);
    passed++;
  } else {
    console.error(`❌ FAIL: ${message}`);
    failed++;
  }
}

console.log('--------------------------------------------------');
console.log('🧪 RUNNING STP VISUALIZER COMPREHENSIVE TEST SUITE');
console.log('--------------------------------------------------\n');

const projectRoot = 'C:\\Users\\HUAWEI\\.gemini\\antigravity\\scratch\\stp-visualizer';
const htmlPath = path.join(projectRoot, 'app.html');
const htmlContent = fs.readFileSync(htmlPath, 'utf8');

// 1. Verify app.html contains all 3-role updates
console.log('--- Test Group 1: HTML Integrity & Security Warnings ---');
assert(htmlContent.includes('STP Simulator'), 'Title present');
assert(htmlContent.includes('Educational Use Only - No SRI hashes'), 'Security SRI warning comment present');
assert(htmlContent.includes('40G') && htmlContent.includes('100G'), '40G and 100G speed entries present in HTML');
console.log('');

// 2. Verify Cost Tables & Speed Options in app.html
console.log('--- Test Group 2: Cost Tables in app.html ---');
assert(htmlContent.includes("'40G': 1") && htmlContent.includes("'100G': 1"), 'Short Cost table includes 40G=1, 100G=1');
assert(htmlContent.includes("'40G': 500") && htmlContent.includes("'100G': 200"), 'Long Cost table includes 40G=500, 100G=200');
assert(htmlContent.includes('100 Gbps (IEEE 802.3ba)'), '100G speed dropdown option present');
assert(htmlContent.includes('40 Gbps (IEEE 802.3ba)'), '40G speed dropdown option present');
console.log('');

// 3. Verify Source Files Integrity in src/
console.log('--- Test Group 3: Core TypeScript Source Files ---');
const typesContent = fs.readFileSync(path.join(projectRoot, 'src', 'core', 'types.ts'), 'utf8');
assert(typesContent.includes("'40G' | '100G'"), 'types.ts includes 40G/100G LinkSpeed');
assert(typesContent.includes('STPTimers'), 'types.ts includes STPTimers interface');
assert(typesContent.includes('BPDUFrame'), 'types.ts includes BPDUFrame interface');
assert(typesContent.includes('designatedRootId: string | null'), 'types.ts includes designatedRootId in SwitchNode');

const costTableContent = fs.readFileSync(path.join(projectRoot, 'src', 'core', 'costTable.ts'), 'utf8');
assert(costTableContent.includes("'40G': 1") && costTableContent.includes("'100G': 1"), 'costTable.ts Short table has 40G/100G');
assert(costTableContent.includes("'40G': 500") && costTableContent.includes("'100G': 200"), 'costTable.ts Long table has 40G/100G');

const stpEngineContent = fs.readFileSync(path.join(projectRoot, 'src', 'core', 'stpEngine.ts'), 'utf8');
assert(stpEngineContent.includes('switchesInput: Map<string, SwitchNode>'), 'stpEngine.ts accepts Map<string, SwitchNode>');
assert(stpEngineContent.includes('timers: STPTimers = DEFAULT_STP_TIMERS'), 'stpEngine.ts accepts STPTimers');
assert(stpEngineContent.includes('bpduFrames.set(link.id, bpdu)'), 'stpEngine.ts generates BPDU frames per link');

const appContent = fs.readFileSync(path.join(projectRoot, 'src', 'App.tsx'), 'utf8');
assert(appContent.includes('baseConvergence = useMemo'), 'App.tsx has separated useMemo for baseConvergence');
assert(appContent.includes('setOperatorLogs((prev) => [...prev, entry].slice(-500))'), 'App.tsx limits operator logs to 500');
assert(appContent.includes('BPDUViewerModal'), 'App.tsx includes BPDUViewerModal');
assert(appContent.includes('STPTimersModal'), 'App.tsx includes STPTimersModal');
console.log('');

// 4. Verify Modals & Components
console.log('--- Test Group 4: Components & Modals ---');
assert(fs.existsSync(path.join(projectRoot, 'src', 'components', 'BPDUViewerModal.tsx')), 'BPDUViewerModal.tsx file exists');
assert(fs.existsSync(path.join(projectRoot, 'src', 'components', 'STPTimersModal.tsx')), 'STPTimersModal.tsx file exists');
assert(fs.existsSync(path.join(projectRoot, 'src', 'components', 'SyslogPanel.tsx')), 'SyslogPanel.tsx file exists');
assert(fs.existsSync(path.join(projectRoot, 'src', 'components', 'SwitchInspectorModal.tsx')), 'SwitchInspectorModal.tsx file exists');
console.log('');

// 5. Verify Documentation & Security Files
console.log('--- Test Group 5: Documentation & Git Hygiene ---');
assert(fs.existsSync(path.join(projectRoot, '.gitignore')), '.gitignore file exists');
assert(fs.existsSync(path.join(projectRoot, 'LICENSE')), 'LICENSE file exists');
assert(fs.existsSync(path.join(projectRoot, 'README.md')), 'README.md file exists');
console.log('');

console.log('--------------------------------------------------');
console.log(`🏁 TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
console.log('--------------------------------------------------');

if (failed > 0) process.exit(1);
