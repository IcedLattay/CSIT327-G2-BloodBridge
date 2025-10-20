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

  // Open modal based on server-side hint
  const openModal = document.getElementById("openModalHint")?.value;
  if (openModal === "login") loginModal.classList.add("show");
  if (openModal === "register") signupModal.classList.add("show");

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

  const selectUser = document.getElementById("selectUser");
  const selectHospital = document.getElementById("selectHospital");
  const selectedRole = document.getElementById("selectedRole");
  const hospitalIcon = document.getElementById("hospital-icon");
  const userIcon = document.getElementById("user-icon");
  const roleDescOne = document.getElementById("desc-one");
  const roleDescTwo = document.getElementById("desc-two");

  selectUser.classList.add('active');
  userIcon.classList.add('active');
  document.getElementById("selectedRole").value = "user";
  roleDescOne.textContent = 'Each user may act as a donor or recipient.';
  roleDescTwo.textContent = 'Together, we make every drop count.';

  // Helper function to toggle each button's style
  function selectRole(role) {
    selectedRole.value = role;
    if(role === 'user'){
      
      roleDescOne.textContent = 'Each user may act as a donor or recipient.';
      roleDescTwo.textContent = 'Together, we make every drop count.';
    } else {
      roleDescOne.textContent = 'Hospitals can request blood during shortages and distribute it to patients in need.';
      roleDescTwo.textContent = 'Together, we make life-saving care possible.';
    }
    selectUser.classList.toggle('active', role === 'user');
    userIcon.classList.toggle('active', role === 'user');
    selectHospital.classList.toggle('active', role === 'hospital');
    hospitalIcon.classList.toggle('active', role === 'hospital');
    console.log('Selected role: ', role);
  }
  
  selectUser.addEventListener('click', () => selectRole('user'));
  selectHospital.addEventListener('click', () => selectRole('hospital'));
});
