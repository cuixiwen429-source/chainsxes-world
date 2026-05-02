import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
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
  { id: "education", label: "教育经历" },
  { id: "practice", label: "竞赛 / 实践经历" },
  { id: "essays", label: "随笔" },
  { id: "interests", label: "兴趣爱好" },
];

const essayCategories = [
  "市场笔记",
  "Web3 观察",
  "AI 工具",
  "摄影札记",
  "音乐与舞台",
  "生活随笔",
];

const photoCategories = ["全部", "风光", "城市", "细节", "全景", "纪实"];
const uploadPhotoCategories = ["风光", "城市", "细节", "全景", "纪实"];

const aboutCards = [
  {
    title: "工程背景",
    words: "结构化思维、数据处理、工程训练",
    body: "习惯先拆结构，再看变量、边界与结果。",
  },
  {
    title: "金融转向",
    words: "资本市场、投资分析、风险意识",
    body: "从价格波动走向价值、周期与纪律。",
  },
  {
    title: "表达方式",
    words: "音乐、摄影、随笔、社交",
    body: "用节奏、影像和文字保留观察世界的入口。",
  },
  {
    title: "技术兴趣",
    words: "AI、Web3、数码、工具流",
    body: "更关注工具如何进入真实学习、研究与创作。",
  },
];

const educationItems = [
  {
    school: "黑龙江大学",
    degree: "水利水电工程｜本科",
    period: "Engineering",
    body: "本科阶段接受水利水电工程训练，学习工程计算、结构化分析、数据处理、项目设计和水利工程相关专业知识。工科背景构成了我分析问题的底层方法。",
  },
  {
    school: "华东师范大学",
    degree: "金融硕士｜硕士阶段",
    period: "Finance",
    body: "硕士阶段转向金融领域，希望把工程训练中的逻辑、数据和系统分析能力迁移到资本市场、公司研究、投资分析和股权融资相关场景中。",
  },
];

const practiceGroups = [
  {
    eyebrow: "A",
    title: "工程与创新实践",
    body: "工科竞赛和项目经历让我习惯把复杂问题拆成结构、参数、流程和结果。相比单纯提出想法，我更关注方案是否能被推导、被验证、被落地。",
    tags: ["水利相关竞赛", "水创赛", "智能滴灌", "工程设计", "数据处理"],
    projects: [
      {
        name: "Water Innovation Design Competition",
        body: "参与立体化除磷系统设计，将机械调节、监测反馈、生物强化与数据管理整合为工程方案。",
      },
      {
        name: "Smart Irrigation Project",
        body: "参与智能滴灌项目，围绕墒情识别、U-Net 模型辅助监测、资金预算与现金流管理展开。",
      },
      {
        name: "Pharma Cloud Pavilion",
        body: "参与或主导大健康平台商业计划书、市场定位、盈利模式、公司注册与融资筹备。",
      },
    ],
  },
  {
    eyebrow: "B",
    title: "金融与市场实践",
    body: "我从大三开始逐渐对金融市场产生兴趣，先后接触 A 股、港股和 Crypto 市场。相比只看价格涨跌，我希望逐渐建立对公司价值、市场结构、风险控制和长期策略的理解。",
    tags: ["A 股", "港股", "公司基本面", "DCF 估值", "ECM", "定向增发"],
    projects: [],
  },
  {
    eyebrow: "C",
    title: "Web3 / Crypto 实践",
    body: "在 Web3 领域，我参与过 DeFi、质押、空投、项目打新、新币发行和链上交互，也阅读过多份 Crypto 白皮书。这个过程让我理解了链上投资中的收益结构、激励机制和风险暴露。\n\n我也曾经历高杠杆合约交易失败并最终爆仓。这不是值得美化的经历，但它让我真正理解了仓位、杠杆、风险和纪律。",
    tags: ["DeFi", "链上质押", "空投", "新币发行", "白皮书", "BTC / ETH / SOL"],
    projects: [],
  },
  {
    eyebrow: "D",
    title: "国际交流与社团实践",
    body: "大学期间，我加入国际青年联谊会，并担任文艺国青相关委员。我经常与不同国家和地区的学生交流，包括日本、俄罗斯、美国、欧洲、非洲等背景的朋友。对我来说，社交不是简单聊天，而是一种学习方式。\n\n我也参与过国家级“知行中国 / 知情中国”相关项目，与多国学生协作完成项目任务。",
    tags: ["国际青年联谊会", "文艺国青委员", "多国学生交流", "知行中国", "项目协作"],
    projects: [],
  },
];

