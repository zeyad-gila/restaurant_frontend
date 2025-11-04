const API_URL = "http://127.0.0.1:8000";

document.addEventListener("DOMContentLoaded", async () => {
  const token = localStorage.getItem("access");
  const cartContainer = document.getElementById("cartItems");
  const totalTag = document.getElementById("totalPrice");
  const checkoutBtn = document.getElementById("checkoutBtn");

  async function loadCart() {
    const res = await fetch(`${API_URL}/cart/carts/`, {
      headers: { "Authorization": `Bearer ${token}` },
    });

    if (!res.ok) {
      cartContainer.innerHTML = "<p class='text-danger'>Failed to load cart.</p>";
      return;
    }

    const carts = await res.json();
    cartContainer.innerHTML = "";
    let total = 0;

    // Flatten all cart items (in case user has multiple vendor carts)
    carts.forEach(cart => {
      cart.items.forEach(item => {
        const subtotal = parseFloat(item.subtotal || 0);
        total += subtotal;

        cartContainer.innerHTML += `
          <div class="d-flex justify-content-between align-items-center mb-2 border-bottom pb-2" data-id="${item.id}">
            <span>${item.menu_item.name}</span>
            <input type="number" min="1" value="${item.quantity}" class="form-control quantity-input" style="width:70px;">
            <span class="subtotal">${subtotal.toFixed(2)} EGP</span>
            <button class="btn btn-sm btn-danger delete-item">🗑️</button>
          </div>`;
      });
    });

    totalTag.textContent = `${total.toFixed(2)} EGP`;

    if (total === 0) {
      cartContainer.innerHTML = "<p class='text-muted'>Your cart is empty 🛒</p>";
      checkoutBtn.disabled = true;
    } else {
      checkoutBtn.disabled = false;
    }
  }
// Handle quantity changes
cartContainer.addEventListener("change", async (e) => {
  if (e.target.classList.contains("quantity-input")) {
    const container = e.target.closest("div[data-id]");
    const itemId = container.dataset.id;
    const newQuantity = e.target.value;

    const res = await fetch(`${API_URL}/cart/cart-items/${itemId}/`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({ quantity: newQuantity })
    });

    if (res.ok) {
      await loadCart();
    } else {
      alert("Failed to update quantity");
    }
  }
});

// Handle delete
cartContainer.addEventListener("click", async (e) => {
  if (e.target.classList.contains("delete-item")) {
    const container = e.target.closest("div[data-id]");
    const itemId = container.dataset.id;

    const res = await fetch(`${API_URL}/cart/cart-items/${itemId}/`, {
      method: "DELETE",
      headers: { "Authorization": `Bearer ${token}` }
    });

    if (res.ok) {
      await loadCart();
    } else {
      alert("Failed to delete item");
    }
  }
});

checkoutBtn.addEventListener("click", async () => {
  const resCarts = await fetch(`${API_URL}/cart/carts/`, {
    headers: { "Authorization": `Bearer ${token}` },
  });
  const carts = await resCarts.json();
  const cartIds = carts.map(c => c.id);

  const res = await fetch(`${API_URL}/cart/orders/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
    body: JSON.stringify({
      carts: cartIds,
      full_name: "John Doe",
      address: "Cairo",
      city: "Cairo",
      phone: "0100000000",
      payment_method: "cash",
    }),
  });

  if (res.ok) {
    alert("🎉 Order placed successfully!");
    await loadCart();
  } else {
    const err = await res.json();
    console.error("Checkout failed:", err);
    alert("❌ Checkout failed. Check console for details.");
  }
});

  await loadCart();
});
