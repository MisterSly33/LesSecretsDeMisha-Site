/* Panier local : aucune donnée personnelle stockée avant envoi. */
(() => {
  const EMAIL = 'coucou@lessecretsdemisha.fr';
  const ENDPOINT = `https://formsubmit.co/ajax/${EMAIL}`;
  const cart = new Map();
  const lines = document.getElementById('misha-cart-lines');
  const total = document.getElementById('misha-cart-total');
  const count = document.getElementById('misha-cart-count');
  const shopCount = document.getElementById('misha-shop-count');
  const form = document.getElementById('misha-order-form');
  const status = document.getElementById('misha-order-status');
  const money = n => n.toLocaleString('fr-FR',{style:'currency',currency:'EUR'});
  const render = () => {
    lines.replaceChildren();
    let n = 0, sum = 0, hasUnpriced = false;
    for (const [name, item] of cart) {
      n += item.quantity;
      if (item.price === null) hasUnpriced = true;
      else sum += item.quantity * item.price;
      const row = document.createElement('div'); row.className = 'misha-cart-row';
      const title = document.createElement('span'); title.textContent = `${name} — ${item.price === null ? 'prix sur demande' : money(item.price)}`;
      const qty = document.createElement('input'); qty.type='number'; qty.min='1'; qty.max=String(item.max); qty.value=String(item.quantity); qty.setAttribute('aria-label',`Quantité de ${name}`);
      qty.addEventListener('change',()=>{ const v=Number(qty.value); if (!Number.isInteger(v)||v<1||v>item.max) {qty.value=String(item.quantity);return;} item.quantity=v;render(); });
      const remove = document.createElement('button');remove.type='button';remove.textContent='Retirer';remove.addEventListener('click',()=>{cart.delete(name);render();});
      row.append(title,qty,remove);lines.append(row);
    }
    if (!n) {const p=document.createElement('p');p.textContent='Votre panier est vide.';lines.append(p);}
    count.textContent=`(${n})`;
    if (shopCount) shopCount.textContent=`(${n})`;
    total.textContent=n ? `Total des produits : ${money(sum)}${hasUnpriced ? ' + produits à prix sur demande' : ''} — hors frais éventuels d'expédition.` : '';
    form.hidden=!n;
  };
  window.mishaAddToCart = (item, quantity) => {
    const existing=cart.get(item.name);
    const newQty=(existing?.quantity||0)+quantity;
    if(newQty>item.max){alert('La quantité demandée dépasse la quantité disponible indiquée.');return;}
    cart.set(item.name,{...item,quantity:newQty});render();
    document.getElementById('misha-panier').scrollIntoView({behavior:'smooth',block:'start'});
  };
  form.addEventListener('submit', async event => {
    event.preventDefault();
    if(!cart.size || !form.reportValidity())return;
    const button=form.querySelector('button[type="submit"]');button.disabled=true;
    status.textContent='Envoi en cours…';
    const data=new FormData(form);
    const detail=[...cart].map(([name,item])=>`${name} : ${item.quantity} × ${item.price === null ? 'prix à confirmer' : money(item.price)}`).join('\n');
    const reference=`MISHA-${Date.now().toString(36).toUpperCase()}`;
    const payload={_subject:`Demande boutique ${reference}`,_captcha:'true',_template:'table',reference,nom:data.get('nom'),email:data.get('email'),telephone:data.get('telephone')||'Non renseigné',remise:data.get('remise'),message:data.get('message')||'Aucun',produits:detail,total_produits:`${[...cart.values()].reduce((s,i)=>s+(i.price||0)*i.quantity,0).toFixed(2)} EUR (hors produits sans prix et livraison)`};
    try {
      const response=await fetch(ENDPOINT,{method:'POST',headers:{'Content-Type':'application/json','Accept':'application/json'},body:JSON.stringify(payload)});
      const result=await response.json();
      if(!response.ok || result.success===false || result.success==='false') throw new Error(result.message||'Envoi non confirmé');
      status.textContent=`Votre demande ${reference} a été transmise. Misha vous répondra pour la confirmer.`;
      cart.clear();render();form.reset();status.textContent=`Merci ! Votre demande ${reference} a été transmise. Misha vous répondra pour confirmer les détails.`;
    } catch (error) {
      console.error('Envoi de commande impossible',error);
      status.textContent="L'envoi n'a pas pu être confirmé. Votre panier est conservé ; réessayez plus tard ou contactez Misha par téléphone au 06 60 85 06 11.";
    } finally {button.disabled=false;}
  });
  render();
})();
