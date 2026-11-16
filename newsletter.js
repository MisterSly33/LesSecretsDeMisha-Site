/* Inscription à la lettre de Misha : transmission de la demande par FormSubmit.
   IMPORTANT : ceci ne constitue pas une plateforme d'envoi de newsletters.
   Les adresses reçues doivent être conservées dans une liste d'abonnés sécurisée,
   avec une procédure de désinscription avant tout envoi de newsletter. */
(() => {
  const form = document.getElementById('misha-newsletter-form');
  if (!form) return;
  const status = document.getElementById('misha-newsletter-status');
  const endpoint = 'https://formsubmit.co/ajax/coucou@lessecretsdemisha.fr';
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    const button = form.querySelector('button[type="submit"]');
    const address = form.elements.email.value.trim();
    button.disabled = true;
    status.textContent = 'Inscription en cours…';
    try {
      const response = await fetch(endpoint, {
        method:'POST', headers:{'Content-Type':'application/json','Accept':'application/json'},
        body:JSON.stringify({
          _subject:'MISHA | Nouvelle inscription à la newsletter',
          _template:'table', _captcha:'true',
          'Type de demande':'Inscription à la newsletter Les petits secrets de Misha',
          'Adresse e-mail':address,
          'Consentement':'Oui — accord explicite pour recevoir la newsletter'
        })
      });
      const result = await response.json();
      if (!response.ok || result.success === false || result.success === 'false') throw new Error('Envoi non confirmé');
      status.textContent = 'Merci ! Votre demande d’inscription a bien été envoyée à Misha. 🌿';
      form.reset();
    } catch(error) {
      console.error('Inscription newsletter non transmise', error);
      status.textContent = 'L’inscription n’a pas pu être confirmée. Réessayez plus tard.';
    } finally { button.disabled = false; }
  });
})();
