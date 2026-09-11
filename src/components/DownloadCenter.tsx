import React, { useState, useEffect, useRef } from 'react';
import { Download, Package, Archive, ShieldCheck, Check, ExternalLink, Copy, Hash } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import { RELEASE_ASSETS, RELEASE_TAG } from '../data/releaseAssets';
import { copyText, COPY_FEEDBACK_MS } from '../utils/clipboard';

/** Single source of truth for the upstream project links. */
const REPO_URL = 'https://github.com/chunxvzhang-lab/KnowSpace';
const RELEASES_URL = `${REPO_URL}/releases`;

/** Renders a byte count the same way GitHub does (MiB, one decimal). */
const formatSize = (bytes: number) => `${(bytes / 1048576).toFixed(1)} MB`;

/** Builds the PowerShell one-liner users paste to verify a given asset. */
const buildVerifyCommand = (fileName: string) =>
  `Get-FileHash ".\\${fileName}" -Algorithm SHA256`;

export const DownloadCenter: React.FC = () => {
  const { t } = useLanguage();

  // Which value was copied most recently (drives the transient "Copied" label).
  const [copiedValue, setCopiedValue] = useState<string | null>(null);
  const resetTimer = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (resetTimer.current !== null) window.clearTimeout(resetTimer.current);
    };
  }, []);

  const copyValue = async (value: string) => {
    await copyText(value);
    setCopiedValue(value);
    if (resetTimer.current !== null) window.clearTimeout(resetTimer.current);
    resetTimer.current = window.setTimeout(() => setCopiedValue(null), COPY_FEEDBACK_MS);
  };

  const renderCopyButton = (value: string, label: string) => (
    <button
      type="button"
      className="copy-btn"
      onClick={() => copyValue(value)}
      aria-label={label}
    >
      {copiedValue === value ? <Check size={13} /> : <Copy size={13} />}
      <span>{copiedValue === value ? t.download.shaCopied : t.download.shaCopy}</span>
    </button>
  );

  return (
    <section id="download" style={{ maxWidth: 1280, margin: '0 auto', padding: '80px 24px 60px' }}>
      <div style={{ textAlign: 'center', marginBottom: 48 }}>
        <div className="badge-pill primary" style={{ marginBottom: 14 }}>
          <Download size={14} />
          <span>{t.download.badge}</span>
        </div>
        <h2 style={{ fontSize: 'clamp(2rem, 4vw, 2.8rem)', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 16 }}>
          {t.download.title}
        </h2>
        <p style={{ fontSize: '1.05rem', color: 'var(--text-secondary)', maxWidth: 680, margin: '0 auto' }}>
          {t.download.desc}
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 28, maxWidth: 960, margin: '0 auto 40px' }}>
        {/* MSI Installer Card */}
        <div className="glass-panel" style={{ padding: '36px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', border: '1px solid var(--accent-cyan)' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(56, 189, 248, 0.12)', color: 'var(--accent-cyan)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Package size={24} />
              </div>
              <span className="badge-pill primary" style={{ fontSize: '0.78rem' }}>{t.download.msiBadge}</span>
            </div>

            <h3 style={{ fontSize: '1.45rem', fontWeight: 800, marginBottom: 8, color: 'var(--text-primary)' }}>
              {t.download.msiTitle}
            </h3>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: 20, lineHeight: 1.6 }}>
              {t.download.msiDesc}
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 28, fontSize: '0.88rem', color: 'var(--text-primary)' }}>
              {t.download.msiPoints.map((point, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Check size={16} color="var(--accent-emerald)" style={{ flexShrink: 0 }} />
                  <span>{point}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <a
              href={RELEASES_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary"
              style={{ width: '100%', padding: '14px', marginBottom: 12 }}
            >
              <Download size={18} style={{ flexShrink: 0 }} />
              <span>{t.download.msiBtn}</span>
            </a>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', textAlign: 'center' }}>
              {t.download.msiNote}
            </div>
            <div style={{ textAlign: 'center', marginTop: 6 }}>
              <a
                href={RELEASES_URL}
                target="_blank"
                rel="noopener noreferrer"
                style={{ fontSize: '0.78rem', color: 'var(--accent-cyan)', textDecoration: 'none' }}
              >
                {t.download.msiAltExe}
              </a>
            </div>
          </div>
        </div>

        {/* Portable Zip Card */}
        <div className="glass-panel" style={{ padding: '36px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--bg-elevated)', color: 'var(--accent-amber)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Archive size={24} style={{ flexShrink: 0 }} />
              </div>
              <span className="badge-pill" style={{ fontSize: '0.78rem' }}>{t.download.zipBadge}</span>
            </div>

            <h3 style={{ fontSize: '1.45rem', fontWeight: 800, marginBottom: 8, color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>
              {t.download.zipTitle}
            </h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: 20, lineHeight: 1.6 }}>
              {t.download.zipDesc}
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 28, fontSize: '0.88rem', color: 'var(--text-primary)' }}>
              {t.download.zipPoints.map((point, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Check size={16} color="var(--accent-emerald)" style={{ flexShrink: 0 }} />
                  <span>{point}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <a
              href={RELEASES_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary"
              style={{ width: '100%', padding: '14px', marginBottom: 12 }}
            >
              <Download size={18} style={{ flexShrink: 0 }} />
              <span>{t.download.zipBtn}</span>
            </a>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', textAlign: 'center' }}>
              {t.download.zipNote}
            </div>
          </div>
        </div>
      </div>

      {/* Verification & Environmental Specs */}
      <div className="glass-panel sha-panel">
        <div className="sha-head">
          <div className="sha-head-main">
            <ShieldCheck size={20} color="var(--accent-emerald)" style={{ flexShrink: 0 }} />
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              <strong>{t.download.shaTitle}</strong>：{t.download.shaDesc}
            </div>
          </div>
          <a
            href={RELEASES_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="sha-repo-link"
          >
            <span>{t.download.githubAll}</span>
            <ExternalLink size={14} />
          </a>
        </div>

        <div className="sha-assets">
          <div className="sha-assets-title">
            <Hash size={15} color="var(--accent-emerald)" />
            <span>{t.download.shaAssetsTitle}</span>
            <span className="sha-tag">{RELEASE_TAG}</span>
          </div>

          {RELEASE_ASSETS.map((asset) => (
            <div key={asset.name} className="sha-asset-row">
              <div className="sha-asset-meta">
                <a
                  href={asset.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="sha-asset-name"
                >
                  {asset.name}
                </a>
                <span className="sha-asset-size">{formatSize(asset.bytes)}</span>
              </div>
              <div className="sha-asset-hash">
                <code className="sha-hash">{asset.sha256}</code>
                {renderCopyButton(
                  asset.sha256,
                  `${t.download.shaCopy} ${asset.name} SHA-256`
                )}
              </div>
            </div>
          ))}

          <div className="sha-cmd">
            <span className="sha-cmd-label">{t.download.shaCmdLabel}</span>
            <code className="sha-cmd-code">{buildVerifyCommand(RELEASE_ASSETS[0].name)}</code>
            {renderCopyButton(
              buildVerifyCommand(RELEASE_ASSETS[0].name),
              `${t.download.shaCopy} ${t.download.shaCmdLabel}`
            )}
          </div>

          <p className="sha-footnote">{t.download.shaFootnote}</p>
        </div>
      </div>
    </section>
  );
};
