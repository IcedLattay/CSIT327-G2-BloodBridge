

document.querySelectorAll('.delete-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
        const userId = btn.dataset.userId;
        const response = await fetch(`/admin/delete-hospital/${userId}/`, { method: 'POST', headers: { 'X-CSRFToken': csrftoken } });
        if (response.ok) {
            btn.closest('tr').remove();
        }
    });
});
