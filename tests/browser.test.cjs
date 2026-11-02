/* Optional maintainer suite. Students do not install anything.
 * npm install --no-save playwright (in a developer environment)
 * PLAYWRIGHT_MODULE may point to a preinstalled Playwright package directory.
 * BROWSER_EXECUTABLE may point to installed Chrome/Edge. Without it, use the
 * browser installed by `npx playwright install chromium` in your environment.
 */
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');const path=require('node:path');const http=require('node:http');
const {pathToFileURL}=require('node:url');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const ROOT=path.resolve(__dirname,'..');
const data=JSON.parse(fs.readFileSync(path.join(ROOT,'assets/curriculum.json'),'utf8'));
let assertions=0;const counts={knowledge_choices:0,empty_answer_checks:0,typing_trials:0,combination_outcomes:0,troubleshooting_sequences:0,downloads:0,copy_exports:0,print_controls:0,hash_targets:0};
function ok(condition,message){assert(condition,message);assertions++;}
let activeBrowser;
async function main(){
  const downloadsPath=path.join(ROOT,'tests','.downloads');fs.mkdirSync(downloadsPath,{recursive:true});
  const browser=await chromium.launch({headless:true,downloadsPath,...(process.env.BROWSER_EXECUTABLE?{executablePath:process.env.BROWSER_EXECUTABLE}:{})});activeBrowser=browser;
  const context=await browser.newContext({viewport:{width:1366,height:850},acceptDownloads:true});
  const page=await context.newPage();page.setDefaultTimeout(10000);
  const errors=[],requests=[];page.on('pageerror',e=>errors.push(e.message));page.on('request',r=>requests.push(r.url()));
  await page.addInitScript(()=>{window.print=()=>{window.__printCalls=(window.__printCalls||0)+1;};});
  const base=pathToFileURL(path.join(ROOT,'index.html')).href;
  await page.goto(base);
  ok(await page.locator('#home').isVisible(),'Home visible on direct file open');
  ok(await page.title()==='Computer Science Studio','Home title');
  await page.screenshot({path:path.join(ROOT,'tests/home-desktop.png'),fullPage:true});
  await page.keyboard.press('Tab');
  ok(await page.evaluate(()=>document.activeElement.classList.contains('skip')),'Keyboard first reaches skip link');
  await page.keyboard.press('Enter');
  ok(await page.locator('#home').isVisible(),'Skip link preserves current learning view');
  ok(await page.evaluate(()=>document.activeElement.id==='main'),'Skip link focuses learning region');
  // Every real hash destination in the student page must route to a visible target.
  const hashes=await page.locator('a[href^="#"]').evaluateAll(els=>[...new Set(els.map(e=>e.getAttribute('href')))]);
  for(const hash of hashes){
    await page.goto(base+hash);
    const id=hash.slice(1);
    ok(await page.locator('[id="'+id+'"]').isVisible(),'Hash route visible '+hash);counts.hash_targets++;
  }
  for(const l of data.lessons){
    const day=l.n;await page.goto(base+'#lesson-'+day);
    const article=page.locator('#lesson-'+day);
    ok(await article.isVisible(),'Day visible '+day);
    ok(await page.locator('.view:visible').count()===1,'Only one learning view visible');
    await article.locator('textarea[data-export-label]').first().fill('Evidence note for day '+day);
    await article.locator('#response-'+day).fill('My task and evidence for day '+day+'. I will revise using the checklist.');
    for(const q of l.questions){
      const field=article.locator('#'+q.id);
      await field.locator('button').click();
      ok((await field.locator('.feedback').innerText()).includes('Choose one answer'),'Empty response not graded');counts.empty_answer_checks++;
      const wrong=(q.correct+1)%3;
      const order=[wrong,...[0,1,2].filter(i=>i!==wrong),q.correct];
      for(const choice of order){
        await field.locator('input[value="'+choice+'"]').check();await field.locator('button').click();
        const feedback=await field.locator('.feedback').innerText();
        ok(feedback.startsWith(choice===q.correct?'Correct.':'Try again.'),'Feedback matches independently verified key '+q.id);
        ok(feedback.includes(q.why),'Explanation present '+q.id);
        ok(await field.locator('.feedback a').getAttribute('href')==='#'+q.source,'Reading link matches audit');counts.knowledge_choices++;
      }
      await field.locator('.feedback a').click();
      ok(await page.locator('#'+q.source).isVisible(),'Feedback source route works');
      await page.goto(base+'#lesson-'+day);
    }
    ok((await article.locator('.lesson-score').innerText()).includes('First-check correct: 0/'),'First score preserves incorrect initial checks');
    ok((await article.locator('.lesson-score').innerText()).includes('Latest-check correct: '+l.questions.length+'/'+l.questions.length),'Latest score tracks successful retries');
    if(day===4){
      await article.locator('#plan-final-4').fill('Our club meets.');
      await article.locator('#test-plan-4').fill('My chosen capability is deleting one word. I will type the starting sentence, delete today, check readable words, the edit, and the button, and repeat three times on this same page and sentence to check consistency.');
    }
    for(const trial of await article.locator('.trial').all()){
      const input=trial.locator('input');await input.fill('Our club meets today.');await trial.locator('button').click();
      ok((await trial.locator('.feedback').innerText()).startsWith('Not matched yet'),'Typing retry');
      await input.fill(day===4?'Our club meets.':'Our club meets Friday.');await trial.locator('button').click();
      ok((await trial.locator('.feedback').innerText()).startsWith('Text check passed'),'Typing success');
      await trial.locator('textarea').fill('Words appeared, edit appeared, button feedback appeared.');counts.typing_trials++;
    }
    if(await article.locator('.combo-task').count()){
      const lab=article.locator('.lab:has(.combo-task)');
      for(const task of ['text','audio'])for(const device of ['A','B'])for(const tool of ['text','voice']){
        await lab.locator('.combo-task').selectOption(task);await lab.locator('.combo-device').selectOption(device);await lab.locator('.combo-tool').selectOption(tool);
        await lab.locator('[data-action=combo]').click();
        const fit=task==='text'?tool==='text':device==='B'&&tool==='voice';
        ok((await lab.locator('.combo-feedback').innerText()).startsWith(fit?'Meets':'Missing'),'Combination branch matches card facts');counts.combination_outcomes++;
      }
      ok(await lab.locator('.combo-history li').count()===8,'Comparison history records all attempts');
      await lab.locator('summary').click();ok(await lab.locator('.combo-history').isVisible(),'Comparison history expands');
    }
    if(await article.locator('.trouble-log').count()){
      const lab=article.locator('.lab:has(.trouble-log)');
      async function click(action){await lab.locator('[data-action='+action+']').click();}
      await click('send');ok((await lab.locator('.sample-output').innerText())==='No sentence yet.','Initial symptom reproduced');
      await click('wifi');ok((await lab.locator('.trouble-feedback').innerText()).includes('connected'),'Wi-Fi evidence shown');
      await click('pause');ok((await lab.locator('.trouble-feedback').innerText()).includes('paused'),'Pause evidence shown');
      await click('delete');ok(await lab.getAttribute('data-paused')==='true','Deletion option does not solve or delete');
      await click('resume');ok(await lab.getAttribute('data-paused')==='false','Resume changes simulation state');
      await click('pause');ok((await lab.locator('.trouble-feedback').innerText()).includes('running'),'Running status shown');
      await click('send');ok((await lab.locator('.sample-output').innerText())==='Our club meets Friday.','Original task verified after fix');
      await click('reset');ok(await lab.getAttribute('data-paused')==='true','Reset restores paused state');
      ok(await article.locator('#response-'+day).inputValue()!=='' ,'Simulation reset preserves writing');
      await click('resume');await click('send');counts.troubleshooting_sequences++;
    }
    const selfReview=article.locator('.response details');await selfReview.locator('summary').click();ok(await selfReview.locator('ul').isVisible(),'Performance checklist expands');
    await article.locator('[data-action=show-export]').click();
    const text=await article.locator('.export-text').inputValue();ok(text.includes('My task and evidence for day '+day),'Written response in copy export');ok(text.includes('First:')&&text.includes('[retry needed]')&&text.includes('Latest:'),'First/latest distinction exported');counts.copy_exports++;
    if(day===4)ok(text.includes('My chosen capability is deleting one word')&&text.includes('Day 4 planned final sentence\nOur club meets.'),'Student-developed process and planned target exported');
    const pending=page.waitForEvent('download');await article.locator('[data-action=download]').click();const download=await pending;
    ok(download.suggestedFilename()==='cs7-day-'+day+'-work.txt','Correct download filename');
    const file=await download.path();ok(fs.readFileSync(file,'utf8')===text,'Downloaded work equals copy export');counts.downloads++;
    await article.locator('[data-action=print]').click();ok(await page.evaluate(()=>window.__printCalls)>0,'Print control invokes browser print');counts.print_controls++;
  }
  // In-tab navigation preserves work, while refresh intentionally clears it.
  await page.goto(base+'#lesson-1');ok((await page.locator('#response-1').inputValue()).includes('day 1'),'Day navigation preserves writing');
  await page.goto(base+'#main');ok(await page.locator('#lesson-1').isVisible(),'Skip route preserves active lesson');
  await page.goto(base+'#lesson-4');await page.locator('#L4-LAB-S').screenshot({path:path.join(ROOT,'tests/troubleshooting-desktop.png')});
  await page.goto(base+'#lesson-99');ok(await page.locator('#not-found').isVisible(),'Unknown route handled');
  await page.goto(base+'#%E0%A4%A');ok(await page.locator('#not-found').isVisible(),'Malformed encoded route handled');
  await page.goto(base+'#home');
  await page.setViewportSize({width:390,height:844});
  for(const hash of ['#home','#lesson-1','#lesson-2','#lesson-3','#lesson-4','#lesson-5']){
    await page.goto(base+hash);
    ok(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth),'No page-width overflow at 390px '+hash);
  }
  await page.goto(base+'#home');await page.screenshot({path:path.join(ROOT,'tests/home-mobile.png'),fullPage:true});
  await page.goto(base+'#L1-LAB-T');await page.screenshot({path:path.join(ROOT,'tests/lesson-mobile.png'),fullPage:false});
  // Native keyboard selection and activation, without mouse interaction.
  await page.goto(base+'#lesson-1');await page.locator('#L1-Q1 input[value="0"]').focus();await page.keyboard.press('ArrowDown');
  ok(await page.locator('#L1-Q1 input[value="1"]').isChecked(),'Arrow keys move radio choices');
  await page.locator('#L1-Q1 button').focus();await page.keyboard.press('Enter');ok((await page.locator('#L1-Q1 .feedback').innerText()).startsWith('Try again.'),'Enter activates feedback');
  await page.reload();ok(await page.locator('#response-1').inputValue()==='','Refresh clears writing as disclosed');
  const noscript=await browser.newContext({javaScriptEnabled:false});const nojs=await noscript.newPage();await nojs.goto(base);
  ok(await nojs.locator('#L1-R1').isVisible(),'Readings available without JavaScript');await noscript.close();
  // Static hosting under a project-repository prefix; HTTP assets must return 200.
  const server=http.createServer((req,res)=>{
    const rel=decodeURIComponent(new URL(req.url,'http://localhost').pathname).replace(/^\/course\//,'');
    const file=path.resolve(ROOT,rel||'index.html');
    if(!file.startsWith(ROOT+path.sep)&&file!==ROOT){res.writeHead(403).end();return;}
    const target=fs.existsSync(file)&&fs.statSync(file).isDirectory()?path.join(file,'index.html'):file;
    const types={'.html':'text/html','.js':'application/javascript','.css':'text/css','.json':'application/json','.pdf':'application/pdf'};
    if(!fs.existsSync(target)){res.writeHead(404).end();return;}res.setHeader('Content-Type',types[path.extname(target)]||'text/plain');fs.createReadStream(target).pipe(res);
  });
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  try{
    const address='http://127.0.0.1:'+server.address().port+'/course/';
    const response=await page.goto(address+'#lesson-2');ok(response.status()===200,'HTTP project path serves');
    ok(await page.locator('#lesson-2').isVisible(),'Project-prefix scripts and hash route work');
    const stylesheet=await page.locator('h2').first().evaluate(el=>getComputedStyle(el).fontFamily);ok(stylesheet.includes('Arial'),'Project-prefix stylesheet applied');
    for(const teacherPage of ['index','coverage','alignment','tracker','keys']){
      const r=await page.goto(address+'teacher/'+teacherPage+'.html');ok(r.status()===200,'Teacher page HTTP '+teacherPage);
      ok(await page.locator('h1').isVisible(),'Teacher page heading '+teacherPage);
    }
    await page.setViewportSize({width:1366,height:850});await page.goto(address);await page.screenshot({path:path.join(ROOT,'tests/hosted-desktop.png'),fullPage:false});
  }finally{await new Promise(resolve=>server.close(resolve));}
  ok(errors.length===0,'No JavaScript errors: '+errors.join('; '));
  ok(!requests.some(url=>url.startsWith('https://')),'Core tasks make no outside-network requests');
  const report={result:'PASS',assertions,...counts,javascript_errors:errors,viewports:['1366x850','390x844'],tested_browser:await browser.version(),method:'Headless installed Chrome via Playwright; file URL and project-prefix local HTTP',external_core_requests:0,limits:['Not a physical managed Chromebook or old Chrome version','No live Pear Assessment account import','No classroom pacing pilot','Print button tested by intercepting window.print; native print dialog not automated']};
  fs.writeFileSync(path.join(ROOT,'tests/browser-results.json'),JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));
  await context.close();await browser.close();activeBrowser=null;
}
main().catch(async e=>{console.error(e);if(activeBrowser)await activeBrowser.close();process.exitCode=1;});
