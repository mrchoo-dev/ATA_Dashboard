# ATA Cloud Dashboard

팀원이 회사 PC, 모바일, 집 PC에서 같은 URL로 접속하는 Vercel용 ATA 모니터링 대시보드입니다.

## 목적

- 워시콤보 카테고리 안에서 LG 대표 item name과 삼성 대표 item name 비교
- 쿠팡, G마켓, 하이마트 3개 채널 우선 모니터링
- item name 지속 추가
- ATA 기준가 대비 최저가, 차이, 조회 이력 확인
- 추후 네이버쇼핑/다나와 채널 확장 가능

## 로컬 실행

개발하거나 배포 전 화면을 내 PC에서 확인하려면 Node.js가 필요합니다.
팀원들은 배포된 Vercel URL만 접속하므로 Node.js를 설치할 필요가 없습니다.

```bash
npm install
npm run dev
```

브라우저에서 `http://localhost:3000`을 엽니다.

Supabase 환경변수가 없으면 샘플 데이터로 뜹니다.

## Supabase 세팅

1. Supabase 프로젝트 생성
2. SQL Editor에서 `supabase/schema.sql` 실행
3. Vercel 환경변수에 아래 값 등록

```text
SUPABASE_URL=...
SUPABASE_SERVICE_ROLE_KEY=...
CRON_SECRET=임의의 긴 문자열
```

## Vercel 배포

가장 쉬운 방식은 GitHub에 올리고 Vercel에서 Import Project를 누르는 방식입니다.
이 경우 내 PC에서 Vercel 서버를 계속 켜둘 필요가 없습니다.

```bash
npm install -g vercel
vercel
vercel --prod
```

또는 GitHub에 올린 뒤 Vercel에서 Import Project를 해도 됩니다.

## 운영 화면 기준

1차 화면은 워시콤보 카테고리 기준입니다.

- 행: 쿠팡, G마켓, 하이마트
- 열: LG item name, LG 최저가, LG ATA 차이, 삼성 item name, 삼성 최저가, 삼성 ATA 차이
- 우측: AI 추천 후보
- 하단: 가격 추이
- 버튼: item name 추가

네이버쇼핑/다나와는 `channels` 테이블에 이미 비활성 상태로 시드되어 있습니다.
나중에 활성화하면 같은 구조로 확장할 수 있습니다.

## 자동 조회

`vercel.json`에 매일 00:10 실행되도록 설정되어 있습니다.

```json
{
  "path": "/api/capture",
  "schedule": "10 0 * * *"
}
```

수동 실행은 아래처럼 secret을 붙여 호출합니다.

```text
https://your-app.vercel.app/api/capture?secret=CRON_SECRET값
```

## 주의

현재 수집기는 서버리스 환경에서 URL HTML을 읽고 가격 후보를 추출하는 1차 버전입니다.
쿠팡/G마켓/하이마트가 동적 렌더링, 봇 차단, 쿠폰가 계산을 강하게 적용하면 별도 수집봇 또는 Playwright 기반 크롤러로 분리하는 것이 안정적입니다.
