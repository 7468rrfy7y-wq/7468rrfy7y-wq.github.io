/* =========================================================
   앗싸라비아 · 경산 Beer & Soju  메타버스 v1 (2026-11-18)
   ========================================================= */
const OUTFITS=[0x3b6ea5,0xe0607e,0x6aa37a,0xe8a23c,0x8a6cc8,0x2f2a3a];
const NAVER_MAP='https://map.naver.com/p/search/'+encodeURIComponent('경산 앗싸라비아');
// 네이버 플레이스 메뉴 (최근 업데이트 26.11.16 화면 기준 · 일부)
const MENU=[
 {n:'얼큰콩나물오뎅탕',p:25000,c:0xd9532b,k:'pot',e:'🍲'},
 {n:'오징어무침',p:20000,c:0xe0552d,k:'noodle',e:'🦑'},
 {n:'골뱅이 무침',p:20000,c:0xc9502a,k:'noodle',e:'🐚'},
 {n:'육전',p:20000,c:0xc9a050,k:'jeon',e:'🥩'},
 {n:'오징어볶음',p:20000,c:0xd8481f,k:'noodle',e:'🌶'},
 {n:'오돌뼈',p:15000,c:0x7a3418,k:'sizzle',e:'🔥'},
 {n:'동태전',p:15000,c:0xe6b44a,k:'jeon',e:'🐟'},
 {n:'똥집볶음',p:15000,c:0x5e4232,k:'sizzle',e:'🍗'},
 {n:'짬뽕탕',p:15000,c:0xe04a20,k:'pot',e:'🍜'},
 {n:'먹태',p:15000,c:0xf0d29a,k:'dry',e:'🐟'},
 {n:'모듬소시지',p:15000,c:0xb5452e,k:'plate',e:'🌭'},
 {n:'버터오징어구이',p:13000,c:0x9a4a30,k:'dry',e:'🦑'},
 {n:'닭꼬치',p:13000,c:0x8a5a30,k:'plate',e:'🍢'},
 {n:'땅콩버터진미채',p:12000,c:0xd28a4a,k:'dry',e:'🥜'},
 {n:'콘치즈나초',p:12000,c:0xf2d060,k:'sizzle',e:'🧀'},
 {n:'김치전',p:11000,c:0xe0662d,k:'jeon',e:'🥞'},
 {n:'토마토사시미',p:11000,c:0xf05a40,k:'plate',e:'🍅'},
 {n:'파인애플샤베트',p:8000,c:0xf2e27a,k:'plate',e:'🍍'},
 {n:'토마토꿀조림',p:7000,c:0xf0644a,k:'plate',e:'🍯'},
 {n:'나초',p:7000,c:0xf0c860,k:'plate',e:'🌮'},
 {n:'아이스황도',p:6000,c:0xf5b830,k:'bowl',e:'🍑'},
 {n:'짜장라면',p:6000,c:0x3a2a1a,k:'bowl',e:'🍝'},
];
const MASTER_LINES=['어서오세요~ 앗싸라비아입니다 🍺','생맥은 라인 청소가 생명이에요','거품까지 맛있게 따라드릴게요','2차는 앗싸라비아~ 🍻','오늘 생맥 컨디션 최고예요!'];
const GUEST_LINES=['여기 생맥 거품 미쳤다','2차는 무조건 여기지','골뱅이 무침 하나 더요~','토마토 사시미 상큼하다','경산에 이런 데가 있었네','한 잔 더! 🍺','짠~! 🍻','사장님 맥주 마스터래','노래 좋다 🎵'];

const HW=5.5,HD=4.5,DOOR=[3.35,4.45],FRONT=4.45;
let scene,camera,renderer,raycaster,pointer,clock;
let skyMat,stars,moonLight,hemi,amb;
const lampMats=[],lampGlows=[],walls=[],clickables=[],floorHits=[],OBST=[],marquee=[];
const agents=[],npcs=[],particles=[],tables=[],stools=[],neighbors=[];
let player,mugHand,master,moveMarker,tapGlass,airSign,signTex;
let camAngle=0.25,camTilt=0.62,camDist=13.5,camGoal=null,camTarget;
let dragging=false,dragMoved=false,lastX=0,lastY=0,downX=0,downY=0,downT=0,pinchD=0;
let react=null,reactT=0,planToken=0,entered=false,cheersT=0,beers=0;
let myName='손님',myColor=OUTFITS[0];
let tmpV,camLook,steamT=0,greetCD=0;

/* ---------------- 초기화 ---------------- */
function init(){
 clock=new THREE.Clock();
 scene=new THREE.Scene();
 scene.fog=new THREE.Fog(0x141a33,22,70);
 renderer=new THREE.WebGLRenderer({antialias:true,powerPreference:'high-performance'});
 renderer.setPixelRatio(Math.min(devicePixelRatio,2));
 renderer.setSize(innerWidth,innerHeight);
 renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
 document.getElementById('app').appendChild(renderer.domElement);
 camera=new THREE.PerspectiveCamera(40,innerWidth/innerHeight,0.1,300);
 raycaster=new THREE.Raycaster();pointer=new THREE.Vector2();
 glowTex=glowTexture();tmpV=new THREE.Vector3();camLook=new THREE.Vector3(0,1,1.2);

 hemi=new THREE.HemisphereLight(0x5a6aa8,0x2a1f1a,0.55);scene.add(hemi);
 amb=new THREE.AmbientLight(0xffd9a0,0.28);scene.add(amb);
 // 실내 천장등 (그림자용)
 const top=new THREE.DirectionalLight(0xfff0d0,0.55);top.position.set(2,12,3);top.target.position.set(0,0,0);top.castShadow=true;
 top.shadow.mapSize.set(2048,2048);const sc=top.shadow.camera;sc.left=-9;sc.right=9;sc.top=9;sc.bottom=-9;sc.near=1;sc.far=30;top.shadow.bias=-0.0006;top.shadow.normalBias=0.02;
 scene.add(top);scene.add(top.target);
 moonLight=new THREE.DirectionalLight(0x8fa8ff,0.25);moonLight.position.set(-10,14,20);scene.add(moonLight);

 buildSky();buildStreet();buildPub();buildFurniture();buildPeople();

 const mk=new THREE.Mesh(new THREE.RingGeometry(0.22,0.32,32),new THREE.MeshBasicMaterial({color:0xffd27a,transparent:true,opacity:0,side:THREE.DoubleSide,depthWrite:false}));
 mk.rotation.x=-Math.PI/2;mk.position.y=0.03;scene.add(mk);moveMarker=mk;

 const el=renderer.domElement;
 el.addEventListener('pointerdown',onDown);el.addEventListener('pointermove',onMove);
 window.addEventListener('pointerup',onUp);window.addEventListener('pointercancel',()=>dragging=false);
 el.addEventListener('wheel',e=>{e.preventDefault();camGoal=null;camDist=clamp(camDist+e.deltaY*0.012,6,24);},{passive:false});
 el.addEventListener('touchmove',e=>{if(e.touches.length===2){const d=Math.hypot(e.touches[0].clientX-e.touches[1].clientX,e.touches[0].clientY-e.touches[1].clientY);
   if(pinchD)camDist=clamp(camDist-(d-pinchD)*0.03,6,24);pinchD=d;dragging=false;dragMoved=true;camGoal=null;}},{passive:true});
 el.addEventListener('touchend',()=>pinchD=0);
 window.addEventListener('resize',onResize);
 bindUI();animate();
}

