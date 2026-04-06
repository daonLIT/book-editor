# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Purpose

A book editor for writing books and previewing print layout. (클로드 코드 연습용 책을 쓰고 프린트했을 때 어떤 모양으로 생겼는지 확인할 수 있는 책 편집기)

## 기술 스택
- React: 프론트엔드 UI
- TypeScript: 프론트엔드 UI
- Tailwind CSS for UI styling
- python: 백엔드(보조 스크립트 / export 처리 / 서버 보조 로직 등)
- PostgreSQL: 추후 문서 저장용
- Browser print stylesheet
- Playwright: print preview 검증 및 PDF export 테스트

## 프로젝트 아키텍쳐
1. Editor Layer
    - 원고 작성 UI
    - 블록/텍스트 편집
    - selection, cursor, undo/redo 처리
2. Document Model Layer
    - 책의 구조화된 내부 데이터 모델
    - chapter, section, paragraph, image, code block 등 표현
3. Layout Engine Layer
    - 문서 모델을 페이지 단위 레이아웃으로 변환
    - page size, margin, line height, widow/orphan, page break 처리
4. Preview / Render Layer
    - 페이지 미리보기 렌더링
    - 화면용 뷰와 프린트용 뷰 제공
5. Persistence / Export Layer
    - local storage 또는 DB 저장
    - import/export
    - PDF 출력 또는 print stylesheet 생성

## 구현 우선순위
1. 문서 모델
2. 기본 레이아웃
3. 더미 데이터 기반 미리보기
4. 에디터 입력
5. 저장 기능
6. 실제 레이아웃 엔진 고도화


## 코드 규칙
- 환경변수는 dotenv로 관리, .env 파일은 커밋하지 않음
- 응답은 한국어
- 커밋 메시지는 한국어로 작성
- 변수명과 함수명은 영어 사용
- 주석은 한국어로 

## 규칙
- 초기단계이므로 과하게 만들지 않고 기능 테스트와 레이아웃을 위주로 구현한다.
  - 초기 구현에서는 협업 기능 추가 금지
  - 초기 구현에서는 PostgreSQL 연동 보류 가능
  - 초기 구현에서는 정밀 조판보다 mock pagination 우선
  - 초기 구현에서는 block editor보다 textarea/prose editor 기반 단순 구현 허용
- 기능은 한 번에 여러 개가 아니라 한 개씩 제작한다.