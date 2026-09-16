import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { triggerSparkleConfetti as confetti } from '../../utils/confettiHelper';
import { useStudentOs } from '../../context/StudentOsContext';
import { GlassCard } from '../common/GlassCard';
import {
  Calendar,
  Clock,
  Upload,
  Coffee,
  CheckCircle2,
  Circle,
  Eye,
  Sun,
  Code2,
  Play,
  Edit3,
  X,
  Check,
  Building2,
  BookOpen,
  Laptop
} from 'lucide-react';

interface DayScheduleSlot {
  id: string;
  time: string;
  subject: string;
  topic: string;
  type: string;
}

// Master Schedule Definitions:
// - Mon & Tue are off-campus days.
// - Monday has Capgemini 5-Hour Online Class (10:00 AM - 03:00 PM).
// - Wed, Thu, Fri, Sat, Sun are regular college days (09:00 AM - 04:00 PM).
const DEFAULT_SCHEDULES_BY_DAY: Record<'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun', DayScheduleSlot[]> = {
  Mon: [
    { id: 'mon_1', time: '08:30 AM - 09:30 AM', subject: 'Core CS', topic: 'Morning Prep & Code Review', type: 'Morning Warmup' },
    { id: 'mon_capgemini', time: '10:00 AM - 03:00 PM', subject: 'Capgemini Online Class', topic: 'Capgemini 5-Hour Online Training & Masterclass', type: 'Online Training' },
    { id: 'mon_3', time: '03:00 PM - 04:00 PM', subject: 'Break', topic: 'Post-Class Rest & Evening Refreshment', type: 'Rest' },
    { id: 'mon_4', time: '04:00 PM - 06:30 PM', subject: 'DSA', topic: 'DSA Deep Practice - LeetCode & Striver Sheet (2.5h)', type: 'Problem Solving' },
    { id: 'mon_5', time: '06:30 PM - 07:30 PM', subject: 'Break', topic: 'Evening Walk & Dinner Break', type: 'Rest' },
    { id: 'mon_6', time: '07:30 PM - 09:30 PM', subject: 'Machine Learning', topic: 'Machine Learning Lecture & Code Implementation (2h)', type: 'Video Lecture' },
    { id: 'mon_7', time: '09:30 PM - 10:15 PM', subject: 'Core CS', topic: 'Daily Task Review & Progress Sync', type: 'Revision' }
  ],
  Tue: [
    { id: 'tue_1', time: '09:00 AM - 12:00 PM', subject: 'DSA', topic: 'DSA Intensive Sprint - Trees, Graphs & Dynamic Programming (3 Hours)', type: 'Problem Solving' },
    { id: 'tue_2', time: '12:00 PM - 01:30 PM', subject: 'Break', topic: 'Lunch & Relaxation Break', type: 'Rest' },
    { id: 'tue_3', time: '01:30 PM - 04:30 PM', subject: 'Machine Learning', topic: 'ML Deep Focus - PyTorch Models & Mathematical Foundations (3 Hours)', type: 'ML Session' },
    { id: 'tue_4', time: '04:30 PM - 05:30 PM', subject: 'Break', topic: 'Evening Break & Coffee', type: 'Rest' },
    { id: 'tue_5', time: '05:30 PM - 07:30 PM', subject: 'Core CS', topic: 'Core Engineering - Operating Systems & Computer Networks', type: 'Deep Study' },
    { id: 'tue_6', time: '07:30 PM - 08:30 PM', subject: 'Break', topic: 'Dinner Break', type: 'Rest' },
    { id: 'tue_7', time: '08:30 PM - 10:30 PM', subject: 'DSA', topic: 'LeetCode Contest / Speed Practice & Daily Checklist', type: 'Problem Solving' }
  ],
  Wed: [
    { id: 'wed_1', time: '09:00 AM - 04:00 PM', subject: 'College Lectures', topic: 'College Working Hours & In-Person Lectures', type: 'College Working Hours' },
    { id: 'wed_2', time: '04:00 PM - 05:00 PM', subject: 'Break', topic: 'Commute & Evening Refreshment', type: 'Rest' },
    { id: 'wed_3', time: '05:00 PM - 07:00 PM', subject: 'DSA', topic: 'Two Pointers & Sliding Window LeetCode Patterns (2 Hours Target)', type: 'Problem Solving' },
    { id: 'wed_4', time: '07:00 PM - 08:00 PM', subject: 'Break', topic: 'Dinner & Downtime Break', type: 'Rest' },
    { id: 'wed_5', time: '08:00 PM - 10:00 PM', subject: 'Machine Learning', topic: 'Neural Networks Architecture & Backpropagation (2 Hours Target)', type: 'Video Lecture' },
    { id: 'wed_6', time: '10:00 PM - 10:30 PM', subject: 'Core CS', topic: 'Daily Revision & Code Commit Checklist', type: 'Revision' }
  ],
  Thu: [
    { id: 'thu_1', time: '09:00 AM - 04:00 PM', subject: 'College Lectures', topic: 'College Working Hours & Laboratory Sessions', type: 'College Working Hours' },
    { id: 'thu_2', time: '04:00 PM - 05:00 PM', subject: 'Break', topic: 'Commute & Evening Tea', type: 'Rest' },
    { id: 'thu_3', time: '05:00 PM - 07:00 PM', subject: 'DSA', topic: 'Binary Search & Stack Problem Solving (2 Hours Target)', type: 'Problem Solving' },
    { id: 'thu_4', time: '07:00 PM - 08:00 PM', subject: 'Break', topic: 'Dinner Break', type: 'Rest' },
    { id: 'thu_5', time: '08:00 PM - 10:00 PM', subject: 'Machine Learning', topic: 'Feature Engineering & Supervised Learning Playlist (2 Hours Target)', type: 'Video Lecture' },
    { id: 'thu_6', time: '10:00 PM - 10:30 PM', subject: 'Core CS', topic: 'DBMS SQL & Indexing Revision', type: 'Revision' }
  ],
  Fri: [
    { id: 'fri_1', time: '09:00 AM - 04:00 PM', subject: 'College Lectures', topic: 'College Working Hours & Project Discussions', type: 'College Working Hours' },
    { id: 'fri_2', time: '04:00 PM - 05:00 PM', subject: 'Break', topic: 'Commute & Refreshment', type: 'Rest' },
    { id: 'fri_3', time: '05:00 PM - 07:00 PM', subject: 'DSA', topic: 'Recursion & Backtracking LeetCode Practice (2 Hours Target)', type: 'Problem Solving' },
    { id: 'fri_4', time: '07:00 PM - 08:00 PM', subject: 'Break', topic: 'Dinner & Downtime Break', type: 'Rest' },
    { id: 'fri_5', time: '08:00 PM - 10:00 PM', subject: 'Machine Learning', topic: 'Model Evaluation, Bias-Variance & Metrics (2 Hours Target)', type: 'Video Lecture' },
    { id: 'fri_6', time: '10:00 PM - 10:30 PM', subject: 'Core CS', topic: 'Weekly Revision & Checklist', type: 'Revision' }
  ],
  Sat: [
    { id: 'sat_1', time: '09:00 AM - 04:00 PM', subject: 'College Lectures', topic: 'College Working Hours & Academic Sessions', type: 'College Working Hours' },
    { id: 'sat_2', time: '04:00 PM - 05:00 PM', subject: 'Break', topic: 'Commute & Refreshment', type: 'Rest' },
    { id: 'sat_3', time: '05:00 PM - 07:00 PM', subject: 'DSA', topic: 'Graphs & BFS/DFS Traversal Practice (2 Hours Target)', type: 'Problem Solving' },
    { id: 'sat_4', time: '07:00 PM - 08:00 PM', subject: 'Break', topic: 'Dinner Break', type: 'Rest' },
    { id: 'sat_5', time: '08:00 PM - 10:00 PM', subject: 'Machine Learning', topic: 'Deep Learning with PyTorch Hands-On (2 Hours Target)', type: 'Video Lecture' },
    { id: 'sat_6', time: '10:00 PM - 10:30 PM', subject: 'Core CS', topic: 'DSA Problem Log & Git Backup', type: 'Revision' }
  ],
  Sun: [
    { id: 'sun_1', time: '09:00 AM - 04:00 PM', subject: 'College Lectures', topic: 'College Working Hours / Practical Lab Sessions', type: 'College Working Hours' },
    { id: 'sun_2', time: '04:00 PM - 05:00 PM', subject: 'Break', topic: 'Evening Break & Refreshment', type: 'Rest' },
    { id: 'sun_3', time: '05:00 PM - 07:00 PM', subject: 'DSA', topic: 'Dynamic Programming & Memoization Mastery (2 Hours Target)', type: 'Problem Solving' },
    { id: 'sun_4', time: '07:00 PM - 08:00 PM', subject: 'Break', topic: 'Dinner Break', type: 'Rest' },
    { id: 'sun_5', time: '08:00 PM - 10:00 PM', subject: 'Machine Learning', topic: 'NLP & Transformers Architecture Exploration (2 Hours Target)', type: 'Video Lecture' },
    { id: 'sun_6', time: '10:00 PM - 10:30 PM', subject: 'Core CS', topic: 'Weekly Retrospective & Plan for Next Week', type: 'Revision' }
  ]
};

