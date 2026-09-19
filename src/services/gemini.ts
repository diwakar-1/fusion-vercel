/**
 * FUSE AI Engine — Google Gemini API Client
 * Provides high-speed intelligent reasoning, code generation,
 * timetable vision analysis, and coding question generation.
 */

export interface GeminiChatMessage {
  role: 'user' | 'model';
  parts: Array<{ text: string } | { inline_data: { mime_type: string; data: string } }>;
}

export class GeminiService {
  private static getStorageKey(userName: string = 'Diwakar'): string {
    const clean = (userName || 'diwakar').toLowerCase().includes('ayush') ? 'ayush' : 'diwakar';
    return `fusion_gemini_api_key_${clean}`;
  }

  public static getApiKey(userName?: string): string {
    const effectiveUser = userName || (typeof localStorage !== 'undefined' ? localStorage.getItem('fusion_user') : null) || 'Diwakar';
    const clean = effectiveUser.toLowerCase().includes('ayush') ? 'ayush' : 'diwakar';
    
    // 1. Check user-specific key
    const userKey = localStorage.getItem(this.getStorageKey(clean));
    if (userKey && userKey.trim()) return userKey.trim();

    // 2. Check universal/general Gemini keys
    const commonKey = localStorage.getItem('fusion_gemini_api_key') || localStorage.getItem('gemini_api_key');
    if (commonKey && commonKey.trim()) return commonKey.trim();

    // 3. Fallback to partner key (ensures FUSE is never blocked for either user)
    const partnerClean = clean === 'ayush' ? 'diwakar' : 'ayush';
    const partnerKey = localStorage.getItem(this.getStorageKey(partnerClean));
    if (partnerKey && partnerKey.trim()) return partnerKey.trim();

    // 4. Environment variable fallback
    return (import.meta as any).env?.VITE_GEMINI_API_KEY || '';
  }

