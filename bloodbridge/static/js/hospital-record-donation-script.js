
document.addEventListener('DOMContentLoaded', () => {




    // User Searchbox!!!!

    const userInput = document.getElementById('user-search-input');
    const userDropdown = document.getElementById('user-search-dropdown');
    const userDropdownContent = userDropdown.querySelector('.dropdown-content');
    const donorHiddenInput = document.getElementById('selected-donor');
    const donorImage = document.getElementById('selected-donor-img');
    
    const defaultImg = "/static/images/default-user-icon.jpg";
    // Function to fetch and display users
    async function fetchUsers(query = '') {
        const response = await fetch(`/search-users/?q=${encodeURIComponent(query)}`);
        const data = await response.json();
        return data.users;
    }

    function renderDropdown(users) {
        userDropdownContent.innerHTML = "";

        
        let html = "";
        if (!users.length) {
            html += `
                <div class="brown option empty">
                    <p class="pink">No users found</p>
                </div>
            `;
            userDropdownContent.innerHTML = html;
            return;
        }

        // build all HTML in one go
        users.forEach((user, index) => {
            const firstClass = index === 0 ? " first" : "";
            const lastClass = index === users.length - 1 ? " last" : "";
            html += `
                <div class="brown option${firstClass}${lastClass}">
                    <img src="/static/${user.image}" class="pink" />
                    <p class="pink" data-id="${user.id}">${user.name}</p>
                </div>
            `;
        });

        userDropdownContent.innerHTML = html;

        // reselect the newly added options
        userDropdownContent.querySelectorAll(".option").forEach(option => {
            option.addEventListener("click", () => {
                const name = option.querySelector("p").textContent;
                const img = option.querySelector("img").src;
                const id = option.querySelector("p").getAttribute('data-id');
                userInput.value = name;
                donorHiddenInput.value = parseInt(id); // same ramag id ang user og iyang profile entity
                console.log(`selected user's id: ${donorHiddenInput.value}`);
                donorImage.src = img;
                userDropdown.classList.remove("show");
            });
        });
    
    }

    userInput.addEventListener('input', async () => {
        const query = userInput.value.trim();

        if (query === "") {
            donorImage.src = defaultImg;
            donorHiddenInput.value = "";

            const randomUsers = await fetchUsers();
            renderDropdown(randomUsers);
            return;
        }


        const results = await fetchUsers(query);
        renderDropdown(results);
    });

    userInput.addEventListener('focus', async () => {
        userDropdown.classList.add("show");
        const query = userInput.value.trim();
        const results = await fetchUsers(query);
        renderDropdown(results);
    });

    document.addEventListener('click', (e) => {
        if (!e.target.closest(".donor-search")) {
            userDropdown.classList.remove("show");
        }
    });






    // Blood Type Dropdown !!!!

    const btDropdownBtn = document.getElementById('bt-dropdown-btn');
    const btDropdown = document.getElementById('bt-dropdown');
    const btDropdownContent = btDropdown.querySelector('.dropdown-content');
    const selectedBt = document.getElementById('selected-blood-type');

    btDropdownBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        console.log('Button clicked!'); // Check if this appears in console
        btDropdown.classList.toggle('show');
    });

    // When clicking an option
    btDropdownContent.querySelectorAll('.option').forEach(option => {
        option.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            const value = option.dataset.value;
            selectedBt.value = value;
            console.log(`selected blood type: ${selectedBt.value}`);
            btDropdownBtn.textContent = option.textContent;
            btDropdown.classList.remove('show');
        });
    });

    // When clicking outside
    document.addEventListener('click', (e) => {
        if (!e.target.closest('#bt-dropdown')) {
            btDropdown.classList.remove('show');
        }
    });







    // POST Donation Form !!!!!!

    function getCSRFToken() {
        const csrfToken = document.querySelector('meta[name="csrf-token"]');
        return csrfToken ? csrfToken.content : '';
    }

    const donationForm = document.querySelector(".form form");

    donationForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        console.log('Form submitted!');

        donationForm.querySelectorAll('.custom-error').forEach(el => el.textContent='');

        const createDonationButton = document.getElementById("record-donation-btn");
        createDonationButton.disabled = true;

        const formData = new FormData(donationForm);
        console.log('📦 FormData contents:');

        for (let [key, value] of formData.entries()) {
            console.log(`  ${key}: ${value}`);
        }

        try {
            console.log('🚀 Sending fetch request...');
            const response = await fetch('/hospital/create-donation-record/', {
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
                window.location.reload();
            } else {
                console.log('❌ Errors found:', data.errors);
                for (const field in data.errors) {
                    const messages = data.errors[field];

                    const errorMessage = donationForm.querySelector(`.custom-error[data-id="${field}-field-error"]`);
                    
                    console.log(`Error element found:`, errorMessage);

                    if (errorMessage) {
                        errorMessage.textContent = messages[0];
                    }
                }
            } 
        } catch (err) {
            console.error("Error submitting form:", err);
        } finally {
            console.log('🔓 Re-enabling button');
            createDonationButton.disabled = false;
        }
        
    })








    // Expanding donation record row

    const rows = document.querySelectorAll(".row.donation-record");
    let openedAdditional = null;


    rows.forEach (row => {
        const additional = row.querySelector(".additional");

        row.addEventListener('click', () => {
            

            if(!additional) return;

            // if ang gi pindot kay dle ang currently expanded, then ang currently expanded will close
            if (openedAdditional && openedAdditional !== additional) {
                const prevRow = openedAdditional.parentElement;
                openedAdditional.classList.remove("show");
                prevRow.style.height = prevRow.scrollHeight + "px"; // shrink to normal height
                prevRow.style.height = ""; // allow natural height again
            }

            const isOpening = !additional.classList.contains("show");
            additional.classList.toggle("show");

            const totalHeight = Math.max(
                row.scrollHeight,
                additional.offsetTop + additional.scrollHeight
            );

            if (isOpening) {
                // expanding
                row.style.height = totalHeight + "px";
                openedAdditional = additional;
            } else {
                row.style.height = "";
                openedAdditional = null;
            }
        })
    })




});