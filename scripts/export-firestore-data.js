/**
 * Firestore Data Export Script
 * 
 * Exports appointments, modifications, and user data from Firestore to JSON files.
 * Run this BEFORE migrating to backend to preserve all data.
 * 
 * Usage:
 *   node scripts/export-firestore-data.js
 * 
 * Output:
 *   firestore-backup/appointments.json
 *   firestore-backup/modifications.json
 *   firestore-backup/users.json
 */

const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// Initialize Firebase Admin with your service account
// Download from Firebase Console -> Project Settings -> Service Accounts
const serviceAccount = require('../firebase-service-account.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function exportCollection(collectionName) {
  console.log(`\n[EXPORT] ${collectionName}...`);
  const snapshot = await db.collection(collectionName).get();
  const data = [];
  
  snapshot.forEach(doc => {
    const docData = doc.data();
    // Convert Firestore Timestamps to ISO strings
    const converted = {};
    for (const [key, value] of Object.entries(docData)) {
      if (value && typeof value.toDate === 'function') {
        converted[key] = value.toDate().toISOString();
      } else {
        converted[key] = value;
      }
    }
    data.push({
      id: doc.id,
      ...converted
    });
  });
  
  console.log(`  ✅ Exported ${data.length} documents`);
  return data;
}

async function main() {
  console.log('🔥 Firebase Data Export Tool');
  console.log('============================\n');
  
  // Create backup directory
  const backupDir = path.join(__dirname, '..', 'firestore-backup');
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }
  
  try {
    // Export appointments
    const appointments = await exportCollection('appointments');
    fs.writeFileSync(
      path.join(backupDir, 'appointments.json'),
      JSON.stringify(appointments, null, 2)
    );
    
    // Export modifications
    const modifications = await exportCollection('modifications');
    fs.writeFileSync(
      path.join(backupDir, 'modifications.json'),
      JSON.stringify(modifications, null, 2)
    );
    
    // Export users (profile mirrors)
    const users = await exportCollection('users');
    fs.writeFileSync(
      path.join(backupDir, 'users.json'),
      JSON.stringify(users, null, 2)
    );
    
    console.log('\n✅ Export complete!');
    console.log(`📁 Data saved to: ${backupDir}`);
    console.log('\nNext steps:');
    console.log('1. Review exported JSON files');
    console.log('2. Run migration script to import to PostgreSQL');
    console.log('3. Test backend APIs');
    console.log('4. Update frontend to use backend');
    
  } catch (error) {
    console.error('❌ Export failed:', error);
    process.exit(1);
  }
  
  process.exit(0);
}

main();
