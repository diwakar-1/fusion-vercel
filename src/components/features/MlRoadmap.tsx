import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { useStudentOs } from '../../context/StudentOsContext';
import { GlassCard } from '../common/GlassCard';
import { VideoCourse, PlaylistLecture } from '../../types/studentOs';
import {
  BrainCircuit,
  Plus,
  Play,
  CheckCircle2,
  Square,
  CheckSquare,
  Clock,
  Sparkles,
  Radio,
  ExternalLink,
  Layers,
  Flame,
  BookmarkPlus,
  X,
  Check,
  HelpCircle,
  ArrowRight,
  BookOpen,
  Trash2
} from 'lucide-react';
import { YouTubeService } from '../../services/youtube';

// Curated Daily Suggested Machine Learning Masterclasses & Playlists across all Phases
const SUGGESTED_ML_PLAYLISTS: VideoCourse[] = [
  {
    id: 'sug_ml_0',
    title: 'Python & Math Prerequisites for Machine Learning',
    subject: 'Machine Learning',
    youtubeUrl: 'https://www.youtube.com/watch?v=rfscVS0vtbw',
    embedUrl: 'https://www.youtube.com/embed/rfscVS0vtbw',
    addedBy: 'FUSE Curated',
    currentLesson: 'Phase 0: Python 3, NumPy, Pandas & Linear Algebra Essentials',
    totalLessons: '5 foundation modules',
    phases: [
      { name: 'Phase 0: Python & Math Prerequisites', lectureIds: ['p0_1', 'p0_2', 'p0_3', 'p0_4', 'p0_5'] }
    ],
    lectures: [
      { id: 'p0_1', title: 'Python for Beginners & Data Science: Complete Programming Crash Course', duration: '4:26:52', videoId: 'rfscVS0vtbw', completed: false, phase: 'Phase 0: Python & Math Prerequisites' },
      { id: 'p0_2', title: 'NumPy Tutorial: Master Multi-Dimensional Arrays & Vectorized Matrix Operations', duration: '58:40', videoId: 'QUT1VHiLmmI', completed: false, phase: 'Phase 0: Python & Math Prerequisites' },
      { id: 'p0_3', title: 'Pandas for Data Analysis: DataFrames, ETL & Data Cleaning', duration: '1:02:15', videoId: 'vmEHCJofslg', completed: false, phase: 'Phase 0: Python & Math Prerequisites' },
      { id: 'p0_4', title: 'Matplotlib & Seaborn: Visualizing Loss Curves & Data Distributions', duration: '45:30', videoId: 'OZOOLe2imFo', completed: false, phase: 'Phase 0: Python & Math Prerequisites' },
      { id: 'p0_5', title: 'Essence of Linear Algebra: Vectors, Span & Linear Transformations (3Blue1Brown)', duration: '1:45:10', videoId: 'fNk_zzaMoSs', completed: false, phase: 'Phase 0: Python & Math Prerequisites' }
    ]
  },
  {
    id: 'sug_ml_1',
    title: 'Andrej Karpathy - Neural Networks: Zero to Hero',
    subject: 'Machine Learning',
    youtubeUrl: 'https://www.youtube.com/watch?v=VMj-3S1tku0',
    embedUrl: 'https://www.youtube.com/embed/VMj-3S1tku0',
    addedBy: 'FUSE Curated',
    currentLesson: 'Building micrograd & backpropagation from scratch',
    totalLessons: '7 masterclasses',
    phases: [
      { name: 'Phase 1: Foundations', lectureIds: ['k_1'] },
      { name: 'Phase 2: Autoregressive LM', lectureIds: ['k_2', 'k_3'] },
      { name: 'Phase 3: Optimization', lectureIds: ['k_4', 'k_5'] },
      { name: 'Phase 4: Transformer GPT', lectureIds: ['k_6', 'k_7'] }
    ],
    lectures: [
      { id: 'k_1', title: 'The spelled-out intro to neural networks and backpropagation: building micrograd', duration: '2:25:34', videoId: 'VMj-3S1tku0', completed: true, phase: 'Phase 1: Foundations' },
      { id: 'k_2', title: 'The spelled-out intro to language modeling: building makemore (Part 1)', duration: '1:57:12', videoId: 'PaCmpygFfXo', completed: true, phase: 'Phase 2: Autoregressive LM' },
      { id: 'k_3', title: 'Building makemore Part 2: MLP (Multi-Layer Perceptron)', duration: '1:15:42', videoId: 'TCH_1BHYA8I', completed: false, phase: 'Phase 2: Autoregressive LM' },
      { id: 'k_4', title: 'Building makemore Part 3: Activations & Gradients, BatchNorm', duration: '1:44:20', videoId: 'P6sfmUTpUmc', completed: false, phase: 'Phase 3: Optimization' },
      { id: 'k_5', title: 'Building makemore Part 4: Becoming a Backprop Ninja', duration: '1:56:49', videoId: 'q8SA3rM6ckI', completed: false, phase: 'Phase 3: Optimization' },
      { id: 'k_6', title: 'Building makemore Part 5: Building a WaveNet', duration: '1:21:05', videoId: 't3YJ5hKiMQ0', completed: false, phase: 'Phase 4: Transformer GPT' },
      { id: 'k_7', title: 'Let\'s build GPT: from scratch, in code, spelled out', duration: '1:56:22', videoId: 'kCc8FmEb1nY', completed: false, phase: 'Phase 4: Transformer GPT' }
    ]
  },
  {
    id: 'sug_ml_2',
    title: 'StatQuest - Machine Learning & Neural Networks Masterclasses',
    subject: 'Machine Learning',
    youtubeUrl: 'https://www.youtube.com/watch?v=qBigTkBLU6g',
    embedUrl: 'https://www.youtube.com/embed/qBigTkBLU6g',
    addedBy: 'FUSE Curated',
    currentLesson: 'Fundamental Concepts of Machine Learning & Neural Networks',
    totalLessons: '6 masterclasses',
    phases: [
      { name: 'Phase 1: ML Foundations', lectureIds: ['sq_1', 'sq_2'] },
      { name: 'Phase 2: Neural Net Backpropagation', lectureIds: ['sq_3', 'sq_4'] },
      { name: 'Phase 3: Transformer Attention', lectureIds: ['sq_5', 'sq_6'] }
    ],
    lectures: [
      { id: 'sq_1', title: 'Machine Learning Fundamentals: Bias and Variance Clearly Explained', duration: '15:20', videoId: 'qBigTkBLU6g', completed: false, phase: 'Phase 1: ML Foundations' },
      { id: 'sq_2', title: 'Gradient Descent: Step-by-step Visual Intuition', duration: '23:55', videoId: 'sDv4f4s2SB8', completed: false, phase: 'Phase 1: ML Foundations' },
      { id: 'sq_3', title: 'Neural Networks Part 1: Inside the Black Box', duration: '19:40', videoId: 'CqOfi41LfDw', completed: false, phase: 'Phase 2: Neural Net Backpropagation' },
      { id: 'sq_4', title: 'Neural Networks Part 2: Backpropagation Main Ideas', duration: '14:25', videoId: 'zxagGtF9MeY', completed: false, phase: 'Phase 2: Neural Net Backpropagation' },
      { id: 'sq_5', title: 'Transformers and Attention Part 1: Clear Concepts', duration: '24:50', videoId: 'L_G0e4k06a0', completed: false, phase: 'Phase 3: Transformer Attention' },
      { id: 'sq_6', title: 'Transformers and Attention Part 2: Self-Attention Deep Dive', duration: '20:10', videoId: 'mMa2PmYJlCo', completed: false, phase: 'Phase 3: Transformer Attention' }
    ]
  },
  {
    id: 'sug_ml_3',
    title: '3Blue1Brown - Neural Networks & Backprop Calculus',
    subject: 'Machine Learning',
    youtubeUrl: 'https://www.youtube.com/watch?v=aircAruvnKk',
    embedUrl: 'https://www.youtube.com/embed/aircAruvnKk',
    addedBy: 'FUSE Curated',
    currentLesson: 'Chapter 1: But what is a neural network?',
    totalLessons: '4 deep visual essays',
    phases: [
      { name: 'Phase 1: Geometric Visualizations', lectureIds: ['b_1', 'b_2', 'b_3', 'b_4'] }
    ],
    lectures: [
      { id: 'b_1', title: 'Chapter 1: But what is a neural network? | Deep learning, chapter 1', duration: '19:13', videoId: 'aircAruvnKk', completed: true, phase: 'Phase 1: Geometric Visualizations' },
      { id: 'b_2', title: 'Chapter 2: Gradient descent, how neural networks learn', duration: '21:01', videoId: 'IHZwWFHWa-w', completed: true, phase: 'Phase 1: Geometric Visualizations' },
      { id: 'b_3', title: 'Chapter 3: What is backpropagation really doing?', duration: '13:54', videoId: 'Ilg3gGewQ5U', completed: false, phase: 'Phase 1: Geometric Visualizations' },
      { id: 'b_4', title: 'Chapter 4: Backpropagation calculus | Deep learning chapter 4', duration: '10:17', videoId: 'tIeHLnjs5U8', completed: false, phase: 'Phase 1: Geometric Visualizations' }
    ]
  }
];

