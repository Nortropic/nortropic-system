---
name: gsap-build
description: GSAP animation scaffolding for Nortropic Next.js 15 sites. Use when a PROJECT-BRIEF.md calls for scroll-driven or timeline animation on a Swedish local service site — hero reveals, scroll-triggered section entrances, counters, staggered lists. Covers @gsap/react (useGSAP), ScrollTrigger, SSR-safe setup, prefers-reduced-motion, and passing the Nortropic anti-slop + Lighthouse/CWV gates. Trigger with /gsap-build, or when asked to add GSAP motion to a client site.
argument-hint: "[component-or-page]"
---

# GSAP on a Nortropic site

GSAP is added **per project, only when the brief asks for it**. It is not part of the fixed stack. Motion must serve conversion (draw the eye to the phone/CTA, reinforce trust) — never decoration for its own sake. Every animation passes `nortropic-antislop` and the prelaunch performance/accessibility gates.

## Install (per project)

```bash
pnpm add gsap @gsap/react
```

`gsap` core + ScrollTrigger are free. Do **not** add Club GreenSock/bonus plugins (SplitText, MorphSVG, etc.) — they need a license and rarely serve a lead-gen site.

## The one correct pattern: `useGSAP` in a Client Component

GSAP touches the DOM, so it lives in a `"use client"` component. `useGSAP()` scopes selectors and auto-reverts on unmount (no manual cleanup, no leaks).

```tsx
"use client";
import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, useGSAP);

export function RevealSection({ children }: { children: React.ReactNode }) {
  const scope = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      // Respect reduced motion — hard requirement (a11y gate).
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      gsap.from(".gsap-item", {
        opacity: 0,
        y: 24,
        duration: 0.6,
        ease: "power2.out",
        stagger: 0.08,
        scrollTrigger: { trigger: scope.current, start: "top 80%" },
      });
    },
    { scope }, // selectors resolve only inside this ref
  );

  return <div ref={scope}>{children}</div>;
}
```

## SSR-safe rules (Next.js 15 App Router)

- The animated component is `"use client"`; the page/section stays a Server Component and passes children in.
- **Content must be visible without JS.** Never animate `from: { opacity: 0 }` on a wrapper that hides real content on first paint — if JS fails, the lead-gen copy and phone number must still render. Prefer `gsap.from` (starts at final state in the DOM, animates in) over `gsap.to` on hidden elements. If a flash is unacceptable, gate the initial hidden state behind a class you only add when JS runs.
- `registerPlugin` at module scope is fine; it's idempotent.

## Non-negotiables (gates)

- **prefers-reduced-motion**: every effect early-returns (or uses `gsap.matchMedia()`) when reduce is set. QA checks this.
- **Never animate the phone CTA away.** `<PhoneLink>`, the sticky header phone, and the floating call button must be visible and tappable at all times — no fade-in delay on the primary conversion path.
- **Performance budget**: GSAP core + ScrollTrigger is ~50 KB gz — acceptable, but keep it to pages that use it (dynamic import the client component if only one page animates). Watch CLS: animate `transform`/`opacity` only, never layout properties (width/height/top/margin). Lighthouse CLS must stay green.
- **Mobile**: verify the effect on a 360px viewport; disable heavy scroll effects on small screens if they hurt scroll performance.

## Nortropic fit

Good uses: hero headline + subhead staggered reveal, service cards entering on scroll, a trust-number counter (years in business, jobs done), a subtle sticky-CTA emphasis. Bad uses (anti-slop): parallax everything, spinning logos, scroll-jacking that fights the user, motion that delays the phone number.

See also: `nortropic-antislop`, `nortropic-prelaunch` — motion-craft review of the built result belongs to `design-reviewer`'s canon, `apple-design` (easing/physics taste).
