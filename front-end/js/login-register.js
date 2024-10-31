const container = document.getElementById("container");
const registerBtn = document.getElementById("register");
const loginBtn = document.getElementById("login");

registerBtn.addEventListener("click", () => {
  container.classList.add("active");
});

loginBtn.addEventListener("click", () => {
  container.classList.remove("active");
});

document
  .getElementById("registrationForm")
  .addEventListener("submit", async function (event) {
    event.preventDefault(); // Prevent the form from submitting

    const password = document.getElementById("registerPassword").value;
    const confirmPassword = document.getElementById(
      "registerConfirmPassword"
    ).value;
    const errorMessage = document.getElementById("errorMessage");

    if (password !== confirmPassword) {
      errorMessage.textContent = "Passwords do not match. Please try again.";
    } else {
      errorMessage.textContent = ""; // Clear any error messages
      // Here you can proceed with form submission, e.g., send the data via AJAX or another method

      event.preventDefault();
      const email = document.getElementById("registerEmail").value;
      const password = document.getElementById("registerPassword").value;
      const fullName = document.getElementById("registerFullName").value;

      const response = await fetch(
        "https://sl36qhn5-3000.asse.devtunnels.ms/register",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password, fullName }),
        }
      );

      const result = await response.json();
      console.log(JSON.stringify(result));
      container.classList.remove("active");

      // document.getElementById("registerResult").innerText =
      //   JSON.stringify(result); // For demonstration, we'll just reset the form:
      this.reset();
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
});
