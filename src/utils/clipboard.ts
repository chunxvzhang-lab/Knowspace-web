/**
 * Copy text to the clipboard.
 *
 * Uses the async Clipboard API when available and silently falls back to a
 * hidden textarea + `document.execCommand('copy')`, which is still the only
 * option in non-secure contexts (plain http:// or file://).
 *
 * @returns whether the value was copied successfully.
 */
export async function copyText(value: string): Promise<boolean> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(value);
      return true;
    }
  } catch {
    // fall through to the legacy path
  }

  const area = document.createElement('textarea');
  area.value = value;
  area.setAttribute('readonly', '');
  area.style.position = 'fixed';
  area.style.top = '-1000px';
  area.style.opacity = '0';
  document.body.appendChild(area);
  area.select();
  try {
    return document.execCommand('copy');
  } catch {
    return false;
  } finally {
    document.body.removeChild(area);
  }
}

/** How long a "copied" confirmation should stay visible. */
export const COPY_FEEDBACK_MS = 2000;
