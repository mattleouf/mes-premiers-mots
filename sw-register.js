const SW_VERSION = 'v3';
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register(`/sw.js?v=${SW_VERSION}`);
}
