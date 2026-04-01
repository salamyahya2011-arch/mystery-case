import { initializeApp } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-app.js";
import {
  getDatabase,
  ref,
  set,
  update,
  push,
  onValue,
  get,
  onDisconnect
} from "https://www.gstatic.com/firebasejs/12.11.0/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyCuIsggaT5Pp5kGjvE6ZhS1-61k0Captn0",
  authDomain: "mystery-case-solver.firebaseapp.com",
  databaseURL: "https://mystery-case-solver-default-rtdb.firebaseio.com",
  projectId: "mystery-case-solver",
  storageBucket: "mystery-case-solver.firebasestorage.app",
  messagingSenderId: "284969051191",
  appId: "1:284969051191:web:f2da062d58c259c8768bb2",
  measurementId: "G-EM7C11FT8F"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

const role = document.querySelector('[data-role]')?.dataset.role;
let currentState = null;
let currentRoom = null;
let playerId = localStorage.getItem('bh_player_id') || Math.random().toString(36).slice(2);
localStorage.setItem('bh_player_id', playerId);

const cases = [
  {
    id: 'case-1',
    title: 'The Black Hollow Disappearance',
    intro: 'Mr. Kareem disappeared from his farmhouse at night.',
    suspects: [
      { name: 'Layla', role: 'Neighbor', statement: 'She never left her house.' },
      { name: 'Yusuf', role: 'Worker', statement: 'He was in the village after being fired.' },
      { name: 'Hamad', role: 'Hunter', statement: 'He saw Yusuf near the forest.' }
    ],
    clues: [
      'Footprints: size 44 and size 41',
      'Phone message: "He knows"',
      'Barn scratches (forced open)',
      'Map marked "Old Well"'
    ],
    facts: [
      'Yusuf = size 44',
      'Hamad = size 41',
      'Layla does not wear boots',
      'Only ONE person is telling the truth'
    ],
    chapters: [
      { title: 'Chapter 1: Night Signs', text: ['Footprints appear near the barn.', 'Two sizes were found.'] },
      { title: 'Chapter 2: The Message', text: ['A phone buzzes: "He knows".', 'The barn was forced open.'] },
      { title: 'Chapter 3: The Map', text: ['A map points to the Old Well.', 'The trail heads toward the forest.'] },
      { title: 'Chapter 4: Witness Line', text: ['Hamad claims he saw Yusuf near the forest.', 'Layla insists she stayed home.'] },
      { title: 'Chapter 5: Final Thread', text: ['Only one person is telling the truth.', 'Boot sizes match the prints.'] }
    ],
    solution: { truth: 'Hamad', well: 'Yusuf', guilty: 'Yusuf' }
  },
  {
    id: 'case-2',
    title: 'The Lantern in Ash Hollow',
    intro: 'A lantern was stolen from the Ash Hollow shrine at dusk.',
    suspects: [
      { name: 'Noura', role: 'Caretaker', statement: 'She locked the shrine at sunset.' },
      { name: 'Salim', role: 'Fisher', statement: 'He was mending nets by the river.' },
      { name: 'Rashid', role: 'Trader', statement: 'He saw Salim near the docks.' }
    ],
    clues: [
      'Wet footprints size 42',
      'Rope fibers on the gate',
      'Lantern oil trail to the docks',
      'Scrap of blue cloth'
    ],
    facts: [
      'Salim = size 42',
      'Rashid wears blue cloth',
      'Noura never goes to the docks',
      'Only ONE person is telling the truth'
    ],
    chapters: [
      { title: 'Chapter 1: Shrine Gate', text: ['Rope fibers cling to the gate.', 'The lock is scratched.'] },
      { title: 'Chapter 2: Wet Prints', text: ['Wet prints head toward the docks.', 'They are size 42.'] },
      { title: 'Chapter 3: Oil Trail', text: ['Lantern oil drips along the path.', 'It ends at the boats.'] },
      { title: 'Chapter 4: Cloth Scrap', text: ['A blue cloth scrap is caught on a nail.', 'A trader uses that color.'] },
      { title: 'Chapter 5: Single Truth', text: ['Only one statement is true.', 'Someone lied about the docks.'] }
    ],
    solution: { truth: 'Rashid', well: 'Salim', guilty: 'Salim' }
  },
  {
    id: 'case-3',
    title: 'The Cold Mill Break-In',
    intro: 'The mill was broken into during the storm.',
    suspects: [
      { name: 'Mina', role: 'Miller', statement: 'She slept through the storm.' },
      { name: 'Jaber', role: 'Guard', statement: 'He patrolled the south gate.' },
      { name: 'Tariq', role: 'Carpenter', statement: 'He saw Jaber leave early.' }
    ],
    clues: [
      'Broken hinge with fresh saw marks',
      'Mud prints size 43',
      'A torn guard schedule',
      'A box of nails missing'
    ],
    facts: [
      'Jaber = size 43',
      'Tariq owns a saw',
      'Mina does not go outside in storms',
      'Only ONE person is telling the truth'
    ],
    chapters: [
      { title: 'Chapter 1: Mill Door', text: ['The hinge was cut clean.', 'Fresh saw marks are visible.'] },
      { title: 'Chapter 2: Storm Prints', text: ['Mud prints lead to the storage shed.', 'They are size 43.'] },
      { title: 'Chapter 3: Guard Schedule', text: ['A schedule page is torn.', 'The south gate entry is missing.'] },
      { title: 'Chapter 4: Missing Nails', text: ['A box of nails is gone.', 'A carpenter would need them.'] },
      { title: 'Chapter 5: Only One', text: ['Only one statement is true.', 'The saw marks point to a familiar tool.'] }
    ],
    solution: { truth: 'Tariq', well: 'Jaber', guilty: 'Jaber' }
  },
  {
    id: 'case-4',
    title: 'The Riverstone Ledger',
    intro: 'A ledger vanished from the Riverstone inn office.',
    suspects: [
      { name: 'Hana', role: 'Innkeeper', statement: 'She never left the front desk.' },
      { name: 'Bilal', role: 'Courier', statement: 'He delivered mail and left.' },
      { name: 'Omar', role: 'Baker', statement: 'He saw Bilal in the back hall.' }
    ],
    clues: [
      'Ink smears on the back door',
      'Small key missing from the hook',
      'Flour trail in the hall',
      'Ledger note: "Balance due"'
    ],
    facts: [
      'Bilal carries a master key',
      'Omar works with flour',
      'Hana always locks the back door',
      'Only ONE person is telling the truth'
    ],
    chapters: [
      { title: 'Chapter 1: Back Door', text: ['Ink smears stain the back door.', 'The lock is open.'] },
      { title: 'Chapter 2: Missing Key', text: ['A small key is gone from the hook.', 'Only staff know this spot.'] },
      { title: 'Chapter 3: Flour Trail', text: ['A flour trail cuts through the hall.', 'It leads toward storage.'] },
      { title: 'Chapter 4: Ledger Note', text: ['A note says "Balance due".', 'Someone feared exposure.'] },
      { title: 'Chapter 5: One Truth', text: ['Only one statement is true.', 'The back hall sighting matters.'] }
    ],
    solution: { truth: 'Omar', well: 'Bilal', guilty: 'Bilal' }
  },
  {
    id: 'case-5',
    title: 'The Night Market Vanish',
    intro: 'A necklace disappeared during the night market.',
    suspects: [
      { name: 'Rima', role: 'Vendor', statement: 'She never left her stall.' },
      { name: 'Fahad', role: 'Guard', statement: 'He patrolled the north gate.' },
      { name: 'Khaled', role: 'Musician', statement: 'He saw Fahad near the stalls.' }
    ],
    clues: [
      'String snapped cleanly',
      'Footprints size 45',
      'A broken gate latch',
      'A tune sheet stained with oil'
    ],
    facts: [
      'Fahad = size 45',
      'Khaled uses oil for his instrument',
      'Rima keeps her stall locked',
      'Only ONE person is telling the truth'
    ],
    chapters: [
      { title: 'Chapter 1: The Stall', text: ['The necklace string was cut.', 'The stall lock shows scratches.'] },
      { title: 'Chapter 2: North Gate', text: ['The north gate latch is broken.', 'Patrol logs are missing.'] },
      { title: 'Chapter 3: The Prints', text: ['Size 45 prints weave through stalls.', 'They stop near the musician.'] },
      { title: 'Chapter 4: Oil Sheet', text: ['A tune sheet is stained with oil.', 'The sheet belongs to a musician.'] },
      { title: 'Chapter 5: The Truth', text: ['Only one statement is true.', 'The patrol story is thin.'] }
    ],
    solution: { truth: 'Khaled', well: 'Fahad', guilty: 'Fahad' }
  }
];

