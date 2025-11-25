document.addEventListener("DOMContentLoaded", () => {
  const loginModal = document.getElementById("loginModal");
  const signupModal = document.getElementById("signupModal");

  const openLogin = document.getElementById("openLogin");
  const closeLogin = document.getElementById("closeLogin");
  const openSignup = document.getElementById("openSignup");
  const closeSignup = document.getElementById("closeSignup");

  const hospitalSignupForm = document.getElementById("register-hospital-form");
  const userSignupForm = document.getElementById("register-user-form");
  const loginForm = document.getElementById("login-form");

  const goToLoginBtn = document.getElementById("goToLogin");
  const overlay = document.getElementById("successOverlay"); // overlay element
  const closeSuccess = document.getElementById("closeSuccess"); // × button

  const toggleIcons = document.querySelectorAll(".toggle");

  // Function to clear forms when modal closes
  function clearForm(form) {
    form.reset();
    form.querySelectorAll(".error-container").forEach(errContainer => {
      errContainer.querySelector(".custom-error").textContent = '';
      errContainer.querySelector(".icon").classList.remove("show");
    })
  }

  // Toggle password visibility
  toggleIcons.forEach((icon) => {
    icon.addEventListener("click", () => {
      const targetId = icon.getAttribute("data-target");
      const passwordInput = document.getElementById(targetId);

      if (passwordInput.type === "password") {
        passwordInput.type = "text";
        icon.classList.remove("bi-eye");
        icon.classList.add("bi-eye-slash");
      } else {
        passwordInput.type = "password";
        icon.classList.remove("bi-eye-slash");
        icon.classList.add("bi-eye");
      }
    });
  });

  // Reset password visibility when modal closes
  function resetPasswordVisibility() {
    toggleIcons.forEach((icon) => {
      const targetId = icon.getAttribute("data-target");
      const passwordInput = document.getElementById(targetId);
      passwordInput.type = "password";
      icon.classList.remove("bi-eye-slash");
      icon.classList.add("bi-eye");
    });
  }

  // Open / Close modals
  openLogin?.addEventListener("click", () => {
    loginModal.classList.add("show");
    window.history.pushState({}, "", "/login");
  });

  closeLogin?.addEventListener("click", () => {
    resetPasswordVisibility()
    loginModal.classList.remove("show");
    window.history.pushState({}, "", "/");
    clearForm(loginForm);
  });

  openSignup?.addEventListener("click", () => {
    userBtn.classList.add("active");
    hospitalBtn.classList.remove("active");
    userBtnIcon.classList.add("active");
    hospitalBtnIcon.classList.remove("active");
    userRegistrationForm.style.visibility = "visible";
    hospitalRegistrationForm.style.visibility = "hidden";
    moveSlider(userBtn);
    signupModal.classList.add("show")
    window.history.pushState({}, "", "/register");
  });

  closeSignup?.addEventListener("click", () => {
    resetPasswordVisibility()
    signupModal.classList.remove("show");
    window.history.pushState({}, "", "/");
    clearForm(hospitalSignupForm);
    clearForm(userSignupForm);
  });

  // Click outside modal closes it
  window.addEventListener("click", (e) => {
    if (e.target === loginModal) {
      resetPasswordVisibility()
      loginModal.classList.remove("show");
      window.history.pushState({}, "", "/");
      clearForm(loginForm);
    }
    if (e.target === signupModal) {
      resetPasswordVisibility()
      signupModal.classList.remove("show");
      window.history.pushState({}, "", "/");
      clearForm(hospitalSignupForm);
      clearForm(userSignupForm);
    }
  });

  // Handle "Go to Login" in success overlay
  if (goToLoginBtn) {
    goToLoginBtn.addEventListener("click", (e) => {
      e.preventDefault();

      if (overlay) {
        overlay.classList.add("fade-out");
        setTimeout(() => (overlay.style.display = "none"), 400);
      }

      loginModal.classList.add("show");

      window.history.pushState({}, "", "/login"); // ilisan ra ang url para dle /register ghapon
    });
  }

  //  Handle "×" Close button in success overlay
  if (closeSuccess) {
    closeSuccess.addEventListener("click", () => {
      if (overlay) {
        overlay.classList.add("fade-out");
        setTimeout(() => (overlay.style.display = "none"), 400);
      }
    });
  }


  // SHIFT/TOGGLE between user and hospital registration

  const userBtn = document.getElementById("userBtn")
  const userBtnIcon = document.querySelector("#userBtn .icon")
  const hospitalBtn = document.getElementById("hospitalBtn")
  const hospitalBtnIcon = document.querySelector("#hospitalBtn .icon")
  const slider = document.querySelector(".slider")
  const toggleContainer = document.querySelector(".toggle-container")
  const userRegistrationForm = document.getElementById("register-user-form")
  const hospitalRegistrationForm = document.getElementById("register-hospital-form")

  function moveSlider(button) {
    const containerRect = toggleContainer.getBoundingClientRect();
    const buttonRect = button.getBoundingClientRect();

    // Calculate left position only
    const leftPos = buttonRect.left - containerRect.left - 1;

    // Apply styles
    slider.style.left = `${leftPos}px`;
  }


  userBtn.addEventListener("click", () => {
    clearForm(hospitalSignupForm)
    userRegistrationForm.style.visibility = "visible";
    hospitalRegistrationForm.style.visibility = "hidden";
    hospitalBtn.classList.remove("active");
    hospitalBtnIcon.classList.remove("active");
    userBtn.classList.add("active");
    userBtnIcon.classList.add("active");
    moveSlider(userBtn);
  });

  hospitalBtn.addEventListener("click", () => {
    clearForm(userSignupForm);
    userRegistrationForm.style.visibility = "hidden";
    hospitalRegistrationForm.style.visibility = "visible";
    hospitalBtn.classList.add("active");
    hospitalBtnIcon.classList.add("active");
    userBtn.classList.remove("active");
    userBtnIcon.classList.remove("active");
    moveSlider(hospitalBtn);
  });

  // submit registration form data for user
  function getCSRFToken() {
    return document.querySelector('meta[name="csrf-token"]').content;
  }

  // submit registration and login form data
  document.querySelectorAll('form').forEach(form => {
    form.addEventListener('submit', async (e) => {
      e.preventDefault(); // stop normal submission

      const submitButton = form.querySelector('button');
      submitButton.disabled = true;

      const formData = new FormData(form);
      const url = form.dataset.url;

      try {
        const response = await fetch(url, {
          method: "POST",
          headers: {
            'X-CSRFToken': getCSRFToken(),
            "X-Requested-With": "XMLHttpRequest"
          },
          body: formData
        });

        const data = await response.json();

        if (data.status === "success") {
          // Login success
          if (form.classList.contains('login-form')) {
            window.location.href = data.redirect_url;
          } else if (form.classList.contains('register-form')) {
            signupModal.classList.remove("show");
            overlay.style.display = 'flex';
            form.reset();
          }
        } else if (data.status === "error") {
          // Clear all previous errors
          form.querySelectorAll(".error-container").forEach(errContainer => {
            const errorMessage = errContainer.querySelector(".custom-error");
            const errorIcon = errContainer.querySelector(".icon");
            if (errorMessage) errorMessage.textContent = '';
            if (errorIcon) errorIcon.classList.remove("show");
          });

          for (const field in data.errors) {
            const messages = data.errors[field];

            let errorContainer;
            if (field === "__all__") {
              errorContainer = form.querySelector('[data-id="__all__-error-container"]');
            } else {
              errorContainer = form.querySelector(`[data-id="${field}-error-container"]`);
            }

            if (errorContainer) {
              const errorMessage = errorContainer.querySelector(".custom-error");
              const errorIcon = errorContainer.querySelector(".icon");

              if (errorMessage) errorMessage.textContent = messages[0];
              if (errorIcon) errorIcon.classList.add("show");

              // optional shake effect
              const card = form.closest(".modal-content") || form;
              card.classList.remove("shake");
              void card.offsetWidth;
              card.classList.add("shake");
            } else {
              alert(messages[0]); // fallback
            }
          }
        }

      } catch (err) {
        console.error("Error submitting form:", err);
        alert("Something went wrong. Please try again.");
      } finally {
        submitButton.disabled = false;
      }
    });
  });

  // FOR Success Overlay Popup

  const successAnimation = document.getElementById("success-animation");

  successAnimation.loop = false;
  successAnimation.stop();
  successAnimation.play();

});