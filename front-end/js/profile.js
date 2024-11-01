document.addEventListener("DOMContentLoaded", function () {
  // Elements
  const profileImage = document.getElementById("profileImage");
  const imagePicker = document.getElementById("imagePicker");
  const imageGrid = document.getElementById("imageGrid");
  const uploadCustomBtn = document.getElementById("uploadCustomBtn");

  const passwordInput = document.getElementById("password");
  const profileForm = document.getElementById("profileForm");
  const logoutBtn = document.getElementById("logoutBtn");
  const notification = document.getElementById("notification");
  const editProfileBtn = document.getElementById("editProfileBtn");
  const nameField = document.getElementById("fullName");
  const emailField = document.getElementById("email");
  const passwordField = document.getElementById("password");
  const confirmPasswordField = document.getElementById("confirmPassword");
  const passwordFields = document.getElementById("passwordFields");
  const exportBtn = document.getElementById("exportBtn");

  let isEditing = false;

  fetch("https://sl36qhn5-3000.asse.devtunnels.ms/users/profile", {
    method: "GET",
    headers: { "Content-Type": "application/json" },
    credentials: "include", // Ensures cookies are sent with the request
  })
    .then((response) => {
      if (response.status===401) {
        window.location.href = "login-register.html"; // Redirect to the URL provided in the response
        return;
      }
      if (!response.ok) {
        throw new Error("Failed to fetch profile data");
      }
      return response.json();
    })
    .then((data) => {
      // Assuming API response is { name: "User Name", email: "user@example.com" }
      document.getElementById("fullName").value = data.fullName;
      document.getElementById("email").value = data.email;
    })
    .catch((error) => {
      console.error("Error:", error);
      // Optionally, display a notification to the user if there's an error
      document.getElementById("notificationMessage").textContent =
        "Error fetching profile data";
      document.getElementById("notification").style.display = "block";
    });

  editProfileBtn.addEventListener("click", function () {
    if (!isEditing) {
      // Enable editing mode
      nameField.disabled = false;
      passwordFields.style.display = "block";
      editProfileBtn.innerHTML =
        '<span class="material-icons">save</span> Save Profile';
    } else {
      console.log("passs", passwordField.value);

      // Check if passwords match
      if (passwordField.value !== confirmPasswordField.value) {
        alert("Passwords do not match. Please confirm the password again.");
        return; // Exit without saving
      }

      const updatedData = {
        fullName: document.getElementById("fullName").value,
      };

      // Only include password if the field is not empty
      const password = document.getElementById("password").value;
      if (password) {
        updatedData.password = password;
      }

      // Send POST request with updated data
      fetch("https://sl36qhn5-3000.asse.devtunnels.ms/users/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // Ensures cookies are sent with the request
        body: JSON.stringify(updatedData), // Send the updated profile data in JSON format
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error("Failed to update profile");
          }
          return response.json();
        })
        .then((data) => {
          // Notify the user of a successful update
          document.getElementById("notificationMessage").textContent =
            "Profile updated successfully!";
          document.getElementById("notification").style.display = "block";
        })
        .catch((error) => {
          console.error("Error:", error);
          // Display an error notification to the user
          document.getElementById("notificationMessage").textContent =
            "Error updating profile";
          document.getElementById("notification").style.display = "block";
        });

      // Save the changes and disable editing
      nameField.disabled = true;
      passwordFields.style.display = "none";
      editProfileBtn.innerHTML =
        '<span class="material-icons">edit</span> Edit Profile';
    }
    isEditing = !isEditing;
  });
  exportBtn.addEventListener("click", function () {
    // Create JSON data
    const profileData = {
      name: nameField.value,
      email: emailField.value,
    };

    // Convert data to JSON and create a downloadable file
    const dataStr =
      "data:text/json;charset=utf-8," +
      encodeURIComponent(JSON.stringify(profileData, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", "profile_data.json");
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    document.body.removeChild(downloadAnchor);
  });

  // Update profile image
  function updateProfileImage(src) {
    profileImage.src = src;
    closeModal();
    showNotification("Profile picture updated successfully!");
  }

  // Modal functions
  function openModal() {
    imagePicker.style.display = "flex";
  }

  function closeModal() {
    imagePicker.style.display = "none";
  }

  // Show notification
  function showNotification(message) {
    notification.textContent = message;
    notification.style.display = "block";
    setTimeout(() => {
      notification.style.display = "none";
    }, 3000);
  }

  // Form submission
  profileForm.addEventListener("submit", (e) => {
    e.preventDefault();
    // Add your form submission logic here
    showNotification("Profile updated successfully!");
  });
  // Initialize
});

document.getElementById("exportBtn").addEventListener("click", function () {
  const userResponse = confirm("Are you sure you want to export?");

  if (userResponse) {
    alert("You chose Yes.");
    // Add your export logic here
  } else {
    alert("You chose No.");
  }
});

document.getElementById("logOutBtn").addEventListener("click", function () {
  // Clear the JWT cookie
  fetch("https://sl36qhn5-3000.asse.devtunnels.ms/logout", {
    method: "post",
    headers: { "Content-Type": "application/json" },
    credentials: "include", // Ensures cookies are sent with the request
  })
    .then((response) => {
      if (response.ok) {
        window.location.href = "login-register.html"; // Redirect after logout
      } else {
        console.error("Logout failed:", response.statusText);
      }
    })
    .catch((error) => {
      console.error("Error:", error);
    });
  console.log("Logout button clicked");
  // Optionally, redirect the user or update the UI
});
