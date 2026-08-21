# ResumeIQ — AI Resume Analyzer

Upload a resume (PDF), optionally paste a target job description, and get an
ATS-style scan: match score, matched/missing keywords, section-by-section
feedback, and top suggestions — powered by Google Gemini.
## Stack
- Next.js 15 (App Router) + TypeScript
- Tailwind CSS v4
- Google Gemini API (`gemini-2.5-flash`, via its OpenAI-compatible endpoint, JSON mode)
- `pdf-parse` for text extraction

## Setup

1. **Get a free Gemini API key** — no credit card, ever:
   - Go to https://aistudio.google.com/apikey
   - Sign in with any Google account → "Create API key"
   - Copy the key

2. **Install & configure**

```bash
npm install
cp .env.example .env.local
# edit .env.local and add your GEMINI_API_KEY
npm run dev
```

Open http://localhost:3000

## How it works
1. `UploadZone` accepts a PDF via drag-and-drop or file picker.
2. On "Run Scan", the file + optional job description are POSTed to
   `/api/analyze` as `multipart/form-data`.
3. The API route (`src/app/api/analyze/route.ts`) extracts text with
   `pdf-parse`, builds a prompt (`src/lib/prompt.ts`), and calls Gemini
   through the `openai` SDK pointed at Google's OpenAI-compatible endpoint
   (`https://generativelanguage.googleapis.com/v1beta/openai/`) with
   `response_format: { type: "json_object" }` to force structured output.
4. The typed `AnalysisResult` (`src/lib/types.ts`) is validated and returned
   to the client, which renders the score ring, keyword chips, and feedback.

## Deploying
Push to GitHub, import into Vercel, add `GEMINI_API_KEY` as an environment
variable in the Vercel project settings. No other config needed.

## Switching providers later
If you later want to use OpenAI instead (e.g. paid GPT-4o), only three
things change in `src/app/api/analyze/route.ts`: drop the `baseURL` option,
change the `model` to an OpenAI model name, and rename the env var back to
`OPENAI_API_KEY`. Everything else — prompt, validation, UI — stays the same,
since Gemini's compatibility layer speaks the same API shape.

## Notes / talking points for interviews
- Structured-output prompting (JSON mode) instead of parsing free text.
- Client/server validation of the AI response shape before trusting it.
- Distinct loading, empty, and error states — not just a spinner.
- Only extracted resume text (not the raw file) is sent to the model.
- Provider-agnostic API call: swapping from Gemini to OpenAI (or back) is a
  three-line change because both speak the OpenAI chat-completions shape.


