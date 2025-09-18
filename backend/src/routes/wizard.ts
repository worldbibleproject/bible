import express from 'express';
import { body, validationResult } from 'express-validator';
import OpenAI from 'openai';
import { prisma } from '../lib/database';
import { authenticate, AuthenticatedRequest } from '../middleware/auth';

const router = express.Router();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Book number => Book name mapping
const bookNames: { [key: number]: string } = {
  1: "Genesis", 2: "Exodus", 3: "Leviticus", 4: "Numbers", 5: "Deuteronomy",
  6: "Joshua", 7: "Judges", 8: "Ruth", 9: "1 Samuel", 10: "2 Samuel",
  11: "1 Kings", 12: "2 Kings", 13: "1 Chronicles", 14: "2 Chronicles",
  15: "Ezra", 16: "Nehemiah", 17: "Esther", 18: "Job", 19: "Psalms",
  20: "Proverbs", 21: "Ecclesiastes", 22: "Song of Solomon", 23: "Isaiah",
  24: "Jeremiah", 25: "Lamentations", 26: "Ezekiel", 27: "Daniel",
  28: "Hosea", 29: "Joel", 30: "Amos", 31: "Obadiah", 32: "Jonah",
  33: "Micah", 34: "Nahum", 35: "Habakkuk", 36: "Zephaniah", 37: "Haggai",
  38: "Zechariah", 39: "Malachi",
  40: "Matthew", 41: "Mark", 42: "Luke", 43: "John", 44: "Acts",
  45: "Romans", 46: "1 Corinthians", 47: "2 Corinthians", 48: "Galatians",
  49: "Ephesians", 50: "Philippians", 51: "Colossians", 52: "1 Thessalonians",
  53: "2 Thessalonians", 54: "1 Timothy", 55: "2 Timothy", 56: "Titus",
  57: "Philemon", 58: "Hebrews", 59: "James", 60: "1 Peter", 61: "2 Peter",
  62: "1 John", 63: "2 John", 64: "3 John", 65: "Jude", 66: "Revelation"
};

