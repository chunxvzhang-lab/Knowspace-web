/**
 * Official release assets for the current published version.
 *
 * These values are the authoritative SHA-256 digests reported by GitHub for
 * each uploaded asset. They are surfaced on the download section so that the
 * "verify the hash" promise in the copy is actually actionable.
 *
 * Source of truth: GitHub Releases API -> releases.tags[v].assets[].digest
 * Keep this in sync whenever a new version is published.
 */

export interface ReleaseAsset {
  /** Exact asset file name as published on GitHub Releases. */
  name: string;
  /** Asset size in bytes (used for the human-readable size column). */
  bytes: number;
  /** Lowercase hex SHA-256 digest of the asset. */
  sha256: string;
  /** Direct download URL for this asset. */
  url: string;
}

export const RELEASE_TAG = 'v2.0.0';

export const RELEASE_ASSETS: ReleaseAsset[] = [
  {
    name: 'KnowSpace-2.0.0.msi',
    bytes: 159752192,
    sha256: 'fd1d2f701f9821d62441ef9df3641a6da4ce82dfb065a354cade71bdc97fa2a1',
    url: 'https://github.com/chunxvzhang-lab/KnowSpace/releases/download/v2.0.0/KnowSpace-2.0.0.msi',
  },
  {
    name: 'KnowSpace-Setup-2.0.0.exe',
    bytes: 147483535,
    sha256: 'f597680c2ecb4c32b7e6aca9ed8e2ed828a001efcea2c91bbc2bcb36cf89b723',
    url: 'https://github.com/chunxvzhang-lab/KnowSpace/releases/download/v2.0.0/KnowSpace-Setup-2.0.0.exe',
  },
  {
    name: 'KnowSpace-win-x64-portable.zip',
    bytes: 384005722,
    sha256: 'ba1e2e2129a0c3846bb68d1a55483c38fe0a3edd24957522aa3f104662b2a6d8',
    url: 'https://github.com/chunxvzhang-lab/KnowSpace/releases/download/v2.0.0/KnowSpace-win-x64-portable.zip',
  },
];
