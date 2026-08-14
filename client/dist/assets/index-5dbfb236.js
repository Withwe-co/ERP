import{r as f,b as or,a as H}from"./vendor-92c95717.js";import{f as ar,d as o,P as ce,C as Cs,a as _s,L as ir,S as Tt,b as lr,M as cr,U as ye,B as dr,H as pr,c as Ke,e as ur,g as xr,h as Es,i as zs,j as Ss,k as mr,l as hr,m as gr,A as De,D as lt,n as Ne,o as fr,p as Is,X as ve,F as Ts,I as br,q as Rs,r as be,s as Re,t as Ps,u as yr,v as vr,w as Rt,x as me,R as ct,E as jr,y as qt,T as Os,z as dt,Z as wr,G as $r,J as Pt,K as kr,N as Nr,O as Ot,Q as bt,V as Cr,W as _r,Y as Er,_ as Fs}from"./ui-79dbd375.js";import{N as zr,u as Sr,O as Ir,a as Tr,B as Rr,R as Pr,b as we,c as Vt}from"./router-83928fe1.js";import{Q as Or,a as Fr,u as je,b as Be,c as ne,d as Lr}from"./utils-18364761.js";(function(){const s=document.createElement("link").relList;if(s&&s.supports&&s.supports("modulepreload"))return;for(const a of document.querySelectorAll('link[rel="modulepreload"]'))n(a);new MutationObserver(a=>{for(const l of a)if(l.type==="childList")for(const i of l.addedNodes)i.tagName==="LINK"&&i.rel==="modulepreload"&&n(i)}).observe(document,{childList:!0,subtree:!0});function r(a){const l={};return a.integrity&&(l.integrity=a.integrity),a.referrerPolicy&&(l.referrerPolicy=a.referrerPolicy),a.crossOrigin==="use-credentials"?l.credentials="include":a.crossOrigin==="anonymous"?l.credentials="omit":l.credentials="same-origin",l}function n(a){if(a.ep)return;a.ep=!0;const l=r(a);fetch(a.href,l)}})();var Ls={exports:{}},xt={};/**
 * @license React
 * react-jsx-runtime.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */var qr=f,Mr=Symbol.for("react.element"),Dr=Symbol.for("react.fragment"),Br=Object.prototype.hasOwnProperty,Ar=qr.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentOwner,Ur={key:!0,ref:!0,__self:!0,__source:!0};function qs(e,s,r){var n,a={},l=null,i=null;r!==void 0&&(l=""+r),s.key!==void 0&&(l=""+s.key),s.ref!==void 0&&(i=s.ref);for(n in s)Br.call(s,n)&&!Ur.hasOwnProperty(n)&&(a[n]=s[n]);if(e&&e.defaultProps)for(n in s=e.defaultProps,s)a[n]===void 0&&(a[n]=s[n]);return{$$typeof:Mr,type:e,key:l,ref:i,props:a,_owner:Ar.current}}xt.Fragment=Dr;xt.jsx=qs;xt.jsxs=qs;Ls.exports=xt;var t=Ls.exports,Ft={},Jt=or;Ft.createRoot=Jt.createRoot,Ft.hydrateRoot=Jt.hydrateRoot;const Ms={colors:{primary:"#667eea",secondary:"#764ba2",success:"#10B981",warning:"#F59E0B",error:"#EF4444",info:"#3B82F6",gray:"#6B7280",background:"#f8fafc",surface:"#ffffff",text:"#1f2937",textSecondary:"#6b7280",border:"#e5e7eb"},spacing:{xs:"4px",sm:"8px",md:"16px",lg:"24px",xl:"32px"},borderRadius:{sm:"4px",md:"8px",lg:"12px"},shadows:{sm:"0 1px 2px 0 rgba(0, 0, 0, 0.05)",md:"0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",lg:"0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)"},breakpoints:{mobile:"768px",tablet:"1024px",desktop:"1200px"}},Ds=ar`
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  html {
    font-size: 16px;
    line-height: 1.5;
  }

  body {
    font-family: 'Inter', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    background: ${e=>e.theme.colors.background};
    color: ${e=>e.theme.colors.text};
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    min-height: 100vh;
  }

  /* 스크롤바 스타일 */
  ::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }

  ::-webkit-scrollbar-track {
    background: #f1f5f9;
    border-radius: ${e=>e.theme.borderRadius.sm};
  }

  ::-webkit-scrollbar-thumb {
    background: #cbd5e1;
    border-radius: ${e=>e.theme.borderRadius.sm};
  }

  ::-webkit-scrollbar-thumb:hover {
    background: #94a3b8;
  }

  /* 포커스 스타일 */
  :focus {
    outline: none;
  }

  :focus-visible {
    outline: 2px solid ${e=>e.theme.colors.primary};
    outline-offset: 2px;
  }

  /* 선택 스타일 */
  ::selection {
    background: rgba(102, 126, 234, 0.2);
    color: ${e=>e.theme.colors.text};
  }
`;function Bs(e){var s,r,n="";if(typeof e=="string"||typeof e=="number")n+=e;else if(typeof e=="object")if(Array.isArray(e))for(s=0;s<e.length;s++)e[s]&&(r=Bs(e[s]))&&(n&&(n+=" "),n+=r);else for(s in e)e[s]&&(n&&(n+=" "),n+=s);return n}function ke(){for(var e,s,r=0,n="";r<arguments.length;)(e=arguments[r++])&&(s=Bs(e))&&(n&&(n+=" "),n+=s);return n}const Qe=e=>typeof e=="number"&&!isNaN(e),Pe=e=>typeof e=="string",de=e=>typeof e=="function",at=e=>Pe(e)||de(e)?e:null,yt=e=>f.isValidElement(e)||Pe(e)||de(e)||Qe(e);function Kr(e,s,r){r===void 0&&(r=300);const{scrollHeight:n,style:a}=e;requestAnimationFrame(()=>{a.minHeight="initial",a.height=n+"px",a.transition=`all ${r}ms`,requestAnimationFrame(()=>{a.height="0",a.padding="0",a.margin="0",setTimeout(s,r)})})}function mt(e){let{enter:s,exit:r,appendPosition:n=!1,collapse:a=!0,collapseDuration:l=300}=e;return function(i){let{children:u,position:x,preventExitTransition:c,done:m,nodeRef:w,isIn:k}=i;const d=n?`${s}--${x}`:s,$=n?`${r}--${x}`:r,v=f.useRef(0);return f.useLayoutEffect(()=>{const h=w.current,C=d.split(" "),E=q=>{q.target===w.current&&(h.dispatchEvent(new Event("d")),h.removeEventListener("animationend",E),h.removeEventListener("animationcancel",E),v.current===0&&q.type!=="animationcancel"&&h.classList.remove(...C))};h.classList.add(...C),h.addEventListener("animationend",E),h.addEventListener("animationcancel",E)},[]),f.useEffect(()=>{const h=w.current,C=()=>{h.removeEventListener("animationend",C),a?Kr(h,m,l):m()};k||(c?C():(v.current=1,h.className+=` ${$}`,h.addEventListener("animationend",C)))},[k]),H.createElement(H.Fragment,null,u)}}function Xt(e,s){return e!=null?{content:e.content,containerId:e.props.containerId,id:e.props.toastId,theme:e.props.theme,type:e.props.type,data:e.props.data||{},isLoading:e.props.isLoading,icon:e.props.icon,status:s}:{}}const ue={list:new Map,emitQueue:new Map,on(e,s){return this.list.has(e)||this.list.set(e,[]),this.list.get(e).push(s),this},off(e,s){if(s){const r=this.list.get(e).filter(n=>n!==s);return this.list.set(e,r),this}return this.list.delete(e),this},cancelEmit(e){const s=this.emitQueue.get(e);return s&&(s.forEach(clearTimeout),this.emitQueue.delete(e)),this},emit(e){this.list.has(e)&&this.list.get(e).forEach(s=>{const r=setTimeout(()=>{s(...[].slice.call(arguments,1))},0);this.emitQueue.has(e)||this.emitQueue.set(e,[]),this.emitQueue.get(e).push(r)})}},Ze=e=>{let{theme:s,type:r,...n}=e;return H.createElement("svg",{viewBox:"0 0 24 24",width:"100%",height:"100%",fill:s==="colored"?"currentColor":`var(--toastify-icon-color-${r})`,...n})},vt={info:function(e){return H.createElement(Ze,{...e},H.createElement("path",{d:"M12 0a12 12 0 1012 12A12.013 12.013 0 0012 0zm.25 5a1.5 1.5 0 11-1.5 1.5 1.5 1.5 0 011.5-1.5zm2.25 13.5h-4a1 1 0 010-2h.75a.25.25 0 00.25-.25v-4.5a.25.25 0 00-.25-.25h-.75a1 1 0 010-2h1a2 2 0 012 2v4.75a.25.25 0 00.25.25h.75a1 1 0 110 2z"}))},warning:function(e){return H.createElement(Ze,{...e},H.createElement("path",{d:"M23.32 17.191L15.438 2.184C14.728.833 13.416 0 11.996 0c-1.42 0-2.733.833-3.443 2.184L.533 17.448a4.744 4.744 0 000 4.368C1.243 23.167 2.555 24 3.975 24h16.05C22.22 24 24 22.044 24 19.632c0-.904-.251-1.746-.68-2.44zm-9.622 1.46c0 1.033-.724 1.823-1.698 1.823s-1.698-.79-1.698-1.822v-.043c0-1.028.724-1.822 1.698-1.822s1.698.79 1.698 1.822v.043zm.039-12.285l-.84 8.06c-.057.581-.408.943-.897.943-.49 0-.84-.367-.896-.942l-.84-8.065c-.057-.624.25-1.095.779-1.095h1.91c.528.005.84.476.784 1.1z"}))},success:function(e){return H.createElement(Ze,{...e},H.createElement("path",{d:"M12 0a12 12 0 1012 12A12.014 12.014 0 0012 0zm6.927 8.2l-6.845 9.289a1.011 1.011 0 01-1.43.188l-4.888-3.908a1 1 0 111.25-1.562l4.076 3.261 6.227-8.451a1 1 0 111.61 1.183z"}))},error:function(e){return H.createElement(Ze,{...e},H.createElement("path",{d:"M11.983 0a12.206 12.206 0 00-8.51 3.653A11.8 11.8 0 000 12.207 11.779 11.779 0 0011.8 24h.214A12.111 12.111 0 0024 11.791 11.766 11.766 0 0011.983 0zM10.5 16.542a1.476 1.476 0 011.449-1.53h.027a1.527 1.527 0 011.523 1.47 1.475 1.475 0 01-1.449 1.53h-.027a1.529 1.529 0 01-1.523-1.47zM11 12.5v-6a1 1 0 012 0v6a1 1 0 11-2 0z"}))},spinner:function(){return H.createElement("div",{className:"Toastify__spinner"})}};function Wr(e){const[,s]=f.useReducer(d=>d+1,0),[r,n]=f.useState([]),a=f.useRef(null),l=f.useRef(new Map).current,i=d=>r.indexOf(d)!==-1,u=f.useRef({toastKey:1,displayedToast:0,count:0,queue:[],props:e,containerId:null,isToastActive:i,getToast:d=>l.get(d)}).current;function x(d){let{containerId:$}=d;const{limit:v}=u.props;!v||$&&u.containerId!==$||(u.count-=u.queue.length,u.queue=[])}function c(d){n($=>d==null?[]:$.filter(v=>v!==d))}function m(){const{toastContent:d,toastProps:$,staleId:v}=u.queue.shift();k(d,$,v)}function w(d,$){let{delay:v,staleId:h,...C}=$;if(!yt(d)||function(p){return!a.current||u.props.enableMultiContainer&&p.containerId!==u.props.containerId||l.has(p.toastId)&&p.updateId==null}(C))return;const{toastId:E,updateId:q,data:b}=C,{props:F}=u,S=()=>c(E),z=q==null;z&&u.count++;const P={...F,style:F.toastStyle,key:u.toastKey++,...Object.fromEntries(Object.entries(C).filter(p=>{let[R,U]=p;return U!=null})),toastId:E,updateId:q,data:b,closeToast:S,isIn:!1,className:at(C.className||F.toastClassName),bodyClassName:at(C.bodyClassName||F.bodyClassName),progressClassName:at(C.progressClassName||F.progressClassName),autoClose:!C.isLoading&&(W=C.autoClose,T=F.autoClose,W===!1||Qe(W)&&W>0?W:T),deleteToast(){const p=Xt(l.get(E),"removed");l.delete(E),ue.emit(4,p);const R=u.queue.length;if(u.count=E==null?u.count-u.displayedToast:u.count-1,u.count<0&&(u.count=0),R>0){const U=E==null?u.props.limit:1;if(R===1||U===1)u.displayedToast++,m();else{const M=U>R?R:U;u.displayedToast=M;for(let K=0;K<M;K++)m()}}else s()}};var W,T;P.iconOut=function(p){let{theme:R,type:U,isLoading:M,icon:K}=p,V=null;const ie={theme:R,type:U};return K===!1||(de(K)?V=K(ie):f.isValidElement(K)?V=f.cloneElement(K,ie):Pe(K)||Qe(K)?V=K:M?V=vt.spinner():(oe=>oe in vt)(U)&&(V=vt[U](ie))),V}(P),de(C.onOpen)&&(P.onOpen=C.onOpen),de(C.onClose)&&(P.onClose=C.onClose),P.closeButton=F.closeButton,C.closeButton===!1||yt(C.closeButton)?P.closeButton=C.closeButton:C.closeButton===!0&&(P.closeButton=!yt(F.closeButton)||F.closeButton);let N=d;f.isValidElement(d)&&!Pe(d.type)?N=f.cloneElement(d,{closeToast:S,toastProps:P,data:b}):de(d)&&(N=d({closeToast:S,toastProps:P,data:b})),F.limit&&F.limit>0&&u.count>F.limit&&z?u.queue.push({toastContent:N,toastProps:P,staleId:h}):Qe(v)?setTimeout(()=>{k(N,P,h)},v):k(N,P,h)}function k(d,$,v){const{toastId:h}=$;v&&l.delete(v);const C={content:d,props:$};l.set(h,C),n(E=>[...E,h].filter(q=>q!==v)),ue.emit(4,Xt(C,C.props.updateId==null?"added":"updated"))}return f.useEffect(()=>(u.containerId=e.containerId,ue.cancelEmit(3).on(0,w).on(1,d=>a.current&&c(d)).on(5,x).emit(2,u),()=>{l.clear(),ue.emit(3,u)}),[]),f.useEffect(()=>{u.props=e,u.isToastActive=i,u.displayedToast=r.length}),{getToastToRender:function(d){const $=new Map,v=Array.from(l.values());return e.newestOnTop&&v.reverse(),v.forEach(h=>{const{position:C}=h.props;$.has(C)||$.set(C,[]),$.get(C).push(h)}),Array.from($,h=>d(h[0],h[1]))},containerRef:a,isToastActive:i}}function Zt(e){return e.targetTouches&&e.targetTouches.length>=1?e.targetTouches[0].clientX:e.clientX}function es(e){return e.targetTouches&&e.targetTouches.length>=1?e.targetTouches[0].clientY:e.clientY}function Qr(e){const[s,r]=f.useState(!1),[n,a]=f.useState(!1),l=f.useRef(null),i=f.useRef({start:0,x:0,y:0,delta:0,removalDistance:0,canCloseOnClick:!0,canDrag:!1,boundingRect:null,didMove:!1}).current,u=f.useRef(e),{autoClose:x,pauseOnHover:c,closeToast:m,onClick:w,closeOnClick:k}=e;function d(b){if(e.draggable){b.nativeEvent.type==="touchstart"&&b.nativeEvent.preventDefault(),i.didMove=!1,document.addEventListener("mousemove",C),document.addEventListener("mouseup",E),document.addEventListener("touchmove",C),document.addEventListener("touchend",E);const F=l.current;i.canCloseOnClick=!0,i.canDrag=!0,i.boundingRect=F.getBoundingClientRect(),F.style.transition="",i.x=Zt(b.nativeEvent),i.y=es(b.nativeEvent),e.draggableDirection==="x"?(i.start=i.x,i.removalDistance=F.offsetWidth*(e.draggablePercent/100)):(i.start=i.y,i.removalDistance=F.offsetHeight*(e.draggablePercent===80?1.5*e.draggablePercent:e.draggablePercent/100))}}function $(b){if(i.boundingRect){const{top:F,bottom:S,left:z,right:P}=i.boundingRect;b.nativeEvent.type!=="touchend"&&e.pauseOnHover&&i.x>=z&&i.x<=P&&i.y>=F&&i.y<=S?h():v()}}function v(){r(!0)}function h(){r(!1)}function C(b){const F=l.current;i.canDrag&&F&&(i.didMove=!0,s&&h(),i.x=Zt(b),i.y=es(b),i.delta=e.draggableDirection==="x"?i.x-i.start:i.y-i.start,i.start!==i.x&&(i.canCloseOnClick=!1),F.style.transform=`translate${e.draggableDirection}(${i.delta}px)`,F.style.opacity=""+(1-Math.abs(i.delta/i.removalDistance)))}function E(){document.removeEventListener("mousemove",C),document.removeEventListener("mouseup",E),document.removeEventListener("touchmove",C),document.removeEventListener("touchend",E);const b=l.current;if(i.canDrag&&i.didMove&&b){if(i.canDrag=!1,Math.abs(i.delta)>i.removalDistance)return a(!0),void e.closeToast();b.style.transition="transform 0.2s, opacity 0.2s",b.style.transform=`translate${e.draggableDirection}(0)`,b.style.opacity="1"}}f.useEffect(()=>{u.current=e}),f.useEffect(()=>(l.current&&l.current.addEventListener("d",v,{once:!0}),de(e.onOpen)&&e.onOpen(f.isValidElement(e.children)&&e.children.props),()=>{const b=u.current;de(b.onClose)&&b.onClose(f.isValidElement(b.children)&&b.children.props)}),[]),f.useEffect(()=>(e.pauseOnFocusLoss&&(document.hasFocus()||h(),window.addEventListener("focus",v),window.addEventListener("blur",h)),()=>{e.pauseOnFocusLoss&&(window.removeEventListener("focus",v),window.removeEventListener("blur",h))}),[e.pauseOnFocusLoss]);const q={onMouseDown:d,onTouchStart:d,onMouseUp:$,onTouchEnd:$};return x&&c&&(q.onMouseEnter=h,q.onMouseLeave=v),k&&(q.onClick=b=>{w&&w(b),i.canCloseOnClick&&m()}),{playToast:v,pauseToast:h,isRunning:s,preventExitTransition:n,toastRef:l,eventHandlers:q}}function As(e){let{closeToast:s,theme:r,ariaLabel:n="close"}=e;return H.createElement("button",{className:`Toastify__close-button Toastify__close-button--${r}`,type:"button",onClick:a=>{a.stopPropagation(),s(a)},"aria-label":n},H.createElement("svg",{"aria-hidden":"true",viewBox:"0 0 14 16"},H.createElement("path",{fillRule:"evenodd",d:"M7.71 8.23l3.75 3.75-1.48 1.48-3.75-3.75-3.75 3.75L1 11.98l3.75-3.75L1 4.48 2.48 3l3.75 3.75L9.98 3l1.48 1.48-3.75 3.75z"})))}function Gr(e){let{delay:s,isRunning:r,closeToast:n,type:a="default",hide:l,className:i,style:u,controlledProgress:x,progress:c,rtl:m,isIn:w,theme:k}=e;const d=l||x&&c===0,$={...u,animationDuration:`${s}ms`,animationPlayState:r?"running":"paused",opacity:d?0:1};x&&($.transform=`scaleX(${c})`);const v=ke("Toastify__progress-bar",x?"Toastify__progress-bar--controlled":"Toastify__progress-bar--animated",`Toastify__progress-bar-theme--${k}`,`Toastify__progress-bar--${a}`,{"Toastify__progress-bar--rtl":m}),h=de(i)?i({rtl:m,type:a,defaultClassName:v}):ke(v,i);return H.createElement("div",{role:"progressbar","aria-hidden":d?"true":"false","aria-label":"notification timer",className:h,style:$,[x&&c>=1?"onTransitionEnd":"onAnimationEnd"]:x&&c<1?null:()=>{w&&n()}})}const Hr=e=>{const{isRunning:s,preventExitTransition:r,toastRef:n,eventHandlers:a}=Qr(e),{closeButton:l,children:i,autoClose:u,onClick:x,type:c,hideProgressBar:m,closeToast:w,transition:k,position:d,className:$,style:v,bodyClassName:h,bodyStyle:C,progressClassName:E,progressStyle:q,updateId:b,role:F,progress:S,rtl:z,toastId:P,deleteToast:W,isIn:T,isLoading:N,iconOut:p,closeOnClick:R,theme:U}=e,M=ke("Toastify__toast",`Toastify__toast-theme--${U}`,`Toastify__toast--${c}`,{"Toastify__toast--rtl":z},{"Toastify__toast--close-on-click":R}),K=de($)?$({rtl:z,position:d,type:c,defaultClassName:M}):ke(M,$),V=!!S||!u,ie={closeToast:w,type:c,theme:U};let oe=null;return l===!1||(oe=de(l)?l(ie):f.isValidElement(l)?f.cloneElement(l,ie):As(ie)),H.createElement(k,{isIn:T,done:W,position:d,preventExitTransition:r,nodeRef:n},H.createElement("div",{id:P,onClick:x,className:K,...a,style:v,ref:n},H.createElement("div",{...T&&{role:F},className:de(h)?h({type:c}):ke("Toastify__toast-body",h),style:C},p!=null&&H.createElement("div",{className:ke("Toastify__toast-icon",{"Toastify--animate-icon Toastify__zoom-enter":!N})},p),H.createElement("div",null,i)),oe,H.createElement(Gr,{...b&&!V?{key:`pb-${b}`}:{},rtl:z,theme:U,delay:u,isRunning:s,isIn:T,closeToast:w,hide:m,type:c,style:q,className:E,controlledProgress:V,progress:S||0})))},ht=function(e,s){return s===void 0&&(s=!1),{enter:`Toastify--animate Toastify__${e}-enter`,exit:`Toastify--animate Toastify__${e}-exit`,appendPosition:s}},Yr=mt(ht("bounce",!0));mt(ht("slide",!0));mt(ht("zoom"));mt(ht("flip"));const Lt=f.forwardRef((e,s)=>{const{getToastToRender:r,containerRef:n,isToastActive:a}=Wr(e),{className:l,style:i,rtl:u,containerId:x}=e;function c(m){const w=ke("Toastify__toast-container",`Toastify__toast-container--${m}`,{"Toastify__toast-container--rtl":u});return de(l)?l({position:m,rtl:u,defaultClassName:w}):ke(w,at(l))}return f.useEffect(()=>{s&&(s.current=n.current)},[]),H.createElement("div",{ref:n,className:"Toastify",id:x},r((m,w)=>{const k=w.length?{...i}:{...i,pointerEvents:"none"};return H.createElement("div",{className:c(m),style:k,key:`container-${m}`},w.map((d,$)=>{let{content:v,props:h}=d;return H.createElement(Hr,{...h,isIn:a(h.toastId),style:{...h.style,"--nth":$+1,"--len":w.length},key:`toast-${h.key}`},v)}))}))});Lt.displayName="ToastContainer",Lt.defaultProps={position:"top-right",transition:Yr,autoClose:5e3,closeButton:As,pauseOnHover:!0,pauseOnFocusLoss:!0,closeOnClick:!0,draggable:!0,draggablePercent:80,draggableDirection:"x",role:"alert",theme:"light"};let jt,Se=new Map,We=[],Vr=1;function Us(){return""+Vr++}function Jr(e){return e&&(Pe(e.toastId)||Qe(e.toastId))?e.toastId:Us()}function Ge(e,s){return Se.size>0?ue.emit(0,e,s):We.push({content:e,options:s}),s.toastId}function pt(e,s){return{...s,type:s&&s.type||e,toastId:Jr(s)}}function et(e){return(s,r)=>Ge(s,pt(e,r))}function _(e,s){return Ge(e,pt("default",s))}_.loading=(e,s)=>Ge(e,pt("default",{isLoading:!0,autoClose:!1,closeOnClick:!1,closeButton:!1,draggable:!1,...s})),_.promise=function(e,s,r){let n,{pending:a,error:l,success:i}=s;a&&(n=Pe(a)?_.loading(a,r):_.loading(a.render,{...r,...a}));const u={isLoading:null,autoClose:null,closeOnClick:null,closeButton:null,draggable:null},x=(m,w,k)=>{if(w==null)return void _.dismiss(n);const d={type:m,...u,...r,data:k},$=Pe(w)?{render:w}:w;return n?_.update(n,{...d,...$}):_($.render,{...d,...$}),k},c=de(e)?e():e;return c.then(m=>x("success",i,m)).catch(m=>x("error",l,m)),c},_.success=et("success"),_.info=et("info"),_.error=et("error"),_.warning=et("warning"),_.warn=_.warning,_.dark=(e,s)=>Ge(e,pt("default",{theme:"dark",...s})),_.dismiss=e=>{Se.size>0?ue.emit(1,e):We=We.filter(s=>e!=null&&s.options.toastId!==e)},_.clearWaitingQueue=function(e){return e===void 0&&(e={}),ue.emit(5,e)},_.isActive=e=>{let s=!1;return Se.forEach(r=>{r.isToastActive&&r.isToastActive(e)&&(s=!0)}),s},_.update=function(e,s){s===void 0&&(s={}),setTimeout(()=>{const r=function(n,a){let{containerId:l}=a;const i=Se.get(l||jt);return i&&i.getToast(n)}(e,s);if(r){const{props:n,content:a}=r,l={delay:100,...n,...s,toastId:s.toastId||e,updateId:Us()};l.toastId!==e&&(l.staleId=e);const i=l.render||a;delete l.render,Ge(i,l)}},0)},_.done=e=>{_.update(e,{progress:1})},_.onChange=e=>(ue.on(4,e),()=>{ue.off(4,e)}),_.POSITION={TOP_LEFT:"top-left",TOP_RIGHT:"top-right",TOP_CENTER:"top-center",BOTTOM_LEFT:"bottom-left",BOTTOM_RIGHT:"bottom-right",BOTTOM_CENTER:"bottom-center"},_.TYPE={INFO:"info",SUCCESS:"success",WARNING:"warning",ERROR:"error",DEFAULT:"default"},ue.on(2,e=>{jt=e.containerId||e,Se.set(jt,e),We.forEach(s=>{ue.emit(0,s.content,s.options)}),We=[]}).on(3,e=>{Se.delete(e.containerId||e),Se.size===0&&ue.off(0).off(1).off(5)});const Xr=new Or({defaultOptions:{queries:{refetchOnWindowFocus:!1,retry:1,staleTime:5*60*1e3,suspense:!1}}}),Ks="http://211.197.16.248:8000/api/v1",ee=Fr.create({baseURL:Ks,timeout:12e4,headers:{"Content-Type":"application/json"}});ee.interceptors.response.use(e=>e,e=>(console.error("API Error:",e),Promise.reject(e)));const B={get:async(e,s)=>(await ee.get(e,{params:s})).data,post:async(e,s)=>(await ee.post(e,s)).data,put:async(e,s)=>(await ee.put(e,s)).data,delete:async e=>(await ee.delete(e)).data,download:async(e,s)=>(await ee.get(e,{params:s,responseType:"blob"})).data},xe={getRequests:async e=>{const{page:s,limit:r,dateFrom:n,dateTo:a,...l}=e;try{const i={skip:(s-1)*r,limit:r,date_from:n,date_to:a,...Object.fromEntries(Object.entries(l).filter(([x,c])=>c!==void 0&&c!==""))};return{data:await B.get("/purchase-requests/",i)}}catch(i){throw console.error("구매 요청 조회 실패:",i),i}},createRequest:async e=>{try{return await B.post("/purchase-requests/",e)}catch(s){throw console.error("구매 요청 생성 실패:",s),s}},updateRequest:async(e,s)=>{var r;try{return await B.put(`/purchase-requests/${e}`,s)}catch(n){throw console.error("API 오류 상세:",(r=n.response)==null?void 0:r.data),n}},deleteRequest:async e=>{var s,r,n,a,l;try{console.log(`🗑️ 구매 요청 삭제 API 호출: ID=${e}`),console.log(`📍 요청 URL: ${Ks}/purchase-requests/${e}`);const i=await B.delete(`/purchase-requests/${e}`);return console.log("✅ 삭제 API 성공 응답:",i),i.success!==void 0?i:{success:!0,message:"구매 요청이 삭제되었습니다.",deleted_id:e,deleted_item:"구매 요청",method:"delete"}}catch(i){throw console.error("❌ 삭제 API 실패:",i),console.error("❌ 에러 상세 정보:",{status:(s=i.response)==null?void 0:s.status,statusText:(r=i.response)==null?void 0:r.statusText,data:(n=i.response)==null?void 0:n.data,url:(a=i.config)==null?void 0:a.url,method:(l=i.config)==null?void 0:l.method}),i}},getStats:async()=>{try{return{data:await B.get("/purchase-requests/stats")}}catch(e){throw console.error("구매 요청 통계 조회 실패:",e),e}},uploadExcel:async e=>{var s;try{if(console.log("📤 구매요청 Excel 업로드 시작:",e.name),!e)throw new Error("파일이 선택되지 않았습니다.");if(!e.name.match(/\.(xlsx|xls)$/i))throw new Error("Excel 파일만 업로드 가능합니다.");const r=10*1024*1024;if(e.size>r)throw new Error("파일 크기는 10MB를 초과할 수 없습니다.");const n=new FormData;n.append("file",e);const a=await ee.post("/purchase-requests/bulk-upload",n,{headers:{"Content-Type":"multipart/form-data"},timeout:3e5});return console.log("✅ 구매요청 업로드 성공:",a.data),{success:a.data.success||!0,created_count:a.data.created_count||0,created_items:a.data.request_numbers||[],total_processed:a.data.total_processed||0,errors:a.data.errors||[],message:a.data.message||"업로드가 완료되었습니다."}}catch(r){throw console.error("구매요청 Excel 업로드 실패:",r),(s=r.response)!=null&&s.data?new Error(r.response.data.detail||"업로드 중 오류가 발생했습니다."):new Error(r.message||"업로드 중 알 수 없는 오류가 발생했습니다.")}},downloadTemplate:async()=>{try{console.log("📋 구매요청 템플릿 다운로드 시작...");const e=await ee.get("/purchase-requests/template/download",{responseType:"blob",timeout:6e4});if(!e.data||e.data.size===0)throw new Error("빈 템플릿 파일이 반환되었습니다.");const s=e.data,r=window.URL.createObjectURL(s),n=document.createElement("a");n.href=r;const a=new Date().toISOString().split("T")[0].replace(/-/g,"");n.download=`구매요청_템플릿_${a}.xlsx`,document.body.appendChild(n),n.click(),document.body.removeChild(n),window.URL.revokeObjectURL(r),console.log("✅ 구매요청 템플릿 다운로드 완료")}catch(e){throw console.error("❌ 구매요청 템플릿 다운로드 실패:",e),new Error("템플릿 다운로드 중 오류가 발생했습니다.")}},exportRequests:async e=>{var s,r;try{console.log("📊 구매요청 Excel 내보내기 시작...");const n=e?{search:e.search,status:e.status,urgency:e.urgency,department:e.department,category:e.category,date_from:e.dateFrom,date_to:e.dateTo}:{},a=Object.fromEntries(Object.entries(n).filter(([m,w])=>w!=null));console.log("📋 내보내기 파라미터:",a);const l=await ee.get("/purchase-requests/export/excel",{params:a,responseType:"blob",timeout:3e5});if(!l.data||l.data.size===0)throw new Error("빈 파일이 반환되었습니다.");console.log("📥 파일 다운로드 완료, 크기:",l.data.size);const i=l.data,u=window.URL.createObjectURL(i),x=document.createElement("a");x.href=u;const c=new Date().toISOString().split("T")[0];x.download=`구매요청목록_${c}.xlsx`,document.body.appendChild(x),x.click(),document.body.removeChild(x),window.URL.revokeObjectURL(u),console.log("✅ 구매요청 Excel 내보내기 완료")}catch(n){throw console.error("❌ 구매요청 Excel 내보내기 실패:",n),((s=n.response)==null?void 0:s.status)===404?new Error("내보낼 데이터가 없습니다."):((r=n.response)==null?void 0:r.status)===500?new Error("서버에서 파일 생성 중 오류가 발생했습니다."):n.code==="ECONNABORTED"?new Error("파일 생성 시간이 너무 오래 걸립니다. 데이터를 줄여서 다시 시도해주세요."):new Error(n.message||"내보내기 중 알 수 없는 오류가 발생했습니다.")}},approveRequest:async e=>{try{const{requestId:s,...r}=e;return await B.post(`/purchase-requests/${s}/approve`,r)}catch(s){throw console.error("승인 처리 실패:",s),s}},getPendingRequests:async(e=50)=>{try{return await B.get("/purchase-requests/pending",{limit:e})}catch(s){throw console.error("대기 중 요청 조회 실패:",s),s}},getUrgentRequests:async(e=30)=>{try{return await B.get("/purchase-requests/urgent",{limit:e})}catch(s){throw console.error("긴급 요청 조회 실패:",s),s}},getRecentRequests:async(e=7,s=50)=>{try{return await B.get("/purchase-requests/recent",{days:e,limit:s})}catch(r){throw console.error("최근 요청 조회 실패:",r),r}},completePurchase:async(e,s)=>{try{return await B.post(`/purchase-requests/${e}/complete`,s)}catch(r){throw console.error("구매 완료 처리 실패:",r),r}},createInventoryFromPurchase:async(e,s)=>{try{return await B.post("/inventory/from-purchase-request",{purchase_request_id:e,...s})}catch(r){throw console.error("구매 요청에서 품목 생성 실패:",r),r}}},ut={getItems:async(e=1,s=20,r={},n)=>{try{const a={skip:(e-1)*s,limit:s,...r,sort_by:(n==null?void 0:n.sort_by)||"item_code",sort_order:(n==null?void 0:n.sort_order)||"desc"};return console.log("📋 API 요청 파라미터:",a),{data:await B.get("/inventory/",a)}}catch(a){throw console.error("재고 조회 실패:",a),a}},getStats:async()=>{try{return{data:await B.get("/inventory/stats")}}catch(e){return console.error("재고 통계 조회 실패:",e),{data:{total_items:0,low_stock_items:0,out_of_stock_items:0,total_value:0}}}},createItem:async e=>{try{return await B.post("/inventory",e)}catch(s){throw console.error("품목 생성 실패:",s),s}},updateItem:async(e,s)=>{try{return await B.put(`/inventory/${e}`,s)}catch(r){throw console.error("재고 수정 실패:",r),r}},deleteItem:async e=>{try{return await B.delete(`/inventory/${e}`)}catch(s){throw console.error("재고 삭제 실패:",s),s}},exportData:async e=>{var s,r;try{const n={include_receipts:(e==null?void 0:e.include_receipts)||!1,include_images:(e==null?void 0:e.include_images)||!1,search:e==null?void 0:e.search,category:e==null?void 0:e.category,brand:e==null?void 0:e.brand,supplier_name:e==null?void 0:e.supplier_name,is_active:e==null?void 0:e.is_active},a=Object.fromEntries(Object.entries(n).filter(([k,d])=>d!=null)),l=await ee.get("/inventory/export",{params:a,responseType:"blob"});if(!l.data||l.data.size===0)throw new Error("빈 파일이 반환되었습니다.");const i=l.data,u=window.URL.createObjectURL(i),x=document.createElement("a");x.href=u;const c=new Date,m=c.toISOString().split("T")[0].replace(/-/g,""),w=c.toTimeString().slice(0,8).replace(/:/g,"");x.download=`품목목록_${m}_${w}.xlsx`,document.body.appendChild(x),x.click(),document.body.removeChild(x),window.URL.revokeObjectURL(u),console.log("✅ Excel 내보내기 완료")}catch(n){throw console.error("❌ Excel 내보내기 실패:",n),((s=n.response)==null?void 0:s.status)===404?new Error("내보낼 데이터가 없습니다."):((r=n.response)==null?void 0:r.status)===500?new Error("서버에서 파일 생성 중 오류가 발생했습니다."):n.code==="ECONNABORTED"?new Error("파일 생성 시간이 너무 오래 걸립니다. 데이터를 줄여서 다시 시도해주세요."):new Error(n.message||"내보내기 중 알 수 없는 오류가 발생했습니다.")}},getItem:async e=>{try{return await B.get(`/inventory/${e}`)}catch(s){throw console.error("품목 상세 조회 실패:",s),s}},getItemByCode:async e=>{try{return await B.get(`/inventory/code/${e}`)}catch(s){throw console.error("품목 코드 조회 실패:",s),s}},addReceipt:async(e,s)=>{try{return await B.post(`/inventory/${e}/receipts`,s)}catch(r){throw console.error("수령 추가 실패:",r),r}},updateReceipt:async(e,s,r)=>{try{return await B.put(`/inventory/${e}/receipts/${s}`,r)}catch(n){throw console.error("수령 수정 실패:",n),n}},deleteReceipt:async(e,s)=>{try{return await B.delete(`/inventory/${e}/receipts/${s}`)}catch(r){throw console.error("수령 삭제 실패:",r),r}},updateStock:async(e,s)=>{try{return await B.patch(`/inventory/${e}/stock?quantity=${s}`)}catch(r){throw console.error("재고 수량 업데이트 실패:",r),r}},getCategories:async()=>{try{return await B.get("/inventory/categories")}catch(e){throw console.error("카테고리 조회 실패:",e),e}},getLowStockItems:async(e=0,s=100)=>{try{return await B.get("/inventory/low-stock",{skip:e,limit:s})}catch(r){throw console.error("재고 부족 품목 조회 실패:",r),r}},getOutOfStockItems:async(e=0,s=100)=>{try{return await B.get("/inventory/out-of-stock",{skip:e,limit:s})}catch(r){throw console.error("재고 없는 품목 조회 실패:",r),r}},uploadExcel:async e=>{var s;try{if(console.log("📤 Excel 업로드 시작:",e.name,e.size),!e)throw new Error("파일이 선택되지 않았습니다.");if(!e.name.match(/\.(xlsx|xls)$/i))throw new Error("Excel 파일만 업로드 가능합니다 (.xlsx, .xls)");const r=10*1024*1024;if(e.size>r)throw new Error("파일 크기는 10MB를 초과할 수 없습니다.");const n=new FormData;n.append("file",e),console.log("🚀 서버에 업로드 요청...");const a=await ee.post("/inventory/bulk-upload",n,{headers:{"Content-Type":"multipart/form-data"},timeout:3e5});return console.log("✅ 업로드 성공:",a.data),{success:a.data.success||!0,created_count:a.data.created_count||0,updated_count:a.data.updated_count||0,created_items:a.data.created_items||[],updated_items:a.data.updated_items||[],total_processed:a.data.total_processed||0,errors:a.data.errors||[],message:a.data.message||"업로드가 완료되었습니다."}}catch(r){if(console.error("❌ Excel 업로드 실패:",r),(s=r.response)!=null&&s.data){const n=r.response.data;throw new Error(n.detail||n.message||"업로드 중 오류가 발생했습니다.")}else throw new Error(r.message||"업로드 중 알 수 없는 오류가 발생했습니다.")}},downloadTemplate:async()=>{var e,s;try{console.log("📋 템플릿 다운로드 시작...");const r=await ee.get("/inventory/template/download",{responseType:"blob",timeout:6e4});if(!r.data||r.data.size===0)throw new Error("빈 템플릿 파일이 반환되었습니다.");console.log("📥 템플릿 파일 다운로드 완료, 크기:",r.data.size);const n=r.data,a=window.URL.createObjectURL(n),l=document.createElement("a");l.href=a;const i=new Date().toISOString().split("T")[0].replace(/-/g,"");l.download=`품목등록_템플릿_${i}.xlsx`,document.body.appendChild(l),l.click(),document.body.removeChild(l),window.URL.revokeObjectURL(a),console.log("✅ 템플릿 다운로드 완료")}catch(r){throw console.error("❌ 템플릿 다운로드 실패:",r),((e=r.response)==null?void 0:e.status)===404?new Error("템플릿 파일을 찾을 수 없습니다."):((s=r.response)==null?void 0:s.status)===500?new Error("서버에서 템플릿 생성 중 오류가 발생했습니다."):new Error("템플릿 다운로드 중 오류가 발생했습니다.")}},uploadImage:async(e,s,r="general")=>{try{const n=new FormData;return n.append("file",s),n.append("image_type",r),(await ee.post(`/inventory/${e}/images`,n,{headers:{"Content-Type":"multipart/form-data"}})).data}catch(n){throw console.error("이미지 업로드 실패:",n),n}},deleteImage:async(e,s)=>{try{return await B.delete(`/inventory/${e}/images/${s}`)}catch(r){throw console.error("이미지 삭제 실패:",r),r}},transferItem:async(e,s)=>{try{return await B.post(`/inventory/${e}/transfer`,s)}catch(r){throw console.error("품목 이동 실패:",r),r}},getUsageLogs:async(e,s=1,r=20)=>{try{const n={skip:(s-1)*r,limit:r};return{data:await B.get(`/inventory/${e}/usage-logs`,n)}}catch(n){throw console.error("사용 이력 조회 실패:",n),n}},addUsageLog:async(e,s)=>{try{return await B.post(`/inventory/${e}/usage-logs`,s)}catch(r){throw console.error("사용 이력 추가 실패:",r),r}},generateQRCode:async(e,s)=>{try{return await B.post(`/inventory/${e}/qr-code`,s)}catch(r){throw console.error("QR 코드 생성 실패:",r),r}},getDashboardData:async()=>{try{return await B.get("/inventory/dashboard")}catch(e){throw console.error("대시보드 데이터 조회 실패:",e),e}},completeReceiptWithImages:async(e,s,r)=>{var n,a;try{const l=await B.post(`/inventory/${e}/receipts`,s);if(r&&r.length>0){const i=r.map(async(c,m)=>{console.log(`${x.length}개 이미지 업로드 완료`);const w=new FormData;return w.append("file",c),w.append("image_type","receipt"),ee.post(`/inventory/${e}/images`,w,{headers:{"Content-Type":"multipart/form-data"}})}),x=(await Promise.allSettled(i)).filter(c=>c.status==="fulfilled").map(c=>c.value.data);console.log(`${x.length}개 이미지 업로드 완료`)}else console.log("이미지 없음: 업로드 스킵");return l}catch(l){throw console.log("오류 상세:",(a=(n=l.response)==null?void 0:n.data)==null?void 0:a.detail),console.error("수령 완료 처리 실패:",l),l}},updateItemWithImages:async(e,s,r)=>{try{const n=await B.put(`/inventory/${e}`,s);if(r&&r.length>0)for(const a of r){const l=new FormData;l.append("file",a),l.append("image_type","general"),await ee.post(`/inventory/${e}/images`,l,{headers:{"Content-Type":"multipart/form-data"}})}return n}catch(n){throw console.error("품목 업데이트 실패:",n),n}},uploadTransactionDocument:async(e,s)=>{var r;try{if(console.log(`거래명세서 업로드 시작: 품목 ID=${e}, 파일명=${s.name}`),!s)throw new Error("파일이 선택되지 않았습니다.");if(!["application/pdf","image/jpeg","image/png","image/jpg","application/vnd.openxmlformats-officedocument.spreadsheetml.sheet","application/vnd.ms-excel"].includes(s.type))throw new Error("PDF, 이미지 파일 또는 Excel 파일만 업로드 가능합니다.");const a=10*1024*1024;if(s.size>a)throw new Error("파일 크기는 10MB를 초과할 수 없습니다.");const l=new FormData;l.append("file",s);const i=await ee.post(`/inventory/${e}/transaction-document`,l,{headers:{"Content-Type":"multipart/form-data"},timeout:18e4});return console.log("거래명세서 업로드 성공:",i.data),{success:i.data.success||!0,message:i.data.message||"거래명세서가 업로드되었습니다.",document_url:i.data.document_url,uploaded_by:i.data.uploaded_by,upload_date:i.data.upload_date}}catch(n){throw console.error("거래명세서 업로드 실패:",n),(r=n.response)!=null&&r.data?new Error(n.response.data.detail||n.response.data.message||"업로드 중 오류가 발생했습니다."):new Error(n.message||"업로드 중 알 수 없는 오류가 발생했습니다.")}},checkTransactionDocumentStatus:async e=>{try{return await B.get(`/inventory/${e}/transaction-document/status`)}catch(s){return console.error("거래명세서 상태 확인 실패:",s),{has_document:!1}}},deleteTransactionDocument:async e=>{try{return await B.delete(`/inventory/${e}/transaction-document`)}catch(s){throw console.error("거래명세서 삭제 실패:",s),s}}},Ws={getReceipts:async(e=1,s=20,r={})=>{console.warn("receiptApi.getReceipts는 deprecated입니다. inventoryApi를 사용하세요.");try{const n=[{id:1,receiptNumber:"REC-001",itemName:"노트북",expectedQuantity:5,receivedQuantity:5,receiverName:"김철수",department:"개발팀",receivedDate:new Date().toISOString()},{id:2,receiptNumber:"REC-002",itemName:"프린터",expectedQuantity:2,receivedQuantity:2,receiverName:"이영희",department:"총무부",receivedDate:new Date(Date.now()-864e5).toISOString()}];return{data:{items:n.slice((e-1)*s,e*s),total:n.length,pages:Math.ceil(n.length/s),page:e,size:s}}}catch(n){throw console.error("수령 내역 조회 실패:",n),n}},createReceipt:async e=>{throw console.warn("receiptApi.createReceipt는 deprecated입니다. inventoryApi.addReceipt를 사용하세요."),new Error("이 API는 더 이상 지원되지 않습니다. inventoryApi.addReceipt를 사용하세요.")},updateReceipt:async(e,s)=>{throw console.warn("receiptApi.updateReceipt는 deprecated입니다. inventoryApi.updateReceipt를 사용하세요."),new Error("이 API는 더 이상 지원되지 않                                                     습니다. inventoryApi.updateReceipt를 사용하세요.")},deleteReceipt:async e=>{throw console.warn("receiptApi.deleteReceipt는 deprecated입니다. inventoryApi.deleteReceipt를 사용하세요."),new Error("이 API는 더 이상 지원되지 않습니다. inventoryApi.deleteReceipt를 사용하세요.")},exportReceipts:async()=>{throw console.warn("receiptApi.exportReceipts는 deprecated입니다. inventoryApi.exportData를 사용하세요."),new Error("이 API는 더 이상 지원되지 않습니다. inventoryApi.exportData를 사용하세요.")}},it={uploadExcel:async e=>{try{const s=new FormData;s.append("file",e);const r=await ee.post("/upload/excel",s,{headers:{"Content-Type":"multipart/form-data"},timeout:12e4});return{success:!0,data:{itemCount:r.data.created_count||0},message:r.data.message||"업로드가 완료되었습니다."}}catch(s){throw console.error("파일 업로드 실패:",s),s}},getUploadInfo:async()=>{try{return{data:await B.get("/upload/")}}catch(e){throw console.error("업로드 정보 조회 실패:",e),e}},getTemplate:async()=>{try{return{data:await B.get("/upload/template")}}catch(e){throw console.error("템플릿 정보 조회 실패:",e),e}},downloadTemplate:async()=>{try{console.log("📋 템플릿 다운로드 시작...");const e=await ee.get("/inventory/template/download",{responseType:"blob",timeout:6e4});if(!e.data||e.data.size===0)throw new Error("빈 템플릿 파일이 반환되었습니다.");console.log("📥 템플릿 파일 다운로드 완료");const s=e.data,r=window.URL.createObjectURL(s),n=document.createElement("a");n.href=r;const a=new Date().toISOString().split("T")[0].replace(/-/g,"");n.download=`품목등록_템플릿_${a}.xlsx`,document.body.appendChild(n),n.click(),document.body.removeChild(n),window.URL.revokeObjectURL(r),console.log("✅ 템플릿 다운로드 완료")}catch(e){throw console.error("❌ 템플릿 다운로드 실패:",e),new Error("템플릿 다운로드 중 오류가 발생했습니다.")}}},Qs={getStats:async()=>{try{return{data:await B.get("/dashboard/stats")}}catch(e){throw console.error("대시보드 통계 조회 실패:",e),e}},getDashboard:async()=>{try{return{data:await B.get("/dashboard/")}}catch(e){throw console.error("대시보드 조회 실패:",e),e}}},Zr={testConnection:async()=>{try{return await B.get("/dashboard/"),!0}catch(e){return console.error("API 연결 테스트 실패:",e),!1}},checkHealth:async()=>{try{return(await ee.get("/health")).data}catch(e){throw console.error("헬스체크 실패:",e),e}}},$e={dashboard:Qs,purchase:xe,inventory:ut,receipt:Ws,upload:it,utils:Zr},en=o.div`
  position: fixed;
  left: 0;
  top: 0;
  height: 100vh;
  width: ${e=>e.isOpen?"240px":"60px"};
  background: linear-gradient(180deg, #2c3e50 0%, #34495e 100%);
  color: white;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 1000;
  box-shadow: 2px 0 10px rgba(0, 0, 0, 0.1);
`,tn=o.div`
  padding: ${e=>e.isOpen?"16px":"16px 8px"};
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: ${e=>e.isOpen?"space-between":"center"};
  min-height: 60px;
  position: relative;
`,sn=o.div`
  display: flex;
  align-items: center;
  gap: ${e=>e.isOpen?"8px":"0"};
  
  .logo-icon {
    min-width: 28px;
    width: 28px;
    height: 28px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 6px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }
  
  .logo-text {
    font-size: ${e=>e.isOpen?"1.1rem":"0"};
    font-weight: 600;
    margin: 0;
    opacity: ${e=>e.isOpen?"1":"0"};
    transition: all 0.3s ease;
    white-space: nowrap;
    overflow: hidden;
  }
`,rn=o.button`
  position: absolute;
  right: ${e=>e.isOpen?"8px":"-15px"};
  top: 50%;
  transform: translateY(-50%);
  background: ${e=>e.isOpen?"rgba(255, 255, 255, 0.1)":"#2c3e50"};
  border: ${e=>e.isOpen?"none":"1px solid rgba(255, 255, 255, 0.2)"};
  color: white;
  cursor: pointer;
  padding: 4px;
  border-radius: 50%;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  z-index: 1001;
  
  &:hover {
    background: rgba(255, 255, 255, 0.2);
  }
`,nn=o.nav`
  flex: 1;
  padding: 12px 0;
  overflow-y: auto;
  
  &::-webkit-scrollbar {
    width: 3px;
  }
  
  &::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.1);
  }
  
  &::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.3);
    border-radius: 2px;
  }
`,wt=o.div`
  margin-bottom: 20px;
  
  &:last-child {
    margin-bottom: 0;
  }
`,$t=o.div`
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: rgba(255, 255, 255, 0.5);
  padding: 0 ${e=>e.isOpen?"16px":"12px"};
  margin-bottom: 8px;
  opacity: ${e=>e.isOpen?"1":"0"};
  height: ${e=>e.isOpen?"auto":"0"};
  overflow: hidden;
  transition: all 0.3s ease;
`,kt=o.ul`
  list-style: none;
  margin: 0;
  padding: 0;
`,on=o.li`
  margin-bottom: 2px;
`,an=o(zr)`
  display: flex;
  align-items: center;
  padding: ${e=>(e.isOpen,"10px 16px")};
  color: rgba(255, 255, 255, 0.8);
  text-decoration: none;
  transition: all 0.3s ease;
  position: relative;
  border-left: 3px solid transparent;
  
  &:hover {
    background: rgba(255, 255, 255, 0.1);
    color: white;
    border-left-color: #3498db;
  }
  
  &.active {
    background: rgba(255, 255, 255, 0.15);
    color: white;
    border-left-color: #3498db;
    
    &::before {
      content: '';
      position: absolute;
      right: 0;
      top: 0;
      bottom: 0;
      width: 3px;
      background: #3498db;
    }
  }
  
  .nav-icon {
    min-width: 18px;
    width: 18px;
    height: 18px;
    margin-right: ${e=>e.isOpen?"12px":"0"};
    transition: margin 0.3s ease;
    flex-shrink: 0;
  }
  
  .nav-text {
    font-size: 0.9rem;
    font-weight: 500;
    opacity: ${e=>e.isOpen?"1":"0"};
    transform: translateX(${e=>e.isOpen?"0":"-10px"});
    transition: all 0.3s ease;
    white-space: nowrap;
    overflow: hidden;
  }
`,ln=o.span`
  margin-left: auto;
  background: linear-gradient(135deg, #e74c3c, #c0392b);
  color: white;
  font-size: 0.7rem;
  font-weight: 600;
  padding: 2px 6px;
  border-radius: 10px;
  min-width: 18px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  opacity: ${e=>e.isOpen?"1":"0"};
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(231, 76, 60, 0.3);
  
  /* 펄스 애니메이션 */
  animation: ${e=>e.count>0?"pulse 2s infinite":"none"};
  
  @keyframes pulse {
    0%, 100% {
      transform: scale(1);
      opacity: ${e=>e.isOpen?"1":"0"};
    }
    50% {
      transform: scale(1.1);
      opacity: ${e=>e.isOpen?"0.8":"0"};
    }
  }
`,cn=o.div`
  position: absolute;
  top: 8px;
  right: 8px;
  width: 8px;
  height: 8px;
  background: #e74c3c;
  border-radius: 50%;
  opacity: ${e=>e.show?"1":"0"};
  transition: opacity 0.3s ease;
  animation: ${e=>e.show?"pulse-dot 2s infinite":"none"};
  
  @keyframes pulse-dot {
    0%, 100% {
      transform: scale(1);
      opacity: 1;
    }
    50% {
      transform: scale(1.3);
      opacity: 0.7;
    }
  }
`,dn=o.div`
  position: absolute;
  left: 100%;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 6px 10px;
  border-radius: 4px;
  font-size: 0.8rem;
  white-space: nowrap;
  margin-left: 8px;
  opacity: ${e=>e.show?"1":"0"};
  visibility: ${e=>e.show?"visible":"hidden"};
  transition: all 0.3s ease;
  z-index: 1000;
  pointer-events: none;
  
  &::before {
    content: '';
    position: absolute;
    right: 100%;
    top: 50%;
    transform: translateY(-50%);
    border: 4px solid transparent;
    border-right-color: rgba(0, 0, 0, 0.8);
  }
`,pn=o.div`
  position: relative;
  
  &:hover .tooltip {
    opacity: 1;
    visibility: visible;
  }
`,un=o.div`
  position: absolute;
  bottom: 4px;
  right: 4px;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${e=>e.connected?"#10b981":"#ef4444"};
  opacity: 0.6;
  transition: all 0.3s ease;
`,xn=()=>{const[e,s]=f.useState(!1),{data:r,isError:n}=je({queryKey:["purchase-requests-pending-count"],queryFn:async()=>{try{console.log("🔍 구매 요청 개수 조회 시도...");const a=await xe.getRequests({page:1,limit:100});return console.log("✅ API 연결 성공:",a),s(!0),a.data.items.filter(i=>i.status!=="COMPLETED"&&i.status!=="CANCELLED").length}catch(a){return console.warn("⚠️ API 연결 실패, 샘플 모드로 전환:",a.message),s(!1),3}},refetchInterval:e?3e4:3e5,staleTime:15e3,retry:1,retryDelay:3e3});return{pendingCount:r||0,apiConnected:e,hasError:n}},mn=({isOpen:e,onToggle:s})=>{const r=Sr(),{pendingCount:n,apiConnected:a}=xn(),l=[{path:"/dashboard",label:"대시보드",icon:ir},{path:"/purchase-requests",label:"구매 요청",icon:Tt,dynamicBadge:n},{path:"/inventory",label:"품목 관리",icon:ce},{path:"/receipts",label:"수령 관리",icon:lr},{path:"/kakao",label:"카톡 처리",icon:cr}],i=[{path:"/upload",label:"파일 관리",icon:ye},{path:"/statistics",label:"통계 분석",icon:dr},{path:"/logs",label:"시스템 로그",icon:pr}],u=[{path:"/suppliers",label:"공급업체",icon:Ke},{path:"/budgets",label:"예산 관리",icon:ur},{path:"/users",label:"사용자 관리",icon:xr},{path:"/notifications",label:"알림 설정",icon:Es},{path:"/settings",label:"시스템 설정",icon:zs}],x=c=>{const m=c.icon,w=r.pathname===c.path,k=c.dynamicBadge||c.badge||0,d=k>0;return t.jsx(on,{children:t.jsxs(pn,{children:[t.jsxs(an,{to:c.path,isOpen:e,className:w?"active":"",children:[t.jsx(m,{className:"nav-icon",size:18}),t.jsx("span",{className:"nav-text",children:c.label}),d&&e&&t.jsx(ln,{isOpen:e,count:k,children:k>99?"99+":k}),d&&!e&&t.jsx(cn,{show:!e})]}),!e&&t.jsxs(dn,{show:!e,className:"tooltip",children:[c.label,d&&` (${k})`,c.path==="/purchase-requests"&&!a&&" [샘플]"]})]})},c.path)};return t.jsxs(en,{isOpen:e,children:[t.jsxs(tn,{isOpen:e,children:[t.jsxs(sn,{isOpen:e,children:[t.jsx("div",{className:"logo-icon",children:t.jsx(ce,{size:16})}),t.jsx("h1",{className:"logo-text",children:"ERP 시스템"})]}),t.jsx(rn,{isOpen:e,onClick:s,children:e?t.jsx(Cs,{size:14}):t.jsx(_s,{size:14})}),t.jsx(un,{connected:a,title:a?"API 연결됨":"API 미연결 (샘플 모드)"})]}),t.jsxs(nn,{children:[t.jsxs(wt,{isOpen:e,children:[t.jsx($t,{isOpen:e,children:"주요 기능"}),t.jsx(kt,{children:l.map(x)})]}),t.jsxs(wt,{isOpen:e,children:[t.jsx($t,{isOpen:e,children:"데이터 관리"}),t.jsx(kt,{children:i.map(x)})]}),t.jsxs(wt,{isOpen:e,children:[t.jsx($t,{isOpen:e,children:"시스템 관리"}),t.jsx(kt,{children:u.map(x)})]})]})]})},hn=o.header`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  height: 56px;
  background: ${e=>e.theme.colors.surface};
  border-bottom: 1px solid ${e=>e.theme.colors.border};
`,gn=o.div`
  display: flex;
  align-items: center;
  gap: 20px;
`,fn=o.div`
  display: flex;
  align-items: center;
  gap: 8px;
`,bn=o.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: ${e=>e.theme.borderRadius.md};
  background: none;
  border: none;
  color: ${e=>e.theme.colors.text};
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: ${e=>e.theme.colors.background};
  }
