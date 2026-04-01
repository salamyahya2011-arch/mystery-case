const role = document.querySelector('[data-role]')?.dataset.role;
const socket = new WebSocket(`ws://${location.host}`);
let currentState = null;
let joined = false;

const elements = {
  ipList: document.getElementById('ipList'),
  difficulty: document.getElementById('difficulty'),
  playerLimit: document.getElementById('playerLimit'),
  caseSelect: document.getElementById('caseSelect'),
  startGame: document.getElementById('startGame'),
  resetGame: document.getElementById('resetGame'),
  advanceChapter: document.getElementById('advanceChapter'),
  chapterStatus: document.getElementById('chapterStatus'),
  playerList: document.getElementById('playerList'),
  playerName: document.getElementById('playerName'),
  joinBtn: document.getElementById('joinBtn'),
  joinStatus: document.getElementById('joinStatus'),
  caseOverview: document.getElementById('caseOverview'),
  fileList: document.getElementById('fileList'),
  truthOptions: document.getElementById('truthOptions'),
  wellOptions: document.getElementById('wellOptions'),
  guiltyOptions: document.getElementById('guiltyOptions'),
  submitSolution: document.getElementById('submitSolution'),
  attempts: document.getElementById('attempts'),
  solveResult: document.getElementById('solveResult')
};

function send(type, payload) {
  socket.send(JSON.stringify({ type, payload }));
}

function setText(el, text) {
  if (!el) return;
  el.textContent = text;
}

function renderHost(state) {
  if (!state) return;

  if (elements.caseSelect && elements.caseSelect.options.length === 0 && state.caseData) {
    // Case list is sent in state.caseData only for current case, so build from data in DOM
  }

  if (elements.playerList) {
    elements.playerList.innerHTML = '';
    if (state.players.length === 0) {
      elements.playerList.innerHTML = '<li>No players connected yet.</li>';
    } else {
      state.players.forEach((p) => {
        const li = document.createElement('li');
        li.textContent = `${p.name} (Attempts: ${p.attempts})`;
        elements.playerList.appendChild(li);
      });
    }
  }

  if (elements.chapterStatus) {
    if (!state.started || !state.caseData) {
      elements.chapterStatus.textContent = 'No game running.';
      elements.chapterStatus.className = 'result bad';
    } else {
      elements.chapterStatus.textContent = `Case: ${state.caseData.title} | Chapters unlocked: ${state.chapterUnlocked}/${state.chapterTotal}`;
      elements.chapterStatus.className = 'result';
    }
  }
}

function renderPlayer(state) {
  if (!state || !elements.caseOverview) return;

  if (!state.started || !state.caseData) {
    setText(elements.caseOverview, 'Waiting for host to start a game.');
    elements.fileList.innerHTML = '';
    return;
  }

  elements.caseOverview.innerHTML = `
    <strong>${state.caseData.title}</strong><br />
    ${state.caseData.intro}<br />
    Difficulty: ${state.difficulty} | Chapters unlocked: ${state.chapterUnlocked}/${state.chapterTotal}
  `;

  renderFileList(state);
  renderSolveOptions(state);
}

function renderFileList(state) {
  if (!elements.fileList || !state.caseData) return;
  elements.fileList.innerHTML = '';

  const chapters = state.caseData.chapters;
  chapters.forEach((chapter, index) => {
    const card = document.createElement('div');
    card.className = 'card';
    const unlocked = index < state.chapterUnlocked;
    if (!unlocked) card.classList.add('locked');

    const text = unlocked ? chapter.text.map((t) => `<p>${t}</p>`).join('') : '<p>Locked file. Finish chapter on the main TV to unlock.</p>';
    card.innerHTML = `<h3>${chapter.title}</h3>${text}`;
    elements.fileList.appendChild(card);
  });
}

function renderSolveOptions(state) {
  const suspects = state.caseData?.suspects || [];
  const makeOptions = (container, name) => {
    container.innerHTML = suspects
      .map((s) => `<label><input type="radio" name="${name}" value="${s.name}"> ${s.name}</label>`)
      .join('');
  };

  if (elements.truthOptions) makeOptions(elements.truthOptions, 'truth');
  if (elements.wellOptions) makeOptions(elements.wellOptions, 'well');
  if (elements.guiltyOptions) makeOptions(elements.guiltyOptions, 'guilty');
}

