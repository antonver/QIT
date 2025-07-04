import{R as j,r as g,d as U,g as E,e as N,j as m,s as k,f as F,h as n,i as z,l as $,o as A,w as D,x as I}from"./index-NBQ7ZjFb.js";let S=0;function G(e){const[r,s]=g.useState(e),a=e||r;return g.useEffect(()=>{r==null&&(S+=1,s(`mui-${S}`))},[r]),a}const K={...j},b=K.useId;function L(e){if(b!==void 0){const r=b();return e??r}return G(e)}function V(e){return U("MuiCircularProgress",e)}E("MuiCircularProgress",["root","determinate","indeterminate","colorPrimary","colorSecondary","svg","circle","circleDeterminate","circleIndeterminate","circleDisableShrink"]);const t=44,h=I`
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
`,y=I`
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
`,B=typeof h!="string"?D`
        animation: ${h} 1.4s linear infinite;
      `:null,T=typeof y!="string"?D`
        animation: ${y} 1.4s ease-in-out infinite;
      `:null,W=e=>{const{classes:r,variant:s,color:a,disableShrink:c}=e,l={root:["root",s,`color${n(a)}`],svg:["svg"],circle:["circle",`circle${n(s)}`,c&&"circleDisableShrink"]};return z(l,V,r)},Z=k("span",{name:"MuiCircularProgress",slot:"Root",overridesResolver:(e,r)=>{const{ownerState:s}=e;return[r.root,r[s.variant],r[`color${n(s.color)}`]]}})($(({theme:e})=>({display:"inline-block",variants:[{props:{variant:"determinate"},style:{transition:e.transitions.create("transform")}},{props:{variant:"indeterminate"},style:B||{animation:`${h} 1.4s linear infinite`}},...Object.entries(e.palette).filter(A()).map(([r])=>({props:{color:r},style:{color:(e.vars||e).palette[r].main}}))]}))),q=k("svg",{name:"MuiCircularProgress",slot:"Svg"})({display:"block"}),H=k("circle",{name:"MuiCircularProgress",slot:"Circle",overridesResolver:(e,r)=>{const{ownerState:s}=e;return[r.circle,r[`circle${n(s.variant)}`],s.disableShrink&&r.circleDisableShrink]}})($(({theme:e})=>({stroke:"currentColor",variants:[{props:{variant:"determinate"},style:{transition:e.transitions.create("stroke-dashoffset")}},{props:{variant:"indeterminate"},style:{strokeDasharray:"80px, 200px",strokeDashoffset:0}},{props:({ownerState:r})=>r.variant==="indeterminate"&&!r.disableShrink,style:T||{animation:`${y} 1.4s ease-in-out infinite`}}]}))),Q=g.forwardRef(function(r,s){const a=N({props:r,name:"MuiCircularProgress"}),{className:c,color:l="primary",disableShrink:R=!1,size:u=40,style:M,thickness:o=3.6,value:d=0,variant:x="indeterminate",...w}=a,i={...a,color:l,disableShrink:R,size:u,thickness:o,value:d,variant:x},f=W(i),p={},v={},C={};if(x==="determinate"){const P=2*Math.PI*((t-o)/2);p.strokeDasharray=P.toFixed(3),C["aria-valuenow"]=Math.round(d),p.strokeDashoffset=`${((100-d)/100*P).toFixed(3)}px`,v.transform="rotate(-90deg)"}return m.jsx(Z,{className:F(f.root,c),style:{width:u,height:u,...v,...M},ownerState:i,ref:s,role:"progressbar",...C,...w,children:m.jsx(q,{className:f.svg,ownerState:i,viewBox:`${t/2} ${t/2} ${t} ${t}`,children:m.jsx(H,{className:f.circle,style:p,ownerState:i,cx:t,cy:t,r:(t-o)/2,fill:"none",strokeWidth:o})})})});export{Q as C,L as u};
