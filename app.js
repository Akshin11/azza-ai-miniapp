(() => {
  const tg = window.Telegram?.WebApp;
  try { tg?.ready(); tg?.expand(); } catch (_) {}
  const screens = [...document.querySelectorAll('.screen')];
  const navItems = [...document.querySelectorAll('.nav-item')];
  const toast = document.getElementById('toast');
  let toastTimer;
  const names = {home:'Главная',chat:'AI Chat',photo:'Фото AI',video:'Видео AI',voice:'Озвучка',works:'Мои работы',premium:'Premium',profile:'Профиль'};

  function showToast(message) {
    toast.textContent = message;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 2800);
    try { tg?.HapticFeedback?.notificationOccurred('success'); } catch (_) {}
  }
  function navigate(name) {
    if (!names[name]) return;
    screens.forEach(s => s.classList.toggle('active', s.dataset.screen === name));
    navItems.forEach(b => b.classList.toggle('active', b.dataset.navigate === name));
    document.querySelector('.app-shell').scrollIntoView({block:'start',behavior:'smooth'});
  }
  document.addEventListener('click', event => {
    const nav = event.target.closest('[data-navigate]');
    if (nav) { navigate(nav.dataset.navigate); return; }
    const info = event.target.closest('[data-toast]');
    if (info) { showToast(info.dataset.toast); return; }
    const demo = event.target.closest('[data-demo]');
    if (demo) { showToast(demo.dataset.demo); return; }
    const prompt = event.target.closest('[data-prompt]');
    if (prompt) { navigate('chat'); document.getElementById('chat-input').value = prompt.dataset.prompt; document.getElementById('chat-input').focus(); return; }
    const photoMode = event.target.closest('[data-photo-mode]');
    if (photoMode) {
      document.querySelectorAll('[data-photo-mode]').forEach(b => b.classList.toggle('selected', b === photoMode));
      const edit = photoMode.dataset.photoMode === 'edit';
      document.getElementById('photo-prompt').placeholder = edit ? 'Опиши, что изменить на фотографии...' : 'Опиши изображение, которое хочешь создать...';
      document.getElementById('photo-upload-title').textContent = edit ? 'Загрузи фото для редактирования' : 'Добавить референс (необязательно)';
      return;
    }
    const chip = event.target.closest('.chips .chip, .filter-chips .chip');
    if (chip) { chip.parentElement.querySelectorAll('.chip').forEach(c => c.classList.toggle('selected', c === chip)); return; }
    const billing = event.target.closest('[data-billing]');
    if (billing) {
      document.querySelectorAll('[data-billing]').forEach(b => b.classList.toggle('selected', b === billing));
      const annual = billing.dataset.billing === 'year';
      document.querySelectorAll('[data-month-price]').forEach(p => { const price = annual ? p.dataset.yearPrice : p.dataset.monthPrice; p.innerHTML = `${price} ₽<small> / ${annual ? 'год' : 'мес'}</small>`; });
      return;
    }
  });

  document.getElementById('photo-upload').addEventListener('click', () => document.getElementById('photo-file').click());
  document.getElementById('photo-file').addEventListener('change', event => {
    const file = event.target.files?.[0];
    if (file) { document.getElementById('photo-upload-title').textContent = file.name; document.getElementById('photo-upload-subtitle').textContent = 'Файл выбран'; }
  });
  const voiceText = document.getElementById('voice-text');
  voiceText.addEventListener('input', () => document.getElementById('voice-count').textContent = voiceText.value.length);

  const chatForm = document.getElementById('chat-form');
  const chatInput = document.getElementById('chat-input');
  const chatMessages = document.getElementById('chat-messages');
  function addMessage(text, role) {
    const node = document.createElement('div');
    node.className = `chat-bubble ${role}`;
    node.textContent = text;
    chatMessages.appendChild(node);
  }
  chatForm.addEventListener('submit', event => {
    event.preventDefault();
    const value = chatInput.value.trim();
    if (!value) return;
    addMessage(value, 'user');
    addMessage('Экран готов. Чтобы отвечать на сообщения, нужно подключить AI-провайдера.', 'assistant');
    chatInput.value = '';
    chatInput.style.height = 'auto';
    chatMessages.scrollIntoView({block:'nearest',behavior:'smooth'});
  });
  chatInput.addEventListener('input', () => { chatInput.style.height = 'auto'; chatInput.style.height = `${Math.min(chatInput.scrollHeight,120)}px`; });
  document.querySelector('[data-chat-clear]').addEventListener('click', () => { chatMessages.replaceChildren(); showToast('Начат новый демонстрационный чат'); });

  if (tg?.initDataUnsafe?.user) {
    const user = tg.initDataUnsafe.user;
    const displayName = [user.first_name, user.last_name].filter(Boolean).join(' ');
    if (displayName) document.getElementById('profile-name').textContent = displayName;
    if (user.username) document.getElementById('profile-username').textContent = '@' + user.username;
  }
  document.querySelectorAll('[data-navigate]').forEach(button => button.addEventListener('click', () => { try { tg?.HapticFeedback?.selectionChanged(); } catch (_) {} }));
})();
