import React from 'react';
import { createRoot } from 'react-dom/client';
import { SubtitleContainer } from './components/SubtitleContainer';

export function initializeUI() {
  console.log("Waking up the Artist")

  // Find the Netflix video container
  const videoContainer = document.querySelector('.watch-video') as HTMLElement;
  const subtitleContainer = document.createElement('div');

  if (videoContainer) {
    // Initial setup
    setupContainer(videoContainer, subtitleContainer);

    // Watch for route changes
    const observer = new MutationObserver(() => {
      const isWatchPage = window.location.pathname.startsWith('/watch');
      if (isWatchPage) {
        setupContainer(videoContainer, subtitleContainer);
      } else {
        subtitleContainer.style.display = 'none';
        videoContainer.style.height = '100%';
      }
    });

    observer.observe(document, { subtree: true, childList: true });
  }

  // Create React root and render
  const root = createRoot(subtitleContainer);
  root.render(
    <React.StrictMode>
      <SubtitleContainer />
    </React.StrictMode>
  );
}

function setupContainer(videoContainer: HTMLElement, subtitleContainer: HTMLElement) {
  videoContainer.style.height = '85%';
  subtitleContainer.style.height = '15%';
  subtitleContainer.style.position = 'absolute';
  subtitleContainer.style.width = '100%';
  subtitleContainer.style.bottom = '0';
  subtitleContainer.style.zIndex = '2147483647';
  subtitleContainer.style.backgroundColor = 'bisque';
  subtitleContainer.style.display = 'block';

  // Append only if not already appended
  if (!subtitleContainer.parentElement) {
    videoContainer.parentElement?.appendChild(subtitleContainer);
  }
}