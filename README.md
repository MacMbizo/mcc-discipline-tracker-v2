# Midlands Christian College Discipline Tracker App (mcc-app-v3)

[![GitHub Workflow Status](https://img.shields.io/github/actions/workflow/status/MacMbizo/mcc-discipline-tracker-v2/main.yml?branch=master)](https://github.com/MacMbizo/mcc-discipline-tracker-v2/actions)
[![GitHub last commit](https://img.shields.io/github/last-commit/MacMbizo/mcc-discipline-tracker-v2)](https://github.com/MacMbizo/mcc-discipline-tracker-v2/commits/master)
[![GitHub issues](https://img.shields.io/github/issues/MacMbizo/mcc-discipline-tracker-v2)](https://github.com/MacMbizo/mcc-discipline-tracker-v2/issues)
[![MIT License](https://img.shields.io/github/license/MacMbizo/mcc-discipline-tracker-v2)](LICENSE)

A full-stack Expo React Native app for tracking discipline (sanctions) and merits at Midlands Christian College. Built with Firebase, Firestore, Cloud Functions, and React Native Paper.

## Getting Started

```bash
npm install
npm start
```

## Features
- Expo managed workflow (TypeScript)
- Firebase Auth, Firestore, Cloud Functions
- React Navigation & React Native Paper
- Role-based dashboards for Teachers, Admins, Students, Parents
- Heat Bar, analytics, notifications, and more

## Firestore Seeding (Sample Data)

To seed Firestore with sample Teachers and Students data for development/testing:

1. **Ensure you have a valid service account key** at the project root or update the path in `scripts/seed_firestore.ts`.
2. **TypeScript config must be at the project root** (`tsconfig.json`) and set:
   ```json
   {
     "compilerOptions": {
       "strict": true,
       "target": "es2020",
       "resolveJsonModule": true,
       "esModuleInterop": true,
       "module": "nodenext",
       "moduleResolution": "nodenext",
       "allowSyntheticDefaultImports": true,
       "jsx": "react-native"
     }
   }
   ```
3. **Run the seeding script:**
   ```bash
   # Compile the script
   npx tsc scripts/seed_firestore.ts --outDir dist --module nodenext
   # Run the output
   node dist/scripts/seed_firestore.js
   # (Or, if output is at root: node dist/seed_firestore.js)
   ```
4. **No duplicate code:** The script must contain only one set of imports, variables, and functions. All logic should be inside an async main() function.
5. **Troubleshooting:**
   - If you see `import.meta` or ESM errors, ensure the TypeScript config is at the project root and not overridden by Expo or other base configs.
   - If you see path or import errors, use `import * as path from 'path'` for best compatibility.
   - If your repo structure changes, ensure your scripts and configs are inside the git repo for version control.

### Seeding Misdemeanors from sanctions_structured.json

To seed the Firestore `misdemeanors` collection with structured misdemeanors and their sanctions:

1. **Place or update `sanctions_structured.json` at the project root.**
2. **Run the misdemeanor seeding script:**
   ```bash
   # From the project root (c:\A6\app)
   npx tsc --project scripts/tsconfig.scripts.json
   node dist/seed_misdemeanors.js
   ```
   - This will upsert all misdemeanors (with sanctions mapping) into Firestore, keyed by their `id`.
   - The script is idempotent and safe to run multiple times.
3. **Script location:**
   - All seeding scripts are in `scripts/` inside the app directory and tracked by git.
   - ESM compatibility is managed via a dedicated `tsconfig.scripts.json` in the same folder.

**Lessons learned:**
- Keep all scripts and configs inside your version-controlled app directory for maintainability.
- Use a dedicated TypeScript config for scripts that need Node.js ESM features.
- Always check your paths and output locations when compiling and running scripts.

## Project Structure
See `project_structure.md` for full details.

## Contributing
Pull requests welcome! Please open issues for feature requests or bugs.

## License
MIT
