import { Request, Response } from 'express';
import Anthropic from '@anthropic-ai/sdk';

const apiKey = process.env.ANTHROPIC_API_KEY;

if (!apiKey) {
  console.error('⚠️ ANTHROPIC_API_KEY is not set.');
}

const anthropic = new Anthropic({
  apiKey: apiKey || 'missing-key',
});

export async function handleExtractTokens(req: Request, res: Response) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return res.status(500).json(
      { error: 'ANTHROPIC_API_KEY is not configured.' }
    );
  }

  try {
    const { text, imageBase64, imageType } = req.body;

    if (!text && !imageBase64) {
      return res.status(400).json({ error: 'No content provided' });
    }

    const content: any[] = [];

    // If image was provided (screenshot of brand guide, Figma export, etc.)
    if (imageBase64) {
      content.push({
        type: 'image',
        source: {
          type: 'base64',
          media_type: imageType || 'image/png',
          data: imageBase64,
        },
      });
    }

    // Text content (pasted brand guide, CSS, etc.)
    if (text) {
      content.push({
        type: 'text',
        text: `Here is the design document / brand guide / style specification to extract tokens from:\n\n${text}`,
      });
    }

    content.push({
      type: 'text',
      text: `Extract ALL design tokens from this document and return them as a single JSON object. Be thorough — capture every color, font, size, spacing value, border radius, shadow, and rule you can find.

INPUT FORMAT DETECTION:
- If the input looks like CSS (contains :root, --, var(), @media, selectors), extract every custom property value.
- If the input looks like a Tailwind config (contains theme:, extend:, colors:, spacing:), extract every value from the config object.
- If the input looks like SCSS/SASS variables ($variable-name), extract all variable values.
- If the input is natural language (brand guidelines, spec doc), infer tokens from descriptions.

Return ONLY this JSON structure (no markdown, no explanation):
{
  "colors": [{"name": "Color Name", "value": "#hex"}],
  "fonts": ["Font Family Name"],
  "tokens": {
    "fontSizes": [12, 14, 16, ...],
    "fontWeights": [400, 500, 600, ...],
    "lineHeights": [1.2, 1.4, 1.5, ...],
    "letterSpacing": ["-0.02em", "0", "0.01em", ...],
    "spacing": [4, 8, 12, 16, ...],
    "maxWidths": [320, 480, 768, ...],
    "borderRadius": [0, 4, 8, ...],
    "borderWidths": [0, 1, 2, ...],
    "borderStyles": ["none", "solid", ...],
    "shadows": ["none", "0 1px 3px rgba(0,0,0,0.12)", ...],
    "opacities": [0, 0.5, 1, ...],
    "iconSizes": [16, 24, 32, ...],
    "minHeights": [32, 40, 48, ...]
  },
  "guidelines": ["Natural language rule 1", "Natural language rule 2", ...]
}

Rules for extraction:
- For CSS custom properties: --color-primary: #3b82f6 → colors: [{name: "Primary", value: "#3b82f6"}]. --spacing-lg: 24px → spacing: add 24. --radius-md: 8px → borderRadius: add 8.
- For Tailwind configs: colors.primary.500: '#3b82f6' → colors entry. fontSize.lg: '1.125rem' → convert to px (18) and add to fontSizes. spacing values → add to spacing array.
- For colors: capture ALL named colors with hex values. Include backgrounds, text, accents, brand, status colors (success/error/warning). Convert rgb(), hsl() to hex.
- For fonts: capture all font family names mentioned.
- For tokens: extract specific numeric values. Convert rem to px (1rem = 16px). If the doc says "8px spacing" add 8 to spacing.
- For guidelines: convert descriptive rules into concise instructions. "Headlines should be bold" → "Use font-weight 700 for headlines".
- If a value isn't mentioned, omit that field entirely (don't guess).
- Be generous with guideline extraction — capture every design rule, pattern, or recommendation.`,
    });

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4000,
      messages: [{ role: 'user', content }],
    });

    // Extract text from response
    const responseText = response.content
      .filter((block): block is Anthropic.TextBlock => block.type === 'text')
      .map(block => block.text)
      .join('');

    // Parse JSON from response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return res.status(500).json({ error: 'Could not extract tokens from document' });
    }

    const extracted = JSON.parse(jsonMatch[0]);
    return res.json(extracted);
  } catch (error: any) {
    console.error('Token extraction error:', error);
    return res.status(500).json(
      { error: error.message || 'Failed to extract tokens' }
    );
  }
}
