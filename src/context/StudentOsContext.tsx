import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { triggerSparkleConfetti as confetti } from '../utils/confettiHelper';
import { Capacitor } from '@capacitor/core';
import { LocalNotifications } from '@capacitor/local-notifications';
import { StatusBar, Style as StatusBarStyle } from '@capacitor/status-bar';
import { api } from '../services/api';
import { cloudSync } from '../services/cloudSync';
import { realtimeWs } from '../services/realtimeWs';
import { GeminiService } from '../services/gemini';
import { YouTubeService } from '../services/youtube';
import { savePdfToIndexedDb, deletePdfFromIndexedDb } from '../services/pdfStorage';
import {
  StudentProfile,
  FriendProfile,
  TimetableClass,
  TimetableScheduleSlot,
  StudySession,
  DsaSession,
  DsaProblem,
  DsaStatus,
  VideoCourse,
  PlaylistLecture,
  PdfQuestionSheet,
  PdfQuestionItem,
  DailyTask,
  MlMilestone,
  Habit,
  Goal,
  HeatmapDay,
  YouTubeRecommendation,
  ChatMessage,
  StudentNote
} from '../types/studentOs';

interface StudentOsContextType {
  // Navigation & View
  activeModule: string;
  setActiveModule: (module: string) => void;
  isAiChatOpen: boolean;
  setIsAiChatOpen: (open: boolean) => void;
  isProfileModalOpen: boolean;
  setIsProfileModalOpen: (open: boolean) => void;

  // Real-Time Multi-User Auth (Diwakar & Ayush)
  currentUser: 'Diwakar' | 'Ayush';
  isBackendConnected: boolean;
  refreshBackendData: () => Promise<void>;
  isAuthenticated: boolean;
  loginWithEntryCode: (user: 'Diwakar' | 'Ayush', code: string) => Promise<boolean>;
  logout: () => void;
  isAyushPasswordSet: () => boolean;
  setAyushPermanentPassword: (password: string) => Promise<boolean>;

  // Gemini & YouTube API Key Management
  geminiApiKey: string;
  setGeminiApiKey: (key: string) => void;
  youtubeApiKey: string;
  setYoutubeApiKey: (key: string) => void;
  isAiThinking: boolean;

  // Task Punishment & Progress Deletion System
  enforceTaskAccountability: (manual?: boolean) => Promise<{ punished: boolean; message: string; wiped: boolean }>;
  dismissPunishmentAlert: () => void;
  punishmentModalOpen: boolean;
  setPunishmentModalOpen: (open: boolean) => void;
  punishmentDetails: { reason: string; penaltyXp: number; isWiped: boolean; prevXp: number; newXp: number } | null;

  // Profile & User
  profile: StudentProfile;
  updateProfile: (updates: Partial<StudentProfile>) => void;
  updateProfileAvatar: (avatarUrl: string) => void;

  // Partner Co-Study (Diwakar & Ayush)
  activeFriend: FriendProfile;
  setActiveFriend: (friend: FriendProfile) => void;
  friendStudyStatus: string;
  sendFriendNudge: (type: 'nudge' | 'coffee' | 'cheer') => void;
  partnerChatMessages: Array<{ id: string; sender: string; text: string; timestamp: string }>;
  sendPartnerChatMessage: (text: string) => void;

  // Notes & Coding Question Sheets
  notes: StudentNote[];
  addNote: (note: { title: string; content: string; tags: string[]; pdfUrl?: string; fileName?: string; fileSize?: string }) => void;
  deleteNote: (id: string) => void;
  pdfQuestionSheets: PdfQuestionSheet[];
  addPdfQuestionSheet: (sheet: Omit<PdfQuestionSheet, 'id' | 'totalCount' | 'completedCount'>) => void;
  togglePdfQuestion: (sheetId: string, questionId: string, completed: boolean) => void;
  generateCodingSheetByAi: (topic: string) => Promise<void>;
  addQuestionFromScreenshot: (file: File, platform?: string, manualTitle?: string) => Promise<{ success: boolean; questionTitle: string }>;
  isVacationPaused: boolean;
  toggleVacationMode: () => { success: boolean; message: string; isProtected: boolean };
  hasWatchedPlaylistVideoToday: boolean;
  markPlaylistVideoWatchedToday: () => void;

  // Focus Timer & Study Telemetry
  timerSeconds: number;
  timerDurationMinutes: number;
  setTimerDurationMinutes: (minutes: number) => void;
  isTimerRunning: boolean;
  timerMode: 'focus' | 'short_break' | 'long_break';
  timerSubject: string;
  setTimerSubject: (subj: string) => void;
  startTimer: () => void;
  pauseTimer: () => void;
  resetTimer: (mode?: 'focus' | 'short_break' | 'long_break') => void;
  studySessions: StudySession[];
  addStudySession: (session: Omit<StudySession, 'id' | 'timestamp'>) => void;

  // Video Courses & YouTube Playlists (Image 1)
  courses: VideoCourse[];
  addCourse: (course: Omit<VideoCourse, 'id'>) => void;
  deleteCourse: (id: string) => void;
  currentWatchingVideo: { title: string; url: string; subject: string } | null;
  setCurrentWatchingVideo: (video: { title: string; url: string; subject: string } | null) => void;
  toggleLectureCompleted: (courseId: string, lectureId: string) => void;
  markAllLecturesCompleted: (courseId: string, markComplete?: boolean) => void;
  activePlayingCourse: VideoCourse | null;
  setActivePlayingCourse: (course: VideoCourse | null) => void;
  activeLecture: PlaylistLecture | null;
  setActiveLecture: (lecture: PlaylistLecture | null) => void;

  // Timetable & AI Schedule
  timetable: TimetableClass[];
  collegeWorkingHours: string;
  setCollegeWorkingHours: (hours: string) => void;
  timetableImageUrl: string | null;
  setTimetableImageUrl: (url: string | null) => void;
  timetableSchedule: TimetableScheduleSlot[];
  isTodayHoliday: boolean;
  setIsTodayHoliday: (isHoliday: boolean) => void;
  uploadTimetableImage: (file: File) => Promise<void>;
  generateAiStudySchedule: (isHoliday?: boolean) => Promise<void>;

  // DSA Tracker (Study Sessions Only)
  dsaSessions: DsaSession[];
  logDsaSession: (session: Omit<DsaSession, 'id' | 'timestamp'>) => void;
  dsaProblems: DsaProblem[];
  toggleDsaStatus: (problemId: string, newStatus: DsaStatus) => void;
  addDsaProblem: (problem: Omit<DsaProblem, 'id'>) => void;

  // Machine Learning Playlist & Phase Course Engine
  mlMilestones: MlMilestone[];
  toggleMlMilestone: (id: string) => void;

  // Daily Habits & Quests (Streak counts if done)
  dailyTasks: DailyTask[];
  toggleDailyTask: (taskId: string, completed: boolean) => void;
  addDailyTask: (task: Omit<DailyTask, 'id' | 'completed'>) => void;
  deleteDailyTask: (taskId: string) => void;
  isStreakProtectedToday: boolean;
  habits: Habit[];
  toggleHabit: (habitId: string) => void;
  goals: Goal[];
  updateGoalProgress: (goalId: string, progress: number) => void;

  // Heatmap
  heatmapData: HeatmapDay[];

  // FUSE AI Chat (Gemini)
  chatMessages: ChatMessage[];
  sendChatMessage: (text: string) => Promise<void>;
  clearChat: () => void;

  // 30-Minute Streak & Task Notification System
  reminderToast: { title: string; message: string; pendingTasksCount: number } | null;
  dismissReminderToast: () => void;
  triggerManualStreakReminder: () => void;
  notificationSettings: {
    enabled: boolean;
    backgroundEnabled: boolean;
    muteInAppPopups: boolean;
    intervalMinutes: number;
  };
  updateNotificationSettings: (updates: Partial<{
    enabled: boolean;
    backgroundEnabled: boolean;
    muteInAppPopups: boolean;
    intervalMinutes: number;
  }>) => void;
  testBackgroundNotification: () => Promise<{ success: boolean; message: string }>;
  scheduleNativeReminders: (intervalMins?: number) => Promise<void>;
}

const DEFAULT_DIWAKAR_PROFILE: StudentProfile = {
  id: 'u_diwakar',
  name: 'Diwakar',
  handle: '@diwakar_dev',
  avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
  streakDays: 0,
  totalXp: 100,
  level: 1,
  strikes: 0,
  isPunished: false,
  dailyGoalHours: 4.0,
  dsaGoalHours: 2.0,
  mlGoalHours: 2.0,
  todayStudiedMinutes: 0,
  entryCode: import.meta.env.VITE_DIWAKAR_CODE || '',
  shortCode: import.meta.env.VITE_DIWAKAR_CODE || ''
};

const DEFAULT_AYUSH_PROFILE: StudentProfile = {
  id: 'u_ayush',
  name: 'Ayush',
  handle: '@ayush_ai',
  avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150',
  streakDays: 0,
  totalXp: 100,
  level: 1,
  strikes: 0,
  isPunished: false,
  dailyGoalHours: 4.0,
  dsaGoalHours: 2.0,
  mlGoalHours: 2.0,
  todayStudiedMinutes: 0,
  entryCode: 'AYUSH',
  shortCode: 'AYUSH'
};

const DEFAULT_COURSES: VideoCourse[] = [];

const DEFAULT_TIMETABLE: TimetableClass[] = [];

const DEFAULT_STUDY_SESSIONS: StudySession[] = [];

const DEFAULT_DSA_SESSIONS: DsaSession[] = [];

// Fresh start: Empty sheet — users add their own questions
const DEFAULT_PDF_SHEETS: PdfQuestionSheet[] = [];
const DEFAULT_DAILY_TASKS: DailyTask[] = [];

// Fresh start: No pre-seeded DSA problems
const DEFAULT_DSA_PROBLEMS: DsaProblem[] = [];

const DEFAULT_ML_MILESTONES: MlMilestone[] = [
  {
    id: 'm1',
    phase: 'Phase 1: Math & Foundations',
    title: 'Linear Algebra & Backpropagation from Scratch',
    description: 'Eigenvalues, vector calculus, computational graphs and building Micrograd.',
    completed: false,
    resources: [{ name: 'Andrej Karpathy Micrograd', url: 'https://www.youtube.com/watch?v=VMj-3S1tku0' }]
  },
  {
    id: 'm2',
    phase: 'Phase 2: Deep Language Modeling',
    title: 'Autoregressive LM & MLP Makemore',
    description: 'Character-level language modeling, loss functions and cross-entropy.',
    completed: false,
    resources: [{ name: 'Makemore Series', url: 'https://www.youtube.com/watch?v=PaCmpygFfXo' }]
  },
  {
    id: 'm3',
    phase: 'Phase 3: Transformer Architecture',
    title: 'Self-Attention & Building GPT from Scratch',
    description: 'Multi-Head Attention, residual connections, and positional encodings.',
    completed: false,
    resources: [{ name: "Let's build GPT", url: 'https://www.youtube.com/watch?v=kCc8FmEb1nY' }]
  }
];

// Helper: check if object has valid non-empty fields
const isValidObject = (obj: any): boolean => {
  return obj && typeof obj === 'object' && Object.keys(obj).length > 0;
};

const StudentOsContext = createContext<StudentOsContextType | undefined>(undefined);

// Peer-to-peer Broadcast Channel for real-time Duo sync between Diwakar & Ayush
const broadcastChannel = typeof window !== 'undefined' ? new BroadcastChannel('FUSION_DUO_SYNC') : null;

// User-specific private AI chat helper: "there chat with ai will be different"
const getInitialChatMessages = (user: string): ChatMessage[] => {
  const clean = (user || 'diwakar').toLowerCase().includes('ayush') ? 'ayush' : 'diwakar';
  try {
    const saved = localStorage.getItem(`fusion_chat_messages_${clean}`);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}
  return [
    {
      id: 'msg_welcome',
      sender: 'assistant',
      model: 'FUSE (Gemini)',
      text: `Hey ${user}! I am **FUSE**—your private AI study copilot powered by Google Gemini. I have complete access to your study schedules, YouTube playlists, DSA telemetry, and notes. How can I help you dominate today's session?`,
      timestamp: '09:00 AM'
    }
  ];
};

// Shared YouTube Playlist Merger with Tombstone Deletion Support
const mergePlaylists = (existing: VideoCourse[], deletedIds: string[] = [], ...lists: (VideoCourse[] | undefined)[]): VideoCourse[] => {
  const map = new Map<string, VideoCourse>();
  const deletedSet = new Set(deletedIds);

  const getKey = (c: VideoCourse) => {
    const ytId = YouTubeService.extractPlaylistId(c.youtubeUrl || '') || YouTubeService.extractVideoId(c.youtubeUrl || '');
    return ytId || c.id || (c.title ? c.title.toLowerCase().trim() : '');
  };

  const isDeleted = (c: VideoCourse) => {
    if (!c) return true;
    if (c.id && deletedSet.has(c.id)) return true;
    const k = getKey(c);
    if (k && deletedSet.has(k)) return true;
    return false;
  };

  if (Array.isArray(existing)) {
    existing.forEach(c => {
      if (!isDeleted(c)) {
        const k = getKey(c);
        if (k) map.set(k, c);
      }
    });
  }

  lists.forEach(list => {
    if (Array.isArray(list)) {
      list.forEach(c => {
        if (!isDeleted(c)) {
          const k = getKey(c);
          if (!k) return;
          if (!map.has(k)) {
            map.set(k, c);
          } else {
            const prev = map.get(k)!;
            const prevLecs = prev.lectures?.length || 0;
            const newLecs = c.lectures?.length || 0;
            if (newLecs > prevLecs) {
              map.set(k, { ...prev, ...c });
            }
          }
        }
      });
    }
  });

  return Array.from(map.values());
};

