import { create } from "stone-throw/components";

/**
 * Interactive Video Component - Scroll-Controlled Stone Rotation
 *
 * Features:
 * - Shows poster image until video loads
 * - Browser automatically selects best supported video format
 * - Scroll position mapping: Video time is controlled by scroll Y position
 *   - Top of page = video start (0%)
 *   - Bottom of page = video end (100%)
 *   - Video remains completely static when not scrolling
 * - Creates illusion that scrolling rotates/turns the stone
 * - Video never autoplays - purely controlled by scroll position
 * - Smooth seeking optimized for Chrome/Firefox performance
 */

const StoneVideo = create("stone-video", {
  state: {
    videoDuration: 0,
    currentTime: 0,
    pendingSeek: false,
  },

  render: (state, props, children) => {
    return /*html*/ `
    <video 
      class="${props.class}" 
      loop 
      muted 
      playsinline 
      preload="auto"
      poster="${props.poster}"
      style="will-change: transform; transform: translateZ(0);"
    >
      <source src="${props.src}_vp9.webm" type="video/webm; codecs=vp9">
      <source src="${props.src}_default.mp4" type="video/mp4; codecs=avc1">
      <source src="${props.src}.mp4" type="video/mp4; codecs=hvc1">
    </video>
    `;
  },

  init: (element, state) => {
    const video = element.querySelector("video") as HTMLVideoElement;
    const homePageContainer = document.querySelector("#home-page");

    if (!video || !homePageContainer) return;

    // Store video duration when metadata loads, or if already loaded
    const setupVideoDuration = () => {
      if (video.duration && !Number.isNaN(video.duration)) {
        state.videoDuration.set(video.duration);
        console.log("video duration", video.duration);
      }
    };

    // Check if video is already loaded
    if (video.readyState >= 1) {
      setupVideoDuration();
    } else {
      video.addEventListener("loadedmetadata", setupVideoDuration);
      video.addEventListener("canplay", setupVideoDuration);
    }

    // Ensure video is always paused - we control it manually
    video.pause();
    video.addEventListener("play", () => video.pause());
    video.addEventListener("loadstart", () => video.pause());

    // Throttled seeking for better performance on Chrome/Firefox
    let lastSeekTime = 0;
    let pendingFrame = null;
    let debugCount = 0;

    const seekVideo = (targetTime: number) => {
      if (state.pendingSeek.get()) return;

      state.pendingSeek.set(true);

      // Cancel any pending frame
      if (pendingFrame) {
        cancelAnimationFrame(pendingFrame);
      }

      pendingFrame = requestAnimationFrame(() => {
        const startTime = performance.now();
        video.currentTime = targetTime;
        const endTime = performance.now();

        // Debug seeking performance
        debugCount++;

        state.currentTime.set(targetTime);
        state.pendingSeek.set(false);
        pendingFrame = null;
      });
    };

    // Map scroll Y position to video time
    const handleScroll = () => {
      console.log("scroll");
      const videoDuration = state.videoDuration.get() as number;
      if (!videoDuration) return;

      // Throttling - only update every 100ms (10fps)
      const now = performance.now();
      if (now - lastSeekTime < 100) return;
      lastSeekTime = now;

      // Get scroll position and total scrollable height from window/document
      const scrollTop =
        window.pageYOffset || document.documentElement.scrollTop;
      const scrollHeight =
        document.documentElement.scrollHeight - window.innerHeight;

      // Map scroll position to multiple video loops for smoother motion
      const loops = 2;
      const scrollProgress = Math.max(0, Math.min(1, scrollTop / scrollHeight));
      const extendedTime = scrollProgress * videoDuration * loops;
      const targetTime = extendedTime % videoDuration;

      // Skip seeking if the time difference is very small (< 0.1 seconds)
      const currentTime = state.currentTime.get() as number;
      if (Math.abs(targetTime - currentTime) < 0.1) return;

      // Use throttled seeking for better performance
      seekVideo(targetTime);
    };

    window.addEventListener("scroll", handleScroll);

    // Update current time in state when video time changes
    video.addEventListener("timeupdate", () => {
      state.currentTime.set(video.currentTime);
    });
  },
});

export default StoneVideo;
