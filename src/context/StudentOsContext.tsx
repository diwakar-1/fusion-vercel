import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { triggerSparkleConfetti as confetti } from '../utils/confettiHelper';
import { Capacitor } from '@capacitor/core';
import { LocalNotifications } from '@capacitor/local-notifications';
import { StatusBar, Style as StatusBarStyle } from '@capacitor/status-bar';
import { api } from '../services/api';
import { cloudSync } from '../services/cloudSync';
import { GeminiService } from '../services/gemini';
import { YouTubeService } from '../services/youtube';
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

const DEFAULT_TIMETABLE: TimetableClass[] = [
  { id: '1', day: 'Wed', subject: 'Operating Systems', code: 'CS301', time: '09:00 - 10:00 AM', room: 'Hall 302', professor: 'Dr. Aris Vance' },
  { id: '2', day: 'Wed', subject: 'Database Management', code: 'CS303', time: '10:15 - 11:15 AM', room: 'Lab 4', professor: 'Prof. Sarah Chen' },
  { id: '3', day: 'Wed', subject: 'Machine Learning', code: 'CS305', time: '11:30 - 12:30 PM', room: 'Seminar A', professor: 'Dr. Marcus Brody' },
  { id: '4', day: 'Thu', subject: 'Computer Networks', code: 'CS304', time: '10:15 - 11:15 AM', room: 'Lab 2', professor: 'Dr. Elena Rostova' },
  { id: '5', day: 'Fri', subject: 'Software Engineering', code: 'CS306', time: '09:00 - 10:00 AM', room: 'Hall 201', professor: 'Prof. David Miller' }
];

const DEFAULT_STUDY_SESSIONS: StudySession[] = [];

const DEFAULT_DSA_SESSIONS: DsaSession[] = [];

// Fresh start: Empty sheet — users add their own questions
const DEFAULT_PDF_SHEETS: PdfQuestionSheet[] = [];

const DEFAULT_DAILY_TASKS: DailyTask[] = [
  { id: 'dt_1', title: 'Solve 2 Medium problems on LeetCode / Codeforces', platform: 'LeetCode', exp: 100, completed: false, isCoreStreakTask: true },
  { id: 'dt_2', title: 'Complete 2 Hours DSA Deep Focus Session', platform: 'Focus Timer', exp: 100, completed: false, isCoreStreakTask: true },
  { id: 'dt_3', title: 'Watch 1 Module from AIML YouTube Playlist (2 Hours)', platform: 'AIML Hub', exp: 100, completed: false, isCoreStreakTask: true },
  { id: 'dt_4', title: 'Solve 1 Kata on CodeWars or HackerRank challenge', platform: 'CodeWars', exp: 60, completed: false, isCoreStreakTask: false }
];

// Fresh start: No pre-seeded DSA problems
const DEFAULT_DSA_PROBLEMS: DsaProblem[] = [];

const DEFAULT_ML_MILESTONES: MlMilestone[] = [
  {
    id: 'm1',
    phase: 'Phase 1: Math & Foundations',
    title: 'Linear Algebra & Backpropagation from Scratch',
    description: 'Eigenvalues, vector calculus, computational graphs and building Micrograd.',
    completed: true,
    resources: [{ name: 'Andrej Karpathy Micrograd', url: 'https://www.youtube.com/watch?v=VMj-3S1tku0' }]
  },
  {
    id: 'm2',
    phase: 'Phase 2: Deep Language Modeling',
    title: 'Autoregressive LM & MLP Makemore',
    description: 'Character-level language modeling, loss functions and cross-entropy.',
    completed: true,
    resources: [{ name: 'Makemore Series', url: 'https://www.youtube.com/watch?v=PaCmpygFfXo' }]
  },
  {
    id: 'm3',
    phase: 'Phase 3: Transformer Architecture',
    title: 'Self-Attention & Building GPT from Scratch',
    description: 'Multi-Head Attention, residual connections, and positional encodings.',
    completed: false,
    resources: [{ name: 'Let\'s build GPT', url: 'https://www.youtube.com/watch?v=kCc8FmEb1nY' }]
  }
];

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

