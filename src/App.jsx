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

const navItems = [
  { id: "about", label: "About", short: "About" },
  { id: "education", label: "Education", short: "Edu" },
  { id: "practice", label: "Practice", short: "Work" },
  { id: "essays", label: "Notes", short: "Notes" },
  { id: "interests", label: "World", short: "World" },
];

const sectionTargets = [{ id: "hero", label: "Opening" }, ...navItems];

const sectionThemes = {
  hero: {
    label: "Opening",
    ghost: "CHAINSXES WORLD",
    accent: "#36d7ff",
    glow: "rgba(54, 215, 255, 0.34)",
    background:
      "linear-gradient(118deg, rgba(30, 96, 255, 0.48) 0%, transparent 34%), linear-gradient(24deg, transparent 18%, rgba(52, 213, 255, 0.34) 48%, transparent 74%), linear-gradient(135deg, #040712 0%, #071334 45%, #02040d 100%)",
  },
  about: {
    label: "Identity",
    ghost: "SYSTEM THINKER",
    accent: "#7ef7cc",
    glow: "rgba(126, 247, 204, 0.28)",
    background:
      "linear-gradient(130deg, transparent 0%, rgba(39, 193, 151, 0.34) 42%, transparent 72%), linear-gradient(24deg, rgba(62, 126, 255, 0.28), transparent 42%), linear-gradient(140deg, #020611 0%, #06221d 48%, #050712 100%)",
  },
  education: {
    label: "Trajectory",
    ghost: "ENGINEERING TO FINANCE",
    accent: "#9ab6ff",
    glow: "rgba(154, 182, 255, 0.31)",
    background:
      "linear-gradient(110deg, rgba(128, 161, 255, 0.34) 0%, transparent 42%), linear-gradient(22deg, transparent 18%, rgba(47, 224, 255, 0.22) 54%, transparent 82%), linear-gradient(135deg, #050716 0%, #111a35 42%, #03050e 100%)",
  },
  practice: {
    label: "Method",
    ghost: "MARKETS RISK WEB3",
    accent: "#2effdf",
    glow: "rgba(46, 255, 223, 0.3)",
    background:
      "linear-gradient(128deg, transparent 0%, rgba(28, 214, 195, 0.34) 46%, transparent 76%), linear-gradient(32deg, rgba(55, 116, 255, 0.22), transparent 45%), linear-gradient(140deg, #020713 0%, #05202c 50%, #02040b 100%)",
  },
  essays: {
    label: "Archive",
    ghost: "FIELD NOTES",
    accent: "#ffd166",
    glow: "rgba(255, 209, 102, 0.25)",
    background:
      "linear-gradient(118deg, rgba(255, 209, 102, 0.22) 0%, transparent 40%), linear-gradient(28deg, transparent 18%, rgba(93, 211, 255, 0.22) 56%, transparent 82%), linear-gradient(140deg, #070611 0%, #171009 48%, #03040b 100%)",
  },
  interests: {
    label: "Frequencies",
    ghost: "MUSIC PHOTOS PEOPLE",
    accent: "#ff7bbf",
    glow: "rgba(255, 123, 191, 0.25)",
    background:
      "linear-gradient(126deg, transparent 0%, rgba(255, 123, 191, 0.28) 44%, transparent 74%), linear-gradient(26deg, rgba(61, 216, 255, 0.24), transparent 48%), linear-gradient(140deg, #080510 0%, #19091d 44%, #03040b 100%)",
  },
};

const heroTags = [
  "FINANCE",
  "WEB3",
  "AI WORKFLOWS",
  "SYSTEMS",
  "RISK",
  "PHOTOGRAPHY",
  "MUSIC",
  "CAPITAL MARKETS",
  "ON-CHAIN SIGNALS",
  "ENGINEERING",
];

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

const profileSignals = [
  {
    k: "01",
    title: "Engineering Roots",
    body: "Hydraulic engineering trained me to read structure before noise: variables, constraints, feedback, and failure modes.",
  },
  {
    k: "02",
    title: "Finance Direction",
    body: "My next chapter is finance, where market behavior, valuation, cycles, and capital discipline become the working language.",
  },
  {
    k: "03",
    title: "Tool Instinct",
    body: "AI, Web3, devices, and workflows interest me most when they become real instruments for research and creation.",
  },
  {
    k: "04",
    title: "Creative Channel",
    body: "Music, photography, writing, and conversation keep the page human. They give the analytical side rhythm and texture.",
  },
];

