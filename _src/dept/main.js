/* =========================================================
   EMPIRE 쇼핑몰 · 명품관  v1 (2026-11-19)
   쿠팡관 · 알리관 · 네이버관 — 매장은 보는 곳, 주문은 주문서로
   ========================================================= */
const OUTFITS=[0x1a1a1a,0xf4efe6,0x7a1f2b,0x1f3a5f,0xb08d57,0x3d5a45];
const OWNER_LINE='구매하시면 쇼핑몰 주인인 제가 수수료를 받습니다 🙇';
const HALLS=[
 {id:'coupang',name:'쿠팡관',file:'쿠팡',emoji:'🚀',color:0xb3122a,glow:0xff4a5a,ang:Math.PI,sub:'ROCKET LUXURY',
  disc:'이 포스팅은 쿠팡 파트너스 활동의 일환으로, 이에 따른 일정액의 수수료를 제공받습니다.',btn:'쿠팡에서 보기',css:'linear-gradient(135deg,#7a0c1d,#c8102e)'},
 {id:'ali',name:'알리관',file:'알리',emoji:'✈️',color:0xc2410c,glow:0xff8a3a,ang:Math.PI*0.68,sub:'GLOBAL SELECT',
  disc:'알리익스프레스 링크는 애드픽 제휴 광고 링크이며, 링크를 통해 구매하면 일정액의 수수료를 받을 수 있습니다.',btn:'알리에서 보기',css:'linear-gradient(135deg,#8a2c06,#e8590c)'},
 {id:'naver',name:'네이버관',file:'네이버',emoji:'🛍️',color:0x067a3a,glow:0x3ae08a,ang:-Math.PI*0.68,sub:'GREEN EDITION · 내부 공사중 🚧',wait:true,
  disc:'네이버관 상품은 리아과학 블로그 글로 연결됩니다. 그 글의 네이버 쇼핑 커넥트 링크로 구매하면 판매 수수료를 받을 수 있습니다.',btn:'네이버에서 보기',css:'linear-gradient(135deg,#04512a,#03a454)'},
];
const CONCIERGE_LINES=['어서 오세요, EMPIRE 쇼핑몰입니다','주문은 아래 주문서에서 하시면 됩니다','오늘의 세일은 주문서 맨 위에 있어요','천천히 둘러보세요 ✨'];
const GUEST_LINES=['여기 분위기 미쳤다','쿠팡관 진짜 명품관 같네','세일부터 보자','알리관 조명 예쁘다','네이버관 초록색 고급지다','쇼핑몰 주인이 수수료 받는대 ㅋㅋ','사진 찍고 가자 📸'];

const R_FLOOR=22,R_WALK=13.2,R_HALL=17.2;const STAFF=[];
let scene,camera,renderer,raycaster,pointer,clock;
let sky,stars;
const lampGlows=[],clickables=[],floorHits=[],OBST=[],occluders=[],spinners=[],chand=[];
const agents=[],npcs=[],particles=[],orders={};
let player,moveMarker,curHall=null;
let camAngle=0,camTilt=0.55,camDist=27,camGoal=null;
let dragging=false,dragMoved=false,lastX=0,lastY=0,downX=0,downY=0,downT=0,pinchD=0;
let react=null,reactT=0,entered=false;
let myName='손님',myColor=OUTFITS[0];
let tmpV,camLook;