// Process wizard data
router.post('/process', [
  body('feeling').notEmpty().withMessage('Feeling is required'),
  body('barrier').notEmpty().withMessage('Barrier is required'),
  body('heart').notEmpty().withMessage('Heart text is required'),
  body('spiritual_background').notEmpty().withMessage('Spiritual background is required'),
  body('life_stage').notEmpty().withMessage('Life stage is required'),
  body('preferred_style').notEmpty().withMessage('Preferred style is required'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { feeling, barrier, heart, spiritual_background, life_stage, preferred_style } = req.body;

    // GPT Prompt #1 => 25 references
    const systemRef1 = `You are a biblical reference expert, referencing the KJV.
We want you to propose 25 distinct short Scripture references from across the entire Bible (Old and New Testament).
Each reference should be brief (single chapter or small section of a chapter).
We want a total of around 3–4 pages of reading from these 25 references.
Return JSON array, each element with:
{
  "book": (integer 1..66),
  "chapterStart": (integer),
  "chapterEnd": (integer),
  "reason": "short explanation"
}
No disclaimers, no extra text, only valid JSON.
Focus on:
- The user's feeling: ${feeling}
- Barrier: ${barrier}
- Spiritual background: ${spiritual_background}
- Life stage: ${life_stage}
- Preferred style: ${preferred_style}
- Heart text: ${heart}`;

    const response1 = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "system", content: systemRef1 }],
      temperature: 0.7,
      max_tokens: 2000,
    });

    const references1 = JSON.parse(response1.choices[0].message.content || '[]');

    // GPT Prompt #2 => 25 additional references
    const systemRef2 = `You are a biblical reference expert, referencing the KJV.
Generate 25 MORE distinct short Scripture references from across the entire Bible.
These should be different from the first 25 and complement them.
Return JSON array, each element with:
{
  "book": (integer 1..66),
  "chapterStart": (integer),
  "chapterEnd": (integer),
  "reason": "short explanation"
}
No disclaimers, no extra text, only valid JSON.
Focus on the same user context as before.`;

    const response2 = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "system", content: systemRef2 }],
      temperature: 0.7,
      max_tokens: 2000,
    });

    const references2 = JSON.parse(response2.choices[0].message.content || '[]');

    // Combine references
    const allReferences = [...references1, ...references2];

    // GPT Prompt #3 => Personalized prayer
    const prayerPrompt = `Write a personalized, encouraging prayer (500+ words) for someone who is:
- Feeling: ${feeling}
- Barrier: ${barrier}
- Heart: ${heart}
- Spiritual background: ${spiritual_background}
- Life stage: ${life_stage}
- Preferred style: ${preferred_style}

Make it warm, personal, and encouraging. Use "you" and "your" to address them directly.`;

    const prayerResponse = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: prayerPrompt }],
      temperature: 0.8,
      max_tokens: 1000,
    });

    const prayer = prayerResponse.choices[0].message.content || '';

    // GPT Prompt #4 => 10 annotated verses
    const versesPrompt = `You are a biblical verse selector specializing in the King James Version (KJV). Select the most relevant KJV verses—exactly 10 of them—that address or align with the user's needs.

User context:
- Feeling: ${feeling}
- Barrier: ${barrier}
- Heart: ${heart}
- Spiritual background: ${spiritual_background}
- Life stage: ${life_stage}
- Preferred style: ${preferred_style}

OUTPUT REQUIREMENTS:
Return a valid JSON array containing exactly 10 items. Each item must have these keys:
[
  {
    "reference": "Book Chapter:Verse",
    "text": "KJV text of the verse",
    "commentary": "MacArthur-style commentary explaining the verse in context of the user's situation"
  }
]

No disclaimers, no extra text, only valid JSON.`;

    const versesResponse = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: versesPrompt }],
      temperature: 0.7,
      max_tokens: 2000,
    });

    const verses = JSON.parse(versesResponse.choices[0].message.content || '[]');

    // Get actual KJV text for references
    const referencesWithText = await Promise.all(
      allReferences.map(async (ref: any) => {
        try {
          const verses = await prisma.bibleVerse.findMany({
            where: {
              book: ref.book,
              chapter: { gte: ref.chapterStart, lte: ref.chapterEnd }
            },
            orderBy: [{ chapter: 'asc' }, { verse: 'asc' }]
          });

          const text = verses.map(v => `${bookNames[v.book]} ${v.chapter}:${v.verse} ${v.text}`).join(' ');
          
          return {
            ...ref,
            bookName: bookNames[ref.book],
            text: text.substring(0, 500) + (text.length > 500 ? '...' : '')
          };
        } catch (error) {
          console.error('Error fetching verses:', error);
          return {
            ...ref,
            bookName: bookNames[ref.book],
            text: 'Text not available'
          };
        }
      })
    );

    // Save to database if user is authenticated
    let savedData = null;
    if (req.headers.authorization) {
      try {
        const token = req.headers.authorization.replace('Bearer ', '');
        const jwt = require('jsonwebtoken');
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        savedData = await prisma.miniBibleWizardData.create({
          data: {
            userId: decoded.userId,
            userInput: {
              feeling,
              barrier,
              heart,
              spiritual_background,
              life_stage,
              preferred_style
            },
            referencesJson: JSON.stringify(referencesWithText),
            prayerText: prayer,
            versesJson: JSON.stringify(verses)
          }
        });
      } catch (error) {
        console.error('Error saving wizard data:', error);
      }
    }

    res.json({
      success: true,
      data: {
        references: referencesWithText,
        prayer,
        verses,
        savedData
      }
    });
  } catch (error) {
    console.error('Wizard processing error:', error);
    res.status(500).json({ error: 'Failed to process wizard data' });
  }
});

// Get wizard data for authenticated user
router.get('/my-data', authenticate, async (req: AuthenticatedRequest, res) => {
  try {
    const data = await prisma.miniBibleWizardData.findMany({
      where: { userId: req.user!.userId },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ data });
  } catch (error) {
    console.error('Get wizard data error:', error);
    res.status(500).json({ error: 'Failed to get wizard data' });
  }
});

export default router;


