# 메타버스 원본 (사이트에는 안 나옴 — 밑줄 폴더는 깃허브 페이지가 제외)
- assarabia/: 앗싸라비아 원본 (main.js = 가게 전용, shell.html = 화면 틀, build.py = 사주카페 엔진 조각 + 사진 합쳐 assarabia/index.html 생성)
- sajucafe/index.html: 사주카페 원본 (엔진 공통부 출처)
- 고친 뒤: `bash _src/배포.sh "메시지"` 한 줄
- dept/: 온라인 백화점 원본 (main.js·shell.html·build.py → dept/index.html). 상품은 사이트 폴더 `dept/주문서/쿠팡.csv·알리.csv·네이버.csv`만 고치면 됨 (빌드 필요 없음)
