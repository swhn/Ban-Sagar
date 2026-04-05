/**
 * Migration script: Firebase Firestore → Supabase
 *
 * Usage:
 *   1. Sign in to your app first (so your Supabase user exists)
 *   2. Run: node migrate-firebase-to-supabase.mjs
 *
 * This script:
 *   - Reads all slangs from your old Firebase Firestore
 *   - Transforms field names (camelCase → snake_case)
 *   - Inserts them into Supabase, assigned to your admin user
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import { createClient } from '@supabase/supabase-js';

// ============================================================
// CONFIG - Your old Firebase credentials
// ============================================================
const firebaseConfig = {
  apiKey: "AIzaSyDfYhIgovHxftUpxVJ_IRxmxq8eClJ-mOI",
  authDomain: "gen-lang-client-0177249198.firebaseapp.com",
  projectId: "gen-lang-client-0177249198",
  storageBucket: "gen-lang-client-0177249198.firebasestorage.app",
  messagingSenderId: "759022881954",
  appId: "1:759022881954:web:4b3b80ce97826397e85bfb",
};
const firestoreDatabaseId = "ai-studio-b0bcbae3-738c-4444-b7bc-1295234a9433";

// ============================================================
// CONFIG - Your Supabase credentials
// ============================================================
const SUPABASE_URL = "https://icgmufpefnugpecixyrl.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImljZ211ZnBlZm51Z3BlY2l4eXJsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUzMzIyOTgsImV4cCI6MjA5MDkwODI5OH0.o_HRy2idFFEvCApr7WG-AwdUg9i6-JghK2Nji7VYpz0";

// ============================================================
// MAIN
// ============================================================

const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp, firestoreDatabaseId);
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function migrate() {
  // Step 1: Find the admin user in Supabase to assign slangs to
  const { data: adminUser, error: userError } = await supabase
    .from('users')
    .select('id, display_name')
    .eq('role', 'admin')
    .limit(1)
    .single();

  if (userError || !adminUser) {
    console.error('❌ No admin user found in Supabase.');
    console.error('   Sign in to your app first, then re-run this script.');
    console.error('   Error:', userError?.message);
    process.exit(1);
  }

  console.log(`✓ Found admin user: ${adminUser.display_name} (${adminUser.id})`);

  // Step 2: Read all slangs from Firebase
  console.log('\nReading slangs from Firebase...');
  const snapshot = await getDocs(collection(db, 'slangs'));

  if (snapshot.empty) {
    console.log('No slangs found in Firebase.');
    process.exit(0);
  }

  console.log(`✓ Found ${snapshot.size} slangs in Firebase`);

  // Step 3: Check what already exists in Supabase
  const { data: existing } = await supabase.from('slangs').select('word');
  const existingWords = new Set((existing || []).map(s => s.word.toLowerCase().trim()));

  // Step 4: Transform and filter
  const slangsToMigrate = [];

  snapshot.forEach((doc) => {
    const d = doc.data();

    // Skip if already exists in Supabase
    if (existingWords.has(d.word?.toLowerCase().trim())) {
      return;
    }

    // Transform Firebase camelCase → Supabase snake_case
    slangsToMigrate.push({
      word: d.word,
      pronunciation: d.pronunciation || null,
      meaning: d.meaning,
      meaning_burmese: d.meaningBurmese || null,
      examples: d.examples || [],
      author_id: adminUser.id,
      author_name: d.authorName || adminUser.display_name || 'Migrated',
      status: d.status || 'approved',
      upvotes: d.upvotes || 0,
      downvotes: d.downvotes || 0,
      views: d.views || 0,
      view_history: d.viewHistory || {},
    });
  });

  if (slangsToMigrate.length === 0) {
    console.log('\n✓ All Firebase slangs already exist in Supabase. Nothing to migrate.');
    process.exit(0);
  }

  console.log(`\n→ Migrating ${slangsToMigrate.length} new slangs (skipping ${snapshot.size - slangsToMigrate.length} duplicates)...`);

  // Step 5: Insert into Supabase in batches of 50
  const BATCH_SIZE = 50;
  let inserted = 0;

  for (let i = 0; i < slangsToMigrate.length; i += BATCH_SIZE) {
    const batch = slangsToMigrate.slice(i, i + BATCH_SIZE);
    const { error } = await supabase.from('slangs').insert(batch);

    if (error) {
      console.error(`❌ Error inserting batch ${i / BATCH_SIZE + 1}:`, error.message);
      console.error('   Failed row sample:', JSON.stringify(batch[0], null, 2));
    } else {
      inserted += batch.length;
      console.log(`  ✓ Inserted ${inserted}/${slangsToMigrate.length}`);
    }
  }

  console.log(`\n✅ Migration complete! ${inserted} slangs migrated to Supabase.`);
}

migrate().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