function playSolveSound() {
  const ctx = new (window.AudioContext || window.webkitAudioContext)();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sine';
  osc.frequency.value = 440;
  gain.gain.value = 0.0001;
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start();
  gain.gain.exponentialRampToValueAtTime(0.3, ctx.currentTime + 0.05);
  osc.frequency.exponentialRampToValueAtTime(660, ctx.currentTime + 0.15);
  gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.4);
  osc.stop(ctx.currentTime + 0.45);
}

socket.addEventListener('message', (event) => {
  const data = JSON.parse(event.data);
  if (data.type === 'state') {
    currentState = data.payload;
    if (role === 'host') renderHost(currentState);
    if (role === 'player') renderPlayer(currentState);
  }
  if (data.type === 'join-denied' && role === 'player') {
    setText(elements.joinStatus, data.payload.reason);
    elements.joinStatus.className = 'result bad';
  }
  if (data.type === 'submit-result' && role === 'player') {
    const { solved, attempts } = data.payload;
    setText(elements.attempts, `Attempts: ${attempts}`);
    if (solved) {
      setText(elements.solveResult, 'CASE SOLVED');
      elements.solveResult.className = 'result good';
      playSolveSound();
    } else {
      setText(elements.solveResult, 'Try again');
      elements.solveResult.className = 'result bad';
    }
  }
});

socket.addEventListener('open', async () => {
  if (role === 'host') {
    const info = await fetch('/api/info').then((r) => r.json()).catch(() => ({ ips: [] }));
    if (elements.ipList) {
      elements.ipList.innerHTML = '';
      if (info.ips.length === 0) {
        elements.ipList.innerHTML = '<li>No IP found. Use localhost.</li>';
      } else {
        info.ips.forEach((ip) => {
          const li = document.createElement('li');
          li.textContent = `http://${ip}:${info.port}`;
          elements.ipList.appendChild(li);
        });
      }
    }

    // Populate case selection on host
    fetch('/api/info')
      .then(() => {
        // cases are embedded in server state and sent when game starts; we build options from static list
        const cases = [
          'The Black Hollow Disappearance',
          'The Lantern in Ash Hollow',
          'The Cold Mill Break-In',
          'The Riverstone Ledger',
          'The Night Market Vanish'
        ];
        if (elements.caseSelect) {
          elements.caseSelect.innerHTML = '';
          cases.forEach((title, idx) => {
            const opt = document.createElement('option');
            opt.value = `case-${idx + 1}`;
            opt.textContent = title;
            elements.caseSelect.appendChild(opt);
          });
        }
      });
  }
});

if (role === 'host') {
  elements.startGame?.addEventListener('click', () => {
    send('host-start', {
      difficulty: elements.difficulty.value,
      playerLimit: elements.playerLimit.value,
      caseId: elements.caseSelect.value
    });
  });

  elements.advanceChapter?.addEventListener('click', () => {
    send('host-advance');
  });

  elements.resetGame?.addEventListener('click', () => {
    send('host-reset');
  });
}

if (role === 'player') {
  elements.joinBtn?.addEventListener('click', () => {
    if (joined) return;
    const name = elements.playerName.value.trim() || 'Detective';
    send('join', { name });
    joined = true;
    setText(elements.joinStatus, 'Joined. Waiting for case.');
    elements.joinStatus.className = 'result';
  });

  elements.submitSolution?.addEventListener('click', () => {
    const truth = document.querySelector('input[name="truth"]:checked')?.value;
    const well = document.querySelector('input[name="well"]:checked')?.value;
    const guilty = document.querySelector('input[name="guilty"]:checked')?.value;

    if (!truth || !well || !guilty) {
      setText(elements.solveResult, 'Select all answers.');
      elements.solveResult.className = 'result bad';
      return;
    }

    send('submit-solution', { truth, well, guilty });
  });
}