`,yn=o.div`
  position: relative;
  display: flex;
  align-items: center;
  
  @media (max-width: 768px) {
    display: none;
  }
`,vn=o.input`
  width: 280px;
  padding: 8px 12px 8px 36px;
  border: 1px solid ${e=>e.theme.colors.border};
  border-radius: ${e=>e.theme.borderRadius.md};
  background: ${e=>e.theme.colors.background};
  font-size: 0.875rem;
  transition: all 0.2s;
  
  &:focus {
    outline: none;
    border-color: ${e=>e.theme.colors.primary};
    box-shadow: 0 0 0 3px ${e=>e.theme.colors.primary}20;
    width: 320px;
  }
  
  &::placeholder {
    color: ${e=>e.theme.colors.textSecondary};
  }
`,jn=o(Ss)`
  position: absolute;
  left: 10px;
  color: ${e=>e.theme.colors.textSecondary};
`,Nt=o.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: ${e=>e.theme.borderRadius.md};
  background: none;
  border: none;
  color: ${e=>e.theme.colors.text};
  cursor: pointer;
  position: relative;
  transition: all 0.2s;

  &:hover {
    background: ${e=>e.theme.colors.background};
  }
`,wn=o.span`
  position: absolute;
  top: 6px;
  right: 6px;
  width: 6px;
  height: 6px;
  background: ${e=>e.theme.colors.error};
  border-radius: 50%;
`,$n=o.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 8px;
  border-radius: ${e=>e.theme.borderRadius.md};
  cursor: pointer;
  transition: all 0.2s;
  border: 1px solid transparent;

  &:hover {
    background: ${e=>e.theme.colors.background};
    border-color: ${e=>e.theme.colors.border};
  }
  
  @media (max-width: 768px) {
    .user-name {
      display: none;
    }
  }
`,kn=o.div`
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: linear-gradient(135deg, ${e=>e.theme.colors.primary}, ${e=>e.theme.colors.secondary});
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  font-size: 0.8rem;
`,Nn=o.span`
  font-size: 0.875rem;
  font-weight: 500;
  color: ${e=>e.theme.colors.text};
`,Cn=o.div`
  width: 1px;
  height: 20px;
  background: ${e=>e.theme.colors.border};
  margin: 0 4px;
`,_n=({onToggleSidebar:e,sidebarCollapsed:s})=>t.jsxs(hn,{children:[t.jsxs(gn,{children:[t.jsx(bn,{onClick:e,children:t.jsx(mr,{size:18})}),t.jsxs(yn,{children:[t.jsx(jn,{size:14}),t.jsx(vn,{type:"text",placeholder:"검색어를 입력하세요..."})]})]}),t.jsxs(fn,{children:[t.jsxs(Nt,{title:"알림",children:[t.jsx(Es,{size:18}),t.jsx(wn,{})]}),t.jsx(Cn,{}),t.jsxs($n,{children:[t.jsx(kn,{children:"관"}),t.jsx(Nn,{className:"user-name",children:"관리자"})]}),t.jsx(Nt,{title:"설정",children:t.jsx(zs,{size:18})}),t.jsx(Nt,{title:"로그아웃",children:t.jsx(hr,{size:18})})]})]}),En=o.div`
  display: flex;
  height: 100vh;
  background-color: ${e=>e.theme.colors.background};
  overflow: hidden;
`,zn=o.main`
  flex: 1;
  display: flex;
  flex-direction: column;
  margin-left: ${e=>e.sidebarOpen?"240px":"60px"};
  transition: margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  background: ${e=>e.theme.colors.background};
  position: relative;
  min-width: 0; /* 플렉스 아이템이 너무 작아지는 것을 방지 */
`,Sn=o.div`
  background: ${e=>e.theme.colors.surface};
  border-bottom: 1px solid ${e=>e.theme.colors.border};
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.02);
  z-index: 100;
  position: sticky;
  top: 0;
`,In=o.div`
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  
  /* 더 부드러운 스크롤바 */
  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: ${e=>e.theme.colors.border};
    border-radius: 3px;
    
    &:hover {
      background: ${e=>e.theme.colors.gray};
    }
  }

  /* 컨텐츠 애니메이션 */
  > * {
    animation: fadeInUp 0.4s ease-out;
  }
  
  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`,Tn=()=>{const[e,s]=f.useState(!0),r=()=>{s(!e)};return t.jsxs(En,{children:[t.jsx(mn,{isOpen:e,onToggle:r}),t.jsxs(zn,{sidebarOpen:e,children:[t.jsx(Sn,{children:t.jsx(_n,{onToggleSidebar:r,sidebarCollapsed:!e})}),t.jsx(In,{children:t.jsx(Ir,{})})]})]})},Rn=o.div`
  background: ${e=>e.$background||"#ffffff"};
  border: ${e=>e.$border||"1px solid #e1e5e9"};
  border-radius: ${e=>e.$borderRadius||"8px"};
  box-shadow: ${e=>e.$boxShadow||"0 2px 4px rgba(0, 0, 0, 0.1)"};
  padding: ${e=>e.$padding||"1.5rem"};
  margin: ${e=>e.$margin||"0"};
  transition: all 0.2s ease-in-out;
  cursor: ${e=>e.$hover?"pointer":"default"};

  ${e=>e.$hover&&`
    &:hover {
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      transform: translateY(-2px);
      border-color: #c3d4e6;
    }
  `}

  @media (max-width: 768px) {
    padding: ${e=>e.$padding||"1rem"};
    margin: ${e=>e.$margin||"0 0 1rem 0"};
  }
