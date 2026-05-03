import React, { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useScroll, useTransform } from "framer-motion";
import {
  createEssay,
  deleteEssay,
  deletePhoto,
  getSession,
  loadContent,
  onAuthStateChange,
  signInWithEmail,
  signOut,
  uploadPhotos,
} from "./lib/contentApi";
import { ADMIN_EMAIL, isAdminUser, isSupabaseConfigured } from "./lib/supabase";

const outlineItems = [
  { id: "about", label: "About Me" },
  { id: "education", label: "Education" },
  { id: "practice", label: "Practice" },
  { id: "essays", label: "Field Notes" },
  { id: "interests", label: "Interests" },
];

const themeTargets = [{ id: "hero", label: "Opening" }, ...outlineItems];

const essayCategories = [
  "Market Notes",
  "Web3 Signals",
  "AI Tools",
  "Photography",
  "Music & Stage",
  "Life Notes",
];

const photoCategories = ["All", "Landscape", "City", "Details", "Panorama", "Documentary"];
const uploadPhotoCategories = ["Landscape", "City", "Details", "Panorama", "Documentary"];

const aboutCards = [
  {
    title: "Engineering Grounding",
    words: "Systems thinking, data handling, technical training",
    body: "I tend to map the structure first, then look at variables, boundaries, and outcomes.",
  },
  {
    title: "Finance Transition",
    words: "Capital markets, valuation, risk discipline",
    body: "Markets pushed me to think beyond price movement, toward value, cycles, and discipline.",
  },
  {
    title: "Ways Of Expression",
    words: "Music, photography, writing, conversation",
    body: "Rhythm, images, and words keep another channel open for observing the world.",
  },
  {
    title: "Tool Curiosity",
    words: "AI, Web3, devices, workflows",
    body: "I care less about novelty itself and more about how tools enter real learning and creation.",
  },
];

const educationItems = [
  {
    school: "Heilongjiang University",
    degree: "Hydraulic and Hydropower Engineering | B.Eng.",
    period: "Engineering",
    body: "My undergraduate training built a technical base in engineering computation, structured analysis, data handling, project design, and water resources systems. It shaped the way I break down problems.",
  },
  {
    school: "East China Normal University",
    degree: "Master of Finance | Graduate Study",
    period: "Finance",
    body: "For graduate study, I am moving into finance and applying engineering habits to capital markets, company research, investment analysis, and equity financing contexts.",
  },
];

const practiceGroups = [
  {
    eyebrow: "A",
    title: "Engineering And Innovation",
    body: "Engineering competitions and project work trained me to translate complex problems into structure, parameters, process, and outcome. I am less interested in ideas that sound good and more interested in systems that can be reasoned through, tested, and built.",
    tags: ["Water Engineering", "Innovation Design", "Smart Irrigation", "Engineering Design", "Data Handling"],
    projects: [
      {
        name: "Water Innovation Design Competition",
        body: "Designed a multi-layer phosphorus removal system combining mechanical adjustment, monitoring feedback, biological enhancement, and data management.",
      },
      {
        name: "Smart Irrigation Project",
        body: "Worked on a smart drip irrigation project involving soil moisture recognition, U-Net assisted monitoring, budgeting, and cash-flow planning.",
      },
      {
        name: "Pharma Cloud Pavilion",
        body: "Helped shape a health-tech platform business plan, including market positioning, revenue model, company registration, and early financing preparation.",
      },
    ],
  },
  {
    eyebrow: "B",
    title: "Markets And Finance",
    body: "My interest in markets started during my junior year and expanded from A-shares and Hong Kong equities to crypto. I want to understand not only price movement, but also business value, market structure, risk control, and long-term strategy.",
    tags: ["A-shares", "Hong Kong Equities", "Fundamentals", "DCF Valuation", "ECM", "Private Placement"],
    projects: [],
  },
  {
    eyebrow: "C",
    title: "Web3 And Crypto",
    body: "In Web3, I have explored DeFi, staking, airdrops, launch events, token issuance, and on-chain interaction, while reading crypto white papers along the way. It helped me understand yield structures, incentive design, and risk exposure on-chain.\n\nI also experienced the failure of high-leverage contract trading. It is not something to romanticize, but it made position sizing, leverage, risk, and discipline feel concrete.",
    tags: ["DeFi", "On-chain Staking", "Airdrops", "Token Launches", "White Papers", "BTC / ETH / SOL"],
    projects: [],
  },
  {
    eyebrow: "D",
    title: "International Exchange",
    body: "During college, I joined an international youth association and worked on cultural exchange activities. I often talked with students from Japan, Russia, the United States, Europe, Africa, and other backgrounds. For me, conversation is not just social energy. It is a way of learning.\n\nI also joined national-level international exchange projects and collaborated with students from different countries on shared project work.",
    tags: ["International Youth Association", "Cultural Exchange", "Global Students", "China Exchange Projects", "Collaboration"],
    projects: [],
  },
];

const musicMembers = [
  { role: "Keyboard", name: "Henry" },
  { role: "Guitar", name: "Mr. Jiang" },
  { role: "Vocal", name: "Miss Wang" },
  { role: "Drums", name: "Cui Xiwen" },
];

const performances = [
  "Campus Bee Music Festival",
  "Calling Northeast Music Festival",
  "Qiqihar University Music Festival",
  "University music events",
  "SUBLIFE performance collaboration in Harbin",
  "Collaborations with musicians from Harbin universities",
  "Collaboration with the band Duange",
];

const interestBlocks = [
  {
    key: "badminton",
    title: "Badminton",
    body: "Badminton has been one of my long-term sports through college. It trained reaction speed, tempo, judgment, and steadiness under pressure.",
    tags: ["Badminton Club", "School Team", "Four-plus Years", "Singles", "Doubles", "Levi Cup"],
  },
  {
    key: "ai",
    title: "AI And Devices",
    body: "I keep a long-term interest in AI and digital tools. Instead of simply trying new tools, I care about how they become part of real workflows for learning, writing, research, data organization, and content creation.",
    tags: ["ChatGPT", "Claude", "Gemini", "Grok", "Cursor", "Coolapk", "ROM Flashing", "System Tuning", "Mobile Photography"],
  },
  {
    key: "social",
    title: "People And Exchange",
    body: "I enjoy talking with people from different backgrounds. For me, social interaction is not just small talk. It is another way to understand the world.",
    tags: ["ENFP", "Conversation", "Learning From Others", "International Youth Association", "Global Exchange", "Cross-cultural Projects"],
  },
];

