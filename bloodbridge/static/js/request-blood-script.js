


document.addEventListener("DOMContentLoaded", () => {






    // FOR User Request Form Fields 



    // Opening the Modal

    const requestFormModal = document.getElementById("request-modal");
    const closeRequestFormModal = document.querySelector(".orange.negative");
    
    
    document.querySelectorAll(".orange.row").forEach( row => {
        row.addEventListener('click', () => {
            const hospitalID = row.getAttribute("data-hospitalId");

            const selectedHospital = document.getElementById("selected-hospital");
            selectedHospital.value = hospitalID;
            
            requestFormModal.classList.add("show");
        })
    })
    

    // Closing the Modal

    closeRequestFormModal.addEventListener('click', () => {
        resetForm(requestForm)
        requestFormModal.classList.remove("show")
    })

    function clearFormErrors(form) {
        form.querySelectorAll(".custom-error").forEach((e) => e.textContent = '');
        form.querySelectorAll(".icon").forEach((e) => e.classList.remove("show"));

        console.log("Errors cleared!");
    }

    function resetForm(form) {
        // Reset blood type field
        dropdownBt_Btn.textContent = 'A+ / B+ / O';
        selectedBt.value = '';
        
        // Reset quantity field
        const quantityField = document.getElementById('quantity-field');
        quantityField.value = '1';
        
        // Reset urgency field
        setUrgency('low')
        
        // Reset notes field
        const notesField = document.getElementById("notes-field");
        notesField.value = '';
        
        // Hide Error Messages
        clearFormErrors(form)
        
        console.log('Form reset successfully');
    }



    // Blood Type Dropdown 

    const dropdownBt_Btn = document.getElementById('dropdown-bt-btn');
    const dropdownBt_Content = document.getElementById('dropdown-bt-content');
    const selectedBt = document.getElementById('selected-blood-type');

    dropdownBt_Content.querySelectorAll('.dropdown-bt-option').forEach(option => {
        option.addEventListener('click', () => {
            const value = option.dataset.value; // get the value
            selectedBt.value = value;           // update hidden input

            console.log(`Request Form: Blood Type set to 🩸${value}`)

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




    // Urgency Selection

    const urgencyButtons = document.querySelectorAll('.urgency-selection button');
    const hiddenInputUrgency = document.getElementById('selected-urgency');
    
    setUrgency('low'); // set urgency to low every page reload


    // Function to set urgency

    function setUrgency(value) {
        urgencyButtons.forEach(btn => {
            btn.classList.remove('low');
            btn.classList.remove('medium');
            btn.classList.remove('high');
        });
        
        const selectedButton = document.querySelector(`.urgency-selection button[data-value="${value}"]`);
        let urgencyStr;

        if (selectedButton && value=='low') {
            selectedButton.classList.add('low');
            urgencyStr = '⬜ Low'
        } else if (selectedButton && value=='medium') {
            selectedButton.classList.add('medium');
            urgencyStr = '🟨 Medium'
        } else {
            selectedButton.classList.add('high');
            urgencyStr = '🟥 High'
        }
        
        hiddenInputUrgency.value = value;

        console.log(`Request Form: Urgency set to ${urgencyStr}`);
    }
    
    urgencyButtons.forEach(button => {
        button.addEventListener('click', function() {
            const value = this.getAttribute('data-value');
            setUrgency(value);
        });
    });
    








    // POST Request Form !!!!!!!!


    const requestForm = document.querySelector("form");


    function getCSRFToken() {
        return document.querySelector('meta[name="csrf-token"]').content;
    }

    requestForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const submitButton = requestForm.querySelector('.orange.positive');
        submitButton.disabled = true;
      
        const formData = new FormData(requestForm);

        // ... <= gets all the values of the iterator instead of one at a time
        console.log("Submitted Request Form content:");
        [...formData.entries()].forEach( ([key, value]) => {
            console.log(`${key}: ${value}`);
        })

        try {
            const response = await fetch('/submit-request/', {
            method: "POST",
            headers: {
                'X-CSRFToken': getCSRFToken(),
            },
            body: formData
            });

            console.log('📨 Response received, status:', response.status);
            
            const data = await response.json();
            console.log('📊 Response data:', data); 


            if (data.success) {
                console.log('✅ Success! Reloading page...');

                
                localStorage.setItem("showSuccessModal", "true");
                window.location.reload();
            } else {
                console.log("❌ Errors po naten ayy: ", data.errors)

                // clear the errors first before showing them again
                document.querySelectorAll(".error-container").forEach( errCont => {
                    errCont.querySelector(".custom-error").textContent = '';
                    errCont.querySelector(".icon").classList.remove("show");
                })

                for (const [field, messages] of Object.entries(data.errors)) {
                    const cardForm = document.querySelector(".card.form");
                    const errorContainer = document.querySelector(`[data-id="${field}-error-container"]`);
                    const errorMessage = errorContainer.querySelector(".custom-error");
                    const errorIcon = errorContainer.querySelector(".icon");

                    console.log(`Found ${field} error container:`, errorContainer);
                    console.log(`Found ${field} error message:`, errorMessage);
                    console.log(`Found ${field} error icon:`, errorIcon);

                    errorMessage.textContent = messages[0];
                    errorIcon.classList.add("show");
                    
                    
                    cardForm.classList.remove("shake");
                    errorContainer.classList.remove("shake");

                    void cardForm.offsetWidth;
                    void errorContainer.offsetWidth;

                    cardForm.classList.add("shake");
                    errorContainer.classList.add("shake");
                }
            }
        } catch (err) {
            console.error("Error submitting form:", err);
            console.log("The server returned HTML instead of JSON. Common causes:");
            console.log("- Wrong URL (404)");
            console.log("- CSRF failure (403)"); 
            console.log("- User not logged in (redirect to login)");
            console.log("- Server error (500)");
        } finally {
            submitButton.disabled = false;
        }
    })


    // LOGIC for Success Overlay !!!

    let modalTimeout;
    const successModal = document.getElementById("success-modal");
    const successAnimation = document.getElementById("success-animation");

    const shouldShow = localStorage.getItem("showSuccessModal");

    if (shouldShow === "true") {
        // Show your success overlay/modal
        showSuccessModal();

        // Reset the flag so it doesn’t show again on next reload
        localStorage.removeItem("showSuccessModal");
    }


    function showSuccessModal() {

        successModal.classList.add("show");

        successAnimation.loop = false;

        // Restart the animation fresh
        successAnimation.stop();
        successAnimation.play();

        // Clear any old timer so it doesn't auto-close too soon
        if (modalTimeout) {
            clearTimeout(modalTimeout);
        }

        // Auto-hide after 3 seconds
        modalTimeout = setTimeout(() => {
            console.log("Hiding success overlay...");

            hideOverlay(successModal);
        }, 4000);
    }

    function hideOverlay(modal) {
        modal.classList.add("fade-out");

        modal.addEventListener("transitionend", function end() {
            modal.classList.remove("show", "fade-out");
            modal.removeEventListener("transitionend", end);
        });
    }

    window.addEventListener("click", function(event) {
        if (event.target === successModal) {
            successModal.classList.remove("show");

            // Also clear any pending timer when manually closed
            if (modalTimeout) {
                clearTimeout(modalTimeout);
            }
        }
    });
});