const toggle=document.querySelector('.menu-toggle');const links=document.querySelector('.navlinks');toggle.addEventListener('click',()=>{const open=links.classList.toggle('open');toggle.setAttribute('aria-expanded',String(open))});document.querySelectorAll('.navlinks a').forEach(a=>a.addEventListener('click',()=>{links.classList.remove('open');toggle.setAttribute('aria-expanded','false')}));


// Navigation horizontale des fiches Boutique et Agenda.
for (const id of ['misha-produits', 'misha-agenda']) {
  const row = document.getElementById(id);
  if (!row) continue;
  row.setAttribute('role', 'region');
  row.setAttribute('aria-label', id === 'misha-produits' ? 'Produits de la boutique' : 'Événements de l’agenda');
  row.setAttribute('tabindex', '0');
  const controls = document.createElement('div');
  controls.className = 'misha-carousel-controls';
  controls.hidden = true;
  const hint = document.createElement('span');
  hint.className = 'misha-carousel-hint';
  hint.textContent = 'Faites défiler pour découvrir la suite';
  const previous = document.createElement('button');
  previous.type = 'button'; previous.textContent = '‹';
  previous.setAttribute('aria-label', 'Fiches précédentes');
  const next = document.createElement('button');
  next.type = 'button'; next.textContent = '›';
  next.setAttribute('aria-label', 'Fiches suivantes');
  controls.append(hint, previous, next);
  row.before(controls);
  const update = () => {
    const overflow = row.scrollWidth > row.clientWidth + 3;
    controls.hidden = !overflow;
    previous.disabled = row.scrollLeft <= 3;
    next.disabled = row.scrollLeft + row.clientWidth >= row.scrollWidth - 3;
  };
  const step = () => {
    const card = row.querySelector('.misha-public-card');
    return card ? card.getBoundingClientRect().width + 18 : row.clientWidth * .8;
  };
  previous.addEventListener('click', () => row.scrollBy({left:-step(),behavior:'smooth'}));
  next.addEventListener('click', () => row.scrollBy({left:step(),behavior:'smooth'}));
  row.addEventListener('scroll', update, {passive:true});
  new MutationObserver(update).observe(row, {childList:true});
  if ('ResizeObserver' in window) new ResizeObserver(update).observe(row);
  else window.addEventListener('resize', update);
  update();
}
