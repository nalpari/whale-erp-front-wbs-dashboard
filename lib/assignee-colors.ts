/**
 * 담당자별 컬러 시스템
 * 메인 대시보드와 담당자별 대시보드에서 일관된 컬러를 사용하기 위한 유틸리티
 */

export type GlowColor = 'cyan' | 'magenta' | 'purple' | 'pink' | 'green' | 'orange' | 'blue'

export interface AssigneeColorConfig {
  color: string
  glow: GlowColor
}

// 담당자별 고유 컬러 - 각 담당자마다 완전히 다른 색상 (DB 기준)
const ASSIGNEE_COLORS: Record<string, AssigneeColorConfig> = {
  '유상욱': { color: '#3b82f6', glow: 'blue' },      // 파랑
  '최효준': { color: '#8b5cf6', glow: 'purple' },    // 보라
  '김다영': { color: '#06b6d4', glow: 'cyan' },      // 시안
  '김다슬': { color: '#22c55e', glow: 'green' },     // 녹색
  '이재영': { color: '#f59e0b', glow: 'orange' },    // 오렌지
}

// 새 담당자를 위한 추가 컬러 팔레트 (중복 방지용)
const EXTRA_COLORS: AssigneeColorConfig[] = [
  { color: '#0ea5e9', glow: 'cyan' },      // 스카이블루
  { color: '#a855f7', glow: 'purple' },    // 퍼플
  { color: '#10b981', glow: 'green' },     // 에메랄드
  { color: '#f97316', glow: 'orange' },    // 오렌지
  { color: '#e11d48', glow: 'magenta' },   // 로즈
  { color: '#0891b2', glow: 'cyan' },      // 다크시안
  { color: '#7c3aed', glow: 'purple' },    // 바이올렛
  { color: '#059669', glow: 'green' },     // 에메랄드 다크
  { color: '#ea580c', glow: 'orange' },    // 오렌지 다크
  { color: '#be185d', glow: 'pink' },      // 핑크 다크
]

/**
 * 담당자 이름으로 컬러 설정을 가져옴
 * 고정 매핑이 있으면 사용하고, 없으면 이름 해시 기반으로 고유 컬러 할당
 */
export function getAssigneeColorConfig(assignee: string): AssigneeColorConfig {
  // 고정 매핑 확인
  if (ASSIGNEE_COLORS[assignee]) {
    return ASSIGNEE_COLORS[assignee]
  }

  // 새 담당자: 이름 해시 기반으로 EXTRA_COLORS에서 할당
  const hash = assignee.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  return EXTRA_COLORS[hash % EXTRA_COLORS.length]
}

/**
 * 담당자 이름으로 컬러만 가져옴 (ProgressRing 등에서 사용)
 */
export function getAssigneeColor(assignee: string): string {
  return getAssigneeColorConfig(assignee).color
}

/**
 * 담당자 이름으로 Glow 효과만 가져옴 (GlowCard 등에서 사용)
 */
export function getAssigneeGlow(assignee: string): GlowColor {
  return getAssigneeColorConfig(assignee).glow
}
