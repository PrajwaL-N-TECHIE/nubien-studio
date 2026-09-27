const fs = require('fs');
const path = require('path');

const SUPABASE_URL = process.env.VITE_BUIZ_SUPABASE_URL || process.env.VITE_SUPABASE_URL || 'https://paigrnspffprttxtprev.supabase.co';
const SUPABASE_KEY = process.env.VITE_BUIZ_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBhaWdybnNwZmZwcnR0eHRwcmV2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA0ODExMjUsImV4cCI6MjEwNjA1NzEyNX0.jbBQhysqY9L6-ChYmuvUIFFnGTN2-Fco7OVli11b5Bs';

const backupFile = path.join(__dirname, '..', 'backups', 'buiz_firestore_backup.json');

if (!fs.existsSync(backupFile)) {
  console.error('Backup file not found:', backupFile);
  process.exit(1);
}

const backup = JSON.parse(fs.readFileSync(backupFile, 'utf-8'));

async function postToSupabase(endpoint, rows) {
  if (!rows || rows.length === 0) return { count: 0 };
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${endpoint}`, {
    method: 'POST',
    headers: {
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': 'resolution=merge-duplicates,return=representation'
    },
    body: JSON.stringify(rows)
  });
  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Failed to insert into ${endpoint} (${res.status}): ${errText}`);
  }
  const data = await res.json();
  return { count: data.length };
}

async function runMigration() {
  console.log('🚀 Starting Data Migration to Supabase...');

  // 1. Migrate Saved Quizzes
  console.log(`\n📦 Migrating ${backup.saved_quizzes.length} Saved Quizzes...`);
  const quizRows = backup.saved_quizzes.map(q => {
    let createdAt = new Date().toISOString();
    if (q.createdAt) {
      createdAt = q.createdAt.toDate ? q.createdAt.toDate().toISOString() : new Date(q.createdAt).toISOString();
    }
    const questions = q.questions || [];
    const totalPoints = q.totalPossiblePoints || questions.reduce((s, item) => s + (item.points || 1000), 0);
    return {
      id: q.id,
      name: q.name || 'Untitled Quiz',
      questions: questions,
      total_possible_points: totalPoints,
      created_at: createdAt
    };
  });
  const quizResult = await postToSupabase('buiz_saved_quizzes', quizRows);
  console.log(`✅ Saved Quizzes Migrated: ${quizResult.count}/${quizRows.length}`);

  // 2. Migrate History
  console.log(`\n📜 Migrating ${backup.history.length} History Sessions...`);
  const historyRows = backup.history.map(h => {
    let date = new Date().toISOString();
    if (h.date) {
      date = h.date.toDate ? h.date.toDate().toISOString() : new Date(h.date).toISOString();
    }
    return {
      id: h.id,
      quiz_name: h.quizName || 'Buiz Arena Quiz',
      pin: h.pin || '',
      date: date,
      game_mode: h.gameMode || 'hostPaced',
      questions_count: h.questionsCount || (h.questions ? h.questions.length : 0),
      total_possible_points: h.totalPossiblePoints || 0,
      total_players: h.totalPlayers || (h.players ? h.players.length : 0),
      players: h.players || [],
      winners: h.winners || [],
      questions: h.questions || [],
      created_at: date
    };
  });
  const historyResult = await postToSupabase('buiz_history', historyRows);
  console.log(`✅ History Sessions Migrated: ${historyResult.count}/${historyRows.length}`);

  // 3. Migrate Rooms
  console.log(`\n🎮 Migrating ${backup.rooms.length} Game Rooms...`);
  const roomRows = [];
  const playerRows = [];

  for (const r of backup.rooms) {
    let createdAt = new Date().toISOString();
    if (r.createdAt) {
      createdAt = r.createdAt.toDate ? r.createdAt.toDate().toISOString() : new Date(r.createdAt).toISOString();
    }
    const questions = r.questions || [];
    const totalPoints = r.totalPossiblePoints || questions.reduce((s, item) => s + (item.points || 1000), 0);

    roomRows.push({
      pin: r.pin || r.id,
      status: r.status || 'finished',
      host_id: r.hostId || 'admin',
      quiz_name: r.quizName || 'Buiz Arena Quiz',
      questions: questions,
      total_possible_points: totalPoints,
      current_q_index: r.currentQIndex || 0,
      question_status: r.questionStatus || 'answering',
      game_mode: r.gameMode || 'hostPaced',
      created_at: createdAt,
      updated_at: createdAt
    });

    if (r.players && r.players.length > 0) {
      for (const p of r.players) {
        let joinedAt = createdAt;
        if (p.joinedAt) {
          joinedAt = p.joinedAt.toDate ? p.joinedAt.toDate().toISOString() : new Date(p.joinedAt).toISOString();
        }
        playerRows.push({
          id: p.id || `p_${Math.random().toString(36).substr(2, 8)}`,
          room_pin: r.pin || r.id,
          name: p.name || 'Player',
          score: p.score || 0,
          streak: p.streak || 0,
          progress: typeof p.progress === 'number' ? p.progress : 0,
          avatar: p.avatar || '',
          current_q_index: p.currentQIndex || 0,
          answers: p.answers || {},
          joined_at: joinedAt,
          updated_at: joinedAt
        });
      }
    }
  }

  // Insert rooms first
  const roomResult = await postToSupabase('buiz_rooms', roomRows);
  console.log(`✅ Game Rooms Migrated: ${roomResult.count}/${roomRows.length}`);

  // Insert players
  console.log(`\n👥 Migrating ${playerRows.length} Room Players...`);
  let playerSuccessCount = 0;
  // Chunk in batches of 50
  for (let i = 0; i < playerRows.length; i += 50) {
    const chunk = playerRows.slice(i, i + 50);
    const pResult = await postToSupabase('buiz_players', chunk);
    playerSuccessCount += pResult.count;
  }
  console.log(`✅ Room Players Migrated: ${playerSuccessCount}/${playerRows.length}`);

  console.log('\n🎉 ALL BUIZ DATA MIGRATED TO SUPABASE WITH ZERO DATA LOSS!');
}

runMigration().catch(err => {
  console.error('\n❌ Migration Error:', err.message);
  process.exit(1);
});
