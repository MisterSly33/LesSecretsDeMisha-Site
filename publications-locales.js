/* Les Secrets de Misha — publications publiques depuis Supabase */
(async () => {
  const SUPABASE_URL = 'https://fnxawannqbemythnavmd.supabase.co';
  const SUPABASE_KEY = 'sb_publishable_UZrk3AxoTubdsq6-Mlsseg_809Bf5QR';

  const el = (tag, text) => {
    const node = document.createElement(tag);
    if (text !== undefined && text !== null) {
      node.textContent = String(text);
    }
    return node;
  };

  const empty = (root, message) => {
    const p = el('p', message);
    p.className = 'misha-public-empty';
    root.append(p);
  };

  const addPhoto = (card, photo, alt) => {
    if (!photo) return;
    try {
      const url = new URL(photo, window.location.href);
      if (!['https:', 'http:'].includes(url.protocol)) return;

      const img = el('img');
      img.src = url.href;
      img.alt = alt || 'Illustration';
      img.loading = 'lazy';
      card.append(img);
    } catch (error) {
      console.warn('Adresse de photo invalide', error);
    }
  };

  const addLink = (card, href) => {
    if (!href) return;
    try {
      const url = new URL(href);
      if (!['https:', 'http:'].includes(url.protocol)) return;

      const a = el('a', 'En savoir plus ↗');
      a.href = url.href;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      card.append(a);
    } catch (error) {
      console.warn('Lien invalide', error);
    }
  };

  async function readTable(table, params) {
    const url = new URL(`${SUPABASE_URL}/rest/v1/${table}`);

    for (const [key, value] of Object.entries(params)) {
      url.searchParams.set(key, value);
    }

    const response = await fetch(url.href, {
      headers: {
        apikey: SUPABASE_KEY,
        'Accept-Profile': 'public'
      }
    });

    if (!response.ok) {
      const details = await response.text();
      throw new Error(
        `${table} : HTTP ${response.status} — ${details}`
      );
    }

    return response.json();
  }

  const sections = [
    {
      id: 'misha-produits',
      table: 'produits',
      params: {
        select: 'nom,description,prix,photo,disponible,stock,statut,ordre_affichage',
        statut: 'eq.publiée',
        order: 'ordre_affichage.asc,created_at.desc'
      },
      render(item) {
        const card = el('article');
        card.className = 'misha-public-card';

        addPhoto(card, item.photo, item.nom);
        card.append(el('h3', item.nom || 'Création de Misha'));

        if (item.description) {
          card.append(el('p', item.description));
        }

        const prix = item.prix === null || item.prix === undefined
          ? 'Prix sur demande'
          : `${Number(item.prix).toLocaleString('fr-FR', {
              maximumFractionDigits: 2
            })} €`;

        const disponible = item.disponible &&
          (item.stock === null ||
           item.stock === undefined ||
           item.stock > 0);

        card.append(el(
          'p',
          `${prix} · ${disponible ? 'Disponible' : 'Indisponible'}`
        ));

        if (disponible) {
          const wrap = el('div'); wrap.className = 'misha-product-actions';
          const label = el('label', 'Quantité ');
          const qty = el('input'); qty.type = 'number'; qty.min = '1'; qty.step = '1'; qty.value = '1';
          qty.max = item.stock === null || item.stock === undefined ? '99' : String(Math.max(1, Math.floor(item.stock)));
          qty.setAttribute('aria-label', `Quantité de ${item.nom || 'produit'}`);
          label.append(qty);
          const button = el('button', 'Ajouter au panier +'); button.type = 'button'; button.className = 'misha-order-link';
          button.addEventListener('click', () => {
            const n = Number(qty.value);
            if (!Number.isInteger(n) || n < 1 || n > Number(qty.max)) {
              qty.reportValidity(); return;
            }
            window.mishaAddToCart?.({name:item.nom || 'Création de Misha',price:item.prix == null ? null : Number(item.prix),max:Number(qty.max)},n);
          });
          wrap.append(label,button); card.append(wrap);
        }

        return card;
      }
    },
    {
      id: 'misha-agenda',
      table: 'Agenda',
      params: {
        select: 'titre,date_debut,date_fin,lieu,adresse,description,lien,photo,statut',
        statut: 'in.(publié,publie)',
        order: 'date_debut.asc'
      },
      render(item) {
        const card = el('article');
        card.className = 'misha-public-card';

        addPhoto(card, item.photo, item.titre);
        card.append(el('h3', item.titre || 'Événement'));

        if (item.date_debut) {
          const debut = new Date(item.date_debut);
          const fin = item.date_fin ? new Date(item.date_fin) : null;
          const validFin = fin && !Number.isNaN(fin.getTime()) && fin > debut;
          const dateFmt = new Intl.DateTimeFormat('fr-FR', {
            dateStyle: 'long', timeZone: 'Europe/Paris'
          });
          const dateHeureFmt = new Intl.DateTimeFormat('fr-FR', {
            dateStyle: 'long', timeStyle: 'short', timeZone: 'Europe/Paris'
          });
          const heureFmt = new Intl.DateTimeFormat('fr-FR', {
            timeStyle: 'short', timeZone: 'Europe/Paris'
          });
          if (!Number.isNaN(debut.getTime())) {
            let texte = dateHeureFmt.format(debut);
            if (validFin) {
              if (dateFmt.format(debut) === dateFmt.format(fin)) {
                texte = `${dateFmt.format(debut)} · de ${heureFmt.format(debut)} à ${heureFmt.format(fin)}`;
              } else {
                texte = `Du ${dateHeureFmt.format(debut)} au ${dateHeureFmt.format(fin)}`;
              }
            }
            card.append(el('p', texte));
          }
        }

        if (item.lieu) card.append(el('p', item.lieu));
        if (item.adresse) card.append(el('p', item.adresse));
        if (item.description) {
          const description = el('p', item.description);
          description.style.whiteSpace = 'pre-line';
          description.style.overflowWrap = 'anywhere';
          card.append(description);
        }

        addLink(card, item.lien);
        return card;
      }
    }
  ];

  await Promise.all(sections.map(async (section) => {
    const root = document.getElementById(section.id);
    if (!root) return;

    try {
      const items = await readTable(
        section.table,
        section.params
      );

      if (!items.length) {
        empty(
          root,
          section.table === 'astuces'
            ? 'Les prochaines astuces de Misha arrivent bientôt.'
            : 'Les nouveautés seront bientôt disponibles.'
        );
        return;
      }

      for (const item of items) {
        root.append(section.render(item));
      }
    } catch (error) {
      console.error(
        `Chargement ${section.table} impossible :`,
        error
      );

      empty(
        root,
        'Cette rubrique est momentanément indisponible.'
      );
    }
  }));
})();
