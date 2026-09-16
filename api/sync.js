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

async function updateCloudDoc(user, payload, timestamp) {
  const docId = CLOUD_DOC_IDS[user];
  if (!docId) return false;
  try {
    const dataToSave = {
      ...payload,
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

  const { searchParams } = new URL(req.url, `https://${req.headers.host || 'fusion-vercel.vercel.app'}`);
  const userParam = (searchParams.get('user') || req.body?.user || 'diwakar').toLowerCase();
  const targetKey = userParam.includes('ayush') ? 'ayush' : 'diwakar';
  const partnerKey = targetKey === 'diwakar' ? 'ayush' : 'diwakar';

  if (req.method === 'POST') {
    try {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      const { user, payload, timestamp } = body || {};

      const key = (user || targetKey).toLowerCase().includes('ayush') ? 'ayush' : 'diwakar';
      const now = timestamp || Date.now();

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
    const since = parseInt(searchParams.get('since') || '0', 10);

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
