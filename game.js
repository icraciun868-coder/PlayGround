
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.161.0/build/three.module.js';

const $=s=>document.querySelector(s), root=$('#modal-root');
const products=[
 {id:'wc-pack',name:'Adrenalyn XL · Booster Pack',brand:'PANINI · WORLD CUP 2026',price:8,kind:'pack',collection:'World Cup 2026',color:'#f15d3d',label:'WORLD CUP 26'},
 {id:'wc-box',name:'Adrenalyn XL · Booster Box',brand:'PANINI · WORLD CUP 2026',price:68,kind:'box',collection:'World Cup 2026',color:'#e84e32',label:'XL BOX'},
 {id:'ma-pack',name:'Match Attax · Starter Pack',brand:'TOPPS · MATCH ATTAX',price:10,kind:'pack',collection:'Match Attax',color:'#17678b',label:'MATCH ATTAX'},
 {id:'ma-box',name:'Match Attax · Mega Tin Box',brand:'TOPPS · MATCH ATTAX',price:79,kind:'box',collection:'Match Attax',color:'#145578',label:'MEGA TIN'},
 {id:'365-pack',name:'FIFA 365 · Classic Pack',brand:'PANINI · FIFA 365',price:7,kind:'pack',collection:'FIFA 365',color:'#1e9d76',label:'FIFA 365'},
 {id:'365-box',name:'FIFA 365 · Display Box',brand:'PANINI · FIFA 365',price:62,kind:'box',collection:'FIFA 365',color:'#148563',label:'DISPLAY'},
 {id:'wc-premium',name:'World Cup · Golden Edition',brand:'PANINI · PREMIUM',price:18,kind:'pack',collection:'World Cup 2026',color:'#b48b36',label:'GOLD EDITION'},
 {id:'ma-premium',name:'Match Attax · Chrome Elite',brand:'TOPPS · PREMIUM',price:22,kind:'pack',collection:'Match Attax',color:'#754fa5',label:'CHROME ELITE'},
 {id:'365-premium',name:'FIFA 365 · Special Edition',brand:'PANINI · SPECIAL',price:16,kind:'pack',collection:'FIFA 365',color:'#b04466',label:'SPECIAL'},
 {id:'wc-collector',name:'World Cup · Collector Chest',brand:'PANINI · LIMITED',price:125,kind:'box',collection:'World Cup 2026',color:'#bc8630',label:'COLLECTOR'}
];
const collections=[
 {id:'World Cup 2026',name:'World Cup 2026',price:20,color:'#e5573e',sub:'The ultimate global tournament collection'},
 {id:'Match Attax',name:'Match Attax',price:18,color:'#17678b',sub:'Elite clubs. Game-changing stars.'},
 {id:'FIFA 365',name:'FIFA 365',price:16,color:'#148563',sub:'A whole year of football heroes.'},
 {id:'Legends',name:'Legends · Hall of Fame',price:24,color:'#94743c',sub:'Icons who changed the beautiful game.'},
 {id:'Women',name:'World Class Women',price:20,color:'#b64d8d',sub:'The stars shaping the future.'},
 {id:'Stadiums',name:'Stadiums · The Grounds',price:15,color:'#586d78',sub:'The world’s most famous football homes.'}
];
const names=['Kylian Mbappé','Lionel Messi','Cristiano Ronaldo','Jude Bellingham','Erling Haaland','Aitana Bonmatí','Lamine Yamal','Vinícius Júnior','Alexia Putellas','Harry Kane','Kevin De Bruyne','Sam Kerr','Pedri','Son Heung-min','Marta','Federico Valverde','Virgil van Dijk','Bukayo Saka','Neymar Jr.','Christian Pulisic','Robert Lewandowski','Sophia Smith','Rodri','Antoine Griezmann','Mohamed Salah','Lauren James','Florian Wirtz','Rafael Leão','Gianluigi Donnarumma','Trinity Rodman','Jamal Musiala','Bruno Fernandes','Ousmane Dembélé','Luka Modrić','Declan Rice','Rúben Dias','Cole Palmer','Sadio Mané','Alphonso Davies','Victor Osimhen'];
const flags=['🇫🇷','🇦🇷','🇵🇹','🏴','🇳🇴','🇪🇸','🇪🇸','🇧🇷','🇪🇸','🏴','🇧🇪','🇦🇺','🇪🇸','🇰🇷','🇧🇷','🇺🇾','🇳🇱','🏴','🇧🇷','🇺🇸','🇵🇱','🇺🇸','🇪🇸','🇫🇷','🇪🇬','🏴','🇩🇪','🇵🇹','🇮🇹','🇺🇸','🇩🇪','🇵🇹','🇫🇷','🇭🇷','🏴','🇵🇹','🏴','🇸🇳','🇨🇦','🇳🇬'];
let state;try{state={money:50,...JSON.parse(localStorage.getItem('panini-world-2026-save')||'{}')};state.items||={};state.albums||={};state.cards||=[];state.placed||={};state.player||='Collector';}catch{state={money:50,items:{},albums:{},cards:[],placed:{},player:'Collector'}}
let scene,camera,renderer,clock,raycaster,roomGroup,shopGroup,interactables=[],roomDrops=[];
let location='room',yaw=0,pitch=0,move={f:0,r:0},toastTimer;
const canvas=$('#world');
function save(){localStorage.setItem('panini-world-2026-save',JSON.stringify(state));$('#save-status').textContent='SAVED LOCALLY'}
function showToast(t){let el=$('#toast');el.textContent=t;el.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.remove('show'),2300)}
function mat(color,roughness=.85,metalness=0){return new THREE.MeshStandardMaterial({color,roughness,metalness})}
function box(parent,x,y,z,w,h,d,color,opts={}){let m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),opts.material||mat(color,opts.roughness??.82,opts.metalness??0));m.position.set(x,y,z);parent.add(m);if(opts.shadow!==false){m.castShadow=true;m.receiveShadow=true}return m}
function cylinder(parent,x,y,z,r1,r2,h,color,segments=16){let m=new THREE.Mesh(new THREE.CylinderGeometry(r1,r2,h,segments),mat(color));m.position.set(x,y,z);m.castShadow=true;parent.add(m);return m}
function labelTexture(text,sub='',color='#d7ff46',bg='#122a35'){let c=document.createElement('canvas');c.width=512;c.height=192;let ctx=c.getContext('2d');ctx.fillStyle=bg;ctx.fillRect(0,0,512,192);ctx.fillStyle=color;ctx.fillRect(0,0,9,192);ctx.fillStyle='#fff';ctx.font='800 38px Arial';ctx.fillText(text.toUpperCase().slice(0,23),30,78);ctx.fillStyle='#a9bcc0';ctx.font='700 18px Arial';ctx.fillText(sub.toUpperCase().slice(0,35),31,122);ctx.fillStyle=color;ctx.font='800 15px Arial';ctx.fillText('PANINI WORLD CUP 2026',31,160);let tx=new THREE.CanvasTexture(c);tx.colorSpace=THREE.SRGBColorSpace;return tx}
function productMesh(parent,p,x,y,z,scale=1){let g=new THREE.Group();g.position.set(x,y,z);g.scale.setScalar(scale);parent.add(g);let isBox=p.kind==='box',w=isBox?.82:.43,h=isBox?.7:.68,d=isBox?.34:.12;let front=new THREE.MeshStandardMaterial({map:labelTexture(p.label,p.brand,'#fff',p.color),roughness:.65});box(g,0,h/2,0,w,h,d,p.color,{material:front});g.userData={kind:'product',productId:p.id};interactables.push({object:g,type:'product',data:p});return g}
function addLight(parent,x,y,z,color,intensity,distance){let l=new THREE.PointLight(color,intensity,distance);l.position.set(x,y,z);parent.add(l);return l}
function textSign(parent,text,x,y,z,w,h,color='#d7ff46'){let mesh=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({map:labelTexture(text,'COLLECTOR WORLD',color,'#102632'),side:THREE.DoubleSide}));mesh.position.set(x,y,z);parent.add(mesh);return mesh}
function shelf(parent,x,y,z,w,h,color){box(parent,x,y+h/2,z,w,h,.25,'#493a31');for(let sx of [-w/2+.08,w/2-.08]){box(parent,x+sx,y+h/2,z+.19,.12,h,.42,color);for(let j=0;j<5;j++)box(parent,x+sx,y+.2+j*(h-.25)/4,z+.4,.16,.045,.045,'#c8ad7b')}for(let j=0;j<4;j++){let sy=y+.26+j*(h-.4)/3;box(parent,x,sy,z+.22,w,.13,.57,color);box(parent,x,sy+.07,z+.51,w,.035,.035,'#b59464')}return{x,y,z,w,h}}
function buildRoom(){
 roomGroup=new THREE.Group();scene.add(roomGroup);box(roomGroup,0,-.16,0,17,.3,16,'#b4a996');for(let i=0;i<16;i++)box(roomGroup,0,.002,-7.45+i*.98,16.9,.012,.018,i%2?'#7c7265':'#d0c3ad',{shadow:false});
 box(roomGroup,0,3.8,-8,17,7.6,.25,'#253c45');box(roomGroup,-8.5,3.8,0,.25,7.6,16,'#223640');box(roomGroup,8.5,3.8,0,.25,7.6,16,'#223640');box(roomGroup,0,3.8,8,17,7.6,.25,'#253c45');box(roomGroup,0,7.62,0,17,.2,16,'#1b2c33');for(let x=-7.8;x<8;x+=2.1){box(roomGroup,x,3.5,-7.84,.045,6.8,.06,'#47606a');box(roomGroup,x,3.5,7.84,.045,6.8,.06,'#47606a')}
 box(roomGroup,-4,3.75,-7.81,4.6,2.7,.08,'#102f3d');box(roomGroup,-4,3.75,-7.73,4.25,2.35,.025,'#326b78',{shadow:false});for(let x=-5.95;x<=-2.05;x+=.48)box(roomGroup,x,3.55,-7.69,.035,.16,.03,'#d7ff46',{shadow:false});box(roomGroup,-4,2.4,-7.68,4.25,.05,.04,'#c7aa72');
 box(roomGroup,3.8,4.3,-7.78,2.15,2.55,.18,'#8e7757');box(roomGroup,3.8,4.3,-7.66,1.88,2.28,.05,'#e4ded0');box(roomGroup,3.8,4.3,-7.61,1.65,2.05,.05,'#17424f');box(roomGroup,3.8,4.42,-7.47,.36,.25,.04,'#d74c38');let ball=new THREE.Mesh(new THREE.SphereGeometry(.48,24,16),mat('#f2f0e9'));ball.position.set(6.7,.52,-6.7);ball.castShadow=true;roomGroup.add(ball);
 shelf(roomGroup,-6.7,0,-1.2,2.8,5.1,'#674c38');shelf(roomGroup,6.7,0,-1.1,2.8,5.1,'#674c38');box(roomGroup,0,1.07,1.05,4.7,.24,2.5,'#694d37');box(roomGroup,0,1.19,1.05,4.9,.08,2.62,'#92704d');for(let x of [-2,2]){box(roomGroup,x,.5,1.05,.2,1.05,.2,'#48382e');box(roomGroup,x,.5,2,.2,1.05,.2,'#48382e')}for(let x=-1.85;x<=1.85;x+=.74)box(roomGroup,x,.74,2.316,.56,.45,.04,'#72563e');
 cylinder(roomGroup,1.55,1.43,.2,.14,.14,.1,'#d7ff46');cylinder(roomGroup,1.55,1.85,.2,.035,.05,.77,'#dbc69c');let shade=new THREE.Mesh(new THREE.ConeGeometry(.38,.3,16,1,true),new THREE.MeshStandardMaterial({color:'#dbc69c',side:THREE.DoubleSide}));shade.position.set(1.55,2.25,.2);roomGroup.add(shade);addLight(roomGroup,1.55,2.12,.2,'#ffcb71',2,5);
 const album=box(roomGroup,-.8,1.43,1.05,1.15,.12,1.5,'#d9563d');album.rotation.y=-.12;album.userData={kind:'albumtable'};interactables.push({object:album,type:'albumtable'});textSign(roomGroup,'YOUR PRIVATE COLLECTION',0,6.85,-7.67,5.5,.72);
 box(roomGroup,0,7.25,0,11,.12,.12,'#6d7f7d');for(let x of [-4,0,4]){cylinder(roomGroup,x,7.04,0,.14,.14,.36,'#e4d7b6');let sp=new THREE.SpotLight('#ffe3a1',15,13,Math.PI/5,.6,1.5);sp.position.set(x,6.75,0);sp.target.position.set(x,0,0);roomGroup.add(sp,sp.target)}addLight(roomGroup,0,6.2,3,'#e1ba7d',75,18);addLight(roomGroup,-6,4,-2,'#58a3b2',13,10);addLight(roomGroup,5,4,-3,'#ff7851',8,8);
}
function buildRoomDrops(){interactables=interactables.filter(i=>!roomDrops.includes(i.object));roomDrops.forEach(o=>roomGroup.remove(o));roomDrops=[];Object.entries(state.items).filter(([,n])=>n>0).forEach(([id,count],i)=>{let p=products.find(x=>x.id===id);if(!p)return;for(let j=0;j<Math.min(count,9);j++){let col=i%4,shelfIndex=Math.floor(i/4);let obj=productMesh(roomGroup,p,-6.7+(col-1.5)*.51,1.2+(j%3)*1.12,-.95+Math.min(shelfIndex,2)*.15,.62);roomDrops.push(obj)}});Object.entries(state.albums).forEach(([id,n])=>{if(!n)return;let col=collections.find(c=>c.id===id)||{id,color:'#94743c'};for(let j=0;j<Math.min(n,6);j++){let a=box(roomGroup,-1.8+(j%3)*.65,1.48+j*.006,.92+Math.floor(j/3)*.35,.48,.1,.64,col.color);a.userData={kind:'ownedalbum',collection:id};interactables.push({object:a,type:'ownedalbum',data:col});roomDrops.push(a)}})}