`,te=({children:e,className:s,onClick:r,$hover:n=!1,padding:a,margin:l,background:i,border:u,borderRadius:x,boxShadow:c,...m})=>t.jsx(Rn,{className:s,onClick:r,$hover:n,$padding:a,$margin:l,$background:i,$border:u,$borderRadius:x,$boxShadow:c,...m,children:e}),Pn=o.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: ${e=>e.theme.spacing.sm};
  border: none;
  border-radius: ${e=>e.theme.borderRadius.md};
  font-weight: 500;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
  position: relative;
  
  /* 크기별 스타일 */
  ${e=>{switch(e.$size){case"sm":return`
          padding: 6px 12px;
          font-size: 0.875rem;
          min-height: 32px;
        `;case"lg":return`
          padding: 12px 24px;
          font-size: 1.125rem;
          min-height: 48px;
        `;default:return`
          padding: 8px 16px;
          font-size: 1rem;
          min-height: 40px;
        `}}}
  
  /* 변형별 스타일 */
  ${e=>{const{colors:s}=e.theme;switch(e.$variant){case"secondary":return`
          background: ${s.gray};
          color: white;
          &:hover:not(:disabled) {
            background: ${s.gray}dd;
            transform: translateY(-1px);
          }
        `;case"success":return`
          background: ${s.success};
          color: white;
          &:hover:not(:disabled) {
            background: ${s.success}dd;
            transform: translateY(-1px);
          }
        `;case"warning":return`
          background: ${s.warning};
          color: white;
          &:hover:not(:disabled) {
            background: ${s.warning}dd;
            transform: translateY(-1px);
          }
        `;case"danger":return`
          background: ${s.error};
          color: white;
          &:hover:not(:disabled) {
            background: ${s.error}dd;
            transform: translateY(-1px);
          }
        `;case"outline":return`
          background: transparent;
          color: ${s.primary};
          border: 1px solid ${s.primary};
          &:hover:not(:disabled) {
            background: ${s.primary}10;
            transform: translateY(-1px);
          }
        `;default:return`
          background: linear-gradient(135deg, ${s.primary}, ${s.secondary});
          color: white;
          &:hover:not(:disabled) {
            transform: translateY(-1px);
            box-shadow: ${e.theme.shadows.md};
          }
        `}}}
  
  /* 비활성화 상태 */
  ${e=>e.$disabled&&`
    opacity: 0.6;
    cursor: not-allowed;
    &:hover {
      transform: none;
      box-shadow: none;
    }
  `}
  
  /* 로딩 상태 */
  ${e=>e.$loading&&`
    cursor: wait;
    &:hover {
      transform: none;
    }
  `}
`,On=o.div`
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top: 2px solid white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`,O=({children:e,variant:s="primary",size:r="md",disabled:n=!1,loading:a=!1,onClick:l,type:i="button",className:u,title:x})=>t.jsxs(Pn,{$variant:s,$size:r,$disabled:n||a,$loading:a,onClick:l,type:i,className:u,disabled:n||a,title:x,children:[a&&t.jsx(On,{}),e]}),Fn=gr`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`,Ln=o.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: ${e=>e.theme.spacing.xl};
  min-height: 200px;
`,qn=o.div`
  width: 40px;
  height: 40px;
  border: 4px solid ${e=>e.theme.colors.border};
  border-top: 4px solid ${e=>e.theme.colors.primary};
  border-radius: 50%;
  animation: ${Fn} 1s linear infinite;
`,Mn=o.div`
  margin-left: ${e=>e.theme.spacing.md};
  color: ${e=>e.theme.colors.textSecondary};
  font-size: 0.9rem;
`,gt=({text:e="로딩 중..."})=>t.jsxs(Ln,{children:[t.jsx(qn,{}),e&&t.jsx(Mn,{children:e})]}),ts=o.div`
  padding: 20px;
`,Dn=o.h1`
  font-size: 2rem;
  font-weight: 600;
  margin-bottom: 8px;
  color: ${e=>e.theme.colors.text};
`,Bn=o.p`
  color: ${e=>e.theme.colors.textSecondary};
  margin-bottom: 30px;
  font-size: 1rem;
`,An=o.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
`,tt=o(te)`
  background: linear-gradient(135deg, ${e=>e.color}15 0%, ${e=>e.color}05 100%);
  border-left: 4px solid ${e=>e.color};
  
  .stat-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 15px;
  }
  
  .stat-icon {
    padding: 12px;
    border-radius: 50%;
    background: ${e=>e.color}20;
    color: ${e=>e.color};
  }
  
  .stat-value {
    font-size: 2rem;
    font-weight: bold;
    color: ${e=>e.color};
    margin-bottom: 5px;
  }
  
  .stat-label {
    color: ${e=>e.theme.colors.textSecondary};
    font-size: 0.9rem;
  }
  
  .stat-change {
    font-size: 0.8rem;
    margin-top: 8px;
    
    &.positive {
      color: ${e=>e.theme.colors.success};
    }
    
    &.negative {
      color: ${e=>e.theme.colors.error};
    }
  }
`,Un=o.div`
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 30px;
  
  @media (max-width: ${e=>e.theme.breakpoints.tablet}) {
    grid-template-columns: 1fr;
  }
`,Kn=o(te)`
  .activity-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 20px;
    
    h3 {
      margin: 0;
      font-size: 1.2rem;
    }
  }
  
  .activity-list {
    display: flex;
    flex-direction: column;
    gap: 15px;
  }
  
  .activity-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px;
    border-radius: 8px;
    transition: background 0.2s;
    
    &:hover {
      background: ${e=>e.theme.colors.background};
    }
  }
  
  .activity-icon {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }
  
  .activity-content {
    flex: 1;
    
    .activity-title {
      font-weight: 500;
      margin-bottom: 4px;
    }
    
    .activity-time {
      font-size: 0.8rem;
      color: ${e=>e.theme.colors.textSecondary};
    }
  }
`,Wn=o(te)`
  h3 {
    margin-bottom: 20px;
    font-size: 1.2rem;
  }
  
  .actions-grid {
    display: grid;
    gap: 12px;
  }
  
  .action-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 16px;
    border: 1px solid ${e=>e.theme.colors.border};
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s;
    text-decoration: none;
    color: inherit;
    
    &:hover {
      border-color: ${e=>e.theme.colors.primary};
      background: ${e=>e.theme.colors.primary}05;
      transform: translateY(-1px);
    }
  }
  
  .action-icon {
    width: 40px;
    height: 40px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: ${e=>e.theme.colors.primary}15;
    color: ${e=>e.theme.colors.primary};
  }
  
  .action-content {
    .action-title {
      font-weight: 500;
      margin-bottom: 4px;
    }
    
    .action-desc {
      font-size: 0.85rem;
      color: ${e=>e.theme.colors.textSecondary};
    }
  }
`,Qn=()=>{var a;const{data:e,isLoading:s,error:r}=je({queryKey:["dashboard-stats"],queryFn:Qs.getStats,refetchInterval:3e5,retry:3,staleTime:3e5});if(console.log("Dashboard data:",{stats:e,isLoading:s,error:r}),s)return t.jsx(gt,{text:"대시보드 데이터를 불러오는 중..."});if(r)return console.error("Dashboard error:",r),t.jsx(ts,{children:t.jsx(te,{children:t.jsxs("div",{style:{textAlign:"center",padding:"40px"},children:[t.jsx(De,{size:48,style:{color:"#EF4444",marginBottom:"16px"}}),t.jsx("h3",{children:"데이터를 불러올 수 없습니다"}),t.jsx("p",{style:{marginBottom:"20px"},children:"대시보드 데이터를 불러오는 중 오류가 발생했습니다."}),t.jsx(O,{onClick:()=>window.location.reload(),children:"새로고침"})]})})});const n=(e==null?void 0:e.data)||{};return t.jsxs(ts,{children:[t.jsx(Dn,{children:"대시보드"}),t.jsx(Bn,{children:"시스템 현황을 한눈에 확인하세요."}),t.jsxs(An,{children:[t.jsxs(tt,{color:"#3B82F6",children:[t.jsxs("div",{className:"stat-header",children:[t.jsxs("div",{children:[t.jsx("div",{className:"stat-value",children:(n==null?void 0:n.totalItems)||0}),t.jsx("div",{className:"stat-label",children:"전체 품목"})]}),t.jsx("div",{className:"stat-icon",children:t.jsx(ce,{size:24})})]}),t.jsxs("div",{className:"stat-change positive",children:["이번 달 +",(n==null?void 0:n.newItemsThisMonth)||0]})]}),t.jsx(tt,{color:"#F59E0B",children:t.jsxs("div",{className:"stat-header",children:[t.jsxs("div",{children:[t.jsx("div",{className:"stat-value",children:(n==null?void 0:n.lowStockItems)||0}),t.jsx("div",{className:"stat-label",children:"재고 부족"})]}),t.jsx("div",{className:"stat-icon",children:t.jsx(De,{size:24})})]})}),t.jsx(tt,{color:"#10B981",children:t.jsxs("div",{className:"stat-header",children:[t.jsxs("div",{children:[t.jsx("div",{className:"stat-value",children:(n==null?void 0:n.recentPurchases)||0}),t.jsx("div",{className:"stat-label",children:"최근 구매"})]}),t.jsx("div",{className:"stat-icon",children:t.jsx(Tt,{size:24})})]})}),t.jsx(tt,{color:"#8B5CF6",children:t.jsxs("div",{className:"stat-header",children:[t.jsxs("div",{children:[t.jsxs("div",{className:"stat-value",children:["₩",((n==null?void 0:n.totalValue)||0).toLocaleString()]}),t.jsx("div",{className:"stat-label",children:"총 재고 가치"})]}),t.jsx("div",{className:"stat-icon",children:t.jsx(lt,{size:24})})]})})]}),t.jsxs(Un,{children:[t.jsxs(Kn,{children:[t.jsxs("div",{className:"activity-header",children:[t.jsx("h3",{children:"최근 활동"}),t.jsx("span",{style:{fontSize:"0.9rem",color:"#666"},children:"최근 24시간"})]}),t.jsx("div",{className:"activity-list",children:((a=n==null?void 0:n.recentActivities)==null?void 0:a.length)>0?n.recentActivities.slice(0,5).map((l,i)=>t.jsxs("div",{className:"activity-item",children:[t.jsx("div",{className:"activity-icon",style:{background:"#10B98120",color:"#10B981"},children:t.jsx(ce,{size:20})}),t.jsxs("div",{className:"activity-content",children:[t.jsx("div",{className:"activity-title",children:l.description||"활동 없음"}),t.jsx("div",{className:"activity-time",children:l.createdAt?new Date(l.createdAt).toLocaleString("ko-KR"):"시간 정보 없음"})]})]},l.id||i)):t.jsx("div",{style:{textAlign:"center",color:"#666",padding:"20px"},children:"최근 활동이 없습니다."})})]}),t.jsxs(Wn,{children:[t.jsx("h3",{children:"빠른 작업"}),t.jsxs("div",{className:"actions-grid",children:[t.jsxs("a",{href:"/inventory",className:"action-item",children:[t.jsx("div",{className:"action-icon",children:t.jsx(ce,{size:20})}),t.jsxs("div",{className:"action-content",children:[t.jsx("div",{className:"action-title",children:"재고 관리"}),t.jsx("div",{className:"action-desc",children:"품목 현황 확인 및 관리"})]})]}),t.jsxs("a",{href:"/upload",className:"action-item",children:[t.jsx("div",{className:"action-icon",children:t.jsx(Tt,{size:20})}),t.jsxs("div",{className:"action-content",children:[t.jsx("div",{className:"action-title",children:"파일 업로드"}),t.jsx("div",{className:"action-desc",children:"Excel로 일괄 등록"})]})]}),t.jsxs("a",{href:"/statistics",className:"action-item",children:[t.jsx("div",{className:"action-icon",children:t.jsx(Ne,{size:20})}),t.jsxs("div",{className:"action-content",children:[t.jsx("div",{className:"action-title",children:"통계 분석"}),t.jsx("div",{className:"action-desc",children:"현황 분석 및 리포트"})]})]})]})]})]})]})},Gn=o.div`
  overflow-x: auto;
  border-radius: ${e=>e.theme.borderRadius.lg};
  border: 1px solid ${e=>e.theme.colors.border};
  background: ${e=>e.theme.colors.surface};
`,Hn=o.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 0.9rem;
`,Yn=o.thead`
  background: ${e=>e.theme.colors.background};
  border-bottom: 2px solid ${e=>e.theme.colors.border};
`,ss=o.th`
  padding: ${e=>e.theme.spacing.md};
  text-align: ${e=>e.align||"left"};
  font-weight: 600;
  color: ${e=>e.theme.colors.text};
  white-space: nowrap;
  position: sticky;
  top: 0;
  z-index: 10;
  background: ${e=>e.theme.colors.background};
  
  ${e=>e.width&&`width: ${e.width};`}
  
  ${e=>e.sortable&&`
    cursor: pointer;
    user-select: none;
    
    &:hover {
      background: ${e.theme.colors.border};
    }
  `}
`,Vn=o.div`
  display: flex;
  align-items: center;
  gap: ${e=>e.theme.spacing.xs};
`,Jn=o.div`
  display: flex;
  flex-direction: column;
  opacity: ${e=>e.active?1:.3};
  
  svg {
    width: 12px;
    height: 12px;
  }
`,Xn=o.tbody``,Zn=o.tr`
  transition: background-color 0.15s ease;
  
  &:hover {
    background: ${e=>e.theme.colors.background};
  }
  
  ${e=>e.selected&&`
    background: ${e.theme.colors.primary}10;
  `}
`,st=o.td`
  padding: ${e=>e.theme.spacing.md};
  text-align: ${e=>e.align||"left"};
  border-bottom: 1px solid ${e=>e.theme.colors.border};
  vertical-align: top;
  
  &:first-child {
    border-left: none;
  }
  
  &:last-child {
    border-right: none;
  }
`,rs=o.input`
  width: 16px;
  height: 16px;
  cursor: pointer;
`,eo=o.div`
  text-align: center;
  padding: ${e=>e.theme.spacing.xl};
  color: ${e=>e.theme.colors.textSecondary};
  
  .empty-icon {
    font-size: 3rem;
    margin-bottom: ${e=>e.theme.spacing.md};
    opacity: 0.3;
  }
`,to=o.div`
  text-align: center;
  padding: ${e=>e.theme.spacing.xl};
  color: ${e=>e.theme.colors.textSecondary};
  
  .loading-spinner {
    display: inline-block;
    width: 24px;
    height: 24px;
    border: 3px solid ${e=>e.theme.colors.border};
    border-top: 3px solid ${e=>e.theme.colors.primary};
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-bottom: ${e=>e.theme.spacing.md};
  }
  
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;function Mt({columns:e,data:s,loading:r=!1,emptyMessage:n="데이터가 없습니다.",selectable:a=!1,selectedItems:l=[],onSelectItems:i,onSort:u,sortField:x,sortDirection:c}){const m=v=>{i&&i(v?s:[])},w=(v,h)=>{i&&i(h?[...l,v]:l.filter(C=>C!==v))},k=v=>{if(!u)return;let h="asc";x===v&&c==="asc"&&(h="desc"),u(v,h)},d=s.length>0&&l.length===s.length,$=l.length>0&&l.length<s.length;return t.jsx(Gn,{children:t.jsxs(Hn,{children:[t.jsx(Yn,{children:t.jsxs("tr",{children:[a&&t.jsx(ss,{width:"40px",children:t.jsx(rs,{type:"checkbox",checked:d,ref:v=>{v&&(v.indeterminate=$)},onChange:v=>m(v.target.checked)})}),e.map(v=>t.jsx(ss,{width:v.width,align:v.align,sortable:v.sortable,onClick:()=>v.sortable&&k(String(v.key)),children:v.sortable?t.jsxs(Vn,{children:[v.label,t.jsxs(Jn,{active:x===v.key,direction:c,children:[t.jsx(fr,{}),t.jsx(Is,{})]})]}):v.label},String(v.key)))]})}),t.jsx(Xn,{children:r?t.jsx("tr",{children:t.jsx(st,{colSpan:e.length+(a?1:0),children:t.jsxs(to,{children:[t.jsx("div",{className:"loading-spinner"}),t.jsx("div",{children:"로딩 중..."})]})})}):s.length===0?t.jsx("tr",{children:t.jsx(st,{colSpan:e.length+(a?1:0),children:t.jsxs(eo,{children:[t.jsx("div",{className:"empty-icon",children:"📋"}),t.jsx("div",{children:n})]})})}):s.map((v,h)=>{const C=l.includes(v);return t.jsxs(Zn,{selected:C,children:[a&&t.jsx(st,{children:t.jsx(rs,{type:"checkbox",checked:C,onChange:E=>w(v,E.target.checked)})}),e.map(E=>{const q=v[E.key],b=E.render?E.render(q,v):q;return t.jsx(st,{align:E.align,children:b},String(E.key))})]},h)})})]})})}const so=o.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${e=>e.theme.spacing.xs};
  margin-top: ${e=>e.theme.spacing.lg};
`,Ct=o.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border: 1px solid ${e=>e.theme.colors.border};
  border-radius: ${e=>e.theme.borderRadius.md};
  background: ${e=>e.active?e.theme.colors.primary:e.theme.colors.surface};
  color: ${e=>e.active?"white":e.theme.colors.text};
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    background: ${e=>e.active?e.theme.colors.primary:e.theme.colors.background};
    border-color: ${e=>e.theme.colors.primary};
  }

  &:disabled {
    background: ${e=>e.theme.colors.background};
    color: ${e=>e.theme.colors.textSecondary};
    cursor: not-allowed;
    opacity: 0.5;
  }

  svg {
    width: 16px;
    height: 16px;
  }
`,ro=o.span`
  margin: 0 ${e=>e.theme.spacing.md};
  font-size: 0.9rem;
  color: ${e=>e.theme.colors.textSecondary};
`,Dt=({currentPage:e,totalPages:s,onPageChange:r,className:n})=>{const a=()=>{const u=[],x=[];for(let c=Math.max(2,e-2);c<=Math.min(s-1,e+2);c++)u.push(c);return e-2>2?x.push(1,"..."):x.push(1),x.push(...u),e+2<s-1?x.push("...",s):s>1&&x.push(s),x};if(s<=1)return null;const l=a();return t.jsxs(so,{className:n,children:[t.jsx(Ct,{disabled:e===1,onClick:()=>r(e-1),children:t.jsx(Cs,{})}),l.map((i,u)=>t.jsx(H.Fragment,{children:i==="..."?t.jsx(ro,{children:"..."}):t.jsx(Ct,{active:i===e,onClick:()=>r(i),children:i})},u)),t.jsx(Ct,{disabled:e===s,onClick:()=>r(e+1),children:t.jsx(_s,{})})]})},no=o.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: ${e=>e.isOpen?"flex":"none"};
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: ${e=>e.theme.spacing.lg};
  animation: fadeIn 0.2s ease-out;
  
  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
`,oo=o.div`
  background: ${e=>e.theme.colors.surface};
  border-radius: ${e=>e.theme.borderRadius.lg};
  box-shadow: ${e=>e.theme.shadows.lg};
  max-height: 90vh;
  overflow-y: auto;
  animation: slideIn 0.3s ease-out;
  position: relative;
  
  ${e=>{switch(e.size){case"sm":return"width: 100%; max-width: 400px;";case"lg":return"width: 100%; max-width: 800px;";case"xl":return"width: 100%; max-width: 1200px;";default:return"width: 100%; max-width: 600px;"}}}
  
  @keyframes slideIn {
    from {
      transform: scale(0.95) translateY(-10px);
      opacity: 0;
    }
    to {
      transform: scale(1) translateY(0);
      opacity: 1;
    }
  }
  
  @media (max-width: ${e=>e.theme.breakpoints.mobile}) {
    margin: ${e=>e.theme.spacing.md};
    max-width: calc(100vw - ${e=>e.theme.spacing.lg});
  }
`,ao=o.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${e=>e.theme.spacing.lg};
  border-bottom: 1px solid ${e=>e.theme.colors.border};
`,io=o.h2`
  font-size: 1.25rem;
  font-weight: 600;
  color: ${e=>e.theme.colors.text};
  margin: 0;
`,lo=o.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  background: none;
  border-radius: ${e=>e.theme.borderRadius.md};
  color: ${e=>e.theme.colors.textSecondary};
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: ${e=>e.theme.colors.background};
    color: ${e=>e.theme.colors.text};
  }
`,co=o.div`
  padding: ${e=>e.theme.spacing.lg};
`,Te=({isOpen:e,onClose:s,title:r,children:n,size:a="md",closable:l=!0})=>{f.useEffect(()=>{const u=x=>{x.key==="Escape"&&l&&s()};return e&&(document.addEventListener("keydown",u),document.body.style.overflow="hidden"),()=>{document.removeEventListener("keydown",u),document.body.style.overflow="unset"}},[e,s,l]);const i=u=>{u.target===u.currentTarget&&l&&s()};return e?t.jsx(no,{isOpen:e,onClick:i,children:t.jsxs(oo,{size:a,children:[t.jsxs(ao,{children:[t.jsx(io,{children:r}),l&&t.jsx(lo,{onClick:s,children:t.jsx(ve,{size:20})})]}),t.jsx(co,{children:n})]})}):null},po=o.div`
  display: flex;
  gap: 16px;
  margin-bottom: 20px;
  align-items: center;
  flex-wrap: wrap;
`,uo=o.div`
  position: relative;
  flex: 1;
  min-width: 200px;
`,xo=o.input`
  width: 100%;
  padding: 8px 12px 8px 40px;
  border: 1px solid ${e=>e.theme.colors.border};
  border-radius: ${e=>e.theme.borderRadius.md};
  font-size: 14px;
  background: ${e=>e.theme.colors.surface};
  
  &:focus {
    outline: none;
    border-color: ${e=>e.theme.colors.primary};
    box-shadow: 0 0 0 3px ${e=>e.theme.colors.primary}20;
  }
`,mo=o(Ss)`
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  width: 16px;
  height: 16px;
  color: ${e=>e.theme.colors.textSecondary};
`,ns=o.select`
  padding: 8px 12px;
  border: 1px solid ${e=>e.theme.colors.border};
  border-radius: ${e=>e.theme.borderRadius.md};
  font-size: 14px;
  background: ${e=>e.theme.colors.surface};
  cursor: pointer;
  min-width: 120px;
  
  &:focus {
    outline: none;
    border-color: ${e=>e.theme.colors.primary};
    box-shadow: 0 0 0 3px ${e=>e.theme.colors.primary}20;
  }
`,ho=o(O)`
  white-space: nowrap;
`,go=o.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-top: 10px;
`,fo=o.div`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 8px;
  background: ${e=>e.theme.colors.primary}15;
  color: ${e=>e.theme.colors.primary};
  border-radius: ${e=>e.theme.borderRadius.sm};
  font-size: 0.85rem;
  
  .remove-filter {
    cursor: pointer;
    opacity: 0.7;
    
    &:hover {
      opacity: 1;
    }
  }
`,bo=({onFilter:e})=>{const[s,r]=f.useState({}),n=(x,c)=>{const m={...s};c?m[x]=c:delete m[x],r(m),e(m)},a=x=>{const c={...s};delete c[x],r(c),e(c)},l=()=>{r({}),e({})},i=Object.keys(s).length>0,u=(x,c)=>{const m={search:"검색",category:"카테고리",is_active:"상태"};return x==="is_active"?`${m[x]}: ${c==="true"?"활성":"비활성"}`:`${m[x]||x}: ${c}`};return t.jsxs(t.Fragment,{children:[t.jsxs(po,{children:[t.jsxs(uo,{children:[t.jsx(mo,{}),t.jsx(xo,{type:"text",placeholder:"품목명, 품목코드로 검색...",value:s.search||"",onChange:x=>n("search",x.target.value)})]}),t.jsxs(ns,{value:s.category||"",onChange:x=>n("category",x.target.value),children:[t.jsx("option",{value:"",children:"전체 카테고리"}),t.jsx("option",{value:"IT 관련 장비",children:"IT 관련 장비"}),t.jsx("option",{value:"사무 용품",children:"사무 용품"}),t.jsx("option",{value:"제조 장비",children:"제조 장비"}),t.jsx("option",{value:"소모품",children:"소모품"}),t.jsx("option",{value:"아이템",children:"아이템"}),t.jsx("option",{value:"기타",children:"기타"})]}),t.jsxs(ns,{value:s.is_active||"",onChange:x=>n("is_active",x.target.value),children:[t.jsx("option",{value:"",children:"전체 상태"}),t.jsx("option",{value:"true",children:"활성"}),t.jsx("option",{value:"false",children:"비활성"})]}),t.jsxs(ho,{variant:"outline",onClick:l,disabled:!i,children:[t.jsx(Ts,{size:16}),i?"필터 초기화":"필터"]})]}),i&&t.jsx(go,{children:Object.entries(s).map(([x,c])=>t.jsxs(fo,{children:[t.jsx("span",{children:u(x,c)}),t.jsx(ve,{size:12,className:"remove-filter",onClick:()=>a(x)})]},x))})]})},yo=o.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`,vo=o.label`
  font-size: 14px;
  font-weight: 500;
  color: #374151;
`,jo=o.input`
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  background: white;
  color: #374151;
  
  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
  
  &:disabled {
    background: #f9fafb;
    color: #9ca3af;
    cursor: not-allowed;
  }
  
  &::placeholder {
    color: #9ca3af;
  }
`,X=({label:e,type:s="text",value:r,onChange:n,placeholder:a,disabled:l=!1,required:i=!1,className:u})=>t.jsxs(yo,{className:u,children:[e&&t.jsxs(vo,{children:[e,i&&t.jsx("span",{style:{color:"#ef4444"},children:"*"})]}),t.jsx(jo,{type:s,value:r||"",onChange:n,placeholder:a,disabled:l,required:i})]}),wo=o.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`,$o=o.label`
  font-size: 14px;
  font-weight: 500;
  color: #374151;
`,ko=o.select`
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  background: white;
  color: #374151;
  cursor: pointer;
  
  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
  
  &:disabled {
    background: #f9fafb;
    color: #9ca3af;
    cursor: not-allowed;
  }
`,Ie=({label:e,value:s,options:r,onChange:n,placeholder:a="선택하세요",disabled:l=!1,required:i=!1,className:u})=>{const x=c=>{n&&n(c.target.value)};return t.jsxs(wo,{className:u,children:[e&&t.jsxs($o,{children:[e,i&&t.jsx("span",{style:{color:"#ef4444"},children:"*"})]}),t.jsxs(ko,{value:s||"",onChange:x,disabled:l,required:i,children:[a&&t.jsx("option",{value:"",disabled:!0,children:a}),r.map(c=>t.jsx("option",{value:c.value,disabled:c.disabled,children:c.label},c.value))]})]})},No=o.div`
  background: white;
  padding: 20px;
  border-radius: 8px;
`,Me=o.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 16px;
  margin-bottom: 20px;
`,Z=o.div`
  margin-bottom: 16px;
`,Co=o.div`
  display: flex;
  gap: 8px;
  justify-content: flex-end;
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid #e5e7eb;
`,_o=o.h3`
  margin-bottom: 20px;
  color: #374151;
  font-size: 1.25rem;
  font-weight: 600;
`,Ee=o.h4`
  margin: 20px 0 16px 0;
  color: #6b7280;
  font-size: 1rem;
  font-weight: 500;
  border-bottom: 1px solid #e5e7eb;
  padding-bottom: 8px;