const educationItems = [
  {
    school: "Heilongjiang University",
    degree: "B.Eng. in Hydraulic and Hydropower Engineering",
    period: "Undergraduate foundation",
    body: "Engineering computation, project design, water resources systems, and structured technical analysis shaped the way I break down complex problems.",
  },
  {
    school: "East China Normal University",
    degree: "Master of Finance",
    period: "Graduate direction",
    body: "I am moving from engineering logic into finance, applying systems thinking to company research, equity financing, investment analysis, and market structure.",
  },
];

const practiceGroups = [
  {
    code: "A",
    title: "Engineering And Innovation",
    body: "I like ideas that can be reasoned through, tested, and built. Competition projects taught me to move from concept to parameters, cost, feedback, and execution.",
    tags: ["Water Engineering", "Innovation Design", "Smart Irrigation", "Data Handling"],
  },
  {
    code: "B",
    title: "Markets And Finance",
    body: "My market learning spans A-shares, Hong Kong equities, fundamentals, DCF thinking, ECM context, and the discipline of risk before return.",
    tags: ["A-shares", "HK Equities", "Valuation", "ECM", "Risk Control"],
  },
  {
    code: "C",
    title: "Web3 And Crypto",
    body: "DeFi, staking, airdrops, launch events, token design, and white papers taught me how incentives and risk can be encoded directly into systems.",
    tags: ["DeFi", "On-chain", "Airdrops", "BTC", "ETH", "SOL"],
  },
  {
    code: "D",
    title: "Global Conversation",
    body: "International youth projects put me in conversation with people from Japan, Russia, the United States, Europe, Africa, and beyond. Talking is also research.",
    tags: ["Exchange", "Collaboration", "Culture", "ENFP"],
  },
];

const interestBlocks = [
  {
    title: "Badminton",
    body: "A long-term college sport that trained reaction speed, tempo, judgment, and calm under pressure.",
    tags: ["School Team", "Club", "Singles", "Doubles", "Levi Cup"],
  },
  {
    title: "AI And Devices",
    body: "I test tools, models, phones, ROMs, and system workflows with a builder's curiosity: how can this enter daily learning?",
    tags: ["ChatGPT", "Claude", "Gemini", "Cursor", "Mobile Systems"],
  },
  {
    title: "Music And Stage",
    body: "I play drums in a band context. Rhythm makes abstract attention physical, immediate, and shared.",
    tags: ["Drums", "Campus Festivals", "Harbin", "Live Stage"],
  },
];

const performances = [
  "Campus Bee Music Festival",
  "Calling Northeast Music Festival",
  "Qiqihar University Music Festival",
  "SUBLIFE performance collaboration in Harbin",
  "Collaborations with musicians from Harbin universities",
];

function formatDate(value) {
  if (!value) return "Undated";
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  }).format(new Date(value));
}

function MarqueeBand({ words, reverse = false, muted = false }) {
  const content = [...words, ...words];

  return (
    <div className={`marquee-band ${reverse ? "marquee-band-reverse" : ""} ${muted ? "marquee-muted" : ""}`}>
      <div className="marquee-track">
        {content.map((word, index) => (
          <span key={`${word}-${index}`}>{word}</span>
        ))}
      </div>
    </div>
  );
}

