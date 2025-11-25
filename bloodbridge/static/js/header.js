

document.addEventListener("DOMContentLoaded", () => {

  const dropdownBtn = document.getElementById("dropdown-btn");
  const dropdownContent = document.getElementById("dropdown-content");
  const dropdownBtnArrow = document.getElementById("dropdown-btn-arrow");

  if (!dropdownBtn || !dropdownContent || !dropdownBtnArrow) {
    console.warn("Dropdown elements not found in DOM");
    return;
  }

  // Toggle dropdown visibility
  dropdownBtn.addEventListener("click", (e) => {
    dropdownContent.classList.toggle("show");
    dropdownBtnArrow.classList.toggle("rotate");
  });

  // Close dropdown when clicking outside
  document.addEventListener("click", (e) => {
    const isClickInside = e.target.closest(".dropdown");
    if (!isClickInside && dropdownContent.classList.contains("show")) {
      dropdownContent.classList.remove("show");
      dropdownBtnArrow.classList.remove("rotate");
    }
  });



  const notifsBtn = document.getElementById("notification-button");
  const notifsOverlay = document.getElementById("notification-overlay");
  const notifsIcon = document.getElementById("notification-icon");
  const notifsList = document.getElementById("notification-list");


  notifsBtn.addEventListener('click', () => {
    if (notifsOverlay.classList.contains("show")){
      console.log("Overlay closed");
    } else {
      console.log("Overlay opened");
      console.log("Notifications' is_seen = False are now set to True");

      seenNotifs()
    }
    notifsOverlay.classList.toggle("show");
    notifsIcon.classList.toggle("focus");
  })

  document.addEventListener('click', (e) => {
    if (!e.target.closest(".notification-button")) {
      notifsIcon.classList.remove("focus");
      notifsOverlay.classList.remove("show");
    }
  })




  
  const badge = document.querySelector('.notification-button .badge');
  const popupOverlay = document.querySelector('.notification-popup-overlay');
  const shownNotifications = new Set();

  async function updateBadge() {
    try {
      // --- Fetch active notifications ---
      const activeResponse = await fetch('/notifications/get-active/');
      const activeData = await activeResponse.json();
      const notifications = activeData.notifications;

      console.log(notifications)

      renderNotifications(notifications);

      // --- Show popup for new notifications ---
      const hasNewEmergencyAlert = notifications.some(n => 
          n.type === 'emergency alert' && !n.is_seen && !shownNotifications.has(n.id)
      );

      if (hasNewEmergencyAlert) {
          console.log("New emergency alert detected! Showing popup overlay...");
          showPopup();
      }
      
      notifications.forEach(n => {
          if (!shownNotifications.has(n.id)) {
              shownNotifications.add(n.id);
          }
      });

      // --- Fetch unseen count ---
      const unseenResponse = await fetch('/notifications/count-unseen/');
      const unseenData = await unseenResponse.json();

      if (unseenData.unseen_count > 0) {
        badge.textContent = unseenData.unseen_count;
        badge.classList.add("show");
      } else {
        badge.classList.remove("show");
      }
    } catch (err) {
      console.error("Error updating notifications:", err);
    }
  }

  function showPopup() {
    popupOverlay.classList.add("show");

    function end() {
      console.log("Closing popup overlay...");
      popupOverlay.classList.remove("show", "fade-out");
      popupOverlay.removeEventListener("transitionend", end);
    }

    popupOverlay.addEventListener("transitionend", end);

    setTimeout(() => {
      popupOverlay.classList.add("fade-out");
    }, 5000);
  }

  function seenNotifs() {
    fetch('/notifications/set-to-seen/') 
      .then(res => res.json())
      .then(data => {

        if(data.success) {
          badge.classList.remove("show");
        } else {
          console.log("Something went wrong...");
        }
    });
  }

  
  setInterval(updateBadge, 5000); //update every 5 seconds
  updateBadge();


  function renderNotifications(notifications) {
    if (!notifsList) return;
    
    notifsList.innerHTML = ''; // Clear previous ones

    notifications.forEach( (n, index) => {
        let daysLeftText = "";

        if (n.type === "appointment reminder" && n.days_left != null) {
            daysLeftText = formatTimeLeft(n.days_left);
        }


        const item = document.createElement('div');
        item.classList.add('notification-item');
        item.dataset.id = n.id;

        if (n.type == 'emergency alert') {
          item.dataset.requestId = n.hospital_request.id;
        }

        if (index === 0) {
          item.classList.add('first');
        }

        if (n.type == 'emergency alert') {

              notifsList.addEventListener("click", async (event) => {
          
              const item = event.target.closest(".notification-item");

              if (!item) return;

              const notifId = item.dataset.id;
              const requestId = item.dataset.requestId;

              console.log("Clicked item with ID", notifId);

              const res = await fetch(`/notifications/mark-read/${notifId}/`, {
                method: "POST",
                headers: {
                    "X-CSRFToken": getCSRFToken(),
                },
              });

              console.log('📨 Response received, status:', res.status);

              window.location.href = `/donate-blood/?notif_id=${notifId}&request_id=${requestId}`;


            });
        }
        

        if (n.type == 'emergency alert') {
              item.innerHTML = `
                  <div class="item-header">
                      <svg style="fill: red; width: 1rem; height: 1rem;" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                        <path d="M1,24c-.552,0-1-.447-1-1V4C0,1.794,1.794,0,4,0H21.998c1.6-.055,2.604,1.958,1.598,3.203l-3.237,4.297,3.237,4.297c1.007,1.245,.003,3.258-1.598,3.203H2v8c0,.553-.448,1-1,1Z"/>
                      </svg>
                      <p class="header-label">Urgent blood request!</p>
                      ${!n.is_read ? '<div class="unread"></div>' : ''}
                  </div>

                  <div class="item-hospital">
                      <svg style="width: 1.25rem; height: 1.25rem;" viewBox="0 0 27 25">
                        <path d="m15.5 10c0 .551-.448 1-1 1h-1.5v1.5c0 .552-.449 1-1 1s-1-.448-1-1v-1.5h-1.5c-.551 0-1-.449-1-1s.449-1 1-1h1.5v-1.5c0-.551.449-1 1-1s1 .449 1 1v1.5h1.5c.552 0 1 .449 1 1zm6.554.054c0 2.537-1.934 6.49-5.747 11.751-.984 1.373-2.586 2.195-4.281 2.195-1.663.06-3.319-.781-4.341-2.204-3.808-5.254-5.741-9.206-5.741-11.742-.111-5.404 4.651-10.166 10.055-10.054 5.543 0 10.054 4.511 10.055 10.054zm-4.554-.054c0-1.497-1.102-2.74-2.536-2.964-.224-1.435-1.468-2.536-2.964-2.536s-2.74 1.101-2.964 2.536c-1.435.224-2.536 1.468-2.536 2.964s1.101 2.74 2.536 2.964c.224 1.434 1.468 2.536 2.964 2.536s2.74-1.102 2.964-2.536c1.435-.224 2.536-1.468 2.536-2.964z" />
                      </svg>
                      <p>${n.hospital_request.requester.profile.hospital_name}</p>
                  </div>

                  <div class="item-units">
                      <svg style="width: 1rem; height: 1rem;" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                        <path d="m5.5,10.489l-3.889,4.122c-1.039,1.039-1.611,2.42-1.611,3.889s.572,2.851,1.611,3.889c1.039,1.039,2.42,1.611,3.889,1.611s2.85-.572,3.889-1.611c2.145-2.145,2.145-5.634.02-7.758l-3.909-4.142Zm17.028-1.033l-3.528-3.45-3.535,3.458c-1.95,1.95-1.95,5.122,0,7.071.944.944,2.2,1.464,3.535,1.464s2.591-.52,3.536-1.464c1.949-1.95,1.949-5.122-.008-7.079ZM10,.405l-2.828,2.767c-.756.755-1.172,1.76-1.172,2.828s.416,2.073,1.171,2.828c.755.756,1.76,1.172,2.829,1.172s2.073-.416,2.829-1.172c1.56-1.56,1.56-4.097-.008-5.664L10,.405Z"/>
                      </svg>
                      <p>${n.hospital_request.quantity} units</p>
                  </div>
              `;
        } else if (n.type == 'request status') {
              item.innerHTML = `
                  <div class="item-header">
                      <p class="header-label">Your request has been ${n.user_request.status}</p>
                      ${!n.is_read ? '<div class="unread"></div>' : ''}
                  </div>

                  <div class="item-hospital">
                      <svg style="width: 1.25rem; height: 1.25rem;" viewBox="0 0 27 25">
                        <path d="m15.5 10c0 .551-.448 1-1 1h-1.5v1.5c0 .552-.449 1-1 1s-1-.448-1-1v-1.5h-1.5c-.551 0-1-.449-1-1s.449-1 1-1h1.5v-1.5c0-.551.449-1 1-1s1 .449 1 1v1.5h1.5c.552 0 1 .449 1 1zm6.554.054c0 2.537-1.934 6.49-5.747 11.751-.984 1.373-2.586 2.195-4.281 2.195-1.663.06-3.319-.781-4.341-2.204-3.808-5.254-5.741-9.206-5.741-11.742-.111-5.404 4.651-10.166 10.055-10.054 5.543 0 10.054 4.511 10.055 10.054zm-4.554-.054c0-1.497-1.102-2.74-2.536-2.964-.224-1.435-1.468-2.536-2.964-2.536s-2.74 1.101-2.964 2.536c-1.435.224-2.536 1.468-2.536 2.964s1.101 2.74 2.536 2.964c.224 1.434 1.468 2.536 2.964 2.536s2.74-1.102 2.964-2.536c1.435-.224 2.536-1.468 2.536-2.964z" />
                      </svg>
                      <p>${n.user_request.hospital.profile.hospital_name}</p>
                  </div>

                  <div class="item-units">
                      <svg style="width: 1rem; height: 1rem;" xmlns="http://www.w3.org/2000/svg" id="Layer_1" data-name="Layer 1" viewBox="0 0 24 24">
                        <path d="m5.5,10.489l-3.889,4.122c-1.039,1.039-1.611,2.42-1.611,3.889s.572,2.851,1.611,3.889c1.039,1.039,2.42,1.611,3.889,1.611s2.85-.572,3.889-1.611c2.145-2.145,2.145-5.634.02-7.758l-3.909-4.142Zm17.028-1.033l-3.528-3.45-3.535,3.458c-1.95,1.95-1.95,5.122,0,7.071.944.944,2.2,1.464,3.535,1.464s2.591-.52,3.536-1.464c1.949-1.95,1.949-5.122-.008-7.079ZM10,.405l-2.828,2.767c-.756.755-1.172,1.76-1.172,2.828s.416,2.073,1.171,2.828c.755.756,1.76,1.172,2.829,1.172s2.073-.416,2.829-1.172c1.56-1.56,1.56-4.097-.008-5.664L10,.405Z"/>
                      </svg>
                      <p>${n.user_request.quantity} units</p>
                  </div>
              `;
        } else if (n.type == 'appointment reminder') {
              item.innerHTML = `
                  <div class="item-header">
                      <p class="header-label">You have an appointment</p>
                      ${!n.is_read ? '<div class="unread"></div>' : ''}
                  </div>

                  <div class="item-days-left">
                      <svg style="width: 1rem; height: 1rem; margin-left: 0.1rem;" xmlns="http://www.w3.org/2000/svg" id="Layer_1" data-name="Layer 1" viewBox="0 0 24 24">
                        <path d="M12,0C5.383,0,0,5.383,0,12s5.383,12,12,12,12-5.383,12-12S18.617,0,12,0Zm4,13h-4c-.552,0-1-.447-1-1V6c0-.553,.448-1,1-1s1,.447,1,1v5h3c.553,0,1,.447,1,1s-.447,1-1,1Z"/>
                      </svg>
                      <p>${daysLeftText}</p>
                  </div>

                  <div class="item-hospital">
                      <svg style="width: 1.25rem; height: 1.25rem;" viewBox="0 0 27 25">
                        <path d="m15.5 10c0 .551-.448 1-1 1h-1.5v1.5c0 .552-.449 1-1 1s-1-.448-1-1v-1.5h-1.5c-.551 0-1-.449-1-1s.449-1 1-1h1.5v-1.5c0-.551.449-1 1-1s1 .449 1 1v1.5h1.5c.552 0 1 .449 1 1zm6.554.054c0 2.537-1.934 6.49-5.747 11.751-.984 1.373-2.586 2.195-4.281 2.195-1.663.06-3.319-.781-4.341-2.204-3.808-5.254-5.741-9.206-5.741-11.742-.111-5.404 4.651-10.166 10.055-10.054 5.543 0 10.054 4.511 10.055 10.054zm-4.554-.054c0-1.497-1.102-2.74-2.536-2.964-.224-1.435-1.468-2.536-2.964-2.536s-2.74 1.101-2.964 2.536c-1.435.224-2.536 1.468-2.536 2.964s1.101 2.74 2.536 2.964c.224 1.434 1.468 2.536 2.964 2.536s2.74-1.102 2.964-2.536c1.435-.224 2.536-1.468 2.536-2.964z" />
                      </svg>
                      <p>${n.appointment.request.requester.profile.hospital_name}</p>
                  </div>
              `;
        }
        
        notifsList.appendChild(item);
    });
  }


  function formatTimeLeft(daysLeft) {
    if (daysLeft == null) return "";

    let message = "";

    if (daysLeft >= 30) {
        const months = Math.floor(daysLeft / 30);
        message = months + (months === 1 ? " month" : " months");
    } else if (daysLeft >= 7) {
        const weeks = Math.floor(daysLeft / 7);
        message = weeks + (weeks === 1 ? " week" : " weeks");
    } else {
        message = daysLeft + (daysLeft === 1 ? " day" : " days");
    }

    return message + " from now";
  }



  function getCSRFToken() {
        const csrfToken = document.querySelector('meta[name="csrf-token"]');
        return csrfToken ? csrfToken.content : '';
    }


  
});