`,Eo=({item:e,onSubmit:s,onCancel:r,loading:n=!1})=>{const[a,l]=f.useState({item_code:(e==null?void 0:e.item_code)||"",item_name:(e==null?void 0:e.item_name)||"",category:(e==null?void 0:e.category)||"",brand:(e==null?void 0:e.brand)||"",specifications:(e==null?void 0:e.specifications)||"",unit:(e==null?void 0:e.unit)||"개",unit_price:(e==null?void 0:e.unit_price)||void 0,currency:(e==null?void 0:e.currency)||"KRW",location:(e==null?void 0:e.location)||"",warehouse:(e==null?void 0:e.warehouse)||"",storage_section:(e==null?void 0:e.storage_section)||"",supplier_name:(e==null?void 0:e.supplier_name)||"",supplier_contact:(e==null?void 0:e.supplier_contact)||"",minimum_stock:(e==null?void 0:e.minimum_stock)||0,maximum_stock:(e==null?void 0:e.maximum_stock)||void 0,reorder_point:(e==null?void 0:e.reorder_point)||void 0,is_consumable:(e==null?void 0:e.is_consumable)||!1,requires_approval:(e==null?void 0:e.requires_approval)||!1,description:(e==null?void 0:e.description)||"",notes:(e==null?void 0:e.notes)||"",tags:(e==null?void 0:e.tags)||[]}),[i,u]=f.useState(a.tags.join(", ")),x=d=>{d.preventDefault();const $=i.split(",").map(h=>h.trim()).filter(h=>h.length>0),v={...a,tags:$,category:a.category||void 0,brand:a.brand||void 0,specifications:a.specifications||void 0,location:a.location||void 0,warehouse:a.warehouse||void 0,storage_section:a.storage_section||void 0,supplier_name:a.supplier_name||void 0,supplier_contact:a.supplier_contact||void 0,description:a.description||void 0,notes:a.notes||void 0};s(v)},c=(d,$)=>{l(v=>({...v,[d]:$}))},m=[{value:"",label:"카테고리 선택"},{value:"IT 관련 장비",label:"IT 관련 장비"},{value:"사무 용품",label:"사무 용품"},{value:"제조 장비",label:"제조 장비"},{value:"소모품",label:"소모품"},{value:"아이템",label:"아이템"},{value:"기타",label:"기타"}],w=[{value:"개",label:"개"},{value:"박스",label:"박스"},{value:"kg",label:"kg"},{value:"L",label:"L"},{value:"세트",label:"세트"},{value:"m",label:"m"},{value:"권",label:"권"},{value:"대",label:"대"}],k=[{value:"KRW",label:"원 (KRW)"},{value:"USD",label:"달러 (USD)"},{value:"EUR",label:"유로 (EUR)"},{value:"JPY",label:"엔 (JPY)"}];return t.jsxs(No,{children:[t.jsx(_o,{children:e?"품목 수정":"품목 추가"}),t.jsxs("form",{onSubmit:x,children:[t.jsx(Ee,{children:"기본 정보"}),t.jsxs(Me,{children:[t.jsx(Z,{children:t.jsx(X,{label:"품목 코드 *",type:"text",value:a.item_code,onChange:d=>c("item_code",d.target.value),placeholder:"품목 코드를 입력하세요",required:!0,disabled:!!e})}),t.jsx(Z,{children:t.jsx(X,{label:"품목명 *",type:"text",value:a.item_name,onChange:d=>c("item_name",d.target.value),placeholder:"품목명을 입력하세요",required:!0})}),t.jsx(Z,{children:t.jsx(Ie,{label:"카테고리",value:a.category||"",options:m,onChange:d=>c("category",d)})}),t.jsx(Z,{children:t.jsx(X,{label:"브랜드",type:"text",value:a.brand||"",onChange:d=>c("brand",d.target.value),placeholder:"브랜드를 입력하세요"})})]}),t.jsx(Z,{children:t.jsx(X,{label:"사양/스펙",type:"textarea",value:a.specifications||"",onChange:d=>c("specifications",d.target.value),placeholder:"제품 사양이나 스펙을 입력하세요",rows:3})}),t.jsx(Ee,{children:"수량 및 가격 정보"}),t.jsxs(Me,{children:[t.jsx(Z,{children:t.jsx(Ie,{label:"단위 *",value:a.unit,options:w,onChange:d=>c("unit",d),required:!0})}),t.jsx(Z,{children:t.jsx(X,{label:"단가",type:"number",value:a.unit_price||"",onChange:d=>c("unit_price",d.target.value?parseFloat(d.target.value):void 0),placeholder:"단가를 입력하세요",min:"0",step:"0.01"})}),t.jsx(Z,{children:t.jsx(Ie,{label:"통화",value:a.currency,options:k,onChange:d=>c("currency",d)})})]}),t.jsx(Ee,{children:"재고 관리 설정"}),t.jsxs(Me,{children:[t.jsx(Z,{children:t.jsx(X,{label:"최소 재고 *",type:"number",value:a.minimum_stock,onChange:d=>c("minimum_stock",parseInt(d.target.value)||0),placeholder:"최소 재고 수량",required:!0,min:"0"})}),t.jsx(Z,{children:t.jsx(X,{label:"최대 재고",type:"number",value:a.maximum_stock||"",onChange:d=>c("maximum_stock",d.target.value?parseInt(d.target.value):void 0),placeholder:"최대 재고 수량",min:"0"})}),t.jsx(Z,{children:t.jsx(X,{label:"재주문 포인트",type:"number",value:a.reorder_point||"",onChange:d=>c("reorder_point",d.target.value?parseInt(d.target.value):void 0),placeholder:"재주문 시점",min:"0"})})]}),t.jsx(Ee,{children:"위치 정보"}),t.jsxs(Me,{children:[t.jsx(Z,{children:t.jsx(X,{label:"창고",type:"text",value:a.warehouse||"",onChange:d=>c("warehouse",d.target.value),placeholder:"창고명을 입력하세요"})}),t.jsx(Z,{children:t.jsx(X,{label:"보관 위치",type:"text",value:a.location||"",onChange:d=>c("location",d.target.value),placeholder:"보관 위치를 입력하세요"})}),t.jsx(Z,{children:t.jsx(X,{label:"보관 구역",type:"text",value:a.storage_section||"",onChange:d=>c("storage_section",d.target.value),placeholder:"보관 구역을 입력하세요"})})]}),t.jsx(Ee,{children:"공급업체 정보"}),t.jsxs(Me,{children:[t.jsx(Z,{children:t.jsx(X,{label:"공급업체명",type:"text",value:a.supplier_name||"",onChange:d=>c("supplier_name",d.target.value),placeholder:"공급업체명을 입력하세요"})}),t.jsx(Z,{children:t.jsx(X,{label:"공급업체 연락처",type:"text",value:a.supplier_contact||"",onChange:d=>c("supplier_contact",d.target.value),placeholder:"연락처를 입력하세요"})})]}),t.jsx(Ee,{children:"설정 옵션"}),t.jsxs(Me,{children:[t.jsx(Z,{children:t.jsxs("label",{style:{display:"flex",alignItems:"center",gap:"8px",cursor:"pointer"},children:[t.jsx("input",{type:"checkbox",checked:a.is_consumable,onChange:d=>c("is_consumable",d.target.checked)}),"소모품 (사용 시 차감)"]})}),t.jsx(Z,{children:t.jsxs("label",{style:{display:"flex",alignItems:"center",gap:"8px",cursor:"pointer"},children:[t.jsx("input",{type:"checkbox",checked:a.requires_approval,onChange:d=>c("requires_approval",d.target.checked)}),"사용 시 승인 필요"]})})]}),t.jsx(Ee,{children:"추가 정보"}),t.jsx(Z,{children:t.jsx(X,{label:"태그",type:"text",value:i,onChange:d=>u(d.target.value),placeholder:"태그를 쉼표로 구분하여 입력하세요 (예: 전자제품, 필수품, 고가)"})}),t.jsx(Z,{children:t.jsx(X,{label:"설명",type:"textarea",value:a.description||"",onChange:d=>c("description",d.target.value),placeholder:"품목에 대한 설명을 입력하세요",rows:3})}),t.jsx(Z,{children:t.jsx(X,{label:"비고",type:"textarea",value:a.notes||"",onChange:d=>c("notes",d.target.value),placeholder:"추가 메모사항을 입력하세요",rows:2})}),t.jsxs(Co,{children:[t.jsx(O,{type:"button",variant:"secondary",onClick:r,disabled:n,children:"취소"}),t.jsx(O,{type:"submit",variant:"primary",loading:n,disabled:n,children:e?"수정":"추가"})]})]})]})},os=o.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 20px;
  min-height: 400px;
  background: white;
`,zo=o.h3`
  margin: 0 0 20px 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: #374151;
`,So=o.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 16px;
`,fe=o.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`,Io=o.div`
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #e5e7eb;
`,To=o.div`
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 4px;
`,Ro=o.label`
  font-size: 14px;
  font-weight: 500;
  color: #374151;
`,Po=o.button`
  width: 100%;
  padding: 8px 12px;
  border: 1px solid ${e=>e.hasError?"#ef4444":"#d1d5db"};
  border-radius: 4px;
  background: white;
  font-size: 14px;
  text-align: left;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: all 0.2s ease;
  
  &:hover {
    border-color: ${e=>e.hasError?"#ef4444":"#3b82f6"};
  }
  
  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 1px #3b82f6;
  }
  
  .placeholder {
    color: #9ca3af;
  }
  
  .chevron {
    transform: ${e=>e.isOpen?"rotate(180deg)":"rotate(0deg)"};
    transition: transform 0.2s ease;
    color: #6b7280;
  }
`,Oo=o.div`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  z-index: 1000;
  background: white;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  margin-top: 4px;
  max-height: 200px;
  overflow-y: auto;
  display: ${e=>e.isOpen?"block":"none"};
  
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: #f1f5f9;
  }
  
  &::-webkit-scrollbar-thumb {
    background: #cbd5e1;
    border-radius: 3px;
  }
  
  &::-webkit-scrollbar-thumb:hover {
    background: #94a3b8;
  }
`,Fo=o.div`
  padding: 8px 12px;
  cursor: pointer;
  font-size: 14px;
  background: ${e=>e.isSelected?"#3b82f6":"white"};
  color: ${e=>e.isSelected?"white":"#374151"};
  border-bottom: 1px solid #f3f4f6;
  
  &:last-child {
    border-bottom: none;
  }
  
  &:hover {
    background: ${e=>e.isSelected?"#3b82f6":"#f8fafc"};
  }
`,Lo=o.div`
  border: 2px dashed ${e=>e.isDragging?"#3b82f6":"#d1d5db"};
  border-radius: 8px;
  padding: 30px 20px;
  text-align: center;
  background: ${e=>e.isDragging?"#eff6ff":"#f9fafb"};
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  
  &:hover {
    border-color: #3b82f6;
    background: #eff6ff;
    transform: translateY(-2px);
  }
  
  /* 드래그 중일 때 효과 */
  ${e=>e.isDragging&&`
    border-color: #1d4ed8;
    background: #dbeafe;
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.15);
  `}
`,qo=o.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(59, 130, 246, 0.1);
  border-radius: 6px;
  display: ${e=>e.isDragging?"flex":"none"};
  align-items: center;
  justify-content: center;
  font-weight: 600;
  color: #1d4ed8;
  font-size: 18px;
  z-index: 10;
`,Mo=o.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 16px;
  margin-top: 20px;
  padding: 16px;
  background: #f8fafc;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
`,Do=o.div`
  position: relative;
  border-radius: 8px;
  overflow: hidden;
  border: 2px solid #e5e7eb;
  aspect-ratio: 1;
  background: white;
  transition: all 0.2s ease;
  
  &:hover {
    border-color: #3b82f6;
    transform: scale(1.02);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }
  
  .preview-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  
  .remove-button {
    position: absolute;
    top: 4px;
    right: 4px;
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background: rgba(239, 68, 68, 0.9);
    color: white;
    border: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    opacity: 0;
    transition: opacity 0.2s ease;
  }
  
  &:hover .remove-button {
    opacity: 1;
  }
`,Bo=o.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 12px;
  padding: 8px 12px;
  background: #f0f9ff;
  border: 1px solid #0ea5e9;
  border-radius: 6px;
  font-size: 14px;
  color: #0c4a6e;
  
  .icon {
    color: #0ea5e9;
  }
`,Ao=o.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px;
  background: #fef3c7;
  border: 1px solid #f59e0b;
  border-radius: 6px;
  color: #92400e;
  font-size: 14px;
  margin-top: 12px;
  
  .spinner {
    width: 16px;
    height: 16px;
    border: 2px solid #f59e0b;
    border-top: 2px solid transparent;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`,Uo=[{value:"H/W 개발팀",label:"H/W 개발팀"},{value:"S/W 개발팀",label:"S/W 개발팀"},{value:"총무부",label:"총무부"},{value:"사무관리팀",label:"사무관리팀"},{value:"영업팀",label:"영업팀"}],as=({item:e,onSubmit:s,onCancel:r,loading:n=!1,requireImages:a=!1})=>{const l=f.useRef(null),i=f.useRef(null),[u,x]=f.useState(!1),[c,m]=f.useState({received_quantity:1,receiver_name:"",receiver_email:"",department:"",received_date:new Date().toISOString().split("T")[0],location:"",condition:"good",notes:""}),[w,k]=f.useState([]),[d,$]=f.useState([]),[v,h]=f.useState(!1),[C,E]=f.useState(!1),q=f.useCallback({onDragEnter:p=>{p.preventDefault(),p.stopPropagation(),h(!0)},onDragLeave:p=>{p.preventDefault(),p.stopPropagation();const R=p.currentTarget.getBoundingClientRect(),U=p.clientX,M=p.clientY;(U<R.left||U>=R.right||M<R.top||M>=R.bottom)&&h(!1)},onDragOver:p=>{p.preventDefault(),p.stopPropagation(),p.dataTransfer.dropEffect="copy"},onDrop:p=>{p.preventDefault(),p.stopPropagation(),h(!1);const R=p.dataTransfer.files;R.length>0&&z(R)}},[]);H.useEffect(()=>()=>{d.forEach(p=>{p.startsWith("blob:")&&URL.revokeObjectURL(p)})},[d]);const b=(p,R)=>{m(U=>({...U,[p]:R}))},F=p=>{b("department",p),x(!1)},S=()=>{x(!u)},z=async p=>{if(!p||p.length===0)return;console.log("🔥 파일 선택됨:",p.length,"개"),E(!0);const R=Array.from(p).filter(M=>{const K=M.type.startsWith("image/"),V=M.size<=10*1024*1024;return K||console.warn("🚫 이미지가 아닌 파일 제외:",M.name),V||console.warn("🚫 크기 초과 파일 제외:",M.name,M.size),K&&V});if(R.length===0){alert(`유효한 이미지 파일이 없습니다.
(JPG, PNG 등 이미지 파일, 10MB 이하만 가능)`),E(!1);return}console.log("✅ 처리할 이미지 파일:",R.length,"개");const U=R.map((M,K)=>new Promise((V,ie)=>{const oe=new FileReader;oe.onload=()=>{console.log(`✅ 이미지 ${K+1} 로딩 완료:`,M.name),V(oe.result)},oe.onerror=()=>{console.error(`❌ 이미지 ${K+1} 로딩 실패:`,M.name),ie(new Error(`파일 읽기 실패: ${M.name}`))},oe.readAsDataURL(M)}));try{const M=await Promise.all(U);k(K=>[...K,...R]),$(K=>[...K,...M]),console.log("🎉 모든 이미지 처리 완료! 총",M.length,"개")}catch(M){console.error("❌ 이미지 처리 중 오류:",M),alert(`이미지 처리 중 오류가 발생했습니다:
${M.message}`)}finally{E(!1)}},P=p=>{console.log("📁 파일 입력 변경됨"),z(p.target.files)},W=p=>{console.log("🗑️ 이미지 제거:",p);const R=d[p];R&&R.startsWith("blob:")&&URL.revokeObjectURL(R),k(U=>U.filter((M,K)=>K!==p)),$(U=>U.filter((M,K)=>K!==p))},T=p=>{if(p.preventDefault(),a&&w.length===0){alert(`이미지 업로드가 필수입니다.
최소 1개의 이미지를 업로드해주세요.`);return}if(!c.receiver_name||!c.department){alert("수령자명과 부서는 필수 입력 항목입니다.");return}console.log("📤 폼 제출:",{formData:c,imageCount:w.length}),s(c,w)},N=[{value:"excellent",label:"최상"},{value:"good",label:"양호"},{value:"damaged",label:"손상"},{value:"defective",label:"불량"}];return e?t.jsxs(os,{children:[t.jsxs(zo,{children:[a?"수령 완료":"수령 추가"," - ",e.item_name]}),a&&t.jsx("div",{style:{padding:"12px 16px",background:"#fef3c7",border:"1px solid #f59e0b",borderRadius:"6px",color:"#92400e",fontSize:"0.875rem",marginBottom:"16px"},children:"⚠️ 수령 완료를 위해 이미지 업로드가 필수입니다."}),t.jsxs("form",{onSubmit:T,children:[t.jsxs(So,{children:[t.jsxs(fe,{children:[t.jsx("label",{children:"수령 수량 *"}),t.jsx("input",{type:"number",value:c.received_quantity,onChange:p=>b("received_quantity",parseInt(p.target.value)||1),min:"1",required:!0,style:{padding:"8px 12px",border:"1px solid #d1d5db",borderRadius:"4px",fontSize:"14px"}})]}),t.jsxs(fe,{children:[t.jsx("label",{children:"수령자명 *"}),t.jsx("input",{type:"text",value:c.receiver_name,onChange:p=>b("receiver_name",p.target.value),placeholder:"수령자명을 입력하세요",required:!0,style:{padding:"8px 12px",border:"1px solid #d1d5db",borderRadius:"4px",fontSize:"14px"}})]}),t.jsxs(fe,{children:[t.jsx("label",{children:"수령자 이메일"}),t.jsx("input",{type:"email",value:c.receiver_email,onChange:p=>b("receiver_email",p.target.value),placeholder:"이메일을 입력하세요",style:{padding:"8px 12px",border:"1px solid #d1d5db",borderRadius:"4px",fontSize:"14px"}})]}),t.jsx(fe,{children:t.jsxs(To,{ref:i,children:[t.jsx(Ro,{children:"부서 *"}),t.jsxs(Po,{type:"button",isOpen:u,onClick:S,children:[t.jsx("span",{className:c.department?"":"placeholder",children:c.department||"부서를 선택하세요"}),t.jsx(Is,{size:16,className:"chevron"})]}),t.jsx(Oo,{isOpen:u,children:Uo.map(p=>t.jsx(Fo,{isSelected:c.department===p.value,onClick:()=>F(p.value),children:p.label},p.value))})]})}),t.jsxs(fe,{children:[t.jsx("label",{children:"수령일 *"}),t.jsx("input",{type:"date",value:c.received_date,onChange:p=>b("received_date",p.target.value),required:!0,style:{padding:"8px 12px",border:"1px solid #d1d5db",borderRadius:"4px",fontSize:"14px"}})]}),t.jsxs(fe,{children:[t.jsx("label",{children:"수령 위치"}),t.jsx("input",{type:"text",value:c.location,onChange:p=>b("location",p.target.value),placeholder:"수령 위치를 입력하세요",style:{padding:"8px 12px",border:"1px solid #d1d5db",borderRadius:"4px",fontSize:"14px"}})]})]}),t.jsxs(fe,{children:[t.jsx("label",{children:"품목 상태"}),t.jsx("select",{value:c.condition,onChange:p=>b("condition",p.target.value),style:{padding:"8px 12px",border:"1px solid #d1d5db",borderRadius:"4px",fontSize:"14px"},children:N.map(p=>t.jsx("option",{value:p.value,children:p.label},p.value))})]}),t.jsxs(fe,{children:[t.jsx("label",{children:"비고"}),t.jsx("textarea",{value:c.notes,onChange:p=>b("notes",p.target.value),placeholder:"추가 메모사항을 입력하세요",rows:3,style:{padding:"8px 12px",border:"1px solid #d1d5db",borderRadius:"4px",fontSize:"14px",resize:"vertical"}})]}),t.jsxs(fe,{children:[t.jsxs("label",{children:["수령 이미지 ",a&&t.jsx("span",{style:{color:"#ef4444"},children:"*"})]}),t.jsxs(Lo,{isDragging:v,onClick:()=>{var p;return(p=l.current)==null?void 0:p.click()},...q,children:[t.jsx(qo,{isDragging:v,children:"📷 이미지를 놓아주세요!"}),t.jsxs("div",{style:{display:"flex",flexDirection:"column",alignItems:"center",gap:"16px"},children:[t.jsx(ye,{size:40,style:{color:v?"#1d4ed8":"#6b7280"}}),t.jsxs("div",{children:[t.jsx("div",{style:{fontSize:"18px",fontWeight:"600",marginBottom:"4px"},children:v?"여기에 이미지를 놓아주세요":"이미지를 업로드하세요"}),t.jsx("div",{style:{fontSize:"14px",color:"#6b7280"},children:"클릭하거나 드래그앤드롭으로 업로드 • JPG, PNG (최대 10MB)"})]})]}),t.jsx("input",{ref:l,type:"file",accept:"image/*",multiple:!0,onChange:P,style:{display:"none"}})]}),C&&t.jsxs(Ao,{children:[t.jsx("div",{className:"spinner"}),"이미지를 처리하고 있습니다..."]}),w.length>0&&t.jsxs(t.Fragment,{children:[t.jsxs(Bo,{children:[t.jsx(br,{size:16,className:"icon"}),t.jsxs("strong",{children:[w.length,"개"]})," 이미지가 선택되었습니다"]}),t.jsx(Mo,{children:d.map((p,R)=>t.jsxs(Do,{children:[t.jsx("img",{src:p,alt:`Preview ${R+1}`,className:"preview-image",onError:U=>{console.error(`❌ 이미지 로딩 실패 (index: ${R}):`,p.substring(0,50)),U.currentTarget.style.display="none"},onLoad:()=>{console.log(`✅ 이미지 로딩 성공 (index: ${R})`)}}),t.jsx("button",{type:"button",className:"remove-button",onClick:()=>W(R),title:"이미지 제거",children:t.jsx(ve,{size:14})})]},R))})]})]}),t.jsxs(Io,{children:[t.jsx(O,{type:"button",variant:"secondary",onClick:r,disabled:n,children:"취소"}),t.jsx(O,{type:"submit",variant:"primary",disabled:n||C||a&&w.length===0,style:{opacity:n||C||a&&w.length===0?.5:1,cursor:n||C||a&&w.length===0?"not-allowed":"pointer"},children:n?"처리 중...":C?"이미지 처리 중...":a?"수령 완료":"수령 추가"})]})]})]}):t.jsx(os,{children:t.jsx("div",{children:"아이템 정보를 불러올 수 없습니다."})})},Ko=o.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  max-width: 800px;
  margin: 0 auto;