const musicMembers = [
  { role: "键盘手", name: "Henry" },
  { role: "吉他手", name: "Mr.Jiang" },
  { role: "主唱", name: "Miss.Wang" },
  { role: "鼓手", name: "崔曦文" },
];

const performances = [
  "校园蜜蜂音乐节",
  "呼唤东北音乐节",
  "齐齐哈尔市级高校音乐节",
  "高校音乐节相关演出",
  "哈尔滨机场路 SUBLIFE 演出合作",
  "与哈尔滨多所高校乐手合作",
  "与刀郎鼓手方正天所在乐队“短歌”合作",
];

const interestBlocks = [
  {
    key: "badminton",
    title: "羽毛球",
    body: "羽毛球是我大学期间长期坚持的运动。它训练了我的反应、节奏、判断和对抗中的稳定性。",
    tags: ["羽毛球社团", "学院队经历", "四五年", "单打", "双打", "莱维杯"],
  },
  {
    key: "ai",
    title: "AI 与数码",
    body: "我对 AI 和数码工具保持长期兴趣。相比单纯体验新工具，我更关注它们如何进入真实工作流，帮助我完成学习、写作、研究、数据整理和内容创作。",
    tags: ["ChatGPT", "Claude", "Gemini", "Grok", "Cursor", "酷安", "刷机", "系统优化", "手机摄影"],
  },
  {
    key: "social",
    title: "社交与国际交流",
    body: "我喜欢和不同背景的人交流。对我来说，社交不是简单聊天，而是一种学习方式。",
    tags: ["ENFP", "聊天", "请教", "国际青年联谊会", "多国学生交流", "知行中国 / 知情中国"],
  },
];

function MountainScene({ className = "", style }) {
  return (
    <motion.div
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}
      style={style}
      aria-hidden="true"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_12%,rgba(255,255,255,0.9),transparent_30%),linear-gradient(180deg,rgba(244,241,235,0.92),rgba(229,232,226,0.55)_52%,rgba(246,245,241,0.92))]" />
      <svg
        className="absolute bottom-[-2rem] left-1/2 h-[58vh] min-h-[420px] w-[140vw] -translate-x-1/2 text-stone-900/70"
        viewBox="0 0 1600 620"
        fill="none"
        preserveAspectRatio="none"
      >
        <path
          d="M0 465C132 413 239 386 344 421C428 449 495 534 594 501C681 472 704 361 806 337C913 312 989 425 1087 414C1191 402 1241 290 1345 283C1439 276 1510 352 1600 343V620H0V465Z"
          fill="currentColor"
          fillOpacity="0.08"
        />
        <path
          d="M0 383C129 361 220 268 347 287C444 301 488 402 585 398C702 394 751 237 872 227C978 218 1034 326 1137 319C1242 312 1302 191 1408 181C1486 174 1546 222 1600 248V620H0V383Z"
          fill="currentColor"
          fillOpacity="0.12"
        />
        <path
          d="M0 299C88 265 159 253 242 273C337 296 393 346 491 315C585 286 614 183 712 157C826 126 910 220 1013 196C1118 171 1157 54 1267 48C1401 41 1475 154 1600 128V620H0V299Z"
          fill="currentColor"
          fillOpacity="0.08"
        />
        <path
          d="M107 385C192 356 258 355 332 375"
          stroke="currentColor"
          strokeOpacity="0.15"
          strokeWidth="2"
        />
        <path
          d="M878 284C948 258 1000 259 1061 279"
          stroke="currentColor"
          strokeOpacity="0.12"
          strokeWidth="2"
        />
      </svg>
      <div className="absolute left-[-10%] top-[32%] h-40 w-[72vw] rounded-full bg-white/50 blur-3xl" />
      <div className="absolute right-[-12%] top-[48%] h-48 w-[64vw] rounded-full bg-stone-100/70 blur-3xl" />
    </motion.div>
  );
}

