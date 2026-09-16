/**
 * FUSION Universal Cloud State Sync Engine
 * Real-time bidirectional persistent data synchronizer for Web & Android App.
 * Persists Diwakar & Ayush live sessions, tasks, streaks, notes, playlists & API keys across devices.
 */

const CLOUD_DOC_IDS = {
  diwakar: 'ff808181a09d98f701a0a8863c7e16cc',
  ayush: 'ff808181a09d98f701a0a8863d2016cd'
};

// Memory cache to avoid excessive external fetch if fresh
let memoryCache = {
  diwakar: { lastUpdated: 0, data: null },
  ayush: { lastUpdated: 0, data: null }
};

async function fetchCloudDoc(user) {
  const docId = CLOUD_DOC_IDS[user];
  if (!docId) return null;
  try {
    const res = await fetch(`https://api.restful-api.dev/objects/${docId}`, {
      headers: { 'Accept': 'application/json' }
    });
    if (res.ok) {
      const json = await res.json();
      return json?.data || null;
    }
  } catch (err) {
    console.error(`Error fetching cloud doc for ${user}:`, err);
  }
  return memoryCache[user]?.data || null;
}

async function parseRequestBody(req) {
  if (req.body) {
    return typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
  }
  return new Promise((resolve) => {
    let raw = '';
    req.on('data', chunk => { raw += chunk; });
    req.on('end', () => {
      try {
        resolve(raw ? JSON.parse(raw) : {});
      } catch {
        resolve({});
      }
    });
    req.on('error', () => resolve({}));
  });
}

