import React, { useState, useRef, useEffect } from 'react';
import { useStudentOs } from '../../context/StudentOsContext';
import { Sparkles, Send, X, Bot, Trash2, KeyRound, Copy, Check, ShieldCheck, ExternalLink, Cpu, RefreshCw } from 'lucide-react';
import { GeminiService } from '../../services/gemini';
import katex from 'katex';

/**
 * Cleanly render LaTeX math formula using KaTeX, or human-readable fallback
 */
function renderMath(formula: string, isDisplay: boolean = false): React.ReactNode {
  const cleanFormula = formula.trim();
  try {
    const html = katex.renderToString(cleanFormula, {
      displayMode: isDisplay,
      throwOnError: false
    });
    return <span dangerouslySetInnerHTML={{ __html: html }} />;
  } catch {
    // Human-readable string fallback if KaTeX encounters malformed input
    const readable = cleanFormula
      .replace(/\\cdot/g, ' · ')
      .replace(/\\times/g, ' × ')
      .replace(/\\sqrt\{([^}]+)\}/g, '√($1)')
      .replace(/\\sum_\{([^}]+)\}\^\{([^}]+)\}/g, '∑($1 to $2)')
      .replace(/\\left\(/g, '(')
      .replace(/\\right\)/g, ')')
      .replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, '($1 / $2)');
    return <span style={{ fontStyle: 'italic', fontWeight: 600 }}>{readable}</span>;
  }
}

/**
 * Parses inline formatting: math ($...$), bold (**...**), inline code (`...`)
 * Strips raw # and $ so the user gets clean, elegant typography.
 */