// Shared YouTube Playlist Merger: "they both different upload they can only see YT playlist"
const mergePlaylists = (existing: VideoCourse[], ...lists: (VideoCourse[] | undefined)[]): VideoCourse[] => {
  const map = new Map<string, VideoCourse>();
  const getKey = (c: VideoCourse) => {
    const ytId = YouTubeService.extractPlaylistId(c.youtubeUrl || '') || YouTubeService.extractVideoId(c.youtubeUrl || '');
    return ytId || c.id || (c.title ? c.title.toLowerCase().trim() : '');
  };

  if (Array.isArray(existing)) {
    existing.forEach(c => {
      const k = getKey(c);
      if (k) map.set(k, c);
    });
  }

  lists.forEach(list => {
    if (Array.isArray(list)) {
      list.forEach(c => {
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

  // Storage version gate — bump version to wipe stale cached data
  const STORAGE_VERSION = 'fusion_v3';
  if (typeof window !== 'undefined' && localStorage.getItem('fusion_storage_version') !== STORAGE_VERSION) {
    // Clear stale DSA problems, pdf sheets, and task completion states for fresh start
    localStorage.removeItem('fusion_dsa_problems');
    localStorage.removeItem('fusion_pdf_sheets');
    localStorage.removeItem('fusion_daily_tasks');
    localStorage.setItem('fusion_storage_version', STORAGE_VERSION);
  }

  // Auth State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('fusion_authenticated') === 'true';
  });

  const [currentUser, setCurrentUser] = useState<'Diwakar' | 'Ayush'>(() => {
    return (localStorage.getItem('fusion_user') as 'Diwakar' | 'Ayush') || 'Diwakar';
  });

  const [profile, setProfile] = useState<StudentProfile>(() => {
    const saved = localStorage.getItem(`fusion_profile_${currentUser.toLowerCase()}`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return {
          ...parsed,
          streakDays: parsed.streakDays ?? 0,
          totalXp: Math.max(100, parsed.totalXp ?? 100),
          level: parsed.level ?? 1
        };
      } catch {}
    }
    return currentUser === 'Diwakar' ? DEFAULT_DIWAKAR_PROFILE : DEFAULT_AYUSH_PROFILE;
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
    setGeminiApiKeyState(key.trim());
    GeminiService.setApiKey(currentUser, key.trim());
  };

  // YouTube API Key Management
  const [youtubeApiKey, setYoutubeApiKeyState] = useState<string>(() => {
    return YouTubeService.getApiKey(currentUser);
  });

  const setYoutubeApiKey = (key: string) => {
    const clean = key.trim();
    setYoutubeApiKeyState(clean);
    YouTubeService.setApiKey(currentUser, clean);
    api.setYoutubeKey(clean);
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

  const [timetableSchedule, setTimetableSchedule] = useState<TimetableScheduleSlot[]>([
    { id: 'sch_0', time: '09:00 AM - 04:00 PM', subject: 'College Lectures', topic: 'College Working Hours & Academic Sessions', type: 'College Working Hours', completed: true },
    { id: 'sch_1', time: '04:00 - 05:00 PM', subject: 'Break', topic: 'Commute & Evening Refreshment', type: 'Rest', completed: true },
    { id: 'sch_2', time: '05:00 - 07:00 PM', subject: 'DSA', topic: 'Two Pointers & Sliding Window LeetCode Patterns (2h Target)', type: 'Problem Solving', completed: false },
    { id: 'sch_3', time: '07:00 - 08:00 PM', subject: 'Break', topic: 'Dinner & Downtime Break', type: 'Rest', completed: false },
    { id: 'sch_4', time: '08:00 - 10:00 PM', subject: 'Machine Learning', topic: 'Neural Networks Architecture & Backpropagation (2h Target)', type: 'Video Lecture', completed: false },
    { id: 'sch_5', time: '10:00 - 10:30 PM', subject: 'Core CS', topic: 'Daily Revision & Code Commit Checklist', type: 'Revision', completed: false }
  ]);

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

  // Daily tasks & Habits
  const [dailyTasks, setDailyTasks] = useState<DailyTask[]>(() => {
    const saved = localStorage.getItem('fusion_daily_tasks');
    return saved ? JSON.parse(saved) : DEFAULT_DAILY_TASKS;
  });

  const [habits, setHabits] = useState<Habit[]>([
    { id: 'h1', title: 'Daily LeetCode 2 Problems', icon: 'Code', streak: 14, completedToday: true, weeklyHistory: [true, true, true, true, true, true, true] },
    { id: 'h2', title: '2 Hours Machine Learning Deep Focus', icon: 'Brain', streak: 12, completedToday: false, weeklyHistory: [true, true, false, true, true, true, false] },
    { id: 'h3', title: '2 Hours DSA Deep Practice Block', icon: 'Zap', streak: 14, completedToday: true, weeklyHistory: [true, true, true, true, true, true, true] },
    { id: 'h4', title: 'Spaced Repetition Concept Review', icon: 'BookOpen', streak: 9, completedToday: false, weeklyHistory: [false, true, true, true, false, true, false] }
  ]);

  const [goals, setGoals] = useState<Goal[]>([
    { id: 'g1', title: 'Master 150 Blind LeetCode Problems', category: 'DSA', targetDate: 'Nov 2026', progress: 68 },
    { id: 'g2', title: 'Build GPT-2 from Scratch in PyTorch', category: 'Machine Learning', targetDate: 'Oct 2026', progress: 54 },
    { id: 'g3', title: 'Complete Striver Graph & DP Series', category: 'DSA', targetDate: 'Dec 2026', progress: 75 }
  ]);

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

  // Focus Timer State
  const [timerDurationMinutes, setTimerDurationMinutes] = useState<number>(25);
  const [timerSeconds, setTimerSeconds] = useState<number>(25 * 60);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);
  const [timerMode, setTimerMode] = useState<'focus' | 'short_break' | 'long_break'>('focus');
  const [timerSubject, setTimerSubject] = useState<string>('DSA');

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
          const userMatch = (s.user_name?.toLowerCase() === currentUser.toLowerCase() || (s as any).userName?.toLowerCase() === currentUser.toLowerCase());
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
  }, [studySessions, currentUser, profile.todayStudiedMinutes]);

  const [heatmapData, setHeatmapData] = useState<HeatmapDay[]>(generateHeatmap);

  useEffect(() => {
    setHeatmapData(generateHeatmap());
  }, [generateHeatmap]);

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
        setPartnerChatMessages(prev => [...prev, payload]);
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

  // Real-Time 1-Second Bi-Directional Cloud State Synchronizer (Web <-> Android App)
  useEffect(() => {
    if (!isAuthenticated) return;

    const stopSync = cloudSync.startAutoSync(
      () => currentUser,
      (remoteData, partnerData) => {
        if (remoteData) {
          if (remoteData.profile) {
            setProfile(prev => ({
              ...prev,
              ...remoteData.profile,
              streakDays: remoteData.profile.streakDays ?? prev.streakDays,
              totalXp: Math.max(prev.totalXp, remoteData.profile.totalXp ?? prev.totalXp),
              level: remoteData.profile.level ?? prev.level,
              todayStudiedMinutes: Math.max(prev.todayStudiedMinutes, remoteData.profile.todayStudiedMinutes ?? prev.todayStudiedMinutes)
            }));
          }
          if (Array.isArray(remoteData.dailyTasks) && remoteData.dailyTasks.length > 0) {
            setDailyTasks(remoteData.dailyTasks);
            try { localStorage.setItem('fusion_daily_tasks', JSON.stringify(remoteData.dailyTasks)); } catch {}
          }
          if (Array.isArray(remoteData.notes)) {
            setNotes(remoteData.notes);
            try { localStorage.setItem('fusion_notes', JSON.stringify(remoteData.notes)); } catch {}
          }
          if (remoteData.timetableSchedule) {
            setTimetableSchedule(remoteData.timetableSchedule);
            try { localStorage.setItem('fusion_timetable_schedule', JSON.stringify(remoteData.timetableSchedule)); } catch {}
          }
          if (Array.isArray(remoteData.dsaTopics) && remoteData.dsaTopics.length > 0) {
            setDsaProblems(remoteData.dsaTopics);
            try { localStorage.setItem('fusion_dsa_problems', JSON.stringify(remoteData.dsaTopics)); } catch {}
          }
          if (Array.isArray(remoteData.studyLogs) && remoteData.studyLogs.length > 0) {
            setStudySessions(remoteData.studyLogs);
            try { localStorage.setItem('fusion_study_sessions', JSON.stringify(remoteData.studyLogs)); } catch {}
          }
          // Shared YouTube Playlist Engine: "they both different upload they can only see YT playlist"
          const allPartnerCourses = Array.isArray(partnerData?.courses) ? partnerData.courses : [];
          const allRemoteCourses = Array.isArray(remoteData?.courses) ? remoteData.courses : [];
          if (allRemoteCourses.length > 0 || allPartnerCourses.length > 0) {
            setCourses(prev => {
              const merged = mergePlaylists(prev, allRemoteCourses, allPartnerCourses);
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
          if (remoteData.geminiApiKey) {
            setGeminiApiKeyState(remoteData.geminiApiKey);
            GeminiService.setApiKey(currentUser, remoteData.geminiApiKey);
          }
          if (remoteData.youtubeApiKey) {
            setYoutubeApiKeyState(remoteData.youtubeApiKey);
            YouTubeService.setApiKey(currentUser, remoteData.youtubeApiKey);
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
          // Sync self partner chat messages
          if (Array.isArray(remoteData.partnerChatMessages) && remoteData.partnerChatMessages.length > 0) {
            setPartnerChatMessages(prev => {
              const existingIds = new Set(prev.map(m => m.id));
              const toAdd = remoteData.partnerChatMessages!.filter((m: any) => !existingIds.has(m.id));
              if (toAdd.length > 0) {
                const merged = [...prev, ...toAdd].sort((a, b) => a.id.localeCompare(b.id));
                try { localStorage.setItem('fusion_partner_chat', JSON.stringify(merged)); } catch {}
                return merged;
              }
              return prev;
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
          // Shared YouTube Playlists added by Partner: "they both different upload they can only see YT playlist"
          if (Array.isArray(partnerData.courses) && partnerData.courses.length > 0) {
            setCourses(prev => {
              const merged = mergePlaylists(prev, partnerData.courses);
              try { localStorage.setItem('fusion_courses', JSON.stringify(merged)); } catch {}
              return merged;
            });
          }
          // Cross-device Partner Chat Sync
          if (Array.isArray(partnerData.partnerChatMessages) && partnerData.partnerChatMessages.length > 0) {
            setPartnerChatMessages(prev => {
              const existingIds = new Set(prev.map(m => m.id));
              const toAdd = partnerData.partnerChatMessages.filter((m: any) => !existingIds.has(m.id));
              if (toAdd.length > 0) {
                const merged = [...prev, ...toAdd].sort((a, b) => a.id.localeCompare(b.id));
                try { localStorage.setItem('fusion_partner_chat', JSON.stringify(merged)); } catch {}
                return merged;
              }
              return prev;
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

    return () => stopSync();
  }, [isAuthenticated, currentUser, playNotificationChime]);

  // Push local updates to Cloud Sync API on state mutation
  useEffect(() => {
    if (!isAuthenticated) return;
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
      aiChatMessages: chatMessages,
      studyLogs: studySessions,
      partnerChatMessages,
      isVacationPaused,
      hasWatchedPlaylistVideoToday,
      ayushPassword: currentUser === 'Ayush' ? (localStorage.getItem('fusion_ayush_password') || undefined) : undefined,
      updatedAt: Date.now()
    });
  }, [
    isAuthenticated,
    currentUser,
    profile.totalXp,
    profile.streakDays,
    profile.todayStudiedMinutes,
    dailyTasks,
    dsaProblems,
    notes,
    timetableSchedule,
    studySessions,
    courses,
    pdfQuestionSheets,
    habits,
    goals,
    mlMilestones,
    geminiApiKey,
    youtubeApiKey,
    partnerChatMessages,
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

  // Auth Action
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
      setIsAuthenticated(true);
      localStorage.setItem('fusion_authenticated', 'true');
      localStorage.setItem('fusion_user', user);

      const targetProfile = user === 'Diwakar' ? DEFAULT_DIWAKAR_PROFILE : DEFAULT_AYUSH_PROFILE;
      setProfile(targetProfile);
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
    setProfile(prev => ({ ...prev, avatar: avatarUrl }));
    localStorage.setItem(`fusion_profile_${currentUser.toLowerCase()}`, JSON.stringify({ ...profile, avatar: avatarUrl }));
    api.updateProfileAvatar({ userName: currentUser, avatar: avatarUrl });
  };

  const updateProfile = (updates: Partial<StudentProfile>) => {
    setProfile(prev => {
      const next = { ...prev, ...updates };
      localStorage.setItem(`fusion_profile_${currentUser.toLowerCase()}`, JSON.stringify(next));
      return next;
    });
  };

  // Timer Tick
  useEffect(() => {
    let interval: any = null;
    if (isTimerRunning && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds(s => s - 1);
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

      setStudySessions(prev => [newSession, ...prev]);
      setProfile(p => ({
        ...p,
        todayStudiedMinutes: p.todayStudiedMinutes + minutesSpent,
        totalXp: p.totalXp + minutesSpent * 2
      }));

      api.createStudySession(newSession);

      // Broadcast to partner
      if (broadcastChannel) {
        broadcastChannel.postMessage({
          type: 'PARTNER_FOCUS_UPDATE',
          sender: currentUser,
          payload: {
            isFocusing: false,
            focusSubject: timerSubject,
            todayStudiedMinutes: profile.todayStudiedMinutes + minutesSpent
          }
        });
      }
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timerSeconds, timerDurationMinutes, timerSubject, currentUser, profile.todayStudiedMinutes]);

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
    setStudySessions(prev => [newSession, ...prev]);
    setProfile(p => ({
      ...p,
      todayStudiedMinutes: p.todayStudiedMinutes + session.duration_minutes,
      totalXp: p.totalXp + session.duration_minutes * 2
    }));
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
    setProfile(p => ({
      ...p,
      todayStudiedMinutes: p.todayStudiedMinutes + session.durationMinutes,
      totalXp: p.totalXp + session.problemsCount * 30
    }));
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
    setCourses(prev => {
      const updated = prev.filter(c => c.id !== id);
      localStorage.setItem('fusion_courses', JSON.stringify(updated));
      return updated;
    });
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
    const newNote: StudentNote = {
      ...note,
      id: 'n_' + Date.now(),
      createdAt: 'Just now'
    };
    setNotes(prev => {
      const updated = [newNote, ...prev.filter(n => n.id !== newNote.id)];
      try {
        localStorage.setItem('fusion_notes', JSON.stringify(updated));
      } catch (e) {
        console.warn('[Note Storage Quota Warning]', e);
      }
      return updated;
    });
    api.createNote(newNote).catch(e => console.warn('api createNote error', e));
  };

  const deleteNote = (id: string) => {
    setNotes(prev => {
      const updated = prev.filter(n => n.id !== id);
      try {
        localStorage.setItem('fusion_notes', JSON.stringify(updated));
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

  // Habits
  const toggleHabit = (habitId: string) => {
    setHabits(prev =>
      prev.map(h => {
        if (h.id === habitId) {
          const done = !h.completedToday;
          const streak = done ? h.streak + 1 : Math.max(0, h.streak - 1);
          if (done) {
            confetti({ particleCount: 40, spread: 50 });
            setProfile(p => ({ ...p, totalXp: p.totalXp + 25 }));
          }
          return { ...h, completedToday: done, streak };
        }
        return h;
      })
    );
  };

  const updateGoalProgress = (goalId: string, progress: number) => {
    setGoals(prev =>
      prev.map(g => (g.id === goalId ? { ...g, progress: Math.min(100, Math.max(0, progress)) } : g))
    );
  };

  // Partner Live Chat (Syncs across Web & Android App)
  const sendPartnerChatMessage = (text: string) => {
    if (!text.trim()) return;
    const msg = {
      id: 'pc_' + Date.now(),
      sender: currentUser,
      text: text.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setPartnerChatMessages(prev => {
      const next = [...prev, msg];
      try { localStorage.setItem('fusion_partner_chat', JSON.stringify(next)); } catch {}
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
        studyLogs: studySessions,
        partnerChatMessages: next,
        isVacationPaused,
        hasWatchedPlaylistVideoToday,
        updatedAt: Date.now()
      });
      return next;
    });

    if (broadcastChannel) {
      broadcastChannel.postMessage({
        type: 'PARTNER_CHAT_MESSAGE',
        sender: currentUser,
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
        if (Array.isArray(res.data.partnerChat)) {
          setPartnerChatMessages(res.data.partnerChat);
        }
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

  // Initial & Continuous Real-time Heartbeat Polling (every 4s)
  useEffect(() => {
    refreshBackendData();
    const interval = setInterval(refreshBackendData, 4000);
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
