function togglePassword(el) {
    const input = el.parentElement.querySelector('input[type="password"], input[type="text"]');
    if (input.type === "password") {
        input.type = "text";
        el.textContent = "";
    } else {
        input.type = "password";
        el.textContent = "";
    }
}
