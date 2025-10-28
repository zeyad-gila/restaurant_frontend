const categoryList = document.getElementById("category-list");
const form = document.getElementById("category-form");
const responseMsg = document.getElementById("response");

const API_URL = "http://127.0.0.1:8000"; // backend API base
const token = localStorage.getItem("access");

// Load all categories
async function loadCategories() {
  const res = await fetch(`${API_URL}/menu/categories/`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  categoryList.innerHTML = "";
  data.forEach((cat) => {
    const li = document.createElement("li");
    li.textContent = `${cat.id}. ${cat.name}`;
    li.style.cursor = "pointer";
    li.addEventListener("click", () => deleteCategory(cat.id));
    categoryList.appendChild(li);
  });
}

// ✅ Add a category (with detailed logging)
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

  let data;
  try {
    data = await res.json();
  } catch {
    data = {};
  }

  console.log("🔹 Response status:", res.status);
  console.log("🔹 Response body:", data);

  if (res.ok) {
    responseMsg.textContent = "✅ Category added!";
    form.reset();
    loadCategories();
  } else {
    responseMsg.textContent = `❌ Failed: ${res.status} — ${
      data.detail || JSON.stringify(data)
    }`;
  }
});

// Delete a category (on click)
async function deleteCategory(id) {
  if (!confirm("Delete this category?")) return;

  const res = await fetch(`${API_URL}/menu/categories/${id}/`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });

  if (res.ok) {
    loadCategories();
  } else {
    alert("Failed to delete (only vendors can delete)");
  }
}

// Initial load
loadCategories();
