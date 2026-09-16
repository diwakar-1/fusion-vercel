/**
 * FUSION Universal Cloud State Sync Engine
 * Real-time bidirectional data synchronizer for Web & Android App.
 * Handles Diwakar & Ayush live sessions, tasks, streaks, notes & problem statuses.
 */

// In-memory memory store for active serverless instance
let globalSyncStore = {
  diwakar: {
    lastUpdated: Date.now(),
    version: 1,
    data: null
  },
  ayush: {
    lastUpdated: Date.now(),
    version: 1,
    data: null
  }
};

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

  if (req.method === 'POST') {
    try {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      const { user, payload, timestamp } = body || {};

      const key = (user || targetKey).toLowerCase().includes('ayush') ? 'ayush' : 'diwakar';

      if (payload) {
        globalSyncStore[key] = {
          lastUpdated: timestamp || Date.now(),
          version: (globalSyncStore[key]?.version || 0) + 1,
          data: payload
        };
      }

      return res.status(200).json({
        success: true,
        user: key,
        version: globalSyncStore[key].version,
        lastUpdated: globalSyncStore[key].lastUpdated
      });
    } catch (err) {
      return res.status(400).json({ success: false, error: err.message });
    }
  }

  if (req.method === 'GET') {
    const since = parseInt(searchParams.get('since') || '0', 10);
    const store = globalSyncStore[targetKey];

    // Return the partner's status as well for real-time duo room
    const partnerKey = targetKey === 'diwakar' ? 'ayush' : 'diwakar';
    const partnerStore = globalSyncStore[partnerKey];

    return res.status(200).json({
      success: true,
      user: targetKey,
      lastUpdated: store?.lastUpdated || Date.now(),
      version: store?.version || 1,
      data: store?.data || null,
      hasNewData: (store?.lastUpdated || 0) > since,
      partner: {
        user: partnerKey,
        lastUpdated: partnerStore?.lastUpdated || Date.now(),
        version: partnerStore?.version || 1,
        data: partnerStore?.data || null
      }
    });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
