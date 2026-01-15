# WBS Dashboard - Whale ERP

Whale ERP 프로젝트의 WBS(Work Breakdown Structure) 대시보드입니다. 프로젝트 진행률과 담당자별 현황을 실시간으로 시각화합니다.

## 주요 기능

- **프로젝트 진행률 모니터링**: 전체/완료/진행중/대기 태스크 현황
- **카테고리별 분석**: 카테고리별 진행률 및 태스크 분포 차트
- **담당자별 대시보드**: 개인별 상세 진행 현황 및 마감일 관리
- **다크/라이트 테마**: 사이버펑크 글래스모피즘 디자인

## 기술 스택

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **Database**: Supabase
- **Charts**: Recharts
- **Animations**: Framer Motion
- **Icons**: Lucide React

## 시작하기

### 환경 변수 설정

`.env.local` 파일을 생성하고 Supabase 연결 정보를 설정합니다:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 설치 및 실행

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev

# 프로덕션 빌드
npm run build

# 프로덕션 서버 실행
npm run start
```

[http://localhost:3000](http://localhost:3000)에서 대시보드를 확인할 수 있습니다.

## 프로젝트 구조

```
app/
├── page.tsx                    # 메인 대시보드
├── assignee/[name]/page.tsx    # 담당자별 상세 페이지
├── layout.tsx                  # 루트 레이아웃
└── globals.css                 # 전역 스타일 (테마 변수)

components/
├── charts/                     # Recharts 차트 컴포넌트
├── dashboard/                  # 대시보드 섹션 컴포넌트
├── layout/                     # 레이아웃 컴포넌트
└── ui/                         # 재사용 UI 컴포넌트

lib/
├── supabase.ts                 # Supabase 클라이언트 및 데이터 함수
└── theme-context.tsx           # 테마 컨텍스트
```

## 데이터베이스 스키마

Supabase `tasks` 테이블:

| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | int | Primary Key |
| num | int | 태스크 번호 |
| category | text | 카테고리 |
| task_title | text | 태스크 제목 |
| description | text | 설명 |
| assignee | text | 담당자 |
| start_date | date | 시작일 |
| due_date | date | 마감일 |
| progress | int | 진행률 (0-100) |
| memo | text | 메모 |

## 배포

Vercel에서 쉽게 배포할 수 있습니다:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

환경 변수를 Vercel 프로젝트 설정에서 추가해야 합니다.
