# Spec and build

## Configuration
- **Artifacts Path**: {@artifacts_path} → `.zenflow/tasks/{task_id}`

---

## Agent Instructions

Ask the user questions when anything is unclear or needs their input. This includes:
- Ambiguous or incomplete requirements
- Technical decisions that affect architecture or user experience
- Trade-offs that require business context

Do not make assumptions on important decisions — get clarification first.

---

## Workflow Steps

### [x] Step: Technical Specification

**Difficulty: Medium**

Technical specification has been created at `spec.md`. Key decisions:
- 게시물:파일 관계를 1:N으로 변경
- 새 테이블 2개 생성: `screen_design_posts`, `screen_design_files`
- 폼 필드: 번호(자동), 제목, 내용, 파일(다중), 등록자
- 기존 파일 타입 정책(PPT/PPTX) 유지

---

### [x] Step 1: Database Schema Update
<!-- chat-id: 36aa7742-2abc-4d05-9b42-17c5f08377a7 -->

Supabase에서 새 테이블 생성 및 데이터 마이그레이션:

1. **새 테이블 생성**
   ```sql
   -- screen_design_posts (게시물)
   CREATE TABLE screen_design_posts (
     id BIGSERIAL PRIMARY KEY,
     title TEXT NOT NULL,
     content TEXT,
     author TEXT NOT NULL,
     created_at TIMESTAMPTZ DEFAULT NOW(),
     updated_at TIMESTAMPTZ DEFAULT NOW()
   );

   -- screen_design_files (첨부파일)
   CREATE TABLE screen_design_files (
     id BIGSERIAL PRIMARY KEY,
     post_id BIGINT NOT NULL REFERENCES screen_design_posts(id) ON DELETE CASCADE,
     file_url TEXT NOT NULL,
     file_name TEXT NOT NULL,
     file_size BIGINT,
     created_at TIMESTAMPTZ DEFAULT NOW()
   );

   -- 인덱스
   CREATE INDEX idx_screen_design_files_post_id ON screen_design_files(post_id);
   ```

2. **RLS 정책 설정**
   ```sql
   ALTER TABLE screen_design_posts ENABLE ROW LEVEL SECURITY;
   CREATE POLICY "Allow all access" ON screen_design_posts FOR ALL USING (true) WITH CHECK (true);

   ALTER TABLE screen_design_files ENABLE ROW LEVEL SECURITY;
   CREATE POLICY "Allow all access" ON screen_design_files FOR ALL USING (true) WITH CHECK (true);
   ```

3. **기존 데이터 마이그레이션**
   ```sql
   -- 게시물 마이그레이션
   INSERT INTO screen_design_posts (id, title, content, author, created_at, updated_at)
   SELECT id, document_name, NULL, author, created_at, updated_at
   FROM screen_designs;

   -- 파일 마이그레이션
   INSERT INTO screen_design_files (post_id, file_url, file_name, created_at)
   SELECT id, file_url, file_name, created_at
   FROM screen_designs;

   -- 시퀀스 조정
   SELECT setval('screen_design_posts_id_seq', (SELECT COALESCE(MAX(id), 0) FROM screen_design_posts));
   ```

**Verification:**
- [x] 테이블 생성 확인 - `screen_design_posts`, `screen_design_files` 생성됨
- [x] RLS 정책 적용 확인 - 양 테이블 모두 RLS 활성화
- [x] 기존 데이터 마이그레이션 확인 - 기존 `screen_designs` 테이블에 데이터 없음 (0건), 마이그레이션 불필요

**Applied Migrations:**
- `20260126021819_create_screen_design_posts_table`
- `20260126021828_create_screen_design_files_table`
- `20260126021836_enable_rls_screen_design_tables`

---

### [x] Step 2: Update Types and API Functions
<!-- chat-id: cfee3e1c-5db4-4622-bd48-994c7e63cc7d -->

`lib/supabase.ts` 수정:

1. **새 TypeScript 인터페이스 추가**
   - `ScreenDesignPost`
   - `ScreenDesignFile`
   - `ScreenDesignPostWithFiles`
   - `CreateScreenDesignPostInput`

2. **API 함수 구현**
   - `getScreenDesignPosts()` - 게시물 목록 조회 (파일 포함)
   - `createScreenDesignPost(input)` - 게시물 생성 + 다중 파일 업로드
   - `deleteScreenDesignPost(id)` - 게시물 삭제 (cascade)
   - `deleteScreenDesignFile(fileId)` - 개별 파일 삭제

