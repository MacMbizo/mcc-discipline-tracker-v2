import { initializeApp, cert, ServiceAccount } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// TODO: Replace with your own service account credentials or import from a secure location
const serviceAccount = require('./serviceAccountKey.json') as ServiceAccount;

initializeApp({
  credential: cert(serviceAccount),
});

const db = getFirestore();

async function migrateCollection(source: string, role: string) {
  const snapshot = await db.collection(source).get();
  for (const doc of snapshot.docs) {
    const data = doc.data();
    await db.collection('users').doc(doc.id).set({
      ...data,
      role: data.role || role,
    }, { merge: true });
    console.log(`Migrated ${source}/${doc.id} to users/ with role: ${data.role || role}`);
  }
}

async function main() {
  await migrateCollection('teachers', 'teacher');
  await migrateCollection('students', 'student');
  // Optionally add: await migrateCollection('admins', 'admin');
  console.log('Migration complete!');
}

main().catch(console.error);
