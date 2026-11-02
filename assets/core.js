/* Pure decision rules, shared by the browser and automated tests. No network calls. */
(function(root){
  'use strict';
  function checkTrial(value,expected='Our club meets Friday.'){return String(expected).trim().length>0&&String(value).trim()===String(expected).trim();}
  function evaluateCombination(task,device,tool){
    if(!['text','audio'].includes(task)||!['A','B'].includes(device)||!['text','voice'].includes(tool)) throw new Error('Unknown card');
    if(task==='text'&&tool==='text')return {fits:true,preferred:device==='A',message:device==='A'?'Meets the task and battery goal: A has a keyboard and screen; Text Pad edits text. The supplied card says A uses less battery for text.':'Meets the text task: B has a keyboard and screen; Text Pad edits text. Compare A + Text Pad: it also works and better fits the supplied lower-battery goal.'};
    if(task==='text')return {fits:false,preferred:false,message:'Missing requirement: Voice Pad does not edit typed announcements. Keep a keyboard and screen, and choose Text Pad. Then compare the battery facts.'};
    if(device==='B'&&tool==='voice')return {fits:true,preferred:true,message:'Meets the audio task: B has a working microphone and Voice Pad records audio with permission. Both required parts are present.'};
    const missing=[];if(device==='A')missing.push('Device A has no working microphone');if(tool==='text')missing.push('Text Pad does not record audio');
    return {fits:false,preferred:false,message:'Missing requirement: '+missing.join('; ')+'. For this audio task, compare Device B + Voice Pad.'};
  }
  function troubleshoot(paused,action){
    switch(action){
      case 'send':return {paused,message:paused?'Send sample: no sentence appeared. That is the symptom. Check possible causes one at a time.':'Send sample: Our club meets Friday. The original task now works.',output:paused?'No sentence yet.':'Our club meets Friday.'};
      case 'wifi':return {paused,message:'Pretend Wi-Fi check: connected. This on-page task does not need a network; this check does not support Wi-Fi as the cause.'};
      case 'pause':return {paused,message:'Pause check: practice typing is '+(paused?'paused. This supports pause as a possible cause.':'running. Repeat Send sample to test the original task.')};
      case 'resume':return {paused:false,message:'Practice typing resumed. This is a reversible change supported by a paused status. Verify by repeating Send sample.'};
      case 'delete':return {paused,message:'No files were deleted. Deleting files risks work and is not supported by these checks. Prefer the reversible, evidence-supported resume action.'};
      case 'reset':return {paused:true,message:'Case reloaded: practice typing is paused again. Your written notes stay in this tab.',output:'No sentence yet.'};
      default:throw new Error('Unknown action');
    }
  }
  const kitDevices={desk:{name:'Desk 6',keyboard:true,mic:false,hours:6,cost:2},media:{name:'Media 4',keyboard:true,mic:true,hours:4,cost:3},touch:{name:'Touch 8',keyboard:false,mic:true,hours:8,cost:4}};
  const kitTools={text:{name:'Text Pad',text:true,shapes:false,audio:false,cost:1},poster:{name:'Poster Pad',text:true,shapes:true,audio:false,cost:3},voice:{name:'Voice Pad',text:false,shapes:false,audio:true,cost:2}};
  function evaluateKit(job,device,tool){
    const jobs={poster:{name:'Club poster',budget:5,hours:5},audio:{name:'Audio reminder',budget:5,hours:3},note:{name:'Text-only note',budget:4,hours:5}};
    const j=jobs[job],d=kitDevices[device],t=kitTools[tool];if(!j||!d||!t)throw new Error('Unknown kit choice');
    const checks=[{label:'Readable screen',pass:true}];
    if(job!=='audio')checks.push({label:'Physical keyboard',pass:d.keyboard},{label:'Typed-text editing',pass:t.text});
    if(job==='poster')checks.push({label:'Shapes',pass:t.shapes});
    if(job==='audio')checks.push({label:'Working microphone',pass:d.mic},{label:'Audio recording',pass:t.audio});
    const cost=d.cost+t.cost;
    checks.push({label:`Cost: ${d.cost} + ${t.cost} = ${cost} credits; budget ${j.budget}`,pass:cost<=j.budget},{label:`Run time: ${d.hours} hours; minimum ${j.hours}`,pass:d.hours>=j.hours});
    const fits=checks.every(c=>c.pass);
    return {fits,checks,cost,hours:d.hours,text:t.text,shapes:t.shapes,audio:t.audio&&d.mic,job:j.name,device:d.name,tool:t.name,message:fits?'Fits every requirement. Explain how the abilities, total cost, and run time support your choice.':'Does not fit the whole job. Read each failed requirement, then change one choice and compare the result.'};
  }
  function caseAction(caseId,fixed,action,detail){
    if(!['preview','locked','delivery'].includes(caseId))throw new Error('Unknown case');
    const symptoms={preview:'The notice preview stays blank.',locked:'The update cannot be added to the draft.',delivery:'The notice has not been delivered.'};
    const successes={preview:'The notice preview appears: CLUB NOTICE.',locked:'The update was added to the draft.',delivery:'The notice was delivered.'};
    if(action==='try')return {fixed,message:fixed?'Original-task verification: '+successes[caseId]:'Original task: '+symptoms[caseId],output:fixed?successes[caseId]:symptoms[caseId]};
    if(action==='check'){
      if(!['preview','editing','connection'].includes(detail))throw new Error('Unknown check');
      const failed=!fixed&&((caseId==='preview'&&detail==='preview')||(caseId==='locked'&&detail==='editing')||(caseId==='delivery'&&detail==='connection'));
      const value=detail==='preview'?(failed?'hidden':'visible'):detail==='editing'?(failed?'locked':'enabled'):(failed?'disconnected':'connected');
      return {fixed,message:`Check ${detail}: ${value}. Record this result before choosing a fix.`};
    }
    if(action==='fix'){
      if(!['preview','locked','delivery'].includes(detail))throw new Error('Unknown fix');
      if(detail!==caseId)return {fixed,message:'That fix does not match this case’s fault. No fault changed. Compare two check results and choose a fix supported by them.'};
      return {fixed:true,message:'The matching practice setting changed. This is not verification yet: repeat Try original task and record what happens.'};
    }
    if(action==='reset')return {fixed:false,message:'Selected case restarted. Writing and evidence history remain. Reproduce the symptom and collect new checks.',output:'Case ready. Try the original task before choosing a fix.'};
    throw new Error('Unknown case action');
  }
  const api={checkTrial,evaluateCombination,troubleshoot,evaluateKit,caseAction};
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
  root.CSCore=api;
})(typeof window!=='undefined'?window:globalThis);
