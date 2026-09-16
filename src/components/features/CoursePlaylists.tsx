import React, { useState, useEffect } from 'react';
import { Capacitor } from '@capacitor/core';
import { useStudentOs } from '../../context/StudentOsContext';
import { GlassCard } from '../common/GlassCard';
import { VideoCourse, PlaylistLecture, YouTubeRecommendation } from '../../types/studentOs';
import { GeminiService } from '../../services/gemini';
import { YouTubeService } from '../../services/youtube';
import {
  Play,
  Plus,
  Trash2,
  ExternalLink,
  Sparkles,
  CheckCircle2,
  Square,
  CheckSquare,
  Clock,
  Film,
  Radio,
  X,
  Share2,
  ChevronRight,
  ListVideo,
  RefreshCw,
  Key,
  HelpCircle,
  Check,
  Video,
  Layers,
  BookmarkPlus
} from 'lucide-react';

const YoutubeIcon: React.FC<{ size?: number; color?: string }> = ({ size = 20, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
  </svg>
);

export const CoursePlaylists: React.FC = () => {
  const {
    courses,
    addCourse,
    deleteCourse,
    currentWatchingVideo,
    setCurrentWatchingVideo,
    toggleLectureCompleted,
    profile,
    activeFriend,
    geminiApiKey,
    youtubeApiKey,
    setYoutubeApiKey
  } = useStudentOs();

  const [selectedCourseIndex, setSelectedCourseIndex] = useState<number>(0);
  const activeCourse: VideoCourse | undefined = (selectedCourseIndex < courses.length ? courses[selectedCourseIndex] : courses[0]);

  const defaultEmptyLecture: PlaylistLecture = {
    id: 'lec_default',
    title: 'Select a course or recommended video to begin',
    duration: '25:00',
    videoId: 'EAR7De6G0ms',
    completed: false
  };

  const [activeLecture, setActiveLecture] = useState<PlaylistLecture>(() => {
    return activeCourse?.lectures?.[0] || defaultEmptyLecture;
  });

  // Automatically synchronize active lecture when user selects a different course or lectures update
  useEffect(() => {
    if (activeCourse?.lectures && activeCourse.lectures.length > 0) {
      setActiveLecture(activeCourse.lectures[0]);
    }
  }, [selectedCourseIndex, activeCourse?.id, activeCourse?.lectures?.length]);

  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [newTitle, setNewTitle] = useState('');
  const [newSubject, setNewSubject] = useState('DSA');
  const [newUrl, setNewUrl] = useState('');
  const [newLecturesText, setNewLecturesText] = useState('');
  const [isFetchingPlaylist, setIsFetchingPlaylist] = useState<boolean>(false);
  const [filterTab, setFilterTab] = useState<'All' | 'Series' | 'Completed'>('All');

  // YouTube Live Recommendations & API Key Modal State
  const [recommendations, setRecommendations] = useState<YouTubeRecommendation[]>([]);
  const [loadingRecommendations, setLoadingRecommendations] = useState<boolean>(false);
  const [recFilter, setRecFilter] = useState<'ALL' | 'DSA' | 'ML' | 'SYSTEM_DESIGN'>('ALL');
  const [showYtKeyModal, setShowYtKeyModal] = useState<boolean>(false);
  const [tempYtKey, setTempYtKey] = useState<string>(youtubeApiKey || '');
  const [ytKeyStatusMsg, setYtKeyStatusMsg] = useState<string | null>(null);

  const [isAndroidOrMobile, setIsAndroidOrMobile] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return Capacitor.isNativePlatform() || window.innerWidth <= 768;
  });

  useEffect(() => {
    const handleResize = () => {
      setIsAndroidOrMobile(Capacitor.isNativePlatform() || window.innerWidth <= 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const loadDailyRecommendations = async (filter: 'ALL' | 'DSA' | 'ML' | 'SYSTEM_DESIGN' = recFilter) => {
    setLoadingRecommendations(true);
    try {
      const recs = await YouTubeService.fetchDailyRecommendations(youtubeApiKey, filter);
      setRecommendations(recs);
    } catch (e) {
      console.error('[YouTube Recommendations Error]', e);
    } finally {
      setLoadingRecommendations(false);
    }
  };

  useEffect(() => {
    loadDailyRecommendations(recFilter);
  }, [youtubeApiKey, recFilter]);

  useEffect(() => {
    setTempYtKey(youtubeApiKey || '');
  }, [youtubeApiKey]);

  const handleWatchRecommendation = (rec: YouTubeRecommendation) => {
    const lecture: PlaylistLecture = {
      id: `lec_rec_${rec.videoId}_${Date.now()}`,
      title: rec.title,
      duration: '42:00',
      videoId: rec.videoId,
      completed: false
    };
    setActiveLecture(lecture);
    setCurrentWatchingVideo({
      title: rec.title,
      url: `https://www.youtube.com/watch?v=${rec.videoId}`,
      subject: rec.category
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAddRecommendationToPlaylist = (rec: YouTubeRecommendation) => {
    addCourse({
      title: rec.title,
      subject: rec.category,
      youtubeUrl: `https://www.youtube.com/watch?v=${rec.videoId}`,
      embedUrl: `https://www.youtube.com/embed/${rec.videoId}`,
      addedBy: profile.name || 'Student',
      currentLesson: rec.title,
      totalLessons: '1 lecture',
      lectures: [
        {
          id: `lec_${Date.now()}`,
          title: rec.title,
          duration: '45:00',
          videoId: rec.videoId,
          completed: false
        }
      ]
    });
  };

  const handleSaveYtKey = () => {
    setYoutubeApiKey(tempYtKey.trim());
    setYtKeyStatusMsg('YouTube Data API v3 Key saved successfully! Live daily search active.');
    setTimeout(() => {
      setYtKeyStatusMsg(null);
      setShowYtKeyModal(false);
    }, 1500);
  };

  const [fetchedLecturesCache, setFetchedLecturesCache] = useState<PlaylistLecture[]>([]);

  // Auto-fetch the entire playlist (all real videos) using YouTube Data API & FUSE
  const handleAutoFetchPlaylist = async () => {
    if (!newUrl.trim()) return;
    setIsFetchingPlaylist(true);
    try {
      // 1. Try fetching directly via YouTube Data API v3 or public RSS
      const ytLectures = await YouTubeService.fetchPlaylistVideos(
        newUrl.trim(),
        newTitle.trim() || newSubject,
        youtubeApiKey
      );
      if (ytLectures && ytLectures.length > 0) {
        setFetchedLecturesCache(ytLectures);
        const textLines = ytLectures.map((lec, idx) => `${idx + 1}. ${lec.title} (${lec.duration})`);
        setNewLecturesText(textLines.join('\n'));
        setIsFetchingPlaylist(false);
        return;
      }

      // 2. Fallback to Gemini FUSE
      const fullLectures = await GeminiService.fetchFullPlaylistWithFuse(
        geminiApiKey,
        newUrl.trim(),
        newTitle.trim() || 'Course Playlist'
      );
      if (fullLectures && fullLectures.length > 0) {
        setFetchedLecturesCache(fullLectures);
        const textLines = fullLectures.map((lec, idx) => `${idx + 1}. ${lec.title} (${lec.duration})`);
        setNewLecturesText(textLines.join('\n'));
      }
    } catch (e) {
      console.error('[Playlist Fetch Error]', e);
    } finally {
      setIsFetchingPlaylist(false);
    }
  };

  // Handle playing a specific lecture
  const handleSelectLecture = (lec: PlaylistLecture) => {
    setActiveLecture(lec);
    const videoUrl = lec.videoId
      ? `https://www.youtube.com/watch?v=${lec.videoId}`
      : (activeCourse?.youtubeUrl || '');

    setCurrentWatchingVideo({
      title: lec.title,
      url: videoUrl,
      subject: activeCourse?.subject || 'YouTube'
    });
  };

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newUrl.trim()) return;

    let embed = newUrl.trim();
    let mainVideoId = YouTubeService.extractVideoId(newUrl.trim()) || 'EAR7De6G0ms';

    // Parse lecture lines if entered
    const lines = newLecturesText
      .split('\n')
      .map(l => l.trim())
      .filter(l => l.length > 0);

    let lectures: PlaylistLecture[] = [];

    if (fetchedLecturesCache.length > 0 && fetchedLecturesCache.length === lines.length) {
      // Use cached full lectures with true video IDs and durations
      lectures = fetchedLecturesCache;
    } else if (lines.length > 0) {
      lectures = lines.map((line, idx) => ({
        id: `lec_${idx + 1}_${Date.now()}`,
        title: line.replace(/^[\d+.-]+\s*/, ''),
        duration: `${20 + ((idx * 7) % 25)}:00`,
        videoId: fetchedLecturesCache[idx]?.videoId || mainVideoId,
        completed: false
      }));
    } else {
      // Fetch whole complete playlist automatically
      setIsFetchingPlaylist(true);
      try {
        const ytLectures = await YouTubeService.fetchPlaylistVideos(
          newUrl.trim(),
          newTitle.trim() || newSubject,
          youtubeApiKey
        );
        if (ytLectures && ytLectures.length > 0) {
          lectures = ytLectures;
          mainVideoId = ytLectures[0].videoId;
        } else {
          const fullLectures = await GeminiService.fetchFullPlaylistWithFuse(
            geminiApiKey,
            newUrl.trim(),
            newTitle.trim()
          );
          lectures = fullLectures;
          if (fullLectures[0]?.videoId) mainVideoId = fullLectures[0].videoId;
        }
      } catch (err) {
        lectures = [
          { id: `lec_1_${Date.now()}`, title: `${newTitle} - Part 1: Core Architecture`, duration: '28:40', videoId: mainVideoId, completed: false },
          { id: `lec_2_${Date.now()}`, title: `${newTitle} - Part 2: Implementation & Code Practice`, duration: '35:10', videoId: mainVideoId, completed: false }
        ];
      } finally {
        setIsFetchingPlaylist(false);
      }
    }

    if (!lectures || lectures.length === 0) {
      lectures = [
        { id: `lec_1_${Date.now()}`, title: `${newTitle} - Part 1: Core Architecture`, duration: '28:40', videoId: mainVideoId, completed: false }
      ];
    }

    embed = `https://www.youtube-nocookie.com/embed/${lectures[0]?.videoId || mainVideoId}`;

    await addCourse({
      title: newTitle.trim(),
      subject: newSubject,
      youtubeUrl: newUrl.trim(),
      embedUrl: embed,
      addedBy: profile.name,
      currentLesson: lectures[0]?.title || newTitle,
      totalLessons: `${lectures.length} lectures`,
      lectures
    });

    setNewTitle('');
    setNewUrl('');
    setNewLecturesText('');
    setFetchedLecturesCache([]);
    setShowAddModal(false);
    setSelectedCourseIndex(0);
    setFilterTab('All');
    if (lectures.length > 0) {
      setActiveLecture(lectures[0]);
    }
  };

  const lecturesList = activeCourse?.lectures || [];
  const completedCount = lecturesList.filter(l => l.completed).length;
  const currentLectureIndex = lecturesList.findIndex(l => l.id === activeLecture.id);
  const displayIndex = currentLectureIndex >= 0 ? currentLectureIndex + 1 : 1;

  const filteredLectures = lecturesList.filter(l => {
    if (filterTab === 'Completed') return l.completed;
    return true;
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
                color: '#EF4444',
                background: 'rgba(239, 68, 68, 0.12)',
                padding: '3px 10px',
                borderRadius: 'var(--radius-pill)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6
              }}
            >
              <YoutubeIcon size={14} color="#EF4444" />
              <span>SHARED YOUTUBE PLAYLIST ENGINE</span>
            </span>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              Courses added here are synced in real-time between {profile.name} & {activeFriend.name}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 4 }}>
            <img src="/icons/PLAYLIST.gif" alt="Playlists" style={{ width: 38, height: 38, objectFit: 'contain' }} />
            <h2
              className="font-tech"
              style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}
            >
              YouTube Playlist & Course Player
            </h2>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={() => setShowAddModal(true)}
            className="charcoal-pill-btn"
            style={{ padding: '10px 22px', fontSize: '0.88rem' }}
          >
            <Plus size={16} />
            <span>Add YouTube Playlist Link</span>
          </button>
        </div>
      </div>

      {/* Quick Add Playlist Bar (Top-level: For Android / Mobile devices - Zero scrolling needed) */}
      {isAndroidOrMobile && (
        <GlassCard
          style={{
            padding: '14px 18px',
            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(254, 242, 242, 0.92) 100%)',
            border: '1.5px solid rgba(239, 68, 68, 0.25)',
            boxShadow: '0 4px 16px -2px rgba(239, 68, 68, 0.08)'
          }}
        >
          <form
            onSubmit={handleCreateCourse}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              flexWrap: 'wrap'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
              <YoutubeIcon size={18} color="#EF4444" />
              <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#18181B' }}>
                Add Playlist:
              </span>
            </div>

            <input
              type="url"
              placeholder="Paste YouTube Playlist link (e.g. https://youtube.com/playlist?list=...)"
              value={newUrl}
              onChange={e => setNewUrl(e.target.value)}
              required
              style={{
                flex: '2 1 240px',
                padding: '9px 14px',
                borderRadius: 'var(--radius-pill)',
                border: '1.5px solid rgba(239, 68, 68, 0.3)',
                fontSize: '0.88rem',
                outline: 'none',
                background: '#FFFFFF'
              }}
            />

            <input
              type="text"
              placeholder="Course Title (Optional)"
              value={newTitle}
              onChange={e => setNewTitle(e.target.value)}
              style={{
                flex: '1 1 160px',
                padding: '9px 14px',
                borderRadius: 'var(--radius-pill)',
                border: '1px solid rgba(0,0,0,0.12)',
                fontSize: '0.88rem',
                outline: 'none',
                background: '#FFFFFF'
              }}
            />

            <select
              value={newSubject}
              onChange={e => setNewSubject(e.target.value)}
              style={{
                padding: '9px 12px',
                borderRadius: 'var(--radius-pill)',
                border: '1px solid rgba(0,0,0,0.12)',
                fontSize: '0.85rem',
                background: '#FFFFFF',
                fontWeight: 600
              }}
            >
              <option value="DSA">DSA</option>
              <option value="Machine Learning">AIML</option>
              <option value="Operating Systems">OS</option>
              <option value="Web Dev">Web Dev</option>
              <option value="System Design">System Design</option>
            </select>

            <button
              type="submit"
              disabled={!newUrl.trim() || isFetchingPlaylist}
              className="charcoal-pill-btn"
              style={{
                padding: '9px 18px',
                fontSize: '0.86rem',
                background: 'linear-gradient(135deg, #1E1E24 0%, #EF4444 100%)',
                flexShrink: 0
              }}
            >
              <Plus size={15} />
              <span>{isFetchingPlaylist ? 'Importing...' : 'Add Whole Playlist'}</span>
            </button>
          </form>
        </GlassCard>
      )}

      {/* Course Switcher Pills */}
      {/* Top Course Filter Strip / Tabs with Remove Playlist Option */}
      <div className="mobile-scroll-row" style={{ paddingBottom: 6 }}>
        {courses.map((c, idx) => {
          const isSelected = selectedCourseIndex === idx;
          const courseCompleted = (c.lectures || []).filter(l => l.completed).length;
          const courseTotal = c.lectures?.length || 0;

          return (
            <div
              key={c.id}
              onClick={() => {
                setSelectedCourseIndex(idx);
                if (c.lectures && c.lectures.length > 0) {
                  setActiveLecture(c.lectures[0]);
                }
              }}
              style={{
                padding: '8px 16px',
                borderRadius: 'var(--radius-pill)',
                border: isSelected ? 'none' : '1px solid rgba(0,0,0,0.08)',
                fontFamily: 'var(--font-tech)',
                fontWeight: 700,
                fontSize: '0.88rem',
                cursor: 'pointer',
                background: isSelected ? 'var(--charcoal-pill)' : 'rgba(255, 255, 255, 0.75)',
                color: isSelected ? '#FFFFFF' : 'var(--text-secondary)',
                boxShadow: isSelected ? '0 6px 18px rgba(30, 30, 36, 0.2)' : 'none',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                whiteSpace: 'nowrap',
                transition: 'all 0.2s ease',
                flexShrink: 0
              }}
            >
              <span>{c.title}</span>
              {c.addedBy && (
                <span
                  style={{
                    fontSize: '0.68rem',
                    padding: '2px 7px',
                    borderRadius: '6px',
                    background: isSelected ? 'rgba(255,255,255,0.22)' : (c.addedBy === 'Ayush' ? 'rgba(124, 58, 237, 0.12)' : 'rgba(2, 132, 199, 0.12)'),
                    color: isSelected ? '#FEF08A' : (c.addedBy === 'Ayush' ? '#7C3AED' : '#0284C7'),
                    fontWeight: 800
                  }}
                >
                  By {c.addedBy}
                </span>
              )}
              <span
                style={{
                  fontSize: '0.72rem',
                  padding: '2px 8px',
                  borderRadius: 'var(--radius-pill)',
                  background: isSelected ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.06)',
                  color: isSelected ? '#FFFFFF' : 'var(--text-muted)'
                }}
              >
                {courseCompleted}/{courseTotal}
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  deleteCourse(c.id);
                  setSelectedCourseIndex(0);
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

      {/* Main YouTube Course Interface or Clean Empty State when all courses removed */}
      {!activeCourse || courses.length === 0 ? (
        <GlassCard
          style={{
            padding: '44px 28px',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 16,
            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(254, 242, 242, 0.85) 100%)',
            border: '1.5px dashed rgba(239, 68, 68, 0.35)',
            borderRadius: '24px'
          }}
        >
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: '50%',
              background: 'rgba(239, 68, 68, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#DC2626'
            }}
          >
            <Film size={32} />
          </div>
          <div>
            <h3 className="font-tech" style={{ fontSize: '1.35rem', fontWeight: 800, color: '#18181B', marginBottom: 6 }}>
              No Custom Playlists Active
            </h3>
            <p style={{ fontSize: '0.92rem', color: 'var(--text-secondary)', maxWidth: '540px', margin: 0, lineHeight: 1.5 }}>
              You have removed all custom course playlists. Click <strong>"Add YouTube Playlist Link"</strong> above to import your syllabus, or choose from the curated daily recommendations below!
            </p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="charcoal-pill-btn"
            style={{ padding: '12px 28px', fontSize: '0.92rem', display: 'flex', alignItems: 'center', gap: 8 }}
          >
            <Plus size={18} />
            <span>Add YouTube Playlist Link</span>
          </button>
        </GlassCard>
      ) : (
        <div className="responsive-grid-player" style={{ alignItems: 'start' }}>
        {/* Left Side: Video Player & Lecture Meta */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Responsive Embedded YouTube Player */}
          <div
            style={{
              position: 'relative',
              width: '100%',
              paddingTop: '56.25%', // 16:9 Aspect Ratio
              borderRadius: '24px',
              overflow: 'hidden',
              background: '#000000',
              boxShadow: '0 20px 40px -10px rgba(0,0,0,0.35)',
              border: '1.5px solid rgba(255, 255, 255, 0.8)'
            }}
          >
            <iframe
              src={
                activeLecture.videoId
                  ? `https://www.youtube-nocookie.com/embed/${activeLecture.videoId}?autoplay=0&rel=0&enablejsapi=1`
                  : activeCourse.embedUrl || `https://www.youtube-nocookie.com/embed/EAR7De6G0ms?autoplay=0&rel=0&enablejsapi=1`
              }
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

          {/* Active Lecture Details Card */}
          <GlassCard style={{ padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                  <span
                    style={{
                      fontSize: '0.76rem',
                      fontWeight: 700,
                      color: '#EF4444',
                      background: 'rgba(239, 68, 68, 0.1)',
                      padding: '3px 10px',
                      borderRadius: 'var(--radius-pill)'
                    }}
                  >
                    Lecture {displayIndex} of {lecturesList.length}
                  </span>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    {activeCourse.subject} • Added by {activeCourse.addedBy}
                  </span>
                </div>

                <h3 className="font-tech" style={{ fontSize: '1.35rem', fontWeight: 800, color: '#18181B' }}>
                  {activeLecture.title}
                </h3>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                {/* Watch Directly on YouTube */}
                <a
                  href={`https://www.youtube.com/watch?v=${activeLecture.videoId || 'EAR7De6G0ms'}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="glass-pill"
                  title="Watch directly on YouTube"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '10px 16px',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    color: '#EF4444',
                    textDecoration: 'none',
                    background: 'rgba(239, 68, 68, 0.08)',
                    border: '1px solid rgba(239, 68, 68, 0.2)'
                  }}
                >
                  <ExternalLink size={15} />
                  <span>Open on YouTube</span>
                </a>

                {/* Mark Completed Check Button */}
                <button
                  onClick={() => {
                    if (activeCourse) {
                      toggleLectureCompleted(activeCourse.id, activeLecture.id);
                    }
                  }}
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
                    color: '#FFFFFF',
                    boxShadow: '0 4px 14px rgba(0,0,0,0.15)'
                  }}
                >
                  <CheckCircle2 size={18} />
                  <span>{activeLecture.completed ? 'Completed (+50 XP)' : 'Mark Lecture Done'}</span>
                </button>

                {/* Remove Course Playlist Button */}
                <button
                  onClick={() => {
                    if (activeCourse && confirm(`Remove playlist "${activeCourse.title}" from your courses?`)) {
                      deleteCourse(activeCourse.id);
                      setSelectedCourseIndex(0);
                    }
                  }}
                  className="glass-pill"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '10px 16px',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    color: '#DC2626',
                    cursor: 'pointer',
                    background: 'rgba(239, 68, 68, 0.08)',
                    border: '1px solid rgba(239, 68, 68, 0.25)'
                  }}
                  title="Remove this playlist"
                >
                  <Trash2 size={15} />
                  <span>Remove Playlist</span>
                </button>
              </div>
            </div>

            {/* Currently Watching Live Status */}
            <div
              style={{
                marginTop: 16,
                padding: '12px 16px',
                borderRadius: '16px',
                background: 'rgba(239, 68, 68, 0.06)',
                border: '1px solid rgba(239, 68, 68, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Radio size={16} color="#EF4444" />
                <span style={{ fontSize: '0.84rem', color: '#991B1B', fontWeight: 600 }}>
                  Live Broadcast: Synced to Partner Room for {activeFriend.name}
                </span>
              </div>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                {activeLecture.duration}
              </span>
            </div>
          </GlassCard>
        </div>

        {/* Right Side: YouTube Playlist Drawer (Website Theme - Frosted Glass, Not Black) */}
        <div
          className="glass-card"
          style={{
            background: 'rgba(255, 255, 255, 0.88)',
            backdropFilter: 'blur(24px)',
            borderRadius: '24px',
            overflow: 'hidden',
            boxShadow: 'var(--shadow-glass)',
            border: '1.5px solid rgba(255, 255, 255, 0.95)',
            display: 'flex',
            flexDirection: 'column',
            maxHeight: '750px'
          }}
        >
          {/* Playlist Header */}
          <div
            style={{
              padding: '20px 22px',
              background: 'rgba(248, 250, 252, 0.9)',
              borderBottom: '1px solid rgba(0, 0, 0, 0.06)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
              <h4
                className="font-tech"
                style={{
                  fontSize: '1.08rem',
                  fontWeight: 800,
                  color: 'var(--text-primary)',
                  margin: 0,
                  lineHeight: 1.3
                }}
              >
                {activeCourse.title}
              </h4>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              <span>
                {activeCourse.addedBy} • {displayIndex} / {lecturesList.length}
              </span>
              <span style={{ color: '#10B981', fontWeight: 700 }}>
                {completedCount} Completed
              </span>
            </div>

            {/* Filter Tags */}
            <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
              {(['All', 'Series', 'Completed'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setFilterTab(tab)}
                  style={{
                    padding: '4px 12px',
                    borderRadius: 'var(--radius-pill)',
                    border: 'none',
                    fontSize: '0.74rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    background: filterTab === tab ? 'var(--charcoal-pill)' : 'rgba(0, 0, 0, 0.06)',
                    color: filterTab === tab ? '#FFFFFF' : 'var(--text-secondary)'
                  }}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* Scrollable Playlist Queue with Checklists */}
          <div
            style={{
              overflowY: 'auto',
              flex: 1,
              padding: '8px 0',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            {filteredLectures.map((lec, idx) => {
              const isCurrentPlaying = activeLecture.id === lec.id;

              return (
                <div
                  key={lec.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: '12px 18px',
                    background: isCurrentPlaying ? 'rgba(56, 189, 248, 0.12)' : 'transparent',
                    borderLeft: isCurrentPlaying ? '4px solid #0284C7' : '4px solid transparent',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {/* Playing Indicator */}
                  <div
                    onClick={() => handleSelectLecture(lec)}
                    style={{
                      width: 18,
                      fontSize: '0.8rem',
                      color: isCurrentPlaying ? '#0284C7' : 'var(--text-muted)',
                      textAlign: 'center',
                      fontWeight: 800
                    }}
                  >
                    {isCurrentPlaying ? '▶' : idx + 1}
                  </div>

                  {/* Video Thumbnail with Duration Badge */}
                  <div
                    onClick={() => handleSelectLecture(lec)}
                    style={{
                      position: 'relative',
                      width: 90,
                      height: 52,
                      borderRadius: '10px',
                      overflow: 'hidden',
                      flexShrink: 0,
                      background: '#E2E8F0',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
                    }}
                  >
                    <img
                      src={lec.thumbnail || 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=160'}
                      alt={lec.title}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                    <div
                      style={{
                        position: 'absolute',
                        bottom: 3,
                        right: 4,
                        padding: '1px 4px',
                        borderRadius: '4px',
                        background: 'rgba(0,0,0,0.85)',
                        fontSize: '0.66rem',
                        fontWeight: 700,
                        color: '#FFFFFF'
                      }}
                    >
                      {lec.duration}
                    </div>
                  </div>

                  {/* Title & Info */}
                  <div
                    onClick={() => handleSelectLecture(lec)}
                    style={{ flex: 1, minWidth: 0 }}
                  >
                    <div
                      style={{
                        fontSize: '0.84rem',
                        fontWeight: isCurrentPlaying ? 700 : 600,
                        color: isCurrentPlaying ? '#0369A1' : 'var(--text-primary)',
                        lineHeight: 1.35,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical'
                      }}
                    >
                      {lec.title}
                    </div>
                    {lec.phase && (
                      <span style={{ fontSize: '0.68rem', color: '#0284C7', fontWeight: 600 }}>{lec.phase}</span>
                    )}
                  </div>

                  {/* Interactive Checklist Checkbox */}
                  <button
                    onClick={e => {
                      e.stopPropagation();
                      if (activeCourse) {
                        toggleLectureCompleted(activeCourse.id, lec.id);
                      }
                    }}
                    title={lec.completed ? 'Mark as Incomplete' : 'Mark as Completed'}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      padding: 4,
                      color: lec.completed ? '#10B981' : 'var(--text-muted)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    {lec.completed ? <CheckSquare size={20} /> : <Square size={20} />}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      )}

      {/* Daily YouTube Video Recommendations (Live API + Masterclasses) */}
      <div style={{ marginTop: 32 }}>
        <GlassCard
          className="p-6"
          style={{
            background: 'var(--glass-bg)',
            border: '1px solid var(--glass-border)',
            borderRadius: '24px'
          }}
        >
          {/* Header */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: 16,
              marginBottom: 20,
              paddingBottom: 16,
              borderBottom: '1px solid rgba(0,0,0,0.06)'
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <YoutubeIcon size={24} color="#EF4444" />
                <h3 className="font-tech" style={{ fontSize: '1.25rem', fontWeight: 800 }}>
                  Daily Curated Video Recommendations
                </h3>
                <span
                  style={{
                    padding: '3px 10px',
                    borderRadius: '20px',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    background: youtubeApiKey ? 'rgba(16, 185, 129, 0.12)' : 'rgba(2, 132, 199, 0.1)',
                    color: youtubeApiKey ? '#059669' : '#0284C7',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 5
                  }}
                >
                  <span
                    style={{
                      width: 7,
                      height: 7,
                      borderRadius: '50%',
                      background: youtubeApiKey ? '#10B981' : '#0284C7'
                    }}
                  />
                  {youtubeApiKey ? 'Live YouTube Data API v3 Active' : 'Curated Placement Masterclasses'}
                </span>
              </div>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: 4 }}>
                Daily structured lectures for DSA & Machine Learning to hit your streak and watch directly inside FUSION.
              </p>
            </div>

            {/* Filter Tabs & Key Setup Trigger */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', background: 'rgba(0,0,0,0.04)', borderRadius: 12, padding: 3, gap: 4 }}>
                {(['ALL', 'DSA', 'ML', 'SYSTEM_DESIGN'] as const).map(tab => (
                  <button
                    key={tab}
                    onClick={() => setRecFilter(tab)}
                    style={{
                      padding: '6px 14px',
                      borderRadius: 10,
                      border: 'none',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      background: recFilter === tab ? '#FFFFFF' : 'transparent',
                      color: recFilter === tab ? '#0F172A' : 'var(--text-secondary)',
                      boxShadow: recFilter === tab ? '0 2px 6px rgba(0,0,0,0.06)' : 'none',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    {tab === 'ALL'
                      ? 'All Focus'
                      : tab === 'DSA'
                      ? 'DSA'
                      : tab === 'ML'
                      ? 'Machine Learning'
                      : 'System Design & Core CS'}
                  </button>
                ))}
              </div>

              <button
                onClick={() => loadDailyRecommendations(recFilter)}
                disabled={loadingRecommendations}
                className="glass-pill"
                title="Refresh daily recommendations"
                style={{
                  padding: '8px 12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: loadingRecommendations ? 'not-allowed' : 'pointer'
                }}
              >
                <RefreshCw size={14} className={loadingRecommendations ? 'animate-spin' : ''} />
                <span>Refresh</span>
              </button>

              <button
                onClick={() => setShowYtKeyModal(true)}
                className="charcoal-pill-btn"
                style={{
                  padding: '8px 14px',
                  fontSize: '0.8rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  background: youtubeApiKey ? '#0F172A' : 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)',
                  color: '#FFFFFF'
                }}
              >
                <Key size={14} />
                <span>{youtubeApiKey ? 'Manage API Key' : 'Setup YouTube API'}</span>
              </button>
            </div>
          </div>

          {/* Video Cards Grid */}
          <div
            className="responsive-grid-cards"
            style={{ gap: 20 }}
          >
            {recommendations.map(rec => (
              <div
                key={rec.id}
                style={{
                  background: '#FFFFFF',
                  borderRadius: 20,
                  border: '1px solid rgba(0,0,0,0.08)',
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.03)'
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = 'translateY(-3px)';
                  e.currentTarget.style.boxShadow = '0 10px 24px rgba(0,0,0,0.08)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.03)';
                }}
              >
                {/* Thumbnail Container */}
                <div
                  style={{
                    position: 'relative',
                    width: '100%',
                    aspectRatio: '16/9',
                    background: '#0F172A',
                    overflow: 'hidden',
                    cursor: 'pointer'
                  }}
                  onClick={() => handleWatchRecommendation(rec)}
                >
                  <img
                    src={rec.thumbnail}
                    alt={rec.title}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover'
                    }}
                  />
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 60%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <div
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: '50%',
                        background: 'rgba(239, 68, 68, 0.9)',
                        color: '#FFFFFF',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 4px 14px rgba(0,0,0,0.3)'
                      }}
                    >
                      <Play size={20} fill="#FFFFFF" style={{ marginLeft: 2 }} />
                    </div>
                  </div>

                  {/* Category Badge */}
                  <div
                    style={{
                      position: 'absolute',
                      top: 10,
                      left: 10,
                      background: rec.category === 'DSA' ? 'rgba(2, 132, 199, 0.9)' : 'rgba(124, 58, 237, 0.9)',
                      color: '#FFFFFF',
                      fontSize: '0.68rem',
                      fontWeight: 700,
                      padding: '3px 9px',
                      borderRadius: 12,
                      backdropFilter: 'blur(4px)'
                    }}
                  >
                    {rec.category}
                  </div>
                </div>

                {/* Card Info */}
                <div style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', flex: 1, gap: 8 }}>
                  <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                    {rec.channelTitle}
                  </div>
                  <h4
                    style={{
                      fontSize: '0.88rem',
                      fontWeight: 700,
                      lineHeight: 1.35,
                      color: '#0F172A',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden'
                    }}
                    title={rec.title}
                  >
                    {rec.title}
                  </h4>
                  <p
                    style={{
                      fontSize: '0.76rem',
                      color: 'var(--text-secondary)',
                      lineHeight: 1.4,
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      marginBottom: 'auto'
                    }}
                  >
                    {rec.description || 'Interactive daily practice lecture to master concepts.'}
                  </p>

                  {/* Action Buttons */}
                  <div style={{ display: 'flex', gap: 8, marginTop: 10, paddingTop: 10, borderTop: '1px solid rgba(0,0,0,0.06)' }}>
                    <button
                      onClick={() => handleWatchRecommendation(rec)}
                      className="charcoal-pill-btn"
                      style={{
                        flex: 1,
                        padding: '8px 12px',
                        fontSize: '0.78rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 6
                      }}
                    >
                      <Play size={13} fill="currentColor" />
                      <span>Watch in Player</span>
                    </button>
                    <button
                      onClick={() => handleAddRecommendationToPlaylist(rec)}
                      className="glass-pill"
                      title="Add to My Playlists"
                      style={{
                        padding: '8px 10px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--text-secondary)'
                      }}
                    >
                      <BookmarkPlus size={15} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      {/* Add YouTube Playlist Modal */}
      {showAddModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 200,
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'center',
            background: 'rgba(15, 23, 42, 0.7)',
            backdropFilter: 'blur(10px)',
            padding: '16px 12px',
            overflowY: 'auto'
          }}
        >
          <div
            className="glass-card"
            style={{
              maxWidth: '560px',
              width: '100%',
              background: '#FFFFFF',
              borderRadius: '24px',
              padding: '20px 22px',
              margin: '12px auto',
              maxHeight: '88vh',
              overflowY: 'auto',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <YoutubeIcon size={24} color="#EF4444" />
                <h3 className="font-tech" style={{ fontSize: '1.3rem', fontWeight: 800 }}>
                  Add YouTube Course / Playlist
                </h3>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
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

            <form onSubmit={handleCreateCourse} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>
                  Course Title
                </label>
                <input
                  type="text"
                  placeholder="e.g. Striver A2Z Dynamic Programming Series"
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    borderRadius: '14px',
                    border: '1px solid rgba(0,0,0,0.12)',
                    fontSize: '0.94rem'
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>
                  Subject Category
                </label>
                <select
                  value={newSubject}
                  onChange={e => setNewSubject(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    borderRadius: '14px',
                    border: '1px solid rgba(0,0,0,0.12)',
                    fontSize: '0.94rem',
                    background: '#FFFFFF'
                  }}
                >
                  <option value="DSA">DSA (Data Structures & Algorithms)</option>
                  <option value="Machine Learning">Machine Learning</option>
                  <option value="Operating Systems">Operating Systems</option>
                  <option value="Web Dev">Web Development</option>
                  <option value="System Design">System Design</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>
                  YouTube Video or Playlist URL
                </label>
                <div style={{ display: 'flex', gap: 8 }}>
                  <input
                    type="url"
                    placeholder="https://www.youtube.com/playlist?list=... or https://www.youtube.com/watch?v=..."
                    value={newUrl}
                    onChange={e => setNewUrl(e.target.value)}
                    required
                    style={{
                      flex: 1,
                      padding: '12px 16px',
                      borderRadius: '14px',
                      border: '1px solid rgba(0,0,0,0.12)',
                      fontSize: '0.94rem'
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleAutoFetchPlaylist}
                    disabled={!newUrl.trim() || isFetchingPlaylist}
                    className="glass-pill"
                    style={{
                      padding: '12px 16px',
                      fontSize: '0.82rem',
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      cursor: !newUrl.trim() || isFetchingPlaylist ? 'not-allowed' : 'pointer',
                      color: '#0284C7',
                      whiteSpace: 'nowrap'
                    }}
                    title="Auto-fetch the entire playlist (all 15-30+ lectures) using FUSE AI"
                  >
                    <RefreshCw size={14} className={isFetchingPlaylist ? 'animate-spin' : ''} />
                    <span>{isFetchingPlaylist ? 'Fetching...' : 'Fetch Whole Playlist'}</span>
                  </button>
                </div>
                <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: 4, display: 'block' }}>
                  Paste a playlist link and click "Fetch Whole Playlist" to import ALL video lectures automatically.
                </span>
              </div>

              <div>
                <label style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>
                  Lecture Titles Checklist (All lectures auto-populated)
                </label>
                <textarea
                  rows={4}
                  placeholder={`1. Introduction & Setup\n2. Array & String Manipulation\n3. Two Pointers Technique\n4. Binary Search Mastery`}
                  value={newLecturesText}
                  onChange={e => setNewLecturesText(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    borderRadius: '14px',
                    border: '1px solid rgba(0,0,0,0.12)',
                    fontSize: '0.9rem',
                    fontFamily: 'inherit'
                  }}
                />
              </div>

              <button
                type="submit"
                className="charcoal-pill-btn"
                style={{ padding: '14px', fontSize: '1rem', marginTop: 8 }}
              >
                <Plus size={18} />
                <span>Add to Shared Courses</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* YouTube Data API v3 Setup Guide Modal */}
      {showYtKeyModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 250,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(15, 23, 42, 0.7)',
            backdropFilter: 'blur(10px)',
            padding: 20
          }}
        >
          <div
            className="glass-card"
            style={{
              maxWidth: '620px',
              width: '100%',
              background: '#FFFFFF',
              borderRadius: '28px',
              padding: '32px',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
            }}
          >
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 14,
                    background: 'rgba(239, 68, 68, 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#EF4444'
                  }}
                >
                  <YoutubeIcon size={24} color="#EF4444" />
                </div>
                <div>
                  <h3 className="font-tech" style={{ fontSize: '1.25rem', fontWeight: 800 }}>
                    YouTube Data API v3 Setup Guide
                  </h3>
                  <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                    Free 10,000 queries/day from Google Cloud Console
                  </span>
                </div>
              </div>
              <button
                onClick={() => setShowYtKeyModal(false)}
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

            {/* Step-by-Step Instructions */}
            <div style={{ marginBottom: 24 }}>
              <h4 style={{ fontSize: '0.88rem', fontWeight: 700, color: '#0F172A', marginBottom: 12 }}>
                How to get your free API Key in 2 minutes:
              </h4>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div
                  style={{
                    display: 'flex',
                    gap: 12,
                    padding: 12,
                    borderRadius: 16,
                    background: 'rgba(0,0,0,0.02)',
                    border: '1px solid rgba(0,0,0,0.05)'
                  }}
                >
                  <div
                    style={{
                      width: 26,
                      height: 26,
                      borderRadius: '50%',
                      background: '#0F172A',
                      color: '#FFFFFF',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}
                  >
                    1
                  </div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.45 }}>
                    <strong style={{ color: '#0F172A' }}>Open Google Cloud Console:</strong> Visit{' '}
                    <a
                      href="https://console.cloud.google.com/"
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: '#0284C7', textDecoration: 'underline', fontWeight: 600 }}
                    >
                      console.cloud.google.com
                    </a>{' '}
                    and sign in with your Google account.
                  </div>
                </div>

                <div
                  style={{
                    display: 'flex',
                    gap: 12,
                    padding: 12,
                    borderRadius: 16,
                    background: 'rgba(0,0,0,0.02)',
                    border: '1px solid rgba(0,0,0,0.05)'
                  }}
                >
                  <div
                    style={{
                      width: 26,
                      height: 26,
                      borderRadius: '50%',
                      background: '#0F172A',
                      color: '#FFFFFF',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}
                  >
                    2
                  </div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.45 }}>
                    <strong style={{ color: '#0F172A' }}>Enable YouTube Data API v3:</strong> In the top search bar, type{' '}
                    <code style={{ background: 'rgba(0,0,0,0.06)', padding: '2px 6px', borderRadius: 6, fontSize: '0.78rem' }}>
                      YouTube Data API v3
                    </code>{' '}
                    and click the blue <strong style={{ color: '#0F172A' }}>"Enable"</strong> button.
                  </div>
                </div>

                <div
                  style={{
                    display: 'flex',
                    gap: 12,
                    padding: 12,
                    borderRadius: 16,
                    background: 'rgba(0,0,0,0.02)',
                    border: '1px solid rgba(0,0,0,0.05)'
                  }}
                >
                  <div
                    style={{
                      width: 26,
                      height: 26,
                      borderRadius: '50%',
                      background: '#0F172A',
                      color: '#FFFFFF',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}
                  >
                    3
                  </div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.45 }}>
                    <strong style={{ color: '#0F172A' }}>Generate an API Key:</strong> Click on{' '}
                    <strong style={{ color: '#0F172A' }}>"Credentials"</strong> in the left sidebar &rarr; Click{' '}
                    <strong style={{ color: '#0F172A' }}>"+ Create Credentials"</strong> &rarr; Select{' '}
                    <strong style={{ color: '#0F172A' }}>"API key"</strong>.
                  </div>
                </div>

                <div
                  style={{
                    display: 'flex',
                    gap: 12,
                    padding: 12,
                    borderRadius: 16,
                    background: 'rgba(0,0,0,0.02)',
                    border: '1px solid rgba(0,0,0,0.05)'
                  }}
                >
                  <div
                    style={{
                      width: 26,
                      height: 26,
                      borderRadius: '50%',
                      background: '#0F172A',
                      color: '#FFFFFF',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}
                  >
                    4
                  </div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.45 }}>
                    <strong style={{ color: '#0F172A' }}>Paste Key Here:</strong> Copy your key (starts with{' '}
                    <code style={{ background: 'rgba(0,0,0,0.06)', padding: '2px 6px', borderRadius: 6, fontSize: '0.78rem' }}>
                      AIzaSy...
                    </code>
                    ) and paste it into the field below.
                  </div>
                </div>
              </div>
            </div>

            {/* Quick External Link */}
            <div style={{ marginBottom: 20 }}>
              <a
                href="https://console.cloud.google.com/apis/library/youtube.googleapis.com"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  color: '#0284C7',
                  textDecoration: 'none'
                }}
              >
                <span>Direct link to Google Cloud YouTube API page</span>
                <ExternalLink size={14} />
              </a>
            </div>

            {/* API Key Form */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <label style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
                Your YouTube Data API v3 Key:
              </label>
              <div style={{ display: 'flex', gap: 8 }}>
                <input
                  type="text"
                  placeholder="AIzaSy..."
                  value={tempYtKey}
                  onChange={e => setTempYtKey(e.target.value)}
                  style={{
                    flex: 1,
                    padding: '12px 16px',
                    borderRadius: 14,
                    border: '1px solid rgba(0,0,0,0.12)',
                    fontSize: '0.9rem',
                    fontFamily: 'monospace'
                  }}
                />
                <button
                  type="button"
                  onClick={handleSaveYtKey}
                  disabled={!tempYtKey.trim()}
                  className="charcoal-pill-btn"
                  style={{
                    padding: '12px 20px',
                    fontSize: '0.85rem',
                    whiteSpace: 'nowrap',
                    opacity: !tempYtKey.trim() ? 0.6 : 1
                  }}
                >
                  <Check size={16} />
                  <span>Save & Activate</span>
                </button>
              </div>

              {tempYtKey.trim() && (
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <button
                    type="button"
                    onClick={() => {
                      setTempYtKey('');
                      setYoutubeApiKey('');
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#EF4444',
                      fontSize: '0.76rem',
                      cursor: 'pointer',
                      textDecoration: 'underline'
                    }}
                  >
                    Clear & disconnect API key
                  </button>
                </div>
              )}

              {ytKeyStatusMsg && (
                <div
                  style={{
                    padding: '10px 14px',
                    borderRadius: 12,
                    background: 'rgba(16, 185, 129, 0.1)',
                    border: '1px solid rgba(16, 185, 129, 0.2)',
                    color: '#059669',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8
                  }}
                >
                  <Check size={16} />
                  <span>{ytKeyStatusMsg}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
