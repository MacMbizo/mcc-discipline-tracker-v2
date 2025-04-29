"use strict";
// Firestore seeding script for Teachers and Students collections
// Run with: npx ts-node scripts/seed_firestore.ts
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = require("firebase-admin/app");
const firestore_1 = require("firebase-admin/firestore");
const path = __importStar(require("path"));
const url_1 = require("url");
const promises_1 = require("fs/promises");
const __filename = (0, url_1.fileURLToPath)(import.meta.url);
const __dirname = path.dirname(__filename);
async function main() {
    const serviceAccountPath = path.join(__dirname, '..', 'serviceAccountKey.json');
    const serviceAccount = JSON.parse(await (0, promises_1.readFile)(serviceAccountPath, 'utf8'));
    (0, app_1.initializeApp)({
        credential: (0, app_1.cert)(serviceAccount),
    });
    const db = (0, firestore_1.getFirestore)();
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
