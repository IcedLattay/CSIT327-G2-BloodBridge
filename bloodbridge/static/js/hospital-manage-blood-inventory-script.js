

document.addEventListener("DOMContentLoaded", () => {


    // button handling

    const inputs = document.querySelectorAll(".bt-input");
    const saveBtn = document.getElementById("save-btn");


    function checkForChanges() {

        let changed = false;

        inputs.forEach(input => {
            const original = input.dataset.original;
            const current = input.value;

            if (current !== original) {
                changed = true;
            } 
        });

        // Update button ONCE after the loop
        if (changed) {
            saveBtn.disabled = false;
            saveBtn.classList.remove("disabled");
        } else {
            saveBtn.disabled = true;
            saveBtn.classList.add("disabled");
        }
    }

    inputs.forEach(input => {
        input.addEventListener("input", checkForChanges);
    });







    








    // POST unit changes!!!

    function getCSRFToken() {
        const csrfToken = document.querySelector('meta[name="csrf-token"]');
        return csrfToken ? csrfToken.content : '';
    }

    const bloodInventoryForm = document.getElementById("blood-inventory-form");

    bloodInventoryForm.addEventListener('submit', async (e) => {
        e.preventDefault()

        console.log("Form submitted!")

        saveBtn.disabled = true;

        const formData = new FormData(bloodInventoryForm)

        console.log('📦 FormData contents:');
        for (let [key, value] of formData.entries()) {
            console.log(`  ${key}: ${value}`);
        }

        try {
            console.log('🚀 Sending fetch request...');
            const response = await fetch('/hospital/update-stocks/', {
                method: "POST",
                headers: {
                    'X-CSRFToken' : getCSRFToken(),
                    "X-Requested-With": "XMLHttpRequest",
                },
                body: formData
            });

            console.log('📨 Response received, status:', response.status);

            const data = await response.json();
            console.log('📊 Response data:', data);
            
            if (data.success) {
                console.log('✅ Success! Reloading page...');

                // disable button visually
                saveBtn.classList.add("disabled");
                
                // show toast message
                const toast = document.getElementById("actionToast")
                console.log("toast is here")
                toast.style.display = "flex";
                setTimeout(() => {
                    toast.style.display = "none"
                    console.log("toast is gone")
                }, 3000);
            }
        } catch (err) {
            console.error("Error submitting form:", err);
        } finally {
            console.log('🔓 Re-enabling button');
            saveBtn.disabled = false;
        }
    })
})