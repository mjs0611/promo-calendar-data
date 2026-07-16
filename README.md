# promo-calendar-data

쏠쏠달력(promo-calendar) 미니앱의 프로모션 데이터 저장소입니다.
데일리 큐레이션 루틴이 공식 이벤트·보도자료 기반으로 `promotions.json`을 갱신합니다.

- 모든 항목은 `sourceUrl`(출처)과 기간 필수, 날짜는 KST(+09:00) 명시
- 스키마 검증: `node scripts/validate-promotions.mjs promotions.json`
- 앱은 raw URL로 이 파일을 읽습니다 (이 레포는 public 필수)
