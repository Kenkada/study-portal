# Study Portal: Semester 5, B.Tech Mechanical

Interactive lessons, derivations, numericals with instant checking, and printable revision sheets for every Semester 5 course. Served with GitHub Pages so it works on a phone.

## Structure

```
index.html              portal home: one card per course
assets/
  portal.css            shared stylesheet (light/dark, mobile, print)
  learn.js              shared widgets: quizzes, numeric checker, write-then-reveal, progress ticks
AMP/                    MEMEE506 Advanced Machining Processes
  index.html            course page: units and lessons
  lessons/              0001-…html, one short lesson each
  reference/            formula sheet, process sheets, glossary
  assets/diagrams/      exam-style SVG sketches
```

Only the files above are published. The whitelist `.gitignore` keeps everything else in the folder (textbook PDFs, past papers, personal notes, other course material) off GitHub.

## Adding a course

1. Create `<COURSE>/index.html`, `<COURSE>/lessons/`, `<COURSE>/reference/` (copy the AMP pages as templates; set `data-course="<code>"` on `<body>`).
2. Add four lines to `.gitignore` for the new folder (see the comment there).
3. Turn the course's card in the root `index.html` from muted into a link.

## Preview locally

```bash
python -m http.server 8765 --directory .
```

Then open http://localhost:8765.

## Sources

Lesson content is written from the course textbooks and the department's papers, cited inside each lesson. No copyrighted source files are stored in this repository.
