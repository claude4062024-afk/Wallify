/**
 * Spam and Bot Filtering Utilities
 * Filters out spam accounts and spam content before saving testimonials
 * Per Skill.md anti-spam filtering requirements
 */

export interface Author {
  name: string;
  handle?: string;
  bio?: string;
  followers?: number;
  following?: number;
  createdAt?: Date | string;
  verified?: boolean;
}

// Spam keywords commonly found in bot bios and spam content
const SPAM_KEYWORDS = [
  'click here',
  'dm me',
  'check bio',
  'link in bio',
  'follow back',
  'follow4follow',
  'f4f',
  'make money',
  'earn money',
  'free crypto',
  'bitcoin giveaway',
  'nft drop',
  'adult content',
  '18+',
  'onlyfans',
  'cashapp',
  'venmo me',
  'send me',
  'wire transfer',
  'investment opportunity',
  'guaranteed returns',
  'work from home',
  'passive income',
  'financial freedom',
];

// Bot-like patterns in handles
const BOT_HANDLE_PATTERNS = [
  /^\d{6,}$/, // Only numbers (6+ digits)
  /^[a-z]+\d{6,}$/i, // Word followed by many numbers
  /bot\d*/i, // Contains "bot"
  /spam/i, // Contains "spam"
  /fake/i, // Contains "fake"
  /^[a-z]{2}\d{8,}$/i, // Two letters followed by 8+ numbers
];

/**
 * Check if an account appears to be a spam/bot account
 */
export function isSpamAccount(author: Author): boolean {
  // Check account age (created < 30 days ago)
  if (author.createdAt) {
    const createdDate = typeof author.createdAt === 'string' 
      ? new Date(author.createdAt) 
      : author.createdAt;
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    if (createdDate > thirtyDaysAgo) {
      return true;
    }
  }

  // Check follower ratio (following 1000+, followers < 10)
  if (
    author.following !== undefined &&
    author.followers !== undefined &&
    author.following > 1000 &&
    author.followers < 10
  ) {
    return true;
  }

  // Check for bot keywords in bio
  if (author.bio && containsBotKeywords(author.bio)) {
    return true;
  }

  // Check for suspicious handle patterns
  if (author.handle && hasSuspiciousHandle(author.handle)) {
    return true;
  }

  // Check for empty or generic name
  if (isGenericName(author.name)) {
    return true;
  }

  return false;
}

/**
 * Check if text contains bot/spam keywords
 */
export function containsBotKeywords(text: string): boolean {
  const lowerText = text.toLowerCase();
  return SPAM_KEYWORDS.some((keyword) => lowerText.includes(keyword.toLowerCase()));
}

/**
 * Check if handle matches suspicious bot patterns
 */
export function hasSuspiciousHandle(handle: string): boolean {
  return BOT_HANDLE_PATTERNS.some((pattern) => pattern.test(handle));
}

/**
 * Check if name is generic/placeholder
 */
export function isGenericName(name: string): boolean {
  const genericNames = [
    'user',
    'guest',
    'anonymous',
    'unknown',
    'test',
    'demo',
    'admin',
    'null',
    'undefined',
    'no name',
    'name',
    'your name',
    'first last',
    'john doe',
    'jane doe',
  ];

  const lowerName = name.toLowerCase().trim();
  
  if (lowerName.length < 2) return true;
  if (genericNames.includes(lowerName)) return true;
  
  return false;
}

/**
 * Check if content appears to be spam
 */
export function isSpamContent(text: string): boolean {
  const lowerText = text.toLowerCase();

  // Check for spam keywords
  if (SPAM_KEYWORDS.some((keyword) => lowerText.includes(keyword.toLowerCase()))) {
    return true;
  }

  // Check for excessive links (more than 2)
  const linkCount = (text.match(/https?:\/\//gi) || []).length;
  if (linkCount > 2) {
    return true;
  }

  // Check for repeated characters (e.g., "amazinggggggg")
  if (/(.)\1{4,}/.test(text)) {
    return true;
  }

  // Check for all caps (more than 50% of text)
  const alphaChars = text.replace(/[^a-zA-Z]/g, '');
  const upperChars = text.replace(/[^A-Z]/g, '');
  if (alphaChars.length > 20 && upperChars.length / alphaChars.length > 0.5) {
    return true;
  }

  // Check for excessive emojis (more than 10)
  const emojiCount = (text.match(/[\u{1F600}-\u{1F6FF}]/gu) || []).length;
  if (emojiCount > 10) {
    return true;
  }

  // Check for very short content (less than 10 characters)
  if (text.trim().length < 10) {
    return true;
  }

  // Check for excessive hashtags (more than 5)
  const hashtagCount = (text.match(/#\w+/g) || []).length;
  if (hashtagCount > 5) {
    return true;
  }

  return false;
}

/**
 * Check if content is too generic (low-quality)
 */
export function isGenericContent(text: string): boolean {
  const genericPhrases = [
    'great product',
    'love it',
    'amazing',
    'awesome',
    'the best',
    'highly recommend',
    'must have',
    '10/10',
    'five stars',
    '5 stars',
    'perfect',
    'excellent',
  ];

  const lowerText = text.toLowerCase().trim();

  // If the entire text is just a generic phrase
  if (genericPhrases.some((phrase) => lowerText === phrase || lowerText === phrase + '!')) {
    return true;
  }

  // If text is very short and mostly generic
  if (text.length < 30) {
    const words = lowerText.split(/\s+/);
    const genericWords = ['great', 'good', 'nice', 'love', 'like', 'amazing', 'awesome', 'best'];
    const genericWordCount = words.filter((w) => genericWords.includes(w)).length;
    
    if (genericWordCount / words.length > 0.6) {
      return true;
    }
  }

  return false;
}

/**
 * Combined filter - returns true if testimonial should be rejected
 */
export function shouldRejectTestimonial(
  text: string,
  author: Author
): { reject: boolean; reason: string | null } {
  if (isSpamAccount(author)) {
    return { reject: true, reason: 'Spam account detected' };
  }

  if (isSpamContent(text)) {
    return { reject: true, reason: 'Spam content detected' };
  }

  if (isGenericContent(text)) {
    return { reject: true, reason: 'Content too generic' };
  }

  return { reject: false, reason: null };
}

/**
 * Calculate a trust score for the testimonial
 * 0.0 = definitely spam, 1.0 = definitely legitimate
 */
export function calculateTrustScore(text: string, author: Author): number {
  let score = 1.0;

  // Account factors
  if (author.verified) {
    score += 0.2;
  }

  if (author.followers !== undefined && author.followers > 100) {
    score += 0.1;
  }

  if (author.followers !== undefined && author.followers > 1000) {
    score += 0.1;
  }

  // Content factors
  if (text.length > 100) {
    score += 0.1;
  }

  if (text.length > 300) {
    score += 0.1;
  }

  // Penalty factors
  if (isGenericContent(text)) {
    score -= 0.3;
  }

  if (containsBotKeywords(text)) {
    score -= 0.5;
  }

  const linkCount = (text.match(/https?:\/\//gi) || []).length;
  score -= linkCount * 0.1;

  // Clamp to 0-1 range
  return Math.max(0, Math.min(1, score));
}

export default {
  isSpamAccount,
  isSpamContent,
  isGenericContent,
  containsBotKeywords,
  hasSuspiciousHandle,
  shouldRejectTestimonial,
  calculateTrustScore,
};
