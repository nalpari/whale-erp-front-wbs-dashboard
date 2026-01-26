# Technical Specification: 화면설계서 게시판

## Task Summary
헤더에 '화면설계서' 메뉴를 추가하고, 게시판 형태의 문서 목록 페이지를 구현한다. 파일 업로드 기능과 리스트 출력 기능을 포함한다.

## Complexity Assessment
**Level: Medium**
- 새로운 페이지 및 라우트 추가
- 새로운 Supabase 테이블 설계
- 모달 컴포넌트 구현
- 파일 업로드 기능 (Supabase Storage)
- 기존 테마 및 스타일 패턴 재사용

---

## Technical Context

### Dependencies
- Next.js 16.1.2 (App Router)
- React 19.2.3
- Supabase (Database + Storage)
- Framer Motion 12 (애니메이션)
- Lucide React (아이콘)
- Tailwind CSS v4

### Existing Patterns to Reuse
- `GlowCard` 컴포넌트 (카드 래퍼)
- `TaskCreateModal` 패턴 (모달 구조 및 애니메이션)
- Header 컴포넌트 네비게이션 확장
- Supabase 클라이언트 패턴 (`lib/supabase.ts`)
- CSS 변수 기반 테마 시스템

---

## Implementation Approach

### 1. Data Model

#### Supabase 테이블: `screen_designs`
```sql
create table screen_designs (
  id bigint primary key generated always as identity,
  document_name text not null,           -- 문서명
  file_url text not null,                -- Supabase Storage URL
  file_name text not null,               -- 원본 파일명
  author text not null,                  -- 작성자
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- 최근 업데이트 순 정렬을 위한 인덱스
create index idx_screen_designs_updated_at on screen_designs(updated_at desc);
```

#### Supabase Storage 버킷: `screen-designs`
- 공개 접근 가능 (다운로드 버튼용)
- 파일 타입 제한: PDF, 이미지 파일

### 2. API Layer

`lib/supabase.ts`에 추가할 함수:
```typescript
interface ScreenDesign {
  id: number
  document_name: string
  file_url: string
  file_name: string
  author: string
  created_at: string
  updated_at: string
}

// 화면설계서 목록 조회 (최근 업데이트 순)
getScreenDesigns(): Promise<ScreenDesign[]>

// 화면설계서 업로드
uploadScreenDesign(input: {
  file: File
  author: string
}): Promise<ScreenDesign>

// 화면설계서 삭제 (향후 확장용)
deleteScreenDesign(id: number): Promise<void>
```

### 3. Component Architecture

```
app/
└── screen-designs/
    └── page.tsx              # 화면설계서 메인 페이지 (Server Component)

components/
└── ui/
    └── ScreenDesignUploadModal.tsx  # 업로드 모달
```

### 4. UI Design

#### 페이지 레이아웃
- 헤더 하단에 페이지 타이틀 및 업로드 버튼
- 테이블 형태의 리스트 (glass 스타일)
- 반응형 디자인 (모바일에서는 카드 형태)

#### 테이블 컬럼
| 컬럼 | 설명 |
|------|------|
| 번호 | 행 번호 (역순) |
| 문서명 | 파일명에서 확장자 제거 또는 사용자 지정 |
| 업데이트 날짜 | YYYY.MM.DD 형식 |
| 작성자 | 업로드 시 입력한 이름 |
| 다운로드 | 아이콘 버튼 → file_url로 다운로드 |

#### 업로드 모달
- 파일 선택 (drag & drop 지원)
- 작성자 이름 입력
- 제출/취소 버튼

---

## Source Code Changes

### Files to Create
1. `app/screen-designs/page.tsx` - 게시판 페이지
2. `components/ui/ScreenDesignUploadModal.tsx` - 업로드 모달

### Files to Modify
1. `lib/supabase.ts` - 새로운 인터페이스 및 함수 추가
2. `components/layout/Header.tsx` - '화면설계서' 네비게이션 링크 추가

### Database Changes
1. Supabase 테이블 `screen_designs` 생성
2. Supabase Storage 버킷 `screen-designs` 생성

---

## Verification Approach

### 기능 테스트
1. 헤더에서 '화면설계서' 클릭 시 페이지 이동 확인
2. 빈 목록 상태에서 적절한 메시지 표시
3. 업로드 버튼 클릭 시 모달 열림
4. 파일 선택 및 작성자 입력 후 업로드 성공
5. 업로드 후 목록에 새 항목 표시 (최상단)
6. 다운로드 버튼 클릭 시 파일 다운로드
7. 최근 업데이트 순 정렬 확인

### 빌드 검증
```bash
pnpm lint    # ESLint 검사
pnpm build   # 프로덕션 빌드
```

### UI 검증
- 다크/라이트 테마 전환 시 스타일 유지
- 모바일 반응형 레이아웃 확인
- 로딩 상태 및 에러 처리

---

## Risk Assessment

### 낮은 위험
- 기존 패턴 재사용으로 일관성 유지
- Supabase 클라이언트 이미 설정됨

### 중간 위험
- 파일 업로드 용량 제한 확인 필요
- Storage 버킷 권한 설정

### 대응 방안
- 파일 크기 제한 (예: 50MB)
- 업로드 실패 시 사용자 친화적 에러 메시지
