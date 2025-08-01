const SW_VERSION = 'v2';
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register(`/sw.js?v=${SW_VERSION}`);
}
