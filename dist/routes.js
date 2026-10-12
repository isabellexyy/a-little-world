'use strict';
// Stairwells are just outside both edges of the painted building, not the viewport.
function buildHouseRoute(from,to,startX=from.stand,startY=from.foot){
 const floors=[300,628,921],floor=y=>y<450?0:y<780?1:2;
 let level=floor(startY),target=floor(to.foot),cx=startX;const result=[];
 function walk(x,y){result.push({x,y,ms:Math.max(1000,Math.abs(x-cx)/65*1000),hidden:false});cx=x;}
 if(level===target){walk(to.stand,to.foot);return result;}
 // Both stairwells span every floor. Compare the full horizontal journey;
 // vertical distance is identical on either side. Ties use the nearer entrance.
 const left=-52,right=1588;
 const leftDistance=Math.abs(startX-left)+Math.abs(to.stand-left);
 const rightDistance=Math.abs(startX-right)+Math.abs(to.stand-right);
 const edge=leftDistance===rightDistance
  ?(Math.abs(startX-left)<=Math.abs(startX-right)?left:right)
  :(leftDistance<rightDistance?left:right);
 walk(edge,floors[level]);
 while(level!==target){
  level+=Math.sign(target-level);
  result.push({x:edge,y:floors[level],ms:1800,hidden:true});
 }
 walk(to.stand,to.foot);
 return result;
}
if(typeof module!=='undefined')module.exports={buildHouseRoute};
