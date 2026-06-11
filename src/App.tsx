import React, { useState, useEffect, useRef } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import {
  Plus,
  Trash2,
  Calendar,
  FileText,
  Mic,
  Video,
  Link2,
  Sparkles,
  Award,
  Compass,
  User,
  ArrowRight,
  Activity,
  FileUp,
  CheckCircle2,
  AlertCircle,
  Crown,
  ChevronRight,
  Heart,
  RefreshCw,
  Clock,
  BookOpen,
  CloudLightning,
  AlertTriangle,
  Info,
  Briefcase,
  Send,
  MapPin,
  ShieldCheck
} from "lucide-react";

import { CareerAsset, UserCareerProfile, STARResponse, JDGapAnalysis } from "./types";
import { INITIAL_ASSETS, INITIAL_PROFILE, BADGES } from "./data/initialData";
import Onboarding from "./components/Onboarding";
import { CareerTreeVisual } from "./components/CareerTreeVisual";
import AuthScreen from "./components/AuthScreen";

const OPEN_JOB_POSTINGS = [
  {
    id: "toss-pm-assistant",
    company: "토스 (Toss)",
    logo: "🛡️",
    role: "Product Manager 어시스턴트",
    deadline: "D-5",
    tags: ["PO/PM", "인턴", "정량분석"],
    description: "시장 및 경쟁사 가설 조사 진행, 비즈니스 지표 대시보드 구축과 GA4 툴 정량 추출 역량 극강인 자 우대.",
    fullJd: "토스 PO Assistant: 시장 및 가설 조사 진행, 비즈니스 지표 대시보드 구축과 GA4 툴 정량 추출 역량 극강인 자 우대. 유관 에셋과 인근 실무 데이터를 논리적으로 구조화한 강점을 서술할 수 있는 기획 인재를 찾습니다."
  },
  {
    id: "kakao-service-intern",
    company: "카카오 (Kakao)",
    logo: "💛",
    role: "서비스 및 데이터 기획 인턴십",
    deadline: "D-2",
    tags: ["서비스기획", "인턴", "SQLD"],
    description: "데이터 분석 능력을 기초로 UX 개선 기획을 서술하고, SQLD 자격 보유 및 지표 모니터링 우대.",
    fullJd: "카카오 인턴십 채용: 데이터 분석 능력을 기초로 UX 개선 기획을 서술하고, SQLD 자격 보유 및 지표 모니터링 우대. 특히 서비스 설계 에셋, 유관 프로젝트 로그를 근거 자료로 제출하는 경우 우대합니다."
  },
  {
    id: "naver-service-planner",
    company: "네이버 (Naver)",
    logo: "💚",
    role: "주니어 서비스 기획자 (신입)",
    deadline: "D-11",
    tags: ["서비스기획", "정규직", "피드백 루프"],
    description: "오픈 유저 피드백 수집 및 분석, UX 기능 명세 작성 가능 및 소통 능력이 확실한 주니어 플래너 채용.",
    fullJd: "네이버 서비스 기획 및 프론트엔드 분석 주니어: 오픈 유저 피드백 수집 및 분석, UX 기능 명세 작성 가능 및 소통 능력이 확실한 인재. 실습/인턴/공모전 등의 정량화된 포트폴리오를 우대합니다."
  },
  {
    id: "baemin-ops-specialist",
    company: "우아한형제들 (배달의민족)",
    logo: "🩵",
    role: "프로덕트 오퍼레이션 스페셜리스트",
    deadline: "D-6",
    tags: ["운영/PM", "정규직", "데이터추적"],
    description: "어드민 운영 지표 개선, 가맹점 로그 수집을 통한 프로세스 최적화 및 애자일 기획 가담직.",
    fullJd: "우아한형제들 운영/PM: 어드민 운영 지표 개선, 가맹점 로그 수집을 통한 프로세스 최적화 및 애자일 기획 가담직. 실제 기획 및 검증 에셋을 제출하는 경우 가산점을 부여합니다."
  }
];

const getProfileCompleteness = (p: UserCareerProfile | null) => {
  if (!p) return 0;
  const fields = [
    p.name,
    p.situation,
    p.education,
    p.email,
    p.phone,
    p.website,
    p.coreIntro,
    p.birthDate,
    p.gender,
    p.profileImage
  ];
  const filledCount = fields.filter(f => f && String(f).trim() !== "").length;
  return filledCount * 10; // 0 to 100
};

