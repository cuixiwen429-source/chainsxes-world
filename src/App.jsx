import React, { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion, useScroll, useTransform } from "framer-motion";

const Spline = React.lazy(() => import("@splinetool/react-spline"));

const ADMIN_EMAIL = "694586386@qq.com";
const ADMIN_KEY = "chainsxes-local-admin";
const SPLINE_SCENE_URL = "https://prod.spline.design/oOoC9vJEelZs4iIK/scene.splinecode";
const STORAGE_KEYS = {
  language: "chainsxes.language",
  essays: "chainsxes.localEssays",
  admin: "chainsxes.localAdmin",
};

const navItems = [
  { id: "about", en: "About", zh: "关于", shortEn: "About", shortZh: "关于" },
  { id: "education", en: "Education", zh: "教育", shortEn: "Edu", shortZh: "教育" },
  { id: "practice", en: "Practice", zh: "实践", shortEn: "Work", shortZh: "实践" },
  { id: "essays", en: "Notes", zh: "随笔", shortEn: "Notes", shortZh: "随笔" },
  { id: "world", en: "World", zh: "世界", shortEn: "World", shortZh: "世界" },
];

const sectionTargets = [{ id: "hero" }, ...navItems];

const sectionThemes = {
  hero: {
    label: { en: "Opening", zh: "开场" },
    ghost: "GLASS REFLECTION",
    accent: "#f7f7f2",
    glow: "rgba(255, 255, 255, 0.24)",
    background:
      "radial-gradient(circle at 54% 35%, rgba(255, 255, 255, 0.18), transparent 27%), linear-gradient(118deg, rgba(255, 255, 255, 0.11) 0%, transparent 34%), linear-gradient(135deg, #050505 0%, #111111 44%, #000000 100%)",
  },
  about: {
    label: { en: "Identity", zh: "身份坐标" },
    ghost: "SYSTEM THINKING",
    accent: "#f2f2ee",
    glow: "rgba(255, 255, 255, 0.19)",
    background:
      "radial-gradient(circle at 34% 42%, rgba(255, 255, 255, 0.14), transparent 28%), linear-gradient(130deg, transparent 0%, rgba(255, 255, 255, 0.08) 43%, transparent 72%), linear-gradient(140deg, #030303 0%, #141414 48%, #020202 100%)",
  },
  education: {
    label: { en: "Trajectory", zh: "轨迹" },
    ghost: "ENGINEERING CAPITAL",
    accent: "#ffffff",
    glow: "rgba(255, 255, 255, 0.18)",
    background:
      "radial-gradient(circle at 72% 32%, rgba(255, 255, 255, 0.13), transparent 30%), linear-gradient(110deg, rgba(255, 255, 255, 0.1) 0%, transparent 44%), linear-gradient(135deg, #060606 0%, #181818 42%, #030303 100%)",
  },
  practice: {
    label: { en: "Method", zh: "方法" },
    ghost: "MARKETS RISK WEB3",
    accent: "#eeeeea",
    glow: "rgba(255, 255, 255, 0.2)",
    background:
      "radial-gradient(circle at 45% 45%, rgba(255, 255, 255, 0.16), transparent 29%), linear-gradient(128deg, transparent 0%, rgba(255, 255, 255, 0.1) 46%, transparent 76%), linear-gradient(140deg, #030303 0%, #151515 50%, #020202 100%)",
  },
  essays: {
    label: { en: "Archive", zh: "文字档案" },
    ghost: "STATIC ARCHIVE",
    accent: "#f8f8f4",
    glow: "rgba(255, 255, 255, 0.17)",
    background:
      "radial-gradient(circle at 64% 58%, rgba(255, 255, 255, 0.13), transparent 30%), linear-gradient(118deg, rgba(255, 255, 255, 0.09) 0%, transparent 40%), linear-gradient(140deg, #050505 0%, #151515 48%, #010101 100%)",
  },
  world: {
    label: { en: "Frequencies", zh: "个人频率" },
    ghost: "PERSONAL FREQUENCIES",
    accent: "#f1f1ed",
    glow: "rgba(255, 255, 255, 0.16)",
    background:
      "radial-gradient(circle at 28% 62%, rgba(255, 255, 255, 0.12), transparent 32%), linear-gradient(126deg, transparent 0%, rgba(255, 255, 255, 0.08) 44%, transparent 74%), linear-gradient(140deg, #040404 0%, #121212 44%, #010101 100%)",
  },
};

