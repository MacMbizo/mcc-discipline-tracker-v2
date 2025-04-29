// Firestore seeding script for Teachers and Students collections
// Run with: npx ts-node scripts/seed_firestore2.ts

const fs = require('fs');
const path = require('path');
const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

// Load the service account key using fs and path for maximum compatibility
const serviceAccount = JSON.parse(
  fs.readFileSync(path.join(__dirname, '..', 'serviceAccountKey.json'), 'utf8')
);

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

async function main() {
  await seedTeachers();
  await seedStudents();
  console.log('Seeding complete!');
}

main().catch(console.error);
