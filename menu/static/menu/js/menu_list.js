const API_URL = "http://127.0.0.1:8000";
const token = localStorage.getItem("access");
const menuContainer = document.getElementById("menu-container");

// Bootstrap modal instances
let editModal, deleteModal;
document.addEventListener("DOMContentLoaded", () => {
  editModal = new bootstrap.Modal(document.getElementById("editModal"));
  deleteModal = new bootstrap.Modal(document.getElementById("deleteModal"));
});

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

async function loadMenuItems() {
  try {
    const user = await getCurrentUser();
    const isVendor = user?.is_staff || false;
    const userId = user?.id;
    const urlParams = new URLSearchParams(window.location.search);
    const categoryId = urlParams.get("category");
    const endpoint = categoryId
    ? `${API_URL}/menu/menu-items/?category=${categoryId}`
    : `${API_URL}/menu/menu-items/`;

    const res = await fetch(endpoint, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    console.log("Menu items loaded:", data);
    console.log("User ID:", userId, "Is Vendor:", isVendor);
    menuContainer.innerHTML = data
      .map((item) => {
        let buttons = '';
        if (isVendor && item.user === userId) {
          // Only show edit/delete if logged-in vendor owns the item
          buttons = `
            <button class="btn btn-warning btn-sm me-2 edit-btn" data-id="${item.id}">✏️ Edit</button>
            <button class="btn btn-danger btn-sm delete-btn" data-id="${item.id}">🗑️ Delete</button>
          `;
        } else if (!isVendor) {
          // Regular user: add to cart
          buttons = `
            <input type="number" class="form-control mb-2 quantity-input" min="1" value="1">
            <button class="btn btn-primary btn-sm addToCartBtn" data-id="${item.id}" data-vendor="${item.vendor}">
              🛒 Add to Cart
            </button>
          `;
        }

        return `
          <div class="col-md-4 col-sm-6">
            <div class="card h-100 shadow-sm" data-vendor="${item.vendor}">
              <img src="${item.image ? API_URL + item.image : '/static/menu/img/placeholder.png'}"
                   class="card-img-top" alt="${item.name}">
              <div class="card-body text-center">
                <h5>${item.name}</h5>
                <p class="text-muted">${item.description || ''}</p>
                <p class="fw-bold">${item.price} EGP</p>
                ${buttons}
              </div>
            </div>
          </div>
        `;
      })
      .join('');

    // Only attach events if the user owns items
    if (isVendor) attachEventListeners();
  } catch (error) {
    console.error("Error loading menu:", error);
  }
}
function attachEventListeners() {
  document.querySelectorAll(".edit-btn").forEach((btn) => {
    btn.addEventListener("click", () => openEditModal(btn.dataset.id));
  });

  document.querySelectorAll(".delete-btn").forEach((btn) => {
    btn.addEventListener("click", () => openDeleteModal(btn.dataset.id));
  });
}


//  Add to Cart Functionality 
menuContainer.addEventListener("click", async (e) => {
  if (e.target.classList.contains("addToCartBtn")) {
    const btn = e.target;
    const id = btn.dataset.id;
    const quantity = btn.closest(".card").querySelector(".quantity-input").value;
    const vendorId = btn.dataset.vendor;

    const response = await fetch(`${API_URL}/cart/cart-items/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify({
        menu_item_id: id,
        quantity: quantity,
        vendor_id: vendorId
      }),
    });

    if (response.ok) {
      alert("✅ Added to cart!");
    } else {
      const err = await response.json();
      console.error("Add to cart failed:", err);
      alert("❌ Failed to add item to cart.");
    }
  }
});


async function openEditModal(id) {
  const res = await fetch(`${API_URL}/menu/menu-items/${id}/`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const item = await res.json();

  document.getElementById("editItemId").value = id;
  document.getElementById("editName").value = item.name;
  document.getElementById("editPrice").value = item.price;
  document.getElementById("editDescription").value = item.description || "";

  editModal.show();
}

document.getElementById("saveEditBtn").addEventListener("click", async () => {
  const id = document.getElementById("editItemId").value;
  const formData = new FormData();
  formData.append("name", document.getElementById("editName").value);
  formData.append("price", document.getElementById("editPrice").value);
  formData.append("description", document.getElementById("editDescription").value);

  const res = await fetch(`${API_URL}/menu/menu-items/${id}/`, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });

  if (res.ok) {
    editModal.hide();
    loadMenuItems();
  } else {
    alert("❌ Failed to update item.");
  }
});

let deleteItemId = null;
function openDeleteModal(id) {
  deleteItemId = id;
  deleteModal.show();
}

document.getElementById("confirmDeleteBtn").addEventListener("click", async () => {
  if (!deleteItemId) return;

  const res = await fetch(`${API_URL}/menu/menu-items/${deleteItemId}/`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });

  if (res.ok) {
    deleteModal.hide();
    loadMenuItems();
  } else {
    alert("❌ Failed to delete item.");
  }
});

// Initialize
loadMenuItems();