function buildShop(){
 shopGroup=new THREE.Group();shopGroup.position.set(30,0,0);scene.add(shopGroup);
 box(shopGroup,0,-.17,0,25,.32,21,'#303a3d');for(let x=-12;x<12;x+=1.2)box(shopGroup,x,.005,0,.025,.012,21,'#58605d',{shadow:false});for(let z=-10;z<10;z+=1.2)box(shopGroup,0,.006,z,25,.012,.025,'#58605d',{shadow:false});
 box(shopGroup,0,4,-10.65,25,8,.28,'#162a34');box(shopGroup,-12.65,4,0,.28,8,21,'#1b303a');box(shopGroup,12.65,4,0,.28,8,21,'#1b303a');box(shopGroup,0,4,10.65,25,8,.28,'#172a32');box(shopGroup,0,8.05,0,25,.16,21,'#1d3036');
 // rear shop branding / light bands
 textSign(shopGroup,'THE COLLECTORS CLUB',0,6.65,-10.47,8,.9,'#d7ff46');
 for(let x=-10;x<=10;x+=5){box(shopGroup,x,7.7,0,2.4,.08,.08,'#ddc794');addLight(shopGroup,x,7.25,0,'#ffd991',80,13)}
 // center islands and wall bays, each product shown with shelf and front price card
 const spots=[];
 for(let i=0;i<products.length;i++){
   let row=Math.floor(i/5),col=i%5;
   let x=-9.5+col*4.75,z=row===0?-5.7:1.6;
   let bay=shelf(shopGroup,x,0,z,2.25,3.8,'#685343');
   // branded back panel and product display on second level
   let p=products[i];productMesh(shopGroup,p,x,1.5,z+.75,1.05);
   // price/product placard faces aisle
   let labelMat=new THREE.MeshBasicMaterial({map:labelTexture(p.name,`₨ ${p.price} LEI  ·  PRESS E TO BUY`,p.color,'#f3efe3'),side:THREE.DoubleSide});
   let sign=new THREE.Mesh(new THREE.PlaneGeometry(2.15,.62),labelMat);sign.position.set(x,1.04,z+.56);shopGroup.add(sign);
   let price=box(shopGroup,x,1.03,z+.9,.78,.26,.04,'#d7ff46');
   interactables.push({object:price,type:'product',data:p});
 }
 // featured football / counter and branded dividers
 for(let x of [-10.8,10.8]){box(shopGroup,x,2.1,-.4,.28,4,.28,'#b49a68');box(shopGroup,x,4.2,-.4,2.8,.12,.3,'#d7ff46')}
 box(shopGroup,0,.65,8.2,7,.9,1.1,'#293b3d');box(shopGroup,0,1.14,8.2,7,.11,1.1,'#d1b276');textSign(shopGroup,'WELCOME · COLLECT · TRADE',0,1.72,7.62,4.8,.48);
 let counter=box(shopGroup,0,1.23,7.7,1.4,.18,.9,'#1b6d74');interactables.push({object:counter,type:'trade'});
 addLight(shopGroup,0,6.5,4,'#b5dfd1',45,20);addLight(shopGroup,-8,4,-7,'#ffb25f',20,13);addLight(shopGroup,8,4,-7,'#57c2ce',20,13);
}
function init(){
 scene=new THREE.Scene();scene.background=new THREE.Color('#a9b5b2');scene.fog=new THREE.Fog('#a9b5b2',25,73);
 camera=new THREE.PerspectiveCamera(73,innerWidth/innerHeight,.1,120);camera.rotation.order='YXZ';
 renderer=new THREE.WebGLRenderer({canvas,antialias:true,powerPreference:'high-performance'});renderer.setPixelRatio(Math.min(devicePixelRatio,1.7));renderer.setSize(innerWidth,innerHeight);renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.12;
 scene.add(new THREE.HemisphereLight('#d8e6e5','#263539',2.2));let sun=new THREE.DirectionalLight('#fff0d1',2.2);sun.position.set(-12,20,10);sun.castShadow=true;sun.shadow.mapSize.set(1024,1024);scene.add(sun);
 buildRoom();buildShop();buildRoomDrops();clock=new THREE.Clock();raycaster=new THREE.Raycaster();
 $('#money').textContent=state.money;updateInventoryCount();teleport('room',false);bindControls();animate();window.addEventListener('resize',resize);
}
function resize(){camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);renderer.setPixelRatio(Math.min(devicePixelRatio,1.7))}
function teleport(where,announce=true){location=where;let pos=where==='room'?new THREE.Vector3(0,1.7,5.7):new THREE.Vector3(30,1.7,8.8);camera.position.copy(pos);yaw=where==='room'?0:Math.PI;pitch=0;camera.rotation.set(0,yaw,0);$('#location-name').textContent=where==='room'?'MY COLLECTOR ROOM':'COLLECTOR CARD STORE';document.querySelectorAll('.nav-btn').forEach(b=>b.classList.toggle('active',b.dataset.action===where));$('#interaction').classList.add('hidden');if(announce)showToast(where==='room'?'Welcome back to your private room.':'Welcome to the Collector Card Store.');}
function bindControls(){
 window.addEventListener('keydown',e=>{let k=e.key.toLowerCase();if(k==='w'||k==='arrowup')move.f=1;if(k==='s'||k==='arrowdown')move.f=-1;if(k==='a'||k==='arrowleft')move.r=-1;if(k==='d'||k==='arrowright')move.r=1;if(k==='e'||k==='enter'){if(!e.repeat)useTarget()}if(k==='escape')closeModal()});
 window.addEventListener('keyup',e=>{let k=e.key.toLowerCase();if(['w','arrowup','s','arrowdown'].includes(k))move.f=0;if(['a','arrowleft','d','arrowright'].includes(k))move.r=0});
 canvas.addEventListener('click',()=>{if(innerWidth>650&&!root.children.length)canvas.requestPointerLock?.()});document.addEventListener('mousemove',e=>{if(document.pointerLockElement===canvas){yaw-=e.movementX*.0022;pitch-=e.movementY*.0022;pitch=Math.max(-1.25,Math.min(1.25,pitch));camera.rotation.set(pitch,yaw,0)}});
 document.querySelectorAll('.nav-btn').forEach(b=>b.addEventListener('click',()=>{let a=b.dataset.action;if(a==='room'||a==='store')teleport(a);else if(a==='inventory')openInventory();else openAlbums()}));
 $('#mobile-use').addEventListener('click',useTarget);
 const joyEl=$('#joystick'),knob=$('#joy-knob');let start=null;
 joyEl.addEventListener('pointerdown',e=>{start={x:e.clientX,y:e.clientY};joyEl.setPointerCapture(e.pointerId)});
 joyEl.addEventListener('pointermove',e=>{if(!start)return;let dx=e.clientX-start.x,dy=e.clientY-start.y,len=Math.hypot(dx,dy),max=33;if(len>max){dx*=max/len;dy*=max/len}knob.style.transform=`translate(${dx}px,${dy}px)`;joy.x=dx/max;joy.y=dy/max;move.r=joy.x;move.f=-joy.y});
 const end=()=>{start=null;joy.x=joy.y=0;move.f=move.r=0;knob.style.transform=''};joyEl.addEventListener('pointerup',end);joyEl.addEventListener('pointercancel',end);
 let lookStart=null;canvas.addEventListener('pointerdown',e=>{if(innerWidth<=650){lookStart={x:e.clientX,y:e.clientY}}});canvas.addEventListener('pointermove',e=>{if(innerWidth<=650&&lookStart){yaw-=(e.clientX-lookStart.x)*.006;pitch-=(e.clientY-lookStart.y)*.006;pitch=Math.max(-1.15,Math.min(1.15,pitch));camera.rotation.set(pitch,yaw,0);lookStart={x:e.clientX,y:e.clientY}}});canvas.addEventListener('pointerup',()=>lookStart=null);
}
function animate(){requestAnimationFrame(animate);let dt=Math.min(clock.getDelta(),.04);let forward=new THREE.Vector3(-Math.sin(yaw),0,-Math.cos(yaw));let right=new THREE.Vector3(Math.cos(yaw),0,-Math.sin(yaw));let desired=forward.multiplyScalar(move.f).add(right.multiplyScalar(move.r));if(desired.lengthSq()>1)desired.normalize();camera.position.addScaledVector(desired,dt*4.6);let minX=location==='room'?-7.5:18.3,maxX=location==='room'?7.5:41.7,minZ=-7.2,maxZ=location==='room'?7.2:9.5;camera.position.x=THREE.MathUtils.clamp(camera.position.x,minX,maxX);camera.position.z=THREE.MathUtils.clamp(camera.position.z,minZ,maxZ);camera.position.y=1.7;
 updateTarget();renderer.render(scene,camera)}
