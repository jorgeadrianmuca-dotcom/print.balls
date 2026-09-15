const PRODUCT_PRICE = 9990;
const WHATSAPP_NUMBER = ""; // Agrega aquí el número con código de país, por ejemplo: 56912345678
const PAGE_SIZE = 24;

const pokemonNames = [
  "Bulbasaur","Ivysaur","Venusaur","Charmander","Charmeleon","Charizard","Squirtle","Wartortle","Blastoise","Caterpie","Metapod","Butterfree","Weedle","Kakuna","Beedrill","Pidgey","Pidgeotto","Pidgeot","Rattata","Raticate","Spearow","Fearow","Ekans","Arbok","Pikachu","Raichu","Sandshrew","Sandslash","Nidoran♀","Nidorina","Nidoqueen","Nidoran♂","Nidorino","Nidoking","Clefairy","Clefable","Vulpix","Ninetales","Jigglypuff","Wigglytuff","Zubat","Golbat","Oddish","Gloom","Vileplume","Paras","Parasect","Venonat","Venomoth","Diglett","Dugtrio","Meowth","Persian","Psyduck","Golduck","Mankey","Primeape","Growlithe","Arcanine","Poliwag","Poliwhirl","Poliwrath","Abra","Kadabra","Alakazam","Machop","Machoke","Machamp","Bellsprout","Weepinbell","Victreebel","Tentacool","Tentacruel","Geodude","Graveler","Golem","Ponyta","Rapidash","Slowpoke","Slowbro","Magnemite","Magneton","Farfetch'd","Doduo","Dodrio","Seel","Dewgong","Grimer","Muk","Shellder","Cloyster","Gastly","Haunter","Gengar","Onix","Drowzee","Hypno","Krabby","Kingler","Voltorb","Electrode","Exeggcute","Exeggutor","Cubone","Marowak","Hitmonlee","Hitmonchan","Lickitung","Koffing","Weezing","Rhyhorn","Rhydon","Chansey","Tangela","Kangaskhan","Horsea","Seadra","Goldeen","Seaking","Staryu","Starmie","Mr. Mime","Scyther","Jynx","Electabuzz","Magmar","Pinsir","Tauros","Magikarp","Gyarados","Lapras","Ditto","Eevee","Vaporeon","Jolteon","Flareon","Porygon","Omanyte","Omastar","Kabuto","Kabutops","Aerodactyl","Snorlax","Articuno","Zapdos","Moltres","Dratini","Dragonair","Dragonite","Mewtwo","Mew"
];

const productImages = {
  6: "assets/products/charizard.jpg",
  9: "assets/products/blastoise.jpg",
  44: "assets/products/gloom.jpg",
  46: "assets/products/paras.jpg",
  60: "assets/products/poliwag.jpg",
  144: "assets/products/articuno.jpg",
  145: "assets/products/zapdos.jpg",
  146: "assets/products/moltres.jpg"
};

const products = pokemonNames.map((name, index) => {
  const id = index + 1;
  let collection = "kanto";
  if (id <= 9) collection = "iniciales";
  if (id >= 133 && id <= 136) collection = "eeveelutions";
  if ([144, 145, 146, 150, 151].includes(id)) collection = "legendarios";
  return { id, name, collection, image: productImages[id] || null, price: PRODUCT_PRICE };
});

const formatPrice = value => new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP", maximumFractionDigits: 0 }).format(value);
const numberLabel = id => `#${String(id).padStart(3, "0")}`;
const normalize = value => value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/^#/, "").trim();
const collectionNames = { iniciales: "Iniciales", eeveelutions: "Eeveelutions", legendarios: "Legendarios", kanto: "Kanto" };

const state = {
  filter: "todos",
  query: "",
  sort: "number-asc",
  visible: PAGE_SIZE,
  cart: loadCart()
};

const grid = document.querySelector("#productGrid");
const resultCount = document.querySelector("#resultCount");
const emptyState = document.querySelector("#catalogEmpty");
const loadMoreButton = document.querySelector("#loadMore");
const catalogSearch = document.querySelector("#catalogSearch");
const filters = document.querySelector("#filters");
const modal = document.querySelector("#productModal");
const modalContent = document.querySelector("#modalContent");
const drawer = document.querySelector("#cartDrawer");
const overlay = document.querySelector("#overlay");
const toast = document.querySelector("#toast");

function loadCart() {
  try { return JSON.parse(localStorage.getItem("printballs-cart")) || []; }
  catch { return []; }
}

function saveCart() {
  localStorage.setItem("printballs-cart", JSON.stringify(state.cart));
  renderCart();
}

function getFilteredProducts() {
  const query = normalize(state.query);
  let list = products.filter(product => {
    const matchesFilter = state.filter === "todos"
      || (state.filter === "con-foto" && product.image)
      || product.collection === state.filter;
    const searchable = `${product.id} ${numberLabel(product.id)} ${product.name}`;
    return matchesFilter && (!query || normalize(searchable).includes(query));
  });

  list.sort((a, b) => {
    if (state.sort === "number-desc") return b.id - a.id;
    if (state.sort === "name-asc") return a.name.localeCompare(b.name, "es");
    return a.id - b.id;
  });
  return list;
}

