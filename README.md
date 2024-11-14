# 독서 커뮤니티 웹 애플리케이션

## 프로젝트 소개

React와 TypeScript를 기반으로 한 독서 커뮤니티 웹 애플리케이션입니다.
사용자들이 책에 대한 리뷰를 작성하고 공유할 수 있는 플랫폼입니다.

## 주요 기능

### 1. 인증 시스템

- 이메일/비밀번호 회원가입 및 로그인
- Google OAuth 소셜 로그인

### 2. 게시물 관리

- CRUD 기능 구현
- Toast UI Editor를 활용한 텍스트 에디터 지원
- 카테고리별 게시물 분류 (독후감, 독서 모임, 자유 게시판)
- 실시간 댓글 시스템

### 3. 도서 검색 및 연동

- Google Books API 연동
- 게시물 작성 시 도서 정보 자동 연동
- 도서 썸네일 및 메타 정보 표시

### 4. 페이지네이션 구현

Firebase Firestore를 활용한 커서 기반 페이지네이션 구현:

1. 데이터 흐름

   - 최초 12개의 문서를 불러옴
   - 첫 번째와 마지막 문서의 스냅샷을 저장
   - 이전/다음 페이지 이동 시 저장된 스냅샷을 기준으로 쿼리

2. 페이지네이션 로직

```typescript
const fetchPosts = async (
  direction: 'next' | 'prev',
  cursor: DocumentSnapshot | null,
  category?: string
) => {
  const postsQuery =
    direction === 'next'
      ? query(
          collection(db, 'posts'),
          where('category', '==', category),
          orderBy('createdAt', 'desc'),
          startAfter(cursor),
          limit(12)
        )
      : query(
          collection(db, 'posts'),
          where('category', '==', category),
          orderBy('createdAt', 'desc'),
          endBefore(cursor),
          limitToLast(12)
        );
};
```

3. 상태 관리
   - firstDoc: 현재 페이지의 첫 번째 문서
   - lastDoc: 현재 페이지의 마지막 문서
   - hasMore: 다음 페이지 존재 여부
   - hasPrevious: 이전 페이지 존재 여부

## 기술 스택

### Frontend

- React 18
- TypeScript
- Emotion (Styled Components)
- Toast UI Editor
- React Router v6

### Backend & Infrastructure

- Firebase
  - Authentication: 사용자 인증
  - Firestore: NoSQL 데이터베이스
  - Storage: 이미지 저장
  - Hosting: 웹 호스팅

### 개발 도구

- Vite
- ESLint
- Prettier