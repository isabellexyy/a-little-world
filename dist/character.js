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
 for(const f of raw){const ratio=480/(f.bottom-f.top);const c=document.createElement('canvas');c.width=384;c.height=512;c.getContext('2d').drawImage(f.c,192-f.anchor*ratio,506-f.bottom*ratio,f.c.width*ratio,f.c.height*ratio);frames.push(c);}
 // Keep the exact same head/hair throughout the gait. Blend the
 // neck seam, rather than switching eight independently painted faces.
 const stable=frames[0];
 for(let i=1;i<frames.length;i++){
  const upper=document.createElement('canvas');upper.width=384;upper.height=512;
  const u=upper.getContext('2d');u.drawImage(stable,0,0);
  u.globalCompositeOperation='destination-in';const fade=u.createLinearGradient(0,120,0,148);fade.addColorStop(0,'#000');fade.addColorStop(1,'transparent');u.fillStyle=fade;u.fillRect(0,0,384,512);
  const ctx=frames[i].getContext('2d');ctx.globalCompositeOperation='destination-out';ctx.fillStyle=fade;ctx.fillRect(0,0,384,512);ctx.globalCompositeOperation='lighter';ctx.drawImage(upper,0,0);ctx.globalCompositeOperation='source-over';
 }
 // Retain the normalized leg poses, but use one coherent upper body for every
 // frame. A continuous sleeve warp below fixed shoulders replaces the varying
 // generated shoulder silhouettes. No new image is fetched during animation.
 const upper=document.createElement('canvas');upper.width=384;upper.height=512;
 const composed=document.createElement('canvas');composed.width=384;composed.height=512;
 const uc=upper.getContext('2d'),cc=composed.getContext('2d');
 const seam=cc.createLinearGradient(0,306,0,340);seam.addColorStop(0,'#000');seam.addColorStop(1,'transparent');
 const columns=[0,125,178,202,221,251,384];
 function weight(x){return x<=178?1:x<202?(202-x)/24:x<=221?0:x<251?-(x-221)/30*.65:-.65;}
 window.composeCharacter=function(pose,next,blend,phase,strength=1){
  cc.clearRect(0,0,384,512);cc.globalCompositeOperation='source-over';cc.globalAlpha=1-blend;cc.drawImage(pose,0,0);
  if(blend){cc.globalCompositeOperation='lighter';cc.globalAlpha=blend;cc.drawImage(next,0,0);}
  cc.globalAlpha=1;cc.globalCompositeOperation='destination-out';cc.fillStyle=seam;cc.fillRect(0,0,384,512);cc.globalCompositeOperation='source-over';
  uc.clearRect(0,0,384,512);uc.globalCompositeOperation='source-over';
  // One cycle per complete eight-step leg sequence; shoulder pixels (y <= 145)
  // never move. At displayed size the hand excursion is only about 5 pixels.
  const swing=Math.sin(phase*Math.PI/4)*18*strength;
  for(let y=0;y<340;y+=2){
   const reach=Math.max(0,Math.min(1,(y-145)/165));
   for(let i=0;i<columns.length-1;i++){
    const a=columns[i],b=columns[i+1],da=a+swing*reach*weight(a),db=b+swing*reach*weight(b);
    uc.drawImage(stable,a,y,b-a,2,da,y,db-da,2);
   }
  }
  uc.globalCompositeOperation='destination-in';uc.fillStyle=seam;uc.fillRect(0,0,384,512);uc.globalCompositeOperation='source-over';
  cc.globalCompositeOperation='lighter';cc.drawImage(upper,0,0);cc.globalCompositeOperation='source-over';
  return composed;
 };
 return frames;
};
