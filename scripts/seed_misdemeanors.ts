// Firestore seeding script for misdemeanors from sanctions_structured.json
// Run with: npx tsc --project scripts/tsconfig.scripts.json && node dist/seed_misdemeanors.js

import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { readFile } from 'fs/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
  // Adjust the path to your service account key as needed
  const serviceAccountPath = path.join(__dirname, '..', 'serviceAccountKey.json');
  const serviceAccount = JSON.parse(await readFile(serviceAccountPath, 'utf8'));

  initializeApp({
    credential: cert(serviceAccount),
  });

  const db = getFirestore();

  // Read and parse sanctions_structured.json
  const sanctionsJsonPath = path.join(__dirname, '..', 'sanctions_structured.json');
  const sanctionsData = JSON.parse(await readFile(sanctionsJsonPath, 'utf8'));
  const misdemeanors = sanctionsData.misdemeanors;

  if (!Array.isArray(misdemeanors)) {
    throw new Error('No misdemeanors array found in sanctions_structured.json');
  }

  for (const misdemeanor of misdemeanors) {
    if (!misdemeanor.id) {
      console.warn('Skipping misdemeanor with missing id:', misdemeanor);
      continue;
    }
    await db.collection('misdemeanors').doc(String(misdemeanor.id)).set(misdemeanor, { merge: true });
    console.log(`Seeded misdemeanor: ${misdemeanor.name} (ID: ${misdemeanor.id})`);
  }

  console.log('Misdemeanor seeding complete!');
}

main().catch(console.error);

// END OF SCRIPT
