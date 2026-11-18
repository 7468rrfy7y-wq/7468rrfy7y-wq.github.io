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
fxau = rep(fxau, "wg.gain.value=0.34;", "wg.gain.value=0.11;")
fxau = rep(fxau, "lg.gain.value=0.22;", "lg.gain.value=0.05;")
fxau = rep(fxau, "const SP=60/72/2;", "const SP=60/100/2;")
fxau = rep(fxau, "const CH=[[53,57,60,64],[52,55,59,62],[50,53,57,60],[48,52,55,59,62]],PENTA=[72,74,76,79,81,84,86];",
          "const CH=[[48,52,55,59],[57,60,64,67],[53,57,60,64],[55,59,62,65]],PENTA=[72,74,76,79,81,84];")
fxau = rep(fxau, " if(kind==='step'){tone(300,0.08,'sine',0.05);}}",
 """ if(kind==='step'){tone(300,0.08,'sine',0.05);}
 if(kind==='clink'){[2637,3136,3951].forEach((f,i)=>tone(f,0.5,'sine',0.09,i*0.012));tone(2093,0.35,'triangle',0.05,0.09);[2637,3520].forEach((f,i)=>tone(f,0.4,'sine',0.06,0.14+i*0.01));}
 if(kind==='pour'){const b=ctx.createBuffer(1,ctx.sampleRate*1.9,ctx.sampleRate),d=b.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=(Math.random()*2-1)*Math.min(1,i/4000)*(1-i/d.length*0.6);
  const s=ctx.createBufferSource(),f=ctx.createBiquadFilter(),g=ctx.createGain();f.type='bandpass';f.frequency.value=1400;f.Q.value=0.8;g.gain.value=0.22;s.buffer=b;s.connect(f);f.connect(g);g.connect(AU.master);s.start();
  f.frequency.linearRampToValueAtTime(700,t+1.8);}}""")

# 같이 접속: 방 이름 · 문장 · 잔 · 짠
net = rep(net, "const PHRASES=['안녕하세요 👋','반가워요 😊','사주 진짜 잘 맞아요!','마라맛 무서워요 🌶','노을 미쳤다…','같이 사진 찍어요 📸','소금빵 맛있어요 🥐','또 만나요 👋'];",
          "const PHRASES=['안녕하세요 👋','짠~! 🍻','여기 생맥 맛있다','경산 사람 손! ✋','2차 여기로 와요','골뱅이 무침 각 🐚','같이 사진 찍어요 📸','또 만나요 👋'];")
net = rep(net, "topic:'yangjapalja-cafe/v2/oceanview'", "topic:'assarabia-gyeongsan/v1/pub'")
net = rep(net, "toast('👥 같이 접속 연결됨 · 다른 손님들이 보여요');", "toast('👥 같이 접속 연결됨 · 다른 손님들이랑 짠 할 수 있어요');")
net = rep(net, """ mesh(new THREE.BoxGeometry(0.44,0.025,0.3),M(0x8a5a3c,0.6),0,0,0,tr).castShadow=false;
 const br=mesh(new THREE.SphereGeometry(0.09,10,8),M(0xe0ac5e,0.85),-0.09,0.05,0,tr);br.scale.set(1.4,0.6,1);br.castShadow=false;""",
 """ tr.add(makeMug());""")
net = rep(net, "  else if(o.k==='happy'||o.k==='cry'){", """  else if(o.k==='cheers'){if(pe.full&&pe.full.visible){say(pe.full,'짠~! 🍻',2);const hp=pe.full.position.clone().add(new THREE.Vector3(0,2,0));spawn('🍻',hp,2,{size:0.3,up:1.2,life:1.2});}
   if(pe.pos.distanceTo(player.f.position)<5){sfx('clink');toast('🍻 '+pe.n+'님이 짠! 했어요');}}
  else if(o.k==='happy'||o.k==='cry'){""")

main = open('main.js', encoding='utf-8').read()
menu64 = base64.b64encode(open('menu.jpg', 'rb').read()).decode()
sign64 = base64.b64encode(open('sign.jpg', 'rb').read()).decode()

html = open('shell.html', encoding='utf-8').read()
js = ("window.MENU_IMG='data:image/jpeg;base64," + menu64 + "';\nwindow.SIGN_IMG='data:image/jpeg;base64," + sign64 + "';\n"
      + main + "\n" + util + "\n" + fig + "\n" + fxau + "\n" + net + "\n" + loader)
html = html.replace('/*__JS__*/', js)
open('../../assarabia/index.html', 'w', encoding='utf-8').write(html)
print('ok', len(html))
