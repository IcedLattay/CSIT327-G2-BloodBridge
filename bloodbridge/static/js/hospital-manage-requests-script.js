


document.addEventListener("DOMContentLoaded", () => {

    // TOGGLING EMERGENCY

    function getCSRFToken() {
        return document.querySelector('meta[name="csrf-token"]').content;
    }

    document.querySelectorAll(".row.instance").forEach(row => {
        const requestId = row.getAttribute('data-id');
        const box = row.querySelector(".emergency .checkbox");
        const checkmark = box.querySelector(".icon");

        box.addEventListener("click", async () => {
            const currentValue = box.getAttribute('data-value') === 'true';

            if (!currentValue) {
                confirmed = confirm("Are you sure you want to make this request an emergency? You may not undo any changes anymore once done.");

                if (!confirmed) return;
            } else {
                return;
            }

            const response = await fetch(`/update-emergency/${requestId}/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': getCSRFToken(), // needed for Django
                }
            });

            console.log("Raw data:", response)

            const result = await response.json();

            if (result.success) {
                // Update the UI
                box.setAttribute('data-value', true);
                box.classList.add('checked');
                checkmark.classList.add('checked');
            }

        });
        
    });












    // FOR HOSPITAL REQUEST FORM



    // Opening the Form

    const requestFormModal = document.querySelector(".modal");
    const openRequestFormModal = document.querySelector(".card.manage .button-container button");
    const closeRequestFormModal = document.querySelector(".card.form .form-buttons .negative");
    const requestForm = document.querySelector("form");

    openRequestFormModal.addEventListener('click', () => {
        requestFormModal.classList.add("show");
    })

    closeRequestFormModal.addEventListener('click', () => {
        resetForm(requestForm)
        requestFormModal.classList.remove("show")
    })

    function clearFormErrors(form) {
        form.querySelectorAll(".custom-error").forEach((e) => e.textContent = '');
        form.querySelectorAll(".icon").forEach((e) => e.classList.remove("show"));
    }

    function resetForm(form) {
        // Reset Blood Type Dropdown
        dropdownBt_Btn.textContent = 'A+ / B+ / O';
        selectedBt.value = '';
        
        // Reset Quantity Field
        const quantityField = document.getElementById('quantity-field');
        quantityField.value = '1';
        
        // Reset Urgency Buttons
        setUrgency('low')
        
        // Reset Time Fields
        const timeOpen = document.getElementById('time-open');
        const timeClose = document.getElementById('time-close');
        if (timeOpen._flatpickr) timeOpen._flatpickr.setDate('8:00', true);
        if (timeClose._flatpickr) timeClose._flatpickr.setDate('18:00', true);
        
        // Reset Day Buttons
        dayButtons.forEach(button => {
            button.classList.remove('selected');
        });
        hiddenInputDays.value = '';
        
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
    

    setUrgency('low');



    // Function to set urgency
    function setUrgency(value) {
        urgencyButtons.forEach(btn => {
            btn.classList.remove('low');
            btn.classList.remove('medium');
            btn.classList.remove('high');
        });
        
        const selectedButton = document.querySelector(`.urgency-selection button[data-value="${value}"]`);

        if (selectedButton && value=='low') {
            selectedButton.classList.add('low');
        } else if (selectedButton && value=='medium') {
            selectedButton.classList.add('medium');
        } else {
            selectedButton.classList.add('high');
        }
        
        hiddenInputUrgency.value = value;
    }
    
    urgencyButtons.forEach(button => {
        button.addEventListener('click', function() {
            const value = this.getAttribute('data-value');
            setUrgency(value);
        });
    });
    



    // Days Configuration


    const dayButtons = document.querySelectorAll('.set.days button');
    const hiddenInputDays = document.getElementById('available-days'); // Make sure this exists in your HTML
    
    dayButtons.forEach(button => {
        button.addEventListener('click', function() {
            
            // Toggle the 'selected' class
            this.classList.toggle('selected');
            
            // Get all selected days
            const selectedDays = Array.from(document.querySelectorAll('.set.days button.selected'))
                .map(btn => btn.getAttribute('data-value'));
            
            // Update hidden input with comma-separated string
            hiddenInputDays.value = selectedDays.join(',');
            
            console.log('Selected days:', selectedDays);
            console.log('String to database:', hiddenInputDays.value);
        });
    });








    // POST Request Form !!!!!!!!


    function getCSRFToken() {
        return document.querySelector('meta[name="csrf-token"]').content;
    }

    requestForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const submitButton = requestForm.querySelector('button');
        submitButton.disabled = true;
      
        // Create FormData (works for inputs and file uploads)
        const formData = new FormData(requestForm);

        try {
            const response = await fetch('/hospital/submit-request/', {
            method: "POST",
            headers: {
                'X-CSRFToken': getCSRFToken(),
            },
            body: formData
            });

            // DEBUG: Check what we're actually getting
            const responseText = await response.text();
            console.log('Response status:', response.status);
            console.log('First 200 chars of response:', responseText.substring(0, 200));
            
            // Now try to parse as JSON
            const data = JSON.parse(responseText); // This is where it fails

            if (data.success) {
                console.log('✅ Success! Reloading page...');
                
                localStorage.setItem("showSuccessModal", "true");
                window.location.reload();

            } else {
                console.log("❌ Errors po naten ayy: ", data.errors)

                document.querySelectorAll(".error-container").forEach( errCont => {
                    errCont.querySelector(".custom-error").textContent = '';
                    errCont.querySelector(".icon").classList.remove("show");
                })

                for (const [field, messages] of Object.entries(data.errors)) {
                    const cardForm = document.querySelector(".card.form");
                    const errorContainer = document.querySelector(`[data-id="${field}-error-container"]`);
                    const errorMessage = errorContainer.querySelector(".custom-error");
                    const errorIcon = errorContainer.querySelector(".icon");

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
        
        modal.addEventListener("transitionend", function end() {
            modal.classList.remove("show", "fade-out");
            modal.removeEventListener("transitionend", end);
        });

        
        modal.classList.add("fade-out");

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