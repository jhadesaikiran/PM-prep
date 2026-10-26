# PM Prep

Local app for PM interview practice. Runs on your machine only and uses your `claude` CLI login (no API key).

## Run

```
cd pm-prep
npm start          # builds the UI and serves http://localhost:4000
npm run dev        # hot reload while editing: UI on http://localhost:5173
```

Use Chrome or Safari to answer by voice. Allow microphone access the first time.

## Mock interviews

- Click a topic to start with a random case book question you haven't done yet, or use **Choose a question** to pick one or type your own.
- The interviewer's questions appear as text. Click Start speaking to dictate your answer; your speech fills the answer box, which you can edit before sending (⌘ Enter).
- **End interview** saves the transcript and runs a scored analysis: rubric, what to improve, a stronger answer outline, and what to practise next.

## Resume grilling

- **Upload** a resume (PDF or text) or **Paste** it. You get 15–20 questions an interviewer would ask about that specific resume, each with the line it targets and what it tests. **Practice** opens one as a behavioral mock interview.
- **Stories** starts with four common themes. Click one to write it in STARL form (Situation, Task, Action, Result, Learning); it saves as you type. Under each card you see what's missing (empty parts, no number in the result, no "I" in the action). **Review story** adds Claude's feedback: what's missing, what to add, and likely follow-ups.

## Study

Lists every PDF in `casebooks/`. Open one to read it: scroll through all pages, ← / → jump a page, type a page number to jump, + / − or the toolbar to zoom, **Fit** resets to page width. The page you're on is saved per book, so it reopens there.

## Data

Everything is plain JSON in `data/`:

- `data/questions.json`: question bank extracted from the case books (included in the repo)
- `data/interviews/*.json`: one file per interview (transcript + analysis)
- `data/study.json`: last page read in each book
- `data/resume.json`, `data/stories.json`: your resume, its questions, and your STARL stories

To rebuild the question bank after adding PDFs:

```
npm run extract-questions                     # default: ./casebooks
npm run extract-questions -- /other/folder
```

## Settings (environment variables)

| Variable | Default |
| --- | --- |
| `PORT` | `4000` |
| `PM_PREP_INTERVIEWER_MODEL` | `sonnet` (fast replies) |
| `PM_PREP_ANALYSIS_MODEL` | `opus` (deeper review) |
| `PM_PREP_CASEBOOKS` | `./casebooks` |
| `PM_PREP_DATA` | `./data` |
