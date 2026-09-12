# Worklog

---
Task ID: 1
Agent: main (Super Z)
Task: Build KHOJ landing page adapted from Mercury reference screenshot

Work Log:
- Analyzed /home/z/my-project/upload/Mercury page.png (1920x17079), sliced into 12 sections
- Extracted design tokens: ink #181623, body gray #636167, accent indigo #556AEC, cream #F6F5F2, lavender band #F5F4FD, lavender panel #EDECFB, surface #FCFCFA, dark footer #181623
- Identified section order: navbar -> hero (headline + email pill CTA + dashboard preview over art + floating cards + dark disclaimer bar) -> flower Venn "Figure A" section -> centered header + demo panel + left text -> 2 lavender cards -> tabs + diagram trust section + statement -> white band w/ 4 alternating feature rows -> runway cards -> 3 story cards on cream -> pricing table -> final CTA -> dark footer with footnotes
- Initialized fullstack env (Next.js 16, Tailwind 4, shadcn, framer-motion, lucide, Geist font)

Stage Summary:
- Mapping plan: Mercury sections -> KHOJ sections per user spec (hero, Figure A flower = PERSON/CASE/SIGHTING/NEWS/PUBLIC RECORD/FOUND PERSON/EVIDENCE, how-it-works 3 stages, 2 capability cards, evidence tabs+graph, 3 alternating capability rows, two-sided cards, guides cards, tech table, final CTA, footer)
- Decision: colors PRIORITIZE reference (indigo #556AEC accent) per user instruction #20
- Next: write tokens, demo data, primitives, then sections

---
Task ID: 2
Agent: main (Super Z)
Task: Implement KHOJ landing page (Next.js 16 + TS + Tailwind 4 + framer-motion + lucide)

Work Log:
- globals.css: added KHOJ @theme tokens (ink #181623, accent #556AEC, cream #F6F5F2, lav #F5F4FD/#ECEBF8, surface #FCFCFA), panel-grid, noise, waveform/mic keyframes, reduced-motion guards
- src/lib/demo-data.ts: all mock data isolated (case, lead, timeline, sources, tech stack, footer) with DEMO disclaimer
- Components under src/components/khoj/: primitives (KhojMark logo, PillButton, SectionHeader, FigureCaption), reveal.tsx (scroll animations), navbar (dropdowns + mobile menu), hero (eyebrow/headline/intake pill w/ mic toggle/abstract SVG art/floating edge cards/clipped dashboard window/disclaimer bar), product-preview (investigation dashboard w/ animated checklist + 91% score ring), diagram (Figure A flower: PERSON center + CASE/SIGHTING/NEWS/PUBLIC RECORD/FOUND PERSON/EVIDENCE petals, draw-in animation), how-it-works (3 stages + intake modal on grid panel), feature-cards (voice waveform + connected sources), evidence-section (SOURCE/MATCH/CONTRADICTION/TIMELINE tabs driving highlights in MISSING CASE -> KHOJ -> POTENTIAL LEAD graph), feature-section (matching/timeline/found rows), two-sided, guides (SVG illustrations), technology-section (7-item spec table), final-cta, footer (4 groups + disclaimers)
- page.tsx assembles bands: cream hero -> lavender band -> paper band -> cream band -> dark footer

Stage Summary:
- Fixed: evidence graph container needed explicit h-[400px] (absolute children collapsed it)
- Fixed: timeline tick overlap, connector line spans, mobile intake pill stacking, pill nowrap, clip heights
- Verified via agent-browser at 1600/1920/390 widths: all sections render, tabs/mic/dropdowns/mobile-menu work, no console errors, lint clean
- Full-page side-by-side vs reference confirms preserved visual rhythm

---
Task ID: 3
Agent: main (Super Z)
Task: Fix alignment issues reported by user (screenshots/cards misaligned, "I found someone" wrapping to two lines)

Work Log:
- Diagnosed via agent-browser at 1600/1280/1024/810/768/640/390 widths; user's viewport ~810px CSS
- primitives.tsx: PillButton base class now shrink-0 + whitespace-nowrap (no pill button can wrap anywhere)
- hero.tsx: intake form sm:w-auto sm:min-w-0 sm:flex-1 (form shrinks instead of squeezing button); container items-stretch on mobile; "I found someone" guaranteed one line at all widths
- product-preview.tsx: dashboard top bar — case title whitespace-nowrap, search field hidden below lg, New search/bell/avatar shrink-0 (no more wrapping at 768-860px)
- evidence-section.tsx: new ScaledEvidenceGraph wrapper (ResizeObserver) — 880px graph scales down proportionally below 880px (min 0.5, swipe only under 440px); fixes clipped "91% match" chip / POTENTIAL LEAD node at <1024px
- guides.tsx: grid md:grid-cols-3 (was sm:2/lg:3 which left an orphan card at 768-1023px); "Read the guide" pinned via mt-auto — all buttons align across cards
- feature-cards.tsx: mock slots get md:min-h-[390px] + justify-center; CTA buttons mt-auto — titles and buttons align across the two cards
- two-sided.tsx: same pattern (md:min-h-[224px] slots, flex text blocks, mt-auto buttons); fixed a misnested-div regression during edit
- diagram.tsx: typed Petal[] with optional name2 — removes 4 pre-existing TS errors, zero type errors in app src
- Verified at 810/640/390/1600: hero button one line, dashboard top bar one line, evidence graph fully visible at all widths, all card rows title+button aligned; eslint clean

Stage Summary:
- All reported misalignments fixed with structural patterns (shrink-0/nowrap for buttons, min-h+justify-center for mock slots, mt-auto for CTAs, scale-to-fit for fixed-canvas diagrams)
- No content changes; visual language untouched
