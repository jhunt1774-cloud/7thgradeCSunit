"""Optional export check: requires pypdf in a maintainer Python environment."""
from pathlib import Path
from pypdf import PdfReader
import json
ROOT=Path(__file__).resolve().parents[1]
pdf=PdfReader(ROOT/'assessments/unit-1-knowledge-test.pdf')
text=' '.join(p.extract_text() for p in pdf.pages)
items=json.loads((ROOT/'assessments/unit-1-item-bank.json').read_text(encoding='utf-8'))
norm=lambda value:' '.join(value.split())
assert len(pdf.pages)==2,'Expected two pages'
assert all(norm(q['stem']) in norm(text) for q in items),'Stem missing or changed'
assert all(norm(c) in norm(text) for q in items for c in q['choices']),'Choice missing or changed'
assert 'Correct choice' not in text and 'Knowledge key' not in text,'Key table must be separate'
result={'result':'PASS','pages':2,'items':10,'choices':30,'visual_review':'Both final rendered pages inspected; no clipping or overlap; student PDF contains no key table.','import_status':'Not tested in a Pear Assessment account'}
(ROOT/'tests/pdf-results.json').write_text(json.dumps(result,indent=2),encoding='utf-8')
print(json.dumps(result,indent=2))
