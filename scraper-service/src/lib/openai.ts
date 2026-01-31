/**
 * OpenAI Client for Scraper Service
 * Following Skill.md AI Integration Standards
 *
 * ⚠️ P2 FEATURE - DORMANT
 * AI features are disabled until P2 phase. All functions return mock data.
 * Set AI_FEATURES_ENABLED=true to activate when ready.
 */

import OpenAI from 'openai'

// P2 Feature Flag - Set to true when ready to enable AI features
const AI_FEATURES_ENABLED = false

if (!AI_FEATURES_ENABLED) {
  console.log('[OpenAI] AI features are dormant (P2 phase). Using mock data.')
}

export const openai = AI_FEATURES_ENABLED && process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null

/**
 * Analyze testimonial quality and return score 0.0-1.0
 */
export async function analyzeQuality(text: string): Promise<{ score: number; reasoning: string }> {
  // P2 DORMANT - Return mock data
  if (!AI_FEATURES_ENABLED || !openai) {
    return { score: 0.7, reasoning: 'AI analysis disabled - using default score' }
  }

  if (!text || text.trim().length < 10) {
    return { score: 0.5, reasoning: 'AI analysis unavailable' }
  }

  const prompt = `Analyze this testimonial and score its quality from 0.0 to 1.0.

High-quality testimonials:
- Mention specific results or metrics
- Include the person's role/title
- Describe a specific problem solved
- Show emotion or enthusiasm
- Are detailed (not generic)

Low-quality testimonials:
- Generic praise ("it's great!")
- No specifics or context
- Too short or too long
- Seem fake or overly promotional

Testimonial:
"${text}"

Return JSON: { "score": 0.0-1.0, "reasoning": "brief explanation" }`

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
      max_tokens: 200,
    })

    const content = response.choices[0].message.content
    return JSON.parse(content || '{ "score": 0.5, "reasoning": "Could not analyze" }')
  } catch (error) {
    console.error('Quality analysis failed:', error)
    return { score: 0.5, reasoning: 'Analysis failed' }
  }
}

/**
 * Analyze sentiment (-1.0 to 1.0)
 */
export async function analyzeSentiment(text: string): Promise<number> {
  // P2 DORMANT - Return mock positive sentiment
  if (!AI_FEATURES_ENABLED || !openai || !text) return 0.5

  const prompt = `Analyze sentiment of this testimonial. Return only a number from -1.0 (very negative) to 1.0 (very positive):

"${text}"`

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
      max_tokens: 10,
    })

    const content = response.choices[0].message.content
    const score = parseFloat(content || '0')
    return isNaN(score) ? 0 : Math.max(-1, Math.min(1, score))
  } catch (error) {
    console.error('Sentiment analysis failed:', error)
    return 0
  }
}

/**
 * Extract tags from testimonial
 */
export async function extractTags(text: string): Promise<string[]> {
  // P2 DORMANT - Return empty tags
  if (!AI_FEATURES_ENABLED || !openai || !text || text.length < 20) return []

  const prompt = `Extract 3-5 relevant tags from this testimonial. Tags should be lowercase, single words or short phrases.

Testimonial:
"${text}"

Return JSON array of tag strings only.`

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.5,
      max_tokens: 100,
    })

    const content = response.choices[0].message.content
    return JSON.parse(content || '[]')
  } catch (error) {
    console.error('Tag extraction failed:', error)
    return []
  }
}

/**
 * Full testimonial analysis
 */
export async function analyzeTestimonial(text: string): Promise<{
  qualityScore: number
  sentimentScore: number
  tags: string[]
}> {
  const [quality, sentiment, tags] = await Promise.all([
    analyzeQuality(text),
    analyzeSentiment(text),
    extractTags(text),
  ])

  return {
    qualityScore: quality.score,
    sentimentScore: sentiment,
    tags,
  }
}
