import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Search, FileText, Command, ArrowRight, X } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';

interface CommandPaletteModalProps {
  isOpen: boolean;
  onClose: () => void;
  setTheme: (theme: 'dark' | 'light' | 'eink') => void;
  onGoToDocs: () => void;
}

export const CommandPaletteModal: React.FC<CommandPaletteModalProps> = ({
  isOpen,
  onClose,
  setTheme,
  onGoToDocs
}) => {
  const { t, lang } = useLanguage();
  const [query, setQuery] = useState<string>('');
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);

  const mockItems = useMemo(() => [
    {
      type: 'file',
      label: lang === 'en' ? '01-distributed-architecture.md' : '01-分布式系统架构.md',
      desc: lang === 'en' ? 'Core Spec · L45' : '核心规范 · L45',
      action: () => { onGoToDocs(); onClose(); }
    },
    {
      type: 'file',
      label: lang === 'en' ? '03-infinite-canvas.canvas' : '03-无限空间白板.canvas',
      desc: lang === 'en' ? 'JSON Canvas 1.0 Architecture' : 'JSON Canvas 1.0 架构拓扑',
      action: () => { onGoToDocs(); onClose(); }
    },
    {
      type: 'cmd',
      label: t.palette.themeLight,
      desc: t.palette.catTheme,
      action: () => { setTheme('light'); onClose(); }
    },
    {
      type: 'cmd',
      label: t.palette.themeEink,
      desc: t.palette.catTheme,
      action: () => { setTheme('eink'); onClose(); }
    },
    {
      type: 'cmd',
      label: t.palette.themeDark,
      desc: t.palette.catTheme,
      action: () => { setTheme('dark'); onClose(); }
    },
    {
      type: 'cmd',
      label: t.palette.navDocs,
      desc: t.palette.catNav,
      action: () => { onGoToDocs(); onClose(); }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  ], [lang, onClose, onGoToDocs, setTheme]);

  const filtered = useMemo(
    () => mockItems.filter(item =>
      item.label.toLowerCase().includes(query.toLowerCase()) ||
      item.desc.toLowerCase().includes(query.toLowerCase())
    ),
    [mockItems, query]
  );

  // Reset highlight whenever the result set or open state changes
  useEffect(() => {
    setActiveIndex(0);
  }, [query, isOpen]);

  // Keep the highlighted row in view
  useEffect(() => {
    itemRefs.current[activeIndex]?.scrollIntoView({ block: 'nearest' });
  }, [activeIndex]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd+K toggle is owned by App; here we only handle palette-local keys.
      if (!isOpen) return;

      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActiveIndex(i => (filtered.length === 0 ? 0 : Math.min(i + 1, filtered.length - 1)));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveIndex(i => Math.max(i - 1, 0));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        filtered[activeIndex]?.action();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, filtered, activeIndex]);

  if (!isOpen) return null;

  const dialogLabel = lang === 'en' ? 'Command palette' : '命令面板';
  const closeLabel = lang === 'en' ? 'Close' : '关闭';

  return (
    <div
      role="presentation"
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 200,
        background: 'rgba(0, 0, 0, 0.7)',
        backdropFilter: 'blur(10px)',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        paddingTop: '14vh'
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={dialogLabel}
        onClick={(e) => e.stopPropagation()}
        className="glass-panel"
        style={{
          width: '100%',
          maxWidth: 620,
          background: 'var(--bg-surface)',
          borderRadius: 16,
          boxShadow: '0 24px 60px rgba(0, 0, 0, 0.5)',
          overflow: 'hidden',
          border: '1px solid var(--border-strong)'
        }}
      >
        {/* Search input header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          padding: '16px 20px',
          borderBottom: '1px solid var(--border-subtle)'
        }}>
          <Search size={20} color="var(--accent-cyan)" />
          <input
            autoFocus
            type="text"
            role="combobox"
            aria-expanded="true"
            aria-controls="command-palette-list"
            aria-activedescendant={filtered[activeIndex] ? `command-item-${activeIndex}` : undefined}
            aria-label={t.palette.placeholder}
            placeholder={t.palette.placeholder}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{
              flex: 1,
              background: 'none',
              border: 'none',
              color: 'var(--text-primary)',
              fontSize: '1.05rem',
              outline: 'none'
            }}
          />
          <button
            onClick={onClose}
            aria-label={closeLabel}
            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Results List */}
        <div
          id="command-palette-list"
          role="listbox"
          aria-label={dialogLabel}
          style={{ maxHeight: 360, overflowY: 'auto', padding: 8 }}
        >
          {filtered.length === 0 ? (
            <div
              role="status"
              style={{ padding: '30px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }}
            >
              {lang === 'en' ? 'No matching commands or files found' : '未搜索到匹配项'}
            </div>
          ) : (
            filtered.map((item, idx) => {
              const isActive = idx === activeIndex;
              return (
                <div
                  key={idx}
                  ref={(el) => { itemRefs.current[idx] = el; }}
                  id={`command-item-${idx}`}
                  role="option"
                  aria-selected={isActive}
                  onClick={item.action}
                  onMouseEnter={(e) => {
                    setActiveIndex(idx);
                    e.currentTarget.style.background = 'var(--bg-elevated)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = isActive ? 'var(--bg-elevated)' : 'transparent';
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 14px',
                    borderRadius: 10,
                    cursor: 'pointer',
                    background: isActive ? 'var(--bg-elevated)' : 'transparent',
                    borderLeft: isActive ? '2px solid var(--accent-cyan)' : '2px solid transparent',
                    transition: 'background 0.15s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    {item.type === 'file' ? (
                      <FileText size={18} color="var(--accent-cyan)" />
                    ) : (
                      <Command size={18} color="var(--accent-emerald)" />
                    )}
                    <div>
                      <div style={{ fontSize: '0.92rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                        {item.label}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>
                        {item.desc}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    <span>{lang === 'en' ? 'Enter to execute' : '回车执行'}</span>
                    <ArrowRight size={13} />
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer shortcuts helper */}
        <div style={{
          padding: '10px 18px',
          background: 'var(--bg-card)',
          borderTop: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '0.78rem',
          color: 'var(--text-muted)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span>{lang === 'en' ? '↑↓ Navigate' : '↑↓ 导航'}</span>
            <span>{lang === 'en' ? '↵ Select' : '↵ 确认'}</span>
            <span>{lang === 'en' ? 'Esc Exit' : 'Esc 退出'}</span>
          </div>
          <span style={{ color: 'var(--accent-cyan)' }}>KnowSpace Command Palette</span>
        </div>
      </div>
    </div>
  );
};
