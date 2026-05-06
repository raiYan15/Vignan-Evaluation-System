# VIGNAN Internal Evaluator - Landing Page Documentation

## Overview

A modern, responsive React landing page designed to match the Vignan Online Evaluator reference design with a professional academic theme.

## Color Palette

- **Primary Blue**: `#2EA3F2`
- **Light Blue Overlay**: `rgba(46,163,242,0.65)`
- **Dark Text**: `#1f2937`
- **Accent Red**: `#ef4444`
- **Soft Background**: `#f5f9ff`
- **Footer Red**: `#991b1b`

## Component Structure

```
src/
├── pages/
│   └── Dashboard.tsx          # Main landing page composition
└── components/
    └── landing/
        ├── Navbar.tsx         # Accreditation badges + logo
        ├── HeroSection.tsx    # Full-screen hero with floating card
        ├── TaglineStrip.tsx   # Red tagline on blue background
        ├── AboutSection.tsx   # Glass card + image split layout
        ├── CampusBanner.tsx   # Campus image with purple-blue overlay
        ├── Accreditations.tsx # ABET logo + accreditation grid
        └── Footer.tsx         # Contact us + IAO badge
```

## Section Breakdown

### 1. Navbar
- **Purpose**: Build trust with accreditation badges
- **Layout**: 
  - Left: Horizontal row of circular badges
  - Right: Vignan logo + small accreditation labels
- **Mobile**: Scrollable horizontal badges

### 2. Hero Section
- **Background**: Full-viewport classroom image with light blue overlay
- **Layout**: Grid with empty left space for balance
- **Floating Card**: 
  - Center-right positioning
  - White glass effect with border
  - Evaluation icon, title, CTA button
- **Animation**: Fade-in on load

### 3. Tagline Strip
- **Background**: Solid `#2EA3F2` blue
- **Text**: Large bold red text
- **Content**: "Smarter Evaluation for the Next Generation of Education"

### 4. About Section
- **Background**: Soft blue `#f5f9ff`
- **Layout**: Two-column grid
  - **Left**: Glass content box
    - Small blue "About Us" label
    - Large red "VIGNAN Internal Evaluator" heading
    - Body text description
  - **Right**: Student working image with hover zoom
- **Animation**: Slide up on scroll into view

### 5. Campus Banner
- **Background**: Scenic campus/architecture image
- **Overlay**: Purple-blue gradient
- **Height**: Medium banner (responsive)

### 6. Accreditations
- **Top Section**: 
  - Large ABET logo (left)
  - Accreditation text block (right)
- **Bottom Section**: 
  - Grid of 8 accreditation logos
  - Responsive columns (2/3/4/8)
- **Animation**: Fade-in on scroll

### 7. Footer
- **Background**: Deep red `#991b1b`
- **Layout**: Multi-column grid
  - Contact information (address, email, phone)
  - IAO badge + description
- **Responsive**: Stacks vertically on mobile

## Key Features

### Animations
- ✅ Hero card fade-in
- ✅ Section slide-up on scroll
- ✅ Button hover with smooth transition
- ✅ Image hover zoom effect
- ✅ Smooth scroll behavior

### Responsiveness
- ✅ Desktop (1280px+)
- ✅ Tablet (768px-1279px)
- ✅ Mobile (320px-767px)
- ✅ Stacking layouts
- ✅ Horizontal scroll for badges
- ✅ Responsive typography

### Accessibility
- ✅ Semantic HTML (`<section>`, `<nav>`, `<footer>`, `<address>`)
- ✅ ARIA labels for icon-only buttons
- ✅ Keyboard focus visible
- ✅ Alt text for images
- ✅ Proper heading hierarchy

### Performance
- ✅ Lazy image loading
- ✅ Optimized animations (GPU-accelerated)
- ✅ Framer Motion for smooth transitions
- ✅ Production build optimized

## Typography

- **Headings**: System font stack (bold weights)
- **Body**: Default system sans-serif
- **Tracking**: Slightly increased for uppercase labels

## Interactive Elements

### CTA Button
- Gradient: Blue to sky blue
- Shadow: Soft blue glow
- Hover: Scale + shadow increase
- Transition: 300ms smooth

### Cards
- Hover: Lift effect (-translate-y)
- Border: Subtle on hover
- Transition: 300ms

### Images
- Hover: Scale 1.05
- Transition: 700ms ease

## Mobile Optimizations

1. **Hero Section**: Card becomes centered, stacks below headline
2. **About Section**: Vertical stack, image on top
3. **Accreditation Badges**: Horizontal scroll
4. **Footer**: Single column layout
5. **Typography**: Scales down appropriately

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Future Enhancements

- [ ] Add real logo images (currently using placeholders)
- [ ] Implement i18n for multi-language support
- [ ] Add analytics tracking
- [ ] Optimize images with next-gen formats (WebP/AVIF)
- [ ] Add preload hints for hero background

## Deployment Notes

1. Build command: `npm run build`
2. Output: `dist/` directory
3. Static hosting compatible (Vercel, Netlify, etc.)
4. No server-side rendering required

---

**Created**: February 2026
**Framework**: React + Vite + Tailwind CSS
**Animations**: Framer Motion