const sceneThemes = {
  hero: {
    id: "hero",
    index: "00",
    label: "Opening Field",
    title: "Mountain Signal",
    visual: "mountain",
    accent: "#6f7b6d",
    ink: "#282521",
    muted: "#9a9389",
    surface:
      "linear-gradient(145deg, #f7f5ef 0%, #e7e9df 42%, #f1efe8 72%, #d7d6ce 100%)",
    sectionPlane:
      "linear-gradient(180deg, rgba(255,255,255,0.18), rgba(229,226,216,0.24))",
  },
  about: {
    id: "about",
    index: "01",
    label: "Identity",
    title: "Personal Coordinates",
    visual: "identity",
    accent: "#2f6654",
    ink: "#17251f",
    muted: "#8d958e",
    surface:
      "linear-gradient(135deg, #f5f6ef 0%, #dce9e2 38%, #f2efe6 70%, #e4dac8 100%)",
    sectionPlane:
      "linear-gradient(135deg, rgba(255,255,255,0.18), rgba(204,226,216,0.28))",
  },
  education: {
    id: "education",
    index: "02",
    label: "Education",
    title: "Campus Timeline",
    visual: "education",
    accent: "#5d6f98",
    ink: "#1d2435",
    muted: "#8a8f9c",
    surface:
      "linear-gradient(135deg, #f3f5f7 0%, #d9e2ef 36%, #f2eee3 68%, #d8d0c2 100%)",
    sectionPlane:
      "linear-gradient(135deg, rgba(255,255,255,0.16), rgba(200,213,232,0.3))",
  },
  practice: {
    id: "practice",
    index: "03",
    label: "Practice",
    title: "Blueprint Motion",
    visual: "practice",
    accent: "#146f79",
    ink: "#10262b",
    muted: "#79959a",
    surface:
      "linear-gradient(135deg, #eff7f5 0%, #cfe6e5 34%, #ecebd9 66%, #d4dfd3 100%)",
    sectionPlane:
      "linear-gradient(135deg, rgba(255,255,255,0.12), rgba(183,222,220,0.3))",
  },
  essays: {
    id: "essays",
    index: "04",
    label: "Writing",
    title: "Paper And Signal",
    visual: "essays",
    accent: "#805443",
    ink: "#2b211c",
    muted: "#9c8b80",
    surface:
      "linear-gradient(135deg, #f7f2e8 0%, #eadfcd 35%, #f4f0e5 64%, #d9e1d9 100%)",
    sectionPlane:
      "linear-gradient(135deg, rgba(255,255,255,0.2), rgba(229,210,189,0.28))",
  },
  interests: {
    id: "interests",
    index: "05",
    label: "Interests",
    title: "Rhythm Archive",
    visual: "interests",
    accent: "#725a8a",
    ink: "#241d2f",
    muted: "#91869d",
    surface:
      "linear-gradient(135deg, #f2f0f5 0%, #ddd5e9 32%, #e8efe6 66%, #d8d3c5 100%)",
    sectionPlane:
      "linear-gradient(135deg, rgba(255,255,255,0.18), rgba(210,199,226,0.3))",
  },
};

function SceneArtwork({ theme }) {
  if (theme.visual === "mountain") {
    return (
      <svg className="scene-art scene-art-mountain" viewBox="0 0 1600 900" fill="none">
        <motion.path
          d="M0 620C148 560 246 520 388 557C514 590 578 692 720 650C842 614 880 458 1029 429C1174 401 1243 530 1386 506C1476 491 1532 438 1600 407V900H0V620Z"
          fill={theme.ink}
          fillOpacity="0.08"
          initial={{ opacity: 0, y: 34 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
        />
        <motion.path
          d="M0 511C150 470 257 361 407 391C530 415 586 538 711 529C852 519 907 332 1056 315C1180 300 1245 419 1370 396C1469 377 1530 300 1600 282V900H0V511Z"
          fill={theme.accent}
          fillOpacity="0.12"
          initial={{ opacity: 0, y: 42 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.35, ease: [0.22, 1, 0.36, 1], delay: 0.08 }}
        />
        <motion.path
          d="M124 632C254 589 349 589 461 624M977 408C1072 370 1143 371 1230 402M819 674C945 626 1068 620 1218 651"
          stroke={theme.ink}
          strokeOpacity="0.16"
          strokeWidth="3"
          strokeLinecap="round"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1], delay: 0.25 }}
        />
      </svg>
    );
  }

  if (theme.visual === "identity") {
    return (
      <svg className="scene-art scene-art-identity" viewBox="0 0 1600 900" fill="none">
        {[0, 1, 2, 3].map((item) => (
          <motion.rect
            key={item}
            x={210 + item * 80}
            y={160 + item * 54}
            width={760 - item * 90}
            height={420 - item * 44}
            rx="8"
            stroke={theme.accent}
            strokeOpacity={0.2 + item * 0.04}
            strokeWidth="2"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 1 + item * 0.18, ease: [0.22, 1, 0.36, 1] }}
          />
        ))}
        <motion.path
          d="M1032 236C1120 197 1215 208 1288 268C1374 339 1392 465 1330 555C1265 649 1122 681 1017 614C929 558 892 443 928 346C946 299 978 260 1032 236Z"
          fill={theme.accent}
          fillOpacity="0.1"
          stroke={theme.ink}
          strokeOpacity="0.16"
          strokeWidth="2"
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1], delay: 0.12 }}
        />
        <motion.path
          d="M1002 392H1358M1180 218V648M1072 318L1288 542M1294 318L1076 542"
          stroke={theme.ink}
          strokeOpacity="0.2"
          strokeWidth="2"
          strokeLinecap="round"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 1.35, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
        />
      </svg>
    );
  }

  if (theme.visual === "education") {
    return (
      <svg className="scene-art scene-art-education" viewBox="0 0 1600 900" fill="none">
        {[0, 1, 2, 3].map((item) => (
          <motion.rect
            key={item}
            x={820 + item * 118}
            y={235}
            width="64"
            height="440"
            rx="6"
            fill={theme.ink}
            fillOpacity="0.055"
            stroke={theme.accent}
            strokeOpacity="0.2"
            strokeWidth="2"
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.85, delay: item * 0.1, ease: [0.22, 1, 0.36, 1] }}
          />
        ))}
        <motion.path
          d="M748 214H1352M786 708H1314M336 302H560C627 302 680 355 680 422C680 489 627 542 560 542H336V302Z"
          stroke={theme.ink}
          strokeOpacity="0.18"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
        />
        <motion.path
          d="M390 352H604M390 410H594M390 468H560"
          stroke={theme.accent}
          strokeOpacity="0.45"
          strokeWidth="2"
          strokeLinecap="round"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
        />
      </svg>
    );
  }

  if (theme.visual === "practice") {
    return (
      <svg className="scene-art scene-art-practice" viewBox="0 0 1600 900" fill="none">
        <defs>
          <pattern id="blueprint-grid" width="72" height="72" patternUnits="userSpaceOnUse">
            <path d="M72 0H0V72" stroke={theme.ink} strokeOpacity="0.08" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width="1600" height="900" fill="url(#blueprint-grid)" opacity="0.8" />
        <motion.path
          d="M210 620C324 472 438 430 584 498C726 565 818 546 918 415C1023 277 1160 236 1330 300"
          stroke={theme.accent}
          strokeOpacity="0.46"
          strokeWidth="14"
          strokeLinecap="round"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
        />
        <motion.path
          d="M286 280H546V430H826V278H1178M826 430V640H1162"
          stroke={theme.ink}
          strokeOpacity="0.24"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 1.35, ease: [0.22, 1, 0.36, 1], delay: 0.16 }}
        />
        {[286, 546, 826, 1178, 1162].map((x, item) => (
          <motion.rect
            key={x}
            x={x - 18}
            y={item === 4 ? 622 : item === 2 ? 412 : 262}
            width="36"
            height="36"
            rx="6"
            fill={theme.ink}
            fillOpacity="0.13"
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.3 + item * 0.06 }}
          />
        ))}
      </svg>
    );
  }

  if (theme.visual === "essays") {
    return (
      <svg className="scene-art scene-art-essays" viewBox="0 0 1600 900" fill="none">
        {[0, 1, 2].map((item) => (
          <motion.rect
            key={item}
            x={810 + item * 42}
            y={170 + item * 38}
            width="460"
            height="560"
            rx="8"
            fill="#ffffff"
            fillOpacity={0.24 - item * 0.04}
            stroke={theme.ink}
            strokeOpacity="0.12"
            strokeWidth="2"
            initial={{ opacity: 0, x: 40, y: 24 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            transition={{ duration: 0.85, delay: item * 0.12, ease: [0.22, 1, 0.36, 1] }}
          />
        ))}
        <motion.path
          d="M268 528C344 448 421 448 498 528C575 608 652 608 729 528C806 448 883 448 960 528"
          stroke={theme.accent}
          strokeOpacity="0.44"
          strokeWidth="7"
          strokeLinecap="round"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 1.35, ease: [0.22, 1, 0.36, 1] }}
        />
        <motion.path
          d="M910 318H1188M910 382H1210M910 446H1132M910 510H1196M910 574H1080"
          stroke={theme.ink}
          strokeOpacity="0.18"
          strokeWidth="3"
          strokeLinecap="round"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 1.2, delay: 0.18, ease: [0.22, 1, 0.36, 1] }}
        />
      </svg>
    );
  }

  return (
    <svg className="scene-art scene-art-interests" viewBox="0 0 1600 900" fill="none">
      {[0, 1, 2, 3, 4, 5, 6].map((item) => (
        <motion.rect
          key={item}
          x={248 + item * 66}
          y={470 - (item % 4) * 44}
          width="28"
          height={170 + (item % 3) * 58}
          rx="8"
          fill={theme.accent}
          fillOpacity="0.2"
          initial={{ scaleY: 0.2, opacity: 0 }}
          animate={{ scaleY: 1, opacity: 1 }}
          transition={{ duration: 0.9, delay: item * 0.06, ease: [0.22, 1, 0.36, 1] }}
          style={{ transformOrigin: "center bottom" }}
        />
      ))}
      {[0, 1, 2].map((item) => (
        <motion.rect
          key={item}
          x={860 + item * 118}
          y={230 + item * 72}
          width="280"
          height="210"
          rx="8"
          fill="#ffffff"
          fillOpacity="0.16"
          stroke={theme.ink}
          strokeOpacity="0.14"
          strokeWidth="2"
          initial={{ opacity: 0, rotate: item === 1 ? 4 : -3, y: 34 }}
          animate={{ opacity: 1, rotate: item === 1 ? 4 : -3, y: 0 }}
          transition={{ duration: 0.9, delay: 0.14 + item * 0.1, ease: [0.22, 1, 0.36, 1] }}
        />
      ))}
      <motion.path
        d="M190 706C390 610 543 638 706 724C872 811 1084 785 1350 612"
        stroke={theme.ink}
        strokeOpacity="0.18"
        strokeWidth="3"
        strokeLinecap="round"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1], delay: 0.16 }}
      />
    </svg>
  );
}

