// HTML5 Fullscreen utility to enter true full-screen and hide browser address/URL bar
export const enterAppFullscreen = () => {
  try {
    const doc = document.documentElement;
    if (!document.fullscreenElement && !document.webkitFullscreenElement) {
      if (doc.requestFullscreen) {
        doc.requestFullscreen().catch(() => {});
      } else if (doc.webkitRequestFullscreen) {
        doc.webkitRequestFullscreen().catch(() => {});
      } else if (doc.msRequestFullscreen) {
        doc.msRequestFullscreen().catch(() => {});
      }
    }
  } catch (e) {
    // fullscreen might require direct user gesture
  }
};

export const toggleAppFullscreen = () => {
  try {
    if (!document.fullscreenElement && !document.webkitFullscreenElement) {
      enterAppFullscreen();
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen().catch(() => {});
      }
    }
  } catch (e) {
    // ignore
  }
};
