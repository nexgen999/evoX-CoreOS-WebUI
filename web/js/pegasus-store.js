/**
 * pegasus-store.js — Module Pegasus Store pour evoX-CoreOS-WebUI
 */

let currentPegasusCatalogData = [];
let currentPegasusViewMode = 'grid';

// Initialisation globale appelée lors du chargement de la page
async function initPegasusStore(config) {
  const storeConfig = config?.sources?.pegasus_store;
  const tabBtn = document.getElementById('tab-pegasus-store');

  // Vérification du paramètre true/false dans config.json
  if (!storeConfig || storeConfig.visible !== true) {
    if (tabBtn) tabBtn.classList.add('hidden');
    return;
  }

  // Affichage de l'onglet si visible == true
  if (tabBtn) tabBtn.classList.remove('hidden');

  // Auto-remplissage du menu déroulant à partir des sources Pegasus existantes
  const selectEl = document.getElementById('pegasus-source-select');
  if (!selectEl) return;

  selectEl.innerHTML = '';
  const sources = config?.sources?.pegasus || [];

  if (sources.length === 0) {
    selectEl.innerHTML = '<option value="">Aucun catalogue configuré</option>';
    return;
  }

  sources.forEach((source, index) => {
    const option = document.createElement('option');
    option.value = source.url;
    option.textContent = source.name || `Catalogue ${index + 1}`;
    selectEl.appendChild(option);
  });

  // Chargement automatique du premier catalogue disponible
  if (sources.length > 0) {
    loadSelectedPegasusCatalog();
  }
}

// Chargement du catalogue sélectionné
async function loadSelectedPegasusCatalog() {
  const selectEl = document.getElementById('pegasus-source-select');
  const container = document.getElementById('pegasus-store-container');
  if (!selectEl || !selectEl.value) return;

  container.innerHTML = '<div class="loading-spinner">Chargement des données Pegasus...</div>';

  try {
    const response = await fetch(selectEl.value);
    if (!response.ok) throw new Error(`Erreur réseau: ${response.status}`);

    const data = await response.json();
    
    // Normalisation des données selon la structure du JSON Pegasus
    currentPegasusCatalogData = Array.isArray(data) ? data : (data.items || data.downloads || []);

    renderPegasusStore(currentPegasusCatalogData);
  } catch (err) {
    console.error("Erreur Pegasus Store :", err);
    container.innerHTML = `<div class="error-msg">❌ Impossible de charger le catalogue : ${err.message}</div>`;
  }
}

// Rendu de la grille ou de la liste
function renderPegasusStore(items) {
  const container = document.getElementById('pegasus-store-container');
  if (!container) return;

  if (!items || items.length === 0) {
    container.innerHTML = '<div class="empty-msg">Aucun élément trouvé dans ce catalogue.</div>';
    return;
  }

  container.className = currentPegasusViewMode === 'grid' ? 'pegasus-grid' : 'pegasus-list';
  container.innerHTML = '';

  items.forEach(item => {
    const card = document.createElement('div');
    card.className = 'pegasus-card';

    // Image / Cover avec fallback
    const imageUrl = item.image || item.cover || item.icon || 'assets/no-cover.png';
    const title = item.title || item.name || 'Fichier sans titre';
    const description = item.description || item.summary || 'Aucune description disponible.';
    const size = item.size ? `<span class="tag-size">💾 ${item.size}</span>` : '';
    const category = item.category ? `<span class="tag-cat">📁 ${item.category}</span>` : '';

    // Génération des boutons de téléchargement par serveur / miroir
    let downloadButtonsHtml = '';
    
    if (Array.isArray(item.links) && item.links.length > 0) {
      downloadButtonsHtml = item.links.map(link => `
        <a href="${link.url}" target="_blank" rel="noopener" class="btn-download-host">
          <i class="fa-solid fa-download"></i> ${link.name || link.host || 'Télécharger'}
        </a>
      `).join('');
    } else if (item.url) {
      downloadButtonsHtml = `
        <a href="${item.url}" target="_blank" rel="noopener" class="btn-download-host">
          <i class="fa-solid fa-download"></i> Télécharger
        </a>
      `;
    } else {
      downloadButtonsHtml = `<span class="no-link">Aucun lien disponible</span>`;
    }

    card.innerHTML = `
      <div class="card-media">
        <img src="${imageUrl}" alt="${title}" loading="lazy" onerror="this.src='assets/no-cover.png'">
      </div>
      <div class="card-body">
        <h3 class="card-title">${title}</h3>
        <div class="card-tags">${category} ${size}</div>
        <p class="card-desc">${description}</p>
        <div class="card-downloads">
          ${downloadButtonsHtml}
        </div>
      </div>
    `;

    container.appendChild(card);
  });
}

// Filtre de recherche
function filterPegasusStore() {
  const query = document.getElementById('pegasus-search-input').value.toLowerCase().trim();
  if (!query) {
    renderPegasusStore(currentPegasusCatalogData);
    return;
  }

  const filtered = currentPegasusCatalogData.filter(item => {
    const title = (item.title || item.name || '').toLowerCase();
    const desc = (item.description || item.summary || '').toLowerCase();
    const cat = (item.category || '').toLowerCase();
    return title.includes(query) || desc.includes(query) || cat.includes(query);
  });

  renderPegasusStore(filtered);
}

// Basculement du mode d'affichage
function setPegasusView(mode) {
  currentPegasusViewMode = mode;
  
  document.getElementById('btn-view-grid')?.classList.toggle('active', mode === 'grid');
  document.getElementById('btn-view-list')?.classList.toggle('active', mode === 'list');

  renderPegasusStore(currentPegasusCatalogData);
}
