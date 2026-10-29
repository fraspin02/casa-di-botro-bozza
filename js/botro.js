// La Casa di Botro — bozza. Pochi comportamenti, tutti con il contenuto visibile anche senza script.
(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Entrate una volta sola, quando la sezione arriva.
  const targets = document.querySelectorAll('[data-reveal]');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.08 });
    targets.forEach((el) => io.observe(el));
    // recupero: se si scorre veloce (o si salta a un'ancora) mostra tutto ciò che è già passato
    let ticking = false;
    const catchUp = () => {
      ticking = false;
      targets.forEach((el) => { if (!el.classList.contains('is-in') && el.getBoundingClientRect().top < innerHeight) el.classList.add('is-in'); });
    };
    addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(catchUp); } }, { passive: true });
    addEventListener('resize', catchUp);
    addEventListener('load', () => setTimeout(() => targets.forEach((el) => {
      const r = el.getBoundingClientRect(); if (r.top < innerHeight && r.bottom > 0) el.classList.add('is-in');
    }), 2500));
  } else targets.forEach((el) => el.classList.add('is-in'));

  // Dissolvenza lenta tra le foto della stampa alta.
  const frame = document.querySelector('[data-fade]');
  if (frame && !reduce) {
    const imgs = [...frame.querySelectorAll('img')];
    imgs.forEach((im) => { im.loading = 'eager'; });
    let i = 0, timer;
    const step = () => { imgs[i].style.opacity = 0; i = (i + 1) % imgs.length; imgs[i].style.opacity = 1; };
    const start = () => { clearInterval(timer); timer = setInterval(step, 5600); };
    imgs[0].style.opacity = 1;
    start();
    document.addEventListener('visibilitychange', () => document.hidden ? clearInterval(timer) : start());
  }

  // 250 ettari, mese per mese.
  const farm = document.querySelector('.farm');
  if (farm) {
    const names = ['gennaio', 'febbraio', 'marzo', 'aprile', 'maggio', 'giugno', 'luglio', 'agosto', 'settembre', 'ottobre', 'novembre', 'dicembre'];
    const art = (m) => 'In ' + names[m - 1];
    const rate = {
      1: 'Media stagione fino al 7 gennaio, poi tariffe su richiesta',
      2: 'Tariffe su richiesta',
      3: 'Media stagione a Pasqua, dal 26 marzo',
      4: 'Media stagione fino al 1° aprile, poi tariffe su richiesta',
      5: 'Bassa stagione dal 22 maggio: Basic da 110 €, Suite da 200 €',
      6: 'Bassa stagione fino al 5 giugno, poi media: Basic 130 €, Suite 220 €',
      7: 'Media stagione: Basic 130 €, Suite 220 €',
      8: 'Alta stagione dal 7 al 21 agosto: Basic 150 €, Suite 240 €',
      9: 'Bassa stagione: Basic 110 €, Suite 200 €',
      10: 'Tariffe su richiesta',
      11: 'Tariffe su richiesta',
      12: 'Media stagione dal 22 dicembre'
    };
    const note = {
      1: 'Olio nuovo in dispensa, carne dell\'allevamento a tavola.',
      2: 'I campi riposano; in dispensa olio, miele e marmellate.',
      3: 'Cominciano gli asparagi verdi.',
      4: 'Asparagi verdi, campi di grano ancora verdi.',
      5: 'Ultimi asparagi; apre la piscina e il ristorante passa alle cene.',
      6: 'Albicocche e mietitura di frumento e orzo.',
      7: 'Si raccolgono i ceci; spiaggia e piscina al massimo.',
      8: 'Ceci in dispensa, cene all\'aperto con il barbecue.',
      9: 'Mare ancora caldo, ultime cene d\'estate.',
      10: 'Si raccolgono le olive.',
      11: 'Raccolta delle olive e olio nuovo.',
      12: 'Fine della raccolta delle olive.'
    };
    const $ = (id) => document.getElementById(id);
    const detail = $('m-detail');
    const set = (m) => {
      farm.dataset.month = m;
      farm.querySelectorAll('.months button').forEach((b) => b.setAttribute('aria-pressed', String(+b.dataset.m === m)));
      farm.querySelectorAll('.names li').forEach((li) => {
        const on = li.dataset.months.split(',').map(Number).includes(m);
        on ? li.removeAttribute('data-off') : li.setAttribute('data-off', '');
      });
      $('m-name').textContent = art(m);
      $('m-rist').textContent = (m >= 6 && m <= 9) || m === 5 ? (m === 5 ? 'Domenica a pranzo; dal 22 maggio tutti i giorni a cena' : 'Tutti i giorni a cena') : 'La domenica a pranzo';
      $('m-pool').textContent = m >= 5 && m <= 9 ? 'Aperta, con la spiaggia privata' : 'Chiusa, riapre a maggio';
      $('m-rate').textContent = rate[m];
      detail.textContent = note[m];
    };
    farm.querySelectorAll('.months button').forEach((b) => b.addEventListener('click', () => set(+b.dataset.m)));
    farm.querySelectorAll('.names li button').forEach((b) => {
      const show = () => { detail.textContent = b.parentElement.dataset.desc; };
      b.addEventListener('mouseenter', show);
      b.addEventListener('focus', show);
      b.addEventListener('click', show);
    });
    set(new Date().getMonth() + 1);
  }

  // Modulo di richiesta (pagina camere): compone un messaggio WhatsApp con i dati scelti.
  const form = document.getElementById('richiesta');
  if (form) form.addEventListener('submit', (e) => {
    e.preventDefault();
    const d = new FormData(form);
    const txt = `Buongiorno, vorrei sapere se avete disponibilità alla Casa di Botro.\nArrivo: ${d.get('arrivo') || '-'}\nPartenza: ${d.get('partenza') || '-'}\nOspiti: ${d.get('ospiti') || '-'}\nSistemazione: ${d.get('tipo') || '-'}\n${d.get('note') || ''}`;
    window.open('https://wa.me/393274677776?text=' + encodeURIComponent(txt), '_blank', 'noopener');
  });
})();