function parseInline(str: string): React.ReactNode[] {
  // Regex splitting by math ($$...$$ or $...$), bold (**...**), and inline code (`...`)
  const parts = str.split(/(\$\$[\s\S]*?\$\$|\$[^$\n]+?\$|\*\*.*?\*\*|`.*?`)/g);

  return parts.map((chunk, i) => {
    if (!chunk) return null;

    // Display Math $$...$$
    if (chunk.startsWith('$$') && chunk.endsWith('$$') && chunk.length >= 4) {
      const formula = chunk.slice(2, -2);
      return (
        <div key={i} style={{ margin: '8px 0', overflowX: 'auto', textAlign: 'center' }}>
          {renderMath(formula, true)}
        </div>
      );
    }

    // Inline Math $...$
    if (chunk.startsWith('$') && chunk.endsWith('$') && chunk.length >= 2) {
      const formula = chunk.slice(1, -1);
      return <span key={i} style={{ padding: '0 2px' }}>{renderMath(formula, false)}</span>;
    }

    // Bold text **...**
    if (chunk.startsWith('**') && chunk.endsWith('**')) {
      return <strong key={i} style={{ fontWeight: 700, color: '#0F172A' }}>{chunk.slice(2, -2)}</strong>;
    }

    // Inline code `...`
    if (chunk.startsWith('`') && chunk.endsWith('`')) {
      return (
        <code
          key={i}
          style={{
            background: 'rgba(0,0,0,0.06)',
            padding: '2px 6px',
            borderRadius: 6,
            fontSize: '0.85em',
            fontFamily: 'monospace',
            color: '#0F172A'
          }}
        >
          {chunk.slice(1, -1)}
        </code>
      );
    }

    // Clean up any stray # characters in normal text
    const cleanText = chunk.replace(/(^|\s)#+\s*/g, '$1');
    return cleanText;
  });
}

const FormattedMessage: React.FC<{ text: string; isUser: boolean }> = ({ text, isUser }) => {
  if (isUser) {
    return <div>{text}</div>;
  }

  // Handle code blocks (```...```)
  const parts = text.split(/(```[\s\S]*?```)/g);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: '0.92rem', lineHeight: 1.65 }}>
      {parts.map((part, idx) => {
        if (part.startsWith('```')) {
          const match = part.match(/```(\w+)?\n?([\s\S]*?)```/);
          const lang = match ? match[1] : '';
          const code = match ? match[2] : part.slice(3, -3);

          return (
            <div
              key={idx}
              style={{
                background: '#0F172A',
                color: '#F8FAFC',
                borderRadius: '14px',
                padding: '14px 18px',
                margin: '8px 0',
                fontSize: '0.85rem',
                fontFamily: 'Consolas, Monaco, "Courier New", monospace',
                overflowX: 'auto',
                border: '1px solid rgba(255,255,255,0.12)'
              }}
            >
              {lang && (
                <div style={{ fontSize: '0.7rem', color: '#38BDF8', textTransform: 'uppercase', marginBottom: 6, fontWeight: 700 }}>
                  {lang}
                </div>
              )}
              <pre style={{ margin: 0, whiteSpace: 'pre', overflowX: 'auto' }}>
                <code>{code.trim()}</code>
              </pre>
            </div>
          );
        }

        const lines = part.split('\n');
        return (
          <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {lines.map((line, lineIdx) => {
              const trimmed = line.trim();
              if (!trimmed) return <div key={lineIdx} style={{ height: 4 }} />;

              // Clean Headings: Remove raw '#' and render as elegant semantic tags
              if (trimmed.startsWith('#### ')) {
                return (
                  <h5 key={lineIdx} style={{ fontWeight: 800, fontSize: '0.94rem', margin: '8px 0 2px', color: '#0F172A' }}>
                    {parseInline(trimmed.replace(/^####\s+/, ''))}
                  </h5>
                );
              }
              if (trimmed.startsWith('### ')) {
                return (
                  <h4 key={lineIdx} style={{ fontWeight: 800, fontSize: '1.05rem', margin: '10px 0 2px', color: '#0F172A' }}>
                    {parseInline(trimmed.replace(/^###\s+/, ''))}
                  </h4>
                );
              }
              if (trimmed.startsWith('## ')) {
                return (
                  <h3 key={lineIdx} style={{ fontWeight: 800, fontSize: '1.18rem', margin: '12px 0 4px', color: '#0F172A' }}>
                    {parseInline(trimmed.replace(/^##\s+/, ''))}
                  </h3>
                );
              }
              if (trimmed.startsWith('# ')) {
                return (
                  <h2 key={lineIdx} style={{ fontWeight: 800, fontSize: '1.3rem', margin: '14px 0 4px', color: '#0F172A' }}>
                    {parseInline(trimmed.replace(/^#\s+/, ''))}
                  </h2>
                );
              }

              // Standalone display math line: $$...$$
              if (trimmed.startsWith('$$') && trimmed.endsWith('$$')) {
                return (
                  <div key={lineIdx} style={{ margin: '8px 0', textAlign: 'center', overflowX: 'auto' }}>
                    {renderMath(trimmed.slice(2, -2), true)}
                  </div>
                );
              }

              // Bullet points
              if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
                const bulletText = trimmed.replace(/^[-*]\s+/, '');
                return (
                  <div key={lineIdx} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', paddingLeft: 4 }}>
                    <span style={{ color: '#0284C7', fontWeight: 'bold', lineHeight: 1.6 }}>•</span>
                    <span style={{ flex: 1 }}>{parseInline(bulletText)}</span>
                  </div>
                );
              }

              // Numbered list
              const numMatch = trimmed.match(/^(\d+)\.\s+(.*)/);
              if (numMatch) {
                return (
                  <div key={lineIdx} style={{ display: 'flex', gap: 8, alignItems: 'flex-start', paddingLeft: 4 }}>
                    <span style={{ color: '#0284C7', fontWeight: 700, minWidth: '18px' }}>{numMatch[1]}.</span>
                    <span style={{ flex: 1 }}>{parseInline(numMatch[2])}</span>
                  </div>
                );
              }

              // Blockquote / notice
              if (trimmed.startsWith('> ')) {
                return (
                  <div
                    key={lineIdx}
                    style={{
                      borderLeft: '3px solid #38BDF8',
                      padding: '6px 14px',
                      background: 'rgba(56, 189, 248, 0.08)',
                      borderRadius: '0 8px 8px 0',
                      fontSize: '0.88rem',
                      color: '#0369A1',
                      margin: '4px 0'
                    }}
                  >
                    {parseInline(trimmed.replace(/^>\s+/, ''))}
                  </div>
                );
              }

              return <p key={lineIdx} style={{ margin: 0 }}>{parseInline(line)}</p>;
            })}
          </div>
        );
      })}
    </div>
  );
};

export const AiChatAssistantModal: React.FC = () => {
  const {
    isAiChatOpen,
    setIsAiChatOpen,
    geminiApiKey,
    setGeminiApiKey,
    isAiThinking,
    chatMessages,
    sendChatMessage,
    clearChat,
    profile
  } = useStudentOs();

  const [inputVal, setInputVal] = useState('');
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState(geminiApiKey);
  const [ollamaModelInput, setOllamaModelInput] = useState(GeminiService.getOllamaModel());
  const [isOllamaUp, setIsOllamaUp] = useState<boolean>(false);
  const [isCheckingOllama, setIsCheckingOllama] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isAiChatOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      // Check Ollama status
      GeminiService.isOllamaAvailable().then(up => setIsOllamaUp(up));
    }
  }, [chatMessages, isAiChatOpen]);

  const handleCheckOllama = async () => {
    setIsCheckingOllama(true);
    const up = await GeminiService.isOllamaAvailable();
    setIsOllamaUp(up);
    setIsCheckingOllama(false);
  };

  if (!isAiChatOpen) return null;

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputVal.trim() || isAiThinking) return;
    const text = inputVal.trim();
    setInputVal('');
    await sendChatMessage(text);
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    if (apiKeyInput.trim()) {
      setGeminiApiKey(apiKeyInput.trim());
    }
    if (ollamaModelInput.trim()) {
      GeminiService.setOllamaModel(ollamaModelInput.trim());
    }
    setShowKeyModal(false);
  };

  const quickPrompts = [
    'Explain Topological Sort (Kahn Algorithm)',
    'Derive Scaled Dot-Product Attention in Transformers',
    'How should I divide my 4 hours between DSA & ML today?',
    'Solve LeetCode Trapping Rain Water with Two Pointers'
  ];

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 200,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(15, 23, 42, 0.55)',
        backdropFilter: 'blur(10px)',
        padding: '20px'
      }}
    >
      <div
        className="glass-card mobile-full-modal"
        style={{
          width: '100%',
          maxWidth: '740px',
          height: '88vh',
          background: 'rgba(255, 255, 255, 0.96)',
          borderRadius: '32px',
          boxShadow: '0 25px 60px -15px rgba(25, 30, 45, 0.3), inset 0 1px 2px rgba(255, 255, 255, 0.9)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}
      >
        {/* Drawer Header */}
        <div
          style={{
            padding: '20px 28px',
            borderBottom: '1px solid rgba(0, 0, 0, 0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'rgba(255, 255, 255, 0.85)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: '16px',
                background: 'linear-gradient(135deg, #0284C7 0%, #10B981 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 14px rgba(2, 132, 199, 0.3)'
              }}
            >
              <img src="/icons/FUSE.gif" alt="FUSE AI" style={{ width: 30, height: 30, objectFit: 'contain' }} />
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <h3 className="font-tech" style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  FUSE AI
                </h3>
                <span
                  style={{
                    fontSize: '0.74rem',
                    fontWeight: 800,
                    padding: '2px 8px',
                    borderRadius: 'var(--radius-pill)',
                    background: geminiApiKey ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                    color: geminiApiKey ? '#059669' : '#D97706'
                  }}
                >
                  {geminiApiKey ? '● Gemini 2.5 Active' : '⚠ API Key Required'}
                </span>
                <span
                  style={{
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: 'var(--radius-pill)',
                    background: isOllamaUp ? 'rgba(14, 165, 233, 0.15)' : 'rgba(100, 116, 139, 0.12)',
                    color: isOllamaUp ? '#0284C7' : '#64748B'
                  }}
                >
                  {isOllamaUp ? '🦙 Ollama Ready' : '🦙 Ollama Local'}
                </span>
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Private Algorithm & Study Mentor for {profile.name} (Gemini + Local Ollama Fallback)
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {/* AI Config */}
            <button
              onClick={() => {
                setApiKeyInput(geminiApiKey);
                setOllamaModelInput(GeminiService.getOllamaModel());
                setShowKeyModal(true);
              }}
              className="glass-pill"
              style={{
                padding: '7px 14px',
                fontSize: '0.8rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                cursor: 'pointer',
                color: '#0284C7'
              }}
              title="Configure your Google Gemini API Key and Ollama Fallback"
            >
              <KeyRound size={14} color="#0284C7" />
              <span>AI Settings</span>
            </button>

            {/* Clear Chat */}
            <button
              onClick={clearChat}
              style={{
                width: 34,
                height: 34,
                borderRadius: '50%',
                border: 'none',
                background: 'rgba(0,0,0,0.05)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--text-muted)'
              }}
              title="Clear Conversation"
            >
              <Trash2 size={16} />
            </button>

            {/* Close */}
            <button
              onClick={() => setIsAiChatOpen(false)}
              style={{
                width: 34,
                height: 34,
                borderRadius: '50%',
                border: 'none',
                background: 'rgba(0,0,0,0.05)',
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

        {/* Message Feed */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '24px 28px',
            display: 'flex',
            flexDirection: 'column',
            gap: 16
          }}
        >
          {chatMessages.map(msg => {
            const isUser = msg.sender === 'user';
            return (
              <div
                key={msg.id}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: isUser ? 'flex-end' : 'flex-start'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4, fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                  <span style={{ fontWeight: 700, color: isUser ? '#0284C7' : '#0D9488' }}>
                    {isUser ? profile.name : 'FUSE'}
                  </span>
                  <span>•</span>
                  <span>{msg.timestamp}</span>
                </div>

                <div
                  style={{
                    maxWidth: '85%',
                    padding: '14px 20px',
                    borderRadius: isUser ? '20px 20px 4px 20px' : '20px 20px 20px 4px',
                    background: isUser ? 'var(--charcoal-pill)' : 'rgba(255, 255, 255, 0.95)',
                    color: isUser ? '#FFFFFF' : '#18181B',
                    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.05)',
                    border: isUser ? 'none' : '1px solid rgba(0, 0, 0, 0.08)'
                  }}
                >
                  <FormattedMessage text={msg.text} isUser={isUser} />
                </div>
              </div>
            );
          })}

          {isAiThinking && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px', color: '#0284C7', background: 'rgba(2, 132, 199, 0.08)', borderRadius: 14, width: 'fit-content' }}>
              <img src="/icons/LOADING.gif" alt="Thinking..." style={{ width: 22, height: 22, objectFit: 'contain' }} />
              <span style={{ fontSize: '0.88rem', fontWeight: 600 }}>FUSE is thinking and generating answer...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestion Chips */}
        <div
          style={{
            padding: '8px 24px',
            display: 'flex',
            gap: 8,
            overflowX: 'auto',
            background: 'rgba(250, 250, 250, 0.8)',
            borderTop: '1px solid rgba(0,0,0,0.05)'
          }}
        >
          {quickPrompts.map((prompt, i) => (
            <button
              key={i}
              onClick={() => {
                setInputVal(prompt);
              }}
              style={{
                padding: '6px 14px',
                borderRadius: 'var(--radius-pill)',
                border: '1px solid rgba(0,0,0,0.1)',
                background: '#FFFFFF',
                fontSize: '0.78rem',
                fontWeight: 600,
                color: 'var(--text-secondary)',
                cursor: 'pointer',
                whiteSpace: 'nowrap'
              }}
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <form
          onSubmit={handleSend}
          style={{
            padding: '16px 24px',
            borderTop: '1px solid rgba(0, 0, 0, 0.08)',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            background: '#FFFFFF'
          }}
        >
          <input
            type="text"
            placeholder="Ask FUSE anything: DSA complexity, LeetCode patterns, ML derivations..."
            value={inputVal}
            onChange={e => setInputVal(e.target.value)}
            disabled={isAiThinking}
            style={{
              flex: 1,
              padding: '14px 20px',
              borderRadius: 'var(--radius-pill)',
              border: '1.5px solid rgba(0, 0, 0, 0.1)',
              fontSize: '0.96rem',
              outline: 'none',
              fontFamily: 'inherit'
            }}
          />

          <button
            type="submit"
            disabled={!inputVal.trim() || isAiThinking}
            className="charcoal-pill-btn"
            style={{
              padding: '14px 24px',
              fontSize: '0.94rem',
              opacity: !inputVal.trim() || isAiThinking ? 0.6 : 1,
              cursor: !inputVal.trim() || isAiThinking ? 'not-allowed' : 'pointer'
            }}
          >
            <Send size={16} />
            <span>Send</span>
          </button>
        </form>
      </div>

      {/* AI Settings Modal (Gemini + Local Ollama Fallback) */}
      {showKeyModal && (
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
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
              <KeyRound size={22} color="#0284C7" />
              <h3 className="font-tech" style={{ fontSize: '1.3rem', fontWeight: 800 }}>
                {profile.name}'s FUSE AI Settings
              </h3>
            </div>

            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: 18 }}>
              Primary engine runs on your personal Google Gemini API key. If tokens or rate limits are reached, FUSE automatically routes requests to your local Ollama instance.
            </p>

            <form onSubmit={handleSaveSettings} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Gemini Key */}
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: 6 }}>
                  1. Google Gemini API Key (Primary)
                </label>
                <input
                  type="password"
                  placeholder="AIzaSy..."
                  value={apiKeyInput}
                  onChange={e => setApiKeyInput(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    borderRadius: '12px',
                    border: '1px solid rgba(0,0,0,0.15)',
                    fontSize: '0.92rem'
                  }}
                />
              </div>

              {/* Local Ollama */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                  <label style={{ fontSize: '0.8rem', fontWeight: 700 }}>
                    2. Local Ollama Model (Gemma / Fallback)
                  </label>
                  <button
                    type="button"
                    onClick={handleCheckOllama}
                    style={{
                      border: 'none',
                      background: 'none',
                      color: '#0284C7',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4
                    }}
                  >
                    <RefreshCw size={12} className={isCheckingOllama ? 'animate-spin' : ''} />
                    <span>{isOllamaUp ? '● Ollama Online' : 'Check Localhost:11434'}</span>
                  </button>
                </div>
                <input
                  type="text"
                  placeholder="gemma:latest, gemma:2b, llama3:latest"
                  value={ollamaModelInput}
                  onChange={e => setOllamaModelInput(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    borderRadius: '12px',
                    border: '1px solid rgba(0,0,0,0.15)',
                    fontSize: '0.92rem'
                  }}
                />
                
                {/* Gemma & Popular Model Quick Select Chips */}
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 8 }}>
                  <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', alignSelf: 'center' }}>Presets:</span>
                  {['gemma:latest', 'gemma:2b', 'gemma2:latest', 'llama3:latest'].map(model => (
                    <button
                      key={model}
                      type="button"
                      onClick={() => setOllamaModelInput(model)}
                      style={{
                        padding: '3px 9px',
                        borderRadius: '8px',
                        border: ollamaModelInput === model ? '1.5px solid #0284C7' : '1px solid rgba(0,0,0,0.1)',
                        background: ollamaModelInput === model ? 'rgba(2, 132, 199, 0.1)' : '#F8FAFC',
                        color: ollamaModelInput === model ? '#0284C7' : '#475569',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                    >
                      {model === 'gemma:latest' ? '⭐ gemma:latest (Local)' : model}
                    </button>
                  ))}
                </div>
              </div>

              {/* Step-by-Step Installation Guide for Other Users */}
              <div
                style={{
                  padding: '12px 14px',
                  borderRadius: '12px',
                  background: 'rgba(240, 249, 255, 0.9)',
                  border: '1px solid rgba(2, 132, 199, 0.25)',
                  fontSize: '0.78rem',
                  lineHeight: 1.5,
                  color: '#0F172A'
                }}
              >
                <div style={{ fontWeight: 800, color: '#0369A1', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span>🚀 How to Install Your Local Model (Gemma):</span>
                </div>
                <ol style={{ margin: '4px 0 0 16px', padding: 0, color: '#334155' }}>
                  <li>Download & install Ollama from <a href="https://ollama.com" target="_blank" rel="noreferrer" style={{ color: '#0284C7', fontWeight: 700, textDecoration: 'underline' }}>ollama.com</a>.</li>
                  <li>Open your Terminal or PowerShell and run: <code style={{ background: 'rgba(0,0,0,0.06)', padding: '2px 5px', borderRadius: 4, fontWeight: 700 }}>ollama run gemma</code></li>
                  <li>Once downloaded, it runs locally at <code>http://localhost:11434</code> automatically.</li>
                </ol>
              </div>

              {/* Prominent Hardware & Latency Warning */}
              <div
                style={{
                  padding: '10px 14px',
                  borderRadius: '12px',
                  background: 'rgba(254, 243, 199, 0.9)',
                  border: '1px solid rgba(245, 158, 11, 0.4)',
                  fontSize: '0.76rem',
                  color: '#92400E',
                  lineHeight: 1.45
                }}
              >
                <strong>⚠️ Hardware & Speed Notice:</strong> Running local models like Gemma executes entirely on your computer's local CPU and GPU. Responses will be noticeably slower compared to Cloud Gemini, depending on your system's hardware specifications and available RAM.
              </div>

              <div
                style={{
                  padding: '12px 14px',
                  borderRadius: '12px',
                  background: 'rgba(238, 242, 255, 0.8)',
                  fontSize: '0.78rem',
                  color: '#4338CA',
                  lineHeight: 1.5
                }}
              >
                Get your free Gemini key at{' '}
                <a
                  href="https://aistudio.google.com/app/apikey"
                  target="_blank"
                  rel="noreferrer"
                  style={{ color: '#0284C7', fontWeight: 700, textDecoration: 'underline' }}
                >
                  Google AI Studio (aistudio.google.com)
                </a>
              </div>

              <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                <button
                  type="button"
                  onClick={() => setShowKeyModal(false)}
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
                  Save Configuration
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
