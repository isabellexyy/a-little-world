'use strict';
const W=1536,H=1024;
const rooms=[
 {id:'art',name:'画室',x:205,y:88,w:480,h:219,foot:300,stand:465},
 {id:'library',name:'书房',x:731,y:87,w:314,h:220,foot:301,stand:885},
 {id:'music',name:'音乐室',x:1099,y:84,w:353,h:225,foot:300,stand:1270},
 {id:'kitchen',name:'厨房',x:212,y:372,w:450,h:256,foot:619,stand:453},
 {id:'dining',name:'餐厅',x:709,y:376,w:308,h:263,foot:628,stand:855},
 {id:'living',name:'客厅',x:1068,y:377,w:384,h:269,foot:636,stand:1260},
 {id:'collection',name:'收藏室',x:261,y:698,w:169,h:225,foot:916,stand:350},
 {id:'bedroom',name:'卧室',x:499,y:695,w:430,h:237,foot:921,stand:713},
 {id:'work',name:'工作间',x:1090,y:702,w:345,h:230,foot:920,stand:1240}
];
const $=id=>document.getElementById(id),person=$('person').getContext('2d'),front=$('foreground').getContext('2d');
const makeCanvas=(w,h)=>Object.assign(document.createElement('canvas'),{width:w,height:h});
const load=src=>new Promise((resolve,reject)=>{const im=new Image();im.onload=()=>resolve(im);im.onerror=()=>reject(new Error('图片加载失败：'+src));im.src=src;});
let sprite,characterFrames=[],walkDistance=0,ready=false,playing=false,current=rooms[3],destination=null,pending=null,segments=[],active=null,x=current.stand,y=current.foot,direction=1,hidden=false,idle=0,last=0;
const routeOrder=['kitchen','library','art','music','living','dining','work','bedroom','collection'];
function status(text){$('status').textContent=text;}
function setPlaying(value){playing=value;$('play').textContent=value?'暂停散步':'开始散步';$('play').setAttribute('aria-pressed',String(value));}
function go(room){if(!ready)return;setPlaying(true);if(destination){pending=room;return;}if(room===current){idle=0;return;}destination=room;idle=0;segments=buildHouseRoute(current,room,x,y);status(`从${current.name}去${room.name}…`);}
for(const room of rooms){const b=document.createElement('button');b.className='room';b.style.cssText=`left:${room.x/W*100}%;top:${room.y/H*100}%;width:${room.w/W*100}%;height:${room.h/H*100}%`;b.setAttribute('aria-label',`去${room.name}`);b.innerHTML=`<span>${room.name}</span>`;b.disabled=true;b.onclick=()=>go(room);$('rooms').append(b);}
$('play').onclick=()=>setPlaying(!playing);
$('showMask').onchange=()=>document.body.classList.toggle('mask',$('showMask').checked);
function draw(){person.clearRect(0,0,W,H);if(ready&&!hidden&&$('showPerson').checked){const moving=active&&!active.hidden;
const gait=[0,2,1,2,0,5,4,5];
const phase=walkDistance/11,step=Math.floor(phase),fraction=phase-step;
const index=moving?gait[step%gait.length]:0;
const next=moving?gait[(step+1)%gait.length]:0;
const blend=moving?Math.max(0,(fraction-.65)/.35):0;
const pose=characterFrames[index]||sprite;const h=140,w=h*pose.width/pose.height;
person.save();person.translate(x,y);person.scale(direction,1);
person.globalAlpha=1-blend;person.drawImage(pose,-w/2,-h,w,h);
if(blend>0){person.globalCompositeOperation='lighter';person.globalAlpha=blend;person.drawImage(characterFrames[next],-w/2,-h,w,h);}
person.restore();}front.canvas.style.visibility=$('occlusion').checked?'visible':'hidden';}
function tick(now){const dt=last?Math.min(now-last,80):0;last=now;if(ready&&playing&&!document.querySelector("dialog[open]")){if(!active&&segments.length){active=segments.shift();active.fromX=x;active.fromY=y;active.elapsed=0;if(active.x!==x)direction=active.x>x?1:-1;hidden=active.hidden;}if(active){active.elapsed+=dt;const p=Math.min(1,active.elapsed/active.ms);{const eased=p<.15?p*p/.255:p>.85?1-(1-p)*(1-p)/.255:(p-.075)/.85;const nextX=active.fromX+(active.x-active.fromX)*eased;if(!active.hidden)walkDistance+=Math.abs(nextX-x);x=nextX;y=active.fromY+(active.y-active.fromY)*eased;}if(p===1){active=null;if(!segments.length){current=destination;destination=null;hidden=false;status(`她在${current.name}。`);if(pending){const target=pending;pending=null;go(target);}}}}else{idle+=dt;if(idle>7000){go(rooms.find(r=>r.id===routeOrder[(routeOrder.indexOf(current.id)+1)%routeOrder.length]));}}}draw();requestAnimationFrame(tick);}
Promise.all([load('assets/house-clean.png'),load('assets/foreground.png'),load('assets/girl-walk-sheet.png')]).then(async ([base,mask,girl])=>{const m=makeCanvas(W,H),mc=m.getContext('2d',{willReadFrequently:true});mc.drawImage(mask,0,0,W,H);const pixels=mc.getImageData(0,0,W,H);for(let i=3;i<pixels.data.length;i+=4)pixels.data[i]=pixels.data[i]>150?255:0;mc.putImageData(pixels,0,0);front.drawImage(base,0,0,W,H);front.globalCompositeOperation='destination-in';front.drawImage(m,0,0);front.globalCompositeOperation='source-over';characterFrames=await window.prepareCharacter(girl);sprite=characterFrames[0];ready=true;$('play').disabled=false;document.querySelectorAll('.room').forEach(b=>b.disabled=false);status('她在厨房。点一扇窗，让她过去。');setPlaying(!matchMedia('(prefers-reduced-motion: reduce)').matches);window.housePrototype={rooms,getState:()=>({current:current.id,destination:destination?.id,x,y,hidden,playing}),go:id=>go(rooms.find(r=>r.id===id))};}).catch(e=>{status('图片没加载完整，请刷新重试。');console.error(e);});
document.addEventListener('visibilitychange',()=>{last=0;});requestAnimationFrame(tick);
