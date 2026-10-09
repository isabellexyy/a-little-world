'use strict';
(()=>{
 const vp=document.getElementById('viewport'),world=document.getElementById('world'),scene=document.getElementById('scene');
 const width=1536,height=1024,pad=0;let scale=1,vw=0,vh=0,px=0,py=0,bx=0,by=0,hx=0,hy=0,overview=false,drag=null,moved=false,spring=0,wheelTimer;
 const reduce=matchMedia('(prefers-reduced-motion: reduce)');
 const clamp=(n,b)=>Math.max(-b,Math.min(b,n));
 function paint(){px=clamp(px,hx);py=clamp(py,hy);world.style.transform=`translate3d(${(vw-(width+2*pad)*scale)/2+px}px,${(vh-(height+2*pad)*scale)/2+py}px,0) scale(${scale})`;}
 function layout(){vw=vp.clientWidth;vh=vp.clientHeight;scale=Math.max((vw+64)/width,(vh+64)/height)*(overview?1.25:1);hx=Math.max(0,(width*scale-vw)/2-2);hy=Math.max(0,(height*scale-vh)/2-2);bx=Math.max(0,hx-24);by=Math.max(0,hy-24);world.style.width=`${width+2*pad}px`;world.style.height=`${height+2*pad}px`;scene.style.cssText=`width:${width}px;height:${height}px;left:${pad}px;top:${pad}px`;px=clamp(px,bx);py=clamp(py,by);paint();}
 function stop(){cancelAnimationFrame(spring);spring=0;}
 function settle(tx=clamp(px,bx),ty=clamp(py,by)){stop();if(reduce.matches){px=tx;py=ty;paint();return;}let dx=0,dy=0,last=performance.now();function frame(now){const dt=Math.min((now-last)/1000,.032);last=now;dx+=(170*(tx-px)-24*dx)*dt;dy+=(170*(ty-py)-24*dy)*dt;px+=dx*dt;py+=dy*dt;paint();if(Math.abs(px-tx)+Math.abs(py-ty)+Math.abs(dx)+Math.abs(dy)>.3)spring=requestAnimationFrame(frame);else{px=tx;py=ty;paint();spring=0;}}spring=requestAnimationFrame(frame);}
 function rubber(value,bound){const extra=value-clamp(value,bound);return clamp(value,bound)+Math.sign(extra)*24*(1-Math.exp(-Math.abs(extra)/100));}
 vp.addEventListener('pointerdown',e=>{if(e.button!==0)return;stop();clearTimeout(wheelTimer);moved=false;drag={id:e.pointerId,x:e.clientX,y:e.clientY,px,py};});
 vp.addEventListener('pointermove',e=>{if(!drag||e.pointerId!==drag.id)return;const dx=e.clientX-drag.x,dy=e.clientY-drag.y;if(Math.hypot(dx,dy)>6&&!moved){moved=true;vp.setPointerCapture(e.pointerId);vp.classList.add('dragging');}if(moved){px=rubber(drag.px+dx,bx);py=rubber(drag.py+dy,by);paint();}});
 function end(e){if(!drag||e.pointerId!==drag.id)return;drag=null;vp.classList.remove('dragging');if(vp.hasPointerCapture(e.pointerId))vp.releasePointerCapture(e.pointerId);settle();}
 vp.addEventListener('pointerup',end);vp.addEventListener('pointercancel',end);vp.addEventListener('lostpointercapture',()=>{if(drag){drag=null;vp.classList.remove('dragging');settle();}});
 vp.addEventListener('click',e=>{if(moved){e.preventDefault();e.stopImmediatePropagation();moved=false;}},true);
 vp.addEventListener('wheel',e=>{if(e.ctrlKey)return;e.preventDefault();stop();const unit=e.deltaMode===1?16:e.deltaMode===2?vh:1;let dx=e.deltaX*unit,dy=e.deltaY*unit;if(e.shiftKey&&dx===0){dx=dy;dy=0;}px=rubber(px-dx,bx);py=rubber(py-dy,by);paint();clearTimeout(wheelTimer);wheelTimer=setTimeout(()=>settle(),130);},{passive:false});
 vp.addEventListener('keydown',e=>{if(e.target!==vp)return;const keys={ArrowLeft:[90,0],ArrowRight:[-90,0],ArrowUp:[0,90],ArrowDown:[0,-90]};if(keys[e.key]){e.preventDefault();const [dx,dy]=keys[e.key];settle(clamp(px+dx,bx),clamp(py+dy,by));}if(e.key==='Home'){e.preventDefault();settle(0,0);}});
 function home(){overview=false;document.getElementById('view').textContent='拉近看看';document.getElementById('view').setAttribute('aria-pressed','false');layout();settle(0,0);}
 document.getElementById('home').onclick=home;
 document.getElementById('view').onclick=()=>{overview=!overview;document.getElementById('view').textContent=overview?'恢复全景':'拉近看看';document.getElementById('view').setAttribute('aria-pressed',String(overview));px=py=0;layout();};
 const about=document.getElementById('aboutDialog'),explore=document.getElementById('exploreDialog');
 for(const dialog of [about,explore]){dialog.querySelector('.close').onclick=()=>dialog.close();dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();}});}
 document.getElementById('about').onclick=()=>about.showModal();
 document.getElementById('explore').onclick=document.getElementById('choose').onclick=()=>explore.showModal();
 const roomData=[['art','画室',445,200],['library','书房',885,200],['music','音乐室',1270,200],['kitchen','厨房',440,505],['dining','餐厅',865,505],['living','客厅',1260,505],['collection','收藏室',345,810],['bedroom','卧室',715,810],['work','工作间',1260,815]];
 for(const [id,name,x,y] of roomData){const button=document.createElement('button');button.textContent=name;button.onclick=()=>{explore.close();settle(clamp((width/2-x)*scale,bx),clamp((height/2-y)*scale,by));document.querySelector(`[aria-label="去${name}"]`)?.focus({preventScroll:true});};document.getElementById('roomList').append(button);}
 new ResizeObserver(()=>{stop();layout();}).observe(vp);layout();
})();
