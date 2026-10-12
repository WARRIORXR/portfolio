# Full Site Rebuild — Clean Minimal (21st.dev style)

**Direction:** Dark minimal aesthetic (like Vercel/Linear dark mode) that flows naturally out of the Three.js horizon hero: pure black background, thin `white/10` borders, mono uppercase section labels, large tracking-tight headings, subtle hover states. No more glassmorphism blur, neon glows, or sci-fi telemetry marks. All real content (bio, skills, GitHub repos, EmailJS contact) is preserved.

## 1. Design foundation
- **`src/index.css`** — keep shadcn CSS vars (black bg / white fg / muted), strip leftover cosmic utility classes, add minimal utilities (mono label, hairline dividers, underline-link).
- **`tailwind.config.js`** — remove unused glass/glow shadows & gradient keys; keep Inter + Fira Code fonts and accent palette.
- **`src/components/shared/SectionWrapper.jsx`** — restyle: mono label `01 — ABOUT`, big title, muted subtitle; thin top divider per section.

## 2. Layout & shell
- **`Navbar.jsx`** — rewrite minimal: name mark left ("Tanish Jaswal"), links About / Skills / Projects / Contact, Resume button right. Transparent → thin bottom border on scroll. Simple mobile menu.
- **`App.jsx`** — keep ScrollProgress + lazy HorizonHero; **remove the Works Wheel section** and the radial-gradient wrapper (flat black instead). Section IDs stay stable (`#about #skills #projects #contact`) so hero CTAs keep working.
- **`Footer.jsx`** — rewrite minimal: name, social icons (BrandIcons), back-to-top, © 2026.

## 3. Sections (rebuild all four)
- **About** — two-column: bio in large readable type + contact/email/location rows; right column education & Netmax experience as simple bordered lists; stats as a mono number row. Below: **ContributionSkyline** wired in.
  - New hook **`src/hooks/useGithubContributions.js`** — fetches real contribution data from `github-contributions-api.jogruber.de` (public, no auth); on failure passes `undefined` so the component falls back to its seeded generator.
- **Skills** — grouped by category (Python / ML / Tools) as clean lists with hairline dividers; name, short description, mono proficiency `85%`; subtle hover tint. No filter tabs (cleaner).
- **Projects** — rebuild as the **ProjectShowcase pattern** you just added: hover list with cursor-following image preview. Extend **`project-showcase.tsx`** to accept `projects` / `title` props (internal demo data stays as fallback). Map live GitHub repos (via existing `useGithubRepos`) → `{title, description, year, link, image}` where image = `https://opengraph.githubassets.com/1/WARRIORXR/{repo}` (GitHub's automatic repo card — reliable, no Unsplash). Footer link: "View all on GitHub". Delete old card-grid/modal.
- **Contact** — big "Let's build something." heading, minimal form with underline inputs + mono labels, kept EmailJS wiring + react-hot-toast, contact info + socials beside it.

## 4. Cleanup (deletions)
- Glass system: `GlassCard.jsx`, `GlassButton.jsx`, `GlassBadge.jsx`, `hooks/use3DTilt.js`
- Works wheel: `works-wheel.tsx`, `works-wheel-demo.tsx`
- Old projects UI: `ProjectCard.jsx`, `ProjectModal.jsx`
- Orphan: `demo.tsx`
- Dead data: `featuredProjects` export in `skills.js`

## 5. Assets & config fixes
- Move `Tanish_Jaswal_AI_ML_Resume_UPDATED.pdf` → `public/` (currently at repo root — the download link is broken in production).
- `vite.config.js` + `public/manifest.json` — point PWA icons at existing `favicon.svg`, theme color `#000000`; remove references to missing PNGs.
- `index.html` — keep SEO tags; point og:image at a valid path.

## 6. Kept as-is
- `horizon-hero-section.tsx` + its CSS (your choice), `BrandIcons.jsx`, `ScrollProgress.jsx`, `LoadingSpinner.jsx`, `lib/github.js`, `lib/emailjs.js`, `hooks/useGithubRepos.js`, `contribution-skyline.tsx` (only prop wiring added), all data files.

## 7. Verify
- `npm run build` clean, then dev server + browser check of every section, hover interactions, mobile layout, and the 2D/3D skyline toggle.
