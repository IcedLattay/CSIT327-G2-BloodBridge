document.addEventListener("DOMContentLoaded", () => {
  const loginModal = document.getElementById("loginModal");
  const signupModal = document.getElementById("signupModal");

  const openLogin = document.getElementById("openLogin");
  const closeLogin = document.getElementById("closeLogin");
  const openSignup = document.getElementById("openSignup");
  const closeSignup = document.getElementById("closeSignup");

  const goToLoginBtn = document.getElementById("goToLogin");
  const overlay = document.getElementById("successOverlay"); // overlay element
  const closeSuccess = document.getElementById("closeSuccess"); // × button

  const toggleIcons = document.querySelectorAll(".toggle");

  // Function to clear forms when modal closes
  function clearModalForm(modal) {
    const inputs = modal.querySelectorAll("input");
    inputs.forEach((input) => {
      if (input.name !== "csrfmiddlewaretoken") {
        input.value = "";
      }
    });
    modal.querySelectorAll(".custom-error, .errorlist").forEach((e) => e.remove());
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
    clearModalForm(loginModal);
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
    clearModalForm(signupModal);
  });

  // Click outside modal closes it
  window.addEventListener("click", (e) => {
    if (e.target === loginModal) {
      resetPasswordVisibility()
      loginModal.classList.remove("show");
      window.history.pushState({}, "", "/");
      clearModalForm(loginModal);
    }
    if (e.target === signupModal) {
      resetPasswordVisibility()
      signupModal.classList.remove("show");
      window.history.pushState({}, "", "/");
      clearModalForm(signupModal);
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
      clearModalForm(loginModal);

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
      hospitalRegistrationForm.querySelectorAll(".custom-error, .errorlist").forEach((e) => e.remove());
      userRegistrationForm.style.visibility = "visible";
      hospitalRegistrationForm.style.visibility = "hidden";
      hospitalBtn.classList.remove("active");
      hospitalBtnIcon.classList.remove("active");
      userBtn.classList.add("active");
      userBtnIcon.classList.add("active");
      moveSlider(userBtn);
  });

  hospitalBtn.addEventListener("click", () => {
      userRegistrationForm.querySelectorAll(".custom-error, .errorlist").forEach((e) => e.remove());
      userRegistrationForm.style.visibility = "hidden";
      hospitalRegistrationForm.style.visibility = "visible";
      hospitalBtn.classList.add("active");
      hospitalBtnIcon.classList.add("active");
      userBtn.classList.remove("active");
      userBtnIcon.classList.remove("active");
      moveSlider(hospitalBtn);
  });






  // submit registration form data for user
  document.querySelectorAll('form').forEach(form => {
    form.addEventListener('submit', async (e) => {
      e.preventDefault(); // stop normal submission

      const submitButton = form.querySelector('button');
      submitButton.disabled = true;
      
      // Create FormData (works for inputs and file uploads)
      const formData = new FormData(form);

      const url = form.dataset.url;

      try {
        const response = await fetch(url, {
          method: "POST",
          headers: {
            'X-CSRFToken': formData.get('csrfmiddlewaretoken'),
            "X-Requested-With": "XMLHttpRequest" // optional, sometimes useful
          },
          body: formData
        });

        const data = await response.json();

        if (data.status === "success") {
          if (form.classList.contains('register-form')){
              // show overlay
            signupModal.classList.remove("show");
            overlay.style.display = 'flex'; // or add a class to show it
            userRegistrationForm.reset(); // optionally clear the form fields
          } else if (form.classList.contains('login-form')) {
            window.location.href = data.redirect_url;
          }
        } else  if (data.status === "error") {
          for (const field in data.errors) {
            const messages = data.errors[field];

            if (field === "__all__" && messages.length > 0) {
              const p = document.createElement('p');
              p.classList.add('non-field-error');
              p.textContent = messages[0]; // first error only
              nonFieldContainer.appendChild(p);


            } else if (messages.length > 0) {
              const inputGroup = form.querySelector(`[name="${field}"]`)?.closest('.input-group');
              if (inputGroup) {

                const errorContainer = inputGroup.querySelector('.error-message');
                if (errorContainer) {
                    errorContainer.innerHTML = ''; // ← THIS IS KEY
                    
                    const p = document.createElement('p');
                    p.classList.add('custom-error');
                    p.textContent = messages[0]; // first error only
                    errorContainer.appendChild(p);
                }
                
              }
            }
          }
        }
      } catch (err) {
      console.error("Error submitting form:", err);
      } finally {
        submitButton.disabled = false;
      }
    })
  })
  
});