const copy = {
  en: {
    brand: "ChainsXes",
    heroEyebrow: "Cui Xiwen / Engineering logic into financial imagination",
    heroTitle: "I read the signal beneath the noise.",
    heroLead:
      "A bilingual personal field system for finance, Web3, AI tools, engineering thinking, writing, rhythm, and the conversations that keep them alive.",
    primaryCta: "Enter the system",
    secondaryCta: "Read field notes",
    language: "Language",
    admin: "Admin",
    adminOn: "Admin On",
    adminTitle: "Local publishing console",
    adminBody:
      "Static mode keeps notes in this browser only. Use export/import if you want to move drafts between devices.",
    emailLabel: "Admin email",
    keyLabel: "Local admin key",
    unlock: "Unlock",
    lock: "Lock admin",
    wrongLogin: "Use the admin email and local key.",
    unlocked: "Admin mode unlocked.",
    locked: "Admin mode locked.",
    localMode: "Static site mode: essays are saved locally in this browser, without database or media storage.",
    publish: "Publish note",
    update: "Update note",
    clear: "Clear",
    delete: "Delete",
    edit: "Edit",
    export: "Export JSON",
    import: "Import JSON",
    titleLabel: "Title",
    categoryLabel: "Category",
    essayLanguage: "Essay language",
    bodyLabel: "Body",
    emptyNotesTitle: "No local notes yet",
    emptyNotesBody: "Unlock admin mode and publish your first essay. Visitors only see existing notes.",
    footer:
      "A static bilingual personal site with local notes, kinetic typography, and a cleaner operating surface.",
    sections: {
      about: {
        eyebrow: "01 / Personal Coordinates",
        title: "A mind built between structure and motion.",
        lead:
          "This is no longer a database-heavy demo. It is a sharper static portfolio with a quiet admin layer for writing.",
      },
      education: {
        eyebrow: "02 / Academic Trajectory",
        title: "From engineered systems to capital systems.",
        lead:
          "The throughline is not a major change. It is a change of medium: water systems, market systems, human systems.",
      },
      practice: {
        eyebrow: "03 / Practice As Method",
        title: "A portfolio of systems, risks, and experiments.",
        lead:
          "A moving signal board for the domains I keep studying: engineering, finance, on-chain systems, and global conversation.",
      },
      essays: {
        eyebrow: "04 / Field Notes",
        title: "Writing as a personal signal archive.",
        lead:
          "Short essays can be added from the local admin console. No audio, no image storage, just text with intent.",
      },
      world: {
        eyebrow: "05 / Personal Frequencies",
        title: "The human side of the operating system.",
        lead:
          "Sport, stage, devices, and conversation keep the analytical work from becoming only abstract thinking.",
      },
    },
  },
  zh: {
    brand: "ChainsXes",
    heroEyebrow: "崔曦文 / 用工程逻辑进入金融想象",
    heroTitle: "在噪声之下，阅读真正的信号。",
    heroLead:
      "一个中英文双语的个人场域系统，连接金融、Web3、AI 工具、工程思维、写作、节奏，以及持续打开世界的对话。",
    primaryCta: "进入系统",
    secondaryCta: "阅读随笔",
    language: "语言",
    admin: "管理",
    adminOn: "管理中",
    adminTitle: "本地发布控制台",
    adminBody:
      "静态模式下，随笔只保存在当前浏览器。需要跨设备迁移时，可以使用导出/导入 JSON。",
    emailLabel: "管理员邮箱",
    keyLabel: "本地管理密钥",
    unlock: "解锁",
    lock: "退出管理",
    wrongLogin: "请使用管理员邮箱和本地管理密钥。",
    unlocked: "管理员模式已解锁。",
    locked: "管理员模式已退出。",
    localMode: "静态网站模式：随笔保存在当前浏览器，不再使用数据库、音频或图像存储。",
    publish: "发布随笔",
    update: "更新随笔",
    clear: "清空",
    delete: "删除",
    edit: "编辑",
    export: "导出 JSON",
    import: "导入 JSON",
    titleLabel: "标题",
    categoryLabel: "分类",
    essayLanguage: "随笔语言",
    bodyLabel: "正文",
    emptyNotesTitle: "还没有本地随笔",
    emptyNotesBody: "解锁管理员模式后，可以发布第一篇随笔。访客只会看到已经存在的内容。",
    footer: "一个静态、中英文双语、带本地随笔系统和动态文字视觉的个人网站。",
    sections: {
      about: {
        eyebrow: "01 / 个人坐标",
        title: "在结构与流动之间，建立自己的观察方式。",
        lead: "它不再是一个数据库演示站，而是更干净、更成熟的静态个人主页，写作系统藏在管理层里。",
      },
      education: {
        eyebrow: "02 / 学术轨迹",
        title: "从工程系统，走向资本系统。",
        lead: "真正连续的不是专业名称，而是观察系统的方式：水利系统、市场系统、人的系统。",
      },
      practice: {
        eyebrow: "03 / 实践方法",
        title: "系统、风险与实验构成我的实践地图。",
        lead: "这里像一块流动的信号板，记录我持续学习的领域：工程、金融、链上系统和国际交流。",
      },
      essays: {
        eyebrow: "04 / 随笔档案",
        title: "写作，是个人信号的归档方式。",
        lead: "随笔可以从本地管理员控制台添加。不再使用音频和图像存储，只保留有意图的文字。",
      },
      world: {
        eyebrow: "05 / 个人频率",
        title: "人的一面，让系统不只是系统。",
        lead: "运动、舞台、设备和对话，让理性的工作保持触感、节奏和真实的生活纹理。",
      },
    },
  },
};