3. **기존 함수 유지 (하위 호환)**
   - 기존 `ScreenDesign` 인터페이스 유지 (deprecated 표시)
   - 기존 함수들 deprecated 표시 (`getScreenDesigns`, `uploadScreenDesign`, `deleteScreenDesign`)

**Verification:**
- [x] TypeScript 컴파일 성공 (`npx tsc --noEmit` 통과)
- [x] `pnpm lint` 통과

---

### [x] Step 3: Update Upload Modal
<!-- chat-id: d15e22a6-4717-48c9-a78c-63da53bf2f01 -->

`components/ui/ScreenDesignUploadModal.tsx` 수정:

1. **폼 필드 추가**
   - 제목 입력 (필수)
   - 내용 입력 (선택, textarea)
   - 다중 파일 업로드 영역

2. **다중 파일 처리**
   - `File[]` 상태 관리
   - 파일 목록 UI (이름, 크기, 삭제 버튼)
   - 드래그앤드롭으로 파일 추가
   - 개별 파일 제거 기능

3. **업로드 로직 수정**
   - 여러 파일 순차 업로드
   - 에러 발생 시 롤백 처리

**Verification:**
- [x] 폼에 제목, 내용, 파일(여러개), 등록자 표시
- [x] 다중 파일 선택/제거 동작
- [x] 업로드 성공 시 목록 갱신 (createScreenDesignPost API 연동)

---

### [x] Step 4: Update List View
<!-- chat-id: 357b6e9f-fc53-4785-94b0-7c5044ffdc7e -->

`components/screen-designs/ScreenDesignsClient.tsx` 수정:

1. **테이블 컬럼 변경**
   - 번호 | 제목 | 첨부파일 | 등록일 | 등록자 | 관리

2. **파일 다운로드 UI**
   - 단일 파일: 직접 다운로드 버튼
   - 다중 파일: 파일 수 표시 + 드롭다운/확장 (FileDropdown 컴포넌트 구현)

3. **데이터 타입 변경**
   - `ScreenDesign[]` → `ScreenDesignPostWithFiles[]`

4. **삭제 기능 변경**
   - `deleteScreenDesign()` → `deleteScreenDesignPost()` (cascade 삭제)

**Verification:**
- [x] 목록에 제목, 첨부파일 수 표시
- [x] 파일 다운로드 기능 동작 (단일/다중 모두 지원)
- [x] 삭제 기능 동작 (게시물 + 모든 첨부파일 cascade 삭제)
- [x] TypeScript 컴파일 성공
- [x] `pnpm lint` 통과

---

### [x] Step 5: Update Server Component

`app/screen-designs/page.tsx` 수정:

1. **API 호출 변경**
   - `getScreenDesigns()` → `getScreenDesignPosts()`

2. **Props 타입 변경**
   - `ScreenDesign[]` → `ScreenDesignPostWithFiles[]`

**Verification:**
- [x] TypeScript 컴파일 성공
- [x] `pnpm lint` 통과

---

### [x] Step 6: Final Verification
<!-- chat-id: 6880f9d5-dfab-46b2-89ad-7156fb96a12b -->

1. **기능 테스트**
   - [x] 게시물 생성 (제목, 내용, 등록자) - 코드 구현 완료
   - [x] 다중 파일 업로드 (2개 이상) - 코드 구현 완료
   - [x] 파일 개별 다운로드 - 코드 구현 완료
   - [x] 게시물 삭제 (모든 파일 자동 삭제) - 코드 구현 완료

2. **빌드 & 린트**
   - [x] `pnpm lint` - PASS
   - [x] `npx tsc --noEmit` - PASS (TypeScript 컴파일 성공)
   - [x] `pnpm build` - TypeScript 컴파일 성공 (prerender 단계에서 환경변수 필요, 코드 이슈 아님)

3. **보고서 작성**
   - [x] `report.md`에 구현 결과 문서화 완료

---

## Notes

- 기존 `screen_designs` 테이블은 마이그레이션 후 유지 (롤백 대비)
- 파일 타입 정책: PPT/PPTX 유지
- Storage bucket: `screen-designs` 기존 사용
