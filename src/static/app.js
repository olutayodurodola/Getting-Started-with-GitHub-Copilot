document.addEventListener("DOMContentLoaded", () => {
  const activitiesList = document.getElementById("activities-list");
  const activitySelect = document.getElementById("activity");
  const signupForm = document.getElementById("signup-form");
  const messageDiv = document.getElementById("message");

  // Function to fetch activities from API
  async function fetchActivities() {
    try {
      const response = await fetch("/activities");
      const activities = await response.json();

      // Clear loading message
      activitiesList.innerHTML = "";

      // Populate activities list
      Object.entries(activities).forEach(([name, details]) => {
        const activityCard = document.createElement("div");
        activityCard.className = "activity-card";

        const spotsLeft = details.max_participants - details.participants.length;

        // Create participants list
        const participantsList = details.participants
          .map(
            (participant) => `
              <li>
                <span>${participant}</span>
                <button class="delete-participant" data-activity="${name}" data-participant="${participant}">❌</button>
              </li>
            `
          )
          .join("");

        activityCard.innerHTML = `
          <h4>${name}</h4>
          <p>${details.description}</p>
          <p><strong>Schedule:</strong> ${details.schedule}</p>
          <p><strong>Availability:</strong> ${spotsLeft} spots left</p>
          <p><strong>Participants:</strong></p>
          <ul class="participants-list">
            ${participantsList || "<li>No participants yet</li>"}
          </ul>
        `;

        activitiesList.appendChild(activityCard);

        // Add option to select dropdown
        const option = document.createElement("option");
        option.value = name;
        option.textContent = name;
        activitySelect.appendChild(option);
      });

      // Add event listeners for delete buttons
      document.querySelectorAll(".delete-participant").forEach((button) => {
        button.addEventListener("click", async (event) => {
          const activity = event.target.dataset.activity;
          const participant = event.target.dataset.participant;

          try {
            const response = await fetch(`/activities/${activity}/unregister`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ email: participant }),
            });

            if (response.ok) {
              fetchActivities(); // Refresh the activities list
            } else {
              const error = await response.json();
              console.error("Error unregistering participant:", error);
            }
          } catch (error) {
            console.error("Error unregistering participant:", error);
          }
        });
      });
    } catch (error) {
      activitiesList.innerHTML = "<p>Failed to load activities. Please try again later.</p>";
      console.error("Error fetching activities:", error);
    }
  }

  // Handle form submission
  signupForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const formData = new FormData(signupForm);
    const activity = formData.get("activity");
    const email = formData.get("email");

    try {
      const response = await fetch(`/activities/${activity}/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        messageDiv.textContent = `Successfully signed up for ${activity}!`;
        messageDiv.style.color = "green";
        fetchActivities(); // Refresh the activities list dynamically
      } else {
        const error = await response.json();
        messageDiv.textContent = error.detail || "Failed to sign up.";
        messageDiv.style.color = "red";
      }
    } catch (error) {
      console.error("Error signing up:", error);
      messageDiv.textContent = "An error occurred. Please try again later.";
      messageDiv.style.color = "red";
    }
  });

  // Initialize app
  fetchActivities();
});