function ImmersiveBackdrop({ activeId, y }) {
  const theme = sceneThemes[activeId] || sceneThemes.hero;

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden="true">
      <AnimatePresence mode="wait">
        <motion.div
          key={theme.id}
          className="absolute inset-0"
          style={{ background: theme.surface }}
          initial={{ opacity: 0, scale: 1.035, filter: "blur(14px)" }}
          animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
          exit={{ opacity: 0, scale: 0.985, filter: "blur(12px)" }}
          transition={{ duration: 1.05, ease: [0.22, 1, 0.36, 1] }}
        >
          <motion.div className="absolute inset-0" style={{ y }}>
            <SceneArtwork theme={theme} />
          </motion.div>
          <div className="theme-ruling" style={{ "--theme-ink": theme.ink }} />
          <div className="theme-edge-light" />
          <motion.div
            className="theme-caption"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75, delay: 0.25 }}
          >
            <span>{theme.index}</span>
            <strong>{theme.title}</strong>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function SectionBackdropMark({ theme }) {
  return (
    <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden" aria-hidden="true">
      <div className="absolute inset-0 opacity-80" style={{ background: theme.sectionPlane }} />
      <div className="section-ruling" style={{ "--theme-accent": theme.accent }} />
      <span className="section-index" style={{ color: theme.accent }}>
        {theme.index}
      </span>
      <span className="section-label" style={{ color: theme.ink }}>
        {theme.label}
      </span>
    </div>
  );
}

function SectionShell({ id, eyebrow, title, children, className = "" }) {
  const theme = sceneThemes[id] || sceneThemes.about;

  return (
    <motion.section
      id={id}
      className={`relative min-h-[92vh] overflow-hidden px-5 py-24 sm:px-8 lg:px-16 ${className}`}
      initial={{ opacity: 0, y: 56 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ amount: 0.16, once: false }}
      transition={{ duration: 0.82, ease: [0.22, 1, 0.36, 1] }}
    >
      <SectionBackdropMark theme={theme} />
      <div className="relative z-10 mx-auto max-w-6xl pr-0 lg:pr-28">
        <div className="mb-12 max-w-3xl">
          {eyebrow ? (
            <p className="mb-4 text-xs uppercase tracking-[0.28em] text-stone-500">
              {eyebrow}
            </p>
          ) : null}
          <h2 className="text-4xl font-semibold tracking-normal text-stone-950 sm:text-5xl">
            {title}
          </h2>
        </div>
        {children}
      </div>
    </motion.section>
  );
}

function GlassCard({ children, className = "" }) {
  return (
    <div
      className={`rounded-lg border border-white/60 bg-white/50 p-6 shadow-[0_18px_60px_rgba(30,28,24,0.06)] backdrop-blur-xl ${className}`}
    >
      {children}
    </div>
  );
}

function FineArrow() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 18 18"
      fill="none"
      aria-hidden="true"
      className="shrink-0"
    >
      <path
        d="M4 9H14M14 9L10.25 5.25M14 9L10.25 12.75"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function UploadMark() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path
        d="M10 13V4M10 4L6.8 7.2M10 4L13.2 7.2"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M4.5 12.5V14.8C4.5 15.7 5.2 16.5 6.2 16.5H13.8C14.8 16.5 15.5 15.7 15.5 14.8V12.5"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  );
}

function Chip({ children, active = false, onClick, className = "" }) {
  const base =
    "rounded-full border px-3 py-1.5 text-xs transition focus:outline-none focus-visible:ring-2 focus-visible:ring-stone-900/20";
  const state = active
    ? "border-stone-900 bg-stone-950 text-white"
    : "border-stone-300/70 bg-white/50 text-stone-600 hover:border-stone-500 hover:text-stone-950";

  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={`${base} ${state} ${className}`}>
        {children}
      </button>
    );
  }

  return <span className={`${base} ${state} ${className}`}>{children}</span>;
}

function EmptyFrame({ title, body }) {
  return (
    <div className="flex min-h-[180px] items-center justify-center rounded-lg border border-dashed border-stone-300/80 bg-white/40 p-8 text-center">
      <div>
        <p className="text-sm font-medium text-stone-800">{title}</p>
        <p className="mt-2 text-sm leading-6 text-stone-500">{body}</p>
      </div>
    </div>
  );
}