const elements = {
  roomCode: document.getElementById('roomCode'),
  generateCode: document.getElementById('generateCode'),
  createRoom: document.getElementById('createRoom'),
  roomStatus: document.getElementById('roomStatus'),
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

function normalizeCode(code) {
  return code.replace(/\s+/g, '').toUpperCase();
}

function generateCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 5; i += 1) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

function getCaseData(caseId) {
  return cases.find((c) => c.id === caseId) || cases[0];
}

function setText(el, text) {
  if (!el) return;
  el.textContent = text;
}

function showFileProtocolWarning() {
  if (location.protocol !== 'file:') return false;
  const message = 'This game must be opened via a web host (GitHub Pages or Firebase Hosting). File:// blocks Firebase and modules.';
  if (role === 'host' && elements.roomStatus) {
    setText(elements.roomStatus, message);
    elements.roomStatus.className = 'result bad';
  }
  if (role === 'player' && elements.joinStatus) {
    setText(elements.joinStatus, message);
    elements.joinStatus.className = 'result bad';
  }
  return true;
}

function renderHost(state, players) {
  if (!state) return;

  if (elements.playerList) {
    elements.playerList.innerHTML = '';
    const list = players || [];
    if (list.length === 0) {
      elements.playerList.innerHTML = '<li>No players connected yet.</li>';
    } else {
      list.forEach((p) => {
        const li = document.createElement('li');
        li.textContent = `${p.name} (Attempts: ${p.attempts || 0})`;
        elements.playerList.appendChild(li);
      });
    }
  }

  if (elements.chapterStatus) {
    if (!state.started) {
      elements.chapterStatus.textContent = 'No game running.';
      elements.chapterStatus.className = 'result bad';
    } else {
      const caseData = getCaseData(state.caseId);
      elements.chapterStatus.textContent = `Case: ${caseData.title} | Chapters unlocked: ${state.chapterUnlocked}/${state.chapterTotal}`;
      elements.chapterStatus.className = 'result';
    }
  }
}

