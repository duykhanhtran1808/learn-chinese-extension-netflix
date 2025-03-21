import { initializeUI } from './ui-handler';

function isNetflixWatchPage() {
  return window.location.pathname.startsWith('/watch');
}

function injectInterceptors() {
  const script = document.createElement('script');
  script.src = chrome.runtime.getURL('inject-script.js');
  (document.head || document.documentElement).appendChild(script);
  script.onload = () => script.remove();
  console.log("Waking up the Language Teacher")
}

// Initial injection
injectInterceptors();

// Initialize on page load
window.onload = function() {
  if (document.body && isNetflixWatchPage()) {
    injectInterceptors();
    initializeUI();
  }
};

// Listen for messages from the injected script
window.addEventListener('message', (event) => {
  // Make sure the message is from our injected script
  if (event.source !== window) return;
  if (event.data.type !== 'NETFLIX_SUBTITLE_URL') return;
  chrome.storage.local.set({ subtitleData: event.data.payload });
});

// Watch for URL changes
let lastUrl = location.href;
new MutationObserver(() => {
  const url = location.href;
  if (url !== lastUrl) {
    lastUrl = url;
    if (isNetflixWatchPage()) {
      injectInterceptors();
      initializeUI();
    }
  }
}).observe(document, { subtree: true, childList: true });