function imageMarkup(product, inModal = false) {
  if (product.image) {
    return `<img src="${product.image}" alt="Pieza coleccionable inspirada en ${product.name}" width="1200" height="900" loading="${inModal ? "eager" : "lazy"}">`;
  }
  return `<div class="product-placeholder"><strong>${numberLabel(product.id)}</strong><span>Imagen en preparación</span></div>`;
}

function productCard(product) {
  return `
    <article class="product-card">
      <div class="product-image">
        ${imageMarkup(product)}
        <span class="product-number">${numberLabel(product.id)}</span>
        ${product.image ? '<span class="photo-badge">Foto real</span>' : ''}
      </div>
      <div class="product-body">
        <div class="product-meta"><span>${collectionNames[product.collection]}</span><strong>${formatPrice(product.price)}</strong></div>
        <h3>${product.name}</h3>
        <div class="product-actions">
          <button type="button" data-product-id="${product.id}">Ver detalles</button>
          <button class="quick-add" type="button" data-quick-add="${product.id}" aria-label="Agregar ${product.name} al carrito">+</button>
        </div>
      </div>
    </article>`;
}

function renderProducts() {
  const filtered = getFilteredProducts();
  const visibleProducts = filtered.slice(0, state.visible);
  grid.innerHTML = visibleProducts.map(productCard).join("");
  resultCount.textContent = `${filtered.length} ${filtered.length === 1 ? "diseño" : "diseños"}`;
  emptyState.hidden = filtered.length !== 0;
  loadMoreButton.hidden = state.visible >= filtered.length || filtered.length === 0;
}

function setFilter(filter) {
  state.filter = filter;
  state.visible = PAGE_SIZE;
  filters.querySelectorAll("button").forEach(button => button.classList.toggle("active", button.dataset.filter === filter));
  renderProducts();
  document.querySelector("#catalogo").scrollIntoView({ behavior: "smooth" });
}

function openProduct(id) {
  const product = products.find(item => item.id === Number(id));
  if (!product) return;
  modalContent.innerHTML = `
    <div class="modal-layout">
      <div class="modal-image">${imageMarkup(product, true)}</div>
      <form class="modal-info" id="productForm">
        <p class="eyebrow">${numberLabel(product.id)} · ${collectionNames[product.collection]}</p>
        <h2>${product.name}</h2>
        <div class="modal-price">${formatPrice(product.price)}</div>
        <p class="modal-note">Peso aproximado de 100 a 150 g. El tamaño varía entre cerca de 7 × 7 cm y 15 × 10 cm según los detalles del diseño.</p>
        <fieldset class="option-group">
          <legend>Presentación</legend>
          <div class="choice-row">
            <label><input type="radio" name="assembly" value="Armada" checked><span>Armada</span></label>
            <label><input type="radio" name="assembly" value="Kit para ensamblar"><span>Kit para ensamblar</span></label>
          </div>
        </fieldset>
        <fieldset class="option-group">
          <legend>Color</legend>
          <div class="choice-row">
            <label><input type="radio" name="colorMode" value="Colores originales" checked><span>Original</span></label>
            <label><input type="radio" name="colorMode" value="Color personalizado"><span>Personalizado</span></label>
          </div>
          <div class="color-choice">
            <label for="customColor">Color principal de referencia</label>
            <input id="customColor" name="customColor" type="color" value="#ef233c">
          </div>
        </fieldset>
        <fieldset class="option-group">
          <legend>Regalo</legend>
          <label class="gift-option"><input type="checkbox" name="gift"> Agregar tarjeta con mensaje sin costo</label>
          <textarea class="gift-message" name="message" maxlength="120" placeholder="Escribe el mensaje (opcional)"></textarea>
        </fieldset>
        <button class="modal-add" type="submit">Agregar al carrito · ${formatPrice(product.price)}</button>
      </form>
    </div>`;

  modal.showModal();
  document.querySelector("#productForm").addEventListener("submit", event => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const colorMode = form.get("colorMode");
    addToCart(product, {
      assembly: form.get("assembly"),
      color: colorMode === "Color personalizado" ? `Personalizado ${form.get("customColor")}` : colorMode,
      gift: form.get("gift") === "on",
      message: form.get("message")?.trim() || ""
    });
    modal.close();
    openCart();
  }, { once: true });
}

function addToCart(product, options = {}) {
  state.cart.push({
    key: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    id: product.id,
    name: product.name,
    price: product.price,
    assembly: options.assembly || "Armada",
    color: options.color || "Colores originales",
    gift: Boolean(options.gift),
    message: options.message || ""
  });
  saveCart();
  showToast(`${product.name} se agregó al carrito`);
}

function removeFromCart(key) {
  state.cart = state.cart.filter(item => item.key !== key);
  saveCart();
}