function Notice({ tone = "neutral", children }) {
  const styles =
    tone === "error"
      ? "border-red-200 bg-red-50 text-red-700"
      : tone === "success"
        ? "border-emerald-200 bg-emerald-50 text-emerald-700"
        : "border-stone-200 bg-white/55 text-stone-600";

  return <p className={`rounded-lg border px-4 py-3 text-sm leading-6 ${styles}`}>{children}</p>;
}

function EssayCard({ essay, isAdmin, onDelete, isDeleting }) {
  const images = essay.media?.filter((item) => item.type === "image") || [];
  const audio = essay.media?.find((item) => item.type === "audio");

  return (
    <GlassCard className="overflow-hidden">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-stone-400">
            {new Date(essay.createdAt).toLocaleDateString("zh-CN")}
          </p>
          <h3 className="mt-3 text-2xl font-semibold text-stone-950">{essay.title}</h3>
          <span className="mt-4 inline-flex rounded-full border border-stone-300/80 px-3 py-1.5 text-xs text-stone-500">
            {essay.category}
          </span>
        </div>

        {isAdmin ? (
          <button
            type="button"
            disabled={isDeleting}
            onClick={() => onDelete(essay)}
            className="w-fit rounded-full border border-stone-300 px-3 py-1.5 text-xs text-stone-500 transition hover:border-red-300 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isDeleting ? "Deleting" : "Delete"}
          </button>
        ) : null}
      </div>

      <div className="mt-6 whitespace-pre-wrap text-base leading-8 text-stone-600">{essay.body}</div>

      {images.length ? (
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {images.map((image) => (
            <div key={image.id || image.filePath} className="aspect-[4/3] overflow-hidden rounded-lg bg-stone-200">
              <img src={image.url} alt={image.name} className="h-full w-full object-cover" />
            </div>
          ))}
        </div>
      ) : null}

      {audio ? (
        <div className="mt-6 rounded-lg border border-stone-200/80 bg-white/50 p-4">
          <p className="mb-3 truncate text-sm text-stone-600">{audio.name}</p>
          <audio controls src={audio.url} className="w-full" />
        </div>
      ) : null}
    </GlassCard>
  );
}

