export type AIModelId = 'gemma4:latest' | 'minimax-m3:cloud' | 'gpt-5-nano' | 'gemini-3' | 'grok-4.1' | string;

export interface AIModel {
  id: AIModelId;
  name: string;
  provider: string;
  badge?: string;
  description: string;
  accentColor: string;
  isLocal?: boolean;
}

export interface StudentProfile {
  id?: string;
  name: string;
  handle: string;
  avatar: string;
  college?: string;
  branch?: string;
  semester?: string;
  tier?: string;
  streakDays: number;
  totalXp: number;
  level: number;
  dailyGoalHours: number;
  dsaGoalHours: number;
  mlGoalHours: number;
  todayStudiedMinutes: number;
  geminiApiKey?: string;
  youtubeApiKey?: string;
  strikes?: number;
  isPunished?: boolean;
  punishmentReason?: string;
  lastPunishedDate?: string;
  isVacationPaused?: boolean;
  entryCode?: string;
  shortCode?: string;
}

export interface FriendProfile {
  name: string;
  handle: string;
  avatar: string;
  college?: string;
  branch?: string;
  semester?: string;
  streakDays: number;
  todayStudiedMinutes: number;
  totalXp: number;
  isOnline: boolean;
  isFocusing?: boolean;
  focusSubject?: string;
  currentlyWatching?: {
    title: string;
    url: string;
    subject: string;
  } | null;
}

export interface StudySession {
  id: string;
  user_id: string;
  user_name: string;
  subject_name: string;
  duration_minutes: number;
  timestamp: string;
  notes?: string;
}

export interface TimetableClass {
  id: string;
  day: 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun';
  subject: string;
  code: string;
  time: string;
  room?: string;
  professor?: string;
}

export interface TimetableScheduleSlot {
  id: string;
  time: string;
  subject: 'College Lectures' | 'DSA' | 'Machine Learning' | 'Core CS' | 'Review' | 'Break' | string;
  topic: string;
  type: 'College Working Hours' | 'Focus Block' | 'Problem Solving' | 'Video Lecture' | 'Revision' | 'Rest' | string;
  completed?: boolean;
  isHolidaySlot?: boolean;
}

export interface DsaSession {
  id: string;
  user: string;
  topic: string;
  platform: 'LeetCode' | 'Codeforces' | 'CodeChef' | 'HackerRank' | 'GeeksforGeeks' | 'CodeWars' | string;
  durationMinutes: number;
  problemsCount: number;
  notes: string;
  timestamp: string;
}

export type DsaStatus = 'Solved' | 'In Progress' | 'Due for Revision' | 'Unsolved';

export interface DsaProblem {
  id: string;
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  topic: string;
  platform: 'LeetCode' | 'Codeforces' | 'CodeChef' | 'HackerRank' | 'GeeksforGeeks' | string;
  status: DsaStatus;
  lastPracticed?: string;
  nextRevisionDays: number;
}

export interface PlaylistLecture {
  id: string;
  title: string;
  duration: string;
  videoId: string;
  completed: boolean;
  thumbnail?: string;
  phase?: string;
}

export interface VideoCourse {
  id: string;
  title: string;
  subject: string;
  youtubeUrl: string;
  embedUrl: string;
  addedBy: string;
  currentLesson: string;
  totalLessons: string;
  lectures: PlaylistLecture[];
  phases?: { name: string; lectureIds: string[] }[];
}

export interface FriendChatMessage {
  id: string;
  sender: string;
  text: string;
  timestamp: string;
}

export interface PdfQuestionItem {
  id: string;
  title: string;
  platform?: string;
  topic?: string;
  screenshotUrl?: string;
  difficulty?: string;
  completed: boolean;
  completedBy?: string;
}

export interface PdfQuestionSheet {
  id: string;
  title: string;
  subject: string;
  totalCount: number;
  completedCount: number;
  questions: PdfQuestionItem[];
}

export interface DailyTask {
  id: string;
  title: string;
  platform: string;
  exp: number;
  completed: boolean;
  isCoreStreakTask: boolean;
  isCustom?: boolean;
  createdBy?: string;
  completedBy?: string;
  xpClaimed?: boolean;  // XP can only be awarded ONCE — prevents check/uncheck exploit
}

export interface Habit {
  id: string;
  title: string;
  icon: string;
  streak: number;
  completedToday: boolean;
  weeklyHistory: boolean[];
}

export interface Goal {
  id: string;
  title: string;
  category: 'DSA' | 'Machine Learning' | 'Dev / Systems' | 'Academic' | 'AI / Dev' | 'Personal' | string;
  targetDate: string;
  progress: number;
}

export interface MlMilestoneResource {
  name: string;
  url: string;
}

export interface MlMilestone {
  id: string;
  phase: string;
  title: string;
  description: string;
  completed: boolean;
  resources: MlMilestoneResource[];
}

export type ProjectStatus = 'backlog' | 'in_progress' | 'review' | 'completed';

export interface ProjectTask {
  id: string;
  title: string;
  description: string;
  status: ProjectStatus;
  priority: 'Low' | 'Medium' | 'High';
  tags: string[];
  dueDate: string;
}

export interface YouTubeRecommendation {
  id: string;
  videoId: string;
  title: string;
  channelTitle: string;
  description: string;
  thumbnail: string;
  publishedAt: string;
  category: 'DSA' | 'Machine Learning' | 'Core CS' | string;
}

export interface HeatmapDay {
  date: string;
  count: number;
  intensity: 0 | 1 | 2 | 3 | 4;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  model: string;
  text: string;
  timestamp: string;
  durationMs?: number;
  evalCount?: number;
  isStreaming?: boolean;
}

export interface StudentNote {
  id: string;
  title: string;
  content: string;
  tags: string[];
  createdAt: string;
  pdfUrl?: string;
  fileName?: string;
  fileSize?: string;
  hasPdf?: boolean;
}
