// MODAL VISIBILITY & INTERACTIVITY

const editProfile = document.getElementById("edit-profile-btn");
const editPfp = document.getElementById("edit-pfp-btn");
const editProfileDetailsModule = document.getElementById("edit-profile-details-modal");
const editProfilePfpModal = document.getElementById("edit-pfp-modal");

editProfile.addEventListener('click', () => {
  editProfileDetailsModule.classList.toggle("show");
});

editPfp.addEventListener('click', () => {
  pfps.forEach(pfp => {
    if(pfp.src === pfpPreview.src){
      pfp.classList.toggle("selected");

      selectedPfp.value = getRelativeStaticPath(pfpPreview.getAttribute('src'));
    }
  })
  editProfilePfpModal.classList.toggle("show");
});



// document.addEventListener('click', (e) => {
//   const isClickInsideCard = e.target.closest('.card');

//   if (!isClickInsideCard && editProfileDetailsModule.classList.contains('show')) {
//     editProfileDetailsModule.classList.toggle('show');
//   }
//   if (!isClickInsideCard && editProfilePfpModal.classList.contains('show')) {
//     editProfilePfpModal.classList.toggle('show');
//   }
// });


// CHANGE PFP

// Get all elements with the class "pfp"
const pfps = document.querySelectorAll(".pfp");
const pfpPreview = document.getElementById("pfp-preview");
const selectedPfp = document.getElementById("selected-pfp");

// Iterate through each profile picture and add a click event listener
pfps.forEach(pfp => {
  pfp.addEventListener('click', () => {
    // 1. Remove the "selected" class from ALL profile pictures
    pfps.forEach(otherPfp => {
      otherPfp.classList.remove("selected");
    });

    // 2. Add the "selected" class to the clicked profile picture
    pfp.classList.toggle("selected");

    let src = getRelativeStaticPath(pfp.getAttribute('src')); // "/static/images/patch.png"
    
    selectedPfp.value = src;
    pfpPreview.src = pfp.src;
  });
});


const editPfpForm = document.getElementById("edit-pfp-form");

editPfpForm.addEventListener("submit", function (e) {
  e.preventDefault();

  const formData = new FormData(this);

  fetch('/update-pfp/', {
    method: 'POST',
    headers: {
      'X-CSRFToken': document.querySelector('[name=csrfmiddlewaretoken]').value,
      "X-Requested-With": "XMLHttpRequest"
    },
    body: formData
  })
  .then(res => res.json())
  .then(data => {
    if (data.success) {
      location.reload();
    }
  
  })
  .catch(err => console.error("Error", err));
});


// EDIT PROFILE DETAILS


const dropdownBt_Btn = document.getElementById('dropdown-bt-btn');
const dropdownBt_Content = document.getElementById('dropdown-bt-content');
const selectedBt = document.getElementById('selected-blood-type');

dropdownBt_Content.querySelectorAll('.dropdown-bt-option').forEach(option => {
  option.addEventListener('click', () => {
    const value = option.dataset.value; // get the value
    selectedBt.value = value;           // update hidden input
    dropdownBt_Btn.textContent = option.textContent;    // update displayed text
    dropdownBt_Content.parentElement.classList.remove('show'); // hide dropdown
  });
});

dropdownBt_Btn.addEventListener('click', () => {
  dropdownBt_Content.parentElement.classList.toggle('show');
})

document.addEventListener('click', (e) => {
  const isClickInsideDropdown = e.target.closest('.dropdown-bt');

  if (!isClickInsideDropdown && dropdownBt_Content.parentElement.classList.contains('show')) {
    dropdownBt_Content.parentElement.classList.toggle('show');
  }
});


const editProfileDetailsForm = document.getElementById("edit-profile-details-form");

editProfileDetailsForm.addEventListener("submit", function (e) {
  e.preventDefault();

  const formData = new FormData(this);

  fetch('/update-profile-details/', {
    method: 'POST',
    headers: {
      'X-CSRFToken': document.querySelector('[name=csrfmiddlewaretoken]').value,
      "X-Requested-With": "XMLHttpRequest"
    },
    body: formData
  })
  .then(res => res.json())
  .then(data => {
    if (data.success) {
      location.reload();
    }
  
  })
  .catch(err => console.error("Error", err));
});


// helper functions 

function getRelativeStaticPath(src) {
  // Example inputs:
  //   "/static/images/patch.png"
  //   "http://127.0.0.1:8000/static/images/patch.png"
  // Output: "images/patch.png"

  if (!src) return '';

  // handle absolute URLs
  const absoluteStatic = window.location.origin + '/static/';
  if (src.startsWith(absoluteStatic)) {
    return src.replace(absoluteStatic, '');
  }

  // handle relative /static/ paths
  if (src.startsWith('/static/')) {
    return src.replace('/static/', '');
  }

  return src;
}