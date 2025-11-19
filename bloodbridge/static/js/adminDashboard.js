document.addEventListener('DOMContentLoaded', () => {

    // -------- Tabs --------
    const tabs = document.querySelectorAll('.tab');
    const tabContents = document.querySelectorAll('.tab-content');

    tabs.forEach((tab, index) => {
        tab.addEventListener('click', () => {
            tabContents.forEach(c => c.style.display = 'none');
            tabs.forEach(t => t.classList.remove('active'));

            tabContents[index].style.display = 'block';
            tab.classList.add('active');
        });
    });

    // ---------------------
    // Show Approve/Decline Confirmation Modal
    // ---------------------
    function showActionModal(title, message, callback) {
        const modal = document.getElementById("actionModal");
        const titleEl = document.getElementById("actionModalTitle");
        const msgEl = document.getElementById("actionModalMessage");
        const cancelBtn = document.getElementById("actionCancelBtn");
        const confirmBtn = document.getElementById("actionConfirmBtn");

        if (!modal || !titleEl || !msgEl || !cancelBtn || !confirmBtn) {
            console.error("Action modal elements missing in HTML!");
            return;
        }

        titleEl.textContent = title;
        msgEl.textContent = message || "";

        modal.style.display = "flex";

        // Remove old listeners (prevent duplicates)
        const newCancelBtn = cancelBtn.cloneNode(true);
        const newConfirmBtn = confirmBtn.cloneNode(true);
        cancelBtn.parentNode.replaceChild(newCancelBtn, cancelBtn);
        confirmBtn.parentNode.replaceChild(newConfirmBtn, confirmBtn);

        // Cancel button closes modal
        newCancelBtn.addEventListener("click", () => {
            modal.style.display = "none";
        });

        // Confirm button executes callback
        newConfirmBtn.addEventListener("click", () => {
            modal.style.display = "none";
            callback(); // Run approve/decline fetch
        });
    }


    // -------- Delete Hospital --------
    function attachDeleteButtons() {
        document.querySelectorAll('.delete-btn').forEach(button => {
            button.addEventListener('click', () => {
                const userId = button.dataset.userId;

                // Open modal
                const modal = document.getElementById("deleteModal");
                modal.style.display = "flex";

                const cancelBtn = document.getElementById("cancelDeleteBtn");
                const confirmBtn = document.getElementById("confirmDeleteBtn");

                // Clear old listeners (prevent duplicate triggers)
                const newCancelBtn = cancelBtn.cloneNode(true);
                const newConfirmBtn = confirmBtn.cloneNode(true);
                cancelBtn.parentNode.replaceChild(newCancelBtn, cancelBtn);
                confirmBtn.parentNode.replaceChild(newConfirmBtn, confirmBtn);

                // Close modal
                newCancelBtn.addEventListener("click", () => {
                    modal.style.display = "none";
                });

                // Confirm delete
                newConfirmBtn.addEventListener("click", () => {

                    fetch('/delete-hospital/', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/x-www-form-urlencoded',
                            'X-CSRFToken': getCookie('csrftoken')
                        },
                        body: `user_id=${userId}`
                    })
                        .then(res => res.json())
                        .then(data => {
                            if (data.success) {
                                button.closest('tr').remove();
                                alert("Hospital deleted successfully.");
                            } else {
                                alert(data.error || 'Something went wrong.');
                            }
                        })
                        .catch(err => console.error(err));

                    modal.style.display = "none";
                });
            });
        });
    }

    // -------- Approve Hospital --------
    function attachApproveButtons() {
        document.querySelectorAll(".approve-btn").forEach(button => {
            button.addEventListener("click", () => {
                const userId = button.dataset.userId;

                showActionModal("Approve Hospital?", "Are you sure you want to approve this hospital?", () => {
                    fetch('/approve-hospital/', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/x-www-form-urlencoded',
                            'X-CSRFToken': getCookie('csrftoken')
                        },
                        body: `user_id=${userId}`
                    })
                        .then(res => res.json())
                        .then(data => {
                            if (data.success) {
                                showToast("Hospital account has been approved.");
                                button.closest('tr').remove(); // remove from requests table
                            } else {
                                showToast(data.error || "Something went wrong.");
                            }
                        })
                        .catch(err => console.error(err));
                });
            });
        });
    }


    // -------- Decline Hospital --------
    function attachDeclineButtons() {
        document.querySelectorAll(".decline-btn").forEach(button => {
            button.addEventListener("click", () => {
                const userId = button.dataset.userId;

                showActionModal("Decline Hospital?", "Are you sure you want to decline this hospital request?", () => {
                    fetch('/decline-hospital/', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/x-www-form-urlencoded',
                            'X-CSRFToken': getCookie('csrftoken')
                        },
                        body: `user_id=${userId}`
                    })
                        .then(res => res.json())
                        .then(data => {
                            if (data.success) {
                                showToast("Hospital account has been declined.");
                                button.closest('tr').remove(); // remove from requests table
                            } else {
                                showToast(data.error || "Something went wrong.");
                            }
                        })
                        .catch(err => console.error(err));
                });
            });
        });
    }




    // Attach all button events
    attachDeleteButtons();
    attachApproveButtons();
    attachDeclineButtons();
});


// -------- CSRF Helper --------
function getCookie(name) {
    let cookieValue = null;
    if (document.cookie) {
        document.cookie.split(';').forEach(cookie => {
            cookie = cookie.trim();
            if (cookie.startsWith(name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
            }
        });
    }
    return cookieValue;
}

function showToast(message) {
    const toast = document.getElementById("actionToast");
    const toastMessage = document.getElementById("toastMessage");

    toastMessage.textContent = message;
    toast.style.display = "flex";

    // Hide after 3 seconds
    setTimeout(() => {
        toast.style.display = "none";
    }, 3000);
}