function renderCart() {
  const cartItems = document.querySelector("#cartItems");
  const cartEmpty = document.querySelector("#cartEmpty");
  const cartFooter = document.querySelector("#cartFooter");
  const count = state.cart.length;
  document.querySelector("#cartCount").textContent = count;
  cartEmpty.hidden = count > 0;
  cartFooter.hidden = count === 0;
  cartItems.innerHTML = state.cart.map(item => {
    const product = products.find(entry => entry.id === item.id);
    const thumb = product?.image
      ? `<img src="${product.image}" alt="" width="70" height="70">`
      : `<div class="cart-thumb-placeholder">${numberLabel(item.id)}</div>`;
    return `<article class="cart-item">
      ${thumb}
      <div><h3>${numberLabel(item.id)} ${item.name}</h3><p>${item.assembly} · ${item.color}${item.gift ? " · Regalo" : ""}</p><strong>${formatPrice(item.price)}</strong></div>
      <button type="button" data-remove="${item.key}" aria-label="Quitar ${item.name}">×</button>
    </article>`;
  }).join("");
  document.querySelector("#cartTotal").textContent = formatPrice(state.cart.reduce((sum, item) => sum + item.price, 0));
}

function openCart() {
  drawer.classList.add("open");
  drawer.setAttribute("aria-hidden", "false");
  document.querySelector("#openCart").setAttribute("aria-expanded", "true");
  overlay.hidden = false;
  document.body.classList.add("locked");
}

function closeCart() {
  drawer.classList.remove("open");
  drawer.setAttribute("aria-hidden", "true");
  document.querySelector("#openCart").setAttribute("aria-expanded", "false");
  overlay.hidden = true;
  document.body.classList.remove("locked");
}

function whatsappUrl(message) {
  const base = WHATSAPP_NUMBER ? `https://wa.me/${WHATSAPP_NUMBER}` : "https://wa.me/";
  return `${base}?text=${encodeURIComponent(message)}`;
}

function checkoutWhatsapp() {
  if (!state.cart.length) return;
  const lines = state.cart.map((item, index) => `${index + 1}. ${numberLabel(item.id)} ${item.name} — ${item.assembly}, ${item.color}${item.gift ? ", con tarjeta de regalo" : ""}${item.message ? ` (Mensaje: ${item.message})` : ""}`);
  const total = formatPrice(state.cart.reduce((sum, item) => sum + item.price, 0));
  const message = `Hola Print.Balls, quiero confirmar este pedido:\n\n${lines.join("\n")}\n\nTotal productos: ${total}\nDespacho: por cotizar.`;
  window.open(whatsappUrl(message), "_blank", "noopener,noreferrer");
}

let toastTimer;
function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 2400);
}

document.addEventListener("click", event => {
  const detailButton = event.target.closest("[data-product-id]");
  const quickButton = event.target.closest("[data-quick-add]");
  const removeButton = event.target.closest("[data-remove]");
  const collectionButton = event.target.closest("[data-collection]");
  if (detailButton) openProduct(detailButton.dataset.productId);
  if (quickButton) {
    const product = products.find(item => item.id === Number(quickButton.dataset.quickAdd));
    if (product) addToCart(product);
  }
  if (removeButton) removeFromCart(removeButton.dataset.remove);
  if (collectionButton) setFilter(collectionButton.dataset.collection);
});

catalogSearch.addEventListener("input", event => {
  state.query = event.target.value;
  state.visible = PAGE_SIZE;
  renderProducts();
});

filters.addEventListener("click", event => {
  const button = event.target.closest("button[data-filter]");
  if (button) setFilter(button.dataset.filter);
});

document.querySelector("#sortProducts").addEventListener("change", event => {
  state.sort = event.target.value;
  renderProducts();
});

document.querySelector("#heroSearchForm").addEventListener("submit", event => {
  event.preventDefault();
  state.query = document.querySelector("#heroSearch").value;
  state.filter = "todos";
  state.visible = PAGE_SIZE;
  catalogSearch.value = state.query;
  filters.querySelectorAll("button").forEach(button => button.classList.toggle("active", button.dataset.filter === "todos"));
  renderProducts();
  document.querySelector("#catalogo").scrollIntoView({ behavior: "smooth" });
});

loadMoreButton.addEventListener("click", () => {
  state.visible += PAGE_SIZE;
  renderProducts();
});
document.querySelector("#openCart").addEventListener("click", openCart);
document.querySelector("#closeCart").addEventListener("click", closeCart);
overlay.addEventListener("click", closeCart);
document.querySelector("#closeModal").addEventListener("click", () => modal.close());
document.querySelector("#checkoutWhatsapp").addEventListener("click", checkoutWhatsapp);
document.querySelector("#contactWhatsapp").addEventListener("click", () => window.open(whatsappUrl("Hola Print.Balls, necesito ayuda para elegir un diseño."), "_blank", "noopener,noreferrer"));
document.addEventListener("keydown", event => { if (event.key === "Escape" && drawer.classList.contains("open")) closeCart(); });

renderProducts();
renderCart();
