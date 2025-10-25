const historyList = document.querySelector('.history-list');
const maxHeight = 565; // Corresponds to the max-height in CSS

const resizeObserver = new ResizeObserver(entries => {
  for (const entry of entries) {
    // Get the current height of the content box
    const currentHeight = entry.contentRect.height;
    
    // Check if the current height equals the max-height
    // You can also use a small tolerance for greater accuracy
    if (currentHeight >= maxHeight) {
      historyList.classList.add('tallest');
    } else {
      historyList.classList.remove('tallest');
    }
  }
});

resizeObserver.observe(historyList);