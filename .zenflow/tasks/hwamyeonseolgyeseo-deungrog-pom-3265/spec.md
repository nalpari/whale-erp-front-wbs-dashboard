# Technical Specification: 화면설계서 등록 폼 수정

## Task Difficulty: **Medium**

이 태스크는 기존 1:1 관계(게시물:파일)를 1:N 관계로 변경하는 작업입니다. 데이터 모델 변경, 새로운 테이블 생성, 폼 UI 수정, 파일 업로드/다운로드 로직 수정이 필요합니다.

---

## Technical Context

- **Framework:** Next.js 16 with App Router
- **Language:** TypeScript 5 (strict mode)
- **Styling:** Tailwind CSS v4 + CSS 변수 기반 cyberpunk 테마
- **Database:** Supabase (PostgreSQL)
- **Storage:** Supabase Storage (bucket: `screen-designs`)
- **UI Libraries:** Framer Motion, Lucide React

---

## Current Architecture Analysis

### Current Data Model

**Table: `screen_designs`** (1:1 파일 관계)
```
- id (bigint, PK)
- document_name (text)      -- 파일명에서 추출
- file_url (text)           -- 단일 파일 URL
- file_name (text)          -- 원본 파일명
- author (text)
- created_at (timestamptz)
- updated_at (timestamptz)
```

### Current Form Fields
- 파일 (단일 선택, PPT/PPTX만)
- 작성자

### Current Issues
- 게시물당 하나의 파일만 저장 가능
- 제목/내용 필드 없음
- 파일 정보가 게시물 테이블에 직접 저장됨

---

## Target Architecture

### New Data Model (1:N 관계)

**Table: `screen_design_posts`** (게시물)
```sql
CREATE TABLE screen_design_posts (
  id BIGSERIAL PRIMARY KEY,
  title TEXT NOT NULL,                    -- 제목
  content TEXT,                           -- 내용
  author TEXT NOT NULL,                   -- 등록자
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS 정책
ALTER TABLE screen_design_posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access" ON screen_design_posts FOR ALL USING (true) WITH CHECK (true);
```

**Table: `screen_design_files`** (첨부파일)
```sql
CREATE TABLE screen_design_files (
  id BIGSERIAL PRIMARY KEY,
  post_id BIGINT NOT NULL REFERENCES screen_design_posts(id) ON DELETE CASCADE,
  file_url TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_size BIGINT,                       -- 파일 크기 (bytes)
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 인덱스
CREATE INDEX idx_screen_design_files_post_id ON screen_design_files(post_id);

-- RLS 정책
ALTER TABLE screen_design_files ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access" ON screen_design_files FOR ALL USING (true) WITH CHECK (true);
```

### Relationship
```
screen_design_posts (1) ←→ (N) screen_design_files
```

### New Form Fields
1. **제목** (필수) - 게시물 제목
2. **내용** (선택) - 게시물 설명/내용
3. **파일** (필수, 여러개) - 드래그앤드롭 다중 파일 업로드
4. **등록자** (필수) - 작성자 이름

---

## Implementation Approach

### Phase 1: Database Schema Update
1. Supabase에서 새 테이블 생성 (`screen_design_posts`, `screen_design_files`)
2. 기존 `screen_designs` 테이블 데이터 마이그레이션 (기존 데이터 보존)
3. RLS 정책 및 인덱스 설정

### Phase 2: Type & API Updates (`lib/supabase.ts`)
1. 새로운 TypeScript 인터페이스 정의
   - `ScreenDesignPost` (게시물)
   - `ScreenDesignFile` (파일)
   - `ScreenDesignPostWithFiles` (조인된 데이터)
2. API 함수 수정/추가
   - `getScreenDesignPosts()` - 게시물 목록 조회 (파일 포함)
   - `getScreenDesignPost(id)` - 단일 게시물 조회
   - `createScreenDesignPost(input)` - 게시물 생성 + 파일 업로드
   - `updateScreenDesignPost(id, input)` - 게시물 수정
   - `deleteScreenDesignPost(id)` - 게시물 삭제 (cascade로 파일 자동 삭제)
   - `addFilesToPost(postId, files)` - 기존 게시물에 파일 추가
   - `deleteFile(fileId)` - 개별 파일 삭제

### Phase 3: Upload Modal Redesign (`ScreenDesignUploadModal.tsx`)
1. 폼 필드 추가
   - 제목 입력 필드
   - 내용 입력 필드 (textarea)
   - 다중 파일 업로드 영역
2. 다중 파일 처리
   - 파일 목록 표시 (이름, 크기, 삭제 버튼)
   - 드래그앤드롭으로 파일 추가
   - 개별 파일 제거 기능
3. 폼 검증 로직 수정
4. 업로드 프로그레스 표시

### Phase 4: List View Update (`ScreenDesignsClient.tsx`)
1. 테이블 구조 변경
   - 번호, 제목, 첨부파일 수, 등록일, 등록자, 관리
