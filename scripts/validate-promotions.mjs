import { readFileSync } from 'node:fs'

const PLATFORMS = new Set([
  'TOSS',
  'COUPANG',
  'NAVER',
  'ELEVENST',
  'GMARKET',
  'SSG',
  'LOTTEON',
  'KURLY',
  'OLIVEYOUNG',
  'MUSINSA',
  'BAEMIN',
  'YOGIYO',
  'SAMSUNG_CARD',
  'HYUNDAI_CARD',
  'SHINHAN_CARD',
  'KB_CARD',
])
const CATEGORIES = new Set([
  'SHOPPING',
  'FOOD',
  'ELECTRONICS',
  'FASHION',
  'TRAVEL',
  'BEAUTY',
  'LIVING',
])

const file = process.argv[2] ?? 'data/promotions.json'
const errors = []

let data
try {
  data = JSON.parse(readFileSync(file, 'utf8'))
} catch (e) {
  console.error(`JSON 파싱 실패: ${e.message}`)
  process.exit(1)
}

if (!Array.isArray(data)) {
  console.error('루트가 배열이 아닙니다')
  process.exit(1)
}
if (data.length === 0) errors.push('항목 0건 — 빈 데이터는 배포하지 않습니다')
if (data.length > 200) errors.push(`항목 ${data.length}건 — 200건 초과`)

const ids = new Set()
const isUrl = (v) => typeof v === 'string' && /^https?:\/\//.test(v)

data.forEach((p, i) => {
  const at = `[${i}] ${p?.id ?? '?'}`
  if (!p.id || typeof p.id !== 'string') errors.push(`${at}: id 누락`)
  else if (ids.has(p.id)) errors.push(`${at}: id 중복`)
  else ids.add(p.id)

  if (!p.title || typeof p.title !== 'string') errors.push(`${at}: title 누락`)
  if (!PLATFORMS.has(p.platform)) errors.push(`${at}: platform 허용 외 값 "${p.platform}"`)
  if (!CATEGORIES.has(p.category)) errors.push(`${at}: category 허용 외 값 "${p.category}"`)
  if (!p.startDate || Number.isNaN(Date.parse(p.startDate))) errors.push(`${at}: startDate 파싱 불가`)
  if (p.endDate != null) {
    if (Number.isNaN(Date.parse(p.endDate))) errors.push(`${at}: endDate 파싱 불가`)
    else if (Date.parse(p.endDate) < Date.parse(p.startDate)) errors.push(`${at}: endDate가 startDate보다 빠름`)
  }
  // 출처 없는 항목은 싣지 않는다 — 큐레이션 데이터의 신뢰 계약
  if (!isUrl(p.sourceUrl)) errors.push(`${at}: sourceUrl(출처 URL) 필수`)
  if (p.affiliateUrl != null && !isUrl(p.affiliateUrl)) errors.push(`${at}: affiliateUrl 형식 오류`)
  if (typeof p.isActive !== 'boolean') errors.push(`${at}: isActive가 boolean이 아님`)
  for (const numField of ['minSpend', 'maxDiscountAmount']) {
    if (p[numField] != null && (typeof p[numField] !== 'number' || p[numField] <= 0)) {
      errors.push(`${at}: ${numField}는 양수 또는 null`)
    }
  }
  if (
    p.discountRate != null &&
    (typeof p.discountRate !== 'number' || p.discountRate <= 0 || p.discountRate > 100)
  ) {
    errors.push(`${at}: discountRate 범위 오류 (1~100 또는 null)`)
  }
})

if (errors.length) {
  console.error(errors.join('\n'))
  process.exit(1)
}
console.log(`OK — ${data.length}건 검증 통과`)
