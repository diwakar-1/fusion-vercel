/**
 * FUSION API Client
 * Seamless communication with FUSION backend (http://localhost:8000/api/v1)
 * Tailored strictly for Diwakar & Ayush real-time co-study.
 */

const API_BASE = '/api/v1';

class ApiClient {
  private token: string | null = null;

  constructor() {
    this.token = localStorage.getItem('fusion_token');
  }

  setToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem('fusion_token', token);
    } else {
      localStorage.removeItem('fusion_token');
    }
  }

  getToken(): string | null {
    return this.token || localStorage.getItem('fusion_token');
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<{ data: T | null; error: string | null }> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string> || {})
    };

    const currentToken = this.getToken();
    if (currentToken) {
      headers['Authorization'] = `Bearer ${currentToken}`;
    }

    try {
      const response = await fetch(`${API_BASE}${endpoint}`, {
        ...options,
        headers
      });

      if (!response.ok) {
        let errDetail = 'Request failed';
        try {
          const errData = await response.json();
          errDetail = errData.error || errData.detail || errData.message || errDetail;
        } catch {
          errDetail = response.statusText;
        }
        return { data: null, error: errDetail };
      }

      if (response.status === 204) {
        return { data: null, error: null };
      }

      const data = await response.json();
      return { data, error: null };
    } catch (err: any) {
      return { data: null, error: err.message || 'Network error' };
    }
  }

  // Health check
  async checkHealth(): Promise<boolean> {
    try {
      const res = await fetch('/health', { method: 'GET' });
      return res.ok;
    } catch {
      return false;
    }
  }

  // 1. Entry Code Auth
  async verifyEntryCode(payload: { user: 'Diwakar' | 'Ayush'; code: string }) {
    return this.request<{ success: boolean; user: any; token: string }>('/auth/verify-code', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }

  async updateProfileAvatar(payload: { userName: string; avatar: string }) {
    return this.request<{ success: boolean; user: any }>('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(payload)
    });
  }

  // 2. Dashboard Summary
  async getDashboardSummary(userName: string = 'Diwakar') {
    return this.request<any>(`/dashboard/summary?user=${encodeURIComponent(userName)}`);
  }

  // 3. YouTube Courses & Playlists
  async getCourses() {
    return this.request<any[]>('/courses');
  }

  async createCourse(payload: {
    title: string;
    subject: string;
    youtubeUrl: string;
    addedBy: string;
    currentLesson?: string;
    totalLessons?: string;
  }) {
    return this.request<any>('/courses', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }

  async deleteCourse(courseId: string) {
    return this.request<any>(`/courses/${courseId}`, {
      method: 'DELETE'
    });
  }

  async updateCurrentlyWatching(payload: {
    userName: string;
    title: string;
    url: string;
    subject: string;
  }) {
    return this.request<any>('/courses/activity', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }

  // 4. Partner Live Chat
  async getPartnerChat() {
    return this.request<any[]>('/friends/chat');
  }

  async sendPartnerChatMessage(payload: { sender: string; text: string }) {
    return this.request<any>('/friends/chat', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }

  // 5. DSA Study Sessions
  async getDsaSessions() {
    return this.request<any[]>('/dsa/sessions');
  }

  async createDsaSession(payload: {
    user: string;
    topic: string;
    platform: string;
    durationMinutes: number;
    problemsCount: number;
    notes?: string;
  }) {
    return this.request<any>('/dsa/sessions', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }

  // 6. Coding Question PDF Sheets
  async getPdfQuestionSheets() {
    return this.request<any[]>('/notes/pdf-sheets');
  }

  async createPdfQuestionSheet(payload: {
    title: string;
    subject: string;
    questions: { id: string; title: string; platform?: string; completed: boolean }[];
  }) {
    return this.request<any>('/notes/pdf-sheets', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }

  async togglePdfQuestion(sheetId: string, questionId: string, completed: boolean) {
    return this.request<any>(`/notes/pdf-sheets/${sheetId}/toggle`, {
      method: 'PUT',
      body: JSON.stringify({ questionId, completed })
    });
  }

  // 7. Notes
  async getNotes() {
    return this.request<any[]>('/notes');
  }

  async createNote(payload: { title: string; content: string; tags?: string[] }) {
    return this.request<any>('/notes', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }

  async deleteNote(noteId: string) {
    return this.request<any>(`/notes/${noteId}`, {
      method: 'DELETE'
    });
  }

  async updateMe(updates: any) {
    return this.request<any>('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
  }

  // 8. Daily Tasks
  async getDailyTasks() {
    return this.request<any[]>('/habits/daily-tasks');
  }

  async toggleDailyTask(taskId: string, completed: boolean) {
    return this.request<any>(`/habits/daily-tasks/${taskId}`, {
      method: 'PUT',
      body: JSON.stringify({ completed })
    });
  }

  async createDailyTask(payload: any) {
    return this.request<any>('/habits/daily-tasks', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }

  async updateWatching(userName: string, currentlyWatching: any) {
    return this.request<any>('/user/watching', {
      method: 'POST',
      body: JSON.stringify({ userName, currentlyWatching })
    });
  }

  // 9. Focus Timer & Study Sessions
  async getStudySessions() {
    return this.request<any[]>('/study/sessions');
  }

  async createStudySession(payload: {
    user?: string;
    subject_name?: string;
    duration_minutes: number;
    notes?: string;
    completed?: boolean;
  }) {
    return this.request<any>('/study/sessions', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }

  // 10. Real-Time Database Sync & Timetable
  async getSyncData() {
    return this.request<{
      success: boolean;
      users: any[];
      studySessions: any[];
      dsaSessions: any[];
      courses: any[];
      notes: any[];
      pdfQuestionSheets: any[];
      dailyTasks: any[];
      partnerChat: any[];
      youtubeApiKey?: string;
    }>('/sync');
  }

  async punishResetUser(payload: {
    userName: string;
    isCatastrophicReset?: boolean;
    penaltyXp?: number;
    reason?: string;
  }) {
    return this.request<{ success: boolean; user: any }>('/auth/punish-reset', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }

  async getYoutubeKey() {
    return this.request<{ apiKey: string }>('/youtube/key');
  }

  async setYoutubeKey(apiKey: string) {
    return this.request<{ success: boolean; apiKey: string }>('/youtube/key', {
      method: 'POST',
      body: JSON.stringify({ apiKey })
    });
  }

  async getTimetableClasses() {
    return this.request<any[]>('/timetable/classes');
  }

  // 11. DSA Progress & Roadmaps
  async updateDsaProgress(problemId: string, payload: any) {
    return this.request<any>(`/dsa/problems/${problemId}/progress`, {
      method: 'PUT',
      body: JSON.stringify(payload)
    });
  }

  async updateMlTopic(topicId: string, completed: boolean) {
    return this.request<any>(`/ml/topics/${topicId}/progress`, {
      method: 'PUT',
      body: JSON.stringify({ completed })
    });
  }

  // 12. Project Tasks
  async updateTaskStatus(taskId: string, status: string) {
    return this.request<any>(`/projects/tasks/${taskId}`, {
      method: 'PATCH',
      body: JSON.stringify({ status })
    });
  }

  async createTask(payload: any) {
    return this.request<any>('/projects/tasks', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }

  // 13. Habits & Goals
  async logHabit(habitId: string, payload: any) {
    return this.request<any>(`/habits/${habitId}/logs`, {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }

  async updateGoalProgress(goalId: string, progress: number) {
    return this.request<any>(`/goals/${goalId}`, {
      method: 'PATCH',
      body: JSON.stringify({ progress })
    });
  }

  // 14. Local Ollama AI Study Copilot
  async checkAiStatus() {
    return this.request<{
      online: boolean;
      host?: string;
      activeModel?: string;
      hardware?: string;
      modelsCount?: number;
      message?: string;
    }>('/ai/status');
  }

  async getAiModels() {
    return this.request<Array<{
      id: string;
      name: string;
      provider: string;
      badge?: string;
      description: string;
      accentColor: string;
      isLocal?: boolean;
    }>>('/ai/models');
  }

  async sendAiChat(payload: {
    model?: string;
    messages: Array<{ role: string; content: string }>;
    user?: string;
  }) {
    return this.request<{
      success: boolean;
      message: { role: string; content: string };
      model: string;
      total_duration?: number;
      eval_count?: number;
      fallback?: boolean;
    }>('/ai/chat', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }
}

export const api = new ApiClient();
