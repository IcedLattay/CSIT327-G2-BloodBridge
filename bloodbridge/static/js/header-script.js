(() => {
  const dropdownBtn = document.getElementById("dropdown-btn");
  const dropdownContent = document.getElementById("dropdown-content");
  const dropdownBtnArrow = document.getElementById("dropdown-btn-arrow");

  document.addEventListener('click', (e) => {
    const isClickInsideDropdown = e.target.closest('.dropdown');
    if (!isClickInsideDropdown && dropdownContent.classList.contains('show')) {
      dropdownContent.classList.toggle('show');
      dropdownBtnArrow.classList.toggle("rotate");
    }
  });

  dropdownBtn?.addEventListener("click", () => {
    dropdownContent.classList.toggle("show");
    dropdownBtnArrow.classList.toggle("rotate");
  });
})();