const heroTags = {
  en: ["DISTORT SIGNAL", "GLASS REFLECTION", "SYSTEM THINKING", "STATIC ARCHIVE", "BILINGUAL FIELD"],
  zh: ["扭曲信号", "玻璃反射", "系统思维", "静态档案", "双语场域"],
};

const defaultEssays = [
  {
    id: "seed-en-1",
    lang: "en",
    title: "Risk Is A Design Material",
    category: "Market Notes",
    body:
      "I used to think risk was something to avoid after the work was designed. Markets taught me the opposite: risk is part of the design material itself. Position sizing, liquidity, incentives, and time horizon are not accessories. They shape the structure before the first decision is made.",
    createdAt: "2026-05-01T10:00:00.000Z",
  },
  {
    id: "seed-zh-1",
    lang: "zh",
    title: "把噪声变成可观察的结构",
    category: "Life Notes",
    body:
      "我越来越相信，真正重要的不是立刻判断对错，而是先把混乱拆成可以观察的结构。工程训练给了我这个习惯，金融和 Web3 又不断提醒我：系统越复杂，越需要耐心、边界和复盘。",
    createdAt: "2026-05-02T10:00:00.000Z",
  },
];

const profileSignals = {
  en: [
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
  ],
  zh: [
    {
      k: "01",
      title: "工程底色",
      body: "水利工程训练了我先看结构再看噪声：变量、约束、反馈和失效模式，往往比表面结果更重要。",
    },
    {
      k: "02",
      title: "金融方向",
      body: "下一阶段我进入金融，把市场行为、估值、周期和资本纪律变成新的工作语言。",
    },
    {
      k: "03",
      title: "工具直觉",
      body: "我关注 AI、Web3、设备和工作流，不是为了追新，而是为了让工具进入真实的研究和创造。",
    },
    {
      k: "04",
      title: "表达通道",
      body: "音乐、摄影、写作和对话，让分析能力不至于变硬，也让观察世界这件事有节奏和温度。",
    },
  ],
};

const educationItems = {
  en: [
    {
      school: "Heilongjiang University",
      degree: "B.Eng. in Hydraulic and Hydropower Engineering",
      period: "Undergraduate foundation",
      body:
        "Engineering computation, project design, water resources systems, and structured technical analysis shaped the way I break down complex problems.",
    },
    {
      school: "East China Normal University",
      degree: "Master of Finance",
      period: "Graduate direction",
      body:
        "I am moving from engineering logic into finance, applying systems thinking to company research, equity financing, investment analysis, and market structure.",
    },
  ],
  zh: [
    {
      school: "黑龙江大学",
      degree: "水利水电工程 / 工学学士",
      period: "本科基础",
      body: "工程计算、项目设计、水资源系统和结构化技术分析，塑造了我拆解复杂问题的基本方式。",
    },
    {
      school: "华东师范大学",
      degree: "金融硕士",
      period: "研究生方向",
      body: "我正在从工程逻辑进入金融，把系统思维迁移到公司研究、股权融资、投资分析和市场结构中。",
    },
  ],
};

