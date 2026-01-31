// OpenAI Client Integration
// Following Skill.md AI Integration Standards
//
// ⚠️ P2 FEATURE - DORMANT
// AI features are disabled until P2 phase. All functions return mock data.
// Set AI_FEATURES_ENABLED=true to activate when ready.

import OpenAI from 'openai'
import { OPENAI_MODELS, QUALITY_THRESHOLDS } from './constants'

// P2 Feature Flag - Set to true when ready to enable AI features
const AI_FEATURES_ENABLED = false

// Initialize OpenAI client only if enabled
// Note: In production, API calls should go through Edge Functions for security
const openai = AI_FEATURES_ENABLED
  ? new OpenAI({
      apiKey: import.meta.env.VITE_OPENAI_API_KEY,
      dangerouslyAllowBrowser: true, // Only for development - use Edge Functions in production
    })
  : null

/**
 * Analyze testimonial quality and return a score from 0.0 to 1.0
 * High-quality testimonials mention specific results, include role/title,
 * describe problems solved, and show enthusiasm.
 */
export async function analyzeTestimonialQuality(
  text: string
): Promise<{ score: number; reasoning: string }> {
  // P2 DORMANT - Return mock data
  if (!AI_FEATURES_ENABLED || !openai) {
    return { score: 0.7, reasoning: 'AI analysis disabled - using default score' }
  }

  if (!text || text.trim().length < 10) {
    return { score: 0.2, reasoning: 'Testimonial too short to analyze' }
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
      model: OPENAI_MODELS.GPT4O,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
      max_tokens: 200,
    })

    const content = response.choices[0].message.content
    return JSON.parse(content || '{ "score": 0.5, "reasoning": "Could not analyze" }')
  } catch (error) {
    console.error('Quality analysis failed:', error)
    return { score: 0.5, reasoning: 'Analysis failed - using default score' }
  }
}

/**
 * Extract sentiment score from testimonial (-1.0 to 1.0)
 * Negative = negative sentiment, 0 = neutral, Positive = positive
 */
export async function analyzeSentiment(
  text: string
): Promise<{ score: number; label: 'positive' | 'neutral' | 'negative' }> {
  // P2 DORMANT - Return mock data
  if (!AI_FEATURES_ENABLED || !openai) {
    return { score: 0.5, label: 'positive' }
  }

  if (!text || text.trim().length < 5) {
    return { score: 0, label: 'neutral' }
  }

  const prompt = `Analyze the sentiment of this testimonial on a scale from -1.0 (very negative) to 1.0 (very positive).

Testimonial:
"${text}"

Return JSON: { "score": -1.0 to 1.0, "label": "positive" | "neutral" | "negative" }`

  try {
    const response = await openai.chat.completions.create({
      model: OPENAI_MODELS.GPT4O,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
      max_tokens: 100,
    })

    const content = response.choices[0].message.content
    return JSON.parse(content || '{ "score": 0, "label": "neutral" }')
  } catch (error) {
    console.error('Sentiment analysis failed:', error)
    return { score: 0, label: 'neutral' }
  }
}

/**
 * Extract relevant tags from testimonial content
 * Tags are single words or short phrases related to features, benefits, or use cases
 */
export async function extractTags(text: string): Promise<string[]> {
  // P2 DORMANT - Return empty tags
  if (!AI_FEATURES_ENABLED || !openai) {
    return []
  }

  if (!text || text.trim().length < 10) {
    return []
  }

  const prompt = `Extract relevant tags from this testimonial. Tags should be:
- Single words or short phrases
- Lowercase
- Related to features, benefits, or use cases mentioned
- Maximum 5 tags

Testimonial:
"${text}"

Return JSON array of tag strings.`

  try {
    const response = await openai.chat.completions.create({
      model: OPENAI_MODELS.GPT4O,
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
 * Generate thoughtful questions for video testimonial collection (Director Mode)
 */
export async function generateDirectorQuestions(
  industry: string,
  productType: string,
  customerRole: string
): Promise<string[]> {
  // P2 DORMANT - Return default questions
  if (!AI_FEATURES_ENABLED || !openai) {
    return [
      `What problem were you trying to solve before using our ${productType}?`,
      `How has our product changed your workflow or results?`,
      `What would you tell someone considering our product?`,
    ]
  }

  const prompt = `You are helping collect a video testimonial. Generate 3 thoughtful questions to ask a ${customerRole} in the ${industry} industry about their experience with a ${productType}.

The questions should:
- Be specific and concrete (not generic)
- Probe for measurable results or specific examples
- Encourage storytelling
- Be easy to answer in 30-60 seconds

Format: Return a JSON array of question strings.`

  try {
    const response = await openai.chat.completions.create({
      model: OPENAI_MODELS.GPT4O,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 500,
    })

    const content = response.choices[0].message.content
    return JSON.parse(content || '[]')
  } catch (error) {
    console.error('Question generation failed:', error)
    return [
      'What specific problem were you trying to solve?',
      'How has this product helped you achieve your goals?',
      'What results have you seen since using this product?',
    ]
  }
}

/**
 * Transcribe video/audio file using Whisper
 */
export async function transcribeAudio(audioFile: File): Promise<string> {
  // P2 DORMANT - Return error message
  if (!AI_FEATURES_ENABLED || !openai) {
    throw new Error('Audio transcription is not available yet. Coming soon!')
  }

  try {
    const response = await openai.audio.transcriptions.create({
      file: audioFile,
      model: OPENAI_MODELS.WHISPER,
      language: 'en',
    })

    return response.text
  } catch (error) {
    console.error('Transcription failed:', error)
    throw new Error('Failed to transcribe audio. Please try again.')
  }
}

/**
 * Analyze testimonial and return full analysis including quality, sentiment, and tags
 * This is the main function to call for new testimonials
 */
export async function analyzeTestimonial(text: string): Promise<{
  qualityScore: number
  qualityReasoning: string
  sentimentScore: number
  sentimentLabel: 'positive' | 'neutral' | 'negative'
  tags: string[]
}> {
  // Run all analyses in parallel for efficiency
  const [quality, sentiment, tags] = await Promise.all([
    analyzeTestimonialQuality(text),
    analyzeSentiment(text),
    extractTags(text),
  ])

  return {
    qualityScore: quality.score,
    qualityReasoning: quality.reasoning,
    sentimentScore: sentiment.score,
    sentimentLabel: sentiment.label,
    tags,
  }
}

/**
 * Get quality level from score
 */
export function getQualityLevel(score: number): 'high' | 'medium' | 'low' {
  if (score >= QUALITY_THRESHOLDS.HIGH) return 'high'
  if (score >= QUALITY_THRESHOLDS.MEDIUM) return 'medium'
  return 'low'
}

export { openai }
