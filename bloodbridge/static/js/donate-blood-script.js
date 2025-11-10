
document.addEventListener('DOMContentLoaded', () => {

    const requests = document.querySelectorAll('.orange.row');

    const selectedRequest = document.getElementById("selected-request");
    const selectedDate = document.getElementById("selected-date");
    const selectedTimeStart = document.getElementById("selected-start-time");
    const selectedTimeEnd = document.getElementById("selected-end-time");

    const container = document.getElementById("time-slots-container");
    const scheduleDisplay = document.getElementById("display-schedule");
    
        
    requests.forEach( request => {


        request.addEventListener('click', () => {
            const requestID = request.getAttribute("data-request-id");
            const requestTimeOpen = request.getAttribute("data-open-time");
            const requestTimeClose = request.getAttribute("data-close-time");

            console.log(`🩸 GOT #${requestID}`);
            console.log(`🕐 GOT Time window: ${requestTimeOpen} - ${requestTimeClose}`);
            
            
            const setAppointmentModal = document.getElementById("set-appointment-modal");

            openModal(setAppointmentModal, requestID)

            
            fetch(`/appointments/available-dates/${requestID}/`)
            .then(res => res.json())
            .then(data => {
                const availableDates = data.available_dates || [];
                console.log("✅ GOT Available dates:", availableDates);

                // ✅ Step 2: Initialize flatpickr *only once per modal opening*
                const calendarElem = document.getElementById("calendar");

                // destroy previous instance if it exists (important!)
                if (calendarElem._flatpickr) {
                    calendarElem._flatpickr.destroy();
                }

                flatpickr(calendarElem, {
                    inline: true,
                    dateFormat: "Y-m-d",
                    enable: availableDates,
                    defaultDate: null,
                    onChange: function(selectedDates, dateStr) {
                        selectedDate.value = dateStr;
                        console.log(`📅 STORED Selected Date, ${selectedDate.value}, in hidden input`);

                        // 🧠 Convert the flatpickr date string ("2025-09-28") to a JS Date object
                        const dateObj = new Date(dateStr);

                        // 🪄 Format: "Wednesday, Sept 28, 2025"
                        const options = { 
                            weekday: "long", 
                            year: "numeric", 
                            month: "short", 
                            day: "numeric" 
                        };

                        const formattedDate = dateObj.toLocaleDateString("en-US", options);

                        // 🖼️ Display it
                        scheduleDisplay.querySelector(".date .custom-error").textContent = '';
                        scheduleDisplay.querySelector(".date .icon").classList.remove("show");
                        scheduleDisplay.querySelector(".indigo.date").textContent = formattedDate;
                        scheduleDisplay.querySelector(".indigo.time").textContent = '';

                        // ✅ Step 3: Fetch booked slots here
                        fetch(`/appointments/booked-slots/${requestID}?date=${dateStr}`)
                            .then(res => res.json())
                            .then(booked_slots => {
                                const allSlots = generateTimeSlots(requestTimeOpen, requestTimeClose);
                                console.log(`GOT Slots: ${allSlots}`);

                                console.log(`⏰ GOT Booked Slots: ${booked_slots}`);
                                renderTimeSlots(allSlots, booked_slots);
                            })
                            .catch(err => console.error("❌ Error fetching booked slots:", err));
                    }
                });
            })
            .catch(err => console.error("❌ Error fetching available dates:", err));
        })
    })

    function formatTo12Hour(time24) {
        const [hour, minute] = time24.split(":").map(Number);
        const date = new Date();
        date.setHours(hour, minute);
        const options = { hour: 'numeric', minute: '2-digit', hour12: true };
        return date.toLocaleTimeString([], options)
    }

    function renderTimeSlots(allSlots, bookedSlots) {
        container.innerHTML = "";


        for (let i = 0; i < allSlots.length - 1; i++) {
            const label = `${formatTo12Hour(allSlots[i])} - ${formatTo12Hour(allSlots[i + 1])}`;
            const slot = document.createElement("p");
            slot.textContent = label;
            slot.classList.add("magenta");
            slot.classList.add("slot");

            if (i == 0) {
                slot.classList.add("first");
            } else if (i == allSlots.length - 2) {
                slot.classList.add("last");
            }

            // Disable if taken
            if (bookedSlots.includes(allSlots[i])) {
                slot.classList.add("disabled");
            } else {
                slot.addEventListener('click', () => {
                    document.querySelectorAll(".slot.selected").forEach(s => s.classList.remove("selected"));

                    scheduleDisplay.querySelector(".time .custom-error").textContent = '';
                    scheduleDisplay.querySelector(".time .icon").classList.remove("show");
                    scheduleDisplay.querySelector(".indigo.time").textContent = `${formatTo12Hour(allSlots[i])} - ${formatTo12Hour(allSlots[i + 1])}`;

                    slot.classList.add("selected");

                    // Update hidden inputs with the start and end times
                    selectedTimeStart.value = allSlots[i];
                    selectedTimeEnd.value = allSlots[i + 1];

                    console.log(`Selected slot: ${selectedTimeStart.value} - ${selectedTimeEnd.value}`);
                })
            }

            container.appendChild(slot);
        }
    }


    function openModal(modal, id) {

        modal.classList.add("show");

        const empty_text = document.createElement("p");
        empty_text.textContent = 'Please select a date';
        empty_text.classList.add("magenta");
        empty_text.classList.add("empty-slots");

        container.appendChild(empty_text);

        selectedRequest.value = id;
        console.log(` STORED Request #${selectedRequest.value} in hidden input`);
    }


    function generateTimeSlots(start, end, interval = 60) {
        const slots = [];
        const [startH, startM] = start.split(":").map(Number);
        const [endH, endM] = end.split(":").map(Number);

        const startDate = new Date();
        startDate.setHours(startH, startM, 0, 0);

        const endDate = new Date();
        endDate.setHours(endH, endM, 0, 0);

        if (endDate <= startDate) {
            endDate.setDate(endDate.getDate() + 1);
        }

        while (startDate <= endDate) {
            const hours = String(startDate.getHours()).padStart(2, "0");
            const minutes = String(startDate.getMinutes()).padStart(2, "0");

            slots.push(`${hours}:${minutes}`);

            startDate.setMinutes(startDate.getMinutes() + interval);
        }

        return slots;
    }





    // POST Appointment Form !!!!
    
    function getCSRFToken() {
        const csrfToken = document.querySelector('meta[name="csrf-token"]');
        return csrfToken ? csrfToken.content : '';
    }

    const appointmentForm = document.getElementById("appointment-form");

    appointmentForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        console.log("Form submitted!");


        const setAppointment = document.getElementById("set-appointment-btn");
        setAppointment.disabled = true;

        const formData = new FormData(appointmentForm);
        console.log("Appointment Form content:");

        for (let [key, value] of formData.entries()) {
            console.log(`${key}: ${value}`);
        }

        try {
            console.log("Sending fetch request...");

            const res = await fetch('/set-appointment/', {
                method: "POST",
                headers: {
                    'X-CSRFToken' : getCSRFToken(),
                    "X-Requested-With": "XMLHttpRequest",
                },
                body: formData
            });

            console.log('📨 Response received, status:', res.status);

            const data = await res.json();
            console.log('📊 Response data:', data);


            if (data.success) {
                console.log('✅ Success! Reloading page...')
                localStorage.setItem("showSuccessModal", "true");

                window.location.reload();
            } else {
                
                console.log('❌ Errors found:', data.errors);

                
                for (const field in data.errors) {
                    const messages = data.errors[field];
                    
                    console.log("Field:", field);
                    console.log("Selector:", `.icon[data-id="${field}-error-icon"]`);
                    console.log("Found element:", scheduleDisplay.querySelector(`.icon[data-id="${field}-error-icon"]`));

                    scheduleDisplay.querySelector(`[data-id="${field}-error-icon"]`).classList.remove("show");
                    scheduleDisplay.querySelector(`[data-id="${field}-error-icon"]`).classList.add("show");
                    const errorMessage = appointmentForm.querySelector(`.custom-error[data-id="${field}-field-error"]`);
                    
                    console.log(`Error element found:`, errorMessage);

                    if (errorMessage) {
                        errorMessage.textContent = '';
                        errorMessage.textContent = messages[0];
                    }
                }
                const form = document.querySelector("form");
                const dateEl = scheduleDisplay.querySelector('.magenta.date');
                const timeEl = scheduleDisplay.querySelector('.magenta.time');

                form.classList.remove("shake");
                dateEl.classList.remove("shake");
                timeEl.classList.remove("shake");

                // force reflow
                void form.offsetWidth;
                void dateEl.offsetWidth;
                void timeEl.offsetWidth;

                form.classList.add("shake");
                dateEl.classList.add("shake");
                timeEl.classList.add("shake");
            }

        } catch (err) {
            console.error("Error submitting form:", err);
        } finally {
            console.log('🔓 Re-enabling button');
            setAppointment.disabled = false;
        }

    })




    // LOGIC for Success Overlay !!!

    let modalTimeout;
    const successModal = document.getElementById("success-modal");
    const successAnimation = document.getElementById("success-animation");

    const shouldShow = localStorage.getItem("showSuccessModal");

    if (shouldShow === "true") {
        // Show your success overlay/modal
        showSuccessModal();

        // Reset the flag so it doesn’t show again on next reload
        localStorage.removeItem("showSuccessModal");
    }


    function showSuccessModal() {

        successModal.classList.add("show");

        successAnimation.loop = false;

        // Restart the animation fresh
        successAnimation.stop();
        successAnimation.play();

        // Clear any old timer so it doesn't auto-close too soon
        if (modalTimeout) {
            clearTimeout(modalTimeout);
        }

        // Auto-hide after 3 seconds
        modalTimeout = setTimeout(() => {
            console.log("Hiding success overlay...");

            hideOverlay(successModal);
        }, 3000);
    }

    function hideOverlay(modal) {
        modal.classList.add("fade-out");

        modal.addEventListener("transitionend", function end() {
            modal.classList.remove("show", "fade-out");
            modal.removeEventListener("transitionend", end);
        });
    }

    window.addEventListener("click", function(event) {
        if (event.target === successModal) {
            successModal.classList.remove("show");

            // Also clear any pending timer when manually closed
            if (modalTimeout) {
                clearTimeout(modalTimeout);
            }
        }
    });
});