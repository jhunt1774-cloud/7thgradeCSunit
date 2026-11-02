# Ohio Grade 7 Computer Science Studio — release 1

**One complete, tested five-day unit. The 45-day curriculum is not complete.**

The official 2022 Grade 7 PDF contains 42 standards. This release implements the three computing-systems expectations and gives a concrete plan for the other 40 lessons. It does not claim all-standards coverage or certify student mastery. See `teacher/coverage.html` and `teacher/tracker.html`.

## Open now

Open `index.html` in a browser. No installation, build step, account, internet service, or student backend is required for the core learning tasks. All reading content is pre-rendered HTML. JavaScript enables labs, feedback, navigation, and exports. Direct file opening works; if your device policy restricts it, use static hosting.

- `index.html`: student course and all five lessons.
- `teacher/index.html`: complete teacher guide, daily 40-minute pacing, support, scoring, and distribution.
- `teacher/keys.html`: all knowledge keys, model written answers, and performance rubrics.
- `teacher/coverage.html`: 42-code inventory and explicit implemented/planned status.
- `teacher/alignment.html`: question/activity-to-reading audit, with CSV.
- `teacher/tracker.html`: every day in the 9-week sequence with objective, deliverable, and release gate.
- `assessments/unit-1-knowledge-test.pdf`: answer-free PDF for documented Pear Assessment/Edulastic document import.
- `tests/REPORT.md`: actual verification results and limits.

## Student work and Google Classroom

Assign a day URL such as `https://YOUR-USER.github.io/YOUR-REPO/#lesson-1`. Inside one open tab, moving between days keeps typed work. Reloading, closing, or opening a new tab clears it. Students use Download work (.txt), or Show work to copy, then attach/paste into your Classroom assignment. The website neither submits nor silently saves anything. Use the text-copy route if school policy blocks downloads. No personal information is requested. Print/save page as PDF is optional browser functionality.

## Publish with GitHub Pages (preferred)

This folder is the deployable repository. It is not published yet; no GitHub account or repository was supplied.

1. Create a GitHub repository under your school-approved account. Upload this folder's **contents** to its root, including `index.html`, `assets`, `teacher`, `assessments`, `sources`, and `tests`.
2. In the repository settings, open Pages. Choose deployment from a branch, select `main` and `/ (root)`, then save. The `.nojekyll` file ensures a plain static site. Alternatively select GitHub Actions and use the included workflow.
3. Wait for GitHub to show the published URL. Test it on a school Chromebook, including one lesson, feedback, and export. All internal paths are relative, so a project-repository URL works.
4. Post the published day links in Google Classroom. Do not post your computer's local file path.

No build or package installation is needed for hosting. If using command-line Git, initialize/commit/push this directory to your chosen remote using your normal school-approved process. No credentials or remote are embedded in the package.

## Assessment import

Pear Assessment's official October 2024 announcement documents PDF/DOCX/image question import. The PDF here contains ten single-choice items with three options each and no answer key. In your teacher account, use document import if enabled; review all extracted stems/options; set keys from `teacher/keys.html`; verify the point values and student preview. Actual import has not been verified in a school account. CSV/JSON banks are included for review and manual entry; no universal CSV or QTI import is claimed. Do not confuse Pear Assessment with Pearson Assessment. The separate performance task and rubric are necessary for standard evidence.

## Rerun validation (maintainers only)

Students need no tools. Maintainers with Python 3 can run `python tests/validate.py`. With Node.js, run `node tests/core.test.cjs`. Browser checks use Playwright, an optional developer-only dependency: install it in your own development environment, provide a compatible Chromium/Edge executable if needed, then run `node tests/browser.test.cjs`. See that file for environment options. The optional PDF-content check is `python tests/pdf.test.py` and requires pypdf in a maintainer environment. Browser tests use file URLs, plus a temporary local HTTP server to verify static-host paths. No student data is used. The report records which tests were actually run here.

## Scope and design notes

There are no future placeholder student lessons, external script/font dependencies, accounts, analytics, cookies, or persistent browser storage. Data lives in memory only. Real device-test observations and fictional comparison-card facts are explicitly separated. The troubleshooting lab is a safe simplified model, not real system control. Correct answers are accessible in a static site; use this as open-reading practice rather than a secure examination platform.

Age suitability and 40-minute pacing are designed but not classroom-pilot validated. Teacher review of written work and local school-device testing remain necessary. Day 34's future voice-command standard has a documented browser-permission coverage risk; text simulation alone must not be marked complete.

## Sources and editing

`sources/README.md` records official source links, verification date, PDF-page conventions, and export-source evidence. `assets/curriculum.json` holds structured content/audit metadata; `assets/data.js` holds runtime quiz data; `index.html` contains the full rendered readings. If editing, keep these in sync and rerun tests; the alignment audit and keys must change with any question. All newly authored lesson text and application code may be adapted for classroom use. Ohio standards remain attributed to the Ohio Department of Education and Workforce at the linked source. No third-party scripts or media are bundled.