export const CollegeTimetable: React.FC = () => {
  const {
    profile,
    collegeWorkingHours,
    setCollegeWorkingHours,
    timetableImageUrl,
    setTimetableImageUrl,
    uploadTimetableImage,
    isTodayHoliday,
    setIsTodayHoliday,
    setTimerSubject,
    setTimerDurationMinutes,
    startTimer,
    setActiveModule
  } = useStudentOs();

  const [selectedDay, setSelectedDay] = useState<'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun'>('Mon');
  const [showImageModal, setShowImageModal] = useState<boolean>(false);
  const [showHoursEdit, setShowHoursEdit] = useState<boolean>(false);
  const [justUpdatedGraphic, setJustUpdatedGraphic] = useState<boolean>(false);
  const [manualHoursInput, setManualHoursInput] = useState<string>(collegeWorkingHours);
  const [completedSlots, setCompletedSlots] = useState<Record<string, boolean>>({});

  const days: ('Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun')[] = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  // Monday and Tuesday are off-campus weekdays
  const isOffCampusDay = selectedDay === 'Mon' || selectedDay === 'Tue';
  const effectiveHoliday = isOffCampusDay || isTodayHoliday;

  // Active slots for selected day
  const currentSlots = useMemo(() => {
    return DEFAULT_SCHEDULES_BY_DAY[selectedDay] || DEFAULT_SCHEDULES_BY_DAY['Wed'];
  }, [selectedDay]);

  /**
   * Generates a clean, crisp canvas image showing ONLY Time and What to do (NOT day).
   * Strictly 2 columns: Column 1: Time, Column 2: What to Do.
   */
  const drawTimetableImage = (slots: DayScheduleSlot[]): string => {
    try {
      const canvas = document.createElement('canvas');
      canvas.width = 1100;
      canvas.height = 720;
      const ctx = canvas.getContext('2d');
      if (!ctx) return '';

      const roundRect = (
        c: CanvasRenderingContext2D,
        x: number,
        y: number,
        w: number,
        h: number,
        r: number
      ) => {
        c.beginPath();
        c.moveTo(x + r, y);
        c.lineTo(x + w - r, y);
        c.arcTo(x + w, y, x + w, y + r, r);
        c.lineTo(x + w, y + h - r);
        c.arcTo(x + w, y + h, x + w - r, y + h, r);
        c.lineTo(x + r, y + h);
        c.arcTo(x, y + h, x, y + h - r, r);
        c.lineTo(x, y + r);
        c.arcTo(x, y, x + r, y, r);
        c.closePath();
      };

      // 1. Mesh Background Gradient
      const bgGrad = ctx.createLinearGradient(0, 0, 1100, 720);
      bgGrad.addColorStop(0, '#F8FAFC');
      bgGrad.addColorStop(0.5, '#F1F5F9');
      bgGrad.addColorStop(1, '#E2E8F0');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, 1100, 720);

      // Ambient Soft Orbs
      const orb1 = ctx.createRadialGradient(150, 100, 10, 150, 100, 300);
      orb1.addColorStop(0, 'rgba(215, 239, 228, 0.7)');
      orb1.addColorStop(1, 'rgba(215, 239, 228, 0)');
      ctx.fillStyle = orb1;
      ctx.beginPath();
      ctx.arc(150, 100, 300, 0, Math.PI * 2);
      ctx.fill();

      const orb2 = ctx.createRadialGradient(950, 620, 10, 950, 620, 320);
      orb2.addColorStop(0, 'rgba(199, 238, 247, 0.7)');
      orb2.addColorStop(1, 'rgba(199, 238, 247, 0)');
      ctx.fillStyle = orb2;
      ctx.beginPath();
      ctx.arc(950, 620, 320, 0, Math.PI * 2);
      ctx.fill();

      // Main Content Card
      ctx.save();
      ctx.fillStyle = '#FFFFFF';
      ctx.shadowColor = 'rgba(15, 23, 42, 0.08)';
      ctx.shadowBlur = 36;
      ctx.shadowOffsetY = 12;
      roundRect(ctx, 40, 36, 1020, 648, 24);
      ctx.fill();
      ctx.restore();

      ctx.strokeStyle = 'rgba(226, 232, 240, 0.9)';
      ctx.lineWidth = 1.5;
      roundRect(ctx, 40, 36, 1020, 648, 24);
      ctx.stroke();

      // Header Tag (No day name)
      ctx.fillStyle = 'rgba(2, 132, 199, 0.12)';
      roundRect(ctx, 70, 58, 260, 30, 15);
      ctx.fill();
      ctx.fillStyle = '#0284C7';
      ctx.font = 'bold 12px system-ui, sans-serif';
      ctx.fillText('⚡ DAILY SCHEDULE BLUEPRINT', 85, 78);

      // Title: Time & Activity Master Blueprint (Strictly NO day)
      ctx.fillStyle = '#0F172A';
      ctx.font = 'bold 24px system-ui, sans-serif';
      ctx.fillText('Time & Activity Master Blueprint', 70, 120);

      // Subtitle (No day)
      ctx.fillStyle = '#64748B';
      ctx.font = '14px system-ui, sans-serif';
      ctx.fillText('Daily Routine • Minimum 2 Hours DSA Deep Focus + 2 Hours Machine Learning', 70, 145);

      // Table Header Strip (2 Columns: TIME & WHAT TO DO)
      ctx.fillStyle = '#F8FAFC';
      roundRect(ctx, 70, 166, 960, 36, 10);
      ctx.fill();
      ctx.strokeStyle = '#E2E8F0';
      ctx.lineWidth = 1;
      roundRect(ctx, 70, 166, 960, 36, 10);
      ctx.stroke();

      ctx.fillStyle = '#475569';
      ctx.font = 'bold 12px system-ui, sans-serif';
      ctx.fillText('TIME SLOT', 90, 189);
      ctx.fillText('WHAT TO DO (ACTIVITY & TARGET)', 380, 189);

      // Render slots (strictly Time and What to do)
      const displaySlots = slots.slice(0, 7);
      displaySlots.forEach((slot, i) => {
        const y = 212 + i * 58;
        const rowHeight = 50;

        let accent = '#0284C7';
        let bgLight = 'rgba(2, 132, 199, 0.04)';
        if (slot.subject === 'DSA') {
          accent = '#10B981';
          bgLight = 'rgba(16, 185, 129, 0.05)';
        } else if (slot.subject === 'Machine Learning') {
          accent = '#8B5CF6';
          bgLight = 'rgba(139, 92, 246, 0.05)';
        } else if (slot.subject.includes('Capgemini')) {
          accent = '#D97706';
          bgLight = 'rgba(217, 119, 6, 0.06)';
        } else if (slot.subject === 'College Lectures') {
          accent = '#4F46E5';
          bgLight = 'rgba(79, 70, 229, 0.05)';
        } else if (slot.subject === 'Break') {
          accent = '#94A3B8';
          bgLight = 'rgba(148, 163, 184, 0.04)';
        }

        // Row background
        ctx.fillStyle = bgLight;
        roundRect(ctx, 70, y, 960, rowHeight, 10);
        ctx.fill();
        ctx.strokeStyle = accent + '30';
        ctx.lineWidth = 1;
        roundRect(ctx, 70, y, 960, rowHeight, 10);
        ctx.stroke();

        // Accent bar on left
        ctx.fillStyle = accent;
        roundRect(ctx, 74, y + 6, 4, rowHeight - 12, 2);
        ctx.fill();

        // Column 1: TIME
        ctx.fillStyle = accent;
        ctx.font = 'bold 13px monospace';
        ctx.fillText(slot.time, 90, y + 30);

        // Column 2: WHAT TO DO
        // Subject pill
        ctx.fillStyle = accent;
        ctx.font = 'bold 13px system-ui, sans-serif';
        ctx.fillText(`[${slot.subject}]`, 380, y + 30);

        // Activity / Topic
        ctx.fillStyle = '#1E293B';
        ctx.font = '500 13px system-ui, sans-serif';
        const topicText = slot.topic.length > 56 ? slot.topic.slice(0, 54) + '...' : slot.topic;
        ctx.fillText(topicText, 540, y + 30);
      });

      // Footer
      ctx.fillStyle = '#94A3B8';
      ctx.font = '11px system-ui, sans-serif';
      ctx.fillText('⚡ FUSION Web • Precision Academic System • Minimum 2 Hours Daily Goal', 70, 660);

      return canvas.toDataURL('image/png');
    } catch {
      return '';
    }
  };

  const handleRegenerateGraphic = (openModal: boolean = true) => {
    const dataUrl = drawTimetableImage(currentSlots);
    if (dataUrl) {
      setTimetableImageUrl(dataUrl);
      localStorage.setItem('fusion_timetable_image', dataUrl);
      setJustUpdatedGraphic(true);
      setTimeout(() => setJustUpdatedGraphic(false), 2500);
      try {
        confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });
      } catch {}
      if (openModal) {
        setShowImageModal(true);
      }
    }
  };

  const handleDownloadTimetable = () => {
    const dataUrl = timetableImageUrl || drawTimetableImage(currentSlots);
    if (dataUrl) {
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = `FUSION_Schedule_Time_and_Activity.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await uploadTimetableImage(file);
      setTimeout(() => {
        handleRegenerateGraphic();
      }, 500);
    }
  };

  const handleToggleHoliday = () => {
    const nextHolidayState = !isTodayHoliday;
    setIsTodayHoliday(nextHolidayState);
    handleRegenerateGraphic();
  };

  const handleSaveWorkingHours = () => {
    if (manualHoursInput.trim()) {
      setCollegeWorkingHours(manualHoursInput.trim());
      setShowHoursEdit(false);
      handleRegenerateGraphic();
    }
  };

  const toggleSlotDone = (id: string) => {
    setCompletedSlots(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleQuickStartTimer = (subject: string, minutes: number = 120) => {
    setTimerSubject(subject);
    setTimerDurationMinutes(minutes);
    startTimer();
    setActiveModule('timer');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, paddingBottom: 100 }}>
      {/* 1. Header with Controls */}
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
                color: '#0284C7',
                background: 'rgba(2, 132, 199, 0.12)',
                padding: '3px 10px',
                borderRadius: 'var(--radius-pill)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6
              }}
            >
              <Calendar size={14} />
              <span>COLLEGE SCHEDULE & DAILY ROUTINE</span>
            </span>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              Off-Campus: Mon (Capgemini 5h) & Tue • College Days: Wed to Sun
            </span>
          </div>

          <h2
            className="font-tech"
            style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--text-primary)' }}
          >
            College Timetable & Routine
          </h2>
        </div>

        {/* Action Controls: View Timetable, Scan Schedule, Holiday Toggle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          {/* View Generated Timetable Button */}
          <button
            onClick={() => {
              if (!timetableImageUrl) {
                handleRegenerateGraphic();
              }
              setShowImageModal(true);
            }}
            className="glass-pill"
            style={{
              padding: '9px 18px',
              fontSize: '0.86rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              cursor: 'pointer',
              background: 'rgba(238, 242, 255, 0.9)',
              color: '#4F46E5',
              border: '1px solid rgba(99, 102, 241, 0.3)'
            }}
          >
            <Eye size={16} />
            <span>View Timetable</span>
          </button>

          {/* Upload College Timetable Reference */}
          <label
            className="glass-pill"
            style={{
              padding: '9px 16px',
              fontSize: '0.86rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              cursor: 'pointer',
              background: 'rgba(255, 255, 255, 0.9)',
              border: '1px solid rgba(2, 132, 199, 0.3)'
            }}
          >
            <Upload size={16} color="#0284C7" />
            <span>Scan Schedule</span>
            <input
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handleFileUpload}
            />
          </label>

          {/* Prominent Holiday Today Toggle */}
          <button
            onClick={handleToggleHoliday}
            style={{
              padding: '9px 20px',
              borderRadius: 'var(--radius-pill)',
              border: 'none',
              fontFamily: 'var(--font-tech)',
              fontWeight: 700,
              fontSize: '0.86rem',
              cursor: 'pointer',
              background: isTodayHoliday ? 'linear-gradient(135deg, #EA580C 0%, #F59E0B 100%)' : 'rgba(255, 255, 255, 0.85)',
              color: isTodayHoliday ? '#FFFFFF' : '#18181B',
              boxShadow: isTodayHoliday ? '0 6px 20px rgba(234, 88, 12, 0.3)' : '0 2px 8px rgba(0,0,0,0.04)',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              transition: 'all 0.2s ease'
            }}
          >
            <Sun size={16} color={isTodayHoliday ? '#FFFFFF' : '#F59E0B'} />
            <span>{isTodayHoliday ? '🌴 Holiday Today (Active)' : 'Mark Holiday Today'}</span>
          </button>
        </div>
      </div>

      {/* 2. Detected College Working Hours HUD */}
      <GlassCard
        style={{
          padding: '24px 28px',
          background: effectiveHoliday
            ? 'linear-gradient(135deg, rgba(254, 243, 199, 0.85) 0%, rgba(254, 215, 170, 0.85) 100%)'
            : 'linear-gradient(135deg, rgba(240, 249, 255, 0.9) 0%, rgba(224, 242, 254, 0.85) 100%)',
          border: effectiveHoliday ? '1.5px solid rgba(245, 158, 11, 0.4)' : '1.5px solid rgba(2, 132, 199, 0.35)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 20
        }}
      >
        <div style={{ maxWidth: '780px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <span
              style={{
                fontSize: '0.82rem',
                fontWeight: 800,
                color: effectiveHoliday ? '#92400E' : '#0369A1',
                background: effectiveHoliday ? 'rgba(245, 158, 11, 0.2)' : 'rgba(2, 132, 199, 0.15)',
                padding: '4px 12px',
                borderRadius: 'var(--radius-pill)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6
              }}
            >
              <Building2 size={15} />
              <span>
                {selectedDay === 'Mon'
                  ? 'MONDAY: CAPGEMINI ONLINE CLASS (5 HOURS)'
                  : selectedDay === 'Tue'
                  ? 'TUESDAY: OFF-CAMPUS INTENSIVE STUDY DAY'
                  : `COLLEGE WORKING HOURS: ${collegeWorkingHours}`}
              </span>
            </span>

            {!isOffCampusDay && (
              <button
                onClick={() => {
                  setManualHoursInput(collegeWorkingHours);
                  setShowHoursEdit(true);
                }}
                className="glass-pill"
                style={{
                  padding: '4px 10px',
                  fontSize: '0.76rem',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  cursor: 'pointer'
                }}
              >
                <Edit3 size={12} />
                <span>Adjust Hours</span>
              </button>
            )}
          </div>

          <h3 className="font-tech" style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0F172A', marginBottom: 6 }}>
            {selectedDay === 'Mon'
              ? '⚡ Monday Routine: 5-Hour Capgemini Online Training + Evening Study'
              : selectedDay === 'Tue'
              ? '🌴 Tuesday Routine: Full-Day Self-Study Sprint (DSA + ML)'
              : `College Day Routine (${collegeWorkingHours}) + 2h DSA & 2h ML Study Blocks`}
          </h3>

          <p style={{ color: '#475569', fontSize: '0.92rem', lineHeight: 1.5, margin: 0 }}>
            {selectedDay === 'Mon'
              ? 'Monday features your official 5-hour Capgemini online training from 10:00 AM to 03:00 PM, followed by evening 2.5-hour DSA problem-solving and 2-hour Machine Learning blocks.'
              : selectedDay === 'Tue'
              ? 'Tuesday is dedicated to full-day engineering mastery with 3 hours of DSA deep practice, 3 hours of Machine Learning architecture, and core computer science.'
              : `Structured around your official college schedule (${collegeWorkingHours}), reserving dedicated evening blocks for LeetCode problem solving and Machine Learning.`}
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button
            onClick={() => handleRegenerateGraphic(true)}
            style={{
              padding: '10px 22px',
              fontSize: '0.88rem',
              fontWeight: 700,
              fontFamily: 'var(--font-tech)',
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              cursor: 'pointer',
              borderRadius: 'var(--radius-pill)',
              border: justUpdatedGraphic ? '1.5px solid #10B981' : '1.5px solid rgba(99, 102, 241, 0.35)',
              background: justUpdatedGraphic
                ? 'linear-gradient(135deg, #059669 0%, #10B981 100%)'
                : 'linear-gradient(135deg, rgba(99, 102, 241, 0.12) 0%, rgba(139, 92, 246, 0.16) 100%)',
              color: justUpdatedGraphic ? '#FFFFFF' : '#4338CA',
              transition: 'all 0.25s ease',
              boxShadow: justUpdatedGraphic ? '0 8px 24px rgba(16, 185, 129, 0.35)' : '0 4px 14px rgba(99, 102, 241, 0.15)'
            }}
          >
            <img
              src="/icons/TIME TABLE.gif"
              alt="Timetable"
              style={{
                width: 22,
                height: 22,
                objectFit: 'contain',
                filter: justUpdatedGraphic ? 'brightness(1.5)' : 'drop-shadow(0 2px 4px rgba(99, 102, 241, 0.3))'
              }}
            />
            <span>{justUpdatedGraphic ? '✓ Graphic Updated & Ready!' : 'Update Timetable Graphic'}</span>
          </button>
        </div>
      </GlassCard>

      {/* Inline Hours Editor */}
      {showHoursEdit && (
        <GlassCard style={{ padding: '20px 24px', border: '1.5px solid #0284C7' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <h4 style={{ fontSize: '1rem', fontWeight: 800 }}>Specify College Working Hours</h4>
            <button
              onClick={() => setShowHoursEdit(false)}
              style={{ background: 'none', border: 'none', cursor: 'pointer' }}
            >
              <X size={18} />
            </button>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: 14 }}>
            Enter your college timing (e.g., <code>09:00 AM - 04:00 PM</code>). Study sessions will calibrate around these hours.
          </p>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <input
              type="text"
              value={manualHoursInput}
              onChange={e => setManualHoursInput(e.target.value)}
              placeholder="e.g. 09:00 AM - 04:00 PM"
              style={{
                flex: 1,
                minWidth: '240px',
                padding: '10px 16px',
                borderRadius: 'var(--radius-pill)',
                border: '1.5px solid rgba(0,0,0,0.15)',
                outline: 'none',
                fontFamily: 'inherit',
                fontSize: '0.92rem'
              }}
            />
            <button
              onClick={handleSaveWorkingHours}
              className="charcoal-pill-btn"
              style={{ padding: '10px 22px', fontSize: '0.88rem' }}
            >
              <Check size={16} />
              <span>Apply Hours</span>
            </button>
          </div>
        </GlassCard>
      )}

      {/* 3. Day Selector Pills (Mon - Sun) */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, overflowX: 'auto', padding: '4px 0' }}>
        {days.map(day => {
          const isSelected = selectedDay === day;
          const isMonday = day === 'Mon';
          const isTuesday = day === 'Tue';

          let dayFullName = 'Monday';
          if (day === 'Tue') dayFullName = 'Tuesday';
          else if (day === 'Wed') dayFullName = 'Wednesday';
          else if (day === 'Thu') dayFullName = 'Thursday';
          else if (day === 'Fri') dayFullName = 'Friday';
          else if (day === 'Sat') dayFullName = 'Saturday';
          else if (day === 'Sun') dayFullName = 'Sunday';

          return (
            <button
              key={day}
              onClick={() => {
                setSelectedDay(day);
                setTimeout(() => handleRegenerateGraphic(false), 50);
              }}
              style={{
                padding: '10px 20px',
                borderRadius: 'var(--radius-pill)',
                border: isSelected ? '1.5px solid rgba(99, 102, 241, 0.4)' : '1px solid rgba(0, 0, 0, 0.06)',
                fontFamily: 'var(--font-tech)',
                fontWeight: 700,
                fontSize: '0.9rem',
                cursor: 'pointer',
                background: isSelected ? 'linear-gradient(135deg, #4338CA 0%, #6366F1 100%)' : 'rgba(255, 255, 255, 0.85)',
                color: isSelected ? '#FFFFFF' : 'var(--text-secondary)',
                boxShadow: isSelected ? '0 6px 20px rgba(79, 70, 229, 0.35)' : '0 2px 6px rgba(0, 0, 0, 0.03)',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                transition: 'all 0.2s ease',
                flexShrink: 0
              }}
            >
              <span>{dayFullName}</span>
              {isMonday ? (
                <span
                  style={{
                    fontSize: '0.68rem',
                    padding: '2px 7px',
                    borderRadius: '8px',
                    background: isSelected ? 'rgba(255,255,255,0.25)' : 'rgba(217, 119, 6, 0.15)',
                    color: isSelected ? '#FEF08A' : '#D97706',
                    fontWeight: 800
                  }}
                >
                  Capgemini 5h
                </span>
              ) : isTuesday ? (
                <span
                  style={{
                    fontSize: '0.68rem',
                    padding: '2px 7px',
                    borderRadius: '8px',
                    background: isSelected ? 'rgba(255,255,255,0.25)' : 'rgba(16, 185, 129, 0.15)',
                    color: isSelected ? '#A7F3D0' : '#059669',
                    fontWeight: 800
                  }}
                >
                  Off-Campus
                </span>
              ) : (
                <span
                  style={{
                    fontSize: '0.68rem',
                    padding: '2px 7px',
                    borderRadius: '8px',
                    background: isSelected ? 'rgba(255,255,255,0.2)' : 'rgba(2, 132, 199, 0.12)',
                    color: isSelected ? '#BAE6FD' : '#0284C7',
                    fontWeight: 700
                  }}
                >
                  College Day
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* 4. Complete Full Day Timetable Routine */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h3 className="font-tech" style={{ fontSize: '1.35rem', fontWeight: 800 }}>
              {selectedDay === 'Mon'
                ? `Monday Schedule (Capgemini 5h Online Training + Evening Study)`
                : selectedDay === 'Tue'
                ? `Tuesday Schedule (Off-Campus Full-Day Intensive Sprint)`
                : `Schedule for ${selectedDay} (College Working Hours + Evening Study)`}
            </h3>
            <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', margin: 0 }}>
              Precision Timetable • Includes minimum 2h DSA block, 2h ML study block & structured rest intervals
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
              Completed: {Object.values(completedSlots).filter(Boolean).length} / {currentSlots.length}
            </span>
          </div>
        </div>

        {/* Schedule List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {currentSlots.map((slot, index) => {
            const isCollege = slot.subject === 'College Lectures' || slot.type === 'College Working Hours';
            const isCapgemini = slot.subject.includes('Capgemini') || slot.type === 'Online Training';
            const isDsa = slot.subject === 'DSA';
            const isMl = slot.subject === 'Machine Learning';
            const isBreak = slot.subject === 'Break' || slot.type === 'Rest';
            const isDone = completedSlots[slot.id || String(index)];

            let borderTheme = '#0284C7';
            let badgeBg = 'rgba(2, 132, 199, 0.12)';
            let badgeColor = '#0284C7';
            let icon = <Clock size={16} />;

            if (isCapgemini) {
              borderTheme = '#D97706';
              badgeBg = 'rgba(217, 119, 6, 0.15)';
              badgeColor = '#B45309';
              icon = <Laptop size={16} />;
            } else if (isCollege) {
              borderTheme = '#4F46E5';
              badgeBg = 'rgba(79, 70, 229, 0.15)';
              badgeColor = '#4338CA';
              icon = <Building2 size={16} />;
            } else if (isDsa) {
              borderTheme = '#10B981';
              badgeBg = 'rgba(16, 185, 129, 0.15)';
              badgeColor = '#047857';
              icon = <Code2 size={16} />;
            } else if (isMl) {
              borderTheme = '#8B5CF6';
              badgeBg = 'rgba(139, 92, 246, 0.15)';
              badgeColor = '#7C3AED';
              icon = <BookOpen size={16} />;
            } else if (isBreak) {
              borderTheme = '#94A3B8';
              badgeBg = 'rgba(148, 163, 184, 0.15)';
              badgeColor = '#475569';
              icon = <Coffee size={16} />;
            }

            return (
              <GlassCard
                key={slot.id || index}
                style={{
                  padding: '22px 26px',
                  borderLeft: `5px solid ${borderTheme}`,
                  opacity: isDone ? 0.7 : 1,
                  transition: 'all 0.2s ease',
                  background: isDone ? 'rgba(248, 250, 252, 0.75)' : 'rgba(255, 255, 255, 0.88)'
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: 16
                  }}
                >
                  {/* Left: Checkbox, Details, Time */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16, flex: 1, minWidth: '260px' }}>
                    <button
                      onClick={() => toggleSlotDone(slot.id || String(index))}
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        padding: 4,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      {isDone ? (
                        <CheckCircle2 size={24} color="#10B981" />
                      ) : (
                        <Circle size={24} color="#94A3B8" />
                      )}
                    </button>

                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4, flexWrap: 'wrap' }}>
                        <span
                          style={{
                            fontSize: '0.76rem',
                            fontWeight: 800,
                            padding: '3px 10px',
                            borderRadius: 'var(--radius-pill)',
                            background: badgeBg,
                            color: badgeColor,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 5
                          }}
                        >
                          {icon}
                          <span>{slot.subject}</span>
                        </span>

                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.84rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
                          <Clock size={14} />
                          <span>{slot.time}</span>
                        </div>

                        {slot.type && (
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            • {slot.type}
                          </span>
                        )}
                      </div>

                      <h4
                        className="font-tech"
                        style={{
                          fontSize: '1.15rem',
                          fontWeight: 800,
                          color: isDone ? 'var(--text-muted)' : '#0F172A',
                          textDecoration: isDone ? 'line-through' : 'none',
                          margin: 0
                        }}
                      >
                        {slot.topic}
                      </h4>
                    </div>
                  </div>

                  {/* Right: Quick Launch Timer or Action */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    {isDsa && (
                      <button
                        onClick={() => handleQuickStartTimer('DSA', 120)}
                        className="glass-pill"
                        style={{
                          padding: '8px 16px',
                          fontSize: '0.82rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 6,
                          background: 'rgba(16, 185, 129, 0.1)',
                          color: '#047857',
                          border: '1px solid rgba(16, 185, 129, 0.3)'
                        }}
                      >
                        <Play size={14} />
                        <span>Start 2h DSA Timer</span>
                      </button>
                    )}

                    {isMl && (
                      <button
                        onClick={() => handleQuickStartTimer('Machine Learning', 120)}
                        className="glass-pill"
                        style={{
                          padding: '8px 16px',
                          fontSize: '0.82rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 6,
                          background: 'rgba(139, 92, 246, 0.1)',
                          color: '#7C3AED',
                          border: '1px solid rgba(139, 92, 246, 0.3)'
                        }}
                      >
                        <Play size={14} />
                        <span>Start 2h ML Timer</span>
                      </button>
                    )}

                    {isCapgemini && (
                      <span
                        style={{
                          fontSize: '0.78rem',
                          fontWeight: 700,
                          color: '#B45309',
                          background: 'rgba(217, 119, 6, 0.15)',
                          padding: '6px 14px',
                          borderRadius: 'var(--radius-pill)',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 6
                        }}
                      >
                        <Laptop size={14} />
                        <span>5-Hour Mandatory Online Class</span>
                      </span>
                    )}

                    {isCollege && (
                      <span
                        style={{
                          fontSize: '0.78rem',
                          fontWeight: 700,
                          color: '#4338CA',
                          background: 'rgba(79, 70, 229, 0.12)',
                          padding: '6px 14px',
                          borderRadius: 'var(--radius-pill)'
                        }}
                      >
                        College Working Hours
                      </span>
                    )}
                  </div>
                </div>
              </GlassCard>
            );
          })}
        </div>
      </div>

      {/* 5. Timetable Image Modal (Showing ONLY Time and What to do, strictly NO day) */}
      {showImageModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 200,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(15, 23, 42, 0.75)',
            backdropFilter: 'blur(12px)',
            padding: 24
          }}
        >
          <div
            className="glass-card mobile-full-modal"
            style={{
              maxWidth: '960px',
              width: '100%',
              maxHeight: '92vh',
              overflowY: 'auto',
              background: '#FFFFFF',
              borderRadius: '28px',
              padding: '24px',
              position: 'relative'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18, flexWrap: 'wrap', gap: 12 }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <span
                    style={{
                      fontSize: '0.72rem',
                      fontWeight: 800,
                      color: '#0284C7',
                      background: 'rgba(2, 132, 199, 0.12)',
                      padding: '2px 8px',
                      borderRadius: 'var(--radius-pill)'
                    }}
                  >
                    TIME & ACTIVITY GRAPHIC
                  </span>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    Saved automatically in View Timetable (Displays strictly Time & What to do)
                  </span>
                </div>
                <h3 className="font-tech" style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                  Time & Activity Master Blueprint
                </h3>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <button
                  onClick={handleDownloadTimetable}
                  className="charcoal-pill-btn"
                  style={{ padding: '8px 16px', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: 6 }}
                >
                  <Upload size={14} style={{ transform: 'rotate(180deg)' }} />
                  <span>Download PNG</span>
                </button>
                <button
                  onClick={() => handleRegenerateGraphic(false)}
                  className="glass-pill"
                  style={{ padding: '8px 16px', fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer' }}
                >
                  <span>Regenerate Graphic</span>
                </button>
                <button
                  onClick={() => setShowImageModal(false)}
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: '50%',
                    border: 'none',
                    background: 'rgba(0,0,0,0.06)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            <div style={{ textAlign: 'center', borderRadius: '18px', overflow: 'hidden', border: '1px solid rgba(0,0,0,0.08)', background: '#F8FAFC', padding: 8 }}>
              <img
                src={timetableImageUrl || drawTimetableImage(currentSlots)}
                alt="Time and Activity Timetable"
                style={{ width: '100%', height: 'auto', maxHeight: '68vh', objectFit: 'contain', borderRadius: '12px' }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
