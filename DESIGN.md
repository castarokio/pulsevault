---
name: PulseVault Design System
colors:
  surface: '#f7f9fb'
  surface-dim: '#d8dadc'
  surface-bright: '#f7f9fb'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f4f6'
  surface-container: '#eceef0'
  surface-container-high: '#e6e8ea'
  surface-container-highest: '#e0e3e5'
  on-surface: '#191c1e'
  on-surface-variant: '#3d494c'
  inverse-surface: '#2d3133'
  inverse-on-surface: '#eff1f3'
  outline: '#6d797d'
  outline-variant: '#bcc9cd'
  surface-tint: '#00687a'
  primary: '#00687a'
  on-primary: '#ffffff'
  primary-container: '#06b6d4'
  on-primary-container: '#00424f'
  inverse-primary: '#4cd7f6'
  secondary: '#6b38d4'
  on-secondary: '#ffffff'
  secondary-container: '#8455ef'
  on-secondary-container: '#fffbff'
  tertiary: '#006c49'
  on-tertiary: '#ffffff'
  tertiary-container: '#1bbd85'
  on-tertiary-container: '#00452e'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#acedff'
  primary-fixed-dim: '#4cd7f6'
  on-primary-fixed: '#001f26'
  on-primary-fixed-variant: '#004e5c'
  secondary-fixed: '#e9ddff'
  secondary-fixed-dim: '#d0bcff'
  on-secondary-fixed: '#23005c'
  on-secondary-fixed-variant: '#5516be'
  tertiary-fixed: '#6ffbbe'
  tertiary-fixed-dim: '#4edea3'
  on-tertiary-fixed: '#002113'
  on-tertiary-fixed-variant: '#005236'
  background: '#f7f9fb'
  on-background: '#191c1e'
  surface-variant: '#e0e3e5'
typography:
  display-lg:
    fontFamily: Outfit
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Outfit
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Outfit
    fontSize: 28px
    fontWeight: '600'
    lineHeight: 36px
  headline-md:
    fontFamily: Outfit
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-bold:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.05em
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 8px
  container-max: 1280px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 40px
---

## Brand & Style

This design system establishes a **Premium Gaming-Neon** aesthetic, bridging the gap between high-energy gaming culture and a sophisticated, trustworthy digital marketplace. It avoids the heavy, cluttered cliches of "cyberpunk" in favor of a clean, light-mode foundation that allows neon accents to pop with maximum vibrancy.

The personality is **Electric, Secure, and Forward-Thinking**. The UI utilizes a refined **Glassmorphism** style—layering translucent surfaces over soft-colored background glows—to create depth without visual bulk. This approach ensures the platform feels high-tech and "gamified" while maintaining the clarity and professionalism expected of a high-value digital asset vault.

## Colors

The palette centers on a pristine **Soft White (#F8FAFC)** foundation. This high-key background prevents the design from feeling oppressive and allows the accent colors to function as functional "energy" signals.

- **Electric Cyan (#06B6D4):** Used for primary actions, progress indicators, and core brand highlights.
- **Neon Violet (#8B5CF6):** Used for secondary interactions, premium tiers, and decorative gradients.
- **Mint Accent (#10B981):** Reserved for success states, pricing increases, and "verified" status indicators.

Interactive elements often utilize a "Glow" token—a soft, colored drop shadow that mimics a neon light tube reflecting off a polished surface.

## Typography

The typography strategy pairs the geometric, modern flair of **Outfit** for headlines with the industrial precision of **Inter** for UI and body text. 

Headlines should be set with tight letter spacing to feel impactful and "tech-forward." Labels utilize an uppercase, tracked-out style to mimic HUD (Heads-Up Display) elements common in premium gaming interfaces. For maximum readability, body text maintains a generous line height against the soft white background.

## Layout & Spacing

The design system employs a **12-column fluid grid** for desktop and a **4-column grid** for mobile. Spacing is governed by a strictly enforced **8px linear scale**, ensuring mathematical harmony across all components.

Layouts should favor generous whitespace ("Safe Zones") to maintain the premium feel. Components like "Glass Cards" should be spaced with at least 24px of gutter to allow their soft outer glows and drop shadows to breathe without overlapping adjacent elements.

## Elevation & Depth

Depth is achieved through **Glassmorphism** rather than traditional heavy shadows. 

1.  **Base Layer:** The soft white background (#F8FAFC) often features subtle, large-scale radial gradients of Cyan and Violet at 5% opacity to create "environmental lighting."
2.  **Surface Layer:** Translucent white panels (70-80% opacity) with a `backdrop-filter: blur(12px)`.
3.  **Edge Definition:** Instead of dark borders, use a 1px solid border with a gradient from `white` to `transparent` to simulate light catching the edge of the glass.
4.  **Neon Glow:** Active or featured elements use a `box-shadow` with the primary or secondary color, highly diffused (20px-40px blur) and low opacity (20-30%) to simulate a neon aura.

## Shapes

The shape language is **Rounded**, signaling approachability and modern hardware design (reminiscent of contemporary gaming consoles and peripherals). 

- **Standard UI (Inputs, Buttons):** 0.5rem (8px) radius.
- **Large Cards/Containers:** 1rem (16px) radius.
- **Featured Banners:** 1.5rem (24px) radius.

Avoid sharp 90-degree angles to distance the brand from the "aggressive" look of early 2000s gaming sites.

## Components

### Buttons
- **Primary:** Gradient background (Cyan to Violet), white text, 20px blur glow on hover.
- **Secondary:** Glass background, 1px Cyan border, Cyan text.
- **Ghost:** No background, Violet text, subtle scale-up animation on hover.

### Glass Cards
Cards must feature a `backdrop-filter: blur(16px)` and a thin, semi-transparent white border. For premium items, the border should be a subtle Cyan-to-Violet gradient.

### Input Fields
Soft white background with an inner shadow for a "recessed" look. On focus, the border glows Electric Cyan with a 4px outer spread.

### Chips & Tags
Pill-shaped with low-opacity neon backgrounds (e.g., 10% Cyan bg with 100% Cyan text). These represent categories like "Source Code," "Assets," or "License."

### Vibrant Accents
Use the Mint color (#10B981) specifically for "In Stock" indicators or "Price Drop" badges to provide a clear visual contrast to the brand's cool-toned primary palette.