document.addEventListener('DOMContentLoaded', () => {
  const historyList = document.querySelector('.history-list');
  if (!historyList) return; // exit if not found

  const maxHeight = 565;
  const resizeObserver = new ResizeObserver(entries => {
    for (const entry of entries) {
      const currentHeight = entry.contentRect.height;
      historyList.classList.toggle('tallest', currentHeight >= maxHeight);
    }
  });

  resizeObserver.observe(historyList);
});
