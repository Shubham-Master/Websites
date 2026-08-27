---
version: alpha
name: Unmute-design-system
description: A calm, warm, intimate storytelling platform. The system is built on Claude's editorial DNA — a tinted warm canvas, serif display headlines, humanist sans body, and a shadow-rare "color-block first" elevation philosophy — carrying its own original warm-ember accent rather than Anthropic's coral. A restrained, muted pastel mood-tag layer (structurally borrowed from Miro's sticky-note tag mechanic, recolored soft and warm) gives story genres/moods a quiet spark of personality without breaking the calm. Story covers borrow Airbnb's photo-first card pattern — rounded imagery with a floating badge — since intimacy here is carried by real story art, not abstract illustration.

colors:
  primary: "#c4674a"
  primary-active: "#a14f37"
  primary-disabled: "#e8d9d0"
  ink: "#1f1c19"
  body: "#433e38"
  body-strong: "#2b2622"
  muted: "#736a60"
  muted-soft: "#948a7e"
  hairline: "#e6ddd2"
  hairline-soft: "#eee7dd"
  canvas: "#faf6ef"
  surface-soft: "#f4ede0"
  surface-card: "#efe6d6"
  surface-cream-strong: "#e6d9c4"
  surface-dark: "#211d19"
  surface-dark-elevated: "#2c2622"
  surface-dark-soft: "#26211d"
  on-primary: "#ffffff"
  on-dark: "#faf6ef"
  on-dark-soft: "#a69a8b"
  tag-rose-bg: "#f3dcd6"
  tag-rose-text: "#8a4a3d"
  tag-sage-bg: "#dfe6d6"
  tag-sage-text: "#4c5c3d"
  tag-gold-bg: "#f2e3c4"
  tag-gold-text: "#7a5c1e"
  tag-lavender-bg: "#e6dcec"
  tag-lavender-text: "#5c4a72"
  tag-teal-bg: "#d9e6e2"
  tag-teal-text: "#3a5c55"
  success: "#5c7a4a"
  warning: "#b8862e"
  error: "#b0503f"

typography:
  display-xl:
    fontFamily: "Fraunces, Tiempos Headline, Georgia, serif"
    fontSize: 60px
    fontWeight: 400
    lineHeight: 1.08
    letterSpacing: -1px
  display-lg:
    fontFamily: "Fraunces, Tiempos Headline, Georgia, serif"
    fontSize: 44px
    fontWeight: 400
    lineHeight: 1.12
    letterSpacing: -0.5px
  display-md:
    fontFamily: "Fraunces, Tiempos Headline, Georgia, serif"
    fontSize: 32px
    fontWeight: 400
    lineHeight: 1.18
    letterSpacing: -0.3px
  display-sm:
    fontFamily: "Fraunces, Tiempos Headline, Georgia, serif"
    fontSize: 24px
    fontWeight: 400
    lineHeight: 1.25
    letterSpacing: 0
  display-italic-accent:
    fontFamily: "Fraunces, Tiempos Headline, Georgia, serif"
    fontSize: 24px
    fontWeight: 400
    fontStyle: italic
    lineHeight: 1.3
    letterSpacing: 0
  title-lg:
    fontFamily: "Inter, -apple-system, sans-serif"
    fontSize: 20px
    fontWeight: 500
    lineHeight: 1.3
    letterSpacing: 0
  title-md:
    fontFamily: "Inter, -apple-system, sans-serif"
    fontSize: 17px
    fontWeight: 500
    lineHeight: 1.4
    letterSpacing: 0
  title-sm:
    fontFamily: "Inter, -apple-system, sans-serif"
    fontSize: 15px
    fontWeight: 500
    lineHeight: 1.4
    letterSpacing: 0
  body-md:
    fontFamily: "Inter, -apple-system, sans-serif"
    fontSize: 16px
    fontWeight: 400
    lineHeight: 1.6
    letterSpacing: 0
  body-sm:
    fontFamily: "Inter, -apple-system, sans-serif"
    fontSize: 14px
    fontWeight: 400
    lineHeight: 1.55
    letterSpacing: 0
  caption:
    fontFamily: "Inter, -apple-system, sans-serif"
    fontSize: 13px
    fontWeight: 500
    lineHeight: 1.4
    letterSpacing: 0
  caption-uppercase:
    fontFamily: "Inter, -apple-system, sans-serif"
    fontSize: 11px
    fontWeight: 600
    lineHeight: 1.4
    letterSpacing: 1px
    textTransform: uppercase
  tag-label:
    fontFamily: "Inter, -apple-system, sans-serif"
    fontSize: 13px
    fontWeight: 500
    lineHeight: 1.3
    letterSpacing: 0
  button:
    fontFamily: "Inter, -apple-system, sans-serif"
    fontSize: 14px
    fontWeight: 500
    lineHeight: 1
    letterSpacing: 0
  nav-link:
    fontFamily: "Inter, -apple-system, sans-serif"
    fontSize: 14px
    fontWeight: 500
    lineHeight: 1.4
    letterSpacing: 0

rounded:
  xs: 4px
  sm: 6px
  md: 8px
  lg: 14px
  xl: 18px
  pill: 9999px
  full: 9999px

spacing:
  xxs: 4px
  xs: 8px
  sm: 12px
  md: 16px
  lg: 24px
  xl: 32px
  xxl: 48px
  section: 88px

components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    typography: "{typography.button}"
    rounded: "{rounded.md}"
    padding: 12px 22px
    height: 44px
  button-primary-active:
    backgroundColor: "{colors.primary-active}"
    textColor: "{colors.on-primary}"
    rounded: "{rounded.md}"
  button-primary-disabled:
    backgroundColor: "{colors.primary-disabled}"
    textColor: "{colors.muted}"
    rounded: "{rounded.md}"
  button-secondary:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    typography: "{typography.button}"
    rounded: "{rounded.md}"
    padding: 12px 22px
    height: 44px
    border: "1px solid {colors.hairline}"
  button-secondary-on-dark:
    backgroundColor: "{colors.surface-dark-elevated}"
    textColor: "{colors.on-dark}"
    typography: "{typography.button}"
    rounded: "{rounded.md}"
    padding: 12px 22px
  button-text-link:
    backgroundColor: transparent
    textColor: "{colors.ink}"
    typography: "{typography.button}"
  button-icon-circular:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    rounded: "{rounded.full}"
    size: 36px
    border: "1px solid {colors.hairline}"
  text-link:
    backgroundColor: transparent
    textColor: "{colors.primary}"
    typography: "{typography.body-md}"
  top-nav:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    typography: "{typography.nav-link}"
    height: 64px
  hero-band:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    typography: "{typography.display-xl}"
    padding: "{spacing.section}"
  story-cover-card:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    typography: "{typography.title-md}"
    rounded: "{rounded.lg}"
  story-cover-photo:
    rounded: "{rounded.lg}"
    shadow: "rgba(31, 28, 25, 0.06) 0px 4px 14px 0px"
  featured-badge:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    typography: "{typography.caption}"
    rounded: "{rounded.pill}"
    padding: 4px 10px
    shadow: "rgba(31, 28, 25, 0.08) 0px 2px 6px 0px"
  save-icon-circle:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    rounded: "{rounded.full}"
    size: 32px
  feature-card:
    backgroundColor: "{colors.surface-card}"
    textColor: "{colors.ink}"
    typography: "{typography.title-md}"
    rounded: "{rounded.lg}"
    padding: 28px
  reading-mockup-card-dark:
    backgroundColor: "{colors.surface-dark}"
    textColor: "{colors.on-dark}"
    typography: "{typography.title-md}"
    rounded: "{rounded.lg}"
    padding: 28px
  author-card:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    typography: "{typography.body-sm}"
    rounded: "{rounded.lg}"
    padding: 24px
    border: "1px solid {colors.hairline}"
  mood-tag-rose:
    backgroundColor: "{colors.tag-rose-bg}"
    textColor: "{colors.tag-rose-text}"
    typography: "{typography.tag-label}"
    rounded: "{rounded.pill}"
    padding: 5px 12px
  mood-tag-sage:
    backgroundColor: "{colors.tag-sage-bg}"
    textColor: "{colors.tag-sage-text}"
    typography: "{typography.tag-label}"
    rounded: "{rounded.pill}"
    padding: 5px 12px
  mood-tag-gold:
    backgroundColor: "{colors.tag-gold-bg}"
    textColor: "{colors.tag-gold-text}"
    typography: "{typography.tag-label}"
    rounded: "{rounded.pill}"
    padding: 5px 12px
  mood-tag-lavender:
    backgroundColor: "{colors.tag-lavender-bg}"
    textColor: "{colors.tag-lavender-text}"
    typography: "{typography.tag-label}"
    rounded: "{rounded.pill}"
    padding: 5px 12px
  mood-tag-teal:
    backgroundColor: "{colors.tag-teal-bg}"
    textColor: "{colors.tag-teal-text}"
    typography: "{typography.tag-label}"
    rounded: "{rounded.pill}"
    padding: 5px 12px
  reading-progress-bar:
    backgroundColor: "{colors.surface-cream-strong}"
    fillColor: "{colors.primary}"
    rounded: "{rounded.full}"
    height: 4px
  text-input:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    typography: "{typography.body-md}"
    rounded: "{rounded.md}"
    padding: 11px 14px
    height: 44px
    border: "1px solid {colors.hairline}"
  text-input-focused:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
  callout-card-ember:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    typography: "{typography.display-sm}"
    rounded: "{rounded.lg}"
    padding: 48px
  cta-band-dark:
    backgroundColor: "{colors.surface-dark}"
    textColor: "{colors.on-dark}"
    typography: "{typography.display-sm}"
    rounded: "{rounded.lg}"
    padding: 64px
  footer:
    backgroundColor: "{colors.surface-dark}"
    textColor: "{colors.on-dark-soft}"
    typography: "{typography.body-sm}"
    padding: 64px
---

## Overview

Unmute is a calm, warm, intimate storytelling platform — closer to a well-lit reading nook than a content feed. The base atmosphere follows Claude's editorial DNA: a **tinted warm canvas** (`{colors.canvas}` — #faf6ef), dark warm-ink text, and a **serif display voice** for story titles and headlines, paired with a quiet humanist sans for everything functional. Nothing here is copied from Anthropic's brand directly — the accent color, the exact cream tone, and the type family are all original to Unmute — but the *structure* (warm-neutral canvas, editorial serif/sans split, shadow-rare elevation, a dark "immersive" secondary surface) is deliberately inherited because it is the closest existing pattern to "calm, warm, intimate."

Two small, tightly scoped borrowings keep the system from feeling severe:

1. **A muted pastel mood-tag layer** (structurally borrowed from Miro's sticky-note tag mechanic, but recolored soft and warm — no candy brights) gives story genres and moods — cozy, nostalgic, tender, funny, thrilling — a quiet spark of color. This is the system's *only* playful device, and it is confined to tags/chips. Buttons, nav, and cards stay in the restrained serif/cream/ember palette.
2. **Photo-first story-cover cards** (borrowed from Airbnb's listing-card pattern: rounded cover art, a floating "Featured" badge, a save/heart affordance) — because intimacy in a storytelling product is carried by the story's own cover art, not by illustration or iconography.

Everything else — button shape, spacing rhythm, elevation philosophy, dark-surface pacing — stays close to the calm/editorial base rather than Miro's confident-SaaS energy or Airbnb's marketplace density.

**Key Characteristics:**
- Warm tinted canvas (`{colors.canvas}` — #faf6ef) with warm dark ink (`{colors.ink}` — #1f1c19). Never pure white, never cool gray.
- Original **ember accent** (`{colors.primary}` — #c4674a) — a muted warm terracotta, distinct from any reference brand's accent. Used scarcely: primary CTAs, the reading-progress fill, one full-bleed callout card.
- **Serif display** (Fraunces / Tiempos Headline, weight 400, negative tracking) for story titles, hero headlines, and section heads — the literary voice that makes this a storytelling product, not a SaaS tool. Body and UI stay in Inter.
- **Muted pastel mood-tags** — five soft, warm-leaning pill colors (rose, sage, gold, lavender, teal) — the system's sole playful/funky device, scoped entirely to genre/mood chips.
- **Photo-first story-cover cards** — rounded cover art, floating pill badge, circular save icon — echoing Airbnb's listing-card warmth, adapted for story covers instead of property photos.
- Shadow-rare, color-block-first elevation (Claude's philosophy) — the calm reads through the near-total absence of drop shadows; the one exception is a soft shadow under story-cover photography and floating badges.
- A dark "night reading" surface (`{colors.surface-dark}`) as the immersive secondary mode — reused from Claude's dark-product-surface pattern, reframed here as literal night/reading-mode chrome rather than code mockups.
- Section rhythm `{spacing.section}` (88px) — generous but slightly tighter than Claude's 96px, since story-card grids need a touch more density than pure marketing copy.

## Colors

### Brand & Accent
- **Ember** (`{colors.primary}` — #c4674a): Unmute's own warm terracotta accent. Used on primary CTAs ("Start reading", "Publish"), the reading-progress bar fill, and one full-bleed callout card per page at most. Deliberately muted — never as saturated as Airbnb's Rausch or as cool as anything blue.
- **Ember Active** (`{colors.primary-active}` — #a14f37): Press/active state.
- **Ember Disabled** (`{colors.primary-disabled}` — #e8d9d0): Pale desaturated disabled state.

### Mood Tags (the playful layer)
- **Rose** (`{colors.tag-rose-bg}` / `{colors.tag-rose-text}`): tender, romantic stories.
- **Sage** (`{colors.tag-sage-bg}` / `{colors.tag-sage-text}`): calm, reflective, nature-toned stories.
- **Gold** (`{colors.tag-gold-bg}` / `{colors.tag-gold-text}`): nostalgic, warm-memory stories.
- **Lavender** (`{colors.tag-lavender-bg}` / `{colors.tag-lavender-text}`): dreamy, whimsical, funny stories.
- **Teal** (`{colors.tag-teal-bg}` / `{colors.tag-teal-text}`): thrilling, suspenseful stories.

All five are muted, low-saturation pastels — closer to dried flowers than sticky notes. This is the one place Miro's "tag mechanic" survives; the actual hues are original and stay inside the warm family (no bright yellow, no candy pink).

### Surface
- **Canvas** (`{colors.canvas}` — #faf6ef): Default page floor.
- **Surface Soft** (`{colors.surface-soft}` — #f4ede0): Section dividers, soft band backgrounds.
- **Surface Card** (`{colors.surface-card}` — #efe6d6): Feature cards, content cards.
- **Surface Cream Strong** (`{colors.surface-cream-strong}` — #e6d9c4): Emphasized bands, progress-bar track.
- **Surface Dark** (`{colors.surface-dark}` — #211d19): Night-reading mode, footer.
- **Surface Dark Elevated** (`{colors.surface-dark-elevated}` — #2c2622): Elevated panels inside dark surfaces.
- **Surface Dark Soft** (`{colors.surface-dark-soft}` — #26211d): Inner panels within larger dark cards.
- **Hairline** (`{colors.hairline}` — #e6ddd2): Default 1px border.
- **Hairline Soft** (`{colors.hairline-soft}` — #eee7dd): Barely-visible dividers.

### Text
- **Ink** (`{colors.ink}` — #1f1c19): Headlines, primary text.
- **Body Strong** (`{colors.body-strong}` — #2b2622): Emphasized paragraphs, lead text.
- **Body** (`{colors.body}` — #433e38): Default running text.
- **Muted** (`{colors.muted}` — #736a60): Sub-headings, breadcrumbs, byline text.
- **Muted Soft** (`{colors.muted-soft}` — #948a7e): Captions, fine print.
- **On Primary** (`{colors.on-primary}` — #ffffff): Text on ember buttons.
- **On Dark** (`{colors.on-dark}` — #faf6ef): Cream-tinted text on dark/night surfaces.
- **On Dark Soft** (`{colors.on-dark-soft}` — #a69a8b): Footer body, secondary labels in night mode.

### Semantic
- **Success** (`{colors.success}` — #5c7a4a), **Warning** (`{colors.warning}` — #b8862e), **Error** (`{colors.error}` — #b0503f): Muted, warm-shifted versions of standard semantic colors — never neon.

## Typography

### Font Family
**Fraunces** (or **Tiempos Headline** as substitute) carries every display headline and story title — a serif with enough warmth and slight quirk to feel literary rather than corporate, at weight 400 with negative tracking. **Inter** carries body copy, UI labels, navigation, and tags. There is no third "playful" typeface — the funky touch lives in color and shape, not in an additional font family, to keep the voice coherent.

- Fraunces serif (400, negative tracking) → h1–h3, story titles, hero display
- Inter (400 body / 500 labels) → body copy, navigation, buttons, tags, captions
- An **italic serif accent** (`{typography.display-italic-accent}`) is reserved for pull-quotes and story excerpts — the one deliberately expressive typographic moment in the system.

### Hierarchy

| Token | Size | Weight | Line Height | Letter Spacing | Use |
|---|---|---|---|---|---|
| `{typography.display-xl}` | 60px | 400 | 1.08 | -1px | Homepage hero ("Stories worth staying up for") |
| `{typography.display-lg}` | 44px | 400 | 1.12 | -0.5px | Section heads, collection titles |
| `{typography.display-md}` | 32px | 400 | 1.18 | -0.3px | Story title on a story page |
| `{typography.display-sm}` | 24px | 400 | 1.25 | 0 | Callout headlines, card titles in feature bands |
| `{typography.display-italic-accent}` | 24px | 400 italic | 1.3 | 0 | Pull-quotes, story excerpts |
| `{typography.title-lg}` | 20px | 500 | 1.3 | 0 | Collection/author page names |
| `{typography.title-md}` | 17px | 500 | 1.4 | 0 | Story-cover card titles, feature card titles |
| `{typography.title-sm}` | 15px | 500 | 1.4 | 0 | List labels, byline names |
| `{typography.body-md}` | 16px | 400 | 1.6 | 0 | Story body copy, default running text |
| `{typography.body-sm}` | 14px | 400 | 1.55 | 0 | Card meta, footer text |
| `{typography.caption}` | 13px | 500 | 1.4 | 0 | Featured badge, small labels |
| `{typography.caption-uppercase}` | 11px | 600 | 1.4 | 1px (uppercase) | Section eyebrow labels |
| `{typography.tag-label}` | 13px | 500 | 1.3 | 0 | Mood-tag pill text |
| `{typography.button}` | 14px | 500 | 1.0 | 0 | Button labels |
| `{typography.nav-link}` | 14px | 500 | 1.4 | 0 | Top-nav items |

### Principles
Display sizes stay at weight 400 — never bold. The serif's own warmth carries the emphasis; going heavier would push the voice from "literary" toward "editorial magazine cover," which reads too loud for an intimate product. Negative letter-spacing on display sizes (-0.3 to -1px) is what keeps Fraunces from feeling loose at large sizes.

The single expressive typographic device is the **italic serif accent** for pull-quotes — this is where a story's voice is allowed to feel distinct and a little dramatic, contained to a specific, sparingly-used token rather than let loose across the whole system.

### Note on Font Substitutes
If Fraunces is unavailable, **Lora** or **Cormorant Garamond** (weight 500) are close warm-serif substitutes. If Inter is unavailable, **system-ui** stacks cleanly since Inter's proportions are near-native on most platforms.

## Layout

### Spacing System
- **Base unit:** 4px.
- **Tokens:** `{spacing.xxs}` 4px · `{spacing.xs}` 8px · `{spacing.sm}` 12px · `{spacing.md}` 16px · `{spacing.lg}` 24px · `{spacing.xl}` 32px · `{spacing.xxl}` 48px · `{spacing.section}` 88px.
- **Section padding:** `{spacing.section}` (88px) — generous, editorial, but slightly tighter than a pure-marketing site since story grids need more density.
- **Card internal padding:** `{spacing.xl}` (32px) for feature/author cards; `{spacing.lg}` (24px) for story-cover meta blocks.

### Grid & Container
- **Max content width:** ~1160px centered.
- **Story-cover grid:** 3-up desktop, 2-up tablet, 1-up mobile — photo-first cards with `{spacing.md}` (16px) gutters.
- **Story reading page:** single-column, capped at ~680px for comfortable line length, serif body optional as an accessibility toggle.
- **Hero:** 6/6 split — h1 + sub-headline + CTA row left, a story-cover collage or single hero cover right.

### Whitespace Philosophy
Generous vertical rhythm between sections (88px) signals unhurried, calm pacing — the opposite of a dense content feed. Story-cover grids tighten to 16px gutters so the browsing experience still feels like flipping through a shelf of books, not scrolling an infinite feed.

## Elevation & Depth

Shadow-rare, color-block-first — inherited directly from Claude's philosophy, because restraint here *is* the calm.

| Level | Treatment | Use |
|---|---|---|
| Flat | No shadow | Body, hero, footer, nav — the vast majority of the page |
| Soft hairline | 1px `{colors.hairline}` border | Inputs, author cards, occasional dividers |
| Cream card | `{colors.surface-card}` background, no shadow | Feature cards |
| Dark surface | `{colors.surface-dark}` background, no shadow | Night-reading mode, footer |
| Soft photo shadow | `rgba(31,28,25,0.06) 0 4px 14px` | Story-cover photography only |
| Badge float | `rgba(31,28,25,0.08) 0 2px 6px` | Featured badge over cover art |

No progressive elevation ladder beyond this — depth comes from the cream-vs-dark surface contrast and from cover photography, not from stacked shadow tiers.

## Shapes

### Border Radius Scale

| Token | Value | Use |
|---|---|---|
| `{rounded.xs}` | 4px | Tiny inline accents |
| `{rounded.sm}` | 6px | Small dropdown items |
| `{rounded.md}` | 8px | Buttons, inputs — restrained, not pill-shaped |
| `{rounded.lg}` | 14px | Content cards, story-cover cards, feature cards |
| `{rounded.xl}` | 18px | Hero cover container, larger marquee elements |
| `{rounded.pill}` | 9999px | Mood-tag pills, featured badge only |
| `{rounded.full}` | 9999px | Save-icon circles, avatars |

Buttons stay rectangular with modest 8px rounding — deliberately **not** pill-shaped — to keep the primary interactive language calm and editorial rather than confident-SaaS. Pill rounding is reserved for the mood-tag layer and the featured badge, so "playful" reads as a contained accent rather than a system-wide shape change.

## Components

### Top Navigation
**`top-nav`** — Cream bar, 64px tall, `{colors.canvas}` background. Wordmark left, primary nav center (Explore, Collections, Write), "Sign in" text-link + `{component.button-primary}` ("Start reading") right.

### Buttons
**`button-primary`** — Ember fill, white text, `{rounded.md}` (8px), 44px height. The system's single accent-color moment on most pages.
**`button-secondary`** — Cream fill, hairline border, ink text. Same shape/size as primary.
**`button-secondary-on-dark`** — For night-reading mode surfaces; stays dark, never inverts to light.
**`button-text-link`** / **`text-link`** — Inline, ember-colored for body links.
**`button-icon-circular`** — 36px circular utility button (share, bookmark-adjacent actions).

### Story Cards (Airbnb-derived pattern)
**`story-cover-card`** — Photo-first card: `{component.story-cover-photo}` (rounded 14px, soft shadow) with a `{component.featured-badge}` floating top-left on select cards and a `{component.save-icon-circle}` top-right. Beneath: title in `{typography.title-md}`, author byline in `{typography.body-sm}` muted, and up to two `{component.mood-tag-*}` pills.
**`featured-badge`** — Small cream pill with soft float-shadow, `{typography.caption}`, e.g. "Editor's pick."
**`save-icon-circle`** — 32px circle, outlined default, ember-filled when saved.

### Mood Tags (Miro-derived pattern, recolored)
**`mood-tag-rose`**, **`mood-tag-sage`**, **`mood-tag-gold`**, **`mood-tag-lavender`**, **`mood-tag-teal`** — Pill-shaped (`{rounded.pill}`), `{typography.tag-label}`, 5×12px padding. The only saturated color moments outside of ember — used two-at-a-time max per card so they read as a light accent, not a wall of color.

### Cards & Containers
**`feature-card`** — Cream-card background, `{rounded.lg}`, 28px padding. Icon + title + short body text, used in "How Unmute works" style sections.
**`reading-mockup-card-dark`** — Dark surface card showing the actual night-reading UI (story text on dark, progress bar, font-size control) — Claude's product-mockup pattern reframed as literal product chrome.
**`author-card`** — Hairline-bordered card, avatar + name + short bio + follow button.
**`reading-progress-bar`** — 4px pill track (`{colors.surface-cream-strong}`) with ember fill — the small ambient reminder of where a reader is in a story.

### Inputs & Forms
**`text-input`** — Cream fill, hairline border, `{rounded.md}`, 44px height.
**`text-input-focused`** — Border shifts to ember.

### CTA / Footer
**`callout-card-ember`** — Full-bleed ember card for a single major CTA per page (e.g., "Start your own story"). Used sparingly — at most once per page.
**`cta-band-dark`** — Dark pre-footer band, often paired with `{component.reading-mockup-card-dark}`.
**`footer`** — Dark surface, `{colors.on-dark-soft}` text, 4-column link list, 64px padding.

## Do's and Don'ts

### Do
- Anchor every page on the warm cream canvas. Never pure white, never cool gray.
- Use Fraunces serif for every story title and display headline; keep it at weight 400.
- Keep mood-tag pastels muted and warm-leaning — dried-flower tones, not candy brights.
- Reserve pill-shape rounding for mood-tags and the featured badge only; buttons stay rectangular.
- Use real story cover art in `{component.story-cover-card}` rather than abstract illustration.
- Keep shadows rare — only on cover photography and floating badges.

### Don't
- Don't introduce a second display typeface for "playful" moments — color and shape carry that job.
- Don't make buttons pill-shaped — that would blur the line between the calm base and the playful accent layer.
- Don't use more than two mood-tags per card — the accent should read as a spark, not a wall of color.
- Don't copy Anthropic's coral, Airbnb's Rausch, or Miro's yellow verbatim — Unmute's ember accent is its own hue.
- Don't add hover-only styling beyond what's documented — default and active/pressed states only.

## Responsive Behavior

| Name | Width | Key Changes |
|---|---|---|
| Mobile | < 768px | Hamburger nav; hero collapses to stacked; story-cover grid 1-up; mood-tags wrap to 1-2 per card visible, rest under "+N"; footer 4 cols → 1 |
| Tablet | 768–1024px | Story-cover grid 2-up; nav stays horizontal |
| Desktop | 1024–1440px | Story-cover grid 3-up; full nav; hero 6/6 split |
| Wide | > 1440px | Content caps at 1160px; gutters absorb the rest |

### Touch Targets
- `{component.button-primary}` at 44×44px minimum.
- `{component.save-icon-circle}` at 32px — compensated by generous padding within the cover card.
- `{component.text-input}` height 44px.

### Collapsing Strategy
- Top nav collapses to hamburger below 768px.
- Story-cover grid reduces columns rather than shrinking cards.
- Reading page stays single-column at every breakpoint; only the side margin changes.

## Known Gaps

- Fraunces and Inter are both freely available (Google Fonts), unlike Claude's licensed Copernicus/StyreneB — no substitute chain is strictly required, though Lora/Cormorant Garamond are documented as backups.
- Animation/transition timings (page transitions, reading-progress fill animation) are not specified — recommend 150–200ms ease, consistent with the system's overall restraint.
- Dark "night reading" mode's typography-scale adjustments (font-size stepper for accessibility) are referenced structurally but not tokenized here.
- Author/profile page patterns beyond `{component.author-card}` are not fully specified.
