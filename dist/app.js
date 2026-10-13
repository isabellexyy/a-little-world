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
const $=id=>document.getElementById(id),person=$('person').getContext('2d'),front=$('foreground').getContext('2d'),personFront=$('personFront').getContext('2d'),roomOccluders=$('roomOccluders').getContext('2d');
const makeCanvas=(w,h)=>Object.assign(document.createElement('canvas'),{width:w,height:h});
const load=src=>new Promise((resolve,reject)=>{const im=new Image();im.onload=()=>resolve(im);im.onerror=()=>reject(new Error('图片加载失败：'+src));im.src=src;});
let sprite,characterFrames=[],walkDistance=0,armStrength=0,ready=false,playing=false,current=rooms[3],destination=null,pending=null,segments=[],active=null,x=current.stand,y=current.foot,direction=1,hidden=false,idle=0,last=0;
const routeOrder=['kitchen','library','art','music','living','dining','work','bedroom','collection'];
function status(text){$('status').textContent=text;}
function setPlaying(value){playing=value;$('play').textContent=value?'暂停散步':'开始散步';$('play').setAttribute('aria-pressed',String(value));}
function go(room){if(!ready)return;setPlaying(true);if(destination){pending=room;return;}if(room===current){idle=0;return;}destination=room;idle=0;segments=buildHouseRoute(current,room,x,y);status(`从${current.name}去${room.name}…`);}
for(const room of rooms){const b=document.createElement('button');b.className='room';b.style.cssText=`left:${room.x/W*100}%;top:${room.y/H*100}%;width:${room.w/W*100}%;height:${room.h/H*100}%`;b.setAttribute('aria-label',`去${room.name}`);b.innerHTML=`<span>${room.name}</span>`;b.disabled=true;b.onclick=()=>go(room);$('rooms').append(b);}
$('play').onclick=()=>setPlaying(!playing);
$('showMask').onchange=()=>document.body.classList.toggle('mask',$('showMask').checked);
// Clip each room independently so a sprite spanning a doorway never flips depth.
const frontRooms=new Set(['art','library','music','collection','bedroom']);
function paintGirl(ctx,pose,next,blend,height,foot){
 const width=height*pose.width/pose.height;
 ctx.save();ctx.translate(x,foot);ctx.scale(direction,1);
 ctx.globalAlpha=1-blend;ctx.drawImage(pose,-width/2,-height,width,height);
 if(blend>0){ctx.globalCompositeOperation='lighter';ctx.globalAlpha=blend;ctx.drawImage(next,-width/2,-height,width,height);}
 ctx.restore();
}
function draw(){
 person.clearRect(0,0,W,H);personFront.clearRect(0,0,W,H);
 if(ready&&!hidden&&$('showPerson').checked){
  // Contact → passing → opposite contact → opposite passing. Do not insert
  // the idle pose or reverse a half-step in the middle of the walk cycle.
  const gait=[1,2,4,5],phase=walkDistance/11;
  const legPhase=phase/2,step=Math.floor(legPhase),fraction=legPhase-step;
  const pose=characterFrames[gait[step%gait.length]]||sprite;
  const next=characterFrames[gait[(step+1)%gait.length]];
  const blend=fraction*fraction*(3-2*fraction);
  const composed=window.composeCharacter(pose,next,blend,phase,armStrength);
  for(const room of rooms){
   if(Math.abs(y-room.foot)>45||x<room.x-110||x>room.x+room.w+110)continue;
   const ctx=frontRooms.has(room.id)?personFront:person;
   ctx.save();ctx.beginPath();ctx.rect(room.x,room.y,room.w,room.h);ctx.clip();
   const collection=room.id==='collection';
   paintGirl(ctx,composed,composed,0,collection?210:140,y+(collection?70:0));ctx.restore();
  }
 }
 const visibility=$('occlusion').checked?'visible':'hidden';
 front.canvas.style.visibility=visibility;roomOccluders.canvas.style.visibility=visibility;
}
// These objects remain in the background painting. Copy their silhouettes exactly,
// avoiding repainted edges or opaque rectangles across the girl's walking path.
function prepareRoomOccluders(base){
 const shapes=[
  // Dining: tablecloth, vase and chairs. The slatted chair holes stay transparent.
  [[785,555],[822,551],[832,548],[834,533],[842,521],[850,529],[858,526],[866,535],[864,550],[969,558],[978,577],[984,601],[978,609],[964,604],[946,616],[924,610],[907,618],[883,610],[865,623],[841,618],[825,624],[811,609],[797,609]],
  [[758,552],[764,544],[777,540],[788,542],[799,550],[802,558],[795,559],[790,550],[779,547],[768,551],[765,558]],
  [[756,551],[762,552],[770,597],[810,601],[811,611],[799,612],[796,639],[790,639],[792,610],[774,609],[771,639],[765,639],[768,609]],
  [[924,550],[933,542],[945,541],[956,546],[960,555],[953,555],[949,548],[939,547],[930,554]],
  [[924,550],[930,551],[920,597],[951,597],[957,552],[963,554],[957,600],[960,639],[954,639],[949,609],[919,609],[915,639],[909,639],[913,607],[892,606],[890,598],[914,595]],
  // Workroom: shelf, small drawer unit, and the large plant at the left window.
  [[1282,793],[1337,793],[1337,908],[1282,908]],
  [[1344,878],[1395,878],[1395,938],[1344,938]],
  [[1104,893],[1145,891],[1140,934],[1109,934]],
  [[1122,897],[1117,875],[1098,880],[1087,869],[1105,860],[1117,861],[1111,845],[1091,846],[1086,832],[1102,820],[1113,824],[1118,808],[1110,803],[1121,785],[1139,775],[1136,796],[1127,815],[1142,811],[1154,795],[1167,795],[1164,814],[1145,832],[1136,845],[1154,833],[1177,812],[1195,803],[1186,823],[1166,840],[1156,849],[1180,841],[1190,848],[1189,856],[1170,853],[1151,858],[1168,861],[1181,873],[1181,885],[1168,876],[1154,873],[1136,894]],
  // Small plant on the office shelf.
  [[1293,795],[1290,780],[1285,777],[1279,765],[1287,768],[1295,781],[1293,762],[1285,750],[1289,745],[1299,761],[1300,739],[1306,747],[1303,766],[1314,748],[1320,746],[1316,760],[1308,776],[1323,760],[1329,759],[1325,769],[1312,781],[1328,773],[1331,778],[1322,785],[1315,789],[1314,797]]
 ];
 // Narrow slats retain the original gaps instead of masking a whole chair rectangle.
 for(const [a,b] of [[766,778],[777,787],[787,797]])shapes.push([[a,550],[a+3,550],[b+3,598],[b,598]]);
 for(const [a,b] of [[932,923],[942,932],[952,942]])shapes.push([[a,550],[a+3,550],[b+3,597],[b,597]]);
 for(const points of shapes){roomOccluders.save();roomOccluders.beginPath();points.forEach(([px,py],i)=>i?roomOccluders.lineTo(px,py):roomOccluders.moveTo(px,py));roomOccluders.closePath();roomOccluders.clip();roomOccluders.drawImage(base,0,0,W,H);roomOccluders.restore();}
}
function tick(now){const dt=last?Math.min(now-last,80):0;last=now;if(ready&&playing&&!document.querySelector("dialog[open]")){if(!active&&segments.length){active=segments.shift();active.fromX=x;active.fromY=y;active.elapsed=0;if(active.x!==x)direction=active.x>x?1:-1;hidden=active.hidden;}if(active){active.elapsed+=dt;const p=Math.min(1,active.elapsed/active.ms);{const eased=p<.15?p*p/.255:p>.85?1-(1-p)*(1-p)/.255:(p-.075)/.85;const nextX=active.fromX+(active.x-active.fromX)*eased;if(!active.hidden)walkDistance+=Math.abs(nextX-x);x=nextX;y=active.fromY+(active.y-active.fromY)*eased;}if(p===1){active=null;if(!segments.length){current=destination;destination=null;hidden=false;status(`她在${current.name}。`);if(pending){const target=pending;pending=null;go(target);}}}}else{idle+=dt;if(idle>7000){go(rooms.find(r=>r.id===routeOrder[(routeOrder.indexOf(current.id)+1)%routeOrder.length]));}}}armStrength+=(Number(Boolean(active&&!active.hidden))-armStrength)*(1-Math.exp(-dt/160));draw();requestAnimationFrame(tick);}
Promise.all([load('assets/house-clean.png'),load('assets/foreground.png'),load('assets/girl-walk-sheet.png'),load('assets/house-furniture-empty.png')]).then(async ([base,mask,girl,empty])=>{const m=makeCanvas(W,H),mc=m.getContext('2d',{willReadFrequently:true});mc.drawImage(mask,0,0,W,H);const pixels=mc.getImageData(0,0,W,H);for(let i=3;i<pixels.data.length;i+=4)pixels.data[i]=pixels.data[i]>150?255:0;mc.putImageData(pixels,0,0);front.drawImage(base,0,0,W,H);front.globalCompositeOperation='destination-in';front.drawImage(m,0,0);front.globalCompositeOperation='source-over';prepareRoomOccluders(empty);characterFrames=await window.prepareCharacter(girl);sprite=characterFrames[0];ready=true;$('play').disabled=false;document.querySelectorAll('.room').forEach(b=>b.disabled=false);status('她在厨房。点一扇窗，让她过去。');setPlaying(!matchMedia('(prefers-reduced-motion: reduce)').matches);window.housePrototype={rooms,getState:()=>({current:current.id,destination:destination?.id,x,y,hidden,playing}),go:id=>go(rooms.find(r=>r.id===id))};}).catch(e=>{status('图片没加载完整，请刷新重试。');console.error(e);});
document.addEventListener('visibilitychange',()=>{last=0;});requestAnimationFrame(tick);
