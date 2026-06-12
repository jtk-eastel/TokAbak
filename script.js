(function(){
  const WA_LINK = 'https://api.whatsapp.com/send/?phone=601175947174&text=NakTahuCaraMula&type=phone_number&app_absent=0';
  const money = (n) => 'RM' + Number(n || 0).toLocaleString('en-MY',{minimumFractionDigits: Number(n)%1 ? 2 : 0, maximumFractionDigits:2});
  const pct = (n) => Math.min(100, Math.max(0, n)).toFixed(0) + '%';

  document.querySelectorAll('[data-wa]').forEach(a => a.href = WA_LINK);

  const menuBtn = document.querySelector('[data-menu-toggle]');
  const menu = document.querySelector('[data-mobile-menu]');
  if(menuBtn && menu){
    menuBtn.addEventListener('click', () => {
      const open = menu.classList.toggle('open');
      document.body.classList.toggle('menu-open', open);
      menuBtn.setAttribute('aria-expanded', String(open));
    });
    menu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
      menu.classList.remove('open');
      document.body.classList.remove('menu-open');
      menuBtn.setAttribute('aria-expanded','false');
    }));
  }

  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if(entry.isIntersecting){
        entry.target.classList.add('in-view');
        io.unobserve(entry.target);
      }
    });
  }, {threshold:.12});
  document.querySelectorAll('.reveal').forEach(el => io.observe(el));

  document.querySelectorAll('[data-count]').forEach(el => {
    const target = Number(el.dataset.count || 0);
    const prefix = el.dataset.prefix || '';
    const suffix = el.dataset.suffix || '';
    let started = false;
    const countIO = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if(!entry.isIntersecting || started) return;
        started = true;
        const start = performance.now();
        const dur = 900;
        const tick = now => {
          const p = Math.min(1, (now - start) / dur);
          const val = Math.round(target * (1 - Math.pow(1-p, 3)));
          el.textContent = prefix + val.toLocaleString('en-MY') + suffix;
          if(p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      });
    }, {threshold:.6});
    countIO.observe(el);
  });

  document.querySelectorAll('.faq-item').forEach(item => {
    const btn = item.querySelector('.faq-question');
    const icon = item.querySelector('.faq-icon');
    if(!btn) return;
    btn.addEventListener('click', () => {
      const isOpen = item.classList.toggle('open');
      btn.setAttribute('aria-expanded', String(isOpen));
      if(icon) icon.textContent = isOpen ? '−' : '+';
    });
  });

  const calcRoot = document.querySelector('[data-income-calculator]');
  if(calcRoot){
    const rates = {1:.13,2:.03,3:.08,4:.015,5:.015,6:.015,7:.015,8:.015,9:.01,10:.01,11:.01,12:.01,13:.01};
    const groups = [
      {
        key:'elite', title:'Elite Member', short:'Elite', from:1, to:3, threshold:0,
        desc:'Asas pertama. Fokus pada L1-L3 dan pengguna aktif yang benar-benar reload.',
        locked:'Elite Member ialah titik mula. Isi pengguna aktif L1-L3 untuk lihat progress ke Ambassador.'
      },
      {
        key:'ambassador', title:'Ambassador', short:'Ambassador', from:4, to:8, threshold:500,
        desc:'L4-L8 terbuka selepas simulasi capai RM500 komisen reload.',
        locked:'Level 4 hingga Level 8 belum dibuka. Capai RM500 komisen reload untuk buka simulasi Ambassador.'
      },
      {
        key:'senior', title:'Senior Ambassador', short:'Senior', from:9, to:13, threshold:3500,
        desc:'L9-L13 terbuka selepas simulasi capai RM3,500 komisen reload.',
        locked:'Level 9 hingga Level 13 belum dibuka. Capai RM3,500 komisen reload untuk buka simulasi Senior Ambassador.'
      }
    ];

    const journey = calcRoot.querySelector('[data-unlock-journey]');
    const reloadInput = calcRoot.querySelector('[data-reload]');
    const customWrap = calcRoot.querySelector('[data-custom-wrap]');
    const customInput = calcRoot.querySelector('[data-custom-reload]');
    const resultUsers = calcRoot.querySelector('[data-result-users]');
    const resultReload = calcRoot.querySelector('[data-result-reload]');
    const resultCommission = calcRoot.querySelector('[data-result-commission]');
    const ambassadorBar = calcRoot.querySelector('[data-ambassador-bar]');
    const seniorBar = calcRoot.querySelector('[data-senior-bar]');
    const ambassadorText = calcRoot.querySelector('[data-ambassador-text]');
    const seniorText = calcRoot.querySelector('[data-senior-text]');
    const breakdown = calcRoot.querySelector('[data-breakdown]');
    const statusIcon = calcRoot.querySelector('[data-status-icon]');
    const statusTitle = calcRoot.querySelector('[data-status-title]');

    function iconSvg(type){
      const isUnlock = type === 'unlock';
      return `<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M7 10V7a5 5 0 0 1 ${isUnlock ? '8.8-3.2' : '10 0'}"/><rect x="5" y="10" width="14" height="10" rx="2"/><path d="M12 14v2"/></svg>`;
    }

    function buildJourney(){
      journey.innerHTML = '';
      groups.forEach(group => {
        const panel = document.createElement('article');
        panel.className = 'rank-unlock-panel';
        panel.dataset.group = group.key;
        let levelCards = '';
        for(let i=group.from;i<=group.to;i++){
          const def = i===1 ? 10 : i===2 ? 100 : i===3 ? 1000 : 0;
          const rateLabel = (rates[i] * 100).toFixed(i <= 3 ? 0 : 1) + '%';
          levelCards += `<label class="level-card unlock-level-card" data-level-card="${i}"><span><b>L${i}</b><small>${rateLabel}</small></span><input type="number" min="0" inputmode="numeric" value="${def}" data-level="${i}" aria-label="L${i} pengguna aktif"></label>`;
        }
        panel.innerHTML = `
          <div class="rank-unlock-head">
            <span class="state-icon" data-group-icon>${iconSvg('lock')}</span>
            <div>
              <h3>${group.title}</h3>
              <p>${group.desc}</p>
            </div>
            <span class="unlock-badge" data-group-badge>Locked</span>
          </div>
          <div class="rank-locked-message" data-locked-message>${group.locked}</div>
          <div class="level-grid unlock-level-grid">${levelCards}</div>
        `;
        journey.appendChild(panel);
      });
    }

    function reloadValue(){
      if(reloadInput.value === 'custom') return Math.max(0, Number(customInput.value || 0));
      return Number(reloadInput.value || 35);
    }

    function setPreset(type){
      const presets = {
        5:{1:5,2:25,3:125},
        10:{1:10,2:100,3:1000},
        manual:null
      };
      if(presets[type]){
        calcRoot.querySelectorAll('[data-level]').forEach(input => {
          const lvl = Number(input.dataset.level);
          input.value = presets[type][lvl] || 0;
        });
      }
      calcRoot.querySelectorAll('[data-preset]').forEach(btn => btn.classList.toggle('active', btn.dataset.preset === type));
      calc();
    }

    function groupSum(from, to, reload, unlocked){
      let users = 0, reloadTotal = 0, commission = 0;
      for(let i=from;i<=to;i++){
        const input = calcRoot.querySelector(`[data-level="${i}"]`);
        const val = Math.max(0, Number(input?.value || 0));
        users += val;
        reloadTotal += val * reload;
        if(unlocked) commission += val * reload * rates[i];
      }
      return {users, reloadTotal, commission};
    }

    function setGroupState(key, unlocked, activeText){
      const panel = calcRoot.querySelector(`[data-group="${key}"]`);
      if(!panel) return;
      const badge = panel.querySelector('[data-group-badge]');
      const icon = panel.querySelector('[data-group-icon]');
      panel.classList.toggle('is-locked', !unlocked);
      panel.classList.toggle('is-unlocked', unlocked);
      badge.textContent = activeText || (unlocked ? 'Unlocked' : 'Locked');
      icon.innerHTML = iconSvg(unlocked ? 'unlock' : 'lock');
      panel.querySelectorAll('[data-level]').forEach(input => input.disabled = !unlocked);
    }

    function calc(){
      const reload = reloadValue();

      const elite = groupSum(1,3,reload,true);
      const ambassadorUnlocked = elite.commission >= 500;
      const ambassador = groupSum(4,8,reload,ambassadorUnlocked);
      const seniorBase = elite.commission + ambassador.commission;
      const seniorUnlocked = seniorBase >= 3500;
      const senior = groupSum(9,13,reload,seniorUnlocked);

      setGroupState('elite', true, 'Active');
      setGroupState('ambassador', ambassadorUnlocked);
      setGroupState('senior', seniorUnlocked);

      const totalUsers = elite.users + (ambassadorUnlocked ? ambassador.users : 0) + (seniorUnlocked ? senior.users : 0);
      const totalReload = elite.reloadTotal + (ambassadorUnlocked ? ambassador.reloadTotal : 0) + (seniorUnlocked ? senior.reloadTotal : 0);
      const totalCommission = elite.commission + ambassador.commission + senior.commission;

      const ambPct = Math.min(100, elite.commission / 500 * 100);
      const senPct = Math.min(100, seniorBase / 3500 * 100);

      resultUsers.textContent = totalUsers.toLocaleString('en-MY');
      resultReload.textContent = money(totalReload);
      resultCommission.textContent = money(totalCommission);
      ambassadorBar.style.width = pct(ambPct);
      seniorBar.style.width = pct(senPct);
      ambassadorText.textContent = ambassadorUnlocked ? 'Unlocked' : pct(ambPct) + ' ke RM500';
      seniorText.textContent = seniorUnlocked ? 'Unlocked' : pct(senPct) + ' ke RM3,500';

      if(seniorUnlocked){
        statusTitle.textContent = 'Senior Ambassador Unlocked';
        statusIcon.innerHTML = iconSvg('unlock');
      } else if(ambassadorUnlocked){
        statusTitle.textContent = 'Ambassador Unlocked';
        statusIcon.innerHTML = iconSvg('unlock');
      } else {
        statusTitle.textContent = 'Elite Member';
        statusIcon.innerHTML = iconSvg('lock');
      }

      const rows = [
        {title:'Elite Member • L1-L3', value:elite.commission, unlocked:true},
        {title:'Ambassador • L4-L8', value:ambassador.commission, unlocked:ambassadorUnlocked},
        {title:'Senior Ambassador • L9-L13', value:senior.commission, unlocked:seniorUnlocked}
      ];
      breakdown.innerHTML = rows.map(row => `<div class="breakdown-row ${row.unlocked ? 'row-unlocked' : 'row-locked'}"><span>${row.title}</span><b>${row.unlocked ? money(row.value) : 'Locked'}</b></div>`).join('');
    }

    buildJourney();
    calcRoot.addEventListener('input', calc);
    reloadInput.addEventListener('change', () => { customWrap.hidden = reloadInput.value !== 'custom'; calc(); });
    calcRoot.querySelectorAll('[data-preset]').forEach(btn => btn.addEventListener('click', () => setPreset(btn.dataset.preset)));
    setPreset('10');
  }

  const eskRoot = document.querySelector('[data-esk-calculator]');
  if(eskRoot){
    const rates = {l1:128,l2:38,l3:28};
    const inputs = ['l1','l2','l3'].reduce((acc,k)=>{acc[k]=eskRoot.querySelector(`[data-esk-${k}]`); return acc;},{});
    const outs = ['l1','l2','l3'].reduce((acc,k)=>{acc[k]=eskRoot.querySelector(`[data-esk-result-${k}]`); return acc;},{});
    const total = eskRoot.querySelector('[data-esk-total]');
    function setPreset(type){
      const vals = {conservative:{l1:3,l2:9,l3:27},10:{l1:10,l2:100,l3:1000},30:{l1:30,l2:900,l3:27000}}[type] || {l1:10,l2:100,l3:1000};
      Object.keys(inputs).forEach(k => inputs[k].value = vals[k]);
      eskRoot.querySelectorAll('[data-esk-preset]').forEach(btn => btn.classList.toggle('active', btn.dataset.eskPreset === type));
      calc();
    }
    function calc(){
      let grand = 0;
      Object.keys(inputs).forEach(k => {
        const val = Math.max(0, Number(inputs[k].value || 0)) * rates[k];
        grand += val;
        outs[k].textContent = money(val);
      });
      total.textContent = money(grand);
    }
    eskRoot.addEventListener('input', calc);
    eskRoot.querySelectorAll('[data-esk-preset]').forEach(btn => btn.addEventListener('click', () => setPreset(btn.dataset.eskPreset)));
    setPreset('10');
  }
})();
