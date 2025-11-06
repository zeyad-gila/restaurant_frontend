console.log("✅ categories.js loaded");

const categoryList = document.getElementById("category-list");
const form = document.getElementById("category-form");
const responseMsg = document.getElementById("response");

const API_URL = "http://127.0.0.1:8000";
const token = localStorage.getItem("access");

// 🟢 Get current user (to check if vendor or not)
async function getCurrentUser() {
  try {
    const res = await fetch(`${API_URL}/me/`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error("Unauthorized");
    return await res.json();
  } catch {
    return null;
  }
}

// 🟢 Load all categories
async function loadCategories() {
  const user = await getCurrentUser();
  const isVendor = user?.is_staff || false;
  console.log("Current User:", user);

  const res = await fetch(`${API_URL}/menu/categories/`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  const data = await res.json();
  categoryList.innerHTML = "";

  data.forEach((cat) => {
    const li = document.createElement("li");
    li.classList.add("list-group-item", "d-flex", "justify-content-between", "align-items-center");

    // Both vendors and users just see the category name (clickable)
    li.innerHTML = `
      <span class="category-link" data-id="${cat.id}" style="cursor:pointer;">
        ${cat.name}
      </span>
    `;

    categoryList.appendChild(li);
  });

  // 🟡 Make categories clickable (to view menu items)
  document.querySelectorAll(".category-link").forEach(link => {
    link.addEventListener("click", () => {
      const categoryId = link.dataset.id;
      window.location.href = `/menu/list/?category=${categoryId}`;
    });
  });
}

// 🟢 Add new category (vendor only)
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const name = document.getElementById("category-name").value;

  const res = await fetch(`${API_URL}/menu/categories/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ name }),
  });

  if (res.ok) {
    responseMsg.textContent = "✅ Category added!";
    form.reset();
    loadCategories();
  } else {
    const data = await res.json();
    console.error("❌ Failed:", data);
    responseMsg.textContent = `❌ Failed: ${JSON.stringify(data)}`;
  }
});

loadCategories();
