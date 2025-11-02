


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
        form.querySelectorAll(".custom-error, .errorlist").forEach((e) => e.remove());
    }

    function resetForm(form) {
        // Reset Blood Type Dropdown
        dropdownBt_Btn.textContent = 'A+ / B+ / O';
        selectedBt.value = 'none';
        
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




    // POST Form Submission



    function getCSRFToken() {
        return document.querySelector('meta[name="csrf-token"]').content;
    }

    requestForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        requestForm.querySelectorAll('.custom-error').forEach(el => el.textContent='');

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
                requestFormModal.classList.remove("show");
                resetForm(requestForm)
                window.location.reload();

            } else {

                for (const [fieldName, messages] of Object.entries(data.errors)) {
                    const field = requestForm.querySelector(`[name="${fieldName}"]`);
                    
                    if (field) {
                        let errorDiv;
                        
                        if (fieldName === 'time_open' || fieldName === 'time_close') {
                            errorDiv = requestForm.querySelector('.error-message[data-for="time_fields"]');
                        } else if (fieldName === 'days_open') {
                            errorDiv = requestForm.querySelector('.error-message[data-for="days_open"]');
                        } else {
                            errorDiv = field.closest('.field')?.querySelector('.error-message');
                        }
                        
                        if (errorDiv) {
                            const p = errorDiv.querySelector(".custom-error");
                            p.textContent = messages[0];
                        }
                    }
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


});