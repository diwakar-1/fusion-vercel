/**
 * FUSION Local Real-Time Backend Server (Node.js)
 * Exclusive private study engine for Diwakar & Ayush.
 * Runs on port 8000 with real-time JSON file persistence in data/db.json.
 */

import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 8000;
const DB_FILE = path.join(__dirname, 'data', 'db.json');

// Ensure data directory exists
if (!fs.existsSync(path.join(__dirname, 'data'))) {
  fs.mkdirSync(path.join(__dirname, 'data'), { recursive: true });
}

// Initial Database State
const INITIAL_DB = {
  users: [
    {
      id: 'u_diwakar',
      username: 'diwakar',
      full_name: 'Diwakar',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
      streak: 0,
      xp: 100,
      level: 1,
      strikes: 0,
      isPunished: false,
      entryCode: 'FUSION-DIWAKAR-2026',
      shortCode: 'D2026',
      currentlyWatching: null
    },
    {
      id: 'u_ayush',
      username: 'ayush',
      full_name: 'Ayush',
      avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150',
      streak: 0,
      xp: 100,
      level: 1,
      strikes: 0,
      isPunished: false,
      entryCode: 'FUSION-AYUSH-2026',
      shortCode: 'A2026',
      currentlyWatching: null
    }
  ],
  studySessions: [],
  dsaSessions: [],
  partnerChat: [],
  youtubeApiKey: '',
  notes: [
    {
      id: 'n_1',
      title: 'Kahn\'s Algorithm & Topological Sort',
      content: '1. Compute in-degree of all vertices.\n2. Push all nodes with in-degree 0 into queue.\n3. While queue not empty, pop u, add to result, decrement in-degree of neighbours.\n4. If neighbour in-degree becomes 0, push to queue.',
      tags: ['DSA', 'Graph Theory'],
      createdAt: 'Today'
    },
    {
      id: 'n_2',
      title: 'Multi-Head Self-Attention Derivation',
      content: 'Attention(Q, K, V) = softmax((Q*K^T) / sqrt(d_k)) * V.\nMultiHead(Q,K,V) = Concat(head_1, ..., head_h) * W^O where head_i = Attention(Q*W_i^Q, K*W_i^K, V*W_i^V).',
      tags: ['ML', 'Transformers'],
      createdAt: 'Today'
    }
  ],
  pdfQuestionSheets: [
    {
      id: 'sheet_1',
      title: 'Top 75 LeetCode Blind Sheet',
      subject: 'DSA',
      totalCount: 10,
      completedCount: 0,
      questions: [
        { id: 'q1', title: 'Two Sum', platform: 'LeetCode', completed: false },
        { id: 'q2', title: 'Best Time to Buy and Sell Stock', platform: 'LeetCode', completed: false },
        { id: 'q3', title: 'Contains Duplicate', platform: 'LeetCode', completed: false },
        { id: 'q4', title: 'Product of Array Except Self', platform: 'LeetCode', completed: false },
        { id: 'q5', title: 'Maximum Subarray (Kadane\'s)', platform: 'LeetCode', completed: false },
        { id: 'q6', title: '3Sum', platform: 'LeetCode', completed: false },
        { id: 'q7', title: 'Container With Most Water', platform: 'LeetCode', completed: false },
        { id: 'q8', title: 'Trapping Rain Water', platform: 'LeetCode', completed: false },
        { id: 'q9', title: 'Reverse Linked List', platform: 'LeetCode', completed: false },
        { id: 'q10', title: 'Merge Two Sorted Lists', platform: 'LeetCode', completed: false }
      ]
    }
  ],
  dailyTasks: [
    { id: 'dt_1', title: 'Solve 2 Medium problems on LeetCode / Codeforces', platform: 'LeetCode', exp: 100, completed: false, isCoreStreakTask: true },
    { id: 'dt_2', title: 'Complete 2 Hours DSA Deep Focus Session', platform: 'Focus Timer', exp: 100, completed: false, isCoreStreakTask: true },
    { id: 'dt_3', title: 'Watch 1 Module from ML Course Playlist', platform: 'Courses Hub', exp: 100, completed: false, isCoreStreakTask: true },
    { id: 'dt_4', title: 'Review 1 Spaced Repetition Revision Note', platform: 'Notes', exp: 50, completed: false, isCoreStreakTask: false }
  ],
  courses: [
    {
      id: 'c_dsa_java',
      title: 'Introduction to Java Programming & Placement Course',
      subject: 'DSA',
      youtubeUrl: 'https://www.youtube.com/watch?v=yRpLlJmRo2w',
      embedUrl: 'https://www.youtube-nocookie.com/embed/yRpLlJmRo2w?autoplay=0&rel=0&enablejsapi=1',
      addedBy: 'Diwakar',
      currentLesson: 'Introduction to Java Language | Lecture 1 | Complete Placement Course',
      totalLessons: '10 lectures',
      lectures: [
        { id: 'lec_j1', title: 'Introduction to Java Language | Lecture 1 | Complete Placement Course', duration: '28:30', videoId: 'yRpLlJmRo2w', completed: true },
        { id: 'lec_j2', title: 'Variables, Data Types & Input Output in Java | Lecture 2', duration: '34:15', videoId: 'lusA-6vXQjg', completed: true },
        { id: 'lec_j3', title: 'Conditional Statements (If-Else & Switch) | Lecture 3', duration: '41:20', videoId: '0bI92x6G9hE', completed: false },
        { id: 'lec_j4', title: 'Loops in Java (For, While, Do-While) with Flowcharts | Lecture 4', duration: '38:50', videoId: 'vvanI8NRlSI', completed: false },
        { id: 'lec_j5', title: 'Patterns in Java (Part 1 - Nested Loops) | Lecture 5', duration: '45:10', videoId: 'BSVKUk58Kwg', completed: false },
        { id: 'lec_j6', title: 'Functions & Methods in Java | Call by Value | Lecture 6', duration: '32:40', videoId: '4A1a7l2w1Zc', completed: false },
        { id: 'lec_j7', title: 'Time & Space Complexity Basics (Big-O Notation) | Lecture 7', duration: '50:15', videoId: 'n-v_8uNgt0s', completed: false },
        { id: 'lec_j8', title: 'Arrays in Java (Creation, Memory Allocation, Linear Search) | Lecture 8', duration: '48:30', videoId: 'rzA7UJ-hQn4', completed: false },
        { id: 'lec_j9', title: 'Binary Search Algorithm in Arrays | Lecture 9', duration: '36:45', videoId: '1XAfapoKL-4', completed: false },
        { id: 'lec_j10', title: 'Sorting Algorithms (Bubble, Selection, Insertion Sort) | Lecture 10', duration: '55:20', videoId: 'r_MbozD32eo', completed: false }
      ]
    },
    {
      id: 'c_ml_karpathy',
      title: 'Andrej Karpathy - Neural Networks: Zero to Hero',
      subject: 'Machine Learning',
      youtubeUrl: 'https://www.youtube.com/watch?v=VMj-3S1tku0',
      embedUrl: 'https://www.youtube-nocookie.com/embed/VMj-3S1tku0?autoplay=0&rel=0&enablejsapi=1',
      addedBy: 'FUSE Curated',
      currentLesson: 'The spelled-out intro to neural networks and backpropagation: building micrograd',
      totalLessons: '7 masterclasses',
      lectures: [
        { id: 'k_1', title: 'The spelled-out intro to neural networks and backpropagation: building micrograd', duration: '2:25:34', videoId: 'VMj-3S1tku0', completed: true, phase: 'Phase 1: ML Foundations' },
        { id: 'k_2', title: 'The spelled-out intro to language modeling: building makemore (Part 1)', duration: '1:57:12', videoId: 'PaCmpygFfXo', completed: true, phase: 'Phase 2: Autoregressive LM' },
        { id: 'k_3', title: 'Building makemore Part 2: MLP (Multi-Layer Perceptron)', duration: '1:15:42', videoId: 'TCH_1BHYA8I', completed: false, phase: 'Phase 2: Autoregressive LM' },
        { id: 'k_4', title: 'Building makemore Part 3: Activations & Gradients, BatchNorm', duration: '1:44:20', videoId: 'P6sfmUTpUmc', completed: false, phase: 'Phase 3: Deep Optimization' },
        { id: 'k_5', title: 'Building makemore Part 4: Becoming a Backprop Ninja', duration: '1:56:49', videoId: 'q8SA3rM6ckI', completed: false, phase: 'Phase 3: Deep Optimization' },
        { id: 'k_6', title: 'Building makemore Part 5: Building a WaveNet', duration: '1:21:05', videoId: 't3YJ5hKiMQ0', completed: false, phase: 'Phase 4: Transformer GPT' },
        { id: 'k_7', title: 'Let\'s build GPT: from scratch, in code, spelled out', duration: '1:56:22', videoId: 'kCc8FmEb1nY', completed: false, phase: 'Phase 4: Transformer GPT' }
      ]
    },
    {
      id: 'c_dsa_striver',
      title: 'Striver A2Z DSA Sheet - Complete Placement Series',
      subject: 'DSA',
      youtubeUrl: 'https://www.youtube.com/watch?v=EAR7De6G0ms',
      embedUrl: 'https://www.youtube-nocookie.com/embed/EAR7De6G0ms?autoplay=0&rel=0&enablejsapi=1',
      addedBy: 'Ayush',
      currentLesson: 'Step 1.1: Learn the Basics of Programming Language & Syntax',
      totalLessons: '6 core steps',
      lectures: [
        { id: 's_1', title: 'Step 1.1: User Input/Output, Data Types, If-Else Statements', duration: '32:15', videoId: 'EAR7De6G0ms', completed: true },
        { id: 's_2', title: 'Step 1.2: Build-up Logical Thinking (Patterns)', duration: '45:00', videoId: 'tNm_NQDsmEI', completed: true },
        { id: 's_3', title: 'Step 1.3: C++ STL / Java Collections Overview', duration: '58:40', videoId: 'RRVYpIET_RU', completed: false },
        { id: 's_4', title: 'Step 1.4: Know Basic Maths (Count Digits, Reverse Number, GCD)', duration: '42:10', videoId: '1xNbjMdbjug', completed: false },
        { id: 's_5', title: 'Step 1.5: Learn Basic Recursion (Backtracking intuition)', duration: '51:25', videoId: 'yVdKa8dnKiE', completed: false },
        { id: 's_6', title: 'Step 1.6: Learn Basic Hashing (Frequency counting, Maps)', duration: '39:10', videoId: 'KEs5UyBJ39g', completed: false }
      ]
    }
  ]
};

