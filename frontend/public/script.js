document.addEventListener('DOMContentLoaded', () => {
  const burger = document.querySelector('.burger-button');
  const navigation = document.querySelector('header nav');
  burger?.setAttribute('aria-expanded', 'false');
  burger?.addEventListener('click', () => {
    const isOpen = navigation.classList.toggle('is-open');
    burger.setAttribute('aria-expanded', String(isOpen));
    burger.setAttribute('aria-label', isOpen ? 'Закрыть меню' : 'Открыть меню');
  });
  navigation?.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => {
    navigation.classList.remove('is-open');
    burger?.setAttribute('aria-expanded', 'false');
  }));

  const cartKey = 'bonbons-pauvres-cart';
  const getCart = () => JSON.parse(localStorage.getItem(cartKey) || '[]').map((item) => typeof item === 'number' ? { id: item, quantity: 1 } : item);
  const saveCart = (cart) => localStorage.setItem(cartKey, JSON.stringify(cart));
  const cartCount = (cart) => cart.reduce((sum, item) => sum + item.quantity, 0);
  const updateCartCounter = () => document.querySelectorAll('.cart-counter').forEach((node) => { node.textContent = `Корзина: ${cartCount(getCart())}`; });
  updateCartCounter();

  const cartPanel = document.createElement('aside');
  cartPanel.className = 'cart-panel';
  cartPanel.hidden = true;
  cartPanel.setAttribute('aria-label', 'Корзина');
  document.body.append(cartPanel);
  const closeCart = () => { cartPanel.hidden = true; };
  function renderCart() {
    const cart = getCart();
    const items = cart.map((item) => ({ ...item, dish: allDishes.find((dish) => dish.id === item.id) })).filter((item) => item.dish);
    const total = items.reduce((sum, item) => sum + Number(item.dish.price) * item.quantity, 0);
    cartPanel.innerHTML = `<div class="cart-panel__head"><h2>Ваша корзина</h2><button type="button" class="cart-panel__close" aria-label="Закрыть корзину">×</button></div>${items.length ? `<div class="cart-panel__items">${items.map((item) => `<div class="cart-item"><div><strong>${item.dish.title}</strong><span>${item.dish.price} ₽ · ${item.dish.weight}</span></div><div class="cart-item__controls"><button type="button" data-cart-minus="${item.id}" aria-label="Уменьшить количество">−</button><span>${item.quantity}</span><button type="button" data-cart-plus="${item.id}" aria-label="Увеличить количество">+</button><button type="button" data-cart-remove="${item.id}" aria-label="Удалить товар">Удалить</button></div></div>`).join('')}</div><div class="cart-panel__total"><span>Итого</span><strong>${total.toFixed(2)} ₽</strong></div><a class="call-button cart-panel__order" href="/contacts">Оформить заказ</a>` : '<p class="cart-panel__empty">Корзина пока пуста.</p>'}`;
    cartPanel.querySelector('.cart-panel__close')?.addEventListener('click', closeCart);
    cartPanel.querySelector('.cart-panel__order')?.addEventListener('click', () => {
      localStorage.setItem('bonbons-pauvres-order-message', `Заказ из корзины:\n${items.map((item) => `${item.dish.title} — ${item.quantity} шт.`).join('\n')}\n\nКомментарий к заказу:`);
    });
    cartPanel.querySelectorAll('[data-cart-plus], [data-cart-minus], [data-cart-remove]').forEach((button) => button.addEventListener('click', () => {
      const id = Number(button.dataset.cartPlus || button.dataset.cartMinus || button.dataset.cartRemove);
      const next = getCart().map((item) => item.id === id ? { ...item, quantity: button.dataset.cartPlus ? item.quantity + 1 : item.quantity - 1 } : item).filter((item) => item.id !== id || (!button.dataset.cartRemove && item.quantity > 0));
      saveCart(next); updateCartCounter(); renderCart();
    }));
  }
  document.querySelectorAll('.cart-counter').forEach((counter) => { counter.setAttribute('role', 'button'); counter.setAttribute('tabindex', '0'); counter.addEventListener('click', () => { renderCart(); cartPanel.hidden = false; }); counter.addEventListener('keydown', (event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); counter.click(); } }); });

  const contactForm = document.querySelector('#contact-form');
  const contactStatus = document.querySelector('#contact-status');
  const messageField = document.querySelector('#message');
  const savedOrderMessage = localStorage.getItem('bonbons-pauvres-order-message');
  if (messageField && savedOrderMessage) messageField.value = savedOrderMessage;
  contactForm?.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!contactForm.checkValidity()) return contactForm.reportValidity();
    const button = contactForm.querySelector('button[type="submit"]');
    button.disabled = true; contactStatus.textContent = 'Отправляем заявку…';
    try {
      const response = await fetch('/api/contact', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(Object.fromEntries(new FormData(contactForm))) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Не удалось отправить заявку.');
      contactStatus.textContent = result.message; contactStatus.dataset.state = 'success'; contactForm.reset(); localStorage.removeItem('bonbons-pauvres-cart'); localStorage.removeItem('bonbons-pauvres-order-message'); updateCartCounter();
    } catch (error) { contactStatus.textContent = error.message; contactStatus.dataset.state = 'error'; }
    finally { button.disabled = false; }
  });

  const filters = document.querySelector('#catalog-filters');
  const catalogGrid = document.querySelector('#catalog-grid');
  const catalogStatus = document.querySelector('#catalog-status');
  let allDishes = [];
  function renderCatalog() {
    const selected = new Set([...filters.querySelectorAll('input[data-category]:checked')].map((input) => input.value));
    const query = (filters.querySelector('[name="search"]')?.value || '').trim().toLowerCase();
    const sort = filters.querySelector('[name="sort"]')?.value || 'default';
    let dishes = allDishes.filter((dish) => (!selected.size || selected.has(dish.category)) && dish.title.toLowerCase().includes(query));
    if (sort === 'price-asc') dishes.sort((a, b) => Number(a.price) - Number(b.price));
    if (sort === 'price-desc') dishes.sort((a, b) => Number(b.price) - Number(a.price));
    if (sort === 'name') dishes.sort((a, b) => a.title.localeCompare(b.title, 'ru'));
    catalogGrid.replaceChildren();
    if (!dishes.length) { catalogStatus.textContent = 'По вашему запросу конфет не найдено.'; return; }
    catalogStatus.textContent = `${dishes.length} позиций в коллекции.`;
    dishes.forEach((dish) => {
      const card = document.createElement('article'); card.className = 'card product-card';
      card.innerHTML = `<div class="product-card__image-wrap"><img class="product-card__image" src="${dish.image_url}" alt="${dish.title}">${dish.badge ? `<span class="product-badge">${dish.badge}</span>` : ''}</div><div class="product-card__body"><h2>${dish.title}</h2><p>${dish.description}</p><div class="product-card__meta"><span>${dish.weight}</span><strong>${dish.price} ₽</strong></div><button type="button" data-add-to-cart="${dish.id}">В корзину</button></div>`;
      card.querySelector('[data-add-to-cart]').addEventListener('click', () => { const cart = getCart(); const item = cart.find((entry) => entry.id === dish.id); if (item) item.quantity += 1; else cart.push({ id: dish.id, quantity: 1 }); saveCart(cart); updateCartCounter(); renderCart(); });
      catalogGrid.append(card);
    });
  }
  async function loadCatalog() {
    if (!catalogGrid) return;
    catalogStatus.textContent = 'Загрузка каталога…';
    try { const response = await fetch('/api/dishes'); if (!response.ok) throw new Error('Не удалось загрузить каталог.'); allDishes = await response.json(); renderCatalog(); }
    catch (error) { catalogStatus.innerHTML = `${error.message} <button class="retry-button" type="button" id="retry-catalog">Повторить</button>`; document.querySelector('#retry-catalog').addEventListener('click', loadCatalog); }
  }
  filters?.addEventListener('input', renderCatalog);
  filters?.addEventListener('change', renderCatalog);
  filters?.addEventListener('submit', (event) => { event.preventDefault(); renderCatalog(); });
  filters?.addEventListener('reset', () => setTimeout(renderCatalog));
  loadCatalog();

  const servicesList = document.querySelector('.values-list');
  async function loadServices() {
    if (!servicesList) return;
    try {
      const response = await fetch('/api/services');
      if (!response.ok) throw new Error('Не удалось загрузить преимущества.');
      const services = await response.json();
      servicesList.replaceChildren(...services.map((service) => {
        const item = document.createElement('article');
        item.className = 'value-item';
        item.innerHTML = `<span class="value-item__line"></span><div><h3>${service.title}</h3><p>${service.description}</p></div>`;
        return item;
      }));
    } catch (error) { console.error(error); }
  }
  loadServices();

  const articlesGrid = document.querySelector('.article-grid');
  async function loadArticles() {
    if (!articlesGrid) return;
    try {
      const response = await fetch('/api/articles');
      if (!response.ok) throw new Error('Не удалось загрузить статьи.');
      const articles = await response.json();
      articlesGrid.replaceChildren(...articles.map((article, index) => {
        const card = document.createElement('article');
        const readerId = index === 0 ? 'article-strange' : index === 1 ? 'article-licorice' : `article-${article.id}`;
        card.className = 'card article-card';
        card.innerHTML = `<p class="article-card__number">${String(index + 1).padStart(2, '0')} / Заметка</p><h2>${article.title}</h2><p>${article.excerpt}</p><a href="#${readerId}">Читать далее <span aria-hidden="true">↗</span></a>`;
        return card;
      }));
    } catch (error) { console.error(error); }
  }
  loadArticles();

  const pollForm = document.querySelector('#poll-form');
  const pollQuestion = document.querySelector('#poll-question');
  const pollResults = document.querySelector('#poll-results');
  const pollStatus = document.querySelector('#poll-status');
  let currentPoll;
  function renderPollResults(poll) {
    pollResults.replaceChildren();
    poll.options.forEach((option) => {
      const row = document.createElement('div'); row.className = 'poll-result';
      row.innerHTML = `<div class="poll-result__label"><span>${option.title}</span><strong>${option.votes} (${option.percent}%)</strong></div><div class="poll-result__track"><div class="poll-result__bar" style="width: ${option.percent}%"></div></div>`;
      pollResults.append(row);
    });
  }
  async function loadPoll() {
    if (!pollForm) return;
    try {
      const response = await fetch('/api/poll'); const poll = await response.json();
      if (!response.ok) throw new Error(poll.error);
      currentPoll = poll; pollQuestion.textContent = poll.question; pollForm.replaceChildren();
      if (poll.hasVoted) { pollStatus.textContent = 'Вы уже голосовали. Результаты:'; renderPollResults(poll); return; }
      poll.options.forEach((option) => { const label = document.createElement('label'); label.className = 'poll-option'; label.innerHTML = `<input type="radio" name="poll-option" value="${option.id}" required> ${option.title}`; pollForm.append(label); });
      const button = document.createElement('button'); button.type = 'submit'; button.textContent = 'Голосовать'; pollForm.append(button);
    } catch (error) { pollStatus.textContent = error.message; }
  }
  pollForm?.addEventListener('submit', async (event) => {
    event.preventDefault(); const optionId = pollForm.querySelector('input:checked')?.value;
    try { const response = await fetch('/api/vote', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ optionId: Number(optionId) }) }); const result = await response.json(); if (!response.ok) throw new Error(result.error); pollForm.replaceChildren(); pollStatus.textContent = result.message; renderPollResults(result.poll); }
    catch (error) { pollStatus.textContent = error.message; }
  });
  loadPoll();
});
