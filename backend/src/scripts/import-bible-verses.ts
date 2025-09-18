import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

interface BibleVerse {
  book: string;
  chapter: number;
  verse: number;
  text: string;
  translation: string;
}

async function importBibleVerses() {
  try {
    console.log('📖 Starting Bible verses import...');

    // Sample Bible verses - replace with actual CSV import if needed
    const verses: BibleVerse[] = [
      {
        book: 'John',
        chapter: 3,
        verse: 16,
        text: 'For God so loved the world that he gave his one and only Son, that whoever believes in him shall not perish but have eternal life.',
        translation: 'NIV'
      },
      {
        book: 'Romans',
        chapter: 8,
        verse: 28,
        text: 'And we know that in all things God works for the good of those who love him, who have been called according to his purpose.',
        translation: 'NIV'
      },
      {
        book: 'Jeremiah',
        chapter: 29,
        verse: 11,
        text: 'For I know the plans I have for you, declares the Lord, plans to prosper you and not to harm you, to give you hope and a future.',
        translation: 'NIV'
      },
      {
        book: 'Philippians',
        chapter: 4,
        verse: 13,
        text: 'I can do all this through him who gives me strength.',
        translation: 'NIV'
      },
      {
        book: 'Proverbs',
        chapter: 3,
        verse: 5,
        text: 'Trust in the Lord with all your heart and lean not on your own understanding.',
        translation: 'NIV'
      },
      {
        book: 'Matthew',
        chapter: 28,
        verse: 19,
        text: 'Therefore go and make disciples of all nations, baptizing them in the name of the Father and of the Son and of the Holy Spirit.',
        translation: 'NIV'
      },
      {
        book: 'Psalm',
        chapter: 23,
        verse: 1,
        text: 'The Lord is my shepherd, I lack nothing.',
        translation: 'NIV'
      },
      {
        book: 'Isaiah',
        chapter: 40,
        verse: 31,
        text: 'But those who hope in the Lord will renew their strength. They will soar on wings like eagles; they will run and not grow weary, they will walk and not be faint.',
        translation: 'NIV'
      },
      {
        book: '1 Corinthians',
        chapter: 13,
        verse: 4,
        text: 'Love is patient, love is kind. It does not envy, it does not boast, it is not proud.',
        translation: 'NIV'
      },
      {
        book: 'Galatians',
        chapter: 5,
        verse: 22,
        text: 'But the fruit of the Spirit is love, joy, peace, forbearance, kindness, goodness, faithfulness.',
        translation: 'NIV'
      }
    ];

    // Clear existing verses
    await prisma.bibleVerse.deleteMany();
    console.log('🗑️ Cleared existing Bible verses');

    // Import verses
    for (const verse of verses) {
      await prisma.bibleVerse.create({
        data: verse
      });
      console.log(`✅ Imported: ${verse.book} ${verse.chapter}:${verse.verse}`);
    }

    console.log(`🎉 Successfully imported ${verses.length} Bible verses!`);

  } catch (error) {
    console.error('❌ Error importing Bible verses:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run if called directly
if (require.main === module) {
  importBibleVerses()
    .then(() => {
      console.log('✅ Bible verses import completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Bible verses import failed:', error);
      process.exit(1);
    });
}

export default importBibleVerses;