/* ---------------- 밤하늘 ---------------- */
let sky;
function buildSky(){
 skyMat=new THREE.ShaderMaterial({side:THREE.BackSide,depthWrite:false,fog:false,
  vertexShader:`varying vec3 vP;void main(){vP=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
  fragmentShader:`varying vec3 vP;void main(){vec3 d=normalize(vP);float h=d.y;
   vec3 col=mix(vec3(.16,.13,.28),vec3(.03,.05,.13),smoothstep(-0.02,0.55,h));
   vec3 m=normalize(vec3(-0.45,0.42,-0.78));float s=max(dot(d,m),0.);
   col+=vec3(.55,.6,.9)*pow(s,40.)*.25;col=mix(col,vec3(.95,.93,.85),smoothstep(0.9993,0.9996,s));
   col+=vec3(.35,.2,.1)*smoothstep(.12,0.,h)*.35;
   gl_FragColor=vec4(col,1.);}`});
 sky=new THREE.Mesh(new THREE.SphereGeometry(150,32,16),skyMat);scene.add(sky);
 const N=700,pos=new Float32Array(N*3);
 for(let i=0;i<N;i++){const th=Math.random()*Math.PI*2,ph=Math.acos(rnd(0.12,1));pos[i*3]=Math.sin(ph)*Math.cos(th)*140;pos[i*3+1]=Math.cos(ph)*140;pos[i*3+2]=Math.sin(ph)*Math.sin(th)*140;}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(pos,3));
 stars=new THREE.Points(g,new THREE.PointsMaterial({color:0xffffff,size:1.5,sizeAttenuation:false,transparent:true,opacity:0.8,fog:false,depthWrite:false}));scene.add(stars);
}

/* ---------------- 경산 밤거리 ---------------- */
function buildStreet(){
 const asphalt=ctex(256,256,(x,w,h)=>{x.fillStyle='#2b2d33';x.fillRect(0,0,w,h);for(let i=0;i<3000;i++){const v=rnd(30,70);x.fillStyle=`rgba(${v},${v},${v+6},.6)`;x.fillRect(rnd(0,w),rnd(0,h),1.5,1.5);}},[20,4]);
 const road=new THREE.Mesh(new THREE.PlaneGeometry(90,9),M(0xffffff,0.95,{map:asphalt}));road.rotation.x=-Math.PI/2;road.position.set(0,-0.12,12.2);road.receiveShadow=true;scene.add(road);floorHits.push(road);
 for(let i=-20;i<=20;i++){const l=new THREE.Mesh(new THREE.PlaneGeometry(1.6,0.14),new THREE.MeshBasicMaterial({color:0xd8c060}));l.rotation.x=-Math.PI/2;l.position.set(i*3.2,-0.11,12.2);scene.add(l);}
 const tileT=ctex(256,256,(x,w,h)=>{x.fillStyle='#8d8579';x.fillRect(0,0,w,h);for(let r=0;r<8;r++)for(let c=0;c<8;c++){const v=rnd(-12,12);x.fillStyle=`rgb(${150+v},${142+v},${130+v})`;x.fillRect(c*32+1,r*32+1,30,30);}},[30,2.5]);
 const walk=new THREE.Mesh(new THREE.BoxGeometry(90,0.12,3.4),M(0xffffff,0.9,{map:tileT}));walk.position.set(0,-0.06,6.2);walk.receiveShadow=true;scene.add(walk);floorHits.push(walk);
 mesh(new THREE.BoxGeometry(90,0.16,0.18),M(0x9a948a,0.8),0,-0.04,7.95);
 // 건너편 건물
 const bld=(x,z,w,h,d,col,lit)=>{const b=mesh(new THREE.BoxGeometry(w,h,d),M(col,0.9),x,h/2-0.1,z);
  for(let fy=1.4;fy<h-0.6;fy+=1.5)for(let fx=-w/2+0.8;fx<w/2-0.5;fx+=1.3){if(Math.random()<lit){const wm=new THREE.Mesh(new THREE.PlaneGeometry(0.8,0.7),new THREE.MeshBasicMaterial({color:pick([0xffd9a0,0xfff0d0,0xa8c8ff])}));wm.position.set(x+fx,fy,z+(z>10?-d/2-0.01:d/2+0.01));if(z>10)wm.rotation.y=Math.PI;scene.add(wm);}}};
 bld(-12,19,9,9,4,0x2e3040,0.35);bld(-2,20,8,13,5,0x343448,0.3);bld(7,19,7,7,4,0x3a3140,0.4);bld(16,20,10,11,5,0x2a2e3e,0.3);bld(-22,19,8,6,4,0x323042,0.4);
 // 옆 가게들 (밤엔 불 꺼진 학원·꽃집·커피숍)
 const shop=(x,w,name,col)=>{const g=new THREE.Group();g.position.set(x,0,0);scene.add(g);neighbors.push(g);
  mesh(new THREE.BoxGeometry(w,4.4,9),M(col,0.9),0,2.1,0,g);
  const t=ctex(256,64,(c,W,H)=>{c.fillStyle='#22232a';c.fillRect(0,0,W,H);c.fillStyle='#55565e';c.font='34px '+FONT;c.textAlign='center';c.textBaseline='middle';c.fillText(name,W/2,H/2+2);});
  const s=new THREE.Mesh(new THREE.PlaneGeometry(w*0.8,0.7),new THREE.MeshBasicMaterial({map:t}));s.position.set(0,3.6,4.52);g.add(s);
  const gl=new THREE.Mesh(new THREE.PlaneGeometry(w*0.8,2.2),new THREE.MeshStandardMaterial({color:0x101218,roughness:0.2,metalness:0.4}));gl.position.set(0,1.3,4.52);g.add(gl);};
 shop(-8.6,5.8,'○○학원 (영업 종료)',0x3a3b44);shop(-14.6,5.8,'꽃집',0x403a3e);shop(9.2,7,'커피 (CLOSED)',0x3c3a3a);
 // 가로등
 [-10,12].forEach(x=>{mesh(new THREE.CylinderGeometry(0.07,0.09,4.6,8),M(0x3a3d44,0.5,{metalness:0.5}),x,2.3,7.7);
  mesh(new THREE.BoxGeometry(0.9,0.08,0.18),M(0x3a3d44,0.5),x-0.35,4.55,7.7);
  lampGlows.push(glowSprite(0xffe2a8,2.4,scene,x-0.7,4.45,7.7,0.8));
  const pl=new THREE.SpotLight(0xffe0b0,0.5,12,0.7,0.6);pl.position.set(x-0.7,4.4,7.7);pl.target.position.set(x-0.7,0,7.4);scene.add(pl);scene.add(pl.target);});
 // 에어간판 (풍선 간판)
 airSign=new THREE.Group();airSign.position.set(-4.7,0,6.1);scene.add(airSign);
 mesh(new THREE.CylinderGeometry(0.5,0.55,0.35,16),M(0x2b2b2b,0.6),0,0.17,0,airSign);
 const tubeT=ctex(128,512,(x,w,h)=>{const g=x.createLinearGradient(0,0,0,h);g.addColorStop(0,'#ffe04a');g.addColorStop(1,'#ff9a2a');x.fillStyle=g;x.fillRect(0,0,w,h);
  x.fillStyle='#7a2fd0';x.font='72px '+FONT;x.textAlign='center';['생','맥','주','🍺'].forEach((c,i)=>x.fillText(c,w/2,100+i*115));});
 airSign.userData.segs=[];
 for(let i=0;i<4;i++){const seg=new THREE.Group();seg.position.y=i===0?0.35:0.75;(i===0?airSign:airSign.userData.segs[i-1]).add(seg);
  const tt=tubeT.clone();tt.needsUpdate=true;tt.repeat.set(1,0.25);tt.offset.y=0.75-i*0.25;const m=new THREE.Mesh(new THREE.CylinderGeometry(0.34,0.36,0.75,18,1,true),new THREE.MeshStandardMaterial({map:tt,emissive:0xffb040,emissiveMap:tt,emissiveIntensity:0.6,side:THREE.DoubleSide,roughness:0.6}));
  m.position.y=0.375;m.castShadow=true;seg.add(m);airSign.userData.segs.push(seg);}
 lampGlows.push(glowSprite(0xffb040,3.2,airSign,0,1.8,0,0.35));
 const hit=new THREE.Mesh(new THREE.CylinderGeometry(0.6,0.6,3.4,10),new THREE.MeshBasicMaterial({visible:false}));hit.position.y=1.7;hit.userData.act={type:'map'};airSign.add(hit);clickables.push(hit);
 OBST.push({x:-4.7,z:6.1,r:0.6});
}

/* ---------------- 가게 건물 ---------------- */
function buildPub(){
 // 바닥 (갈색 대리석 타일)
 const floorT=ctex(512,512,(x,w,h)=>{const s=128;for(let r=0;r<4;r++)for(let c=0;c<4;c++){const v=rnd(-10,10);x.fillStyle=`rgb(${128+v},${104+v},${88+v})`;x.fillRect(c*s,r*s,s,s);
  for(let k=0;k<6;k++){x.strokeStyle=`rgba(${170+v},${150+v},${130+v},.25)`;x.lineWidth=rnd(1,3);x.beginPath();x.moveTo(c*s+rnd(0,s),r*s);x.bezierCurveTo(c*s+rnd(0,s),r*s+40,c*s+rnd(0,s),r*s+90,c*s+rnd(0,s),r*s+s);x.stroke();}
  x.strokeStyle='rgba(60,45,38,.5)';x.lineWidth=2;x.strokeRect(c*s,r*s,s,s);}},[2.75,2.25]);
 const floor=mesh(new THREE.BoxGeometry(HW*2,0.3,HD*2),M(0xffffff,0.55,{map:floorT}),0,-0.15,0);floor.castShadow=false;floorHits.push(floor);
 const yellowT=()=>ctex(256,256,(x,w,h)=>{x.fillStyle='#e8a91e';x.fillRect(0,0,w,h);for(let i=0;i<900;i++){x.fillStyle=`rgba(${rnd(200,255)},${rnd(140,190)},20,.15)`;x.fillRect(rnd(0,w),rnd(0,h),2,2);}},[3,1.5]);
 const mkWall=(n,c)=>{const g=new THREE.Group();scene.add(g);const w={g,n:new THREE.Vector3(...n),c:new THREE.Vector3(...c),a:1,mats:[]};walls.push(w);return w;};
 const reg=w=>w.g.traverse(o=>{if(o.material&&!w.mats.includes(o.material)){o.material.transparent=true;w.mats.push(o.material);}});
 const base=()=>M(0xf6f2ea,0.6);

 // 왼쪽 벽 (하트 풍선)
 const wL=mkWall([-1,0,0],[-HW,0,0]);
 mesh(new THREE.BoxGeometry(0.2,3.3,HD*2),M(0xffffff,0.9,{map:yellowT()}),-HW,1.65,0,wL.g);
 mesh(new THREE.BoxGeometry(0.05,0.12,HD*2-0.2),base(),-HW+0.12,0.06,0,wL.g);
 const heart=new THREE.Shape();heart.moveTo(0,-0.5);heart.bezierCurveTo(-0.15,-0.32,-0.6,-0.05,-0.5,0.25);heart.bezierCurveTo(-0.42,0.52,-0.08,0.55,0,0.3);heart.bezierCurveTo(0.08,0.55,0.42,0.52,0.5,0.25);heart.bezierCurveTo(0.6,-0.05,0.15,-0.32,0,-0.5);
 const hg=new THREE.ExtrudeGeometry(heart,{depth:0.08,bevelEnabled:true,bevelThickness:0.06,bevelSize:0.05,bevelSegments:3,curveSegments:16});hg.center();
 const blackM=M(0x151515,0.25,{metalness:0.6}),silverM=M(0xdfe3e8,0.15,{metalness:0.95});
 [[-1.6,2.6,0.6,0],[-0.9,2.2,0.5,1],[-0.3,2.75,0.55,0],[0.4,2.35,0.6,1],[1.1,2.8,0.45,0],[1.6,2.25,0.5,0],[-1.2,1.75,0.4,1],[0.9,1.85,0.42,0],[-0.1,1.95,0.38,1],[2.1,2.7,0.4,1]].forEach(([z,y,s,sil],i)=>{
  const h=new THREE.Mesh(hg,sil?silverM:blackM);h.scale.setScalar(s);h.position.set(-HW+0.24,y,z);h.rotation.y=Math.PI/2+rnd(-0.25,0.25);h.rotation.z=rnd(-0.3,0.3);h.castShadow=true;h.userData.bob=i;wL.g.add(h);marquee.push({balloon:h,y});});
 // 메뉴판 포스터 (실제 메뉴판 사진)
 const menuTex=new THREE.TextureLoader().load(window.MENU_IMG);menuTex.anisotropy=8;
 mesh(new THREE.BoxGeometry(0.04,0.98,2.18),M(0x3b2a1e),-HW+0.12,1.75,2.7,wL.g);
 const mp=new THREE.Mesh(new THREE.PlaneGeometry(2.1,0.95),new THREE.MeshStandardMaterial({map:menuTex,roughness:0.7}));mp.position.set(-HW+0.15,1.75,2.7);mp.rotation.y=Math.PI/2;wL.g.add(mp);
 reg(wL);

 // 오른쪽 벽 (TV · 메뉴판)
 const wR=mkWall([1,0,0],[HW,0,0]);
 mesh(new THREE.BoxGeometry(0.2,3.3,HD*2),M(0xffffff,0.9,{map:yellowT()}),HW,1.65,0,wR.g);
 mesh(new THREE.BoxGeometry(0.05,0.12,HD*2-0.2),base(),HW-0.12,0.06,0,wR.g);
 const tvT=ctex(512,288,(x,w,h)=>{const g=x.createLinearGradient(0,0,w,h);g.addColorStop(0,'#1d2b6b');g.addColorStop(1,'#6b1d5e');x.fillStyle=g;x.fillRect(0,0,w,h);
  x.fillStyle='#ffe04a';x.font='54px '+FONT;x.textAlign='center';x.fillText('🍺 오늘의 생맥',w/2,110);x.fillStyle='#fff';x.font='36px '+FONT;x.fillText('맥주 마스터가 직접 따라요',w/2,170);x.fillText('2차는 앗싸라비아 🎵',w/2,225);});
 mesh(new THREE.BoxGeometry(0.08,0.95,1.62),M(0x111111,0.3),HW-0.14,2.45,-2.6,wR.g);
 const tvM=new THREE.MeshStandardMaterial({map:tvT,emissive:0xffffff,emissiveMap:tvT,emissiveIntensity:0.8});
 const tv=new THREE.Mesh(new THREE.PlaneGeometry(1.5,0.85),tvM);tv.position.set(HW-0.19,2.45,-2.6);tv.rotation.y=-Math.PI/2;wR.g.add(tv);
 mesh(new THREE.BoxGeometry(0.04,0.98,2.18),M(0x3b2a1e),HW-0.12,1.75,1.4,wR.g);
 const mp2=new THREE.Mesh(new THREE.PlaneGeometry(2.1,0.95),new THREE.MeshStandardMaterial({map:menuTex,roughness:0.7}));mp2.position.set(HW-0.15,1.75,1.4);mp2.rotation.y=-Math.PI/2;wR.g.add(mp2);
 reg(wR);

 // 뒷벽 (생맥 탭 · 체크 커튼 · 냉장고)
 const wB=mkWall([0,0,-1],[0,0,-HD]);
 mesh(new THREE.BoxGeometry(HW*2,3.3,0.2),M(0xffffff,0.9,{map:yellowT()}),0,1.65,-HD,wB.g);
 const gingT=ctex(128,128,(x,w)=>{x.fillStyle='#efe6d6';x.fillRect(0,0,w,w);x.fillStyle='rgba(150,130,105,.45)';for(let i=0;i<8;i++){x.fillRect(i*16,0,8,w);x.fillRect(0,i*16,w,8);}},[3,3]);
 const cur=new THREE.Mesh(new THREE.PlaneGeometry(1.3,2.4,24,1),M(0xffffff,0.95,{map:gingT,side:THREE.DoubleSide}));
 const cp=cur.geometry.attributes.position;for(let i=0;i<cp.count;i++)cp.setZ(i,Math.sin(cp.getX(i)*14)*0.05);cur.geometry.computeVertexNormals();
 cur.position.set(-2.4,1.25,-HD+0.13);wB.g.add(cur);
 [[-2.95,1.7],[-2.95,1.2],[-1.85,1.5]].forEach(([x,y])=>mesh(new THREE.SphereGeometry(0.09,10,8),M(0xf6efe4,0.9),x,y,-HD+0.19,wB.g));
 const cleanT=ctex(256,320,(x,w,h)=>{x.fillStyle='#fff';x.fillRect(0,0,w,h);x.fillStyle='#1d3c7a';x.fillRect(0,0,w,70);x.fillStyle='#fff';x.font='30px '+FONT;x.textAlign='center';x.fillText('생맥 라인 청소',w/2,46);
  x.fillStyle='#1d3c7a';x.font='40px '+FONT;x.fillText('실천 매장 ✓',w/2,140);x.font='24px '+FONT;x.fillStyle='#555';x.fillText('맥주 맛의 핵심은',w/2,200);x.fillText('깨끗한 생맥 라인',w/2,236);x.font='40px sans-serif';x.fillText('🍺',w/2,295);});
 const cs=new THREE.Mesh(new THREE.PlaneGeometry(0.62,0.78),M(0xffffff,0.8,{map:cleanT}));cs.position.set(0.0,1.85,-HD+0.12);wB.g.add(cs);
 reg(wB);

 // 앞벽 (폴딩창 · 문 · 간판)
 const wF=mkWall([0,0,1],[0,0,HD]);
 const fm=M(0x3a2a22,0.6);
 const front=(x0,x1,y0,y1,mat)=>mesh(new THREE.BoxGeometry(x1-x0,y1-y0,0.2),mat,(x0+x1)/2,(y0+y1)/2,HD,wF.g);
 front(-HW,-4.8,0,3.3,fm);front(2.4,DOOR[0]-0.1,0,3.3,fm);front(DOOR[1]+0.1,HW,0,3.3,fm);
 front(-4.8,2.4,2.6,3.3,fm);front(DOOR[0]-0.1,DOOR[1]+0.1,2.5,3.3,fm);
 const panelT=ctex(1024,128,(x,w,h)=>{x.fillStyle='#f2c22a';x.fillRect(0,0,w,h);for(let i=0;i<120;i++){x.fillStyle='rgba(255,255,255,.55)';x.beginPath();x.arc(rnd(0,w),rnd(0,h),rnd(1,3),0,7);x.fill();}
  x.fillStyle='#2a1d4a';rr(x,330,14,360,100,50);x.fill();x.fillStyle='#d7c8ff';x.font='52px '+FONT;x.textAlign='center';x.fillText('앗싸라비아',w/2,78);x.font='44px sans-serif';x.fillText('🎵',200,82);x.fillText('🍺',840,82);});
 front(-4.8,2.4,0,1.0,M(0xffffff,0.7,{map:panelT}));
 // 바 선반 (창 밖)
 mesh(new THREE.BoxGeometry(7.4,0.06,0.45),M(0x2b2b2b,0.4,{metalness:0.4}),-1.2,1.02,HD+0.3,wF.g);
 // 접힌 폴딩창
 const glM=new THREE.MeshStandardMaterial({color:0xcfe0ff,transparent:true,opacity:0.18,roughness:0.05,metalness:0.3,depthWrite:false});
 [[-4.75,1],[2.35,-1]].forEach(([x,s])=>{for(let i=0;i<3;i++){const p=new THREE.Group();p.position.set(x+s*i*0.07,1.8,HD+0.12+i*0.02);p.rotation.y=s*(0.4+i*0.25);wF.g.add(p);
  const fr=mesh(new THREE.BoxGeometry(0.55,1.55,0.04),M(0xe9e9e9,0.5),s*0.27,0,0,p);const gl=new THREE.Mesh(new THREE.PlaneGeometry(0.45,1.4),glM);gl.position.set(s*0.27,0,0.025);p.add(gl);}});
 // 문 (열린 유리문)
 const dp=new THREE.Group();dp.position.set(DOOR[1],1.25,HD+0.1);dp.rotation.y=-1.25;wF.g.add(dp);
 mesh(new THREE.BoxGeometry(1.05,2.45,0.05),M(0x2b2b2b,0.4,{metalness:0.5}),-0.53,0,0,dp);
 const dg=new THREE.Mesh(new THREE.PlaneGeometry(0.9,2.2),glM);dg.position.set(-0.53,0,0.03);dp.add(dg);
 // 주황 어닝
 const aw=mesh(new THREE.BoxGeometry(HW*2+0.4,0.08,1.2),M(0xe2741c,0.7),0,2.92,HD+0.55,wF.g);aw.rotation.x=0.32;
 const val=mesh(new THREE.BoxGeometry(HW*2+0.4,0.22,0.04),M(0xc8601a,0.7),0,2.68,HD+1.12,wF.g);
 // 큰 간판 (실제 간판 사진)
 signTex=new THREE.TextureLoader().load(window.SIGN_IMG);signTex.anisotropy=8;
 mesh(new THREE.BoxGeometry(7.4,1.95,0.3),M(0x1a1420,0.5),0,4.15,HD+0.1,wF.g);
 const sm=new THREE.MeshStandardMaterial({map:signTex,emissive:0xffffff,emissiveMap:signTex,emissiveIntensity:0.95,roughness:0.6});
 const sign=new THREE.Mesh(new THREE.PlaneGeometry(7.0,1.74),sm);sign.position.set(0,4.15,HD+0.26);wF.g.add(sign);lampMats.push(sm);
 // 간판 테두리 전구 (깜빡깜빡)
 const bulbG=new THREE.SphereGeometry(0.045,8,6);
 const SW=7.2,SH=1.9,SX=-3.6,SY=5.1;for(let i=0;i<64;i++){const t=i/64,per=2*SW+2*SH;let d=t*per,x,y;
  if(d<SW){x=SX+d;y=SY;}else if(d<SW+SH){x=SX+SW;y=SY-(d-SW);}else if(d<2*SW+SH){x=SX+SW-(d-SW-SH);y=SY-SH;}else{x=SX;y=SY-SH+(d-2*SW-SH);}
  const bm=new THREE.MeshBasicMaterial({color:0xffe27a});const b=new THREE.Mesh(bulbG,bm);b.position.set(x,y,HD+0.3);wF.g.add(b);marquee.push({bulb:b,i});}
 const sHit=new THREE.Mesh(new THREE.BoxGeometry(7.2,1.9,0.4),new THREE.MeshBasicMaterial({visible:false}));sHit.position.set(0,4.15,HD+0.3);sHit.userData.act={type:'map'};scene.add(sHit);clickables.push(sHit);
 reg(wF);
 lampGlows.push(glowSprite(0xffd060,8,scene,0,4.15,HD+1.0,0.25));
 const sl=new THREE.PointLight(0xffd070,0.7,9,1.5);sl.position.set(0,3.6,HD+1.6);scene.add(sl);
}

/* ---------------- 가구 ---------------- */
function buildFurniture(){
 // 생맥 카운터
 const ct=new THREE.Group();ct.position.set(1.4,0,-3.75);scene.add(ct);
 const ctr=mesh(new THREE.BoxGeometry(4.4,1.02,0.62),M(0xf4f1ea,0.5),0,0.51,0,ct);ctr.userData.act={type:'beer'};clickables.push(ctr);
 mesh(new THREE.BoxGeometry(4.6,0.06,0.72),M(0x8d8f93,0.3,{metalness:0.3}),0,1.05,0,ct);
 // 생맥 탭
 mesh(new THREE.BoxGeometry(0.5,0.42,0.3),M(0xc0c4c8,0.2,{metalness:0.9}),1.1,1.29,-0.1,ct);
 [0.92,1.28].forEach(x=>{mesh(new THREE.CylinderGeometry(0.03,0.03,0.18,8),M(0xd0d4d8,0.2,{metalness:0.9}),x,1.32,0.12,ct).rotation.x=Math.PI/2;
  mesh(new THREE.CylinderGeometry(0.035,0.025,0.26,10),M(0x111111,0.3),x,1.5,0.18,ct);});
 const tapSignT=ctex(256,256,(x,w)=>{x.fillStyle='#fff';x.beginPath();x.arc(128,128,124,0,7);x.fill();x.fillStyle='#16a39a';x.font='70px '+FONT;x.textAlign='center';x.fillText('생맥주',128,120);x.font='34px '+FONT;x.fillStyle='#e8a91e';x.fillText('DRAFT',128,170);});
 const tsM=new THREE.MeshStandardMaterial({map:tapSignT,emissive:0xffffff,emissiveMap:tapSignT,emissiveIntensity:0.9,transparent:true});
 const ts=new THREE.Mesh(new THREE.CircleGeometry(0.26,32),tsM);ts.position.set(1.1,1.85,-0.1);ct.add(ts);lampMats.push(tsM);
 mesh(new THREE.CylinderGeometry(0.03,0.03,0.4,8),M(0xc0c4c8,0.2,{metalness:0.9}),1.1,1.58,-0.12,ct);
 // 따르는 잔
 tapGlass=new THREE.Group();tapGlass.position.set(1.28,1.08,0.14);ct.add(tapGlass);tapGlass.visible=false;
 const tgB=new THREE.Mesh(new THREE.CylinderGeometry(0.075,0.06,1,14),new THREE.MeshStandardMaterial({color:0xf0a020,emissive:0xa05a00,emissiveIntensity:0.35,roughness:0.2}));tgB.position.y=0.5;
 const tgBeer=new THREE.Group();tgBeer.add(tgB);tapGlass.add(tgBeer);tapGlass.userData.beer=tgBeer;
 const tgF=mesh(new THREE.CylinderGeometry(0.078,0.078,0.04,14),M(0xfffcf0,0.9),0,0,0,tapGlass);tapGlass.userData.foam=tgF;
 const tgG=new THREE.Mesh(new THREE.CylinderGeometry(0.085,0.068,0.26,14,1,true),new THREE.MeshStandardMaterial({color:0xe8f4ff,transparent:true,opacity:0.3,roughness:0.05,side:THREE.DoubleSide,depthWrite:false}));tgG.position.y=0.13;tapGlass.add(tgG);
 const strm=new THREE.Mesh(new THREE.CylinderGeometry(0.012,0.012,0.3,6),new THREE.MeshStandardMaterial({color:0xf0b040,emissive:0x8a5000,transparent:true,opacity:0.85}));strm.position.set(0,0.4,0);tapGlass.add(strm);tapGlass.userData.stream=strm;
 // 잔 진열
 for(let i=0;i<6;i++)mesh(new THREE.CylinderGeometry(0.07,0.055,0.22,12),new THREE.MeshStandardMaterial({color:0xe8f4ff,transparent:true,opacity:0.4,roughness:0.05}),-1.8+i*0.22,1.19,0.05,ct);
 OBST.push({x:-0.6,z:-3.75,r:0.5},{x:0.6,z:-3.75,r:0.5},{x:1.8,z:-3.75,r:0.5},{x:3.0,z:-3.75,r:0.5});
 // 냉장고
 const fr=new THREE.Group();fr.position.set(-4.75,0,-3.9);scene.add(fr);
 mesh(new THREE.BoxGeometry(1.0,2.1,0.75),M(0xf2f2f2,0.4),0,1.05,0,fr);
 const fgM=new THREE.MeshStandardMaterial({color:0x5ab4ff,emissive:0x3a8cff,emissiveIntensity:0.9,transparent:true,opacity:0.55});
 const fg=new THREE.Mesh(new THREE.PlaneGeometry(0.85,1.75),fgM);fg.position.set(0,1.12,0.38);fr.add(fg);lampMats.push(fgM);
 for(let r=0;r<4;r++)for(let c=0;c<6;c++)mesh(new THREE.CylinderGeometry(0.035,0.04,0.3,8),M(pick([0x2f8a4a,0x1f6a3a,0xe8e8e8,0x2a5fb0]),0.3),-0.34+c*0.135,0.48+r*0.4,0.18,fr);
 lampGlows.push(glowSprite(0x4aa0ff,2.0,fr,0,1.1,0.6,0.35));
 OBST.push({x:-4.75,z:-3.9,r:0.7});
 // 펜던트 조명
 const pend=(x,z)=>{mesh(new THREE.CylinderGeometry(0.008,0.008,0.6,4),M(0x222222),x,3.0,z).castShadow=false;
  const sh=mesh(new THREE.CylinderGeometry(0.05,0.26,0.2,20,1,true),M(0xf4f4f0,0.4,{side:THREE.DoubleSide}),x,2.66,z);sh.castShadow=false;
  const bm=new THREE.MeshStandardMaterial({color:0xfff2d0,emissive:0xffd890,emissiveIntensity:1.2});const b=mesh(new THREE.SphereGeometry(0.06,10,8),bm,x,2.57,z);b.castShadow=false;lampMats.push(bm);
  lampGlows.push(glowSprite(0xffd890,1.0,scene,x,2.55,z,0.6));};
 // 테이블 4개 + 의자
 [[-2.7,-0.9],[2.3,-0.9],[-2.7,2.1],[2.3,2.1]].forEach(([tx,tz],ti)=>{
  const g=new THREE.Group();g.position.set(tx,0,tz);scene.add(g);
  const marbleT=ctex(256,128,(x,w,h)=>{x.fillStyle='#8f9296';x.fillRect(0,0,w,h);for(let i=0;i<1600;i++){const v=rnd(110,175);x.fillStyle=`rgba(${v},${v},${v+4},.5)`;x.fillRect(rnd(0,w),rnd(0,h),2,2);}});
  const top=mesh(new THREE.BoxGeometry(1.35,0.05,0.82),M(0xffffff,0.45,{map:marbleT}),0,0.76,0,g);
  [[-0.6,-0.35],[0.6,-0.35],[-0.6,0.35],[0.6,0.35]].forEach(([a,b])=>mesh(new THREE.BoxGeometry(0.04,0.74,0.04),M(0xf2f2f2,0.4),a,0.37,b,g));
  top.userData.act={type:'table',ti};clickables.push(top);
  const seats=[];
  [[-0.36,-0.68,0],[0.36,-0.68,0],[-0.36,0.68,Math.PI],[0.36,0.68,Math.PI]].forEach(([cx,cz,yaw])=>{
   const c=new THREE.Group();c.position.set(cx,0,cz);c.rotation.y=yaw;g.add(c);
   const shellM=M(0x9a9da2,0.5);
   const seat=mesh(new THREE.BoxGeometry(0.42,0.04,0.4),shellM,0,0.46,0,c);
   mesh(new THREE.CylinderGeometry(0.22,0.22,0.36,16,1,true,Math.PI*0.6,Math.PI*0.8),M(0x9a9da2,0.5,{side:THREE.DoubleSide}),0,0.7,0.02,c);
   [[-0.16,-0.15],[0.16,-0.15],[-0.16,0.15],[0.16,0.15]].forEach(([a,b])=>mesh(new THREE.CylinderGeometry(0.012,0.012,0.46,6),M(0xc8c8c8,0.3,{metalness:0.7}),a,0.23,b,c));
   seats.push({x:tx+cx,z:tz+cz,yaw,ax:tx+cx,az:tz+cz*1.95,y:0.08,occ:null});});
  tables.push({x:tx,z:tz,g,seats,dishes:[]});
  OBST.push({x:tx-0.35,z:tz,r:0.72},{x:tx+0.35,z:tz,r:0.72});
  pend(tx,tz);
 });
 [[-0.4,-2.6],[1.4,-2.9],[3.2,-2.6]].forEach(([x,z])=>pend(x,z));
 [[-2.7,0.6],[2.3,0.6]].forEach(([x,z])=>{const l=new THREE.PointLight(0xffd9a0,0.7,9,1.6);l.position.set(x,2.4,z);scene.add(l);});
 const cl=new THREE.PointLight(0xffe0b0,0.6,7,1.6);cl.position.set(1.4,2.4,-2.8);scene.add(cl);
 // 창가 스툴 (밖을 보고 앉는 자리)
 [-4.3,-3.1,-1.9,-0.7,0.5,1.7].forEach(x=>{const st=new THREE.Group();st.position.set(x,0,HD-0.42);scene.add(st);
  mesh(new THREE.CylinderGeometry(0.19,0.19,0.06,16),M(0x2b2b2b,0.5),0,0.74,0,st);
  mesh(new THREE.CylinderGeometry(0.03,0.04,0.74,8),M(0xc0c0c0,0.3,{metalness:0.7}),0,0.37,0,st);
  mesh(new THREE.TorusGeometry(0.14,0.014,6,16),M(0xc0c0c0,0.3,{metalness:0.7}),0,0.3,0,st).rotation.x=Math.PI/2;
  stools.push({x,z:HD-0.42,yaw:0,ax:x,az:HD-1.2,y:0.36,occ:null});});
 mesh(new THREE.BoxGeometry(7.0,0.05,0.34),M(0x5a3b26,0.5),-1.2,1.02,HD-0.05);
}

/* ---------------- 사람들 ---------------- */
let masterObj;
function buildPeople(){
 player=mkAgent(makeFigure({robe:myColor,top:0xf6efe4,hair:0x2a2018,skin:0xf2c9a0,style:'p',ribbon:0x3b3029}),rnd(-0.4,0.6),rnd(0.4,1.2),3.0);
 addTag(player.f,myName,0,1.98,false);addBubble(player.f,2.5);player.f.rotation.y=Math.PI;
 mugHand=makeMug();mugHand.position.set(0.12,0.95,0.32);mugHand.visible=false;player.f.userData.rig.add(mugHand);
 // 맥주 마스터 사장님
 const mf=makeFigure({robe:0x1d1d1f,top:0xe7a4b0,hair:0x3a2a20,skin:0xf4cfa8,style:'f',ribbon:0xe7a4b0,apron:true,bow:true});
 mf.position.set(1.4,0,-4.2);mf.rotation.y=0;scene.add(mf);addTag(mf,'🍺 맥주 마스터 사장님',0,2.05,false);addBubble(mf,2.65);
 masterObj={f:mf,tx:1.4,t:3,busy:0,greeted:false};
 // 손님 NPC
 const looks=[{robe:0x3a4a6a,top:0xf0ece4,hair:0x161210,skin:0xf0c8a0,style:'p',ribbon:0x2a3a5a},
  {robe:0xd9a0b0,top:0xfff4f0,hair:0x4a3020,skin:0xf6d2b0,style:'f',ribbon:0xd0607e},
  {robe:0x6a8a5a,top:0xf5f0e0,hair:0x2a2018,skin:0xe8bf95,style:'p',ribbon:0x3a5a2a},
  {robe:0x8a6cc8,top:0xf4f0fa,hair:0x5a3a28,skin:0xf6d2b0,style:'f',ribbon:0x5b4b8a}];
 const spots=[tables[3].seats[0],tables[3].seats[3],stools[1],tables[0].seats[2]];
 looks.forEach((lk,i)=>{const s=spots[i];const a=mkAgent(makeFigure(lk),s.x,s.z,1.4);addBubble(a.f,2.45);a.npc=true;a.wait=rnd(4,12);
  sitAt(a,s);const m=makeMug();m.position.set(0,0.0,0);scene.add(m);a.tableMug=m;placeTableMug(a,s);npcs.push(a);});
}
function makeMug(){const g=new THREE.Group();
 const glass=new THREE.Mesh(new THREE.CylinderGeometry(0.075,0.062,0.24,14,1,true),new THREE.MeshStandardMaterial({color:0xe8f4ff,transparent:true,opacity:0.35,roughness:0.05,side:THREE.DoubleSide,depthWrite:false}));glass.position.y=0.12;g.add(glass);
 const beer=new THREE.Mesh(new THREE.CylinderGeometry(0.068,0.058,0.17,14),new THREE.MeshStandardMaterial({color:0xf0a020,emissive:0xa05a00,emissiveIntensity:0.35,roughness:0.2}));beer.position.y=0.09;g.add(beer);
 const foam=new THREE.Mesh(new THREE.CylinderGeometry(0.074,0.07,0.06,14),M(0xfffcf0,0.9));foam.position.y=0.205;g.add(foam);
 const h=new THREE.Mesh(new THREE.TorusGeometry(0.05,0.012,6,12,Math.PI),new THREE.MeshStandardMaterial({color:0xe8f4ff,transparent:true,opacity:0.5}));h.position.set(0.075,0.12,0);h.rotation.z=-Math.PI/2;g.add(h);
 return g;}
function placeTableMug(a,s){if(!a.tableMug)return;const fx=Math.sin(s.yaw),fz=Math.cos(s.yaw);a.tableMug.position.set(s.x+fx*0.32,s===undefined?0:(s.y>0.2?1.05:0.785),s.z+fz*0.32);a.tableMug.visible=true;}
function mkAgent(f,x,z,speed){f.position.set(x,0,z);scene.add(f);const a={f,speed,target:null,path:[],cb:null,stuck:0,holding:false,seat:null};agents.push(a);return a;}
function sitAt(a,s){a.seat=s;s.occ=a;a.f.position.set(s.x,s.y,s.z);a.f.rotation.y=s.yaw;a.f.userData.mode='sit';a.target=null;a.path=[];}
function standUp(a){if(a.f.userData.mode!=='sit')return;const s=a.seat;a.f.userData.mode='stand';a.f.position.y=0;
 if(s){a.f.position.x=s.ax;a.f.position.z=s.az;s.occ=null;a.seat=null;}if(a.tableMug)a.tableMug.visible=false;}
const inside=z=>z<FRONT;
const inDoor=x=>x>DOOR[0]&&x<DOOR[1];
function walkAgent(a,x,z,cb){standUp(a);const p=a.f.position;a.path=[];
 if(inside(p.z)!==inside(z)){const dx=(DOOR[0]+DOOR[1])/2;a.path.push(new THREE.Vector3(dx,0,inside(p.z)?3.7:5.3));a.path.push(new THREE.Vector3(dx,0,inside(p.z)?5.3:3.7));}
 a.path.push(new THREE.Vector3(x,0,z));a.target=a.path.shift();a.cb=cb||null;a.stuck=0;}
function clampPos(p,oz){
 if(inDoor(p.x)&&p.z>3.5&&p.z<5.4)return;
 if(inside(oz)){p.x=clamp(p.x,-5.1,5.1);p.z=clamp(p.z,-3.25,3.75);}
 else{p.x=clamp(p.x,-16,16);p.z=clamp(p.z,4.95,11.8);}}
function pushOut(p,r,self){
 for(const o of OBST){const dx=p.x-o.x,dz=p.z-o.z,d=Math.hypot(dx,dz),m=o.r+r;if(d<m&&d>1e-4){p.x=o.x+dx/d*m;p.z=o.z+dz/d*m;}}
 for(const a of agents){if(a.f===self||a.f.userData.mode==='sit'||!a.f.visible)continue;const q=a.f.position,dx=p.x-q.x,dz=p.z-q.z,d=Math.hypot(dx,dz),m=0.5;if(d<m&&d>1e-4){p.x+=dx/d*(m-d)*0.5;p.z+=dz/d*(m-d)*0.5;}}}
function moveAgent(a,dt){
 const u=a.f.userData;if(u.mode==='sit')return;
 if(!a.target){u.mode='stand';return;}
 const p=a.f.position,dx=a.target.x-p.x,dz=a.target.z-p.z,dist=Math.hypot(dx,dz);
 if(dist>0.07){const st=Math.min(a.speed*dt,dist),ox=p.x,oz=p.z;p.x+=dx/dist*st;p.z+=dz/dist*st;
  if(!(inDoor(p.x)&&p.z>3.4&&p.z<5.5))pushOut(p,0.28,a.f);
  if(inside(oz)!==inside(p.z)&&!inDoor(p.x))p.z=oz;
  clampPos(p,oz);
  a.f.rotation.y+=angDiff(a.f.rotation.y,Math.atan2(dx,dz))*Math.min(1,dt*10);u.mode='walk';
  const mv=Math.hypot(p.x-ox,p.z-oz);a.stuck=mv<st*0.25?a.stuck+dt:0;if(a.stuck>0.9)arrive(a);}
 else arrive(a);}
function arrive(a){if(a.path.length){a.target=a.path.shift();a.stuck=0;return;}
 a.target=null;a.f.userData.mode='stand';const cb=a.cb;a.cb=null;if(a===player)moveMarker.material.opacity=0;cb&&cb();}

/* ---------------- 행동 ---------------- */
function goto(x,z,cb){planToken++;walkAgent(player,x,z,cb);moveMarker.position.set(x,0.03,z);moveMarker.material.opacity=0.95;}
function freeSeat(list){return list.filter(s=>!s.occ);}
function goSeat(s,cb){const tk=++planToken;
 walkAgent(player,s.ax,s.az,()=>{if(tk!==planToken)return;if(s.occ&&s.occ!==player){toast('🪑 그 자리는 누가 앉았어요');return;}
  sitAt(player,s);sfx('step');if(player.holding){if(!player.tableMug){player.tableMug=makeMug();scene.add(player.tableMug);}placeTableMug(player,s);}
  camGoal={a:s.yaw+Math.PI+(s.y>0.2?0:0.5),t:s.y>0.2?0.36:0.5,d:s.y>0.2?8:8};cb&&cb();});
 moveMarker.position.set(s.ax,0.03,s.az);moveMarker.material.opacity=0.95;}
function goTable(ti,cb){const t=tables[ti];const fs=freeSeat(t.seats);
 if(player.seat&&t.seats.includes(player.seat)){cb&&cb();return;}
 if(!fs.length){toast('🪑 그 테이블은 꽉 찼어요');return;}
 const p=player.f.position;fs.sort((a,b)=>Math.hypot(a.ax-p.x,a.az-p.z)-Math.hypot(b.ax-p.x,b.az-p.z));
 toast('🪑 자리에 앉으러 가요');goSeat(fs[0],cb);}
function goWindow(){const fs=freeSeat(stools);if(!fs.length)return toast('창가석이 꽉 찼어요');
 const p=player.f.position;fs.sort((a,b)=>Math.abs(a.x-p.x)-Math.abs(b.x-p.x));toast('🌃 창가석에 앉아요');goSeat(fs[0],()=>setTimeout(()=>say(player.f,'밤거리 감성 좋다…',2.4),500));}
function goBeer(){
 if(masterObj.busy>0)return toast('🍺 사장님이 따르는 중이에요');
 const tk=++planToken;toast('🍺 생맥주 받으러 가요');
 walkAgent(player,2.4,-2.75,()=>{if(tk!==planToken)return;player.f.rotation.y=Math.PI;
  masterObj.tx=2.4;masterObj.busy=3.2;say(masterObj.f,pick(['맥주 마스터가 따라드릴게요 🍺','거품 황금비율로 갑니다!','생맥 한 잔 나갑니다~']),2.6);
  setTimeout(()=>{tapGlass.visible=true;tapGlass.userData.t=0;sfx('pour');},500);
  setTimeout(()=>{if(tk!==planToken){tapGlass.visible=false;return;}tapGlass.visible=false;player.holding=true;beers++;updateBeers();sfx('pop');
   const hp=new THREE.Vector3();player.f.userData.head.getWorldPosition(hp);spawn('🍺',hp.add(new THREE.Vector3(0,0.4,0)),3,{size:0.3,up:1.2,life:1.3});
   toast('🍺 생맥 '+beers+'잔째! 자리에 앉거나 🍻 짠 해보세요');say(masterObj.f,'맛있게 드세요~ 🍻',2);},2700);});
 moveMarker.position.set(2.4,0.03,-2.75);moveMarker.material.opacity=0.95;}
function orderFood(m){
 closeMenu();say(masterObj.f,m.n+' 주문 들어갑니다! '+m.e,2.4);sfx('pop');
 const deliver=()=>{const t=tables.find(t=>t.seats.includes(player.seat));if(!t)return;
  setTimeout(()=>{addDish(t,m);toast(m.e+' '+m.n+' 나왔습니다! 맛있게 드세요');sfx('chime');
   spawn('✨',new THREE.Vector3(t.x,1.1,t.z),6,{size:0.25,up:1,life:1.2});},1800);};
 if(player.seat&&tables.some(t=>t.seats.includes(player.seat)))deliver();
 else{let best=null,bd=1e9;tables.forEach((t,i)=>{if(!freeSeat(t.seats).length)return;const d=Math.hypot(t.x-player.f.position.x,t.z-player.f.position.z);if(d<bd){bd=d;best=i;}});
  if(best==null)return toast('빈 테이블이 없어요');goTable(best,deliver);}
}
function addDish(t,m){
 const g=new THREE.Group();const i=t.dishes.length%3;g.position.set(t.x-0.38+i*0.38,0.785,t.z);scene.add(g);
 const plateM=m.k==='noodle'||m.k==='pot'?M(0xc9ccd0,0.25,{metalness:0.8}):m.k==='sizzle'?M(0x1d1d1d,0.4):M(0xf6f4ee,0.4);
 mesh(new THREE.CylinderGeometry(0.17,0.15,m.k==='pot'?0.1:0.03,20),plateM,0,m.k==='pot'?0.05:0.015,0,g);
 if(m.k==='sizzle')mesh(new THREE.CylinderGeometry(0.2,0.2,0.02,20),M(0xd9b37a,0.7),0,0.0,0,g);
 const food=mesh(new THREE.SphereGeometry(0.12,14,8,0,Math.PI*2,0,Math.PI/2),M(m.c,0.7),m.k==='noodle'?-0.04:0,0.03,0,g);food.scale.y=m.k==='jeon'||m.k==='dry'?0.35:0.55;
 if(m.k==='noodle'){const n=mesh(new THREE.TorusGeometry(0.05,0.025,8,14),M(0xfaf6ea,0.8),0.08,0.05,0,g);n.rotation.x=Math.PI/2;}
 if(m.k==='pot'){lampGlows.push(glowSprite(0xffffff,0.25,g,0,0.2,0,0));g.userData.steam=true;}
 g.userData.pop=0;g.scale.setScalar(0.01);
 if(t.dishes.length>=3){const o=t.dishes.shift();scene.remove(o);}t.dishes.push(g);}
function cheers(){
 const u=player.f.userData;react='cheers';reactT=0;netEvent('cheers');sfx('clink');
 const hp=new THREE.Vector3();u.head.getWorldPosition(hp);spawn('🍻',hp.clone().add(new THREE.Vector3(0,0.4,0)),4,{size:0.32,up:1.4,spread:0.7,life:1.4});
 say(player.f,pick(['짠~! 🍻','위하여!! 🍺','앗싸라비아~ 🎵']),2);
 // 근처 손님도 같이 짠
 npcs.forEach(a=>{if(!a.f.visible)return;const d=a.f.position.distanceTo(player.f.position);if(d<4.5)setTimeout(()=>{say(a.f,pick(['짠~! 🍻','위하여!','캬~ 🍺']),1.8);a.f.userData.talking=1.2;},300+Math.random()*700);});
 if(cheersT>0)toast('🍻 연속 짠! 분위기 최고');cheersT=3;}
function doReact(type){react=type;reactT=0;netEvent(type);
 const hp=new THREE.Vector3();player.f.userData.head.getWorldPosition(hp);
 if(type==='happy'){sfx('happy');spawn(pick(['💛','✨','🎵']),hp.clone().add(new THREE.Vector3(0,0.3,0)),9,{size:0.3,up:1.6,spread:0.9,life:1.5});say(player.f,pick(['오예!! 😆','기분 최고 💛','앗싸라비아~!']),2);}
 else{sfx('cry');say(player.f,pick(['흐엉… 😭','한 잔 더 주세요…','오늘 힘들었어…']),2);}}
function updateBeers(){document.getElementById('beerN').textContent=beers;try{localStorage.setItem('assa_beers',beers);}catch(e){}}

/* ---------------- 메뉴판 ---------------- */
function openMenu(){document.getElementById('menuPanel').classList.add('open');}
function closeMenu(){document.getElementById('menuPanel').classList.remove('open');}

/* ---------------- 입력 ---------------- */
function onDown(e){dragging=true;dragMoved=false;lastX=downX=e.clientX;lastY=downY=e.clientY;downT=performance.now();}
function onMove(e){if(!dragging)return;const dx=e.clientX-lastX,dy=e.clientY-lastY;
 if(Math.abs(e.clientX-downX)+Math.abs(e.clientY-downY)>7){dragMoved=true;camGoal=null;}
 if(dragMoved){camAngle-=dx*0.006;camTilt=clamp(camTilt-dy*0.004,0.08,1.2);}lastX=e.clientX;lastY=e.clientY;}
function onUp(e){if(!dragging)return;dragging=false;if(!dragMoved&&performance.now()-downT<400&&entered)handleClick(e);}
function handleClick(e){
 pointer.x=(e.clientX/innerWidth)*2-1;pointer.y=-(e.clientY/innerHeight)*2+1;raycaster.setFromCamera(pointer,camera);
 const hit=raycaster.intersectObjects(clickables,false),fh=raycaster.intersectObjects(floorHits,false);
 if(hit.length&&(!fh.length||hit[0].distance<fh[0].distance+0.6)){const a=hit[0].object.userData.act;
  if(a.type==='table')return goTable(a.ti);if(a.type==='beer')return goBeer();if(a.type==='map')return;}
 if(fh.length){const p=fh[0].point;const ins=p.z<FRONT;let x=p.x,z=p.z;
  if(ins){x=clamp(x,-5.1,5.1);z=clamp(z,-3.2,3.7);}else{x=clamp(x,-16,16);z=clamp(z,4.95,11.8);}goto(x,z);}}
function openMap(){toast('📍 네이버 지도에서 앗싸라비아 위치를 열어요');setTimeout(()=>window.open(NAVER_MAP,'_blank','noopener'),400);}

/* ---------------- 사진 ---------------- */
function snap(){
 const f=document.getElementById('flash');sfx('snap');
 renderer.render(scene,camera);const src=renderer.domElement;
 const c=document.createElement('canvas');c.width=src.width;c.height=src.height;const x=c.getContext('2d');x.drawImage(src,0,0);
 const s=c.width/420;x.shadowColor='rgba(0,0,0,.5)';x.shadowBlur=8*s;x.fillStyle='rgba(255,255,255,.96)';x.textAlign='right';
 x.font=`${17*s}px ${FONT}`;x.fillText('🍺 앗싸라비아 · 경산 Beer & Soju',c.width-14*s,c.height-30*s);
 x.font=`${11*s}px ${FONT}`;x.fillStyle='rgba(255,255,255,.85)';x.fillText(myName+'님의 한 컷 · 생맥 '+beers+'잔',c.width-14*s,c.height-13*s);
 f.classList.add('on');requestAnimationFrame(()=>requestAnimationFrame(()=>f.classList.remove('on')));
 c.toBlob(b=>{if(!b){toast('📸 저장 실패 — 화면 캡처로 찍어주세요');return;}
  const url=URL.createObjectURL(b),a=document.createElement('a');a.href=url;a.download='앗싸라비아_'+Date.now()+'.png';document.body.appendChild(a);a.click();a.remove();
  setTimeout(()=>URL.revokeObjectURL(url),4000);toast('📸 사진 저장! 인스타·쓰레드에 자랑하세요');},'image/png');}

/* ---------------- UI ---------------- */
let toastT;
function toast(m){const h=document.getElementById('hint');h.textContent=m;h.classList.add('show');clearTimeout(toastT);toastT=setTimeout(()=>h.classList.remove('show'),2800);}
function bindUI(){
 const $=id=>document.getElementById(id);
 $('bBeer').onclick=goBeer;$('bFood').onclick=openMenu;$('bCheers').onclick=cheers;$('bSnap').onclick=snap;$('bMap').onclick=openMap;$('mClose').onclick=closeMenu;
 const ml=$('mList');MENU.forEach(m=>{const b=document.createElement('button');b.innerHTML='<span class="e"></span><span class="n"></span><span class="p"></span>';
  b.querySelector('.e').textContent=m.e;b.querySelector('.n').textContent=m.n;b.querySelector('.p').textContent=m.p.toLocaleString()+'원';b.onclick=()=>orderFood(m);ml.appendChild(b);});
 const tk=$('talk');$('bTalk').onclick=()=>tk.classList.toggle('open');
 [['😊 기뻐','happy'],['😭 울기','cry'],['🌃 창가석','win'],['🪑 테이블','tbl']].forEach(([l,k])=>{const b=document.createElement('button');b.className='emo';b.textContent=l;
  b.onclick=()=>{tk.classList.remove('open');if(k==='win')return goWindow();if(k==='tbl'){let best=0,bd=1e9;tables.forEach((t,i)=>{if(!freeSeat(t.seats).length)return;const d=Math.hypot(t.x-player.f.position.x,t.z-player.f.position.z);if(d<bd){bd=d;best=i;}});return goTable(best);}doReact(k);};tk.appendChild(b);});
 PHRASES.forEach((ph,i)=>{const b=document.createElement('button');b.textContent=ph;b.onclick=()=>{say(player.f,ph,3);netEvent('say',i);tk.classList.remove('open');};tk.appendChild(b);});
 renderer.domElement.addEventListener('pointerdown',()=>tk.classList.remove('open'));
 $('snd').onclick=()=>{audioStart();setMute(!AU.on);};
 const sw=$('sw');OUTFITS.forEach((c,i)=>{const b=document.createElement('button');b.style.background=hex(c);if(i===0)b.className='on';
  b.onclick=()=>{myColor=c;sw.querySelectorAll('button').forEach(q=>q.classList.remove('on'));b.className='on';recolorPlayer();};sw.appendChild(b);});
 try{const n=localStorage.getItem('assa_nick');if(n)$('nick').value=n;beers=+(localStorage.getItem('assa_beers')||0);}catch(e){}
 updateBeers();
 $('nick').addEventListener('keydown',e=>{if(e.key==='Enter')$('go').click();});
 $('go').onclick=()=>{
  myName=($('nick').value||'손님').trim().slice(0,8)||'손님';try{localStorage.setItem('assa_nick',myName);}catch(e){}
  $('who').textContent=myName;player.f.remove(player.f.userData.tag);addTag(player.f,myName,0,1.98,false);
  audioStart();$('enter').classList.add('hide');setTimeout(()=>$('enter').remove(),800);
  $('hud').classList.add('on');$('bar').classList.add('on');entered=true;netStart();
  camGoal={a:0.25,t:0.62,d:innerWidth<innerHeight?16:13.5};
  setTimeout(()=>say(masterObj.f,'어서오세요~ 앗싸라비아입니다 🍺',3),900);
  setTimeout(()=>toast('🍺 생맥주 버튼 → 맥주 마스터가 직접 따라줘요'),3000);
  setTimeout(()=>toast('👆 테이블을 콕 → 앉기 · 🍢 안주 주문 · 🍻 짠'),6800);
 };
}
function recolorPlayer(){const old=player.f;const p=old.position.clone(),r=old.rotation.y,mode=old.userData.mode;
 const nf=makeFigure({robe:myColor,top:0xf6efe4,hair:0x2a2018,skin:0xf2c9a0,style:'p',ribbon:0x3b3029});
 nf.position.copy(p);nf.rotation.y=r;nf.userData.mode=mode;scene.remove(old);scene.add(nf);player.f=nf;
 addTag(nf,myName,0,1.98,false);addBubble(nf,2.5);nf.userData.rig.add(mugHand);}

/* ---------------- 루프 ---------------- */
function animate(){
 requestAnimationFrame(animate);
 const dt=Math.min(clock.getDelta(),0.05),t=clock.elapsedTime;
 cheersT=Math.max(0,cheersT-dt);
 moveAgent(player,dt);
 const crowd=NET.peers.size>=3;
 npcs.forEach(a=>{const vis=!crowd;if(a.f.visible!==vis){a.f.visible=vis;if(a.tableMug)a.tableMug.visible=vis;if(a.seat)a.seat.occ=vis?a:null;}
  if(!vis)return;a.wait-=dt;if(a.wait<0&&entered){say(a.f,pick(GUEST_LINES),2.8);a.wait=rnd(9,18);}});
 // 손에 든 잔
 const sit=player.f.userData.mode==='sit';
 mugHand.visible=player.holding&&(!sit||react==='cheers');
 if(player.tableMug)player.tableMug.visible=player.holding&&sit&&react!=='cheers';
 agents.forEach(a=>{if(a.f.visible)animFig(a.f,t,dt,a===player&&player.holding&&!sit);});
 // 사장님
 const mo=masterObj,mf=mo.f;mo.t-=dt;mo.busy=Math.max(0,mo.busy-dt);
 if(mo.t<0&&mo.busy<=0){mo.tx=rnd(-0.4,3.2);mo.t=rnd(3,7);}
 const mdx=mo.tx-mf.position.x;
 if(Math.abs(mdx)>0.05){mf.position.x+=Math.sign(mdx)*Math.min(Math.abs(mdx),1.0*dt);mf.userData.mode='walk';mf.rotation.y+=angDiff(mf.rotation.y,Math.sign(mdx)*Math.PI/2)*Math.min(1,dt*8);}
 else{mf.userData.mode='stand';mf.rotation.y+=angDiff(mf.rotation.y,0)*Math.min(1,dt*5);}
 animFig(mf,t,dt,false);
 if(mo.busy>0.5&&Math.abs(mdx)<0.1){mf.userData.arms[1].rotation.x=-1.5+Math.sin(t*3)*0.05;}
 greetCD-=dt;const near=player.f.position.z<-1.8&&inside(player.f.position.z);
 if(near&&!mo.greeted&&greetCD<0&&entered&&mo.busy<=0){say(mf,pick(MASTER_LINES),2.6);mo.greeted=true;greetCD=10;}
 if(!near)mo.greeted=false;
 // 따르는 생맥
 if(tapGlass.visible){const u=tapGlass.userData;u.t+=dt;const k=Math.min(1,u.t/1.8);
  u.beer.scale.y=Math.max(0.001,0.18*k);u.foam.position.y=0.18*k+0.02;u.foam.scale.y=1+k*0.6;u.stream.visible=k<0.98;}
 // 말풍선
 agents.concat([{f:mf}],peerFulls()).forEach(a=>{const b=a.f.userData.bubble;if(!b||!b.sp.visible)return;b.t-=dt;b.pop=Math.min(1,(b.pop||0)+dt*6);
  const e=b.pop<1?1+Math.sin(b.pop*Math.PI)*0.15:1;const k=Math.min(1,b.t*3);b.sp.scale.set(2.3*e*k,0.65*e*k,1);if(b.t<=0)b.sp.visible=false;});
 // 리액션
 if(react){reactT+=dt;const u=player.f.userData;
  if(react==='happy'){u.rig.position.y=Math.abs(Math.sin(reactT*9))*0.42;u.rig.rotation.y=reactT*7;u.arms.forEach(a=>a.rotation.x=-2.6);}
  else if(react==='cheers'){u.arms[1].rotation.x=-2.5;u.arms[0].rotation.x=-0.3;mugHand.position.set(0.22,1.55,0.15);if(sit)u.rig.position.y=0;}
  else{u.head.position.y=1.42-Math.abs(Math.sin(reactT*5))*0.08;u.rig.rotation.z=Math.sin(reactT*12)*0.07;u.arms.forEach(a=>a.rotation.x=-2.2);
   if(Math.random()<dt*14){u.eyes.forEach(e=>{const ep=new THREE.Vector3();e.getWorldPosition(ep);spawn(0x6fc3ff,ep,1,{size:0.1,up:0.4,spread:0.4,g:5,life:0.7,jit:0.01});});}}
  if(reactT>1.5){react=null;u.rig.rotation.set(0,0,0);u.head.position.y=1.42;mugHand.position.set(0.12,0.95,0.32);}}
 // 접시 등장
 tables.forEach(tb=>tb.dishes.forEach(g=>{if(g.userData.pop<1){g.userData.pop=Math.min(1,g.userData.pop+dt*3);const s=g.userData.pop;g.scale.setScalar(s<1?s*(1+Math.sin(s*Math.PI)*0.3):1);}}));
 // 김 (탕 · 테이블 생맥)
 steamT-=dt;if(steamT<0){steamT=0.35;tables.forEach(tb=>tb.dishes.forEach(g=>{if(g.userData.steam){const p=new THREE.Vector3();g.getWorldPosition(p);spawn(0xffffff,p.add(new THREE.Vector3(0,0.15,0)),1,{size:0.14,up:0.3,spread:0.03,life:1.8,grow:2.5,op:0.28,jit:0.03});}}));}
 stepParticles(dt);
 // 간판 전구 · 풍선
 marquee.forEach(m=>{if(m.bulb){const on=((m.i+Math.floor(t*8))%4)!==0;m.bulb.material.color.setHex(on?0xffe27a:0x5a4a20);}
  else if(m.balloon){m.balloon.position.y=m.y+Math.sin(t*1.3+m.balloon.userData.bob)*0.04;m.balloon.rotation.z=Math.sin(t*0.9+m.balloon.userData.bob)*0.12;}});
 // 에어간판 흔들흔들
 airSign.userData.segs.forEach((s,i)=>{s.rotation.z=Math.sin(t*2.6+i*0.9)*0.12*(i+1)*0.6+Math.sin(t*5.3+i)*0.04;s.rotation.x=Math.cos(t*2.1+i*1.3)*0.08;});
 lampGlows.forEach((g,i)=>{if(g.material.opacity>0)g.material.opacity=g.material.opacity*0.98+0.02*(g.userData.base||(g.userData.base=g.material.opacity))*(0.9+Math.sin(t*3+i)*0.1);});
 moveMarker.rotation.z+=dt*2;
 netTick(dt,t);
 // 카메라
 const pp=player.f.position;tmpV.set(pp.x*0.7,1.0,pp.z*0.7+(inside(pp.z)?0.4:-0.5));camLook.lerp(tmpV,1-Math.exp(-dt*3));
 if(camGoal&&!dragging){const k=1-Math.exp(-dt*(camGoal.slow?0.9:2.2));camAngle+=angDiff(camAngle,camGoal.a)*k;camTilt+=(camGoal.t-camTilt)*k;camDist+=(camGoal.d-camDist)*k;
  if(Math.abs(angDiff(camAngle,camGoal.a))<0.01&&Math.abs(camDist-camGoal.d)<0.05)camGoal=null;}
 camera.position.set(camLook.x+Math.sin(camAngle)*Math.cos(camTilt)*camDist,Math.max(0.6,camLook.y+Math.sin(camTilt)*camDist),camLook.z+Math.cos(camAngle)*Math.cos(camTilt)*camDist);
 camera.lookAt(camLook);sky.position.copy(camera.position);stars.position.copy(camera.position);
 // 위에서 보면 카메라 쪽 벽이 투명 (낮게 보면 거리 뷰)
 const pin=inside(player.f.position.z);neighbors.forEach(g=>g.visible=!pin);walls.forEach(w=>{tmpV.copy(camera.position).sub(w.c);const facing=tmpV.dot(w.n)>0.3;const out=pin?(w.n.z<0?facing:true):(facing&&camTilt>0.3);const tgt=out?0.0:1;w.a+=(tgt-w.a)*(1-Math.exp(-dt*7));
  w.mats.forEach(m=>{m.opacity=w.a;m.depthWrite=w.a>0.6;});w.g.visible=w.a>0.02;w.g.traverse(o=>{if(o.isMesh)o.castShadow=w.a>0.6;});});
 renderer.render(scene,camera);
}
function onResize(){camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);}