const practiceGroups = {
  en: [
    {
      code: "A",
      title: "Engineering And Innovation",
      body:
        "I like ideas that can be reasoned through, tested, and built. Competition projects taught me to move from concept to parameters, cost, feedback, and execution.",
      tags: ["Water Engineering", "Innovation Design", "Smart Irrigation", "Data Handling"],
    },
    {
      code: "B",
      title: "Markets And Finance",
      body:
        "My market learning spans A-shares, Hong Kong equities, fundamentals, DCF thinking, ECM context, and the discipline of risk before return.",
      tags: ["A-shares", "HK Equities", "Valuation", "ECM", "Risk Control"],
    },
    {
      code: "C",
      title: "Web3 And Crypto",
      body:
        "DeFi, staking, airdrops, launch events, token design, and white papers taught me how incentives and risk can be encoded directly into systems.",
      tags: ["DeFi", "On-chain", "Airdrops", "BTC", "ETH", "SOL"],
    },
    {
      code: "D",
      title: "Global Conversation",
      body:
        "International youth projects put me in conversation with people from Japan, Russia, the United States, Europe, Africa, and beyond. Talking is also research.",
      tags: ["Exchange", "Collaboration", "Culture", "ENFP"],
    },
  ],
  zh: [
    {
      code: "A",
      title: "工程与创新",
      body: "我更相信能被推演、测试和建造的想法。竞赛项目让我学会把概念落到参数、成本、反馈和执行。",
      tags: ["水利工程", "创新设计", "智慧灌溉", "数据处理"],
    },
    {
      code: "B",
      title: "市场与金融",
      body: "我的市场学习覆盖 A 股、港股、基本面、DCF 思维、ECM 场景，以及先风险后收益的纪律。",
      tags: ["A 股", "港股", "估值", "股权融资", "风险控制"],
    },
    {
      code: "C",
      title: "Web3 与加密",
      body: "DeFi、质押、空投、发射活动、代币机制和白皮书，让我看到激励与风险如何被直接写进系统。",
      tags: ["DeFi", "链上交互", "空投", "BTC", "ETH", "SOL"],
    },
    {
      code: "D",
      title: "国际交流",
      body: "国际青年项目让我和来自日本、俄罗斯、美国、欧洲、非洲等背景的人持续对话。对话本身也是研究。",
      tags: ["交流", "协作", "文化", "ENFP"],
    },
  ],
};

const worldBlocks = {
  en: [
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
  ],
  zh: [
    {
      title: "羽毛球",
      body: "大学期间长期参与的运动，训练了反应速度、节奏判断，以及压力下保持稳定的能力。",
      tags: ["校队", "社团", "单打", "双打", "Levi Cup"],
    },
    {
      title: "AI 与设备",
      body: "我用建造者的好奇心测试模型、工具、手机、ROM 和系统工作流：它如何进入真实学习？",
      tags: ["ChatGPT", "Claude", "Gemini", "Cursor", "移动系统"],
    },
    {
      title: "音乐与舞台",
      body: "我在乐队里打鼓。节奏让抽象的注意力变得具体、即时，也能被他人共同感知。",
      tags: ["鼓", "校园音乐节", "哈尔滨", "现场"],
    },
  ],
};

const essayCategories = {
  en: ["Market Notes", "Web3 Signals", "AI Tools", "Systems", "Life Notes"],
  zh: ["市场笔记", "Web3 信号", "AI 工具", "系统观察", "生活随笔"],
};

function formatDate(value, lang) {
  if (!value) return lang === "zh" ? "未标注日期" : "Undated";
  return new Intl.DateTimeFormat(lang === "zh" ? "zh-CN" : "en", {
    month: lang === "zh" ? "long" : "short",
    day: "2-digit",
    year: "numeric",
  }).format(new Date(value));
}

