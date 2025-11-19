document.addEventListener("DOMContentLoaded", () => {

  const homePage = document.getElementById("homePage");
  const splitbillPage = document.getElementById("splitbillPage");
  const splitbillBtn = document.getElementById("splitbillBtn");
  const backBtn = document.querySelector(".back-btn");

  const koncoInput = document.getElementById("koncoInput");
  const pangananInput = document.getElementById("pangananInput");
  const dynamicFields = document.getElementById("dynamicFields");

  const generateBtn = document.getElementById("generateBtn");
  const calcBtn = document.getElementById("calcBtn");

  const strukList = document.getElementById("strukList");
  const userCards = document.getElementById("userCards");
  const finalTotal = document.getElementById("finalTotal");

  let foods = [];
  let users = [];
  let activeUser = null;

  /* ===========================
      PINDAH HALAMAN
  ============================*/
  splitbillBtn.addEventListener("click", () => {
    homePage.classList.add("hide");
    splitbillPage.classList.remove("hide");
  });

  backBtn.addEventListener("click", () => {
    splitbillPage.classList.add("hide");
    homePage.classList.remove("hide");
  });

  /* ===========================
      FORMAT RUPIAH BERSIH
  ============================*/
  function cleanRupiah(str) {
    return Number(str.replace(/[^0-9]/g, "")) || 0;
  }

  /* ===========================
      HITUNG SUBTOTAL
  ============================*/
  function hitungSubtotal(row) {
    const harga = cleanRupiah(row.querySelector(".foodPrice").value);
    const qty = Number(row.querySelector(".foodQty").value) || 0;
    const subtotal = harga * qty;
    row.querySelector(".foodSubtotal").value = "Rp " + subtotal.toLocaleString("id-ID");
  }

  /* ===========================
      GENERATE INPUT MAKANAN
  ============================*/
  generateBtn.onclick = () => {
    const foodCount = Number(pangananInput.value) || 0;
    const userCount = Number(koncoInput.value) || 0;

    if (foodCount <= 0 || userCount <= 0) {
      alert("Isi jumlah pesenan dan jumlah konco dulu (minimal 1).");
      return;
    }

    dynamicFields.innerHTML = "";
    strukList.innerHTML = "";
    userCards.innerHTML = "";
    finalTotal.innerText = "Rp 0";

    foods = [];
    users = [];
    activeUser = null;

    /* INPUT MAKANAN */
    for (let i = 0; i < foodCount; i++) {
      const row = document.createElement("div");
      row.className = "food-row";
      row.dataset.index = i;

      row.innerHTML = `
        <input type="text" placeholder="Nama pesenan" class="foodName">
        <input type="text" placeholder="Rp 0" class="foodPrice">
        <input type="number" min="0" placeholder="Qty" class="foodQty">
        <input type="text" placeholder="Subtotal" class="foodSubtotal" readonly>
      `;

      dynamicFields.appendChild(row);

      const price = row.querySelector(".foodPrice");
      const qty = row.querySelector(".foodQty");

      price.addEventListener("input", () => {
        let angka = price.value.replace(/\D/g, "");
        price.value = angka === "" ? "" : "Rp " + Number(angka).toLocaleString("id-ID");
        hitungSubtotal(row);
      });

      qty.addEventListener("input", () => {
        hitungSubtotal(row);
      });
    }

    /* BUAT USER CARD */
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

      users.push({
        id: u,
        items: [],
        total: 0,
        locked: false
      });
    }

    aktifkanUserCards();
  };

  /* ===========================
      TOMBOL ITUNG UTAMA
  ============================*/
  calcBtn.onclick = () => {
    foods = [];

    document.querySelectorAll(".food-row").forEach((row, index) => {
      const name = row.querySelector(".foodName").value.trim();
      const price = cleanRupiah(row.querySelector(".foodPrice").value);
      const qty = Number(row.querySelector(".foodQty").value) || 0;

      if (!name || price === 0 || qty === 0) return;

      foods.push({
        id: index,
        name,
        price,
        qty,
        left: qty,
        subtotal: price * qty
      });
    });

    tampilStruk();

    const total = foods.reduce((a, b) => a + b.subtotal, 0);
    finalTotal.innerText = "Rp " + total.toLocaleString("id-ID");
  };

  /* ===========================
      TAMPILKAN STRUK
  ============================*/
  function tampilStruk() {
    strukList.innerHTML = "";

    foods.forEach(food => {
      const div = document.createElement("div");
      div.className = "struk-row";
      div.dataset.id = food.id;

      div.innerHTML = `
        <b>${food.name}</b> — Rp ${food.price.toLocaleString("id-ID")}
        <br>Qty: <span class="qty-left">${food.left}</span>
        <button class="plusBtn">+</button>
        <button class="minusBtn">−</button>
        <hr>
      `;

      strukList.appendChild(div);
    });

    aktifkanStrukButtons();
  }

  /* ===========================
      AKTIFKAN USER CARD
  ============================*/
  function aktifkanUserCards() {
    document.querySelectorAll(".user-card").forEach(card => {

      // pilih user
      card.addEventListener("click", () => {
        const id = Number(card.dataset.user);
        if (users[id].locked) return;

        activeUser = id;
        document.querySelectorAll(".user-card").forEach(c => c.classList.remove("active"));
        card.classList.add("active");
      });

      // tombol itung user
      card.querySelector(".calc-user").addEventListener("click", (e) => {
        e.stopPropagation();
        const id = Number(card.dataset.user);

        /* HITUNG TOTAL USER */
        const totalSpan = card.querySelector(".total-value");
        let total = 0;

        users[id].items.forEach(i => total += i.qty * i.price);
        users[id].total = total;
        totalSpan.textContent = "Rp " + total.toLocaleString("id-ID");

        /* KUNCI USER */
        users[id].locked = true;
        card.classList.add("locked");
        card.classList.remove("active");

        /* PINDAH KE USER BERIKUTNYA */
        const next = document.querySelector(`.user-card[data-user="${id + 1}"]`);
        if (next) next.classList.add("active");

        activeUser = id + 1;
      });
    });
  }

  /* ===========================
      TOMBOL + DAN –
  ============================*/
  function aktifkanStrukButtons() {
    document.querySelectorAll(".plusBtn").forEach(btn => {
      btn.addEventListener("click", () => {
        if (activeUser === null) return alert("Pilih user dulu!");

        const row = btn.closest(".struk-row");
        const id = Number(row.dataset.id);
        const item = foods[id];

        if (item.left <= 0) return;

        item.left--;
        row.querySelector(".qty-left").textContent = item.left;

        tambahKeUser(activeUser, item);
      });
    });

    document.querySelectorAll(".minusBtn").forEach(btn => {
      btn.addEventListener("click", () => {
        if (activeUser === null) return;

        const row = btn.closest(".struk-row");
        const id = Number(row.dataset.id);
        const item = foods[id];

        const ok = kurangDariUser(activeUser, item.id);
        if (!ok) return;

        item.left++;
        row.querySelector(".qty-left").textContent = item.left;
      });
    });
  }

  /* ===========================
      USER AMBIL ITEM
  ============================*/
  function tambahKeUser(uid, item) {
    const user = users[uid];
    let exist = user.items.find(i => i.id === item.id);

    if (exist) exist.qty++;
    else user.items.push({ id: item.id, name: item.name, price: item.price, qty: 1 });

    updateUserPreview(uid);
  }

  /* ===========================
      USER BATALKAN ITEM
  ============================*/
  function kurangDariUser(uid, foodId) {
    const user = users[uid];
    let exist = user.items.find(i => i.id === foodId);
    if (!exist) return false;

    exist.qty--;
    if (exist.qty <= 0)
      user.items = user.items.filter(i => i.id !== foodId);

    updateUserPreview(uid);
    return true;
  }

  /* ===========================
      UPDATE PREVIEW USER
  ============================*/
  function updateUserPreview(uid) {
    const card = document.querySelector(`.user-card[data-user="${uid}"]`);
    const list = card.querySelector(".user-food-list");

    list.innerHTML = "";
    users[uid].items.forEach(item => {
      list.innerHTML += `<div>${item.name} x${item.qty}</div>`;
    });
  }

  // TOMBOL DISKON → TAMPILKAN INPUT
document.getElementById("btnDiskon").addEventListener("click", () => {
  document.getElementById("diskonBox").classList.toggle("hide");
});

// TOMBOL PAJAK → TAMPILKAN INPUT
document.getElementById("btnPajak").addEventListener("click", () => {
  document.getElementById("pajakBox").classList.toggle("hide");
});


});
