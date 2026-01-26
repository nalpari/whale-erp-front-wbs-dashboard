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
<!-- chat-id: 534b16f0-d768-49ae-beb0-9a33935c9fb5 -->

**Complexity: Medium**

Technical specification created in `spec.md`:
- Data model: `screen_designs` Supabase 테이블
- Storage: `screen-designs` 버킷
- New page: `/screen-designs`
- New component: `ScreenDesignUploadModal`
- Modified files: `Header.tsx`, `supabase.ts`

---

### [x] Step: Database Setup
<!-- chat-id: e56b0b9f-bf41-4e9e-b796-c6b22009f86b -->

Supabase에서 테이블 및 스토리지 설정:

1. `screen_designs` 테이블 생성
   - id, document_name, file_url, file_name, author, created_at, updated_at
2. `screen-designs` Storage 버킷 생성
3. RLS 정책 및 버킷 권한 설정

**Verification:** Supabase 대시보드에서 테이블 및 버킷 확인

**완료 사항:**
- Migration: `create_screen_designs_table` 적용됨
- 테이블 RLS 정책: select/insert/delete 모두 public 허용
- Storage 버킷: `screen-designs` (public: true)
- Storage 정책: read/upload/delete 모두 public 허용

---

### [x] Step: API Layer Implementation
<!-- chat-id: 51741984-009b-424e-bac3-ff4089dd6360 -->

`lib/supabase.ts`에 화면설계서 관련 함수 추가:

1. `ScreenDesign` 인터페이스 정의
2. `getScreenDesigns()` 함수 (최근 업데이트 순 조회)
3. `uploadScreenDesign()` 함수 (파일 업로드 + DB 저장)
4. `deleteScreenDesign()` 함수 (향후 확장용)

**Verification:** 개발 환경에서 함수 호출 테스트

**완료 사항:**
- `ScreenDesign` 인터페이스 추가 (id, document_name, file_url, file_name, author, created_at, updated_at)
- `getScreenDesigns()`: 최근 업데이트 순 정렬로 목록 조회
- `uploadScreenDesign()`: Storage 업로드 + DB 레코드 생성 (실패 시 롤백 처리 포함)
- `deleteScreenDesign()`: Storage 파일 및 DB 레코드 삭제
- ESLint 검증 통과

---

### [x] Step: Upload Modal Component
<!-- chat-id: f1de05cc-d556-42a0-8f8c-baa328fa9d44 -->

`components/ui/ScreenDesignUploadModal.tsx` 생성:

1. 기존 `TaskCreateModal` 패턴 참고
2. 파일 선택 UI (드래그 앤 드롭 옵션)
3. 작성자 이름 입력 필드
4. 폼 유효성 검사
5. 업로드 진행 상태 표시
6. 에러 처리 및 메시지

**Verification:** 컴포넌트 렌더링 및 상태 변화 확인

**완료 사항:**
- `ScreenDesignUploadModal.tsx` 컴포넌트 생성
- `TaskCreateModal` 패턴 기반 일관된 스타일링
- 드래그 앤 드롭 파일 선택 UI 구현
- 작성자 이름 입력 필드 추가
- 폼 유효성 검사 (파일 필수, 작성자 필수, 50MB 제한)
- 로딩 상태 및 에러 처리 구현
- ESLint 검증 통과

---

### [x] Step: Screen Designs Page
<!-- chat-id: c50f7581-5ebf-4bb8-bd49-edafc4d14e26 -->

`app/screen-designs/page.tsx` 생성:

1. Server Component로 데이터 fetching
2. 테이블 형태 리스트 (번호, 문서명, 업데이트 날짜, 작성자, 다운로드)
3. 빈 목록 상태 UI
4. 업로드 버튼 (모달 트리거)
5. 다운로드 버튼 기능
6. 반응형 디자인

**Verification:** 페이지 접근 및 렌더링 확인

**완료 사항:**
- `app/screen-designs/page.tsx` Server Component 생성 (revalidate=60)
- `components/screen-designs/ScreenDesignsClient.tsx` Client Component 생성
- 데스크톱: 테이블 형태 (번호, 문서명, 업데이트 날짜, 작성자, 다운로드)
- 모바일: 카드 형태로 반응형 구현
- 빈 목록 상태 UI 구현 (아이콘 + 메시지 + 업로드 버튼)
- 다운로드 버튼 기능 구현
- 업로드 모달 통합 (ScreenDesignUploadModal)
- 문서 개수 표시
- 기존 테마 및 GlowCard 스타일 적용
- TypeScript/ESLint 검증 통과

---

### [x] Step: Header Navigation Update
<!-- chat-id: 5b274806-3758-4908-acf6-627daae3789a -->

`components/layout/Header.tsx` 수정:

1. '화면설계서' 메뉴 링크 추가
2. 현재 페이지 active 상태 표시 (선택사항)
3. 기존 스타일과 일관성 유지

**Verification:** 네비게이션 동작 확인

**완료 사항:**
- `FileText` 아이콘 import 추가
- `usePathname` hook으로 현재 경로 감지
- 네비게이션 섹션 추가 (로고와 우측 섹션 사이)
- '대시보드' 메뉴 (`/`) - 현재 페이지 active 상태 표시
- '화면설계서' 메뉴 (`/screen-designs`) - 현재 페이지 active 상태 표시
- 반응형 디자인 (md 이상에서만 표시)
- 기존 테마 스타일 유지 (neon-cyan 하이라이트, bg-glass 배경)
- ESLint 검증 통과

---

### [x] Step: Final Verification & Cleanup
<!-- chat-id: a9ae33c4-cb63-475a-ba80-6d71d0429b31 -->

전체 기능 테스트 및 마무리:

1. `pnpm lint` 실행 및 에러 수정
2. `pnpm build` 프로덕션 빌드 확인
3. 전체 플로우 테스트 (업로드 → 목록 → 다운로드)
4. 다크/라이트 테마 확인
5. 모바일 반응형 확인
6. `report.md` 작성

**Verification:** 모든 검증 항목 통과

**완료 사항:**
- `pnpm lint`: 모든 에러 수정 및 통과
  - 기존 파일들의 TypeScript 타입 오류 수정
  - 미사용 import 제거
  - React hooks 규칙 준수 수정
- `pnpm build`: 프로덕션 빌드 성공
- 업로드 모달: 정상 동작 확인
- 페이지 렌더링: 정상 동작 확인
- 다크/라이트 테마: 정상 전환 및 스타일 적용
- 모바일 반응형: 375px 뷰포트에서 정상 렌더링
- 네비게이션: 대시보드 ↔ 화면설계서 이동 정상
- `report.md` 작성 완료