/* ---------------- 초기화 ---------------- */
function init(){
 clock=new THREE.Clock();
 scene=new THREE.Scene();scene.fog=new THREE.Fog(0x07070c,40,120);
 renderer=new THREE.WebGLRenderer({antialias:true,powerPreference:'high-performance'});
 renderer.setPixelRatio(Math.min(devicePixelRatio,1.75));renderer.setSize(innerWidth,innerHeight);
 renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
 document.getElementById('app').appendChild(renderer.domElement);
 camera=new THREE.PerspectiveCamera(42,innerWidth/innerHeight,0.1,400);
 raycaster=new THREE.Raycaster();pointer=new THREE.Vector2();
 glowTex=glowTexture();tmpV=new THREE.Vector3();camLook=new THREE.Vector3(0,1.2,8);
 scene.add(new THREE.HemisphereLight(0x8a90b8,0x1a120c,0.45));
 scene.add(new THREE.AmbientLight(0xffe2b8,0.22));
 const key=new THREE.DirectionalLight(0xfff0d8,0.6);key.position.set(6,24,10);key.castShadow=true;
 key.shadow.mapSize.set(2048,2048);const sc=key.shadow.camera;sc.left=-26;sc.right=26;sc.top=26;sc.bottom=-26;sc.near=1;sc.far=60;key.shadow.bias=-0.0005;key.shadow.normalBias=0.02;
 scene.add(key);
 buildSky();buildAtrium();HALLS.forEach(buildHall);buildLobby();buildTree();buildStaff();buildPeople();
 const mk=new THREE.Mesh(new THREE.RingGeometry(0.22,0.32,32),new THREE.MeshBasicMaterial({color:0xe8c77a,transparent:true,opacity:0,side:THREE.DoubleSide,depthWrite:false}));
 mk.rotation.x=-Math.PI/2;mk.position.y=0.03;scene.add(mk);moveMarker=mk;
 const el=renderer.domElement;
 el.addEventListener('pointerdown',onDown);el.addEventListener('pointermove',onMove);
 window.addEventListener('pointerup',onUp);window.addEventListener('pointercancel',()=>dragging=false);
 el.addEventListener('wheel',e=>{e.preventDefault();camGoal=null;camDist=clamp(camDist+e.deltaY*0.015,8,40);},{passive:false});
 el.addEventListener('touchmove',e=>{if(e.touches.length===2){const d=Math.hypot(e.touches[0].clientX-e.touches[1].clientX,e.touches[0].clientY-e.touches[1].clientY);
   if(pinchD)camDist=clamp(camDist-(d-pinchD)*0.04,8,40);pinchD=d;dragging=false;dragMoved=true;camGoal=null;}},{passive:true});
 el.addEventListener('touchend',()=>pinchD=0);
 window.addEventListener('resize',onResize);
 HALLS.forEach(loadOrders);
 bindUI();animate();window.__R=renderer;window.__S=scene;
}
// 금·대리석 반사용 환경맵
function buildEnv(){
 const es=new THREE.Scene();
 es.add(new THREE.Mesh(new THREE.SphereGeometry(50,32,16),new THREE.ShaderMaterial({side:THREE.BackSide,
  vertexShader:`varying vec3 p;void main(){p=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
  fragmentShader:`varying vec3 p;void main(){float h=normalize(p).y;gl_FragColor=vec4(mix(vec3(.05,.04,.04),vec3(.55,.45,.32),smoothstep(-.2,.9,h)),1.);}`})));
 [[0,30,0,30,0.9],[20,12,0,6,0.7],[-20,12,0,6,0.7],[0,12,20,6,0.6],[0,12,-20,6,0.6]].forEach(([x,y,z,s,i])=>{const m=new THREE.Mesh(new THREE.PlaneGeometry(s*2,s),new THREE.MeshBasicMaterial({color:new THREE.Color(1,0.92,0.78).multiplyScalar(i),side:THREE.DoubleSide}));m.position.set(x,y,z);m.lookAt(0,0,0);es.add(m);});
 const pm=new THREE.PMREMGenerator(renderer);ENV=pm.fromScene(es,0.04).texture;pm.dispose();
}
let ENV=null;
const GOLD=()=>new THREE.MeshStandardMaterial({color:0xd9b25e,metalness:0.55,roughness:0.3,emissive:0x3a2a0c,emissiveIntensity:0.6});
const GLASS=()=>new THREE.MeshStandardMaterial({color:0xeaf4ff,transparent:true,opacity:0.14,roughness:0.02,metalness:0.1,depthWrite:false});
function occ(g,r){const o={g,r,a:1,mats:[]};g.updateMatrixWorld(true);const b=new THREE.Box3().setFromObject(g);o.c=b.getCenter(new THREE.Vector3());
 g.traverse(m=>{if(m.isMesh||m.isSprite){m.material=m.material.clone();m.material.userData.o0=m.material.opacity;m.material.transparent=true;o.mats.push(m.material);}});occluders.push(o);return o;}

/* ---------------- 밤하늘 · 도시 ---------------- */
function buildSky(){
 sky=new THREE.Mesh(new THREE.SphereGeometry(180,32,16),new THREE.ShaderMaterial({side:THREE.BackSide,depthWrite:false,fog:false,
  vertexShader:`varying vec3 vP;void main(){vP=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
  fragmentShader:`varying vec3 vP;void main(){float h=normalize(vP).y;vec3 c=mix(vec3(.10,.07,.10),vec3(.01,.015,.04),smoothstep(-0.02,0.5,h));c+=vec3(.35,.22,.12)*smoothstep(.15,0.,h)*.4;gl_FragColor=vec4(c,1.);}`}));
 scene.add(sky);
 const N=700,pos=new Float32Array(N*3);for(let i=0;i<N;i++){const th=Math.random()*6.283,ph=Math.acos(rnd(0.15,1));pos[i*3]=Math.sin(ph)*Math.cos(th)*170;pos[i*3+1]=Math.cos(ph)*170;pos[i*3+2]=Math.sin(ph)*Math.sin(th)*170;}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(pos,3));
 stars=new THREE.Points(g,new THREE.PointsMaterial({color:0xffffff,size:1.4,sizeAttenuation:false,transparent:true,opacity:0.7,fog:false,depthWrite:false}));scene.add(stars);
 // 멀리 도시 야경 (명품관 꼭대기 층 뷰)
 const winT=ctex(64,128,(x,w,h)=>{x.fillStyle='#0c0d14';x.fillRect(0,0,w,h);for(let r=0;r<16;r++)for(let c=0;c<4;c++)if(Math.random()<0.45){x.fillStyle=pick(['#ffd9a0','#fff0d0','#a8c8ff','#ffe9b8']);x.fillRect(4+c*15,4+r*8,9,5);}});
 for(let i=0;i<70;i++){const a=i/70*Math.PI*2+rnd(-0.03,0.03),r=rnd(55,90),h=rnd(8,40),w=rnd(4,9);
  const t=winT.clone();t.needsUpdate=true;t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(1,h/12);
  const b=new THREE.Mesh(new THREE.BoxGeometry(w,h,w),new THREE.MeshBasicMaterial({map:t,color:0xbbbbbb}));b.position.set(Math.sin(a)*r,h/2-6,Math.cos(a)*r);b.lookAt(0,h/2-6,0);scene.add(b);}
}

/* ---------------- 아트리움 ---------------- */
function buildAtrium(){
 const marbleT=ctex(1024,1024,(x,w,h)=>{x.fillStyle='#0b0b0f';x.fillRect(0,0,w,h);
  for(let i=0;i<90;i++){x.strokeStyle=Math.random()<0.25?'rgba(216,179,106,.55)':'rgba(220,220,230,.18)';x.lineWidth=rnd(0.6,2.4);x.beginPath();let px=rnd(0,w),py=rnd(0,h);x.moveTo(px,py);
   for(let k=0;k<6;k++){px+=rnd(-160,160);py+=rnd(-160,160);x.quadraticCurveTo(px+rnd(-60,60),py+rnd(-60,60),px,py);}x.stroke();}},[5,5]);
 const floor=new THREE.Mesh(new THREE.CircleGeometry(R_FLOOR,96),new THREE.MeshStandardMaterial({map:marbleT,roughness:0.22,metalness:0.05}));
 floor.rotation.x=-Math.PI/2;floor.receiveShadow=true;scene.add(floor);floorHits.push(floor);
 // 바닥 금 링 + 중앙 상감 문양
 [3.2,3.3,11.6,11.68,R_FLOOR-0.4].forEach(r=>{const ring=new THREE.Mesh(new THREE.RingGeometry(r,r+0.06,128),new THREE.MeshStandardMaterial({color:0xd8b36a,metalness:1,roughness:0.25}));ring.rotation.x=-Math.PI/2;ring.position.y=0.006;scene.add(ring);});
 const inlayT=ctex(1024,1024,(x,w,h)=>{const c=w/2;x.clearRect(0,0,w,h);
  x.strokeStyle='#d8b36a';x.lineWidth=4;for(let i=0;i<16;i++){const a=i/16*Math.PI*2;x.beginPath();x.moveTo(c+Math.cos(a)*150,c+Math.sin(a)*150);x.lineTo(c+Math.cos(a+0.2)*470,c+Math.sin(a+0.2)*470);x.lineTo(c+Math.cos(a)*500,c+Math.sin(a)*500);x.stroke();}
  x.fillStyle='#d8b36a';x.textAlign='center';x.textBaseline='middle';x.font='120px "Noto Serif KR",serif';x.fillText('EMPIRE',c,c-20);
  x.font='38px serif';x.fillText('ONLINE  DEPARTMENT  STORE',c,c+80);});
 const inlay=new THREE.Mesh(new THREE.CircleGeometry(3.15,64),new THREE.MeshStandardMaterial({map:inlayT,transparent:true,metalness:0.6,roughness:0.3,depthWrite:false}));
 inlay.rotation.x=-Math.PI/2;inlay.position.y=0.01;scene.add(inlay);
 // 난간 (낮게 — 시야 안 가림)
 const rail=new THREE.Mesh(new THREE.TorusGeometry(R_FLOOR-0.2,0.05,8,160),GOLD());rail.rotation.x=Math.PI/2;rail.position.y=1.05;scene.add(rail);
 const gl=new THREE.Mesh(new THREE.CylinderGeometry(R_FLOOR-0.2,R_FLOOR-0.2,1.0,128,1,true),GLASS());gl.position.y=0.52;scene.add(gl);
 for(let i=0;i<48;i++){const a=i/48*Math.PI*2;mesh(new THREE.CylinderGeometry(0.03,0.03,1.05,8),GOLD(),Math.sin(a)*(R_FLOOR-0.2),0.52,Math.cos(a)*(R_FLOOR-0.2));}
 // 공중 샹들리에 링 (빛 알갱이만 — 가림 없음)
 for(let k=0;k<3;k++){const n=60+k*30,r=4+k*2.2,y=12.5-k*0.8;for(let i=0;i<n;i++){const a=i/n*Math.PI*2;const s=glowSprite(pick([0xfff2d0,0xffe2a8,0xffffff]),0.55-k*0.08,scene,Math.sin(a)*r,y+Math.sin(i*1.7)*0.25,Math.cos(a)*r,0.85);chand.push({s,a,r,y,k,i});}}
 glowSprite(0xffd9a0,10,scene,0,12,0,0.12);
 const cl=new THREE.PointLight(0xffe2b8,0.9,30,1.3);cl.position.set(0,8,0);scene.add(cl);
}

/* ---------------- 관 (보는 매장 — 들어가진 않음) ---------------- */
function buildHall(h){
 const g=new THREE.Group();g.position.set(Math.sin(h.ang)*R_HALL,0,Math.cos(h.ang)*R_HALL);g.rotation.y=h.ang+Math.PI;scene.add(g);h.g=g;
 const lacq=new THREE.MeshStandardMaterial({color:h.color,roughness:0.18,metalness:0.2,side:THREE.DoubleSide});
 const black=new THREE.MeshStandardMaterial({color:0x0a0a0c,roughness:0.2,metalness:0.4});
 const whiteMarble=new THREE.MeshStandardMaterial({color:0xf3efe8,roughness:0.15,metalness:0.05});
 // 단상
 const st=mesh(new THREE.CylinderGeometry(5.2,5.4,0.22,64,1,false,-Math.PI/2,Math.PI),whiteMarble,0,0.11,0.2,g);
 mesh(new THREE.TorusGeometry(5.3,0.035,6,64,Math.PI),GOLD(),0,0.23,0.2,g).rotation.set(Math.PI/2,0,Math.PI);
 // 뒷벽 (반원 · 브랜드 색 래커) + 금 띠
 const back=new THREE.Group();g.add(back);
 mesh(new THREE.CylinderGeometry(4.9,4.9,4.6,64,1,true,Math.PI/2,Math.PI),lacq,0,2.52,0,back);
 for(let i=0;i<9;i++){const a=Math.PI/2+i/8*Math.PI;mesh(new THREE.BoxGeometry(0.06,4.6,0.06),GOLD(),Math.sin(a)*4.85,2.52,Math.cos(a)*4.85,back);}
 mesh(new THREE.TorusGeometry(4.9,0.07,8,64,Math.PI),GOLD(),0,4.85,0,back).rotation.set(Math.PI/2,0,Math.PI);
 const big=new THREE.Sprite(new THREE.SpriteMaterial({map:emojiTex(h.emoji),transparent:true,depthWrite:false}));big.scale.set(2.2,2.2,1);big.position.set(0,6.1,-1.5);back.add(big);
 glowSprite(h.glow,6,back,0,6.0,-1.6,0.35);
 occ(back,4.8);
 // 정문 아치 (금 기둥 + 간판)
 const arch=new THREE.Group();g.add(arch);
 [-3.9,3.9].forEach(x=>{mesh(new THREE.CylinderGeometry(0.16,0.2,5.2,20),GOLD(),x,2.6,3.4,arch);mesh(new THREE.BoxGeometry(0.6,0.25,0.6),GOLD(),x,0.12,3.4,arch);});
 const signT=ctex(1024,192,(x,w,hh)=>{x.fillStyle='#0a0a0c';x.fillRect(0,0,w,hh);x.strokeStyle='#d8b36a';x.lineWidth=6;x.strokeRect(10,10,w-20,hh-20);
  x.fillStyle='#e9cd8a';x.textAlign='center';x.textBaseline='middle';x.font='92px "Noto Serif KR",serif';x.fillText(h.name,w/2,hh/2-18);x.font='30px serif';x.fillStyle='#bfa06a';x.fillText(h.sub,w/2,hh/2+52);});
 mesh(new THREE.BoxGeometry(8.4,1.3,0.3),black,0,5.6,3.4,arch);
 const sm=new THREE.MeshStandardMaterial({map:signT,emissive:0xffffff,emissiveMap:signT,emissiveIntensity:0.55,roughness:0.3});
 const sign=new THREE.Mesh(new THREE.PlaneGeometry(8.0,1.5),sm);sign.position.set(0,5.6,3.56);arch.add(sign);
 occ(arch,4.6);
 // 진열장 3개 (유리 + 떠 있는 상품 + 스포트라이트)
 [[-2.6,1.2],[0,0.2],[2.6,1.2]].forEach(([x,z],i)=>{
  mesh(new THREE.CylinderGeometry(0.55,0.6,1.0,32),whiteMarble,x,0.72,z,g);
  mesh(new THREE.TorusGeometry(0.57,0.02,6,32),GOLD(),x,1.22,z,g).rotation.x=Math.PI/2;
  const glass=new THREE.Mesh(new THREE.CylinderGeometry(0.5,0.5,1.2,32,1,true),GLASS());glass.position.set(x,1.82,z);g.add(glass);
  const item=makeItem(i,h);item.position.set(x,1.8,z);g.add(item);spinners.push(item);
  const cone=new THREE.Mesh(new THREE.ConeGeometry(0.75,3.2,24,1,true),new THREE.MeshBasicMaterial({color:0xfff2d0,transparent:true,opacity:0.06,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide}));
  cone.position.set(x,3.0,z);g.add(cone);
  glowSprite(0xfff2d0,1.4,g,x,1.25,z,0.35);
 });
 // 브랜드 색 레드카펫
 const rc=new THREE.Mesh(new THREE.PlaneGeometry(2.4,4.2),new THREE.MeshStandardMaterial({color:h.color,roughness:0.9}));rc.rotation.x=-Math.PI/2;rc.position.set(0,0.012,5.4);g.add(rc);
 // 조명
 const pl=new THREE.PointLight(h.glow,0.9,14,1.6);pl.position.set(0,4.2,1.5);g.add(pl);
 // 클릭 영역 → 주문서 열기
 const hit=new THREE.Mesh(new THREE.CylinderGeometry(5,5,6,24),new THREE.MeshBasicMaterial({visible:false}));hit.position.set(0,3,0.5);hit.userData.act={type:'hall',h};g.add(hit);clickables.push(hit);
 // 컨시어지
 const cf=makeFigure({robe:0x151515,top:0xf7f3ea,hair:0x1e1a17,skin:0xf2c9a0,style:i2style(h),ribbon:h.color});
 const cp=new THREE.Vector3(3.2,0,4.6);g.localToWorld(cp);cf.position.copy(cp);cf.rotation.y=h.ang+Math.PI;scene.add(cf);
 addTag(cf,h.name+' 컨시어지',0,2.0,false);addBubble(cf,2.6);h.concierge={f:cf,t:rnd(6,14)};
 // 매장 쪽으로는 안 들어감 (단상 가장자리에서 막힘)
 OBST.push({x:g.position.x,z:g.position.z,r:5.6});
}
function i2style(h){return h.id==='ali'?'f':'p';}
function makeItem(i,h){const g=new THREE.Group();const gold=GOLD();const col=new THREE.MeshStandardMaterial({color:h.color,roughness:0.25,metalness:0.3});
 if(i===0){const b=new THREE.Mesh(new THREE.BoxGeometry(0.42,0.32,0.42),col);g.add(b);const r1=new THREE.Mesh(new THREE.BoxGeometry(0.44,0.33,0.06),gold);g.add(r1);const r2=r1.clone();r2.rotation.y=Math.PI/2;g.add(r2);
  const bow=new THREE.Mesh(new THREE.TorusKnotGeometry(0.07,0.02,40,6),gold);bow.position.y=0.22;g.add(bow);}
 else if(i===1){const b=new THREE.Mesh(new THREE.BoxGeometry(0.5,0.38,0.2),new THREE.MeshStandardMaterial({color:0x111111,roughness:0.3,metalness:0.2}));g.add(b);
  const hd=new THREE.Mesh(new THREE.TorusGeometry(0.15,0.025,8,24,Math.PI),gold);hd.position.y=0.19;g.add(hd);const lk=new THREE.Mesh(new THREE.BoxGeometry(0.08,0.06,0.03),gold);lk.position.set(0,0.06,0.11);g.add(lk);}
 else{const bt=new THREE.Mesh(new THREE.CylinderGeometry(0.16,0.18,0.36,6),new THREE.MeshStandardMaterial({color:0xfff2d8,transparent:true,opacity:0.55,roughness:0.02,metalness:0.1}));g.add(bt);
  const cap=new THREE.Mesh(new THREE.CylinderGeometry(0.07,0.07,0.12,16),gold);cap.position.y=0.24;g.add(cap);const liq=new THREE.Mesh(new THREE.CylinderGeometry(0.13,0.15,0.24,6),col);liq.position.y=-0.04;g.add(liq);}
 g.traverse(m=>{if(m.isMesh)m.castShadow=true;});return g;}

/* ---------------- 로비 ---------------- */
function buildLobby(){
 // 입점 안내 토템 (입구 쪽)
 const tot=new THREE.Group();tot.position.set(6.4,0,10.2);tot.rotation.y=-0.35;scene.add(tot);
 mesh(new THREE.BoxGeometry(1.7,3.0,0.24),new THREE.MeshStandardMaterial({color:0x0a0a0c,roughness:0.2,metalness:0.4}),0,1.5,0,tot);
 const t=ctex(512,900,(x,w,h)=>{x.fillStyle='#0a0a0c';x.fillRect(0,0,w,h);x.strokeStyle='#d8b36a';x.lineWidth=5;x.strokeRect(14,14,w-28,h-28);
  x.fillStyle='#e9cd8a';x.textAlign='center';x.font='60px "Noto Serif KR",serif';x.fillText('입점 안내',w/2,120);
  x.font='30px "Noto Sans KR",sans-serif';x.fillStyle='#f3efe8';x.fillText('현재 입점',w/2,220);x.font='42px "Noto Sans KR",sans-serif';x.fillStyle='#e9cd8a';x.fillText('쿠팡 · 알리 · 네이버',w/2,280);
  x.fillStyle='#f3efe8';x.font='28px "Noto Sans KR",sans-serif';['추가 입점 문의는','초대기업 이상,','그룹 단위로만 받습니다'].forEach((s,i)=>x.fillText(s,w/2,400+i*46));
  
  x.strokeStyle='#5a4a2a';x.lineWidth=2;x.beginPath();x.moveTo(80,650);x.lineTo(w-80,650);x.stroke();
  x.fillStyle='#f3efe8';x.font='26px "Noto Sans KR",sans-serif';['구매하시면','쇼핑몰 주인인 제가','수수료를 받습니다 🙇'].forEach((s,i)=>x.fillText(s,w/2,720+i*42));});
 const tm=new THREE.MeshStandardMaterial({map:t,emissive:0xffffff,emissiveMap:t,emissiveIntensity:0.45,roughness:0.3});
 const tp=new THREE.Mesh(new THREE.PlaneGeometry(1.56,2.75),tm);tp.position.set(0,1.55,0.125);tot.add(tp);
 mesh(new THREE.BoxGeometry(1.8,0.08,0.34),GOLD(),0,0.04,0,tot);mesh(new THREE.BoxGeometry(1.8,0.08,0.34),GOLD(),0,3.02,0,tot);
 occ(tot,1.8);OBST.push({x:6.4,z:10.2,r:0.9});
 // 컨시어지 데스크 (낮은 원형)
 const desk=new THREE.Group();desk.position.set(-6.2,0,9.8);scene.add(desk);
 mesh(new THREE.CylinderGeometry(1.2,1.25,1.0,40,1,true,0.6,Math.PI*1.4),new THREE.MeshStandardMaterial({color:0xf3efe8,roughness:0.15,side:THREE.DoubleSide}),0,0.5,0,desk);
 mesh(new THREE.TorusGeometry(1.22,0.05,8,40,Math.PI*1.4),GOLD(),0,1.02,0,desk).rotation.set(Math.PI/2,0,0.6-Math.PI/2);
 OBST.push({x:-6.2,z:9.8,r:1.4});
 const hf=makeFigure({robe:0x151515,top:0xf7f3ea,hair:0x3a2a1a,skin:0xf4cfa8,style:'f',ribbon:0xd8b36a});hf.position.set(-6.2,0,9.5);hf.rotation.y=0.3;scene.add(hf);
 addTag(hf,'🏬 안내 데스크',0,2.0,false);addBubble(hf,2.6);window.deskF={f:hf,t:4};
 // 대형 화분 (가장자리)
 [[-11,12.4],[11.4,11.7],[-15.6,2.6],[15.6,2.6]].forEach(([x,z])=>{const g=new THREE.Group();g.position.set(x,0,z);scene.add(g);
  mesh(new THREE.CylinderGeometry(0.55,0.42,0.9,24),new THREE.MeshStandardMaterial({color:0x0a0a0c,roughness:0.2,metalness:0.5}),0,0.45,0,g);
  mesh(new THREE.TorusGeometry(0.55,0.03,6,24),GOLD(),0,0.9,0,g).rotation.x=Math.PI/2;
  for(let i=0;i<9;i++){const l=mesh(new THREE.SphereGeometry(0.42,8,6),new THREE.MeshStandardMaterial({color:pick([0x2f5a3a,0x3a6a45,0x274a30]),roughness:0.9,flatShading:true}),rnd(-.35,.35),1.5+rnd(0,1.2),rnd(-.35,.35),g);l.scale.y=1.3;}
  occ(g,1.4);OBST.push({x,z,r:0.7});});
 // 그랜드 피아노 (분위기)
 const pg=new THREE.Group();pg.position.set(-9.4,0,2);pg.rotation.y=0.8;scene.add(pg);
 const pb=new THREE.MeshStandardMaterial({color:0x08080a,roughness:0.08,metalness:0.3});
 const sh=new THREE.Shape();sh.moveTo(-0.75,0);sh.lineTo(0.75,0);sh.lineTo(0.75,1.1);sh.bezierCurveTo(0.75,1.9,-0.1,1.7,-0.35,1.2);sh.lineTo(-0.75,1.0);sh.lineTo(-0.75,0);
 const body=new THREE.Mesh(new THREE.ExtrudeGeometry(sh,{depth:0.35,bevelEnabled:false}),pb);body.rotation.x=-Math.PI/2;body.position.y=0.62;body.castShadow=true;pg.add(body);
 const lid=new THREE.Mesh(new THREE.ShapeGeometry(sh),pb);lid.rotation.x=-Math.PI/2-0.75;lid.position.set(0,0.98,0);pg.add(lid);
 mesh(new THREE.BoxGeometry(1.5,0.06,0.18),new THREE.MeshStandardMaterial({color:0xf6f3ec,roughness:0.3}),0,0.82,0.08,pg);
 [[-0.6,0.1],[0.6,0.1],[0.4,1.4]].forEach(([a,b])=>mesh(new THREE.CylinderGeometry(0.05,0.04,0.62,10),pb,a,0.31,-b,pg));
 occ(pg,1.5);OBST.push({x:-9.4,z:2,r:1.3});
}

/* ---------------- 크리스마스 트리 (중앙) ---------------- */
const TREE={lights:null};
function buildTree(){const g=new THREE.Group();g.position.set(-5.4,0,15.4);scene.add(g);
 const green=new THREE.MeshStandardMaterial({color:0x1d4a2c,roughness:0.75,flatShading:true});
 mesh(new THREE.CylinderGeometry(0.22,0.3,0.9,10),new THREE.MeshStandardMaterial({color:0x4a2e1a,roughness:0.9}),0,0.45,0,g);
 mesh(new THREE.CylinderGeometry(1.05,1.15,0.5,32),GOLD(),0,0.25,0,g);
 const tiers=[[2.3,2.2,1.0],[1.85,2.0,2.3],[1.4,1.8,3.5],[0.95,1.6,4.6],[0.5,1.3,5.6]];
 tiers.forEach(([r,h,y])=>{const c=mesh(new THREE.ConeGeometry(r,h,14),green,0,y+h/2,0,g);c.castShadow=true;});
 // 오너먼트 (한 번에 그림)
 const N=46,im=new THREE.InstancedMesh(new THREE.SphereGeometry(0.11,10,8),new THREE.MeshStandardMaterial({metalness:0.6,roughness:0.25}),N);
 const m4=new THREE.Matrix4(),col=new THREE.Color(),cs=[0xd8b36a,0xb3122a,0xf3efe8,0xc9a24e];
 for(let i=0;i<N;i++){const y=1.2+Math.random()*5.0,rr=(1-(y-1.0)/5.6)*2.1+0.05,a=Math.random()*6.283;m4.makeTranslation(Math.sin(a)*rr,y,Math.cos(a)*rr);im.setMatrixAt(i,m4);im.setColorAt(i,col.set(pick(cs)));}
 g.add(im);
 // 전구 (점 하나로)
 const L=160,pos=new Float32Array(L*3),cl=new Float32Array(L*3);
 for(let i=0;i<L;i++){const q=i/L,y=1.1+q*5.5,rr=(1-(y-1.0)/5.8)*2.2+0.08,a=q*Math.PI*2*7;pos.set([Math.sin(a)*rr,y,Math.cos(a)*rr],i*3);col.set(pick([0xfff0c8,0xffd37a,0xffffff]));cl.set([col.r,col.g,col.b],i*3);}
 const bg=new THREE.BufferGeometry();bg.setAttribute('position',new THREE.BufferAttribute(pos,3));bg.setAttribute('color',new THREE.BufferAttribute(cl,3));
 TREE.lights=new THREE.Points(bg,new THREE.PointsMaterial({size:0.16,vertexColors:true,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,map:glowTex}));g.add(TREE.lights);
 glowSprite(0xffe08a,1.6,g,0,7.25,0,0.95);
 const st=new THREE.Shape();for(let i=0;i<10;i++){const a=i/10*Math.PI*2,r=i%2?0.16:0.38;st[i?'lineTo':'moveTo'](Math.sin(a)*r,Math.cos(a)*r);}
 const star=new THREE.Mesh(new THREE.ExtrudeGeometry(st,{depth:0.08,bevelEnabled:false}),new THREE.MeshStandardMaterial({color:0xffd86a,emissive:0xffb830,emissiveIntensity:1.2,metalness:0.4,roughness:0.3}));
 star.position.set(0,7.2,-0.04);g.add(star);spinners.push(star);
 const tl=new THREE.PointLight(0xffd59a,0.7,12,1.6);tl.position.set(0,3.5,1.5);g.add(tl);
 occ(g,2.3);OBST.push({x:-5.4,z:15.4,r:2.0});}

/* ---------------- 직원 의전 (입구 일렬 · 90도 인사) ---------------- */
function makeStaff(look){const f=makeFigure(look);f.updateMatrixWorld(true);const u=f.userData,rig=u.rig,up=new THREE.Group();up.position.y=0.46;rig.add(up);up.updateMatrixWorld(true);
 rig.children.slice().forEach(c=>{if(c!==up&&!u.legs.includes(c))up.attach(c);});u.up=up;return f;}
const STAFF_DOOR=[0,6.5];
function buildStaff(){const lk=(k,sd)=>{const w=(k+(sd>0?1:0))%2;return {robe:0x0d0d10,top:0xf7f3ea,hair:k%3?0x1c1612:0x2e2016,skin:w?0xf4cfa8:0xeec39a,style:w?'f':'p',ribbon:0xd8b36a};};
 let n=0;for(let k=0;k<5;k++)for(const side of [-1,1]){const f=makeStaff(lk(k,side));f.traverse(m=>{if(m.isMesh)m.castShadow=false;});
  f.position.set(STAFF_DOOR[0],0,STAFF_DOOR[1]);f.visible=false;scene.add(f);addBubble(f,2.45);
  STAFF.push({f,k,side,i:n,ph:'home',t:0,bow:0,sx:side*1.45,sz:20.0-k*1.6});n++;}}
let lastBow=-99,lastPeers=0;
function bowAll(){const now=performance.now()/1000;if(now-lastBow<9)return;lastBow=now;sfx('chime');
 STAFF.forEach(s=>{s.ph='wait';s.t=s.i*0.14;s.f.position.set(STAFF_DOOR[0],0,STAFF_DOOR[1]);});}
function staffTick(t,dt){if(entered&&NET.peers.size>lastPeers)bowAll();lastPeers=NET.peers.size;
 STAFF.forEach(s=>{const f=s.f,u=f.userData,p=f.position;
  if(s.ph==='home'){f.visible=false;return;}
  const go=(x,z,sp)=>{const dx=x-p.x,dz=z-p.z,d=Math.hypot(dx,dz);if(d<0.05)return true;const st=Math.min(sp*dt,d);p.x+=dx/d*st;p.z+=dz/d*st;
   f.rotation.y+=angDiff(f.rotation.y,Math.atan2(dx,dz))*Math.min(1,dt*12);u.mode='walk';return false;};
  let a=0;
  if(s.ph==='wait'){s.t-=dt;if(s.t<=0){s.ph='out';f.visible=true;}}
  else if(s.ph==='out'){if(go(s.sx,s.sz,4.2)){s.ph='turn';s.t=0;}}
  else if(s.ph==='turn'){u.mode='stand';f.rotation.y+=angDiff(f.rotation.y,-s.side*Math.PI/2)*Math.min(1,dt*10);s.t+=dt;if(s.t>0.35&&STAFF.every(q=>q.ph!=='wait'&&q.ph!=='out')){s.ph='bow';s.t=0;if(s.i===0||s.i===1)sfx('chime');}}
  else if(s.ph==='bow'){u.mode='stand';s.t+=dt;const T=s.t-s.k*0.14;if(s.i===0&&T>0&&!s.said){s.said=1;say(f,'고객님 사랑합니다 💛 — 직원 일동',2.8);}
   a=T<=0?0:T<0.45?T/0.45:T<1.8?1:T<2.3?1-(T-1.8)/0.5:0;if(s.t>4.2){s.ph='back';s.said=0;}}
  else if(s.ph==='back'){if(go(STAFF_DOOR[0],STAFF_DOOR[1],4.6)){s.ph='home';f.visible=false;}}
  if(f.visible){animFig(f,t,dt,false);const e=a*a*(3-2*a);u.up.rotation.x=e*1.45;if(a>0)u.arms.forEach(m=>m.rotation.x=-e*0.25);u.head.rotation.x=e*0.2;}});}

/* ---------------- 사람들 ---------------- */
const WAYPTS=[[0,4],[-4,2.6],[4,2.6],[0,-2.6],[-6.5,-4],[6.5,-4],[-8,5],[7,7.5],[-4.2,9],[4.2,9],[-9,-8],[9,-8],[0,-8],[-10,0],[11.5,-3.5]];
function buildPeople(){
 player=mkAgent(makeFigure({robe:myColor,top:0xf6efe4,hair:0x2a2018,skin:0xf2c9a0,style:'p',ribbon:0xd8b36a}),rnd(-0.3,0.3),rnd(20.4,20.8),3.2);
 addTag(player.f,myName,0,1.98,false);addBubble(player.f,2.5);player.f.rotation.y=Math.PI;
 const looks=[{robe:0xf4efe6,top:0x1a1a1a,hair:0x2a1a10,skin:0xf6d2b0,style:'f',ribbon:0xb08d57},{robe:0x1f3a5f,top:0xf4efe6,hair:0x161210,skin:0xe8bf95,style:'p',ribbon:0xd8b36a},
  {robe:0x7a1f2b,top:0xf4efe6,hair:0x4a3020,skin:0xf6d2b0,style:'f',ribbon:0xd8b36a},{robe:0x3d5a45,top:0xf0ece4,hair:0x1e1a17,skin:0xf0c8a0,style:'p',ribbon:0xb08d57}];
 looks.forEach((lk,i)=>{const w=WAYPTS[i*3];const a=mkAgent(makeFigure(lk),w[0],w[1],rnd(1.1,1.5));addBubble(a.f,2.45);a.npc=true;a.wait=rnd(1,5);npcs.push(a);});
}
function mkAgent(f,x,z,speed){f.position.set(x,0,z);scene.add(f);const a={f,speed,target:null,cb:null,stuck:0};agents.push(a);return a;}
function walkAgent(a,x,z,cb){a.target=new THREE.Vector3(x,0,z);a.cb=cb||null;a.stuck=0;}
function pushOut(p,r,self){
 for(const o of OBST){const dx=p.x-o.x,dz=p.z-o.z,d=Math.hypot(dx,dz),m=o.r+r;if(d<m&&d>1e-4){p.x=o.x+dx/d*m;p.z=o.z+dz/d*m;}}
 for(const a of agents){if(a.f===self||!a.f.visible)continue;const q=a.f.position,dx=p.x-q.x,dz=p.z-q.z,d=Math.hypot(dx,dz),m=0.5;if(d<m&&d>1e-4){p.x+=dx/d*(m-d)*0.5;p.z+=dz/d*(m-d)*0.5;}}
 const d=Math.hypot(p.x,p.z),lim=R_FLOOR-1.0;if(d>lim){p.x*=lim/d;p.z*=lim/d;}}
function moveAgent(a,dt){const u=a.f.userData;if(!a.target){u.mode='stand';return;}
 const p=a.f.position,dx=a.target.x-p.x,dz=a.target.z-p.z,dist=Math.hypot(dx,dz);
 if(dist>0.07){const st=Math.min(a.speed*dt,dist),ox=p.x,oz=p.z;p.x+=dx/dist*st;p.z+=dz/dist*st;pushOut(p,0.28,a.f);
  a.f.rotation.y+=angDiff(a.f.rotation.y,Math.atan2(dx,dz))*Math.min(1,dt*10);u.mode='walk';
  const mv=Math.hypot(p.x-ox,p.z-oz);a.stuck=mv<st*0.25?a.stuck+dt:0;if(a.stuck>0.9)arrive(a);}else arrive(a);}
function arrive(a){a.target=null;a.f.userData.mode='stand';const cb=a.cb;a.cb=null;if(a===player)moveMarker.material.opacity=0;cb&&cb();}
function npcThink(a,dt){a.wait-=dt;if(a.target||a.wait>0)return;
 let w;do{w=pick(WAYPTS);}while(Math.hypot(w[0]-a.f.position.x,w[1]-a.f.position.z)<2);
 walkAgent(a,w[0],w[1],()=>{a.wait=rnd(3,8);if(Math.random()<0.4)setTimeout(()=>say(a.f,pick(GUEST_LINES),2.8),300);});}

/* ---------------- 주문서 ---------------- */
function parseCSV(t){const out=[];for(const raw of t.split(/\r?\n/)){const line=raw.trim();if(!line||line[0]==='#')continue;
 const cells=[];let cur='',q=false;for(let i=0;i<line.length;i++){const ch=line[i];if(q){if(ch==='"'){if(line[i+1]==='"'){cur+='"';i++;}else q=false;}else cur+=ch;}
  else if(ch==='"')q=true;else if(ch===','){cells.push(cur);cur='';}else cur+=ch;}cells.push(cur);out.push(cells.map(s=>s.trim()));}
 if(out.length&&out[0][0]==='카테고리')out.shift();
 return out.map(r=>({cat:r[0]||'기타',name:r[1]||'',price:r[2]||'',link:/^https:\/\//i.test(r[3]||'')?r[3]:'',desc:r[4]||''})).filter(r=>r.name);}
function loadOrders(h){orders[h.id]=null;
 fetch('주문서/'+encodeURIComponent(h.file)+'.csv?t='+Date.now(),{cache:'no-store'}).then(r=>r.ok?r.text():Promise.reject()).then(t=>{orders[h.id]=parseCSV(t);if(curHall===h)renderOrders(h);})
  .catch(()=>{orders[h.id]=[];if(curHall===h)renderOrders(h);});}
function openHall(h,walk){curHall=h;const $=id=>document.getElementById(id);
 $('oHead').style.background=h.css;$('oTitle').textContent=h.emoji+' '+h.name+' 주문서';$('oSub').textContent=h.sub;$('oDisc').textContent=h.disc;
 renderOrders(h);$('orderPanel').classList.add('open');sfx('chime');
 if(walk!==false){const fx=Math.sin(h.ang)*(R_WALK-1.2),fz=Math.cos(h.ang)*(R_WALK-1.2);goto(fx,fz,()=>{player.f.rotation.y=h.ang;});}
 setTimeout(()=>say(h.concierge.f,pick(['어서 오세요, '+h.name+'입니다 ✨','오늘의 세일은 맨 위에 있어요','천천히 골라보세요']),2.6),300);}
function renderOrders(h){const box=document.getElementById('oList');box.textContent='';const rows=orders[h.id];
 if(h.wait){const p=document.createElement('div');p.className='oEmpty';p.textContent=h.emoji+' '+'🚧 '+h.name+' 내부 공사중입니다. 곧 오픈해요';box.appendChild(p);return;}
 if(rows===null){const p=document.createElement('div');p.className='oEmpty';p.textContent='주문서 불러오는 중…';box.appendChild(p);return;}
 if(!rows.length){const p=document.createElement('div');p.className='oEmpty';p.textContent='아직 진열된 상품이 없어요. 곧 채워집니다 ✨';box.appendChild(p);return;}
 const cats=[];rows.forEach(r=>{if(!cats.includes(r.cat))cats.push(r.cat);});
 const rk=c=>/바로/.test(c)?2:/세일/.test(c)?1:0;cats.sort((a,b)=>rk(b)-rk(a));
 cats.forEach(c=>{const hd=document.createElement('div');hd.className='oCat'+(/세일/.test(c)?' sale':'');hd.textContent=(/바로/.test(c)?'🚪 ':/세일/.test(c)?'🔥 ':'')+c;box.appendChild(hd);
  rows.filter(r=>r.cat===c).forEach(r=>{const it=document.createElement('div');it.className='oItem';
   const tx=document.createElement('div');tx.className='oTx';const n=document.createElement('b');n.textContent=r.name;tx.appendChild(n);
   if(r.price){const p=document.createElement('span');p.className='oPrice';p.textContent=r.price;tx.appendChild(p);}
   if(r.desc){const d=document.createElement('small');d.textContent=r.desc;tx.appendChild(d);}
   it.appendChild(tx);
   const b=document.createElement('button');
   if(r.link){b.textContent=(/blog\.naver\.com|tistory\.com/.test(r.link)?'📖 글 보고 사기':/바로/.test(r.cat)?'🚪 바로 들어가기':h.btn)+' ↗';b.onclick=()=>{sfx('pop');window.open(r.link,'_blank','noopener,noreferrer');};}
   else{b.textContent='링크 준비 중';b.disabled=true;}
   it.appendChild(b);box.appendChild(it);});});}
function closeHall(){document.getElementById('orderPanel').classList.remove('open');curHall=null;}

/* ---------------- 입력 ---------------- */
function onDown(e){dragging=true;dragMoved=false;lastX=downX=e.clientX;lastY=downY=e.clientY;downT=performance.now();}
function onMove(e){if(!dragging)return;const dx=e.clientX-lastX,dy=e.clientY-lastY;
 if(Math.abs(e.clientX-downX)+Math.abs(e.clientY-downY)>7){dragMoved=true;camGoal=null;}
 if(dragMoved){camAngle-=dx*0.006;camTilt=clamp(camTilt-dy*0.004,0.12,1.25);}lastX=e.clientX;lastY=e.clientY;}
function onUp(e){if(!dragging)return;dragging=false;if(!dragMoved&&performance.now()-downT<400&&entered)handleClick(e);}
function handleClick(e){
 pointer.x=(e.clientX/innerWidth)*2-1;pointer.y=-(e.clientY/innerHeight)*2+1;raycaster.setFromCamera(pointer,camera);
 const hit=raycaster.intersectObjects(clickables,false),fh=raycaster.intersectObjects(floorHits,false);
 if(hit.length&&(!fh.length||hit[0].distance<fh[0].distance+0.6)){const a=hit[0].object.userData.act;if(a.type==='hall')return openHall(a.h);}
 if(fh.length){const p=fh[0].point;goto(p.x,p.z);}}
function goto(x,z,cb){walkAgent(player,x,z,cb);moveMarker.position.set(x,0.03,z);moveMarker.material.opacity=0.95;}
function doReact(type){react=type;reactT=0;netEvent(type);const hp=new THREE.Vector3();player.f.userData.head.getWorldPosition(hp);
 if(type==='happy'){sfx('happy');spawn(pick(['✨','💛','🛍️']),hp.clone().add(new THREE.Vector3(0,0.3,0)),9,{size:0.3,up:1.6,spread:0.9,life:1.5});say(player.f,pick(['오예!! 😆','득템 각 ✨','기분 최고 💛']),2);}
 else{sfx('cry');say(player.f,pick(['통장이 운다… 😭','장바구니만 꽉…','흐엉…']),2);}}

/* ---------------- 사진 ---------------- */
function snap(){const f=document.getElementById('flash');sfx('snap');renderer.render(scene,camera);const src=renderer.domElement;
 const c=document.createElement('canvas');c.width=src.width;c.height=src.height;const x=c.getContext('2d');x.drawImage(src,0,0);
 const s=c.width/420;x.shadowColor='rgba(0,0,0,.6)';x.shadowBlur=8*s;x.fillStyle='rgba(233,205,138,.98)';x.textAlign='right';
 x.font=`${17*s}px "Noto Serif KR",serif`;x.fillText('🏬 EMPIRE 쇼핑몰',c.width-14*s,c.height-30*s);
 x.font=`${11*s}px ${FONT}`;x.fillStyle='rgba(255,255,255,.85)';x.fillText(myName+'님의 명품관 한 컷',c.width-14*s,c.height-13*s);
 f.classList.add('on');requestAnimationFrame(()=>requestAnimationFrame(()=>f.classList.remove('on')));
 c.toBlob(b=>{if(!b){toast('📸 저장 실패 — 화면 캡처로 찍어주세요');return;}const url=URL.createObjectURL(b),a=document.createElement('a');a.href=url;a.download='온라인백화점_'+Date.now()+'.png';document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),4000);toast('📸 사진 저장!');},'image/png');}

/* ---------------- UI ---------------- */
let toastT;
function toast(m){const h=document.getElementById('hint');h.textContent=m;h.classList.add('show');clearTimeout(toastT);toastT=setTimeout(()=>h.classList.remove('show'),2800);}
function bindUI(){const $=id=>document.getElementById(id);
 $('bCoupang').onclick=()=>openHall(HALLS[0]);$('bAli').onclick=()=>openHall(HALLS[1]);$('bNaver').onclick=()=>openHall(HALLS[2]);
 $('oClose').onclick=closeHall;$('bSnap').onclick=snap;$('snd').onclick=()=>{audioStart();setMute(!AU.on);};
 const tk=$('talk');$('bTalk').onclick=()=>tk.classList.toggle('open');
 [['😊 기뻐','happy'],['😭 울기','cry']].forEach(([l,k])=>{const b=document.createElement('button');b.className='emo';b.textContent=l;b.onclick=()=>{tk.classList.remove('open');doReact(k);};tk.appendChild(b);});
 PHRASES.forEach((ph,i)=>{const b=document.createElement('button');b.textContent=ph;b.onclick=()=>{say(player.f,ph,3);netEvent('say',i);tk.classList.remove('open');};tk.appendChild(b);});
 renderer.domElement.addEventListener('pointerdown',()=>tk.classList.remove('open'));
 const sw=$('sw');OUTFITS.forEach((c,i)=>{const b=document.createElement('button');b.style.background=hex(c);if(i===0)b.className='on';
  b.onclick=()=>{myColor=c;sw.querySelectorAll('button').forEach(q=>q.classList.remove('on'));b.className='on';recolorPlayer();};sw.appendChild(b);});
 try{const n=localStorage.getItem('dept_nick');if(n)$('nick').value=n;}catch(e){}
 $('nick').addEventListener('keydown',e=>{if(e.key==='Enter')$('go').click();});
 $('go').onclick=()=>{myName=($('nick').value||'손님').trim().slice(0,8)||'손님';try{localStorage.setItem('dept_nick',myName);}catch(e){}
  $('who').textContent=myName;player.f.remove(player.f.userData.tag);addTag(player.f,myName,0,1.98,false);
  audioStart();$('enter').classList.add('hide');setTimeout(()=>$('enter').remove(),800);
  $('hud').classList.add('on');$('bar').classList.add('on');entered=true;netStart();
  camGoal={a:0,t:0.46,d:innerWidth<innerHeight?32:27,slow:true};
  setTimeout(bowAll,900);
  setTimeout(()=>say(window.deskF.f,'어서 오세요, EMPIRE 쇼핑몰입니다 ✨',3),3200);
  setTimeout(()=>toast('🏬 아래 🚀쿠팡관 · ✈️알리관 · 🛍️네이버관 버튼 → 바로 주문서'),2600);
  setTimeout(()=>toast('👆 매장을 콕 눌러도 주문서가 열려요 · 화면 끌면 360°'),6600);};}
function recolorPlayer(){const old=player.f;const p=old.position.clone(),r=old.rotation.y;
 const nf=makeFigure({robe:myColor,top:0xf6efe4,hair:0x2a2018,skin:0xf2c9a0,style:'p',ribbon:0xd8b36a});
 nf.position.copy(p);nf.rotation.y=r;scene.remove(old);scene.add(nf);player.f=nf;addTag(nf,myName,0,1.98,false);addBubble(nf,2.5);}

/* ---------------- 루프 ---------------- */
function animate(){requestAnimationFrame(animate);const dt=Math.min(clock.getDelta(),0.05),t=clock.elapsedTime;
 moveAgent(player,dt);const crowd=NET.peers.size>=4;
 npcs.forEach(a=>{a.f.visible=!crowd;if(!a.f.visible)return;npcThink(a,dt);moveAgent(a,dt);});
 agents.forEach(a=>{if(a.f.visible)animFig(a.f,t,dt,false);});
 HALLS.forEach(h=>{const c=h.concierge;animFig(c.f,t,dt,false);c.t-=dt;if(c.t<0&&entered){if(Math.hypot(player.f.position.x-c.f.position.x,player.f.position.z-c.f.position.z)<7)say(c.f,pick(CONCIERGE_LINES),2.6);c.t=rnd(10,18);}});
 animFig(window.deskF.f,t,dt,false);staffTick(t,dt);
 // 말풍선
 agents.concat(HALLS.map(h=>h.concierge),[window.deskF],STAFF,peerFulls()).forEach(a=>{const b=a.f.userData.bubble;if(!b||!b.sp.visible)return;b.t-=dt;b.pop=Math.min(1,(b.pop||0)+dt*6);
  const e=b.pop<1?1+Math.sin(b.pop*Math.PI)*0.15:1;const k=Math.min(1,b.t*3);b.sp.scale.set(2.3*e*k,0.65*e*k,1);if(b.t<=0)b.sp.visible=false;});
 if(react){reactT+=dt;const u=player.f.userData;
  if(react==='happy'){u.rig.position.y=Math.abs(Math.sin(reactT*9))*0.42;u.rig.rotation.y=reactT*7;u.arms.forEach(a=>a.rotation.x=-2.6);}
  else{u.head.position.y=1.42-Math.abs(Math.sin(reactT*5))*0.08;u.rig.rotation.z=Math.sin(reactT*12)*0.07;u.arms.forEach(a=>a.rotation.x=-2.2);}
  if(reactT>1.5){react=null;u.rig.rotation.set(0,0,0);u.head.position.y=1.42;}}
 spinners.forEach((s,i)=>{s.rotation.y+=dt*0.7;s.position.y=1.8+Math.sin(t*1.4+i)*0.06;});
 chand.forEach(c=>{const a=c.a+t*(0.04+c.k*0.015)*(c.k%2?-1:1);c.s.position.set(Math.sin(a)*c.r,c.y+Math.sin(t*0.8+c.i)*0.12,Math.cos(a)*c.r);const dc=c.s.position.distanceTo(camera.position);c.s.material.opacity=(0.6+Math.sin(t*2+c.i*1.3)*0.3)*clamp((dc-4)/6,0,1);});
 stepParticles(dt);moveMarker.rotation.z+=dt*2;netTick(dt,t);
 // 카메라
 const pp=player.f.position;tmpV.set(pp.x*0.6,1.0,pp.z*0.6);camLook.lerp(tmpV,1-Math.exp(-dt*3));
 if(camGoal&&!dragging){const k=1-Math.exp(-dt*(camGoal.slow?0.9:2.2));camAngle+=angDiff(camAngle,camGoal.a)*k;camTilt+=(camGoal.t-camTilt)*k;camDist+=(camGoal.d-camDist)*k;
  if(Math.abs(angDiff(camAngle,camGoal.a))<0.01&&Math.abs(camDist-camGoal.d)<0.05)camGoal=null;}
 camera.position.set(camLook.x+Math.sin(camAngle)*Math.cos(camTilt)*camDist,Math.max(0.8,camLook.y+Math.sin(camTilt)*camDist),camLook.z+Math.cos(camAngle)*Math.cos(camTilt)*camDist);
 camera.lookAt(camLook);sky.position.copy(camera.position);stars.position.copy(camera.position);
 // 회전해도 안 가리게: 카메라~나 사이에 낀 것만 투명
 const A=camera.position,B=pp.clone().setY(1.2),AB=B.clone().sub(A),L2=AB.lengthSq();
 occluders.forEach(o=>{const t2=clamp(o.c.clone().sub(A).dot(AB)/L2,0,1);const q=A.clone().addScaledVector(AB,t2);const block=t2>0.02&&t2<0.97&&q.distanceTo(o.c)<o.r;
  const tg=block?0.1:1;o.a+=(tg-o.a)*(1-Math.exp(-dt*9));o.mats.forEach(m=>{m.opacity=m.userData.o0*o.a;m.depthWrite=o.a>0.6&&m.userData.o0>=0.99;});});
 renderer.render(scene,camera);}
function onResize(){camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);}