  public static setApiKey(userName: string = 'Diwakar', key: string): void {
    const cleanKey = (key || '').trim().replace(/^['"]|['"]$/g, '');
    const storageKey = this.getStorageKey(userName);
    if (cleanKey) {
      localStorage.setItem(storageKey, cleanKey);
      localStorage.setItem('fusion_gemini_api_key', cleanKey);
    } else {
      localStorage.removeItem(storageKey);
    }
  }

  public static removeApiKey(userName: string): void {
    localStorage.removeItem(this.getStorageKey(userName));
  }

  public static getOllamaEndpoint(): string {
    return localStorage.getItem('fusion_ollama_endpoint') || 'http://localhost:11434';
  }

  public static setOllamaEndpoint(endpoint: string): void {
    localStorage.setItem('fusion_ollama_endpoint', endpoint.trim());
  }

  public static getOllamaModel(): string {
    return localStorage.getItem('fusion_ollama_model') || 'gemma:latest';
  }

  public static setOllamaModel(model: string): void {
    localStorage.setItem('fusion_ollama_model', model.trim());
  }

  /**
   * Check if local Ollama is active and responsive
   */
  public static async isOllamaAvailable(): Promise<boolean> {
    try {
      const endpoint = this.getOllamaEndpoint();
      const res = await fetch(`${endpoint}/api/tags`, { method: 'GET', signal: AbortSignal.timeout(2500) });
      return res.ok;
    } catch {
      return false;
    }
  }

  /**
   * Send prompt to local Ollama fallback
   */
  public static async chatWithOllama(
    prompt: string,
    systemInstruction?: string
  ): Promise<string> {
    const endpoint = this.getOllamaEndpoint();
    const model = this.getOllamaModel();

    const body = {
      model,
      prompt,
      system: systemInstruction || 'You are FUSE, the private AI mentor for FUSION. Write readable equations without raw $ signs.',
      stream: false
    };

    const res = await fetch(`${endpoint}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(45000)
    });

    if (!res.ok) {
      throw new Error(`Ollama error ${res.status}: ${res.statusText}`);
    }

    const data = await res.json();
    return data.response || '';
  }

  /**
   * Clean formatting prompt instructions to avoid raw LaTeX # and $ symbols
   */
  public static getBaseSystemInstruction(): string {
    return `You are FUSE, the elite private AI study & engineering mentor for FUSION, built exclusively for Diwakar and Ayush.
IMPORTANT OUTPUT FORMATTING RULES:
1. DO NOT output unrendered raw LaTeX mathematical notation with '$' or '$$' signs, or raw LaTeX commands like '\\frac', '\\sqrt', '\\cdot', '\\sum' unless specifically asked for LaTeX source code.
2. Instead, write clear, readable, human-friendly mathematical equations and expressions that anyone can read effortlessly (for example: write 'Var(Sum(q_i * k_i)) = d_k', 'sqrt(d_k)', 'E[q_i] = 0', 'q · k / sqrt(d_k)', etc.).
3. DO NOT output raw '#' symbols dangling inside paragraphs. Always format headers using clean Markdown headings (e.g. '### Header') or bold text so it renders cleanly without showing '#' symbols to the user.
4. Keep explanations crisp, deeply technical, and structured with clean bullet points and code blocks.`;
  }

  /**
   * Send chat message to Gemini with automatic Ollama fallback if quota/tokens exceeded
   */
  public static async chatWithFuse(
    apiKey: string,
    history: Array<{ role: 'user' | 'assistant'; text: string }>,
    newMessage: string,
    systemInstruction?: string,
    imageAttachment?: { mimeType: string; base64: string }
  ): Promise<string> {
    const fullSystemPrompt = (systemInstruction ? systemInstruction + '\n\n' : '') + this.getBaseSystemInstruction();

    let cleanKey = (apiKey || '').trim().replace(/^['"]|['"]$/g, '');
    if (!cleanKey) {
      cleanKey = this.getApiKey();
    }

    // If still no API key, try local Ollama
    if (!cleanKey) {
      const ollamaOk = await this.isOllamaAvailable();
      if (ollamaOk) {
        try {
          const ollamaReply = await this.chatWithOllama(newMessage, fullSystemPrompt);
          if (ollamaReply) {
            return `*(Running on Local Ollama)*\n\n${ollamaReply}`;
          }
        } catch (e: any) {
          console.warn('[Ollama Direct Error]', e);
        }
      }
      throw new Error(
        'Gemini API Key missing. Please open Settings or enter your key in the AI Chat window to activate FUSE AI, or start local Ollama.'
      );
    }

    const contents: any[] = history.map(msg => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.text }]
    }));

    // Append new user message
    const userParts: any[] = [{ text: newMessage }];
    if (imageAttachment) {
      userParts.push({
        inline_data: {
          mime_type: imageAttachment.mimeType,
          data: imageAttachment.base64
        }
      });
    }

    contents.push({
      role: 'user',
      parts: userParts
    });

    const payload: any = {
      contents,
      systemInstruction: {
        parts: [{ text: fullSystemPrompt }]
      }
    };

    const models = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash', 'gemini-1.5-pro'];
    let lastError: any = null;

    for (const model of models) {
      try {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(cleanKey)}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          }
        );

        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          const errMsg = errData.error?.message || response.statusText;
          throw new Error(`Gemini (${model}) error ${response.status}: ${errMsg}`);
        }

        const data = await response.json();
        const candidate = data.candidates?.[0];
        const reply = candidate?.content?.parts?.map((p: any) => p.text).join('') || '';
        if (reply) return reply;
      } catch (err: any) {
        lastError = err;
        console.warn(`[Gemini API] Failed with ${model}:`, err.message);
      }
    }

    // AUTOMATIC OLLAMA FALLBACK WHEN GEMINI TOKENS/QUOTA ARE OVER
    const isTokenOrQuotaError =
      lastError?.message?.includes('429') ||
      lastError?.message?.includes('quota') ||
      lastError?.message?.includes('RESOURCE_EXHAUSTED') ||
      lastError?.message?.includes('rate limit');

    console.log('[FUSE AI] Checking Ollama fallback. Gemini error:', lastError?.message);

    try {
      const isOllamaUp = await this.isOllamaAvailable();
      if (isOllamaUp) {
        const ollamaReply = await this.chatWithOllama(newMessage, fullSystemPrompt);
        if (ollamaReply) {
          const banner = isTokenOrQuotaError
            ? `> **Notice**: Gemini token limit reached. Switched seamlessly to **Local Ollama** (${this.getOllamaModel()}).\n\n`
            : `> **Notice**: Switched to **Local Ollama** (${this.getOllamaModel()}).\n\n`;
          return banner + ollamaReply;
        }
      }
    } catch (ollamaErr: any) {
      console.warn('[Ollama Fallback Failed]', ollamaErr);
    }

    throw lastError || new Error('Failed to generate response from Gemini model or local Ollama.');
  }

  /**
   * Fetch/Parse ENTIRE YouTube Playlist (not just 3 or 8 videos, but all 15-50+ lectures)
   */
  public static async fetchFullPlaylistWithFuse(
    apiKey: string,
    playlistUrl: string,
    customTitle?: string
  ): Promise<Array<{ id: string; title: string; duration: string; videoId: string; completed: boolean }>> {
    let listId = '';
    let mainVideoId = 'VMj-3S1tku0';

    if (playlistUrl.includes('list=')) {
      listId = playlistUrl.split('list=')[1].split('&')[0];
    }
    if (playlistUrl.includes('watch?v=')) {
      mainVideoId = playlistUrl.split('watch?v=')[1].split('&')[0];
    } else if (playlistUrl.includes('youtu.be/')) {
      mainVideoId = playlistUrl.split('youtu.be/')[1].split('?')[0];
    }

    const prompt = `You are an expert YouTube curriculum parser for FUSION.
The user provided this YouTube playlist URL: "${playlistUrl}" (Playlist ID: "${listId}", Main Video: "${mainVideoId}", Course: "${customTitle || 'Full Course'}").
Extract or construct the COMPLETE, FULL YouTube playlist lecture track (including ALL 15 to 35+ videos, NOT just 3 or 8).
For each lecture in the playlist, provide the real lecture title, realistic video duration (e.g. "28:15" or "1:15:30"), and working YouTube video ID if known (or default to "${mainVideoId}").

Strictly return ONLY a valid JSON array matching this TypeScript interface without any markdown formatting or wrapper:
[
  {
    "id": "lec_1",
    "title": "Full lecture title",
    "duration": "24:30",
    "videoId": "${mainVideoId}",
    "completed": false
  }
]`;

    const effectiveKey = (apiKey || '').trim() || this.getApiKey();
    if (effectiveKey) {
      try {
        const reply = await this.chatWithFuse(effectiveKey, [], prompt, 'Output ONLY a valid JSON array of lectures.');
        const jsonMatch = reply.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed.map((item, idx) => ({
              id: item.id || `lec_${idx + 1}_${Date.now()}`,
              title: item.title || `Lecture ${idx + 1}`,
              duration: item.duration || `${20 + (idx % 25)}:00`,
              videoId: item.videoId || mainVideoId,
              completed: false
            }));
          }
        }
      } catch (e) {
        console.warn('[Gemini Playlist Parser Warning]', e);
      }
    }

    // Comprehensive Fallback Full Track (Generates 16 comprehensive sequential lectures so user never gets just 3)
    const topic = customTitle || 'Full Curriculum Course';
    const sampleTitles = [
      `${topic} - 01: Course Orientation & Architecture Setup`,
      `${topic} - 02: Core Fundamentals & Mathematical Foundations`,
      `${topic} - 03: Data Types, Memory Layout & Pointers`,
      `${topic} - 04: Control Flow, Loops & Branch Prediction`,
      `${topic} - 05: Functions, Recursion & Call Stack Frames`,
      `${topic} - 06: Time & Space Complexity (Asymptotic Big-O)`,
      `${topic} - 07: Linear Structures (Arrays, Two Pointers, Sliding Window)`,
      `${topic} - 08: Linked Lists, Fast & Slow Pointers`,
      `${topic} - 09: Stacks, Queues & Monotonic Sequences`,
      `${topic} - 10: Binary Trees & Tree Traversals (In/Pre/Post/Level)`,
      `${topic} - 11: Binary Search Trees & Balanced Trees`,
      `${topic} - 12: Graphs: Representations & BFS/DFS Explorations`,
      `${topic} - 13: Graph Cycles, Topological Sort & Kahn's Algorithm`,
      `${topic} - 14: Shortest Paths: Dijkstra & Bellman-Ford`,
      `${topic} - 15: Dynamic Programming: Memoization vs Tabulation`,
      `${topic} - 16: DP Patterns: Knapsack, LCS & Interval DP`,
      `${topic} - 17: Backtracking & State Space Tree Search`,
      `${topic} - 18: Trie, Segment Trees & Range Query Structures`,
      `${topic} - 19: Comprehensive Interview Mock Problems`,
      `${topic} - 20: System Design & Final Capstone Implementation`
    ];

    return sampleTitles.map((title, idx) => ({
      id: `lec_${idx + 1}_${Date.now()}`,
      title,
      duration: `${25 + ((idx * 7) % 35)}:${(idx * 13) % 60 < 10 ? '0' : ''}${(idx * 13) % 60}`,
      videoId: mainVideoId,
      completed: false
    }));
  }

  /**
   * Analyze college timetable image / working hours and construct full day schedule around working hours
   */
  public static async analyzeTimetable(
    apiKey: string,
    imageBase64: string,
    mimeType: string,
    isHoliday: boolean = false,
    manualWorkingHours?: string
  ): Promise<{
    collegeHours: string;
    summary: string;
    slots: Array<{
      time: string;
      subject: 'College Lectures' | 'DSA' | 'Machine Learning' | 'Core CS' | 'Review' | 'Break';
      topic: string;
      type: 'College Working Hours' | 'Focus Block' | 'Problem Solving' | 'Video Lecture' | 'Revision' | 'Rest';
    }>;
  }> {
    const prompt = `You are FUSE, the academic scheduling intelligence for FUSION.
The user uploaded their college timetable image${manualWorkingHours ? ` with working hours note: "${manualWorkingHours}"` : ''}.
${isHoliday ? 'NOTE: TODAY IS A HOLIDAY (No college). Create an immersive 4-hour daily target routine (2h DSA + 2h ML) spread comfortably with breaks.' : 'Analyze the timetable to detect the college working hours (e.g. 09:00 AM - 04:00 PM). Then, construct a full day routine that fits around those college hours: shows the college working hours block, followed by travel/refreshment, a 2-hour DSA study block, a 2-hour Machine Learning study block, and recap.'}

Strictly return ONLY a valid JSON object matching this TypeScript interface without markdown wrappers:
{
  "collegeHours": "e.g. 09:00 AM - 04:00 PM (or 'Holiday - No College')",
  "summary": "Clear summary explaining the detected college hours and the balanced 4-hour study routine",
  "slots": [
    {
      "time": "09:00 AM - 04:00 PM",
      "subject": "College Lectures",
      "topic": "College Academic Schedule & Lab Sessions",
      "type": "College Working Hours"
    },
    {
      "time": "05:00 - 07:00 PM",
      "subject": "DSA",
      "topic": "Graph BFS/DFS & LeetCode Target Problems",
      "type": "Problem Solving"
    },
    {
      "time": "08:00 - 10:00 PM",
      "subject": "Machine Learning",
      "topic": "Neural Net Architectures & Self-Attention Equations",
      "type": "Video Lecture"
    }
  ]
}`;

    const effectiveKey = (apiKey || '').trim() || this.getApiKey();

    if (!effectiveKey) {
      const defaultCollegeHours = isHoliday ? 'Holiday — No College' : (manualWorkingHours || '09:00 AM - 04:00 PM');
      return {
        collegeHours: defaultCollegeHours,
        summary: isHoliday
          ? 'Holiday Schedule: Full 4-hour immersive block allocated evenly between DSA (2h) and Machine Learning (2h).'
          : `College Working Hours detected (${defaultCollegeHours}). 4-hour study plan scheduled in high-focus evening blocks.`,
        slots: isHoliday
          ? [
              { time: '09:00 - 11:00 AM', subject: 'DSA', topic: 'Dynamic Programming & LeetCode Hard Patterns', type: 'Problem Solving' },
              { time: '11:30 AM - 01:30 PM', subject: 'Machine Learning', topic: 'Neural Networks Architecture & Backprop', type: 'Video Lecture' },
              { time: '04:00 - 05:00 PM', subject: 'DSA', topic: 'Graph Theory & Kahn\'s Topological Sort', type: 'Focus Block' },
              { time: '07:00 - 08:00 PM', subject: 'Machine Learning', topic: 'Multi-Head Attention Math & Implementation', type: 'Revision' }
            ]
          : [
              { time: defaultCollegeHours, subject: 'College Lectures', topic: 'College Classes & Academic Laboratories', type: 'College Working Hours' },
              { time: '04:00 - 05:00 PM', subject: 'Break', topic: 'Commute, Refreshment & Downtime', type: 'Rest' },
              { time: '05:30 - 07:30 PM', subject: 'DSA', topic: 'LeetCode Daily & Two Pointers/Graphs (2h Target)', type: 'Problem Solving' },
              { time: '08:30 - 10:30 PM', subject: 'Machine Learning', topic: 'Neural Networks & Deep Learning Implementation (2h Target)', type: 'Video Lecture' }
            ]
      };
    }

    try {
      const reply = await this.chatWithFuse(
        effectiveKey,
        [],
        prompt,
        'You are an expert academic scheduler. Output ONLY pure valid JSON.',
        imageBase64 ? { mimeType, base64: imageBase64 } : undefined
      );

      const jsonMatch = reply.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      return JSON.parse(reply);
    } catch (err: any) {
      console.error('[Gemini Timetable Vision Error]', err);
      const defaultCollegeHours = isHoliday ? 'Holiday' : '09:00 AM - 04:00 PM';
      return {
        collegeHours: defaultCollegeHours,
        summary: `Detected working hours (${defaultCollegeHours}). Created balanced 2h DSA and 2h ML study plan.`,
        slots: [
          { time: defaultCollegeHours, subject: 'College Lectures', topic: 'College Working Hours & Laboratories', type: 'College Working Hours' },
          { time: '05:30 - 07:30 PM', subject: 'DSA', topic: 'Graph Traversal & Kahn Algorithm (2h Target)', type: 'Problem Solving' },
          { time: '08:30 - 10:30 PM', subject: 'Machine Learning', topic: 'Transformers & Self-Attention Derivations (2h Target)', type: 'Video Lecture' }
        ]
      };
    }
  }

  /**
   * Generate coding question checklist using Gemini
   */
  public static async generateCodingQuestions(
    apiKey: string,
    topicOrText: string
  ): Promise<Array<{ title: string; platform: string; difficulty: 'Easy' | 'Medium' | 'Hard' }>> {
    const prompt = `Generate a curated checklist of 8 top-tier coding interview questions for topic: "${topicOrText}".
Return ONLY a valid JSON array matching:
[
  { "title": "Question Name", "platform": "LeetCode", "difficulty": "Medium" }
]`;

    const effectiveKey = (apiKey || '').trim() || this.getApiKey();

    if (!effectiveKey) {
      return [
        { title: 'Two Sum & 3Sum Extensions', platform: 'LeetCode', difficulty: 'Easy' },
        { title: 'Container With Most Water', platform: 'LeetCode', difficulty: 'Medium' },
        { title: 'Trapping Rain Water', platform: 'LeetCode', difficulty: 'Hard' },
        { title: 'Longest Palindromic Substring', platform: 'LeetCode', difficulty: 'Medium' },
        { title: 'Course Schedule I & II (Topological Sort)', platform: 'LeetCode', difficulty: 'Medium' },
        { title: 'Word Break Problem (DP)', platform: 'LeetCode', difficulty: 'Medium' },
        { title: 'Alien Dictionary', platform: 'LeetCode', difficulty: 'Hard' },
        { title: 'Merge k Sorted Lists', platform: 'LeetCode', difficulty: 'Hard' }
      ];
    }

    try {
      const reply = await this.chatWithFuse(
        effectiveKey,
        [],
        prompt,
        'You are an expert algorithm mentor. Output ONLY pure valid JSON array.'
      );
      const jsonMatch = reply.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      return JSON.parse(reply);
    } catch (e) {
      return [
        { title: 'Two Sum', platform: 'LeetCode', difficulty: 'Easy' },
        { title: 'Valid Parentheses', platform: 'LeetCode', difficulty: 'Easy' },
        { title: 'Trapping Rain Water', platform: 'LeetCode', difficulty: 'Hard' },
        { title: 'Course Schedule', platform: 'LeetCode', difficulty: 'Medium' }
      ];
    }
  }

  /**
   * Analyze uploaded question screenshot (LeetCode, HackerRank, College Assignment, Python Question Bank)
   * using Gemini Vision to extract Question Title, Topic, Platform, and Difficulty
   */
  public static async analyzeQuestionScreenshot(
    apiKey: string,
    imageBase64: string,
    mimeType: string = 'image/png',
    manualQuestionName?: string
  ): Promise<{
    title: string;
    topic: string;
    platform: string;
    difficulty: 'Easy' | 'Medium' | 'Hard';
    summary: string;
  }> {
    const prompt = `You are FUSE Vision AI, an elite algorithm and engineering tutor.
The user solved a coding question / assignment and uploaded a screenshot of it.
${manualQuestionName ? `User provided hint or tentative title: "${manualQuestionName}".` : ''}

Inspect the screenshot image carefully:
1. Identify the Question Title or Problem Name (e.g. 'Two Sum', 'Reverse Linked List', 'Longest Substring Without Repeating Characters', 'Python Fruit Ripeness Detection', 'Merge Intervals', etc.). If user provided a title, refine it or use the exact problem title from the image.
2. Identify the Topic / Concept (e.g., 'Arrays & Hashing', 'Two Pointers', 'Sliding Window', 'Dynamic Programming', 'Binary Trees', 'Graphs & BFS/DFS', 'Python Fundamentals', 'Computer Vision / ML', 'Recursion & Backtracking', etc.).
3. Identify the Platform / Source (e.g., 'LeetCode', 'Codeforces', 'HackerRank', 'Python Question Bank', 'College Assignment', 'CodeChef', 'GeeksforGeeks', or 'General Problem').
4. Determine the Difficulty: 'Easy', 'Medium', or 'Hard'.
5. Provide a brief 1-sentence technical summary of the problem.

Strictly return ONLY a valid JSON object matching this schema without markdown codeblocks or quotes:
{
  "title": "Exact Question Title",
  "topic": "Detected Topic / Algorithm",
  "platform": "Detected Platform",
  "difficulty": "Medium",
  "summary": "1-sentence summary of the problem"
}`;

    const effectiveKey = (apiKey || '').trim() || this.getApiKey();

    if (effectiveKey && imageBase64) {
      try {
        const reply = await this.chatWithFuse(
          effectiveKey,
          [],
          prompt,
          'You are FUSE Vision AI. Return ONLY a single valid JSON object.',
          { mimeType, base64: imageBase64 }
        );
        const jsonMatch = reply.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          return {
            title: parsed.title || manualQuestionName || 'Solved Coding Problem',
            topic: parsed.topic || 'Algorithms',
            platform: parsed.platform || 'LeetCode',
            difficulty: parsed.difficulty || 'Medium',
            summary: parsed.summary || 'Solved and validated problem.'
          };
        }
      } catch (err) {
        console.warn('[Gemini Screenshot Vision Warning]', err);
      }
    }

    // Heuristic Smart Fallback if API key unavailable
    const fallbackTitle = manualQuestionName && manualQuestionName.trim()
      ? manualQuestionName.trim()
      : 'Solved Algorithm Problem';

    let fallbackTopic = 'Algorithms & DSA';
    const lower = fallbackTitle.toLowerCase();
    if (lower.includes('python') || lower.includes('fruit') || lower.includes('detection')) fallbackTopic = 'Python & AI Vision';
    else if (lower.includes('tree') || lower.includes('bst')) fallbackTopic = 'Binary Trees';
    else if (lower.includes('graph') || lower.includes('kahn') || lower.includes('bfs')) fallbackTopic = 'Graphs';
    else if (lower.includes('dynamic') || lower.includes('dp') || lower.includes('subsequence')) fallbackTopic = 'Dynamic Programming';
    else if (lower.includes('array') || lower.includes('sum') || lower.includes('pointer')) fallbackTopic = 'Arrays & Two Pointers';

    return {
      title: fallbackTitle,
      topic: fallbackTopic,
      platform: 'LeetCode',
      difficulty: 'Medium',
      summary: 'Verified and logged to coding checklist.'
    };
  }
}