function makeId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  return `note-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function readJson(key, fallback) {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

class SplineErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { failed: false };
  }

  static getDerivedStateFromError() {
    return { failed: true };
  }

  render() {
    if (this.state.failed) return this.props.fallback;
    return this.props.children;
  }
}

function SplineFallback() {
  return (
    <div className="spline-fallback" aria-hidden="true">
      <div className="fallback-type">
        <span>DISTORT SIGNAL</span>
        <span>GLASS REFLECTION</span>
        <span>SYSTEM THINKING</span>
      </div>
      <span className="fallback-sphere fallback-sphere-main" />
      <span className="fallback-sphere fallback-sphere-small" />
      <span className="fallback-sphere fallback-sphere-mini" />
    </div>
  );
}

function SplineBackdrop() {
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);

  return (
    <div className={`spline-backdrop ${ready ? "spline-ready" : ""} ${failed ? "spline-failed" : ""}`} aria-hidden="true">
      <div className="spline-stage">
        {!ready || failed ? <SplineFallback /> : null}
        {!failed ? (
          <SplineErrorBoundary fallback={<SplineFallback />}>
            <React.Suspense fallback={null}>
              <div className="spline-canvas-wrap">
                <Spline scene={SPLINE_SCENE_URL} onLoad={() => setReady(true)} onError={() => setFailed(true)} />
              </div>
            </React.Suspense>
          </SplineErrorBoundary>
        ) : null}
        <div className="spline-veil" />
      </div>
    </div>
  );
}

function MarqueeBand({ words, reverse = false, muted = false }) {
  const content = [...words, ...words, ...words];
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

function MotionBackdrop({ activeSection, language, y }) {
  const theme = sectionThemes[activeSection] || sectionThemes.hero;

  return (
    <motion.div className="motion-backdrop" style={{ "--accent": theme.accent, "--glow": theme.glow, y }}>
      <SplineBackdrop />
      <motion.div
        className="backdrop-gradient"
        animate={{ background: theme.background }}
        transition={{ duration: 1.1, ease: "easeOut" }}
      />
      <div className="backdrop-mesh" />
      <div className="backdrop-grid" />
      <div className="backdrop-scan" />
      <div className="backdrop-vignette" />
      <div className="backdrop-noise" />
      <div className="backdrop-marquees" aria-hidden="true">
        <MarqueeBand words={heroTags[language]} />
        <MarqueeBand
          words={[language === "zh" ? "崔曦文" : "CUI XIWEN", theme.ghost, "SIGNAL", "METHOD", "FIELD NOTES"]}
          reverse
          muted
        />
      </div>
      <AnimatePresence mode="wait">
        <motion.div
          key={`${activeSection}-${language}`}
          className="backdrop-state"
          initial={{ opacity: 0, y: 20, filter: "blur(12px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          exit={{ opacity: 0, y: -20, filter: "blur(12px)" }}
          transition={{ duration: 0.55 }}
        >
          <span>{theme.label[language]}</span>
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
      initial={{ opacity: 0, y: 76, filter: "blur(14px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true, amount: 0.16 }}
      transition={{ duration: 0.82, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="section-ghost" aria-hidden="true">
        {theme.ghost}
      </div>
      <div className="section-heading">
        <span>{eyebrow}</span>
        <h2>{title}</h2>
        <p>{lead}</p>
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

function EssayCard({ essay, language, labels, isAdmin, onEdit, onDelete }) {
  return (
    <motion.article
      className="essay-card"
      layout
      initial={{ opacity: 0, y: 22 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -22 }}
    >
      <div className="essay-card-head">
        <div>
          <span>{essay.category}</span>
          <h3>{essay.title}</h3>
        </div>
        <time>{formatDate(essay.createdAt, language)}</time>
      </div>
      <p>{essay.body}</p>
      <div className="essay-meta-row">
        <small>{essay.lang === "zh" ? "中文" : "English"}</small>
        {isAdmin ? (
          <span>
            <button className="text-button" type="button" onClick={() => onEdit(essay)}>
              {labels.edit}
            </button>
            <button className="text-button danger" type="button" onClick={() => onDelete(essay.id)}>
              {labels.delete}
            </button>
          </span>
        ) : null}
      </div>
    </motion.article>
  );
}

function AdminDock({
  language,
  labels,
  isAdmin,
  adminEmail,
  adminKey,
  notice,
  onEmailChange,
  onKeyChange,
  onLogin,
  onLogout,
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className={`admin-dock ${open ? "admin-dock-open" : ""}`}>
      <button className="admin-toggle" type="button" onClick={() => setOpen((value) => !value)}>
        {isAdmin ? labels.adminOn : labels.admin}
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
              <span className="panel-eyebrow">{language === "zh" ? "本地控制台" : "Local Console"}</span>
              <h3>{labels.adminTitle}</h3>
              <p className="muted-text">{labels.adminBody}</p>
            </div>
            {isAdmin ? (
              <button className="primary-button subtle" type="button" onClick={onLogout}>
                {labels.lock}
              </button>
            ) : (
              <form className="admin-form" onSubmit={onLogin}>
                <label>
                  {labels.emailLabel}
                  <input type="email" value={adminEmail} onChange={(event) => onEmailChange(event.target.value)} />
                </label>
                <label>
                  {labels.keyLabel}
                  <input type="password" value={adminKey} onChange={(event) => onKeyChange(event.target.value)} />
                </label>
                <button className="primary-button" type="submit">
                  {labels.unlock}
                </button>
              </form>
            )}
            {notice ? <Notice tone={notice.tone}>{notice.text}</Notice> : null}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

export default function ChainsXesWorld() {
  const { scrollY, scrollYProgress } = useScroll();
  const backdropY = useTransform(scrollY, [0, 3200], [0, -260]);
  const [language, setLanguage] = useState(() => {
    if (typeof window === "undefined") return "en";
    return window.localStorage.getItem(STORAGE_KEYS.language) || "en";
  });
  const [activeSection, setActiveSection] = useState("hero");
  const [isAdmin, setIsAdmin] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.sessionStorage.getItem(STORAGE_KEYS.admin) === "true";
  });
  const [adminEmail, setAdminEmail] = useState(ADMIN_EMAIL);
  const [adminKey, setAdminKey] = useState("");
  const [adminNotice, setAdminNotice] = useState(null);
  const [essays, setEssays] = useState(() => {
    if (typeof window === "undefined") return defaultEssays;
    const stored = readJson(STORAGE_KEYS.essays, []);
    return stored.length ? stored : defaultEssays;
  });
  const [draft, setDraft] = useState({
    id: null,
    lang: "zh",
    title: "",
    category: "生活随笔",
    body: "",
  });

  const labels = copy[language];
  const sectionCopy = labels.sections;
  const visibleEssays = useMemo(
    () => [...essays].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),
    [essays]
  );

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEYS.language, language);
    document.documentElement.lang = language === "zh" ? "zh-CN" : "en";
  }, [language]);

  useEffect(() => {
    const customEssays = essays.filter((essay) => !String(essay.id).startsWith("seed-"));
    window.localStorage.setItem(STORAGE_KEYS.essays, JSON.stringify(customEssays));
  }, [essays]);

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
      if (sectionTargets.some((item) => item.id === id)) setActiveSection(id);
    };

    syncHashSection();
    window.addEventListener("hashchange", syncHashSection);
    return () => window.removeEventListener("hashchange", syncHashSection);
  }, []);

  const scrollToSection = (id) => {
    setActiveSection(id);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const toggleLanguage = (nextLanguage) => {
    setLanguage(nextLanguage);
    setDraft((current) => ({
      ...current,
      lang: nextLanguage,
      category: essayCategories[nextLanguage][0],
    }));
  };

  const resetDraft = () => {
    setDraft({
      id: null,
      lang: language,
      title: "",
      category: essayCategories[language][0],
      body: "",
    });
  };

  const handleLogin = (event) => {
    event.preventDefault();
    if (adminEmail.trim().toLowerCase() === ADMIN_EMAIL.toLowerCase() && adminKey === ADMIN_KEY) {
      setIsAdmin(true);
      window.sessionStorage.setItem(STORAGE_KEYS.admin, "true");
      setAdminNotice({ tone: "success", text: labels.unlocked });
      setAdminKey("");
    } else {
      setAdminNotice({ tone: "error", text: labels.wrongLogin });
    }
  };

  const handleLogout = () => {
    setIsAdmin(false);
    window.sessionStorage.removeItem(STORAGE_KEYS.admin);
    setAdminNotice({ tone: "neutral", text: labels.locked });
    resetDraft();
  };

  const handlePublish = () => {
    const title = draft.title.trim();
    const body = draft.body.trim();
    if (!title || !body) {
      setAdminNotice({
        tone: "error",
        text: language === "zh" ? "请先填写标题和正文。" : "Add a title and body before publishing.",
      });
      return;
    }

    const nextEssay = {
      id: draft.id || makeId(),
      lang: draft.lang,
      title,
      category: draft.category,
      body,
      createdAt: draft.id ? essays.find((essay) => essay.id === draft.id)?.createdAt || new Date().toISOString() : new Date().toISOString(),
    };

    setEssays((current) => {
      if (draft.id) return current.map((essay) => (essay.id === draft.id ? nextEssay : essay));
      return [nextEssay, ...current];
    });
    setAdminNotice({
      tone: "success",
      text: language === "zh" ? "随笔已保存到当前浏览器。" : "Note saved in this browser.",
    });
    resetDraft();
  };

  const handleEdit = (essay) => {
    setDraft({
      id: essay.id,
      lang: essay.lang,
      title: essay.title,
      category: essay.category,
      body: essay.body,
    });
    scrollToSection("essays");
  };

  const handleDelete = (id) => {
    setEssays((current) => current.filter((essay) => essay.id !== id));
  };

  const exportEssays = () => {
    const blob = new Blob([JSON.stringify(essays, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "chainsxes-essays.json";
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const importEssays = async (file) => {
    if (!file) return;
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      if (!Array.isArray(parsed)) throw new Error("Invalid JSON");
      setEssays(parsed);
      setAdminNotice({
        tone: "success",
        text: language === "zh" ? "随笔 JSON 已导入。" : "Essay JSON imported.",
      });
    } catch {
      setAdminNotice({
        tone: "error",
        text: language === "zh" ? "JSON 文件格式不正确。" : "The JSON file is not valid.",
      });
    }
  };

  return (
    <div className={`site-shell lang-${language}`}>
      <MotionBackdrop activeSection={activeSection} language={language} y={backdropY} />
      <motion.div className="scroll-progress" style={{ scaleX: scrollYProgress }} />

      <header className="top-nav">
        <button className="brand-mark" type="button" onClick={() => scrollToSection("hero")} aria-label="Go to opening">
          <span className="brand-symbol" />
          <span>{labels.brand}</span>
        </button>
        <nav aria-label="Primary navigation">
          {navItems.map((item) => (
            <button
              key={item.id}
              type="button"
              className={activeSection === item.id ? "active" : ""}
              onClick={() => scrollToSection(item.id)}
            >
              <span className="nav-full">{item[language]}</span>
              <span className="nav-short">{language === "zh" ? item.shortZh : item.shortEn}</span>
            </button>
          ))}
        </nav>
        <div className="language-toggle" aria-label={labels.language}>
          <button type="button" className={language === "zh" ? "active" : ""} onClick={() => toggleLanguage("zh")}>
            中
          </button>
          <button type="button" className={language === "en" ? "active" : ""} onClick={() => toggleLanguage("en")}>
            EN
          </button>
        </div>
      </header>

      <AdminDock
        language={language}
        labels={labels}
        isAdmin={isAdmin}
        adminEmail={adminEmail}
        adminKey={adminKey}
        notice={adminNotice}
        onEmailChange={setAdminEmail}
        onKeyChange={setAdminKey}
        onLogin={handleLogin}
        onLogout={handleLogout}
      />

      <main>
        <section id="hero" className="hero-section">
          <div className="hero-type-layer" aria-hidden="true">
            <MarqueeBand words={heroTags[language]} />
            <MarqueeBand words={language === "zh" ? ["崔曦文", "个人系统", "随笔", "市场", "节奏"] : ["CUI XIWEN", "CHAINSXES", "FIELD NOTES", "MUSIC", "MARKETS"]} reverse muted />
          </div>
          <div className="hero-copy">
            <motion.p className="hero-eyebrow" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              {labels.heroEyebrow}
            </motion.p>
            <motion.h1
              initial={{ opacity: 0, y: 36, filter: "blur(16px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ duration: 1, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            >
              {labels.heroTitle}
            </motion.h1>
            <motion.p className="hero-lead" initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.24 }}>
              {labels.heroLead}
            </motion.p>
            <motion.div className="hero-actions" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.38 }}>
              <button className="primary-button" type="button" onClick={() => scrollToSection("practice")}>
                {labels.primaryCta}
              </button>
              <button className="ghost-button" type="button" onClick={() => scrollToSection("essays")}>
                {labels.secondaryCta}
              </button>
            </motion.div>
          </div>

          <div className="hero-dashboard" aria-label="Personal signal overview">
            {(language === "zh"
              ? [
                  ["01", "工程", "先看结构"],
                  ["02", "金融", "风险先于收益"],
                  ["03", "Web3", "激励写进系统"],
                  ["04", "写作", "把信号留下"],
                ]
              : [
                  ["01", "Engineering", "Structure first"],
                  ["02", "Finance", "Risk before return"],
                  ["03", "Web3", "Incentives on-chain"],
                  ["04", "Writing", "Signals retained"],
                ]
            ).map(([index, title, body]) => (
              <motion.div
                className="signal-tile"
                key={title}
                initial={{ opacity: 0, y: 28 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.46 + Number(index) * 0.08 }}
              >
                <span>{index}</span>
                <strong>{title}</strong>
                <p>{body}</p>
              </motion.div>
            ))}
          </div>
        </section>

        <SectionShell id="about" {...sectionCopy.about}>
          <div className="about-layout">
            <div className="portrait-orbit">
              <div className="orbit-ring" />
              <div className="portrait-core">
                <span>CX</span>
                <p>{language === "zh" ? "崔曦文" : "Cui Xiwen"}</p>
              </div>
            </div>
            <div className="profile-grid">
              {profileSignals[language].map((item) => (
                <article className="glass-card profile-card" key={item.title}>
                  <span>{item.k}</span>
                  <h3>{item.title}</h3>
                  <p>{item.body}</p>
                </article>
              ))}
            </div>
          </div>
        </SectionShell>

        <SectionShell id="education" {...sectionCopy.education}>
          <div className="timeline">
            {educationItems[language].map((item, index) => (
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

        <SectionShell id="practice" {...sectionCopy.practice}>
          <div className="practice-grid">
            {practiceGroups[language].map((group) => (
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

        <SectionShell id="essays" {...sectionCopy.essays}>
          <div className="content-panel">
            <Notice>{labels.localMode}</Notice>
            {isAdmin ? (
              <div className="composer">
                <div className="composer-grid">
                  <label>
                    {labels.titleLabel}
                    <input value={draft.title} onChange={(event) => setDraft((current) => ({ ...current, title: event.target.value }))} />
                  </label>
                  <label>
                    {labels.categoryLabel}
                    <select value={draft.category} onChange={(event) => setDraft((current) => ({ ...current, category: event.target.value }))}>
                      {essayCategories[draft.lang].map((category) => (
                        <option key={category}>{category}</option>
                      ))}
                    </select>
                  </label>
                  <label>
                    {labels.essayLanguage}
                    <select
                      value={draft.lang}
                      onChange={(event) =>
                        setDraft((current) => ({
                          ...current,
                          lang: event.target.value,
                          category: essayCategories[event.target.value][0],
                        }))
                      }
                    >
                      <option value="zh">中文</option>
                      <option value="en">English</option>
                    </select>
                  </label>
                </div>
                <label>
                  {labels.bodyLabel}
                  <textarea value={draft.body} rows={8} onChange={(event) => setDraft((current) => ({ ...current, body: event.target.value }))} />
                </label>
                <div className="composer-actions">
                  <button className="primary-button" type="button" onClick={handlePublish}>
                    {draft.id ? labels.update : labels.publish}
                  </button>
                  <button className="ghost-button" type="button" onClick={resetDraft}>
                    {labels.clear}
                  </button>
                  <button className="ghost-button" type="button" onClick={exportEssays}>
                    {labels.export}
                  </button>
                  <label className="import-button">
                    {labels.import}
                    <input type="file" accept="application/json" onChange={(event) => importEssays(event.target.files?.[0])} />
                  </label>
                </div>
              </div>
            ) : null}

            <div className="essay-list">
              <AnimatePresence>
                {visibleEssays.map((essay) => (
                  <EssayCard
                    key={essay.id}
                    essay={essay}
                    language={language}
                    labels={labels}
                    isAdmin={isAdmin}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                  />
                ))}
              </AnimatePresence>
              {!visibleEssays.length ? <EmptyState title={labels.emptyNotesTitle} body={labels.emptyNotesBody} /> : null}
            </div>
          </div>
        </SectionShell>

        <SectionShell id="world" {...sectionCopy.world}>
          <div className="world-layout">
            <div className="interest-grid">
              {worldBlocks[language].map((block) => (
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
            <div className="signal-rail">
              {(language === "zh"
                ? ["把经验写成系统", "把系统变成作品", "把作品留给未来的自己"]
                : ["Turn experience into systems", "Turn systems into work", "Leave better signals for the future self"]
              ).map((item) => (
                <span key={item}>{item}</span>
              ))}
            </div>
          </div>
        </SectionShell>
      </main>

      <footer className="site-footer">
        <span>ChainsXes World</span>
        <p>{labels.footer}</p>
      </footer>
    </div>
  );
}
