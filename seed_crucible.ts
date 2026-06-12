import admin from 'firebase-admin';
import * as fs from 'fs';
import { QUESTIONS } from './src/data/questions';

const serviceAccount = JSON.parse(fs.readFileSync('./service-account.json', 'utf8'));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function seed() {
  console.log(`Seeding ${QUESTIONS.length} questions to crucible_questions...`);
  
  for (const q of QUESTIONS) {
    try {
      await db.collection('crucible_questions').add({
        topic: q.topic,
        difficulty: q.difficulty,
        question: q.question,
        options: q.options,
        answer: q.answer,
        created_at: admin.firestore.FieldValue.serverTimestamp()
      });
      console.log(`Added: ${q.question.substring(0, 30)}...`);
    } catch (e) {
      console.error('Failed to add question', e);
    }
  }
  
  console.log('Seeding complete!');
  process.exit(0);
}

seed();
