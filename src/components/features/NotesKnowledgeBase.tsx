import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useStudentOs } from '../../context/StudentOsContext';
import { GlassCard } from '../common/GlassCard';
import { PdfQuestionSheet, PdfQuestionItem } from '../../types/studentOs';
import { getPdfFromIndexedDb, dataUrlToBlobUrl } from '../../services/pdfStorage';
import {
  BookOpen,
  Plus,
  Trash2,
  Search,
  FileText,
  CheckSquare,
  Square,
  Eye,
  Upload,
  Sparkles,
  CheckCircle2,
  Printer,
  Download,
  X,
  FileCode,
  Layers,
  HelpCircle,
  Maximize2,
  Minimize2,
  Camera,
  Image as ImageIcon,
  ShieldAlert
} from 'lucide-react';

export const NotesKnowledgeBase: React.FC = () => {
  const {
    profile,
    notes,
    addNote,
    deleteNote,
    pdfQuestionSheets,
    addPdfQuestionSheet,
    togglePdfQuestion,
    generateCodingSheetByAi,
    addQuestionFromScreenshot,
    isAiThinking
  } = useStudentOs();

  const [activeTab, setActiveTab] = useState<'notes' | 'sheets'>('notes');
  const [selectedSubject, setSelectedSubject] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState<string>('LeetCode');

  // Fullscreen PDF Preview Modal State (Default to Fullscreen as requested)
  const [isFullscreen, setIsFullscreen] = useState<boolean>(true);
  const [previewNote, setPreviewNote] = useState<{
    title: string;
    content: string;
    subject: string;
    createdAt: string;
    pdfUrl?: string;
    fileName?: string;
    fileSize?: string;
    uploadedBy?: string;
  } | null>(null);
  const [isUploadingPdf, setIsUploadingPdf] = useState<boolean>(false);

  // Solved Question Screenshot Modal State
  const [showScreenshotModal, setShowScreenshotModal] = useState<boolean>(false);
  const [screenshotFile, setScreenshotFile] = useState<File | null>(null);
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null);
  const [manualQuestionTitle, setManualQuestionTitle] = useState<string>('');
  const [isScanningScreenshot, setIsScanningScreenshot] = useState<boolean>(false);
  const [viewScreenshotUrl, setViewScreenshotUrl] = useState<string | null>(null);

  // AI Prompt Modal
  const [showAiSheetModal, setShowAiSheetModal] = useState(false);
  const [aiTopic, setAiTopic] = useState('');

  const subjects = ['All', 'DSA', 'Machine Learning', 'Operating Systems', 'DBMS', 'System Design'];

  const filteredNotes = notes.filter(n => {
    const title = (n.title || '').toLowerCase();
    const content = (n.content || '').toLowerCase();
    const q = searchQuery.toLowerCase();
    const matchesSearch = title.includes(q) || content.includes(q);
    const tags = Array.isArray(n.tags) ? n.tags : [];
    const matchesSubject = selectedSubject === 'All' || tags.includes(selectedSubject);
    return matchesSearch && matchesSubject;
  });

  const handlePdfNoteUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingPdf(true);
    const cleanTitle = file.name.replace(/\.[^/.]+$/, '');
    const subjectTag = selectedSubject === 'All' ? 'DSA' : selectedSubject;
    const sizeStr = file.size > 1024 * 1024 
      ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
      : `${(file.size / 1024).toFixed(1)} KB`;

    const reader = new FileReader();
    reader.onerror = (err) => {
      console.error('[Note PDF File Read Error]', err);
      setIsUploadingPdf(false);
    };
    reader.onload = async (event) => {
      const dataUrl = event.target?.result as string;
      try {
        await addNote({
          title: cleanTitle,
          content: `Uploaded PDF document: ${file.name}`,
          tags: [subjectTag],
          pdfUrl: dataUrl,
          fileName: file.name,
          fileSize: sizeStr,
          pdfFile: file
        });
      } catch (err) {
        console.error('[Note Upload Failed]', err);
      } finally {
        setIsUploadingPdf(false);
      }
      setActiveTab('notes');
      setSelectedSubject('All');
    };
    try {
      reader.readAsDataURL(file);
    } catch (err) {
      console.error('[FileReader Init Error]', err);
      setIsUploadingPdf(false);
    }
    e.target.value = '';
  };

  const handlePreviewNote = async (n: any) => {
    let rawPdfUrl = n.pdfUrl;
    // If it's a cloud storage URL (http/https), we use it directly.
    // Otherwise, try to fetch from local IndexedDB if missing or data URL
    if (!rawPdfUrl && (n.hasPdf || n.fileName?.toLowerCase().endsWith('.pdf'))) {
      const dbData = await getPdfFromIndexedDb(n.id);
      if (dbData?.pdfDataUrl) {
        rawPdfUrl = dbData.pdfDataUrl;
      }
    }
    const resolvedUrl = rawPdfUrl?.startsWith('data:') ? dataUrlToBlobUrl(rawPdfUrl) : rawPdfUrl;
    setPreviewNote({
      title: n.title,
      content: n.content,
      subject: (n.tags && n.tags[0]) || 'General',
      createdAt: n.createdAt,
      pdfUrl: resolvedUrl || rawPdfUrl,
      fileName: n.fileName,
      fileSize: n.fileSize,
      uploadedBy: n.uploadedBy || (n.owner?.toLowerCase() === 'ayush' ? 'Ayush' : 'Diwakar')
    });
  };

  // Screenshot Selection Handler
  const handleScreenshotChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setScreenshotFile(file);
      const reader = new FileReader();
      reader.onerror = (err) => {
        console.error('[Screenshot File Read Error]', err);
      };
      reader.onload = () => {
        setScreenshotPreview(reader.result as string);
      };
      try {
        reader.readAsDataURL(file);
      } catch (err) {
        console.error('[Screenshot Reader Init Error]', err);
      }
    }
  };

  const handleSubmitScreenshot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!screenshotFile) return;

    setIsScanningScreenshot(true);
    try {
      await addQuestionFromScreenshot(screenshotFile, selectedPlatform, manualQuestionTitle.trim() || undefined);
      setScreenshotFile(null);
      setScreenshotPreview(null);
      setManualQuestionTitle('');
      setShowScreenshotModal(false);
      setActiveTab('sheets');
    } catch (err) {
      console.error('[Screenshot Add Error]', err);
    } finally {
      setIsScanningScreenshot(false);
    }
  };

  const handleGenerateAiSheet = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiTopic.trim()) return;
    await generateCodingSheetByAi(aiTopic.trim());
    setAiTopic('');
    setShowAiSheetModal(false);
    setActiveTab('sheets');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, paddingBottom: 100 }}>
      {/* 1. Header with Title & Action Buttons */}
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
                color: '#6366F1',
                background: 'rgba(99, 102, 241, 0.12)',
                padding: '3px 10px',
                borderRadius: 'var(--radius-pill)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6
              }}
            >
              <BookOpen size={14} />
              <span>KNOWLEDGE REPOSITORY & SOLVED QUESTION CHECKLIST</span>
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 4 }}>
            <img src="/icons/NOTES.gif" alt="Notes" style={{ width: 38, height: 38, objectFit: 'contain' }} />
            <h2
              className="font-tech"
              style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}
            >
              Notes & Question Sheets
            </h2>
          </div>
        </div>

        {/* Action Buttons: Upload PDF Note, Upload Question Screenshot, AI Generate, New Note */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          {/* Upload PDF Note Button */}
          <label
            className="glass-pill"
            style={{
              padding: '10px 18px',
              fontSize: '0.86rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              cursor: isUploadingPdf ? 'not-allowed' : 'pointer',
              border: '1.5px solid rgba(2, 132, 199, 0.35)',
              background: 'rgba(255, 255, 255, 0.85)',
              opacity: isUploadingPdf ? 0.7 : 1
            }}
          >
            <Upload size={16} color="#0284C7" />
            <span>{isUploadingPdf ? 'Uploading to Cloud...' : 'Upload PDF Note'}</span>
            <input
              type="file"
              accept=".pdf"
              disabled={isUploadingPdf}
              style={{ display: 'none' }}
              onChange={handlePdfNoteUpload}
            />
          </label>

          {/* Upload Solved Question Screenshot Button */}
          <button
            onClick={() => setShowScreenshotModal(true)}
            className="glass-pill"
            style={{
              padding: '10px 18px',
              fontSize: '0.86rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              cursor: 'pointer',
              background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(6, 182, 212, 0.15) 100%)',
              color: '#047857',
              border: '1.5px solid rgba(16, 185, 129, 0.35)'
            }}
          >
            <Camera size={16} />
            <span>Upload Solved Screenshot</span>
          </button>

          {/* AI Generate Sheet Button */}
          <button
            onClick={() => setShowAiSheetModal(true)}
            className="glass-pill"
            style={{
              padding: '10px 18px',
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
            <Sparkles size={16} />
            <span>AI Generate Coding Checklist</span>
          </button>
        </div>
      </div>

      {/* Main Tabs: Notes (Fullscreen PDF preview) vs Coding Question Checklists */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
        <div
          style={{
            display: 'inline-flex',
            padding: 4,
            borderRadius: 'var(--radius-pill)',
            background: 'rgba(240, 243, 246, 0.85)',
            border: '1px solid rgba(255, 255, 255, 0.8)'
          }}
        >
          <button
            onClick={() => setActiveTab('notes')}
            style={{
              padding: '8px 24px',
              borderRadius: 'var(--radius-pill)',
              border: 'none',
              fontFamily: 'var(--font-tech)',
              fontWeight: 700,
              fontSize: '0.88rem',
              cursor: 'pointer',
              background: activeTab === 'notes' ? 'var(--charcoal-pill)' : 'transparent',
              color: activeTab === 'notes' ? '#FFFFFF' : 'var(--text-secondary)',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              gap: 8
            }}
          >
            <FileText size={16} />
            <span>Study Notes ({notes.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('sheets')}
            style={{
              padding: '8px 24px',
              borderRadius: 'var(--radius-pill)',
              border: 'none',
              fontFamily: 'var(--font-tech)',
              fontWeight: 700,
              fontSize: '0.88rem',
              cursor: 'pointer',
              background: activeTab === 'sheets' ? 'var(--charcoal-pill)' : 'transparent',
              color: activeTab === 'sheets' ? '#FFFFFF' : 'var(--text-secondary)',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              gap: 8
            }}
          >
            <CheckSquare size={16} />
            <span>Coding Question Checklists ({pdfQuestionSheets.length})</span>
          </button>
        </div>

        {/* Subject Filter Pills - ONLY shown for Study Notes tab, removed for Coding Questions */}
        {activeTab === 'notes' && (
          <div style={{ display: 'flex', gap: 8, overflowX: 'auto' }}>
            {subjects.map(s => {
              const isSelected = selectedSubject === s;
              return (
                <button
                  key={s}
                  onClick={() => setSelectedSubject(s)}
                  style={{
                    padding: '6px 14px',
                    borderRadius: 'var(--radius-pill)',
                    border: 'none',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    background: isSelected ? 'var(--charcoal-pill)' : 'rgba(255, 255, 255, 0.7)',
                    color: isSelected ? '#FFFFFF' : 'var(--text-secondary)'
                  }}
                >
                  {s}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Search Input */}
      <div style={{ position: 'relative', maxWidth: '420px' }}>
        <Search size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
        <input
          type="text"
          placeholder={activeTab === 'notes' ? "Search notes or tags..." : "Search coding checklist..."}
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          style={{
            width: '100%',
            padding: '10px 14px 10px 38px',
            borderRadius: 'var(--radius-pill)',
            border: '1px solid rgba(0,0,0,0.1)',
            background: 'rgba(255,255,255,0.85)',
            fontSize: '0.88rem',
            outline: 'none'
          }}
        />
      </div>

      {/* Tab 1: Notes (With Fullscreen PDF Preview Mode) */}
      {activeTab === 'notes' && (
        filteredNotes.length === 0 ? (
          <GlassCard
            style={{
              padding: '48px 24px',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 16,
              background: 'rgba(255, 255, 255, 0.85)',
              border: '1.5px dashed rgba(99, 102, 241, 0.35)',
              borderRadius: '24px'
            }}
          >
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: '50%',
                background: 'rgba(99, 102, 241, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#4F46E5'
              }}
            >
              <FileText size={32} />
            </div>
            <div>
              <h3 className="font-tech" style={{ fontSize: '1.35rem', fontWeight: 800, color: '#18181B', marginBottom: 6 }}>
                No Notes Found
              </h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', maxWidth: '460px', margin: 0 }}>
                Upload your course PDF or subject document using <strong>"Upload PDF Note"</strong> above to view and read it here in fullscreen!
              </p>
            </div>
            <label
              className="charcoal-pill-btn"
              style={{
                padding: '10px 24px',
                fontSize: '0.88rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                cursor: isUploadingPdf ? 'not-allowed' : 'pointer',
                opacity: isUploadingPdf ? 0.7 : 1
              }}
            >
              <Upload size={16} />
              <span>{isUploadingPdf ? 'Uploading to Cloud...' : 'Upload PDF Note Now'}</span>
              <input
                type="file"
                accept=".pdf"
                disabled={isUploadingPdf}
                style={{ display: 'none' }}
                onChange={handlePdfNoteUpload}
              />
            </label>
          </GlassCard>
        ) : (
          <div className="responsive-grid-cards" style={{ gap: 18 }}>
            {filteredNotes.map(n => (
              <GlassCard
                key={n.id}
                style={{
                  padding: '24px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  minHeight: '220px'
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                      <span
                        style={{
                          fontSize: '0.74rem',
                          fontWeight: 700,
                          padding: '3px 10px',
                          borderRadius: 'var(--radius-pill)',
                          background: 'rgba(99, 102, 241, 0.12)',
                          color: '#4F46E5'
                        }}
                      >
                        {(n.tags && n.tags[0]) || 'General'}
                      </span>
                      {/* Author Attribution Badge */}
                      <span
                        style={{
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          padding: '3px 9px',
                          borderRadius: 'var(--radius-pill)',
                          background: (n.uploadedBy?.toLowerCase() === 'ayush' || (n as any).owner?.toLowerCase() === 'ayush')
                            ? 'rgba(59, 130, 246, 0.14)'
                            : 'rgba(16, 185, 129, 0.14)',
                          color: (n.uploadedBy?.toLowerCase() === 'ayush' || (n as any).owner?.toLowerCase() === 'ayush')
                            ? '#2563EB'
                            : '#059669',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 4
                        }}
                      >
                        Uploaded by {n.uploadedBy || ((n as any).owner?.toLowerCase() === 'ayush' ? 'Ayush' : 'Diwakar')}
                      </span>
                      {(n.pdfUrl || n.hasPdf || n.fileName?.toLowerCase().endsWith('.pdf')) && (
                        <span
                          style={{
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            padding: '2px 8px',
                            borderRadius: 'var(--radius-pill)',
                            background: 'rgba(239, 68, 68, 0.12)',
                            color: '#DC2626',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 4
                          }}
                        >
                          <FileText size={12} />
                          <span>PDF Document ({n.fileSize || 'PDF'})</span>
                        </span>
                      )}
                      {n.pdfUrl?.startsWith('http') && (
                        <span
                          style={{
                            fontSize: '0.70rem',
                            fontWeight: 600,
                            padding: '2px 7px',
                            borderRadius: 'var(--radius-pill)',
                            background: 'rgba(99, 102, 241, 0.1)',
                            color: '#4F46E5',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 3
                          }}
                        >
                          Cloud Synced
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => deleteNote(n.id)}
                      style={{
                        border: 'none',
                        background: 'transparent',
                        color: 'var(--text-muted)',
                        cursor: 'pointer',
                        padding: 4
                      }}
                      title="Delete Note"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  <h4 className="font-tech" style={{ fontSize: '1.2rem', fontWeight: 800, color: '#18181B', marginBottom: 8 }}>
                    {n.title}
                  </h4>

                  <p
                    style={{
                      fontSize: '0.85rem',
                      color: 'var(--text-secondary)',
                      lineHeight: 1.5,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: 'vertical'
                    }}
                  >
                    {n.content}
                  </p>
                </div>

                {/* Action: Open in Fullscreen PDF Form */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 18, paddingTop: 12, borderTop: '1px solid rgba(0,0,0,0.06)' }}>
                  <span style={{ fontSize: '0.76rem', color: 'var(--text-light)' }}>
                    {n.createdAt || 'Saved in Knowledge Base'}
                  </span>

                  <button
                    onClick={() => handlePreviewNote(n)}
                    className="charcoal-pill-btn"
                    style={{ padding: '7px 16px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: 6 }}
                  >
                    <Eye size={14} />
                    <span>Preview PDF</span>
                  </button>
                </div>
              </GlassCard>
            ))}
          </div>
        )
      )}

      {/* Tab 2: Coding Question Checklists (Screenshot Upload & Real-Time AI Detection) */}
      {activeTab === 'sheets' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Top Card: Upload Solved Question Screenshot */}
          <GlassCard
            style={{
              padding: '22px 28px',
              background: 'linear-gradient(135deg, rgba(240, 253, 244, 0.9) 0%, rgba(236, 254, 255, 0.85) 100%)',
              border: '1.5px solid rgba(16, 185, 129, 0.35)',
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
                    fontSize: '0.74rem',
                    fontWeight: 800,
                    padding: '3px 10px',
                    borderRadius: 'var(--radius-pill)',
                    background: 'rgba(16, 185, 129, 0.2)',
                    color: '#047857',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6
                  }}
                >
                  <Camera size={14} />
                  <span>INSTANT VISION CHECKLIST LOG</span>
                </span>
              </div>
              <h3 className="font-tech" style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0F172A', margin: '4px 0' }}>
                Solved a Problem? Upload its Screenshot
              </h3>
              <p style={{ color: '#475569', fontSize: '0.88rem', margin: 0, lineHeight: 1.4 }}>
                Upload a screenshot of your solved problem (LeetCode, HackerRank, College Question Bank). FUSE AI Vision automatically detects the title & topic, and adds it to your checklist.
              </p>
            </div>

            <button
              onClick={() => setShowScreenshotModal(true)}
              className="charcoal-pill-btn"
              style={{
                padding: '11px 22px',
                fontSize: '0.88rem',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                background: 'linear-gradient(135deg, #059669 0%, #0284C7 100%)',
                boxShadow: '0 4px 14px rgba(5, 150, 105, 0.25)'
              }}
            >
              <Camera size={16} />
              <span>Upload Question Screenshot</span>
            </button>
          </GlassCard>

          {/* Unified Master Coding Checklist (One Single Consolidated Section) */}
          {(() => {
            const seen = new Set<string>();
            const unifiedList: typeof pdfQuestionSheets[0]['questions'] = [];
            pdfQuestionSheets.forEach(s => {
              (s.questions || []).forEach(q => {
                const key = (q.title || '').trim().toLowerCase();
                if (!seen.has(key)) {
                  seen.add(key);
                  unifiedList.push(q);
                }
              });
            });

            const completedCount = unifiedList.filter(q => q.completed).length;
            const progressPct = unifiedList.length > 0 ? Math.round((completedCount / unifiedList.length) * 100) : 0;
            const masterSheetId = pdfQuestionSheets[0]?.id || 'sheet_unified_master';

            return (
              <GlassCard style={{ padding: '26px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <span
                        style={{
                          fontSize: '0.74rem',
                          fontWeight: 700,
                          padding: '3px 10px',
                          borderRadius: 'var(--radius-pill)',
                          background: 'rgba(79, 70, 229, 0.12)',
                          color: '#4F46E5'
                        }}
                      >
                        DSA & Coding
                      </span>
                      <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                        Unified Interactive Coding Checklist
                      </span>
                    </div>

                    <h3 className="font-tech" style={{ fontSize: '1.4rem', fontWeight: 800, color: '#18181B' }}>
                      Master DSA & Coding Checklist (Verified Solutions)
                    </h3>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div className="font-tech" style={{ fontSize: '1.3rem', fontWeight: 800, color: progressPct === 100 ? '#15803D' : '#4F46E5' }}>
                      {completedCount} / {unifiedList.length} Solved ({progressPct}%)
                    </div>
                    {/* Progress Bar */}
                    <div
                      style={{
                        width: '180px',
                        height: '6px',
                        borderRadius: 'var(--radius-pill)',
                        background: 'rgba(0,0,0,0.08)',
                        marginTop: 6,
                        overflow: 'hidden'
                      }}
                    >
                      <div
                        style={{
                          width: `${progressPct}%`,
                          height: '100%',
                          background: progressPct === 100 ? '#22C55E' : '#4F46E5',
                          borderRadius: 'var(--radius-pill)',
                          transition: 'width 0.3s ease'
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Question Items Grid */}
                <div className="responsive-grid-cards" style={{ gap: 12, marginTop: 14 }}>
                  {unifiedList.map(q => (
                    <div
                      key={q.id}
                      onClick={() => togglePdfQuestion(masterSheetId, q.id, !q.completed)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '12px 16px',
                        borderRadius: '14px',
                        background: q.completed ? 'rgba(240, 253, 244, 0.85)' : 'rgba(255, 255, 255, 0.8)',
                        border: q.completed ? '1.5px solid #86EFAC' : '1px solid rgba(0,0,0,0.08)',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                        gap: 12
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 0 }}>
                        <div style={{ color: q.completed ? '#16A34A' : 'var(--text-muted)', flexShrink: 0 }}>
                          {q.completed ? <CheckSquare size={18} /> : <Square size={18} />}
                        </div>
                        <div style={{ minWidth: 0 }}>
                          <span
                            style={{
                              fontSize: '0.88rem',
                              fontWeight: q.completed ? 700 : 500,
                              color: q.completed ? '#15803D' : '#18181B',
                              textDecoration: q.completed ? 'line-through' : 'none',
                              display: 'block',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap'
                            }}
                          >
                            {q.title}
                          </span>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2, flexWrap: 'wrap' }}>
                            {q.topic && (
                              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                                {q.topic}
                              </span>
                            )}
                            {q.completed && (
                              <span
                                style={{
                                  fontSize: '0.68rem',
                                  fontWeight: 700,
                                  color: q.completedBy === 'Ayush' ? '#7C3AED' : '#059669',
                                  background: q.completedBy === 'Ayush' ? 'rgba(124, 58, 237, 0.12)' : 'rgba(16, 185, 129, 0.12)',
                                  padding: '1px 6px',
                                  borderRadius: '6px'
                                }}
                              >
                                ✓ Solved by {q.completedBy || profile.name} (+35 XP)
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                        {q.screenshotUrl && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setViewScreenshotUrl(q.screenshotUrl!);
                            }}
                            className="glass-pill"
                            style={{
                              padding: '4px 10px',
                              fontSize: '0.74rem',
                              fontWeight: 700,
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 4,
                              cursor: 'pointer',
                              background: 'rgba(2, 132, 199, 0.12)',
                              color: '#0284C7',
                              border: '1px solid rgba(2, 132, 199, 0.3)'
                            }}
                            title="Preview Genuine Code Screenshot"
                          >
                            <ImageIcon size={13} />
                            <span>Preview Proof</span>
                          </button>
                        )}

                        {q.platform && (
                          <span
                            style={{
                              fontSize: '0.68rem',
                              fontWeight: 700,
                              padding: '2px 7px',
                              borderRadius: '6px',
                              background: q.platform === 'LeetCode' ? '#FEF3C7' : q.platform === 'HackerRank' ? '#DCFCE7' : '#EEF2FF',
                              color: q.platform === 'LeetCode' ? '#B45309' : q.platform === 'HackerRank' ? '#15803D' : '#4F46E5'
                            }}
                          >
                            {q.platform}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </GlassCard>
            );
          })()}
        </div>
      )}

      {/* FULLSCREEN PDF DOCUMENT PREVIEW MODAL (Portaled to document.body above navbar & dock) */}
      {previewNote && typeof document !== 'undefined' && createPortal(
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 99999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(15, 23, 42, 0.9)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            padding: isFullscreen ? 0 : 16,
            transition: 'all 0.2s ease'
          }}
        >
          <div
            style={{
              width: isFullscreen ? '100vw' : '96vw',
              maxWidth: isFullscreen ? '100vw' : '96vw',
              height: isFullscreen ? '100vh' : '94vh',
              maxHeight: isFullscreen ? '100vh' : '94vh',
              display: 'flex',
              flexDirection: 'column',
              background: '#0F172A',
              borderRadius: isFullscreen ? 0 : '24px',
              overflow: 'hidden',
              boxShadow: '0 25px 60px -12px rgba(0, 0, 0, 0.6)',
              transition: 'all 0.2s ease'
            }}
          >
            {/* Top Toolbar */}
            <div
              style={{
                padding: '12px 24px',
                background: '#1E293B',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderBottom: '1px solid rgba(255,255,255,0.08)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                <FileText size={18} color="#38BDF8" />
                <span style={{ fontSize: '0.94rem', fontWeight: 700 }}>
                  {previewNote.title}.pdf (Document Viewer)
                </span>
                {previewNote.uploadedBy && (
                  <span style={{ fontSize: '0.74rem', color: '#38BDF8', background: 'rgba(56, 189, 248, 0.15)', padding: '2px 8px', borderRadius: '6px', fontWeight: 600 }}>
                    Uploaded by {previewNote.uploadedBy}
                  </span>
                )}
                {previewNote.fileSize && (
                  <span style={{ fontSize: '0.74rem', color: '#94A3B8', background: 'rgba(255,255,255,0.1)', padding: '2px 8px', borderRadius: '6px' }}>
                    {previewNote.fileSize}
                  </span>
                )}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                {previewNote.pdfUrl && (
                  <a
                    href={previewNote.pdfUrl}
                    download={previewNote.fileName || `${previewNote.title}.pdf`}
                    style={{
                      textDecoration: 'none',
                      background: '#0284C7',
                      color: '#FFFFFF',
                      padding: '7px 16px',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontSize: '0.82rem',
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6
                    }}
                  >
                    <Download size={15} />
                    <span>Download / Open PDF</span>
                  </a>
                )}
                <button
                  onClick={() => window.print()}
                  style={{
                    border: 'none',
                    background: 'rgba(255,255,255,0.1)',
                    color: '#FFFFFF',
                    padding: '7px 14px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '0.82rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6
                  }}
                >
                  <Printer size={15} />
                  <span>Print</span>
                </button>
                <button
                  onClick={() => setIsFullscreen(!isFullscreen)}
                  style={{
                    border: 'none',
                    background: 'rgba(255,255,255,0.1)',
                    color: '#FFFFFF',
                    padding: '7px 14px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '0.82rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6
                  }}
                >
                  {isFullscreen ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
                  <span>{isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}</span>
                </button>
                <button
                  onClick={() => {
                    setPreviewNote(null);
                    setIsFullscreen(false);
                  }}
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: '50%',
                    border: 'none',
                    background: 'rgba(255,255,255,0.15)',
                    color: '#FFFFFF',
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

            {/* Viewer Content: Truly Edge-to-Edge Embedded PDF Viewer */}
            {previewNote.pdfUrl ? (
              <div style={{ flex: 1, width: '100%', height: 'calc(100% - 60px)', background: '#1E293B', position: 'relative' }}>
                <object
                  data={previewNote.pdfUrl}
                  type="application/pdf"
                  style={{
                    width: '100%',
                    height: '100%',
                    border: 'none',
                    background: '#1E293B'
                  }}
                  title={previewNote.title}
                >
                  <embed
                    src={previewNote.pdfUrl}
                    type="application/pdf"
                    style={{ width: '100%', height: '100%' }}
                  />
                  <div
                    style={{
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: 30,
                      textAlign: 'center',
                      color: '#FFFFFF'
                    }}
                  >
                    <FileText size={56} color="#38BDF8" style={{ marginBottom: 16 }} />
                    <h4 className="font-tech" style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: 8 }}>
                      {previewNote.title}.pdf
                    </h4>
                    <p style={{ fontSize: '0.9rem', color: '#94A3B8', maxWidth: 460, margin: '0 auto 20px auto', lineHeight: 1.6 }}>
                      Document loaded successfully. On mobile or supported readers, click below to open or view in your device's PDF application.
                    </p>
                    <a
                      href={previewNote.pdfUrl}
                      download={previewNote.fileName || `${previewNote.title}.pdf`}
                      style={{
                        textDecoration: 'none',
                        background: '#0284C7',
                        color: '#FFFFFF',
                        padding: '12px 28px',
                        borderRadius: '12px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 8,
                        fontWeight: 700,
                        fontSize: '0.94rem'
                      }}
                    >
                      <Download size={18} />
                      <span>Open / Download PDF Document</span>
                    </a>
                  </div>
                </object>
              </div>
            ) : (
              <div
                style={{
                  flex: 1,
                  overflowY: 'auto',
                  padding: '36px 48px',
                  display: 'flex',
                  justifyContent: 'center',
                  background: '#F1F5F9'
                }}
              >
                <div
                  style={{
                    width: '100%',
                    maxWidth: '850px',
                    minHeight: '800px',
                    background: '#FFFFFF',
                    padding: '54px 48px',
                    boxShadow: '0 8px 30px rgba(0,0,0,0.15)',
                    borderRadius: '6px',
                    fontFamily: '"Georgia", "Times New Roman", serif',
                    color: '#1E293B',
                    lineHeight: 1.8,
                    position: 'relative'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #0F172A', paddingBottom: 14, marginBottom: 28 }}>
                    <div>
                      <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 800, color: '#475569' }}>
                        FUSION ACADEMIC DOSSIER • {previewNote.subject}
                      </span>
                      <h1 style={{ fontSize: '1.8rem', fontWeight: 800, margin: '8px 0 0 0', fontFamily: 'var(--font-tech)' }}>
                        {previewNote.title}
                      </h1>
                    </div>
                    <div style={{ textAlign: 'right', fontSize: '0.78rem', color: '#64748B' }}>
                      Date: {new Date().toLocaleDateString()}<br />
                      Page 1 of 1
                    </div>
                  </div>

                  <div style={{ fontSize: '1.05rem', whiteSpace: 'pre-wrap' }}>
                    {previewNote.content}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>,
        document.body
      )}

      {/* UPLOAD SOLVED QUESTION SCREENSHOT MODAL */}
      {showScreenshotModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 300,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(15, 23, 42, 0.7)',
            backdropFilter: 'blur(8px)',
            padding: 20
          }}
        >
          <div
            className="glass-card"
            style={{
              maxWidth: '540px',
              width: '100%',
              background: '#FFFFFF',
              borderRadius: '24px',
              padding: '30px'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Camera size={22} color="#059669" />
                <h3 className="font-tech" style={{ fontSize: '1.3rem', fontWeight: 800, margin: 0 }}>
                  Upload Solved Question Screenshot
                </h3>
              </div>
              <button
                onClick={() => {
                  setShowScreenshotModal(false);
                  setScreenshotFile(null);
                  setScreenshotPreview(null);
                }}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}
              >
                <X size={18} />
              </button>
            </div>

            <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: 18 }}>
              Upload your screenshot (LeetCode, HackerRank, College Assignment, Python Sheet). FUSE Vision will inspect the image, identify the question name & algorithm concept, and add it into your checklist.
            </p>

            {/* Genuine Code Verification Warning Banner */}
            <div
              style={{
                padding: '12px 14px',
                borderRadius: '14px',
                background: 'rgba(245, 158, 11, 0.12)',
                border: '1px solid rgba(245, 158, 11, 0.35)',
                fontSize: '0.82rem',
                color: '#B45309',
                lineHeight: 1.45,
                display: 'flex',
                gap: 10,
                alignItems: 'flex-start',
                marginBottom: 16
              }}
            >
              <ShieldAlert size={20} color="#D97706" style={{ flexShrink: 0, marginTop: 1 }} />
              <div>
                <strong style={{ display: 'block', color: '#92400E', marginBottom: 2 }}>
                  Genuine Code Submission Proof Required
                </strong>
                Please upload only genuine code editor or accepted verdict screenshots from your problem solving platform. Your study partner can preview this screenshot in real-time in the Partner Room to inspect and verify validity!
              </div>
            </div>

            <form onSubmit={handleSubmitScreenshot} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Platform Selector */}
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: 8, color: '#18181B' }}>
                  1. Where did you solve this problem? (Platform)
                </label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {['LeetCode', 'HackerRank', 'GeeksforGeeks', 'Codeforces', 'CodeChef', 'College Question Bank', 'InterviewBit', 'Other'].map(plat => (
                    <button
                      key={plat}
                      type="button"
                      onClick={() => setSelectedPlatform(plat)}
                      style={{
                        padding: '6px 14px',
                        borderRadius: 'var(--radius-pill)',
                        border: selectedPlatform === plat ? '1.5px solid #059669' : '1px solid rgba(0,0,0,0.1)',
                        background: selectedPlatform === plat ? 'rgba(5, 150, 105, 0.15)' : 'rgba(0,0,0,0.04)',
                        color: selectedPlatform === plat ? '#059669' : 'var(--text-secondary)',
                        fontSize: '0.8rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      {plat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Image selector */}
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: 8, color: '#18181B' }}>
                  2. Upload Genuine Code / Accepted Verdict Screenshot
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleScreenshotChange}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '12px',
                    border: '1.5px dashed rgba(5, 150, 105, 0.4)',
                    background: '#F0FDF4',
                    fontSize: '0.85rem'
                  }}
                  required
                />
              </div>

              {/* Image Preview */}
              {screenshotPreview && (
                <div style={{ textAlign: 'center', borderRadius: '12px', overflow: 'hidden', border: '1px solid rgba(0,0,0,0.1)', background: '#F8FAFC', maxHeight: '180px' }}>
                  <img src={screenshotPreview} alt="Screenshot Preview" style={{ width: '100%', height: '180px', objectFit: 'contain' }} />
                </div>
              )}

              {/* Optional Manual Question Name */}
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: 6, color: '#18181B' }}>
                  3. Question Name / Number (Optional — AI auto-detects from code screenshot)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Two Sum, Subarray Sum Equals K, Problem 4..."
                  value={manualQuestionTitle}
                  onChange={e => setManualQuestionTitle(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    borderRadius: '12px',
                    border: '1px solid rgba(0,0,0,0.15)',
                    fontSize: '0.92rem'
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: 10, marginTop: 6 }}>
                <button
                  type="button"
                  onClick={() => setShowScreenshotModal(false)}
                  className="glass-pill"
                  style={{ flex: 1, padding: '12px', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!screenshotFile || isScanningScreenshot}
                  className="charcoal-pill-btn"
                  style={{
                    flex: 1,
                    padding: '12px',
                    background: 'linear-gradient(135deg, #059669 0%, #0284C7 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8
                  }}
                >
                  {isScanningScreenshot ? (
                    <>
                      <Sparkles size={16} className="animate-spin" />
                      <span>FUSE Vision Scanning...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={16} />
                      <span>Verify Code & Add to Checklist (+35 XP)</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SCREENSHOT LIGHTBOX VIEW MODAL (WITH PARTNER VERIFICATION BADGE) */}
      {viewScreenshotUrl && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 350,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(15, 23, 42, 0.88)',
            backdropFilter: 'blur(12px)',
            padding: 24
          }}
          onClick={() => setViewScreenshotUrl(null)}
        >
          <div
            style={{
              maxWidth: '960px',
              width: '100%',
              background: '#FFFFFF',
              borderRadius: '24px',
              padding: '24px',
              position: 'relative',
              boxShadow: '0 25px 50px -12px rgba(0,0,0,0.35)'
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: '10px',
                    background: 'rgba(5, 150, 105, 0.12)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <ImageIcon size={20} color="#059669" />
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontWeight: 800, fontSize: '1.05rem', color: '#0F172A' }}>
                      Genuine Code Submission Proof
                    </span>
                    <span
                      style={{
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        padding: '2px 8px',
                        borderRadius: 'var(--radius-pill)',
                        background: 'rgba(16, 185, 129, 0.15)',
                        color: '#059669',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 4
                      }}
                    >
                      <CheckCircle2 size={12} />
                      <span>Authentic Submission Verdict</span>
                    </span>
                  </div>
                  <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                    Visible to both study partners for peer verification & validation
                  </span>
                </div>
              </div>
              <button
                onClick={() => setViewScreenshotUrl(null)}
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: '50%',
                  background: 'rgba(0,0,0,0.06)',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <X size={18} />
              </button>
            </div>
            <div
              style={{
                textAlign: 'center',
                borderRadius: '16px',
                overflow: 'hidden',
                background: '#F8FAFC',
                border: '1px solid rgba(0,0,0,0.08)',
                boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.04)'
              }}
            >
              <img
                src={viewScreenshotUrl}
                alt="Genuine Code Submission Proof"
                style={{ width: '100%', maxHeight: '76vh', objectFit: 'contain' }}
              />
            </div>
          </div>
        </div>
      )}

      {/* AI Generate Sheet Modal */}
      {showAiSheetModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 300,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(8px)',
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
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <Sparkles size={22} color="#6366F1" />
              <h3 className="font-tech" style={{ fontSize: '1.3rem', fontWeight: 800 }}>
                AI Generate Coding Checklist
              </h3>
            </div>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: 20 }}>
              Specify any DSA, Python, or engineering topic. FUSE AI will automatically generate a targeted 8-question checklist.
            </p>
            <form onSubmit={handleGenerateAiSheet} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: 6 }}>
                  Topic or Concept
                </label>
                <input
                  type="text"
                  placeholder="e.g. Dynamic Programming, Graph BFS/DFS, Python Fruit Ripeness..."
                  value={aiTopic}
                  onChange={e => setAiTopic(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    borderRadius: '12px',
                    border: '1px solid rgba(0,0,0,0.15)',
                    fontSize: '0.92rem'
                  }}
                  required
                />
              </div>

              <div style={{ display: 'flex', gap: 10, marginTop: 6 }}>
                <button
                  type="button"
                  onClick={() => setShowAiSheetModal(false)}
                  className="glass-pill"
                  style={{ flex: 1, padding: '12px', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isAiThinking}
                  className="charcoal-pill-btn"
                  style={{ flex: 1, padding: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
                >
                  {isAiThinking ? (
                    <>
                      <Sparkles size={16} className="animate-spin" />
                      <span>FUSE Generating...</span>
                    </>
                  ) : (
                    <span>Generate Checklist</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* AI Generate Sheet Modal ends */}
    </div>
  );
};
