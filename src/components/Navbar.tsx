import React, { useEffect, useState } from 'react';
import { Download, BookOpen, Sun, Moon, Feather, Search, Languages } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';

interface NavbarProps {
  currentTheme: 'dark' | 'light' | 'eink';
  setTheme: (theme: 'dark' | 'light' | 'eink') => void;
  activeView: 'landing' | 'docs';
  setActiveView: (view: 'landing' | 'docs') => void;
  onOpenPalette: () => void;
}

/** Sections that the landing nav can highlight. Order matters: top → bottom. */
const SECTION_IDS = ['bento', 'workspace', 'interactive', 'comparison'] as const;
type SectionId = (typeof SECTION_IDS)[number];

/** Sticky nav height (68px) plus a little breathing room. */
const SCROLL_SPY_OFFSET = 100;

export const Navbar: React.FC<NavbarProps> = ({
  currentTheme,
  setTheme,
  activeView,
  setActiveView,
  onOpenPalette
}) => {
  const { lang, toggleLang, t } = useLanguage();
  const [activeSection, setActiveSection] = useState<SectionId | ''>('');

  // Scroll spy: keep the nav underline attached to the section currently in view.
  // Without this the anchor links only showed their underline on :hover, so the
  // indicator vanished as soon as the pointer moved away.
  useEffect(() => {
    if (activeView !== 'landing') {
      setActiveSection('');
      return;
    }

    let frame = 0;

    const measure = () => {
      frame = 0;
      let current: SectionId | '' = '';

      for (const id of SECTION_IDS) {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top <= SCROLL_SPY_OFFSET) {
          current = id;
        }
      }

      setActiveSection(current);
    };

    const onScroll = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(measure);
    };

    // Defer the first measurement so it runs after the layout has settled
    frame = window.requestAnimationFrame(measure);
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);

    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [activeView]);

  const anchors: { id: SectionId; label: string }[] = [
    { id: 'bento', label: t.navbar.bento },
    { id: 'workspace', label: t.navbar.workspace },
    { id: 'interactive', label: t.navbar.interactive },
    { id: 'comparison', label: t.navbar.comparison }
  ];

  return (
    <header className="sticky-nav">
      <div className="sticky-nav-inner">
        {/* Brand Logo & Version */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
          <div
            role="button"
            tabIndex={0}
            aria-label="KnowSpace — 返回首页 / Back to home"
            onClick={() => setActiveView('landing')}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setActiveView('landing');
              }
            }}
            style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', userSelect: 'none' }}
          >
            <img
              src="./icon.png"
              alt="KnowSpace"
              width={38}
              height={38}
              style={{
                borderRadius: 10,
                objectFit: 'cover',
                flexShrink: 0,
                display: 'block',
                boxShadow: '0 4px 14px rgba(56, 189, 248, 0.28)'
              }}
            />
            <span style={{ fontSize: '1.35rem', fontWeight: 800, letterSpacing: '-0.02em', whiteSpace: 'nowrap' }}>
              Know<span style={{ color: 'var(--accent-cyan)' }}>Space</span>
            </span>
          </div>

          <span className="badge-pill primary" style={{ display: 'flex', alignItems: 'center', gap: 5, lineHeight: 1, flexShrink: 0 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'currentColor', flexShrink: 0 }} />
            v2.3.0
          </span>
        </div>

        {/* Navigation Links with no-wrap and responsive collapsing */}
        <nav className="nav-links-container">
          <button
            onClick={() => setActiveView('landing')}
            className={`nav-link-btn ${activeView === 'landing' && !activeSection ? 'active' : ''}`}
            aria-current={activeView === 'landing' && !activeSection ? 'page' : undefined}
          >
            {t.navbar.features}
          </button>

          {activeView === 'landing' && (
            <div className="nav-secondary-links" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              {anchors.map(({ id, label }) => (
                <a
                  key={id}
                  href={`#${id}`}
                  className={`nav-link-btn ${activeSection === id ? 'active' : ''}`}
                  aria-current={activeSection === id ? 'true' : undefined}
                  onClick={() => setActiveSection(id)}
                >
                  {label}
                </a>
              ))}
            </div>
          )}

          <button
            onClick={() => setActiveView('docs')}
            className={`nav-link-btn ${activeView === 'docs' ? 'active' : ''}`}
            aria-current={activeView === 'docs' ? 'page' : undefined}
          >
            <BookOpen size={16} style={{ flexShrink: 0 }} />
            <span>{t.navbar.docs}</span>
          </button>
        </nav>

        {/* Action Controls, Language Switcher & Theme Toggle */}
        <div className="nav-controls-container">
          {/* Language Switcher (中 / EN) */}
          <button
            onClick={toggleLang}
            className="glass-panel"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '6px 12px',
              fontSize: '0.82rem',
              fontWeight: 700,
              color: 'var(--accent-cyan)',
              border: '1px solid var(--border-subtle)',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              flexShrink: 0,
              lineHeight: 1
            }}
            title={lang === 'zh' ? 'Switch to English (切换为英文)' : '切换为简体中文 (Switch to Chinese)'}
          >
            <Languages size={15} style={{ flexShrink: 0 }} />
            <span className="nav-lang-label">{t.navbar.langToggle}</span>
          </button>

          {/* Palette trigger capsule */}
          <button
            onClick={onOpenPalette}
            className="glass-panel"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 7,
              padding: '6px 12px',
              fontSize: '0.82rem',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              border: '1px solid var(--border-subtle)',
              whiteSpace: 'nowrap',
              flexShrink: 0
            }}
            title="Ctrl+K"
          >
            <Search size={14} style={{ flexShrink: 0 }} />
            <span className="nav-cmd-label">{t.navbar.commandPalette}</span>
            <kbd className="nav-cmd-kbd" style={{ fontSize: '0.72rem', background: 'var(--bg-elevated)', padding: '2px 5px', borderRadius: 4, border: '1px solid var(--border-strong)', lineHeight: 1 }}>
              Ctrl K
            </kbd>
          </button>

          {/* Theme Switcher Toggle */}
          <div style={{ display: 'flex', alignItems: 'center', background: 'var(--bg-surface)', padding: 3, borderRadius: 10, border: '1px solid var(--border-subtle)', flexShrink: 0 }}>
            <button
              onClick={() => setTheme('light')}
              style={{
                background: currentTheme === 'light' ? 'var(--bg-card)' : 'none',
                border: 'none',
                color: currentTheme === 'light' ? 'var(--accent-amber)' : 'var(--text-muted)',
                padding: '6px 7px',
                borderRadius: 7,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                flexShrink: 0
              }}
              title="Warm Light"
            >
              <Sun size={15} style={{ flexShrink: 0 }} />
            </button>
            <button
              onClick={() => setTheme('eink')}
              style={{
                background: currentTheme === 'eink' ? 'var(--bg-card)' : 'none',
                border: 'none',
                color: currentTheme === 'eink' ? 'var(--text-primary)' : 'var(--text-muted)',
                padding: '6px 7px',
                borderRadius: 7,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                flexShrink: 0
              }}
              title="E-ink Paper"
            >
              <Feather size={15} style={{ flexShrink: 0 }} />
            </button>
            <button
              onClick={() => setTheme('dark')}
              style={{
                background: currentTheme === 'dark' ? 'var(--bg-card)' : 'none',
                border: 'none',
                color: currentTheme === 'dark' ? 'var(--accent-cyan)' : 'var(--text-muted)',
                padding: '6px 7px',
                borderRadius: 7,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                flexShrink: 0
              }}
              title="Geek Dark"
            >
              <Moon size={15} style={{ flexShrink: 0 }} />
            </button>
          </div>

          {/* Download CTA */}
          <a
            href="#download"
            className="btn-primary"
            style={{ padding: '8px 16px', fontSize: '0.86rem', whiteSpace: 'nowrap', flexShrink: 0 }}
          >
            <Download size={15} style={{ flexShrink: 0 }} />
            <span>{t.navbar.download}</span>
          </a>
        </div>
      </div>
    </header>
  );
};