2. 파일 다운로드 UI 변경
   - 단일 파일: 직접 다운로드
   - 다중 파일: 드롭다운 또는 확장 뷰
3. 상세 보기 모달 또는 페이지 추가 고려

---

## Source Code Structure Changes

### Files to Modify

| File | Changes |
|------|---------|
| `lib/supabase.ts` | 새 인터페이스 및 API 함수 추가 |
| `components/ui/ScreenDesignUploadModal.tsx` | 폼 필드 추가, 다중 파일 업로드 |
| `components/screen-designs/ScreenDesignsClient.tsx` | 테이블 구조 변경, 파일 목록 표시 |
| `app/screen-designs/page.tsx` | 새 API 함수 호출로 변경 |

### Files to Create (Optional)

| File | Purpose |
|------|---------|
| `components/ui/MultiFileUpload.tsx` | 재사용 가능한 다중 파일 업로드 컴포넌트 |
| `components/screen-designs/FileListDropdown.tsx` | 파일 목록 드롭다운 컴포넌트 |

---

## Data Model Changes

### New TypeScript Interfaces

```typescript
// 게시물 (파일 제외)
export interface ScreenDesignPost {
  id: number
  title: string
  content: string | null
  author: string
  created_at: string
  updated_at: string
}

// 첨부파일
export interface ScreenDesignFile {
  id: number
  post_id: number
  file_url: string
  file_name: string
  file_size: number | null
  created_at: string
}

// 게시물 + 파일 (조인 결과)
export interface ScreenDesignPostWithFiles extends ScreenDesignPost {
  files: ScreenDesignFile[]
}

// 게시물 생성 입력
export interface CreateScreenDesignPostInput {
  title: string
  content?: string | null
  author: string
  files: File[]
}
```

---

## API Changes

### New Endpoints/Functions

```typescript
// 게시물 목록 조회 (파일 포함)
async function getScreenDesignPosts(): Promise<ScreenDesignPostWithFiles[]>

// 단일 게시물 조회
async function getScreenDesignPost(id: number): Promise<ScreenDesignPostWithFiles>

// 게시물 생성 (파일 업로드 포함)
async function createScreenDesignPost(input: CreateScreenDesignPostInput): Promise<ScreenDesignPostWithFiles>

// 게시물 삭제 (파일 자동 삭제)
async function deleteScreenDesignPost(id: number): Promise<void>

// 개별 파일 삭제
async function deleteScreenDesignFile(fileId: number): Promise<void>
```

---

## Verification Approach

### 1. Database Verification
- 새 테이블 생성 확인
- 외래 키 관계 확인 (CASCADE DELETE)
- 기존 데이터 마이그레이션 확인

### 2. Functional Verification
- [ ] 게시물 생성 (제목, 내용, 등록자)
- [ ] 다중 파일 업로드 (2개 이상)
- [ ] 파일 개별 삭제
- [ ] 게시물 삭제 시 모든 파일 자동 삭제
- [ ] 파일 다운로드 기능 유지

### 3. UI Verification
- [ ] 폼에 번호, 제목, 내용, 파일(여러개), 등록자 표시
- [ ] 목록에 첨부파일 수 표시
- [ ] 반응형 디자인 유지 (모바일/데스크톱)
- [ ] 기존 테마/스타일 유지

### 4. Build & Lint
```bash
pnpm lint
pnpm build
```

---

## Migration Strategy

기존 `screen_designs` 테이블의 데이터를 새 구조로 마이그레이션:

```sql
-- 1. 기존 데이터를 screen_design_posts로 마이그레이션
INSERT INTO screen_design_posts (id, title, content, author, created_at, updated_at)
SELECT id, document_name, NULL, author, created_at, updated_at
FROM screen_designs;

-- 2. 기존 파일 정보를 screen_design_files로 마이그레이션
INSERT INTO screen_design_files (post_id, file_url, file_name, created_at)
SELECT id, file_url, file_name, created_at
FROM screen_designs;

-- 3. 시퀀스 조정 (필요시)
SELECT setval('screen_design_posts_id_seq', (SELECT MAX(id) FROM screen_design_posts));
```

---

## Risk Assessment

| Risk | Mitigation |
|------|------------|
| 기존 데이터 손실 | 마이그레이션 전 백업, 단계별 실행 |
| 파일 업로드 실패 시 부분 데이터 | 트랜잭션 처리, 롤백 로직 |
| 대용량 파일 업로드 타임아웃 | 개별 파일 순차 업로드, 진행률 표시 |

---

## File Type Policy

현재 PPT/PPTX만 허용하는 정책을 유지할지 결정 필요:
- **Option A:** 기존 유지 (PPT/PPTX만)
- **Option B:** 확장 (PDF, 이미지 등 추가)

→ 현재 요구사항에 명시되지 않았으므로 **기존 PPT/PPTX 정책 유지**

---

## Implementation Plan

자세한 구현 단계는 `plan.md`에 정의됩니다.
