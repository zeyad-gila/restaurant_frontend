document.getElementById("verify-form").addEventListener("submit", async function(e) {
  e.preventDefault();
  const email = localStorage.getItem("userEmail");
  const otp = document.getElementById("otp").value;
  const responseTag = document.getElementById("response");

  try {
    const response = await fetch("http://127.0.0.1:8000/api/verify-otp/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, otp }),
    });
    const data = await response.json();

    if (response.ok) {
      responseTag.textContent = data.message || "Account verified successfully!";
      responseTag.style.color = "green";
      setTimeout(() => {
        window.location.href = "/login/"; 
      }, 2000);
    } else {
      responseTag.textContent = data.error || "Invalid OTP. Please try again.";
      responseTag.style.color = "red";
    }

  } catch (error) {
    responseTag.textContent = "Network error. Please try again later.";
    responseTag.style.color = "red";
  }
});