function SectionShell({ id, eyebrow, title, children, className = "" }) {
  return (
    <motion.section
      id={id}
      className={`relative overflow-hidden px-5 py-24 sm:px-8 lg:px-16 ${className}`}
      initial={{ opacity: 0, y: 42 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ amount: 0.18, once: true }}
      transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="relative mx-auto max-w-6xl pr-0 lg:pr-28">
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
            {isDeleting ? "删除中" : "删除"}
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
  const mountainY = useTransform(scrollY, [0, 900], [0, -68]);
  const objectUrlsRef = useRef(new Set());
  const [session, setSession] = useState(null);
  const [activeSection, setActiveSection] = useState("about");
  const [loginEmail, setLoginEmail] = useState(ADMIN_EMAIL);
  const [authBusy, setAuthBusy] = useState(false);
  const [authNotice, setAuthNotice] = useState({ tone: "neutral", text: "" });
  const [contentBusy, setContentBusy] = useState(false);
  const [formBusy, setFormBusy] = useState(false);
  const [notice, setNotice] = useState({ tone: "neutral", text: "" });
  const [essays, setEssays] = useState([]);
  const [essayTitle, setEssayTitle] = useState("一段新的观察");
  const [essayCategory, setEssayCategory] = useState("市场笔记");
  const [essayBody, setEssayBody] = useState(
    "这里可以写一次市场复盘、一张照片背后的情绪，也可以写一次 Web3 项目的研究。登录管理员账号后发布，内容会保存到云端。"
  );
  const [essayImages, setEssayImages] = useState([]);
  const [essayAudio, setEssayAudio] = useState(null);
  const [photoUploadCategory, setPhotoUploadCategory] = useState("风光");
  const [photoFilter, setPhotoFilter] = useState("全部");
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
        text: "Supabase 尚未配置。页面可正常浏览，云端随笔和照片会在填入环境变量后加载。",
      });
      return;
    }

    setContentBusy(true);
    try {
      const content = await loadContent();
      setEssays(content.essays);
      setPhotos(content.photos);
      setNotice({ tone: "success", text: "云端内容已同步。" });
    } catch (error) {
      setNotice({
        tone: "error",
        text: error.message || "云端内容加载失败，请检查 Supabase 配置和 RLS 策略。",
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

    outlineItems.forEach((item) => {
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
        text: "Supabase 尚未配置。设置 VITE_SUPABASE_URL 和 VITE_SUPABASE_ANON_KEY 后可启用云端保存。",
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
          setAuthNotice({ tone: "error", text: error.message || "登录状态读取失败。" });
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
    if (photoFilter === "全部") return photos;
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
    setEssayTitle("一段新的观察");
    setEssayCategory("市场笔记");
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
      setNotice({ tone: "error", text: "随笔标题和正文都需要填写。" });
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
      setNotice({ tone: "success", text: "随笔已发布到 Supabase。" });
    } catch (error) {
      setNotice({ tone: "error", text: error.message || "随笔发布失败。" });
    } finally {
      setFormBusy(false);
    }
  };

  const handleSignIn = async (event) => {
    event.preventDefault();

    if (!isSupabaseConfigured) {
      setAuthNotice({ tone: "error", text: "请先配置 Supabase 环境变量。" });
      return;
    }

    const email = loginEmail.trim().toLowerCase();
    if (email !== ADMIN_EMAIL.toLowerCase()) {
      setAuthNotice({ tone: "error", text: `只有 ${ADMIN_EMAIL} 可以编辑内容。` });
      return;
    }

    setAuthBusy(true);
    try {
      await signInWithEmail(email);
      setAuthNotice({ tone: "success", text: "登录链接已发送，请检查邮箱并从邮件返回网站。" });
    } catch (error) {
      setAuthNotice({ tone: "error", text: error.message || "登录邮件发送失败。" });
    } finally {
      setAuthBusy(false);
    }
  };

  const handleSignOut = async () => {
    setAuthBusy(true);
    try {
      await signOut();
      setAuthNotice({ tone: "success", text: "已退出管理员账号。" });
    } catch (error) {
      setAuthNotice({ tone: "error", text: error.message || "退出失败。" });
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
      setNotice({ tone: "success", text: "随笔已删除。" });
    } catch (error) {
      setNotice({ tone: "error", text: error.message || "随笔删除失败。" });
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
      setNotice({ tone: "success", text: "摄影作品已上传到 Supabase。" });
    } catch (error) {
      setNotice({ tone: "error", text: error.message || "摄影作品上传失败。" });
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
      setNotice({ tone: "success", text: "摄影作品已删除。" });
    } catch (error) {
      setNotice({ tone: "error", text: error.message || "摄影作品删除失败。" });
    } finally {
      setDeletingPhotoId(null);
    }
  };

  return (
    <div className="relative min-h-screen overflow-x-hidden scroll-smooth bg-[#f5f2eb] text-stone-900 selection:bg-stone-900 selection:text-white">
      <motion.div
        className="fixed left-0 top-0 z-50 h-[3px] w-full origin-left bg-stone-950"
        style={{ scaleX: scrollYProgress }}
      />

      <aside className="fixed right-5 top-1/2 z-40 hidden w-48 -translate-y-1/2 rounded-lg border border-white/60 bg-white/50 p-3 shadow-[0_18px_50px_rgba(35,32,28,0.08)] backdrop-blur-xl lg:block">
        <p className="px-3 pb-3 text-[10px] uppercase tracking-[0.24em] text-stone-400">
          Outline
        </p>
        <nav className="space-y-1" aria-label="页面大纲">
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

      <header className="relative flex min-h-screen items-center justify-center overflow-hidden px-5 py-24 sm:px-8 lg:px-16">
        <MountainScene style={{ y: mountainY }} />
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
                  退出
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
                  {authBusy ? "发送中" : "管理员登录"}
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
          <p className="mb-6 text-sm tracking-[0.3em] text-stone-500">崔曦文</p>
          <h1 className="text-5xl font-semibold tracking-normal text-stone-950 sm:text-7xl lg:text-8xl">
            ChainsXes’s World
          </h1>
          <p className="mx-auto mt-8 max-w-3xl text-lg leading-8 text-stone-700 sm:text-xl sm:leading-9">
            在山川的轮廓里观察世界，在市场的波动里理解风险，在音乐、AI 与 Web3
            之间持续重构自己。
          </p>
          <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-stone-500 sm:text-base">
            本科来自水利水电工程，硕士阶段转向金融。喜欢音乐、摄影、AI、Web3、数码产品，也喜欢与不同背景的人交流。
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
                {authBusy ? "发送中" : "管理员登录"}
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

      <main>
        <SectionShell id="about" eyebrow="01 / Personal Coordinates" title="About Me">
          <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="space-y-6 text-lg leading-9 text-stone-700">
              <p>
                我是崔曦文，本科就读于黑龙江大学水利水电工程专业，硕士阶段将在华东师范大学攻读金融硕士。
              </p>
              <p>
                我不是单一标签的人。工程训练让我习惯用结构化方式理解问题，金融市场让我开始理解风险、价值和周期，音乐与摄影让我保留表达和观察世界的方式。
              </p>
              <p>
                我是一个 ENFP，喜欢社交，喜欢和不同背景的人聊天，也喜欢从交流中吸收新的经验。我希望这个网站呈现的是完整的我，而不是一份被简历格式限制住的介绍。
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
          title="教育经历"
          className="bg-[linear-gradient(180deg,rgba(245,242,235,1),rgba(233,235,229,0.9),rgba(246,245,241,1))]"
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

        <SectionShell id="practice" eyebrow="03 / Practice As Method" title="竞赛 / 实践经历">
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
          title="随笔"
          className="bg-[linear-gradient(180deg,rgba(246,245,241,1),rgba(232,232,226,0.8),rgba(245,242,235,1))]"
        >
          <div className="mb-8 max-w-3xl text-base leading-8 text-stone-600">
            这里不是正式文章合集，而是我的观察记录。可能是一段市场复盘，也可能是一张照片背后的情绪；可能是一次
            Web3 项目的研究，也可能是一次演出后的记录。
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
                      随笔标题
                    </label>
                    <input
                      id="essay-title"
                      value={essayTitle}
                      onChange={(event) => setEssayTitle(event.target.value)}
                      className="mt-2 w-full rounded-lg border border-stone-200 bg-white/70 px-4 py-3 text-sm text-stone-900 outline-none transition placeholder:text-stone-400 focus:border-stone-500"
                      placeholder="写下一个标题"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-stone-800" htmlFor="essay-category">
                      分类
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
                      正文
                    </label>
                    <textarea
                      id="essay-body"
                      value={essayBody}
                      onChange={(event) => setEssayBody(event.target.value)}
                      rows={9}
                      className="mt-2 w-full resize-none rounded-lg border border-stone-200 bg-white/70 px-4 py-3 text-sm leading-7 text-stone-900 outline-none transition placeholder:text-stone-400 focus:border-stone-500"
                      placeholder="写一点真实的观察。"
                    />
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <label className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-stone-300 bg-white/50 px-4 py-5 text-sm text-stone-600 transition hover:border-stone-500 hover:text-stone-950">
                      <UploadMark />
                      上传图片
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
                      上传音频
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
                      {formBusy ? "发布中" : "发布到云端"}
                    </button>
                    <button
                      type="button"
                      onClick={clearDraft}
                      disabled={formBusy}
                      className="rounded-full border border-stone-300 bg-white/40 px-5 py-2.5 text-sm text-stone-600 transition hover:border-stone-600 hover:text-stone-950 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      清空草稿
                    </button>
                  </div>
                </div>
              </GlassCard>

              <GlassCard className="min-h-[640px]">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.24em] text-stone-400">Draft Preview</p>
                    <h3 className="mt-3 text-3xl font-semibold text-stone-950">
                      {essayTitle || "未命名随笔"}
                    </h3>
                    <span className="mt-4 inline-flex rounded-full border border-stone-300/80 px-3 py-1.5 text-xs text-stone-500">
                      {essayCategory}
                    </span>
                  </div>
                </div>

                <div className="mt-8 whitespace-pre-wrap text-base leading-8 text-stone-600">
                  {essayBody || "正文会在这里实时出现。"}
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
                            删除
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <EmptyFrame title="图片墙" body="上传图片后，会在这里生成随笔里的视觉片段。" />
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
                          移除
                        </button>
                      </div>
                      <audio controls src={essayAudio.url} className="w-full" />
                    </div>
                  ) : (
                    <EmptyFrame title="音频播放器" body="上传排练录音、现场片段或语音记录后，可在这里播放。" />
                  )}
                </div>
              </GlassCard>
            </div>
          ) : (
            <GlassCard>
              <p className="text-base leading-8 text-stone-600">
                访客模式下仅展示已发布内容。使用管理员邮箱登录后，可以发布随笔并上传图片或音频。
              </p>
            </GlassCard>
          )}

          <div className="mt-10">
            <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <h3 className="text-2xl font-semibold text-stone-950">云端随笔</h3>
              {isSupabaseConfigured ? (
                <button
                  type="button"
                  onClick={refreshContent}
                  disabled={contentBusy}
                  className="w-fit rounded-full border border-stone-300 bg-white/40 px-4 py-2 text-xs text-stone-600 transition hover:border-stone-600 hover:text-stone-950 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {contentBusy ? "同步中" : "刷新内容"}
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
              <EmptyFrame title="还没有云端随笔" body="发布第一篇随笔后，它会保存在 Supabase 并显示在这里。" />
            )}
          </div>
        </SectionShell>

        <SectionShell id="interests" eyebrow="05 / Personal Frequencies" title="兴趣爱好">
          <div className="grid gap-6">
            <GlassCard>
              <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
                <div>
                  <p className="text-xs uppercase tracking-[0.24em] text-stone-400">Music</p>
                  <h3 className="mt-3 text-3xl font-semibold text-stone-950">音乐</h3>
                  <div className="mt-6 space-y-5 text-base leading-8 text-stone-600">
                    <p>
                      音乐贯穿了我大学生活的重要阶段。从大二到大四，我担任沉默电台乐队鼓手，也作为黑龙江大学吉他协会核心成员参与多场文艺演出。
                    </p>
                    <p>
                      鼓手不是舞台最前方的位置，但它决定了节奏、推进和团队的稳定性。音乐对我而言，不只是兴趣，也是一种协作、表达和现场执行的训练。
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
                    {["《希图诺》", "《滦河》"].map((work) => (
                      <div
                        key={work}
                        className="rounded-lg border border-stone-200/80 bg-white/40 p-4"
                      >
                        <p className="text-sm text-stone-500">原创作品</p>
                        <p className="mt-2 text-xl font-medium text-stone-950">{work}</p>
                      </div>
                    ))}
                  </div>

                  <div className="rounded-lg border border-stone-200/80 bg-white/40 p-4">
                    <p className="mb-3 text-sm font-medium text-stone-800">音频占位播放器</p>
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
                黑龙江大学吉他协会核心成员，多次以吉协名义参与文创类演出；参与或策划约 5
                场文艺演出，均担任鼓手，也是核心策划人之一。
              </div>
            </GlassCard>

            <GlassCard>
              <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr]">
                <div>
                  <p className="text-xs uppercase tracking-[0.24em] text-stone-400">Photography</p>
                  <h3 className="mt-3 text-3xl font-semibold text-stone-950">摄影</h3>
                  <p className="mt-6 text-base leading-8 text-stone-600">
                    我更喜欢拍自然风光，而不是人。手机是我最常用的摄影工具。我喜欢用长焦捕捉细节，用全景记录空间，用构图寻找自然场景中的秩序。
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
                        aria-label="选择摄影作品分类"
                      >
                        {uploadPhotoCategories.map((category) => (
                          <option key={category} value={category}>
                            {category}
                          </option>
                        ))}
                      </select>
                      <label className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-stone-300 bg-white/50 px-5 py-3 text-sm text-stone-600 transition hover:border-stone-500 hover:text-stone-950">
                        <UploadMark />
                        {formBusy ? "上传中" : "上传摄影作品"}
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
                    <Notice>访客可以浏览照片墙；管理员登录后可上传和删除摄影作品。</Notice>
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
                            aria-label={`查看 ${photo.name}`}
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
                              {deletingPhotoId === photo.id ? "删除中" : "删除"}
                            </button>
                          ) : null}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <EmptyFrame title="照片墙" body="上传作品后，可以按风光、城市、细节、全景和纪实筛选。" />
                  )}

                  <p className="text-xs leading-6 text-stone-500">
                    照片从 Supabase 云端读取；未配置环境变量时，这里会保持为空。
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
          aria-label="摄影作品预览"
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
              关闭
            </button>
          </div>
        </div>
      ) : null}

      <footer className="relative px-5 py-12 text-center text-sm text-stone-500 sm:px-8 lg:px-16">
        <p>ChainsXes’s World · 崔曦文</p>
      </footer>
    </div>
  );
}
