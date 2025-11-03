

document.addEventListener("DOMContentLoaded", () => {

  const dropdownBtn = document.getElementById("dropdown-btn");
  const dropdownContent = document.getElementById("dropdown-content");
  const dropdownBtnArrow = document.getElementById("dropdown-btn-arrow");

  if (!dropdownBtn || !dropdownContent || !dropdownBtnArrow) {
    console.warn("Dropdown elements not found in DOM");
    return;
  }

  // Toggle dropdown visibility
  dropdownBtn.addEventListener("click", (e) => {
    e.stopPropagation(); // prevent closing immediately
    dropdownContent.classList.toggle("show");
    dropdownBtnArrow.classList.toggle("rotate");
  });

  // Close dropdown when clicking outside
  document.addEventListener("click", (e) => {
    const isClickInside = e.target.closest(".dropdown");
    if (!isClickInside && dropdownContent.classList.contains("show")) {
      dropdownContent.classList.remove("show");
      dropdownBtnArrow.classList.remove("rotate");
    }
  });
});
