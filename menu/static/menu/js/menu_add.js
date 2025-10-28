const API_URL = "http://127.0.0.1:8000";
const token = localStorage.getItem("access");

function formatDateForBackend(date) {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const hours = String(d.getHours()).padStart(2, "0");
  const minutes = String(d.getMinutes()).padStart(2, "0");
  return `${year}-${month}-${day} ${hours}:${minutes}`;
}

const categorySelect = document.getElementById("category");
const form = document.getElementById("menu-item-form");
const responseMsg = document.getElementById("response");

// 🟢 Load categories
async function loadCategories() {
  const res = await fetch(`${API_URL}/menu/categories/`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();

  categorySelect.innerHTML = "";
  data.forEach(cat => {
    const option = document.createElement("option");
    option.value = cat.id;
    option.textContent = cat.name;
    categorySelect.appendChild(option);
  });
}

// 🟢 Handle form submit
form.addEventListener("submit", async e => {
  e.preventDefault();
  responseMsg.textContent = "⏳ Adding menu item...";

  // use FormData instead of JSON
  const formData = new FormData();
  formData.append("name", document.getElementById("name").value);
  formData.append("description", document.getElementById("description").value);
  formData.append("price", document.getElementById("price").value);
  formData.append("category_id", categorySelect.value); // ✅ correct key name

  // 🖼 Add image if uploaded
  const imageInput = document.getElementById("image");
  if (imageInput && imageInput.files.length > 0) {
    formData.append("image", imageInput.files[0]);
  }

  const res = await fetch(`${API_URL}/menu/menu-items/`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  const data = await res.json();

  if (!res.ok) {
    console.error("Response:", data);
    responseMsg.textContent = "❌ Failed to add menu item.";
    return;
  }

  const newItemId = data.id;
  responseMsg.textContent = "✅ Menu item added! Checking discount...";

  // 🟡 Handle discount
  const discountPercent = parseInt(document.getElementById("discount-percent").value);
  const discountDuration = parseInt(document.getElementById("discount-duration").value);
  const discountRepeat = document.getElementById("discount-repeat").value;

  if (discountPercent && discountPercent > 0) {
    const discountData = {
      menu_items: [newItemId],
      discount_percent: discountPercent,
      duration_days: discountDuration || 7,
      start_date: formatDateForBackend(new Date()),
      repeated_day: discountRepeat || null,
    };

    const discountRes = await fetch(`${API_URL}/menu/discount-items/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(discountData),
    });

    const discountResponse = await discountRes.json();
    if (discountRes.ok) {
      responseMsg.textContent = `✅ Item added with ${discountPercent}% discount!`;
    } else {
      console.warn("Discount creation failed:", discountResponse);
      responseMsg.textContent = "⚠️ Item added, but discount failed.";
    }
  } else {
    responseMsg.textContent = "✅ Item added successfully (no discount).";
  }

  form.reset();
});

loadCategories();