export const MlRoadmap: React.FC = () => {
  const {
    courses,
    addCourse,
    deleteCourse,
    setCurrentWatchingVideo,
    toggleLectureCompleted,
    profile,
    activeFriend,
    youtubeApiKey
  } = useStudentOs();

  // Filter ML courses from shared courses
  const mlCourses = courses.filter(c => c.subject === 'Machine Learning');
  const [selectedCourseIndex, setSelectedCourseIndex] = useState<number>(0);

  // Active ML Course with safe bounds
  const activeCourse: VideoCourse = (selectedCourseIndex < mlCourses.length ? mlCourses[selectedCourseIndex] : mlCourses[0]) || SUGGESTED_ML_PLAYLISTS[1];

  const [activeLecture, setActiveLecture] = useState<PlaylistLecture>(() => {
    return activeCourse?.lectures?.[0] || SUGGESTED_ML_PLAYLISTS[1].lectures[0];
  });

  // Automatically synchronize activeLecture when course index changes or activeCourse lectures load/update
  useEffect(() => {
    if (activeCourse?.lectures && activeCourse.lectures.length > 0) {
      setActiveLecture(activeCourse.lectures[0]);
    }
  }, [selectedCourseIndex, activeCourse?.id, activeCourse?.lectures?.length]);

  const [customPlaylistUrl, setCustomPlaylistUrl] = useState('');
  const [customPlaylistTitle, setCustomPlaylistTitle] = useState('');
  const [isAddingPlaylist, setIsAddingPlaylist] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  // Phase-Wise Filter State
  const [selectedPhaseFilter, setSelectedPhaseFilter] = useState<string>('All');

  // AI Diagnostic Assessment State
  const [showAiRoadmapModal, setShowAiRoadmapModal] = useState<boolean>(false);
  const [pythonProficiency, setPythonProficiency] = useState<'beginner' | 'intermediate' | 'advanced'>('intermediate');
  const [knownLibraries, setKnownLibraries] = useState<string[]>(['NumPy', 'Pandas']);
  const [mathComfort, setMathComfort] = useState<'refresher' | 'comfortable' | 'strong'>('comfortable');
  const [mlGoal, setMlGoal] = useState<'llm' | 'classical' | 'deep_learning'>('llm');
  const [assessmentFeedback, setAssessmentFeedback] = useState<{
    startPhase: string;
    message: string;
    skipped: string[];
    action: string;
  } | null>(null);

  const toggleLibrarySelection = (lib: string) => {
    setKnownLibraries(prev =>
      prev.includes(lib) ? prev.filter(l => l !== lib) : [...prev, lib]
    );
  };

  const handleSelectLecture = (lec: PlaylistLecture) => {
    setActiveLecture(lec);
    const videoUrl = lec.videoId
      ? `https://www.youtube.com/watch?v=${lec.videoId}`
      : activeCourse.youtubeUrl;

    setCurrentWatchingVideo({
      title: lec.title,
      url: videoUrl,
      subject: 'Machine Learning'
    });
  };

  const handleAddSuggestedCourse = (sugCourse: VideoCourse) => {
    addCourse({
      ...sugCourse,
      addedBy: profile.name
    });
    alert(`"${sugCourse.title}" added to your active Machine Learning study hub!`);
  };

  const handleAddCustomMlPlaylist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customPlaylistUrl.trim()) return;

    setIsAddingPlaylist(true);
    const url = customPlaylistUrl.trim();
    const title = customPlaylistTitle.trim() || 'Custom Machine Learning Course';

    let videoId = YouTubeService.extractVideoId(url) || 'VMj-3S1tku0';
    let embed = `https://www.youtube.com/embed/${videoId}`;
    let lectures: PlaylistLecture[] = [];

    try {
      const fetched = await YouTubeService.fetchPlaylistVideos(url, title, youtubeApiKey);
      if (fetched && fetched.length > 0) {
        lectures = fetched;
        videoId = fetched[0].videoId;
        embed = `https://www.youtube.com/embed/${videoId}`;
      }
    } catch {}

    if (!lectures || lectures.length === 0) {
      lectures = [
        { id: `ml_c1_${Date.now()}`, title: `${title} - Phase 1: Mathematical Foundations & Basics`, duration: '35:00', videoId, completed: false, phase: 'Phase 1: ML Foundations' },
        { id: `ml_c2_${Date.now()}`, title: `${title} - Phase 2: Neural Net Implementation & Training`, duration: '48:00', videoId, completed: false, phase: 'Phase 2: Autoregressive LM' },
        { id: `ml_c3_${Date.now()}`, title: `${title} - Phase 3: Deep Optimization & Backprop Ninja`, duration: '52:00', videoId, completed: false, phase: 'Phase 3: Deep Optimization' },
        { id: `ml_c4_${Date.now()}`, title: `${title} - Phase 4: Transformer Architecture & Self-Attention`, duration: '58:00', videoId, completed: false, phase: 'Phase 4: Transformer GPT' }
      ];
    }

    // Ensure all lectures have phase tags so phase filtering never hides them or shows 0
    const totalLecs = lectures.length;
    const phasedLectures = lectures.map((lec, idx) => {
      if (lec.phase) return lec;
      let phaseTag = 'Phase 1: ML Foundations';
      if (idx < Math.ceil(totalLecs * 0.25)) phaseTag = 'Phase 1: ML Foundations';
      else if (idx < Math.ceil(totalLecs * 0.55)) phaseTag = 'Phase 2: Supervised & Neural Nets';
      else if (idx < Math.ceil(totalLecs * 0.80)) phaseTag = 'Phase 3: Deep Optimization';
      else phaseTag = 'Phase 4: Transformer GPT & Advanced';
      return { ...lec, phase: phaseTag };
    });

    await addCourse({
      title,
      subject: 'Machine Learning',
      youtubeUrl: url,
      embedUrl: embed,
      addedBy: profile.name,
      currentLesson: phasedLectures[0]?.title || title,
      totalLessons: `${phasedLectures.length} lectures`,
      lectures: phasedLectures
    });

    setCustomPlaylistTitle('');
    setCustomPlaylistUrl('');
    setIsAddingPlaylist(false);
    setShowAddModal(false);
    setSelectedPhaseFilter('All');
    setSelectedCourseIndex(0);
    if (phasedLectures.length > 0) {
      setActiveLecture(phasedLectures[0]);
    }
  };

  // AI Diagnostic Assessment Execution
  const handleExecuteAiAssessment = () => {
    const knowsNumpy = knownLibraries.includes('NumPy');
    const knowsPandas = knownLibraries.includes('Pandas');
    const knowsScikit = knownLibraries.includes('Scikit-Learn');
    const knowsPytorch = knownLibraries.includes('PyTorch');

    const hasSolidPython = pythonProficiency !== 'beginner';
    const hasMathBasics = mathComfort !== 'refresher';

    let startPhase = 'Phase 0: Python & Math Prerequisites';
    let feedbackMsg = '';
    let skippedPhases: string[] = [];
    let chosenCourse: VideoCourse = SUGGESTED_ML_PLAYLISTS[0]; // Phase 0
    let chosenLectures = chosenCourse.lectures;

    if (!hasSolidPython || !knowsNumpy || !knowsPandas || !hasMathBasics) {
      // User lacks basics: start from Phase 0
      startPhase = 'Phase 0: Python & Math Prerequisites';
      feedbackMsg = 'Diagnostics reveal Python data manipulation (NumPy/Pandas) or essential calculus are missing. FUSE AI constructed a Phase 0 foundational roadmap so you build strong fundamentals before touching neural networks.';
      chosenCourse = SUGGESTED_ML_PLAYLISTS[0];
      chosenLectures = chosenCourse.lectures;
    } else if (hasSolidPython && knowsNumpy && knowsPandas && !knowsScikit && !knowsPytorch) {
      // User knows Python + NumPy/Pandas, but lacks classical ML
      startPhase = 'Phase 1: ML Foundations';
      skippedPhases = ['Phase 0 (Python, NumPy, Pandas)'];
      feedbackMsg = 'Great foundation! You already know Python and array libraries. FUSE AI skipped Phase 0 and started your roadmap at Phase 1 with statistical machine learning and gradient descent intuition.';
      chosenCourse = SUGGESTED_ML_PLAYLISTS[2]; // StatQuest
      chosenLectures = chosenCourse.lectures;
    } else if (knowsScikit && !knowsPytorch) {
      // User knows classical ML, ready for Deep Learning from scratch
      startPhase = 'Phase 2: Autoregressive LM & Neural Nets';
      skippedPhases = ['Phase 0 (Python Basics)', 'Phase 1 (Classical ML)'];
      feedbackMsg = 'Excellent background! You are proficient in Python and classical Scikit-Learn algorithms. FUSE AI started you at Phase 2: Andrej Karpathy\'s Neural Networks from Scratch (building micrograd & backpropagation).';
      chosenCourse = SUGGESTED_ML_PLAYLISTS[1]; // Karpathy
      chosenLectures = chosenCourse.lectures;
    } else {
      // Advanced user
      startPhase = 'Phase 4: Transformer Architecture & GPT';
      skippedPhases = ['Phase 0 (Prerequisites)', 'Phase 1 (Foundations)', 'Phase 2 (MLPs & Backprop)'];
      feedbackMsg = 'Advanced proficiency detected! You master PyTorch and deep learning foundations. FUSE AI accelerated you directly to Phase 4: Self-Attention mechanisms and building GPT from scratch.';
      chosenCourse = SUGGESTED_ML_PLAYLISTS[1]; // Karpathy GPT
      chosenLectures = chosenCourse.lectures.filter(l => l.phase?.includes('Phase 4') || l.phase?.includes('Phase 3'));
    }

    // Build tailored course and inject
    const tailoredCourse: VideoCourse = {
      id: `ai_tailored_ml_${Date.now()}`,
      title: `${profile.name}'s Tailored ML Roadmap (${startPhase.split(':')[0]})`,
      subject: 'Machine Learning',
      youtubeUrl: chosenCourse.youtubeUrl,
      embedUrl: chosenCourse.embedUrl,
      addedBy: 'FUSE AI Architect',
      currentLesson: chosenLectures[0]?.title || chosenCourse.currentLesson,
      totalLessons: `${chosenLectures.length} calibrated lectures`,
      lectures: chosenLectures
    };

    addCourse(tailoredCourse);
    setActiveLecture(chosenLectures[0]);
    setSelectedPhaseFilter(startPhase.split(':')[0]);

    setAssessmentFeedback({
      startPhase,
      message: feedbackMsg,
      skipped: skippedPhases,
      action: `Enrolled into "${tailoredCourse.title}"`
    });

    confetti({ particleCount: 75, spread: 80 });
  };

  const lecturesList = activeCourse?.lectures || [];
  const completedCount = lecturesList.filter(l => l.completed).length;

  // Filter lectures according to selected phase filter
  const displayedLectures = selectedPhaseFilter === 'All'
    ? lecturesList
    : lecturesList.filter(l => {
        if (!l.phase) return true; // Unphased lectures always remain visible
        const ph = (l.phase || '').toLowerCase();
        const target = selectedPhaseFilter.toLowerCase();
        return ph.includes(target);
      });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, paddingBottom: 100 }}>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 16
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <span
              style={{
                fontSize: '0.78rem',
                fontWeight: 700,
                color: '#8B5CF6',
                background: 'rgba(139, 92, 246, 0.12)',
                padding: '3px 10px',
                borderRadius: 'var(--radius-pill)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6
              }}
            >
              <BrainCircuit size={14} />
              <span>AIML PLAYLIST HUB</span>
            </span>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              Enter any AIML Playlist link to immediately stream lectures and track checklist progress
            </span>
          </div>

          <h2
            className="font-tech"
            style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--text-primary)' }}
          >
            AIML Hub
          </h2>
        </div>
      </div>

      {/* 1. SIMPLE & CLEAR: Enter your ML Playlist Card */}
      <GlassCard
        style={{
          padding: '24px 28px',
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(243, 232, 255, 0.92) 100%)',
          border: '1.5px solid rgba(139, 92, 246, 0.25)',
          boxShadow: '0 10px 28px -6px rgba(139, 92, 246, 0.12)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
          <BrainCircuit size={22} color="#7C3AED" />
          <h3 className="font-tech" style={{ fontSize: '1.28rem', fontWeight: 800, color: '#18181B', margin: 0 }}>
            Enter your AIML Playlist
          </h3>
        </div>
        <form onSubmit={handleAddCustomMlPlaylist} style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
          <input
            type="text"
            placeholder="Paste your YouTube AIML Playlist or Video URL (e.g. https://www.youtube.com/playlist?list=...)"
            value={customPlaylistUrl}
            onChange={e => setCustomPlaylistUrl(e.target.value)}
            required
            style={{
              flex: '2 1 340px',
              padding: '12px 18px',
              borderRadius: 'var(--radius-pill)',
              border: '1.5px solid rgba(139, 92, 246, 0.3)',
              fontSize: '0.92rem',
              outline: 'none',
              background: '#FFFFFF'
            }}
          />
          <input
            type="text"
            placeholder="Playlist Title (e.g. Andrej Karpathy Neural Nets)"
            value={customPlaylistTitle}
            onChange={e => setCustomPlaylistTitle(e.target.value)}
            style={{
              flex: '1 1 200px',
              padding: '12px 18px',
              borderRadius: 'var(--radius-pill)',
              border: '1px solid rgba(0,0,0,0.12)',
              fontSize: '0.92rem',
              outline: 'none',
              background: '#FFFFFF'
            }}
          />
          <button
            type="submit"
            disabled={isAddingPlaylist}
            className="charcoal-pill-btn"
            style={{
              padding: '12px 24px',
              fontSize: '0.9rem',
              background: 'linear-gradient(135deg, #1E1E24 0%, #7C3AED 100%)',
              flexShrink: 0
            }}
          >
            <Plus size={16} />
            <span>{isAddingPlaylist ? 'Importing...' : 'Add AIML Playlist'}</span>
          </button>
        </form>
      </GlassCard>

      {/* 2. Active ML Playlists Selector with Remove/Delete Option */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          Your Machine Learning Playlists:
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, overflowX: 'auto', padding: '4px 0' }}>
          {mlCourses.map((c, idx) => {
            const isSelected = selectedCourseIndex === idx;
            return (
              <div
                key={c.id}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '6px 14px',
                  borderRadius: 'var(--radius-pill)',
                  background: isSelected ? 'var(--charcoal-pill)' : 'rgba(255, 255, 255, 0.85)',
                  color: isSelected ? '#FFFFFF' : '#334155',
                  boxShadow: isSelected ? '0 4px 14px rgba(30, 30, 36, 0.2)' : 'none',
                  border: isSelected ? 'none' : '1px solid rgba(0,0,0,0.08)',
                  cursor: 'pointer',
                  flexShrink: 0
                }}
                onClick={() => {
                  setSelectedCourseIndex(idx);
                  if (c.lectures && c.lectures.length > 0) {
                    setActiveLecture(c.lectures[0]);
                  }
                }}
              >
                <span style={{ fontSize: '0.86rem', fontWeight: 700 }}>{c.title}</span>
                <span
                  style={{
                    fontSize: '0.72rem',
                    padding: '2px 6px',
                    borderRadius: 'var(--radius-pill)',
                    background: isSelected ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.06)',
                    color: isSelected ? '#FEF08A' : 'var(--text-muted)'
                  }}
                >
                  {c.lectures?.length || 0}
                </span>
                {/* Remove Playlist Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (confirm(`Remove playlist "${c.title}"?`)) {
                      deleteCourse(c.id);
                      setSelectedCourseIndex(0);
                    }
                  }}
                  style={{
                    border: 'none',
                    background: 'transparent',
                    color: isSelected ? '#FCA5A5' : '#94A3B8',
                    cursor: 'pointer',
                    padding: '2px 4px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                  title="Remove this playlist"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Suggested Daily Playlists Banner */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <Sparkles size={16} color="#8B5CF6" />
          <h4 className="font-tech" style={{ fontSize: '1.15rem', fontWeight: 800 }}>
            Curated Machine Learning Phase Playlists
          </h4>
        </div>

        <div className="responsive-grid-cards">
          {SUGGESTED_ML_PLAYLISTS.map(sug => {
            const isAlreadyAdded = courses.some(c => c.title === sug.title);

            return (
              <GlassCard key={sug.id} style={{ padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                    <span
                      style={{
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        padding: '2px 8px',
                        borderRadius: 'var(--radius-pill)',
                        background: 'rgba(139, 92, 246, 0.12)',
                        color: '#7C3AED'
                      }}
                    >
                      {sug.totalLessons}
                    </span>
                    <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>{sug.addedBy}</span>
                  </div>

                  <h5 className="font-tech" style={{ fontSize: '1.05rem', fontWeight: 800, color: '#18181B', marginBottom: 6 }}>
                    {sug.title}
                  </h5>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: 14 }}>
                    {sug.currentLesson}
                  </p>
                </div>

                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    onClick={() => {
                      if (!isAlreadyAdded) handleAddSuggestedCourse(sug);
                      setActiveLecture(sug.lectures[0]);
                    }}
                    className="glass-pill"
                    style={{
                      flex: 1,
                      padding: '8px 14px',
                      fontSize: '0.82rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 6
                    }}
                  >
                    <Play size={14} />
                    <span>Watch Now</span>
                  </button>

                  {!isAlreadyAdded && (
                    <button
                      onClick={() => handleAddSuggestedCourse(sug)}
                      className="charcoal-pill-btn"
                      style={{ padding: '8px 16px', fontSize: '0.82rem' }}
                    >
                      <BookmarkPlus size={14} />
                      <span>Add</span>
                    </button>
                  )}
                </div>
              </GlassCard>
            );
          })}
        </div>
      </div>

      {/* Course Video Player & Playlist Sidebar (Light Frosted Glass) */}
      <div className="responsive-grid-player" style={{ alignItems: 'start' }}>
        {/* Left: Video Player */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div
            style={{
              position: 'relative',
              width: '100%',
              paddingTop: '56.25%',
              borderRadius: '24px',
              overflow: 'hidden',
              background: '#000000',
              boxShadow: '0 20px 40px -10px rgba(0,0,0,0.35)',
              border: '1.5px solid rgba(255, 255, 255, 0.8)'
            }}
          >
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${activeLecture.videoId || 'VMj-3S1tku0'}?autoplay=0&rel=0&enablejsapi=1`}
              title={activeLecture.title}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                border: 'none'
              }}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          </div>

          <GlassCard style={{ padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
              <div>
                <span
                  style={{
                    fontSize: '0.74rem',
                    fontWeight: 700,
                    color: '#8B5CF6',
                    background: 'rgba(139, 92, 246, 0.1)',
                    padding: '3px 10px',
                    borderRadius: 'var(--radius-pill)',
                    marginBottom: 6,
                    display: 'inline-block'
                  }}
                >
                  {activeLecture.phase || 'Machine Learning Phase'}
                </span>
                <h3 className="font-tech" style={{ fontSize: '1.35rem', fontWeight: 800, color: '#18181B' }}>
                  {activeLecture.title}
                </h3>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                {/* Open on YouTube Direct Action Button */}
                <button
                  onClick={() => {
                    const vId = activeLecture.videoId || 'VMj-3S1tku0';
                    window.open(`https://www.youtube.com/watch?v=${vId}`, '_blank');
                  }}
                  className="glass-pill"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '10px 18px',
                    fontSize: '0.86rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    background: 'rgba(255, 255, 255, 0.9)',
                    border: '1px solid rgba(0,0,0,0.1)'
                  }}
                >
                  <ExternalLink size={15} color="#EF4444" />
                  <span>Open on YouTube</span>
                </button>

                <button
                  onClick={() => toggleLectureCompleted(activeCourse.id, activeLecture.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '10px 20px',
                    borderRadius: 'var(--radius-pill)',
                    border: 'none',
                    fontFamily: 'var(--font-tech)',
                    fontWeight: 700,
                    fontSize: '0.9rem',
                    cursor: 'pointer',
                    background: activeLecture.completed ? '#16A34A' : 'var(--charcoal-pill)',
                    color: '#FFFFFF'
                  }}
                >
                  <CheckCircle2 size={18} />
                  <span>{activeLecture.completed ? 'Completed (+50 XP)' : 'Mark Phase Done'}</span>
                </button>
              </div>
            </div>
          </GlassCard>
        </div>

        {/* Right: Playlist Queue (Light Theme Matching Rest of Site) */}
        <div
          className="glass-card"
          style={{
            background: 'rgba(255, 255, 255, 0.92)',
            backdropFilter: 'blur(20px)',
            color: '#18181B',
            borderRadius: '24px',
            overflow: 'hidden',
            boxShadow: '0 10px 30px rgba(0,0,0,0.06)',
            border: '1px solid rgba(0, 0, 0, 0.08)',
            display: 'flex',
            flexDirection: 'column',
            maxHeight: '750px'
          }}
        >
          <div
            style={{
              padding: '20px 22px',
              background: 'rgba(248, 250, 252, 0.9)',
              borderBottom: '1px solid rgba(0, 0, 0, 0.06)'
            }}
          >
            <h4
              className="font-tech"
              style={{
                fontSize: '1.08rem',
                fontWeight: 800,
                color: '#0F172A',
                margin: '0 0 6px 0',
                lineHeight: 1.3
              }}
            >
              {activeCourse.title}
            </h4>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#64748B' }}>
              <span>Phase: {selectedPhaseFilter}</span>
              <span style={{ color: '#7C3AED', fontWeight: 700 }}>
                {completedCount} / {lecturesList.length} Finished
              </span>
            </div>
          </div>

          <div style={{ overflowY: 'auto', flex: 1, padding: '8px 0' }}>
            {displayedLectures.length === 0 ? (
              <div style={{ padding: '30px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
                <p style={{ fontSize: '0.88rem', margin: 0 }}>No lectures match "{selectedPhaseFilter}".</p>
                <button
                  onClick={() => setSelectedPhaseFilter('All')}
                  className="glass-pill"
                  style={{ marginTop: 12, padding: '6px 14px', fontSize: '0.78rem', cursor: 'pointer' }}
                >
                  View All Phases
                </button>
              </div>
            ) : (
              displayedLectures.map((lec, idx) => {
                const isCurrentPlaying = activeLecture.id === lec.id;
                return (
                  <div
                    key={lec.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      padding: '12px 18px',
                      background: isCurrentPlaying ? 'rgba(124, 58, 237, 0.08)' : 'transparent',
                      borderLeft: isCurrentPlaying ? '3px solid #7C3AED' : '3px solid transparent',
                      cursor: 'pointer',
                      transition: 'background 0.15s ease'
                    }}
                  >
                    <div
                      onClick={() => handleSelectLecture(lec)}
                      style={{ width: 18, fontSize: '0.8rem', color: isCurrentPlaying ? '#7C3AED' : '#94A3B8', fontWeight: 800 }}
                    >
                      {isCurrentPlaying ? '▶' : idx + 1}
                    </div>

                    <div
                      onClick={() => handleSelectLecture(lec)}
                      style={{ flex: 1, minWidth: 0 }}
                    >
                      <div
                        style={{
                          fontSize: '0.82rem',
                          fontWeight: isCurrentPlaying ? 700 : 500,
                          color: isCurrentPlaying ? '#7C3AED' : '#1E293B',
                          lineHeight: 1.3
                        }}
                      >
                        {lec.title}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: '#64748B', marginTop: 2 }}>
                        {lec.phase || 'Module'} • {lec.duration}
                      </div>
                    </div>

                    <button
                      onClick={e => {
                        e.stopPropagation();
                        toggleLectureCompleted(activeCourse.id, lec.id);
                      }}
                      style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: lec.completed ? '#16A34A' : '#CBD5E1' }}
                    >
                      {lec.completed ? <CheckSquare size={20} /> : <Square size={20} />}
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* AI Smart ML Roadmap Architect Modal */}
      {showAiRoadmapModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 220,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(15, 23, 42, 0.75)',
            backdropFilter: 'blur(12px)',
            padding: 20
          }}
        >
          <div
            className="glass-card"
            style={{
              maxWidth: '660px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              background: '#FFFFFF',
              borderRadius: '28px',
              padding: '32px'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: '12px',
                    background: 'linear-gradient(135deg, #7C3AED 0%, #0284C7 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#FFFFFF'
                  }}
                >
                  <BrainCircuit size={22} />
                </div>
                <div>
                  <h3 className="font-tech" style={{ fontSize: '1.35rem', fontWeight: 800, margin: 0 }}>
                    FUSE AI ML Roadmap Architect
                  </h3>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>
                    Personalized phase pathway based on your Python, math & library expertise
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowAiRoadmapModal(false)}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  border: 'none',
                  background: 'rgba(0,0,0,0.06)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <X size={16} />
              </button>
            </div>

            {assessmentFeedback ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                <div
                  style={{
                    padding: '20px',
                    borderRadius: '18px',
                    background: 'linear-gradient(135deg, rgba(124, 58, 237, 0.08) 0%, rgba(2, 132, 199, 0.08) 100%)',
                    border: '1.5px solid rgba(124, 58, 237, 0.25)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <Sparkles size={18} color="#7C3AED" />
                    <span style={{ fontSize: '0.86rem', fontWeight: 800, color: '#7C3AED' }}>
                      RECOMMENDED STARTING POINT:
                    </span>
                  </div>
                  <h4 className="font-tech" style={{ fontSize: '1.3rem', fontWeight: 900, color: '#0F172A', marginBottom: 10 }}>
                    {assessmentFeedback.startPhase}
                  </h4>
                  <p style={{ fontSize: '0.92rem', color: '#334155', lineHeight: 1.5, margin: 0 }}>
                    {assessmentFeedback.message}
                  </p>
                  {assessmentFeedback.skipped.length > 0 && (
                    <div style={{ marginTop: 12, fontSize: '0.82rem', color: '#059669', fontWeight: 700 }}>
                      ✓ Automatically skipped: {assessmentFeedback.skipped.join(', ')}
                    </div>
                  )}
                </div>

                <button
                  onClick={() => setShowAiRoadmapModal(false)}
                  className="charcoal-pill-btn"
                  style={{ padding: '12px', fontSize: '0.92rem', background: '#0F172A' }}
                >
                  <span>Start Learning Now</span>
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                {/* Question 1: Python Proficiency */}
                <div>
                  <label style={{ fontSize: '0.86rem', fontWeight: 700, color: '#1E293B', display: 'block', marginBottom: 8 }}>
                    1. What is your Python programming proficiency?
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
                    {[
                      { id: 'beginner', title: 'Beginner', desc: 'Basic syntax & loops' },
                      { id: 'intermediate', title: 'Intermediate', desc: 'OOP, scripts & functions' },
                      { id: 'advanced', title: 'Advanced', desc: 'Decorators, vectorization' }
                    ].map(opt => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setPythonProficiency(opt.id as any)}
                        style={{
                          padding: '12px',
                          borderRadius: '14px',
                          border: pythonProficiency === opt.id ? '2px solid #7C3AED' : '1px solid rgba(0,0,0,0.1)',
                          background: pythonProficiency === opt.id ? 'rgba(124, 58, 237, 0.08)' : '#F8FAFC',
                          cursor: 'pointer',
                          textAlign: 'left'
                        }}
                      >
                        <div style={{ fontSize: '0.88rem', fontWeight: 700, color: pythonProficiency === opt.id ? '#7C3AED' : '#0F172A' }}>
                          {opt.title}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 2 }}>{opt.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Question 2: Known Libraries */}
                <div>
                  <label style={{ fontSize: '0.86rem', fontWeight: 700, color: '#1E293B', display: 'block', marginBottom: 8 }}>
                    2. Which Essential Libraries do you already know comfortably? (Select all that apply)
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 8 }}>
                    {[
                      { name: 'NumPy', tag: 'Arrays & Matrix Math' },
                      { name: 'Pandas', tag: 'DataFrames & Cleaning' },
                      { name: 'Matplotlib', tag: 'Plotting & Curves' },
                      { name: 'Scikit-Learn', tag: 'Models & Pipelines' },
                      { name: 'PyTorch', tag: 'Tensors & Autograd' }
                    ].map(lib => {
                      const isChecked = knownLibraries.includes(lib.name);
                      return (
                        <button
                          key={lib.name}
                          type="button"
                          onClick={() => toggleLibrarySelection(lib.name)}
                          style={{
                            padding: '10px 12px',
                            borderRadius: '12px',
                            border: isChecked ? '2px solid #0284C7' : '1px solid rgba(0,0,0,0.1)',
                            background: isChecked ? 'rgba(2, 132, 199, 0.08)' : '#F8FAFC',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 8,
                            textAlign: 'left'
                          }}
                        >
                          <div
                            style={{
                              width: 18,
                              height: 18,
                              borderRadius: '6px',
                              background: isChecked ? '#0284C7' : '#E2E8F0',
                              color: '#FFFFFF',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '0.7rem'
                            }}
                          >
                            {isChecked && <Check size={12} />}
                          </div>
                          <div>
                            <div style={{ fontSize: '0.84rem', fontWeight: 700, color: isChecked ? '#0284C7' : '#1E293B' }}>{lib.name}</div>
                            <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>{lib.tag}</div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Question 3: Mathematics & Calculus */}
                <div>
                  <label style={{ fontSize: '0.86rem', fontWeight: 700, color: '#1E293B', display: 'block', marginBottom: 8 }}>
                    3. What is your comfort level with Linear Algebra & Calculus?
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
                    {[
                      { id: 'refresher', title: 'Need Refresher', desc: 'Visual intuition needed' },
                      { id: 'comfortable', title: 'Comfortable', desc: 'Dot products, basic calculus' },
                      { id: 'strong', title: 'Strong', desc: 'Multivariate calculus & proofs' }
                    ].map(opt => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setMathComfort(opt.id as any)}
                        style={{
                          padding: '12px',
                          borderRadius: '14px',
                          border: mathComfort === opt.id ? '2px solid #10B981' : '1px solid rgba(0,0,0,0.1)',
                          background: mathComfort === opt.id ? 'rgba(16, 185, 129, 0.08)' : '#F8FAFC',
                          cursor: 'pointer',
                          textAlign: 'left'
                        }}
                      >
                        <div style={{ fontSize: '0.88rem', fontWeight: 700, color: mathComfort === opt.id ? '#10B981' : '#0F172A' }}>
                          {opt.title}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 2 }}>{opt.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Question 4: Primary Goal */}
                <div>
                  <label style={{ fontSize: '0.86rem', fontWeight: 700, color: '#1E293B', display: 'block', marginBottom: 8 }}>
                    4. What is your primary Machine Learning Goal?
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
                    {[
                      { id: 'llm', title: 'Build LLMs & GPT', desc: 'Attention, Karpathy Zero to Hero' },
                      { id: 'classical', title: 'Data Science & Kaggle', desc: 'Tabular models, pipelines' },
                      { id: 'deep_learning', title: 'Core AI Research', desc: 'Math, backpropagation, CNNs' }
                    ].map(opt => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setMlGoal(opt.id as any)}
                        style={{
                          padding: '12px',
                          borderRadius: '14px',
                          border: mlGoal === opt.id ? '2px solid #EA580C' : '1px solid rgba(0,0,0,0.1)',
                          background: mlGoal === opt.id ? 'rgba(234, 88, 12, 0.08)' : '#F8FAFC',
                          cursor: 'pointer',
                          textAlign: 'left'
                        }}
                      >
                        <div style={{ fontSize: '0.88rem', fontWeight: 700, color: mlGoal === opt.id ? '#EA580C' : '#0F172A' }}>
                          {opt.title}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 2 }}>{opt.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={handleExecuteAiAssessment}
                  className="charcoal-pill-btn"
                  style={{
                    width: '100%',
                    padding: '13px',
                    fontSize: '0.96rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    background: 'linear-gradient(135deg, #7C3AED 0%, #0284C7 100%)',
                    boxShadow: '0 6px 20px rgba(124, 58, 237, 0.3)'
                  }}
                >
                  <Sparkles size={18} color="#FEF08A" />
                  <span>Generate My Personalized ML Roadmap</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add Custom ML Playlist Modal */}
      {showAddModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 200,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(10px)',
            padding: 20
          }}
        >
          <div
            className="glass-card"
            style={{
              maxWidth: '520px',
              width: '100%',
              background: '#FFFFFF',
              borderRadius: '28px',
              padding: '32px'
            }}
          >
            <h3 className="font-tech" style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: 16 }}>
              Add Machine Learning YouTube Playlist
            </h3>
            <form onSubmit={handleAddCustomMlPlaylist} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <input
                type="text"
                placeholder="Course Title (e.g. Stanford CS229: Machine Learning)"
                value={customPlaylistTitle}
                onChange={e => setCustomPlaylistTitle(e.target.value)}
                required
                style={{ padding: '12px 16px', borderRadius: '14px', border: '1px solid rgba(0,0,0,0.12)' }}
              />
              <input
                type="url"
                placeholder="YouTube Playlist or Video URL"
                value={customPlaylistUrl}
                onChange={e => setCustomPlaylistUrl(e.target.value)}
                required
                style={{ padding: '12px 16px', borderRadius: '14px', border: '1px solid rgba(0,0,0,0.12)' }}
              />
              <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="glass-pill"
                  style={{ flex: 1, padding: '12px', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="charcoal-pill-btn"
                  style={{ flex: 1, padding: '12px' }}
                >
                  Add to AIML Hub
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
