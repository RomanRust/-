(function runCatalog() {
  'use strict';

  const icons = {
    'heart': '<path d="M19.5 13.572l-7.5 7.428l-7.5 -7.428m0 0a5 5 0 1 1 7.5 -6.566a5 5 0 1 1 7.5 6.572"/>',
    'map-pin': '<path d="M9 11a3 3 0 1 0 6 0a3 3 0 0 0 -6 0"/><path d="M17.657 16.657l-4.243 4.243a2 2 0 0 1 -2.827 0l-4.244 -4.243a8 8 0 1 1 11.314 0z"/>',
    'building': '<path d="M3 21h18m-17 0v-13l8 -4v17m8 0v-9l-8 -4m-4 1v.01m0 3v.01m0 3v.01m0 3v.01"/><path d="M16 13v.01m0 3v.01m0 3v.01"/>',
    'wallet': '<path d="M17 8V5a1 1 0 0 0 -1 -1H6a2 2 0 0 0 0 4h12a2 2 0 0 1 2 2v2m0 4v2a2 2 0 0 1 -2 2H6a2 2 0 0 1 -2 -2V6"/><path d="M20 12v4h-4a2 2 0 0 1 0 -4h4"/>',
    'chevron-down': '<path d="M6 9l6 6l6 -6"/>',
    'search': '<path d="M3 10a7 7 0 1 0 14 0a7 7 0 0 0 -14 0m18 11l-6 -6"/>',
    'layout-grid': '<path d="M4 4m0 1a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v4a1 1 0 0 1 -1 1H5a1 1 0 0 1 -1 -1zM14 4m0 1a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v4a1 1 0 0 1 -1 1h-4a1 1 0 0 1 -1 -1zM4 14m0 1a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v4a1 1 0 0 1 -1 1H5a1 1 0 0 1 -1 -1zM14 14m0 1a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v4a1 1 0 0 1 -1 1h-4a1 1 0 0 1 -1 -1z"/>',
    'arrows-sort': '<path d="M3 9l4 -4l4 4m-4 -4v14m6 -4l4 4l4 -4m-4 4V5"/>',
    'check': '<path d="M5 12l4 4l10 -10"/>',
    'paw': '<path d="M14.7 13.5l3.3 4.5a2.5 2.5 0 0 1 -2.8 3.6l-2.7 -.9a1.6 1.6 0 0 0 -1 0l-2.7 .9a2.5 2.5 0 0 1 -2.8 -3.6l3.3 -4.5a3.3 3.3 0 0 1 5.4 0z"/><ellipse cx="4.5" cy="10.5" rx="1.6" ry="2.4" transform="rotate(-21 4.5 10.5)"/><ellipse cx="9" cy="5.8" rx="1.6" ry="2.5" transform="rotate(-12 9 5.8)"/><ellipse cx="15" cy="5.8" rx="1.6" ry="2.5" transform="rotate(12 15 5.8)"/><ellipse cx="19.5" cy="10.5" rx="1.6" ry="2.4" transform="rotate(21 19.5 10.5)"/>',
    'receipt': '<path d="M5 21l2 -1l2 1l3 -1l3 1l2 -1l2 1V5l-2 1l-2 -1l-3 1l-3 -1l-2 1l-2 -1zm4 -11h6m-6 4h6m-6 3h2"/>',
    'door': '<path d="M3 21h18m-15 0v-16a2 2 0 0 1 2 -2h8a2 2 0 0 1 2 2v16m-4 -9v.01"/>',
    'file-text': '<path d="M14 3v4a1 1 0 0 0 1 1h4m-2 13H7a2 2 0 0 1 -2 -2V5a2 2 0 0 1 2 -2h7l5 5v11a2 2 0 0 1 -2 2zM9 13h6m-6 4h6"/>',
    'external-link': '<path d="M12 6H6a2 2 0 0 0 -2 2v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2 -2v-6m-7 1l9 -9m-5 0h5v5"/>',
    'x': '<path d="M18 6L6 18M6 6l12 12"/>'
  };

  const cityById = new Map(cities.map(city => [city.id, city]));
  const homeById = new Map(homes.map(home => [home.id, home]));
  const counts = new Intl.PluralRules('ru');
  const currency = new Intl.NumberFormat('ru');
  const storageKey = 'svoy-adres-favorites';
  const favorites = loadFavorites();

  const search = document.querySelector('#search');
  const citySelect = document.querySelector('#city-select');
  const noFee = document.querySelector('#no-fee');
  const pets = document.querySelector('#pets');
  const sort = document.querySelector('#catalog-sort');
  const reset = document.querySelector('#reset-filters');
  const cityGrid = document.querySelector('#city-grid');
  const listings = document.querySelector('#listings');
  const catalogTitle = document.querySelector('#catalog-title');
  const resultCount = document.querySelector('#result-count');
  const favoritesCount = document.querySelector('#favorites-count');
  const externalSearch = document.querySelector('#external-search');
  const popup = document.querySelector('#popup');
  const popupTitle = document.querySelector('#popup-title');
  const popupClose = document.querySelector('#popup-close');
  const popupContent = document.querySelector('#popup-content');

  let active = readSearch();
  let popupView = '';
  let origin = null;

  function icon(name) {
    return `<svg class="tabler-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icons[name]}</svg>`;
  }

  function loadFavorites() {
    try {
      const stored = JSON.parse(localStorage.getItem(storageKey) || '[]');
      return new Set(Array.isArray(stored) ? stored.filter(id => homeById.has(id)) : []);
    } catch {
      return new Set();
    }
  }

  function readSearch() {
    const data = new FormData(search);
    return { city: data.get('city'), rooms: data.get('rooms'), budget: data.get('budget') };
  }

  function countText(count) {
    const ending = { one: 'вариант', few: 'варианта', many: 'вариантов' };
    return `${count} ${ending[counts.select(count)]}`;
  }

  function money(value) {
    return `${currency.format(value)} ₽`;
  }

  function roomsLabel(rooms) {
    return rooms === 0 ? 'Студия' : `${rooms}-комнатная`;
  }

  function photo(home) {
    return `./assets/flat-${home.id}.jpg`;
  }

  function favoriteButton(home, className = '') {
    const pressed = favorites.has(home.id);
    return `<button type="button" class="icon-button ${className}" data-save="${home.id}" aria-label="${pressed ? 'Убрать из избранного' : 'Добавить в избранное'}" aria-pressed="${pressed}">${icon('heart')}</button>`;
  }

  function card(home) {
    return `<article class="listing">
      <img class="listing-image" src="${photo(home)}" alt="" loading="lazy" width="840" height="460">
      ${favoriteButton(home, 'listing-favorite')}
      <div class="listing-body">
        <p class="listing-price">${money(home.price)} <small>/ месяц</small></p>
        <h3 class="listing-title"><button type="button" data-home="${home.id}">${home.title}</button></h3>
        <p class="listing-meta"><span>${roomsLabel(home.rooms)}</span><span>${home.size} м²</span>${home.fee === 0 ? '<span>Без комиссии</span>' : ''}</p>
        <p class="listing-place">${icon('map-pin')} ${cityById.get(home.city).name}, ${home.area}</p>
      </div>
    </article>`;
  }

  function sourceLink(city) {
    return `<a href="${city.source}" target="_blank" rel="noopener" aria-label="Объявления на Этажах — ${city.name}">${city.name}</a>`;
  }

  function renderCatalog() {
    const selected = cityById.get(active.city);
    const matches = homes.filter(home => {
      const roomsMatch = active.rooms === '' || (active.rooms === '3' ? home.rooms >= 3 : home.rooms === Number(active.rooms));
      return (!selected || home.city === selected.id)
        && roomsMatch
        && (!active.budget || home.price <= Number(active.budget))
        && (!noFee.checked || home.fee === 0)
        && (!pets.checked || home.pets);
    });

    const order = {
      'price-asc': (a, b) => a.price - b.price,
      'price-desc': (a, b) => b.price - a.price,
      'size-desc': (a, b) => b.size - a.size
    }[sort.value];
    if (order) matches.sort(order);

    catalogTitle.textContent = selected ? `Жильё ${selected.where}` : 'Жильё в аренду';
    resultCount.textContent = countText(matches.length);
    listings.innerHTML = matches.length ? matches.map(card).join('') : `<div class="empty">
      <h3>Подходящих вариантов пока нет</h3>
      <p>Попробуйте изменить параметры поиска или снять дополнительные фильтры.</p>
      <button class="button button-outline" type="button" data-reset>Сбросить фильтры</button>
    </div>`;
    externalSearch.innerHTML = `<span>Актуальные объявления на «Этажах»</span>${(selected ? [selected] : cities).map(sourceLink).join('')}`;
    reset.hidden = !(selected || active.rooms || active.budget || noFee.checked || pets.checked || sort.value !== 'featured');

    cityGrid.querySelectorAll('[data-city]').forEach(button => {
      button.setAttribute('aria-pressed', String(button.dataset.city === active.city));
    });
  }

  function moveToCatalog() {
    catalogTitle.focus({ preventScroll: true });
    document.querySelector('#catalog').scrollIntoView({ block: 'start' });
  }

  function searchCity(city = '') {
    search.reset();
    citySelect.value = city;
    noFee.checked = false;
    pets.checked = false;
    sort.value = 'featured';
    active = readSearch();
    renderCatalog();
    moveToCatalog();
  }

  function updateFavoritesCount() {
    favoritesCount.hidden = favorites.size === 0;
    favoritesCount.textContent = favorites.size;
    document.querySelector('#favorites-button').setAttribute(
      'aria-label', favorites.size ? `Избранное, ${countText(favorites.size)}` : 'Избранное'
    );
  }

  function openPopup(view, title, content) {
    popupView = view;
    popupTitle.textContent = title;
    popupContent.innerHTML = content;
    if (!popup.open) {
      popup.showModal();
    } else {
      popup.scrollTop = 0;
      popupClose.focus();
    }
  }

  function showFavorites() {
    const saved = [...favorites].map(id => homeById.get(id));
    const content = saved.length ? `<div class="listing-grid">${saved.map(card).join('')}</div>` : `<div class="empty">
      <h3>Здесь будут сохранённые квартиры</h3>
      <p>Нажмите на сердечко на карточке, чтобы вернуться к ней позже.</p>
      <button type="button" class="button button-primary" data-browse>К каталогу</button>
    </div>`;
    openPopup('favorites', 'Избранное', content);
  }

  function showDetail(home, fromFavorites) {
    const city = cityById.get(home.city);
    openPopup(fromFavorites ? 'saved-detail' : 'detail', home.title, `
      ${fromFavorites ? '<button type="button" class="text-button" data-back>К избранному</button>' : ''}
      <img class="detail-image" src="${photo(home)}" alt="Иллюстрация интерьера" width="840" height="420">
      <div class="detail-main">
        <div>
          <p class="listing-price">${money(home.price)} <small>/ месяц</small></p>
          <p class="listing-place">${icon('map-pin')} ${city.name}, ${home.area}</p>
        </div>
        ${favoriteButton(home)}
      </div>
      <p class="listing-meta"><span>${roomsLabel(home.rooms)}</span><span>${home.size} м²</span><span>${home.pets ? 'Можно с питомцами' : 'Без питомцев'}</span></p>
      <p class="detail-description">${home.description}</p>
      <dl class="detail-terms">
        <div><dt>Залог</dt><dd>${money(home.deposit)}</dd></div>
        <div><dt>Комиссия</dt><dd>${money(home.fee)}</dd></div>
        <div><dt>При заселении</dt><dd>${money(home.price + home.deposit + home.fee)}</dd></div>
      </dl>
      <p class="detail-note">Демонстрационное объявление. Актуальное жильё можно поискать на <a href="${city.source}" target="_blank" rel="noopener">сайте «Этажей» ${city.where}</a>.</p>`);
  }

  function showCredits() {
    const entries = cities.map(city => {
      const license = city.licenseUrl ? `<a href="${city.licenseUrl}" target="_blank" rel="noopener">${city.license}</a>` : city.license;
      const file = `https://commons.wikimedia.org/wiki/File:${encodeURIComponent(city.photo)}`;
      return `<li><a href="${file}" target="_blank" rel="noopener">${city.name}</a> — ${city.author}, ${license}. Изображение кадрировано при показе.</li>`;
    });
    openPopup('credits', 'Источники фотографий', `<div class="credits"><ul>${entries.join('')}</ul>
      <p>Иллюстрации объявлений — <a href="https://www.pexels.com/" target="_blank" rel="noopener">Pexels</a>. Изображение на главном экране создано в ImageGen.</p>
    </div>`);
  }

  function toggleFavorite(id, button) {
    if (favorites.has(id)) favorites.delete(id);
    else favorites.add(id);

    try {
      localStorage.setItem(storageKey, JSON.stringify([...favorites]));
    } catch {
      // Favorites still work for this visit when storage is unavailable.
    }

    updateFavoritesCount();
    const pressed = favorites.has(id);
    document.querySelectorAll(`[data-save="${id}"]`).forEach(control => {
      control.setAttribute('aria-label', pressed ? 'Убрать из избранного' : 'Добавить в избранное');
      control.setAttribute('aria-pressed', String(pressed));
    });

    if (popupView === 'favorites') {
      const buttons = Array.from(popupContent.querySelectorAll('[data-save]'));
      const index = buttons.indexOf(button);
      showFavorites();
      const remaining = popupContent.querySelectorAll('[data-save]');
      remaining[Math.min(index, remaining.length - 1)]?.focus();
    }
  }

  document.querySelectorAll('[data-icon]').forEach(element => {
    element.innerHTML = icon(element.dataset.icon);
  });

  cities.forEach(city => citySelect.add(new Option(city.name, city.id)));
  cityGrid.innerHTML = cities.map(city => {
    const count = homes.filter(home => home.city === city.id).length;
    return `<button type="button" class="city-card" data-city="${city.id}" aria-pressed="false">
      <img src="./assets/${city.id}.jpg" alt="" loading="lazy" width="960" height="540">
      <span><span class="city-name">${city.name}</span><span class="city-count">${countText(count)}</span></span>
      <span class="city-pin" data-icon>${icon('map-pin')}</span>
    </button>`;
  }).join('');

  search.addEventListener('submit', event => {
    event.preventDefault();
    active = readSearch();
    renderCatalog();
    moveToCatalog();
  });
  [noFee, pets, sort].forEach(control => control.addEventListener('change', renderCatalog));

  document.querySelector('#favorites-button').addEventListener('click', event => {
    origin = event.currentTarget;
    showFavorites();
  });
  document.querySelector('#credits-button').addEventListener('click', event => {
    origin = event.currentTarget;
    showCredits();
  });
  document.querySelector('#all-cities').addEventListener('click', () => searchCity());
  reset.addEventListener('click', () => searchCity());
  popupClose.addEventListener('click', () => popup.close());
  popup.addEventListener('close', () => {
    popupView = '';
    origin?.focus({ preventScroll: true });
    origin = null;
  });

  document.addEventListener('click', event => {
    const button = event.target.closest('button');
    if (!button) return;

    if (button.matches('[data-city]')) {
      searchCity(button.dataset.city);
    } else if (button.matches('[data-save]')) {
      toggleFavorite(Number(button.dataset.save), button);
    } else if (button.matches('[data-home]')) {
      const fromFavorites = popupView === 'favorites';
      if (!popup.open) origin = button;
      showDetail(homeById.get(Number(button.dataset.home)), fromFavorites);
    } else if (button.matches('[data-back]')) {
      showFavorites();
    } else if (button.matches('[data-reset]')) {
      searchCity();
    } else if (button.matches('[data-browse]')) {
      origin = null;
      popup.close();
      moveToCatalog();
    }
  });

  updateFavoritesCount();
  renderCatalog();
})();

