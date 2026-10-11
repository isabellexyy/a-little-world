'use strict';
// Stairwells are just outside both edges of the painted building, not the viewport.
function buildHouseRoute(from,to,startX=from.stand,startY=from.foot){
 const floors=[300,628,921],floor=y=>y<450?0:y<780?1:2;
 let level=floor(startY),target=floor(to.foot),cx=startX;const result=[];
 function walk(x,y){result.push({x,y,ms:Math.max(1000,Math.abs(x-cx)/65*1000),hidden:false});cx=x;}
 if(level===target){walk(to.stand,to.foot);return result;}
 // Head across the current floor toward its farther stairwell.
 let edge=startX<768?1588:-52;
 walk(edge,floors[level]);
 while(level!==target){
  level+=Math.sign(target-level);
  result.push({x:edge,y:floors[level],ms:1800,hidden:true});
  if(level!==target){edge=edge<0?1588:-52;walk(edge,floors[level]);}
 }
 walk(to.stand,to.foot);
 return result;
}
if(typeof module!=='undefined')module.exports={buildHouseRoute};