function currentTarget(){raycaster.setFromCamera(new THREE.Vector2(0,0),camera);let list=interactables.filter(i=>i.object.visible&&((location==='room'&&i.object.parent!==shopGroup)||(location==='store'&&i.object.parent===shopGroup)));let hits=raycaster.intersectObjects(list.map(i=>i.object),true);if(!hits.length)return null;let obj=hits[0].object;while(obj&&!obj.userData.kind)obj=obj.parent;let found=list.find(i=>i.object===obj);if(!found||hits[0].distance>4.5)return null;return found}
function updateTarget(){let t=currentTarget(),el=$('#interaction');if(!t){el.classList.add('hidden');return}let label=t.type==='product'?`BUY ${t.data.name} · ₨${t.data.price}`:t.type==='albumtable'?'OPEN YOUR ALBUM':t.type==='ownedalbum'?`OPEN ${t.data.name} ALBUM`:t.type==='trade'?'OPEN TRADING DESK':'INTERACT';$('#interaction-label').textContent=label;el.classList.remove('hidden')}
function useTarget(){let t=currentTarget();if(!t){showToast('Move closer and look at an object to interact.');return}if(t.type==='product')buyProduct(t.data);if(t.type==='albumtable')openAlbums();if(t.type==='ownedalbum')openAlbum(t.data.id);if(t.type==='trade')openTrade();}

