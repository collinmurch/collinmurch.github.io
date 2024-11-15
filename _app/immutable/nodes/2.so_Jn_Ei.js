import{a as v,t as p,d as D}from"../chunks/disclose-version.nKGwhHMC.js";import"../chunks/legacy.C0iA3n7j.js";import{k as C,t as w,w as M,g as l,x as b,p as G,s as H,aF as P,aG as V,A as Y,v as R}from"../chunks/runtime.CaAVqyjh.js";import{s as O}from"../chunks/render.DGbazWat.js";import{p as B,i as W,o as X,b as z}from"../chunks/index-client.BqtjdMbG.js";import{e as j,i as $,s as y}from"../chunks/attributes.BMgUu-_h.js";import{i as K}from"../chunks/lifecycle.C-85HnmG.js";function J(o,s){var a=o.__className,r=Q(s);C&&o.className===r?o.__className=r:(a!==r||C&&o.className!==r)&&(s==null?o.removeAttribute("class"):o.className=r,o.__className=r)}function Q(o){return o??""}var Z=p('<img class="social">'),ee=p('<a class="svelte-mcuy0a"><!></a>'),te=p("<div></div>");function k(o,s){let a=B(s,"location",8),r=B(s,"links",8);var e=te();j(e,5,r,$,(h,m)=>{var u=ee(),g=M(u);W(g,()=>l(m).type==="image",f=>{var n=Z();w(()=>{y(n,"src",l(m).src),y(n,"alt",l(m).alt)}),v(f,n)},f=>{var n=D();w(()=>O(n,l(m).text)),v(f,n)}),b(u),w(()=>y(u,"href",l(m).href)),v(h,u)}),b(e),w(()=>J(e,`${a()??""} svelte-mcuy0a`)),v(o,e)}const oe=`
attribute vec4 a_position;
void main() {
    gl_Position = a_position;
}
`,ae=`
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
`;var re=p('<canvas class="svelte-m0rmed"></canvas>');function ie(o,s){G(s,!1);let a=V();X(()=>{const e=l(a).getContext("webgl");if(!e){console.error("WebGL not supported");return}const h=t=>{t.preventDefault()};document.body.addEventListener("touchmove",h,{passive:!1});const m=(t,c,x)=>{const i=t.createShader(c);return t.shaderSource(i,x),t.compileShader(i),t.getShaderParameter(i,t.COMPILE_STATUS)?i:(console.error(t.getShaderInfoLog(i)),t.deleteShader(i),null)},u=(t,c,x)=>{const i=t.createProgram();return t.attachShader(i,c),t.attachShader(i,x),t.linkProgram(i),t.getProgramParameter(i,t.LINK_STATUS)?i:(console.error(t.getProgramInfoLog(i)),t.deleteProgram(i),null)},g=m(e,e.VERTEX_SHADER,oe),f=m(e,e.FRAGMENT_SHADER,ae),n=u(e,g,f),E=e.getAttribLocation(n,"a_position"),T=e.getUniformLocation(n,"u_time"),U=e.getUniformLocation(n,"u_resolution"),N=e.getUniformLocation(n,"u_mouse"),S=e.createBuffer();e.bindBuffer(e.ARRAY_BUFFER,S);const I=[-1,-1,1,-1,-1,1,-1,1,1,-1,1,1];e.bufferData(e.ARRAY_BUFFER,new Float32Array(I),e.STATIC_DRAW),e.viewport(0,0,e.canvas.width,e.canvas.height),e.clearColor(0,0,0,0);const _=()=>{const t=window.visualViewport?window.visualViewport.width:window.innerWidth,c=window.visualViewport?window.visualViewport.height:window.innerHeight;P(a,l(a).width=t),P(a,l(a).height=c),e.viewport(0,0,t,c)};window.addEventListener("resize",_),_();let q=performance.now(),d=[0,0];const A=t=>{d[0]=t.clientX,d[1]=t.clientY};window.addEventListener("mousemove",A);const L=t=>{const c=t.touches[0];d[0]=c.clientX,d[1]=c.clientY};window.addEventListener("touchmove",L);const F=()=>{const t=(performance.now()-q)/1e3;e.clear(e.COLOR_BUFFER_BIT),e.useProgram(n),e.enableVertexAttribArray(E),e.bindBuffer(e.ARRAY_BUFFER,S),e.vertexAttribPointer(E,2,e.FLOAT,!1,0,0),e.uniform1f(T,t),e.uniform2f(U,e.canvas.width,e.canvas.height),e.uniform2f(N,d[0],d[1]),e.drawArrays(e.TRIANGLES,0,6),requestAnimationFrame(F)};return F(),()=>{document.body.removeEventListener("touchmove",h),window.removeEventListener("resize",_),window.removeEventListener("mousemove",A),window.removeEventListener("touchmove",L)}}),K();var r=re();z(r,e=>Y(a,e),()=>l(a)),v(o,r),H()}const ne=[{text:"About",href:"/about",type:"text"},{text:"Blog",href:"/blog",type:"text"},{text:"Contact",href:"/contact",type:"text"}],se=[{type:"image",src:"/images/x.svg",alt:"X logo",href:"https://x.com/collinmurch"},{type:"image",src:"/images/github.svg",alt:"GitHub logo",href:"https://github.com/collinmurch"},{type:"image",src:"/images/linkedin.svg",alt:"LinkedIn logo",href:"https://linkedin.com/in/collinmurch"}];var ce=p('<div class="Home svelte-1m6lwy1"><!> <div class="intro svelte-1m6lwy1"><h1 class="name svelte-1m6lwy1">Collin Murch</h1> <p class="about svelte-1m6lwy1">Full stack software engineer.</p></div> <img src="/images/profile.jpeg" class="logo svelte-1m6lwy1" alt="profile"> <!> <!></div>');function he(o){var s=ce(),a=M(s);k(a,{location:"Header",links:ne});var r=R(a,6);k(r,{location:"Footer",links:se});var e=R(r,2);ie(e,{}),b(s),v(o,s)}export{he as component};
