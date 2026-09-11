import React, { useState, useEffect, useRef } from 'react';
import { Github, Heart, Mail, Send, Copy, Check } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import { copyText, COPY_FEEDBACK_MS } from '../utils/clipboard';

interface FooterProps {
  onGoToDocs: () => void;
}

/** Single source of truth for the contact channels. */
const CONTACT_EMAIL = 'chunxvzhang@gmail.com';
const TELEGRAM_HANDLE = '@MOYUING_404';
/** Must stay in sync with what the QR card in public/telegram-card.webp encodes. */
const TELEGRAM_URL = 'https://t.me/moyuing_404';

export const Footer: React.FC<FooterProps> = ({ onGoToDocs }) => {
  const { t } = useLanguage();
  const [copiedValue, setCopiedValue] = useState<string | null>(null);
  const resetTimer = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (resetTimer.current !== null) window.clearTimeout(resetTimer.current);
    };
  }, []);

  const handleCopy = async (value: string) => {
    await copyText(value);
    setCopiedValue(value);
    if (resetTimer.current !== null) window.clearTimeout(resetTimer.current);
    resetTimer.current = window.setTimeout(() => setCopiedValue(null), COPY_FEEDBACK_MS);
  };

  const renderCopyButton = (value: string, label: string) => (
    <button
      type="button"
      className="copy-btn"
      onClick={() => handleCopy(value)}
      aria-label={label}
    >
      {copiedValue === value ? <Check size={13} /> : <Copy size={13} />}
      <span>{copiedValue === value ? t.footer.contactCopied : t.footer.contactCopy}</span>
    </button>
  );

  return (
    <footer style={{ borderTop: '1px solid var(--border-subtle)', background: 'var(--bg-surface)', padding: '60px 24px 40px' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 40, marginBottom: 50 }}>
        {/* Col 1: Brand & Philosophy */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
            <img
              src="./icon.png"
              alt="KnowSpace"
              width={32}
              height={32}
              style={{ borderRadius: 8, objectFit: 'cover', flexShrink: 0, display: 'block' }}
            />
            <span style={{ fontSize: '1.25rem', fontWeight: 800 }}>KnowSpace</span>
          </div>

          <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 16 }}>
            {t.footer.brandDesc}
          </p>

          <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
            {t.footer.builtBy}
          </div>
        </div>

        {/* Col 2: Core Capabilities */}
        <div>
          <div style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: 16, color: 'var(--text-primary)' }}>
            {t.footer.colFeatures}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: '0.88rem' }}>
            <a href="#bento" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>{t.footer.linkCanvas}</a>
            <a href="#bento" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>{t.footer.linkHistory}</a>
            <a href="#bento" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>{t.footer.linkSearch}</a>
            <a href="#workspace" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>{t.footer.link5D}</a>
            <a href="#interactive" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>{t.footer.linkInteractive}</a>
          </div>
        </div>

        {/* Col 3: Documentation & Manuals */}
        <div>
          <div style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: 16, color: 'var(--text-primary)' }}>
            {t.footer.colDocs}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: '0.88rem' }}>
            <button onClick={onGoToDocs} style={{ background: 'none', border: 'none', color: 'var(--accent-cyan)', textAlign: 'left', cursor: 'pointer', padding: 0, fontWeight: 600 }}>
              {t.footer.linkManual}
            </button>
            <a href="#comparison" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>{t.footer.linkComparison}</a>
            <a href="#download" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>{t.footer.linkMsiGuide}</a>
            <a href="#download" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>{t.footer.linkZipGuide}</a>
          </div>
        </div>

        {/* Col 4: Community & License */}
        <div>
          <div style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: 16, color: 'var(--text-primary)' }}>
            {t.footer.colCommunity}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: '0.88rem' }}>
            <a
              href="https://github.com/chunxvzhang-lab/KnowSpace"
              target="_blank"
              rel="noopener noreferrer"
              style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-secondary)', textDecoration: 'none' }}
            >
              <Github size={16} style={{ flexShrink: 0 }} />
              <span>{t.footer.linkGithub}</span>
            </a>
            <span style={{ color: 'var(--text-secondary)' }}>{t.footer.license}</span>
            <span style={{ color: 'var(--text-secondary)' }}>{t.footer.openStandard}</span>
          </div>
        </div>
      </div>

      {/* Contact Strip */}
      <div className="footer-contact">
        {/* Scannable Telegram card — clicking opens the chat directly */}
        <a
          className="footer-contact-qr"
          href={TELEGRAM_URL}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={t.footer.contactTelegramHint}
        >
          <img
            src="./telegram-card.webp"
            alt={t.footer.contactTelegramHint}
            width={480}
            height={612}
            loading="lazy"
            decoding="async"
          />
        </a>

        <div className="footer-contact-body">
          <div className="footer-contact-main">
            <span className="footer-contact-icon">
              <Mail size={19} />
            </span>
            <div style={{ minWidth: 0 }}>
              <div className="footer-contact-title">{t.footer.contactTitle}</div>
              <div className="footer-contact-desc">{t.footer.contactDesc}</div>
            </div>
          </div>

          <div className="footer-contact-rows">
            <div className="footer-contact-row">
              <a href={`mailto:${CONTACT_EMAIL}`} className="footer-contact-pill">
                <Mail size={15} style={{ flexShrink: 0 }} />
                <span>{CONTACT_EMAIL}</span>
              </a>
              {renderCopyButton(CONTACT_EMAIL, `${t.footer.contactCopy} ${CONTACT_EMAIL}`)}
            </div>

            <div className="footer-contact-row">
              <a
                href={TELEGRAM_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="footer-contact-pill"
              >
                <Send size={15} style={{ flexShrink: 0 }} />
                <span>{t.footer.contactTelegram}</span>
                <span className="footer-contact-handle">{TELEGRAM_HANDLE}</span>
              </a>
              {renderCopyButton(TELEGRAM_HANDLE, `${t.footer.contactCopy} ${TELEGRAM_HANDLE}`)}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div style={{ maxWidth: 1280, margin: '0 auto', paddingTop: 24, borderTop: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16, fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
        <div>
          {t.footer.copyright}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <span>{t.footer.motto}</span>
          <Heart size={13} color="#ef4444" fill="#ef4444" style={{ marginLeft: 4, flexShrink: 0 }} />
        </div>
      </div>
    </footer>
  );
};
