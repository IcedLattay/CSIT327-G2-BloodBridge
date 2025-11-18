document.addEventListener("DOMContentLoaded", () => {


    // FOR REQUEST LIST

    // expanding list-item

    const compressedDivs = document.querySelectorAll(".row .compressed");
    let openedUncompressed = null; // store currently opened .uncompressed div

    function getCSRFToken() {
        return document.querySelector('meta[name="csrf-token"]').content;
    }

    compressedDivs.forEach(compressed => {
        
        const row = compressed.parentElement;
        
        compressed.parentElement.addEventListener("click", () => {
            const uncompressed = row.querySelector(".uncompressed");
            

            
            if (!uncompressed) return;

            // If another row is already open, close it
            if (openedUncompressed && openedUncompressed !== uncompressed) {
                openedUncompressed.classList.remove("show");
            }

            // Open/close the clicked row
            uncompressed.classList.toggle("show");

            // Update the currently opened row
            openedUncompressed = uncompressed.classList.contains("show") ? uncompressed : null;

        });

        const cancelBtn = row.querySelector(".negative");
        const approveBtn = row.querySelector(".positive");

        const requestId = row.dataset.requestId; // we'll need to add this to HTML

        
        if (cancelBtn) {
            cancelBtn.addEventListener("click", async (e) => {
                e.stopPropagation(); // prevent row toggle
                const confirmed = confirm("Are you sure you want to cancel this appointment?");
                if (!confirmed) return;

                const res = await fetch(`/appointments/${requestId}/cancel/`, { 
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRFToken': getCSRFToken()  // include CSRF token
                    } 
                });

                if (res.ok) {
                    row.remove(); // remove row from DOM
                    openedUncompressed = null;
                } else {
                    alert("Error cancelling appointment");
                }
            });
        }

            // Approve button
        if (approveBtn) {
            approveBtn.addEventListener("click", async (e) => {
                e.stopPropagation();

                const res = await fetch(`/appointments/${requestId}/approve/`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRFToken': getCSRFToken()  // include CSRF token
                    }
                });

                if (res.ok) row.remove();
                else alert("Error approving appointment");
            });
        }
    });


    // FOR FILTERS

    const filters = document.querySelectorAll(".filter-dropdown");

    filters.forEach(filter => {
        const choice = filter.querySelector(".filter-choice");
        const options = filter.querySelectorAll(".filter-opt");
        const hiddenInput = filter.previousElementSibling; // assumes hidden input is just above
        const label = choice.textContent.split('|')[0].trim(); // get "Blood Type" or "Urgency"
        const content = filter.querySelector(".filter-dropdown-container");

        // Toggle dropdown open/close
        filter.addEventListener("click", () => {
            content.classList.toggle("show");
        });

        // Handle option click
        options.forEach(opt => {
            opt.addEventListener("click", () => {
                const value = opt.dataset.value;
                const valueText = opt.textContent;

                // Update visible choice
               choice.textContent = `${label} | ${valueText}`;
                // Update hidden input value
                if (hiddenInput) hiddenInput.value = value;

                // Close dropdown
                content.classList.remove("show");

                // Trigger filter function
                applyRequestFilters();
                applyDonorFilters();
            });
        });
    });

    // Optional: close dropdown if clicking outside
    document.addEventListener("click", (e) => {
        filters.forEach(filter => {
            const content = filter.querySelector(".filter-dropdown-container");

            if (!filter.contains(e.target)) {
                content.classList.remove("show");
            }
        });
    });

    // Example filter function
    function applyRequestFilters() {
        const selectedBloodType = document.getElementById("filter-request-blood-type").value;
        const selectedUrgency = document.getElementById("filter-request-urgency").value;

        console.log("Selected Blood Type:", selectedBloodType);
        console.log("Selected Urgency:", selectedUrgency);

        const rows = document.querySelector(".requests").querySelectorAll(".row");

        rows.forEach(row => {
            const rowBloodType = row.dataset.bloodType; // assume data-blood-type="{{ request.blood_type.id }}"
            const rowUrgency = row.dataset.urgency;    // assume data-urgency="{{ request.urgency }}"

            // Show row only if it matches selected filters (or if filter is empty)
            if ((selectedBloodType === "All" || selectedBloodType == rowBloodType) &&
                (selectedUrgency === "All" || selectedUrgency == rowUrgency)) {
                row.style.display = "";
            } else {
                row.style.display = "none";
            }
        })
    }

    function applyDonorFilters() {
        const selectedBloodType = document.getElementById("filter-donor-blood-type").value;

        const rows = document.querySelector(".donors").querySelectorAll(".row");

        rows.forEach(row => {
            const rowBloodType = row.dataset.bloodType;

            // Show row only if it matches selected blood type (or if "All")
            const showRow = selectedBloodType === "All" || selectedBloodType == rowBloodType;

            row.style.display = showRow ? "" : "none";
        });
    }

});
