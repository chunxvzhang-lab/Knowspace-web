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

export const RELEASE_TAG = 'v2.3.0';

export const RELEASE_ASSETS: ReleaseAsset[] = [
  {
    name: 'KnowSpace-2.3.0.msi',
    bytes: 159784960,
    sha256: 'e7f6c40e89713a44c2b0feda3902107f2e8b84ed4846e50363069532940cf363',
    url: 'https://github.com/chunxvzhang-lab/KnowSpace/releases/download/v2.3.0/KnowSpace-2.3.0.msi',
  },
  {
    name: 'KnowSpace-Setup-2.3.0.exe',
    bytes: 147507449,
    sha256: 'bb4ce9918b84a9379f49c6c8a4eca2de3ba1fee4e2a2d34c6f53959d0515a6a8',
    url: 'https://github.com/chunxvzhang-lab/KnowSpace/releases/download/v2.3.0/KnowSpace-Setup-2.3.0.exe',
  },
  {
    name: 'KnowSpace-win-x64-portable.zip',
    bytes: 531654307,
    sha256: '8e6dd26f5e5995afeef02a3639e9436cb8586908293a1d8ed28446b7650ef865',
    url: 'https://github.com/chunxvzhang-lab/KnowSpace/releases/download/v2.3.0/KnowSpace-win-x64-portable.zip',
  },
];