function renderPlayer(state) {
  if (!state || !elements.caseOverview) return;

  if (!state.started) {
    setText(elements.caseOverview, 'Waiting for host to start a game.');
    if (elements.fileList) elements.fileList.innerHTML = '';
    return;
  }

  const caseData = getCaseData(state.caseId);
  elements.caseOverview.innerHTML = `
    <strong>${caseData.title}</strong><br />
    ${caseData.intro}<br />
    Difficulty: ${state.difficulty} | Chapters unlocked: ${state.chapterUnlocked}/${state.chapterTotal}
  `;

  renderFileList(state, caseData);
  renderSolveOptions(caseData);
}

function renderFileList(state, caseData) {
  if (!elements.fileList) return;
  elements.fileList.innerHTML = '';

  const chapters = caseData.chapters.slice(0, state.chapterTotal);
  chapters.forEach((chapter, index) => {
    const card = document.createElement('div');
    card.className = 'card';
    const unlocked = index < state.chapterUnlocked;
    if (!unlocked) card.classList.add('locked');

    const text = unlocked
      ? chapter.text.map((t) => `<p>${t}</p>`).join('')
      : '<p>Locked file. Finish chapter on the main TV to unlock.</p>';
    card.innerHTML = `<h3>${chapter.title}</h3>${text}`;
    elements.fileList.appendChild(card);
  });
}

