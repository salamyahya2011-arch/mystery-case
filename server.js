const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');
const WebSocket = require('ws');

const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = path.join(__dirname, 'public');

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

const state = {
  started: false,
  difficulty: 'Easy',
  playerLimit: 4,
  caseId: null,
  chapterUnlocked: 0,
  chapterTotal: 3
};

const players = new Map();

function getCaseData() {
  return cases.find((c) => c.id === state.caseId) || null;
}

function getLocalIPs() {
  const nets = os.networkInterfaces();
  const results = [];
  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      if (net.family === 'IPv4' && !net.internal) {
        results.push(net.address);
      }
    }
  }
  return results;
}

const server = http.createServer((req, res) => {
  if (req.url === '/api/info') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ port: PORT, ips: getLocalIPs() }));
    return;
  }

  const filePath = req.url === '/' ? '/index.html' : req.url;
  const safePath = path.normalize(filePath).replace(/^\.\.(\/|\\)/, '');
  const fullPath = path.join(PUBLIC_DIR, safePath);

  fs.readFile(fullPath, (err, data) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Not found');
      return;
    }
    const ext = path.extname(fullPath).toLowerCase();
    const types = {
      '.html': 'text/html',
      '.css': 'text/css',
      '.js': 'application/javascript'
    };
    res.writeHead(200, { 'Content-Type': types[ext] || 'text/plain' });
    res.end(data);
  });
});

const wss = new WebSocket.Server({ server });

function broadcast(data) {
  const msg = JSON.stringify(data);
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(msg);
    }
  });
}

function sendTo(ws, data) {
  if (ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(data));
  }
}

function getPublicState() {
  const caseData = getCaseData();
  return {
    started: state.started,
    difficulty: state.difficulty,
    playerLimit: state.playerLimit,
    caseId: state.caseId,
    chapterUnlocked: state.chapterUnlocked,
    chapterTotal: state.chapterTotal,
    caseData: caseData
      ? {
          id: caseData.id,
          title: caseData.title,
          intro: caseData.intro,
          suspects: caseData.suspects,
          clues: caseData.clues,
          facts: caseData.facts,
          chapters: caseData.chapters.slice(0, state.chapterTotal)
        }
      : null,
    players: Array.from(players.values()).map((p) => ({ id: p.id, name: p.name, attempts: p.attempts }))
  };
}

function handleStartGame(payload) {
  const difficulty = payload.difficulty || 'Easy';
  const playerLimit = Math.max(1, Number(payload.playerLimit) || 1);
  const caseId = payload.caseId || cases[0].id;
  const chapterTotal = difficulty === 'Hard' ? 5 : difficulty === 'Medium' ? 4 : 3;

  state.started = true;
  state.difficulty = difficulty;
  state.playerLimit = playerLimit;
  state.caseId = caseId;
  state.chapterTotal = chapterTotal;
  state.chapterUnlocked = 0;

  broadcast({ type: 'state', payload: getPublicState() });
}

function handleAdvanceChapter() {
  if (!state.started) return;
  state.chapterUnlocked = Math.min(state.chapterUnlocked + 1, state.chapterTotal);
  broadcast({ type: 'state', payload: getPublicState() });
}

function handleReset() {
  state.started = false;
  state.caseId = null;
  state.chapterUnlocked = 0;
  state.chapterTotal = 3;
  players.forEach((p) => (p.attempts = 0));
  broadcast({ type: 'state', payload: getPublicState() });
}

function handleSubmit(ws, payload) {
  const player = players.get(ws._id);
  if (!player) return;
  player.attempts += 1;

  const caseData = getCaseData();
  if (!caseData) return;

  const correct = caseData.solution;
  const solved =
    payload.truth === correct.truth &&
    payload.well === correct.well &&
    payload.guilty === correct.guilty;

  sendTo(ws, {
    type: 'submit-result',
    payload: { solved, attempts: player.attempts }
  });

  broadcast({ type: 'state', payload: getPublicState() });
}

wss.on('connection', (ws) => {
  ws._id = Math.random().toString(36).slice(2);

  ws.on('message', (message) => {
    let data;
    try {
      data = JSON.parse(message);
    } catch (err) {
      return;
    }

    if (data.type === 'join') {
      if (players.size >= state.playerLimit && state.started) {
        sendTo(ws, { type: 'join-denied', payload: { reason: 'Lobby is full.' } });
        return;
      }
      players.set(ws._id, { id: ws._id, name: data.payload.name || 'Detective', attempts: 0 });
      broadcast({ type: 'state', payload: getPublicState() });
      return;
    }

    if (data.type === 'host-start') handleStartGame(data.payload || {});
    if (data.type === 'host-advance') handleAdvanceChapter();
    if (data.type === 'host-reset') handleReset();
    if (data.type === 'submit-solution') handleSubmit(ws, data.payload || {});
  });

  ws.on('close', () => {
    players.delete(ws._id);
    broadcast({ type: 'state', payload: getPublicState() });
  });

  sendTo(ws, { type: 'state', payload: getPublicState() });
});

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
