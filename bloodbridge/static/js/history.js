// Dropdown toggle
const dropbtn = document.querySelector(".dropbtn");
const dropdownContent = document.querySelector(".dropdown-content");

dropbtn.addEventListener("click", () => {
    dropdownContent.classList.toggle("show");
});

window.addEventListener("click", (e) => {
    if (!dropbtn.contains(e.target)) {
        dropdownContent.classList.remove("show");
    }
});