function loadDb() {
  if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify(INITIAL_DB, null, 2));
    return INITIAL_DB;
  }
  try {
    const data = JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'));
    const merged = { ...INITIAL_DB, ...data };
    for (const key of Object.keys(INITIAL_DB)) {
      if (!merged[key] || (Array.isArray(INITIAL_DB[key]) && !Array.isArray(merged[key]))) {
        merged[key] = INITIAL_DB[key];
      }
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(merged, null, 2));
    return merged;
  } catch {
    fs.writeFileSync(DB_FILE, JSON.stringify(INITIAL_DB, null, 2));
    return INITIAL_DB;
  }
}

function saveDb(data) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

let db = loadDb();

const server = http.createServer(async (req, res) => {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const url = new URL(req.url, `http://${req.headers.host}`);
  const pathname = url.pathname;

  const readBody = () =>
    new Promise((resolve) => {
      let body = '';
      req.on('data', chunk => (body += chunk));
      req.on('end', () => {
        try {
          resolve(body ? JSON.parse(body) : {});
        } catch {
          resolve({});
        }
      });
    });

  // Health
  if (pathname === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok', service: 'FUSION API' }));
    return;
  }

  // Real-Time Cloud & Local State Sync Endpoint
  if (pathname === '/api/sync') {
    const userParam = (url.searchParams.get('user') || 'diwakar').toLowerCase();
    const targetKey = userParam.includes('ayush') ? 'ayush' : 'diwakar';
    const partnerKey = targetKey === 'diwakar' ? 'ayush' : 'diwakar';

    if (req.method === 'POST') {
      const body = await readBody();
      const { user, payload, timestamp } = body || {};
      const key = (user || targetKey).toLowerCase().includes('ayush') ? 'ayush' : 'diwakar';
      const now = timestamp || Date.now();

      if (payload) {
        if (!db.syncStore) db.syncStore = {};
        db.syncStore[key] = {
          ...payload,
          user: key,
          lastUpdated: now
        };
        saveDb(db);
      }

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true, user: key, lastUpdated: now }));
      return;
    }

    if (req.method === 'GET') {
      const since = parseInt(url.searchParams.get('since') || '0', 10);
      if (!db.syncStore) db.syncStore = {};
      const userData = db.syncStore[targetKey] || null;
      const partnerData = db.syncStore[partnerKey] || null;

      const userLastUpdated = userData?.lastUpdated || Date.now();
      const partnerLastUpdated = partnerData?.lastUpdated || Date.now();

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success: true,
        user: targetKey,
        lastUpdated: userLastUpdated,
        data: userData,
        hasNewData: userLastUpdated > since,
        partner: {
          user: partnerKey,
          lastUpdated: partnerLastUpdated,
          data: partnerData
        }
      }));
      return;
    }
  }

  // 1. Auth: Verify Entry Code
  if (pathname === '/api/v1/auth/verify-code' && req.method === 'POST') {
    const { user, code } = await readBody();
    const targetUser = db.users.find(u => u.full_name.toLowerCase() === (user || '').toLowerCase());
    if (!targetUser) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'User not found. Choose Diwakar or Ayush.' }));
      return;
    }
    const cleanCode = (code || '').trim().toUpperCase();
    const validEntryCode = (targetUser.entryCode || (targetUser.full_name.toLowerCase() === 'diwakar' ? 'FUSION-DIWAKAR-2026' : 'FUSION-AYUSH-2026')).toUpperCase();
    const validShortCode = (targetUser.shortCode || (targetUser.full_name.toLowerCase() === 'diwakar' ? 'D2026' : 'A2026')).toUpperCase();

    if (cleanCode === validEntryCode || cleanCode === validShortCode) {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success: true,
        user: targetUser,
        token: `fusion_token_${targetUser.username}_${Date.now()}`
      }));
      return;
    }
    res.writeHead(401, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Invalid Entry Code. Only Diwakar & Ayush have access.' }));
    return;
  }

  // 2. Auth: Update Profile (Custom PFP)
  if (pathname === '/api/v1/auth/profile' && req.method === 'PUT') {
    const body = await readBody();
    const user = db.users.find(u => u.full_name.toLowerCase() === (body.userName || '').toLowerCase());
    if (user) {
      if (body.avatar) user.avatar = body.avatar;
      saveDb(db);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true, user }));
      return;
    }
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'User not found' }));
    return;
  }

  // Real-Time Database State Synchronization
  if (pathname === '/api/v1/sync' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      success: true,
      users: db.users,
      studySessions: db.studySessions || [],
      dsaSessions: db.dsaSessions || [],
      courses: db.courses || [],
      notes: db.notes || [],
      pdfQuestionSheets: db.pdfQuestionSheets || [],
      dailyTasks: db.dailyTasks || [],
      partnerChat: db.partnerChat || [],
      youtubeApiKey: db.youtubeApiKey || ''
    }));
    return;
  }

  // Task Punishment & Catastrophic Progress Deletion
  if (pathname === '/api/v1/auth/punish-reset' && req.method === 'POST') {
    const body = await readBody();
    const targetName = (body.userName || body.username || '').toLowerCase();
    const user = db.users.find(u => u.full_name.toLowerCase() === targetName || u.username.toLowerCase() === targetName);
    if (user) {
      if (body.isCatastrophicReset) {
        user.xp = 0;
        user.streak = 0;
        user.level = 1;
        user.strikes = (user.strikes || 0) + 1;
        user.isPunished = true;
        user.punishmentReason = body.reason || 'Failed daily core tasks and XP fell below 100';
        user.lastPunishedDate = new Date().toISOString();
      } else if (body.penaltyXp) {
        user.xp = Math.max(0, (user.xp || 0) - body.penaltyXp);
      }
      saveDb(db);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true, user }));
      return;
    }
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'User not found' }));
    return;
  }

  // YouTube API Key Sync
  if (pathname === '/api/v1/youtube/key') {
    if (req.method === 'GET') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ apiKey: db.youtubeApiKey || '' }));
      return;
    }
    if (req.method === 'POST') {
      const body = await readBody();
      db.youtubeApiKey = (body.apiKey || '').trim();
      saveDb(db);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true, apiKey: db.youtubeApiKey }));
      return;
    }
  }

  // 3. Dashboard Summary
  if (pathname === '/api/v1/dashboard/summary' && req.method === 'GET') {
    const queryUser = url.searchParams.get('user') || 'Diwakar';
    const currentUser = db.users.find(u => u.full_name.toLowerCase() === queryUser.toLowerCase()) || db.users[0];
    const partner = db.users.find(u => u.id !== currentUser.id) || db.users[1];

    const todayStr = new Date().toISOString().split('T')[0];
    const userTodaySessions = (db.studySessions || []).filter(s =>
      s.user_id === currentUser.id && s.timestamp && s.timestamp.startsWith(todayStr)
    );
    const todayMinutes = userTodaySessions.reduce((sum, s) => sum + (s.duration_minutes || 0), 0);

    const userDsaSessions = (db.dsaSessions || []).filter(s => (s.user || '').toLowerCase() === currentUser.full_name.toLowerCase());
    const totalProblemsSolved = userDsaSessions.reduce((sum, s) => sum + (s.problemsCount || 0), 0);

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      user: currentUser,
      partner: partner,
      streak: currentUser.streak,
      today_study_minutes: todayMinutes,
      daily_goal_hours: 4.0,
      hours_left: Math.max(0, 4.0 - todayMinutes / 60),
      problems_solved_today: totalProblemsSolved,
      partner_online: true,
      currently_watching: partner.currentlyWatching
    }));
    return;
  }

  // 4. Video Courses & Playlists Hub
  if (pathname === '/api/v1/courses' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(db.courses));
    return;
  }

  if (pathname === '/api/v1/courses' && req.method === 'POST') {
    const body = await readBody();
    let embedUrl = body.youtubeUrl || '';
    if (embedUrl.includes('watch?v=')) {
      const vidId = embedUrl.split('watch?v=')[1].split('&')[0];
      embedUrl = `https://www.youtube.com/embed/${vidId}`;
    } else if (embedUrl.includes('youtu.be/')) {
      const vidId = embedUrl.split('youtu.be/')[1].split('?')[0];
      embedUrl = `https://www.youtube.com/embed/${vidId}`;
    } else if (embedUrl.includes('playlist?list=')) {
      const listId = embedUrl.split('playlist?list=')[1].split('&')[0];
      embedUrl = `https://www.youtube.com/embed/videoseries?list=${listId}`;
    }

    const newCourse = {
      id: body.id || ('c_' + Date.now()),
      title: body.title,
      subject: body.subject || 'DSA',
      youtubeUrl: body.youtubeUrl,
      embedUrl: embedUrl,
      addedBy: body.addedBy || 'Diwakar',
      currentLesson: body.currentLesson || (body.lectures?.[0]?.title || 'Lesson 1'),
      totalLessons: body.totalLessons || (body.lectures ? `${body.lectures.length} lectures` : 'Ongoing'),
      lectures: Array.isArray(body.lectures) ? body.lectures : [],
      phases: Array.isArray(body.phases) ? body.phases : []
    };
    if (!Array.isArray(db.courses)) db.courses = [];
    db.courses = [newCourse, ...db.courses.filter(c => c.id !== newCourse.id)];
    saveDb(db);
    res.writeHead(201, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(newCourse));
    return;
  }

  if (pathname.startsWith('/api/v1/courses/') && req.method === 'DELETE') {
    const id = pathname.split('/').pop();
    if (Array.isArray(db.courses)) {
      db.courses = db.courses.filter(c => c.id !== id);
      saveDb(db);
    }
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: true }));
    return;
  }

  // Toggle lecture completed state inside a course
  if (pathname === '/api/v1/courses/lecture-toggle' && req.method === 'POST') {
    const { courseId, lectureId, completed } = await readBody();
    if (Array.isArray(db.courses)) {
      const course = db.courses.find(c => c.id === courseId);
      if (course && Array.isArray(course.lectures)) {
        const lec = course.lectures.find(l => l.id === lectureId);
        if (lec) lec.completed = completed;
        saveDb(db);
      }
    }
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: true }));
    return;
  }

  // Currently Watching Activity Sync
  if (pathname === '/api/v1/courses/activity' && req.method === 'POST') {
    const body = await readBody();
    const user = db.users.find(u => u.full_name.toLowerCase() === (body.userName || '').toLowerCase());
    if (user) {
      user.currentlyWatching = {
        title: body.title,
        url: body.url,
        subject: body.subject
      };
      saveDb(db);
    }
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: true }));
    return;
  }

  // 5. Partner Live Chat
  if (pathname === '/api/v1/friends/chat' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(db.partnerChat));
    return;
  }

  if (pathname === '/api/v1/friends/chat' && req.method === 'POST') {
    const body = await readBody();
    const newMsg = {
      id: 'ch_' + Date.now(),
      sender: body.sender || 'Diwakar',
      text: body.text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    db.partnerChat.push(newMsg);
    saveDb(db);
    res.writeHead(201, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(newMsg));
    return;
  }

  // 6. DSA Study Sessions
  if (pathname === '/api/v1/dsa/sessions' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(db.dsaSessions));
    return;
  }

  if (pathname === '/api/v1/dsa/sessions' && req.method === 'POST') {
    const body = await readBody();
    const newSession = {
      id: 'ds_' + Date.now(),
      user: body.user || 'Diwakar',
      topic: body.topic || 'General Practice',
      platform: body.platform || 'LeetCode',
      durationMinutes: body.durationMinutes || 45,
      problemsCount: body.problemsCount || 1,
      notes: body.notes || '',
      timestamp: new Date().toISOString()
    };
    db.dsaSessions.unshift(newSession);

    db.studySessions.unshift({
      id: 's_' + Date.now(),
      user_id: body.user?.toLowerCase() === 'ayush' ? 'u_ayush' : 'u_diwakar',
      user_name: body.user || 'Diwakar',
      subject_name: 'DSA',
      duration_minutes: body.durationMinutes || 45,
      timestamp: new Date().toISOString(),
      notes: `${body.topic} on ${body.platform}`
    });

    saveDb(db);
    res.writeHead(201, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(newSession));
    return;
  }

  // 7. Coding Question PDF Sheets
  if (pathname === '/api/v1/notes/pdf-sheets' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(db.pdfQuestionSheets));
    return;
  }

  if (pathname === '/api/v1/notes/pdf-sheets' && req.method === 'POST') {
    const body = await readBody();
    const newSheet = {
      id: 'sheet_' + Date.now(),
      title: body.title || 'Uploaded Coding Questions Sheet',
      subject: body.subject || 'DSA',
      totalCount: body.questions?.length || 0,
      completedCount: body.questions?.filter((q) => q.completed).length || 0,
      questions: body.questions || []
    };
    db.pdfQuestionSheets.unshift(newSheet);
    saveDb(db);
    res.writeHead(201, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(newSheet));
    return;
  }

  if (pathname.startsWith('/api/v1/notes/pdf-sheets/') && pathname.endsWith('/toggle') && req.method === 'PUT') {
    const parts = pathname.split('/');
    const sheetId = parts[parts.length - 2];
    const { questionId, completed } = await readBody();

    const sheet = db.pdfQuestionSheets.find(s => s.id === sheetId);
    if (sheet) {
      const q = sheet.questions.find(item => item.id === questionId);
      if (q) {
        q.completed = completed;
        sheet.completedCount = sheet.questions.filter(item => item.completed).length;
        saveDb(db);
      }
    }
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: true, sheet }));
    return;
  }

  // 8. Notes
  if (pathname === '/api/v1/notes' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(db.notes));
    return;
  }

  if (pathname === '/api/v1/notes' && req.method === 'POST') {
    const body = await readBody();
    const newNote = {
      id: body.id || ('n_' + Date.now()),
      title: body.title || 'Untitled Note',
      content: body.content || '',
      tags: body.tags || ['DSA'],
      pdfUrl: body.pdfUrl || undefined,
      fileName: body.fileName || undefined,
      fileSize: body.fileSize || undefined,
      createdAt: body.createdAt || 'Today'
    };
    db.notes = [newNote, ...(db.notes || []).filter(n => n.id !== newNote.id)];
    saveDb(db);
    res.writeHead(201, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(newNote));
    return;
  }

  if (pathname.startsWith('/api/v1/notes/') && req.method === 'DELETE') {
    const id = pathname.split('/').pop();
    db.notes = (db.notes || []).filter(n => n.id !== id);
    saveDb(db);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: true }));
    return;
  }

  // 9. Daily Tasks & Habits
  if (pathname === '/api/v1/habits/daily-tasks' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(db.dailyTasks));
    return;
  }

  if (pathname === '/api/v1/habits/daily-tasks' && req.method === 'POST') {
    const body = await readBody();
    const newTask = {
      id: body.id || ('dt_' + Date.now()),
      title: body.title || 'Custom Task',
      platform: body.platform || 'Custom',
      exp: body.exp || 100,
      completed: Boolean(body.completed),
      isCoreStreakTask: Boolean(body.isCoreStreakTask),
      isCustom: Boolean(body.isCustom ?? true)
    };
    db.dailyTasks = [newTask, ...(db.dailyTasks || []).filter(t => t.id !== newTask.id)];
    saveDb(db);
    res.writeHead(201, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(newTask));
    return;
  }

  if (pathname.startsWith('/api/v1/habits/daily-tasks/') && req.method === 'PUT') {
    const taskId = pathname.split('/').pop();
    const { completed } = await readBody();
    const task = db.dailyTasks.find(t => t.id === taskId);
    if (task) {
      task.completed = completed;
      saveDb(db);
    }
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: true, task }));
    return;
  }

  // Currently Watching Sync
  if (pathname === '/api/v1/user/watching' && req.method === 'POST') {
    const { userName, currentlyWatching } = await readBody();
    const user = db.users.find(u => u.full_name?.toLowerCase() === userName?.toLowerCase() || u.username?.toLowerCase() === userName?.toLowerCase());
    if (user) {
      user.currentlyWatching = currentlyWatching || null;
      saveDb(db);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true, user }));
      return;
    }
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'User not found' }));
    return;
  }

  // 10. Study Sessions & Focus Timer
  if (pathname === '/api/v1/study/sessions' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(db.studySessions));
    return;
  }

  if (pathname === '/api/v1/study/sessions' && req.method === 'POST') {
    const body = await readBody();
    const newSession = {
      id: 's_' + Date.now(),
      user_id: body.user?.toLowerCase() === 'ayush' ? 'u_ayush' : 'u_diwakar',
      user_name: body.user || 'Diwakar',
      subject_name: body.subject_name || 'DSA',
      duration_minutes: body.duration_minutes || 25,
      timestamp: new Date().toISOString(),
      notes: body.notes || ''
    };
    db.studySessions.unshift(newSession);
    saveDb(db);
    res.writeHead(201, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(newSession));
    return;
  }

  // 11. Timetable
  if (pathname === '/api/v1/timetable/classes' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(db.timetable || []));
    return;
  }

  // 12. Local Ollama AI Study Copilot
  const OLLAMA_HOST = process.env.OLLAMA_HOST || 'http://127.0.0.1:11434';

  if (pathname === '/api/v1/ai/status' && req.method === 'GET') {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 2500);
      const resp = await fetch(`${OLLAMA_HOST}/api/tags`, { signal: controller.signal });
      clearTimeout(timeout);
      if (resp.ok) {
        const data = await resp.json();
        const models = data.models || [];
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          online: true,
          host: OLLAMA_HOST,
          activeModel: models.find(m => m.name.includes('gemma'))?.name || models[0]?.name || 'gemma4:latest',
          hardware: 'NVIDIA GeForce RTX 3050 6GB (CUDA 8.6)',
          modelsCount: models.length
        }));
        return;
      }
    } catch (err) {
      // Ollama not reachable
    }

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      online: false,
      host: OLLAMA_HOST,
      hardware: 'NVIDIA GeForce RTX 3050 6GB',
      message: 'Ollama local service is currently offline. Start it with `ollama serve` to enable local GPU inference.'
    }));
    return;
  }

  if (pathname === '/api/v1/ai/models' && req.method === 'GET') {
    let modelsList = [];
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 2500);
      const resp = await fetch(`${OLLAMA_HOST}/api/tags`, { signal: controller.signal });
      clearTimeout(timeout);
      if (resp.ok) {
        const data = await resp.json();
        modelsList = (data.models || []).map(m => {
          const isGemma = m.name.toLowerCase().includes('gemma');
          const isCloud = m.name.toLowerCase().includes('cloud') || m.remote_host;
          return {
            id: m.name,
            name: isGemma ? 'Gemma 4 (8.0B)' : m.name.split(':')[0].toUpperCase(),
            provider: isCloud ? 'MiniMax Cloud' : 'Local RTX 3050 GPU',
            badge: isCloud ? 'Cloud • Fast' : 'Local CUDA 8.6',
            description: isGemma
              ? 'Ultra-fast local inference on RTX 3050 GPU. Multimodal code synthesis, DSA solutions & academic mentor.'
              : `Ollama inference model with ${m.details?.parameter_size || 'optimized'} parameters.`,
            accentColor: isGemma ? '#10B981' : isCloud ? '#38BDF8' : '#6366F1',
            isLocal: !isCloud
          };
        });
      }
    } catch (e) {
      // fallback
    }

    if (modelsList.length === 0) {
      modelsList = [
        {
          id: 'gemma4:latest',
          name: 'Gemma 4 (8.0B)',
          provider: 'Local RTX 3050 GPU',
          badge: 'Local CUDA 8.6',
          description: 'Ultra-fast local inference on RTX 3050 GPU. Multimodal code synthesis, DSA solutions & academic mentor.',
          accentColor: '#10B981',
          isLocal: true
        },
        {
          id: 'minimax-m3:cloud',
          name: 'MiniMax M3',
          provider: 'MiniMax Cloud',
          badge: 'Cloud • 512k Context',
          description: 'Long-context reasoning and multimodal analysis.',
          accentColor: '#38BDF8',
          isLocal: false
        }
      ];
    }

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(modelsList));
    return;
  }

  if (pathname === '/api/v1/ai/chat' && req.method === 'POST') {
    const body = await readBody();
    const reqModel = body.model || 'gemma4:latest';
    const userMessages = body.messages || [];
    const activeUserName = (body.user || 'Diwakar').trim();

    // Context Injection from db
    const currentUser = db.users.find(u => u.full_name.toLowerCase() === activeUserName.toLowerCase()) || db.users[0];
    const partnerUser = db.users.find(u => u.id !== currentUser.id) || db.users[1];

    // Timetable summary
    const lowAttendance = (db.timetable || [])
      .map(c => ({
        subject: c.subject,
        pct: c.totalCount > 0 ? Math.round((c.attendedCount / c.totalCount) * 100) : 100,
        room: c.room,
        time: c.time
      }))
      .filter(c => c.pct < 85);

    const attendanceSummary = lowAttendance.length > 0
      ? lowAttendance.map(c => `- ${c.subject}: ${c.pct}% attendance (Room ${c.room}, ${c.time})`).join('\n')
      : 'All class attendance is currently >= 85% (Safe margin).';

    // Recent DSA problems / sessions
    const recentDsa = (db.dsaSessions || []).slice(0, 3)
      .map(d => `- [${d.user}] Topic: ${d.topic}, Problems: ${d.problemsCount}, Notes: "${d.notes}"`)
      .join('\n');

    // Current courses
    const coursesList = (db.courses || []).slice(0, 3)
      .map(c => `- ${c.title} (${c.subject}) - Currently on: ${c.currentLesson}`)
      .join('\n');

    // Notes
    const notesSummary = (db.notes || []).slice(0, 3)
      .map(n => `- "${n.title}" [${(n.tags || []).join(', ')}]`)
      .join('\n');

    const systemPrompt = `You are the FUSION Student OS AI Study Copilot—an expert private engineering tutor, algorithm mentor, and academic advisor running locally with hardware acceleration on Diwakar's NVIDIA GeForce RTX 3050 6GB Laptop GPU (CUDA 8.6).

STUDENT ACADEMIC DOSSIER:
- Primary Student: ${currentUser.full_name} (${currentUser.streak}-day streak, ${currentUser.xp} XP)
- Study Partner: ${partnerUser.full_name} (${partnerUser.streak}-day streak, currently watching: "${partnerUser.currentlyWatching?.title || 'None'}")
- Timetable Attendance Status:
${attendanceSummary}
- Recent DSA Topics & Practice:
${recentDsa}
- Active Video Courses / Sheets:
${coursesList}
- Study Notes on File:
${notesSummary}

INSTRUCTIONS FOR COPILOT:
1. Provide concise, highly technical, and intellectually rigorous answers.
2. For DSA / LeetCode / Algorithm questions: ALWAYS state the optimal Time & Space Complexity upfront, followed by clean, commented code and step-by-step intuition.
3. For Timetable / Attendance / Friend questions: Refer directly to the real dossier data above to provide accurate, context-aware guidance.
4. Format responses cleanly with Markdown headers, bold highlights, bullet points, and syntax-highlighted code blocks.`;

    const promptMessages = [
      { role: 'system', content: systemPrompt },
      ...userMessages
    ];

    try {
      const ollamaResp = await fetch(`${OLLAMA_HOST}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: reqModel,
          messages: promptMessages,
          stream: false
        })
      });

      if (!ollamaResp.ok) {
        const errorText = await ollamaResp.text();
        throw new Error(`Ollama returned status ${ollamaResp.status}: ${errorText}`);
      }

      const ollamaData = await ollamaResp.json();
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success: true,
        message: ollamaData.message,
        model: ollamaData.model,
        total_duration: ollamaData.total_duration,
        eval_count: ollamaData.eval_count
      }));
      return;
    } catch (err) {
      console.error('[AI Chat Error]', err.message);
      // Helpful fallback response if Ollama was temporarily unresponsive
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success: true,
        message: {
          role: 'assistant',
          content: `[Ollama Local Offline Fallback] I noticed the local Ollama daemon wasn't reachable at ${OLLAMA_HOST}.\n\nTo activate local NVIDIA RTX 3050 GPU acceleration, ensure \`ollama serve\` is running in your terminal.\n\nIn the meantime, your study state is saved: ${currentUser.full_name} is on a ${currentUser.streak}-day streak, and partner ${partnerUser.full_name} is synchronized!`
        },
        model: reqModel,
        fallback: true
      }));
      return;
    }
  }

  // Fallback 404
  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Endpoint not found', path: pathname }));
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`[FUSION API] Real-time Backend active on http://localhost:${PORT}`);
  console.log(`[FUSION API] Health: http://localhost:${PORT}/health`);
});