// ---------- Collecting, packs, albums, inventory, and trade systems ----------
function modal(html, cls='modal'){
  root.innerHTML=`<div class="${cls}" role="dialog" aria-modal="true"><button class="modal-close" onclick="closeModal()" aria-label="Close">×</button>${html}</div>`;
}
function closeModal(){root.innerHTML='';}
function updateMoney(){ $('#money').textContent=state.money; }
function updateInventoryCount(){
  let n=(Object.values(state.items).reduce((a,b)=>a+(Number(b)||0),0)+state.cards.length);
  $('#inventory-count').textContent=n;
}
function cardData(collection, index=Math.floor(Math.random()*names.length)){
  let rarity=Math.random()<.08?'LEGENDARY':Math.random()<.28?'RARE':'COMMON';
  let rating=rarity==='LEGENDARY'?95+Math.floor(Math.random()*6):rarity==='RARE'?82+Math.floor(Math.random()*10):72+Math.floor(Math.random()*10);
  return {id:`card-${Date.now()}-${Math.random().toString(36).slice(2)}-${index}`,name:names[index],flag:flags[index],rating,rarity,collection,index};
}
function generateCards(p){
  let count=p.kind==='box'?24:(p.kind==='pack'&&(p.id.includes('premium')||p.id.includes('collector'))?8:5);
  let out=[];for(let i=0;i<count;i++)out.push(cardData(p.collection));return out;
}
function buyProduct(p){
  if(state.money<p.price){showToast('You need more LEI for this item.');return}
  state.money-=p.price;state.items[p.id]=(state.items[p.id]||0)+1;updateMoney();updateInventoryCount();save();buildRoomDrops();showToast(`${p.name} added to inventory.`);
  modal(`<div class="modal-heading"><small>PRODUCT ACQUIRED</small><h2>${p.name}</h2></div><div class="purchase-preview"><div class="pack-art" style="--accent:${p.color}"><b>${p.label}</b><span>${p.kind==='box'?'24 CARDS':'5 CARDS'}</span></div></div><button class="primary-btn" id="open-purchase">OPEN NOW</button>`,'panel modal-product');
  $('#open-purchase').onclick=()=>openItem(p.id);
}
function openInventory(){
  let packHtml=[];
  Object.entries(state.items).filter(([,n])=>n>0).forEach(([id,n])=>{let p=products.find(x=>x.id===id);if(p)packHtml.push(`<article class="inventory-item"><div class="mini-pack" style="--accent:${p.color}"><b>${p.label}</b></div><div><small>${p.brand}</small><h3>${p.name}</h3><span class="qty">×${n}</span></div><button class="small-btn" onclick="openItem('${id}')">OPEN</button><button class="sell-btn" onclick="sellItem('${id}')">SELL</button></article>`)});
  let albumHtml=Object.entries(state.albums).filter(([,n])=>n>0).map(([id,n])=>{let c=collections.find(x=>x.id===id)||{name:id,color:'#94743c'};return `<article class="inventory-item"><div class="mini-album" style="--accent:${c.color}">26</div><div><small>OWNED ALBUM</small><h3>${c.name}</h3><span class="qty">×${n}</span></div><button class="small-btn" onclick="openAlbum('${id}')">OPEN</button></article>`}).join('');
  let cardHtml=state.cards.slice().reverse().slice(0,24).map(c=>`<button class="card-tile ${c.rarity.toLowerCase()}" onclick="openCard('${c.id}')"><span>${c.flag}</span><b>${c.rating}</b><strong>${c.name}</strong><small>${c.rarity}</small></button>`).join('');
  modal(`<div class="modal-heading"><small>YOUR COLLECTION</small><h2>Inventory</h2></div><div class="inventory-tabs"><button class="active" onclick="openInventory()">ITEMS</button><button onclick="openCards()">CARDS · ${state.cards.length}</button></div><div class="inventory-list">${packHtml.join('')||'<p class="empty">No packs or boxes yet.</p>'}${albumHtml}</div>`,'panel inventory-modal');
}
function openCards(){
  let cardHtml=state.cards.length?state.cards.slice().reverse().map(c=>`<button class="card-tile ${c.rarity.toLowerCase()}" onclick="openCard('${c.id}')"><span>${c.flag}</span><b>${c.rating}</b><strong>${c.name}</strong><small>${c.rarity}</small></button>`).join(''):'<p class="empty">Open a pack to find cards.</p>';
  modal(`<div class="modal-heading"><small>YOUR COLLECTION</small><h2>Cards · ${state.cards.length}</h2></div><div class="card-grid cards-library">${cardHtml}</div>`,'panel cards-modal');
}
function openAlbums(){
  let owned=collections.map(c=>{let n=state.albums[c.id]||0;return `<article class="album-card ${n?'owned':''}" style="--accent:${c.color}"><div class="album-cover"><span>WORLD CUP</span><b>2026</b><small>${c.name}</small></div><div class="album-info"><h3>${c.name}</h3><p>${c.sub}</p>${n?`<button class="primary-btn" onclick="openAlbum('${c.id}')">OPEN ALBUM</button>`:`<button class="small-btn" onclick="buyAlbum('${c.id}')">₨ ${c.price} LEI</button>`}</div></article>`}).join('');
  modal(`<div class="modal-heading"><small>OFFICIAL COLLECTIONS</small><h2>Albums</h2></div><div class="album-grid">${owned}</div>`,'panel albums-modal');
}
function buyAlbum(id){let c=collections.find(x=>x.id===id);if(!c)return;if(state.money<c.price){showToast('Not enough LEI to buy this album.');return}state.money-=c.price;state.albums[id]=(state.albums[id]||0)+1;updateMoney();save();buildRoomDrops();showToast(`${c.name} album purchased.`);openAlbums();}
function openItem(id){let p=products.find(x=>x.id===id);if(!p||(state.items[id]||0)<1)return;state.items[id]--;let cards=generateCards(p);state.cards.push(...cards);updateInventoryCount();save();buildRoomDrops();let rarityCounts={LEGENDARY:0,RARE:0,COMMON:0};cards.forEach(c=>rarityCounts[c.rarity]++);let cardTiles=cards.slice(0,16).map(c=>`<button class="card-tile ${c.rarity.toLowerCase()}" onclick="openCard('${c.id}')"><span>${c.flag}</span><b>${c.rating}</b><strong>${c.name}</strong><small>${c.rarity}</small></button>`).join('');modal(`<div class="modal-heading"><small>PACK OPENED</small><h2>${cards.length} new cards</h2></div><div class="reveal-summary"><b>${rarityCounts.LEGENDARY} LEGENDARY</b><b>${rarityCounts.RARE} RARE</b></div><div class="card-grid">${cardTiles}</div><button class="primary-btn" onclick="openInventory()">VIEW INVENTORY</button>`,'panel reveal-modal');}
function sellItem(id){let p=products.find(x=>x.id===id);if(!p||(state.items[id]||0)<1)return;let value=Math.max(2,Math.floor(p.price*.55));state.items[id]--;state.money+=value;updateMoney();updateInventoryCount();save();buildRoomDrops();showToast(`${p.name} sold for ₨${value} LEI.`);openInventory();}
function openCard(id){let c=state.cards.find(x=>x.id===id);if(!c)return;let owned=!!Object.values(state.placed).flat().includes(id);modal(`<div class="card-focus ${c.rarity.toLowerCase()}"><div class="focus-rating">${c.rating}</div><div class="focus-flag">${c.flag}</div><h2>${c.name}</h2><small>${c.collection} · ${c.rarity}</small></div><div class="card-actions"><button class="small-btn" onclick="openAlbum('${c.collection}')">PLACE IN ALBUM</button>${owned?'<button class="sell-btn" onclick="removeCard(\''+id+'\')">REMOVE</button>':''}</div>`,'panel card-modal');}
function openAlbum(id){let c=collections.find(x=>x.id===id)||{id,name:id,color:'#94743c'};if(!(state.albums[id]||0)){showToast('Purchase this album first.');openAlbums();return}state.placed[id]||={};let available=state.cards.filter(card=>card.collection===id&&!Object.values(state.placed[id]).includes(card.id)).slice(0,30);let slots=Array.from({length:20},(_,i)=>{let cardId=state.placed[id][i];let card=cardId?state.cards.find(x=>x.id===cardId):null;return `<button class="album-slot ${card?'filled':''}" data-slot="${i}" onclick="placeCard('${id}',${i})">${card?`<span>${card.flag}</span><b>${card.rating}</b><strong>${card.name}</strong>`:`<small>0${i+1}</small><span>＋</span>`}</button>`});let cards=available.map(card=>`<button class="card-tile ${card.rarity.toLowerCase()}" onclick="chooseCard('${id}','${card.id}')"><span>${card.flag}</span><b>${card.rating}</b><strong>${card.name}</strong></button>`).join('');let filled=Object.keys(state.placed[id]).length;modal(`<div class="modal-heading"><small>${filled}/20 PLACES FILLED</small><h2>${c.name}</h2></div><div class="album-layout"><div class="album-slots">${slots.join('')}</div><aside class="album-picker"><h3>Available cards</h3><div class="card-grid">${cards||'<p class="empty">No matching cards available.</p>'}</div></aside></div>`,'panel album-modal');}
let selectedAlbumCard=null;
function chooseCard(albumId,cardId){selectedAlbumCard={albumId,cardId};showToast('Card selected — choose an empty album slot.');openAlbum(albumId);}
function placeCard(albumId,slot){let slotKey=String(slot);if(selectedAlbumCard&&selectedAlbumCard.albumId===albumId){let card=state.cards.find(c=>c.id===selectedAlbumCard.cardId);if(card&&Object.values(state.placed[albumId]).includes(card.id)){showToast('This card is already placed.');return}state.placed[albumId][slotKey]=selectedAlbumCard.cardId;selectedAlbumCard=null;save();showToast('Card placed in album.');openAlbum(albumId);return}if(state.placed[albumId]&&state.placed[albumId][slotKey]){let cardId=state.placed[albumId][slotKey];delete state.placed[albumId][slotKey];save();showToast('Card removed from slot.');openAlbum(albumId);}else showToast('Select a card from the available cards first.');}
function removeCard(id){Object.keys(state.placed).forEach(a=>Object.keys(state.placed[a]).forEach(slot=>{if(state.placed[a][slot]===id)delete state.placed[a][slot]}));save();closeModal();showToast('Card removed from album.');}
function openTrade(){modal(`<div class="modal-heading"><small>PRIVATE ROOM NETWORK</small><h2>Trading Desk</h2></div><div class="trade-status"><span class="live-dot"></span><div><b>LOCAL TRADING ROOM</b><small>No players connected · browser-local mode</small></div></div><div class="trade-actions"><button class="primary-btn" onclick="openInventory()">OFFER A CARD</button><button class="small-btn" onclick="showToast('Friends trading arrives with online multiplayer.')">INVITE PLAYER</button></div>`,'panel trade-modal');}

window.closeModal=closeModal;window.openInventory=openInventory;window.openCards=openCards;window.openAlbums=openAlbums;window.openAlbum=openAlbum;window.openItem=openItem;window.sellItem=sellItem;window.buyAlbum=buyAlbum;window.openCard=openCard;window.openTrade=openTrade;window.chooseCard=chooseCard;window.placeCard=placeCard;window.removeCard=removeCard;window.buyProduct=buyProduct;

init();
