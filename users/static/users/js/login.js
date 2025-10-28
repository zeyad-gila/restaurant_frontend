document.getElementById("login-form").addEventListener("submit", async function(e) {
  e.preventDefault();

  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const responseTag = document.getElementById("response");

  const response = await fetch("http://127.0.0.1:8000/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password })
  });

  const data = await response.json();
  if (response.ok) {
    localStorage.setItem("access", data.access);
    localStorage.setItem("refresh", data.refresh);
    window.location.href = "/menu/categories/";  
    responseTag.textContent = "Login successful!";
   
    console.log("sssss")
     
  } else {
    responseTag.textContent = data.error || JSON.stringify(data);
  }
});
