import{R as w,r as g,n as U,l as E,o as N,j as m,p as k,q as z,t as n,v as F,x as $,z as A,C as D,D as I}from"./index-7nfjQZXQ.js";let S=0;function G(e){const[r,s]=g.useState(e),a=e||r;return g.useEffect(()=>{r==null&&(S+=1,s(`mui-${S}`))},[r]),a}const K={...w},b=K.useId;function L(e){if(b!==void 0){const r=b();return e??r}return G(e)}function V(e){return U("MuiCircularProgress",e)}E("MuiCircularProgress",["root","determinate","indeterminate","colorPrimary","colorSecondary","svg","circle","circleDeterminate","circleIndeterminate","circleDisableShrink"]);const t=44,y=I`
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
`,h=I`
  0% {
    stroke-dasharray: 1px, 200px;
    stroke-dashoffset: 0;
  }

  50% {
    stroke-dasharray: 100px, 200px;
    stroke-dashoffset: -15px;
  }

  100% {
    stroke-dasharray: 1px, 200px;
    stroke-dashoffset: -126px;
  }
`,q=typeof y!="string"?D`
        animation: ${y} 1.4s linear infinite;
      `:null,B=typeof h!="string"?D`
        animation: ${h} 1.4s ease-in-out infinite;
      `:null,T=e=>{const{classes:r,variant:s,color:a,disableShrink:c}=e,l={root:["root",s,`color${n(a)}`],svg:["svg"],circle:["circle",`circle${n(s)}`,c&&"circleDisableShrink"]};return F(l,V,r)},W=k("span",{name:"MuiCircularProgress",slot:"Root",overridesResolver:(e,r)=>{const{ownerState:s}=e;return[r.root,r[s.variant],r[`color${n(s.color)}`]]}})($(({theme:e})=>({display:"inline-block",variants:[{props:{variant:"determinate"},style:{transition:e.transitions.create("transform")}},{props:{variant:"indeterminate"},style:q||{animation:`${y} 1.4s linear infinite`}},...Object.entries(e.palette).filter(A()).map(([r])=>({props:{color:r},style:{color:(e.vars||e).palette[r].main}}))]}))),Z=k("svg",{name:"MuiCircularProgress",slot:"Svg"})({display:"block"}),H=k("circle",{name:"MuiCircularProgress",slot:"Circle",overridesResolver:(e,r)=>{const{ownerState:s}=e;return[r.circle,r[`circle${n(s.variant)}`],s.disableShrink&&r.circleDisableShrink]}})($(({theme:e})=>({stroke:"currentColor",variants:[{props:{variant:"determinate"},style:{transition:e.transitions.create("stroke-dashoffset")}},{props:{variant:"indeterminate"},style:{strokeDasharray:"80px, 200px",strokeDashoffset:0}},{props:({ownerState:r})=>r.variant==="indeterminate"&&!r.disableShrink,style:B||{animation:`${h} 1.4s ease-in-out infinite`}}]}))),Q=g.forwardRef(function(r,s){const a=N({props:r,name:"MuiCircularProgress"}),{className:c,color:l="primary",disableShrink:R=!1,size:u=40,style:M,thickness:o=3.6,value:d=0,variant:v="indeterminate",...j}=a,i={...a,color:l,disableShrink:R,size:u,thickness:o,value:d,variant:v},p=T(i),f={},x={},C={};if(v==="determinate"){const P=2*Math.PI*((t-o)/2);f.strokeDasharray=P.toFixed(3),C["aria-valuenow"]=Math.round(d),f.strokeDashoffset=`${((100-d)/100*P).toFixed(3)}px`,x.transform="rotate(-90deg)"}return m.jsx(W,{className:z(p.root,c),style:{width:u,height:u,...x,...M},ownerState:i,ref:s,role:"progressbar",...C,...j,children:m.jsx(Z,{className:p.svg,ownerState:i,viewBox:`${t/2} ${t/2} ${t} ${t}`,children:m.jsx(H,{className:p.circle,style:f,ownerState:i,cx:t,cy:t,r:(t-o)/2,fill:"none",strokeWidth:o})})})});export{Q as C,L as u};
