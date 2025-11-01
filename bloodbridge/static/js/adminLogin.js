function togglePassword(el) {
    const input = el.previousElementSibling;
    input.type = input.type === "password" ? "text" : "password";
}