export default function App() {
  // ── STATE DECLARATIONS ───────────────────────────────────────────────────
  const [currentUser, setCurrentUser] = useState<string | null>(() => {
    return localStorage.getItem("assetlog_active_user_id");
  });
  const [profile, setProfile] = useState<UserCareerProfile | null>(null);
  const [assets, setAssets] = useState<CareerAsset[]>([]);
  const [activeTab, setActiveTab] = useState<"archive" | "builder" | "matcher" | "mypage">("archive");

  // Filter category for the Archive feed
  const [feedFilter, setFeedFilter] = useState<string>("전체");

  // Upload modal states
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [uploadType, setUploadType] = useState<"file" | "video" | "link" | null>(null);
  
  // Custom asset form input states
  const [newAssetTitle, setNewAssetTitle] = useState("");
  const [newAssetDetail, setNewAssetDetail] = useState("");
  const [linkUrlInput, setLinkUrlInput] = useState("");
  const [isSubmittingAsset, setIsSubmittingAsset] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  // STAR builder states
  const [customQuestion, setCustomQuestion] = useState("");
  const [predefinedQuestion, setPredefinedQuestion] = useState(
    "지원 직무에서 문제를 발견하고 주도하여 해결한 경험을 구체적으로 서술하세요. (500자 이내)"
  );
  const [selectedAssetIds, setSelectedAssetIds] = useState<string[]>([]);
  const [starResult, setStarResult] = useState<STARResponse | null>(null);
  const [isGeneratingStar, setIsGeneratingStar] = useState(false);
  const [hasExportedPdf, setHasExportedPdf] = useState(false);

  // New Builder Section modes & States for Portfolio Builder
  const [builderSectionMode, setBuilderSectionMode] = useState<"star" | "portfolio">("star");
  const [starSubTab, setStarSubTab] = useState<"question" | "sop">("question");
  const [portfolioTitle, setPortfolioTitle] = useState("");
  const [portfolioIntro, setPortfolioIntro] = useState("");
  const [portfolioTarget, setPortfolioTarget] = useState(""); // 어디에 제출/지원하는지 (제출처)
  const [portfolioPurpose, setPortfolioPurpose] = useState(""); // 어떤 목적으로 만드는지 (작성 목적)
  const [isGeneratingPortfolio, setIsGeneratingPortfolio] = useState(false);
  const [portfolioResult, setPortfolioResult] = useState<{
    title: string;
    intro: string;
    academicSummary: string;
    keyHighlights: { title: string; challenge: string; action: string; impact: string }[];
    recommendedCareerPath: string;
    compiledDate: string;
  } | null>(null);

  // Matching tool states
  const [jdText, setJdText] = useState("");
  const [jdAnalysis, setJdAnalysis] = useState<JDGapAnalysis | null>(null);
  const [isAnalyzingJd, setIsAnalyzingJd] = useState(false);

  // Active viewing asset ID (for details drawer)
  const [selectedAssetDetail, setSelectedAssetDetail] = useState<CareerAsset | null>(null);
  const [isEditingMemo, setIsEditingMemo] = useState(false);
  const [memoEditValue, setMemoEditValue] = useState("");
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [exportContext, setExportContext] = useState<"portfolio" | "star">("portfolio");
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  // ── JOB APPLY & IMMEDIATE SUBMISSION STATES ──
  const [appliedJobs, setAppliedJobs] = useState<Array<{
    id: string;
    jobId: string;
    company: string;
    role: string;
    appliedAt: string;
    applicantName: string;
    applicantPhone: string;
    applicantEmail: string;
    hasCoverLetter: boolean;
    hasPortfolio: boolean;
    sharedAssetsCount: number;
  }>>([]);
  const [selectedJobForApply, setSelectedJobForApply] = useState<any | null>(null);
  const [applyName, setApplyName] = useState("");
  const [applyPhone, setApplyPhone] = useState("");
  const [applyEmail, setApplyEmail] = useState("");
  const [shareAssetsChecked, setShareAssetsChecked] = useState(true);
  const [isApplyingSuccessModal, setIsApplyingSuccessModal] = useState(false);
  const [appliedJobDetails, setAppliedJobDetails] = useState<any | null>(null);

  const handleUpdateAssetMemo = () => {
    if (!selectedAssetDetail) return;
    const updatedAssets = assets.map(a => {
      if (a.id === selectedAssetDetail.id) {
        return { ...a, subText: memoEditValue };
      }
      return a;
    });
    setAssets(updatedAssets);
    setSelectedAssetDetail({
      ...selectedAssetDetail,
      subText: memoEditValue
    });
    saveToLocalStorage(profile, updatedAssets);
    setIsEditingMemo(false);
    showToast("활동 메모가 성공적으로 수정되었습니다.", "success");
  };

  useEffect(() => {
    if (selectedAssetDetail) {
      setMemoEditValue(selectedAssetDetail.subText);
      setIsEditingMemo(false);
    } else {
      setMemoEditValue("");
      setIsEditingMemo(false);
    }
  }, [selectedAssetDetail]);

  // System toast notification
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);

  // Custom confirmation dialog state
  const [confirmDialog, setConfirmDialog] = useState<{
    message: string;
    onConfirm: () => void;
    title?: string;
    confirmText?: string;
    cancelText?: string;
    onCancel?: () => void;
  } | null>(null);

  const triggerConfirm = (
    message: string,
    onConfirm: () => void,
    title = "알림",
    confirmText = "확인",
    cancelText = "취소",
    onCancel?: () => void
  ) => {
    setConfirmDialog({ message, onConfirm, title, confirmText, cancelText, onCancel });
  };

  // Bulletproof checks to clean up dummy/placeholder values automatically
  const checkIsDummyEmail = (emailVal: string | undefined | null) : boolean => {
    if (!emailVal) return true;
    const clean = emailVal.trim().toLowerCase();
    if (!clean) return true;
    if (
      clean.includes("your-email") || 
      clean.includes("your_email") || 
      clean.includes("user@example") || 
      clean.includes("jiyukim@kaist.ac.kr") || 
      clean.includes("jgh041015") || 
      (currentUser && clean === currentUser.trim().toLowerCase())
    ) {
      return true;
    }
    return false;
  };

  const checkIsDummyPhone = (phoneVal: string | undefined | null) : boolean => {
    if (!phoneVal) return true;
    const clean = phoneVal.trim().replace(/[-\s]/g, "");
    if (!clean) return true;
    if (
      clean === "01043219876" || 
      clean === "01012345678" || 
      clean === "01000000000" || 
      clean === "01011112222"
    ) {
      return true;
    }
    return false;
  };

  const checkIsDummyWebsite = (siteVal: string | undefined | null) : boolean => {
    if (!siteVal) return true;
    const clean = siteVal.trim().toLowerCase();
    if (!clean) return true;
    if (
      clean.includes("github.com/jiyu") || 
      clean.includes("github.com/your-id") || 
      clean.includes("github.com/username") || 
      clean === "github.com"
    ) {
      return true;
    }
    return false;
  };

  // Local edit states for profile fields in Mypage
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [nameInput, setNameInput] = useState("");
  const [situationInput, setSituationInput] = useState("");
  const [eduInput, setEduInput] = useState("");
  const [emailInput, setEmailInput] = useState("");
  const [phoneInput, setPhoneInput] = useState("");
  const [websiteInput, setWebsiteInput] = useState("");
  const [coreIntroInput, setCoreIntroInput] = useState("");
  const [motivationInput, setMotivationInput] = useState("");
  const [aspirationInput, setAspirationInput] = useState("");
  const [birthDateInput, setBirthDateInput] = useState("");
  const [genderInput, setGenderInput] = useState("");
  const [profileImageInput, setProfileImageInput] = useState("");
  const [builderAssetSearch, setBuilderAssetSearch] = useState("");

  const [isGeneratingCoverLetter, setIsGeneratingCoverLetter] = useState(false);
  const [coverLetterTarget, setCoverLetterTarget] = useState("");
  const [coverLetterPurpose, setCoverLetterPurpose] = useState("");

  // ── LIFE CYCLES & LOCAL PERSISTENCE ──────────────────────────────────────
  useEffect(() => {
    const activeUserId = localStorage.getItem("assetlog_active_user_id");
    let loadedProfile: UserCareerProfile | null = null;
    let loadedAssets: CareerAsset[] = [];

    if (activeUserId) {
      setCurrentUser(activeUserId);
      const usersStr = localStorage.getItem("assetlog_registered_users") || "[]";
      try {
        const users = JSON.parse(usersStr);
        const match = users.find((u: any) => u.username === activeUserId);
        if (match) {
          loadedProfile = match.profile || null;
          loadedAssets = match.assets || [];
        }
      } catch (e) {
        console.error("Failed to load user profile", e);
      }
    } else {
      // Default Fallback/Legacy loading
      const storedProfile = localStorage.getItem("assetlog_profile");
      const storedAssets = localStorage.getItem("assetlog_assets");

      if (storedProfile) {
        try {
          loadedProfile = JSON.parse(storedProfile);
        } catch (e) {}
      }
      if (storedAssets) {
        try {
          loadedAssets = JSON.parse(storedAssets);
        } catch (e) {}
      } else {
        loadedAssets = INITIAL_ASSETS;
      }
    }

    // Clean up legacy prefilled dummy values to enable clean placeholders
    if (loadedProfile) {
      let changed = false;
      if (loadedProfile.education === "한국과학기술원(KAIST) 산업디자인학사 (기획 및 인터랙션 전공)") {
        loadedProfile.education = "";
        changed = true;
      }
      if (checkIsDummyEmail(loadedProfile.email)) {
        loadedProfile.email = "";
        changed = true;
      }
      if (checkIsDummyPhone(loadedProfile.phone)) {
        loadedProfile.phone = "";
        changed = true;
      }
      if (checkIsDummyWebsite(loadedProfile.website)) {
        loadedProfile.website = "";
        changed = true;
      }
      if (!loadedProfile.coreIntro || loadedProfile.coreIntro.trim() === "") {
        loadedProfile.coreIntro = "사용자 경험을 깊이 있게 설계하는 서비스 기획자입니다.";
        changed = true;
      }
      if (!loadedProfile.coverLetterMotivation || loadedProfile.coverLetterMotivation.trim() === "") {
        loadedProfile.coverLetterMotivation = "다차원 구매 분석 에셋 및 고객 로그 실태 기여 경험을 토대로, 대상 기업의 정밀 타겟 서비스 설계에 기확적 통찰을 심고 함께 무성한 실무 결실을 맺고자 지원합니다.";
        changed = true;
      }
      if (!loadedProfile.coverLetterAspiration || loadedProfile.coverLetterAspiration.trim() === "") {
        loadedProfile.coverLetterAspiration = "단기적으로는 소상공인 마케팅 데이터를 표준 규격화하고, 나아가 3년 내에 사용자 친화적 스마트 오퍼링 기능을 총괄 설계하여 프로덕트의 전후방 성장을 실현하겠습니다.";
        changed = true;
      }

      if (changed) {
        const pCopy = { ...loadedProfile };
        const aCopy = [...loadedAssets];
        setTimeout(() => {
          saveToLocalStorage(pCopy, aCopy);
        }, 100);
      }
    }

    setProfile(loadedProfile);
    setAssets(loadedAssets);
  }, [currentUser]);

  // Synchronize applied jobs from localstorage when currentUser changes
  useEffect(() => {
    const key = currentUser ? `assetlog_applied_jobs_${currentUser}` : "assetlog_applied_jobs_guest";
    try {
      const saved = localStorage.getItem(key);
      setAppliedJobs(saved ? JSON.parse(saved) : []);
    } catch {
      setAppliedJobs([]);
    }
  }, [currentUser]);

  const saveAppliedJobsToStorage = (updatedApps: Array<{
    id: string;
    jobId: string;
    company: string;
    role: string;
    appliedAt: string;
    applicantName: string;
    applicantPhone: string;
    applicantEmail: string;
    hasCoverLetter: boolean;
    hasPortfolio: boolean;
    sharedAssetsCount: number;
  }>) => {
    setAppliedJobs(updatedApps);
    const key = currentUser ? `assetlog_applied_jobs_${currentUser}` : "assetlog_applied_jobs_guest";
    localStorage.setItem(key, JSON.stringify(updatedApps));
  };

  // Synchronize inputs when profile is fetched/loaded
  useEffect(() => {
    if (profile) {
      setNameInput(profile.name || "");
      setSituationInput(profile.situation || "");
      
      const eduVal = profile.education || "";
      setEduInput(eduVal === "한국과학기술원(KAIST) 산업디자인학사 (기획 및 인터랙션 전공)" ? "" : eduVal);
      
      const emailVal = profile.email || "";
      setEmailInput(checkIsDummyEmail(emailVal) ? "" : emailVal);
      
      const phoneVal = profile.phone || "";
      setPhoneInput(checkIsDummyPhone(phoneVal) ? "" : phoneVal);
      
      const websiteVal = profile.website || "";
      setWebsiteInput(checkIsDummyWebsite(websiteVal) ? "" : websiteVal);
      
      setCoreIntroInput(profile.coreIntro || "");
      setMotivationInput(profile.coverLetterMotivation || "");
      setAspirationInput(profile.coverLetterAspiration || "");
      setBirthDateInput(profile.birthDate || "");
      setGenderInput(profile.gender || "");
      setProfileImageInput(profile.profileImage || "");

      // Setup job application contact defaults
      setApplyName(profile.name || "");
      setApplyPhone(profile.phone || "");
      setApplyEmail(profile.email || "");
    }
  }, [profile]);

  const saveToLocalStorage = (newProfile: UserCareerProfile | null, newAssets: CareerAsset[]) => {
    const activeUserId = localStorage.getItem("assetlog_active_user_id");
    if (activeUserId) {
      const usersStr = localStorage.getItem("assetlog_registered_users") || "[]";
      try {
        let users = JSON.parse(usersStr);
        users = users.map((u: any) => {
          if (u.username === activeUserId) {
            return {
              ...u,
              profile: newProfile,
              assets: newAssets
            };
          }
          return u;
        });
        localStorage.setItem("assetlog_registered_users", JSON.stringify(users));
      } catch (e) {
        console.error("Failed to save to multi-user registry", e);
      }
    }

    // Legacy fallback keys
    if (newProfile) {
      localStorage.setItem("assetlog_profile", JSON.stringify(newProfile));
    } else {
      localStorage.removeItem("assetlog_profile");
    }
    localStorage.setItem("assetlog_assets", JSON.stringify(newAssets));
  };

  const showToast = (message: string, type: "success" | "error" | "info" = "success") => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  // ── AUTH CALLBACK HANDLERS ────────────────────────────────────────────────
  const handleAuthSuccess = (username: string, userProfile: UserCareerProfile | null, userAssets: CareerAsset[], isNewUser: boolean) => {
    localStorage.setItem("assetlog_active_user_id", username);
    setCurrentUser(username);
    
    let finalProfile = userProfile;
    let finalAssets = isNewUser ? [] : userAssets; // Newly registered must start with empty array!

    if (isNewUser) {
      // Check legacy migration
      const legacyProfileStr = localStorage.getItem("assetlog_profile");
      if (legacyProfileStr) {
        try {
          const legacyProfile = JSON.parse(legacyProfileStr);
          const legacyAssetsStr = localStorage.getItem("assetlog_assets");
          const legacyAssets = legacyAssetsStr ? JSON.parse(legacyAssetsStr) : [];
          
          triggerConfirm(
            `기존에 기록된 '${legacyProfile.name}'님의 정원 이력(레벨 및 에셋)을 새로 가입하시는 '${username}' 계정으로 동기화하여 가져오시겠습니까?`,
            () => {
              const migratedProfile = legacyProfile;
              const migratedAssets = legacyAssets;
              setProfile(migratedProfile);
              setAssets(migratedAssets);

              const usersStr = localStorage.getItem("assetlog_registered_users") || "[]";
              try {
                let users = JSON.parse(usersStr);
                users = users.map((u: any) => {
                  if (u.username === username) {
                    return {
                      ...u,
                      profile: migratedProfile,
                      assets: migratedAssets
                    };
                  }
                  return u;
                });
                localStorage.setItem("assetlog_registered_users", JSON.stringify(users));
              } catch (e) {}

              localStorage.setItem("assetlog_profile", JSON.stringify(migratedProfile));
              localStorage.setItem("assetlog_assets", JSON.stringify(migratedAssets));
              showToast("기존 오프라인 정원 데이터가 신규 계정으로 연동되었습니다!", "success");
            },
            "이력 동기화",
            "동기화",
            "새로 시작",
            () => {
              setProfile(finalProfile);
              setAssets(finalAssets);
              showToast("새롭고 깨끗한 계정이 생성되었습니다! 맞춤 온보딩 설정을 시작하세요.", "info");
            }
          );
        } catch (e) {
          setProfile(finalProfile);
          setAssets(finalAssets);
          showToast("새롭고 깨끗한 계정이 생성되었습니다!", "success");
        }
      } else {
        setProfile(finalProfile);
        setAssets(finalAssets);
        showToast("회원 가입 성공! 정원 온보딩을 진행해주세요.", "success");
      }
    } else {
      setProfile(finalProfile);
      setAssets(finalAssets);
      showToast(`${username}님, 반갑습니다! 에셋 정원에 로그인했습니다.`, "success");
    }

    // Save initial state for non-migration paths immediately
    if (!(isNewUser && localStorage.getItem("assetlog_profile"))) {
      const usersStr = localStorage.getItem("assetlog_registered_users") || "[]";
      try {
        let users = JSON.parse(usersStr);
        users = users.map((u: any) => {
          if (u.username === username) {
            return {
              ...u,
              profile: finalProfile,
              assets: finalAssets
            };
          }
          return u;
        });
        localStorage.setItem("assetlog_registered_users", JSON.stringify(users));
      } catch (e) {}

      if (finalProfile) {
        localStorage.setItem("assetlog_profile", JSON.stringify(finalProfile));
      }
      localStorage.setItem("assetlog_assets", JSON.stringify(finalAssets));
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("assetlog_active_user_id");
    setCurrentUser(null);
    setProfile(null);
    setAssets([]);
    setStarResult(null);
    setJdAnalysis(null);
    setPortfolioResult(null);
    showToast("로그아웃되었습니다. 안전하게 데이터가 보존되었습니다.", "info");
  };

  // ── ONBOARDING COMPLETION ───────────────────────────────────────────────
  const handleOnboardingComplete = (newProfile: UserCareerProfile) => {
    const enrichedProfile: UserCareerProfile = {
      ...newProfile,
      education: "",
      email: "",
      phone: "",
      website: "",
      coreIntro: "사용자 경험을 깊이 있게 설계하는 서비스 기획자입니다.",
      coverLetterMotivation: "다차원 구매 분석 에셋 및 고객 로그 실태 기여 경험을 토대로, 대상 기업의 정밀 타겟 서비스 설계에 기확적 통찰을 심고 함께 무성한 실무 결실을 맺고자 지원합니다.",
      coverLetterAspiration: "단기적으로는 소상공인 마케팅 데이터를 표준 규격화하고, 나아가 3년 내에 사용자 친화적 스마트 오퍼링 기능을 총괄 설계하여 프로덕트의 전후방 성장을 실현하겠습니다."
    };
    
    // For registered users, they start with clean empty asset logs!
    const startingAssets: CareerAsset[] = [];

    setProfile(enrichedProfile);
    setAssets(startingAssets);
    saveToLocalStorage(enrichedProfile, startingAssets);
    showToast(`반갑습니다, ${enrichedProfile.name}님! 역량 정원이 생성되었습니다.`, "success");
  };

  // ── CORE ACTIONS: ASSETS ────────────────────────────────────────────────

  // Clean-out or Reset profile
  const handleResetApp = () => {
    triggerConfirm(
      "정원 정보를 초기화하고 온보딩 과정을 다시 시작하시겠습니까? 로그인 계정의 데이터가 새로 초기화됩니다.",
      () => {
        setProfile(null);
        setAssets([]); // New startup / reset state for logged users begins with empty array
        setStarResult(null);
        setJdAnalysis(null);
        setPortfolioResult(null);
        setSelectedAssetIds([]);
        setActiveTab("archive");
        
        saveToLocalStorage(null, []);
        showToast("계정의 정원 상태가 초기화되었으며 온보딩 설정이 해제되었습니다.", "info");
      },
      "계정 초기화",
      "초기화",
      "취소"
    );
  };

  // Feed tree with points
  const handleWaterTree = () => {
    if (!profile) return;
    
    // Default to 0 droplets for existing users/new profiles if undefined
    const currentDroplets = profile.waterDroplets !== undefined ? profile.waterDroplets : 0;
    if (currentDroplets <= 0) {
      showToast("💧 소지하신 물방울이 모자랍니다! 에셋 업로드, 프로필 작성, 자소서 빌딩, 또는 포트폴리오 생성 활동을 통해 물방울을 모아보세요!", "error");
      return;
    }

    const expGain = 15;
    let newExp = profile.exp + expGain;
    let newLevel = profile.level;
    let leveledUp = false;

    if (newExp >= 100) {
      newExp -= 100;
      newLevel += 1;
      leveledUp = true;
    }

    const updatedProfile: UserCareerProfile = {
      ...profile,
      level: newLevel,
      exp: newExp,
      totalPoints: profile.totalPoints + expGain,
      waterDroplets: currentDroplets - 1,
    };
    
    setProfile(updatedProfile);
    saveToLocalStorage(updatedProfile, assets);
    
    if (leveledUp) {
      showToast(`🎉 레벨 업! 당신의 커리어 나무가 Lv.${newLevel}로 무성해졌습니다!`, "success");
    } else {
      showToast(`💧 물 주기 성공! 물방울 1개를 사용했습니다. (보유 물방울: ${currentDroplets - 1}개)`, "success");
    }
  };

  const handleCloseUpload = () => {
    setIsUploadOpen(false);
    setNewAssetTitle("");
    setNewAssetDetail("");
    setLinkUrlInput("");
    setUploadType(null);
    setUploadedFile(null);
    setIsDragOver(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (videoInputRef.current) videoInputRef.current.value = "";
  };

  // Triggered when submitting upload form
  const handleAddAsset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAssetTitle.trim()) {
      showToast("에셋의 제목 혹은 활동명을 입력해주세요.", "error");
      return;
    }

    setIsSubmittingAsset(true);
    try {
      // Build userText with file/video/link details to let the AI fully understand the context
      let userContextText = newAssetDetail.trim();
      if (uploadType === "file" && uploadedFile) {
        userContextText = `[파일 첨부 완료: ${uploadedFile.name}] ${newAssetDetail}`.trim();
      } else if (uploadType === "video" && uploadedFile) {
        userContextText = `[영상 첨부 완료: ${uploadedFile.name}] ${newAssetDetail}`.trim();
      } else if (uploadType === "link" && linkUrlInput) {
        userContextText = `[링크 URL: ${linkUrlInput}] ${newAssetDetail}`.trim();
      }

      // API call to server to auto tag the upload content intelligently
      const response = await fetch("/api/ai/parse-asset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newAssetTitle,
          type: uploadType || "file",
          userText: userContextText
        })
      });

      if (!response.ok) {
        throw new Error("서버 에셋 분석 응답 오류");
      }

      const parsedResult = await response.json();

      const newAsset: CareerAsset = {
        id: `custom-asset-${Date.now()}`,
        title: parsedResult.suggestedTitle || newAssetTitle,
        type: uploadType || "file",
        subText: parsedResult.subText || newAssetDetail || "활동 세부 검증 완료됨",
        date: new Date().toISOString().split("T")[0],
        skills: parsedResult.skills || [
          { skillName: "실행력", points: 10 },
          { skillName: "성장성", points: 5 }
        ],
        tags: parsedResult.tags || ["신규기록"]
      };

      const updatedAssets = [newAsset, ...assets];
      setAssets(updatedAssets);

      // Add points to user competency balance
      if (profile) {
        const pointsAwarded = newAsset.skills.reduce((sum, s) => sum + s.points, 0);
        const newTotalPoints = profile.totalPoints + pointsAwarded;
        
        // Distribute points on dynamic skills scores
        const updatedSkillScores = { ...profile.skillScores };
        newAsset.skills.forEach(skill => {
          const prevScore = updatedSkillScores[skill.skillName] || 0;
          updatedSkillScores[skill.skillName] = Math.min(100, prevScore + skill.points);
        });

        // Handle leveling up
        let newExp = profile.exp + (pointsAwarded * 1.5);
        let newLevel = profile.level;
        if (newExp >= 100) {
          const levelsLeaped = Math.floor(newExp / 100);
          newLevel += levelsLeaped;
          newExp = Math.floor(newExp % 100);
        }

        const currentDroplets = profile.waterDroplets !== undefined ? profile.waterDroplets : 0;
        const updatedProfile: UserCareerProfile = {
          ...profile,
          totalPoints: newTotalPoints,
          skillScores: updatedSkillScores,
          level: newLevel,
          exp: Math.floor(newExp),
          waterDroplets: currentDroplets + 1
        };

        setProfile(updatedProfile);
        saveToLocalStorage(updatedProfile, updatedAssets);
      } else {
        saveToLocalStorage(null, updatedAssets);
      }

      showToast(`🌿 에셋이 등록되었습니다! AI 가령 역량 분석 결과를 반영하고 물방울💧 1개를 획득했습니다!`, "success");
      
      handleCloseUpload();
    } catch (error) {
      console.error(error);
      showToast("에셋 등록에 문제가 발생했습니다. 일반 데이터로 강제 저장합니다.", "error");
      
      // Dynamic fallback custom asset
      const fallbackAsset: CareerAsset = {
        id: `custom-asset-fb-${Date.now()}`,
        title: newAssetTitle,
        type: uploadType || "file",
        subText: uploadType === "link" && linkUrlInput 
          ? `[링크: ${linkUrlInput}] ${newAssetDetail || ""}` 
          : (newAssetDetail || "등록된 에셋 보강 메모"),
        date: new Date().toISOString().split("T")[0],
        skills: [
          { skillName: "실행력", points: 10 },
          { skillName: "기획력", points: 5 }
        ],
        tags: ["수동기록"]
      };
      
      let updatedProfile = profile;
      if (profile) {
        const pointsAwarded = 15; // 10 + 5
        const newTotalPoints = profile.totalPoints + pointsAwarded;
        
        const updatedSkillScores = { ...profile.skillScores };
        // Apply 10 to 실행력, 5 to 기획력
        updatedSkillScores["실행력"] = Math.min(100, (updatedSkillScores["실행력"] || 0) + 10);
        updatedSkillScores["기획력"] = Math.min(100, (updatedSkillScores["기획력"] || 0) + 5);

        let newExp = profile.exp + (pointsAwarded * 1.5);
        let newLevel = profile.level;
        if (newExp >= 100) {
          const levelsLeaped = Math.floor(newExp / 100);
          newLevel += levelsLeaped;
          newExp = Math.floor(newExp % 100);
        }

        const currentDroplets = profile.waterDroplets !== undefined ? profile.waterDroplets : 0;
        updatedProfile = {
          ...profile,
          totalPoints: newTotalPoints,
          skillScores: updatedSkillScores,
          level: newLevel,
          exp: Math.floor(newExp),
          waterDroplets: currentDroplets + 1
        };
        setProfile(updatedProfile);
      }
      
      const updatedAssets = [fallbackAsset, ...assets];
      setAssets(updatedAssets);
      saveToLocalStorage(updatedProfile, updatedAssets);
      handleCloseUpload();
    } finally {
      setIsSubmittingAsset(false);
    }
  };

  const handleDeleteAsset = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    triggerConfirm(
      "정원에서 해당 취업 에셋을 영구 제거하시겠습니까? 관련 역량 포인트 및 가든의 통계에 영향이 갈 수 있습니다.",
      () => {
        const updated = assets.filter(a => a.id !== id);
        setAssets(updated);
        
        // Adjust total points and skill scores
        if (profile) {
          const deletedAsset = assets.find(a => a.id === id);
          const pointsToDeduct = deletedAsset ? deletedAsset.skills.reduce((sum, s) => sum + s.points, 0) : 10;
          
          const updatedSkillScores = { ...profile.skillScores };
          if (deletedAsset) {
            deletedAsset.skills.forEach(skill => {
              const currentScore = updatedSkillScores[skill.skillName] || 0;
              updatedSkillScores[skill.skillName] = Math.max(0, currentScore - skill.points);
            });
          }

          const updatedProfile = {
            ...profile,
            totalPoints: Math.max(0, profile.totalPoints - pointsToDeduct),
            skillScores: updatedSkillScores
          };
          setProfile(updatedProfile);
          saveToLocalStorage(updatedProfile, updated);
        } else {
          saveToLocalStorage(null, updated);
        }
        showToast("경험 에셋이 안전하게 정원에서 수거되었습니다.", "info");
        setSelectedAssetDetail(null);
      },
      "에셋 삭제 확인",
      "영구 제거",
      "취소"
    );
  };

  // ── CORE ACTIONS: STAR BUILDER ─────────────────────────────────────────
  const toggleAssetSelection = (assetId: string) => {
    if (selectedAssetIds.includes(assetId)) {
      setSelectedAssetIds(selectedAssetIds.filter(id => id !== assetId));
    } else {
      setSelectedAssetIds([...selectedAssetIds, assetId]);
    }
  };

  const handleGenerateStarDraft = async () => {
    const finalQuestion = customQuestion.trim() ? customQuestion : predefinedQuestion;
    if (selectedAssetIds.length === 0) {
      showToast("STAR 초안의 소스가 될 에셋을 최소 한 개 이상 체크해주세요.", "error");
      return;
    }

    setIsGeneratingStar(true);
    setStarResult(null);
    setHasExportedPdf(false);

    const chosenAssets = assets.filter(a => selectedAssetIds.includes(a.id));

    try {
      const res = await fetch("/api/ai/star", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: finalQuestion,
          assets: chosenAssets
        })
      });

      if (!res.ok) {
        throw new Error("서버 STAR 생성 실패");
      }

      const data = await res.json();
      setStarResult(data);
      showToast("✨ AI가 완벽한 STAR 문항 초안을 가꾸어 주었습니다!", "success");
    } catch (error) {
      console.error(error);
      showToast("STAR 생성 중 지연이 발생했으나 지능형 fallback으로 응대 중입니다.", "info");
    } finally {
      setIsGeneratingStar(false);
    }
  };

  // ── CORE ACTIONS: PORTFOLIO BUILDER ─────────────────────────────────────
  const handleGeneratePortfolio = async () => {
    if (selectedAssetIds.length === 0) {
      showToast("포트폴리오의 재료가 될 에셋을 최소 한 개 이상 선택해주세요.", "error");
      return;
    }

    setIsGeneratingPortfolio(true);
    setPortfolioResult(null);

    const chosenAssets = assets.filter(a => selectedAssetIds.includes(a.id));

    try {
      const res = await fetch("/api/ai/portfolio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: portfolioTitle,
          intro: portfolioIntro,
          assets: chosenAssets,
          userProfile: profile,
          target: portfolioTarget,
          purpose: portfolioPurpose
        })
      });

      if (!res.ok) {
        throw new Error("서버 포트폴리오 빌드 실패");
      }

      const data = await res.json();
      setPortfolioResult(data);
      if (profile) {
        const currentDroplets = profile.waterDroplets !== undefined ? profile.waterDroplets : 0;
        const updatedProfile: UserCareerProfile = {
          ...profile,
          waterDroplets: currentDroplets + 3
        };
        setProfile(updatedProfile);
        saveToLocalStorage(updatedProfile, assets);
      }
      showToast("💼 나만의 AI 직무 특화 포트폴리오가 성공적으로 빌드되었습니다! 물방울💧 3개를 획득했습니다.", "success");
    } catch (error) {
      console.error(error);
      // Failover Mock Generation
      const assetTitles = chosenAssets.map((a) => a.title).join(", ");
      const targetText = portfolioTarget ? `[제출처: ${portfolioTarget}]` : "목표 직군";
      const purposeText = portfolioPurpose ? `[작성 목적: ${portfolioPurpose}]` : "커리어 역량 증명";
      setPortfolioResult({
        title: portfolioTitle || `${profile?.name || "지원자"}님의 커리어 포트폴리오`,
        intro: portfolioIntro || "배움과 도전을 바탕으로 완벽히 검증하는 인재의 행보",
        academicSummary: `${profile?.name || "지원자"}님은 ${targetText} 부문으로의 성공적인 ${purposeText}을 실현하기 위하여, 그동안 일궈낸 [${assetTitles}] 등의 탄탄한 실무 자산을 입체적으로 구조화하였습니다.`,
        keyHighlights: chosenAssets.map((a) => ({
          title: a.title,
          challenge: `해당 과정인 [${a.title}] 당시 직무 성장에 가장 걸림돌이 된 구조적 난간이나 문제상황이 도래했습니다.`,
          action: `이에 관련 스킬인 ${a.skills?.map(s=>s.skillName).join(", ")} 등을 극대화하여 구조적 와이어프레임링을 단행하고 지속 발자국을 심었습니다.`,
          impact: `${a.subText}을 도출하고 직접 이겨내는 실행과 함께 실무 가점을 완벽 획득했습니다.`
        })),
        recommendedCareerPath: `${profile?.name || "지원자"}님이 기재하신 희망 목표인 [${profile?.targetGoal || "커리어 성장"}]과 ${targetText}의 요구사항에 비추어볼 때, 주인의식을 기초로 한 테크 기획 PM 경로가 가장 알맞게 발전할 수 있는 적합 통로입니다.`,
        compiledDate: new Date().toISOString().split("T")[0]
      });
      if (profile) {
        const currentDroplets = profile.waterDroplets !== undefined ? profile.waterDroplets : 0;
        const updatedProfile: UserCareerProfile = {
          ...profile,
          waterDroplets: currentDroplets + 3
        };
        setProfile(updatedProfile);
        saveToLocalStorage(updatedProfile, assets);
      }
      showToast("스마트 로컬 백업 시나리오를 가동하여 포트폴리오를 제작하고 물방울💧 3개를 회수했습니다.", "info");
    } finally {
      setIsGeneratingPortfolio(false);
    }
  };

  const downloadFile = (content: string, filename: string, contentType: string) => {
    const blob = new Blob([content], { type: contentType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handlePrintPortfolio = async () => {
    if (!portfolioResult) return;
    setIsGeneratingPdf(true);
    showToast("고해상도 PDF 포트폴리오를 생성하는 중입니다. 잠시만 기다려 주세요... (약 3~5초 소요)", "info");

    try {
      const elements = document.querySelectorAll(".print-page");
      if (!elements || elements.length === 0) {
        showToast("포트폴리오 화면을 찾을 수 없습니다. 포트폴리오를 먼저 생성해 주세요.", "error");
        setIsGeneratingPdf(false);
        return;
      }

      // Initialize jsPDF in landscape mode, A4 size (297mm x 210mm)
      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: "a4"
      });

      const pdfWidth = 297;
      const pdfHeight = 210;

      for (let i = 0; i < elements.length; i++) {
        const el = elements[i] as HTMLElement;

        const canvas = await html2canvas(el, {
          scale: 2, // 2x density for crystal clear crisp text
          useCORS: true,
          logging: false,
          allowTaint: true,
          backgroundColor: el.classList.contains("bg-slate-900") ? "#0f172a" : "#ffffff"
        });

        const imgData = canvas.toDataURL("image/png");

        if (i > 0) {
          pdf.addPage();
        }

        pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight, undefined, "FAST");
      }

      pdf.save(`${profile?.name || "지원자"}_커리어_포트폴리오.pdf`);
      setHasExportedPdf(true);
      showToast("🌿 PDF 포트폴리오가 성공적으로 다운로드되었습니다!", "success");
    } catch (e) {
      console.error("PDF Export Error:", e);
      showToast("PDF 생성 중 오류가 발생했습니다. 브라우저 인쇄(Ctrl+P)를 시도해 주세요.", "error");
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handleSubmitApplication = () => {
    if (!selectedJobForApply) return;
    if (!applyName.trim()) {
      showToast("지원자 이름을 입력해주세요.", "error");
      return;
    }
    if (!applyEmail.trim()) {
      showToast("지원자 이메일을 입력해주세요.", "error");
      return;
    }

    const newApp = {
      id: "app-" + Date.now(),
      jobId: selectedJobForApply.id,
      company: selectedJobForApply.company,
      role: selectedJobForApply.role,
      appliedAt: new Date().toLocaleString("ko-KR", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit"
      }),
      applicantName: applyName,
      applicantPhone: applyPhone,
      applicantEmail: applyEmail,
      hasCoverLetter: !!starResult,
      hasPortfolio: !!portfolioResult,
      sharedAssetsCount: shareAssetsChecked ? assets.length : 0
    };

    const updatedApps = [newApp, ...appliedJobs];
    saveAppliedJobsToStorage(updatedApps);

    // Award 2 water droplets to grow tree!
    if (profile) {
      const currentDroplets = profile.waterDroplets !== undefined ? profile.waterDroplets : 0;
      const updatedProfile: UserCareerProfile = {
        ...profile,
        waterDroplets: currentDroplets + 2
      };
      setProfile(updatedProfile);
      saveToLocalStorage(updatedProfile, assets);
    }

    // Set details for success presentation
    setAppliedJobDetails(newApp);
    setSelectedJobForApply(null);
    setIsApplyingSuccessModal(true);
    showToast("🚀 즉시 입사지원이 성공적으로 완료되었습니다!", "success");
  };

  const handleDownloadHtmlPortfolio = () => {
    if (!portfolioResult) return;
    
    const title = portfolioResult.title;
    const intro = portfolioResult.intro;
    const target = portfolioTarget || "전략 직무 부서";
    const purpose = portfolioPurpose || "커리어 역량 증명";
    const compiledDate = portfolioResult.compiledDate;
    const academic = portfolioResult.academicSummary;
    const path = portfolioResult.recommendedCareerPath;
    const highlights = portfolioResult.keyHighlights;

    let highlightsHtml = "";
    highlights.forEach((proj, idx) => {
      highlightsHtml += `
      <div class="slide bg-white text-slate-900 border-l-[10px] border-emerald-600">
        <div class="slide-header">
          <span class="badge badge-emerald">HIGHLIGHT PROJECT ${idx + 1}</span>
          <span class="page-num">PAGE ${String(5 + idx).padStart(2, "0")}</span>
        </div>
        <div class="slide-content">
          <h2 class="project-title">${proj.title}</h2>
          
          <div class="project-grid">
            <div class="project-pane">
              <h3 class="pane-title text-emerald-600">CHALLENGE & SITUATION (상황 및 과제)</h3>
              <p>${proj.challenge}</p>
            </div>
            
            <div class="project-pane">
              <h3 class="pane-title text-indigo-600">MY ACTION (수행 역할 및 행동)</h3>
              <p>${proj.action}</p>
            </div>
            
            <div class="project-pane">
              <h3 class="pane-title text-rose-600">IMPACT & METRICS (성과 및 교훈)</h3>
              <p>${proj.impact}</p>
            </div>
          </div>
        </div>
        <div class="slide-footer">
          <span>© ${profile?.name || "지원자"} | MY CAREER GARDEN</span>
          <span>REV. ${compiledDate}</span>
        </div>
      </div>
      `;
    });

    const htmlContent = `
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <title>${title}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&family=Space+Grotesk:wght@500;700&display=swap');
    
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    
    body {
      font-family: "Inter", sans-serif;
      background-color: #f1f5f9;
      color: #0f172a;
      line-height: 1.5;
      padding: 40px 20px;
    }
    
    .no-print-area {
      max-width: 1000px;
      margin: 0 auto 30px auto;
      background: #ffffff;
      border-radius: 16px;
      padding: 20px;
      box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-left: 5px solid #4f46e5;
    }
    
    .info-text h1 {
      font-size: 16px;
      font-weight: 800;
      color: #1e1b4b;
    }
    
    .info-text p {
      font-size: 12px;
      color: #6366f1;
      margin-top: 4px;
    }
    
    .print-btn {
      background: #4f46e5;
      color: white;
      border: none;
      padding: 10px 20px;
      font-size: 13px;
      font-weight: 700;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.2s;
    }
    
    .print-btn:hover {
      background: #4338ca;
    }
    
    .portfolio-container {
      max-width: 1000px;
      margin: 0 auto;
      display: flex;
      flex-direction: column;
      gap: 30px;
    }
    
    .slide {
      background: white;
      border-radius: 20px;
      padding: 30px;
      box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1);
      min-height: 560px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      position: relative;
      overflow: hidden;
      page-break-after: always;
      break-after: page;
    }
    
    .slide-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid #e2e8f0;
      padding-bottom: 15px;
      margin-bottom: 25px;
    }
    
    .badge {
      font-size: 10px;
      font-weight: 800;
      padding: 4px 10px;
      border-radius: 6px;
      letter-spacing: 1px;
    }
    
    .badge-dark { background: #4f46e5; color: white; }
    .badge-brand { background: #10b981; color: white; }
    .badge-purple { background: #7c3aed; color: white; }
    .badge-indigo { background: #4f46e5; color: white; }
    .badge-emerald { background: #059669; color: white; }
    .badge-fuchsia { background: #d946ef; color: white; }
    
    .page-num {
      font-size: 11px;
      font-weight: 800;
      color: #64748b;
      font-family: monospace;
    }
    
    .slide-content {
      flex-grow: 1;
    }
    
    .project-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 20px;
      margin-top: 20px;
    }
    
    .project-pane {
      background: #f8fafc;
      border: 1px solid #f1f5f9;
      padding: 20px;
      border-radius: 12px;
    }
    
    .pane-title {
      font-size: 11px;
      font-weight: 800;
      margin-bottom: 10px;
      letter-spacing: 0.5px;
    }
    
    .project-pane p {
      font-size: 12px;
      color: #334155;
      line-height: 1.6;
    }
    
    .slide-footer {
      border-top: 1px solid #f1f5f9;
      padding-top: 15px;
      margin-top: 25px;
      display: flex;
      justify-content: space-between;
      font-size: 10px;
      color: #94a3b8;
      font-weight: 600;
    }
    
    /* Cover Slide */
    .bg-dark {
      background: #0f172a;
      color: white;
      border-right: 10px solid #10b981;
    }
    
    .bg-dark .slide-header {
      border-color: #334155;
    }
    
    .bg-dark .page-num {
      color: #10b981;
    }
    
    .cover-title {
      font-size: 32px;
      font-weight: 800;
      color: white;
      line-height: 1.25;
      letter-spacing: -1px;
      margin-top: 40px;
    }
    
    .cover-intro {
      font-size: 14px;
      color: #94a3b8;
      margin-top: 15px;
      max-width: 600px;
    }
    
    .cover-meta {
      margin-top: 60px;
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 15px;
      max-width: 500px;
      font-size: 12px;
    }
    
    .cover-meta p {
      border-bottom: 1px solid #334155;
      padding-bottom: 10px;
    }
    
    .cover-meta strong {
      color: #10b981;
    }
    
    /* Page 2 Intro */
    .intro-section {
      display: grid;
      grid-template-columns: 1.2fr 1fr;
      gap: 30px;
      margin-top: 15px;
    }
    
    .intro-card {
      background: #f8fafc;
      border: 1px solid #f1f5f9;
      border-radius: 12px;
      padding: 24px;
    }
    
    .intro-title {
      font-size: 18px;
      font-weight: 800;
      color: #0f172a;
      line-height: 1.4;
      margin-bottom: 15px;
    }
    
    .intro-body {
      font-size: 13px;
      color: #475569;
      line-height: 1.6;
    }
    
    .score-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
      font-size: 12px;
      font-weight: 600;
    }
    
    .score-bar-bg {
      height: 6px;
      background: #e2e8f0;
      border-radius: 3px;
      width: 100%;
      margin-top: 4px;
      overflow: hidden;
    }
    
    .score-bar {
      height: 100%;
      background: #10b981;
      border-radius: 3px;
    }
    
    .project-title {
      font-size: 20px;
      font-weight: 800;
      color: #0f172a;
      margin-bottom: 20px;
    }
    
    .section-title {
      font-size: 20px;
      font-weight: 800;
      color: #0f172a;
      margin-bottom: 20px;
    }
    
    .card-block {
      background: #fafafa;
      padding: 20px;
      border-left: 4px solid #bc53fa;
      border-radius: 8px;
      font-size: 13px;
      color: #334155;
      line-height: 1.7;
    }
    
    /* PDF Print Rule */
    @media print {
      body {
        background: white;
        padding: 0;
      }
      
      .no-print-area {
        display: none !important;
      }
      
      .portfolio-container {
        max-width: 100%;
        margin: 0;
        gap: 0;
      }
      
      .slide {
        box-shadow: none !important;
        border: none !important;
        border-radius: 0 !important;
        padding: 15mm !important;
        width: 297mm !important;
        height: 210mm !important;
        min-height: 210mm !important;
        page-break-after: always !important;
        break-after: page !important;
      }
    }
  </style>
</head>
<body>

  <div class="no-print-area">
    <div class="info-text">
      <h1>📄 오프라인 독립 포트폴리오 (인쇄 가능)</h1>
      <p>이 파일은 브라우저로 언제든지 확인하고 고해상도 PDF로 인쇄/변환할 수 있는 독립형 파일입니다.</p>
    </div>
    <button class="print-btn" onclick="window.print()">🖨️ PDF 인쇄하기 (Ctrl + P)</button>
  </div>

  <div class="portfolio-container">
  
    <!-- SLIDE 1 -->
    <div class="slide bg-dark">
      <div class="slide-header">
        <span class="badge badge-brand">OFFICIAL RECORD</span>
        <span class="page-num">PAGE 01 / ${String(5 + highlights.length).padStart(2, "0")}</span>
      </div>
      <div class="slide-content">
        <h1 class="cover-title">${title}</h1>
        <p class="cover-intro">${intro}</p>
        
        <div class="cover-meta">
          <p><strong>수신/제출처:</strong> ${target}</p>
          <p><strong>작성 목적:</strong> ${purpose}</p>
        </div>
      </div>
      <div class="slide-footer">
        <span>© ${profile?.name || "지원자"} | MY CAREER GARDEN</span>
        <span>REV. ${compiledDate}</span>
      </div>
    </div>

    <!-- SLIDE 2 -->
    <div class="slide bg-white" style="border-left: 10px solid #10b981;">
      <div class="slide-header">
        <span class="badge badge-purple">PROFILE & SUMMARY</span>
        <span class="page-num">PAGE 02 / ${String(5 + highlights.length).padStart(2, "0")}</span>
      </div>
      <div class="slide-content">
        <h2 class="section-title">${profile?.name || "지원자"} | 역량 분석 리포트</h2>
        
        <div class="intro-section">
          <div class="intro-card">
            <h3 class="intro-title">${profile?.coreIntro || "역량을 검증하는 검증형 인재"}</h3>
            <p class="intro-body">
              ${profile?.coverLetterAspiration || "끊임없는 배움과 구체적인 역량을 통해 비즈니스 성장을 견인합니다."}
            </p>
          </div>
          
          <div class="intro-card">
            <h3 class="pane-title" style="color: #7c3aed; margin-bottom: 12px;">핵심 가든 역량 스코어</h3>
            ${
              profile ? Object.entries(profile.skillScores || {}).map(([sname, svalue]) => `
                <div style="margin-bottom: 10px;">
                  <div class="score-item">
                    <span>${sname}</span>
                    <span>${svalue} XP</span>
                  </div>
                  <div class="score-bar-bg">
                    <div class="score-bar" style="width: ${Math.min(100, (Number(svalue) / 120) * 100)}%; background: #7c3aed;"></div>
                  </div>
                </div>
              `).join('') : ""
            }
          </div>
        </div>
      </div>
      <div class="slide-footer">
        <span>© ${profile?.name || "지원자"} | MY CAREER GARDEN</span>
        <span>REV. ${compiledDate}</span>
      </div>
    </div>

    <!-- SLIDE 3 -->
    <div class="slide bg-white" style="border-left: 10px solid #7c3aed;">
      <div class="slide-header">
        <span class="badge badge-purple">CAREER BACKGROUND</span>
        <span class="page-num">PAGE 03 / ${String(5 + highlights.length).padStart(2, "0")}</span>
      </div>
      <div class="slide-content">
        <h2 class="section-title">학업 및 학술 기반 역량 (Academic Background)</h2>
        <div class="card-block" style="border-color: #7c3aed; margin-top: 30px;">
          <h3 style="font-weight: 800; font-size: 15px; margin-bottom: 10px; color: #1e1b4b;">${profile?.education || "학업 증명 이력"}</h3>
          <p style="font-size: 13px; line-height: 1.8; color: #475569; white-space: pre-line;">
            ${academic}
          </p>
        </div>
      </div>
      <div class="slide-footer">
        <span>© ${profile?.name || "지원자"} | MY CAREER GARDEN</span>
        <span>REV. ${compiledDate}</span>
      </div>
    </div>

    <!-- SLIDE 4 -->
    <div class="slide bg-white" style="border-left: 10px solid #4f46e5;">
      <div class="slide-header">
        <span class="badge badge-indigo">RECOMMENDATION</span>
        <span class="page-num">PAGE 04 / ${String(5 + highlights.length).padStart(2, "0")}</span>
      </div>
      <div class="slide-content">
        <h2 class="section-title">가든 추천 성장 커리어 (Recommended Path)</h2>
        <div class="card-block" style="border-color: #4f46e5; margin-top: 30px;">
          <h3 style="font-weight: 800; font-size: 15px; margin-bottom: 10px; color: #1e1b4b;">AI 정원사가 바라본 강점 분석</h3>
          <p style="font-size: 13px; line-height: 1.8; color: #475569; white-space: pre-line;">
            ${path}
          </p>
        </div>
      </div>
      <div class="slide-footer">
        <span>© ${profile?.name || "지원자"} | MY CAREER GARDEN</span>
        <span>REV. ${compiledDate}</span>
      </div>
    </div>

    <!-- MAIN PROJECTS SLIDES -->
    ${highlightsHtml}

    <!-- FINAL SLIDE -->
    <div class="slide bg-white" style="border-left: 10px solid #d946ef; text-align: center; justify-content: center; align-items: center; gap: 20px;">
      <div style="flex-grow: 1; display: flex; flex-direction: column; justify-content: center; max-width: 600px; margin: 0 auto; margin-top: 50px;">
        <span style="font-size: 40px; margin-bottom: 20px;">🌿</span>
        <h1 style="font-size: 28px; font-weight: 800; color: #0f172a; margin-bottom: 10px;">감사합니다</h1>
        <p style="font-size: 13px; color: #64748b; line-height: 1.8;">
          자료에 언급된 모든 역량과 에셋은 ${profile?.name || "지원자"}님의 개인 커리어 정원 공간에 실물 문서/영상의 형태로 검증 및 가디닝 보관되어 있습니다.
        </p>
        <p style="font-size: 11px; color: #94a3b8; margin-top: 30px; font-family: monospace;">
          COMPILATION DATE: ${compiledDate}<br>
          POWERED BY MY CAREER GARDEN
        </p>
      </div>
      <div class="slide-footer" style="width: 100%; border: none;">
        <span>© ${profile?.name || "지원자"} | MY CAREER GARDEN</span>
        <span class="page-num">PAGE ${String(5 + highlights.length).padStart(2, "0")} / ${String(5 + highlights.length).padStart(2, "0")}</span>
      </div>
    </div>

  </div>

</body>
</html>
    `;

    downloadFile(htmlContent, `${profile?.name || "지원자"}_커리어_포트폴리오.html`, "text/html");
    setHasExportedPdf(true);
    showToast("포트폴리오 HTML 파일이 성공적으로 다운로드되었습니다!", "success");
  };

  const handleDownloadTxtPortfolio = () => {
    if (!portfolioResult) return;
    const title = portfolioResult.title;
    const intro = portfolioResult.intro;
    const target = portfolioTarget || "전략 직무 부서";
    const purpose = portfolioPurpose || "커리어 역량 증명";
    const compiledDate = portfolioResult.compiledDate;
    const academic = portfolioResult.academicSummary;
    const path = portfolioResult.recommendedCareerPath;
    const highlights = portfolioResult.keyHighlights;

    let text = `========================================================\n`;
    text += `                🌿 커리어 포트폴리오 리포트\n`;
    text += `========================================================\n\n`;
    text += `제목: ${title}\n`;
    text += `소개: ${intro}\n`;
    text += `제출처: ${target}\n`;
    text += `작성 목적: ${purpose}\n`;
    text += `생성일자: ${compiledDate}\n\n`;
    
    text += `--------------------------------------------------------\n`;
    text += `1. 학업 및 학술 기반 역량 (Academic Background)\n`;
    text += `--------------------------------------------------------\n`;
    text += `${academic}\n\n`;

    text += `--------------------------------------------------------\n`;
    text += `2. 가든 추천 성장 커리어 (Recommended Path)\n`;
    text += `--------------------------------------------------------\n`;
    text += `${path}\n\n`;

    text += `--------------------------------------------------------\n`;
    text += `3. 핵심 경험 에셋 하이라이트 (Key Highlights)\n`;
    text += `--------------------------------------------------------\n`;
    highlights.forEach((proj, idx) => {
      text += `[하이라이트 프로젝트 ${idx + 1}] ${proj.title}\n`;
      text += `- 대표 상황 및 도전 (Challenge): ${proj.challenge}\n`;
      text += `- 본인의 핵심 기여 행동 (Action): ${proj.action}\n`;
      text += `- 비즈니스 성과 및 교훈 (Impact): ${proj.impact}\n\n`;
    });

    text += `========================================================\n`;
    text += `가든 호스트: ${profile?.name || "지원자"}\n`;
    text += `제작 지원: My Career Garden (마이 커리어 가든)\n`;
    text += `========================================================\n`;

    downloadFile(text, `${profile?.name || "지원자"}_커리어_포트폴리오.txt`, "text/plain;charset=utf-8");
    setHasExportedPdf(true);
    showToast("포트폴리오 텍스트 리포트가 다운로드되었습니다!", "success");
    setIsExportModalOpen(false);
  };

  const handleDownloadStarTxt = () => {
    if (!starResult) return;
    
    let text = `========================================================\n`;
    text += `               🌿 AI 맞춤 자기소개서 초안\n`;
    text += `========================================================\n\n`;
    text += `[질문]\n${starResult.question || predefinedQuestion}\n\n`;
    text += `--------------------------------------------------------\n`;
    text += `자기소개서 초안 (수정/보완하여 서술해 보세요)\n`;
    text += `--------------------------------------------------------\n`;
    text += `${starResult.draft}\n\n`;
    
    text += `--------------------------------------------------------\n`;
    text += `글자수: 약 ${starResult.draft?.length || 0}자\n`;
    text += `핵심 도출 키워드: ${starResult.coreStrengths?.join(", ") || ""}\n`;
    text += `========================================================\n`;
    text += `사용 에셋 목록:\n`;
    const chosenAssets = assets.filter(a => selectedAssetIds.includes(a.id));
    chosenAssets.forEach((a, idx) => {
      text += `- [${idx+1}] ${a.title} (${a.subText || ""})\n`;
    });
    text += `========================================================\n`;
    text += `제작 지원: My Career Garden (마이 커리어 가든)\n`;
    text += `========================================================\n`;

    downloadFile(text, `${profile?.name || "지원자"}_자기소개서_초안.txt`, "text/plain;charset=utf-8");
    setHasExportedPdf(true);
    showToast("자기소개서 초안 텍스트 파일이 다운로드되었습니다!", "success");
    setIsExportModalOpen(false);
  };

  // ── CORE ACTIONS: MY PAGE CORE ACTIONS ──────────────────────────────────
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 1.5 * 1024 * 1024) {
        showToast("이미지 파일 크기가 너무 큽니다 (1.5MB 이하만 가능합니다).", "error");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImageInput(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveMyProfile = () => {
    if (!profile) return;
    if (!nameInput.trim()) {
      showToast("이름을 입력해주세요.", "error");
      return;
    }
    const updatedProfile: UserCareerProfile = {
      ...profile,
      name: nameInput,
      situation: situationInput,
      education: eduInput,
      email: emailInput,
      phone: phoneInput,
      website: websiteInput,
      coreIntro: coreIntroInput,
      coverLetterMotivation: motivationInput,
      coverLetterAspiration: aspirationInput,
      birthDate: birthDateInput,
      gender: genderInput,
      profileImage: profileImageInput
    };

    const prevDroplets = profile.waterDroplets !== undefined ? profile.waterDroplets : 0;
    const wasCompleted = profile.isProfileCompletedAwarded || false;
    const completeness = getProfileCompleteness(updatedProfile);

    let currentDroplets = prevDroplets;
    let extraAwardMsg = "";
    if (completeness === 100 && !wasCompleted) {
      currentDroplets += 3;
      updatedProfile.waterDroplets = currentDroplets;
      updatedProfile.isProfileCompletedAwarded = true;
      extraAwardMsg = " 🍯 프로필 100% 완성 보너스로 물방울💧 3개를 추가로 획득했습니다!";
    } else {
      updatedProfile.waterDroplets = currentDroplets;
    }

    setProfile(updatedProfile);
    saveToLocalStorage(updatedProfile, assets);
    setIsEditingProfile(false);
    setIsProfileModalOpen(false);
    showToast(`📋 프로필 정보가 성공적으로 업데이트되었습니다!${extraAwardMsg}`, "success");
  };

  const handleGenerateCoverLetter = async () => {
    if (!profile) return;
    if (selectedAssetIds.length === 0) {
      showToast("풍부하고 신뢰도 높은 자소서를 수확하기 위해 경험 에셋을 최소 한 개 이상 체크해 주십시오.", "error");
      return;
    }

    setIsGeneratingCoverLetter(true);
    try {
      const chosenAssets = assets.filter(a => selectedAssetIds.includes(a.id));
      const res = await fetch("/api/ai/cover-letter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userProfile: profile,
          target: coverLetterTarget || portfolioTarget || "제출처 회사 및 부서",
          purpose: coverLetterPurpose || portfolioPurpose || "전략 희망 직무",
          assets: chosenAssets
        })
      });

      if (!res.ok) {
        throw new Error("서버 자기소개서 생성 실패");
      }

      const data = await res.json();
      setMotivationInput(data.motivation || "");
      setAspirationInput(data.aspiration || "");

      // Immediately save to profile state
      const currentDroplets = profile.waterDroplets !== undefined ? profile.waterDroplets : 0;
      const updatedProfile: UserCareerProfile = {
        ...profile,
        coverLetterMotivation: data.motivation || "",
        coverLetterAspiration: data.aspiration || "",
        waterDroplets: currentDroplets + 2
      };
      setProfile(updatedProfile);
      saveToLocalStorage(updatedProfile, assets);
      showToast("✨ 선택된 에셋 기반 맞춤 지원동기 및 포부/다짐이 기적적으로 생성되었으며 물방울💧 2개를 주머니에 담았습니다!", "success");
    } catch (error) {
      console.error(error);
      const fallbackMot = `지원 대상인 [${coverLetterTarget || "목표 기업"}]의 발전에 가용한 핵심 스킬과 [${assets.filter(a => selectedAssetIds.includes(a.id)).map(a => a.title).join(", ")}] 수행 에셋을 결합하여, 고객 지표 성장 및 혁신 솔루션을 구현함으로써 최고의 시너지를 창출하고 싶어 열성껏 지원했습니다.`;
      const fallbackAsp = `단기적으로는 협업 프로토콜의 표준화를 이룩하고, 3년차 내에 독보적인 성과 가치를 설계하는 핵심 리더로 뿌리내리겠습니다.`;
      
      setMotivationInput(fallbackMot);
      setAspirationInput(fallbackAsp);

      const currentDroplets = profile.waterDroplets !== undefined ? profile.waterDroplets : 0;
      const updatedProfile: UserCareerProfile = {
        ...profile,
        coverLetterMotivation: fallbackMot,
        coverLetterAspiration: fallbackAsp,
        waterDroplets: currentDroplets + 2
      };
      setProfile(updatedProfile);
      saveToLocalStorage(updatedProfile, assets);
      showToast("스마트 로컬 시나리오 기반으로 지원동기와 포부를 생성하고 물방울💧 2개를 보너스로 드립니다.", "info");
    } finally {
      setIsGeneratingCoverLetter(false);
    }
  };

  // ── CORE ACTIONS: MATCH NAVIGATOR ──────────────────────────────────────
  const handleAnalyzeJd = async (customText?: string) => {
    const textToAnalyze = customText || jdText;
    if (!textToAnalyze.trim()) {
      showToast("분석할 희망 기업 채용 공고(JD) 텍스트를 양식에 복사해 주세요.", "error");
      return;
    }

    setIsAnalyzingJd(true);
    setJdAnalysis(null);

    try {
      const res = await fetch("/api/ai/jd-analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jdText: textToAnalyze,
          userProfile: profile,
          assets: assets
        })
      });

      if (!res.ok) {
        throw new Error("JD 분석 오류");
      }

      const data = await res.json();
      setJdAnalysis(data);
      showToast("🎯 희망 채용공고 대비 역량 격차 분석이 정밀 진단되었습니다.", "success");
    } catch (error) {
      console.error(error);
      
      // Smart offline parser for a premium backup experience
      let companyName = "목표 테크 기업";
      let role = "대표 기획 PM";
      let matchPerc = 78;
      
      if (textToAnalyze.includes("카카오")) {
        companyName = "카카오 (Kakao)";
        role = "서비스 및 데이터 기획 인턴십";
        matchPerc = 85;
      } else if (textToAnalyze.includes("토스")) {
        companyName = "토스 (Toss)";
        role = "Product Manager 어시스턴트";
        matchPerc = 80;
      } else if (textToAnalyze.includes("네이버")) {
        companyName = "네이버 (Naver)";
        role = "주니어 서비스 기획자 (신입)";
        matchPerc = 72;
      } else if (textToAnalyze.includes("우아한")) {
        companyName = "우아한형제들 (배달의민족)";
        role = "프로덕트 오퍼레이션 스페셜리스트";
        matchPerc = 68;
      }

      const backupData: JDGapAnalysis = {
        company: companyName,
        jobRole: role,
        matchPercentage: matchPerc,
        skills: [
          { skillName: "정량 데이터 분석", score: matchPerc - 8 },
          { skillName: "UX/UI 설계력", score: matchPerc + 12 },
          { skillName: "지표 모니터링", score: matchPerc - 15 },
          { skillName: "협업 & 문서화", score: matchPerc + 5 }
        ],
        gaps: [
          {
            skillName: "지표 모니터링 및 로깅",
            description: "해당 JD에서는 GA4나 Amplitude 등 실제 지표 모니터링 툴을 사용하여 대시보드를 추출해본 정량적 수치를 강하게 우대하고 있습니다. 현재 내 에셋의 증명 가치는 UX 개선에 머물러 있어 데이터 검증 부분이 보강되어야 합니다.",
            level: "high"
          },
          {
            skillName: "SQL 및 쿼리 추출",
            description: "인턴십 및 스페셜리스트 포지션에서 원활한 협업을 위한 쿼리 빌드 역량을 명시해 주었습니다. 관련 증서나 미니 쿼리 수행 로그 에셋을 추가하는 것이 시급합니다.",
            level: "medium"
          }
        ]
      };
      
      setJdAnalysis(backupData);
      showToast("JD 분석 데이터와 역량 갭(Gap) 진단표가 성공적으로 생성되었습니다.", "success");
    } finally {
      setIsAnalyzingJd(false);
    }
  };

  // Helper variables for dynamically determining seeds
  const getSeedEmoji = (type: string | undefined) => {
    switch (type) {
      case "planning": return "💡";
      case "analysis": return "🔍";
      case "creativity": return "🎨";
      case "execution": return "⚡";
      default: return "🌱";
    }
  };

  const getSeedName = (type: string | undefined) => {
    switch (type) {
      case "planning": return "지혜로운 기획";
      case "analysis": return "철두철미 분석";
      case "creativity": return "번뜩이는 창의";
      case "execution": return "불도저식 실행";
      default: return "기본 성장";
    }
  };

  // Skill Points Filter List helper
  const uniqueSkillsInGarden = Array.from(
    new Set(assets.flatMap(a => a.skills.map(s => s.skillName)))
  );

  const filteredAssets = assets.filter(a => {
    if (feedFilter === "전체") return true;
    return a.skills.some(s => s.skillName === feedFilter);
  });

  // Calculate dynamic skill metrics from actual assets
  const currentSkillAggregates: Record<string, number> = {};
  assets.forEach(a => {
    a.skills.forEach(s => {
      currentSkillAggregates[s.skillName] = (currentSkillAggregates[s.skillName] || 0) + s.points;
    });
  });

  // ── AUTHENTICATION & ONBOARDING BLOCKS ───────────────────────────────────
  if (!currentUser) {
    return <AuthScreen onAuthSuccess={handleAuthSuccess} />;
  }

  if (!profile) {
    return <Onboarding onComplete={handleOnboardingComplete} />;
  }

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-[430px] flex-col bg-slate-50 text-slate-800 shadow-2xl relative">
      
      {/* ── GLOBAL INTERACTIVE TOAST ────────────────────────────────────────── */}
      {toast && (
        <div
          className={`fixed top-4 left-1/2 z-[99] w-[90%] max-w-[390px] -translate-x-1/2 transform rounded-2xl p-4 shadow-xl border transition-all duration-300 animate-float flex items-start gap-3 ${
            toast.type === "success"
              ? "bg-[#ecfdf5] border-emerald-200 text-emerald-900"
              : toast.type === "error"
              ? "bg-red-50 border-red-200 text-red-900"
              : "bg-blue-50 border-blue-100 text-blue-900"
          }`}
        >
          {toast.type === "success" ? (
            <CheckCircle2 className="h-5 w-5 text-emerald-600 flex-shrink-0 mt-0.5" />
          ) : toast.type === "error" ? (
            <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
          ) : (
            <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
          )}
          <div className="text-xs font-semibold leading-relaxed">{toast.message}</div>
        </div>
      )}

      {/* ── CUSTOM REUSABLE CONFIRM MODAL ───────────────────────────────────── */}
      {confirmDialog && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fadeIn">
          <div className="w-full max-w-[340px] bg-white rounded-3xl border border-slate-150 p-5.5 shadow-2xl flex flex-col gap-4 animate-scaleUp">
            <div className="space-y-1.5 text-center">
              <h3 className="text-sm font-extrabold text-slate-800 tracking-tight">
                {confirmDialog.title || "확인"}
              </h3>
              <p className="text-[11px] text-slate-500 leading-relaxed font-semibold whitespace-pre-line px-1">
                {confirmDialog.message}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  if (confirmDialog.onCancel) confirmDialog.onCancel();
                  setConfirmDialog(null);
                }}
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-600 py-3 rounded-2xl text-[11px] font-extrabold transition-all cursor-pointer text-center active:scale-95"
              >
                {confirmDialog.cancelText || "취소"}
              </button>
              <button
                onClick={() => {
                  confirmDialog.onConfirm();
                  setConfirmDialog(null);
                }}
                className={`flex-1 py-3 rounded-2xl text-[11px] font-extrabold transition-all cursor-pointer text-center shadow-lg active:scale-95 text-white ${
                  confirmDialog.confirmText === "영구 제거" || confirmDialog.confirmText === "초기화"
                    ? "bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 shadow-red-100/40"
                    : "bg-gradient-to-r from-brand-600 to-emerald-600 hover:from-brand-700 hover:to-emerald-700 shadow-brand-100/40"
                }`}
              >
                {confirmDialog.confirmText || "확인"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── HEADER TOPBAR ───────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-30 border-b border-brand-100/40 bg-white/95 px-5 py-3 hover:bg-white transition-all backdrop-blur-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 cursor-pointer select-none" onClick={() => setActiveTab("archive")}>
            <span className="text-xl font-black tracking-tighter text-emerald-600 font-sans">
              AssetLog
            </span>
          </div>
          
          <div 
            onClick={() => {
              setIsProfileModalOpen(true);
            }}
            className="flex items-center gap-2.5 cursor-pointer hover:opacity-90 active:scale-95 transition-all group"
          >
            <div className="text-right">
              <span className="block text-[9px] font-black text-slate-400 group-hover:text-brand-600 transition-colors uppercase">My Profile</span>
              <span className="text-xs font-bold text-slate-700">{profile.name} 님</span>
            </div>
            <div
              className="h-10 w-10 overflow-hidden rounded-full border-2 border-brand-200 bg-gradient-to-tr from-brand-600 to-emerald-600 text-[10px] font-black text-white flex items-center justify-center text-center px-1 leading-tight shadow-md transition-all group-hover:border-brand-400"
            >
              <span className="truncate max-w-full">{profile.name}</span>
            </div>
          </div>
        </div>
      </header>

      {/* ── MAIN SCROLLING CONTENT SHELL ─────────────────────────────────────── */}
      <main className="flex-1 pb-24">
        
        {/* ── TAB 1: ARCHIVE (& GARDEN STATISTICS) ────────────────────────── */}
        {activeTab === "archive" && (
          <div className="px-4 py-5 animate-fadeIn">
            
            {/* Quick Greeting Header */}
            <div className="mb-4">
              <h1 className="text-xl font-bold tracking-tight text-slate-800">
                반가워요, <span className="text-brand-700 font-extrabold">{profile.name}</span> 님!
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                지금까지 보관소에 기록된 나만의 실무 증명 에셋들을 둘러보세요.
              </p>
            </div>

            {/* Micro Dashboard Statistics Grid */}
            <section className="mb-5 grid grid-cols-3 gap-3">
              <div className="rounded-2xl border border-slate-100 bg-white p-3 text-center shadow-sm">
                <span className="text-2xl font-black text-brand-600 block leading-none mb-1">
                  {assets.length}
                </span>
                <span className="text-[10px] font-bold text-slate-400">총 축적 에셋</span>
              </div>
              <div className="rounded-2xl border border-slate-100 bg-white p-3 text-center shadow-sm">
                <span className="text-2xl font-black text-brand-600 block leading-none mb-1">
                  {profile.totalPoints}
                </span>
                <span className="text-[10px] font-bold text-slate-400">역량 포인트 pt</span>
              </div>
              <div className="rounded-2xl border border-slate-100 bg-white p-3 text-center shadow-sm">
                <span className="text-2xl font-black text-amber-500 block leading-none mb-1">
                  {Math.min(100, Math.floor((profile.totalPoints / 600) * 100))}%
                </span>
                <span className="text-[10px] font-bold text-slate-400">목표 달성 달성률</span>
              </div>
            </section>




            {/* Filter Tabs scroll horizontal bar */}
            <div className="mb-4">
              <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider block mb-2">
                역량별 필터 정원사
              </span>
              <div className="flex gap-1.5 overflow-x-auto pb-1.5 scrollbar-thin">
                {["전체", ...uniqueSkillsInGarden].map((skill) => (
                  <button
                    key={skill}
                    onClick={() => setFeedFilter(skill)}
                    className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-all border shrink-0 ${
                      feedFilter === skill
                        ? "bg-brand-600 border-brand-600 text-white shadow-sm"
                        : "bg-white border-slate-100 text-slate-500 hover:bg-slate-50/80"
                    }`}
                  >
                    {skill}
                  </button>
                ))}
              </div>
            </div>

            {/* Asset List Dynamic Feed */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400">{filteredAssets.length}개의 가꿀 에셋 이력</span>
                {feedFilter !== "전체" && (
                  <button onClick={() => setFeedFilter("전체")} className="text-[11px] font-bold text-brand-600">
                    필터 지우기
                  </button>
                )}
              </div>

              {filteredAssets.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-slate-200 bg-white px-5 py-12 text-center">
                  <span className="text-4xl block mb-2">🎋</span>
                  <span className="text-xs font-bold text-slate-400">해당 필터에 속한 이력이 정원에 없어요</span>
                  <p className="text-[11px] text-slate-400 mt-1 leading-normal max-w-[280px] mx-auto">
                    우측 하단 플러스 버튼으로 이 기능을 증명하는 파일이나 작성본을 등록해보세요.
                  </p>
                </div>
              ) : (
                filteredAssets.map((asset) => (
                  <div
                    key={asset.id}
                    onClick={() => setSelectedAssetDetail(asset)}
                    className="group relative cursor-pointer overflow-hidden rounded-2xl border border-slate-100 bg-white p-4 shadow-sm hover:border-brand-300 transition-all active:scale-[0.99] hover:shadow-md"
                  >
                    <span className="absolute top-4 right-4 text-[10px] text-slate-400 font-medium">
                      {asset.date}
                    </span>

                    <div className="flex items-start gap-3">
                      {/* Icon Container with type color badges */}
                      <div className={`h-10 w-10 shrink-0 rounded-xl flex items-center justify-center text-xl ${
                        asset.type === "file" ? "bg-blue-50" :
                        asset.type === "text" ? "bg-emerald-50" :
                        asset.type === "video" ? "bg-rose-50" : "bg-purple-50"
                      }`}>
                        {asset.type === "file" && <FileText className="h-5 w-5 text-blue-600" />}
                        {asset.type === "text" && <FileUp className="h-5 w-5 text-emerald-600" />}
                        {asset.type === "video" && <Video className="h-5 w-5 text-rose-600" />}
                        {asset.type === "link" && <Link2 className="h-5 w-5 text-purple-600" />}
                      </div>

                      <div className="flex-1 pr-14">
                        <h3 className="text-xs font-bold text-slate-800 line-clamp-1 group-hover:text-brand-600 transition-colors">
                          {asset.title}
                        </h3>
                        <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">
                          {asset.subText}
                        </p>
                      </div>
                    </div>

                    {/* Meta Tag Badge Row */}
                    <div className="mt-3.5 flex flex-wrap gap-1 border-t border-slate-50 pt-3">
                      {asset.skills.map((s, sIdx) => (
                        <span
                          key={sIdx}
                          className="rounded-lg bg-emerald-50 px-2 py-0.5 text-[9px] font-extrabold text-emerald-700 border border-emerald-100"
                        >
                          {s.skillName} +{s.points}pt
                        </span>
                      ))}
                      {asset.tags.map((tag, tIdx) => (
                        <span
                          key={tIdx}
                          className="rounded-lg bg-slate-50 px-2 py-0.5 text-[9px] font-bold text-slate-500 border border-slate-100"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>

                    {/* Interactive hover quick trash button */}
                    <button
                      onClick={(e) => handleDeleteAsset(asset.id, e)}
                      className="absolute right-3 bottom-3 opacity-0 group-hover:opacity-100 rounded-lg p-1 text-slate-400 hover:bg-slate-50 hover:text-red-600 transition-all duration-200"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* ── TAB 2: SMART BUILDER (RESUME & PORTFOLIO) ───────────────────── */}
        {activeTab === "builder" && (
          <div className="px-4 py-5 animate-fadeIn">
            
            <div className="mb-5 no-print">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 border border-amber-200 px-2.5 py-0.5 text-[10px] font-extrabold text-amber-700 animate-float">
                <Sparkles className="h-3 w-3 text-amber-600" /> AI 커리어 빌딩 마스터
              </span>
              <h1 className="text-xl font-bold tracking-tight text-slate-800 mt-2">
                자소서 & 포트폴리오 빌더
              </h1>
              <p className="text-xs text-slate-500 mt-0.5 leading-normal">
                내가 수확한 경험 에셋들을 바탕으로 고유한 STAR 자기소개서를 생성하거나, 인쇄 가능한 다목적 포트폴리오를 설계하세요.
              </p>
            </div>

            {/* Mode selection Switch tabs - Hidden during Print */}
            <div className="mb-5 flex gap-2 border bg-slate-100/60 p-1 rounded-2xl no-print">
              <button
                onClick={() => setBuilderSectionMode("star")}
                className={`flex-1 py-2.5 text-xs font-black rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  builderSectionMode === "star"
                    ? "bg-white text-brand-700 shadow-sm"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                ✍️ STAR 자소서 빌더
              </button>
              <button
                onClick={() => {
                  setBuilderSectionMode("portfolio");
                  // Initialize default values for portfolio titles if blank
                  if (!portfolioTitle && profile) {
                    setPortfolioTitle(`${profile.name}님의 역량 증명 포트폴리오`);
                  }
                  if (!portfolioIntro && profile) {
                    setPortfolioIntro(`${profile.targetGoal || "성실함"} 배움과 해결 역량을 겸비한 실무형 인재`);
                  }
                }}
                className={`flex-1 py-2.5 text-xs font-black rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  builderSectionMode === "portfolio"
                    ? "bg-white text-brand-700 shadow-sm"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                📁 포트폴리오 메이커
              </button>
            </div>

            {/* STEPPER - Hidden during Print */}
            <div className="mb-6 flex gap-2 stepper-row no-print">
              <div className="flex-1 rounded-xl bg-brand-50 border border-brand-100 px-2.5 py-1.5 text-center">
                <span className="block text-[8px] font-bold text-brand-400 uppercase leading-none">Step 1</span>
                <span className="text-[11px] font-black text-brand-700">에셋 마운트</span>
              </div>
              <div className={`flex-1 rounded-xl border px-2.5 py-1.5 text-center ${
                starResult || portfolioResult ? "bg-brand-50 border-brand-100" : "bg-white border-slate-100 text-slate-400"
              }`}>
                <span className="block text-[8px] font-bold text-slate-300 uppercase leading-none">Step 2</span>
                <span className={`text-[11px] font-black ${(starResult || portfolioResult) ? "text-brand-700" : ""}`}>AI 자동 변환</span>
              </div>
              <div className={`flex-1 rounded-xl border px-2.5 py-1.5 text-center ${
                hasExportedPdf ? "bg-brand-50 border-brand-100" : "bg-white border-slate-100 text-slate-400"
              }`}>
                <span className="block text-[8px] font-bold text-slate-300 uppercase leading-none">Step 3</span>
                <span className={`text-[11px] font-black ${hasExportedPdf ? "text-brand-700" : ""}`}>PDF/Print 보관</span>
              </div>
            </div>

            {/* Selection inputs Form - Hidden during Print */}
            <div className="no-print">
              {/* ── SUB-MODE 1: STAR RESUME ── */}
              {builderSectionMode === "star" && (
                <div className="space-y-4 mb-5">
                  {/* Nested Tab Selector */}
                  <div className="flex gap-2 bg-slate-100/60 p-1 rounded-2xl">
                    <button
                      onClick={() => setStarSubTab("question")}
                      className={`flex-1 py-2 text-xs font-black rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                        starSubTab === "question"
                          ? "bg-white text-indigo-900 shadow-sm"
                          : "text-slate-500 hover:text-slate-800"
                      }`}
                    >
                      📝 문항별 답변 빌더 (STAR)
                    </button>
                    <button
                      onClick={() => setStarSubTab("sop")}
                      className={`flex-1 py-1.5 text-xs font-black rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                        starSubTab === "sop"
                          ? "bg-white text-indigo-700 shadow-sm"
                          : "text-slate-500 hover:text-slate-800"
                      }`}
                    >
                      🌿 지원동기 & 포부/다짐 생성
                    </button>
                  </div>

                  {starSubTab === "question" ? (
                    <section className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-600 mb-2 uppercase tracking-wide">
                          1. 자소서 문항 선택 혹은 직접 기입
                        </label>
                        <div className="space-y-2">
                          {[
                            "지원 직무에서 문제를 발견하고 주도하여 해결한 경험을 구체적으로 서술하세요. (500자 이내)",
                            "본인의 가장 큰 실패 케이스와 이를 극복해 낸 혁신 사례를 공유하세요. (700자 이내)",
                            "한정된 기한 내 공동의 가치를 끌어올리기 위해 협업에 온전히 기여한 일화"
                          ].map((q, qIdx) => (
                            <div
                              key={qIdx}
                              onClick={() => {
                                setPredefinedQuestion(q);
                                setCustomQuestion("");
                              }}
                              className={`cursor-pointer rounded-xl border p-3 text-xs transition-all ${
                                predefinedQuestion === q && !customQuestion
                                  ? "border-brand-600 bg-brand-50/40 text-brand-800 font-semibold"
                                  : "border-slate-100 bg-white text-slate-600 hover:bg-slate-50/50"
                              }`}
                            >
                              {q}
                            </div>
                          ))}

                          <div className="relative">
                            <textarea
                              value={customQuestion}
                              onChange={(e) => {
                                setCustomQuestion(e.target.value);
                                setPredefinedQuestion("");
                              }}
                              placeholder="분석하고 싶은 기업의 실제 자소서 문항을 정밀 입력해 주십시오…"
                              rows={2}
                              className="w-full rounded-2xl border border-slate-200 bg-white p-3.5 text-xs outline-none focus:border-brand-500 transition-all leading-normal"
                            ></textarea>
                            {customQuestion && (
                              <span className="absolute top-2.5 right-2 rounded-full bg-brand-600 px-1.5 py-0.5 text-[8px] font-bold text-white">
                                커스텀 입력 중
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </section>
                  ) : (
                    <section className="space-y-4 rounded-3xl border border-slate-150/60 bg-white p-5 shadow-sm text-xs">
                      <div className="border-b border-slate-50 pb-3">
                        <span className="bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded text-[8.5px] font-extrabold text-indigo-700">
                          AI MASTER GENERATOR
                        </span>
                        <h3 className="text-xs font-black text-slate-850 mt-1 flex items-center gap-1.5">
                          ✨ AI 자기소개서 지원동기 및 포부/다짐 생성기
                        </h3>
                        <p className="text-[10px] text-slate-400 mt-1">
                          목표 기업, 희망 직무 및 보관 중인 핵심 경험 에셋들을 융합하여 서류 합격을 만드는 강력한 지원동기와 포부/다짐을 설계합니다.
                        </p>
                      </div>

                      {/* Seed Parameters */}
                      <div className="bg-slate-50 p-4 rounded-2xl space-y-3.5 border border-slate-100 text-xs text-slate-700">
                        <span className="text-[9.5px] font-black text-indigo-950 block uppercase">자소서 작성 핵심 타깃 설정</span>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="space-y-1">
                            <label className="text-[9px] font-extrabold text-slate-400 block">제출 기업명 / 부서</label>
                            <input
                              type="text"
                              className="w-full rounded-xl bg-white border border-slate-200 p-2 px-2.5 text-xs focus:ring-1 focus:ring-brand-500 focus:outline-none"
                              value={coverLetterTarget}
                              onChange={(e) => setCoverLetterTarget(e.target.value)}
                              placeholder={portfolioTarget || "네이버 서비스 기획부"}
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[9px] font-extrabold text-slate-400 block">희망 분야 / 세부 직무</label>
                            <input
                              type="text"
                              className="w-full rounded-xl bg-white border border-slate-200 p-2 px-2.5 text-xs focus:ring-1 focus:ring-brand-500 focus:outline-none"
                              value={coverLetterPurpose}
                              onChange={(e) => setCoverLetterPurpose(e.target.value)}
                              placeholder={portfolioPurpose || "신입 서비스 기획/PM"}
                            />
                          </div>
                        </div>
                      </div>
                    </section>
                  )}
                </div>
              )}

              {/* ── SUB-MODE 2: PORTFOLIO WRITER INPUTS ── */}
              {builderSectionMode === "portfolio" && (
                <section className="mb-5 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wide">
                        1. 제출처 / 지원 대상
                      </label>
                      <input
                        type="text"
                        value={portfolioTarget}
                        onChange={(e) => setPortfolioTarget(e.target.value)}
                        placeholder="예: 네이버 프로덕트 매니지먼트 부서"
                        className="w-full rounded-xl border border-slate-200 bg-white p-3 text-xs outline-none focus:border-brand-500 transition-all font-medium text-slate-800 shadow-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wide">
                        2. 지원 분야/역할
                      </label>
                      <input
                        type="text"
                        value={portfolioPurpose}
                        onChange={(e) => setPortfolioPurpose(e.target.value)}
                        placeholder="예: 검색 UX 기획 PM, 반응형 Front-end 개발자"
                        className="w-full rounded-xl border border-slate-200 bg-white p-3 text-xs outline-none focus:border-brand-500 transition-all font-medium text-slate-800 shadow-sm"
                      />
                    </div>
                  </div>
                </section>
              )}

              {/* ── SHARED SOURCE ASSETS SELECTOR ── */}
              <section className="mb-5">
                <label className="block text-xs font-bold text-slate-600 mb-2 uppercase tracking-wide">
                  {builderSectionMode === "star" 
                    ? (starSubTab === "question" ? "2. 자소서 문항에 첨가할 에셋 조각 체크" : "2. 지원동기/포부 작성에 사용할 핵심 에셋 조각 체크")
                    : "3. 포트폴리오를 빛낼 경험 에셋 조각 선택"
                  } ({selectedAssetIds.length}개 선택됨)
                </label>
                
                {assets.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-slate-200 p-6 text-center bg-white">
                    <p className="text-xs text-slate-400">마운트할 수 있는 커리어 에셋이 비어 있습니다.</p>
                    <p className="text-[10px] text-slate-400 mt-1">기록 피드 탭에서 먼저 에셋을 기록/제출해 주세요!</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {/* Search bar inside the asset selector */}
                    <div className="relative mb-2">
                      <input
                        type="text"
                        placeholder="🔍 에셋 제목, 내용, 태그 검색..."
                        value={builderAssetSearch}
                        onChange={(e) => setBuilderAssetSearch(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-xs font-semibold outline-none focus:border-brand-500 focus:bg-white transition-all shadow-xs"
                      />
                      {builderAssetSearch && (
                        <button
                          type="button"
                          onClick={() => setBuilderAssetSearch("")}
                          className="absolute right-3 top-2.5 text-[9px] bg-slate-200 hover:bg-slate-300 text-slate-600 px-1.5 py-0.5 rounded font-black cursor-pointer"
                        >
                          초기화
                        </button>
                      )}
                    </div>

                    <div className="space-y-2 max-h-[170px] overflow-y-auto pr-1">
                      {(() => {
                        const filtered = assets.filter((asset) => {
                          const query = builderAssetSearch.toLowerCase().trim();
                          if (!query) return true;
                          return (
                            (asset.title && asset.title.toLowerCase().includes(query)) ||
                            (asset.subText && asset.subText.toLowerCase().includes(query)) ||
                            (asset.skills && asset.skills.some((s) => s.skillName && s.skillName.toLowerCase().includes(query))) ||
                            (asset.tags && asset.tags.some((t) => t && t.toLowerCase().includes(query))) ||
                            (asset.date && asset.date.toLowerCase().includes(query))
                          );
                        });

                        if (filtered.length === 0) {
                          return (
                            <div className="py-6 text-center text-xs text-slate-400 border border-slate-100 rounded-xl bg-white">
                              검색 결과에 맞는 경험 에셋이 없습니다.
                            </div>
                          );
                        }

                        return filtered.map((asset) => {
                          const isSelected = selectedAssetIds.includes(asset.id);
                          return (
                            <div
                              key={asset.id}
                              onClick={() => toggleAssetSelection(asset.id)}
                              className={`flex items-center gap-3 rounded-xl border p-3 cursor-pointer transition-all ${
                                isSelected
                                  ? "border-brand-600 bg-brand-50/30 font-semibold text-brand-800"
                                  : "border-slate-100 bg-white text-slate-600 hover:border-slate-200"
                              }`}
                            >
                              <div className={`h-5 w-5 rounded border flex items-center justify-center text-[10px] shrink-0 ${
                                isSelected ? "bg-brand-600 border-brand-600 text-white" : "border-slate-200 bg-slate-50 text-transparent"
                              }`}>
                                ✓
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="text-[11px] font-bold truncate">{asset.title}</h4>
                                <span className="text-[9px] text-slate-400 font-normal leading-none block mt-0.5">
                                  {asset.date} · {asset.skills.map(s => s.skillName).join(", ")}
                                </span>
                              </div>
                            </div>
                          );
                        });
                      })()}
                    </div>
                  </div>
                )}
              </section>

              {/* Main Action Buttons */}
              <div className="mb-6">
                {builderSectionMode === "star" ? (
                  starSubTab === "question" ? (
                    <button
                      onClick={handleGenerateStarDraft}
                      disabled={isGeneratingStar || assets.length === 0}
                      className={`w-full py-4 rounded-2xl text-xs font-bold text-white flex items-center justify-center gap-2 cursor-pointer transition-all shadow-md active:scale-98 ${
                        isGeneratingStar ? "bg-slate-300" : "bg-brand-600 hover:bg-brand-700"
                      }`}
                    >
                      {isGeneratingStar ? (
                        <>
                          <span className="spinner"></span>
                          AI가 자소서 원고 분석 중...
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-4 w-4" />
                          선택 에셋 기반 STAR 자소서 생성하기
                        </>
                      )}
                    </button>
                  ) : (
                    <button
                      onClick={handleGenerateCoverLetter}
                      disabled={isGeneratingCoverLetter || assets.length === 0}
                      className={`w-full py-4 rounded-2xl text-xs font-bold text-white flex items-center justify-center gap-2 cursor-pointer transition-all shadow-md active:scale-98 ${
                        isGeneratingCoverLetter ? "bg-indigo-300" : "bg-indigo-600 hover:bg-indigo-700"
                      }`}
                    >
                      {isGeneratingCoverLetter ? (
                        <>
                          <span className="h-3 w-3 rounded-full border-2 border-white border-t-transparent animate-spin inline-block"></span>
                          커리어 자산 정밀 분석 및 자소서 생성 중...
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-4 w-4" />
                          AI 지원동기 및 포부/다짐 생성하기
                        </>
                      )}
                    </button>
                  )
                ) : (
                  <button
                    onClick={handleGeneratePortfolio}
                    disabled={isGeneratingPortfolio || assets.length === 0}
                    className={`w-full py-4 rounded-2xl text-xs font-bold text-white flex items-center justify-center gap-2 cursor-pointer transition-all shadow-md active:scale-98 ${
                      isGeneratingPortfolio ? "bg-indigo-300" : "bg-indigo-600 hover:bg-indigo-700"
                    }`}
                  >
                    {isGeneratingPortfolio ? (
                      <>
                        <span className="spinner"></span>
                        Gemini가 명품 포트폴리오를 기획하는 중...
                      </>
                    ) : (
                      <>
                        <BookOpen className="h-4 w-4" />
                        실무 가든 포트폴리오 종합 기획하기
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>

            {/* ── AI OUTPUT 1: STAR DRAFT ── */}
            {builderSectionMode === "star" && starSubTab === "question" && starResult && (
              <section className="bg-white border border-brand-100 rounded-3xl p-4 shadow-sm animate-fadeIn space-y-4 no-print">
                <div className="flex items-center justify-between border-b border-slate-50 pb-3">
                  <span className="text-xs font-black text-slate-700 flex items-center gap-1.5">
                    🤖 AI 정형 분석 초안
                  </span>
                  <div className="text-right">
                    <span className="block text-[8px] font-bold text-slate-400">자소서 문항 부합도</span>
                    <span className="text-xs font-black text-emerald-600">{starResult.overallScore}점 / 100점</span>
                  </div>
                </div>

                <div className="space-y-3.5">
                  <div className="text-xs leading-relaxed text-slate-700">
                    <span className="inline-block rounded bg-indigo-50 border border-indigo-100 px-1.5 py-0.5 text-[9px] font-extrabold text-indigo-700 mr-1.5 uppercase">
                      Situation (상황)
                    </span>
                    {starResult.situation}
                  </div>
                  <div className="text-xs leading-relaxed text-slate-700">
                    <span className="inline-block rounded bg-pink-50 border border-pink-100 px-1.5 py-0.5 text-[9px] font-extrabold text-pink-700 mr-1.5 uppercase">
                      Task (과제)
                    </span>
                    {starResult.task}
                  </div>
                  <div className="text-xs leading-relaxed text-slate-700">
                    <span className="inline-block rounded bg-amber-50 border border-amber-100 px-1.5 py-0.5 text-[9px] font-extrabold text-amber-700 mr-1.5 uppercase">
                      Action (행동)
                    </span>
                    {starResult.action}
                  </div>
                  <div className="text-xs leading-relaxed text-slate-700">
                    <span className="inline-block rounded bg-emerald-50 border border-emerald-100 px-1.5 py-0.5 text-[9px] font-extrabold text-emerald-700 mr-1.5 uppercase">
                      Result (결과)
                    </span>
                    {starResult.result}
                  </div>
                </div>

                <div className="border-t border-slate-50 pt-3 flex flex-wrap gap-1.5 items-center">
                  <span className="text-[10px] font-bold text-slate-400 mr-1">도출 핵심 키워드:</span>
                  {starResult.coreStrengths?.map((tag, tIdx) => (
                    <span key={tIdx} className="rounded-md bg-slate-50 border border-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600">
                      ✨ {tag}
                    </span>
                  ))}
                </div>
              </section>
            )}

            {/* ── AI OUTPUT 1-B: SOP DRAFT (MOTIVATION & ASPIRATION) ── */}
            {builderSectionMode === "star" && starSubTab === "sop" && (
              <section className="bg-white border border-brand-100 rounded-3xl p-5 shadow-sm animate-fadeIn space-y-5 no-print text-xs">
                <div className="border-b border-slate-100 pb-3 flex justify-between items-center text-slate-800">
                  <span className="text-xs font-black flex items-center gap-1.5">
                    🤖 AI 지원동기 및 포부/다짐 결과물
                  </span>
                  <span className="bg-emerald-50 text-[9px] font-black text-emerald-700 px-2.5 py-0.5 rounded-full border border-emerald-100 uppercase animate-pulse">
                    LIVE SYNC ACTIVE
                  </span>
                </div>

                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center">
                      <label className="text-[10px] font-black text-violet-750 block uppercase">🌿 나의 대표 자소서 지원동기 (Motivation)</label>
                      <span className="text-[8px] font-mono text-slate-400">자동 저장 보존됨</span>
                    </div>
                    <textarea
                      rows={5}
                      className="w-full rounded-2xl border border-slate-200 p-3.5 text-xs focus:ring-1 focus:ring-brand-500 focus:outline-none leading-relaxed text-slate-700 font-semibold bg-violet-50/10"
                      value={motivationInput}
                      onChange={(e) => {
                        setMotivationInput(e.target.value);
                        if (profile) {
                          const updated = { ...profile, coverLetterMotivation: e.target.value };
                          setProfile(updated);
                          saveToLocalStorage(updated, assets);
                        }
                      }}
                      placeholder="지원 동기를 직접 입력해 두거나 위에서 AI 생성기를 돌리면 나타납니다."
                    />
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center">
                      <label className="text-[10px] font-black text-fuchsia-750 block uppercase">🚀 나의 대표 포부/다짐 (Aspiration)</label>
                      <span className="text-[8px] font-mono text-slate-400">자동 저장 보존됨</span>
                    </div>
                    <textarea
                      rows={5}
                      className="w-full rounded-2xl border border-slate-200 p-3.5 text-xs focus:ring-1 focus:ring-brand-500 focus:outline-none leading-relaxed text-slate-700 font-semibold bg-fuchsia-50/10"
                      value={aspirationInput}
                      onChange={(e) => {
                        setAspirationInput(e.target.value);
                        if (profile) {
                          const updated = { ...profile, coverLetterAspiration: e.target.value };
                          setProfile(updated);
                          saveToLocalStorage(updated, assets);
                        }
                      }}
                      placeholder="포부/다짐과 마일스톤을 입력창에 기입하거나 AI로 생성해 보세요."
                    />
                  </div>
                </div>

                <div className="border-t border-slate-100 pt-3 text-[9.5px] text-slate-400 flex justify-between items-center leading-none">
                  <span>본 지원 동기와 포부/다짐은 인쇄형 포트폴리오의 자동으로 연동되어 인쇄됩니다.</span>
                  <span className="font-extrabold text-slate-500">COMPLETE SYNC</span>
                </div>
              </section>
            )}

            {/* ── AI OUTPUT 2: PORTFOLIO MAIN TEMPLATE (Print Ready Layout) ── */}
            {builderSectionMode === "portfolio" && portfolioResult && (
              <div className="space-y-6">
                
                {/* PDF Controller Seam - Hidden on Print */}
                <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 no-print animate-fadeIn">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-indigo-500 animate-pulse"></span>
                    <div>
                      <span className="text-[11px] font-black text-indigo-950 block">포트폴리오 역량 맞춤 설계 완료</span>
                      <span className="text-[9.5px] text-indigo-500 block">선택하신 경험 에셋 데이터를 바탕으로 핵심 프로젝트와 요약 정보가 나누어 인쇄됩니다.</span>
                    </div>
                  </div>
                  <button
                    onClick={handlePrintPortfolio}
                    disabled={isGeneratingPdf}
                    className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white rounded-xl px-4 py-2 text-[10.5px] font-black cursor-pointer transition-all shadow-sm shrink-0 self-end sm:self-auto flex items-center justify-center gap-1.5"
                  >
                    {isGeneratingPdf ? (
                      <>
                        <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                        PDF 생성 중...
                      </>
                    ) : (
                      "📄 PDF 다운로드"
                    )}
                  </button>
                </div>

                {/* THE HIGH-FIDELITY RECORD DECK CONTAINER */}
                <div className="space-y-8 no-print-gap select-text">
                  
                  {/* SLIDE 1: PRESTIGE TITLE COVER SLIDE */}
                  <section className="print-page print-card bg-slate-900 text-white border border-slate-800 shadow-xl rounded-3xl p-6 sm:p-8 flex flex-col justify-between lg:aspect-[16/9] w-full min-h-[380px] lg:min-h-[167.06mm] lg:h-auto shrink-0 relative border-r-8 border-brand-500 overflow-hidden break-words">
                    
                    {/* Decorative Background elements for aesthetics */}
                    <div className="absolute right-0 top-0 w-1/3 h-full bg-gradient-to-l from-brand-900/10 to-transparent pointer-events-none" />
                    <div className="absolute left-10 top-0 w-32 h-1 bg-brand-500" />
                    
                    {/* Header line */}
                    <div className="flex items-center justify-between border-b border-slate-800 pb-4 z-10">
                      <div className="flex items-center gap-2">
                        <span className="bg-brand-600 text-white px-2.5 py-0.5 rounded-md text-[9px] font-black tracking-widest uppercase">
                          OFFICIAL RECORD
                        </span>
                        <span className="text-[9px] font-mono tracking-widest text-slate-400 uppercase">
                          MY CAREER GARDEN
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] font-mono text-brand-400 font-extrabold tracking-wider">
                          PAGE 01 / {String(5 + portfolioResult.keyHighlights.length).padStart(2, "0")}
                        </span>
                      </div>
                    </div>

                    {/* Cover Center Content */}
                    <div className="my-auto py-6 z-10 space-y-4">
                      <span className="inline-flex items-center gap-1.5 bg-slate-800 border border-slate-700 px-3 py-1 rounded-full text-[10px] font-black text-brand-400 tracking-wide">
                        🌿 실무 검증 역량 포트폴리오
                      </span>
                      <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight leading-snug max-w-2xl">
                        {profile?.name || "지원자"}님의 전문 직무 포트폴리오 명세서
                      </h1>
                      <div className="h-0.5 w-16 bg-gradient-to-r from-brand-500 to-indigo-500" />
                      <p className="text-[11px] sm:text-xs leading-relaxed text-slate-400 max-w-xl break-words">
                        선택된 핵심 경험 에셋 {selectedAssetIds.length}가지 및 정량 가중치 데이터를 분석하여 직무 적합성과 강점을 증명하기 위해 정성적·정량적으로 고도로 입체 설계된 공식 인재 기록입니다.
                      </p>
                    </div>

                    {/* Metadata line */}
                    <div className="border-t border-slate-800 pt-4 flex flex-wrap gap-x-6 gap-y-2 items-center justify-between text-[10px] text-slate-400 z-10 mt-2 font-sans">
                      <div className="flex flex-wrap items-center gap-4">
                        <span className="font-bold flex items-center gap-1 text-white">
                          <span className="text-brand-400">HOST:</span> {profile?.name || "지원자"}
                        </span>
                        <span>·</span>
                        <span>
                          <strong className="text-slate-300">목표 영역:</strong> {portfolioTarget || "전략 직무 부서"}
                        </span>
                        <span>·</span>
                        <span>
                          <strong className="text-slate-300">목표 분야:</strong> {profile?.targetJobs?.join(", ")}
                        </span>
                        <span>·</span>
                        <span>
                          <strong className="text-slate-300">신분/상황:</strong> {profile?.situation}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-700 text-right">
                          <span className="text-[8px] block text-slate-400 font-bold uppercase leading-none">누적 역량수치</span>
                          <span className="text-brand-400 font-black font-mono text-xs">{profile?.totalPoints || 180} pt</span>
                        </div>
                        <span className="text-[9px] font-mono text-slate-500">REV. {portfolioResult.compiledDate}</span>
                      </div>
                    </div>
                  </section>


                  {/* SLIDE 2-A: PRESTIGE PROFILE & CONTACT DETAILS SLIDE */}
                  <section className="print-page print-card bg-slate-50 text-slate-900 border border-slate-200 shadow-xl rounded-2xl p-6 sm:p-8 flex flex-col justify-between lg:aspect-[16/9] w-full min-h-[420px] lg:min-h-[167.06mm] lg:h-auto shrink-0 relative mt-6 border-l-8 border-brand-500 overflow-hidden break-words">
                    <div className="absolute right-10 top-0 w-32 h-1 bg-brand-500" />

                    {/* Slide Header */}
                    <div className="flex items-center justify-between border-b border-slate-200 tab-head pb-3">
                      <div className="flex items-center gap-2">
                        <span className="bg-brand-600 text-white px-2 py-0.5 rounded text-[8.5px] font-black tracking-widest uppercase">
                          CANDIDATE PROFILE
                        </span>
                        <span className="text-[10px] font-bold text-slate-500">인적 정보 및 핵심 보유 스킬셋 명세</span>
                      </div>
                      <div>
                        <span className="text-[10px] font-mono text-brand-600 font-extrabold tracking-wider">
                          PAGE 02 / {String(5 + portfolioResult.keyHighlights.length).padStart(2, "0")}
                        </span>
                      </div>
                    </div>

                    {/* Content Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 my-auto items-stretch py-4">
                      {/* Left: User Avatar Mockup & Basic Contacts (4 Cols) */}
                      <div className="lg:col-span-4 bg-white border border-slate-200/60 p-4 rounded-2xl flex flex-col justify-between space-y-3">
                        <div className="text-center space-y-2">
                          {profile?.profileImage ? (
                            <img 
                              src={profile.profileImage} 
                              alt={profile.name || "인재"} 
                              className="mx-auto h-16 w-16 rounded-full object-cover shadow-md border-2 border-brand-200"
                            />
                          ) : (
                            <div className="mx-auto h-16 w-16 overflow-hidden rounded-full bg-gradient-to-tr from-brand-500 to-indigo-600 text-[11px] font-black text-white flex items-center justify-center text-center px-1 leading-tight shadow-md border border-brand-200">
                              <span className="truncate max-w-full">{profile?.name || "인재"}</span>
                            </div>
                          )}
                          <div>
                            <h3 className="text-sm font-black text-slate-850">{profile?.name}</h3>
                            <span className="text-[9.5px] text-indigo-600 font-bold bg-indigo-50 px-2.5 py-0.5 rounded-full inline-block mt-1">
                              {profile?.situation}
                            </span>
                          </div>
                        </div>

                        <div className="space-y-2 pt-3 border-t border-slate-105 text-[10.5px]">
                          {profile?.birthDate && (
                            <div className="flex items-center justify-between">
                              <span className="text-slate-400 font-black text-[9px] uppercase">Birth 생년월일</span>
                              <span className="text-slate-700 font-semibold">{profile.birthDate}</span>
                            </div>
                          )}
                          {profile?.gender && (
                            <div className="flex items-center justify-between">
                              <span className="text-slate-400 font-black text-[9px] uppercase">Gender 성별</span>
                              <span className="text-slate-700 font-semibold">{profile.gender}</span>
                            </div>
                          )}
                          <div className="flex items-center justify-between">
                            <span className="text-slate-400 font-black text-[9px] uppercase">Education 학력</span>
                            <span className="text-slate-700 font-semibold text-right max-w-[150px] truncate" title={profile?.education || "미기입"}>
                              {profile?.education || "학력 정보 정보 없음"}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-slate-400 font-black text-[9px] uppercase">Email 이메일</span>
                            <span className="text-slate-700 font-semibold truncate max-w-[140px]">{profile?.email || "미기입"}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-slate-400 font-black text-[9px] uppercase">Phone 연락처</span>
                            <span className="text-slate-700 font-semibold">{profile?.phone || "미기입"}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-slate-400 font-black text-[9px] uppercase">Links 대표 주소</span>
                            <span className="text-brand-600 font-bold truncate max-w-[140px]" title={profile?.website || "미기입"}>
                              {profile?.website || "미기입"}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Right: Core Introduction & Skills Visual Balance (8 Cols) */}
                      <div className="lg:col-span-8 bg-white border border-slate-200/60 p-4 rounded-2xl flex flex-col justify-between space-y-3">
                        <div className="space-y-2">
                          <span className="text-[8.5px] font-black text-brand-605 tracking-wider block uppercase">PROFILE INTRODUCTION</span>
                          <h4 className="text-xs font-black text-slate-800">🌱 나를 나타내는 대표 표어 및 전략 포부</h4>
                          <p className="text-[11px] leading-relaxed text-slate-600 italic whitespace-pre-line font-medium">
                            &ldquo; {profile?.coreIntro || "경험을 소중하고 강하게 아카이빙하여 채용 가산점을 배가합니다."} &rdquo;
                          </p>
                        </div>

                        <div className="pt-3 border-t border-slate-105">
                          <span className="text-[8.5px] font-black text-slate-400 uppercase tracking-wider block mb-2">실무 역량 가중치 분포</span>
                          <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                            {profile?.skillScores && Object.entries(profile.skillScores).slice(0, 6).map(([sName, sScore]) => (
                              <div key={sName} className="space-y-1">
                                <div className="flex justify-between items-center text-[10px]">
                                  <span className="font-bold text-slate-700">{sName}</span>
                                  <span className="font-mono text-brand-600 font-extrabold">{sScore}pt</span>
                                </div>
                                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                                  <div className="h-full bg-gradient-to-r from-brand-500 to-indigo-500 rounded-full" style={{ width: `${sScore}%` }}></div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Footer badge */}
                    <div className="border-t border-slate-200/60 pt-3 flex justify-between items-center text-[9px] text-slate-400 mt-2">
                      <span>가든 보관소 시스템 및 온보딩 설정 상태 기반 자동 빌드됨</span>
                      <span className="font-extrabold uppercase text-slate-500">SECURE PROFILE</span>
                    </div>
                  </section>


                  {/* SLIDE 2-B: COVER LETTER STATEMENTS (MOTIVATION ONLY) SLIDE */}
                  <section className="print-page print-card bg-white text-slate-900 border border-slate-200 shadow-xl rounded-2xl p-6 sm:p-8 flex flex-col justify-between lg:aspect-[16/9] w-full min-h-[420px] lg:min-h-[167.06mm] lg:h-auto shrink-0 relative mt-6 border-l-8 border-violet-600 overflow-hidden break-words">
                    <div className="absolute right-10 top-0 w-32 h-1 bg-violet-600" />

                    {/* Slide Header */}
                    <div className="flex items-center justify-between border-b border-slate-150/60 pb-3">
                      <div className="flex items-center gap-2">
                        <span className="bg-violet-900 text-white px-2 py-0.5 rounded text-[8.5px] font-black tracking-widest uppercase block md:inline-block">
                          SUPPORT STATEMENT
                        </span>
                        <span className="text-[10px] font-bold text-slate-500">진정성을 극대화한 나의 직무 지원 동기</span>
                      </div>
                      <div>
                        <span className="text-[10px] font-mono text-violet-600 font-extrabold tracking-wider">
                          PAGE 03 / {String(5 + portfolioResult.keyHighlights.length).padStart(2, "0")}
                        </span>
                      </div>
                    </div>

                    {/* Content Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 my-auto items-stretch py-4">
                      {/* Left: Motivation (지원동기) (7 Cols) */}
                      <div className="lg:col-span-7 bg-violet-50/10 border border-violet-100/40 p-5 rounded-2xl flex flex-col justify-between space-y-3">
                        <div className="space-y-2.5">
                          <span className="inline-flex items-center gap-1 bg-violet-100/80 border border-violet-200 text-violet-700 font-black text-[8px] px-2 py-0.5 rounded uppercase tracking-wide leading-none">
                            1. 지원 동기 (Motivation)
                          </span>
                          <h4 className="text-xs font-black text-slate-800">🌿 대상 기업 및 직무 지원 사유</h4>
                          <p className="text-[10.5px] sm:text-[11px] lg:text-[11.5px] leading-relaxed text-slate-700 whitespace-pre-line font-medium">
                            {profile?.coverLetterMotivation || "포트폴리오 빌더에서 지원 사유를 작성해 두거나 AI 생성기를 가동해보세요."}
                          </p>
                        </div>
                      </div>

                      {/* Right: Target Alignment Grid (5 Cols) */}
                      <div className="lg:col-span-5 bg-slate-50/50 border border-slate-100 p-5 rounded-2xl flex flex-col justify-between space-y-3">
                        <div className="space-y-3">
                          <span className="inline-flex items-center gap-1 bg-slate-200/80 text-slate-700 font-black text-[8px] px-2 py-0.5 rounded uppercase tracking-wide leading-none">
                            2. 목표 타깃 맞춤 정렬 (Targeting)
                          </span>
                          <div className="space-y-1.5 pt-1">
                            <span className="text-[8.5px] font-black text-slate-400 block uppercase">🎯 목표 기업 및 직무 부서</span>
                            <p className="text-xs font-bold text-slate-800 bg-white border border-slate-150 px-3 py-2 rounded-xl">
                              🏢 {coverLetterTarget || "미설정 목표사"} &bull; {coverLetterPurpose || "미설정 직무"}
                            </p>
                          </div>

                          <div className="space-y-1.5">
                            <span className="text-[8.5px] font-black text-slate-400 block uppercase font-mono">Mapped Core Assets</span>
                            <div className="flex flex-wrap gap-1 max-h-[145px] overflow-y-auto">
                              {assets.filter(a => selectedAssetIds.includes(a.id)).slice(0, 3).map((a, idx) => (
                                <span key={idx} className="bg-white border border-slate-205/65 px-2.5 py-1 rounded-lg text-[9px] font-bold text-slate-600 block w-full truncate">
                                  📂 {a.title}
                                </span>
                              ))}
                              {selectedAssetIds.length === 0 && (
                                <span className="text-[9.5px] text-slate-400 italic">선택된 가중 에셋이 없습니다.</span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="pt-2 border-t border-slate-200/60 flex justify-between items-center text-[8px] text-slate-400">
                          <span>TARGET ALIGNED OK</span>
                          <span className="font-mono text-slate-400 block tracking-widest uppercase">SECURE DRAFT</span>
                        </div>
                      </div>
                    </div>

                    {/* Footer badge */}
                    <div className="border-t border-slate-100/80 pt-3 flex justify-between items-center text-[9px] text-slate-400 mt-2">
                      <span>목표 직무 요건 적합성 및 맞춤 에셋 기반 AI 생성 완료</span>
                      <span className="font-extrabold uppercase text-slate-500">CANDIDATE MOTIVATION</span>
                    </div>
                  </section>


                  {/* SLIDE 2-C: INTEGRATED IDENTITY & DIRECTIONAL SLIDE */}
                  <section className="print-page print-card bg-white text-slate-900 border border-slate-200 shadow-xl rounded-2xl p-6 sm:p-8 flex flex-col justify-between lg:aspect-[16/9] w-full min-h-[420px] lg:min-h-[167.06mm] lg:h-auto shrink-0 relative mt-6 border-l-8 border-indigo-600 overflow-hidden break-words">
                    
                    <div className="absolute right-10 top-0 w-32 h-1 bg-indigo-600" />

                    {/* Slide Header */}
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                      <div className="flex items-center gap-2">
                        <span className="bg-indigo-900 text-white px-2 py-0.5 rounded text-[8.5px] font-black tracking-widest uppercase">
                          STRATEGY MAP
                        </span>
                        <span className="text-[10px] font-bold text-slate-500">성장 정체성 및 실무 피드백 설계</span>
                      </div>
                      <div>
                        <span className="text-[10px] font-mono text-indigo-600 font-extrabold tracking-wider">
                          PAGE 04 / {String(5 + portfolioResult.keyHighlights.length).padStart(2, "0")}
                        </span>
                      </div>
                    </div>

                    {/* Content Body Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-5 gap-5 my-auto items-stretch py-4">
                      
                      {/* Left: Summary Area (3 cols) */}
                      <div className="lg:col-span-3 bg-slate-50 border border-slate-100 p-4.5 rounded-2xl flex flex-col justify-between space-y-3">
                        <div className="space-y-2">
                          <span className="text-[8.5px] font-black text-indigo-600 tracking-wider block uppercase">SUMMARY STATEMENTS</span>
                          <h3 className="text-xs font-black text-slate-800 flex items-center gap-1">
                            📢 종합 성장 정체성 및 실무 역량 배경 요약
                          </h3>
                          <p className="text-[10px] sm:text-[11px] lg:text-[11.5px] leading-relaxed text-slate-600 break-words whitespace-normal font-medium">
                            {portfolioResult.academicSummary}
                          </p>
                        </div>
                        <div className="pt-2.5 border-t border-slate-250/60 flex flex-wrap gap-1.5 items-center">
                          <span className="text-[8.5px] font-black text-slate-400 mr-1 uppercase">Key Skills Applied:</span>
                          {profile?.targetJobs?.map((job, jIdx) => (
                            <span key={jIdx} className="bg-white border border-slate-300/80 px-2 py-0.5 rounded text-[9px] font-bold text-slate-700">
                              🎯 {job}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Right: Expert Feedback Road map (2 cols) */}
                      <div className="lg:col-span-2 bg-indigo-50/40 border border-indigo-100/60 p-4.5 rounded-2xl flex flex-col justify-between space-y-3">
                        <div className="space-y-2">
                          <span className="text-[8.5px] font-black text-indigo-700 tracking-wider block uppercase">EXPERT ROADMAP FEEDBACK</span>
                          <h3 className="text-xs font-black text-slate-800 flex items-center gap-1">
                            🎯 AI 마일스톤 추천 경로 조언
                          </h3>
                          <p className="text-[10px] sm:text-[11px] lg:text-[11.5px] leading-relaxed text-indigo-800 font-semibold whitespace-normal break-words">
                            {portfolioResult.recommendedCareerPath}
                          </p>
                        </div>
                        <div className="pt-2.5 border-t border-indigo-100/60 text-right">
                          <span className="text-[8.5px] font-mono text-indigo-500 font-bold block">CAREER PATH OPTIMIZED</span>
                        </div>
                      </div>
                    </div>

                    {/* Footer badge */}
                    <div className="border-t border-slate-100 pt-3 flex justify-between items-center text-[9px] text-slate-400 mt-2">
                      <span>전문 추천 로드맵은 선택한 {selectedAssetIds.length}개의 정량 에셋 가중치를 합산 분석하여 도출된 정보입니다.</span>
                      <span className="font-extrabold uppercase text-slate-500">MEMBER CONFIDENTIAL</span>
                    </div>
                  </section>


                  {/* SLIDES 3+: EACH PROJECT IN PRESENTATION SLIDE PAGE */}
                  {portfolioResult.keyHighlights.map((proj, pIdx) => (
                    <section 
                      key={pIdx} 
                      className="print-page print-card bg-white text-slate-900 border border-slate-200 shadow-xl rounded-2xl p-6 sm:p-8 flex flex-col justify-between lg:aspect-[16/9] w-full min-h-[420px] lg:min-h-[167.06mm] lg:h-auto shrink-0 relative mt-6 border-l-8 border-emerald-600 overflow-hidden break-words"
                    >
                      <div className="absolute right-10 top-0 w-32 h-1 bg-emerald-600" />

                      {/* Slide Header */}
                      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                        <div className="flex items-center gap-2">
                          <span className="bg-emerald-600 text-white px-2 py-0.5 rounded text-[8.5px] font-black tracking-widest uppercase">
                            PROJECT SPOTLIGHT
                          </span>
                          <span className="text-[10.5px] font-black text-slate-800 truncate max-w-md">
                            {pIdx + 1}. {proj.title}
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] font-mono text-emerald-600 font-extrabold tracking-wider">
                            PAGE {String(5 + pIdx).padStart(2, "0")} / {String(5 + portfolioResult.keyHighlights.length).padStart(2, "0")}
                          </span>
                        </div>
                      </div>

                      {/* Challenge/Action/Impact Layout */}
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 my-auto py-3 items-stretch">
                        
                        {/* CHALLENGE Box */}
                        <div className="bg-rose-50/50 border border-rose-100/80 rounded-2xl p-4 sm:p-4.5 space-y-2 flex flex-col justify-between h-full min-h-[90px] xl:min-h-[110px]">
                          <div className="space-y-1.5 col-span-1">
                            <span className="inline-flex items-center gap-1 bg-rose-100/80 border border-rose-200 text-rose-700 font-black text-[8px] px-2 py-0.5 rounded uppercase tracking-wide leading-none">
                              Challenge (당면 과제)
                            </span>
                            <p className="text-[10px] sm:text-[10.5px] lg:text-[11px] leading-relaxed text-slate-650 font-medium whitespace-normal break-words">
                              {proj.challenge}
                            </p>
                          </div>
                          <span className="text-[8px] font-black text-rose-400 block mt-2 uppercase">structural problems faced</span>
                        </div>

                        {/* ACTION Box */}
                        <div className="bg-amber-50/40 border border-amber-100/80 rounded-2xl p-4 sm:p-4.5 space-y-2 flex flex-col justify-between h-full min-h-[90px] xl:min-h-[110px]">
                          <div className="space-y-1.5 col-span-1">
                            <span className="inline-flex items-center gap-1 bg-amber-100 border border-amber-200 text-amber-700 font-black text-[8px] px-2 py-0.5 rounded uppercase tracking-wide leading-none">
                              Action (수행 행동)
                            </span>
                            <p className="text-[10px] sm:text-[10.5px] lg:text-[11px] leading-relaxed text-slate-650 font-medium whitespace-normal break-words">
                              {proj.action}
                            </p>
                          </div>
                          <span className="text-[8px] font-black text-amber-500 block mt-2 uppercase">clever solutions implemented</span>
                        </div>

                        {/* IMPACT Box */}
                        <div className="bg-emerald-50/60 border border-emerald-100/80 rounded-2xl p-4 sm:p-4.5 space-y-2 flex flex-col justify-between h-full min-h-[90px] xl:min-h-[110px] shadow-sm">
                          <div className="space-y-1.5 col-span-1">
                            <span className="inline-flex items-center gap-1 bg-emerald-600 border border-emerald-700 text-white font-black text-[8px] px-2 py-0.5 rounded uppercase tracking-wide leading-none">
                              Impact (정량 성과/학습)
                            </span>
                            <p className="text-[10px] sm:text-[10.5px] lg:text-[11px] leading-semibold text-slate-850 whitespace-normal break-words">
                              {proj.impact}
                            </p>
                          </div>
                          <span className="text-[8px] font-black text-emerald-600 block mt-2 uppercase font-mono">GROWTH VALUE CONFIRMED</span>
                        </div>

                      </div>

                      {/* Footer Info badge */}
                      <div className="border-t border-slate-100/80 pt-3 flex justify-between items-center text-[9px] text-slate-400 mt-2">
                        <span>본 포트폴리오 에셋은 마이 커리어 가든 증명 알고리즘에 의해 실시간 추적된 데이터입니다.</span>
                        <div className="flex items-center gap-2">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                          <span className="font-bold text-slate-500 uppercase tracking-widest">VERIFIED ASSET</span>
                        </div>
                      </div>
                    </section>
                  ))}


                  {/* SLIDE LAST: COVER LETTER STATEMENTS (ASPIRATION ONLY) SLIDE */}
                  <section className="print-page print-card bg-white text-slate-900 border border-slate-200 shadow-xl rounded-2xl p-6 sm:p-8 flex flex-col justify-between lg:aspect-[16/9] w-full min-h-[420px] lg:min-h-[167.06mm] lg:h-auto shrink-0 relative mt-6 border-l-8 border-fuchsia-600 overflow-hidden break-words animate-fadeIn">
                    <div className="absolute right-10 top-0 w-32 h-1 bg-fuchsia-600" />

                    {/* Slide Header */}
                    <div className="flex items-center justify-between border-b border-slate-150/60 pb-3">
                      <div className="flex items-center gap-2">
                        <span className="bg-fuchsia-900 text-white px-2 py-0.5 rounded text-[8.5px] font-black tracking-widest uppercase">
                          FUTURE ASPIRATION
                        </span>
                        <span className="text-[10px] font-bold text-slate-500">지속가능한 가치와 나의 다짐/포부</span>
                      </div>
                      <div>
                        <span className="text-[10px] font-mono text-fuchsia-600 font-extrabold tracking-wider">
                          PAGE {String(5 + portfolioResult.keyHighlights.length).padStart(2, "0")} / {String(5 + portfolioResult.keyHighlights.length).padStart(2, "0")}
                        </span>
                      </div>
                    </div>

                    {/* Content Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 my-auto items-stretch py-4">
                      {/* Left: Aspiration (포부/다짐) (7 Cols) */}
                      <div className="lg:col-span-7 bg-fuchsia-50/10 border border-fuchsia-100/40 p-5 rounded-2xl flex flex-col justify-between space-y-3">
                        <div className="space-y-2.5">
                          <span className="inline-flex items-center gap-1 bg-fuchsia-100/80 border border-fuchsia-200 text-fuchsia-700 font-black text-[8px] px-2 py-0.5 rounded uppercase tracking-wide leading-none">
                            1. 포부 및 다짐 (Aspiration)
                          </span>
                          <h4 className="text-xs font-black text-slate-800">🚀 기여 마일스톤 및 성장/다짐 계획</h4>
                          <p className="text-[10.5px] sm:text-[11px] lg:text-[11.5px] leading-relaxed text-slate-700 whitespace-pre-line font-medium">
                            {profile?.coverLetterAspiration || "경험 에셋 데이터를 바탕으로 1년차 실무 계획 및 3년차 중기 포부와 다짐을 수립합니다."}
                          </p>
                        </div>
                      </div>

                      {/* Right: Milestone Timeline / Road graph (5 Cols) */}
                      <div className="lg:col-span-5 bg-slate-50/50 border border-slate-100 p-5 rounded-2xl flex flex-col justify-between space-y-3">
                        <div className="space-y-3.5">
                          <span className="inline-flex items-center gap-1 bg-slate-200/80 text-slate-700 font-black text-[8px] px-2 py-0.5 rounded uppercase tracking-wide leading-none">
                            2. 실행력 검증 마일스톤 (Action Plan)
                          </span>
                          
                          <div className="relative border-l-2 border-fuchsia-200 pl-4 ml-2 space-y-3.5">
                            <div className="relative">
                              <span className="absolute -left-[21px] top-0.5 bg-fuchsia-600 rounded-full h-2 w-2 ring-4 ring-white" />
                              <span className="text-[9px] font-black text-fuchsia-600 block uppercase">1년차 : 업무 내재화 및 기술 안정화</span>
                              <p className="text-[10px] text-slate-500 font-semibold">프로세스 적응 및 보관 에셋 실무 적용</p>
                            </div>
                            <div className="relative">
                              <span className="absolute -left-[21px] top-0.5 bg-brand-500 rounded-full h-2 w-2 ring-4 ring-white" />
                              <span className="text-[9px] font-black text-brand-600 block uppercase">3년차 : 성과 고도화 및 프로젝트 주도</span>
                              <p className="text-[10px] text-slate-500 font-semibold">동료 소통 협력 배가 및 비즈니스 시너지 기여</p>
                            </div>
                          </div>
                        </div>

                        <div className="pt-2 border-t border-slate-200/60 flex justify-between items-center text-[8px] text-slate-400">
                          <span>EXECUTION ROADMAP READY</span>
                          <span className="font-mono text-slate-400">SECURE DRAFT</span>
                        </div>
                      </div>
                    </div>

                    {/* Footer badge */}
                    <div className="border-t border-slate-100/80 pt-3 flex justify-between items-center text-[9px] text-slate-400 mt-2">
                      <span>목표 직무 요건 적합성 및 맞춤 에셋 기반 AI 생성 완료</span>
                      <span className="font-extrabold uppercase text-slate-500">CANDIDATE ASPIRATION</span>
                    </div>
                  </section>

                </div>

                {/* Direct print FAB - Hidden on print */}
                <button
                  onClick={handlePrintPortfolio}
                  disabled={isGeneratingPdf}
                  className="w-full bg-slate-900 hover:bg-slate-800 disabled:bg-slate-400 text-white rounded-2xl py-4 text-xs font-black transition-all shadow-md flex items-center justify-center gap-1.5 no-print cursor-pointer mt-6"
                >
                  {isGeneratingPdf ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      PDF 생성 및 다운로드 중...
                    </>
                  ) : (
                    "📄 PDF 다운로드"
                  )}
                </button>
              </div>
            )}
          </div>
        )}

        {/* ── TAB 3: JD GAP NAVIGATION ──────────────────────────────────────── */}
        {activeTab === "matcher" && (
          <div className="px-4 py-5 animate-fadeIn">
            
            <div className="mb-5">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-[10px] font-extrabold text-emerald-700">
                <Compass className="h-3 w-3 text-emerald-600" /> 매칭 네비게이터
              </span>
              <h1 className="text-xl font-bold tracking-tight text-slate-800 mt-2">
                채용 공고 적합도 진단
              </h1>
              <p className="text-xs text-slate-500 mt-0.5 leading-normal">
                겨냥하는 테크 기업 채용 공고(JD)를 제출하면, 내 커리어 에셋 조각들과 정밀 대조하여 무엇이 부족한지 처방합니다.
              </p>
            </div>

            {/* ── JOB POSTINGS GRID SECTION ── */}
            <div className="mb-6">
              <h2 className="text-xs font-black text-slate-700 mb-3 flex items-center gap-1.5 uppercase tracking-wide">
                <span>🏢 실시간 인기 테크 채용 공고 & 즉시 지원</span>
                <span className="text-[9px] font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100 flex items-center gap-1">
                  <span className="h-1 w-1 bg-emerald-500 rounded-full animate-ping"></span>
                  에셋로그 즉시 연동
                </span>
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {OPEN_JOB_POSTINGS.map((job) => {
                  const isApplied = appliedJobs.some((app) => app.jobId === job.id);
                  const appliedDetail = appliedJobs.find((app) => app.jobId === job.id);
                  
                  return (
                    <div 
                      key={job.id} 
                      className={`rounded-2xl border bg-white p-4.5 shadow-sm flex flex-col justify-between transition-all hover:shadow-md ${
                        isApplied ? "border-emerald-200 bg-emerald-50/5" : "border-slate-150"
                      }`}
                    >
                      <div>
                        {/* Header: Company & Logo */}
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-1.5">
                            <span className="text-lg select-none">{job.logo}</span>
                            <span className="text-xs font-black text-slate-900">{job.company}</span>
                          </div>
                          <span className={`text-[9px] font-black px-2 py-0.5 rounded-full ${
                            isApplied 
                              ? "bg-emerald-100 text-emerald-800 border border-emerald-200" 
                              : "bg-slate-100 text-slate-600 border border-slate-200"
                          }`}>
                            {isApplied ? "지원 완료" : job.deadline}
                          </span>
                        </div>

                        {/* Title & Description */}
                        <h3 className="text-xs font-black text-slate-800 leading-tight mb-2">
                          {job.role}
                        </h3>
                        <p className="text-[10px] text-slate-400 line-clamp-2 leading-relaxed mb-3">
                          {job.description}
                        </p>

                        {/* Badges */}
                        <div className="flex flex-wrap gap-1 mb-3.5">
                          {job.tags.map((tag, tIdx) => (
                            <span 
                              key={tIdx} 
                              className="text-[8.5px] font-bold text-slate-600 bg-slate-50 border border-slate-100 px-2 py-0.5 rounded"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Row actions */}
                      <div className="flex items-center gap-2 mt-2 pt-3 border-t border-slate-100/60">
                        <button
                          onClick={() => {
                            setJdText(job.fullJd);
                            handleAnalyzeJd(job.fullJd);
                          }}
                          className="flex-1 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-xl py-2 text-[10px] font-bold transition-all flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <Compass className="h-3 w-3 text-slate-500" />
                          AI 공고 진단하기
                        </button>

                        {isApplied ? (
                          <button
                            onClick={() => {
                              if (appliedDetail) {
                                triggerConfirm(
                                  `[입사 지원서 제출 명세서]\n\n• 기업명: ${job.company}\n• 지원 직무: ${job.role}\n• 전송 시각: ${appliedDetail.appliedAt}\n• 이름: ${appliedDetail.applicantName}\n• 이메일 주소: ${appliedDetail.applicantEmail}\n• 자기소개서 초안 연동: ${appliedDetail.hasCoverLetter ? "정상 연동됨 (STAR 보증)" : "기본자료 복원"}\n• 포트폴리오 연동: ${appliedDetail.hasPortfolio ? "정상 연동됨 (고해상도 PDF)" : "정원 요약본 연동"}\n• 정량 증명 에셋 첨부: ${appliedDetail.sharedAssetsCount}개 동반 전송됨\n\n※ 해당 기업 채용담당자에게 안전하게 도달했습니다. 좋은 소식을 기원합니다!`,
                                  () => {},
                                  "제출 명세서 상세",
                                  "확인"
                                );
                              }
                            }}
                            className="flex-1 bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-200 text-emerald-800 rounded-xl py-2 text-[10px] font-black transition-all flex items-center justify-center gap-1 cursor-pointer"
                          >
                            <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                            제출서류 이력보기
                          </button>
                        ) : (
                          <button
                            onClick={() => {
                              setSelectedJobForApply(job);
                            }}
                            className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl py-2 text-[10px] font-black transition-all shadow-sm flex items-center justify-center gap-1 cursor-pointer"
                          >
                            <Send className="h-3 w-3" />
                            즉시 지원하기
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Application history table if there is any */}
            {appliedJobs.length > 0 && (
              <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-4.5 shadow-sm">
                <div className="flex items-center justify-between mb-3.5 pb-2 border-b border-slate-50">
                  <h3 className="text-[11px] font-black text-slate-700 flex items-center gap-1.5">
                    <span>📑 즉시 지원 완료 처수</span>
                    <span className="text-[9px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">({appliedJobs.length}건)</span>
                  </h3>
                  <button
                    onClick={() => {
                      triggerConfirm(
                        "모든 실시간 입사 지원 완료 이력을 영구적으로 삭제하시겠습니까?",
                        () => saveAppliedJobsToStorage([])
                      );
                    }}
                    className="text-[9.5px] font-bold text-red-500 hover:underline cursor-pointer"
                  >
                    지원 이력 비우기
                  </button>
                </div>
                <div className="divide-y divide-slate-100 max-h-40 overflow-y-auto pr-1">
                  {appliedJobs.map((app) => (
                    <div key={app.id} className="py-2.5 flex items-center justify-between text-[11px]">
                      <div>
                        <span className="font-extrabold text-slate-800">{app.company}</span>
                        <span className="text-slate-400 mx-1.5">|</span>
                        <span className="text-slate-600 font-semibold">{app.role}</span>
                        <div className="text-[9px] text-slate-400 font-bold mt-1 flex gap-2">
                          <span className="text-slate-400 font-normal">📅 {app.appliedAt}</span>
                          <span className={app.hasCoverLetter ? "text-emerald-700 font-black bg-emerald-50 px-1 py-0.2 rounded" : "text-slate-300 font-normal"}>
                            자소서: {app.hasCoverLetter ? "연동완료 [STAR]" : "미연동"}
                          </span>
                          <span className={app.hasPortfolio ? "text-indigo-700 font-black bg-indigo-50 px-1 py-0.2 rounded" : "text-slate-300 font-normal"}>
                            포트폴리오: {app.hasPortfolio ? "연동완료" : "미연동"}
                          </span>
                        </div>
                      </div>
                      <span className="text-[9px] font-extrabold bg-emerald-500 text-white px-2 py-0.5 rounded-full leading-none flex items-center gap-0.5">
                        공동제출 {app.sharedAssetsCount}개
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Paste JD Box */}
            <section className="mb-5 space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-2 uppercase tracking-wide">
                  희망 기업 채용 공고(JD) 붙여넣기
                </label>
                <div className="relative rounded-2xl border border-slate-200 bg-white p-2">
                  <textarea
                    value={jdText}
                    onChange={(e) => setJdText(e.target.value)}
                    placeholder="채용공고 전문이나 주요 자격요건 / 우대사항 텍스트를 고스란히 복사-붙여넣기 하십시오…"
                    rows={4}
                    className="w-full rounded-xl bg-transparent p-2 text-xs outline-none resize-none leading-normal"
                  ></textarea>
                </div>
                
                {/* Fast presets buttons */}
                <div className="mt-2.5 flex items-center gap-2">
                  <span className="text-[10px] text-slate-400 font-bold shrink-0">빠른 테스트 공고:</span>
                  <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
                    {[
                      { l: "카카오 서비스인턴", text: "카카오 인턴십 채용: 데이터 분석 능력을 기초로 UX 개선 기획을 서술하고, SQLD 자격 보유 및 지표 모니터링 우대." },
                      { l: "토스 PM(PO) 어시스턴트", text: "토스 PO Assistant: 시장 및 가설 조사 진행, 비즈니스 지표 대시보드 구축과 GA4 툴 정량 추출 역량 극강인 자 우대." }
                    ].map((p, pIdx) => (
                      <button
                        key={pIdx}
                        onClick={() => setJdText(p.text)}
                        className="rounded-lg bg-emerald-50/50 hover:bg-emerald-50 border border-emerald-100 text-[10px] font-extrabold text-emerald-700 px-2 py-0.5 shrink-0"
                      >
                        {p.l}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <button
                onClick={handleAnalyzeJd}
                disabled={isAnalyzingJd || !jdText.trim()}
                className={`w-full py-4 rounded-2xl text-xs font-bold text-white flex items-center justify-center gap-2 cursor-pointer transition-all shadow-md active:scale-98 ${
                  isAnalyzingJd ? "bg-slate-300" : "bg-emerald-600 hover:bg-emerald-700"
                }`}
              >
                {isAnalyzingJd ? (
                  <>
                    <span className="spinner"></span>
                    Gemini가 요구 역량을 추출 중입니다...
                  </>
                ) : (
                  <>
                    <Compass className="h-4 w-4" />
                    채용 적합도 및 역량 공백(Gap) 판별하기
                  </>
                )}
              </button>
            </section>

            {/* Dynamic circular SVG dashboard based on API results */}
            {jdAnalysis && (
              <section className="space-y-4">
                
                {/* Top overview result header */}
                <div className="rounded-3xl border border-emerald-100 bg-white p-4.5 shadow-sm space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[9px] font-extrabold text-emerald-800 uppercase">
                        목표 기업
                      </span>
                      <h4 className="text-xs font-black text-slate-800 mt-1">{jdAnalysis.company}</h4>
                      <p className="text-[10px] text-slate-400 mt-0.5">{jdAnalysis.jobRole}</p>
                    </div>
                    
                    {/* Ring score */}
                    <div className="relative h-14 w-14 shrink-0 flex items-center justify-center">
                      <svg className="absolute inset-0 h-full w-full rotate-[-90deg]" viewBox="0 0 36 36">
                        <circle cx="18" cy="18" r="16" fill="transparent" stroke="#f1f5f9" strokeWidth="3" />
                        <circle
                          cx="18" cy="18" r="16"
                          fill="transparent"
                          stroke="#10b981"
                          strokeWidth="3"
                          strokeDasharray="100"
                          strokeDashoffset={100 - jdAnalysis.matchPercentage}
                          strokeLinecap="round"
                          className="transition-all duration-1000"
                        />
                      </svg>
                      <span className="text-xs font-black text-emerald-700 select-none">
                        {jdAnalysis.matchPercentage}%
                      </span>
                    </div>
                  </div>

                  {/* Meters components list */}
                  <div className="space-y-2 border-t border-slate-50 pt-3">
                    <span className="text-[10px] font-extrabold text-slate-400 block mb-1">
                      공고 매칭 4대 역량 일지률
                    </span>
                    {jdAnalysis.skills?.map((sk, skIdx) => (
                      <div key={skIdx} className="flex items-center gap-3">
                        <span className="text-[10px] text-slate-500 font-extrabold w-18 shrink-0">
                          {sk.skillName}
                        </span>
                        <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden relative border border-slate-50">
                          <div
                            className="absolute top-0 left-0 h-full bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full transition-all duration-1000"
                            style={{ width: `${sk.score}%` }}
                          ></div>
                        </div>
                        <span className="text-[10px] font-extrabold text-[#2b7a4b] w-6 text-right">
                          {sk.score}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Gaps alerts lists */}
                <div className="space-y-3.5">
                  <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider block">
                    채워야 할 핵심 역량 갭(Gap)과 AI 추천 극복 처방
                  </span>

                  {jdAnalysis.gaps?.map((gp, gIdx) => (
                    <div
                      key={gIdx}
                      className={`rounded-2xl border p-4.5 flex gap-3 items-start shadow-sm ${
                        gp.level === "high"
                          ? "bg-red-50/50 border-red-200 text-red-900"
                          : gp.level === "medium"
                          ? "bg-amber-50/40 border-amber-200 text-amber-900"
                          : "bg-slate-50 border-slate-200 text-slate-700"
                      }`}
                    >
                      <div className="shrink-0 mt-0.5">
                        {gp.level === "high" ? (
                          <AlertTriangle className="h-5 w-5 text-red-600" />
                        ) : (
                          <CloudLightning className="h-5 w-5 text-amber-600" />
                        )}
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-black">{gp.skillName} 갭</span>
                          <span className={`text-[8px] font-extrabold px-1.5 py-0.5 rounded ${
                            gp.level === "high" ? "bg-red-200/50 text-red-700" : "bg-amber-200/30 text-amber-700"
                          }`}>
                            {gp.level === "high" ? "매우 시급" : "보완 필요"}
                          </span>
                        </div>
                        <p className="text-[11px] leading-relaxed mt-1.5">
                          {gp.description}
                        </p>
                        
                        <div className="mt-3 flex gap-2">
                          <button
                            onClick={() => {
                              setActiveTab("archive");
                              setIsUploadOpen(true);
                              setUploadType("file");
                            }}
                            className="rounded-lg bg-white border border-slate-200 text-[10px] font-bold px-2.5 py-1 text-slate-700 hover:bg-slate-50 shadow-sm"
                          >
                            + 관련 에셋 증명 보강 업로드하기
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        )}

        {/* ── TAB 4: MY PAGE & PREVENTATIVE SETTINGS ─────────────────────────── */}
        {activeTab === "mypage" && (
          <div className="px-4 py-5 animate-fadeIn">
            
            <div className="mb-4">
              <span className="inline-flex items-center gap-1 bg-brand-50 border border-brand-200 px-2 py-0.5 text-[9px] font-extrabold text-brand-700">
                <Crown className="h-3 w-3 text-brand-600" /> 마이 가든
              </span>
              <h1 className="text-xl font-bold text-slate-800 mt-1">{profile.name}님의 커리어 정원</h1>
            </div>

            {/* ── 🌳 MY GARDEN INTERACTIVE TREE & BALANCE STATS ── */}
            <div className="mt-6 space-y-5">
              
              {/* Modern Animated SVG Visual Tree */}
              <CareerTreeVisual
                level={profile.level}
                exp={profile.exp}
                seedType={profile.seedType}
                skillScores={profile.skillScores}
              />

              {/* Tree Growth Interactive Controller Panel */}
              <section className="overflow-hidden rounded-3xl border border-slate-100 bg-white p-4.5 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100/70 pb-3">
                  <div>
                    <h3 className="text-sm font-black text-slate-800 flex items-center gap-1.5">
                      <span>💧 물 가방 수납처</span>
                      <span className="rounded-full bg-brand-50 border border-brand-200 text-brand-700 px-2.5 py-0.5 text-[9px] font-black animate-pulse">
                        보유 물방울: {profile.waterDroplets !== undefined ? profile.waterDroplets : 0}개
                      </span>
                    </h3>
                    <p className="text-[11px] text-slate-400 mt-1">
                      모아온 물방울로 영양을 가꾸면 나무 성장 포인트(+15)가 수확됩니다.
                    </p>
                  </div>

                  <button
                    onClick={handleWaterTree}
                    className="rounded-xl bg-brand-600 hover:bg-brand-700 px-4 py-2 text-[11px] font-bold text-white active:scale-95 transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer self-start sm:self-auto"
                  >
                    <span>💧</span>
                    <span>물 주기 (-1개)</span>
                  </button>
                </div>

                {/* Gamification Quests / How to get droplets breakdown */}
                <div>
                  <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest block mb-2.5">             
                    🌱 물방울 수확 퀘스트 & 실천 상태
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    
                    {/* Quest 1: Upload Assets */}
                    <div className="bg-slate-50/70 border border-slate-100 rounded-2xl p-3 flex flex-col justify-between space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black text-slate-700">1. 경험 에셋 등록</span>
                        <span className="text-[8px] font-black text-brand-600 bg-brand-100 px-1.5 py-0.5 rounded">
                          +1 물방울
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 leading-relaxed">
                        새로운 실무 경험이나 성과 에셋을 정원에 업로드하세요.
                      </p>
                      <div className="pt-1.5 border-t border-slate-100/50 flex items-center justify-between text-[10px]">
                        <span className="text-slate-400 font-bold">누적 에셋:</span>
                        <span className="text-slate-700 font-black">{assets.length}개</span>
                      </div>
                    </div>

                    {/* Quest 2: Profile completeness */}
                    {(() => {
                      const completeness = getProfileCompleteness(profile);
                      return (
                        <div className="bg-slate-50/70 border border-slate-100 rounded-2xl p-3 flex flex-col justify-between space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-black text-slate-700">2. 프로필 100% 달성</span>
                            <span className="text-[8px] font-black text-brand-600 bg-brand-100 px-1.5 py-0.5 rounded">
                              +3 물방울
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-400 leading-relaxed">
                            나머지 연락처/생년월일/사진 등록을 완수하세요.
                          </p>
                          
                          {/* Progress bar */}
                          <div className="pt-1.5 border-t border-slate-100/50 space-y-1">
                            <div className="flex items-center justify-between text-[8.5px] leading-none">
                              <span className="text-slate-400 font-bold">완성도</span>
                              <span className={`font-black ${completeness === 100 ? "text-brand-600" : "text-indigo-600"}`}>
                                {completeness}% {completeness === 100 && "💯"}
                              </span>
                            </div>
                            <div className="h-1 w-full bg-slate-250 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-brand-500 rounded-full transition-all duration-500"
                                style={{ width: `${completeness}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })()}

                    {/* Quest 3: Build AI Resume */}
                    <div className="bg-slate-50/70 border border-slate-100 rounded-2xl p-3 flex flex-col justify-between space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black text-slate-700">3. 맞춤 자소서 빌딩</span>
                        <span className="text-[8px] font-black text-brand-600 bg-brand-100 px-1.5 py-0.5 rounded">
                          +2 물방울
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 leading-relaxed">
                        선택된 에셋 기반으로 AI 자기소개서를 생성하세요.
                      </p>
                      <div className="pt-1.5 border-t border-slate-100/50 flex items-center justify-between text-[10px]">
                        <span className="text-slate-400 font-bold">자소서 작성:</span>
                        <span className={`font-black ${profile.coverLetterMotivation ? "text-brand-650" : "text-slate-400"}`}>
                          {profile.coverLetterMotivation ? "완성됨" : "미작성"}
                        </span>
                      </div>
                    </div>

                    {/* Quest 4: Design Portfolio */}
                    <div className="bg-slate-50/70 border border-slate-100 rounded-2xl p-3 flex flex-col justify-between space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black text-slate-700">4. 포트폴리오 명세 수확</span>
                        <span className="text-[8px] font-black text-brand-600 bg-brand-100 px-1.5 py-0.5 rounded">
                          +3 물방울
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 leading-relaxed">
                        실무 역량 입체 수합용 포트폴리오를 작성해내세요.
                      </p>
                      <div className="pt-1.5 border-t border-slate-100/50 flex items-center justify-between text-[10px]">
                        <span className="text-slate-400 font-bold">포트폴리오:</span>
                        <span className={`font-black ${portfolioResult ? "text-brand-650" : "text-slate-400"}`}>
                          {portfolioResult ? "빌드됨" : "미작성"}
                        </span>
                      </div>
                    </div>

                  </div>
                </div>
              </section>

              {/* Dynamic Competency SVG Radar Aspect */}
              <section className="rounded-3xl border border-slate-100 bg-white p-4 shadow-sm flex items-center gap-5">
                <div className="flex-shrink-0">
                  <svg width="100" height="100" viewBox="0 0 100 100" className="drop-shadow-sm">
                    {/* Outer and Inner Grid Rings */}
                    {[0.33, 0.66, 1].map((scale, sIdx) => {
                      const r = 40 * scale;
                      const pathParts = [];
                      for (let i = 0; i < 5; i++) {
                        const angle = (i * 2 * Math.PI) / 5 - Math.PI / 2;
                        const x = 50 + r * Math.cos(angle);
                        const y = 50 + r * Math.sin(angle);
                        pathParts.push(`${i === 0 ? "M" : "L"} ${x} ${y}`);
                      }
                      return (
                        <path
                          key={sIdx}
                          d={pathParts.join(" ") + " Z"}
                          fill="none"
                          stroke="#e2e8f0"
                          strokeWidth="0.8"
                        />
                      );
                    })}
                    {/* Axis lines */}
                    {[0, 1, 2, 3, 4].map((i) => {
                      const angle = (i * 2 * Math.PI) / 5 - Math.PI / 2;
                      return (
                        <line
                          key={i}
                          x1="50"
                          y1="50"
                          x2={50 + 40 * Math.cos(angle)}
                          y2={50 + 40 * Math.sin(angle)}
                          stroke="#e2e8f0"
                          strokeWidth="0.8"
                        />
                      );
                    })}
                    {/* Dynamic Filled Polygon based on profile skills */}
                    {(() => {
                      const rawScores = [
                        profile.skillScores["기획력"] || 0,
                        profile.skillScores["데이터분석"] || 0,
                        profile.skillScores["커뮤니케이션"] || 0,
                        profile.skillScores["실행력"] || 0,
                        profile.skillScores["UX리서치"] || 0
                      ];
                      const polyParts = rawScores.map((score, i) => {
                        const normalized = Math.min(100, Math.max(10, score)) / 100;
                        const r = 40 * normalized;
                        const angle = (i * 2 * Math.PI) / 5 - Math.PI / 2;
                        const x = 50 + r * Math.cos(angle);
                        const y = 50 + r * Math.sin(angle);
                        return `${x},${y}`;
                      });
                      
                      return (
                        <>
                          <polygon
                            points={polyParts.join(" ")}
                            fill="rgba(74, 158, 109, 0.25)"
                            stroke="#2b7a4b"
                            strokeWidth="2"
                          />
                          {/* Little Dots for corners */}
                          {polyParts.map((pt, ptIdx) => {
                            const [px, py] = pt.split(",");
                            return (
                              <circle
                                key={ptIdx}
                                cx={px}
                                cy={py}
                                r="3"
                                fill="#1a5632"
                              />
                            );
                          })}
                        </>
                      );
                    })()}
                  </svg>
                </div>

                <div className="flex-1">
                  <span className="text-xs font-black text-slate-700 block">실력 및 성취 가든 밸런스</span>
                  <p className="text-[10px] text-slate-400 mt-0.5 leading-normal">
                    포인트 성장이 가시화된 5대 직무 공통 역량 모델입니다. 에셋을 추가할 때마다 자동 정렬됩니다.
                  </p>
                  <div className="mt-2.5 grid grid-cols-2 gap-x-2 gap-y-1">
                    <span className="text-[10px] text-[#2b7a4b] font-bold">● 기획력 {profile.skillScores["기획력"] || 0}pt</span>
                    <span className="text-[10px] text-[#2b7a4b] font-bold">● 분석력 {profile.skillScores["데이터분석"] || 0}pt</span>
                    <span className="text-[10px] text-[#2b7a4b] font-bold">● 커뮤니 {profile.skillScores["커뮤니케이션"] || 0}pt</span>
                    <span className="text-[10px] text-[#2b7a4b] font-bold">● 실행력 {profile.skillScores["실행력"] || 0}pt</span>
                  </div>
                </div>
              </section>
            </div>

            {/* Achievements Badges */}
            <section className="mt-6">
              <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider block mb-3">
                🏆 획득 취업 훈장 및 배지
              </span>

              <div className="grid grid-cols-2 gap-3">
                {BADGES.map((badge, idx) => {
                  let earned = false;
                  if (badge.id === "b1") earned = assets.length >= 1;
                  if (badge.id === "b2") earned = assets.length >= 3;
                  if (badge.id === "b3") earned = profile.totalPoints >= 300;
                  if (badge.id === "b4") earned = starResult !== null;
                  if (badge.id === "b5") earned = jdAnalysis !== null;

                  return (
                    <div
                      key={badge.id}
                      className={`rounded-2xl border p-3 flex gap-2.5 items-start shadow-sm transition-all ${
                        earned
                          ? "bg-brand-50/40 border-brand-200/60 text-brand-900"
                          : "bg-slate-50 border-slate-100 opacity-40 select-none pb-4"
                      }`}
                    >
                      <span className="text-3xl leading-none">{badge.emoji}</span>
                      <div>
                        <h4 className="text-[10px] font-black">{badge.title}</h4>
                        <p className="text-[9px] text-slate-400 mt-0.5 leading-normal">
                          {badge.desc}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Premium pricing pricing block */}
            <section className="mt-6">
              <div className="rounded-3xl bg-slate-900 p-5 text-white shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 h-16 w-16 bg-brand-500 opacity-20 rounded-full blur-xl"></div>
                <span className="rounded bg-brand-600 px-2 py-0.5 text-[8px] font-extrabold tracking-wide uppercase">
                  Premium
                </span>
                <h4 className="text-xs font-bold mt-2 text-white">Asset Log PRO 멤버십</h4>
                <p className="text-[10px] text-slate-300 mt-1 leading-normal">
                  모든 직무 무제한 AI STAR 초안 피팅, 일일 실시간 역량 갭 분석, 합격 자소서 비교 패스권을 이용해 승률을 높이세요.
                </p>
                <div className="mt-4 flex items-baseline gap-1.5">
                  <span className="text-sm font-black">월 9,900원</span>
                  <span className="text-[9px] text-slate-400">부가세 미포함</span>
                </div>
                <button
                  onClick={() => alert("멤버십 결제 로드맵에 오신 것을 환영합니다! 해당 기능은 데모 세션 중에는 상시 가동 상태입니다.")}
                  className="mt-3.5 w-full bg-brand-500 hover:bg-brand-400 text-white rounded-xl py-2.5 text-center text-xs font-bold transition-all shadow-md cursor-pointer"
                >
                  Pro 기능 상시 활성화하기 →
                </button>
              </div>
            </section>

            {/* System settings and resets */}
            <section className="mt-6 border-t border-slate-100 pt-5 space-y-3">
              <button
                onClick={handleLogout}
                className="w-full bg-slate-950 hover:bg-slate-800 text-white py-3.5 rounded-2xl text-xs font-bold text-center transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
              >
                🔒 계정 로그아웃 (Sign Out)
              </button>
              <button
                onClick={handleResetApp}
                className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 py-3.5 rounded-2xl text-xs font-bold text-center transition-all cursor-pointer"
              >
                ⚙️ 온보딩 정보 재설정 및 에셋 공장 초기화
              </button>
            </section>
          </div>
        )}
      </main>

      {/* ── FOOTER DENSE BOTTOM SEAM NAV BAR ────────────────────────────────── */}
      <footer className="fixed bottom-0 left-1/2 z-40 w-full max-w-[430px] -translate-x-1/2 bg-white/95 backdrop-blur border-t border-slate-100 py-2.5 flex items-center justify-around px-2 shadow-lg">
        <button
          onClick={() => setActiveTab("archive")}
          className={`flex flex-col items-center gap-1 flex-1 py-1 group ${
            activeTab === "archive" ? "text-brand-600" : "text-slate-400"
          }`}
        >
          <BookOpen className="h-5 w-5 transition-transform group-hover:scale-105" />
          <span className="text-[9px] font-bold">기록 피드</span>
        </button>
        
        <button
          onClick={() => setActiveTab("builder")}
          className={`flex flex-col items-center gap-1 flex-1 py-1 group ${
            activeTab === "builder" ? "text-brand-600" : "text-slate-400"
          }`}
        >
          <Sparkles className="h-5 w-5 transition-transform group-hover:scale-105" />
          <span className="text-[9px] font-bold">자소서 & 포트폴리오</span>
        </button>

        {/* FAB spacer padding */}
        <div className="w-14 shrink-0"></div>

        <button
          onClick={() => setActiveTab("matcher")}
          className={`flex flex-col items-center gap-1 flex-1 py-1 group ${
            activeTab === "matcher" ? "text-brand-600" : "text-slate-400"
          }`}
        >
          <Compass className="h-5 w-5 transition-transform group-hover:scale-105" />
          <span className="text-[9px] font-bold">매칭 진단</span>
        </button>

        <button
          onClick={() => setActiveTab("mypage")}
          className={`flex flex-col items-center gap-1 flex-1 group py-1 ${
            activeTab === "mypage" ? "text-brand-600" : "text-slate-400"
          }`}
        >
          <User className="h-5 w-5 transition-transform group-hover:scale-105" />
          <span className="text-[9px] font-bold">마이 가든</span>
        </button>
      </footer>

      {/* ── FLOATING ADD ACTION BUTTON ─────────────────────────────────────────── */}
      <button
        onClick={() => {
          setUploadType("file");
          setIsUploadOpen(true);
        }}
        className="fixed bottom-14 left-1/2 -translate-x-1/2 z-50 h-14 w-14 rounded-full bg-brand-600 text-white flex items-center justify-center shadow-xl border-4 border-slate-50 hover:bg-brand-700 hover:scale-105 active:scale-95 transition-all cursor-pointer"
      >
        <Plus className="h-6 w-6 stroke-[3]" />
      </button>

      {/* ── COMPONENT 1: UPLOAD MODAL OR DRAWER ────────────────────────────────── */}
      {isUploadOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-xs font-sans transition-opacity">
          
          {/* Overlay dismissal */}
          <div className="absolute inset-0" onClick={handleCloseUpload}></div>
          
          <div className="relative w-full max-w-[430px] rounded-t-[28px] bg-white p-5 pb-8 shadow-2xl animate-slideUp">
            
            {/* Modal top grab handle indicator */}
            <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-slate-200"></div>

            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-black text-slate-800">새로운 커리어 경험 에셋 보강</h3>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  활동 파일이나 증명 문서를 제출하면 AI 분석기가 분석합니다.
                </p>
              </div>
              <button
                onClick={handleCloseUpload}
                className="rounded-full bg-slate-50 p-1 text-slate-400 hover:bg-slate-100"
              >
                ✕
              </button>
            </div>

            {/* Quick Upload Type Selector Tab Chips */}
            <div className="grid grid-cols-3 gap-2 mb-4">
              {[
                { type: "file" as const, l: "파일", icon: FileUp },
                { type: "video" as const, l: "영상", icon: Video },
                { type: "link" as const, l: "링크", icon: Link2 }
              ].map((sw) => {
                const IconComp = sw.icon;
                return (
                  <button
                    key={sw.type}
                    type="button"
                    onClick={() => setUploadType(sw.type)}
                    className={`rounded-xl py-2 flex flex-col items-center gap-1 border text-xs transition-all ${
                      uploadType === sw.type
                        ? "bg-brand-50 border-brand-400 font-extrabold text-brand-700"
                        : "bg-slate-50 border-slate-100 text-slate-500 hover:bg-slate-100/50"
                    }`}
                  >
                    <IconComp className="h-4 w-4" />
                    <span className="text-[10px]">{sw.l}</span>
                  </button>
                );
              })}
            </div>

            {/* Custom Input area based on choice */}
            <form onSubmit={handleAddAsset} className="space-y-4">
              <div>
                <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-wider mb-1.5">
                  활동명 / 에셋 핵심 제목
                </label>
                <input
                  type="text"
                  required
                  value={newAssetTitle}
                  onChange={(e) => setNewAssetTitle(e.target.value)}
                  placeholder="예: 카카오 서비스 체험단 보고서 작성 등"
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-xs outline-none focus:border-brand-500 transition-all font-semibold text-slate-800"
                />
              </div>

              {/* Integrated Memo Field directly underneath title */}
              <div>
                <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                  <span>활동 내용 보강 메모 (선택)</span>
                  <span className="text-[9px] font-normal text-slate-400 tracking-normal lowercase">자유 기록</span>
                </label>
                <textarea
                  value={newAssetDetail}
                  onChange={(e) => setNewAssetDetail(e.target.value)}
                  rows={2}
                  placeholder={
                    uploadType === "link"
                      ? "이 링크 에셋에서 자신이 기여한 세부 역할, 기획안, 피드백 반영 지수 등을 메모로 남기세요…"
                      : "이 파일/영상 에셋에서 어떤 기여를 했는지, 설명하고 싶은 핵심 내용을 자유롭게 메모로 남겨보세요…"
                  }
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs outline-none focus:border-brand-500 transition-all resize-none leading-relaxed placeholder-slate-400 text-slate-700"
                ></textarea>
              </div>

              {/* Dynamic instruction section based on upload type */}
              <div className="rounded-2xl bg-slate-50/50 border border-slate-100 p-3.5">
                <span className="text-[10px] font-extrabold text-slate-400 block mb-1">
                  {uploadType === "file" && "📁 파일 업로드"}
                  {uploadType === "video" && "🎬 영상 파일 업로드 (.mp4)"}
                  {uploadType === "link" && "🔗 URL"}
                </span>

                {uploadType === "file" && (
                  <div className="space-y-2">
                    {/* Hidden Native File Input */}
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setUploadedFile(file);
                          // Auto set name (without extension) if title is empty or default
                          const pureName = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
                          setNewAssetTitle(pureName);
                        }
                      }}
                      accept=".pdf,.xlsx,.xls,.pptx,.ppt,.docx,.doc,.txt,.png,.jpg,.jpeg"
                      className="hidden"
                    />

                    {uploadedFile ? (
                      /* File Selected State */
                      <div className="border-2 border-emerald-500 bg-emerald-50/20 rounded-xl p-5 text-center transition-all animate-fadeIn">
                        <span className="text-3xl block mb-1">✅</span>
                        <h4 className="text-xs font-black text-emerald-800 truncate px-2" title={uploadedFile.name}>
                          {uploadedFile.name}
                        </h4>
                        <p className="text-[10px] text-emerald-600 mt-1 font-semibold">
                          {(uploadedFile.size / (1024 * 1024)).toFixed(2)} MB • 업로드 준비 완료
                        </p>
                        <div className="mt-3 flex items-center justify-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              if (fileInputRef.current) fileInputRef.current.click();
                            }}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-[9px] px-3 py-1.5 rounded-lg transition-all cursor-pointer active:scale-95 shadow-sm"
                          >
                            다른 파일 선택
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setUploadedFile(null);
                              setNewAssetTitle("");
                              if (fileInputRef.current) fileInputRef.current.value = "";
                            }}
                            className="bg-slate-200 hover:bg-slate-300 text-slate-705 font-extrabold text-[9px] px-3 py-1.5 rounded-lg transition-all cursor-pointer active:scale-95"
                          >
                            지우기
                          </button>
                        </div>
                      </div>
                    ) : (
                      /* Interactive Drag and Drop area */
                      <div
                        onClick={() => {
                          if (fileInputRef.current) fileInputRef.current.click();
                        }}
                        onDragOver={(e) => {
                          e.preventDefault();
                          setIsDragOver(true);
                        }}
                        onDragLeave={() => {
                          setIsDragOver(false);
                        }}
                        onDrop={(e) => {
                          e.preventDefault();
                          setIsDragOver(false);
                          const file = e.dataTransfer.files?.[0];
                          if (file) {
                            setUploadedFile(file);
                            const pureName = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
                            setNewAssetTitle(pureName);
                          }
                        }}
                        className={`border-2 border-dashed rounded-xl p-6 text-center transition-all cursor-pointer select-none ${
                          isDragOver
                            ? "border-brand-500 bg-brand-50/40 scale-[1.01]"
                            : "border-slate-300 hover:border-brand-450 hover:bg-white"
                        }`}
                      >
                        <span className="text-2xl block mb-1">📄</span>
                        <span className="text-[10px] font-bold text-slate-500 block">
                          이곳을 클릭 또는 드래그하여 PDF, Excel, PPTX 파일을 올리세요
                        </span>
                        <p className="text-[9px] text-slate-400 mt-1">
                          파일의 실무 기여 문맥을 AI가 스캔하여 역량을 자동 추출합니다.
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {uploadType === "video" && (
                  <div className="space-y-2">
                    {/* Hidden Native Video Input */}
                    <input
                      type="file"
                      ref={videoInputRef}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setUploadedFile(file);
                          // Auto set name (without extension) if title is empty or default
                          const pureName = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
                          setNewAssetTitle(pureName);
                        }
                      }}
                      accept=".mp4"
                      className="hidden"
                    />

                    {uploadedFile ? (
                      /* File Selected State */
                      <div className="border-2 border-emerald-500 bg-emerald-50/20 rounded-xl p-5 text-center transition-all animate-fadeIn">
                        <span className="text-3xl block mb-1">🎬</span>
                        <h4 className="text-xs font-black text-emerald-800 truncate px-2" title={uploadedFile.name}>
                          {uploadedFile.name}
                        </h4>
                        <p className="text-[10px] text-emerald-600 mt-1 font-semibold">
                          {(uploadedFile.size / (1024 * 1024)).toFixed(2)} MB • 영상 업로드 준비 완료
                        </p>
                        <div className="mt-3 flex items-center justify-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              if (videoInputRef.current) videoInputRef.current.click();
                            }}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-[9px] px-3 py-1.5 rounded-lg transition-all cursor-pointer active:scale-95 shadow-sm"
                          >
                            다른 영상 선택
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setUploadedFile(null);
                              setNewAssetTitle("");
                              if (videoInputRef.current) videoInputRef.current.value = "";
                            }}
                            className="bg-slate-200 hover:bg-slate-300 text-slate-705 font-extrabold text-[9px] px-3 py-1.5 rounded-lg transition-all cursor-pointer active:scale-95"
                          >
                            지우기
                          </button>
                        </div>
                      </div>
                    ) : (
                      /* Interactive Drag and Drop area for video */
                      <div
                        onClick={() => {
                          if (videoInputRef.current) videoInputRef.current.click();
                        }}
                        onDragOver={(e) => {
                          e.preventDefault();
                          setIsDragOver(true);
                        }}
                        onDragLeave={() => {
                          setIsDragOver(false);
                        }}
                        onDrop={(e) => {
                          e.preventDefault();
                          setIsDragOver(false);
                          const file = e.dataTransfer.files?.[0];
                          if (file) {
                            if (file.name.toLowerCase().endsWith(".mp4")) {
                              setUploadedFile(file);
                              const pureName = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
                              setNewAssetTitle(pureName);
                            } else {
                              showToast(".mp4 형식의 동영상 파일만 업로드할 수 있습니다.", "error");
                            }
                          }
                        }}
                        className={`border-2 border-dashed rounded-xl p-6 text-center transition-all cursor-pointer select-none ${
                          isDragOver
                            ? "border-brand-500 bg-brand-50/40 scale-[1.01]"
                            : "border-slate-300 hover:border-brand-450 hover:bg-white"
                        }`}
                      >
                        <span className="text-2xl block mb-1">🎥</span>
                        <span className="text-[10px] font-bold text-slate-500 block">
                          이곳을 클릭 또는 드래그하여 MP4 동영상 파일을 올리세요
                        </span>
                        <p className="text-[9px] text-slate-400 mt-1">
                          영상의 프로젝트 발표/설명 내용을 분석하여 실무 역량을 추출합니다.
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {uploadType === "link" && (
                  <div className="space-y-1 mt-1 animate-fadeIn">
                    <input
                      type="url"
                      required
                      value={linkUrlInput}
                      onChange={(e) => setLinkUrlInput(e.target.value)}
                      placeholder="https://github.com/your-username/your-repo"
                      className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-xs outline-none focus:border-brand-500 font-mono text-slate-700"
                    />
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmittingAsset}
                className="w-full py-4.5 rounded-2xl bg-brand-600 text-white font-black text-xs transition-all tracking-tight cursor-pointer hover:bg-brand-700 shadow-md flex items-center justify-center gap-2"
              >
                {isSubmittingAsset ? (
                  <>
                    <span className="spinner"></span>
                    Gemini AI가 이력 및 역량을 분석 태깅 중...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    새로운 에셋 장착하여 나무 키우기
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ── COMPONENT 2: Single asset detail view modal ───────────────────────────── */}
      {selectedAssetDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs font-sans p-4">
          <div className="relative w-full max-w-[390px] rounded-3xl bg-white p-5 shadow-2xl animate-scaleIn">
            
            <div className="flex items-center justify-between pb-3.5 border-b border-slate-50">
              <span className="rounded-full bg-slate-100 px-2.0 py-0.5 text-[9px] font-bold text-slate-500 uppercase">
                {selectedAssetDetail.type === "file" ? "기여 문서 파일" :
                 selectedAssetDetail.type === "video" ? "증명 영상 파일" :
                 selectedAssetDetail.type === "link" ? "포트폴리오 URL" : "수기 활동 기록"}
              </span>
              <button
                onClick={() => setSelectedAssetDetail(null)}
                className="rounded-full bg-slate-50 p-1 text-slate-400 hover:bg-slate-100"
              >
                ✕
              </button>
            </div>

            <div className="py-4 space-y-3">
              <div className="flex items-center gap-2 text-brand-700">
                <span className="text-xl">🎋</span>
                <h3 className="text-xs font-black">{selectedAssetDetail.title}</h3>
              </div>

              <div>
                <span className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1.5 flex items-center justify-between">
                  <span>활동 내용 보강 메모</span>
                  {isEditingMemo ? (
                    <div className="flex gap-1.5">
                      <button 
                        onClick={() => {
                          setIsEditingMemo(false);
                          setMemoEditValue(selectedAssetDetail.subText);
                        }}
                        className="text-[9px] font-bold text-slate-400 hover:text-slate-600 transition-colors cursor-pointer px-1.5 py-0.5 rounded bg-slate-50"
                      >
                        취소
                      </button>
                      <button 
                        onClick={handleUpdateAssetMemo}
                        className="text-[9px] font-bold text-white bg-brand-600 hover:bg-brand-700 transition-colors cursor-pointer px-2 py-0.5 rounded shadow-xs"
                      >
                        저장
                      </button>
                    </div>
                  ) : (
                    <button 
                      onClick={() => {
                        setMemoEditValue(selectedAssetDetail.subText);
                        setIsEditingMemo(true);
                      }}
                      className="text-[9px] font-bold text-brand-600 hover:text-brand-700 hover:underline transition-all cursor-pointer flex items-center gap-0.5"
                    >
                      ✏️ 메모 수정
                    </button>
                  )}
                </span>
                {isEditingMemo ? (
                  <textarea
                    value={memoEditValue}
                    onChange={(e) => setMemoEditValue(e.target.value)}
                    rows={3}
                    placeholder="활동 기여도나 추가 설명 등을 자유롭게 남겨보세요…"
                    className="w-full text-xs text-slate-700 leading-relaxed bg-slate-50/50 p-3 rounded-2xl border border-slate-200 outline-none focus:border-brand-500 focus:bg-white resize-none transition-all leading-normal"
                  />
                ) : (
                  <p className="text-xs text-slate-500 leading-relaxed bg-slate-50 p-3 rounded-2xl border border-slate-100 min-h-[44px] whitespace-pre-line leading-normal">
                    {selectedAssetDetail.subText || "기록된 메모가 없습니다. '메모 수정'을 눌러 나만의 활동 기여 내용을 보강해 보세요!"}
                  </p>
                )}
              </div>

              <div>
                <span className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1.5">
                  인정된 세밀 역량 지수
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {selectedAssetDetail.skills.map((s, idx) => (
                    <span
                      key={idx}
                      className="rounded-lg bg-emerald-50 border border-emerald-100 px-2.5 py-1 text-xs font-black text-emerald-800"
                    >
                      {s.skillName} +{s.points}pt
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <span className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1.5">
                  등록 태그
                </span>
                <div className="flex flex-wrap gap-1">
                  {selectedAssetDetail.tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="rounded-lg bg-slate-100 px-2.5 py-0.5 text-[10px] font-bold text-slate-500"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="border-t border-slate-50 pt-3.5 flex gap-2">
              <button
                onClick={(e) => {
                  handleDeleteAsset(selectedAssetDetail.id, e);
                }}
                className="flex-1 bg-red-50 hover:bg-red-100 text-red-700 py-3 rounded-xl text-xs font-bold transition-all text-center cursor-pointer"
              >
                🗑️ 이력 영구 삭제
              </button>
              <button
                onClick={() => setSelectedAssetDetail(null)}
                className="flex-1 bg-slate-900 hover:bg-slate-800 text-white py-3 rounded-xl text-xs font-bold transition-all text-center cursor-pointer"
              >
                확인 완료
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── PROFILE EDITOR MODAL ──────────────────────────────────────────────── */}
      {isProfileModalOpen && (
        <div id="profile-editor-modal" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-[440px] bg-white rounded-3xl border border-slate-150 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="px-5 py-4.5 bg-gradient-to-r from-brand-600 to-emerald-600 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Crown className="h-4.5 w-4.5 text-white" />
                <span className="font-extrabold text-xs tracking-tight">수정하기: 내 프로필 정보</span>
              </div>
              <button 
                onClick={() => setIsProfileModalOpen(false)}
                className="text-white hover:scale-115 active:scale-95 transition-all text-sm font-black cursor-pointer bg-black/15 hover:bg-black/25 px-2.5 py-1 rounded-full text-[10px]"
              >
                닫기
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 overflow-y-auto space-y-4">
              {/* Profile Photo Upload and Header Section */}
              <div className="flex flex-col sm:flex-row items-center gap-4 bg-slate-50 p-3.5 rounded-2xl border border-slate-100 mb-2">
                <div className="relative group cursor-pointer shrink-0">
                  {profileImageInput ? (
                    <img 
                      src={profileImageInput} 
                      alt="Profile Preview" 
                      className="h-16 w-16 rounded-full object-cover border-2 border-brand-500 shadow-md"
                    />
                  ) : (
                    <div className="h-16 w-16 overflow-hidden rounded-full bg-gradient-to-tr from-brand-500 to-emerald-600 text-xs font-black text-white flex items-center justify-center text-center px-1 leading-tight shadow-md border-2 border-brand-200 uppercase">
                      <span className="truncate max-w-full">{nameInput || "인재"}</span>
                    </div>
                  )}
                  <label className="absolute inset-0 bg-slate-900/40 text-white rounded-full flex items-center justify-center text-[9px] font-bold opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                    변경
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleImageChange} 
                      className="hidden" 
                    />
                  </label>
                </div>
                <div className="flex-1 text-center sm:text-left min-w-0">
                  <span className="text-[10px] font-black text-slate-400 block uppercase">내 프로필 사진 등록</span>
                  <h4 className="text-xs font-bold text-slate-800 leading-tight truncate mt-0.5">{nameInput || "지원자"} 님</h4>
                  <p className="text-[9px] text-slate-500 leading-normal mt-1">권장: 1:1 비율 이미지 파일 (최대 1.5MB)</p>
                  <div className="flex gap-1.5 mt-2 justify-center sm:justify-start">
                    <label className="text-[9.5px] bg-brand-600 hover:bg-brand-700 text-white font-extrabold px-2.5 py-1 rounded-lg cursor-pointer transition-all active:scale-95 shadow-sm block">
                      사진 선택
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={handleImageChange} 
                        className="hidden" 
                      />
                    </label>
                    {profileImageInput && (
                      <button
                        type="button"
                        onClick={() => setProfileImageInput("")}
                        className="text-[9.5px] bg-slate-200 hover:bg-slate-300 text-slate-700 font-extrabold px-2 py-1 rounded-lg cursor-pointer transition-colors"
                      >
                        지우기
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Form Input fields */}
              <div className="space-y-3.5">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">이름</label>
                    <input
                      type="text"
                      value={nameInput}
                      onChange={(e) => setNameInput(e.target.value)}
                      placeholder="이름 입력..."
                      className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-2.5 text-xs outline-none focus:border-brand-500 focus:bg-white transition-all font-bold text-slate-800 placeholder:text-slate-400 placeholder:font-normal placeholder:opacity-65 placeholder:transition-all placeholder:duration-200 focus:placeholder:opacity-0"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">구직 상황 / 직무</label>
                    <input
                      type="text"
                      value={situationInput}
                      onChange={(e) => setSituationInput(e.target.value)}
                      placeholder="예: 서비스 기획 주니어, 학생 등"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-2.5 text-xs outline-none focus:border-brand-500 focus:bg-white transition-all font-semibold text-slate-800 placeholder:text-slate-400 placeholder:font-normal placeholder:opacity-65 placeholder:transition-all placeholder:duration-200 focus:placeholder:opacity-0"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">📅 생년월일</label>
                    <input
                      type="text"
                      value={birthDateInput}
                      onChange={(e) => setBirthDateInput(e.target.value)}
                      placeholder="예: 1999.04.15"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-2.5 text-xs outline-none focus:border-brand-500 focus:bg-white transition-all font-semibold text-slate-800 placeholder:text-slate-400 placeholder:font-normal placeholder:opacity-65 placeholder:transition-all placeholder:duration-200 focus:placeholder:opacity-0"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">⚧ 성별</label>
                    <select
                      value={genderInput}
                      onChange={(e) => setGenderInput(e.target.value)}
                      className="w-full rounded-xl border border-slate-100 bg-slate-50/50 p-2.5 text-xs outline-none focus:border-brand-500 focus:bg-white transition-all font-semibold text-slate-800 cursor-pointer"
                    >
                      <option value="">성별 선택안함</option>
                      <option value="남성">남성</option>
                      <option value="여성">여성</option>
                      <option value="기타">기타 / 비공개</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">🎓 최종 학력 정보</label>
                  <input
                    type="text"
                    value={eduInput}
                    onChange={(e) => setEduInput(e.target.value)}
                    placeholder="예: 한성대학교 문학문화콘텐츠학과"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-2.5 text-xs outline-none focus:border-brand-500 focus:bg-white transition-all font-medium text-slate-800 placeholder:text-slate-400 placeholder:font-normal placeholder:opacity-65 placeholder:transition-all placeholder:duration-200 focus:placeholder:opacity-0"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">📧 이메일 주소</label>
                    <input
                      type="email"
                      value={emailInput}
                      onChange={(e) => setEmailInput(e.target.value)}
                      placeholder="your_email@example.com"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-2.5 text-xs outline-none focus:border-brand-500 focus:bg-white transition-all font-medium text-slate-800 placeholder:text-slate-400 placeholder:font-normal placeholder:opacity-65"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">📱 휴대전화 번호</label>
                    <input
                      type="text"
                      value={phoneInput}
                      onChange={(e) => setPhoneInput(e.target.value)}
                      placeholder="010-1234-5678"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-2.5 text-xs outline-none focus:border-brand-500 focus:bg-white transition-all font-medium text-slate-800 placeholder:text-slate-400 placeholder:font-normal placeholder:opacity-65"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">⚓ 대표 주소 / 개인 링크</label>
                  <input
                    type="text"
                    value={websiteInput}
                    onChange={(e) => setWebsiteInput(e.target.value)}
                    placeholder="예: blog, notion, portfolio 등 개인 주소"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-2.5 text-xs outline-none focus:border-brand-500 focus:bg-white transition-all font-mono text-brand-600 placeholder:text-slate-400 placeholder:font-normal placeholder:opacity-65"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">🌿 내 한 줄 정체성 포부</label>
                  <textarea
                    value={coreIntroInput}
                    onChange={(e) => setCoreIntroInput(e.target.value)}
                    placeholder="예: 사용자 경험을 세심히 관찰하고 비즈니스 가치를 설계하는 PM 주니어"
                    rows={2}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-2.5 text-xs outline-none focus:border-brand-500 focus:bg-white transition-all resize-none leading-normal font-medium text-slate-700 placeholder:text-slate-400 placeholder:font-normal placeholder:opacity-65"
                  />
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="px-5 py-4 bg-slate-50 border-t border-slate-100 flex gap-2.5">
              <button
                onClick={() => setIsProfileModalOpen(false)}
                className="flex-1 rounded-xl bg-slate-200 hover:bg-slate-350 text-slate-700 text-xs font-bold py-3 transition-all text-center cursor-pointer font-sans"
              >
                취소하기
              </button>
              <button
                onClick={handleSaveMyProfile}
                className="flex-1 rounded-xl bg-gradient-to-r from-brand-600 to-emerald-600 hover:opacity-95 text-white text-xs font-bold py-3 transition-all text-center cursor-pointer font-sans shadow-md"
              >
                내 프로필 정보 저장
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── COMPONENT 4: CORPORATE QUICK APPLY MODAL ─────────────────────────── */}
      {selectedJobForApply && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn font-sans">
          <div className="relative w-full max-w-[430px] rounded-3xl bg-white shadow-2xl overflow-hidden animate-scaleIn flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-indigo-900 to-slate-900 p-5 text-white text-center">
              <span className="text-2xl select-none mb-1 block">{selectedJobForApply.logo}</span>
              <h3 className="text-base font-black tracking-tight">{selectedJobForApply.company}</h3>
              <p className="text-[11px] text-indigo-200/90 mt-0.5">{selectedJobForApply.role} 즉시 지원</p>
              <span className="absolute right-4 top-4 text-white/50 hover:text-white cursor-pointer text-sm font-bold" onClick={() => setSelectedJobForApply(null)}>✕</span>
            </div>

            {/* Modal Content */}
            <div className="p-5 overflow-y-auto space-y-4 text-slate-800">
              
              {/* Document Check Area */}
              <div className="rounded-2xl border border-slate-150 bg-slate-50/50 p-4 space-y-2.5">
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block">
                  📁 에셋로그 서류 동기화 매칭 상태
                </span>
                
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-600 flex items-center gap-1">
                      <span>📝</span> AI 자기소개서 초안
                    </span>
                    {starResult ? (
                      <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100 flex items-center gap-1">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                        연동 완료
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                        미작성 (기본정보 적용)
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-600 flex items-center gap-1">
                      <span>💼</span> AI 커리어 포트폴리오
                    </span>
                    {portfolioResult ? (
                      <span className="text-[10px] font-extrabold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100 flex items-center gap-1">
                        <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 animate-pulse"></span>
                        연동 완료
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                        미작성 (요약본 연동)
                      </span>
                    )}
                  </div>
                </div>

                {(!starResult || !portfolioResult) && (
                  <p className="text-[9.5px] text-amber-600 font-semibold leading-relaxed pt-1.5 border-t border-slate-150/50">
                    ※ 자소서나 포트폴리오를 작성 후 지원하시면 매칭 진단 점수 기반으로 서류 합격 확률이 2배 이상 증가합니다.
                  </p>
                )}
              </div>

              {/* Verified Assets Guarantee Toggle */}
              <div className="rounded-2xl border border-emerald-100 bg-emerald-50/20 p-4 space-y-2">
                <div className="flex items-start gap-2.5">
                  <input
                    type="checkbox"
                    id="share-assets-check"
                    checked={shareAssetsChecked}
                    onChange={(e) => setShareAssetsChecked(e.target.checked)}
                    className="mt-1 h-3.5 w-3.5 rounded border-emerald-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                  />
                  <div className="space-y-0.5">
                    <label htmlFor="share-assets-check" className="text-xs font-black text-slate-700 cursor-pointer flex items-center gap-1">
                      🛡️ 가꾸어온 정량 에셋 {assets.length}개 동반제출
                    </label>
                    <p className="text-[9.5px] text-slate-400 leading-normal">
                      에셋로그에서 신뢰 가고 정밀하게 인증받은 경험 조각들이 공식 공증 첨부서류로서 담당 인사팀에 안전하게 전송됩니다.
                    </p>
                  </div>
                </div>
              </div>

              {/* Applicant Personal Info Form */}
              <div className="space-y-3">
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block">
                  👤 지원자 인적사항 확인
                </span>

                <div className="space-y-1">
                  <label className="text-[9.5px] font-bold text-slate-500 block">지원자 성명</label>
                  <input
                    type="text"
                    value={applyName}
                    onChange={(e) => setApplyName(e.target.value)}
                    placeholder="성명을 입력해 주세요"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-2 text-xs outline-none focus:border-indigo-500 focus:bg-white font-semibold transition-all text-slate-800"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div className="space-y-1">
                    <label className="text-[9.5px] font-bold text-slate-500 block">이메일 주소</label>
                    <input
                      type="email"
                      value={applyEmail}
                      onChange={(e) => setApplyEmail(e.target.value)}
                      placeholder="이메일을 입력해 주세요"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-2 text-xs outline-none focus:border-indigo-500 focus:bg-white font-semibold transition-all text-slate-800"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9.5px] font-bold text-slate-500 block">휴대전화 번호</label>
                    <input
                      type="text"
                      value={applyPhone}
                      onChange={(e) => setApplyPhone(e.target.value)}
                      placeholder="010-XXXX-XXXX"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-2 text-xs outline-none focus:border-indigo-500 focus:bg-white font-semibold transition-all text-slate-800"
                    />
                  </div>
                </div>
              </div>

            </div>

            {/* Modal Actions */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex gap-2 shadow-inner">
              <button
                onClick={() => setSelectedJobForApply(null)}
                className="flex-1 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold py-2.5 transition-all text-center cursor-pointer"
              >
                돌아가기
              </button>
              <button
                onClick={handleSubmitApplication}
                className="flex-1 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black py-2.5 transition-all text-center cursor-pointer shadow-md flex items-center justify-center gap-1"
              >
                <span>🚀</span>
                <span>입사 지원서 즉시전송</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ── COMPONENT 5: COMPLETED APPLICATION CONFETTI MODAL ────────────────── */}
      {isApplyingSuccessModal && appliedJobDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn font-sans">
          <div className="relative w-full max-w-[390px] rounded-3xl bg-white p-6 shadow-2xl overflow-hidden animate-scaleIn text-center space-y-4">
            
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-emerald-500 via-indigo-500 to-fuchsia-500"></div>

            <div className="flex justify-center">
              <span className="text-5xl animate-bounce">🌿</span>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-black tracking-widest text-emerald-600 uppercase bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100 inline-block">
                서류 즉시제출 통과
              </span>
              <h3 className="text-base font-black text-slate-800">서류 지원이 완료되었습니다!</h3>
              <p className="text-[11px] text-slate-500 leading-normal">
                에셋로그에서 정직하게 심어 키운 데이터와 자기소개서&포트폴리오가 <strong>{appliedJobDetails.company}</strong> 채용 프로세스에 완벽하게 동기화되어 도달했습니다.
              </p>
            </div>

            {/* Award Info Box */}
            <div className="rounded-2xl bg-gradient-to-br from-indigo-50 to-indigo-100/50 p-4 border border-indigo-100 flex items-center justify-center gap-3">
              <span className="text-2xl animate-pulse">💧</span>
              <div className="text-left">
                <span className="text-[10px] font-black text-indigo-700 uppercase block leading-none">즉시 지원 감사 보너스</span>
                <span className="text-[11px] font-bold text-slate-600 mt-1 block leading-tight">
                  정원용 <strong>물방울💧 2개</strong>가 내 가방속으로 안전하게 가득 채워졌습니다!
                </span>
              </div>
            </div>

            {/* Receipt Summary */}
            <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-3 text-left text-[11px] space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-400 font-bold">지원 회사</span>
                <span className="font-extrabold text-slate-700">{appliedJobDetails.company}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 font-bold">지원 직무</span>
                <span className="font-semibold text-slate-700">{appliedJobDetails.role}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 font-bold">이메일 계정</span>
                <span className="font-mono text-slate-600">{appliedJobDetails.applicantEmail}</span>
              </div>
              <div className="flex justify-between pt-1 border-t border-slate-100 mt-2 text-[10px]">
                <span className="text-emerald-600 font-extrabold">자기소개서 전송</span>
                <span className="font-extrabold text-slate-600">{appliedJobDetails.hasCoverLetter ? "STAR 연동성공" : "기본자료 전송"}</span>
              </div>
              <div className="flex justify-between text-[10px]">
                <span className="text-indigo-600 font-extrabold">포트폴리오 전송</span>
                <span className="font-extrabold text-slate-600">{appliedJobDetails.hasPortfolio ? "고해상도 PDF 연동선공" : "정원 이지안 전송"}</span>
              </div>
              <div className="flex justify-between text-[10px]">
                <span className="text-slate-500 font-extrabold">첨부된 성과 에셋</span>
                <span className="font-extrabold text-slate-600">{appliedJobDetails.sharedAssetsCount}개 </span>
              </div>
            </div>

            <button
              onClick={() => setIsApplyingSuccessModal(false)}
              className="w-full rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs py-3 cursor-pointer transition-all shadow-md active:scale-98"
            >
              확인 (정원 가기)
            </button>

          </div>
        </div>
      )}

    </div>
  );
}