function renderSolveOptions(caseData) {
  const suspects = caseData.suspects || [];
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

function listenToRoom(roomCode) {
  const roomRef = ref(db, `rooms/${roomCode}`);
  onValue(roomRef, (snap) => {
    const data = snap.val();
    currentState = data?.state || null;
    if (role === 'host') {
      const players = data?.players ? Object.values(data.players) : [];
      renderHost(currentState, players);
    }
    if (role === 'player') {
      renderPlayer(currentState);
    }
  });
}

function listenToPlayers(roomCode) {
  const playersRef = ref(db, `rooms/${roomCode}/players`);
  onValue(playersRef, (snap) => {
    const players = snap.val() ? Object.values(snap.val()) : [];
    if (role === 'host') renderHost(currentState, players);
  });
}

async function createRoom(code) {
  try {
    const roomRef = ref(db, `rooms/${code}`);
    await set(roomRef, {
      state: {
        started: false,
        difficulty: 'Easy',
        playerLimit: 4,
        caseId: 'case-1',
        chapterUnlocked: 0,
        chapterTotal: 3
      },
      players: {}
    });
    currentRoom = code;
    setText(elements.roomStatus, `Room created: ${code}`);
    elements.roomStatus.className = 'result';
    listenToRoom(code);
    listenToPlayers(code);
  } catch (err) {
    setText(elements.roomStatus, `Create failed: ${err?.message || 'Unknown error'}`);
    elements.roomStatus.className = 'result bad';
  }
}

async function joinRoom(code, name) {
  try {
    const roomRef = ref(db, `rooms/${code}`);
    const snapshot = await get(roomRef);
    if (!snapshot.exists()) {
      setText(elements.joinStatus, 'Room not found.');
      elements.joinStatus.className = 'result bad';
      return;
    }
    const data = snapshot.val();
    if (data?.state?.started && data?.state?.playerLimit) {
      const count = data.players ? Object.keys(data.players).length : 0;
      if (count >= data.state.playerLimit) {
        setText(elements.joinStatus, 'Room is full.');
        elements.joinStatus.className = 'result bad';
        return;
      }
    }

    currentRoom = code;
    const playerRef = ref(db, `rooms/${code}/players/${playerId}`);
    await set(playerRef, { name, attempts: 0 });
    onDisconnect(playerRef).remove();

    setText(elements.joinStatus, `Joined room ${code}`);
    elements.joinStatus.className = 'result';
    listenToRoom(code);
  } catch (err) {
    setText(elements.joinStatus, `Join failed: ${err?.message || 'Unknown error'}`);
    elements.joinStatus.className = 'result bad';
  }
}

if (role === 'host') {
  if (showFileProtocolWarning()) {
    // Disable host buttons when opened via file://
    elements.createRoom?.setAttribute('disabled', 'true');
    elements.generateCode?.setAttribute('disabled', 'true');
    elements.startGame?.setAttribute('disabled', 'true');
    elements.advanceChapter?.setAttribute('disabled', 'true');
    elements.resetGame?.setAttribute('disabled', 'true');
  }

  if (elements.caseSelect) {
    cases.forEach((c) => {
      const opt = document.createElement('option');
      opt.value = c.id;
      opt.textContent = c.title;
      elements.caseSelect.appendChild(opt);
    });
  }

  elements.generateCode?.addEventListener('click', () => {
    if (elements.roomCode) elements.roomCode.value = generateCode();
  });

  elements.createRoom?.addEventListener('click', async () => {
    const codeInput = elements.roomCode?.value?.trim();
    if (!codeInput) {
      setText(elements.roomStatus, 'Enter or generate a code.');
      elements.roomStatus.className = 'result bad';
      return;
    }
    const code = normalizeCode(codeInput);
    await createRoom(code);
  });

  elements.startGame?.addEventListener('click', async () => {
    if (!currentRoom) return;
    const difficulty = elements.difficulty.value;
    const playerLimit = Number(elements.playerLimit.value) || 1;
    const caseId = elements.caseSelect.value;
    const chapterTotal = difficulty === 'Hard' ? 5 : difficulty === 'Medium' ? 4 : 3;

    try {
      await update(ref(db, `rooms/${currentRoom}/state`), {
        started: true,
        difficulty,
        playerLimit,
        caseId,
        chapterTotal,
        chapterUnlocked: 0
      });
    } catch (err) {
      setText(elements.roomStatus, `Start failed: ${err?.message || 'Unknown error'}`);
      elements.roomStatus.className = 'result bad';
    }
  });

  elements.advanceChapter?.addEventListener('click', async () => {
    if (!currentRoom || !currentState?.started) return;
    const next = Math.min(currentState.chapterUnlocked + 1, currentState.chapterTotal);
    try {
      await update(ref(db, `rooms/${currentRoom}/state`), {
        chapterUnlocked: next
      });
    } catch (err) {
      setText(elements.roomStatus, `Advance failed: ${err?.message || 'Unknown error'}`);
      elements.roomStatus.className = 'result bad';
    }
  });

  elements.resetGame?.addEventListener('click', async () => {
    if (!currentRoom) return;
    try {
      await update(ref(db, `rooms/${currentRoom}/state`), {
        started: false,
        chapterUnlocked: 0
      });
    } catch (err) {
      setText(elements.roomStatus, `Reset failed: ${err?.message || 'Unknown error'}`);
      elements.roomStatus.className = 'result bad';
    }
  });
}

if (role === 'player') {
  if (showFileProtocolWarning()) {
    elements.joinBtn?.setAttribute('disabled', 'true');
    elements.submitSolution?.setAttribute('disabled', 'true');
  }

  elements.joinBtn?.addEventListener('click', async () => {
    const codeInput = elements.roomCode?.value?.trim();
    const name = elements.playerName?.value?.trim() || 'Detective';
    if (!codeInput) {
      setText(elements.joinStatus, 'Enter a join code.');
      elements.joinStatus.className = 'result bad';
      return;
    }
    const code = normalizeCode(codeInput);
    await joinRoom(code, name);
  });

  elements.submitSolution?.addEventListener('click', async () => {
    if (!currentRoom || !currentState?.started) return;
    const truth = document.querySelector('input[name="truth"]:checked')?.value;
    const well = document.querySelector('input[name="well"]:checked')?.value;
    const guilty = document.querySelector('input[name="guilty"]:checked')?.value;

    if (!truth || !well || !guilty) {
      setText(elements.solveResult, 'Select all answers.');
      elements.solveResult.className = 'result bad';
      return;
    }

    const caseData = getCaseData(currentState.caseId);
    const solved = truth === caseData.solution.truth && well === caseData.solution.well && guilty === caseData.solution.guilty;

    let attempts = 0;
    try {
      const playerRef = ref(db, `rooms/${currentRoom}/players/${playerId}`);
      const playerSnap = await get(playerRef);
      attempts = (playerSnap.val()?.attempts || 0) + 1;
      await update(playerRef, { attempts });
    } catch (err) {
      setText(elements.solveResult, `Submit failed: ${err?.message || 'Unknown error'}`);
      elements.solveResult.className = 'result bad';
      return;
    }

    setText(elements.attempts, `Attempts: ${attempts}`);
    if (solved) {
      setText(elements.solveResult, 'CASE SOLVED');
      elements.solveResult.className = 'result good';
      playSolveSound();
    } else {
      setText(elements.solveResult, 'Try again');
      elements.solveResult.className = 'result bad';
    }
  });
}
