document.addEventListener('DOMContentLoaded', () => {
    const deleteButtons = document.querySelectorAll('.delete-btn');

    deleteButtons.forEach(button => {
        button.addEventListener('click', () => {
            const userId = button.dataset.userId;

            if (!confirm('Are you sure you want to delete this hospital?')) return;

            fetch("/delete-hospital/", {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'X-CSRFToken': getCookie('csrftoken')  // always valid
                },
                body: `user_id=${userId}`
            })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        button.closest('tr').remove();
                    } else {
                        alert(data.error || 'Something went wrong.');
                    }
                })
                .catch(error => console.error("Error:", error));
        });
    });
});


// Reads Django's csrftoken cookie safely
function getCookie(name) {
    let cookieValue = null;

    if (document.cookie) {
        const cookies = document.cookie.split(';');

        for (let cookie of cookies) {
            cookie = cookie.trim();

            if (cookie.startsWith(name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}