`,Wo=o(te)`
  padding: 24px;
  
  .guide-header {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 20px;
    
    .guide-icon {
      padding: 8px;
      background: linear-gradient(135deg, #667eea, #764ba2);
      color: white;
      border-radius: 10px;
    }
    
    .guide-title {
      font-size: 1.25rem;
      font-weight: 600;
      color: #1f2937;
    }
  }
`,Qo=o.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`,_t=o.div`
  display: flex;
  align-items: flex-start;
  gap: 16px;
  padding: 16px;
  background: #f8fafc;
  border-radius: 12px;
  border-left: 4px solid #3b82f6;
  
  .step-number {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    background: #3b82f6;
    color: white;
    border-radius: 50%;
    font-weight: 600;
    font-size: 14px;
    flex-shrink: 0;
  }
  
  .step-content {
    flex: 1;
    
    .step-title {
      font-weight: 600;
      margin-bottom: 8px;
      color: #1f2937;
    }
    
    .step-description {
      color: #6b7280;
      line-height: 1.5;
      margin-bottom: 12px;
    }
    
    .step-details {
      background: white;
      padding: 12px;
      border-radius: 8px;
      border: 1px solid #e5e7eb;
      
      .detail-item {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 6px;
        font-size: 14px;
        
        &:last-child {
          margin-bottom: 0;
        }
        
        .bullet {
          width: 4px;
          height: 4px;
          background: #3b82f6;
          border-radius: 50%;
        }
      }
    }
  }
`,Go=o.div`
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 16px;
  background: #fef3c7;
  border: 1px solid #f59e0b;
  border-radius: 8px;
  
  .warning-icon {
    color: #f59e0b;
    flex-shrink: 0;
    margin-top: 2px;
  }
  
  .warning-content {
    .warning-title {
      font-weight: 600;
      color: #92400e;
      margin-bottom: 4px;
    }
    
    .warning-text {
      color: #92400e;
      font-size: 14px;
      line-height: 1.5;
    }
  }
`,Ho=o.div`
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 16px;
  background: #dbeafe;
  border: 1px solid #3b82f6;
  border-radius: 8px;
  
  .tip-icon {
    color: #3b82f6;
    flex-shrink: 0;
    margin-top: 2px;
  }
  
  .tip-content {
    .tip-title {
      font-weight: 600;
      color: #1e40af;
      margin-bottom: 4px;
    }
    
    .tip-text {
      color: #1e40af;
      font-size: 14px;
      line-height: 1.5;
    }
  }
`,Yo=o.div`
  .columns-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 12px;
    margin-top: 12px;
    
    .column-item {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 12px;
      background: white;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      
      .required-mark {
        color: #ef4444;
        font-weight: bold;
      }
      
      .column-name {
        font-weight: 500;
        color: #374151;
      }
    }
  }
`,Vo=({type:e})=>{const s=e==="purchase",a=s?[{name:"품목명",required:!0},{name:"수량",required:!0},{name:"요청자명",required:!0},{name:"부서",required:!0},{name:"구매사유",required:!0},{name:"사양",required:!1},{name:"예상단가",required:!1},{name:"공급업체",required:!1},{name:"카테고리",required:!1},{name:"긴급도",required:!1},{name:"프로젝트",required:!1},{name:"예산코드",required:!1}]:[{name:"품목코드",required:!0},{name:"품목명",required:!0},{name:"단위",required:!0},{name:"최소재고",required:!0},{name:"카테고리",required:!1},{name:"브랜드",required:!1},{name:"사양",required:!1},{name:"단가",required:!1},{name:"위치",required:!1},{name:"창고",required:!1},{name:"공급업체",required:!1},{name:"설명",required:!1}];return t.jsxs(Ko,{children:[t.jsxs(Wo,{children:[t.jsxs("div",{className:"guide-header",children:[t.jsx(Rs,{className:"guide-icon",size:24}),t.jsxs("div",{className:"guide-title",children:[s?"구매 요청":"품목"," Excel 업로드 가이드"]})]}),t.jsxs(Qo,{children:[t.jsxs(_t,{children:[t.jsx("div",{className:"step-number",children:"1"}),t.jsxs("div",{className:"step-content",children:[t.jsx("div",{className:"step-title",children:"템플릿 다운로드"}),t.jsx("div",{className:"step-description",children:"먼저 Excel 템플릿을 다운로드하여 올바른 형식을 확인하세요."}),t.jsxs("div",{className:"step-details",children:[t.jsxs("div",{className:"detail-item",children:[t.jsx(be,{size:16}),t.jsxs("span",{children:["'",s?"구매 요청":"품목"," 템플릿 다운로드' 버튼 클릭"]})]}),t.jsxs("div",{className:"detail-item",children:[t.jsx("div",{className:"bullet"}),t.jsx("span",{children:"템플릿에는 샘플 데이터와 입력 가이드가 포함되어 있습니다"})]}),t.jsxs("div",{className:"detail-item",children:[t.jsx("div",{className:"bullet"}),t.jsx("span",{children:"각 시트별로 상세한 설명과 옵션을 확인할 수 있습니다"})]})]})]})]}),t.jsxs(_t,{children:[t.jsx("div",{className:"step-number",children:"2"}),t.jsxs("div",{className:"step-content",children:[t.jsx("div",{className:"step-title",children:"데이터 입력"}),t.jsxs("div",{className:"step-description",children:["템플릿의 양식에 맞춰 ",s?"구매 요청":"품목"," 정보를 입력하세요."]}),t.jsx(Yo,{children:t.jsx("div",{className:"columns-grid",children:a.map((l,i)=>t.jsxs("div",{className:"column-item",children:[l.required&&t.jsx("span",{className:"required-mark",children:"*"}),t.jsx("span",{className:"column-name",children:l.name})]},i))})})]})]}),t.jsxs(_t,{children:[t.jsx("div",{className:"step-number",children:"3"}),t.jsxs("div",{className:"step-content",children:[t.jsx("div",{className:"step-title",children:"파일 저장 및 업로드"}),t.jsx("div",{className:"step-description",children:"입력이 완료되면 파일을 저장하고 업로드하세요."}),t.jsxs("div",{className:"step-details",children:[t.jsxs("div",{className:"detail-item",children:[t.jsx(Re,{size:16}),t.jsx("span",{children:"Excel 파일을 .xlsx 또는 .xls 형식으로 저장"})]}),t.jsxs("div",{className:"detail-item",children:[t.jsx(ye,{size:16}),t.jsx("span",{children:"'Excel 업로드' 버튼을 클릭하여 파일 선택"})]}),t.jsxs("div",{className:"detail-item",children:[t.jsx(Ne,{size:16}),t.jsx("span",{children:"업로드 완료 후 결과 확인"})]})]})]})]})]})]}),t.jsxs(Go,{children:[t.jsx(De,{className:"warning-icon",size:20}),t.jsxs("div",{className:"warning-content",children:[t.jsx("div",{className:"warning-title",children:"주의사항"}),t.jsxs("div",{className:"warning-text",children:["• 필수 컬럼(",a.filter(l=>l.required).map(l=>l.name).join(", "),")은 반드시 입력해야 합니다",t.jsx("br",{}),"• ",s?"요청자명과 부서는 정확히 입력해주세요":"품목코드는 고유해야 하며, 중복 시 기존 품목이 업데이트됩니다",t.jsx("br",{}),"• 파일 크기는 10MB를 초과할 수 없습니다",t.jsx("br",{}),"• 최대 1,000개 항목까지 한 번에 업로드 가능합니다"]})]})]}),t.jsxs(Ho,{children:[t.jsx(Ps,{className:"tip-icon",size:20}),t.jsxs("div",{className:"tip-content",children:[t.jsx("div",{className:"tip-title",children:"유용한 팁"}),t.jsxs("div",{className:"tip-text",children:["• 템플릿의 '사용안내' 시트에서 자세한 가이드를 확인하세요",t.jsx("br",{}),"• ",s?"카테고리, 긴급도, 부서 옵션":"카테고리 예시와 데이터 형식","은 별도 시트에서 참조 가능합니다",t.jsx("br",{}),"• 업로드 실패 시 오류 메시지를 확인하고 해당 행의 데이터를 수정하세요",t.jsx("br",{}),"• 대량 데이터는 여러 번에 나누어 업로드하는 것을 권장합니다"]})]})]})]})},Jo=o.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
  min-height: 500px;
`,Xo=o(te)`
  background: linear-gradient(135deg, #f0f9ff, #e0f2fe);
  border-left: 4px solid #0ea5e9;
  
  .info-header {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 16px;
    
    .info-icon {
      color: #0ea5e9;
    }
    
    .info-title {
      font-size: 1.1rem;
      font-weight: 600;
      color: #0c4a6e;
    }
  }
  
  .info-content {
    .info-item {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 8px;
      font-size: 14px;
      color: #0c4a6e;
      
      &:last-child {
        margin-bottom: 0;
      }
      
      .bullet {
        width: 4px;
        height: 4px;
        background: #0ea5e9;
        border-radius: 50%;
        flex-shrink: 0;
      }
    }
  }
`,Zo=o.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  
  .template-header {
    .template-title {
      font-size: 1.1rem;
      font-weight: 600;
      margin-bottom: 8px;
      color: #1f2937;
    }
    
    .template-description {
      color: #6b7280;
      font-size: 14px;
      line-height: 1.5;
    }
  }
  
  .template-actions {
    display: flex;
    gap: 12px;
    align-items: center;
    margin-top: 12px;
  }
`,ea=o.div`
  border: 2px dashed ${e=>e.disabled?"#d1d5db":e.isDragOver?"#3b82f6":"#d1d5db"};
  border-radius: 12px;
  padding: 48px 24px;
  text-align: center;
  background: ${e=>e.disabled?"#f9fafb":e.isDragOver?"#eff6ff":"#ffffff"};
  transition: all 0.3s ease;
  cursor: ${e=>e.disabled?"not-allowed":"pointer"};
  opacity: ${e=>e.disabled?.6:1};
  position: relative;
  
  &:hover {
    border-color: ${e=>e.disabled?"#d1d5db":"#3b82f6"};
    background: ${e=>e.disabled?"#f9fafb":"#eff6ff"};
  }
  
  .upload-icon {
    margin-bottom: 16px;
    color: ${e=>e.disabled?"#9ca3af":"#3b82f6"};
    opacity: 0.8;
  }
  
  .upload-title {
    font-size: 1.2rem;
    font-weight: 600;
    margin-bottom: 8px;
    color: #1f2937;
  }
  
  .upload-subtitle {
    color: #6b7280;
    font-size: 14px;
    margin-bottom: 16px;
    line-height: 1.5;
  }
  
  .upload-hint {
    color: #9ca3af;
    font-size: 12px;
  }
  
  .file-info {
    margin-top: 12px;
    padding: 12px;
    background: #f0f9ff;
    border-radius: 8px;
    border: 1px solid #bae6fd;
    
    .file-name {
      font-weight: 500;
      color: #0c4a6e;
      margin-bottom: 4px;
    }
    
    .file-size {
      font-size: 12px;
      color: #0369a1;
    }
  }
`,ta=o.div`
  .progress-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 12px;
    
    .progress-title {
      font-weight: 500;
      color: #1f2937;
    }
    
    .progress-percentage {
      font-size: 14px;
      color: #6b7280;
      font-weight: 600;
    }
  }
  
  .progress-bar {
    width: 100%;
    height: 10px;
    background: #f3f4f6;
    border-radius: 5px;
    overflow: hidden;
    box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.1);
    
    .progress-fill {
      height: 100%;
      background: linear-gradient(90deg, #3b82f6, #1d4ed8);
      transition: width 0.3s ease;
      border-radius: 5px;
      position: relative;
      
      &::after {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
        animation: shimmer 2s infinite;
      }
    }
  }
  
  @keyframes shimmer {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(100%); }
  }
  
  .progress-status {
    margin-top: 12px;
    font-size: 14px;
    color: #6b7280;
    display: flex;
    align-items: center;
    gap: 8px;
    
    .status-icon {
      animation: spin 1s linear infinite;
    }
  }
  
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`,sa=o.div`
  .result-header {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 16px;
    
    .result-icon {
      color: ${e=>e.success?"#10b981":"#ef4444"};
    }
    
    .result-title {
      font-size: 1.2rem;
      font-weight: 600;
      color: ${e=>e.success?"#065f46":"#991b1b"};
    }
  }
  
  .result-summary {
    background: ${e=>e.success?"#ecfdf5":"#fef2f2"};
    border: 1px solid ${e=>e.success?"#a7f3d0":"#fecaca"};
    border-radius: 8px;
    padding: 20px;
    margin-bottom: 20px;
    
    .summary-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 16px;
    }
    
    .summary-item {
      text-align: center;
      
      .value {
        font-size: 1.5rem;
        font-weight: 700;
        color: ${e=>e.success?"#059669":"#dc2626"};
        margin-bottom: 4px;
      }
      
      .label {
        font-size: 12px;
        color: ${e=>e.success?"#065f46":"#991b1b"};
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }
    }
  }
  
  .error-details {
    max-height: 300px;
    overflow-y: auto;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    background: white;
    
    .error-header {
      padding: 12px 16px;
      background: #fef2f2;
      border-bottom: 1px solid #fecaca;
      font-weight: 600;
      color: #991b1b;
      position: sticky;
      top: 0;
      z-index: 1;
    }
    
    .error-item {
      padding: 12px 16px;
      border-bottom: 1px solid #f3f4f6;
      
      &:last-child {
        border-bottom: none;
      }
      
      &:hover {
        background: #f9fafb;
      }
      
      .error-row {
        font-weight: 600;
        color: #dc2626;
        margin-bottom: 4px;
        font-size: 14px;
      }
      
      .error-field {
        font-weight: 500;
        color: #6b7280;
        margin-bottom: 4px;
        font-size: 13px;
      }
      
      .error-message {
        font-size: 13px;
        color: #374151;
        line-height: 1.4;
      }
    }
  }
  
  .success-items {
    margin-top: 20px;
    
    .items-header {
      font-weight: 600;
      margin-bottom: 12px;
      color: #1f2937;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    
    .items-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 8px;
      max-height: 200px;
      overflow-y: auto;
      padding: 12px;
      background: #f8fafc;
      border-radius: 8px;
      border: 1px solid #e2e8f0;
      
      .item-code {
        display: inline-block;
        padding: 6px 10px;
        background: linear-gradient(135deg, #e0f2fe, #bae6fd);
        color: #0c4a6e;
        border-radius: 6px;
        font-size: 12px;
        font-weight: 500;
        font-family: 'Courier New', monospace;
        border: 1px solid #7dd3fc;
        transition: all 0.2s ease;
        
        &:hover {
          background: linear-gradient(135deg, #bae6fd, #7dd3fc);
          transform: translateY(-1px);
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
      }
    }
  }
`,ra=o.input`
  display: none;
`,na=o.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px solid #e5e7eb;
  
  .left-actions {
    display: flex;
    gap: 12px;
  }
  
  .right-actions {
    display: flex;
    gap: 12px;
  }
`,oa=o.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  z-index: 10;
`,aa=({isOpen:e,onClose:s,onSuccess:r})=>{const n=Be(),[a,l]=f.useState(!1),[i,u]=f.useState(null),[x,c]=f.useState(0),[m,w]=f.useState(null),[k,d]=f.useState(!1),[$,v]=f.useState("upload"),h=ne({mutationFn:ut.uploadExcel,onMutate:()=>{v("processing"),c(0);const N=setInterval(()=>{c(p=>p>=90?(clearInterval(N),90):p+Math.random()*10)},500);return{progressInterval:N}},onSuccess:(N,p,R)=>{R!=null&&R.progressInterval&&clearInterval(R.progressInterval),c(100),v("result"),w(N),n.invalidateQueries({queryKey:["unified-inventory"]}),n.invalidateQueries({queryKey:["unified-inventory-stats"]});const U=N.updated_count&&N.updated_count>0?`${N.created_count}개 신규 등록, ${N.updated_count}개 업데이트 완료!`:`${N.created_count}개 품목이 성공적으로 등록되었습니다!`;_.success(U,{position:"top-center",autoClose:5e3}),r()},onError:(N,p,R)=>{R!=null&&R.progressInterval&&clearInterval(R.progressInterval),v("result"),c(0),w({success:!1,created_count:0,created_items:[],errors:[{row:0,field:"file",message:N.message||"업로드 중 알 수 없는 오류가 발생했습니다."}]}),_.error(N.message||"업로드에 실패했습니다.",{position:"top-center",autoClose:7e3})}}),C=ne({mutationFn:ut.downloadTemplate,onSuccess:()=>{_.success("템플릿이 성공적으로 다운로드되었습니다!",{position:"top-right"})},onError:N=>{_.error(N.message||"템플릿 다운로드에 실패했습니다.",{position:"top-right"})}}),E=f.useCallback(N=>{if(!N)return;if(console.log("📁 파일 선택:",N.name,N.size),!N.name.match(/\.(xlsx|xls)$/i)){_.error("Excel 파일만 업로드 가능합니다 (.xlsx, .xls)",{position:"top-center"});return}const p=10*1024*1024;if(N.size>p){_.error("파일 크기는 10MB를 초과할 수 없습니다.",{position:"top-center"});return}u(N),w(null),v("upload"),_.success("파일이 선택되었습니다. 업로드 버튼을 클릭하세요.",{position:"top-right",autoClose:3e3})},[]),q=f.useCallback(()=>{if(!i){_.error("파일을 먼저 선택해주세요.",{position:"top-center"});return}console.log("🚀 업로드 시작:",i.name),h.mutate(i)},[i,h]),b=f.useCallback(N=>{if(N.preventDefault(),l(!1),h.isPending)return;const p=N.dataTransfer.files;p.length>0&&E(p[0])},[h.isPending,E]),F=f.useCallback(N=>{N.preventDefault(),h.isPending||l(!0)},[h.isPending]),S=f.useCallback(()=>{l(!1)},[]),z=f.useCallback(()=>{if(h.isPending)return;const N=document.getElementById("inventory-excel-file-input");N==null||N.click()},[h.isPending]),P=f.useCallback(()=>{u(null),w(null),c(0),v("upload")},[]),W=f.useCallback(()=>{h.isPending&&!window.confirm("업로드가 진행 중입니다. 정말로 취소하시겠습니까?")||(P(),d(!1),s())},[h.isPending,P,s]),T=N=>{if(N===0)return"0 Bytes";const p=1024,R=["Bytes","KB","MB","GB"],U=Math.floor(Math.log(N)/Math.log(p));return parseFloat((N/Math.pow(p,U)).toFixed(2))+" "+R[U]};return t.jsx(Te,{isOpen:e,onClose:W,title:"품목 Excel 일괄 업로드",size:"xl",children:k?t.jsxs("div",{children:[t.jsx(Vo,{type:"inventory"}),t.jsx("div",{style:{display:"flex",justifyContent:"center",marginTop:"24px",paddingTop:"24px",borderTop:"1px solid #e5e7eb"},children:t.jsxs(O,{variant:"outline",onClick:()=>d(!1),children:[t.jsx(yr,{size:16}),"업로드로 돌아가기"]})})]}):t.jsxs(Jo,{children:[t.jsxs(Xo,{children:[t.jsxs("div",{className:"info-header",children:[t.jsx(vr,{className:"info-icon",size:20}),t.jsx("div",{className:"info-title",children:"품목 일괄 등록 안내"})]}),t.jsxs("div",{className:"info-content",children:[t.jsxs("div",{className:"info-item",children:[t.jsx("div",{className:"bullet"}),t.jsx("span",{children:"Excel 템플릿을 다운로드하여 품목 정보를 입력해주세요."})]}),t.jsxs("div",{className:"info-item",children:[t.jsx("div",{className:"bullet"}),t.jsx("span",{children:"품목코드는 고유해야 하며, 중복 시 기존 품목이 업데이트됩니다."})]}),t.jsxs("div",{className:"info-item",children:[t.jsx("div",{className:"bullet"}),t.jsx("span",{children:"최대 1,000개 품목까지 한 번에 업로드할 수 있습니다."})]}),t.jsxs("div",{className:"info-item",children:[t.jsx("div",{className:"bullet"}),t.jsx("span",{children:"파일 크기는 10MB를 초과할 수 없습니다."})]})]})]}),t.jsxs(Zo,{children:[t.jsxs("div",{className:"template-header",children:[t.jsx("div",{className:"template-title",children:"📋 1단계: Excel 템플릿 다운로드"}),t.jsx("div",{className:"template-description",children:"먼저 템플릿을 다운로드하여 올바른 형식을 확인하세요. 템플릿에는 필수 컬럼과 샘플 데이터가 포함되어 있습니다."})]}),t.jsxs("div",{className:"template-actions",children:[t.jsxs(O,{variant:"primary",onClick:()=>C.mutate(),disabled:C.isPending,loading:C.isPending,children:[t.jsx(be,{size:16}),"품목 등록 템플릿 다운로드"]}),t.jsxs(O,{variant:"outline",onClick:()=>d(!0),size:"sm",children:[t.jsx(Ps,{size:16}),"상세 가이드 보기"]})]})]}),$==="upload"&&t.jsxs("div",{children:[t.jsx("div",{style:{fontSize:"1.1rem",fontWeight:"600",marginBottom:"12px",color:"#1f2937"},children:"📤 2단계: Excel 파일 업로드"}),t.jsxs(ea,{isDragOver:a,disabled:h.isPending,onDrop:b,onDragOver:F,onDragLeave:S,onClick:z,children:[h.isPending&&t.jsx(oa,{children:t.jsx(Rt,{size:32,className:"status-icon"})}),t.jsx(ce,{size:48,className:"upload-icon"}),t.jsx("div",{className:"upload-title",children:i?"파일이 선택되었습니다":"Excel 파일을 선택하세요"}),t.jsx("div",{className:"upload-subtitle",children:i?"아래 업로드 버튼을 클릭하여 업로드를 시작하세요":"파일을 여기에 끌어다 놓거나 클릭하여 선택하세요"}),i&&t.jsxs("div",{className:"file-info",children:[t.jsxs("div",{className:"file-name",children:["📄 ",i.name]}),t.jsxs("div",{className:"file-size",children:["파일 크기: ",T(i.size)]})]}),t.jsx("div",{className:"upload-hint",children:".xlsx, .xls 파일만 지원됩니다 (최대 10MB)"})]})]}),t.jsx(ra,{id:"inventory-excel-file-input",type:"file",accept:".xlsx,.xls",onChange:N=>{var R;const p=(R=N.target.files)==null?void 0:R[0];p&&E(p)},disabled:h.isPending}),$==="processing"&&t.jsxs(ta,{children:[t.jsxs("div",{className:"progress-header",children:[t.jsx("div",{className:"progress-title",children:"📊 업로드 진행중..."}),t.jsxs("div",{className:"progress-percentage",children:[Math.round(x),"%"]})]}),t.jsx("div",{className:"progress-bar",children:t.jsx("div",{className:"progress-fill",style:{width:`${x}%`}})}),t.jsxs("div",{className:"progress-status",children:[t.jsx(Rt,{size:16,className:"status-icon"}),t.jsx("span",{children:"Excel 파일을 분석하고 품목을 생성하는 중입니다..."})]})]}),$==="result"&&m&&t.jsxs(sa,{success:m.success,children:[t.jsxs("div",{className:"result-header",children:[t.jsx("div",{className:"result-icon",children:m.success?t.jsx(Ne,{size:32}):t.jsx(me,{size:32})}),t.jsx("div",{className:"result-title",children:m.success?"🎉 업로드 완료!":"❌ 업로드 실패"})]}),t.jsx("div",{className:"result-summary",children:t.jsxs("div",{className:"summary-grid",children:[t.jsxs("div",{className:"summary-item",children:[t.jsx("div",{className:"value",children:m.created_count}),t.jsx("div",{className:"label",children:"신규 등록"})]}),m.updated_count&&m.updated_count>0&&t.jsxs("div",{className:"summary-item",children:[t.jsx("div",{className:"value",children:m.updated_count}),t.jsx("div",{className:"label",children:"업데이트"})]}),m.total_processed&&t.jsxs("div",{className:"summary-item",children:[t.jsx("div",{className:"value",children:m.total_processed}),t.jsx("div",{className:"label",children:"총 처리"})]}),m.errors&&m.errors.length>0&&t.jsxs("div",{className:"summary-item",children:[t.jsx("div",{className:"value",children:m.errors.length}),t.jsx("div",{className:"label",children:"오류 발생"})]})]})}),m.success&&m.created_items.length>0&&t.jsxs("div",{className:"success-items",children:[t.jsxs("div",{className:"items-header",children:[t.jsx(ce,{size:16}),"생성된 품목 코드 (",m.created_items.length,"개)"]}),t.jsxs("div",{className:"items-grid",children:[m.created_items.slice(0,50).map((N,p)=>t.jsx("span",{className:"item-code",children:N},p)),m.created_items.length>50&&t.jsxs("span",{className:"item-code",children:["+",m.created_items.length-50,"개 더"]})]})]}),m.errors&&m.errors.length>0&&t.jsxs("div",{className:"error-details",children:[t.jsxs("div",{className:"error-header",children:["오류 상세 내역 (",m.errors.length,"건)"]}),m.errors.slice(0,20).map((N,p)=>t.jsxs("div",{className:"error-item",children:[t.jsxs("div",{className:"error-row",children:["📍 행 ",N.row]}),t.jsxs("div",{className:"error-field",children:["필드: ",N.field]}),t.jsx("div",{className:"error-message",children:N.message})]},p)),m.errors.length>20&&t.jsx("div",{className:"error-item",children:t.jsxs("div",{className:"error-message",style:{textAlign:"center",fontStyle:"italic"},children:["... 및 ",m.errors.length-20,"개의 추가 오류"]})})]})]}),t.jsxs(na,{children:[t.jsx("div",{className:"left-actions",children:$==="result"&&t.jsxs(O,{variant:"outline",onClick:P,children:[t.jsx(ct,{size:16}),"다시 업로드"]})}),t.jsxs("div",{className:"right-actions",children:[t.jsxs(O,{variant:"outline",onClick:W,disabled:h.isPending,children:[t.jsx(ve,{size:16}),h.isPending?"업로드 중...":"닫기"]}),i&&$==="upload"&&t.jsxs(O,{onClick:q,disabled:h.isPending,loading:h.isPending,children:[t.jsx(ye,{size:16}),"업로드 시작"]})]})]})]})})},ia=o.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
`,la=o.div`
  background: white;
  border-radius: 12px;
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.15);
`,ca=o.div`
  padding: 24px;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: center;
  
  h2 {
    margin: 0;
    font-size: 1.5rem;
    font-weight: 600;
    color: #111827;
  }
`,da=o.div`
  padding: 24px;
  max-height: calc(90vh - 140px);
  overflow-y: auto;
`,pa=o.div`
  margin-bottom: 24px;
  padding: 16px;
  background: ${e=>e.hasFile?"#f0f9ff":"#fefce8"};
  border-radius: 8px;
  border: 1px solid ${e=>e.hasFile?"#bfdbfe":"#fde047"};
  
  .current-file-title {
    font-weight: 600;
    color: ${e=>e.hasFile?"#1e40af":"#a16207"};
    margin-bottom: 8px;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  
  .current-file-info {
    color: #374151;
    font-size: 0.9rem;
    margin-bottom: 12px;
  }
  
  .current-file-actions {
    display: flex;
    gap: 8px;
  }
`,ua=o.div`
  border: 2px dashed ${e=>e.hasError?"#ef4444":e.dragOver?"#3b82f6":"#d1d5db"};
  border-radius: 12px;
  padding: 48px 24px;
  text-align: center;
  background: ${e=>e.hasError?"#fef2f2":e.dragOver?"#eff6ff":"#f9fafb"};
  transition: all 0.2s ease;
  cursor: pointer;
  margin-bottom: 24px;
  
  &:hover {
    border-color: ${e=>e.hasError?"#ef4444":"#3b82f6"};
    background: ${e=>e.hasError?"#fef2f2":"#eff6ff"};
  }
  
  .upload-icon {
    margin-bottom: 16px;
    color: ${e=>e.hasError?"#ef4444":e.dragOver?"#3b82f6":"#6b7280"};
  }
  
  .upload-title {
    font-size: 1.125rem;
    font-weight: 600;
    color: ${e=>e.hasError?"#dc2626":"#374151"};
    margin-bottom: 8px;
  }
  
  .upload-subtitle {
    color: ${e=>e.hasError?"#dc2626":"#6b7280"};
    font-size: 0.875rem;
    line-height: 1.5;
  }
`,xa=o.div`
  margin-top: 20px;
  padding: 16px;
  background: #f0fdf4;
  border-radius: 8px;
  border: 1px solid #bbf7d0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  
  .file-info {
    display: flex;
    align-items: center;
    gap: 12px;
    flex: 1;
    
    .file-icon {
      color: #16a34a;
    }
    
    .file-details {
      .file-name {
        font-weight: 600;
        color: #166534;
        margin-bottom: 4px;
        word-break: break-all;
      }
      
      .file-size {
        font-size: 0.85rem;
        color: #16a34a;
      }
    }
  }
  
  .remove-file {
    margin-left: 12px;
  }
`,ma=o.div`
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 32px;
  padding-top: 24px;
  border-top: 1px solid #e5e7eb;
`,ha=o.button`
  background: none;
  border: none;
  padding: 8px;
  border-radius: 6px;
  cursor: pointer;
  color: #6b7280;
  transition: all 0.2s;
  
  &:hover {
    background: #f3f4f6;
    color: #374151;
  }
`,is=o.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px;
  border-radius: 8px;
  font-size: 0.875rem;
  margin-top: 16px;
  
  ${e=>{switch(e.type){case"success":return`
          background: #f0fdf4;
          color: #166534;
          border: 1px solid #bbf7d0;
        `;case"error":return`
          background: #fef2f2;
          color: #dc2626;
          border: 1px solid #fecaca;
        `;case"warning":return`
          background: #fffbeb;
          color: #92400e;
          border: 1px solid #fde68a;
        `}}}
`,ga=({isOpen:e,item:s,onClose:r,onSubmit:n,loading:a=!1})=>{const[l,i]=f.useState(null),[u,x]=f.useState(!1),[c,m]=f.useState(""),[w,k]=f.useState(null);if(!e||!s)return null;const d=z=>["application/pdf","image/jpeg","image/png","image/jpg","application/vnd.openxmlformats-officedocument.spreadsheetml.sheet","application/vnd.ms-excel"].includes(z.type)?z.size>10*1024*1024?{isValid:!1,message:"파일 크기는 10MB를 초과할 수 없습니다.",type:"error"}:z.size>5*1024*1024?{isValid:!0,message:"파일 크기가 큽니다. 업로드에 시간이 걸릴 수 있습니다.",type:"warning"}:{isValid:!0,message:"업로드 가능한 파일입니다.",type:"success"}:{isValid:!1,message:"PDF, 이미지 파일 또는 Excel 파일만 업로드 가능합니다.",type:"error"},$=f.useCallback(z=>{m("");const P=d(z);k(P),P.isValid?i(z):i(null)},[]),v=f.useCallback(z=>{z.preventDefault(),x(!1);const P=Array.from(z.dataTransfer.files);if(P.length>1){k({type:"error",message:"한 번에 하나의 파일만 업로드할 수 있습니다."});return}const W=P[0];W&&$(W)},[$]),h=f.useCallback(()=>{const z=document.createElement("input");z.type="file",z.accept=".pdf,.jpg,.jpeg,.png,.xlsx,.xls",z.onchange=P=>{var T;const W=(T=P.target.files)==null?void 0:T[0];W&&$(W)},z.click()},[$]),C=()=>{l&&(m(""),n(l),i(null),k(null))},E=()=>{if(s.transaction_document_url){const z=s.transaction_document_url.startsWith("http")?s.transaction_document_url:`http://221.44.183.165:8000${s.transaction_document_url}`;window.open(z,"_blank")}},q=()=>{i(null),k(null),m("")},b=z=>{if(z===0)return"0 Bytes";const P=1024,W=["Bytes","KB","MB","GB"],T=Math.floor(Math.log(z)/Math.log(P));return parseFloat((z/Math.pow(P,T)).toFixed(2))+" "+W[T]},F=z=>z.includes("pdf")?"📄":z.includes("image")?"🖼️":z.includes("excel")||z.includes("spreadsheet")?"📊":"📄",S=!!s.transaction_document_url;return t.jsx(ia,{onClick:r,children:t.jsxs(la,{onClick:z=>z.stopPropagation(),children:[t.jsxs(ca,{children:[t.jsxs("h2",{children:["거래명세서 관리 - ",s.item_name]}),t.jsx(ha,{onClick:r,children:t.jsx(ve,{size:20})})]}),t.jsxs(da,{children:[t.jsxs(pa,{hasFile:S,children:[t.jsx("div",{className:"current-file-title",children:S?t.jsxs(t.Fragment,{children:[t.jsx(Ne,{size:18}),"현재 업로드된 거래명세서"]}):t.jsxs(t.Fragment,{children:[t.jsx(me,{size:18}),"거래명세서가 업로드되지 않음"]})}),S?t.jsxs(t.Fragment,{children:[t.jsxs("div",{className:"current-file-info",children:["업로드일: ",s.transaction_upload_date?new Date(s.transaction_upload_date).toLocaleDateString("ko-KR",{year:"numeric",month:"long",day:"numeric",hour:"2-digit",minute:"2-digit"}):"정보 없음",s.transaction_uploaded_by&&t.jsxs(t.Fragment,{children:[" • 업로드자: ",s.transaction_uploaded_by]})]}),t.jsx("div",{className:"current-file-actions",children:t.jsxs(O,{size:"sm",variant:"outline",onClick:E,style:{background:"#dbeafe",color:"#1d4ed8",border:"1px solid #3b82f6"},children:[t.jsx(jr,{size:14}),"현재 파일 보기"]})})]}):t.jsx("div",{className:"current-file-info",children:"이 품목에는 아직 거래명세서가 업로드되지 않았습니다. 구매 관련 서류를 체계적으로 관리하기 위해 거래명세서를 업로드해 주세요."})]}),t.jsxs(ua,{dragOver:u,hasError:!!c,onDragOver:z=>{z.preventDefault(),x(!0)},onDragLeave:()=>x(!1),onDrop:v,onClick:h,children:[t.jsx("div",{className:"upload-icon",children:t.jsx(ye,{size:48})}),t.jsx("div",{className:"upload-title",children:S?"새 파일로 교체":"거래명세서 파일 업로드"}),t.jsxs("div",{className:"upload-subtitle",children:["PDF, 이미지 파일 또는 Excel 파일을 드래그하거나 클릭하여 선택하세요",t.jsx("br",{}),t.jsx("strong",{children:"지원 형식:"})," PDF, JPG, PNG, XLSX, XLS",t.jsx("br",{}),t.jsx("strong",{children:"최대 크기:"})," 10MB"]})]}),c&&t.jsxs(is,{type:"error",children:[t.jsx(me,{size:16}),c]}),w&&t.jsxs(is,{type:w.type,children:[w.type==="success"&&t.jsx(Ne,{size:16}),w.type==="error"&&t.jsx(me,{size:16}),w.type==="warning"&&t.jsx(me,{size:16}),w.message]}),l&&t.jsxs(xa,{children:[t.jsxs("div",{className:"file-info",children:[t.jsx("div",{style:{fontSize:"1.5rem"},children:F(l.type)}),t.jsxs("div",{className:"file-details",children:[t.jsx("div",{className:"file-name",children:l.name}),t.jsxs("div",{className:"file-size",children:[b(l.size)," • ",l.type]})]})]}),t.jsx("div",{className:"remove-file",children:t.jsx(O,{size:"sm",variant:"outline",onClick:q,title:"파일 제거",children:t.jsx(ve,{size:16})})})]}),t.jsxs("div",{style:{marginTop:"20px",padding:"16px",background:"#fef3c7",borderRadius:"8px",fontSize:"0.875rem",color:"#92400e"},children:[t.jsx("strong",{children:"💡 팁:"})," 거래명세서를 업로드하면 해당 품목의 구매 관련 서류를 체계적으로 관리할 수 있습니다. 업로드된 파일은 언제든지 조회하고 다운로드할 수 있으며, 새 파일로 교체도 가능합니다."]})]}),t.jsx("div",{style:{padding:"24px"},children:t.jsxs(ma,{children:[t.jsx(O,{variant:"secondary",onClick:r,disabled:a,children:"취소"}),t.jsx(O,{variant:"primary",onClick:C,disabled:!l||a||(w==null?void 0:w.type)==="error",loading:a,children:a?"업로드 중...":S?"파일 교체":"업로드 등록"})]})})]})})},ls=o.div`
  padding: 20px;
  
  /* 🔥 테이블 세로 가운데 정렬 강제 적용 */
  table {
    td, th {
      vertical-align: middle !important;
      padding: 12px;
    }
    
    tbody tr {
      height: 80px; /* 행 높이를 고정하여 일관성 유지 */
    }
    
    /* 호버 효과 개선 */
    tbody tr:hover {
      background-color: #f8fafc;
    }
  }
`,fa=o.h1`
  font-size: 2rem;
  font-weight: 600;
  margin-bottom: 8px;
  color: ${e=>e.theme.colors.text};
`,ba=o.p`
  color: ${e=>e.theme.colors.textSecondary};
  margin-bottom: 30px;
  font-size: 1rem;
`,ya=o.div`
  display: flex;
  gap: 15px;
  margin-bottom: 20px;
  flex-wrap: wrap;
  align-items: center;
`,va=o.div`
  display: flex;
  gap: 10px;
  margin-left: auto;
`,ja=o.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
`,rt=o(te)`
  text-align: center;
  background: ${e=>e.color?`linear-gradient(135deg, ${e.color}20 0%, ${e.color}10 100%)`:"white"};
  border-left: 4px solid ${e=>e.color||e.theme.colors.primary};
  
  h3 {
    font-size: 2rem;
    margin-bottom: 5px;
    color: ${e=>e.color||e.theme.colors.primary};
  }
  
  p {
    font-size: 0.9rem;
    color: ${e=>e.theme.colors.textSecondary};
  }
`,wa=o.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 0.85rem;
  font-weight: 500;
  background: ${e=>e.hasReceipts?"#10B98120":"#F59E0B20"};
  color: ${e=>e.hasReceipts?"#10B981":"#F59E0B"};
`,$a=o.div`
  display: flex;
  gap: 5px;
  align-items: center;
  justify-content: center;
  height: 100%;
  min-height: 40px;
`;o.div`
  display: flex;
  align-items: center;
  gap: 8px;
  
  .stock-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: ${e=>{switch(e.stockLevel){case"high":return"#10B981";case"medium":return"#F59E0B";case"low":return"#EF4444";case"out":return"#6B7280";default:return"#6B7280"}}};
  }
  
  .stock-text {
    font-weight: 500;
  }
`;const ka=o.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  justify-content: center;
  
  .main-quantity {
    font-weight: bold;
    font-size: 0.95rem;
  }
  
  .sub-info {
    font-size: 0.8rem;
    color: #666;
  }
`,cs=o.div`
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
  max-width: 300px;
  align-items: center;
  justify-content: center;
  
  .thumbnail {
    width: 60px;
    height: 60px;
    object-fit: cover;
    border-radius: 4px;
    border: 1px solid #e5e7eb;
    transition: all 0.2s ease;
    
    &:hover {
      transform: scale(1.05);
      border-color: #3b82f6;
      box-shadow: 0 2px 8px rgba(59, 130, 246, 0.2);
    }
  }
  
  .more-images {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 60px;
    height: 60px;
    background: #f3f4f6;
    border-radius: 4px;
    font-size: 0.75rem;
    color: #6b7280;
    border: 1px solid #e5e7eb;
  }
  
  .no-image {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 60px;
    height: 60px;
    background: #f9fafb;
    border-radius: 4px;
    font-size: 0.7rem;
    color: #9ca3af;
    border: 1px dashed #d1d5db;
  }
`,ds=o.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 20px;
`,ps=o.div`
  position: relative;
  max-width: 90vw;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  background: white;
  border-radius: 8px;
  overflow: hidden;
`,us=o.div`
  display: flex;
  justify-content: between;
  align-items: center;
  padding: 15px 20px;
  background: #f8f9fa;
  border-bottom: 1px solid #e9ecef;
  
  h3 {
    margin: 0;
    flex: 1;
    font-size: 1.1rem;
    color: #333;
  }
`,xs=o.div`
  display: flex;
  gap: 10px;
  align-items: center;
`,ms=o.div`
  position: relative;
  overflow: auto;
  max-height: calc(90vh - 80px);
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f8f9fa;
`,hs=o.img`
  max-width: 100%;
  max-height: 100%;
  transform: scale(${e=>e.zoom});
  transition: transform 0.2s ease;
  cursor: ${e=>e.zoom>1?"grab":"default"};
  
  &:active {
    cursor: ${e=>e.zoom>1?"grabbing":"default"};
  }
`,Na=o.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: center;
  justify-content: center;
  min-height: 60px;
`,Ca=o.div`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 500;
  cursor: ${e=>e.hasDocument?"pointer":"default"};
  transition: all 0.2s ease;
  
  ${e=>e.hasDocument?`
    background: #dcfce7;
    color: #166534;
    border: 1px solid #bbf7d0;
    
    &:hover {
      background: #bbf7d0;
      transform: translateY(-1px);
      box-shadow: 0 2px 8px rgba(22, 101, 52, 0.15);
    }
  `:`
    background: #fef3c7;
    color: #92400e;
    border: 1px solid #fcd34d;
  `}
`,_a=o.div`
  display: flex;
  gap: 4px;
  margin-top: 4px;
`,gs=o.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border: 1px solid #d1d5db;
  background: white;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: #f3f4f6;
    border-color: #9ca3af;
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`,fs=o.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: background 0.2s;
  
  &:hover {
    background: #2563eb;
  }
`,bs=o.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border: 1px solid #d1d5db;
  background: white;
  border-radius: 6px;
  cursor: pointer;
  margin-left: 10px;
  
  &:hover {
    background: #f3f4f6;
    border-color: #ef4444;
    color: #ef4444;
  }
`,Ea=()=>{var Qt,Gt,Ht;const e=Be(),[s,r]=f.useState(1),[n,a]=f.useState({}),[l,i]=f.useState(!1),[u,x]=f.useState(!1),[c,m]=f.useState(null),[w,k]=f.useState(null),[d,$]=f.useState(!1),[v,h]=f.useState(null),[C,E]=f.useState(null),[q,b]=f.useState(""),[F,S]=f.useState(1),[z,P]=f.useState(!1),[W,T]=f.useState("created_at"),[N,p]=f.useState("desc"),[R,U]=f.useState(!1),[M,K]=f.useState(null),[V,ie]=f.useState(null),[oe,He]=f.useState(""),{data:le,isLoading:Oe,error:he,refetch:Ce}=je({queryKey:["unified-inventory",s,n],queryFn:()=>$e.inventory.getItems(s,20,n,{sort_by:"item_code",sort_order:"desc"}),keepPreviousData:!0,staleTime:5*60*1e3,retry:3}),{data:Fe}=je({queryKey:["unified-inventory-stats"],queryFn:()=>$e.inventory.getStats(),staleTime:5*60*1e3}),se=ne({mutationFn:async({itemId:g,receiptData:j,images:L})=>{const G=new FormData;G.append("received_quantity",j.received_quantity.toString()),G.append("receiver_name",j.receiver_name),j.receiver_email&&G.append("receiver_email",j.receiver_email),G.append("department",j.department),G.append("received_date",j.received_date),j.location&&G.append("location",j.location),G.append("condition",j.condition||"good"),j.notes&&G.append("notes",j.notes),L.forEach((pe,qe)=>{G.append("images",pe)});const ae=await fetch(`http://211.197.16.248:8000/api/v1/inventory/${g}/complete-receipt-with-images`,{method:"POST",body:G});if(!ae.ok){const pe=await ae.json();throw new Error(pe.detail||"수령 처리 중 오류가 발생했습니다.")}return ae.json()},onSuccess:(g,j)=>{console.log("수령 완료 성공:",g),e.invalidateQueries({queryKey:["unified-inventory"]}),e.invalidateQueries({queryKey:["unified-inventory-stats"]}),j!=null&&j.itemId&&e.invalidateQueries({queryKey:["inventory-item",j.itemId]}),Ce(),_.success("🎉 수령이 완료되고 이미지가 업로드되었습니다!"),$(!1),h(null)},onError:g=>{console.error("수령 처리 오류:",g),_.error(g.message||"수령 처리 중 오류가 발생했습니다.")}}),Ye=ne({mutationFn:$e.inventory.createItem,onSuccess:()=>{e.invalidateQueries({queryKey:["unified-inventory"]}),e.invalidateQueries({queryKey:["unified-inventory-stats"]}),_.success("품목이 등록되었습니다."),Xe()},onError:g=>{var j,L;_.error(((L=(j=g.response)==null?void 0:j.data)==null?void 0:L.message)||"품목 등록 중 오류가 발생했습니다.")}}),Ve=ne({mutationFn:({id:g,data:j})=>$e.inventory.updateItem(g,j),onSuccess:()=>{e.invalidateQueries({queryKey:["unified-inventory"]}),e.invalidateQueries({queryKey:["unified-inventory-stats"]}),_.success("품목이 수정되었습니다."),Xe()},onError:g=>{var j,L;_.error(((L=(j=g.response)==null?void 0:j.data)==null?void 0:L.message)||"품목 수정 중 오류가 발생했습니다.")}}),ft=ne({mutationFn:$e.inventory.deleteItem,onSuccess:()=>{e.invalidateQueries({queryKey:["unified-inventory"]}),e.invalidateQueries({queryKey:["unified-inventory-stats"]}),_.success("품목이 삭제되었습니다.")},onError:g=>{var j,L;_.error(((L=(j=g.response)==null?void 0:j.data)==null?void 0:L.message)||"삭제 중 오류가 발생했습니다.")}}),Je=ne({mutationFn:({itemId:g,receiptData:j})=>$e.inventory.addReceipt(g,j),onSuccess:()=>{e.invalidateQueries({queryKey:["unified-inventory"]}),e.invalidateQueries({queryKey:["unified-inventory-stats"]}),_.success("수령 내역이 추가되었습니다."),x(!1),k(null)},onError:g=>{var j,L;_.error(((L=(j=g.response)==null?void 0:j.data)==null?void 0:L.message)||"수령 추가 중 오류가 발생했습니다.")}}),Le=ne({mutationFn:()=>$e.inventory.exportData(),onSuccess:g=>{const j=window.URL.createObjectURL(g),L=document.createElement("a");L.href=j,L.download=`inventory_${new Date().toISOString().split("T")[0]}.xlsx`,document.body.appendChild(L),L.click(),document.body.removeChild(L),window.URL.revokeObjectURL(j),_.success("Excel 파일이 다운로드되었습니다.")},onError:()=>{_.error("내보내기 중 오류가 발생했습니다.")}}),Ae=ne({mutationFn:({itemId:g,file:j})=>$e.inventory.uploadTransactionDocument(g,j),onSuccess:g=>{e.invalidateQueries({queryKey:["unified-inventory"]}),g.transaction_document_url&&M&&K({...M,transaction_document_url:g.transaction_document_url}),_.success("거래명세서가 업로드되었습니다."),U(!1),K(null)},onError:g=>{var j,L;_.error(((L=(j=g.response)==null?void 0:j.data)==null?void 0:L.message)||"거래명세서 업로드 중 오류가 발생했습니다.")}}),_e=g=>{var qe;const j=g.receipt_history&&g.receipt_history.length>0,L=!!g.last_received_date,G=!!g.last_received_by,ae=g.total_received&&g.total_received>0,pe=j||L||G||ae;return console.log(`품목 ${g.id} 수령 상태 확인:`,{hasReceiptHistory:j,hasLastReceived:L,hasReceivedBy:G,hasTotalReceived:ae,result:pe,receipt_history_length:((qe=g.receipt_history)==null?void 0:qe.length)||0}),pe},y=g=>{switch(g){case"normal":return"#10B981";case"low_stock":return"#F59E0B";case"out_of_stock":return"#EF4444";case"overstocked":return"#3B82F6";default:return"#6B7280"}},I=g=>{if(console.log("🔍 getFullImageUrl 입력:",JSON.stringify(g)),!g)return null;if(g.startsWith("http"))return console.log("🔍 이미 완전한 URL:",g),g;const L=`http://211.197.16.248:8000/${g.replace(/^\/+/,"")}`;return console.log("🔍 생성된 URL:",L),L},D=(g,j,L)=>{E(I(g)),b(`${j}_이미지_${L+1}`),S(1)},Q=async()=>{if(!(!C||!q))try{const j=await(await fetch(C)).blob(),L=window.URL.createObjectURL(j),G=document.createElement("a");G.href=L,G.download=`${q}.${A(C)}`,document.body.appendChild(G),G.click(),document.body.removeChild(G),window.URL.revokeObjectURL(L),_.success("이미지가 다운로드되었습니다.")}catch(g){console.error("다운로드 실패:",g),_.error("이미지 다운로드에 실패했습니다.")}},A=g=>{const j=g.match(/\.[^.]+$/);return j?j[0].slice(1):"jpg"},Y=()=>{S(g=>Math.min(g+.25,3))},J=()=>{S(g=>Math.max(g-.25,.5))},re=()=>{E(null),b(""),S(1)};f.useMemo(()=>{var j;return(j=le==null?void 0:le.data)!=null&&j.items?[...le.data.items].sort((L,G)=>{const ae=nr=>{const Yt=nr.match(/-(\d{4})$/);return Yt?parseInt(Yt[1],10):0},pe=ae(L.item_code);return ae(G.item_code)-pe}):[]},[(Qt=le==null?void 0:le.data)==null?void 0:Qt.items]),f.useEffect(()=>{const g=j=>{j.key==="Escape"&&re()};if(C)return document.addEventListener("keydown",g),()=>document.removeEventListener("keydown",g)},[C]);const Ue=g=>{console.log("🔍 거래명세서 업로드 버튼 클릭됨:",g),console.log("🔍 API 베이스 URL:","http://211.197.16.248:8000"),K(g),U(!0),console.log("🔍 모달 상태 변경 완료")},Gs=g=>{M&&Ae.mutate({itemId:M.id,file:g})},At=(g,j)=>{ie(I(g)),He(`${j}_거래명세서`)},Ut=()=>{ie(null),He("")},Hs=f.useMemo(()=>[{key:"item_code",label:"품목코드",sortable:!0,width:"160px",style:{verticalAlign:"middle"},render:g=>t.jsxs("span",{style:{fontFamily:"monospace",fontSize:"0.9rem",fontWeight:"500"},children:[g,W==="item_code"&&t.jsx("span",{style:{marginLeft:"4px",fontSize:"0.8rem"},children:N==="desc"?"↓":"↑"})]})},{key:"item_name",label:"품목명",sortable:!0,style:{verticalAlign:"middle"},render:(g,j)=>t.jsxs("div",{children:[t.jsx("div",{style:{fontWeight:"bold",marginBottom:"4px"},children:g}),j.brand&&t.jsx("div",{style:{fontSize:"0.85rem",color:"#666"},children:j.brand})]})},{key:"current_quantity",label:"재고 현황",sortable:!0,width:"140px",style:{verticalAlign:"middle"},render:(g,j)=>t.jsx(ka,{children:t.jsxs("div",{className:"main-quantity",style:{color:y(j.stock_status)},children:["현재: ",g.toLocaleString()]})})},{key:"unit_price",label:"단가",sortable:!0,width:"160px",align:"right",style:{verticalAlign:"middle"},render:(g,j)=>!g||g===0?"-":`${j.currency||"원"} ${g.toLocaleString()}`},{key:"last_received_date",label:"최근수령일",width:"130px",style:{verticalAlign:"middle"},render:g=>g?new Date(g).toLocaleDateString("ko-KR"):"-"},{key:"image_urls",label:"이미지",width:"150px",style:{verticalAlign:"middle"},render:(g,j)=>{const L=[];j.main_image_url&&L.push(j.main_image_url),j.image_urls&&j.image_urls.length>0&&j.image_urls.forEach(ae=>{L.includes(ae)||L.push(ae)});const G=L.slice(0,3);return L.length===0?t.jsx(cs,{children:t.jsx("div",{className:"no-image",children:"이미지 없음"})}):t.jsxs(cs,{children:[G.map((ae,pe)=>t.jsx("img",{src:I(ae),alt:`${j.item_name} ${pe+1}`,className:"thumbnail",style:{cursor:"pointer"},onClick:()=>D(ae,j.item_name,pe),onError:qe=>{console.error("이미지 로딩 실패:",ae),qe.target.style.display="none"}},pe)),L.length>3&&t.jsxs("div",{className:"more-images",children:["+",L.length-3]})]})}},{key:"transaction_document",label:"거래명세서",width:"140px",style:{verticalAlign:"middle"},render:(g,j)=>{const L=!!j.transaction_document_url;return t.jsxs(Na,{children:[t.jsx(Ca,{hasDocument:L,onClick:L?()=>At(j.transaction_document_url,j.item_name):void 0,children:L?t.jsxs(t.Fragment,{children:[t.jsx(Ne,{size:14}),"업로드 완료"]}):t.jsxs(t.Fragment,{children:[t.jsx(Re,{size:14}),"업로드 대기"]})}),t.jsx(_a,{children:L?t.jsxs(t.Fragment,{children:[t.jsx(O,{size:"xs",variant:"outline",onClick:()=>At(j.transaction_document_url,j.item_name),title:"거래명세서 보기",style:{fontSize:"0.75rem",padding:"3px 8px",height:"24px"},children:"보기"}),t.jsx(O,{size:"xs",variant:"outline",onClick:()=>Ue(j),title:"새 파일로 교체",style:{fontSize:"0.75rem",padding:"3px 8px",height:"24px"},children:"교체"})]}):t.jsx(O,{size:"xs",variant:"outline",onClick:()=>Ue(j),title:"거래명세서 업로드",style:{fontSize:"0.75rem",padding:"3px 8px",height:"24px",background:"#fef3c7",color:"#92400e",border:"1px solid #fcd34d"},children:"업로드"})})]})}},{key:"receipt_status",label:"수령 상태",width:"120px",style:{verticalAlign:"middle"},render:(g,j)=>t.jsx(wa,{hasReceipts:_e(j),children:_e(j)?"수령 완료":"수령 대기"})},{key:"actions",label:"관리",width:"180px",style:{verticalAlign:"middle"},render:(g,j)=>{const L=_e(j);return t.jsxs($a,{children:[L?t.jsxs(O,{size:"sm",variant:"outline",disabled:!0,title:"수령 완료됨",style:{background:"#f0fdf4",color:"#16a34a",border:"1px solid #16a34a"},children:[t.jsx(ce,{size:14}),"완료됨"]}):t.jsxs(O,{size:"sm",variant:"success",onClick:()=>Ys(j),title:"수령완료 (이미지 포함)",style:{background:"linear-gradient(135deg, #10b981, #059669)",color:"white",fontWeight:"600"},children:[t.jsx(ce,{size:14}),"수령"]}),t.jsx(O,{size:"sm",variant:"outline",onClick:()=>sr(j),title:"추가 수령",children:t.jsx(ce,{size:14})}),t.jsx(O,{size:"sm",variant:"outline",onClick:()=>Xs(j),title:"수정",children:t.jsx(qt,{size:14})}),t.jsx(O,{size:"sm",variant:"danger",onClick:()=>Zs(j.id),title:"삭제",children:t.jsx(Os,{size:14})})]})}}],[]),Ys=g=>{h(g),$(!0)},Vs=(g,j)=>{v&&se.mutate({itemId:v.id,receiptData:g,images:j})},Js=g=>{a(g),r(1)},Xs=g=>{m(g),i(!0)},Zs=async g=>{window.confirm("정말로 이 품목을 삭제하시겠습니까?")&&ft.mutate(g)},er=()=>{Le.mutate()},Xe=()=>{i(!1),m(null)},tr=g=>{c?Ve.mutate({id:c.id,data:g}):Ye.mutate(g)},sr=g=>{k(g),x(!0)},rr=g=>{w&&Je.mutate({itemId:w.id,receiptData:g})},Kt=((Gt=le==null?void 0:le.data)==null?void 0:Gt.items)||[],Wt=((Ht=le==null?void 0:le.data)==null?void 0:Ht.pages)||0,ge=(Fe==null?void 0:Fe.data)||{};return Oe?t.jsx(gt,{text:"재고 데이터를 불러오는 중..."}):he?(console.error("Inventory error:",he),t.jsx(ls,{children:t.jsx(te,{children:t.jsxs("div",{style:{textAlign:"center",padding:"40px"},children:[t.jsx("p",{children:"데이터를 불러오는 중 오류가 발생했습니다."}),t.jsx(O,{onClick:()=>Ce(),children:"다시 시도"})]})})})):t.jsxs(ls,{children:[t.jsx(fa,{children:"품목 관리"}),t.jsx(ba,{children:"전체 품목 현황을 관리하고 모니터링할 수 있습니다."}),t.jsxs(ja,{children:[t.jsxs(rt,{color:"#3B82F6",children:[t.jsx("h3",{children:(ge==null?void 0:ge.total_items)||0}),t.jsx("p",{children:"전체 품목"})]}),t.jsxs(rt,{color:"#10B981",children:[t.jsx("h3",{children:Kt.filter(g=>_e(g)).length}),t.jsx("p",{children:"수령 완료"})]}),t.jsxs(rt,{color:"#F59E0B",children:[t.jsx("h3",{children:(ge==null?void 0:ge.low_stock_items)||0}),t.jsx("p",{children:"재고 부족"})]}),t.jsxs(rt,{color:"#EF4444",children:[t.jsx("h3",{children:(ge==null?void 0:ge.out_of_stock_items)||0}),t.jsx("p",{children:"재고 없음"})]})]}),t.jsxs(te,{children:[t.jsxs(ya,{children:[t.jsx(bo,{onFilter:Js}),t.jsxs(va,{children:[t.jsxs(O,{variant:"outline",onClick:()=>Ce(),disabled:Oe,children:[t.jsx(ct,{size:16}),"새로고침"]}),t.jsxs(O,{variant:"secondary",onClick:er,disabled:Le.isPending,loading:Le.isPending,children:[t.jsx(be,{size:16}),"Excel 다운로드"]}),t.jsxs(O,{onClick:()=>i(!0),children:[t.jsx(dt,{size:16}),"품목 추가"]})]})]}),t.jsx(Mt,{columns:Hs,data:Kt,loading:Oe,emptyMessage:"등록된 품목이 없습니다."}),Wt>1&&t.jsx(Dt,{currentPage:s,totalPages:Wt,onPageChange:r})]}),t.jsx(Te,{isOpen:l,onClose:Xe,title:c?"품목 수정":"새 품목 추가",size:"lg",children:t.jsx(Eo,{item:c,onSubmit:tr,onCancel:Xe,loading:Ye.isPending||Ve.isPending})}),d&&v&&t.jsx(Te,{isOpen:d,onClose:()=>{$(!1),h(null)},title:`수령완료 - ${v.item_name}`,size:"lg",children:t.jsx(as,{item:v,onSubmit:Vs,onCancel:()=>{$(!1),h(null)},loading:se.isPending,requireImages:!0})}),u&&w&&t.jsx(Te,{isOpen:u,onClose:()=>x(!1),title:`수령 추가 - ${w.item_name}`,size:"lg",children:t.jsx(as,{item:w,onSubmit:rr,onCancel:()=>x(!1),loading:Je.isPending,requireImages:!1})}),C&&t.jsx(ds,{onClick:re,children:t.jsxs(ps,{onClick:g=>g.stopPropagation(),children:[t.jsxs(us,{children:[t.jsx("h3",{children:q}),t.jsxs(xs,{children:[t.jsx(gs,{onClick:J,disabled:F<=.5,title:"축소",children:t.jsx(wr,{size:16})}),t.jsxs("span",{style:{fontSize:"0.9rem",color:"#666",minWidth:"60px",textAlign:"center"},children:[Math.round(F*100),"%"]}),t.jsx(gs,{onClick:Y,disabled:F>=3,title:"확대",children:t.jsx($r,{size:16})}),t.jsxs(fs,{onClick:Q,title:"이미지 다운로드",children:[t.jsx(be,{size:16}),"다운로드"]}),t.jsx(bs,{onClick:re,title:"닫기",children:t.jsx(ve,{size:16})})]})]}),t.jsx(ms,{children:t.jsx(hs,{src:C,alt:q,zoom:F})})]})}),t.jsx(aa,{isOpen:z,onClose:()=>P(!1),onSuccess:()=>{P(!1),Ce()}}),R&&M&&t.jsx(ga,{isOpen:R,item:M,onClose:()=>{U(!1),K(null)},onSubmit:Gs,loading:Ae.isPending}),V&&t.jsx(ds,{onClick:Ut,children:t.jsxs(ps,{onClick:g=>g.stopPropagation(),children:[t.jsxs(us,{children:[t.jsx("h3",{children:oe}),t.jsxs(xs,{children:[t.jsxs(fs,{onClick:async()=>{try{const j=await(await fetch(V)).blob(),L=window.URL.createObjectURL(j),G=document.createElement("a");G.href=L,G.download=`${oe}.${A(V)}`,document.body.appendChild(G),G.click(),document.body.removeChild(G),window.URL.revokeObjectURL(L),_.success("거래명세서가 다운로드되었습니다.")}catch{_.error("다운로드에 실패했습니다.")}},title:"거래명세서 다운로드",children:[t.jsx(be,{size:16}),"다운로드"]}),t.jsx(bs,{onClick:Ut,title:"닫기",children:t.jsx(ve,{size:16})})]})]}),t.jsx(ms,{children:V.toLowerCase().includes(".pdf")?t.jsx("iframe",{src:V,style:{width:"100%",height:"600px",border:"none"},title:oe}):t.jsx(hs,{src:V,alt:oe,zoom:F})})]})})]})},ys=o.div`
  padding: 20px;
`,vs=o.h1`
  font-size: 2rem;
  font-weight: 600;
  margin-bottom: 8px;
  color: ${e=>e.theme.colors.text};
`,za=o.p`
  color: ${e=>e.theme.colors.textSecondary};
  margin-bottom: 30px;
  font-size: 1rem;
`,Sa=o.div`
  display: flex;
  gap: 15px;
  margin-bottom: 20px;
  align-items: center;
`,Ia=o.div`
  display: flex;
  gap: 10px;
  margin-left: auto;
`,Ta=o.div`
  text-align: center;
  padding: 60px 20px;
  
  .error-icon {
    color: ${e=>e.theme.colors.error};
    margin-bottom: 16px;
  }
  
  .error-title {
    font-size: 1.2rem;
    font-weight: 600;
    margin-bottom: 8px;
    color: ${e=>e.theme.colors.text};
  }
  
  .error-message {
    color: ${e=>e.theme.colors.textSecondary};
    margin-bottom: 20px;
  }
`,Ra=()=>{var u,x;const[e,s]=f.useState(1),{data:r,isLoading:n,error:a,refetch:l}=je({queryKey:["receipts",e],queryFn:()=>Ws.getReceipts(e,20),keepPreviousData:!0,retry:2}),i=[{key:"receiptNumber",label:"수령번호",sortable:!0,width:"120px"},{key:"itemName",label:"품목명",sortable:!0},{key:"receivedQuantity",label:"수령수량",width:"100px",render:(c,m)=>`${c}/${m.expectedQuantity}`},{key:"receiverName",label:"수령자",width:"100px"},{key:"department",label:"부서",width:"100px"},{key:"receivedDate",label:"수령일",width:"120px",render:c=>new Date(c).toLocaleDateString("ko-KR")}];return n?t.jsx(gt,{text:"수령 데이터를 불러오는 중..."}):a?(console.error("Receipt error:",a),t.jsxs(ys,{children:[t.jsx(vs,{children:"수령 관리"}),t.jsx(te,{children:t.jsxs(Ta,{children:[t.jsx(me,{size:48,className:"error-icon"}),t.jsx("div",{className:"error-title",children:"데이터를 불러올 수 없습니다"}),t.jsx("div",{className:"error-message",children:"백엔드 서버가 실행되지 않았거나 수령 관리 API가 구현되지 않았습니다."}),t.jsx(O,{onClick:()=>l(),children:"다시 시도"})]})})]})):t.jsxs(ys,{children:[t.jsx(vs,{children:"수령 관리"}),t.jsx(za,{children:"물품 수령 현황을 확인하고 관리할 수 있습니다."}),t.jsxs(te,{children:[t.jsx(Sa,{children:t.jsxs(Ia,{children:[t.jsxs(O,{variant:"secondary",children:[t.jsx(be,{size:16}),"Excel 다운로드"]}),t.jsxs(O,{children:[t.jsx(dt,{size:16}),"수령 등록"]})]})}),t.jsx(Mt,{columns:i,data:((u=r==null?void 0:r.data)==null?void 0:u.items)||[],loading:n,emptyMessage:"수령 내역이 없습니다."}),t.jsx(Dt,{currentPage:e,totalPages:((x=r==null?void 0:r.data)==null?void 0:x.totalPages)||0,onPageChange:s})]})]})},Pa=o.div`
  max-width: 800px;
  margin: 0 auto;
`,Et=o(te)`
  margin-bottom: 24px;
  
  .section-title {
    font-size: 1.1rem;
    font-weight: 600;
    margin-bottom: 20px;
    color: ${e=>e.theme.colors.text};
    display: flex;
    align-items: center;
    gap: 8px;
    
    .section-icon {
      color: ${e=>e.theme.colors.primary};
    }
  }
`,zt=o.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`,St=o.div`
  grid-column: 1 / -1;
`,js=o.textarea`
  width: 100%;
  min-height: 100px;
  padding: 12px;
  border: 2px solid ${e=>e.hasError?e.theme.colors.error:e.theme.colors.border};
  border-radius: 8px;
  font-size: 14px;
  font-family: inherit;
  background: ${e=>e.theme.colors.surface};
  color: ${e=>e.theme.colors.text};
  resize: vertical;
  transition: all 0.2s ease;
  
  &:focus {
    outline: none;
    border-color: ${e=>e.hasError?e.theme.colors.error:e.theme.colors.primary};
    box-shadow: 0 0 0 3px ${e=>e.hasError?e.theme.colors.error:e.theme.colors.primary}20;
  }
  
  &::placeholder {
    color: ${e=>e.theme.colors.textSecondary};
  }
`,Oa=o.div`
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 32px;
  padding-top: 24px;
  border-top: 1px solid ${e=>e.theme.colors.border};
`,ws=o.div`
  color: ${e=>e.theme.colors.error};
  font-size: 12px;
  margin-top: 4px;
  display: flex;
  align-items: center;
  gap: 4px;
`,Fa=({onSuccess:e,onCancel:s,initialData:r,isEdit:n=!1})=>{const a=[{value:"OFFICE_SUPPLIES",label:"사무 용품"},{value:"ELECTRONICS",label:"전자제품/IT 장비"},{value:"FURNITURE",label:"가구"},{value:"SOFTWARE",label:"소프트웨어"},{value:"MAINTENANCE",label:"유지보수"},{value:"SERVICES",label:"서비스"},{value:"OTHER",label:"기타"}],l=[{value:"LOW",label:"낮음"},{value:"NORMAL",label:"보통"},{value:"HIGH",label:"높음"},{value:"URGENT",label:"긴급"},{value:"EMERGENCY",label:"응급"}],i=[{value:"DIRECT",label:"직접구매"},{value:"QUOTATION",label:"견적요청"},{value:"CONTRACT",label:"계약"},{value:"FRAMEWORK",label:"단가계약"},{value:"MARKETPLACE",label:"마켓플레이스"}],u=[{value:"H/W 개발팀",label:"H/W 개발팀"},{value:"S/W 개발팀",label:"S/W 개발팀"},{value:"총무부",label:"총무부"},{value:"사무관리팀",label:"사무관리팀"},{value:"영업팀",label:"영업팀"},{value:"인사팀",label:"인사팀"}],x=Be(),[c,m]=f.useState({}),w=()=>r?{itemName:r.item_name||"",specifications:r.specifications||"",quantity:r.quantity||1,estimatedPrice:r.estimated_unit_price||0,preferredSupplier:r.preferred_supplier||"",category:r.category||"",urgency:r.urgency||"NORMAL",justification:r.justification||"",department:r.department||"",project:r.project||"",request_name:r.project||"",budgetCode:r.budget_code||"",expectedDeliveryDate:r.expected_delivery_date?new Date(r.expected_delivery_date).toISOString().split("T")[0]:"",purchaseMethod:r.purchase_method||"DIRECT"}:{itemName:"",specifications:"",quantity:1,estimatedPrice:0,preferredSupplier:"",category:"",urgency:"NORMAL",justification:"",department:"S/W 개발팀",project:"",requester_name:"",budgetCode:"",expectedDeliveryDate:"",purchaseMethod:"DIRECT"},[k,d]=f.useState(w());f.useEffect(()=>{d(w())},[r]);const $=ne({mutationFn:xe.createRequest,onSuccess:()=>{x.invalidateQueries({queryKey:["purchase-requests"]}),x.invalidateQueries({queryKey:["purchase-requests-stats"]}),_.success(n?"구매 요청이 수정되었습니다.":"구매 요청이 등록되었습니다."),e()},onError:b=>{var F,S,z,P;console.error("=== 구매 요청 처리 실패 ==="),console.error("전체 에러 객체:",b),console.error("HTTP 상태 코드:",(F=b.response)==null?void 0:F.status),console.error("에러 응답 데이터:",(S=b.response)==null?void 0:S.data),_.error(((P=(z=b.response)==null?void 0:z.data)==null?void 0:P.message)||"처리 중 오류가 발생했습니다.")}}),v=ne({mutationFn:({id:b,data:F})=>xe.updateRequest(b,F),onSuccess:()=>{x.invalidateQueries({queryKey:["purchase-requests"]}),x.invalidateQueries({queryKey:["purchase-requests-stats"]}),_.success("구매 요청이 수정되었습니다."),e()},onError:b=>{var F,S;console.error("구매 요청 수정 실패:",b),_.error(((S=(F=b.response)==null?void 0:F.data)==null?void 0:S.message)||"수정 중 오류가 발생했습니다.")}}),h=()=>{const b={};return k.itemName.trim()||(b.itemName="품목명을 입력해주세요."),k.category||(b.category="카테고리를 선택해주세요."),k.quantity<=0&&(b.quantity="수량은 1 이상이어야 합니다."),k.estimatedPrice<0&&(b.estimatedPrice="예상금액은 0 이상이어야 합니다."),k.department||(b.department="부서를 선택해주세요."),k.justification.trim()||(b.justification="구매 사유를 입력해주세요."),m(b),Object.keys(b).length===0},C=b=>{if(b.preventDefault(),!h()){_.error("입력 정보를 확인해주세요.");return}const F=Number(k.quantity)||1,S=Number(k.estimatedPrice)||0,z=F*S,P={item_name:k.itemName,specifications:k.specifications||null,quantity:Number(k.quantity),unit:"개",estimated_unit_price:S,total_budget:z,currency:"KRW",category:k.category,urgency:k.urgency,purchase_method:k.purchaseMethod||"DIRECT",requester_name:k.requester_name,requester_email:"current_user@company.com",department:k.department,position:null,budgetCode:k.budgetCode||"",justification:k.justification,expected_delivery_date:k.expectedDeliveryDate||null};console.log("submitData:",JSON.stringify(P,null,2));const T=["item_name","quantity","requester_name","department","justification"].filter(N=>!P[N]);if(T.length>0){console.error("누락된 필수 필드:",T),_.error(`필수 필드가 누락되었습니다: ${T.join(", ")}`);return}n&&(r!=null&&r.id)?v.mutate({id:r.id,data:P}):$.mutate(P)},E=(b,F)=>{d(S=>({...S,[b]:F})),c[b]&&m(S=>{const z={...S};return delete z[b],z})},q=$.isPending||v.isPending;return t.jsx(Pa,{children:t.jsxs("form",{onSubmit:C,children:[t.jsxs(Et,{children:[t.jsxs("div",{className:"section-title",children:[t.jsx(ce,{className:"section-icon",size:20}),"기본 정보"]}),t.jsxs(zt,{children:[t.jsxs(St,{children:[t.jsx(X,{label:"품목명",value:k.itemName,onChange:b=>E("itemName",b.target.value),placeholder:"구매할 품목명을 입력하세요",required:!0}),c.itemName&&t.jsxs(ws,{children:[t.jsx(me,{size:12}),c.itemName]})]}),t.jsx(Ie,{label:"카테고리",value:k.category,options:a,onChange:b=>E("category",b),placeholder:"카테고리를 선택하세요",required:!0}),t.jsx(X,{label:"수량",type:"number",value:k.quantity,onChange:b=>E("quantity",Number(b.target.value)),placeholder:"구매 수량",required:!0}),t.jsx(Ie,{label:"긴급도",value:k.urgency,options:l,onChange:b=>E("urgency",b)})]}),t.jsxs(St,{style:{marginTop:"16px"},children:[t.jsx("label",{style:{display:"block",marginBottom:"8px",fontWeight:"500"},children:"사양 및 요구사항"}),t.jsx(js,{value:k.specifications,onChange:b=>E("specifications",b.target.value),placeholder:"제품 사양, 모델명, 특별 요구사항 등을 상세히 입력하세요..."})]})]}),t.jsxs(Et,{children:[t.jsxs("div",{className:"section-title",children:[t.jsx(lt,{className:"section-icon",size:20}),"예산 및 공급업체"]}),t.jsxs(zt,{children:[t.jsx(X,{label:"예상 단가 (원)",type:"number",value:k.estimatedPrice,onChange:b=>E("estimatedPrice",Number(b.target.value)),placeholder:"예상 단가를 입력하세요"}),t.jsx(X,{label:"구매처",value:k.preferredSupplier,onChange:b=>E("preferredSupplier",b.target.value),placeholder:"구매처를 입력하세요"}),t.jsx(Ie,{label:"구매 방법",value:k.purchaseMethod,options:i,onChange:b=>E("purchaseMethod",b)})]})]}),t.jsxs(Et,{children:[t.jsxs("div",{className:"section-title",children:[t.jsx(Pt,{className:"section-icon",size:20}),"부서 및 프로젝트 정보"]}),t.jsxs(zt,{children:[t.jsx(Ie,{label:"부서",value:k.department,options:u,onChange:b=>E("department",b),placeholder:"소속 부서를 선택하세요",required:!0}),t.jsx(X,{label:"프로젝트명",value:k.project,onChange:b=>E("project",b.target.value),placeholder:"관련 프로젝트명 (선택사항)"}),t.jsx(X,{label:"요청자",value:k.requester_name,onChange:b=>E("requester_name",b.target.value),required:!0}),t.jsx(X,{label:"희망 납기일",type:"date",value:k.expectedDeliveryDate,onChange:b=>E("expectedDeliveryDate",b.target.value)})]}),t.jsxs(St,{style:{marginTop:"16px"},children:[t.jsxs("label",{style:{display:"block",marginBottom:"8px",fontWeight:"500"},children:["구매 사유 및 링크 ",t.jsx("span",{style:{color:"red"},children:"*"})]}),t.jsx(js,{value:k.justification,onChange:b=>E("justification",b.target.value),placeholder:"구매가 필요한 사유를 상세히 입력해주세요...",hasError:!!c.justification,required:!0}),c.justification&&t.jsxs(ws,{children:[t.jsx(me,{size:12}),c.justification]})]})]}),t.jsxs(Oa,{children:[t.jsx(O,{type:"button",variant:"outline",onClick:s,children:"취소"}),t.jsx(O,{type:"submit",loading:q,disabled:q,children:n?"수정":"등록"})]})]})})},La=o.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
`,qa=o(te)`
  background: ${e=>e.theme.colors.background};
  border-left: 4px solid ${e=>e.theme.colors.info};
  
  .info-header {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 16px;
    
    .info-icon {
      color: ${e=>e.theme.colors.info};
    }
    
    .info-title {
      font-size: 1.1rem;
      font-weight: 600;
      color: ${e=>e.theme.colors.text};
    }
  }
  
  .info-content {
    .info-item {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 8px;
      font-size: 14px;
      
      &:last-child {
        margin-bottom: 0;
      }
      
      .bullet {
        width: 4px;
        height: 4px;
        background: ${e=>e.theme.colors.primary};
        border-radius: 50%;
        flex-shrink: 0;
      }
    }
  }
`,Ma=o.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  
  .template-header {
    .template-title {
      font-size: 1.1rem;
      font-weight: 600;
      margin-bottom: 8px;
    }
    
    .template-description {
      color: ${e=>e.theme.colors.textSecondary};
      font-size: 14px;
      line-height: 1.5;
    }
  }
  
  .template-columns {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 12px;
    margin: 16px 0;
    
    .column-item {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 12px;
      background: ${e=>e.theme.colors.background};
      border-radius: 6px;
      font-size: 13px;
      
      .required-mark {
        color: ${e=>e.theme.colors.error};
        font-weight: bold;
      }
      
      .column-name {
        color: ${e=>e.theme.colors.text};
      }
    }
  }
`,Da=o.div`
  border: 2px dashed ${e=>e.disabled?e.theme.colors.border:e.isDragOver?e.theme.colors.primary:e.theme.colors.border};
  border-radius: 12px;
  padding: 40px 20px;
  text-align: center;
  background: ${e=>e.disabled?e.theme.colors.background:e.isDragOver?e.theme.colors.primary+"05":e.theme.colors.surface};
  transition: all 0.3s ease;
  cursor: ${e=>e.disabled?"not-allowed":"pointer"};
  opacity: ${e=>e.disabled?.6:1};
  
  &:hover {
    border-color: ${e=>e.disabled?e.theme.colors.border:e.theme.colors.primary};
    background: ${e=>e.disabled?e.theme.colors.background:e.theme.colors.primary+"05"};
  }
  
  .upload-icon {
    margin-bottom: 16px;
    color: ${e=>e.theme.colors.primary};
    opacity: 0.7;
  }
  
  .upload-title {
    font-size: 1.1rem;
    font-weight: 600;
    margin-bottom: 8px;
    color: ${e=>e.theme.colors.text};
  }
  
  .upload-subtitle {
    color: ${e=>e.theme.colors.textSecondary};
    font-size: 14px;
    margin-bottom: 16px;
  }
  
  .upload-hint {
    color: ${e=>e.theme.colors.textSecondary};
    font-size: 12px;
  }
`,Ba=o.div`
  .progress-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 12px;
    
    .progress-title {
      font-weight: 500;
    }
    
    .progress-percentage {
      font-size: 14px;
      color: ${e=>e.theme.colors.textSecondary};
    }
  }
  
  .progress-bar {
    width: 100%;
    height: 8px;
    background: ${e=>e.theme.colors.background};
    border-radius: 4px;
    overflow: hidden;
    
    .progress-fill {
      height: 100%;
      background: ${e=>e.theme.colors.primary};
      transition: width 0.3s ease;
      border-radius: 4px;
    }
  }
  
  .progress-status {
    margin-top: 12px;
    font-size: 14px;
    color: ${e=>e.theme.colors.textSecondary};
    display: flex;
    align-items: center;
    gap: 8px;
  }
`,Aa=o.div`
  .result-header {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 16px;
    
    .result-icon {
      color: ${e=>e.success?e.theme.colors.success:e.theme.colors.error};
    }
    
    .result-title {
      font-size: 1.1rem;
      font-weight: 600;
      color: ${e=>e.success?e.theme.colors.success:e.theme.colors.error};
    }
  }
  
  .result-summary {
    background: ${e=>e.success?e.theme.colors.success+"10":e.theme.colors.error+"10"};
    border: 1px solid ${e=>e.success?e.theme.colors.success+"30":e.theme.colors.error+"30"};
    border-radius: 8px;
    padding: 16px;
    margin-bottom: 16px;
    
    .summary-item {
      display: flex;
      justify-content: space-between;
      margin-bottom: 8px;
      
      &:last-child {
        margin-bottom: 0;
      }
      
      .label {
        color: ${e=>e.theme.colors.textSecondary};
      }
      
      .value {
        font-weight: 600;
        color: ${e=>e.theme.colors.text};
      }
    }
  }
  
  .error-details {
    max-height: 200px;
    overflow-y: auto;
    border: 1px solid ${e=>e.theme.colors.border};
    border-radius: 8px;
    
    .error-item {
      padding: 12px 16px;
      border-bottom: 1px solid ${e=>e.theme.colors.border};
      
      &:last-child {
        border-bottom: none;
      }
      
      .error-row {
        font-weight: 600;
        color: ${e=>e.theme.colors.error};
        margin-bottom: 4px;
      }
      
      .error-message {
        font-size: 14px;
        color: ${e=>e.theme.colors.textSecondary};
      }
    }
  }
  
  .request-numbers {
    margin-top: 16px;
    
    .numbers-title {
      font-weight: 500;
      margin-bottom: 8px;
    }
    
    .numbers-list {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      
      .number-tag {
        display: inline-block;
        padding: 4px 8px;
        background: ${e=>e.theme.colors.primary}15;
        color: ${e=>e.theme.colors.primary};
        border-radius: 4px;
        font-size: 12px;
        font-weight: 500;
      }
    }
  }
`,Ua=o.input`
  display: none;
`,Ka=o.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 24px;
  
  .left-actions {
    display: flex;
    gap: 12px;
  }
  
  .right-actions {
    display: flex;
    gap: 12px;
  }
`,Wa=[{name:"품목명",required:!0,description:"구매할 품목의 이름"},{name:"카테고리",required:!0,description:"품목 분류"},{name:"수량",required:!0,description:"구매 수량 (숫자)"},{name:"부서",required:!0,description:"요청 부서"},{name:"구매사유",required:!0,description:"구매가 필요한 이유"},{name:"사양",required:!1,description:"제품 사양 및 요구사항"},{name:"예상단가",required:!1,description:"예상 단가 (원)"},{name:"공급업체",required:!1,description:"구매처"},{name:"긴급도",required:!1,description:"낮음/보통/높음/긴급"},{name:"희망납기일",required:!1,description:"YYYY-MM-DD 형식"},{name:"프로젝트명",required:!1,description:"관련 프로젝트"},{name:"링크",required:!1,description:"링크"}],Qa=({isOpen:e,onClose:s,onSuccess:r})=>{var W;const n=Be(),[a,l]=f.useState(!1),[i,u]=f.useState(null),[x,c]=f.useState(0),[m,w]=f.useState(null),[k,d]=f.useState("upload"),$=ne({mutationFn:xe.uploadExcel,onMutate:()=>{d("processing"),c(0);const T=setInterval(()=>{c(N=>N>=90?(clearInterval(T),90):N+Math.random()*10)},500);return{progressInterval:T}},onSuccess:(T,N,p)=>{p!=null&&p.progressInterval&&clearInterval(p.progressInterval),c(100),d("result"),w(T),n.invalidateQueries({queryKey:["purchase-requests"]}),n.invalidateQueries({queryKey:["purchase-requests-stats"]});const R=`${T.created_count}개 구매요청이 성공적으로 등록되었습니다!`;_.success(R),r()},onError:(T,N,p)=>{p!=null&&p.progressInterval&&clearInterval(p.progressInterval),d("result"),w({success:!1,created_count:0,request_numbers:[],errors:[{row:0,field:"file",message:T.message}]}),_.error(T.message)}}),v=ne({mutationFn:xe.downloadTemplate,onSuccess:()=>{_.success("템플릿이 다운로드되었습니다.")},onError:()=>{_.error("템플릿 다운로드에 실패했습니다.")}}),h=T=>{if(!T)return;if(!T.name.endsWith(".xlsx")&&!T.name.endsWith(".xls")){_.error("Excel 파일만 업로드 가능합니다.");return}const N=10*1024*1024;if(T.size>N){_.error("파일 크기는 10MB를 초과할 수 없습니다.");return}u(T),w(null)},C=()=>{if(!i){_.error("파일을 먼저 선택해주세요.");return}c(0),$.mutate(i)},E=T=>{if(T.preventDefault(),l(!1),$.isPending)return;const N=T.dataTransfer.files;N.length>0&&h(N[0])},q=T=>{T.preventDefault(),$.isPending||l(!0)},b=()=>{l(!1)},F=()=>{if($.isPending)return;const T=document.getElementById("excel-file-input");T==null||T.click()},S=()=>{u(null),w(null),c(0)},z=()=>{S(),s()},P=T=>{if(T===0)return"0 Bytes";const N=1024,p=["Bytes","KB","MB","GB"],R=Math.floor(Math.log(T)/Math.log(N));return parseFloat((T/Math.pow(N,R)).toFixed(2))+" "+p[R]};return t.jsx(Te,{isOpen:e,onClose:z,title:"Excel 일괄 업로드",size:"xl",children:t.jsxs(La,{children:[t.jsxs(qa,{children:[t.jsxs("div",{className:"info-header",children:[t.jsx(Re,{className:"info-icon",size:20}),t.jsx("div",{className:"info-title",children:"업로드 안내"})]}),t.jsxs("div",{className:"info-content",children:[t.jsxs("div",{className:"info-item",children:[t.jsx("div",{className:"bullet"}),t.jsx("span",{children:"Excel 템플릿을 다운로드하여 양식에 맞게 데이터를 입력해주세요."})]}),t.jsxs("div",{className:"info-item",children:[t.jsx("div",{className:"bullet"}),t.jsx("span",{children:"필수 항목은 반드시 입력해야 하며, 빈 값이 있으면 오류가 발생합니다."})]}),t.jsxs("div",{className:"info-item",children:[t.jsx("div",{className:"bullet"}),t.jsx("span",{children:"최대 1,000건까지 한 번에 업로드할 수 있습니다."})]}),t.jsxs("div",{className:"info-item",children:[t.jsx("div",{className:"bullet"}),t.jsx("span",{children:"파일 크기는 10MB를 초과할 수 없습니다."})]})]})]}),t.jsxs(Ma,{children:[t.jsxs("div",{className:"template-header",children:[t.jsx("div",{className:"template-title",children:"Excel 템플릿 양식"}),t.jsx("div",{className:"template-description",children:"아래 컬럼들이 포함된 Excel 템플릿을 다운로드하여 사용하세요."})]}),t.jsx("div",{className:"template-columns",children:Wa.map((T,N)=>t.jsxs("div",{className:"column-item",children:[T.required&&t.jsx("span",{className:"required-mark",children:"*"}),t.jsx("span",{className:"column-name",children:T.name})]},N))}),t.jsxs(O,{variant:"outline",onClick:()=>v.mutate(),disabled:v.isPending,loading:v.isPending,children:[t.jsx(be,{size:16}),"Excel 템플릿 다운로드"]})]}),!m&&t.jsxs(Da,{isDragOver:a,disabled:$.isPending,onDrop:E,onDragOver:q,onDragLeave:b,onClick:F,children:[t.jsx(Rs,{size:48,className:"upload-icon"}),t.jsx("div",{className:"upload-title",children:i?i.name:"Excel 파일을 선택하세요"}),t.jsx("div",{className:"upload-subtitle",children:i?`파일 크기: ${P(i.size)}`:"파일을 여기에 끌어다 놓거나 클릭하여 선택하세요"}),t.jsx("div",{className:"upload-hint",children:".xlsx, .xls 파일만 지원됩니다 (최대 10MB)"})]}),t.jsx(Ua,{id:"excel-file-input",type:"file",accept:".xlsx,.xls",onChange:T=>{var p;const N=(p=T.target.files)==null?void 0:p[0];N&&h(N)},disabled:$.isPending}),$.isPending&&t.jsxs(Ba,{children:[t.jsxs("div",{className:"progress-header",children:[t.jsx("div",{className:"progress-title",children:"업로드 진행중..."}),t.jsxs("div",{className:"progress-percentage",children:[x,"%"]})]}),t.jsx("div",{className:"progress-bar",children:t.jsx("div",{className:"progress-fill",style:{width:`${x}%`}})}),t.jsxs("div",{className:"progress-status",children:[t.jsx(Rt,{size:16,className:"animate-spin"}),t.jsx("span",{children:"Excel 파일을 분석하고 구매 요청을 생성하는 중..."})]})]}),m&&t.jsxs(Aa,{success:m.success,children:[t.jsxs("div",{className:"result-header",children:[t.jsx("div",{className:"result-icon",children:m.success?t.jsx(Ne,{size:24}):t.jsx(me,{size:24})}),t.jsx("div",{className:"result-title",children:m.success?"업로드 완료!":"업로드 실패"})]}),t.jsxs("div",{className:"result-summary",children:[t.jsxs("div",{className:"summary-item",children:[t.jsx("span",{className:"label",children:"처리된 요청:"}),t.jsxs("span",{className:"value",children:[m.created_count,"건"]})]}),m.errors&&m.errors.length>0&&t.jsxs("div",{className:"summary-item",children:[t.jsx("span",{className:"label",children:"오류 발생:"}),t.jsxs("span",{className:"value",children:[m.errors.length,"건"]})]})]}),m.success&&((W=m.request_numbers)==null?void 0:W.length)>0&&t.jsxs("div",{className:"request-numbers",children:[t.jsx("div",{className:"numbers-title",children:"생성된 구매 요청 번호:"}),t.jsx("div",{className:"numbers-list",children:m.request_numbers.map((T,N)=>t.jsx("span",{className:"number-tag",children:T},N))})]}),m.errors&&m.errors.length>0&&t.jsx("div",{className:"error-details",children:m.errors.map((T,N)=>t.jsxs("div",{className:"error-item",children:[t.jsxs("div",{className:"error-row",children:["행 ",T.row,": ",T.field]}),t.jsx("div",{className:"error-message",children:T.message})]},N))})]}),t.jsxs(Ka,{children:[t.jsx("div",{className:"left-actions",children:m&&t.jsx(O,{variant:"outline",onClick:S,children:"다시 업로드"})}),t.jsxs("div",{className:"right-actions",children:[t.jsx(O,{variant:"outline",onClick:z,children:"닫기"}),i&&!m&&!$.isPending&&t.jsxs(O,{onClick:C,children:[t.jsx(ye,{size:16}),"업로드 시작"]})]})]})]})})},Ga=o.div`
  display: flex;
  gap: 12px;
  align-items: center;
  flex: 1;
  /* flex-wrap 제거 - 한 줄 강제 유지 */
  
  @media (max-width: 768px) {
    gap: 8px;
    overflow-x: auto; /* 모바일에서는 가로 스크롤 */
  }
`,Bt=`
  height: 32px;
  padding: 0 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  outline: none;
  background: white;
  box-sizing: border-box;
  
  &:focus {
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
`,It=o.input`
  ${Bt}
  
  &::placeholder {
    color: #6b7280;
  }
`,Ha=o.select`
  ${Bt}
  min-width: 120px;
  cursor: pointer;
`,Ya=o.span`
  color: #6b7280;
  font-size: 14px;
  font-weight: 500;
  height: 32px;
  display: flex;
  align-items: center;
`,Va=o.button`
  ${Bt}
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
  
  &:hover {
    background: #f9fafb;
    border-color: #9ca3af;
    color: #374151;
  }
  
  &:focus {
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
`,Ja=({onFilter:e})=>{const[s,r]=f.useState({}),n=(l,i)=>{const u={...s,[l]:i||void 0};r(u),e(u)},a=()=>{r({}),e({})};return t.jsxs(Ga,{children:[t.jsx(It,{type:"text",placeholder:"품목명 또는 요청자로 검색...",value:s.search||"",onChange:l=>n("search",l.target.value),style:{width:"200px",flexShrink:0}}),t.jsxs(Ha,{value:s.status||"",onChange:l=>n("status",l.target.value),style:{flexShrink:0},children:[t.jsx("option",{value:"",children:"전체 상태"}),t.jsx("option",{value:"SUBMITTED",children:"요청됨"}),t.jsx("option",{value:"COMPLETED",children:"완료됨"}),t.jsx("option",{value:"CANCELLED",children:"취소됨"})]}),t.jsx(It,{type:"date",placeholder:"시작일",value:s.dateFrom||"",onChange:l=>n("dateFrom",l.target.value),style:{flexShrink:0}}),t.jsx(Ya,{children:"~"}),t.jsx(It,{type:"date",placeholder:"종료일",value:s.dateTo||"",onChange:l=>n("dateTo",l.target.value),style:{flexShrink:0}}),t.jsxs(Va,{onClick:a,type:"button",style:{flexShrink:0},children:[t.jsx(Ts,{size:16}),"초기화"]})]})},Xa=o.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  max-height: 80vh;
  overflow-y: auto;
`,Za=o.div`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 24px;
  border-radius: 16px;
  color: white;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    right: 0;
    width: 100px;
    height: 100px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 50%;
    transform: translate(30px, -30px);
  }
  
  .header-content {
    position: relative;
    z-index: 1;
  }
  
  .request-id {
    font-size: 0.875rem;
    opacity: 0.9;
    margin-bottom: 8px;
    display: flex;
    align-items: center;
    gap: 6px;
  }
  
  .item-name {
    font-size: 1.5rem;
    font-weight: 700;
    margin-bottom: 12px;
    line-height: 1.3;
  }
  
  .meta-info {
    display: flex;
    gap: 24px;
    align-items: center;
    flex-wrap: wrap;
  }
