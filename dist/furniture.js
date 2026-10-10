'use strict';
(()=>{
 const items=[
  {id:'easel',name:'画板',room:'画室',x:461,y:148,w:133,h:162},
  {id:'bookshelf',name:'书柜',room:'书房',x:793,y:102,w:248,h:201},
  {id:'piano',name:'钢琴',room:'音乐室',x:1232,y:139,w:208,h:169},
  {id:'kitchen-island',name:'料理台',room:'厨房',x:367,y:527,w:242,h:104},
  {id:'sofa',name:'沙发',room:'客厅',x:1170,y:531,w:252,h:113},
  {id:'bed',name:'床',room:'卧室',x:548,y:795,w:326,h:138},
  {id:'desk',name:'书桌',room:'工作间',x:1178,y:791,w:211,h:143}
 ];
 const crops={'desk':[0,0,510,490],'bookshelf':[510,0,405,490],'easel':[930,0,305,490],'kitchen-island':[1235,0,539,490],'piano':[0,495,505,392],'sofa':[510,495,635,392],'bed':[1145,495,629,392]};
 const dialog=document.getElementById('furnitureDialog');let lastButton;
 dialog.querySelector('.close').onclick=()=>dialog.close();
 dialog.addEventListener('click',e=>{if(e.target!==dialog)return;const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();});
 dialog.addEventListener('close',()=>lastButton?.focus({preventScroll:true}));
 for(const item of items){
  const button=document.createElement('button');button.className='furniture-item';button.id=`item-${item.id}`;button.setAttribute('aria-label',`打开${item.name}`);button.setAttribute('aria-haspopup','dialog');button.style.cssText=`left:${item.x/1536*100}%;top:${item.y/1024*100}%;width:${item.w/1536*100}%;height:${item.h/1024*100}%`;button.disabled=true;
  const img=new Image();img.alt='';img.draggable=false;img.style.visibility='hidden';img.src='assets/furniture/furniture-sheet-v1.png';button.append(img);
  const label=document.createElement('span');label.className='furniture-label';label.textContent=item.name;label.style.cssText=`left:${(item.x+item.w/2)/1536*100}%;top:${(item.y-8)/1024*100}%`;document.getElementById('furnitureLabels').append(label);
  function active(value){button.classList.toggle('highlighted',value);label.classList.toggle('visible',value);}
  button.addEventListener('pointerenter',()=>active(true));button.addEventListener('pointerleave',()=>active(document.activeElement===button));button.addEventListener('focus',()=>active(true));button.addEventListener('blur',()=>active(false));
  button.onclick=e=>{e.stopPropagation();lastButton=button;document.getElementById('furnitureTitle').textContent=item.name;document.getElementById('furnitureRoom').textContent=item.room;dialog.showModal();};
  img.onload=()=>{if(img.dataset.trimmed)return;const c=document.createElement('canvas');const [cx,cy,cw,ch]=crops[item.id];c.width=cw;c.height=ch;const ctx=c.getContext('2d',{willReadFrequently:true});ctx.drawImage(img,cx,cy,cw,ch,0,0,cw,ch);const d=ctx.getImageData(0,0,c.width,c.height).data;let l=c.width,t=c.height,r=0,b=0;for(let yy=0;yy<c.height;yy++)for(let xx=0;xx<c.width;xx++)if(d[(yy*c.width+xx)*4+3]>110){l=Math.min(l,xx);r=Math.max(r,xx);t=Math.min(t,yy);b=Math.max(b,yy);}if(r<=l)return;const trimmed=document.createElement('canvas');trimmed.width=r-l+1;trimmed.height=b-t+1;trimmed.getContext('2d').drawImage(c,l,t,trimmed.width,trimmed.height,0,0,trimmed.width,trimmed.height);img.dataset.trimmed='true';img.src=trimmed.toDataURL();img.style.visibility='visible';button.disabled=false;};
  img.onerror=()=>{button.disabled=true;button.setAttribute('aria-label',`${item.name}图片暂时无法加载`);};
  document.getElementById('furniture').append(button);
 }
})();
