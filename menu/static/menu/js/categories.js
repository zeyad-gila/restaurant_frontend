console.log("✅ categories.js loaded");
const categoryList = document.getElementById("category-list");
const form = document.getElementById("category-form");
const responseMsg = document.getElementById("response");

const API_URL = "http://127.0.0.1:8000";
const token = localStorage.getItem("access");

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

    if (isVendor) {
      //  Vendor view (edit/delete buttons)
      li.innerHTML = `
        <span>${cat.name}</span>
        <div>
          <button class="btn btn-warning btn-sm me-2 edit-btn" data-id="${cat.id}" data-name="${cat.name}">✏️ Edit</button>
          <button class="btn btn-danger btn-sm delete-btn" data-id="${cat.id}">🗑️ Delete</button>
        </div>
      `;
    } else {
      // 👤 Regular user view (click to browse)
      li.innerHTML = `<span class="category-link" data-id="${cat.id}" style="cursor:pointer;">${cat.name}</span>`;
    }

    categoryList.appendChild(li);
  });

  // Add event listeners
  if (isVendor) {
    document.querySelectorAll(".edit-btn").forEach(btn => {
      btn.addEventListener("click", () => editCategory(btn.dataset.id, btn.dataset.name));
    });
    document.querySelectorAll(".delete-btn").forEach(btn => {
      btn.addEventListener("click", () => deleteCategory(btn.dataset.id));
    });
  } else {
    document.querySelectorAll(".category-link").forEach(link => {
      link.addEventListener("click", () => {
        const categoryId = link.dataset.id;
        window.location.href = `/menu/list/?category=${categoryId}`;
      });
    });
  }
}

// 🟡 Add or update category
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const name = document.getElementById("category-name").value;
  const categoryId = form.dataset.editingId;

  const method = categoryId ? "PUT" : "POST";
  const url = categoryId
    ? `${API_URL}/menu/categories/${categoryId}/`
    : `${API_URL}/menu/categories/`;

  const res = await fetch(url, {
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ name }),
  });

  if (res.ok) {
    responseMsg.textContent = categoryId
      ? "✅ Category updated!"
      : "✅ Category added!";
    form.reset();
    delete form.dataset.editingId;
    loadCategories();
  } else {
    const data = await res.json();
    responseMsg.textContent = `❌ Failed: ${JSON.stringify(data)}`;
  }
});

function editCategory(id, name) {
  document.getElementById("category-name").value = name;
  form.dataset.editingId = id;
  responseMsg.textContent = "✏️ Editing category...";
}

async function deleteCategory(id) {
  if (!confirm("Delete this category?")) return;

  const res = await fetch(`${API_URL}/menu/categories/${id}/`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });

  if (res.ok) {
    loadCategories();
  } else {
    alert("❌ Failed to delete category");
  }
}

loadCategories();
