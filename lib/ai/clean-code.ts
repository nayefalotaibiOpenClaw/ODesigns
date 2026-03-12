export interface AIPostResult {
  code: string;
  caption: string;
  imageKeywords: string[];
}

/**
 * Parse AI response that should be JSON with code, caption, imageKeywords.
 * Falls back to treating the entire response as raw code if JSON parsing fails.
 */
export function parseAIResponse(raw: string): AIPostResult {
  const trimmed = raw.trim();

  // Try to parse as JSON first
  try {
    // Strip markdown fences if the AI wrapped the JSON in them
    const jsonStr = trimmed
      .replace(/^```(?:json)?\n?/gm, '')
      .replace(/```$/gm, '')
      .trim();

    const parsed = JSON.parse(jsonStr);
    if (parsed.code && typeof parsed.code === 'string') {
      return {
        code: cleanCode(parsed.code),
        caption: typeof parsed.caption === 'string' ? parsed.caption : '',
        imageKeywords: Array.isArray(parsed.imageKeywords) ? parsed.imageKeywords : [],
      };
    }
  } catch {
    // Not valid JSON — try to extract JSON object from the response
    const jsonMatch = trimmed.match(/\{[\s\S]*"code"\s*:\s*"[\s\S]*\}/);
    if (jsonMatch) {
      try {
        const parsed = JSON.parse(jsonMatch[0]);
        if (parsed.code && typeof parsed.code === 'string') {
          return {
            code: cleanCode(parsed.code),
            caption: typeof parsed.caption === 'string' ? parsed.caption : '',
            imageKeywords: Array.isArray(parsed.imageKeywords) ? parsed.imageKeywords : [],
          };
        }
      } catch {
        // Fall through to raw code handling
      }
    }
  }

  // Fallback: treat entire response as raw TSX code
  return {
    code: cleanCode(trimmed),
    caption: '',
    imageKeywords: [],
  };
}

export function cleanCode(raw: string): string {
  let code = raw;

  // Strip markdown fences
  code = code.replace(/^```(?:tsx?|jsx?|javascript|typescript)?\n?/gm, '').replace(/```$/gm, '');

  // If the AI wrapped code in fences, extract the content between them
  const fencedMatch = code.match(/```(?:tsx?|jsx?|javascript|typescript)?\n([\s\S]*?)```/);
  if (fencedMatch) {
    code = fencedMatch[1];
  }

  // Extract the component block: from first import to the last closing brace
  const importStart = code.indexOf('import ');
  const exportMatch = code.match(/export\s+default\s+function\s+\w+/);
  if (importStart > 0 && exportMatch) {
    // There's text before imports — strip it
    code = code.slice(importStart);
  }

  // Strip any trailing explanation text after the component
  // Find the last top-level closing brace that ends the export default function
  const lastBrace = findComponentEnd(code);
  if (lastBrace !== -1 && lastBrace < code.length - 1) {
    code = code.slice(0, lastBrace + 1);
  }

  return code.trim();
}

/**
 * Find the end of the exported component by tracking brace depth
 * starting from the export default function's opening brace.
 */
function findComponentEnd(code: string): number {
  const exportMatch = code.match(/export\s+default\s+function\s+\w+\s*\([^)]*\)\s*\{/);
  if (!exportMatch || exportMatch.index === undefined) return -1;

  const startIdx = exportMatch.index + exportMatch[0].length - 1; // the opening {
  let depth = 1;
  let inString: string | null = null;
  let inTemplate = false;

  for (let i = startIdx + 1; i < code.length; i++) {
    const ch = code[i];
    const prev = code[i - 1];

    // Handle string/template literal tracking
    if (!inString && !inTemplate) {
      if (ch === "'" || ch === '"') {
        inString = ch;
        continue;
      }
      if (ch === '`') {
        inTemplate = true;
        continue;
      }
    } else if (inString) {
      if (ch === inString && prev !== '\\') inString = null;
      continue;
    } else if (inTemplate) {
      if (ch === '`' && prev !== '\\') inTemplate = false;
      continue;
    }

    if (ch === '{') depth++;
    if (ch === '}') depth--;
    if (depth === 0) return i;
  }

  return -1;
}
