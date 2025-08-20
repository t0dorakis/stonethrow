import { create } from "stone-throw/components";

const StoneVideo = create("stone-video", {
  server: (state, props, children) => {
    return /*html*/ `
    <video 
      class="${props.class}" 
      loop 
      muted 
      autoplay
      playsinline 
      poster="${props.poster}"
    >
      <source src="${props.src}.mp4" type="video/mp4; codecs=hvc1">
      <source src="${props.src}_vp9.webm" type="video/webm; codecs=vp9">
      <source src="${props.src}_default.mp4" type="video/mp4; codecs=avc1">
    </video>
    `;
  },

  client: (element, state) => {
    return () => {};
  },
});

export default StoneVideo;
