/* Les Secrets de Misha — publications publiques */
(async () => {
  const SUPABASE_URL = 'https://fnxawannqbemythnavmd.supabase.co';

  // Remplacer uniquement le texte ci-dessous par la clé publique Supabase.
  const SUPABASE_KEY = 'sb_publishable_UZrk3AxoTubdsq6-Mlsseg_809Bf5QR';

  const groups = [
    ['produits', 'misha-produits'],
    ['agenda', 'misha-agenda']
  ];

  const el = (tag, txt) => {
    const e = document.createElement(tag);
    if (txt !== undefined) e.textContent = txt;
    return e;
  };

  // Produits et agenda : fonctionnement local inchangé.
  for (const [kind, id] of groups) {
    const root = document.getElementById(id);
    if (!root) continue;

    let arr = [];
    try {
      arr = JSON.parse(
        localStorage.getItem('misha_demo_' + kind) || '[]'
      );
    } catch {}

    const published = arr.filter(x => x.publication === 'publie');

    if (!published.length) {
  const message = el('p', 'Les nouveautés seront bientôt disponibles.');
  message.className = 'misha-public-empty';
  root.append(message);
  continue;
}  

    for (const o of published) {
      const card = el('article');
      card.className = 'misha-public-card';

      if (o.photo) {
        const img = el('img');
        img.src = o.photo;
        img.alt = o.nom || o.titre || 'Illustration';
        card.append(img);
      }

      card.append(el('h3', o.nom || o.titre || ''));

      if (kind === 'produits') {
        card.append(
          el('p', `${o.prix || '0'} € · ${o.etat || 'Disponible'}`)
        );
      }

      if (kind === 'agenda') {
        card.append(el('p', `${o.date || ''} · ${o.lieu || ''}`));

        if (o.note) card.append(el('p', o.note));

        if (o.lien) {
          try {
            const u = new URL(o.lien);

            if (['https:', 'http:'].includes(u.protocol)) {
              const a = el('a', 'En savoir plus ↗');
              a.href = u.href;
              a.target = '_blank';
              a.rel = 'noopener noreferrer';
              card.append(a);
            }
          } catch {}
        }
      }

      root.append(card);
    }
  }

  // Astuces : récupération depuis Supabase.
  const root = document.getElementById('misha-astuces');
  if (!root) return;

  try {
    const response = await fetch(
`${SUPABASE_URL}/rest/v1/astuces?select=titre,contenu,photo&publication_forcee=eq.true&order=created_at.desc&limit=2`,      {
        headers: {
          apikey: SUPABASE_KEY
        }
      }
    );

    if (!response.ok) {
      throw new Error(`Erreur Supabase : ${response.status}`);
    }

    const astuces = await response.json();

    if (!astuces.length) {
      root.append(
        el('p', 'Les prochaines astuces de Misha arrivent bientôt.')
      );
      return;
    }

    for (const astuce of astuces) {
      const card = el('article');
      card.className = 'misha-public-card';

      if (astuce.photo) {
        const img = el('img');
        img.src = astuce.photo;
        img.alt = astuce.titre || 'Illustration';
        card.append(img);
      }

      card.append(el('h3', astuce.titre || ''));

      if (astuce.contenu) {
        card.append(el('p', astuce.contenu));
      }

      root.append(card);
    }
  } catch (error) {
    console.error('Chargement des astuces impossible :', error);

    root.append(
      el('p', 'Les astuces sont momentanément indisponibles.')
    );
  }
})();
