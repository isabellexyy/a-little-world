'use strict';
// Equal-grid sprite sheet: idle first, then seven walking poses.
window.prepareCharacter=async function(image){
 const frames=[],raw=[];
 for(let i=0;i<8;i++){
  const sx=Math.round((i%4)*image.width/4),sy=Math.round(Math.floor(i/4)*image.height/2);
  const sw=Math.round((i%4+1)*image.width/4)-sx,sh=Math.round((Math.floor(i/4)+1)*image.height/2)-sy;
  const c=document.createElement('canvas');c.width=sw;c.height=sh;const ctx=c.getContext('2d',{willReadFrequently:true});ctx.drawImage(image,sx,sy,sw,sh,0,0,sw,sh);
  const d=ctx.getImageData(0,0,sw,sh).data;let top=sh,bottom=0;
  for(let y=0;y<sh;y++)for(let x=0;x<sw;x++)if(d[(y*sw+x)*4+3]>120){top=Math.min(top,y);bottom=Math.max(bottom,y);}
  if(bottom<=top)throw new Error('人物动画帧为空');
  let sum=0,weight=0;for(let y=Math.round(top+(bottom-top)*.3);y<top+(bottom-top)*.48;y++)for(let x=0;x<sw;x++){const a=d[(y*sw+x)*4+3];if(a>120){sum+=x*a;weight+=a;}}
  raw.push({c,top,bottom,anchor:sum/weight});
 }
 const heights=raw.map(f=>f.bottom-f.top).sort((a,b)=>a-b);const ratio=480/heights[4];
 for(const f of raw){const c=document.createElement('canvas');c.width=384;c.height=512;c.getContext('2d').drawImage(f.c,192-f.anchor*ratio,506-f.bottom*ratio,f.c.width*ratio,f.c.height*ratio);frames.push(c);}
 return frames;
};