`,ei=o.div`
  display: flex;
  align-items: center;
  gap: 8px;
  
  .status-badge {
    padding: 6px 16px;
    border-radius: 20px;
    font-size: 0.875rem;
    font-weight: 600;
    background: rgba(255, 255, 255, 0.2);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.3);
  }
`,ti=o.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 16px;
  margin-bottom: 8px;
`,nt=o.div`
  background: linear-gradient(135deg, ${e=>e.$color}15, ${e=>e.$color}08);
  border: 1px solid ${e=>e.$color}25;
  border-radius: 12px;
  padding: 16px;
  text-align: center;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 4px;
    height: 100%;
    background: ${e=>e.$color};
  }
  
  .stat-icon {
    color: ${e=>e.$color};
    margin-bottom: 8px;
  }
  
  .stat-value {
    font-size: 1.25rem;
    font-weight: 700;
    color: #1f2937;
    margin-bottom: 4px;
  }
  
  .stat-label {
    font-size: 0.75rem;
    color: #6b7280;
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
`,si=o.div`
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 4px;
    background: linear-gradient(90deg, #667eea, #764ba2);
    border-radius: 16px 16px 0 0;
  }
  
  .section-header {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 20px;
    padding-bottom: 12px;
    border-bottom: 2px solid #f3f4f6;
    
    .section-icon {
      padding: 8px;
      background: linear-gradient(135deg, #667eea, #764ba2);
      color: white;
      border-radius: 10px;
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
    }
    
    h3 {
      margin: 0;
      font-size: 1.1rem;
      font-weight: 600;
      color: #1f2937;
    }
  }
`,ri=o.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
`,ze=o.div`
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 16px;
  transition: all 0.2s ease;
  
  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    border-color: #667eea;
  }
  
  .info-header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 8px;
    
    .info-icon {
      color: #667eea;
      flex-shrink: 0;
    }
    
    .info-label {
      font-size: 0.875rem;
      color: #64748b;
      font-weight: 500;
    }
  }
  
  .info-value {
    font-size: 1rem;
    font-weight: 600;
    color: #1e293b;
    line-height: 1.4;
    margin-left: 24px;
  }
