const editProfile = document.getElementById("edit-profile-btn");
const editPfp = document.getElementById("edit-pfp-btn");
const editProfileDetailsModule = document.getElementById("edit-profile-details-modal");
const editProfilePfpModal = document.getElementById("edit-pfp-modal");

editProfile.addEventListener('click', () => {
  editProfileDetailsModule.classList.toggle("show");
});

editPfp.addEventListener('click', () => {
  editProfilePfpModal.classList.toggle("show");
});

// Get all elements with the class "pfp"
const pfps = document.querySelectorAll(".pfp");
const pfpPreview = document.getElementById("pfp-preview");

// Iterate through each profile picture and add a click event listener
pfps.forEach(pfp => {
  pfp.addEventListener('click', () => {
    // 1. Remove the "selected" class from ALL profile pictures
    pfps.forEach(otherPfp => {
      otherPfp.classList.remove("selected");
    });

    // 2. Add the "selected" class to the clicked profile picture
    pfp.classList.toggle("selected");

    pfpPreview.src = pfp.src;
  });
});

document.addEventListener('click', (e) => {
  const isClickInsideCard = e.target.closest('.card');

  if (!isClickInsideCard && editProfileDetailsModule.classList.contains('show')) {
    editProfileDetailsModule.classList.toggle('show');
  }
  if (!isClickInsideCard && editProfilePfpModal.classList.contains('show')) {
    editProfilePfpModal.classList.toggle('show');
  }
});
