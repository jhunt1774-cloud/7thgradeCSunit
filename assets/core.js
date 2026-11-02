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
  const api={checkTrial,evaluateCombination,troubleshoot};
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
  root.CSCore=api;
})(typeof window!=='undefined'?window:globalThis);
