import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { SYSTEM_PROMPT, buildUserPrompt } from "@/lib/prompt";
import type { AnalysisResult } from "@/lib/types";

import { CanvasFactory } from "pdf-parse/worker";
import { PDFParse } from "pdf-parse";

async function extractPdfText(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const buffer = new Uint8Array(arrayBuffer);

  const parser = new PDFParse({
    data: buffer,
    CanvasFactory,
  });

  try {
    const result = await parser.getText();
    return result.text;
  } finally {
    await parser.destroy();
  }
}

/**
 * Gemini's OpenAI-compatible endpoint generally honors response_format:
 * json_object, but occasionally wraps output in a ```json fence anyway.
 * Strip that before parsing.
 */
function stripJsonFences(raw: string): string {
  const trimmed = raw.trim();
  const fenceMatch = trimmed.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);
  return fenceMatch ? fenceMatch[1] : trimmed;
}

function isValidAnalysis(value: unknown): value is AnalysisResult {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.overallScore === "number" &&
    typeof v.summary === "string" &&
    Array.isArray(v.matchedKeywords) &&
    Array.isArray(v.missingKeywords) &&
    Array.isArray(v.sectionFeedback) &&
    Array.isArray(v.topSuggestions)
  );
}

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Server is missing GEMINI_API_KEY. Add it to .env.local and restart the dev server." },
        { status: 500 }
      );
    }

    const formData = await req.formData();
    const file = formData.get("resume");
    const jobDescription = (formData.get("jobDescription") as string) ?? "";

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: "No resume file was uploaded." }, { status: 400 });
    }

    if (file.type !== "application/pdf") {
      return NextResponse.json({ error: "Only PDF resumes are supported right now." }, { status: 400 });
    }

   let resumeText: string;

try {
  console.log("PDF received:", {
    name: file.name,
    type: file.type,
    size: file.size,
  });

  resumeText = await extractPdfText(file);

  console.log("PDF text extracted:", {
    characters: resumeText.length,
    preview: resumeText.slice(0, 200),
  });
} catch (error) {
  console.error("PDF EXTRACTION ERROR:", error);

  return NextResponse.json(
    {
      error: "Couldn't read the PDF.",
      details:
        error instanceof Error ? error.message : String(error),
    },
    { status: 422 }
  );
}

    if (!resumeText || resumeText.trim().length < 40) {
      return NextResponse.json(
        { error: "That PDF didn't contain readable text. Scanned/image PDFs aren't supported yet." },
        { status: 422 }
      );
    }

    // Gemini's free tier is exposed through an OpenAI-compatible endpoint,
    // so the `openai` SDK works unchanged — only the base URL, key, and
    // model name differ from calling OpenAI directly.
   const client = new GoogleGenAI({
  apiKey,
});

const response = await client.models.generateContent({
  model: "gemini-3.5-flash",
  contents: [
    {
      role: "user",
      parts: [
        {
          text: `${SYSTEM_PROMPT}

${buildUserPrompt(resumeText, jobDescription)}

Return ONLY valid JSON. Do not use markdown or code fences.`,
        },
      ],
    },
  ],
  config: {
    temperature: 0.4,
    responseMimeType: "application/json",
  },
});

const raw = response.text;
    if (!raw) {
      return NextResponse.json({ error: "The model returned an empty response. Try again." }, { status: 502 });
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(stripJsonFences(raw));
    } catch {
      return NextResponse.json({ error: "The model returned malformed JSON. Try again." }, { status: 502 });
    }

    if (!isValidAnalysis(parsed)) {
      return NextResponse.json({ error: "The model response didn't match the expected shape." }, { status: 502 });
    }

    const clamped: AnalysisResult = {
      ...parsed,
      overallScore: Math.max(0, Math.min(100, Math.round(parsed.overallScore))),
    };

    return NextResponse.json(clamped satisfies AnalysisResult);
  } catch (err) {
    console.error("Resume analysis failed:", err);
    const message =
      err instanceof Error && /api key|unauthorized|401/i.test(err.message)
        ? "Gemini rejected the request — check that GEMINI_API_KEY in .env.local is correct."
        : "Something went wrong while analyzing the resume.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
