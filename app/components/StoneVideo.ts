import { create } from "stone-throw/components";

/**
 * Features:
 * - autoplays
 * - Until the video is loaded, show a poster image
 * - when the video is loaded, show the video
 * - Browser automatically selects best supported video format
 */

const StoneVideo = create("stone-video", {
  // No state needed for this component
  render: (state, props, children) => {
    return /*html*/ `
    <video class="${props.class}" autoplay loop muted playsinline poster="${props.poster}">
      <source src="${props.src}.webm" type="video/webm; codecs=vp8">
      <source src="${props.src}.mp4" type="video/mp4; codecs=hvc1">
      <source src="${props.src}_default.mp4" type="video/mp4; codecs=avc1">
    </video>
    `;
  },
});

export default StoneVideo;
