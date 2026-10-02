export function enterFullscreen() {
  if (document.fullscreenElement) return Promise.resolve();
  if (!document.documentElement.requestFullscreen) return Promise.reject(new Error('Fullscreen is not supported by this browser.'));
  try {
    return Promise.resolve(document.documentElement.requestFullscreen());
  } catch (error) {
    return Promise.reject(error);
  }
}

export function exitFullscreen() {
  if (!document.fullscreenElement || !document.exitFullscreen) return Promise.resolve();
  return document.exitFullscreen().catch(() => {});
}