async function updateCloudDoc(user, payload, timestamp) {
  const docId = CLOUD_DOC_IDS[user];
  if (!docId) return false;
  try {
    const existing = await fetchCloudDoc(user);
    const existingProfile = existing?.profile || {};
    const payloadProfile = payload?.profile || {};

    const mergedProfile = (payloadProfile && Object.keys(payloadProfile).length > 0) ? {
      ...existingProfile,
      ...payloadProfile,
      name: (payloadProfile.name && payloadProfile.name.trim()) ? payloadProfile.name.trim() : (existingProfile.name || (user === 'ayush' ? 'Ayush' : 'Diwakar')),
      college: (payloadProfile.college && payloadProfile.college.trim()) ? payloadProfile.college.trim() : (existingProfile.college || ''),
      branch: (payloadProfile.branch && payloadProfile.branch.trim()) ? payloadProfile.branch.trim() : (existingProfile.branch || ''),
      semester: (payloadProfile.semester && payloadProfile.semester.trim()) ? payloadProfile.semester.trim() : (existingProfile.semester || ''),
      avatar: (payloadProfile.avatar && payloadProfile.avatar.trim()) ? payloadProfile.avatar.trim() : (existingProfile.avatar || ''),
      handle: (payloadProfile.handle && payloadProfile.handle.trim()) ? payloadProfile.handle.trim() : (existingProfile.handle || `@${user}_dev`),
      streakDays: Math.max(existingProfile.streakDays || 0, payloadProfile.streakDays || 0),
      totalXp: Math.max(existingProfile.totalXp || 100, payloadProfile.totalXp || 100),
      level: Math.max(existingProfile.level || 1, payloadProfile.level || 1),
      todayStudiedMinutes: Math.max(existingProfile.todayStudiedMinutes || 0, payloadProfile.todayStudiedMinutes || 0),
      dailyGoalHours: payloadProfile.dailyGoalHours || existingProfile.dailyGoalHours || 4.0
    } : existingProfile;

    // Merge notes by id - do not wipe existing notes if payload notes is empty
    let mergedNotes = existing?.notes || [];
    if (Array.isArray(payload.notes) && payload.notes.length > 0) {
      mergedNotes = [...mergedNotes];
      payload.notes.forEach(pn => {
        const idx = mergedNotes.findIndex(en => en.id === pn.id);
        if (idx >= 0) mergedNotes[idx] = { ...mergedNotes[idx], ...pn };
        else mergedNotes.unshift(pn);
      });
    }

    // Merge courses by id - do not wipe existing courses if payload courses is empty
    let mergedCourses = existing?.courses || [];
    if (Array.isArray(payload.courses) && payload.courses.length > 0) {
      mergedCourses = [...mergedCourses];
      payload.courses.forEach(pc => {
        const idx = mergedCourses.findIndex(ec => ec.id === pc.id);
        if (idx >= 0) {
          const existingLecs = mergedCourses[idx].lectures || [];
          const payloadLecs = pc.lectures || [];
          const mergedLecs = payloadLecs.length > 0 ? payloadLecs : existingLecs;
          mergedCourses[idx] = { ...mergedCourses[idx], ...pc, lectures: mergedLecs };
        } else {
          mergedCourses.unshift(pc);
        }
      });
    }

    // Daily tasks
    const mergedDailyTasks = (Array.isArray(payload.dailyTasks) && payload.dailyTasks.length > 0)
      ? payload.dailyTasks
      : (existing?.dailyTasks || []);

    // Study logs (preserve all study sessions across devices)
    let mergedStudyLogs = existing?.studyLogs || [];
    if (Array.isArray(payload.studyLogs) && payload.studyLogs.length > 0) {
      const existingIds = new Set(mergedStudyLogs.map(s => s.id));
      const toAdd = payload.studyLogs.filter(s => !existingIds.has(s.id));
      mergedStudyLogs = [...mergedStudyLogs, ...toAdd];
    }

    // Partner chat messages
    let mergedChat = existing?.partnerChatMessages || [];
    if (Array.isArray(payload.partnerChatMessages) && payload.partnerChatMessages.length > 0) {
      const existingIds = new Set(mergedChat.map(m => m.id));
      const toAdd = payload.partnerChatMessages.filter(m => !existingIds.has(m.id));
      mergedChat = [...mergedChat, ...toAdd];
    }

    const dataToSave = {
      ...(existing || {}),
      ...payload,
      profile: mergedProfile,
      notes: mergedNotes,
      courses: mergedCourses,
      dailyTasks: mergedDailyTasks,
      studyLogs: mergedStudyLogs,
      partnerChatMessages: mergedChat,
      dsaTopics: (Array.isArray(payload.dsaTopics) && payload.dsaTopics.length > 0) ? payload.dsaTopics : (existing?.dsaTopics || []),
      habits: (Array.isArray(payload.habits) && payload.habits.length > 0) ? payload.habits : (existing?.habits || []),
      goals: (Array.isArray(payload.goals) && payload.goals.length > 0) ? payload.goals : (existing?.goals || []),
      mlMilestones: (Array.isArray(payload.mlMilestones) && payload.mlMilestones.length > 0) ? payload.mlMilestones : (existing?.mlMilestones || []),
      timetableSchedule: (Array.isArray(payload.timetableSchedule) && payload.timetableSchedule.length > 0) ? payload.timetableSchedule : (existing?.timetableSchedule || []),
      pdfQuestionSheets: (Array.isArray(payload.pdfQuestionSheets) && payload.pdfQuestionSheets.length > 0) ? payload.pdfQuestionSheets : (existing?.pdfQuestionSheets || []),
      geminiApiKey: (payload.geminiApiKey && typeof payload.geminiApiKey === 'string' && payload.geminiApiKey.trim())
        ? payload.geminiApiKey.trim()
        : (existing?.geminiApiKey || undefined),
      youtubeApiKey: (payload.youtubeApiKey && typeof payload.youtubeApiKey === 'string' && payload.youtubeApiKey.trim())
        ? payload.youtubeApiKey.trim()
        : (existing?.youtubeApiKey || undefined),
      ayushPassword: payload.ayushPassword || existing?.ayushPassword,
      user,
      lastUpdated: timestamp || Date.now()
    };

    memoryCache[user] = {
      lastUpdated: dataToSave.lastUpdated,
      data: dataToSave
    };

    const res = await fetch(`https://api.restful-api.dev/objects/${docId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: `fusion_cloud_store_${user}`,
        data: dataToSave
      })
    });
    return res.ok;
  } catch (err) {
    console.error(`Error updating cloud doc for ${user}:`, err);
    return false;
  }
}

export default async function handler(req, res) {
  // Universal CORS for Web, Android Capacitor & Localhost
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const url = new URL(req.url, `https://${req.headers.host || 'fusion-vercel.vercel.app'}`);
  const queryUser = url.searchParams.get('user');

  if (req.method === 'POST') {
    try {
      const body = await parseRequestBody(req);
      const userField = queryUser || body?.user || 'diwakar';
      const key = userField.toLowerCase().includes('ayush') ? 'ayush' : 'diwakar';
      const payload = body?.payload;
      const now = body?.timestamp || Date.now();

      if (payload) {
        await updateCloudDoc(key, payload, now);
      }

      return res.status(200).json({
        success: true,
        user: key,
        lastUpdated: now
      });
    } catch (err) {
      return res.status(400).json({ success: false, error: err.message });
    }
  }

  if (req.method === 'GET') {
    const userParam = (queryUser || 'diwakar').toLowerCase();
    const targetKey = userParam.includes('ayush') ? 'ayush' : 'diwakar';
    const partnerKey = targetKey === 'diwakar' ? 'ayush' : 'diwakar';
    const since = parseInt(url.searchParams.get('since') || '0', 10);

    // Fetch user and partner state from durable cloud database
    const [userData, partnerData] = await Promise.all([
      fetchCloudDoc(targetKey),
      fetchCloudDoc(partnerKey)
    ]);

    const userLastUpdated = userData?.lastUpdated || memoryCache[targetKey]?.lastUpdated || Date.now();
    const partnerLastUpdated = partnerData?.lastUpdated || memoryCache[partnerKey]?.lastUpdated || Date.now();

    return res.status(200).json({
      success: true,
      user: targetKey,
      lastUpdated: userLastUpdated,
      data: userData || null,
      hasNewData: userLastUpdated > since,
      partner: {
        user: partnerKey,
        lastUpdated: partnerLastUpdated,
        data: partnerData || null
      }
    });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
