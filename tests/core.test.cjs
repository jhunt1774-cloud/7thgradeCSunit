/* Node built-in tests; no package installation required. */
'use strict';
const assert=require('node:assert/strict');
const core=require('../assets/core.js');
let n=0;function eq(actual,expected){assert.deepEqual(actual,expected);n++;}
eq(core.checkTrial('Our club meets Friday.'),true);
eq(core.checkTrial(' Our club meets Friday.  '),true);
eq(core.checkTrial('Our club meets.','Our club meets.'),true);
eq(core.checkTrial('Our club meets Friday.','Our club meets.'),false);
eq(core.checkTrial('',''),false);
for(const bad of ['', 'Our club meets today.','Our club meets Frday.','our club meets Friday.','Our club meets Friday'])eq(core.checkTrial(bad),false);
const cases=[
 ['text','A','text',true,true],['text','B','text',true,false],['text','A','voice',false,false],['text','B','voice',false,false],
 ['audio','A','text',false,false],['audio','A','voice',false,false],['audio','B','text',false,false],['audio','B','voice',true,true]
];
for(const [task,device,tool,fits,preferred] of cases){const r=core.evaluateCombination(task,device,tool);eq(r.fits,fits);eq(r.preferred,preferred);assert(r.message.length>50);n++;}
assert.throws(()=>core.evaluateCombination('video','A','text'));n++;
let paused=true;
let r=core.troubleshoot(paused,'send');eq(r.paused,true);eq(r.output,'No sentence yet.');
r=core.troubleshoot(paused,'wifi');eq(r.paused,true);assert(r.message.includes('connected'));n++;
r=core.troubleshoot(paused,'pause');eq(r.paused,true);assert(r.message.includes('paused'));n++;
r=core.troubleshoot(paused,'delete');eq(r.paused,true);assert(r.message.includes('No files were deleted'));n++;
r=core.troubleshoot(paused,'resume');eq(r.paused,false);paused=r.paused;
r=core.troubleshoot(paused,'pause');assert(r.message.includes('running'));n++;
r=core.troubleshoot(paused,'send');eq(r.output,'Our club meets Friday.');eq(r.paused,false);
r=core.troubleshoot(paused,'delete');eq(r.paused,false);
r=core.troubleshoot(paused,'reset');eq(r.paused,true);eq(r.output,'No sentence yet.');
assert.throws(()=>core.troubleshoot(true,'unknown'));n++;
// Non-state-changing checks must preserve either starting state.
for(const state of [true,false])for(const action of ['wifi','pause','delete'])eq(core.troubleshoot(state,action).paused,state);
const results={assertions:n,decision_combinations:8,typing_cases:10,troubleshooting_actions:6,result:'PASS'};
require('node:fs').writeFileSync(require('node:path').join(__dirname,'core-results.json'),JSON.stringify(results,null,2));
console.log(JSON.stringify(results));
