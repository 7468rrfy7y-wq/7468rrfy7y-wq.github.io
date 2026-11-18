import base64, re, sys, os
os.chdir(os.path.dirname(os.path.abspath(__file__)))
cafe = open(os.path.join(os.path.dirname(os.path.abspath(__file__)),'..','sajucafe','index.html'), encoding='utf-8').read()
js_cafe = cafe[cafe.index('<script>\n/*') + 9: cafe.rindex('</script>')]

def sect(a, b):
    i = js_cafe.index(a); j = js_cafe.index(b, i)
    return js_cafe[i:j]

util = sect('/* ---------------- 유틸', '/* ---------------- 초기화')
fig = sect('/* ---------------- 캐릭터', '/* ---------------- 사람들')
fxau = sect('/* ---------------- 파티클', '/* ---------------- 입력')
net = sect('/* ---------------- 같이 접속', '/* ---------------- 로더')
loader = js_cafe[js_cafe.index('/* ---------------- 로더'):]

def rep(s, a, b):
    assert s.count(a) == 1, a[:70]
    return s.replace(a, b)

# 사장님 리본 머리끈
fig = rep(fig, "if(f){mesh(new THREE.SphereGeometry(0.13,14,10),hair,0,0.04,-0.33,head);const pin=",
          "if(f&&o.bow){mesh(new THREE.SphereGeometry(0.14,14,10),hair,0,0.1,-0.3,head);const bw=M(0xfbf8f2,0.9);for(const s of [-1,1]){const l=mesh(new THREE.SphereGeometry(0.1,10,8),bw,s*0.1,0.2,-0.33,head);l.scale.set(1.2,0.75,0.45);l.rotation.z=s*0.5;}mesh(new THREE.SphereGeometry(0.045,8,8),bw,0,0.2,-0.36,head);}\n else if(f){mesh(new THREE.SphereGeometry(0.13,14,10),hair,0,0.04,-0.33,head);const pin=")

# 오디오: 술집 템포 · 거리 소음 작게 · 효과음 추가
fxau = rep(fxau, "wg.gain.value=0.34;", "wg.gain.value=0.04;")
fxau = rep(fxau, "lg.gain.value=0.22;", "lg.gain.value=0.02;")
fxau = rep(fxau, "const SP=60/72/2;", "const SP=60/60/2;")
fxau = rep(fxau, "const CH=[[53,57,60,64],[52,55,59,62],[50,53,57,60],[48,52,55,59,62]],PENTA=[72,74,76,79,81,84,86];",
          "const CH=[[53,57,60,64,67],[52,55,59,62,66],[50,53,57,60,64],[55,59,62,65,69]],PENTA=[72,76,79,81,83,86,88];")
fxau = rep(fxau, " if(kind==='step'){tone(300,0.08,'sine',0.05);}}",
 """ if(kind==='step'){tone(300,0.08,'sine',0.05);}
 if(kind==='clink'){[2637,3136,3951].forEach((f,i)=>tone(f,0.5,'sine',0.09,i*0.012));tone(2093,0.35,'triangle',0.05,0.09);[2637,3520].forEach((f,i)=>tone(f,0.4,'sine',0.06,0.14+i*0.01));}
 if(kind==='pour'){const b=ctx.createBuffer(1,ctx.sampleRate*1.9,ctx.sampleRate),d=b.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=(Math.random()*2-1)*Math.min(1,i/4000)*(1-i/d.length*0.6);
  const s=ctx.createBufferSource(),f=ctx.createBiquadFilter(),g=ctx.createGain();f.type='bandpass';f.frequency.value=1400;f.Q.value=0.8;g.gain.value=0.22;s.buffer=b;s.connect(f);f.connect(g);g.connect(AU.master);s.start();
  f.frequency.linearRampToValueAtTime(700,t+1.8);}}""")

# 같이 접속: 방 이름 · 문장 · 잔 · 짠
net = rep(net, "const PHRASES=['안녕하세요 👋','반가워요 😊','사주 진짜 잘 맞아요!','마라맛 무서워요 🌶','노을 미쳤다…','같이 사진 찍어요 📸','소금빵 맛있어요 🥐','또 만나요 👋'];",
          "const PHRASES=['안녕하세요 👋','여기 명품관 같다 ✨','세일 뭐 있어요?','쿠팡관 가봐요 🚀','알리관 구경 ✈️','네이버관 고급지다 🛍️','같이 사진 찍어요 📸','또 만나요 👋'];")
