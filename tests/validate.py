"""Standard-library checks; run from any directory with Python 3."""
from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urlsplit, unquote
import json,csv,re
ROOT=Path(__file__).resolve().parents[1]
checks=0
def require(condition,message):
    global checks
    assert condition,message
    checks+=1
class Doc(HTMLParser):
    def __init__(self,path):
        super().__init__();self.ids=set();self.links=[];self.text=[];self.labels=[];self.controls=[];self.readings={};self.active=[]
        self.feed(path.read_text(encoding='utf-8'))
    def handle_starttag(self,tag,attrs):
        a=dict(attrs)
        if a.get('id'):
            require(a['id'] not in self.ids,'Duplicate id '+a['id']);self.ids.add(a['id'])
        if tag in ['a','link','script','img']:
            href=a.get('href') or a.get('src')
            if href:self.links.append(href)
        if tag=='label' and a.get('for'):self.labels.append(a['for'])
        if tag in ['input','textarea','select'] and a.get('id'):self.controls.append(a['id'])
    def handle_data(self,data):self.text.append(data)
docs={p.resolve():Doc(p) for p in ROOT.rglob('*.html')}
external=set();link_count=0
for p,d in docs.items():
    for href in d.links:
        link_count+=1;u=urlsplit(href)
        if u.scheme in ['https','http']:external.add(href);continue
        require(not u.scheme,'Unexpected scheme '+href)
        dest=(p.parent/unquote(u.path)).resolve() if u.path else p
        require(dest.exists(),f'Missing link from {p.name}: {href}')
        if u.fragment:
            require(dest in docs,f'Fragment target is not HTML: {href}')
            require(unquote(u.fragment) in docs[dest].ids,f'Missing fragment {href}')
    for label in d.labels:require(label in d.ids,f'Orphan label {label}')
    require('<html lang="en">' in p.read_text(encoding='utf-8'),'Missing language '+str(p))
data=json.loads((ROOT/'assets/curriculum.json').read_text(encoding='utf-8'))
runtime=(ROOT/'assets/data.js').read_text(encoding='utf-8').removeprefix('window.COURSE = ').strip().removesuffix(';')
require(json.loads(runtime)['lessons']==data['lessons'],'Runtime data drift')
expected='''CS.D.7.a CS.HS.7.a CS.T.7.a NI.N.7.a NI.N.7.b NI.C.7.a NI.C.7.b NI.C.7.c NI.IOT.7.a DA.DCS.7.a DA.DCS.7.b DA.DCS.7.c DA.VC.7.a DA.VC.7.b DA.IM.7.a ATP.A.7.a ATP.VDR.7.a ATP.CS.7.a ATP.M.7.a ATP.PD.7.a ATP.PD.7.b ATP.PD.7.c AI.P.7.a AI.P.7.b AI.P.7.c AI.RR.7.a AI.ML.7.a AI.ML.7.b AI.NI.7.a AI.NI.7.b AI.SI.7.a AI.SI.7.b IC.Cu.7.a IC.Cu.7.b IC.Cu.7.c IC.Cu.7.d IC.SI.7.a IC.SLE.7.a IC.SLE.7.b IC.SLE.7.c IC.SLE.7.d IC.SLE.7.e'''.split()
require(len(data['standards'])==42,'Wrong standard count')
require(sorted(s['code'] for s in data['standards'])==sorted(expected),'Code inventory differs from source verification')
require(sum(s['status'].startswith('implemented') for s in data['standards'])==3,'Overclaimed coverage')
allids=docs[(ROOT/'index.html').resolve()].ids
require(len(data['lessons'])==5,'Wrong implemented lesson count')
gold={1:'ABC',2:'BCA',3:'BCA',4:'BCA',5:'BCABCABCAB'}
sections={s['id']:s['text'] for l in data['lessons'] for s in l['sections']}
def norm(s):return re.sub(r'\s+',' ',s).lower()
qcount=0
student_text=norm(' '.join(docs[(ROOT/'index.html').resolve()].text))
for l in data['lessons']:
    require(len(l['sections'])==4,'Incomplete readings')
    require(sum(len(s['text'].split()) for s in l['sections'])>=300,'Reading too sparse')
    require(len(l['rubric'])==4 and bool(l['model']),'Missing performance key')
    require(len(l['steps'])==4,'Missing guided steps')
    for s in l['sections']:require(norm(s['text']) in student_text,'Rendered reading differs: '+s['id'])
    for i,q in enumerate(l['questions']):
        qcount+=1
        require(q['standard'] in expected,'Invented code')
        require(q['source'] in sections,'Missing teaching source')
        require(norm(q['evidence']) in norm(sections[q['source']]),'Quoted evidence missing for '+q['id'])
        require(0<=q['correct']<len(q['choices']),'Invalid key')
        require(chr(65+q['correct'])==gold[l['n']][i],'Key differs from independently solved answer '+q['id'])
        require(len(q['choices'])==len(set(q['choices']))==3,'Duplicate/missing options')
        require(norm(q['stem']) in student_text,'Stem missing from student HTML')
        for c in q['choices']:require(norm(c) in student_text,'Choice missing from HTML')
        require(norm(q['why']) in norm(' '.join(docs[(ROOT/'teacher/keys.html').resolve()].text)),'Explanation absent from key')
require(qcount==22,'Wrong question count')
with (ROOT/'teacher/source-question-audit.csv').open(encoding='utf-8-sig',newline='') as f:audit=list(csv.DictReader(f))
require(len(audit)==33,'Incomplete assignment audit')
for a in audit:
    require(a['id'] in allids,'Missing assignment target '+a['id'])
    for source in a['source'].split(';'):require(source.strip() in allids,'Missing assignment source '+source)
with (ROOT/'teacher/implementation-tracker.csv').open(encoding='utf-8-sig',newline='') as f:tracker=list(csv.DictReader(f))
require([int(x['day']) for x in tracker]==list(range(1,46)),'Tracker must include 45 days')
require(sum(x['status']=='Implemented' for x in tracker)==5,'Tracker overclaims implementation')
require(all(x['required_deliverable'] and x['daily_objective'] for x in tracker),'Empty planned deliverable')
with (ROOT/'assessments/unit-1-item-bank.csv').open(encoding='utf-8-sig',newline='') as f:bank=list(csv.DictReader(f))
require(len(bank)==10,'Assessment export count wrong')
for a,q in zip(bank,data['lessons'][4]['questions']):
    require(a['question']==q['stem'] and a['correct_letter']==chr(65+q['correct']),'Export key drift')
    require([a[k] for k in 'ABC']==q['choices'],'Export choice drift')
scripts='\n'.join(p.read_text(encoding='utf-8') for p in (ROOT/'assets').glob('*.js'))
for pattern in ['fetch(', 'XMLHttpRequest', 'localStorage', 'sessionStorage', 'document.cookie', 'eval(']:require(pattern not in scripts,'Unwanted dependency/storage/code execution: '+pattern)
require(not any(urlsplit(h).scheme for d in docs.values() for h in d.links if h.endswith('.js')),'External core script')
stats={'assertions':checks,'html_files':len(docs),'local_and_source_links':link_count,'external_links_not_live_probed':sorted(external),'verified_standards':42,'implemented_standards':3,'planned_standards':39,'knowledge_items':22,'assignment_audit_rows':33,'tracker_days':45}
(ROOT/'tests/static-results.json').write_text(json.dumps(stats,indent=2),encoding='utf-8')
print(json.dumps(stats,indent=2))