`,ni=o.div`
  background: linear-gradient(135deg, #f1f5f9, #e2e8f0);
  border: 1px solid #cbd5e1;
  border-radius: 12px;
  padding: 20px;
  
  .specs-header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 12px;
    
    .specs-icon {
      color: #667eea;
    }
    
    .specs-label {
      font-size: 0.875rem;
      font-weight: 600;
      color: #475569;
    }
  }
  
  .specs-content {
    background: white;
    padding: 16px;
    border-radius: 8px;
    border: 1px solid #e2e8f0;
    line-height: 1.6;
    color: #334155;
    white-space: pre-wrap;
  }
`,oi=o.div`
  background: linear-gradient(135deg, #fef7cd, #fed7aa);
  border: 1px solid #f59e0b;
  border-radius: 16px;
  padding: 24px;
  
  .justification-header {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 16px;
    
    .justification-icon {
      padding: 8px;
      background: #f59e0b;
      color: white;
      border-radius: 10px;
    }
    
    h3 {
      margin: 0;
      font-size: 1.1rem;
      font-weight: 600;
      color: #92400e;
    }
  }
  
  .justification-content {
    background: white;
    padding: 20px;
    border-radius: 12px;
    line-height: 1.6;
    color: #451a03;
    box-shadow: 0 2px 8px rgba(245, 158, 11, 0.1);
    border: 1px solid rgba(245, 158, 11, 0.2);
  }
`,ai=o.span`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  
  ${e=>{var s;switch((s=e.$urgency)==null?void 0:s.toLowerCase()){case"low":return`
          background: linear-gradient(135deg, #d1fae5, #a7f3d0);
          color: #065f46;
          border: 1px solid #10b981;
        `;case"normal":return`
          background: linear-gradient(135deg, #dbeafe, #bfdbfe);
          color: #1e40af;
          border: 1px solid #3b82f6;
        `;case"high":return`
          background: linear-gradient(135deg, #fed7aa, #fdba74);
          color: #9a3412;
          border: 1px solid #f97316;
        `;case"urgent":case"emergency":return`
          background: linear-gradient(135deg, #fee2e2, #fecaca);
          color: #991b1b;
          border: 1px solid #ef4444;
          animation: pulse 2s infinite;
        `;default:return`
          background: linear-gradient(135deg, #f3f4f6, #e5e7eb);
          color: #374151;
          border: 1px solid #9ca3af;
        `}}}
  
  @keyframes pulse {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.05); }
  }
`,ii=o.span`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 16px;
  font-size: 0.75rem;
  font-weight: 600;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`,li=o.div`
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 24px;
  background: #f8fafc;
  border-radius: 16px;
  border: 2px dashed #cbd5e1;
`,ci=({request:e,isOpen:s,onClose:r,onEdit:n,onApprove:a})=>{var d;const l={SUBMITTED:"요청됨",COMPLETED:"구매완료",CANCELLED:"취소됨"},i={LOW:"낮음",NORMAL:"보통",HIGH:"높음",URGENT:"긴급",EMERGENCY:"응급"},u={OFFICE_SUPPLIES:"사무용품",ELECTRONICS:"IT장비",FURNITURE:"가구",SOFTWARE:"소프트웨어",MAINTENANCE:"유지보수",SERVICES:"서비스",OTHER:"기타"},x=$=>{if(!$)return"-";try{return new Date($).toLocaleDateString("ko-KR",{year:"numeric",month:"long",day:"numeric",weekday:"short"})}catch{return"-"}},c=$=>!$||$===0?"-":`₩${$.toLocaleString()}`,m=e.status==="submitted",w=e.status==="PENDING_APPROVAL",k=$=>{const v=/(https?:\/\/[^\s]+)/g;return $.split(v).map((h,C)=>h.match(v)?t.jsx("a",{href:h,target:"_blank",rel:"noopener noreferrer",style:{color:"#f59e0b",textDecoration:"underline",fontWeight:"600",transition:"color 0.2s ease"},onMouseEnter:E=>E.currentTarget.style.color="#d97706",onMouseLeave:E=>E.currentTarget.style.color="#f59e0b",children:h},C):h)};return t.jsx(Te,{isOpen:s,onClose:r,title:"구매 요청 상세정보",size:"xl",children:t.jsxs(Xa,{children:[t.jsx(Za,{children:t.jsxs("div",{className:"header-content",children:[t.jsxs("div",{className:"request-id",children:[t.jsx(kr,{size:14}),"요청번호 #",e.id]}),t.jsx("div",{className:"item-name",children:e.item_name||"품목명 없음"}),t.jsxs("div",{className:"meta-info",children:[t.jsx(ei,{children:t.jsx("span",{className:"status-badge",children:l[e.status]||e.status})}),t.jsxs("div",{style:{display:"flex",alignItems:"center",gap:"6px",opacity:.9},children:[t.jsx(Pt,{size:14}),x(e.created_at)]}),t.jsxs("div",{style:{display:"flex",alignItems:"center",gap:"6px",opacity:.9},children:[t.jsx(Nr,{size:14}),e.requester_name||"요청자 정보없음"]})]})]})}),t.jsxs(ti,{children:[t.jsxs(nt,{$color:"#3b82f6",children:[t.jsx(ce,{className:"stat-icon",size:24}),t.jsx("div",{className:"stat-value",children:((d=e.quantity)==null?void 0:d.toLocaleString())||"0"}),t.jsxs("div",{className:"stat-label",children:["수량 (",e.unit||"개",")"]})]}),t.jsxs(nt,{$color:"#10b981",children:[t.jsx(lt,{className:"stat-icon",size:24}),t.jsx("div",{className:"stat-value",children:c(e.estimated_unit_price)}),t.jsx("div",{className:"stat-label",children:"단가"})]}),t.jsxs(nt,{$color:"#f59e0b",children:[t.jsx(lt,{className:"stat-icon",size:24}),t.jsx("div",{className:"stat-value",children:c(e.total_budget)}),t.jsx("div",{className:"stat-label",children:"총 예산"})]}),t.jsxs(nt,{$color:"#ef4444",children:[t.jsx(De,{className:"stat-icon",size:24}),t.jsx("div",{className:"stat-value",children:i[e.urgency]||e.urgency}),t.jsx("div",{className:"stat-label",children:"긴급도"})]})]}),e.specifications&&t.jsxs(ni,{children:[t.jsxs("div",{className:"specs-header",children:[t.jsx(ce,{className:"specs-icon",size:16}),t.jsx("span",{className:"specs-label",children:"사양 및 요구사항"})]}),t.jsx("div",{className:"specs-content",children:e.specifications})]}),t.jsxs(si,{children:[t.jsxs("div",{className:"section-header",children:[t.jsx(Ke,{className:"section-icon",size:20}),t.jsx("h3",{children:"프로젝트 및 부서 정보"})]}),t.jsxs(ri,{children:[t.jsxs(ze,{children:[t.jsxs("div",{className:"info-header",children:[t.jsx(Ke,{className:"info-icon",size:16}),t.jsx("span",{className:"info-label",children:"소속 부서"})]}),t.jsx("div",{className:"info-value",children:e.department||"정보없음"})]}),e.project&&t.jsxs(ze,{children:[t.jsxs("div",{className:"info-header",children:[t.jsx(ce,{className:"info-icon",size:16}),t.jsx("span",{className:"info-label",children:"관련 프로젝트"})]}),t.jsx("div",{className:"info-value",children:e.project})]}),t.jsxs(ze,{children:[t.jsxs("div",{className:"info-header",children:[t.jsx(ce,{className:"info-icon",size:16}),t.jsx("span",{className:"info-label",children:"요청자"})]}),t.jsx("div",{className:"info-value",children:t.jsx(ii,{$category:e.requester_name,children:u[e.requester_name]||e.requester_name})})]}),t.jsxs(ze,{children:[t.jsxs("div",{className:"info-header",children:[t.jsx(De,{className:"info-icon",size:16}),t.jsx("span",{className:"info-label",children:"긴급도"})]}),t.jsx("div",{className:"info-value",children:t.jsx(ai,{$urgency:e.urgency,children:i[e.urgency]||e.urgency})})]}),t.jsxs(ze,{children:[t.jsxs("div",{className:"info-header",children:[t.jsx(Ke,{className:"info-icon",size:16}),t.jsx("span",{className:"info-label",children:"구매처"})]}),t.jsx("div",{className:"info-value",children:e.preferred_supplier||"정보없음"})]}),e.preferred_supplier&&t.jsxs(ze,{children:[t.jsxs("div",{className:"info-header",children:[t.jsx(Ke,{className:"info-icon",size:16}),t.jsx("span",{className:"info-label",children:"구매처"})]}),t.jsx("div",{className:"info-value",children:e.preferred_supplier})]}),e.expected_delivery_date&&t.jsxs(ze,{children:[t.jsxs("div",{className:"info-header",children:[t.jsx(Pt,{className:"info-icon",size:16}),t.jsx("span",{className:"info-label",children:"희망 납기일"})]}),t.jsx("div",{className:"info-value",children:x(e.expected_delivery_date)})]})]})]}),e.justification&&t.jsxs(oi,{children:[t.jsxs("div",{className:"justification-header",children:[t.jsx(De,{className:"justification-icon",size:20}),t.jsxs("h3",{children:["              구매 사유 및 링크 ",t.jsx("span",{style:{color:"red"},children:"*"})]})]}),t.jsx("div",{className:"justification-content",children:k(e.justification)})]}),t.jsxs(li,{children:[t.jsx(O,{variant:"outline",onClick:r,size:"lg",children:"닫기"}),m&&n&&t.jsxs(O,{onClick:n,size:"lg",children:[t.jsx(qt,{size:18}),"수정하기"]}),w&&a&&t.jsxs(O,{variant:"success",onClick:a,size:"lg",children:[t.jsx(Ot,{size:18}),"승인처리"]})]})]})})},$s=o.div`
  padding: 24px;
  max-width: 1400px;
  margin: 0 auto;
`,ks=o.div`
  margin-bottom: 32px;
`,Ns=o.h1`
  font-size: 2rem;
  font-weight: 600;
  margin-bottom: 8px;
  color: #1f2937;
`,di=o.p`
  color: #6b7280;
  margin-bottom: 0;
  font-size: 1rem;
  line-height: 1.5;
`,pi=o.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 20px;
  margin-bottom: 32px;
  
  @media (max-width: 768px) {
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 16px;
  }
`,ot=o(te)`
  text-align: center;
  background: ${e=>e.$color?`linear-gradient(135deg, ${e.$color}15 0%, ${e.$color}08 100%)`:"white"};
  border-left: 4px solid ${e=>e.$color||"#3b82f6"};
  padding: 24px 20px;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  }
  
  .stat-header {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    margin-bottom: 16px;
    color: ${e=>e.$color||"#3b82f6"};
    font-weight: 500;
  }
  
  .stat-value {
    font-size: 2.5rem;
    font-weight: 700;
    margin-bottom: 8px;
    color: ${e=>e.$color||"#3b82f6"};
    line-height: 1;
  }
  
  .stat-label {
    font-size: 0.875rem;
    color: #6b7280;
    margin-bottom: 12px;
  }
  
  .stat-change {
    font-size: 0.75rem;
    padding: 4px 8px;
    border-radius: 12px;
    font-weight: 500;
    display: inline-block;
    
    &.positive {
      background: #10b98120;
      color: #10b981;
    }
    
    &.negative {
      background: #ef444420;
      color: #ef4444;
    }
  }
`,ui=o(te)`
  padding: 0;
  overflow: hidden;
`,xi=o.div`
  padding: 20px 24px;
  border-bottom: 1px solid #e5e7eb;
  background: #f9fafb;
`,mi=o.div`
  display: flex;
  gap: 16px;
  align-items: flex-start;
  justify-content: space-between;
  
  @media (max-width: 1024px) {
    flex-direction: column;
    gap: 16px;
  }
`,hi=o.div`
  display: flex;
  gap: 8px;
  flex-shrink: 0;
  
  @media (max-width: 1024px) {
    width: 100%;
    justify-content: flex-end;
  }
  
  @media (max-width: 768px) {
    justify-content: stretch;
    
    > button {
      flex: 1;
      min-width: 0;
      
      span {
        display: none;
      }
      
      svg {
        margin: 0;
      }
    }
  }
`,gi=o.div`
  padding: 24px;
`,fi=o.span`
  padding: 4px 12px;
  border-radius: 16px;
  font-size: 12px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  
  ${e=>{switch(e.$status){case"SUBMITTED":return`
          background: #FEF3C7;
          color: #92400E;
        `;case"COMPLETED":return`
          background: #D1FAE5;
          color: #065F46;
        `;case"CANCELLED":return`
          background: #FEE2E2;
          color: #991B1B;
        `;case"IN_REVIEW":return`
          background: #DBEAFE;
          color: #1E40AF;
        `;default:return`
          background: #F3F4F6;
          color: #374151;
        `}}}
`,bi=o.span`
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  
  ${e=>{switch(e.$urgency){case"urgent":return`
          background: #fee2e2;
          color: #991b1b;
        `;case"high":return`
          background: #fed7aa;
          color: #9a3412;
        `;case"normal":return`
          background: #dbeafe;
          color: #1e40af;
        `;case"low":return`
          background: #d1fae5;
          color: #065f46;
        `;default:return`
          background: #f3f4f6;
          color: #374151;
        `}}}
`,yi=o.div`
  display: flex;
  gap: 5px;
`,vi=o.div`
  text-align: center;
  padding: 60px 20px;
  
  .error-icon {
    color: #ef4444;
    margin-bottom: 16px;
  }
  
  .error-title {
    font-size: 1.25rem;
    font-weight: 600;
    margin-bottom: 8px;
    color: #1f2937;
  }
  
  .error-message {
    color: #6b7280;
    margin-bottom: 24px;
    line-height: 1.6;
  }
`,ji=o.div`
  text-align: center;
  padding: 60px 20px;
  color: #6b7280;
  
  .empty-icon {
    margin-bottom: 16px;
    color: #d1d5db;
  }
  
  .empty-title {
    font-size: 1.125rem;
    font-weight: 500;
    margin-bottom: 8px;
    color: #374151;
  }
  
  .empty-message {
    margin-bottom: 24px;
    line-height: 1.6;
  }
`,wi=o.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`,$i=o.div`
  background: white;
  padding: 32px;
  border-radius: 16px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
  max-width: 500px;
  width: 90%;
  text-align: center;
  
  .confirm-icon {
    width: 64px;
    height: 64px;
    background: linear-gradient(135deg, #10b981, #059669);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 20px;
    color: white;
  }
  
  .confirm-title {
    font-size: 1.5rem;
    font-weight: 600;
    margin-bottom: 12px;
    color: #1f2937;
  }
  
  .confirm-message {
    color: #6b7280;
    margin-bottom: 8px;
    line-height: 1.5;
  }
  
  .item-info {
    background: #f9fafb;
    padding: 16px;
    border-radius: 8px;
    margin: 20px 0;
    text-align: left;
    
    .info-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 8px;
      
      &:last-child {
        margin-bottom: 0;
      }
      
      .label {
        font-weight: 500;
        color: #6b7280;
        min-width: 80px;
      }
      
      .value {
        font-weight: 600;
        color: #1f2937;
        flex: 1;
      }
    }
  }
  
  .button-group {
    display: flex;
    gap: 12px;
    justify-content: center;
    margin-top: 24px;
  }
