import { create } from "stone-throw/components";

const StoneVideo = create("stone-video", {
  render: (state, props, children) => {
    return /*html*/ `
    <video 
      class="${props.class}" 
      loop 
      muted 
      autoplay
      playsinline 
      preload="auto"
      poster="${props.poster}"
    >
      <source src="${props.src}_vp9.webm" type="video/webm; codecs=vp9">
      <source src="${props.src}_default.mp4" type="video/mp4; codecs=avc1">
      <source src="${props.src}.mp4" type="video/mp4; codecs=hvc1">
    </video>
    `;
  },

  init: (element, state) => {},
});

export default StoneVideo;