export default function ChainsXesWorld() {
  const { scrollY, scrollYProgress } = useScroll();
  const backdropY = useTransform(scrollY, [0, 2600], [0, -180]);
  const objectUrlsRef = useRef(new Set());
  const [session, setSession] = useState(null);
  const [activeSection, setActiveSection] = useState("hero");
  const [loginEmail, setLoginEmail] = useState(ADMIN_EMAIL);
  const [authBusy, setAuthBusy] = useState(false);
  const [authNotice, setAuthNotice] = useState({ tone: "neutral", text: "" });
  const [contentBusy, setContentBusy] = useState(false);
  const [formBusy, setFormBusy] = useState(false);
  const [notice, setNotice] = useState({ tone: "neutral", text: "" });
  const [essays, setEssays] = useState([]);
  const [essayTitle, setEssayTitle] = useState("A New Observation");
  const [essayCategory, setEssayCategory] = useState("Market Notes");
  const [essayBody, setEssayBody] = useState(
    "Use this space for a market reflection, the mood behind a photograph, or a Web3 project note. Once published by the admin, it will be saved to the cloud."
  );
  const [essayImages, setEssayImages] = useState([]);
  const [essayAudio, setEssayAudio] = useState(null);
  const [photoUploadCategory, setPhotoUploadCategory] = useState("Landscape");
  const [photoFilter, setPhotoFilter] = useState("All");
  const [photos, setPhotos] = useState([]);
  const [previewPhoto, setPreviewPhoto] = useState(null);
  const [deletingEssayId, setDeletingEssayId] = useState(null);
  const [deletingPhotoId, setDeletingPhotoId] = useState(null);

  const currentUser = session?.user ?? null;
  const isAdmin = isAdminUser(currentUser);

  const createLocalUrl = (file) => {
    const url = URL.createObjectURL(file);
    objectUrlsRef.current.add(url);
    return url;
  };

  const revokeLocalUrl = (url) => {
    if (!url) return;
    URL.revokeObjectURL(url);
    objectUrlsRef.current.delete(url);
  };

  const makeId = (prefix) => {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  };

  const refreshContent = async () => {
    if (!isSupabaseConfigured) {
      setNotice({
        tone: "neutral",
        text: "Supabase is not configured yet. The site can be browsed normally; cloud notes and photos will load after the environment variables are added.",
      });
      return;
    }

    setContentBusy(true);
    try {
      const content = await loadContent();
      setEssays(content.essays);
      setPhotos(content.photos);
      setNotice({ tone: "success", text: "Cloud content synced." });
    } catch (error) {
      setNotice({
        tone: "error",
        text: error.message || "Cloud content failed to load. Check the Supabase configuration and RLS policies.",
      });
    } finally {
      setContentBusy(false);
    }
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntry = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        if (visibleEntry?.target?.id) {
          setActiveSection(visibleEntry.target.id);
        }
      },
      {
        root: null,
        rootMargin: "-34% 0px -45% 0px",
        threshold: [0.1, 0.25, 0.45, 0.65],
      }
    );

    themeTargets.forEach((item) => {
      const section = document.getElementById(item.id);
      if (section) observer.observe(section);
    });

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    return () => {
      objectUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
      objectUrlsRef.current.clear();
    };
  }, []);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setNotice({
        tone: "neutral",
        text: "Supabase is not configured yet. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to enable cloud saving.",
      });
      return undefined;
    }

    let cancelled = false;

    getSession()
      .then((currentSession) => {
        if (!cancelled) setSession(currentSession);
      })
      .catch((error) => {
        if (!cancelled) {
          setAuthNotice({ tone: "error", text: error.message || "Failed to read the login session." });
        }
      });

    refreshContent();

    const unsubscribe = onAuthStateChange((nextSession) => {
      setSession(nextSession);
      refreshContent();
    });

    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, []);

  const filteredPhotos = useMemo(() => {
    if (photoFilter === "All") return photos;
    return photos.filter((photo) => photo.category === photoFilter);
  }, [photoFilter, photos]);

  const scrollToSection = (id) => {
    const section = document.getElementById(id);
    if (section) {
      section.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const clearDraft = () => {
    essayImages.forEach((image) => revokeLocalUrl(image.url));
    if (essayAudio?.url) revokeLocalUrl(essayAudio.url);
    setEssayTitle("A New Observation");
    setEssayCategory("Market Notes");
    setEssayBody("");
    setEssayImages([]);
    setEssayAudio(null);
  };

  const handleEssayImages = (fileList) => {
    if (!isAdmin) return;
    const files = Array.from(fileList || []).filter((file) => file.type.startsWith("image/"));
    if (!files.length) return;

    const nextImages = files.map((file) => ({
      id: makeId("essay-image"),
      name: file.name,
      file,
      url: createLocalUrl(file),
    }));

    setEssayImages((current) => [...current, ...nextImages]);
  };

  const handleEssayAudio = (fileList) => {
    if (!isAdmin) return;
    const file = Array.from(fileList || []).find((item) => item.type.startsWith("audio/"));
    if (!file) return;

    if (essayAudio?.url) {
      revokeLocalUrl(essayAudio.url);
    }

    setEssayAudio({
      id: makeId("essay-audio"),
      name: file.name,
      file,
      url: createLocalUrl(file),
    });
  };

  const removeEssayImage = (imageId) => {
    setEssayImages((current) => {
      const target = current.find((image) => image.id === imageId);
      if (target) revokeLocalUrl(target.url);
      return current.filter((image) => image.id !== imageId);
    });
  };

  const clearEssayAudio = () => {
    if (essayAudio?.url) {
      revokeLocalUrl(essayAudio.url);
    }
    setEssayAudio(null);
  };

  const handleEssaySubmit = async () => {
    if (!isAdmin) return;

    const title = essayTitle.trim();
    const body = essayBody.trim();

    if (!title || !body) {
      setNotice({ tone: "error", text: "A title and body are both required." });
      return;
    }

    setFormBusy(true);
    try {
      const savedEssay = await createEssay({
        title,
        category: essayCategory,
        body,
        imageFiles: essayImages.map((image) => image.file),
        audioFile: essayAudio?.file ?? null,
      });

      setEssays((current) => [savedEssay, ...current]);
      clearDraft();
      setNotice({ tone: "success", text: "Note published to Supabase." });
    } catch (error) {
      setNotice({ tone: "error", text: error.message || "Failed to publish the note." });
    } finally {
      setFormBusy(false);
    }
  };

  const handleSignIn = async (event) => {
    event.preventDefault();

    if (!isSupabaseConfigured) {
      setAuthNotice({ tone: "error", text: "Configure the Supabase environment variables first." });
      return;
    }

    const email = loginEmail.trim().toLowerCase();
    if (email !== ADMIN_EMAIL.toLowerCase()) {
      setAuthNotice({ tone: "error", text: `Only ${ADMIN_EMAIL} can edit this site.` });
      return;
    }

    setAuthBusy(true);
    try {
      await signInWithEmail(email);
      setAuthNotice({ tone: "success", text: "A login link has been sent. Check your inbox and return from the email link." });
    } catch (error) {
      setAuthNotice({ tone: "error", text: error.message || "Failed to send the login email." });
    } finally {
      setAuthBusy(false);
    }
  };

  const handleSignOut = async () => {
    setAuthBusy(true);
    try {
      await signOut();
      setAuthNotice({ tone: "success", text: "Signed out of the admin account." });
    } catch (error) {
      setAuthNotice({ tone: "error", text: error.message || "Failed to sign out." });
    } finally {
      setAuthBusy(false);
    }
  };

  const handleDeleteEssay = async (essay) => {
    if (!isAdmin) return;

    setDeletingEssayId(essay.id);
    try {
      await deleteEssay(essay);
      setEssays((current) => current.filter((item) => item.id !== essay.id));
      setNotice({ tone: "success", text: "Note deleted." });
    } catch (error) {
      setNotice({ tone: "error", text: error.message || "Failed to delete the note." });
    } finally {
      setDeletingEssayId(null);
    }
  };

  const handlePhotoUpload = async (fileList) => {
    if (!isAdmin) return;
    const files = Array.from(fileList || []).filter((file) => file.type.startsWith("image/"));
    if (!files.length) return;

    setFormBusy(true);
    try {
      const savedPhotos = await uploadPhotos({ files, category: photoUploadCategory });
      setPhotos((current) => [...savedPhotos, ...current]);
      setNotice({ tone: "success", text: "Photo work uploaded to Supabase." });
    } catch (error) {
      setNotice({ tone: "error", text: error.message || "Failed to upload the photo work." });
    } finally {
      setFormBusy(false);
    }
  };

  const removePhoto = async (photo) => {
    if (!isAdmin) return;

    setDeletingPhotoId(photo.id);
    try {
      await deletePhoto(photo);
      setPhotos((current) => current.filter((item) => item.id !== photo.id));
      setPreviewPhoto((current) => (current?.id === photo.id ? null : current));
      setNotice({ tone: "success", text: "Photo work deleted." });
    } catch (error) {
      setNotice({ tone: "error", text: error.message || "Failed to delete the photo work." });
    } finally {
      setDeletingPhotoId(null);
    }
  };

  return (
    <div className="relative min-h-screen overflow-x-hidden scroll-smooth bg-[#f5f2eb] text-stone-900 selection:bg-stone-900 selection:text-white">
      <ImmersiveBackdrop activeId={activeSection} y={backdropY} />
      <motion.div
        className="fixed left-0 top-0 z-50 h-[3px] w-full origin-left bg-stone-950"
        style={{ scaleX: scrollYProgress }}
      />

      <aside className="fixed right-5 top-1/2 z-40 hidden w-48 -translate-y-1/2 rounded-lg border border-white/60 bg-white/50 p-3 shadow-[0_18px_50px_rgba(35,32,28,0.08)] backdrop-blur-xl lg:block">
        <p className="px-3 pb-3 text-[10px] uppercase tracking-[0.24em] text-stone-400">
          Outline
        </p>
        <nav className="space-y-1" aria-label="Page outline">
          {outlineItems.map((item) => {
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => scrollToSection(item.id)}
                className={`group flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm transition ${
                  isActive
                    ? "bg-stone-950 text-white"
                    : "text-stone-500 hover:bg-white/70 hover:text-stone-950"
                }`}
              >
                <span>{item.label}</span>
                <span
                  className={`h-1.5 w-1.5 rounded-full transition ${
                    isActive ? "bg-white" : "bg-stone-300 group-hover:bg-stone-700"
                  }`}
                />
              </button>
            );
          })}
        </nav>
      </aside>

      <header
        id="hero"
        className="relative z-10 flex min-h-screen items-center justify-center overflow-hidden px-5 py-24 sm:px-8 lg:px-16"
      >
        <div className="absolute inset-x-0 top-0 z-10 mx-auto flex max-w-7xl items-center justify-between px-5 py-6 text-sm text-stone-600 sm:px-8 lg:px-16">
          <button
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="font-medium tracking-normal text-stone-900"
          >
            ChainsXes’s World
          </button>
          <div className="flex min-w-0 items-center justify-end gap-3">
            <span className="hidden text-xs uppercase tracking-[0.28em] text-stone-400 lg:inline">
              Personal Field
            </span>
            {isAdmin ? (
              <div className="flex items-center gap-2 rounded-full border border-white/60 bg-white/60 px-3 py-2 text-xs text-stone-600 backdrop-blur-xl">
                <span className="hidden max-w-[13rem] truncate sm:inline">{currentUser.email}</span>
                <button
                  type="button"
                  onClick={handleSignOut}
                  disabled={authBusy}
                  className="rounded-full bg-stone-950 px-3 py-1.5 text-white transition hover:bg-stone-800 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <form
                onSubmit={handleSignIn}
                className="hidden items-center gap-2 rounded-full border border-white/60 bg-white/60 p-1.5 backdrop-blur-xl md:flex"
              >
                <input
                  type="email"
                  value={loginEmail}
                  onChange={(event) => setLoginEmail(event.target.value)}
                  className="w-48 rounded-full bg-transparent px-3 py-1.5 text-xs text-stone-700 outline-none placeholder:text-stone-400"
                  placeholder={ADMIN_EMAIL}
                />
                <button
                  type="submit"
                  disabled={authBusy || !isSupabaseConfigured}
                  className="rounded-full bg-stone-950 px-3 py-1.5 text-xs text-white transition hover:bg-stone-800 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {authBusy ? "Sending" : "Admin Login"}
                </button>
              </form>
            )}
          </div>
        </div>

        <motion.div
          className="relative z-10 mx-auto max-w-5xl text-center"
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        >
          <p className="mb-6 text-sm tracking-[0.3em] text-stone-500">Cui Xiwen</p>
          <h1 className="text-5xl font-semibold tracking-normal text-stone-950 sm:text-7xl lg:text-8xl">
            ChainsXes’s World
          </h1>
          <p className="mx-auto mt-8 max-w-3xl text-lg leading-8 text-stone-700 sm:text-xl sm:leading-9">
            I read the world through systems, volatility, rhythm, images, AI, and Web3.
          </p>
          <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-stone-500 sm:text-base">
            Trained in hydraulic engineering and now moving into finance, I use markets, tools,
            photography, and music to build my own field of observation.
          </p>

          <div className="mt-9 flex flex-wrap justify-center gap-3">
            {["Engineering Background", "Finance Direction", "Drummer", "Web3 / AI Explorer"].map(
              (tag) => (
                <Chip key={tag}>{tag}</Chip>
              )
            )}
          </div>

          <div className="mt-12 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() => scrollToSection("about")}
              className="inline-flex items-center gap-2 rounded-full bg-stone-950 px-6 py-3 text-sm font-medium text-white transition hover:bg-stone-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-stone-950/30"
            >
              About Me
              <FineArrow />
            </button>
            <button
              type="button"
              onClick={() => scrollToSection("essays")}
              className="inline-flex items-center gap-2 rounded-full border border-stone-300 bg-white/50 px-6 py-3 text-sm font-medium text-stone-800 backdrop-blur-xl transition hover:border-stone-500 hover:bg-white/70 focus:outline-none focus-visible:ring-2 focus-visible:ring-stone-950/20"
            >
              Enter Studio
              <FineArrow />
            </button>
          </div>

          {!isAdmin ? (
            <form
              onSubmit={handleSignIn}
              className="mx-auto mt-6 flex max-w-md flex-col gap-2 rounded-lg border border-white/60 bg-white/55 p-3 backdrop-blur-xl md:hidden"
            >
              <input
                type="email"
                value={loginEmail}
                onChange={(event) => setLoginEmail(event.target.value)}
                className="rounded-lg border border-stone-200 bg-white/70 px-3 py-2 text-sm text-stone-700 outline-none"
                placeholder={ADMIN_EMAIL}
              />
              <button
                type="submit"
                disabled={authBusy || !isSupabaseConfigured}
                className="rounded-lg bg-stone-950 px-4 py-2 text-sm text-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                {authBusy ? "Sending" : "Admin Login"}
              </button>
            </form>
          ) : null}

          {authNotice.text ? (
            <div className="mx-auto mt-5 max-w-xl">
              <Notice tone={authNotice.tone}>{authNotice.text}</Notice>
            </div>
          ) : null}
        </motion.div>
      </header>

      <main className="relative z-10">
        <SectionShell id="about" eyebrow="01 / Personal Coordinates" title="About Me">
          <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="space-y-6 text-lg leading-9 text-stone-700">
              <p>
                I am Cui Xiwen, trained in hydraulic and hydropower engineering at Heilongjiang
                University and now moving toward a Master of Finance at East China Normal University.
              </p>
              <p>
                Engineering taught me to think in structures, variables, and constraints. Markets
                taught me to take risk, value, and cycles seriously. Music and photography keep my
                way of seeing from becoming purely analytical.
              </p>
              <p>
                I am an ENFP who learns through conversation as much as through books. This site is
                not meant to be a resume in disguise. It is a living map of how I observe, work, and
                make sense of the world.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {aboutCards.map((card) => (
                <GlassCard key={card.title}>
                  <p className="text-lg font-medium text-stone-950">{card.title}</p>
                  <p className="mt-3 text-xs leading-5 text-stone-500">{card.words}</p>
                  <p className="mt-5 text-sm leading-7 text-stone-600">{card.body}</p>
                </GlassCard>
              ))}
            </div>
          </div>
        </SectionShell>

        <SectionShell
          id="education"
          eyebrow="02 / From Engineering To Finance"
          title="Education"
        >
          <div className="relative">
            <div className="absolute left-5 top-10 hidden h-[calc(100%-5rem)] w-px bg-stone-300/80 md:block" />
            <div className="grid gap-5">
              {educationItems.map((item, index) => (
                <GlassCard key={item.school} className="relative md:ml-12">
                  <span className="absolute -left-[3.45rem] top-8 hidden h-4 w-4 rounded-full border border-stone-400 bg-[#f5f2eb] md:block" />
                  <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="text-sm uppercase tracking-[0.24em] text-stone-400">
                        {index === 0 ? "Undergraduate" : "Graduate"}
                      </p>
                      <h3 className="mt-3 text-2xl font-semibold text-stone-950">{item.school}</h3>
                      <p className="mt-2 text-sm text-stone-500">{item.degree}</p>
                    </div>
                    <span className="w-fit rounded-full border border-stone-300/80 px-3 py-1.5 text-xs text-stone-500">
                      {item.period}
                    </span>
                  </div>
                  <p className="mt-8 max-w-4xl text-base leading-8 text-stone-600">{item.body}</p>
                </GlassCard>
              ))}
            </div>
          </div>
        </SectionShell>

        <SectionShell id="practice" eyebrow="03 / Practice As Method" title="Systems, Markets, Risk">
          <div className="space-y-5">
            {practiceGroups.map((group) => (
              <GlassCard key={group.title} className="overflow-hidden">
                <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
                  <div>
                    <span className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-stone-300 text-sm text-stone-500">
                      {group.eyebrow}
                    </span>
                    <h3 className="mt-5 text-2xl font-semibold text-stone-950">{group.title}</h3>
                    <div className="mt-5 flex flex-wrap gap-2">
                      {group.tags.map((tag) => (
                        <Chip key={tag}>{tag}</Chip>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="space-y-5 text-base leading-8 text-stone-600">
                      {group.body.split("\n\n").map((paragraph) => (
                        <p key={paragraph}>{paragraph}</p>
                      ))}
                    </div>

                    {group.projects.length ? (
                      <div className="mt-8 grid gap-3 md:grid-cols-3">
                        {group.projects.map((project) => (
                          <div
                            key={project.name}
                            className="rounded-lg border border-stone-200/80 bg-white/40 p-4"
                          >
                            <p className="text-sm font-medium text-stone-950">{project.name}</p>
                            <p className="mt-3 text-sm leading-6 text-stone-500">{project.body}</p>
                          </div>
                        ))}
                      </div>
                    ) : null}
                  </div>
                </div>
              </GlassCard>
            ))}
          </div>
        </SectionShell>

        <SectionShell
          id="essays"
          eyebrow="04 / Notes In Progress"
          title="Field Notes"
        >
          <div className="mb-8 max-w-3xl text-base leading-8 text-stone-600">
            This is not a formal article archive. It is a field notebook for market reflections,
            images, Web3 research, rehearsal fragments, and small observations that are still in motion.
          </div>

          {notice.text ? (
            <div className="mb-6 max-w-3xl">
              <Notice tone={notice.tone}>{notice.text}</Notice>
            </div>
          ) : null}

          {isAdmin ? (
            <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
              <GlassCard>
                <div className="space-y-5">
                  <div>
                    <label className="text-sm font-medium text-stone-800" htmlFor="essay-title">
                      Note Title
                    </label>
                    <input
                      id="essay-title"
                      value={essayTitle}
                      onChange={(event) => setEssayTitle(event.target.value)}
                      className="mt-2 w-full rounded-lg border border-stone-200 bg-white/70 px-4 py-3 text-sm text-stone-900 outline-none transition placeholder:text-stone-400 focus:border-stone-500"
                      placeholder="Give this note a title"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-stone-800" htmlFor="essay-category">
                      Category
                    </label>
                    <select
                      id="essay-category"
                      value={essayCategory}
                      onChange={(event) => setEssayCategory(event.target.value)}
                      className="mt-2 w-full rounded-lg border border-stone-200 bg-white/70 px-4 py-3 text-sm text-stone-900 outline-none transition focus:border-stone-500"
                    >
                      {essayCategories.map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-stone-800" htmlFor="essay-body">
                      Body
                    </label>
                    <textarea
                      id="essay-body"
                      value={essayBody}
                      onChange={(event) => setEssayBody(event.target.value)}
                      rows={9}
                      className="mt-2 w-full resize-none rounded-lg border border-stone-200 bg-white/70 px-4 py-3 text-sm leading-7 text-stone-900 outline-none transition placeholder:text-stone-400 focus:border-stone-500"
                      placeholder="Write an observation that feels true."
                    />
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <label className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-stone-300 bg-white/50 px-4 py-5 text-sm text-stone-600 transition hover:border-stone-500 hover:text-stone-950">
                      <UploadMark />
                      Add Images
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        disabled={formBusy}
                        className="sr-only"
                        onChange={(event) => {
                          handleEssayImages(event.target.files);
                          event.target.value = "";
                        }}
                      />
                    </label>
                    <label className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-stone-300 bg-white/50 px-4 py-5 text-sm text-stone-600 transition hover:border-stone-500 hover:text-stone-950">
                      <UploadMark />
                      Add Audio
                      <input
                        type="file"
                        accept="audio/*"
                        disabled={formBusy}
                        className="sr-only"
                        onChange={(event) => {
                          handleEssayAudio(event.target.files);
                          event.target.value = "";
                        }}
                      />
                    </label>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={handleEssaySubmit}
                      disabled={formBusy}
                      className="rounded-full bg-stone-950 px-5 py-2.5 text-sm text-white transition hover:bg-stone-800 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {formBusy ? "Publishing" : "Publish To Cloud"}
                    </button>
                    <button
                      type="button"
                      onClick={clearDraft}
                      disabled={formBusy}
                      className="rounded-full border border-stone-300 bg-white/40 px-5 py-2.5 text-sm text-stone-600 transition hover:border-stone-600 hover:text-stone-950 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Clear Draft
                    </button>
                  </div>
                </div>
              </GlassCard>

              <GlassCard className="min-h-[640px]">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.24em] text-stone-400">Draft Preview</p>
                    <h3 className="mt-3 text-3xl font-semibold text-stone-950">
                      {essayTitle || "Untitled Note"}
                    </h3>
                    <span className="mt-4 inline-flex rounded-full border border-stone-300/80 px-3 py-1.5 text-xs text-stone-500">
                      {essayCategory}
                    </span>
                  </div>
                </div>

                <div className="mt-8 whitespace-pre-wrap text-base leading-8 text-stone-600">
                  {essayBody || "The body will appear here as you write."}
                </div>

                <div className="mt-8">
                  {essayImages.length ? (
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                      {essayImages.map((image) => (
                        <div
                          key={image.id}
                          className="group relative aspect-[4/3] overflow-hidden rounded-lg bg-stone-200"
                        >
                          <img
                            src={image.url}
                            alt={image.name}
                            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                          />
                          <button
                            type="button"
                            onClick={() => removeEssayImage(image.id)}
                            className="absolute right-2 top-2 rounded-full bg-stone-950/70 px-2 py-1 text-xs text-white opacity-0 transition group-hover:opacity-100"
                          >
                            Delete
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <EmptyFrame title="Image Wall" body="Uploaded images will become visual fragments inside the note." />
                  )}
                </div>

                <div className="mt-6">
                  {essayAudio ? (
                    <div className="rounded-lg border border-stone-200/80 bg-white/50 p-4">
                      <div className="mb-3 flex items-center justify-between gap-3">
                        <p className="truncate text-sm text-stone-600">{essayAudio.name}</p>
                        <button
                          type="button"
                          onClick={clearEssayAudio}
                          className="shrink-0 rounded-full border border-stone-300 px-3 py-1 text-xs text-stone-500 transition hover:border-stone-700 hover:text-stone-950"
                        >
                          Remove
                        </button>
                      </div>
                      <audio controls src={essayAudio.url} className="w-full" />
                    </div>
                  ) : (
                    <EmptyFrame title="Audio Player" body="Upload rehearsal clips, live fragments, or voice notes to play them here." />
                  )}
                </div>
              </GlassCard>
            </div>
          ) : (
            <GlassCard>
              <p className="text-base leading-8 text-stone-600">
                Visitor mode only displays published content. Sign in with the admin email to publish
                notes and upload images or audio.
              </p>
            </GlassCard>
          )}

          <div className="mt-10">
            <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <h3 className="text-2xl font-semibold text-stone-950">Cloud Notes</h3>
              {isSupabaseConfigured ? (
                <button
                  type="button"
                  onClick={refreshContent}
                  disabled={contentBusy}
                  className="w-fit rounded-full border border-stone-300 bg-white/40 px-4 py-2 text-xs text-stone-600 transition hover:border-stone-600 hover:text-stone-950 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {contentBusy ? "Syncing" : "Refresh Content"}
                </button>
              ) : null}
            </div>

            {essays.length ? (
              <div className="grid gap-5">
                {essays.map((essay) => (
                  <EssayCard
                    key={essay.id}
                    essay={essay}
                    isAdmin={isAdmin}
                    onDelete={handleDeleteEssay}
                    isDeleting={deletingEssayId === essay.id}
                  />
                ))}
              </div>
            ) : (
              <EmptyFrame title="No Cloud Notes Yet" body="After the first note is published, it will be saved in Supabase and shown here." />
            )}
          </div>
        </SectionShell>

        <SectionShell id="interests" eyebrow="05 / Personal Frequencies" title="Interests">
          <div className="grid gap-6">
            <GlassCard>
              <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
                <div>
                  <p className="text-xs uppercase tracking-[0.24em] text-stone-400">Music</p>
                  <h3 className="mt-3 text-3xl font-semibold text-stone-950">Music</h3>
                  <div className="mt-6 space-y-5 text-base leading-8 text-stone-600">
                    <p>
                      Music ran through a large part of my college life. From sophomore to senior
                      year, I played drums for Silent Radio and joined multiple stage performances as
                      a core member of the Heilongjiang University Guitar Association.
                    </p>
                    <p>
                      A drummer is not always at the front of the stage, but the role defines tempo,
                      momentum, and stability. For me, music is not only an interest. It is training
                      in collaboration, expression, and live execution.
                    </p>
                  </div>
                </div>

                <div className="space-y-5">
                  <div className="grid gap-3 sm:grid-cols-2">
                    {musicMembers.map((member) => (
                      <div key={`${member.role}-${member.name}`} className="rounded-lg bg-white/50 p-4">
                        <p className="text-xs text-stone-400">{member.role}</p>
                        <p className="mt-2 text-lg font-medium text-stone-950">{member.name}</p>
                      </div>
                    ))}
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    {["Xitunuo", "Luanhe"].map((work) => (
                      <div
                        key={work}
                        className="rounded-lg border border-stone-200/80 bg-white/40 p-4"
                      >
                        <p className="text-sm text-stone-500">Original Work</p>
                        <p className="mt-2 text-xl font-medium text-stone-950">{work}</p>
                      </div>
                    ))}
                  </div>

                  <div className="rounded-lg border border-stone-200/80 bg-white/40 p-4">
                    <p className="mb-3 text-sm font-medium text-stone-800">Audio Placeholder</p>
                    <div className="flex items-center gap-3 rounded-lg bg-stone-950/5 px-4 py-4">
                      <span className="h-3 w-3 rounded-full bg-stone-400" />
                      <div className="h-1 flex-1 rounded-full bg-stone-300">
                        <div className="h-1 w-1/3 rounded-full bg-stone-700" />
                      </div>
                      <span className="text-xs text-stone-500">Demo / Live / Rehearsal</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 grid gap-3 md:grid-cols-3">
                {performances.map((item) => (
                  <div key={item} className="rounded-lg bg-white/40 p-4 text-sm leading-6 text-stone-600">
                    {item}
                  </div>
                ))}
              </div>

              <div className="mt-6 rounded-lg bg-stone-950/5 p-5 text-sm leading-7 text-stone-600">
                Core member of the Heilongjiang University Guitar Association. I joined and helped
                plan around five cultural performances, usually as drummer and one of the main
                organizers.
              </div>
            </GlassCard>

            <GlassCard>
              <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr]">
                <div>
                  <p className="text-xs uppercase tracking-[0.24em] text-stone-400">Photography</p>
                  <h3 className="mt-3 text-3xl font-semibold text-stone-950">Photography</h3>
                  <p className="mt-6 text-base leading-8 text-stone-600">
                    I am drawn more to landscapes than portraits. My phone is the camera I use most.
                    I like using telephoto views for detail, panoramas for space, and composition to
                    find order inside natural scenes.
                  </p>

                  <div className="mt-6 flex flex-wrap gap-2">
                    {photoCategories.map((category) => (
                      <Chip
                        key={category}
                        active={photoFilter === category}
                        onClick={() => setPhotoFilter(category)}
                      >
                        {category}
                      </Chip>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  {isAdmin ? (
                    <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
                      <select
                        value={photoUploadCategory}
                        onChange={(event) => setPhotoUploadCategory(event.target.value)}
                        className="rounded-lg border border-stone-200 bg-white/70 px-4 py-3 text-sm text-stone-900 outline-none transition focus:border-stone-500"
                        aria-label="Select photo category"
                      >
                        {uploadPhotoCategories.map((category) => (
                          <option key={category} value={category}>
                            {category}
                          </option>
                        ))}
                      </select>
                      <label className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-stone-300 bg-white/50 px-5 py-3 text-sm text-stone-600 transition hover:border-stone-500 hover:text-stone-950">
                        <UploadMark />
                        {formBusy ? "Uploading" : "Upload Photo Work"}
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          disabled={formBusy}
                          className="sr-only"
                          onChange={(event) => {
                            handlePhotoUpload(event.target.files);
                            event.target.value = "";
                          }}
                        />
                      </label>
                    </div>
                  ) : (
                    <Notice>Visitors can browse the photo wall. Admin login enables upload and deletion.</Notice>
                  )}

                  {filteredPhotos.length ? (
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                      {filteredPhotos.map((photo) => (
                        <div
                          key={photo.id}
                          className="group relative aspect-[4/5] overflow-hidden rounded-lg bg-stone-200"
                        >
                          <button
                            type="button"
                            onClick={() => setPreviewPhoto(photo)}
                            className="h-full w-full"
                            aria-label={`View ${photo.name}`}
                          >
                            <img
                              src={photo.url}
                              alt={photo.name}
                              className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                            />
                          </button>
                          <div className="absolute bottom-2 left-2 rounded-full bg-white/80 px-2 py-1 text-[11px] text-stone-600 backdrop-blur">
                            {photo.category}
                          </div>
                          {isAdmin ? (
                            <button
                              type="button"
                              disabled={deletingPhotoId === photo.id}
                              onClick={() => removePhoto(photo)}
                              className="absolute right-2 top-2 rounded-full bg-stone-950/70 px-2 py-1 text-xs text-white opacity-0 transition group-hover:opacity-100 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              {deletingPhotoId === photo.id ? "Deleting" : "Delete"}
                            </button>
                          ) : null}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <EmptyFrame title="Photo Wall" body="Uploaded works can be filtered by landscape, city, detail, panorama, and documentary categories." />
                  )}

                  <p className="text-xs leading-6 text-stone-500">
                    Photos are loaded from Supabase. Without environment variables, this area stays empty.
                  </p>
                </div>
              </div>
            </GlassCard>

            <div className="grid gap-5 lg:grid-cols-3">
              {interestBlocks.map((block) => (
                <GlassCard key={block.key}>
                  <h3 className="text-2xl font-semibold text-stone-950">{block.title}</h3>
                  <p className="mt-5 text-base leading-8 text-stone-600">{block.body}</p>
                  <div className="mt-6 flex flex-wrap gap-2">
                    {block.tags.map((tag) => (
                      <Chip key={tag}>{tag}</Chip>
                    ))}
                  </div>
                </GlassCard>
              ))}
            </div>
          </div>
        </SectionShell>
      </main>

      {previewPhoto ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/80 p-5 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-label="Photo preview"
          onClick={() => setPreviewPhoto(null)}
        >
          <div
            className="relative max-h-[88vh] max-w-5xl overflow-hidden rounded-lg bg-stone-950"
            onClick={(event) => event.stopPropagation()}
          >
            <img
              src={previewPhoto.url}
              alt={previewPhoto.name}
              className="max-h-[88vh] w-full object-contain"
            />
            <div className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1.5 text-xs text-stone-700 backdrop-blur">
              {previewPhoto.category}
            </div>
            <button
              type="button"
              onClick={() => setPreviewPhoto(null)}
              className="absolute right-4 top-4 rounded-full bg-white/90 px-3 py-1.5 text-xs text-stone-700 backdrop-blur transition hover:bg-white"
            >
              Close
            </button>
          </div>
        </div>
      ) : null}

      <footer className="relative px-5 py-12 text-center text-sm text-stone-500 sm:px-8 lg:px-16">
        <p>ChainsXes’s World · Cui Xiwen</p>
      </footer>
    </div>
  );
}
