# Implementation Report: 화면설계서 등록 폼 수정

## Task Summary

기존 화면설계서 구조를 1:1 관계에서 **1:N 관계(게시물:파일)**로 변경하여, 하나의 게시물에 여러 첨부파일을 등록할 수 있도록 수정.

## Completed Steps

### 1. Database Schema Update

**새 테이블 생성:**
- `screen_design_posts` - 게시물 테이블
  - `id` (BIGSERIAL PRIMARY KEY)
  - `title` (TEXT NOT NULL)
  - `content` (TEXT)
  - `author` (TEXT NOT NULL)
  - `created_at`, `updated_at` (TIMESTAMPTZ)

- `screen_design_files` - 첨부파일 테이블
  - `id` (BIGSERIAL PRIMARY KEY)
  - `post_id` (BIGINT REFERENCES screen_design_posts ON DELETE CASCADE)
  - `file_url`, `file_name` (TEXT NOT NULL)
  - `file_size` (BIGINT)
  - `created_at` (TIMESTAMPTZ)

**적용된 마이그레이션:**
- `20260126021819_create_screen_design_posts_table`
- `20260126021828_create_screen_design_files_table`
- `20260126021836_enable_rls_screen_design_tables`

### 2. Types and API Functions

**새 TypeScript 인터페이스 (`lib/supabase.ts`):**
- `ScreenDesignPost` - 게시물 타입
- `ScreenDesignFile` - 첨부파일 타입
- `ScreenDesignPostWithFiles` - 게시물 + 파일 조합 타입
- `CreateScreenDesignPostInput` - 생성 입력 타입

**새 API 함수:**
- `getScreenDesignPosts()` - 게시물 목록 조회 (파일 포함)
- `createScreenDesignPost()` - 게시물 생성 + 다중 파일 업로드
- `deleteScreenDesignPost()` - 게시물 삭제 (cascade)
- `deleteScreenDesignFile()` - 개별 파일 삭제

**기존 함수 유지 (하위 호환):**
- `getScreenDesigns()` - @deprecated
- `uploadScreenDesign()` - @deprecated
- `deleteScreenDesign()` - @deprecated

### 3. Upload Modal Update

**변경된 폼 필드 (`components/ui/ScreenDesignUploadModal.tsx`):**
| 필드 | 타입 | 필수 |
|------|------|------|
| 제목 | text input | O |
| 내용 | textarea | X |
| 파일 | multiple file upload | O |
| 등록자 | text input | O |

**다중 파일 처리 기능:**
- 드래그 앤 드롭 지원
- 파일 목록 UI (이름, 크기, 삭제 버튼)
- 중복 파일 체크
- 업로드 실패 시 롤백 처리

### 4. List View Update

**테이블 컬럼 구조 (`components/screen-designs/ScreenDesignsClient.tsx`):**
| 컬럼 | 설명 |
|------|------|
| 번호 | 역순 인덱스 |
| 제목 | 게시물 제목 + 내용 미리보기 |
| 첨부파일 | FileDropdown 컴포넌트 |
| 등록일 | YYYY.MM.DD 형식 |
| 등록자 | 작성자명 |
| 관리 | 삭제 버튼 |

**FileDropdown 컴포넌트:**
- 파일 0개: "첨부파일 없음" 텍스트
- 파일 1개: 직접 다운로드 버튼
- 파일 2개+: 드롭다운 메뉴 (파일명, 크기, 다운로드)

### 5. Server Component Update

`app/screen-designs/page.tsx`에서 API 호출 변경:
- `getScreenDesigns()` → `getScreenDesignPosts()`

## Verification Results

| 검증 항목 | 결과 |
|----------|------|
| `pnpm lint` | PASS |
| `npx tsc --noEmit` | PASS |
| TypeScript 컴파일 | PASS |

**Build 참고:**
- `pnpm build`는 환경변수 없이 실행 시 실패 (Supabase URL 필요)
- TypeScript 컴파일 단계까지는 정상 통과
- 실제 운영 환경에서는 환경변수 설정 후 빌드 가능

## Changed Files

```
lib/supabase.ts                                  # 새 타입 및 API 함수 추가
components/ui/ScreenDesignUploadModal.tsx        # 다중 파일 업로드 폼
components/screen-designs/ScreenDesignsClient.tsx # 새 테이블 구조 + FileDropdown
app/screen-designs/page.tsx                      # API 호출 변경
```

## Feature Summary

### 게시물 생성
1. 제목 입력 (필수)
2. 내용 입력 (선택)
3. 파일 선택 (드래그 앤 드롭 또는 클릭, 여러 파일 가능)
4. 등록자 입력 (필수)
5. 업로드 버튼 클릭 → 게시물 생성 + 파일 업로드

### 파일 다운로드
- 단일 파일: 직접 다운로드 버튼
- 다중 파일: 드롭다운에서 개별 파일 다운로드

### 게시물 삭제
- 삭제 시 확인 다이얼로그 표시
- CASCADE 삭제로 모든 첨부파일 자동 삭제
- Storage 파일도 함께 삭제

## Notes

- 파일 타입 정책 유지: PPT/PPTX만 허용
- 파일 크기 제한: 50MB
- Storage bucket: `screen-designs` 기존 사용
- 기존 `screen_designs` 테이블은 롤백 대비 유지
