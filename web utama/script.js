document.addEventListener("DOMContentLoaded", () => {

  const homePage = document.getElementById("homePage");
  const splitbillPage = document.getElementById("splitbillPage");
  const splitbillBtn = document.getElementById("splitbillBtn");
  const backBtn = document.querySelector(".back-btn");
  const patunganBtn = document.getElementById("patunganBtn");
  const resetBtn = document.getElementById("resetBtn");

  const koncoInput = document.getElementById("koncoInput");
  const pangananInput = document.getElementById("pangananInput");
  const dynamicFields = document.getElementById("dynamicFields");

  const generateBtn = document.getElementById("generateBtn");
  const calcBtn = document.getElementById("calcBtn");

  const strukList = document.getElementById("strukList");
  const userCards = document.getElementById("userCards");
  const finalTotal = document.getElementById("finalTotal");

  let foodsSplit = [];
  let usersSplit = [];
  let foodsPatungan = [];
  let usersPatungan = [];
  let activeUser = null;

  function cleanRupiah(str) {
    if (!str) return 0;
    return Number(String(str).replace(/[^0-9]/g, "")) || 0;
  }

  function hitungSubtotal(row) {
    const harga = cleanRupiah(row.querySelector(".foodPrice")?.value || "");
    const qty = Number(row.querySelector(".foodQty")?.value) || 0;
    const sub = harga * qty;
    const subEl = row.querySelector(".foodSubtotal");
    if (subEl) subEl.value = "Rp " + sub.toLocaleString("id-ID");
  }

  function resetData() {
    dynamicFields.innerHTML = "";
    strukList.innerHTML = "";
    userCards.innerHTML = "";
    finalTotal.innerText = "Rp 0";

    koncoInput.value = "";
    pangananInput.value = "";

    foodsSplit = [];
    usersSplit = [];
    foodsPatungan = [];
    usersPatungan = [];
    activeUser = null;

    resetBtn?.classList.remove("active");
  }

  patunganBtn?.addEventListener("click", () => {
    splitbillPage.dataset.mode = "patungan";
    homePage.classList.add("hide");
    splitbillPage.classList.remove("hide");
    resetData();
  });

  splitbillBtn?.addEventListener("click", () => {
    splitbillPage.dataset.mode = "splitbill";
    homePage.classList.add("hide");
    splitbillPage.classList.remove("hide");
    resetData();
  });

  backBtn?.addEventListener("click", () => {
    splitbillPage.classList.add("hide");
    homePage.classList.remove("hide");
    resetData();
  });

  resetBtn?.addEventListener("click", resetData);


  generateBtn?.addEventListener("click", () => {
    const foodCount = Number(pangananInput?.value) || 0;
    const userCount = Number(koncoInput?.value) || 0;

    if (foodCount <= 0) return alert("Isi jumlah makanan!");
    if (splitbillPage.dataset.mode === "splitbill" && userCount <= 0)
      return alert("Isi jumlah konco!");

    dynamicFields.innerHTML = "";
    strukList.innerHTML = "";
    userCards.innerHTML = "";
    finalTotal.innerText = "Rp 0";
    activeUser = null;

    const foods =
      splitbillPage.dataset.mode === "splitbill"
        ? foodsSplit
        : foodsPatungan;

    const users =
      splitbillPage.dataset.mode === "splitbill"
        ? usersSplit
        : usersPatungan;

    foods.length = 0;
    users.length = 0;

    for (let i = 0; i < foodCount; i++) {
      const row = document.createElement("div");
      row.className = "food-row";
      row.dataset.index = i;
      row.innerHTML = `
        <input type="text" placeholder="Nama pesenan" class="foodName">
        <input type="text" placeholder="Rp 0" class="foodPrice">
        <input type="number" min="0" placeholder="jumlahe" class="foodQty">
        <input type="text" placeholder="Subtotal" class="foodSubtotal" readonly>
      `;
      dynamicFields.appendChild(row);

      const price = row.querySelector(".foodPrice");
      const qty = row.querySelector(".foodQty");

      price.addEventListener("input", () => {
        let val = price.value.replace(/[^0-9]/g, "");
        price.value = val ? "Rp " + Number(val).toLocaleString("id-ID") : "";
        hitungSubtotal(row);
      });

      qty.addEventListener("input", () => hitungSubtotal(row));
    }

    if (splitbillPage.dataset.mode === "splitbill") {
      for (let u = 0; u < userCount; u++) {
        const card = document.createElement("div");
        card.className = "user-card";
        card.dataset.user = u;
        card.innerHTML = `
          <h4>User ${u + 1}</h4>
          <div class="user-food-list"></div>
          <div class="user-total">Total: <span class="total-value">Rp 0</span></div>
          <button class="calc-user">Itung</button>
        `;
        userCards.appendChild(card);
        users.push({ id: u, items: [], total: 0 });
      }
      aktifkanUserCards();
    } else {
      const card = document.createElement("div");
      card.className = "user-card";
      card.innerHTML = `
        <h4>Total Patungan</h4>
        <div class="user-total">Rp 0</div>
        <button class="calc-patungan">Itung</button>
      `;
      userCards.appendChild(card);

      card.querySelector(".calc-patungan").addEventListener("click", () => {
        const rows = document.querySelectorAll(".food-row");
        for (let r of rows) {
          const name = r.querySelector(".foodName").value.trim();
          const price = cleanRupiah(r.querySelector(".foodPrice").value);
          const qty = Number(r.querySelector(".foodQty").value) || 0;
          if (!name || price === 0 || qty === 0)
            return alert("Isi semua input makanan!");
        }

        foods.length = 0;
        rows.forEach((row, index) => {
          const name = row.querySelector(".foodName").value.trim();
          const price = cleanRupiah(row.querySelector(".foodPrice").value);
          const qty = Number(row.querySelector(".foodQty").value) || 0;
          foods.push({
            id: index,
            name,
            price,
            qty,
            left: qty,
            subtotal: price * qty,
          });
        });

        const total = foods.reduce((a, b) => a + b.subtotal, 0);
        const userCount = Number(koncoInput.value) || 1;
        const perUser = total / userCount;

        card.querySelector(".user-total").innerText =
          "Rp " + perUser.toLocaleString("id-ID");

      });
    }
  });

  calcBtn?.addEventListener("click", () => {
    const rows = document.querySelectorAll(".food-row");
    for (let r of rows) {
      const name = r.querySelector(".foodName").value.trim();
      const price = cleanRupiah(r.querySelector(".foodPrice").value);
      const qty = Number(r.querySelector(".foodQty").value) || 0;
      if (!name || price === 0 || qty === 0)
        return alert("Isi semua input makanan!");
    }

    const foods =
      splitbillPage.dataset.mode === "splitbill"
        ? foodsSplit
        : foodsPatungan;

    foods.length = 0;
    rows.forEach((row, index) => {
      const name = row.querySelector(".foodName").value.trim();
      const price = cleanRupiah(row.querySelector(".foodPrice").value);
      const qty = Number(row.querySelector(".foodQty").value) || 0;
      foods.push({
        id: index,
        name,
        price,
        qty,
        left: qty,
        subtotal: price * qty,
      });
    });

    tampilStruk();
    hitungFinalTotal();
  });

  function tampilStruk() {
    strukList.innerHTML = "";
    const foods =
      splitbillPage.dataset.mode === "splitbill"
        ? foodsSplit
        : foodsPatungan;

    foods.forEach((food) => {
      const div = document.createElement("div");
      div.className = "struk-row";
      div.dataset.id = food.id;
      const buttons =
        splitbillPage.dataset.mode === "splitbill"
          ? `<button class="plusBtn">+</button><button class="minusBtn">−</button>`
          : "";
      div.innerHTML = `<b>${food.name}</b> — Rp ${food.price.toLocaleString(
        "id-ID"
      )}<br>Qty: <span class="qty-left">${food.left}</span> ${buttons}<hr>`;
      strukList.appendChild(div);
    });

    aktifkanStrukButtons();
  }

  function aktifkanStrukButtons() {
    if (splitbillPage.dataset.mode !== "splitbill") return;

    document.querySelectorAll(".plusBtn").forEach((btn) => {
      btn.onclick = () => {
        if (activeUser === null) return alert("Pilih user dulu!");
        const row = btn.closest(".struk-row");
        const item = foodsSplit[Number(row.dataset.id)];
        if (item.left <= 0) return;
        item.left--;
        tambahKeUser(activeUser, item);
        row.querySelector(".qty-left").textContent = item.left;
      };
    });

    document.querySelectorAll(".minusBtn").forEach((btn) => {
      btn.onclick = () => {
        if (activeUser === null) return;
        const row = btn.closest(".struk-row");
        const item = foodsSplit[Number(row.dataset.id)];
        if (!kurangDariUser(activeUser, item.id)) return;
        item.left++;
        row.querySelector(".qty-left").textContent = item.left;
      };
    });
  }

  function tambahKeUser(uid, item) {
    const user = usersSplit[uid];
    let exist = user.items.find((i) => i.id === item.id);
    if (exist) exist.qty++;
    else user.items.push({ id: item.id, name: item.name, price: item.price, qty: 1 });
    updateUserPreview(uid);
  }

  function kurangDariUser(uid, id) {
    const user = usersSplit[uid];
    let exist = user.items.find((i) => i.id === id);
    if (!exist) return false;
    exist.qty--;
    if (exist.qty <= 0) user.items = user.items.filter((i) => i.id !== id);
    updateUserPreview(uid);
    return true;
  }

  function updateUserPreview(uid) {
    const card = document.querySelector(`.user-card[data-user="${uid}"]`);
    const list = card.querySelector(".user-food-list");
    list.innerHTML = "";
    usersSplit[uid].items.forEach((i) => {
      list.innerHTML += `<div>${i.name} x${i.qty}</div>`;
    });
  }

  function updateUserTotal(uid) {
    const card = document.querySelector(`.user-card[data-user="${uid}"]`);
    const total = usersSplit[uid].items.reduce(
      (a, i) => a + i.qty * i.price,
      0
    );
    card.querySelector(".total-value").textContent =
      "Rp " + total.toLocaleString("id-ID");
  }

  function hitungFinalTotal() {
    const foods =
      splitbillPage.dataset.mode === "splitbill"
        ? foodsSplit
        : foodsPatungan;
    const total = foods.reduce((a, b) => a + b.subtotal, 0);
    finalTotal.innerText = "Rp " + total.toLocaleString("id-ID");
  }

  function aktifkanUserCards() {
    document.querySelectorAll(".user-card").forEach((card) => {
      card.onclick = () => {
        activeUser = Number(card.dataset.user);
        document.querySelectorAll(".user-card").forEach((c) =>
          c.classList.remove("active")
        );
        card.classList.add("active");
      };

      card.querySelector(".calc-user").onclick = (e) => {
        e.stopPropagation();
        const idx = Number(card.dataset.user);
        updateUserTotal(idx);
        card.classList.remove("active");
        const next = document.querySelector(
          `.user-card[data-user="${idx + 1}"]`
        );
        if (next) next.classList.add("active");
        activeUser =
          idx + 1 < usersSplit.length ? idx + 1 : null;
      };
    });
  }

  resetData();
});
