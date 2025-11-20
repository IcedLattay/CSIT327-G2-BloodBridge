document.addEventListener("DOMContentLoaded", () => {
    const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]').value;

    const actionModal = document.getElementById("actionModal");
    const confirmBtn = document.getElementById("actionConfirmBtn");
    const cancelBtn = document.getElementById("actionCancelBtn");
    const toast = document.getElementById("actionToast");
    const toastMessage = document.getElementById("toastMessage");

    let currentAction = null;
    let currentUserId = null;

    /** SHOW MODAL **/
    function showModal(action, userId) {
        currentAction = action;
        currentUserId = userId;

        const titleMap = {
            delete: "Delete hospital permanently?",
            approve: "Approve hospital account?",
            decline: "Decline hospital account?"
        };

        const msgMap = {
            delete: "This action cannot be undone.",
            approve: "The hospital will be able to access the system.",
            decline: "This will remove the hospital from the system."
        };

        document.getElementById("actionModalTitle").textContent = titleMap[action];
        document.getElementById("actionModalMessage").textContent = msgMap[action];

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
        setTimeout(() => toast.style.display = "none", 3000);
    }

    /** SWITCH TAB **/
    function switchToTab(tabId) {
        document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
        document.querySelectorAll(".tab-content").forEach(c => (c.style.display = "none"));
        const tabButton = document.querySelector(`.tab[data-tab="${tabId}"]`);
        const tabContent = document.getElementById(tabId);
        if (tabButton && tabContent) {
            tabButton.classList.add("active");
            tabContent.style.display = "block";
        }
    }

    /** CONFIRM ACTION **/
    confirmBtn.onclick = () => {
        if (!currentAction || !currentUserId) return;

        const action = currentAction;
        const userId = currentUserId;

        let url = DELETE_HOSPITAL_URL;
        let options = {};

        if (currentAction === "delete") {
            url = DELETE_HOSPITAL_URL;
            options = {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-CSRFToken": csrfToken
                },
                body: JSON.stringify({ user_id: currentUserId })
            };
        } else {
            url = action === "approve" ? APPROVE_HOSPITAL_URL : DECLINE_HOSPITAL_URL;
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
                    if (action === "delete") msg = "Hospital deleted!";
                    else if (action === "approve") msg = "Hospital approved!";
                    else if (action === "decline") msg = "Hospital declined!";

                    showToast(msg);

                    // Refresh page for all actions so the accounts list updates automatically
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
        tab.addEventListener("click", () => switchToTab(tab.dataset.tab));
    });
});