export const StudentOsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Navigation
  const [activeModule, setActiveModule] = useState<string>('dashboard');
  const [isAiChatOpen, setIsAiChatOpen] = useState<boolean>(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState<boolean>(false);

  // Auth State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('fusion_authenticated') === 'true';
  });

  const [currentUser, setCurrentUser] = useState<'Diwakar' | 'Ayush'>(() => {
    return (localStorage.getItem('fusion_user') as 'Diwakar' | 'Ayush') || 'Diwakar';
  });

  const [profile, setProfile] = useState<StudentProfile>(() => {
    const now = new Date();
    const todayLocal = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    const todayIso = now.toISOString().split('T')[0];
    const userKey = ((localStorage.getItem('fusion_user') as string) || 'Diwakar').toLowerCase();
    const savedDate = localStorage.getItem(`fusion_studied_date_${userKey}`);
    const isSameDay = savedDate === todayLocal || savedDate === todayIso;

    const rawSavedMinutes = localStorage.getItem(`fusion_studied_minutes_${userKey}`);
    const directMinutes = (rawSavedMinutes && isSameDay) ? (parseInt(rawSavedMinutes, 10) || 0) : 0;

    const saved = localStorage.getItem(`fusion_profile_${userKey}`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const profileMinutes = isSameDay ? (parsed.todayStudiedMinutes ?? 0) : 0;
        return {
          ...parsed,
          streakDays: parsed.streakDays ?? 0,
          totalXp: Math.max(100, parsed.totalXp ?? 100),
          level: parsed.level ?? 1,
          todayStudiedMinutes: Math.max(profileMinutes, directMinutes)
        };
      } catch {}
    }
    const def = userKey.includes('ayush') ? DEFAULT_AYUSH_PROFILE : DEFAULT_DIWAKAR_PROFILE;
    return { ...def, todayStudiedMinutes: directMinutes };
  });

  const [activeFriend, setActiveFriend] = useState<FriendProfile>(() => {
    const isDiwakar = currentUser === 'Diwakar';
    return {
      name: isDiwakar ? 'Ayush' : 'Diwakar',
      handle: isDiwakar ? '@ayush_ai' : '@diwakar_dev',
      avatar: isDiwakar
        ? 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150'
        : 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
      streakDays: 0,
      todayStudiedMinutes: 0,
      totalXp: 100,
      isOnline: true,
      isFocusing: false,
      focusSubject: 'DSA',
      currentlyWatching: null // Null by default until active stream starts
    };
  });

  // Gemini API Key Management
  const [geminiApiKey, setGeminiApiKeyState] = useState<string>(() => {
    return GeminiService.getApiKey(currentUser);
  });

  const setGeminiApiKey = (key: string) => {
    const clean = key.trim().replace(/^['"]|['"]$/g, '');
    setGeminiApiKeyState(clean);
    GeminiService.setApiKey(currentUser, clean);
    cloudSync.pushState(currentUser, { geminiApiKey: clean });
  };

  // YouTube API Key Management
  const [youtubeApiKey, setYoutubeApiKeyState] = useState<string>(() => {
    return YouTubeService.getApiKey(currentUser);
  });

  const setYoutubeApiKey = (key: string) => {
    const clean = key.trim().replace(/^['"]|['"]$/g, '');
    setYoutubeApiKeyState(clean);
    YouTubeService.setApiKey(currentUser, clean);
    api.setYoutubeKey(clean);
    cloudSync.pushState(currentUser, { youtubeApiKey: clean });
  };

  const [isAiThinking, setIsAiThinking] = useState<boolean>(false);

  // Punishment & Task Accountability State
  const [punishmentModalOpen, setPunishmentModalOpen] = useState<boolean>(false);
  const [punishmentDetails, setPunishmentDetails] = useState<{
    reason: string;
    penaltyXp: number;
    isWiped: boolean;
    prevXp: number;
    newXp: number;
  } | null>(null);

  // Partner Chat Messages (Real-time synced across Web & Android)
  const [partnerChatMessages, setPartnerChatMessages] = useState<Array<{ id: string; sender: string; text: string; timestamp: string }>>(() => {
    try {
      const saved = localStorage.getItem('fusion_partner_chat');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const lastReceivedNudgeTimestamp = useRef<number>(Date.now());

  // Timetable State
  const [timetable, setTimetable] = useState<TimetableClass[]>(() => {
    const saved = localStorage.getItem('fusion_timetable');
    return saved ? JSON.parse(saved) : DEFAULT_TIMETABLE;
  });

  const [collegeWorkingHours, setCollegeWorkingHours] = useState<string>(() => {
    return localStorage.getItem('fusion_college_hours') || '09:00 AM - 04:00 PM';
  });

  const handleSetCollegeWorkingHours = (hours: string) => {
    const trimmed = hours.trim();
    setCollegeWorkingHours(trimmed);
    localStorage.setItem('fusion_college_hours', trimmed);
  };

  const [timetableImageUrl, setTimetableImageUrl] = useState<string | null>(() => {
    return localStorage.getItem('fusion_timetable_image');
  });

  const [isTodayHoliday, setIsTodayHoliday] = useState<boolean>(() => {
    const todayDay = new Date().getDay();
    // Monday is 1, Tuesday is 2
    return todayDay === 1 || todayDay === 2;
  });

  const [timetableSchedule, setTimetableSchedule] = useState<TimetableScheduleSlot[]>(() => {
    try {
      const saved = localStorage.getItem('fusion_timetable_schedule');
      if (saved) return JSON.parse(saved);
    } catch {}
    return [];
  });

  // Courses & Playlists (Fresh start, no dummy courses)
  const [courses, setCourses] = useState<VideoCourse[]>(() => {
    const saved = localStorage.getItem('fusion_courses');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          const filtered = parsed.filter(
            (c: any) =>
              !['c_1', 'c_2', 'c_3'].includes(c.id) &&
              !c.title?.toLowerCase().includes('striver') &&
              !c.title?.toLowerCase().includes('karpathy')
          );
          return filtered;
        }
      } catch {}
    }
    return [];
  });

  const [activePlayingCourse, setActivePlayingCourse] = useState<VideoCourse | null>(() => courses[0] || null);
  const [activeLecture, setActiveLecture] = useState<PlaylistLecture | null>(() => courses[0]?.lectures?.[0] || null);

  const [currentWatchingVideo, setCurrentWatchingVideo] = useState<{ title: string; url: string; subject: string } | null>(null);

  // Study Sessions
  const [studySessions, setStudySessions] = useState<StudySession[]>(() => {
    const saved = localStorage.getItem('fusion_study_sessions');
    return saved ? JSON.parse(saved) : DEFAULT_STUDY_SESSIONS;
  });

  // DSA Sessions
  const [dsaSessions, setDsaSessions] = useState<DsaSession[]>(() => {
    const saved = localStorage.getItem('fusion_dsa_sessions');
    return saved ? JSON.parse(saved) : DEFAULT_DSA_SESSIONS;
  });

  const [dsaProblems, setDsaProblems] = useState<DsaProblem[]>(() => {
    const saved = localStorage.getItem('fusion_dsa_problems');
    return saved ? JSON.parse(saved) : DEFAULT_DSA_PROBLEMS;
  });

  // PDF sheets (Unified into one single master checklist)
  const [pdfQuestionSheets, setPdfQuestionSheets] = useState<PdfQuestionSheet[]>(() => {
    const saved = localStorage.getItem('fusion_pdf_sheets');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const allQs: PdfQuestionItem[] = parsed.flatMap((s: any) => s.questions || []);
          const seen = new Set<string>();
          const deduped = allQs.filter(q => {
            const key = (q.title || '').trim().toLowerCase();
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
          });
          return [{
            id: 'sheet_unified_master',
            title: 'Master DSA & Coding Checklist (Verified Solutions)',
            subject: 'DSA & Coding',
            totalCount: deduped.length,
            completedCount: deduped.filter((q: any) => q.completed).length,
            questions: deduped
          }];
        }
      } catch {}
    }
    return DEFAULT_PDF_SHEETS;
  });

  // Vacation / Freeze Pause Mode
  const [isVacationPaused, setIsVacationPaused] = useState<boolean>(() => {
    return localStorage.getItem('fusion_vacation_paused') === 'true';
  });

  // Deleted Courses Tombstone List
  const [deletedCourseIds, setDeletedCourseIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('fusion_deleted_course_ids');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Daily tasks & Habits (Clean start without tough default tasks)
  const [dailyTasks, setDailyTasks] = useState<DailyTask[]>(() => {
    const saved = localStorage.getItem('fusion_daily_tasks');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.filter(t => !['dt_1', 'dt_2', 'dt_3', 'dt_4'].includes(t.id));
        }
      } catch {}
    }
    return DEFAULT_DAILY_TASKS;
  });

  const [habits, setHabits] = useState<Habit[]>(() => {
    try {
      const saved = localStorage.getItem('fusion_habits');
      if (saved) return JSON.parse(saved);
    } catch {}
    return [
      { id: 'h1', title: 'Daily LeetCode 2 Problems', icon: 'Code', streak: 0, completedToday: false, weeklyHistory: [false, false, false, false, false, false, false] },
      { id: 'h2', title: '2 Hours Machine Learning Deep Focus', icon: 'Brain', streak: 0, completedToday: false, weeklyHistory: [false, false, false, false, false, false] },
      { id: 'h3', title: '2 Hours DSA Deep Practice Block', icon: 'Zap', streak: 0, completedToday: false, weeklyHistory: [false, false, false, false, false, false, false] },
      { id: 'h4', title: 'Spaced Repetition Concept Review', icon: 'BookOpen', streak: 0, completedToday: false, weeklyHistory: [false, false, false, false, false, false, false] }
    ];
  });

  const [goals, setGoals] = useState<Goal[]>(() => {
    try {
      const saved = localStorage.getItem('fusion_goals');
      if (saved) return JSON.parse(saved);
    } catch {}
    return [
      { id: 'g1', title: 'Master 150 Blind LeetCode Problems', category: 'DSA', targetDate: 'Nov 2026', progress: 0 },
      { id: 'g2', title: 'Build GPT-2 from Scratch in PyTorch', category: 'Machine Learning', targetDate: 'Oct 2026', progress: 0 },
      { id: 'g3', title: 'Complete Striver Graph & DP Series', category: 'DSA', targetDate: 'Dec 2026', progress: 0 }
    ];
  });

  const DEFAULT_INITIAL_NOTES: StudentNote[] = [];

  const [notes, setNotes] = useState<StudentNote[]>(() => {
    const saved = localStorage.getItem('fusion_notes');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.filter(
            (n: any) =>
              n.id !== 'n1' &&
              n.id !== 'n2' &&
              !n.title?.toLowerCase().includes('kahn') &&
              !n.title?.toLowerCase().includes('multi-head')
          );
        }
      } catch {}
    }
    return [];
  });

  const [mlMilestones, setMlMilestones] = useState<MlMilestone[]>(DEFAULT_ML_MILESTONES);

  // Focus Timer State - Persisted across reloads so timer never resets to starting
  const [timerDurationMinutes, setTimerDurationMinutes] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('fusion_timer_duration');
      if (saved) {
        const parsed = parseInt(saved, 10);
        if (!isNaN(parsed) && parsed > 0) return parsed;
      }
    } catch {}
    return 25;
  });

  const [timerMode, setTimerMode] = useState<'focus' | 'short_break' | 'long_break'>(() => {
    try {
      const saved = localStorage.getItem('fusion_timer_mode');
      if (saved === 'focus' || saved === 'short_break' || saved === 'long_break') return saved;
    } catch {}
    return 'focus';
  });

  const [timerSubject, setTimerSubject] = useState<string>(() => {
    try {
      return localStorage.getItem('fusion_timer_subject') || 'DSA';
    } catch {
      return 'DSA';
    }
  });

  const [timerSeconds, setTimerSeconds] = useState<number>(() => {
    try {
      const savedSecs = localStorage.getItem('fusion_timer_seconds');
      if (savedSecs !== null) {
        const parsed = parseInt(savedSecs, 10);
        if (!isNaN(parsed) && parsed >= 0) return parsed;
      }
      const savedDur = localStorage.getItem('fusion_timer_duration');
      const dur = savedDur ? parseInt(savedDur, 10) || 25 : 25;
      return dur * 60;
    } catch {
      return 25 * 60;
    }
  });

  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);
  const elapsedFocusSeconds = useRef<number>(0);
  const currentFocusSessionSeconds = useRef<number>(0);

  // Sync Focus Timer State to LocalStorage
  useEffect(() => {
    try { localStorage.setItem('fusion_timer_duration', String(timerDurationMinutes)); } catch {}
  }, [timerDurationMinutes]);

  useEffect(() => {
    try { localStorage.setItem('fusion_timer_mode', timerMode); } catch {}
  }, [timerMode]);

  useEffect(() => {
    try { localStorage.setItem('fusion_timer_subject', timerSubject); } catch {}
  }, [timerSubject]);

  useEffect(() => {
    try { localStorage.setItem('fusion_timer_seconds', String(timerSeconds)); } catch {}
  }, [timerSeconds]);

  // Backend connection flag
  const [isBackendConnected, setIsBackendConnected] = useState<boolean>(false);

  // Chat messages with FUSE (Private per user: Diwakar vs Ayush)
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(() => {
    return getInitialChatMessages(currentUser);
  });

  // Streak verification (During vacation pause, user must watch at least 1 playlist video to protect streak)
  const [userWatchedVideoToday, setUserWatchedVideoToday] = useState<boolean>(() => {
    const today = new Date().toISOString().split('T')[0];
    return localStorage.getItem('fusion_watched_video_date') === today;
  });

  const markPlaylistVideoWatchedToday = useCallback(() => {
    const today = new Date().toISOString().split('T')[0];
    localStorage.setItem('fusion_watched_video_date', today);
    setUserWatchedVideoToday(true);
  }, []);

  const hasWatchedPlaylistVideoToday = userWatchedVideoToday || studySessions.some(
    s => s.duration_minutes >= 5 || s.notes?.toLowerCase().includes('lecture') || s.subject_name.toLowerCase().includes('video')
  ) || profile.todayStudiedMinutes >= 10 || courses.some(c => c.lectures.some(l => l.completed));

  const toggleVacationMode = useCallback((): { success: boolean; message: string; isProtected: boolean } => {
    if (isVacationPaused) {
      setIsVacationPaused(false);
      localStorage.setItem('fusion_vacation_paused', 'false');
      return {
        success: true,
        message: 'Vacation Pause ended! You are back in active study mode.',
        isProtected: true
      };
    } else {
      if (hasWatchedPlaylistVideoToday) {
        setIsVacationPaused(true);
        localStorage.setItem('fusion_vacation_paused', 'true');
        return {
          success: true,
          message: 'Vacation Pause Activated! Video playlist requirement satisfied. Your streak is safely frozen and XP deduction is protected.',
          isProtected: true
        };
      } else {
        // User has NOT watched a video from the playlist today!
        // "otherwise Streak will be broken"
        setIsVacationPaused(true);
        localStorage.setItem('fusion_vacation_paused', 'true');
        setProfile(p => ({ ...p, streakDays: 0 }));
        return {
          success: true,
          message: 'Vacation Pause Activated WITHOUT watching 1 playlist video! Your streak has been broken (reset to 0). Daily XP deduction is now frozen.',
          isProtected: false
        };
      }
    }
  }, [isVacationPaused, hasWatchedPlaylistVideoToday]);

  const isStreakProtectedToday = isVacationPaused
    ? hasWatchedPlaylistVideoToday
    : dailyTasks.some(t => t.isCoreStreakTask && t.completed);

  // Auto-increment streak when core tasks completed today (once per calendar day only)
  useEffect(() => {
    if (!isAuthenticated || !isStreakProtectedToday) return;
    const today = new Date().toISOString().split('T')[0];
    const lastStreakDate = localStorage.getItem(`fusion_last_streak_date_${currentUser}`);
    if (lastStreakDate === today) return; // Already counted today
    // New day with tasks done — increment streak!
    localStorage.setItem(`fusion_last_streak_date_${currentUser}`, today);
    setProfile(p => ({ ...p, streakDays: Math.max(1, p.streakDays + 1) }));
  }, [isAuthenticated, isStreakProtectedToday, currentUser]);

  // Heatmap generation from actual study sessions with accurate local calendar date parsing
  const generateHeatmap = useCallback(() => {
    const days: HeatmapDay[] = [];
    const now = new Date();

    const formatLocalDate = (date: Date): string => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    const todayStr = formatLocalDate(now);
    const todayIso = now.toISOString().split('T')[0];

    for (let i = 89; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dateStr = formatLocalDate(d);
      const isoStr = d.toISOString().split('T')[0];

      const dayMinutes = studySessions
        .filter(s => {
          if (!s) return false;
          const nameLower = (s.user_name || (s as any).userName || '').toLowerCase();
          const idLower = (s.user_id || (s as any).userId || '').toLowerCase();
          const currentLower = (currentUser || '').toLowerCase();
          const profileLower = (profile.name || '').toLowerCase();
          const userMatch = (
            nameLower === currentLower ||
            nameLower === profileLower ||
            idLower === `u_${currentLower}` ||
            idLower.includes(currentLower)
          );
          if (!userMatch) return false;
          const ts = s.timestamp || '';
          return ts.startsWith(dateStr) || ts.startsWith(isoStr);
        })
        .reduce((sum, s) => sum + (s.duration_minutes || (s as any).durationMinutes || 0), 0);

      // Include active study minutes for today
      const isToday = dateStr === todayStr || isoStr === todayIso;
      const effectiveMinutes = isToday ? Math.max(dayMinutes, profile.todayStudiedMinutes || 0) : dayMinutes;

      let intensity: 0 | 1 | 2 | 3 | 4 = 0;
      if (effectiveMinutes >= 180) intensity = 4;
      else if (effectiveMinutes >= 120) intensity = 3;
      else if (effectiveMinutes >= 60) intensity = 2;
      else if (effectiveMinutes > 0) intensity = 1;

      days.push({ date: dateStr, count: effectiveMinutes, intensity });
    }
    return days;
  }, [studySessions, currentUser, profile.name, profile.todayStudiedMinutes]);

  const [heatmapData, setHeatmapData] = useState<HeatmapDay[]>(generateHeatmap);

  useEffect(() => {
    setHeatmapData(generateHeatmap());
  }, [generateHeatmap]);

  // Reconcile today's studied minutes with actual studySessions on mount / session updates
  useEffect(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    const sessionMinutes = studySessions
      .filter(s => {
        if (!s || !s.timestamp) return false;
        const userMatch = (s.user_name?.toLowerCase() === currentUser.toLowerCase() || (s as any).userName?.toLowerCase() === currentUser.toLowerCase());
        return userMatch && s.timestamp.startsWith(todayStr);
      })
      .reduce((sum, s) => sum + (Number(s.duration_minutes) || 0), 0);

    if (sessionMinutes > profile.todayStudiedMinutes) {
      setProfile(p => {
        const nextStudied = Math.max(p.todayStudiedMinutes, sessionMinutes);
        const updated = { ...p, todayStudiedMinutes: nextStudied };
        try {
          localStorage.setItem(`fusion_profile_${currentUser.toLowerCase()}`, JSON.stringify(updated));
          localStorage.setItem(`fusion_studied_minutes_${currentUser.toLowerCase()}`, String(nextStudied));
          localStorage.setItem(`fusion_studied_date_${currentUser.toLowerCase()}`, todayStr);
        } catch {}
        return updated;
      });
    }
  }, [studySessions, currentUser]);

  // Duo BroadcastChannel Receiver for Real-Time Sync
  useEffect(() => {
    if (!broadcastChannel) return;

    const handleMessage = (event: MessageEvent) => {
      const { type, payload, sender } = event.data || {};
      if (sender === currentUser) return; // ignore self

      if (type === 'PARTNER_FOCUS_UPDATE') {
        setActiveFriend(prev => ({
          ...prev,
          isFocusing: payload.isFocusing,
          focusSubject: payload.focusSubject,
          todayStudiedMinutes: payload.todayStudiedMinutes || prev.todayStudiedMinutes
        }));
      } else if (type === 'PARTNER_WATCHING_UPDATE') {
        setActiveFriend(prev => ({
          ...prev,
          currentlyWatching: payload
        }));
      } else if (type === 'PARTNER_CHAT_MESSAGE') {
        if (!payload?.text) return;
        setPartnerChatMessages(prev => {
          const next = cloudSync.mergeChatMessages(prev, [payload]);
          if (next.length === prev.length) return prev;
          try { localStorage.setItem('fusion_partner_chat', JSON.stringify(next)); } catch {}
          return next;
        });
      } else if (type === 'PARTNER_NUDGE') {
        confetti({ particleCount: 70, spread: 80, origin: { y: 0.5 } });
      } else if (type === 'PARTNER_TASK_TOGGLE') {
        setDailyTasks(prev => prev.map(t => t.id === payload.taskId ? { ...t, completed: payload.completed, completedBy: payload.completedBy } : t));
        if (payload.completed) {
          setActiveFriend(prev => ({
            ...prev,
            totalXp: prev.totalXp + (payload.exp || 100)
          }));
        }
      } else if (type === 'PARTNER_TASK_ADDED') {
        setDailyTasks(prev => [payload, ...prev.filter(t => t.id !== payload.id)]);
      } else if (type === 'PARTNER_TASK_DELETE') {
        setDailyTasks(prev => prev.filter(t => t.id !== payload.taskId));
      } else if (type === 'PARTNER_COURSE_DELETE') {
        setCourses(prev => prev.filter(c => c.id !== payload.courseId));
        setDeletedCourseIds(prev => Array.from(new Set([...prev, payload.courseId])));
      } else if (type === 'PARTNER_QUESTION_SOLVED') {
        if (payload.question) {
          setPdfQuestionSheets(prev => {
            const allExisting = prev.flatMap(s => s.questions);
            const updatedQs = [payload.question, ...allExisting.filter(q => q.id !== payload.question.id)];
            return [{
              id: 'sheet_unified_master',
              title: 'Master DSA & Coding Checklist (Verified Solutions)',
              subject: 'DSA & Coding',
              totalCount: updatedQs.length,
              completedCount: updatedQs.filter(q => q.completed).length,
              questions: updatedQs
            }];
          });
          setActiveFriend(prev => ({
            ...prev,
            totalXp: prev.totalXp + (payload.xpGained || 35)
          }));
        }
      }
    };

    broadcastChannel.addEventListener('message', handleMessage);
    return () => broadcastChannel.removeEventListener('message', handleMessage);
  }, [currentUser]);

  // Periodic heartbeat broadcast
  useEffect(() => {
    if (!broadcastChannel) return;
    const interval = setInterval(() => {
      broadcastChannel.postMessage({
        type: 'PARTNER_FOCUS_UPDATE',
        sender: currentUser,
        payload: {
          isFocusing: isTimerRunning,
          focusSubject: timerSubject,
          todayStudiedMinutes: profile.todayStudiedMinutes
        }
      });
    }, 10000);
    return () => clearInterval(interval);
  }, [currentUser, isTimerRunning, timerSubject, profile.todayStudiedMinutes]);

  const playNotificationChime = useCallback(() => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.setValueAtTime(880, ctx.currentTime + 0.14); // A5
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.45);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.45);
    } catch {}
  }, []);

  // Preload Ayush password from cloud if not locally stored
  useEffect(() => {
    if (!localStorage.getItem('fusion_ayush_password')) {
      cloudSync.fetchAyushPassword().then(pass => {
        if (pass) {
          localStorage.setItem('fusion_ayush_password', pass);
          localStorage.setItem('fusion_ayush_password_created', 'true');
        }
      }).catch(() => {});
    }
  }, []);

  const hasHydratedFromCloud = useRef<boolean>(false);

  // Real-Time 1-Second Bi-Directional Cloud State Synchronizer (Web <-> Android App)
  useEffect(() => {
    if (!isAuthenticated) return;

    const stopSync = cloudSync.startAutoSync(
      () => currentUser,
      (remoteData, partnerData, meta) => {
        hasHydratedFromCloud.current = true;
        if (Array.isArray(meta?.duoChat) && meta!.duoChat!.length > 0) {
          setPartnerChatMessages(prev => {
            const merged = cloudSync.mergeChatMessages(prev, meta!.duoChat!);
            if (merged.length === prev.length) return prev;
            try { localStorage.setItem('fusion_partner_chat', JSON.stringify(merged)); } catch {}
            return merged;
          });
        }
        if (remoteData) {
          if (remoteData.profile) {
            setProfile(prev => {
              const remote = remoteData.profile;
              const cleanName = (remote.name && remote.name.trim()) ? remote.name.trim() : prev.name;
              const cleanCollege = (remote.college && remote.college.trim()) ? remote.college.trim() : prev.college;
              const cleanBranch = (remote.branch && remote.branch.trim()) ? remote.branch.trim() : prev.branch;
              const cleanSemester = (remote.semester && remote.semester.trim()) ? remote.semester.trim() : prev.semester;
              const cleanAvatar = (remote.avatar && remote.avatar.trim()) ? remote.avatar.trim() : prev.avatar;
              const cleanHandle = (remote.handle && remote.handle.trim()) ? remote.handle.trim() : prev.handle;

              const updated: StudentProfile = {
                ...prev,
                ...remote,
                name: cleanName,
                college: cleanCollege,
                branch: cleanBranch,
                semester: cleanSemester,
                avatar: cleanAvatar,
                handle: cleanHandle,
                streakDays: Math.max(prev.streakDays, remote.streakDays ?? 0),
                totalXp: Math.max(prev.totalXp, remote.totalXp ?? 100),
                level: Math.max(prev.level, remote.level ?? 1),
                todayStudiedMinutes: Math.max(prev.todayStudiedMinutes, remote.todayStudiedMinutes ?? 0),
                dailyGoalHours: remote.dailyGoalHours || prev.dailyGoalHours || 4.0
              };
              try {
                localStorage.setItem(`fusion_profile_${currentUser.toLowerCase()}`, JSON.stringify(updated));
              } catch {}
              return updated;
            });
          }
          if (Array.isArray(remoteData.dailyTasks)) {
            setDailyTasks(remoteData.dailyTasks);
            try { localStorage.setItem('fusion_daily_tasks', JSON.stringify(remoteData.dailyTasks)); } catch {}
          }
          if (Array.isArray(remoteData.notes) && remoteData.notes.length > 0) {
            // Merge remote notes into local instead of blindly overwriting
            setNotes(prev => {
              const merged = [...prev];
              remoteData.notes!.forEach((rn: any) => {
                const idx = merged.findIndex(n => n.id === rn.id);
                if (idx >= 0) {
                  merged[idx] = { ...rn, pdfUrl: merged[idx].pdfUrl || rn.pdfUrl, owner: rn.owner || merged[idx].owner };
                } else {
                  merged.unshift(rn);
                }
              });
              try { localStorage.setItem('fusion_notes', JSON.stringify(merged)); } catch {}
              return merged;
            });
          }
          // Always fold in server sharedNotes + partner notes so both systems see each other
          {
            const shared = Array.isArray(meta?.sharedNotes) ? meta!.sharedNotes! : [];
            const partnerNotes = Array.isArray(partnerData?.notes) ? partnerData.notes : [];
            if (shared.length > 0 || partnerNotes.length > 0) {
              setNotes(prev => {
                const byId = new Map(prev.map(n => [n.id, n]));
                [...partnerNotes, ...shared].forEach((rn: any) => {
                  if (!rn?.id) return;
                  const existing = byId.get(rn.id);
                  byId.set(rn.id, {
                    ...(existing || {}),
                    ...rn,
                    pdfUrl: existing?.pdfUrl || rn.pdfUrl,
                    owner: rn.owner || existing?.owner
                  });
                });
                const merged = Array.from(byId.values());
                try { localStorage.setItem('fusion_notes', JSON.stringify(merged.map(n => ({ ...n, pdfUrl: undefined })))); } catch {}
                return merged;
              });
            }
          }
          if (remoteData.timetableSchedule && Array.isArray(remoteData.timetableSchedule)) {
            setTimetableSchedule(remoteData.timetableSchedule);
            try { localStorage.setItem('fusion_timetable_schedule', JSON.stringify(remoteData.timetableSchedule)); } catch {}
          }
          if (Array.isArray(remoteData.dsaTopics) && remoteData.dsaTopics.length > 0) {
            setDsaProblems(remoteData.dsaTopics);
            try { localStorage.setItem('fusion_dsa_problems', JSON.stringify(remoteData.dsaTopics)); } catch {}
          }
          if (Array.isArray(remoteData.studyLogs) && remoteData.studyLogs.length > 0) {
            setStudySessions(prev => {
              const merged = [...prev];
              remoteData.studyLogs!.forEach((rs: any) => {
                const idx = merged.findIndex(s => s.id === rs.id);
                if (idx >= 0) {
                  merged[idx] = { ...merged[idx], ...rs };
                } else {
                  merged.unshift(rs);
                }
              });
              try { localStorage.setItem('fusion_study_sessions', JSON.stringify(merged)); } catch {}
              return merged;
            });
          }
          // Sync deletedCourseIds tombstone list
          if (Array.isArray(remoteData.deletedCourseIds)) {
            setDeletedCourseIds(prev => {
              const merged = Array.from(new Set([...prev, ...(remoteData.deletedCourseIds || [])]));
              try { localStorage.setItem('fusion_deleted_course_ids', JSON.stringify(merged)); } catch {}
              return merged;
            });
          }
          // Shared YouTube Playlist Engine: respect deletions across devices
          const allPartnerCourses = Array.isArray(partnerData?.courses) ? partnerData.courses : [];
          const allRemoteCourses = Array.isArray(remoteData?.courses) ? remoteData.courses : [];
          if (allRemoteCourses.length > 0 || allPartnerCourses.length > 0) {
            setCourses(prev => {
              const activeDeleted = Array.from(new Set([...deletedCourseIds, ...(remoteData?.deletedCourseIds || [])]));
              const merged = mergePlaylists(prev, activeDeleted, allRemoteCourses, allPartnerCourses);
              try { localStorage.setItem('fusion_courses', JSON.stringify(merged)); } catch {}
              return merged;
            });
          }
          // Sync Coding & PDF Question Sheets
          if (Array.isArray(remoteData.pdfQuestionSheets) && remoteData.pdfQuestionSheets.length > 0) {
            setPdfQuestionSheets(remoteData.pdfQuestionSheets);
            try { localStorage.setItem('fusion_pdf_question_sheets', JSON.stringify(remoteData.pdfQuestionSheets)); } catch {}
          }
          // Sync Habits
          if (Array.isArray(remoteData.habits) && remoteData.habits.length > 0) {
            setHabits(remoteData.habits);
            try { localStorage.setItem('fusion_habits', JSON.stringify(remoteData.habits)); } catch {}
          }
          // Sync Goals
          if (Array.isArray(remoteData.goals) && remoteData.goals.length > 0) {
            setGoals(remoteData.goals);
            try { localStorage.setItem('fusion_goals', JSON.stringify(remoteData.goals)); } catch {}
          }
          // Sync ML Milestones
          if (Array.isArray(remoteData.mlMilestones) && remoteData.mlMilestones.length > 0) {
            setMlMilestones(remoteData.mlMilestones);
            try { localStorage.setItem('fusion_ml_milestones', JSON.stringify(remoteData.mlMilestones)); } catch {}
          }
          // Sync API keys strictly for current user
          if (remoteData.geminiApiKey && typeof remoteData.geminiApiKey === 'string' && remoteData.geminiApiKey.trim()) {
            const cleanKey = remoteData.geminiApiKey.trim();
            setGeminiApiKeyState(cleanKey);
            GeminiService.setApiKey(currentUser, cleanKey);
          }
          if (remoteData.youtubeApiKey && typeof remoteData.youtubeApiKey === 'string' && remoteData.youtubeApiKey.trim()) {
            const cleanKey = remoteData.youtubeApiKey.trim();
            setYoutubeApiKeyState(cleanKey);
            YouTubeService.setApiKey(currentUser, cleanKey);
          }
          // Sync user's private FUSE AI chat history
          if (Array.isArray(remoteData.aiChatMessages) && remoteData.aiChatMessages.length > 0) {
            setChatMessages(remoteData.aiChatMessages);
            try {
              localStorage.setItem(`fusion_chat_messages_${currentUser.toLowerCase()}`, JSON.stringify(remoteData.aiChatMessages));
            } catch {}
          }
          // Sync Vacation Mode
          if (remoteData.isVacationPaused !== undefined) {
            setIsVacationPaused(Boolean(remoteData.isVacationPaused));
            try { localStorage.setItem('fusion_vacation_paused', String(remoteData.isVacationPaused)); } catch {}
          }
          if (remoteData.hasWatchedPlaylistVideoToday !== undefined) {
            setUserWatchedVideoToday(Boolean(remoteData.hasWatchedPlaylistVideoToday));
            try { localStorage.setItem('fusion_watched_video_date', remoteData.hasWatchedPlaylistVideoToday ? new Date().toISOString().split('T')[0] : ''); } catch {}
          }
          // Sync Ayush permanent password if present
          if (remoteData.ayushPassword && currentUser === 'Ayush') {
            try {
              localStorage.setItem('fusion_ayush_password', remoteData.ayushPassword);
              localStorage.setItem('fusion_ayush_password_created', 'true');
            } catch {}
          }
          // Sync self partner chat messages (merge only — never replace shared store)
          if (Array.isArray(remoteData.partnerChatMessages) && remoteData.partnerChatMessages.length > 0) {
            setPartnerChatMessages(prev => {
              const merged = cloudSync.mergeChatMessages(prev, remoteData.partnerChatMessages!);
              if (merged.length === prev.length) return prev;
              try { localStorage.setItem('fusion_partner_chat', JSON.stringify(merged)); } catch {}
              return merged;
            });
          }
        }

        if (partnerData) {
          if (partnerData.profile) {
            setActiveFriend(prev => ({
              ...prev,
              totalXp: partnerData.profile.totalXp ?? prev.totalXp,
              streakDays: partnerData.profile.streakDays ?? prev.streakDays,
              todayStudiedMinutes: partnerData.profile.todayStudiedMinutes ?? prev.todayStudiedMinutes
            }));
          }
          if (Array.isArray(partnerData.notes) && partnerData.notes.length > 0) {
            setNotes(prev => {
              const byId = new Map(prev.map(n => [n.id, n]));
              partnerData.notes.forEach((rn: any) => {
                if (!rn?.id) return;
                const existing = byId.get(rn.id);
                byId.set(rn.id, {
                  ...(existing || {}),
                  ...rn,
                  owner: rn.owner || (currentUser === 'Diwakar' ? 'ayush' : 'diwakar'),
                  pdfUrl: existing?.pdfUrl || rn.pdfUrl
                });
              });
              const merged = Array.from(byId.values());
              try { localStorage.setItem('fusion_notes', JSON.stringify(merged.map(n => ({ ...n, pdfUrl: undefined })))); } catch {}
              return merged;
            });
          }
          // Shared YouTube Playlists added by Partner
          if (Array.isArray(partnerData.courses) && partnerData.courses.length > 0) {
            setCourses(prev => {
              const merged = mergePlaylists(prev, deletedCourseIds, partnerData.courses);
              try { localStorage.setItem('fusion_courses', JSON.stringify(merged)); } catch {}
              return merged;
            });
          }
          // Cross-device Partner Chat Sync (merge only)
          if (Array.isArray(partnerData.partnerChatMessages) && partnerData.partnerChatMessages.length > 0) {
            setPartnerChatMessages(prev => {
              const merged = cloudSync.mergeChatMessages(prev, partnerData.partnerChatMessages);
              if (merged.length === prev.length) return prev;
              try { localStorage.setItem('fusion_partner_chat', JSON.stringify(merged)); } catch {}
              return merged;
            });
          }
          // Cross-device Real-Time Nudges
          if (partnerData.lastNudge && partnerData.lastNudge.timestamp > lastReceivedNudgeTimestamp.current) {
            lastReceivedNudgeTimestamp.current = partnerData.lastNudge.timestamp;
            confetti({ particleCount: 70, spread: 80, origin: { y: 0.5 } });
            playNotificationChime();
          }
        }
      }
    );

    const applyChatPull = async () => {
      const msgs = await cloudSync.pullDuoChat();
      if (!msgs.length) return;
      setPartnerChatMessages(prev => {
        const merged = cloudSync.mergeChatMessages(prev, msgs);
        if (merged.length === prev.length) return prev;
        try { localStorage.setItem('fusion_partner_chat', JSON.stringify(merged)); } catch {}
        return merged;
      });
    };

    // Faster poll when WS is down; slower when connected (avoids Render 429)
    let chatTimer: ReturnType<typeof setInterval> | null = null;
    const scheduleChatPoll = (connected: boolean) => {
      if (chatTimer) clearInterval(chatTimer);
      chatTimer = setInterval(applyChatPull, connected ? 12000 : 2500);
    };
    scheduleChatPoll(realtimeWs.isConnected());
    applyChatPull();

    const onVis = () => {
      if (document.visibilityState === 'visible') applyChatPull();
    };
    document.addEventListener('visibilitychange', onVis);

    const unsubStatus = realtimeWs.onStatus((connected) => {
      scheduleChatPoll(connected);
      if (connected) applyChatPull();
    });

    return () => {
      stopSync();
      if (chatTimer) clearInterval(chatTimer);
      document.removeEventListener('visibilitychange', onVis);
      unsubStatus();
    };
  }, [isAuthenticated, currentUser, playNotificationChime]);

  // Realtime WebSocket — instant duo chat (Render /ws)
  useEffect(() => {
    if (!isAuthenticated || !currentUser) {
      realtimeWs.disconnect();
      return;
    }

    realtimeWs.connect(currentUser);

    const unsub = realtimeWs.subscribe((event) => {
      const type = String(event?.type || '').toUpperCase();
      if (type !== 'PARTNER_CHAT_MESSAGE') return;
      const payload = event.payload;
      if (!payload?.text) return;
      setPartnerChatMessages(prev => {
        const merged = cloudSync.mergeChatMessages(prev, [payload]);
        if (merged.length === prev.length) return prev;
        try { localStorage.setItem('fusion_partner_chat', JSON.stringify(merged)); } catch {}
        return merged;
      });
      setIsBackendConnected(true);
    });

    return () => {
      unsub();
      realtimeWs.disconnect();
    };
  }, [isAuthenticated, currentUser]);

  // Push local updates — own notes only (partner notes stay in partner blob)
  useEffect(() => {
    if (!isAuthenticated || !hasHydratedFromCloud.current) return;
    const userKey = currentUser.toLowerCase().includes('ayush') ? 'ayush' : 'diwakar';
    const ownNotes = notes
      .filter(n => {
        const o = String((n as any).owner || userKey).toLowerCase();
        return o === userKey || o === currentUser.toLowerCase();
      })
      .map(n => ({ ...n, owner: userKey, pdfUrl: undefined }));

    cloudSync.pushState(currentUser, {
      profile,
      dailyTasks,
      dsaTopics: dsaProblems,
      notes: ownNotes,
      timetableSchedule,
      courses,
      deletedCourseIds,
      pdfQuestionSheets,
      habits,
      goals,
      mlMilestones,
      geminiApiKey: geminiApiKey || undefined,
      youtubeApiKey: youtubeApiKey || undefined,
      aiChatMessages: chatMessages,
      studyLogs: studySessions,
      isVacationPaused,
      hasWatchedPlaylistVideoToday,
      ayushPassword: currentUser === 'Ayush' ? (localStorage.getItem('fusion_ayush_password') || undefined) : undefined,
      updatedAt: Date.now()
    });
  }, [
    isAuthenticated,
    currentUser,
    profile,
    dailyTasks,
    dsaProblems,
    notes,
    timetableSchedule,
    studySessions,
    courses,
    deletedCourseIds,
    pdfQuestionSheets,
    habits,
    goals,
    mlMilestones,
    geminiApiKey,
    youtubeApiKey,
    isVacationPaused,
    hasWatchedPlaylistVideoToday
  ]);

  // Ayush Permanent Password Management
  const isAyushPasswordSet = (): boolean => {
    return Boolean(localStorage.getItem('fusion_ayush_password'));
  };

  const setAyushPermanentPassword = async (newPassword: string): Promise<boolean> => {
    const clean = newPassword.trim();
    if (!clean) return false;
    localStorage.setItem('fusion_ayush_password', clean);
    localStorage.setItem('fusion_ayush_password_created', 'true');
    await cloudSync.saveAyushPassword(clean);
    return true;
  };

  // Auth Action with Direct Cloud Hydration for Any Device / PC
  const loginWithEntryCode = async (user: 'Diwakar' | 'Ayush', code: string): Promise<boolean> => {
    const clean = code.trim();
    let isValid = false;

    if (user === 'Diwakar') {
      // Password loaded from env variable with reliable default fallback ML1718
      const diwakarCode = (import.meta.env.VITE_DIWAKAR_CODE || 'ML1718').toUpperCase();
      isValid = clean.toUpperCase() === diwakarCode;
    } else {
      // User Ayush: checks permanent password created by Ayush (local or cloud-synced)
      let storedAyushPassword = localStorage.getItem('fusion_ayush_password');
      if (!storedAyushPassword) {
        const remotePass = await cloudSync.fetchAyushPassword();
        if (remotePass) {
          storedAyushPassword = remotePass;
          localStorage.setItem('fusion_ayush_password', remotePass);
          localStorage.setItem('fusion_ayush_password_created', 'true');
        }
      }
      if (storedAyushPassword) {
        isValid = clean === storedAyushPassword.trim();
      } else {
        isValid = false;
      }
    }

    if (isValid) {
      setCurrentUser(user);
      localStorage.setItem('fusion_user', user);

      try {
        const res = await api.verifyEntryCode({ user, code: clean });
        if (res.data?.token) api.setToken(res.data.token);
      } catch {}

      // Hydrate directly from cloud so data is NEVER 0 on a different system or browser
      try {
        const { data: remoteData, partnerData, sharedNotes } = await cloudSync.fetchStateDirect(user);
        if (remoteData) {
          if (remoteData.profile) {
            const defProfile = user === 'Diwakar' ? DEFAULT_DIWAKAR_PROFILE : DEFAULT_AYUSH_PROFILE;
            const updatedProfile = {
              ...defProfile,
              ...remoteData.profile,
              totalXp: Math.max(defProfile.totalXp, remoteData.profile.totalXp ?? 100),
              streakDays: Math.max(defProfile.streakDays, remoteData.profile.streakDays ?? 0),
              todayStudiedMinutes: Math.max(defProfile.todayStudiedMinutes, remoteData.profile.todayStudiedMinutes ?? 0)
            };
            setProfile(updatedProfile);
            try { localStorage.setItem(`fusion_profile_${user.toLowerCase()}`, JSON.stringify(updatedProfile)); } catch {}
          }
          if (Array.isArray(remoteData.deletedCourseIds)) {
            setDeletedCourseIds(prev => {
              const merged = Array.from(new Set([...prev, ...(remoteData.deletedCourseIds || [])]));
              try { localStorage.setItem('fusion_deleted_course_ids', JSON.stringify(merged)); } catch {}
              return merged;
            });
          }
          if (Array.isArray(remoteData.courses)) {
            const currentDeleted = Array.isArray(remoteData.deletedCourseIds) ? remoteData.deletedCourseIds : [];
            const delSet = new Set([...deletedCourseIds, ...currentDeleted]);
            const filtered = remoteData.courses.filter(c => !delSet.has(c.id));
            setCourses(filtered);
            try { localStorage.setItem('fusion_courses', JSON.stringify(filtered)); } catch {}
          }
          if (Array.isArray(remoteData.dailyTasks)) {
            setDailyTasks(remoteData.dailyTasks);
            try { localStorage.setItem('fusion_daily_tasks', JSON.stringify(remoteData.dailyTasks)); } catch {}
          }
          {
            const own = Array.isArray(remoteData.notes) ? remoteData.notes : [];
            const partner = Array.isArray(partnerData?.notes) ? partnerData.notes : [];
            const shared = Array.isArray(sharedNotes) ? sharedNotes : [];
            const byId = new Map<string, any>();
            [...own, ...partner, ...shared].forEach((n: any) => {
              if (!n?.id) return;
              byId.set(n.id, { ...(byId.get(n.id) || {}), ...n });
            });
            const mergedNotes = Array.from(byId.values());
            if (mergedNotes.length > 0) {
              setNotes(mergedNotes);
              try { localStorage.setItem('fusion_notes', JSON.stringify(mergedNotes.map((n: any) => ({ ...n, pdfUrl: undefined })))); } catch {}
            }
          }
          if (Array.isArray(remoteData.studyLogs)) {
            setStudySessions(remoteData.studyLogs);
            try { localStorage.setItem('fusion_study_sessions', JSON.stringify(remoteData.studyLogs)); } catch {}
          }
          if (Array.isArray(remoteData.habits)) {
            setHabits(remoteData.habits);
            try { localStorage.setItem('fusion_habits', JSON.stringify(remoteData.habits)); } catch {}
          }
          if (Array.isArray(remoteData.goals)) {
            setGoals(remoteData.goals);
            try { localStorage.setItem('fusion_goals', JSON.stringify(remoteData.goals)); } catch {}
          }
          if (remoteData.geminiApiKey) {
            setGeminiApiKeyState(remoteData.geminiApiKey);
            GeminiService.setApiKey(user, remoteData.geminiApiKey);
          }
          if (remoteData.youtubeApiKey) {
            setYoutubeApiKeyState(remoteData.youtubeApiKey);
            YouTubeService.setApiKey(user, remoteData.youtubeApiKey);
          }
          if (Array.isArray(remoteData.partnerChatMessages) && remoteData.partnerChatMessages.length > 0) {
            setPartnerChatMessages(prev => {
              const merged = cloudSync.mergeChatMessages(prev, remoteData.partnerChatMessages!);
              try { localStorage.setItem('fusion_partner_chat', JSON.stringify(merged)); } catch {}
              return merged;
            });
          }
        }
      } catch (e) {
        console.warn('[Direct Login Cloud Hydration Failed, using local cache]', e);
      }

      // Shared duo chat is source of truth
      try {
        const msgs = await cloudSync.pullDuoChat();
        if (msgs.length) {
          setPartnerChatMessages(prev => {
            const merged = cloudSync.mergeChatMessages(prev, msgs);
            try { localStorage.setItem('fusion_partner_chat', JSON.stringify(merged)); } catch {}
            return merged;
          });
        }
      } catch {}

      hasHydratedFromCloud.current = true;
      setIsAuthenticated(true);
      localStorage.setItem('fusion_authenticated', 'true');
      setGeminiApiKeyState(GeminiService.getApiKey(user));
      setYoutubeApiKeyState(YouTubeService.getApiKey(user));
      setChatMessages(getInitialChatMessages(user));
      confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });
      return true;
    }
    return false;
  };

  const logout = () => {
    setIsAuthenticated(false);
    localStorage.setItem('fusion_authenticated', 'false');
    localStorage.removeItem('fusion_user');
  };

  const updateProfileAvatar = (avatarUrl: string) => {
    setProfile(prev => {
      const next = { ...prev, avatar: avatarUrl };
      localStorage.setItem(`fusion_profile_${currentUser.toLowerCase()}`, JSON.stringify(next));
      cloudSync.pushState(currentUser, { profile: next });
      return next;
    });
    api.updateProfileAvatar({ userName: currentUser, avatar: avatarUrl });
  };

  const updateProfile = (updates: Partial<StudentProfile>) => {
    setProfile(prev => {
      const next = { ...prev, ...updates };
      localStorage.setItem(`fusion_profile_${currentUser.toLowerCase()}`, JSON.stringify(next));
      cloudSync.pushState(currentUser, { profile: next });
      return next;
    });
  };

  // Timer Tick
  useEffect(() => {
    let interval: any = null;
    if (isTimerRunning && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds(s => s - 1);
        if (timerMode === 'focus') {
          currentFocusSessionSeconds.current += 1;
          elapsedFocusSeconds.current += 1;
          if (elapsedFocusSeconds.current >= 60) {
            elapsedFocusSeconds.current -= 60;
            setProfile(p => {
              const nextMins = p.todayStudiedMinutes + 1;
              const nextXp = p.totalXp + 2;
              const updated = { ...p, todayStudiedMinutes: nextMins, totalXp: nextXp };
              try {
                localStorage.setItem(`fusion_profile_${currentUser.toLowerCase()}`, JSON.stringify(updated));
                localStorage.setItem(`fusion_studied_minutes_${currentUser.toLowerCase()}`, String(nextMins));
                localStorage.setItem(`fusion_studied_date_${currentUser.toLowerCase()}`, new Date().toISOString().split('T')[0]);
              } catch {}
              return updated;
            });
          }
        }
      }, 1000);
    } else if (isTimerRunning && timerSeconds === 0) {
      setIsTimerRunning(false);
      const minutesSpent = timerDurationMinutes;
      confetti({ particleCount: 80, spread: 80, origin: { y: 0.5 } });

      // Automatically log study session
      const newSession: StudySession = {
        id: 's_' + Date.now(),
        user_id: currentUser === 'Diwakar' ? 'u_diwakar' : 'u_ayush',
        user_name: currentUser,
        subject_name: timerSubject,
        duration_minutes: minutesSpent,
        timestamp: new Date().toISOString(),
        notes: `Completed ${minutesSpent}m deep focus block on ${timerSubject}.`
      };

      setStudySessions(prev => {
        const next = [newSession, ...prev];
        try { localStorage.setItem('fusion_study_sessions', JSON.stringify(next)); } catch {}
        cloudSync.pushState(currentUser, { studyLogs: next });
        return next;
      });
      api.createStudySession(newSession);

      currentFocusSessionSeconds.current = 0;
      elapsedFocusSeconds.current = 0;

      // Broadcast to partner
      if (broadcastChannel) {
        broadcastChannel.postMessage({
          type: 'PARTNER_FOCUS_UPDATE',
          sender: currentUser,
          payload: {
            isFocusing: false,
            focusSubject: timerSubject,
            todayStudiedMinutes: profile.todayStudiedMinutes
          }
        });
      }
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timerSeconds, timerDurationMinutes, timerSubject, currentUser, profile.todayStudiedMinutes, timerMode]);

  const startTimer = () => {
    setIsTimerRunning(true);
    if (broadcastChannel) {
      broadcastChannel.postMessage({
        type: 'PARTNER_FOCUS_UPDATE',
        sender: currentUser,
        payload: {
          isFocusing: true,
          focusSubject: timerSubject,
          todayStudiedMinutes: profile.todayStudiedMinutes
        }
      });
    }
  };

  const pauseTimer = () => {
    setIsTimerRunning(false);
    if (timerMode === 'focus' && currentFocusSessionSeconds.current >= 60) {
      const minutesEarned = Math.floor(currentFocusSessionSeconds.current / 60);
      const newSession: StudySession = {
        id: 's_' + Date.now(),
        user_id: currentUser === 'Diwakar' ? 'u_diwakar' : 'u_ayush',
        user_name: currentUser,
        subject_name: timerSubject,
        duration_minutes: minutesEarned,
        timestamp: new Date().toISOString(),
        notes: `Focus block on ${timerSubject} (${minutesEarned}m).`
      };
      setStudySessions(prev => {
        const next = [newSession, ...prev];
        try { localStorage.setItem('fusion_study_sessions', JSON.stringify(next)); } catch {}
        cloudSync.pushState(currentUser, { studyLogs: next });
        return next;
      });
      api.createStudySession(newSession);
      currentFocusSessionSeconds.current = 0;
    }
    if (broadcastChannel) {
      broadcastChannel.postMessage({
        type: 'PARTNER_FOCUS_UPDATE',
        sender: currentUser,
        payload: {
          isFocusing: false,
          focusSubject: timerSubject,
          todayStudiedMinutes: profile.todayStudiedMinutes
        }
      });
    }
  };

  const resetTimer = (mode: 'focus' | 'short_break' | 'long_break' = 'focus') => {
    setIsTimerRunning(false);
    if (timerMode === 'focus' && currentFocusSessionSeconds.current >= 60) {
      const minutesEarned = Math.floor(currentFocusSessionSeconds.current / 60);
      const newSession: StudySession = {
        id: 's_' + Date.now(),
        user_id: currentUser === 'Diwakar' ? 'u_diwakar' : 'u_ayush',
        user_name: currentUser,
        subject_name: timerSubject,
        duration_minutes: minutesEarned,
        timestamp: new Date().toISOString(),
        notes: `Focus block on ${timerSubject} (${minutesEarned}m).`
      };
      setStudySessions(prev => {
        const next = [newSession, ...prev];
        try { localStorage.setItem('fusion_study_sessions', JSON.stringify(next)); } catch {}
        cloudSync.pushState(currentUser, { studyLogs: next });
        return next;
      });
      api.createStudySession(newSession);
    }
    currentFocusSessionSeconds.current = 0;
    elapsedFocusSeconds.current = 0;
    setTimerMode(mode);
    const mins = mode === 'focus' ? timerDurationMinutes : mode === 'short_break' ? 5 : 15;
    setTimerSeconds(mins * 60);
  };

  // Study Sessions
  const addStudySession = (session: Omit<StudySession, 'id' | 'timestamp'>) => {
    const newSession: StudySession = {
      ...session,
      id: 's_' + Date.now(),
      timestamp: new Date().toISOString()
    };
    setStudySessions(prev => {
      const next = [newSession, ...prev];
      try { localStorage.setItem('fusion_study_sessions', JSON.stringify(next)); } catch {}
      cloudSync.pushState(currentUser, { studyLogs: next });
      return next;
    });
    setProfile(p => {
      const nextMins = p.todayStudiedMinutes + session.duration_minutes;
      const nextXp = p.totalXp + session.duration_minutes * 2;
      const updated = { ...p, todayStudiedMinutes: nextMins, totalXp: nextXp };
      try {
        localStorage.setItem(`fusion_profile_${currentUser.toLowerCase()}`, JSON.stringify(updated));
        localStorage.setItem(`fusion_studied_minutes_${currentUser.toLowerCase()}`, String(nextMins));
        localStorage.setItem(`fusion_studied_date_${currentUser.toLowerCase()}`, new Date().toISOString().split('T')[0]);
      } catch {}
      cloudSync.pushState(currentUser, { profile: updated });
      return updated;
    });
    api.createStudySession(newSession);
  };

  // DSA Session Logging (Pure telemetry)
  const logDsaSession = (session: Omit<DsaSession, 'id' | 'timestamp'>) => {
    const newSession: DsaSession = {
      ...session,
      id: 'ds_' + Date.now(),
      timestamp: new Date().toISOString()
    };
    setDsaSessions(prev => [newSession, ...prev]);
    setProfile(p => {
      const nextMins = p.todayStudiedMinutes + session.durationMinutes;
      const nextXp = p.totalXp + session.problemsCount * 30;
      const updated = { ...p, todayStudiedMinutes: nextMins, totalXp: nextXp };
      try {
        localStorage.setItem(`fusion_profile_${currentUser.toLowerCase()}`, JSON.stringify(updated));
        localStorage.setItem(`fusion_studied_minutes_${currentUser.toLowerCase()}`, String(nextMins));
        localStorage.setItem(`fusion_studied_date_${currentUser.toLowerCase()}`, new Date().toISOString().split('T')[0]);
      } catch {}
      return updated;
    });
    confetti({ particleCount: 50, spread: 60 });
    api.createDsaSession(session);
  };

  const toggleDsaStatus = (problemId: string, newStatus: DsaStatus) => {
    setDsaProblems(prev =>
      prev.map(p => {
        if (p.id === problemId) {
          if (newStatus === 'Solved' && p.status !== 'Solved') {
            confetti({ particleCount: 40, spread: 50 });
            setProfile(pr => ({ ...pr, totalXp: pr.totalXp + 50 }));
          }
          return { ...p, status: newStatus };
        }
        return p;
      })
    );
  };

  const addDsaProblem = (prob: Omit<DsaProblem, 'id'>) => {
    const newProblem: DsaProblem = { ...prob, id: 'd_' + Date.now() };
    setDsaProblems(prev => [newProblem, ...prev]);
  };

  // Lecture & Course Playlist actions
  const toggleLectureCompleted = (courseId: string, lectureId: string) => {
    setCourses(prev => {
      const updated = prev.map(c => {
        if (c.id === courseId && c.lectures) {
          const updatedLectures = c.lectures.map(lec => {
            if (lec.id === lectureId) {
              const nextState = !lec.completed;
              if (nextState) {
                confetti({ particleCount: 45, spread: 60 });
                setProfile(p => ({ ...p, totalXp: p.totalXp + 50 }));
                markPlaylistVideoWatchedToday();
              }
              return { ...lec, completed: nextState };
            }
            return lec;
          });
          const completedCount = updatedLectures.filter(l => l.completed).length;
          return {
            ...c,
            lectures: updatedLectures,
            currentLesson: `Completed ${completedCount}/${updatedLectures.length} Lectures`
          };
        }
        return c;
      });
      localStorage.setItem('fusion_courses', JSON.stringify(updated));
      return updated;
    });
  };

  const markAllLecturesCompleted = (courseId: string, markComplete = true) => {
    setCourses(prev => {
      let newlyCompleted = 0;
      const updated = prev.map(c => {
        if (c.id === courseId && c.lectures) {
          const updatedLectures = c.lectures.map(lec => {
            if (markComplete && !lec.completed) newlyCompleted++;
            return { ...lec, completed: markComplete };
          });
          const completedCount = markComplete ? updatedLectures.length : 0;
          return {
            ...c,
            lectures: updatedLectures,
            currentLesson: `Completed ${completedCount}/${updatedLectures.length} Lectures`
          };
        }
        return c;
      });
      if (newlyCompleted > 0) {
        confetti({ particleCount: 75, spread: 85 });
        setProfile(p => ({ ...p, totalXp: p.totalXp + (newlyCompleted * 50) }));
        markPlaylistVideoWatchedToday();
      }
      localStorage.setItem('fusion_courses', JSON.stringify(updated));
      cloudSync.pushState(currentUser, { courses: updated });
      return updated;
    });
  };

  const addCourse = (course: Omit<VideoCourse, 'id'>) => {
    const newCourse: VideoCourse = {
      ...course,
      id: 'c_' + Date.now(),
      lectures: course.lectures && course.lectures.length > 0 ? course.lectures : [
        { id: 'lec_' + Date.now(), title: course.title, duration: '45:00', videoId: 'yRpLlJmRo2w', completed: false }
      ]
    };
    setCourses(prev => {
      const updated = [newCourse, ...prev.filter(c => c.id !== newCourse.id)];
      localStorage.setItem('fusion_courses', JSON.stringify(updated));
      return updated;
    });
    api.createCourse(newCourse).catch(e => console.warn('api createCourse error', e));
  };

  const deleteCourse = (id: string) => {
    const targetCourse = courses.find(c => c.id === id);
    const ytKey = targetCourse?.youtubeUrl ? (YouTubeService.extractPlaylistId(targetCourse.youtubeUrl) || YouTubeService.extractVideoId(targetCourse.youtubeUrl)) : null;

    const nextDeleted = Array.from(new Set([...deletedCourseIds, id, ...(ytKey ? [ytKey] : [])]));
    setDeletedCourseIds(nextDeleted);
    try {
      localStorage.setItem('fusion_deleted_course_ids', JSON.stringify(nextDeleted));
    } catch {}

    const updated = courses.filter(c => c.id !== id);
    setCourses(updated);
    try {
      localStorage.setItem('fusion_courses', JSON.stringify(updated));
    } catch {}

    if (activePlayingCourse?.id === id) {
      setActivePlayingCourse(updated[0] || null);
      setActiveLecture(updated[0]?.lectures?.[0] || null);
    }

    // Immediately push to cloud sync with deletedCourseIds
    cloudSync.pushStateDirect(currentUser, {
      courses: updated,
      deletedCourseIds: nextDeleted
    });

    if (broadcastChannel) {
      broadcastChannel.postMessage({
        type: 'PARTNER_COURSE_DELETE',
        sender: currentUser,
        payload: { courseId: id }
      });
    }

    api.deleteCourse(id).catch(e => console.warn('api deleteCourse error', e));
  };

  // Timetable Image Upload & AI Schedule Generation
  const uploadTimetableImage = async (file: File) => {
    const reader = new FileReader();
    reader.onload = async () => {
      const dataUrl = reader.result as string;
      setTimetableImageUrl(dataUrl);
      localStorage.setItem('fusion_timetable_image', dataUrl);

      // Extract base64 without prefix for Gemini Vision
      const base64Data = dataUrl.split(',')[1];
      const mimeType = file.type || 'image/jpeg';

      setIsAiThinking(true);
      try {
        const result = await GeminiService.analyzeTimetable(
          geminiApiKey,
          base64Data,
          mimeType,
          isTodayHoliday,
          collegeWorkingHours
        );
        if (result.collegeHours) {
          handleSetCollegeWorkingHours(result.collegeHours);
        }
        if (result.slots && result.slots.length > 0) {
          setTimetableSchedule(
            result.slots.map((s, i) => ({
              id: 'slot_' + i + '_' + Date.now(),
              time: s.time,
              subject: s.subject as any,
              topic: s.topic,
              type: s.type as any,
              completed: false,
              isHolidaySlot: isTodayHoliday
            }))
          );
          confetti({ particleCount: 50, spread: 60 });
        }
      } catch (err) {
        console.error('[Timetable AI Error]', err);
      } finally {
        setIsAiThinking(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const generateAiStudySchedule = async (isHoliday: boolean = isTodayHoliday) => {
    setIsAiThinking(true);
    try {
      const fallbackBase64 = timetableImageUrl?.includes(',') ? timetableImageUrl.split(',')[1] : '';
      const result = await GeminiService.analyzeTimetable(
        geminiApiKey,
        fallbackBase64,
        'image/jpeg',
        isHoliday,
        collegeWorkingHours
      );
      if (result.collegeHours) {
        handleSetCollegeWorkingHours(result.collegeHours);
      }
      if (result.slots && result.slots.length > 0) {
        setTimetableSchedule(
          result.slots.map((s, i) => ({
            id: 'slot_' + i + '_' + Date.now(),
            time: s.time,
            subject: s.subject as any,
            topic: s.topic,
            type: s.type as any,
            completed: false,
            isHolidaySlot: isHoliday
          }))
        );
        confetti({ particleCount: 55, spread: 65 });
      }
    } catch (e) {
      console.error('[AI Schedule Gen Error]', e);
    } finally {
      setIsAiThinking(false);
    }
  };

  // Notes
  const addNote = (note: { title: string; content: string; tags: string[]; pdfUrl?: string; fileName?: string; fileSize?: string }) => {
    const noteId = 'n_' + Date.now();
    const hasPdf = Boolean(note.pdfUrl);
    const userKey = currentUser.toLowerCase().includes('ayush') ? 'ayush' : 'diwakar';

    if (hasPdf && note.pdfUrl) {
      savePdfToIndexedDb(noteId, {
        pdfDataUrl: note.pdfUrl,
        fileName: note.fileName,
        fileSize: note.fileSize
      });
    }

    const newNote: StudentNote = {
      ...note,
      id: noteId,
      hasPdf,
      owner: userKey,
      createdAt: 'Just now'
    };

    setNotes(prev => {
      const updated = [newNote, ...prev.filter(n => n.id !== newNote.id)];
      try {
        const cleanForStorage = updated.map(n => ({
          ...n,
          pdfUrl: undefined
        }));
        localStorage.setItem('fusion_notes', JSON.stringify(cleanForStorage));
        const ownNotes = updated
          .filter(n => {
            const o = String((n as any).owner || userKey).toLowerCase();
            return o === userKey || o === currentUser.toLowerCase();
          })
          .map(n => ({ ...n, owner: userKey, pdfUrl: undefined }));
        cloudSync.pushStateDirect(currentUser, { notes: ownNotes }).catch(e => console.warn('[CloudSync] addNote push error', e));
      } catch (e) {
        console.warn('[Note Storage Quota Warning]', e);
      }
      return updated;
    });

    api.createNote({
      title: newNote.title,
      content: newNote.content,
      tags: newNote.tags
    }).catch(e => console.warn('api createNote error', e));
  };

  const deleteNote = (id: string) => {
    deletePdfFromIndexedDb(id);
    const userKey = currentUser.toLowerCase().includes('ayush') ? 'ayush' : 'diwakar';
    setNotes(prev => {
      const updated = prev.filter(n => n.id !== id);
      try {
        const cleanForStorage = updated.map(n => ({
          ...n,
          pdfUrl: undefined
        }));
        localStorage.setItem('fusion_notes', JSON.stringify(cleanForStorage));
        const ownNotes = updated
          .filter(n => {
            const o = String((n as any).owner || userKey).toLowerCase();
            return o === userKey || o === currentUser.toLowerCase();
          })
          .map(n => ({ ...n, owner: userKey, pdfUrl: undefined }));
        cloudSync.pushStateDirect(currentUser, {
          notes: ownNotes,
          deletedNoteIds: [id]
        } as any).catch(e => console.warn('[CloudSync] deleteNote push error', e));
      } catch {}
      return updated;
    });
    api.deleteNote(id);
  };

  // PDF Question Sheets & AI Generation (Always unified into one master checklist)
  const addPdfQuestionSheet = (sheet: Omit<PdfQuestionSheet, 'id' | 'totalCount' | 'completedCount'>) => {
    setPdfQuestionSheets(prev => {
      const allExistingQuestions = prev.flatMap(s => s.questions);
      const combined = [...sheet.questions, ...allExistingQuestions];
      const singleSheet: PdfQuestionSheet = {
        id: 'sheet_unified_master',
        title: 'Master DSA & Coding Checklist (Verified Solutions)',
        subject: 'DSA & Coding',
        totalCount: combined.length,
        completedCount: combined.filter(q => q.completed).length,
        questions: combined
      };
      const updated = [singleSheet];
      try {
        localStorage.setItem('fusion_pdf_sheets', JSON.stringify(updated));
      } catch {}
      return updated;
    });
    api.createPdfQuestionSheet(sheet);
  };

  const togglePdfQuestion = (sheetId: string, questionId: string, completed: boolean) => {
    setPdfQuestionSheets(prev => {
      const updated = prev.map(s => {
        const updatedQs = s.questions.map(q => (q.id === questionId ? { ...q, completed, completedBy: completed ? currentUser : undefined } : q));
        if (completed) {
          confetti({ particleCount: 35, spread: 50 });
          setProfile(p => ({ ...p, totalXp: p.totalXp + 25 }));
        }
        return { ...s, questions: updatedQs, completedCount: updatedQs.filter(q => q.completed).length };
      });
      try {
        localStorage.setItem('fusion_pdf_sheets', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const generateCodingSheetByAi = async (topic: string) => {
    setIsAiThinking(true);
    try {
      const generated = await GeminiService.generateCodingQuestions(geminiApiKey, topic);
      setPdfQuestionSheets(prev => {
        const allExistingQuestions = prev.flatMap(s => s.questions);
        const newQs: PdfQuestionItem[] = generated.map((q, i) => ({
          id: `q_gen_${i}_${Date.now()}`,
          title: q.title,
          platform: q.platform || 'LeetCode',
          completed: false
        }));
        const combined = [...newQs, ...allExistingQuestions];
        const singleSheet: PdfQuestionSheet = {
          id: 'sheet_unified_master',
          title: 'Master DSA & Coding Checklist (Verified Solutions)',
          subject: 'DSA & Coding',
          totalCount: combined.length,
          completedCount: combined.filter(q => q.completed).length,
          questions: combined
        };
        const updated = [singleSheet];
        try {
          localStorage.setItem('fusion_pdf_sheets', JSON.stringify(updated));
        } catch {}
        return updated;
      });
      confetti({ particleCount: 60, spread: 70 });
    } catch (err) {
      console.error('[AI Coding Sheet Error]', err);
    } finally {
      setIsAiThinking(false);
    }
  };

  const addQuestionFromScreenshot = async (
    file: File,
    platform?: string,
    manualTitle?: string
  ): Promise<{ success: boolean; questionTitle: string }> => {
    setIsAiThinking(true);
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const dataUrl = reader.result as string;
          const base64Data = dataUrl.includes(',') ? dataUrl.split(',')[1] : dataUrl;
          const mimeType = file.type || 'image/png';

          // 1. Run Gemini AI Vision Analysis on raw image
          const analysis = await GeminiService.analyzeQuestionScreenshot(
            geminiApiKey,
            base64Data,
            mimeType,
            manualTitle
          );

          // 2. Compress screenshot to canvas (max 800px) so it never causes QuotaExceededError or white screen
          const compressImage = (dataUrlStr: string): Promise<string> => {
            return new Promise((res) => {
              const img = new Image();
              img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;
                const maxDim = 800;
                if (width > maxDim || height > maxDim) {
                  if (width > height) {
                    height = Math.round((height * maxDim) / width);
                    width = maxDim;
                  } else {
                    width = Math.round((width * maxDim) / height);
                    height = maxDim;
                  }
                }
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                if (ctx) {
                  ctx.drawImage(img, 0, 0, width, height);
                  res(canvas.toDataURL('image/jpeg', 0.65));
                } else {
                  res(dataUrlStr);
                }
              };
              img.onerror = () => res(dataUrlStr);
              img.src = dataUrlStr;
            });
          };

          const compressedScreenshot = await compressImage(dataUrl);

          const finalTitle = analysis.title || manualTitle || 'Solved Problem';
          const newQuestion: PdfQuestionItem = {
            id: 'q_sc_' + Date.now(),
            title: finalTitle,
            platform: platform || analysis.platform || 'LeetCode',
            topic: analysis.topic || 'Algorithms',
            difficulty: analysis.difficulty || 'Medium',
            screenshotUrl: compressedScreenshot,
            completed: true,
            completedBy: currentUser
          };

          setPdfQuestionSheets(prev => {
            const allExistingQuestions = prev.flatMap(s => s.questions);
            const updatedQuestions = [newQuestion, ...allExistingQuestions.filter(q => q.id !== newQuestion.id)];
            const singleSheet: PdfQuestionSheet = {
              id: 'sheet_unified_master',
              title: 'Master DSA & Coding Checklist (Verified Solutions)',
              subject: 'DSA & Coding',
              totalCount: updatedQuestions.length,
              completedCount: updatedQuestions.filter(q => q.completed).length,
              questions: updatedQuestions
            };
            const updatedSheets = [singleSheet];

            try {
              localStorage.setItem('fusion_pdf_sheets', JSON.stringify(updatedSheets));
            } catch (storageErr) {
              console.warn('[LocalStorage Quota Warning on sheets]', storageErr);
              try {
                const lightweight = updatedSheets.map(s => ({
                  ...s,
                  questions: s.questions.map(q => ({ ...q, screenshotUrl: undefined }))
                }));
                localStorage.setItem('fusion_pdf_sheets', JSON.stringify(lightweight));
              } catch {}
            }

            return updatedSheets;
          });

          // Award XP and celebration
          confetti({ particleCount: 65, spread: 70 });
          setProfile(p => ({ ...p, totalXp: p.totalXp + 35 }));

          // Add to study sessions telemetry
          const solvedSession: StudySession = {
            id: 's_prob_' + Date.now(),
            user_id: currentUser === 'Diwakar' ? 'u_diwakar' : 'u_ayush',
            user_name: currentUser,
            subject_name: 'DSA',
            duration_minutes: 20,
            timestamp: new Date().toISOString(),
            notes: `Solved "${finalTitle}" on ${platform || analysis.platform || 'LeetCode'} (by ${currentUser}). Screenshot verified.`
          };
          setStudySessions(prev => [solvedSession, ...prev]);

          if (broadcastChannel) {
            broadcastChannel.postMessage({
              type: 'PARTNER_QUESTION_SOLVED',
              sender: currentUser,
              payload: { question: newQuestion, xpGained: 35 }
            });
          }

          resolve({ success: true, questionTitle: finalTitle });
        } catch (e) {
          console.error('[Screenshot Analysis Error]', e);
          resolve({ success: false, questionTitle: manualTitle || 'Problem' });
        } finally {
          setIsAiThinking(false);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  // ML Milestones
  const toggleMlMilestone = (id: string) => {
    setMlMilestones(prev =>
      prev.map(m => {
        if (m.id === id) {
          const next = !m.completed;
          if (next) {
            confetti({ particleCount: 60, spread: 70 });
            setProfile(p => ({ ...p, totalXp: p.totalXp + 100 }));
          }
          return { ...m, completed: next };
        }
        return m;
      })
    );
  };

  // Daily Tasks
  const toggleDailyTask = (taskId: string, completed: boolean) => {
    setDailyTasks(prev => {
      const updated = prev.map(t => {
        if (t.id === taskId) {
          // XP is awarded ONLY on the FIRST completion (xpClaimed not set yet)
          // Unchecking and rechecking will NOT re-award XP — exploit closed
          const isFirstCompletion = completed && !t.xpClaimed;
          if (isFirstCompletion) {
            confetti({ particleCount: 45, spread: 60 });
            setProfile(p => ({ ...p, totalXp: p.totalXp + t.exp }));
          }
          return {
            ...t,
            completed,
            completedBy: completed ? currentUser : t.completedBy,
            // xpClaimed stays TRUE forever once set — cannot be reset by unchecking
            xpClaimed: t.xpClaimed || isFirstCompletion
          };
        }
        return t;
      });
      try {
        localStorage.setItem('fusion_daily_tasks', JSON.stringify(updated));
      } catch {}
      cloudSync.pushState(currentUser, { dailyTasks: updated });
      return updated;
    });

    api.toggleDailyTask(taskId, completed);

    if (broadcastChannel) {
      broadcastChannel.postMessage({
        type: 'PARTNER_TASK_TOGGLE',
        sender: currentUser,
        payload: { taskId, completed, completedBy: completed ? currentUser : undefined }
      });
    }
  };

  const addDailyTask = (task: Omit<DailyTask, 'id' | 'completed'>) => {
    const newTask: DailyTask = {
      ...task,
      id: 'dt_' + Date.now(),
      completed: false,
      isCustom: task.isCustom ?? true,
      createdBy: currentUser
    };
    setDailyTasks(prev => {
      const updated = [newTask, ...prev];
      try {
        localStorage.setItem('fusion_daily_tasks', JSON.stringify(updated));
      } catch {}
      cloudSync.pushState(currentUser, { dailyTasks: updated });
      return updated;
    });

    api.createDailyTask(newTask).catch((e: any) => console.warn('api createDailyTask error', e));

    if (broadcastChannel) {
      broadcastChannel.postMessage({
        type: 'PARTNER_TASK_ADDED',
        sender: currentUser,
        payload: newTask
      });
    }
  };

  const deleteDailyTask = (taskId: string) => {
    setDailyTasks(prev => {
      const updated = prev.filter(t => t.id !== taskId);
      try {
        localStorage.setItem('fusion_daily_tasks', JSON.stringify(updated));
      } catch {}
      cloudSync.pushStateDirect(currentUser, { dailyTasks: updated });
      return updated;
    });

    api.deleteDailyTask(taskId).catch((e: any) => console.warn('api deleteDailyTask error', e));

    if (broadcastChannel) {
      broadcastChannel.postMessage({
        type: 'PARTNER_TASK_DELETE',
        sender: currentUser,
        payload: { taskId }
      });
    }
  };

  // Habits
  const toggleHabit = (habitId: string) => {
    setHabits(prev => {
      const updated = prev.map(h => {
        if (h.id === habitId) {
          const done = !h.completedToday;
          const streak = done ? h.streak + 1 : Math.max(0, h.streak - 1);
          if (done) {
            confetti({ particleCount: 40, spread: 50 });
            setProfile(p => ({ ...p, totalXp: p.totalXp + 25 }));
          }
          const history = [...(h.weeklyHistory || [false, false, false, false, false, false, false])];
          history[6] = done;
          return { ...h, completedToday: done, streak, weeklyHistory: history };
        }
        return h;
      });
      try {
        localStorage.setItem('fusion_habits', JSON.stringify(updated));
      } catch {}
      cloudSync.pushState(currentUser, { habits: updated });
      return updated;
    });
  };

  const updateGoalProgress = (goalId: string, progress: number) => {
    setGoals(prev =>
      prev.map(g => (g.id === goalId ? { ...g, progress: Math.min(100, Math.max(0, progress)) } : g))
    );
  };

  // Partner Live Chat (shared duo store + WebSocket push)
  const sendPartnerChatMessage = (text: string) => {
    if (!text.trim()) return;
    const displaySender = currentUser.toLowerCase().includes('ayush') ? 'Ayush' : 'Diwakar';
    const msg = {
      id: 'pc_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7),
      sender: displaySender,
      text: text.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setPartnerChatMessages(prev => {
      const next = cloudSync.mergeChatMessages(prev, [msg]);
      try { localStorage.setItem('fusion_partner_chat', JSON.stringify(next)); } catch {}
      return next;
    });

    // Persist + server WS broadcast (with retries). Also fan-out on client WS as backup.
    cloudSync.pushDuoChat(msg).then((ok) => {
      if (!ok) {
        // One more pull so sender still converges if POST was rate-limited
        cloudSync.pullDuoChat().then((msgs) => {
          if (!msgs.length) return;
          setPartnerChatMessages(prev => {
            const merged = cloudSync.mergeChatMessages(prev, msgs);
            try { localStorage.setItem('fusion_partner_chat', JSON.stringify(merged)); } catch {}
            return merged;
          });
        });
      }
    });
    realtimeWs.send('PARTNER_CHAT_MESSAGE', msg);

    if (broadcastChannel) {
      broadcastChannel.postMessage({
        type: 'PARTNER_CHAT_MESSAGE',
        sender: displaySender,
        payload: msg
      });
    }
  };

  const sendFriendNudge = (type: 'nudge' | 'coffee' | 'cheer') => {
    cloudSync.pushState(currentUser, {
      profile,
      dailyTasks,
      dsaTopics: dsaProblems,
      notes,
      timetableSchedule,
      courses,
      pdfQuestionSheets,
      habits,
      goals,
      mlMilestones,
      geminiApiKey: geminiApiKey || undefined,
      youtubeApiKey: youtubeApiKey || undefined,
      studyLogs: studySessions,
      partnerChatMessages,
      lastNudge: { sender: currentUser, type, timestamp: Date.now() },
      isVacationPaused,
      hasWatchedPlaylistVideoToday,
      updatedAt: Date.now()
    });

    if (broadcastChannel) {
      broadcastChannel.postMessage({
        type: 'PARTNER_NUDGE',
        sender: currentUser,
        payload: { type }
      });
    }
  };

  // FUSE AI Chat Handler (Direct Google Gemini)
  const sendChatMessage = async (text: string) => {
    if (!text.trim() || isAiThinking) return;

    const userMsg: ChatMessage = {
      id: 'msg_' + Date.now(),
      sender: 'user',
      model: 'User',
      text: text.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setChatMessages(prev => {
      const next = [...prev, userMsg];
      try {
        localStorage.setItem(`fusion_chat_messages_${currentUser.toLowerCase()}`, JSON.stringify(next));
      } catch {}
      return next;
    });
    setIsAiThinking(true);

    const systemPrompt = `You are FUSE, the supreme AI Engineering & Algorithm Mentor built exclusively for FUSION—the private co-study ecosystem of Diwakar and Ayush.

STUDENT TELEMETRY:
- Active Student: ${currentUser} (${profile.streakDays}-day streak, ${profile.totalXp} XP, Level ${profile.level})
- Target Daily Goal: 4 Hours (2 Hours DSA + 2 Hours Machine Learning)
- Studied Today: ${profile.todayStudiedMinutes} minutes (${(profile.todayStudiedMinutes / 60).toFixed(1)} hrs)
- Partner: ${activeFriend.name} (${activeFriend.streakDays}-day streak)
- Currently Watching Video: "${currentWatchingVideo?.title || 'None'}" (${currentWatchingVideo?.subject || 'DSA'})
- Timetable Holiday Today: ${isTodayHoliday ? 'YES (Intensive Full-Day Study Mode)' : 'No (Classes Active)'}
- Mon & Tue are designated holidays.

INSTRUCTIONS:
1. Provide concise, mathematically and conceptually rigorous answers.
2. For DSA / LeetCode / Algorithms: ALWAYS specify Time and Space Complexity upfront, then offer intuition, pattern recognition, and clean commented code.
3. Be deeply aware of both Diwakar and Ayush's study progress and support their engineering mastery.`;

    try {
      const history = chatMessages.slice(-8).map(m => ({
        role: m.sender as 'user' | 'assistant',
        text: m.text
      }));

      const reply = await GeminiService.chatWithFuse(
        geminiApiKey,
        history,
        text.trim(),
        systemPrompt
      );

      const aiMsg: ChatMessage = {
        id: 'msg_' + (Date.now() + 1),
        sender: 'assistant',
        model: 'FUSE (Gemini)',
        text: reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setChatMessages(prev => {
        const next = [...prev, aiMsg];
        try {
          localStorage.setItem(`fusion_chat_messages_${currentUser.toLowerCase()}`, JSON.stringify(next));
        } catch {}
        return next;
      });
    } catch (err: any) {
      console.error('[FUSE Chat Error]', err);
      const aiMsg: ChatMessage = {
        id: 'msg_' + (Date.now() + 1),
        sender: 'assistant',
        model: 'FUSE',
        text: `**FUSE AI Notice**: ${err.message}\n\n*To activate your dedicated Gemini model, click the API Key button in the top right of this chat and paste your Google Gemini API Key from Google AI Studio.*`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setChatMessages(prev => {
        const next = [...prev, aiMsg];
        try {
          localStorage.setItem(`fusion_chat_messages_${currentUser.toLowerCase()}`, JSON.stringify(next));
        } catch {}
        return next;
      });
    } finally {
      setIsAiThinking(false);
    }
  };

  const clearChat = () => {
    const welcome = getInitialChatMessages(currentUser);
    setChatMessages(welcome);
    try {
      localStorage.setItem(`fusion_chat_messages_${currentUser.toLowerCase()}`, JSON.stringify(welcome));
    } catch {}
  };

  // Task Punishment & Catastrophic Progress Deletion Logic
  const enforceTaskAccountability = async (manual: boolean = false): Promise<{ punished: boolean; message: string; wiped: boolean }> => {
    if (isVacationPaused) {
      return {
        punished: false,
        message: 'Vacation Pause is currently ACTIVE. Daily XP deduction and penalties are completely frozen while on vacation!',
        wiped: false
      };
    }
    const uncompletedCore = dailyTasks.filter(t => t.isCoreStreakTask && !t.completed);
    if (uncompletedCore.length === 0) {
      return { punished: false, message: 'All core study tasks completed! No punishment incurred.', wiped: false };
    }

    const penalty = uncompletedCore.length * 400; // Massive XP penalty
    const currentXp = profile.totalXp;
    const newXpCalc = currentXp - penalty;

    if (newXpCalc < 100) {
      // CATASTROPHIC PROGRESS DELETION
      const updatedProfile: StudentProfile = {
        ...profile,
        totalXp: 0,
        streakDays: 0,
        level: 1,
        todayStudiedMinutes: 0,
        strikes: (profile.strikes || 0) + 1,
        isPunished: true,
        punishmentReason: `${uncompletedCore.length} core study tasks failed. XP dropped below 100 threshold. Progress completely wiped.`
      };
      setProfile(updatedProfile);
      localStorage.setItem(`fusion_profile_${currentUser.toLowerCase()}`, JSON.stringify(updatedProfile));
      setPunishmentDetails({
        reason: `${uncompletedCore.length} core daily tasks were left uncompleted. Because your XP fell below the 100 threshold, your entire progress, streak, level, and XP have been wiped to 0.`,
        penaltyXp: penalty,
        isWiped: true,
        prevXp: currentXp,
        newXp: 0
      });
      setPunishmentModalOpen(true);
      await api.punishResetUser({
        userName: currentUser,
        isCatastrophicReset: true,
        penaltyXp: penalty,
        reason: 'Failed daily tasks and XP fell below 100'
      });
      return { punished: true, message: 'Catastrophic reset triggered! All user progress was erased.', wiped: true };
    } else {
      // MASSIVE XP REDUCTION
      const updatedProfile: StudentProfile = {
        ...profile,
        totalXp: newXpCalc,
        strikes: (profile.strikes || 0) + 1,
        isPunished: true,
        punishmentReason: `Penalized -${penalty} XP for ${uncompletedCore.length} uncompleted tasks.`
      };
      setProfile(updatedProfile);
      localStorage.setItem(`fusion_profile_${currentUser.toLowerCase()}`, JSON.stringify(updatedProfile));
      setPunishmentDetails({
        reason: `${uncompletedCore.length} core daily tasks were left incomplete. A massive penalty of -${penalty} XP has been deducted from your profile.`,
        penaltyXp: penalty,
        isWiped: false,
        prevXp: currentXp,
        newXp: newXpCalc
      });
      setPunishmentModalOpen(true);
      await api.punishResetUser({
        userName: currentUser,
        isCatastrophicReset: false,
        penaltyXp: penalty,
        reason: `Penalized -${penalty} XP for incomplete tasks`
      });
      return { punished: true, message: `Huge penalty applied: -${penalty} XP deducted for incomplete tasks.`, wiped: false };
    }
  };

  const dismissPunishmentAlert = () => {
    setPunishmentModalOpen(false);
  };

  // Full Real-Time Database Sync
  const refreshBackendData = useCallback(async () => {
    // Skip localhost polling on Android – the local backend doesn't exist there.
    // All sync on Android goes through cloudSync (Vercel) instead.
    if (Capacitor.isNativePlatform()) return;
    try {
      const res = await api.getSyncData();
      if (res.data && res.data.success) {
        setIsBackendConnected(true);
        if (Array.isArray(res.data.studySessions)) {
          setStudySessions(res.data.studySessions);
          localStorage.setItem('fusion_study_sessions', JSON.stringify(res.data.studySessions));
        }
        if (Array.isArray(res.data.dsaSessions)) {
          setDsaSessions(res.data.dsaSessions);
          localStorage.setItem('fusion_dsa_sessions', JSON.stringify(res.data.dsaSessions));
        }
        // partnerChat handled only via /friends/chat + WebSocket (avoid stale overwrites)
        const payload = res.data;
        if (Array.isArray(payload.courses) && payload.courses.length > 0) {
          setCourses(prev => {
            const merged = [...prev];
            payload.courses.forEach((bc: any) => {
              const existingIdx = merged.findIndex(c => c.id === bc.id);
              if (existingIdx >= 0) {
                if (Array.isArray(bc.lectures) && bc.lectures.length > 0) {
                  merged[existingIdx] = bc;
                }
              } else {
                merged.push(bc);
              }
            });
            localStorage.setItem('fusion_courses', JSON.stringify(merged));
            return merged;
          });
        }
        if (Array.isArray(payload.notes) && payload.notes.length > 0) {
          setNotes(prev => {
            const merged = [...prev];
            payload.notes.forEach((bn: any) => {
              const existingIdx = merged.findIndex(n => n.id === bn.id);
              if (existingIdx >= 0) {
                const existing = merged[existingIdx];
                merged[existingIdx] = {
                  ...bn,
                  tags: Array.isArray(bn.tags) && bn.tags.length > 0 ? bn.tags : (existing.tags || ['General']),
                  pdfUrl: bn.pdfUrl || existing.pdfUrl,
                  fileName: bn.fileName || existing.fileName,
                  fileSize: bn.fileSize || existing.fileSize
                };
              } else {
                merged.push({
                  ...bn,
                  tags: Array.isArray(bn.tags) && bn.tags.length > 0 ? bn.tags : ['General']
                });
              }
            });
            try {
              localStorage.setItem('fusion_notes', JSON.stringify(merged));
            } catch (storageErr) {
              console.warn('[Storage Quota] Could not persist all notes into localStorage:', storageErr);
            }
            return merged;
          });
        }
        if (Array.isArray(res.data.dailyTasks) && res.data.dailyTasks.length > 0) {
          setDailyTasks(res.data.dailyTasks);
        }
        if (Array.isArray(res.data.users)) {
          const dbCurrentUser = res.data.users.find((u: any) => u.full_name?.toLowerCase() === currentUser.toLowerCase());
          if (dbCurrentUser) {
            setProfile(prev => ({
              ...prev,
              streakDays: dbCurrentUser.streak ?? 0,
              totalXp: Math.max(100, dbCurrentUser.xp ?? 100),
              level: dbCurrentUser.level ?? 1,
              strikes: dbCurrentUser.strikes ?? prev.strikes,
              isPunished: dbCurrentUser.isPunished ?? prev.isPunished
            }));
          }
          const dbPartner = res.data.users.find((u: any) => u.full_name?.toLowerCase() !== currentUser.toLowerCase());
          if (dbPartner) {
            setActiveFriend(prev => ({
              ...prev,
              streakDays: dbPartner.streak ?? 0,
              totalXp: Math.max(100, dbPartner.xp ?? 100),
              currentlyWatching: dbPartner.currentlyWatching ?? null
            }));
          }
        }
      } else {
        const healthy = await api.checkHealth();
        setIsBackendConnected(healthy);
      }
    } catch {
      setIsBackendConnected(false);
    }
  }, [currentUser]);

  const handleSetCurrentWatchingVideo = (video: { title: string; url: string; subject: string } | null) => {
    setCurrentWatchingVideo(video);
    api.updateWatching(currentUser, video).catch((e: any) => console.warn('api updateWatching error', e));
    if (broadcastChannel) {
      broadcastChannel.postMessage({
        type: 'PARTNER_WATCHING_UPDATE',
        sender: currentUser,
        payload: video
      });
    }
  };

  // Light backend heartbeat (was 4s — caused Render 429 and missing chat)
  useEffect(() => {
    refreshBackendData();
    const interval = setInterval(refreshBackendData, 45000);
    return () => clearInterval(interval);
  }, [refreshBackendData]);

  // Notification & Background System Settings
  const [notificationSettings, setNotificationSettings] = useState<{
    enabled: boolean;
    backgroundEnabled: boolean;
    muteInAppPopups: boolean;
    intervalMinutes: number;
  }>(() => {
    try {
      const saved = localStorage.getItem('fusion_notification_settings');
      return saved ? JSON.parse(saved) : {
        enabled: true,
        backgroundEnabled: true,
        muteInAppPopups: false,
        intervalMinutes: 30
      };
    } catch {
      return {
        enabled: true,
        backgroundEnabled: true,
        muteInAppPopups: false,
        intervalMinutes: 30
      };
    }
  });

  const updateNotificationSettings = useCallback((updates: Partial<{
    enabled: boolean;
    backgroundEnabled: boolean;
    muteInAppPopups: boolean;
    intervalMinutes: number;
  }>) => {
    setNotificationSettings(prev => {
      const next = { ...prev, ...updates };
      try { localStorage.setItem('fusion_notification_settings', JSON.stringify(next)); } catch {}
      return next;
    });
  }, []);

  const scheduleNativeReminders = useCallback(async (intervalMins: number = notificationSettings.intervalMinutes) => {
    if (!Capacitor.isNativePlatform() || !notificationSettings.backgroundEnabled) return;
    try {
      const pending = await LocalNotifications.getPending();
      const reminderIds = pending.notifications
        .filter(n => n.extra?.type === 'recurring_streak')
        .map(n => ({ id: n.id }));
      if (reminderIds.length > 0) {
        await LocalNotifications.cancel({ notifications: reminderIds });
      }

      const intervalMs = Math.max(5, intervalMins) * 60 * 1000;
      const notifications = [];
      for (let i = 1; i <= 24; i++) {
        notifications.push({
          title: '🔥 FUSION Streak Check',
          body: 'Time to check your daily tasks and protect your streak!',
          id: 90000 + i,
          schedule: {
            at: new Date(Date.now() + intervalMs * i),
            allowWhileIdle: true
          },
          smallIcon: 'ic_stat_fusion',
          largeIcon: 'ic_launcher',
          sound: 'default',
          channelId: 'fusion_reminders',
          extra: { type: 'recurring_streak' }
        });
      }
      await LocalNotifications.schedule({ notifications });
    } catch (err) {
      console.warn('scheduleNativeReminders error', err);
    }
  }, [notificationSettings.backgroundEnabled, notificationSettings.intervalMinutes]);

  const testBackgroundNotification = useCallback(async (): Promise<{ success: boolean; message: string }> => {
    const pendingTasks = dailyTasks.filter(t => !t.completed);
    const pendingCount = pendingTasks.length;
    const title = '🔥 FUSION Background Alert';
    const message = pendingCount > 0
      ? `You have ${pendingCount} pending task(s). Open FUSION to keep your streak safe!`
      : `All tasks complete today! Streak safely active at ${profile.streakDays} days.`;

    if (Capacitor.isNativePlatform()) {
      try {
        await LocalNotifications.requestPermissions();
        await LocalNotifications.createChannel({
          id: 'fusion_reminders',
          name: 'FUSION Reminders',
          description: 'Streak and task reminder notifications',
          importance: 5,
          visibility: 1,
          vibration: true,
          sound: 'default'
        });
        await LocalNotifications.schedule({
          notifications: [
            {
              title,
              body: message,
              id: 99999,
              schedule: {
                at: new Date(Date.now() + 5000), // Fires in 5 seconds
                allowWhileIdle: true
              },
              smallIcon: 'ic_stat_fusion',
              largeIcon: 'ic_launcher',
              sound: 'default',
              channelId: 'fusion_reminders',
              extra: { type: 'test_background' }
            }
          ]
        });
        return {
          success: true,
          message: 'Test scheduled! Minimize or close the app now to see it in your status bar in 5 seconds.'
        };
      } catch (err: any) {
        return { success: false, message: `Failed to schedule: ${err?.message || err}` };
      }
    } else if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission !== 'granted') {
        const perm = await Notification.requestPermission();
        if (perm !== 'granted') {
          return { success: false, message: 'Notification permission was denied.' };
        }
      }
      setTimeout(() => {
        try {
          new Notification(title, {
            body: message,
            icon: '/icons/STREAK.gif'
          });
        } catch {}
      }, 5000);
      return { success: true, message: 'Web notification scheduled in 5 seconds! Switch tabs or minimize browser.' };
    }
    return { success: false, message: 'Notifications not supported in this environment.' };
  }, [dailyTasks, profile.streakDays]);

  // 30-Minute Streak & Task Notification System
  const [reminderToast, setReminderToast] = useState<{ title: string; message: string; pendingTasksCount: number } | null>(null);

  const dismissReminderToast = useCallback(() => {
    setReminderToast(null);
  }, []);

  const triggerManualStreakReminder = useCallback(async () => {
    if (!notificationSettings.enabled) return;

    const pendingTasks = dailyTasks.filter(t => !t.completed);
    const pendingCount = pendingTasks.length;
    const coreTasksPending = dailyTasks.filter(t => t.isCoreStreakTask && !t.completed).length;

    let title = '🔥 Streak & Task Reminder';
    let message = '';

    if (coreTasksPending > 0) {
      message = `You have ${coreTasksPending} core coding challenge(s) remaining today! Complete them to protect your ${profile.streakDays}-day streak.`;
    } else if (pendingCount > 0) {
      message = `Streak verified! You still have ${pendingCount} daily task(s) on your checklist to earn bonus XP.`;
    } else {
      message = `Awesome work! All daily tasks are finished today. Current streak is locked at ${profile.streakDays} days!`;
    }

    // Native or Web Notification
    if (Capacitor.isNativePlatform()) {
      try {
        await LocalNotifications.schedule({
          notifications: [
            {
              title,
              body: message,
              id: Date.now(),
              schedule: { at: new Date(Date.now() + 500), allowWhileIdle: true },
              smallIcon: 'ic_stat_fusion',
              largeIcon: 'ic_launcher',
              sound: 'default',
              channelId: 'fusion_reminders',
              extra: { type: 'streak_reminder' }
            }
          ]
        });
      } catch {}
    } else if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'granted') {
        try {
          new Notification(title, {
            body: message,
            icon: '/icons/STREAK.gif'
          });
        } catch {}
      } else if (Notification.permission !== 'denied') {
        Notification.requestPermission().then(perm => {
          if (perm === 'granted') {
            try {
              new Notification(title, { body: message, icon: '/icons/STREAK.gif' });
            } catch {}
          }
        });
      }
    }

    // In-App Toast & Audio Chime (only if user hasn't muted in-app popups)
    if (!notificationSettings.muteInAppPopups) {
      playNotificationChime();
      setReminderToast({
        title,
        message,
        pendingTasksCount: pendingCount
      });

      // Auto-dismiss in-app toast after 8 seconds
      setTimeout(() => {
        setReminderToast(null);
      }, 8000);
    }
  }, [dailyTasks, profile.streakDays, playNotificationChime, notificationSettings.enabled, notificationSettings.muteInAppPopups]);

  // Request notification permission on native platforms & create channel
  useEffect(() => {
    if (Capacitor.isNativePlatform()) {
      const initNative = async () => {
        try {
          await LocalNotifications.requestPermissions();
          await LocalNotifications.createChannel({
            id: 'fusion_reminders',
            name: 'FUSION Reminders',
            description: 'Streak and task reminder notifications',
            importance: 5,
            visibility: 1,
            vibration: true,
            sound: 'default'
          });
        } catch {}
        try {
          StatusBar.setStyle({ style: StatusBarStyle.Dark });
          StatusBar.setBackgroundColor({ color: '#1E1E24' });
        } catch {}
      };
      initNative();
    }
  }, []);

  // Recurring interval timer for streak & task reminders
  useEffect(() => {
    if (!notificationSettings.enabled) return;

    if (Capacitor.isNativePlatform() && notificationSettings.backgroundEnabled) {
      scheduleNativeReminders(notificationSettings.intervalMinutes);
    }

    const intervalMs = Math.max(5, notificationSettings.intervalMinutes) * 60 * 1000;
    const interval = setInterval(() => {
      triggerManualStreakReminder();
    }, intervalMs);

    return () => clearInterval(interval);
  }, [notificationSettings.enabled, notificationSettings.backgroundEnabled, notificationSettings.intervalMinutes, triggerManualStreakReminder, scheduleNativeReminders]);

  return (
    <StudentOsContext.Provider
      value={{
        activeModule,
        setActiveModule,
        isAiChatOpen,
        setIsAiChatOpen,
        isProfileModalOpen,
        setIsProfileModalOpen,
        currentUser,
        isBackendConnected,
        refreshBackendData,
        isAuthenticated,
        loginWithEntryCode,
        logout,
        isAyushPasswordSet,
        setAyushPermanentPassword,
        geminiApiKey,
        setGeminiApiKey,
        youtubeApiKey,
        setYoutubeApiKey,
        isAiThinking,
        enforceTaskAccountability,
        dismissPunishmentAlert,
        punishmentModalOpen,
        setPunishmentModalOpen,
        punishmentDetails,
        profile,
        updateProfile,
        updateProfileAvatar,
        activeFriend,
        setActiveFriend,
        friendStudyStatus: activeFriend.isFocusing ? `Focusing on ${activeFriend.focusSubject}` : 'In Study Room',
        sendFriendNudge,
        partnerChatMessages,
        sendPartnerChatMessage,
        notes,
        addNote,
        deleteNote,
        pdfQuestionSheets,
        addPdfQuestionSheet,
        togglePdfQuestion,
        generateCodingSheetByAi,
        addQuestionFromScreenshot,
        isVacationPaused,
        toggleVacationMode,
        hasWatchedPlaylistVideoToday,
        markPlaylistVideoWatchedToday,
        timerSeconds,
        timerDurationMinutes,
        setTimerDurationMinutes,
        isTimerRunning,
        timerMode,
        timerSubject,
        setTimerSubject,
        startTimer,
        pauseTimer,
        resetTimer,
        studySessions,
        addStudySession,
        courses,
        addCourse,
        deleteCourse,
        currentWatchingVideo,
        setCurrentWatchingVideo: handleSetCurrentWatchingVideo,
        toggleLectureCompleted,
        markAllLecturesCompleted,
        activePlayingCourse,
        setActivePlayingCourse,
        activeLecture,
        setActiveLecture,
        timetable,
        collegeWorkingHours,
        setCollegeWorkingHours: handleSetCollegeWorkingHours,
        timetableImageUrl,
        setTimetableImageUrl,
        timetableSchedule,
        isTodayHoliday,
        setIsTodayHoliday,
        uploadTimetableImage,
        generateAiStudySchedule,
        dsaSessions,
        logDsaSession,
        dsaProblems,
        toggleDsaStatus,
        addDsaProblem,
        mlMilestones,
        toggleMlMilestone,
        dailyTasks,
        toggleDailyTask,
        addDailyTask,
        deleteDailyTask,
        isStreakProtectedToday,
        habits,
        toggleHabit,
        goals,
        updateGoalProgress,
        heatmapData,
        chatMessages,
        sendChatMessage,
        clearChat,
        reminderToast,
        dismissReminderToast,
        triggerManualStreakReminder,
        notificationSettings,
        updateNotificationSettings,
        testBackgroundNotification,
        scheduleNativeReminders
      }}
    >
      {children}
    </StudentOsContext.Provider>
  );
};

export const useStudentOs = (): StudentOsContextType => {
  const context = useContext(StudentOsContext);
  if (!context) {
    throw new Error('useStudentOs must be used within a StudentOsProvider');
  }
  return context;
};
