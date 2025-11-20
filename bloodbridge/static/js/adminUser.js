document.addEventListener("DOMContentLoaded", () => {
    const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]').value;

    const actionModal = document.getElementById("actionModal");
    const confirmBtn = document.getElementById("confirmBtn");
    const cancelBtn = document.getElementById("cancelBtn");
    const toast = document.getElementById("actionToast");
    const toastMessage = document.getElementById("toastMessage");

    let currentAction = null;
    let currentUserId = null;

    /** SHOW MODAL **/
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

    /** HIDE MODAL **/
    function hideModal() {
        actionModal.style.display = "none";
        currentAction = null;
        currentUserId = null;
    }

    cancelBtn.onclick = hideModal;

    /** SHOW TOAST **/
    function showToast(message) {
        toastMessage.textContent = message;
        toast.style.display = "flex";

        setTimeout(() => {
            toast.style.display = "none";
        }, 3000);
    }

    /** CONFIRM ACTION **/
    confirmBtn.onclick = () => {
        if (!currentAction || !currentUserId) return;

        const action = currentAction; // ← store local copy
        const userId = currentUserId;

        let url = "/delete-user/";
        let options = {};

        if (action === "delete") {
            options = {
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                    "X-CSRFToken": csrfToken
                },
                body: `user_id=${userId}`
            };
        } else {
            url = action === "approve" ? "/approve-user/" : "/decline-user/";
            options = {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-CSRFToken": csrfToken
                },
                body: JSON.stringify({ user_id: userId })
            };
        }

        fetch(url, options)
            .then(async res => {
                const raw = await res.text();
                try {
                    return JSON.parse(raw);
                } catch {
                    console.error("Backend returned NON-JSON:", raw);
                    throw new Error("Invalid JSON response");
                }
            })
            .then(data => {
                hideModal();

                if (data.success) {
                    let msg = "";
                    if (action === "delete") msg = "User deleted!";
                    else if (action === "approve") msg = "User approved!";
                    else if (action === "decline") msg = "User declined!";

                    showToast(msg);
                    setTimeout(() => location.reload(), 1000);
                } else {
                    showToast(data.error || "Something went wrong!");
                }
            })
            .catch(err => {
                console.error("Request Error:", err);
                hideModal();
                showToast("Something went wrong!");
            });
    };


    /** ATTACH BUTTON EVENTS **/
    function attachButtons(selector, action) {
        document.querySelectorAll(selector).forEach(btn => {
            btn.addEventListener("click", () => showModal(action, btn.dataset.userId));
        });
    }

    attachButtons(".delete-btn", "delete");
    attachButtons(".approve-btn", "approve");
    attachButtons(".decline-btn", "decline");

    /** TAB SYSTEM **/
    document.querySelectorAll(".tab").forEach(tab => {
        tab.addEventListener("click", () => {
            document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
            document.querySelectorAll(".tab-content").forEach(c => (c.style.display = "none"));
            tab.classList.add("active");
            document.getElementById(tab.dataset.tab).style.display = "block";
        });
    });
});
