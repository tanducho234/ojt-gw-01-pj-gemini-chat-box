document.addEventListener('DOMContentLoaded', function() {
  // Elements
  const profileImage = document.getElementById('profileImage');
  const imagePicker = document.getElementById('imagePicker');
  const imageGrid = document.getElementById('imageGrid');
  const openImagePickerBtn = document.getElementById('openImagePicker');
  const closeImagePickerBtn = document.getElementById('closeImagePicker');
  const uploadCustomBtn = document.getElementById('uploadCustomBtn');
  const imageUpload = document.getElementById('imageUpload');
  const togglePasswordBtn = document.getElementById('togglePassword');
  const passwordInput = document.getElementById('password');
  const profileForm = document.getElementById('profileForm');
  const logoutBtn = document.getElementById('logoutBtn');
  const notification = document.getElementById('notification');
  const editProfileBtn = document.getElementById("editProfileBtn");
  const nameField = document.getElementById("name");
  const emailField = document.getElementById("email");
  const passwordField = document.getElementById("password");
  const confirmPasswordField = document.getElementById("confirmPassword");
  const passwordFields = document.getElementById("passwordFields");
  const exportBtn = document.getElementById("exportBtn");

  let isEditing = false;

  editProfileBtn.addEventListener("click", function () {
    if (!isEditing) {
        // Enable editing mode
        nameField.disabled = false;
        passwordFields.style.display = "block";
        editProfileBtn.innerHTML = '<span class="material-icons">save</span> Save Profile';
    } else {
        // Check if passwords match
        if (passwordField.value !== confirmPasswordField.value) {
            alert("Passwords do not match. Please confirm the password again.");
            return; // Exit without saving
        }

        // Save the changes and disable editing
        nameField.disabled = true;
        passwordFields.style.display = "none";
        editProfileBtn.innerHTML = '<span class="material-icons">edit</span> Edit Profile';
    }
    isEditing = !isEditing;
});
exportBtn.addEventListener("click", function () {
    // Create JSON data
    const profileData = {
        name: nameField.value,
        email: emailField.value
    };

    // Convert data to JSON and create a downloadable file
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(profileData, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", "profile_data.json");
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    document.body.removeChild(downloadAnchor);
});


  // Initialize image grid
  function initializeImageGrid() {
      defaultImages.forEach(imgSrc => {
          const img = document.createElement('img');
          img.src = imgSrc;
          img.alt = 'Profile option';
          img.addEventListener('click', () => updateProfileImage(imgSrc));
          imageGrid.appendChild(img);
      });
  }

  // Update profile image
  function updateProfileImage(src) {
      profileImage.src = src;
      closeModal();
      showNotification('Profile picture updated successfully!');
  }

  // Modal functions
  function openModal() {
      imagePicker.style.display = 'flex';
  }

  function closeModal() {
      imagePicker.style.display = 'none';
  }

  // Show notification
  function showNotification(message) {
      notification.textContent = message;
      notification.style.display = 'block';
      setTimeout(() => {
          notification.style.display = 'none';
      }, 3000);
  }

  // Event Listeners
  openImagePickerBtn.addEventListener('click', openModal);
  closeImagePickerBtn.addEventListener('click', closeModal);

  // Custom image upload
  uploadCustomBtn.addEventListener('click', () => {
      imageUpload.click();
  });

  imageUpload.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
          const reader = new FileReader();
          reader.onload = (e) => updateProfileImage(e.target.result);
          reader.readAsDataURL(file);
      }
  });

  // Toggle password visibility
  togglePasswordBtn.addEventListener('click', () => {
      const type = passwordInput.type === 'password' ? 'text' : 'password';
      passwordInput.type = type;
      togglePasswordBtn.innerHTML = `<span class="material-icons">${type === 'password' ? 'visibility' : 'visibility_off'}</span>`;
  });

  // Form submission
  profileForm.addEventListener('submit', (e) => {
      e.preventDefault();
      // Add your form submission logic here
      showNotification('Profile updated successfully!');
  });

  // Close modal when clicking outside
  imagePicker.addEventListener('click', (e) => {
      if (e.target === imagePicker) {
          closeModal();
      }
  });

  // Initialize
  initializeImageGrid();
});

document.getElementById('exportBtn').addEventListener('click', function() {
  const userResponse = confirm("Are you sure you want to export?");
  
  if (userResponse) {
    alert("You chose Yes.");
    // Add your export logic here
  } else {
    alert("You chose No.");
  }
});

