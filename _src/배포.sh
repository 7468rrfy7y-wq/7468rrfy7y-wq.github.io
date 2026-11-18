#!/bin/bash
# 한 줄 배포: bash _src/배포.sh "커밋 메시지"
# 1) 앗싸라비아 빌드(_src/assarabia → assarabia/index.html) 2) 사주카페 복사 3) 커밋·푸시 4) 실제 주소 반영 확인
set -e; cd "$(dirname "$0")/.."
python3 _src/assarabia/build.py
python3 _src/dept/build.py
cp _src/sajucafe/index.html sajucafe/index.html
git add -A assarabia sajucafe dept _src
git -c user.name="7468rrfy7y-wq" -c user.email="Lia_ceo@liacompany.kr" commit -q -m "$1" || { echo "바뀐 것 없음"; exit 0; }
git -c push.negotiate=true push -q origin main
sleep 50; for p in assarabia sajucafe dept; do echo "$p: $(curl -s -o /dev/null -w '%{http_code}' https://7468rrfy7y-wq.github.io/$p/)"; done
