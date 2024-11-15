import{a as m,t as p,d as B}from"../chunks/disclose-version.D7pl-thw.js";import{t as E,y as w,G as C,K as v,H as A,z as P,A as R,F as y}from"../chunks/runtime.CwkcCcw2.js";import{s as M}from"../chunks/render.Dw3SXL6O.js";import{i as T,o as U,b as k}from"../chunks/index-client.CLOiwyb5.js";import{e as N,i as z,s as L}from"../chunks/attributes.6QgwnOeK.js";function I(o,i){var r=o.__className,t=q(i);E&&o.className===t?o.__className=t:(r!==t||E&&o.className!==t)&&(i==null?o.removeAttribute("class"):o.className=t,o.__className=t)}function q(o){return o??""}var D=p('<img class="social">'),G=p('<a class="svelte-e0co6z"><!></a>'),H=p("<div></div>");function F(o,i){var r=H();N(r,21,()=>i.links,z,(t,e)=>{var c=G(),u=C(c);T(u,()=>v(e).type==="image",l=>{var n=D();w(()=>{L(n,"src",v(e).src),L(n,"alt",v(e).alt)}),m(l,n)},l=>{var n=B();w(()=>M(n,v(e).text)),m(l,n)}),A(c),w(()=>L(c,"href",v(e).href)),m(t,c)}),A(r),w(()=>I(r,`${i.location??""} svelte-e0co6z`)),m(o,r)}const V=`
attribute vec4 a_position;
void main() {
    gl_Position = a_position;
}
`,W=`
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
`;function Y(o,i,r){const t=o.getContext("webgl2");if(!t)return console.error("WebGL not supported"),null;const e=(a,f,b)=>{const s=a.createShader(f);return a.shaderSource(s,b),a.compileShader(s),a.getShaderParameter(s,a.COMPILE_STATUS)?s:(console.error(a.getShaderInfoLog(s)),a.deleteShader(s),null)},c=(a,f,b)=>{const s=a.createProgram();return a.attachShader(s,f),a.attachShader(s,b),a.linkProgram(s),a.getProgramParameter(s,a.LINK_STATUS)?s:(console.error(a.getProgramInfoLog(s)),a.deleteProgram(s),null)},u=e(t,t.VERTEX_SHADER,i),l=e(t,t.FRAGMENT_SHADER,r);if(!u||!l)return null;const n=c(t,u,l);if(!n)return null;const _=t.getAttribLocation(n,"a_position"),x=t.getUniformLocation(n,"u_time"),h=t.getUniformLocation(n,"u_resolution"),d=t.getUniformLocation(n,"u_mouse"),g=t.createBuffer();t.bindBuffer(t.ARRAY_BUFFER,g);const S=[-1,-1,1,-1,-1,1,-1,1,1,-1,1,1];return t.bufferData(t.ARRAY_BUFFER,new Float32Array(S),t.STATIC_DRAW),{gl:t,program:n,positionAttributeLocation:_,timeUniformLocation:x,resolutionUniformLocation:h,mouseUniformLocation:d,positionBuffer:g}}function O(o){const i=window.visualViewport?window.visualViewport.width:window.innerWidth,r=window.visualViewport?window.visualViewport.height:window.innerHeight;o.width=i,o.height=r}function X(o,i){const r=e=>{o[0]=e.clientX,o[1]=e.clientY};window.addEventListener("mousemove",r);const t=e=>{const c=e.touches[0];o[0]=c.clientX,o[1]=c.clientY};return window.addEventListener("touchmove",t),window.addEventListener("resize",i),()=>{window.removeEventListener("mousemove",r),window.removeEventListener("touchmove",t),window.removeEventListener("resize",i)}}var j=p('<canvas class="svelte-j3zi34"></canvas>');function K(o,i){R(i,!0);let r;U(()=>{const{gl:e,program:c,positionAttributeLocation:u,timeUniformLocation:l,resolutionUniformLocation:n,mouseUniformLocation:_,positionBuffer:x}=Y(r,V,W)||{};if(!e)return;e.viewport(0,0,e.canvas.width,e.canvas.height),e.clearColor(0,0,0,0);const h=()=>{O(r),e.viewport(0,0,r.width,r.height)};h();const d=[0,0],g=X(d,h);let S=performance.now();const a=()=>{const f=(performance.now()-S)/1e3;e.clear(e.COLOR_BUFFER_BIT),e.useProgram(c),e.enableVertexAttribArray(u),e.bindBuffer(e.ARRAY_BUFFER,x),e.vertexAttribPointer(u,2,e.FLOAT,!1,0,0),e.uniform1f(l,f),e.uniform2f(n,e.canvas.width,e.canvas.height),e.uniform2f(_,d[0],d[1]),e.drawArrays(e.TRIANGLES,0,6),requestAnimationFrame(a)};return a(),()=>{g()}});var t=j();k(t,e=>r=e,()=>r),m(o,t),P()}const $=[{text:"About",href:"/about",type:"text"},{text:"Blog",href:"/blog",type:"text"},{text:"Contact",href:"/contact",type:"text"}],J=[{type:"image",src:"/images/x.svg",alt:"X logo",href:"https://x.com/collinmurch"},{type:"image",src:"/images/github.svg",alt:"GitHub logo",href:"https://github.com/collinmurch"},{type:"image",src:"/images/linkedin.svg",alt:"LinkedIn logo",href:"https://linkedin.com/in/collinmurch"}];var Q=p('<div class="Home svelte-11nvf83"><!> <!> <div class="intro svelte-11nvf83"><h1 class="name svelte-11nvf83">Collin Murch</h1> <p class="about svelte-11nvf83">Full stack software engineer.</p></div> <img src="/images/profile.jpeg" class="logo svelte-11nvf83" alt="profile"> <!></div>');function ae(o){var i=Q(),r=C(i);K(r,{});var t=y(r,2);F(t,{location:"Header",links:$});var e=y(t,6);F(e,{location:"Footer",links:J}),A(i),m(o,i)}export{ae as component};
