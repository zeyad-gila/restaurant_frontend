const API_URL = "http://127.0.0.1:8000";
const token = localStorage.getItem("access");
const menuContainer = document.getElementById("menu-container");

async function loadMenuItems() {
  try {
    const res = await fetch(`${API_URL}/menu/menu-items/`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await res.json();

    if (!res.ok) {
      console.error("Error loading menu:", data);
      menuContainer.innerHTML = `<p class="text-danger text-center">Failed to load menu items.</p>`;
      return;
    }

    if (data.length === 0) {
      menuContainer.innerHTML = `<p class="text-muted text-center">No items available yet.</p>`;
      return;
    }

    // Render items
    menuContainer.innerHTML = data.map(item => `
      <div class="col-md-4 col-sm-6">
        <div class="card h-100 shadow-sm">
          <img src="${item.image ? API_URL + item.image : '/static/menu/img/placeholder.png'}" 
               class="card-img-top" alt="${item.name}">
          <div class="card-body text-center">
            <h5 class="card-title">${item.name}</h5>
            <p class="card-text text-muted">${item.description || ''}</p>
            <p class="fw-bold">$${item.price}</p>
          </div>
        </div>
      </div>
    `).join("");
  } catch (error) {
    console.error("Fetch error:", error);
    menuContainer.innerHTML = `<p class="text-danger text-center">Error loading items.</p>`;
  }
}

loadMenuItems();
