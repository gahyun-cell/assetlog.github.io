export interface CareerAsset {
  id: string;
  title: string;
  type: 'file' | 'text' | 'video' | 'link';
  subText: string;
  date: string;
  skills: { skillName: string; points: number }[];
  tags: string[];
}

export type SituationType = 'student' | 'bootcamp' | 'junior';
export type GoalType = 'newbie' | 'transfer' | 'portfolio' | 'sideproject';

export interface UserCareerProfile {
  name: string;
  situation: string;
  targetGoal: string;
  targetJobs: string[];
  seedType: 'planning' | 'analysis' | 'creativity' | 'execution';
  level: number;
  exp: number; // 0 to 100
  totalPoints: number;
  skillScores: Record<string, number>;
  education?: string;             // 학력 (학전/전공/세부내용)
  email?: string;                 // 이메일 주소
  phone?: string;                 // 연락처
  website?: string;               // 깃허브 / 링크
  coreIntro?: string;             // 한 줄 포부
  coverLetterMotivation?: string; // 자기소개서 지원동기
  coverLetterAspiration?: string; // 자기소개서 입사 후 포부
  birthDate?: string;             // 생년월일 (YYYY-MM-DD or custom string)
  gender?: string;                // 성별 ("남성" | "여성" | "etc")
  profileImage?: string;          // 사진 데이터 (Base64 data-uri or url)
  waterDroplets?: number;         // 보유 물방울 수
  isProfileCompletedAwarded?: boolean; // 프로필 100% 보너스 지급여부
}

export interface STARResponse {
  situation: string;
  task: string;
  action: string;
  result: string;
  overallScore: number;
  coreStrengths: string[];
}

export interface SkillMatchInfo {
  skillName: string;
  score: number;
}

export interface JDGapAnalysis {
  company: string;
  jobRole: string;
  matchPercentage: number;
  skills: SkillMatchInfo[];
  gaps: {
    skillName: string;
    description: string;
    level: 'high' | 'medium' | 'low';
  }[];
}