function MotionBackdrop({ activeSection, y }) {
  const theme = sectionThemes[activeSection] || sectionThemes.hero;

  return (
    <motion.div
      className="motion-backdrop"
      style={{
        "--accent": theme.accent,
        "--glow": theme.glow,
        y,
      }}
    >
      <motion.div
        className="backdrop-gradient"
        animate={{ background: theme.background }}
        transition={{ duration: 1.2, ease: "easeOut" }}
      />
      <div className="backdrop-mesh" />
      <div className="backdrop-grid" />
      <div className="backdrop-vignette" />
      <div className="backdrop-noise" />
      <div className="backdrop-marquees" aria-hidden="true">
        <MarqueeBand words={heroTags} />
        <MarqueeBand words={["CUI XIWEN", theme.ghost, "SIGNAL", "METHOD", "FIELD NOTES"]} reverse muted />
      </div>
      <AnimatePresence mode="wait">
        <motion.div
          key={activeSection}
          className="backdrop-state"
          initial={{ opacity: 0, y: 20, filter: "blur(12px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          exit={{ opacity: 0, y: -20, filter: "blur(12px)" }}
          transition={{ duration: 0.6 }}
        >
          <span>{theme.label}</span>
          <strong>{theme.ghost}</strong>
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
}

function SectionShell({ id, eyebrow, title, lead, children }) {
  const theme = sectionThemes[id] || sectionThemes.about;

  return (
    <motion.section
      id={id}
      className="section-shell"
      style={{ "--accent": theme.accent, "--glow": theme.glow }}
      initial={{ opacity: 0, y: 80 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.16 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="section-ghost" aria-hidden="true">
        {theme.ghost}
      </div>
      <div className="section-heading">
        <span>{eyebrow}</span>
        <h2>{title}</h2>
        {lead ? <p>{lead}</p> : null}
      </div>
      {children}
    </motion.section>
  );
}

function Notice({ tone = "neutral", children }) {
  return <div className={`notice notice-${tone}`}>{children}</div>;
}

function EmptyState({ title, body }) {
  return (
    <div className="empty-state">
      <span />
      <h3>{title}</h3>
      <p>{body}</p>
    </div>
  );
}

function EssayCard({ essay, isAdmin, onDelete, isDeleting }) {
  const images = essay.media?.filter((item) => item.type === "image") || [];
  const audio = essay.media?.find((item) => item.type === "audio");

  return (
    <motion.article
      className="essay-card"
      layout
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -24 }}
    >
      <div className="essay-card-head">
        <div>
          <span>{essay.category}</span>
          <h3>{essay.title}</h3>
        </div>
        <time>{formatDate(essay.createdAt)}</time>
      </div>
      <p>{essay.body}</p>
      {images.length ? (
        <div className="essay-media-grid">
          {images.map((image) => (
            <img key={image.id || image.url} src={image.url} alt={image.name || essay.title} />
          ))}
        </div>
      ) : null}
      {audio ? (
        <audio controls src={audio.url}>
          <track kind="captions" />
        </audio>
      ) : null}
      {isAdmin ? (
        <button className="text-button danger" type="button" disabled={isDeleting} onClick={() => onDelete(essay)}>
          {isDeleting ? "Deleting..." : "Delete note"}
        </button>
      ) : null}
    </motion.article>
  );
}

function AdminDock({
  isAdmin,
  currentUser,
  authBusy,
  authNotice,
  loginEmail,
  onEmailChange,
  onSignIn,
  onSignOut,
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className={`admin-dock ${open ? "admin-dock-open" : ""}`}>
      <button className="admin-toggle" type="button" onClick={() => setOpen((value) => !value)}>
        {isAdmin ? "Admin On" : "Admin"}
      </button>
      <AnimatePresence>
        {open ? (
          <motion.div
            className="admin-panel"
            initial={{ opacity: 0, y: 18, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 18, scale: 0.96 }}
            transition={{ duration: 0.24 }}
          >
            <div>
              <span className="panel-eyebrow">Private Console</span>
              <h3>Publishing access</h3>
            </div>
            {!isSupabaseConfigured ? (
              <Notice tone="error">Supabase environment variables are not configured yet.</Notice>
            ) : isAdmin ? (
              <>
                <p className="muted-text">Signed in as {currentUser?.email || ADMIN_EMAIL}.</p>
                <button className="primary-button subtle" type="button" onClick={onSignOut} disabled={authBusy}>
                  {authBusy ? "Signing out..." : "Sign out"}
                </button>
              </>
            ) : (
              <form className="admin-form" onSubmit={onSignIn}>
                <label>
                  Admin email
                  <input
                    type="email"
                    value={loginEmail}
                    placeholder={ADMIN_EMAIL}
                    onChange={(event) => onEmailChange(event.target.value)}
                  />
                </label>
                <button className="primary-button" type="submit" disabled={authBusy}>
                  {authBusy ? "Sending..." : "Send magic link"}
                </button>
              </form>
            )}
            {authNotice.text ? <Notice tone={authNotice.tone}>{authNotice.text}</Notice> : null}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

export default function ChainsXesWorld() {
  const { scrollY, scrollYProgress } = useScroll();
  const backdropY = useTransform(scrollY, [0, 3200], [0, -240]);
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
    "Draft a market signal, a Web3 note, a photograph's context, or a stage memory. Published notes are saved through Supabase."
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

  const makeId = (prefix) => `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;

  const refreshContent = async () => {
    if (!isSupabaseConfigured) {
      setNotice({
        tone: "neutral",
        text: "Supabase is not configured yet. The public portfolio is live; cloud notes and photo wall items will appear after environment variables are added.",
      });
      return;
    }

    setContentBusy(true);
    try {
      const content = await loadContent();
      setEssays(content.essays);
      setPhotos(content.photos);
      setNotice({ tone: "success", text: "Cloud content loaded." });
    } catch (error) {
      setNotice({ tone: "error", text: error.message });
    } finally {
      setContentBusy(false);
    }
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible?.target?.id) setActiveSection(visible.target.id);
      },
      { threshold: [0.18, 0.32, 0.48, 0.64] }
    );

    sectionTargets.forEach((item) => {
      const section = document.getElementById(item.id);
      if (section) observer.observe(section);
    });

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const syncHashSection = () => {
      const id = window.location.hash.replace("#", "");
      if (sectionTargets.some((item) => item.id === id)) {
        setActiveSection(id);
      }
    };

    syncHashSection();
    window.addEventListener("hashchange", syncHashSection);
    return () => window.removeEventListener("hashchange", syncHashSection);
  }, []);

  useEffect(() => {
    refreshContent();
  }, []);

  useEffect(() => {
    if (!isSupabaseConfigured) return undefined;

    let mounted = true;
    getSession()
      .then((nextSession) => {
        if (mounted) setSession(nextSession);
      })
      .catch((error) => setAuthNotice({ tone: "error", text: error.message }));

    const unsubscribe = onAuthStateChange((nextSession) => {
      setSession(nextSession);
    });

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    return () => {
      objectUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
      objectUrlsRef.current.clear();
    };
  }, []);

  const filteredPhotos = useMemo(() => {
    if (photoFilter === "All") return photos;
    return photos.filter((photo) => photo.category === photoFilter);
  }, [photoFilter, photos]);

  const scrollToSection = (id) => {
    setActiveSection(id);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const clearDraft = () => {
    essayImages.forEach((image) => revokeLocalUrl(image.url));
    if (essayAudio) revokeLocalUrl(essayAudio.url);
    setEssayImages([]);
    setEssayAudio(null);
    setEssayTitle("A New Observation");
    setEssayCategory("Market Notes");
    setEssayBody("");
  };

  const handleEssayImages = (fileList) => {
    if (!isAdmin) return;
    const files = Array.from(fileList || []).filter((file) => file.type.startsWith("image/"));
    if (!files.length) return;

    setEssayImages((current) => [
      ...current,
      ...files.map((file) => ({
        id: makeId("image"),
        file,
        name: file.name,
        url: createLocalUrl(file),
      })),
    ]);
  };

  const handleEssayAudio = (fileList) => {
    if (!isAdmin) return;
    const file = Array.from(fileList || []).find((item) => item.type.startsWith("audio/"));
    if (!file) return;
    if (essayAudio) revokeLocalUrl(essayAudio.url);
    setEssayAudio({
      id: makeId("audio"),
      file,
      name: file.name,
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
    if (essayAudio) revokeLocalUrl(essayAudio.url);
    setEssayAudio(null);
  };

  const handleEssaySubmit = async () => {
    if (!isAdmin) return;
    const title = essayTitle.trim();
    const body = essayBody.trim();
    if (!title || !body) {
      setNotice({ tone: "error", text: "Add a title and body before publishing." });
      return;
    }

    setFormBusy(true);
    try {
      const savedEssay = await createEssay({
        title,
        category: essayCategory,
        body,
        imageFiles: essayImages.map((image) => image.file),
        audioFile: essayAudio?.file || null,
      });
      setEssays((current) => [savedEssay, ...current]);
      setNotice({ tone: "success", text: "Note published to Supabase." });
      clearDraft();
    } catch (error) {
      setNotice({ tone: "error", text: error.message });
    } finally {
      setFormBusy(false);
    }
  };

  const handleSignIn = async (event) => {
    event.preventDefault();
    if (!isSupabaseConfigured) {
      setAuthNotice({ tone: "error", text: "Supabase environment variables are missing." });
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
      setAuthNotice({ tone: "success", text: "Magic link sent. Open it in this browser to unlock editing." });
    } catch (error) {
      setAuthNotice({ tone: "error", text: error.message });
    } finally {
      setAuthBusy(false);
    }
  };

  const handleSignOut = async () => {
    setAuthBusy(true);
    try {
      await signOut();
      setAuthNotice({ tone: "success", text: "Signed out." });
    } catch (error) {
      setAuthNotice({ tone: "error", text: error.message });
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
      setNotice({ tone: "error", text: error.message });
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
      setNotice({ tone: "success", text: "Photo wall updated." });
    } catch (error) {
      setNotice({ tone: "error", text: error.message });
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
      setNotice({ tone: "success", text: "Photo deleted." });
      if (previewPhoto?.id === photo.id) setPreviewPhoto(null);
    } catch (error) {
      setNotice({ tone: "error", text: error.message });
    } finally {
      setDeletingPhotoId(null);
    }
  };

  return (
    <div className="site-shell">
      <MotionBackdrop activeSection={activeSection} y={backdropY} />
      <motion.div className="scroll-progress" style={{ scaleX: scrollYProgress }} />

      <header className="top-nav">
        <button className="brand-mark" type="button" onClick={() => scrollToSection("hero")} aria-label="Go to opening">
          <span className="brand-symbol" />
          <span>ChainsXes</span>
        </button>
        <nav aria-label="Primary navigation">
          {navItems.map((item) => (
            <button
              key={item.id}
              type="button"
              className={activeSection === item.id ? "active" : ""}
              onClick={() => scrollToSection(item.id)}
            >
              <span className="nav-full">{item.label}</span>
              <span className="nav-short">{item.short}</span>
            </button>
          ))}
        </nav>
      </header>

      <AdminDock
        isAdmin={isAdmin}
        currentUser={currentUser}
        authBusy={authBusy}
        authNotice={authNotice}
        loginEmail={loginEmail}
        onEmailChange={setLoginEmail}
        onSignIn={handleSignIn}
        onSignOut={handleSignOut}
      />

      <main>
        <section id="hero" className="hero-section">
          <div className="hero-type-layer" aria-hidden="true">
            <MarqueeBand words={["SYSTEMS", "FINANCE", "WEB3", "AI", "RISK", "PHOTOGRAPHY"]} />
            <MarqueeBand words={["CUI XIWEN", "CHAINSXES", "FIELD NOTES", "MUSIC", "MARKETS"]} reverse muted />
          </div>
          <div className="hero-copy">
            <motion.p
              className="hero-eyebrow"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
            >
              Cui Xiwen / Engineering logic into financial imagination
            </motion.p>
            <motion.h1
              initial={{ opacity: 0, y: 36, filter: "blur(16px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ duration: 1, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            >
              I read the signal beneath the noise.
            </motion.h1>
            <motion.p
              className="hero-lead"
              initial={{ opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.28 }}
            >
              A personal field system for finance, Web3, AI tools, engineering thinking, photography,
              music, and the conversations that keep them alive.
            </motion.p>
            <motion.div
              className="hero-actions"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.42 }}
            >
              <button className="primary-button" type="button" onClick={() => scrollToSection("practice")}>
                Enter the system
              </button>
              <button className="ghost-button" type="button" onClick={() => scrollToSection("essays")}>
                Read field notes
              </button>
            </motion.div>
          </div>

          <div className="hero-dashboard" aria-label="Personal signal overview">
            {[
              ["01", "Engineering", "Structure first"],
              ["02", "Finance", "Risk before return"],
              ["03", "Web3", "Incentives on-chain"],
              ["04", "Creation", "Rhythm, image, text"],
            ].map(([index, title, body]) => (
              <motion.div
                className="signal-tile"
                key={title}
                initial={{ opacity: 0, y: 28 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.5 + Number(index) * 0.08 }}
              >
                <span>{index}</span>
                <strong>{title}</strong>
                <p>{body}</p>
              </motion.div>
            ))}
          </div>
        </section>

        <SectionShell
          id="about"
          eyebrow="01 / Personal Coordinates"
          title="A mind built between structure and motion."
          lead="The site now behaves like a living profile: less resume page, more atmospheric control room."
        >
          <div className="about-layout">
            <div className="portrait-orbit">
              <div className="orbit-ring" />
              <div className="portrait-core">
                <span>CX</span>
                <p>Cui Xiwen</p>
              </div>
            </div>
            <div className="profile-grid">
              {profileSignals.map((item) => (
                <article className="glass-card profile-card" key={item.title}>
                  <span>{item.k}</span>
                  <h3>{item.title}</h3>
                  <p>{item.body}</p>
                </article>
              ))}
            </div>
          </div>
        </SectionShell>

        <SectionShell
          id="education"
          eyebrow="02 / Academic Trajectory"
          title="From engineered systems to capital systems."
          lead="The throughline is not a major change. It is a change of medium: water systems, market systems, human systems."
        >
          <div className="timeline">
            {educationItems.map((item, index) => (
              <article className="timeline-item" key={item.school}>
                <span className="timeline-index">{`0${index + 1}`}</span>
                <div>
                  <p>{item.period}</p>
                  <h3>{item.school}</h3>
                  <strong>{item.degree}</strong>
                  <span>{item.body}</span>
                </div>
              </article>
            ))}
          </div>
        </SectionShell>

        <SectionShell
          id="practice"
          eyebrow="03 / Practice As Method"
          title="A portfolio of systems, risks, and experiments."
          lead="This section is designed as a moving signal board: each card is a practice domain, not just a credential."
        >
          <div className="practice-grid">
            {practiceGroups.map((group) => (
              <motion.article
                className="practice-card"
                key={group.title}
                whileHover={{ y: -8, scale: 1.01 }}
                transition={{ type: "spring", stiffness: 260, damping: 24 }}
              >
                <span>{group.code}</span>
                <h3>{group.title}</h3>
                <p>{group.body}</p>
                <div className="tag-row">
                  {group.tags.map((tag) => (
                    <small key={tag}>{tag}</small>
                  ))}
                </div>
              </motion.article>
            ))}
          </div>
        </SectionShell>

        <SectionShell
          id="essays"
          eyebrow="04 / Field Notes"
          title="Writing as a signal archive."
          lead="Market observations, Web3 notes, tool experiments, image contexts, and fragments of lived rhythm."
        >
          <div className="content-panel">
            {notice.text ? <Notice tone={notice.tone}>{notice.text}</Notice> : null}
            {isAdmin ? (
              <div className="composer">
                <div className="composer-grid">
                  <label>
                    Title
                    <input value={essayTitle} onChange={(event) => setEssayTitle(event.target.value)} />
                  </label>
                  <label>
                    Category
                    <select value={essayCategory} onChange={(event) => setEssayCategory(event.target.value)}>
                      {essayCategories.map((category) => (
                        <option key={category}>{category}</option>
                      ))}
                    </select>
                  </label>
                </div>
                <label>
                  Body
                  <textarea value={essayBody} rows={6} onChange={(event) => setEssayBody(event.target.value)} />
                </label>
                <div className="upload-grid">
                  <label className="upload-zone">
                    <input type="file" accept="image/*" multiple onChange={(event) => handleEssayImages(event.target.files)} />
                    <span>Attach images</span>
                    <small>{essayImages.length ? `${essayImages.length} selected` : "PNG, JPG, WEBP"}</small>
                  </label>
                  <label className="upload-zone">
                    <input type="file" accept="audio/*" onChange={(event) => handleEssayAudio(event.target.files)} />
                    <span>Attach audio</span>
                    <small>{essayAudio?.name || "Optional audio file"}</small>
                  </label>
                </div>
                {essayImages.length || essayAudio ? (
                  <div className="draft-media">
                    {essayImages.map((image) => (
                      <figure key={image.id}>
                        <img src={image.url} alt={image.name} />
                        <button type="button" onClick={() => removeEssayImage(image.id)}>
                          Remove
                        </button>
                      </figure>
                    ))}
                    {essayAudio ? (
                      <div className="audio-draft">
                        <span>{essayAudio.name}</span>
                        <button type="button" onClick={clearEssayAudio}>
                          Remove audio
                        </button>
                      </div>
                    ) : null}
                  </div>
                ) : null}
                <div className="composer-actions">
                  <button className="primary-button" type="button" onClick={handleEssaySubmit} disabled={formBusy}>
                    {formBusy ? "Publishing..." : "Publish note"}
                  </button>
                  <button className="ghost-button" type="button" onClick={clearDraft}>
                    Clear draft
                  </button>
                </div>
              </div>
            ) : (
              <Notice>Visitors browse published notes only. Admin publishing unlocks after email login.</Notice>
            )}

            <div className="essay-list">
              {contentBusy ? <EmptyState title="Loading notes" body="Cloud content is being requested from Supabase." /> : null}
              <AnimatePresence>
                {essays.map((essay) => (
                  <EssayCard
                    key={essay.id}
                    essay={essay}
                    isAdmin={isAdmin}
                    onDelete={handleDeleteEssay}
                    isDeleting={deletingEssayId === essay.id}
                  />
                ))}
              </AnimatePresence>
              {!contentBusy && !essays.length ? (
                <EmptyState
                  title="No public notes yet"
                  body="Once Supabase is configured and the admin publishes, essays, images, and audio will persist here."
                />
              ) : null}
            </div>
          </div>
        </SectionShell>

        <SectionShell
          id="interests"
          eyebrow="05 / Personal Frequencies"
          title="The human side of the operating system."
          lead="Sport, stage, devices, and images keep the work from becoming only abstract thinking."
        >
          <div className="interest-layout">
            <div className="interest-grid">
              {interestBlocks.map((block) => (
                <article className="glass-card interest-card" key={block.title}>
                  <h3>{block.title}</h3>
                  <p>{block.body}</p>
                  <div className="tag-row">
                    {block.tags.map((tag) => (
                      <small key={tag}>{tag}</small>
                    ))}
                  </div>
                </article>
              ))}
            </div>
            <div className="performance-strip">
              {performances.map((item) => (
                <span key={item}>{item}</span>
              ))}
            </div>
          </div>

          <div className="photo-wall">
            <div className="photo-wall-head">
              <div>
                <span className="panel-eyebrow">Photo Wall</span>
                <h3>Images as memory signals.</h3>
              </div>
              <div className="filter-row">
                {photoCategories.map((category) => (
                  <button
                    key={category}
                    type="button"
                    className={photoFilter === category ? "active" : ""}
                    onClick={() => setPhotoFilter(category)}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            {isAdmin ? (
              <div className="photo-upload">
                <select value={photoUploadCategory} onChange={(event) => setPhotoUploadCategory(event.target.value)}>
                  {uploadPhotoCategories.map((category) => (
                    <option key={category}>{category}</option>
                  ))}
                </select>
                <label className="upload-zone compact">
                  <input type="file" accept="image/*" multiple onChange={(event) => handlePhotoUpload(event.target.files)} />
                  <span>{formBusy ? "Uploading..." : "Upload photos"}</span>
                </label>
              </div>
            ) : null}

            {filteredPhotos.length ? (
              <div className="photo-grid">
                {filteredPhotos.map((photo, index) => (
                  <motion.figure
                    key={photo.id}
                    className="photo-card"
                    layout
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(index * 0.04, 0.28) }}
                  >
                    <button type="button" onClick={() => setPreviewPhoto(photo)}>
                      <img src={photo.url} alt={photo.name || photo.category} />
                    </button>
                    <figcaption>
                      <span>{photo.category}</span>
                      {isAdmin ? (
                        <button type="button" disabled={deletingPhotoId === photo.id} onClick={() => removePhoto(photo)}>
                          {deletingPhotoId === photo.id ? "Deleting..." : "Delete"}
                        </button>
                      ) : null}
                    </figcaption>
                  </motion.figure>
                ))}
              </div>
            ) : (
              <EmptyState
                title="Photo wall waiting for images"
                body="Upload photos through the admin console after Supabase credentials are configured."
              />
            )}
          </div>
        </SectionShell>
      </main>

      <footer className="site-footer">
        <span>ChainsXes World</span>
        <p>Designed as a moving personal field system for signals, tools, and creative practice.</p>
      </footer>

      <AnimatePresence>
        {previewPhoto ? (
          <motion.div
            className="lightbox"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setPreviewPhoto(null)}
          >
            <motion.img
              src={previewPhoto.url}
              alt={previewPhoto.name || previewPhoto.category}
              initial={{ scale: 0.92, y: 30 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.92, y: 30 }}
              onClick={(event) => event.stopPropagation()}
            />
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
