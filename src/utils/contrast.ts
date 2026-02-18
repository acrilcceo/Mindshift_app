export function parseColor(input: string): { r: number; g: number; b: number } | null {
  if (!input) return null;
  const s = input.trim().toLowerCase();
  if (s === 'transparent') return null;
  const m = s.match(/rgba?\((\d+)\s*,\s*(\d+)\s*,\s*(\d+)(?:\s*,\s*([\d.]+))?\)/);
  if (m) {
    const r = parseInt(m[1], 10);
    const g = parseInt(m[2], 10);
    const b = parseInt(m[3], 10);
    const a = m[4] !== undefined ? parseFloat(m[4]) : 1;
    if (a === 0) return null;
    return { r, g, b };
  }
  return null;
}

export function relLuminance({ r, g, b }: { r: number; g: number; b: number }): number {
  const toLin = (c: number) => {
    const v = c / 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  };
  const R = toLin(r);
  const G = toLin(g);
  const B = toLin(b);
  return 0.2126 * R + 0.7152 * G + 0.0722 * B;
}

export function contrastRatio(l1: number, l2: number): number {
  const hi = Math.max(l1, l2);
  const lo = Math.min(l1, l2);
  return (hi + 0.05) / (lo + 0.05);
}

export function getBackgroundColor(el: HTMLElement): { r: number; g: number; b: number } {
  let node: HTMLElement | null = el;
  while (node) {
    const cs = getComputedStyle(node);
    const parsed = parseColor(cs.backgroundColor);
    if (parsed) return parsed;
    node = node.parentElement;
  }
  return { r: 255, g: 255, b: 255 };
}

export function chooseTextColor(bg: { r: number; g: number; b: number }): string {
  const l = relLuminance(bg);
  const dark = { r: 33, g: 33, b: 33 };
  const light = { r: 255, g: 255, b: 255 };
  const rd = contrastRatio(l, relLuminance(dark));
  const rl = contrastRatio(l, relLuminance(light));
  return rd >= rl ? '#212121' : '#FFFFFF';
}

export function applyContrast(el: HTMLElement) {
  const bg = getBackgroundColor(el);
  const color = chooseTextColor(bg);
  const cs = getComputedStyle(el);
  const curColor = parseColor(cs.color);
  if (curColor) {
    const lText = relLuminance(curColor);
    const lBg = relLuminance(bg);
    const ratio = contrastRatio(lText, lBg);
    if (ratio >= 4.5) return;
  }
  el.style.color = color;
}

export function initContrastObserver() {
  const process = () => {
    const nodes = document.querySelectorAll<HTMLElement>('.ensure-contrast,[data-contrast="text"]');
    nodes.forEach((n) => applyContrast(n));
  };
  const mo = new MutationObserver(() => {
    process();
  });
  mo.observe(document.documentElement, { childList: true, subtree: true, attributes: true, attributeFilter: ['class', 'style'] });
  process();
  const mql = window.matchMedia('(prefers-color-scheme: dark)');
  mql.addEventListener('change', process);
  (window as any).addEventListener?.('theme-change', process);
}
