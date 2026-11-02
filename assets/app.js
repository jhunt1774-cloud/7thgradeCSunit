(function(){
  'use strict';
  const course=window.COURSE, core=window.CSCore;
  const questions=new Map(course.lessons.flatMap(l=>l.questions.map(q=>[q.id,q])));
  const checked=new Map();
  let downloadURL=null;
  function route(){
    let hash;
    try{hash=decodeURIComponent(location.hash.slice(1)||'home');}catch(_){hash='not-found';}
    let target=document.getElementById(hash);
    let view=target&&(target.classList.contains('view')?target:target.closest('.view'));
    if(hash==='main')view=document.querySelector('.view:not([hidden])')||document.getElementById('home');
    if(!view){view=document.getElementById('not-found');target=view.querySelector('h2');}
    document.querySelectorAll('.view').forEach(el=>el.hidden=el!==view);
    document.querySelectorAll('.sidebar nav a').forEach(a=>{if(a.hash==='#'+view.id)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current');});
    document.title=(view.id.startsWith('lesson-')?course.lessons[Number(view.id.slice(7))-1].title+' · ':'')+'Computer Science Studio';
    if(target===view)target=view.querySelector('h1,h2')||view;
    if(!target.hasAttribute('tabindex'))target.setAttribute('tabindex','-1');
    if(location.hash)target.focus({preventScroll:true});
    if(view.id==='home')window.scrollTo(0,0);else target.scrollIntoView({block:'start'});
  }
  function feedback(el,message,kind){el.textContent=message;el.dataset.kind=kind||'info';}
  function score(article){
    const qs=Array.from(article.querySelectorAll('[data-question]')).map(el=>questions.get(el.id));
    let count=0,first=0,latest=0;
    qs.forEach(q=>{const r=checked.get(q.id);if(r){count++;if(r.first===q.correct)first++;if(r.latest===q.correct)latest++;}});
    article.querySelector('.lesson-score').textContent=`${count} of ${qs.length} checked. First-check correct: ${first}/${qs.length}. Latest-check correct: ${latest}/${qs.length}. Written work is teacher reviewed.`;
  }
  function exportText(day){
    const l=course.lessons[day-1],article=document.getElementById('lesson-'+day);
    const out=[`COMPUTER SCIENCE STUDIO — DAY ${day}`,l.title,'No name requested. Add your class details only in your school submission.','This file is not submitted automatically.','',`Objective: ${l.objective}`,''];
    article.querySelectorAll('[data-export-label]').forEach(el=>{const value=el.tagName==='SELECT'?(el.value?el.options[el.selectedIndex].textContent:''):el.value;out.push(el.dataset.exportLabel,value.trim()||'[No response entered]','');});
    article.querySelectorAll('.trial').forEach(el=>{const input=el.querySelector('input');out.push(`Trial ${input.dataset.trial} current text: ${input.value||'[blank]'}`,`Last check: ${el.querySelector('.feedback').textContent||'[not checked]'}`);});
    article.querySelectorAll('.combo-history,.trouble-log,.investigation-log').forEach(el=>{out.push('',el.classList.contains('combo-history')?'Combination history':'Investigation evidence log');el.querySelectorAll('li').forEach(li=>out.push('- '+li.textContent));});
    article.querySelectorAll('.evidence-check').forEach(el=>out.push('',el.id+' feedback: '+(el.querySelector('.feedback').textContent||'[not checked]')));
    out.push('','CHECKED ANSWERS (first and latest; unsubmitted selections are not scored)');
    l.questions.forEach(q=>{const r=checked.get(q.id);out.push(q.id+': '+q.stem);if(!r){out.push('Not checked.');return;}out.push(`First: ${q.choices[r.first]} [${r.first===q.correct?'correct':'retry needed'}]`,`Latest: ${q.choices[r.latest]} [${r.latest===q.correct?'correct':'retry needed'}]`,`Checks: ${r.attempts}`,`Feedback: ${q.why}`);});
    out.push('',article.querySelector('.lesson-score').textContent,'','SELF-REVIEW CRITERIA',...l.rubric.map(x=>'- '+x),'','Teacher review is required for performance evidence. Closing or refreshing the page clears this tab.');
    return out.join('\n');
  }
  document.addEventListener('click',function(event){
    const btn=event.target.closest('button[data-action]');if(!btn)return;
    const action=btn.dataset.action;
    if(action==='walk-next'||action==='walk-back'){
      const walk=btn.closest('.walkthrough'),panels=Array.from(walk.querySelectorAll('.walk-panel'));
      const current=panels.findIndex(p=>!p.hidden),next=Math.max(0,Math.min(panels.length-1,current+(action==='walk-next'?1:-1)));
      panels.forEach((p,i)=>p.hidden=i!==next);walk.querySelector('.walk-counter').textContent=`Step ${next+1} of ${panels.length}`;
      walk.querySelector('[data-action=walk-back]').disabled=next===0;walk.querySelector('[data-action=walk-next]').disabled=next===panels.length-1;return;
    }
    if(action==='evidence-check'){
      const box=btn.closest('.evidence-check'),choice=box.querySelector('select'),fb=box.querySelector('.feedback');
      if(choice.value===''){feedback(fb,'Choose a judgment before checking.','retry');return;}
      const correct=choice.value===box.dataset.correct;
      feedback(fb,(correct?'Supported reasoning. ':'Revise your judgment. ')+box.dataset.explanation+' ',correct?'correct':'retry');
      const link=document.createElement('a');link.href='#'+box.dataset.source;link.textContent='Reread the record and reasoning →';fb.append(link);return;
    }
    if(action==='kit-evaluate'){
      const lab=btn.closest('.kit-builder'),job=lab.querySelector('.kit-job').value,device=lab.querySelector('.kit-device').value,tool=lab.querySelector('.kit-tool').value;
      const result=core.evaluateKit(job,device,tool);feedback(lab.querySelector('.kit-feedback'),result.message,result.fits?'correct':'retry');
      const list=lab.querySelector('.kit-checklist');list.replaceChildren();
      result.checks.forEach(c=>{const li=document.createElement('li');li.textContent=(c.pass?'PASS · ':'MISSING / OUTSIDE LIMIT · ')+c.label;li.dataset.pass=String(c.pass);list.append(li);});
      lab.querySelector('.preview-text').hidden=!result.text;lab.querySelector('.preview-shape').hidden=!result.shapes;
      lab.querySelector('.preview-caption').textContent=result.audio?'Audio capability present: microphone + recording software. No real recording is made.':`Text capability: ${result.text?'yes':'no'}; shape capability: ${result.shapes?'yes':'no'}. A preview does not establish that cost or run time fits.`;
      const li=document.createElement('li');li.textContent=`${result.job}: ${result.device} + ${result.tool}; ${result.cost} credits, ${result.hours} hours. ${result.fits?'Fits.':'Fails.'} `+result.checks.filter(c=>!c.pass).map(c=>c.label).join('; ');lab.querySelector('.kit-log').append(li);return;
    }
    if(action.startsWith('case-')){
      const lab=btn.closest('.case-desk'),caseId=lab.dataset.case;
      const detail=action==='case-check'?btn.dataset.check:btn.dataset.fix;
      const r=core.caseAction(caseId,lab.dataset.fixed==='true',action.slice(5),detail);
      lab.dataset.fixed=String(r.fixed);if(r.output!==undefined)lab.querySelector('.case-display').textContent=r.output;
      feedback(lab.querySelector('.case-feedback'),r.message,'info');
      const li=document.createElement('li');li.textContent=caseId+' · '+r.message;lab.querySelector('.case-log').append(li);return;
    }
    if(action==='answer'){
      const field=btn.closest('[data-question]'),q=questions.get(field.id),choice=field.querySelector('input:checked'),fb=field.querySelector('.feedback');
      if(!choice){feedback(fb,'Choose one answer first. Then check it.','retry');return;}
      const index=Number(choice.value),old=checked.get(q.id);
      checked.set(q.id,{first:old?old.first:index,latest:index,attempts:old?old.attempts+1:1});
      feedback(fb,(index===q.correct?'Correct. ':'Try again. ')+q.why+' ',index===q.correct?'correct':'retry');
      const link=document.createElement('a');link.href='#'+q.source;link.textContent='Reread the explanation →';fb.append(link);
      score(btn.closest('article'));return;
    }
    if(action==='trial'){
      const input=document.getElementById(btn.dataset.input),planned=input.closest('.lab').querySelector('.planned-final');
      const expected=planned?planned.value:'Our club meets Friday.',ok=core.checkTrial(input.value,expected);
      feedback(document.getElementById(input.id+'-feedback'),ok?'Text check passed: the planned final sentence is present. The button responded. Record whether you saw the words and edit. This is evidence for short text editing only.':'Not matched yet. Compare your final text with '+(planned?'your planned final sentence above':'Our club meets Friday., including the final period')+'. Correct a typo and retry; a typo does not prove device failure. Record any actual block. A planned sentence must not be empty.',ok?'correct':'retry');return;
    }
    if(action==='combo'){
      const lab=btn.closest('.lab'),task=lab.querySelector('.combo-task').value,device=lab.querySelector('.combo-device').value,tool=lab.querySelector('.combo-tool').value;
      const result=core.evaluateCombination(task,device,tool);feedback(lab.querySelector('.combo-feedback'),result.message,result.fits?'correct':'retry');
      const li=document.createElement('li');li.textContent=`${task==='text'?'Text + battery':'Audio'}: Device ${device} + ${tool==='text'?'Text Pad':'Voice Pad'} — ${result.message}`;lab.querySelector('.combo-history').append(li);return;
    }
    if(['send','wifi','pause','resume','delete','reset'].includes(action)){
      const lab=btn.closest('.lab'),r=core.troubleshoot(lab.dataset.paused==='true',action);
      lab.dataset.paused=String(r.paused);if(r.output!==undefined)lab.querySelector('.sample-output').textContent=r.output;
      feedback(lab.querySelector('.trouble-feedback'),r.message,'info');
      const li=document.createElement('li');li.textContent=r.message;lab.querySelector('.trouble-log').append(li);return;
    }
    if(action==='print'){window.print();return;}
    if(action==='show-export'){
      const panel=btn.closest('.finish').querySelector('.export-panel');panel.hidden=false;
      const area=panel.querySelector('textarea');area.value=exportText(Number(btn.dataset.day));area.focus();area.select();
      panel.querySelector('.export-status').textContent='Work text is ready. Copy it into the assignment your teacher provided.';return;
    }
    if(action==='download'){
      if(downloadURL)URL.revokeObjectURL(downloadURL);
      downloadURL=URL.createObjectURL(new Blob([exportText(Number(btn.dataset.day))],{type:'text/plain;charset=utf-8'}));
      const a=document.createElement('a');a.href=downloadURL;a.download='cs7-day-'+btn.dataset.day+'-work.txt';document.body.append(a);a.click();a.remove();
    }
  });
  document.addEventListener('change',function(event){
    if(!event.target.matches('.case-choice'))return;
    const lab=event.target.closest('.case-desk');lab.dataset.case=event.target.value;lab.dataset.fixed='false';
    lab.querySelector('.case-display').textContent='New case ready. Try the original task before choosing a fix.';
    feedback(lab.querySelector('.case-feedback'),'Changing cases restarted this fictional case. Your notes and earlier evidence remain.','info');
    const li=document.createElement('li');li.textContent='Selected '+event.target.value+'; case restarted.';lab.querySelector('.case-log').append(li);
  });
  window.addEventListener('hashchange',route);
  window.addEventListener('beforeunload',()=>{if(downloadURL)URL.revokeObjectURL(downloadURL);});
  route();
})();