`,ki=()=>{var Le,Ae,_e;const e=Tr(),s=Be(),[r,n]=f.useState(1),[a,l]=f.useState({}),[i,u]=f.useState(!1),[x,c]=f.useState(!1),[m,w]=f.useState(null),[k,d]=f.useState(null),[$,v]=f.useState(!1),[h,C]=f.useState(null),{data:E,isLoading:q,error:b,refetch:F}=je({queryKey:["purchase-requests",r,a],queryFn:()=>xe.getRequests({page:r,limit:20,...a}),keepPreviousData:!0,staleTime:5*60*1e3,retry:2}),{data:S}=je({queryKey:["purchase-requests-stats"],queryFn:()=>xe.getStats(),staleTime:5*60*1e3}),z=ne({mutationFn:async({requestId:y,requestData:I})=>{var D,Q,A;console.log("🚀 구매완료 + 품목 등록 시작:",{requestId:y,requestData:I});try{console.log("📝 1단계: 구매 요청 상태 업데이트");const Y=await xe.updateRequest(y,{status:"COMPLETED",completed_date:new Date().toISOString(),completed_by:I.requester_name});console.log("✅ 구매 요청 상태 업데이트 성공:",Y),console.log("📦 2단계: 품목관리에 등록");const J={item_code:`ITM-${new Date().toISOString().split("T")[0].replace(/-/g,"")}-${y.toString().padStart(4,"0")}`,item_name:I.item_name||"품목명 없음",category:I.category||"OTHER",description:I.specifications||`구매요청 #${y}에서 자동 생성`,current_stock:Number(I.quantity)||0,minimum_stock:Math.max(1,Math.ceil((Number(I.quantity)||0)*.2)),maximum_stock:(Number(I.quantity)||0)*2,unit:I.unit||"개",unit_price:Number(I.estimated_unit_price)||0,currency:I.currency||"KRW",supplier_name:I.preferred_supplier||"",location:"창고",warehouse:"메인창고",purchase_request_id:y,notes:`구매요청 #${y}에서 자동 생성됨`,is_active:!0,created_by:I.requester_name,department:I.department};console.log("📤 품목 등록 데이터:",J);const re=await ut.createItem(J);return console.log("✅ 품목 등록 성공:",re),{success:!0,purchase_update:Y,inventory_created:re,inventory_item_id:(D=re.data)==null?void 0:D.id,inventory_item_code:J.item_code,message:"구매완료 및 품목 등록 성공"}}catch(Y){if(console.error("❌ 처리 중 오류:",Y),(Q=Y.message)!=null&&Q.includes("inventory")||(A=Y.response)!=null&&A.status)return console.warn("⚠️ 품목 등록 실패, 구매 요청만 완료됨"),{success:!0,partial_success:!0,purchase_update:!0,inventory_created:!1,message:"구매 요청은 완료되었지만 품목 등록에 실패했습니다.",error:Y.message};throw Y}},retry:(y,I)=>{var Q,A,Y,J;return y>=2?!1:((Q=I.response)==null?void 0:Q.status)===500||((J=(Y=(A=I.response)==null?void 0:A.data)==null?void 0:Y.detail)==null?void 0:J.includes("transaction is aborted"))?(console.log(`🔄 재시도 ${y+1}/2`),!0):!1},retryDelay:y=>Math.min(1e3*2**y,5e3),onSuccess:async(y,I)=>{console.log("🎉 구매완료 처리 결과:",y);try{s.setQueryData(["purchase-requests",r,a],D=>{var Q;return(Q=D==null?void 0:D.data)!=null&&Q.items?{...D,data:{...D.data,items:D.data.items.map(A=>A.id===I.requestId?{...A,status:"COMPLETED",completed_date:new Date().toISOString(),completed_by:y.inventory_created,inventory_item_id:y.inventory_item_id,inventory_item_code:y.inventory_item_code}:A)}}:D}),y.inventory_created!==!1?(_.success(`🎉 구매완료! 품목코드: ${y.inventory_item_code}로 등록되었습니다!`,{autoClose:5e3,position:"top-center"}),setTimeout(()=>{e(`/inventory?highlight=${y.inventory_item_id}`)},2e3)):_.warning("구매 요청은 완료되었지만 품목 등록에 실패했습니다. 수동으로 등록해주세요.",{autoClose:7e3}),await s.invalidateQueries({queryKey:["purchase-requests"]}),await new Promise(D=>setTimeout(D,200)),await s.invalidateQueries({queryKey:["purchase-requests-stats"]}),await new Promise(D=>setTimeout(D,200)),await s.invalidateQueries({queryKey:["inventory"]}),await new Promise(D=>setTimeout(D,200)),await s.invalidateQueries({queryKey:["inventory-stats"]}),C(null)}catch(D){console.error("성공 후 처리 중 오류:",D),_.warning("구매는 완료되었으나 화면 새로고침 중 오류가 발생했습니다. 페이지를 새로고침해주세요."),C(null)}},onError:y=>{var D,Q,A,Y;console.error("❌ 구매완료 처리 실패:",y);let I="구매완료 처리 중 오류가 발생했습니다.";y.message?I=y.message:(Q=(D=y.response)==null?void 0:D.data)!=null&&Q.detail?y.response.data.detail.includes("transaction is aborted")?I=`⚠️ 데이터베이스 처리 중 문제가 발생했습니다.

잠시 후 다시 시도하거나, 지속적으로 문제가 발생하면 관리자에게 문의해주세요.`:I=y.response.data.detail:(Y=(A=y.response)==null?void 0:A.data)!=null&&Y.message&&(I=y.response.data.message),_.error(I,{autoClose:7e3,position:"top-center"}),C(null)}}),P=ne({mutationFn:async y=>{var I,D;console.log(`🔥 삭제 API 호출 시작: ID=${y}`);try{const Q=await xe.deleteRequest(y);return console.log("✅ 삭제 API 성공:",Q),Q}catch(Q){throw console.error("❌ 삭제 API 실패:",Q),console.error("❌ 에러 상세:",{status:(I=Q.response)==null?void 0:I.status,data:(D=Q.response)==null?void 0:D.data,message:Q.message}),Q}},onSuccess:(y,I)=>{console.log("🎉 삭제 성공 처리:",y);const D=y.deleted_item||"구매 요청",Q=y.method==="soft_delete"?"취소":"삭제";_.success(`${D}이(가) 성공적으로 ${Q}되었습니다.`,{autoClose:3e3}),s.setQueryData(["purchase-requests",r,a],A=>{var J;if(!((J=A==null?void 0:A.data)!=null&&J.items))return A;const Y=A.data.items.filter(re=>re.id!==I);return console.log(`📋 캐시 업데이트: ${A.data.items.length} → ${Y.length}`),{...A,data:{...A.data,items:Y,total:Math.max(0,A.data.total-1)}}}),s.setQueryData(["purchase-requests-stats"],A=>A!=null&&A.data?{...A,data:{...A.data,total:Math.max(0,A.data.total-1)}}:A),setTimeout(()=>{console.log("🔄 캐시 새로고침 실행"),s.invalidateQueries({queryKey:["purchase-requests"]}),s.invalidateQueries({queryKey:["purchase-requests-stats"]})},1e3)},onError:(y,I)=>{var Q,A,Y,J,re,Ue;console.error("❌ 삭제 실패 처리:",y);let D="삭제 중 오류가 발생했습니다.";((Q=y.response)==null?void 0:Q.status)===404?D="삭제할 구매 요청을 찾을 수 없습니다.":((A=y.response)==null?void 0:A.status)===400?D=((Y=y.response.data)==null?void 0:Y.detail)||"삭제할 수 없는 상태입니다.":((J=y.response)==null?void 0:J.status)===500?D="서버 오류로 삭제에 실패했습니다. 잠시 후 다시 시도해주세요.":(Ue=(re=y.response)==null?void 0:re.data)!=null&&Ue.detail&&(D=y.response.data.detail),_.error(D,{autoClose:5e3})}}),W=ne({mutationFn:()=>xe.exportRequests(a),onSuccess:()=>{_.success("Excel 파일이 다운로드되었습니다.")},onError:y=>{console.error("Export error:",y),_.error("Excel 다운로드에 실패했습니다.")}}),T=f.useMemo(()=>[{key:"id",label:"번호",sortable:!0,width:"80px",render:y=>t.jsxs("span",{style:{fontFamily:"monospace",fontSize:"0.9rem",fontWeight:"500"},children:["#",y]})},{key:"item_name",label:"품목명",sortable:!0,width:"200px",render:(y,I)=>t.jsx("div",{children:t.jsx("div",{style:{fontWeight:"bold",marginBottom:"4px"},children:y||"품목명 없음"})})},{key:"quantity",label:"수량",width:"80px",render:(y,I)=>t.jsxs("div",{style:{textAlign:"center",fontWeight:"500",whiteSpace:"nowrap"},children:[(y==null?void 0:y.toLocaleString())||"0"," ",I.unit||"개"]})},{key:"requester_name",label:"요청자",width:"120px",render:(y,I)=>t.jsxs("div",{children:[t.jsx("div",{style:{fontWeight:"500"},children:y}),t.jsx("div",{style:{fontSize:"12px",color:"#6b7280"},children:I.department})]})},{key:"urgency",label:"긴급도",width:"100px",render:y=>{const I={low:"낮음",normal:"보통",high:"높음",urgent:"긴급",emergency:"응급"};return t.jsx(bi,{$urgency:y,children:I[y]||y})}},{key:"status",label:"상태",width:"120px",render:y=>{const I={SUBMITTED:"요청됨",COMPLETED:"구매완료",CANCELLED:"취소됨"};return t.jsx(fi,{$status:y,children:I[y]||y})}},{key:"created_at",label:"요청일",sortable:!0,width:"120px",render:y=>y?new Date(y).toLocaleDateString("ko-KR"):"-"},{key:"total_budget",label:"예상금액",width:"160px",render:(y,I)=>!y||y===0?"-":`${I.currency||"원"} ${y.toLocaleString()}`},{key:"actions",label:"관리",width:"160px",render:(y,I)=>{const D=I.status==="COMPLETED",Q=I.inventory_item_id||I.inventory_item_code;return t.jsxs(yi,{children:[D?Q?t.jsxs(O,{size:"sm",variant:"outline",title:`구매완료 & 품목등록 완료 ${I.inventory_item_code?`(${I.inventory_item_code})`:""}`,onClick:()=>{I.inventory_item_id&&e(`/inventory?highlight=${I.inventory_item_id}`)},style:{background:"#f0fdf4",color:"#16a34a",border:"1px solid #16a34a"},disabled:!I.inventory_item_id,children:[t.jsx(bt,{size:14}),"완료됨"]}):t.jsxs(O,{size:"sm",variant:"outline",title:"구매완료됨 (품목 등록 실패)",disabled:!0,style:{background:"#f3f4f6",color:"#6b7280",border:"1px solid #6b7280"},children:[t.jsx(Ot,{size:14}),"구매완료"]}):t.jsxs(O,{size:"sm",variant:"success",onClick:()=>He(I),title:"구매완료 + 품목등록",style:{background:"linear-gradient(135deg, #3b82f6, #1d4ed8)",color:"white",fontWeight:"600"},children:[t.jsx(Cr,{size:14}),"구매완료"]}),t.jsx(O,{size:"sm",variant:"outline",onClick:()=>N(I),title:"상세보기",children:t.jsx(_r,{size:14})}),t.jsx(O,{size:"sm",variant:"outline",onClick:()=>p(I),title:"수정",children:t.jsx(qt,{size:14})}),t.jsx(O,{size:"sm",variant:"danger",onClick:()=>R(I.id),title:"삭제",disabled:P.isPending,loading:P.isPending,children:t.jsx(Os,{size:14})})]})}}],[]),N=y=>{console.log("상세보기 데이터:",y),d(y),v(!0)},p=y=>{w(y),u(!0)},R=async y=>{var I,D,Q,A,Y;try{console.log(`🗑️ 구매 요청 삭제 시작: ID=${y}`);const J=`정말로 이 구매 요청을 삭제하시겠습니까?

ID: ${y}

⚠️ 이 작업은 되돌릴 수 없습니다.`;if(!window.confirm(J)){console.log("🚫 사용자가 삭제를 취소함");return}console.log(`🗑️ 삭제 API 호출: ID=${y}`),await P.mutateAsync(y)}catch(J){console.error("❌ 삭제 처리 중 오류:",J);let re="삭제 중 오류가 발생했습니다.";((I=J.response)==null?void 0:I.status)===404?re="삭제할 구매 요청을 찾을 수 없습니다.":((D=J.response)==null?void 0:D.status)===400?re=((Q=J.response.data)==null?void 0:Q.detail)||"삭제할 수 없는 상태입니다.":(Y=(A=J.response)==null?void 0:A.data)!=null&&Y.detail&&(re=J.response.data.detail),_.error(re,{autoClose:5e3})}},U=()=>{W.mutate()},M=async()=>{try{await s.invalidateQueries({queryKey:["purchase-requests"]}),await new Promise(y=>setTimeout(y,100)),await s.invalidateQueries({queryKey:["purchase-requests-stats"]}),await new Promise(y=>setTimeout(y,100)),await F()}catch(y){console.error("새로고침 중 오류:",y),_.error("새로고침 중 오류가 발생했습니다.")}},K=y=>{l(I=>({...I,...y})),n(1)},V=()=>{u(!1),w(null),M()},ie=()=>{u(!1),w(null)},oe=()=>{c(!1),M()},He=y=>{console.log("🔄 구매완료 처리 요청:",y),C(y)},le=async()=>{if(h){console.log("🆕 구매완료 + 품목등록 처리 시작");try{if(z.isPending){console.log("⚠️ 이미 처리 중입니다.");return}await z.mutateAsync({requestId:h.id,requestData:h})}catch{console.log("구매완료 처리가 실패했습니다.")}}},Oe=()=>{C(null)},he=((Le=E==null?void 0:E.data)==null?void 0:Le.items)||[],Ce=((Ae=E==null?void 0:E.data)==null?void 0:Ae.pages)||0,Fe=((_e=E==null?void 0:E.data)==null?void 0:_e.total)||0,se=(S==null?void 0:S.data)||{total:0,pending:0,approved:0,rejected:0,this_month:0},Ye=(se==null?void 0:se.total)||he.length||0,Ve=(se==null?void 0:se.approved)||he.filter(y=>y.status==="COMPLETED").length||0,ft=(se==null?void 0:se.pending)||he.filter(y=>y.status==="SUBMITTED"||y.status==="PENDING").length||0,Je=(se==null?void 0:se.rejected)||he.filter(y=>y.status==="CANCELLED"||y.status==="REJECTED").length||0;return q&&!E?t.jsx(gt,{text:"구매 요청 데이터를 불러오는 중..."}):b?(console.error("Purchase requests error:",b),t.jsxs($s,{children:[t.jsx(ks,{children:t.jsx(Ns,{children:"구매 요청 관리"})}),t.jsx(te,{children:t.jsxs(vi,{children:[t.jsx(me,{size:48,className:"error-icon"}),t.jsx("div",{className:"error-title",children:"데이터를 불러올 수 없습니다"}),t.jsxs("div",{className:"error-message",children:["백엔드 서버가 실행되지 않았거나 구매 요청 API가 구현되지 않았습니다.",t.jsx("br",{}),"서버 상태를 확인해주세요."]}),t.jsxs(O,{onClick:M,disabled:q,children:[t.jsx(ct,{size:16}),"다시 시도"]})]})})]})):t.jsxs($s,{children:[t.jsxs(ks,{children:[t.jsx(Ns,{children:"구매 요청 관리"}),t.jsxs(di,{children:["구매 요청을 등록하고 승인 프로세스를 관리할 수 있습니다.",Fe>0&&` 총 ${Fe.toLocaleString()}건의 요청이 있습니다.`]})]}),t.jsxs(pi,{children:[t.jsxs(ot,{$color:"#3b82f6",children:[t.jsxs("div",{className:"stat-header",children:[t.jsx(Re,{size:24}),t.jsx("span",{children:"전체 요청"})]}),t.jsx("div",{className:"stat-value",children:Ye.toLocaleString()}),t.jsx("div",{className:"stat-label",children:"총 구매 요청"}),se.this_month>0&&t.jsxs("div",{className:"stat-change positive",children:["이번 달 +",se.this_month]})]}),t.jsxs(ot,{$color:"#f59e0b",children:[t.jsxs("div",{className:"stat-header",children:[t.jsx(Er,{size:24}),t.jsx("span",{children:"승인 대기"})]}),t.jsx("div",{className:"stat-value",children:ft.toLocaleString()}),t.jsx("div",{className:"stat-label",children:"처리 대기중"})]}),t.jsxs(ot,{$color:"#10b981",children:[t.jsxs("div",{className:"stat-header",children:[t.jsx(Ot,{size:24}),t.jsx("span",{children:"승인 완료"})]}),t.jsx("div",{className:"stat-value",children:Ve.toLocaleString()}),t.jsx("div",{className:"stat-label",children:"승인된 요청"})]}),t.jsxs(ot,{$color:"#ef4444",children:[t.jsxs("div",{className:"stat-header",children:[t.jsx(ve,{size:24}),t.jsx("span",{children:"거절됨"})]}),t.jsx("div",{className:"stat-value",children:Je.toLocaleString()}),t.jsx("div",{className:"stat-label",children:"거절된 요청"})]})]}),t.jsxs(ui,{children:[t.jsx(xi,{children:t.jsxs(mi,{children:[t.jsx(Ja,{onFilter:K}),t.jsxs(hi,{children:[t.jsxs(O,{variant:"outline",onClick:M,disabled:q,size:"sm",title:"새로고침",children:[t.jsx(ct,{size:16}),t.jsx("span",{children:"새로고침"})]}),t.jsxs(O,{variant:"secondary",onClick:U,disabled:W.isPending,loading:W.isPending,size:"sm",title:"Excel 다운로드",children:[t.jsx(be,{size:16}),t.jsx("span",{children:"Excel 다운로드"})]}),t.jsxs(O,{variant:"outline",onClick:()=>c(!0),size:"sm",title:"Excel 일괄 업로드",style:{background:"linear-gradient(135deg, #10b981, #059669)",color:"white",borderColor:"#10b981"},children:[t.jsx(ye,{size:16}),t.jsx("span",{children:"Excel 업로드"})]}),t.jsxs(O,{onClick:()=>u(!0),size:"sm",title:"구매 요청 추가",children:[t.jsx(dt,{size:16}),t.jsx("span",{children:"구매 요청"})]})]})]})}),t.jsx(gi,{children:he.length===0&&!q?t.jsxs(ji,{children:[t.jsx(Re,{size:48,className:"empty-icon"}),t.jsx("div",{className:"empty-title",children:"등록된 구매 요청이 없습니다"}),t.jsx("div",{className:"empty-message",children:"새로운 구매 요청을 등록하여 시작해보세요."}),t.jsxs("div",{style:{display:"flex",gap:"12px",justifyContent:"center"},children:[t.jsxs(O,{onClick:()=>u(!0),children:[t.jsx(dt,{size:16}),"개별 등록"]}),t.jsxs(O,{variant:"outline",onClick:()=>c(!0),children:[t.jsx(ye,{size:16}),"Excel 업로드"]})]})]}):t.jsxs(t.Fragment,{children:[t.jsx(Mt,{columns:T,data:he,loading:q,emptyMessage:"검색 조건에 맞는 구매 요청이 없습니다."}),Ce>1&&t.jsx(Dt,{currentPage:r,totalPages:Ce,onPageChange:n})]})})]}),t.jsx(Te,{isOpen:i,onClose:ie,title:m?"구매 요청 수정":"새 구매 요청 등록",size:"xl",children:t.jsx(Fa,{onSuccess:V,onCancel:ie,initialData:m||void 0,isEdit:!!m})}),t.jsx(Qa,{isOpen:x,onClose:()=>c(!1),onSuccess:oe}),k&&t.jsx(ci,{request:k,isOpen:$,onClose:()=>{v(!1),d(null)},onEdit:()=>{w(k),u(!0),v(!1),d(null)}}),h&&t.jsx(wi,{onClick:Oe,children:t.jsxs($i,{onClick:y=>y.stopPropagation(),children:[t.jsx("div",{className:"confirm-icon",children:t.jsx(bt,{size:32})}),t.jsx("div",{className:"confirm-title",children:"구매완료 + 품목등록"}),t.jsx("div",{className:"confirm-message",children:"아래 구매 요청을 완료하고 품목관리에 등록하시겠습니까?"}),t.jsxs("div",{className:"confirm-message",style:{color:"#10b981",fontWeight:"bold"},children:["✨ 1) 구매 요청 상태를 '완료'로 변경",t.jsx("br",{}),"✨ 2) 품목관리에 자동 등록 후 해당 페이지로 이동"]}),t.jsxs("div",{className:"item-info",children:[t.jsxs("div",{className:"info-row",children:[t.jsx("span",{className:"label",children:"품목명:"}),t.jsx("span",{className:"value",children:h.item_name})]}),t.jsxs("div",{className:"info-row",children:[t.jsx("span",{className:"label",children:"수량:"}),t.jsxs("span",{className:"value",style:{display:"inline",whiteSpace:"nowrap"},children:[h.quantity," ",h.unit||"개"]})]}),t.jsxs("div",{className:"info-row",children:[t.jsx("span",{className:"label",children:"요청자:"}),t.jsx("span",{className:"value",children:h.requester_name})]}),t.jsxs("div",{className:"info-row",children:[t.jsx("span",{className:"label",children:"부서:"}),t.jsx("span",{className:"value",children:h.department})]}),h.total_budget&&t.jsxs("div",{className:"info-row",children:[t.jsx("span",{className:"label",children:"예산:"}),t.jsxs("span",{className:"value",children:[h.total_budget.toLocaleString(),"원"]})]}),t.jsxs("div",{className:"info-row",children:[t.jsx("span",{className:"label",children:"생성될 품목코드:"}),t.jsxs("span",{className:"value",style:{color:"#3b82f6",fontWeight:"bold"},children:["ITM-",new Date().toISOString().split("T")[0].replace(/-/g,""),"-",h.id.toString().padStart(4,"0")]})]})]}),t.jsxs("div",{className:"button-group",children:[t.jsx(O,{variant:"outline",onClick:Oe,size:"lg",children:"취소"}),t.jsxs(O,{onClick:le,size:"lg",loading:z.isPending,disabled:z.isPending,style:{background:"linear-gradient(135deg, #3b82f6, #1d4ed8)",border:"none"},children:[t.jsx(bt,{size:18}),"구매완료 + 품목등록"]})]})]})})]})},Ni=o.div`
  padding: 20px;
`,Ci=o.h1`
  font-size: 2rem;
  font-weight: 600;
  margin-bottom: 8px;
  color: ${e=>e.theme.colors.text};
`,_i=o.p`
  color: ${e=>e.theme.colors.textSecondary};
  margin-bottom: 30px;
  font-size: 1rem;
`,Ei=o.div`
  border: 2px dashed ${e=>e.disabled?e.theme.colors.border:e.isDragOver?e.theme.colors.primary:e.theme.colors.border};
  border-radius: ${e=>e.theme.borderRadius.lg};
  padding: 60px 20px;
  text-align: center;
  background: ${e=>e.disabled?e.theme.colors.background:e.isDragOver?e.theme.colors.primary+"05":e.theme.colors.surface};
  transition: all 0.3s ease;
  cursor: ${e=>e.disabled?"not-allowed":"pointer"};
  opacity: ${e=>e.disabled?.6:1};
  
  &:hover {
    border-color: ${e=>e.disabled?e.theme.colors.border:e.theme.colors.primary};
    background: ${e=>e.disabled?e.theme.colors.background:e.theme.colors.primary+"05"};
  }
  
  .upload-icon {
    margin-bottom: 20px;
    opacity: 0.5;
  }
  
  .upload-text {
    font-size: 1.1rem;
    margin-bottom: 10px;
    color: ${e=>e.theme.colors.text};
  }
  
  .upload-hint {
    color: ${e=>e.theme.colors.textSecondary};
    font-size: 0.9rem;
  }
`,zi=o.input`
  display: none;
`,Si=o.div`
  margin-top: 30px;
`,Ii=o(te)`
  margin-bottom: 30px;
  
  .info-header {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 20px;
    
    h3 {
      margin: 0;
      color: ${e=>e.theme.colors.text};
    }
  }
  
  .info-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 20px;
  }
  
  .info-item {
    .label {
      font-size: 0.9rem;
      color: ${e=>e.theme.colors.textSecondary};
      margin-bottom: 5px;
    }
    
    .value {
      font-weight: 500;
      color: ${e=>e.theme.colors.text};
    }
  }
`,Ti=o.div`
  width: 100%;
  height: 8px;
  background: ${e=>e.theme.colors.background};
  border-radius: 4px;
  overflow: hidden;
  margin: 20px 0;
  
  .progress-fill {
    height: 100%;
    background: ${e=>e.theme.colors.primary};
    width: ${e=>e.progress}%;
    transition: width 0.3s ease;
  }
`,Ri=o(te)`
  border-left: 4px solid ${e=>e.success?e.theme.colors.success:e.theme.colors.error};
  
  .result-header {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 15px;
    
    .result-icon {
      color: ${e=>e.success?e.theme.colors.success:e.theme.colors.error};
    }
    
    .result-title {
      font-size: 1.1rem;
      font-weight: 600;
      color: ${e=>e.success?e.theme.colors.success:e.theme.colors.error};
    }
  }
  
  .result-details {
    margin-bottom: 20px;
    
    .detail-item {
      display: flex;
      justify-content: space-between;
      margin-bottom: 8px;
      
      .label {
        color: ${e=>e.theme.colors.textSecondary};
      }
      
      .value {
        font-weight: 500;
      }
    }
  }
`,Pi=()=>{var E,q,b,F;const e=Be(),[s,r]=f.useState(!1),[n,a]=f.useState(null),[l,i]=f.useState(null),{data:u}=je({queryKey:["upload-info"],queryFn:it.getUploadInfo}),{data:x}=je({queryKey:["upload-template"],queryFn:it.getTemplate}),c=ne({mutationFn:it.uploadExcel,onSuccess:S=>{var z;a(S),i(null),e.invalidateQueries({queryKey:["inventory"]}),e.invalidateQueries({queryKey:["inventory-stats"]}),_.success(`Excel 파일이 업로드되었습니다. ${((z=S.data)==null?void 0:z.itemCount)||0}개 항목이 처리되었습니다.`)},onError:S=>{var P,W;i(null);const z=((W=(P=S.response)==null?void 0:P.data)==null?void 0:W.message)||"업로드 중 오류가 발생했습니다.";a({success:!1,error:z}),_.error(z)}}),m=S=>{if(!S)return;if(!S.name.endsWith(".xlsx")&&!S.name.endsWith(".xls")){_.error("Excel 파일만 업로드 가능합니다.");return}const z=50*1024*1024;if(S.size>z){_.error("파일 크기는 50MB를 초과할 수 없습니다.");return}a(null),i({loaded:0,total:S.size,percentage:0}),c.mutate(S)},w=S=>{if(S.preventDefault(),r(!1),c.isPending)return;const z=S.dataTransfer.files;z.length>0&&m(z[0])},k=S=>{S.preventDefault(),c.isPending||r(!0)},d=()=>{r(!1)},$=()=>{if(c.isPending)return;const S=document.getElementById("file-input");S==null||S.click()},v=()=>{_.info("템플릿 다운로드 기능이 곧 추가될 예정입니다.")},h=(u==null?void 0:u.data)||{},C=(x==null?void 0:x.data)||{};return t.jsxs(Ni,{children:[t.jsx(Ci,{children:"파일 관리"}),t.jsx(_i,{children:"Excel 파일을 업로드하여 품목 데이터를 일괄 등록할 수 있습니다."}),t.jsxs(Ii,{children:[t.jsxs("div",{className:"info-header",children:[t.jsx(Re,{size:24}),t.jsx("h3",{children:"업로드 정보"})]}),t.jsxs("div",{className:"info-grid",children:[t.jsxs("div",{className:"info-item",children:[t.jsx("div",{className:"label",children:"지원 형식"}),t.jsx("div",{className:"value",children:((E=h.supported_formats)==null?void 0:E.join(", "))||".xlsx, .xls"})]}),t.jsxs("div",{className:"info-item",children:[t.jsx("div",{className:"label",children:"최대 파일 크기"}),t.jsx("div",{className:"value",children:h.max_file_size||"50MB"})]}),t.jsxs("div",{className:"info-item",children:[t.jsx("div",{className:"label",children:"최대 파일 수"}),t.jsx("div",{className:"value",children:h.max_files||"1개"})]}),t.jsxs("div",{className:"info-item",children:[t.jsx("div",{className:"label",children:"필수 컬럼"}),t.jsxs("div",{className:"value",children:[((q=C.required_columns)==null?void 0:q.slice(0,3).join(", "))||"품목코드, 품목명, 카테고리",((b=C.required_columns)==null?void 0:b.length)>3&&"..."]})]})]}),t.jsx("div",{style:{marginTop:"20px"},children:t.jsxs(O,{variant:"outline",onClick:v,children:[t.jsx(be,{size:16}),"Excel 템플릿 다운로드"]})})]}),t.jsxs(te,{children:[t.jsxs(Ei,{isDragOver:s,disabled:c.isPending,onDrop:w,onDragOver:k,onDragLeave:d,onClick:$,children:[t.jsx(ye,{size:48,className:"upload-icon"}),t.jsx("div",{className:"upload-text",children:c.isPending?"파일을 업로드하는 중...":"Excel 파일을 여기에 끌어다 놓거나 클릭하여 선택하세요"}),t.jsx("div",{className:"upload-hint",children:".xlsx, .xls 파일만 지원됩니다 (최대 50MB)"})]}),t.jsx(zi,{id:"file-input",type:"file",accept:".xlsx,.xls",onChange:S=>{var P;const z=(P=S.target.files)==null?void 0:P[0];z&&m(z)},disabled:c.isPending}),l&&t.jsxs("div",{style:{marginTop:"20px"},children:[t.jsxs("div",{style:{display:"flex",justifyContent:"space-between",marginBottom:"10px"},children:[t.jsx("span",{children:"업로드 진행중..."}),t.jsxs("span",{children:[l.percentage.toFixed(1),"%"]})]}),t.jsx(Ti,{progress:l.percentage,children:t.jsx("div",{className:"progress-fill"})})]}),n&&t.jsx(Si,{children:t.jsxs(Ri,{success:n.success!==!1,children:[t.jsxs("div",{className:"result-header",children:[t.jsx("div",{className:"result-icon",children:n.success!==!1?t.jsx(Ne,{size:24}):t.jsx(me,{size:24})}),t.jsx("div",{className:"result-title",children:n.success!==!1?"업로드 완료!":"업로드 실패"})]}),n.success!==!1?t.jsxs("div",{className:"result-details",children:[t.jsxs("div",{className:"detail-item",children:[t.jsx("span",{className:"label",children:"처리된 항목:"}),t.jsxs("span",{className:"value",children:[((F=n.data)==null?void 0:F.itemCount)||0,"개"]})]}),t.jsxs("div",{className:"detail-item",children:[t.jsx("span",{className:"label",children:"파일명:"}),t.jsx("span",{className:"value",children:n.filename||"알 수 없음"})]}),t.jsxs("div",{className:"detail-item",children:[t.jsx("span",{className:"label",children:"업로드 시간:"}),t.jsx("span",{className:"value",children:new Date().toLocaleString("ko-KR")})]})]}):t.jsx("div",{className:"result-details",children:t.jsx("p",{style:{color:"#EF4444",marginBottom:"10px"},children:n.error})}),n.success!==!1&&t.jsxs(O,{variant:"outline",onClick:()=>window.location.href="/inventory",children:[t.jsx(Re,{size:16}),"재고 목록 확인"]})]})})]})]})};const Oi=()=>t.jsx(Lr,{client:Xr,children:t.jsxs(Fs,{theme:Ms,children:[t.jsx(Ds,{}),t.jsx(Rr,{children:t.jsxs("div",{className:"App",children:[t.jsx(Pr,{children:t.jsxs(we,{path:"/",element:t.jsx(Tn,{}),children:[t.jsx(we,{index:!0,element:t.jsx(Vt,{to:"/dashboard",replace:!0})}),t.jsx(we,{path:"dashboard",element:t.jsx(Qn,{})}),t.jsx(we,{path:"inventory",element:t.jsx(Ea,{})}),t.jsx(we,{path:"receipts",element:t.jsx(Ra,{})}),t.jsx(we,{path:"purchase-requests",element:t.jsx(ki,{})}),t.jsx(we,{path:"upload",element:t.jsx(Pi,{})}),t.jsx(we,{path:"*",element:t.jsx(Vt,{to:"/dashboard",replace:!0})})]})}),t.jsx(Lt,{position:"top-right",autoClose:3e3,hideProgressBar:!1,newestOnTop:!1,closeOnClick:!0,rtl:!1,pauseOnFocusLoss:!0,draggable:!0,pauseOnHover:!0,theme:"light"})]})})]})});const Fi=Ft.createRoot(document.getElementById("root"));Fi.render(t.jsx(H.StrictMode,{children:t.jsxs(Fs,{theme:Ms,children:[t.jsx(Ds,{}),t.jsx(Oi,{})]})}));
//# sourceMappingURL=index-5dbfb236.js.map
