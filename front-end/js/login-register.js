const container = document.getElementById("container");
const registerBtn = document.getElementById("register");
const loginBtn = document.getElementById("login");

registerBtn.addEventListener("click", () => {
  container.classList.add("active");
});

loginBtn.addEventListener("click", () => {
  container.classList.remove("active");
});
function handleBackHomeClick() {
  window.location.href = "welcome.html";
}

document
  .getElementById("registrationForm")
  .addEventListener("submit", async function (event) {
    event.preventDefault(); // Prevent the form from submitting

    const password = document.getElementById("registerPassword").value;
    const confirmPassword = document.getElementById(
      "registerConfirmPassword"
    ).value;
    const errorMessage = document.getElementById("errorMessage");

    const passwordField = document.getElementById("registerPassword");
    const confirmPasswordField = document.getElementById(
      "registerConfirmPassword"
    );
    const emailField = document.getElementById("registerEmail");
    const fullNameField = document.getElementById("registerFullName");

    if (password !== confirmPassword) {
      errorMessage.textContent = "Passwords do not match. Please try again.";
    } else {
      errorMessage.textContent = ""; // Clear any error messages

      // Proceed with form submission
      const email = document.getElementById("registerEmail").value;
      const fullName = document.getElementById("registerFullName").value;

      try {
        const response = await fetch(
          "https://sl36qhn5-3000.asse.devtunnels.ms/register",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password, fullName }),
          }
        );

        if (response.status === 409) {
          alert("This email is already in use. Please use a different email.");
          emailField.value = "";
          fullNameField.value = "";
          passwordField.value = "";
          confirmPasswordField.value = "";
        } else if (response.ok) {
          const result = await response.json();
          console.log(JSON.stringify(result));
          container.classList.remove("active");
          this.reset(); // Reset the form
        } else {
          errorMessage.textContent =
            "An unexpected error occurred. Please try again later.";
        }
      } catch (error) {
        console.error("Error during registration:", error);
        errorMessage.textContent =
          "There was a problem with the registration. Please try again.";
      }
    }
  });

document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.getElementById("loginEmail").value;
  const password = document.getElementById("loginPassword").value;

  const response = await fetch(
    "https://sl36qhn5-3000.asse.devtunnels.ms/login",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
      credentials: "include", // Ensures cookies (like JWT) are sent with the request
    }
  );

  const result = await response.json();
  console.log(JSON.stringify(result));
  //if status 401 display a alert that show you put incorrect pass
  if (response.status === 401) {
    alert("Incorrect password or email. Please try again.");
  } else {
    window.location.href = "chat.html"; // Redirect to the desired page
  }
});
