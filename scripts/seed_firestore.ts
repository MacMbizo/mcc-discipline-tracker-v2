// Firestore seeding script for Teachers and Students collections
// Run with: npx ts-node scripts/seed_firestore.ts

import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { readFile } from 'fs/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
  const serviceAccountPath = path.join(__dirname, '..', 'serviceAccountKey.json');
  const serviceAccount = JSON.parse(await readFile(serviceAccountPath, 'utf8'));

  initializeApp({
    credential: cert(serviceAccount),
  });

  const db = getFirestore();

  async function seedTeachers() {
    const teachers = [
      {
        uid: 'teacher1',
        displayName: 'Josh Mbizo',
        email: 'josh.mbizo@mcc.ac.zw',
        role: 'teacher',
        subjects: ['Mathematics', 'Science'],
      },
      {
        uid: 'teacher2',
        displayName: 'Sarah Dube',
        email: 'sarah.dube@mcc.ac.zw',
        role: 'teacher',
        subjects: ['English', 'History'],
      },
      // Add more teachers as needed
    ];
    for (const teacher of teachers) {
      await db.collection('users').doc(teacher.uid).set(teacher);
      console.log(`Seeded teacher: ${teacher.displayName}`);
    }
  }

  async function seedStudents() {
    const students = [
      {
        uid: 'student1',
        name: 'Tariro Moyo',
        class: 'Form 2B',
        studentId: 'MCC2025001',
      },
      {
        uid: 'student2',
        name: 'Blessing Ncube',
        class: 'Form 3A',
        studentId: 'MCC2025002',
      },
      // Add more students as needed
    ];
    for (const student of students) {
      await db.collection('students').doc(student.uid).set(student);
      console.log(`Seeded student: ${student.name}`);
    }
  }

  await seedTeachers();
  await seedStudents();
  console.log('Seeding complete!');
}

main().catch(console.error);

// END OF SCRIPT