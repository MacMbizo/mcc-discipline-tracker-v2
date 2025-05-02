import { initializeApp } from 'firebase/app';
import { getFirestore, collection, setDoc, doc } from 'firebase/firestore';
import { firebaseConfig } from '../services/firebaseConfig';

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const meritTypes = [
  { id: 'bronze', name: 'Bronze', description: 'Bronze tier merit', points: 1 },
  { id: 'silver', name: 'Silver', description: 'Silver tier merit', points: 2 },
  { id: 'gold', name: 'Gold', description: 'Gold tier merit', points: 3 },
];

async function seedMeritTypes() {
  for (const merit of meritTypes) {
    await setDoc(doc(collection(db, 'merit_types'), merit.id), merit);
    console.log(`Seeded merit type: ${merit.name}`);
  }
  console.log('All merit types seeded.');
}

seedMeritTypes().catch(console.error);
