document.addEventListener("DOMContentLoaded", () => {
    const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]').value;

    const actionModal = document.getElementById("actionModal");
    const confirmBtn = document.getElementById("confirmBtn");
    const cancelBtn = document.getElementById("cancelBtn");
    const toast = document.getElementById("actionToast");
    const toastMessage = document.getElementById("toastMessage");

    let currentAction = null;
    let currentUserId = null;

    function showModal(action, userId) {
        currentAction = action;
        currentUserId = userId;

        const titleMap = {
            delete: "Delete account permanently?",
            approve: "Approve user account?",
            decline: "Decline user account?"
        };

        const msgMap = {
            delete: "This action cannot be undone.",
            approve: "The user will be able to access the system.",
            decline: "This will remove the user from the system."
        };

        document.getElementById("modalTitle").textContent = titleMap[action];
        document.getElementById("modalMessage").textContent = msgMap[action];

        actionModal.style.display = "flex";
    }

    function hideModal() {
        actionModal.style.display = "none";
        currentAction = null;
        currentUserId = null;
    }

    cancelBtn.onclick = hideModal;

    function showToast(message) {
        toastMessage.textContent = message;
        toast.style.display = "flex";

        // Hide after 3 seconds like hospital dashboard
        setTimeout(() => {
            toast.style.display = "none";
        }, 3000);
    }

    confirmBtn.onclick = () => {
        if (!currentAction || !currentUserId) return;

        let url = "/delete-user/";
        if (currentAction === "approve") url = "/approve-user/";
        if (currentAction === "decline") url = "/decline-user/";

        fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": currentAction === "delete" ? "application/x-www-form-urlencoded" : "application/json",
                "X-CSRFToken": csrfToken
            },
            body: currentAction === "delete"
                ? new URLSearchParams({ user_id: currentUserId })
                : JSON.stringify({ user_id: currentUserId })
        })
            .then(res => res.json())
            .then(data => {
                hideModal();
                if (data.success) {
                    let msg = "";
                    if (currentAction === "delete") msg = "User deleted!";
                    if (currentAction === "approve") msg = "User approved!";
                    if (currentAction === "decline") msg = "User declined!";
                    showToast(msg);

                    setTimeout(() => location.reload(), 1000);
                } else {
                    showToast(data.error || "Something went wrong!");
                }
            })
            .catch(err => {
                console.error(err);
                hideModal();
                showToast("Something went wrong!");
            });
    };

    function attachButtons(selector, action) {
        document.querySelectorAll(selector).forEach(btn => {
            btn.addEventListener("click", () => showModal(action, btn.dataset.userId));
        });
    }

    attachButtons(".delete-btn", "delete");
    attachButtons(".approve-btn", "approve");
    attachButtons(".decline-btn", "decline");

    // Tabs
    document.querySelectorAll(".tab").forEach(tab => {
        tab.addEventListener("click", () => {
            document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
            document.querySelectorAll(".tab-content").forEach(c => c.style.display = "none");
            tab.classList.add("active");
            document.getElementById(tab.dataset.tab).style.display = "block";
        });
    });
});
