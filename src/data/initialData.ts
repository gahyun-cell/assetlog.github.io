import { CareerAsset, UserCareerProfile } from "../types";

export const INITIAL_ASSETS: CareerAsset[] = [
  {
    id: "asset-1",
    title: "카카오 크루 체험 개선 기획안",
    type: "file",
    subText: "기획서-vfinal.pptx · 24슬라이드 직접 작성",
    date: "2026-05-31",
    skills: [
      { skillName: "기획력", points: 15 },
      { skillName: "UX리서치", points: 10 }
    ],
    tags: ["서비스기획", "사용자조사", "카카오"]
  },
  {
    id: "asset-2",
    title: "소상공인 판로 개척 데이터 마케팅 프로젝트",
    type: "text",
    subText: "분석보고서.xlsx · 로컬시장 고객 구매 로그 상관관계 분석",
    date: "2026-05-25",
    skills: [
      { skillName: "데이터분석", points: 13 },
      { skillName: "논리력", points: 8 }
    ],
    tags: ["정량분석", "마케팅인턴"]
  },
  {
    id: "asset-3",
    title: "창업동아리 해커톤 데모데이 발표 피칭 및 발표",
    type: "video",
    subText: "피칭스피치_데모.mp4 · 데모데이 발표 피칭 7분 핵심 영상 증명",
    date: "2026-05-18",
    skills: [
      { skillName: "커뮤니케이션", points: 12 },
      { skillName: "설득력", points: 6 }
    ],
    tags: ["피팅자료", "해커톤"]
  },
  {
    id: "asset-4",
    title: "깃허브(GitHub) 협업 웹서비스 프로젝트 소스코드",
    type: "link",
    subText: "github.com/career-garden/space-chat-app",
    date: "2026-05-10",
    skills: [
      { skillName: "개발역량", points: 15 },
      { skillName: "실행력", points: 9 }
    ],
    tags: ["React", "TypeScript", "오픈소스"]
  }
];

export const INITIAL_PROFILE: UserCareerProfile = {
  name: "김지유",
  situation: "대학생 / 취업 준비생",
  targetGoal: "신입 서비스기획 포지션 입사",
  targetJobs: ["서비스 기획 / PM", "데이터 분석"],
  seedType: "planning",
  level: 4,
  exp: 68,
  totalPoints: 487,
  skillScores: {
    "기획력": 85,
    "데이터분석": 62,
    "커뮤니케이션": 74,
    "실행력": 90,
    "UX리서치": 70,
    "개발역량": 55,
    "논리력": 68,
    "설득력": 60
  },
  education: "",
  email: "",
  phone: "",
  website: "",
  coreIntro: "사용자 경험을 깊이 있게 설계하는 서비스 기획자입니다.",
  coverLetterMotivation: "다차원 구매 분석 에셋 및 고객 로그 실태 기여 경험을 토대로, 대상 기업의 정밀 타겟 서비스 설계에 기확적 통찰을 심고 함께 무성한 실무 결실을 맺고자 지원합니다.",
  coverLetterAspiration: "단기적으로는 소상공인 마케팅 데이터를 표준 규격화하고, 나아가 3년 내에 사용자 친화적 스마트 오퍼링 기능을 총괄 설계하여 프로덕트의 전후방 성장을 실현하겠습니다."
};

export const BADGES = [
  { id: "b1", emoji: "🌱", title: "첫 경험 기록", desc: "첫 에셋 등록 성공" },
  { id: "b2", emoji: "🔥", title: "열정의 아카이브", desc: "7일 연속 기여 등록" },
  { id: "b3", emoji: "🏆", title: "은빛 마일스톤", desc: "공모전 은상 수상 이력 소유" },
  { id: "b4", emoji: "🤖", title: "AI 컨설팅 섭렵", desc: "5회 이상 자소서 초안 생성" },
  { id: "b5", emoji: "🧭", title: "정밀 내비게이터", desc: "채용 공고 적합도 진단 수행" }
];
