# Release 1 validation report

Verified November 2, 2026. This report describes the five implemented lessons only.

## Passed checks

- Static/content checks: 1204 assertions; six HTML files; 189 HTML link occurrences resolved. Local file targets and fragments exist. Two distinct external HTML source URLs were separately opened with the web reader; core browser tasks never request them.
- Standards inventory: all 42 exact codes compared against the official PDF pages 2–3. Three computing-systems standards have implemented performance evidence; 39 are planned. Summaries are labeled paraphrases. No all-standards-coverage claim.
- Alignment: 22 single-choice questions, five written responses, and six lab instances have 33 source-to-question/activity records. Each knowledge item points to an existing reading and an exact supporting passage. Keys were independently solved and checked against the rendered student text, teacher keys, and export bank. Human reasoning review supports alignment; string/reference tests alone cannot prove it.
- Pure decision-rule checks: 57 assertions, all eight combination cases, ten typing cases (including student-planned targets and empty-target rejection), six troubleshooting actions, and state-preservation cases.
- Browser checks: 472 assertions in installed Chrome 156.0.8078.79; direct file opening and local HTTP under a project-repository prefix. All 22 empty-answer checks; 88 answer selections/checks including retries; first/latest score preservation; six typing trials; all 16 lab combination outcomes; two troubleshooting sequences; five file downloads whose contents matched copy exports; five copy exports; five print calls; 29 hash destinations; malformed/unknown routes; keyboard skip navigation and radio/Enter controls; in-tab retention and deliberate clearing on refresh; no-JavaScript reading availability; teacher pages; and zero JavaScript errors.
- Layout checks: 1366×850 and 390×844; no page-width overflow on home or any lesson at 390px. Home, mobile lab, and troubleshooting screenshots were visually inspected. The small-screen lesson navigation intentionally scrolls horizontally inside its own region.
- PDF: two letter-size pages; all ten stems and thirty choices match the bank; no key table in the student file. Both final pages rendered with Poppler and visually inspected for clipping, overlap, missing text, and legibility. Poppler issued optional fallback-font warnings; inspection showed the Helvetica text rendered clearly. The HTML version supplies the accessible interactive alternative; the PDF is not tagged.
- Core first-load payload: 123,596 bytes uncompressed for HTML, CSS, runtime data, and JavaScript. No external images, scripts, web fonts, analytics, storage, or student-data service. Teacher/test/download files are loaded only when opened.

## Scope and limits

This is not a completed 45-day curriculum. Days 6–45 are explicitly unimplemented teacher planning records with release gates. No future student lesson links or placeholder readings are shipped.

Browser checks used a desktop Chrome engine, not a physical aging managed Chromebook or historical Chrome build. School filtering and download policies must be tested at the school. The first restricted test run could not write browser downloads; rerunning with access to the browser's download directory verified all five exports. The copy route is also tested and available.

No live Pear Assessment/Edulastic account import was performed. The supplied PDF follows its documented document-import route. Extraction, keys, and scoring still require teacher preview in the actual school account. CSV/JSON are portable banks, not asserted native import formats. Native print-dialog operation is not automated; the print control invocation was tested by intercepting window.print.

No classroom pacing pilot, screen-reader user study, formal WCAG conformance certification, or independent standards-author approval was performed. Automated checks do not assess free-text reasoning or certify student mastery. Use the teacher rubrics and observe personal device tests. Practical creation and explanation tasks remain required even when every quiz answer is correct.

GitHub Pages deployment is prepared but has not been published to a remote repository. No live website URL is claimed.

## Rerun

Use `python tests/validate.py`, `node tests/core.test.cjs`, and the optional Playwright suite described in `tests/browser.test.cjs` and the README. Machine-readable results are in `static-results.json`, `core-results.json`, `browser-results.json`, and `pdf-results.json`. Screenshots are included beside this report. Changes to source content or interaction behavior require rerunning the relevant checks and updating this report.
