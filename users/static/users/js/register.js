document.getElementById("register-form").addEventListener("submit", async function(e) {
  e.preventDefault();

  const username = document.getElementById("username").value;
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const password2 = document.getElementById("password2").value;
  const role = document.getElementById("role").value; // 👈 get dropdown value

  const responseTag = document.getElementById("response");

  const response = await fetch("http://127.0.0.1:8000/register/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      username,
      email,
      password,
      password2,
      role 
    })
  });

  const data = await response.json();
  if (response.ok) {
    responseTag.textContent = "Registration successful! Check your email for OTP.";
    console.log("Registration data:", data);
    localStorage.setItem("userEmail", email); // Store email for OTP verification
    window.location.href = "/verify-otp/";
  } else {
    responseTag.textContent = data.error || JSON.stringify(data);
  }
});
