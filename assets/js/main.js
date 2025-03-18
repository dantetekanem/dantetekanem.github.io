document.addEventListener('DOMContentLoaded', function() {
  // Clone the header for the sticky version
  const originalHeader = document.querySelector('.header-row');
  if (!originalHeader) return;

  // Create sticky header container
  const stickyHeader = document.createElement('div');
  stickyHeader.className = 'sticky-header';
  stickyHeader.innerHTML = originalHeader.outerHTML;
  document.body.appendChild(stickyHeader);

  // Flag to track if we're on a post page
  const isPostPage = document.querySelector('.post') !== null;
  
  // Add padding to content on post pages
  if (isPostPage) {
    const postContent = document.querySelector('.post-content');
    if (postContent) {
      postContent.classList.add('sticky-content-padding');
    }
  }

  // Variables for scroll tracking
  let lastScrollTop = 0;
  const scrollThreshold = 150; // Show sticky header after scrolling this far

  window.addEventListener('scroll', function() {
    // Only activate on post pages
    if (!isPostPage) return;
    
    const currentScroll = window.pageYOffset || document.documentElement.scrollTop;
    
    // Show sticky header when scrolling down past threshold
    if (currentScroll > scrollThreshold) {
      stickyHeader.classList.add('visible');
    } else {
      stickyHeader.classList.remove('visible');
    }
    
    lastScrollTop = currentScroll <= 0 ? 0 : currentScroll;
  }, { passive: true });
}); 