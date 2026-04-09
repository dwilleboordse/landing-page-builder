import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 60;

const AWARENESS_STRUCTURES: Record<string, Record<string, string>> = {
  unaware: {
    advertorial:
      "Lead with a compelling personal story or shocking statistic that makes the reader recognize an issue they didn't know they had. Use pattern-interrupt headline. Open with pure emotion — identity, fear, aspiration. Do NOT mention the product until at least 60% through the page. Structure: Emotional hook → Story/scenario → Problem reveal → Agitate → Introduce solution category → Bridge to product → Soft CTA.",
    listicle:
      "Frame as discovery content: 'X Things You Didn't Know About [problem area]'. Each list item should gradually move the reader from unaware to problem-aware. Start with surprising facts, end items pointing toward the product's solution category. Structure: Curiosity headline → Surprising facts → Problem education → Solution hints → Product positioned as discovery → CTA.",
    comparison:
      "Frame as an educational guide: 'The Truth About [category]'. Compare approaches/methods rather than products directly. Educate the reader that a problem exists and different solutions have been tried. Structure: Educational hook → Problem context → Method comparison → Winner reveal → Product introduction → CTA.",
  },
  problem: {
    advertorial:
      "Name the problem boldly in the headline. Agitate with specific, visceral details the reader will recognize. Build tension — make them feel the cost of inaction. Then introduce the solution category before bridging to the product. Structure: Problem headline → Agitation → Cost of inaction → Solution category reveal → Product as the answer → Proof → CTA.",
    listicle:
      "Frame as 'Top X Solutions for [Specific Problem]'. Acknowledge the problem clearly, then walk through solutions with the product positioned as #1 or the clear winner. Structure: Problem-naming headline → Quick problem recap → Solutions ranked → Product wins → Proof → CTA.",
    comparison:
      "Compare different approaches to solving the stated problem. Show why most approaches fail or fall short. Position the product's approach as superior. Structure: Problem headline → Failed approaches → Why they fail → Product's approach → Proof of difference → CTA.",
  },
  solution: {
    advertorial:
      "Lead with the mechanism — explain WHY this approach works differently. The reader already knows solutions exist, so differentiate through the 'how'. Focus on unique mechanism, proprietary process, or novel angle. Structure: Mechanism headline → Why other solutions fall short → The breakthrough → How it works → Product as embodiment → Proof → CTA.",
    listicle:
      "Frame as 'Best X [Solution Category] Compared'. Do a genuine-feeling comparison where the product wins on the dimensions that matter most. Structure: Comparison headline → Criteria that matter → Ranked list → Product wins → Deep dive on winner → Proof → CTA.",
    comparison:
      "Direct head-to-head comparison. Feature matrix, benefit comparison, proof stacking. Show clear differentiation. Structure: Versus headline → Comparison criteria → Side-by-side breakdown → Where product wins → Social proof → CTA.",
  },
  product: {
    advertorial:
      "Heavy proof and offer focus. The reader knows the product — they need conviction. Stack testimonials, case studies, results. Then hit with an irresistible offer. Structure: Results-driven headline → Proof stack → Specific results → Testimonial cascade → Offer reveal → Urgency → CTA.",
    listicle:
      "Frame as 'X Reasons [Product] Dominates' or 'X Results from [Product] Users'. Pure proof and social validation. Structure: Results headline → Individual proof points → Testimonials per point → Cumulative impact → Offer → CTA.",
    comparison:
      "Product vs specific competitors with detailed feature/benefit/proof comparison. Clear winner. Structure: Specific comparison headline → Feature matrix → Benefit comparison → Proof per claim → Offer advantage → CTA.",
  },
  most: {
    advertorial:
      "Pure offer page. Minimal education needed. Lead with the deal, stack the value, create urgency. Structure: Offer headline → Value stack → Bonuses → Social proof snippets → Urgency/scarcity → CTA → Risk reversal.",
    listicle:
      "Frame as 'Everything You Get with [Offer]'. List every element of value. Structure: Offer headline → Value item list → Each with mini-proof → Total value calculation → Price reveal → CTA.",
    comparison:
      "Price/value comparison showing the offer is a no-brainer vs alternatives. Structure: Value headline → Alternative costs → Your offer → Savings math → Bonuses → CTA.",
  },
};

