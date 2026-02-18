# Style Guide

## Iconography
- Principle: Use icons only when they convey essential meaning or action.
- Removed:
  - Search magnifier (🔍) replaced with “Search” label.
  - Confetti emojis (✨ 🎉 🌟) removed; replaced by subtle cleanse overlay animation.
  - Mood emojis (✨ 🧘 ☁️ 🌪️ 🌑) replaced with text labels and initials.
- Retained:
  - Carousel indicators (dots) kept as minimal shapes; no motion.

## Color Palette (WCAG 2.1 AA)
- Light Theme
  - Background: #F8FAFC
  - Text primary: #0F172A (contrast ~13:1 on background)
  - Text secondary: #334155 (contrast ~7:1)
  - Text muted: #475569 (contrast ~6:1)
  - Accent: #F59E0B
  - Brand: #8B5CF6
- Dark Theme
  - Background: #0a0a0c
  - Text primary: #E5E7EB (contrast ~12:1 on background)
  - Text secondary: #CBD5E1 (contrast ~10:1)
  - Text muted: #94A3B8 (contrast ~7:1)
  - Accent: #F59E0B
  - Brand: #A78BFA
- Implementation: CSS variables in index.css; classes text-primary, text-secondary, text-muted.

## Typography
- Font stacks:
  - Sans: system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, Noto Sans, Helvetica Neue, Arial
  - Serif: Georgia, Times New Roman
- Hierarchy:
  - heading-xl: 32px / 40px, bold
  - heading-lg: 24px / 32px, bold
  - heading-md: 18px / 28px, semibold
  - heading-sm: 14px / 20px, semibold
  - label: 12px / 16px, uppercase, 0.2em tracking
  - body-md: 14px / 24px
  - body-sm: 12px / 20px
- Usage: Replace decorative weights with classes above for consistency.

## Accessibility
- Contrast:
  - Normal text ≥ 4.5:1; large text ≥ 3:1
  - All new text tokens meet or exceed AA ratios
- Motion:
  - Removed pulse animations on chart points
  - Cleanse animation is brief (≤2s) and low-intensity
- Labels:
  - Replace ambiguous icons with explicit text labels
  - Maintain aria-labels for interactive controls

## Before / After Highlights
- Search field: “🔍” → “Search” label; improved clarity
- Mood selector: Emojis → text initials + labels; reduces ambiguity
- Confetti: Emojis → gradient pulse overlay; cleaner, less distracting
- Text colors: Unified tokens; increased legibility across themes

## Changelog of Removed Elements
- Removed magnifier icon in MyAffirmations search
- Removed emoji confetti in Hooponopono overlay
- Removed mood emojis in Dashboard selector
- Removed pulse animation on chart points

## Testing Results (WCAG AA)
- Contrast: All primary and secondary text verified ≥ AA thresholds
- Readability:
  - Increased body text line-height and consistent scale improved scanability
  - Labels replaced icons, reducing ambiguity in controls
- Devices: Verified responsive rendering across small (320px), tablet, and desktop widths

