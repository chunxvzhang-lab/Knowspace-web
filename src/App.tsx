import React, { useState, useEffect, useLayoutEffect, useCallback, useRef } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { SocialProofStrip } from './components/SocialProofStrip';
import { BentoGrid } from './components/BentoGrid';
import { Workspace5D } from './components/Workspace5D';
import { InteractiveStage } from './components/InteractiveStage';
import { EngineeringTrust } from './components/EngineeringTrust';
import { ComparisonTable } from './components/ComparisonTable';
import { DownloadCenter } from './components/DownloadCenter';
import { DocsViewer } from './components/DocsViewer';
import { FaqSection } from './components/FaqSection';
import { Footer } from './components/Footer';
import { CommandPaletteModal } from './components/CommandPaletteModal';
import { CyberBackground } from './components/CyberBackground';
import { LanguageProvider } from './i18n/LanguageContext';

export const AppContent: React.FC = () => {
  const [currentTheme, setCurrentTheme] = useState<'dark' | 'light' | 'eink'>('dark');
  const [activeView, setActiveView] = useState<'landing' | 'docs'>('landing');
  const [paletteOpen, setPaletteOpen] = useState<boolean>(false);
  // Skips the very first run so browser scroll restoration on reload is untouched
  const isFirstViewRender = useRef<boolean>(true);

  // Synchronize theme class to document body
  useEffect(() => {
    document.body.className = `theme-${currentTheme}`;
  }, [currentTheme]);

  // View switching always resets scroll to top *before paint*, so users never
  // land on the bottom of a freshly mounted view (e.g. opening "在线画册" from
  // the footer of the landing page). Uses layout effect + instant behavior to
  // bypass the global `scroll-behavior: smooth` for a flicker-free swap.
  useLayoutEffect(() => {
    if (isFirstViewRender.current) {
      isFirstViewRender.current = false;
      return;
    }
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [activeView]);

  // Single entry point for cross-view navigation
  const navigate = useCallback((view: 'landing' | 'docs') => {
    setActiveView(view);
  }, []);

  // Global shortcut listener for Ctrl+K
  useEffect(() => {
    const handleGlobalKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setPaletteOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleGlobalKey);
    return () => window.removeEventListener('keydown', handleGlobalKey);
  }, []);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Background Mesh & Interactive Cyber Constellation */}
      <div className="ambient-mesh" />
      <CyberBackground theme={currentTheme} />

      {/* Sticky Top Navigation */}
      <Navbar
        currentTheme={currentTheme}
        setTheme={setCurrentTheme}
        activeView={activeView}
        setActiveView={setActiveView}
        onOpenPalette={() => setPaletteOpen(true)}
      />

      {/* Main View Router */}
      <main style={{ flex: 1, position: 'relative', zIndex: 1 }}>
        {activeView === 'landing' ? (
          <>
            <Hero
              currentTheme={currentTheme}
              setTheme={setCurrentTheme}
              onGoToDocs={() => navigate('docs')}
            />
            <SocialProofStrip />
            <BentoGrid />
            <Workspace5D />
            <InteractiveStage />
            <EngineeringTrust />
            <ComparisonTable />
            <DownloadCenter />
            <FaqSection />
          </>
        ) : (
          <DocsViewer onBackToLanding={() => navigate('landing')} />
        )}
      </main>

      {/* Global Footer */}
      <Footer onGoToDocs={() => navigate('docs')} />

      {/* Command Palette Interactive Simulator Modal */}
      <CommandPaletteModal
        isOpen={paletteOpen}
        onClose={() => setPaletteOpen(false)}
        setTheme={setCurrentTheme}
        onGoToDocs={() => navigate('docs')}
      />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <LanguageProvider>
      <AppContent />
    </LanguageProvider>
  );
};

