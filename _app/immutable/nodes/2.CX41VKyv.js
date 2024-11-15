import{a as v,t as g,d as P}from"../chunks/disclose-version.DK82h6Cp.js";import"../chunks/legacy.BDaOdGTH.js";import{k as E,t as x,w as B,g as u,x as A,p as R,s as k,aF as M,A as T,v as y}from"../chunks/runtime.DBJxHWlC.js";import{s as U}from"../chunks/render.DqXT1gO6.js";import{p as F,i as N,o as I,b as q}from"../chunks/index-client.BDRLZcwe.js";import{e as D,i as G,s as L}from"../chunks/attributes.CtwjhWcM.js";import{i as H}from"../chunks/lifecycle.CDHfBchB.js";function V(o,i){var r=o.__className,t=z(i);E&&o.className===t?o.__className=t:(r!==t||E&&o.className!==t)&&(i==null?o.removeAttribute("class"):o.className=t,o.__className=t)}function z(o){return o??""}var W=g('<img class="social">'),Y=g('<a class="svelte-mcuy0a"><!></a>'),O=g("<div></div>");function C(o,i){let r=F(i,"location",8),t=F(i,"links",8);var e=O();D(e,5,t,G,(d,s)=>{var m=Y(),c=B(m);N(c,()=>u(s).type==="image",f=>{var l=W();x(()=>{L(l,"src",u(s).src),L(l,"alt",u(s).alt)}),v(f,l)},f=>{var l=P();x(()=>U(l,u(s).text)),v(f,l)}),A(m),x(()=>L(m,"href",u(s).href)),v(d,m)}),A(e),x(()=>V(e,`${r()??""} svelte-mcuy0a`)),v(o,e)}const X=`
attribute vec4 a_position;
void main() {
    gl_Position = a_position;
}
`,j=`
precision mediump float;
uniform float u_time;
uniform vec2 u_resolution;
uniform vec2 u_mouse;

float wave(vec2 p, float frequency, float amplitude, float speed, float offset) {
    return sin(p.x * frequency + u_time * speed + offset + mix(-1.0, 1.0, smoothstep(0.4, 0.6, u_mouse.x / u_resolution.x))) * amplitude;
}

void main() {
    vec2 st = gl_FragCoord.xy / u_resolution.xy;
    st.x *= u_resolution.x / u_resolution.y; // Correct aspect ratio

    // Adjust wave properties based on mouse position
    float frequencyMultiplier = mix(1.0, 15.0, pow(abs(0.5 - (u_mouse.x / u_resolution.x)), 2.0) * 10.0);
    float amplitudeMultiplier = mix(0.25, 0.05, u_mouse.y / u_resolution.y) * 1.2;

    // Create multiple wave layers with different frequencies and amplitudes
    float wave1 = wave(st, frequencyMultiplier, amplitudeMultiplier * 0.05, 1.5, 0.0);
    float wave2 = wave(st, frequencyMultiplier * 0.7, amplitudeMultiplier * 0.07, 2.0, 1.0);
    float wave3 = wave(st, frequencyMultiplier * 0.5, amplitudeMultiplier * 0.1, 2.5, 2.0);

    // Combine the waves to create a more complex wave pattern
    float wavePattern = st.y + wave1 + wave2 + wave3 + 0.75;

    vec3 color;
    float gradientFactor;
    float mediumSectionEnd = 0.995; // Border of solid medium section between gradient and sky
    float gradientStart = 0.95; // Start of the gradient section
    float gradientEnd = mediumSectionEnd; // End of the gradient section

    if (wavePattern > 1.0) {
        color = vec3(0.902, 0.957, 0.945); // #EEF7FF, lightest
    } else if (wavePattern > mediumSectionEnd) {
        color = vec3(0.769, 0.867, 0.941); // #CDE8E5, medium
    } else if (wavePattern > gradientStart) {
        gradientFactor = (1.0 - (wavePattern - gradientStart) / (gradientEnd - gradientStart)); // Inverted gradient factor
        vec3 middleColor = vec3(0.769, 0.867, 0.941); // #CDE8E5, medium
        vec3 darkestColor = vec3(0.122, 0.216, 0.275); // #7AB2B2, darkest
        color = mix(middleColor, darkestColor, gradientFactor); // Gradient from medium to darkest (top to bottom)
    } else {
        color = vec3(0.122, 0.216, 0.275); // #7AB2B2, darkest
    }

    gl_FragColor = vec4(color, 1.0);
}
`;function $(o,i,r){const t=o.getContext("webgl");if(!t)return console.error("WebGL not supported"),null;const e=(a,h,S)=>{const n=a.createShader(h);return a.shaderSource(n,S),a.compileShader(n),a.getShaderParameter(n,a.COMPILE_STATUS)?n:(console.error(a.getShaderInfoLog(n)),a.deleteShader(n),null)},d=(a,h,S)=>{const n=a.createProgram();return a.attachShader(n,h),a.attachShader(n,S),a.linkProgram(n),a.getProgramParameter(n,a.LINK_STATUS)?n:(console.error(a.getProgramInfoLog(n)),a.deleteProgram(n),null)},s=e(t,t.VERTEX_SHADER,i),m=e(t,t.FRAGMENT_SHADER,r);if(!s||!m)return null;const c=d(t,s,m);if(!c)return null;const f=t.getAttribLocation(c,"a_position"),l=t.getUniformLocation(c,"u_time"),w=t.getUniformLocation(c,"u_resolution"),p=t.getUniformLocation(c,"u_mouse"),_=t.createBuffer();t.bindBuffer(t.ARRAY_BUFFER,_);const b=[-1,-1,1,-1,-1,1,-1,1,1,-1,1,1];return t.bufferData(t.ARRAY_BUFFER,new Float32Array(b),t.STATIC_DRAW),{gl:t,program:c,positionAttributeLocation:f,timeUniformLocation:l,resolutionUniformLocation:w,mouseUniformLocation:p,positionBuffer:_}}function K(o){const i=window.visualViewport?window.visualViewport.width:window.innerWidth,r=window.visualViewport?window.visualViewport.height:window.innerHeight;o.width=i,o.height=r}function J(o,i){const r=e=>{o[0]=e.clientX,o[1]=e.clientY};window.addEventListener("mousemove",r);const t=e=>{const d=e.touches[0];o[0]=d.clientX,o[1]=d.clientY};return window.addEventListener("touchmove",t),window.addEventListener("resize",i),()=>{window.removeEventListener("mousemove",r),window.removeEventListener("touchmove",t),window.removeEventListener("resize",i)}}var Q=g('<canvas class="svelte-bw6a6k"></canvas>');function Z(o,i){R(i,!1);let r=M();I(()=>{const{gl:e,program:d,positionAttributeLocation:s,timeUniformLocation:m,resolutionUniformLocation:c,mouseUniformLocation:f,positionBuffer:l}=$(u(r),X,j)||{};if(!e)return;e.viewport(0,0,e.canvas.width,e.canvas.height),e.clearColor(0,0,0,0);const w=()=>{K(u(r)),e.viewport(0,0,u(r).width,u(r).height)};w();const p=[0,0],_=J(p,w);let b=performance.now();const a=()=>{const h=(performance.now()-b)/1e3;e.clear(e.COLOR_BUFFER_BIT),e.useProgram(d),e.enableVertexAttribArray(s),e.bindBuffer(e.ARRAY_BUFFER,l),e.vertexAttribPointer(s,2,e.FLOAT,!1,0,0),e.uniform1f(m,h),e.uniform2f(c,e.canvas.width,e.canvas.height),e.uniform2f(f,p[0],p[1]),e.drawArrays(e.TRIANGLES,0,6),requestAnimationFrame(a)};return a(),()=>{_()}}),H();var t=Q();q(t,e=>T(r,e),()=>u(r)),v(o,t),k()}const ee=[{text:"About",href:"/about",type:"text"},{text:"Blog",href:"/blog",type:"text"},{text:"Contact",href:"/contact",type:"text"}],te=[{type:"image",src:"/images/x.svg",alt:"X logo",href:"https://x.com/collinmurch"},{type:"image",src:"/images/github.svg",alt:"GitHub logo",href:"https://github.com/collinmurch"},{type:"image",src:"/images/linkedin.svg",alt:"LinkedIn logo",href:"https://linkedin.com/in/collinmurch"}];var oe=g('<div class="Home svelte-11nvf83"><!> <!> <div class="intro svelte-11nvf83"><h1 class="name svelte-11nvf83">Collin Murch</h1> <p class="about svelte-11nvf83">Full stack software engineer.</p></div> <img src="/images/profile.jpeg" class="logo svelte-11nvf83" alt="profile"> <!></div>');function ue(o){var i=oe(),r=B(i);Z(r,{});var t=y(r,2);C(t,{location:"Header",links:ee});var e=y(t,6);C(e,{location:"Footer",links:te}),A(i),v(o,i)}export{ue as component};