net = rep(net, "topic:'yangjapalja-cafe/v2/oceanview'", "topic:'lia-online-department/v1/main'")
net = rep(net, "toast('👥 같이 접속 연결됨 · 다른 손님들이 보여요');", "toast('👥 같이 접속 연결됨 · 다른 손님들도 쇼핑 중이에요');")

# 캐롤: 징글벨(1857, 저작권 만료) 라운지 편곡 — 멜로디·코드·방울 전부 합성
fxau = rep(fxau, "const tick=()=>{if(!AU.ctx)return;while(next<ctx.currentTime+0.35){const s=step%32,bar=Math.floor(step/8)%4;", "const tickOld=()=>{if(!AU.ctx)return;while(next<ctx.currentTime+0.35){const s=step%32,bar=Math.floor(step/8)%4;")
fxau = rep(fxau, " AU.timer=setInterval(tick,90);", """ const B=60/100;
 const nE=76,nG=79,nC=72,nD=74,nF=77;
 const MEL=[[nE,1],[nE,1],[nE,2],[nE,1],[nE,1],[nE,2],[nE,1],[nG,1],[nC,1.5],[nD,.5],[nE,4],
  [nF,1],[nF,1],[nF,1.5],[nF,.5],[nF,1],[nE,1],[nE,1],[nE,.5],[nE,.5],[nE,1],[nD,1],[nD,1],[nE,1],[nD,2],[nG,2],
  [nE,1],[nE,1],[nE,2],[nE,1],[nE,1],[nE,2],[nE,1],[nG,1],[nC,1.5],[nD,.5],[nE,4],
  [nF,1],[nF,1],[nF,1.5],[nF,.5],[nF,1],[nE,1],[nE,1],[nE,.5],[nE,.5],[nG,1],[nG,1],[nF,1],[nD,1],[nC,4]];
 const CHD={C:[48,52,55,59],F:[53,57,60,64],D7:[50,54,57,60],G7:[43,47,50,53]};
 const PROG=['C','C','C','C','F','C','D7','G7','C','C','C','C','F','C','G7','C'];
 const nb=ctx.createBuffer(1,Math.floor(ctx.sampleRate*0.14),ctx.sampleRate),nd=nb.getChannelData(0);for(let i=0;i<nd.length;i++)nd[i]=(Math.random()*2-1)*Math.pow(1-i/nd.length,3);
 const shk=(t,v)=>{const s=ctx.createBufferSource(),hp=ctx.createBiquadFilter(),g=ctx.createGain();s.buffer=nb;hp.type='highpass';hp.frequency.value=6500;g.gain.value=v;s.connect(hp);hp.connect(g);g.connect(mus);s.start(t);};
 let mi=0,mt=ctx.currentTime+0.5,bt=mt,beat=0;
 const tick=()=>{if(!AU.ctx)return;const hz=ctx.currentTime+0.4;
  while(mt<hz){const [n,d]=MEL[mi];note(mf(n),mt,d*B*0.9+0.25,'triangle',0.075,0.01);note(mf(n+12),mt,0.7,'sine',0.022,0.004);mt+=d*B;mi=(mi+1)%MEL.length;}
  while(bt<hz){const bar=Math.floor(beat/4)%16,bb=beat%4,c=CHD[PROG[bar]];
   if(bb===0){c.forEach(n=>note(mf(n+12),bt,B*3.8,'sine',0.03,0.12));note(mf(c[0]-12),bt,B*1.8,'sine',0.11,0.02);}
   if(bb===2)note(mf(c[2]-12),bt,B*1.8,'sine',0.08,0.02);
   shk(bt,bb%2?0.07:0.035);shk(bt+B/2,0.025);bt+=B;beat++;}};
 AU.timer=setInterval(tick,90);""")
main = open('main.js', encoding='utf-8').read()

html = open('shell.html', encoding='utf-8').read()
js = (main + "\n" + util + "\n" + fig + "\n" + fxau + "\n" + net + "\n" + loader)
html = html.replace('/*__JS__*/', js)
open('../../dept/index.html', 'w', encoding='utf-8').write(html)
print('ok', len(html))