function buildSystemPrompt(brief: any): string {
  const awarenessInfo =
    AWARENESS_STRUCTURES[brief.awareness]?.[brief.pageType] || "";

  const styleInstructions =
    brief.styleMode === "branded"
      ? `STYLING: Use the client's brand colors. Primary: ${brief.brandPrimary || "#1a1a1a"}. Secondary: ${brief.brandSecondary || "#ffffff"}. Accent: ${brief.brandAccent || "#e63946"}. ${brief.brandLogo ? `Include the logo at the top using this URL: ${brief.brandLogo}` : ""} Use clean, modern fonts that match the brand feel. The page should look like a branded landing page.`
      : `STYLING: Make this look like a native editorial article on a credible news/health/lifestyle publication. Use a serif font for body text, clean layout with generous whitespace. Include a fake publication name and date at the top. Add subtle editorial elements like author byline, reading time, category tags. It should NOT look like an ad. It should feel like stumbling onto a real article.`;

  return `You are an expert direct-response copywriter and landing page designer who has studied Eugene Schwartz's awareness levels deeply. You create high-converting advertorial pages, listicles, and comparison pages for eCommerce brands.

You will generate a COMPLETE, self-contained HTML page. The HTML must be production-ready with inline CSS. No external dependencies except Google Fonts.

PAGE TYPE: ${brief.pageType.toUpperCase()}
AWARENESS LEVEL: ${brief.awareness.toUpperCase()}

STRUCTURAL GUIDANCE FOR THIS AWARENESS + PAGE TYPE:
${awarenessInfo}

${styleInstructions}

CRITICAL RULES:
1. The page must be a SINGLE self-contained HTML file with all CSS inline or in a <style> tag
2. Make it responsive (mobile-first)
3. Use real-feeling copy based on the brief — not placeholder text
4. Include realistic testimonials, stats, and proof elements based on what's provided
5. Images should use placeholder divs with descriptive text of what image should go there, styled as grey boxes with text
6. The page should feel REAL — like it was made by a professional direct-response team
7. Include a sticky CTA bar at the bottom on mobile
8. Use proper typography hierarchy
9. Add subtle trust elements (security badges text, guarantee text, etc.)
10. The HTML output should be COMPLETE — start with <!DOCTYPE html> and end with </html>
11. Make the page between 1500-3000 words of copy depending on awareness level (unaware = longer, most aware = shorter)
12. Do NOT include any markdown formatting. Output ONLY the raw HTML.
13. Use engaging subheadings throughout to maintain scanability
14. Include at least 3-5 proof elements (testimonials, stats, before/after, expert quotes)

IMPORTANT COPY PRINCIPLES:
- Every sentence must earn the next sentence
- Headlines must stop the scroll — use curiosity, specificity, or pattern interrupts
- Match the emotional temperature to the awareness level
- Use concrete numbers and specifics, never vague claims
- Write in a conversational, human tone — never corporate
- The CTA should feel earned, not forced
- Use the prospect's language, not the brand's language`;
}

function buildUserPrompt(brief: any): string {
  let prompt = `Generate a complete HTML ${brief.pageType} landing page with the following details:

BRAND/PRODUCT: ${brief.brandName || "Not specified"}
PRODUCT URL: ${brief.productUrl || "Not specified"}
CORE OFFER: ${brief.coreOffer || "Not specified"}
TARGET AUDIENCE: ${brief.targetAudience || "Not specified"}
AWARENESS LEVEL: ${brief.awareness}

WINNING ANGLES:
${brief.winningAngles || "Not specified"}

COMPETITOR WEAKNESSES:
${brief.competitorWeaknesses || "Not specified"}

PROOF ELEMENTS (testimonials, stats, press):
${brief.proofElements || "Not specified"}

OBJECTIONS TO OVERCOME:
${brief.objections || "Not specified"}`;

  if (brief.knowledgeBase) {
    prompt += `\n\nBRAND KNOWLEDGE BASE (use this for tone, copy style, product details, and supporting info):\n${brief.knowledgeBase.slice(0, 20000)}`;
  }

  if (brief.instruction) {
    prompt += `\n\nSPECIFIC INSTRUCTIONS FOR THIS PAGE:\n${brief.instruction}`;
  }

  if (brief.pageType === "listicle") {
    prompt += `\n\nLISTICLE: Generate a top 5 style listicle. Position the main product as the #1 pick.`;
  }

  if (brief.pageType === "comparison") {
    prompt += `\n\nCOMPARISON: Create a detailed comparison page. Use competitor info from the brief to build the comparison. If no specific competitors are named, compare against generic alternatives in the category.`;
  }

  prompt += `\n\nGenerate the COMPLETE HTML page now. Start with <!DOCTYPE html> and output only HTML code, no markdown, no backticks, no explanation.`;
  return prompt;
}

export async function POST(request: NextRequest) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "ANTHROPIC_API_KEY not configured. Add it to your Vercel environment variables." },
      { status: 500 }
    );
  }

  let brief: any;
  try {
    brief = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid request body." },
      { status: 400 }
    );
  }

  try {
    const systemPrompt = buildSystemPrompt(brief);
    const userPrompt = buildUserPrompt(brief);

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 16000,
        system: systemPrompt,
        messages: [{ role: "user", content: userPrompt }],
      }),
    });

    // Read body as text first — Anthropic may return non-JSON on errors
    const responseText = await response.text();

    if (!response.ok) {
      let errorMessage = `Anthropic API error (${response.status})`;
      try {
        const errData = JSON.parse(responseText);
        errorMessage = errData.error?.message || errorMessage;
      } catch {
        // Response wasn't JSON — use the raw text if short, otherwise generic message
        if (responseText.length < 500) {
          errorMessage = responseText || errorMessage;
        }
      }
      console.error("Anthropic API error:", response.status, responseText.slice(0, 500));
      return NextResponse.json({ error: errorMessage }, { status: response.status });
    }

    let data: any;
    try {
      data = JSON.parse(responseText);
    } catch {
      console.error("Failed to parse Anthropic response as JSON:", responseText.slice(0, 500));
      return NextResponse.json(
        { error: "Received invalid response from Anthropic API. Try again." },
        { status: 502 }
      );
    }

    if (!data.content || !Array.isArray(data.content)) {
      console.error("Unexpected response structure:", JSON.stringify(data).slice(0, 500));
      return NextResponse.json(
        { error: "Unexpected response format from Anthropic API." },
        { status: 502 }
      );
    }

    let html = data.content
      .filter((b: any) => b.type === "text")
      .map((b: any) => b.text || "")
      .join("");

    // Strip markdown fences if present
    html = html.replace(/^```html?\s*/i, "").replace(/\s*```$/i, "").trim();

    if (!html) {
      return NextResponse.json(
        { error: "Generation returned empty content. Try again." },
        { status: 502 }
      );
    }

    return NextResponse.json({ html });
  } catch (err: any) {
    console.error("Generate route error:", err);
    return NextResponse.json(
      { error: err.message || "Generation failed. Check your API key and try again." },
      { status: 500 }
    );
  }
}
