'use strict';

const CONFIG = Object.freeze({
  canvas: { width: 1280, height: 820, fps: 60 },
  game: { startingGold: 120, maxDay: 10, marketSize: 5 },
  formation: { frontSlots: 3, backSlots: 3 },
  economy: { replacementMultiplier: 2, victoryBonus: 14, baseReward: 46, dayReward: 9 },
  combat: {
    dayStatGrowth: 0.08,
    mergedStatMultiplier: 1.7,
    mergedCostMultiplier: 2,
    splashTargets: 2,
    battleLogLimit: 7,
    tickMs: 420,
    maxTicks: 90,
    targetFrontFirst: true,
    baseAccuracy: 0.92,
    evasionAccuracyPenalty: 0.26,
    resistancePhysicalMultiplier: 0.55,
    areaSplashMultiplier: 0.48,
    healerAmount: 9,
    captainAura: 3,
  },
  traits: {
    humanSlayer: { label: 'Human Slayer', bonusVsHuman: 9 },
    evasion: { label: 'Evasion' },
    physicalResistance: { label: 'Physical Resistance' },
    areaAttack: { label: 'Area Attack' },
  },
  monsters: {
    orc: {
      id: 'orc', name: 'Orc', mergedName: 'Orc Captain', preferredRow: 'front', hireCost: 24,
      hp: 58, attack: 15, speed: 2, damageType: 'physical', traits: ['humanSlayer'], color: '#7ac45f', icon: 'ORC',
    },
    goblin: {
      id: 'goblin', name: 'Goblin', mergedName: 'Goblin Captain', preferredRow: 'back', hireCost: 16,
      hp: 36, attack: 10, speed: 1, damageType: 'physical', traits: ['evasion'], color: '#93e35f', icon: 'GOB',
    },
    ghost: {
      id: 'ghost', name: 'Ghost', mergedName: 'Ghost Captain', preferredRow: 'front', hireCost: 20,
      hp: 46, attack: 12, speed: 2, damageType: 'spirit', traits: ['physicalResistance'], color: '#b8d8ff', icon: 'GHO',
    },
    dragon: {
      id: 'dragon', name: 'Dragon', mergedName: 'Elder Dragon', preferredRow: 'back', hireCost: 42,
      hp: 52, attack: 21, speed: 3, damageType: 'fire', traits: ['areaAttack'], color: '#ff704f', icon: 'DRG',
    },
  },
  enemies: {
    knight: { id: 'knight', name: 'Knight', faction: 'Knight', hp: 54, attack: 12, speed: 2, row: 'front', armor: 2, traits: ['Armored Human'], color: '#b8b6aa', icon: 'KNT' },
    archer: { id: 'archer', name: 'Archer', faction: 'Archer', hp: 32, attack: 11, speed: 1, row: 'back', armor: 0, traits: ['Ranged Human'], color: '#d7a45f', icon: 'ARC' },
    healer: { id: 'healer', name: 'Healer', faction: 'Healer', hp: 30, attack: 6, speed: 2, row: 'back', armor: 0, traits: ['Heals Allies'], color: '#f0df8d', icon: 'HEA' },
    captain: { id: 'captain', name: 'Captain', faction: 'Captain', hp: 72, attack: 15, speed: 3, row: 'front', armor: 3, traits: ['Human Leader'], color: '#ffcc66', icon: 'CAP' },
  },
  days: [
    { enemies: ['knight', 'archer'], market: ['orc', 'goblin', 'ghost', 'goblin', 'orc'] },
    { enemies: ['knight', 'knight', 'healer'], market: ['ghost', 'orc', 'dragon', 'goblin', 'ghost'] },
    { enemies: ['archer', 'archer', 'knight'], market: ['goblin', 'dragon', 'orc', 'ghost', 'goblin'] },
    { enemies: ['captain', 'healer', 'archer'], market: ['orc', 'orc', 'dragon', 'ghost', 'goblin'] },
    { enemies: ['knight', 'knight', 'archer', 'healer'], market: ['ghost', 'ghost', 'dragon', 'orc', 'goblin'] },
    { enemies: ['captain', 'knight', 'archer', 'archer'], market: ['dragon', 'dragon', 'goblin', 'orc', 'ghost'] },
    { enemies: ['captain', 'healer', 'healer', 'knight'], market: ['orc', 'ghost', 'dragon', 'goblin', 'orc'] },
    { enemies: ['captain', 'captain', 'archer', 'healer'], market: ['dragon', 'ghost', 'ghost', 'orc', 'goblin'] },
    { enemies: ['captain', 'knight', 'knight', 'archer', 'healer'], market: ['orc', 'orc', 'dragon', 'dragon', 'ghost'] },
    { enemies: ['captain', 'captain', 'knight', 'archer', 'healer', 'archer'], market: ['dragon', 'dragon', 'orc', 'ghost', 'goblin'] },
  ],
  ui: {
    panel: '#241729', panel2: '#2f1d32', line: '#6d4254', text: '#f7e9cf', muted: '#c9a97f', gold: '#ffcf67',
    red: '#ff5e57', green: '#79e28b', blue: '#8dd6ff', button: '#7b2e42', buttonHover: '#a23d55', disabled: '#493744',
  },
});

const canvas = document.getElementById('gameCanvas');
const ctx = canvas ? canvas.getContext('2d') : null;

function createImage(key) {
  const safeKey = String(key || '').replace(/[^a-zA-Z0-9_.-]/g, '');
  const parts = safeKey.split('.').filter(Boolean);
  const category = parts[0] || 'cards';
  const fileName = `${parts.join('_') || 'missing'}.png`;
  const img = new Image();
  img.dataset.loaded = 'false';
  img.dataset.failed = 'false';
  img.onload = () => { img.dataset.loaded = 'true'; };
  img.onerror = () => { img.dataset.failed = 'true'; };
  img.src = `/assets/${category}/${fileName}`;
  return img;
}

const gameState = {
  phase: 'start',
  day: 1,
  gold: CONFIG.game.startingGold,
  mode: 'planning',
  market: [],
  army: [],
  enemyFormation: { front: [], back: [] },
  selectedUnitId: null,
  selectedMergeId: null,
  battle: null,
  report: null,
  economy: { reward: 0, replacementCosts: 0, profit: 0 },
  message: 'Welcome, dispatcher. Inspect enemies before hiring.',
  input: { actions: [], mouse: { x: 0, y: 0 }, buttons: [], cards: [], slots: [] },
  assets: { images: {} },
  counters: { unit: 1 },
};

function ensureImages() {
  Object.values(CONFIG.monsters).forEach((monster) => {
    const cardKey = `cards.${monster.id}.${monster.preferredRow}.idle`;
    const monsterKey = `monsters.${monster.id}.${monster.preferredRow}.idle`;
    if (!gameState.assets.images[cardKey]) gameState.assets.images[cardKey] = createImage(cardKey);
    if (!gameState.assets.images[monsterKey]) gameState.assets.images[monsterKey] = createImage(monsterKey);
  });
  Object.values(CONFIG.enemies).forEach((enemy) => {
    const key = `monsters.${enemy.id}.${enemy.row}.idle`;
    if (!gameState.assets.images[key]) gameState.assets.images[key] = createImage(key);
  });
}

function cloneStats(template) {
  return JSON.parse(JSON.stringify(template || {}));
}

function nextUnitId() {
  const id = `u${gameState.counters.unit}`;
  gameState.counters.unit += 1;
  return id;
}

function makeMonster(speciesId, merged = false) {
  const base = CONFIG.monsters[speciesId];
  if (!base) return null;
  const multiplier = merged ? CONFIG.combat.mergedStatMultiplier : 1;
  return {
    unitType: 'monster', id: nextUnitId(), speciesId, name: merged ? base.mergedName : base.name, merged,
    row: null, slot: null, alive: true, hp: Math.round(base.hp * multiplier), maxHp: Math.round(base.hp * multiplier),
    attack: Math.round(base.attack * multiplier), speed: Math.max(1, base.speed - (merged ? 1 : 0)), damageType: base.damageType,
    hireCost: base.hireCost * (merged ? CONFIG.combat.mergedCostMultiplier : 1), traits: [...base.traits], color: base.color, icon: base.icon,
  };
}

function makeEnemy(enemyId, index) {
  const base = CONFIG.enemies[enemyId];
  if (!base) return null;
  const dayScale = 1 + (Math.max(1, gameState.day) - 1) * CONFIG.combat.dayStatGrowth;
  return {
    unitType: 'enemy', id: `e${gameState.day}_${index}`, enemyId, name: base.name, faction: base.faction,
    row: base.row, slot: index, alive: true, hp: Math.round(base.hp * dayScale), maxHp: Math.round(base.hp * dayScale),
    attack: Math.round(base.attack * dayScale), speed: base.speed, armor: base.armor, traits: [...base.traits], color: base.color, icon: base.icon,
  };
}

function prepareDay() {
  const dayConfig = CONFIG.days[Math.min(gameState.day - 1, CONFIG.days.length - 1)] || CONFIG.days[0];
  gameState.market = (dayConfig.market || []).slice(0, CONFIG.game.marketSize).map((speciesId, index) => ({ id: `m${gameState.day}_${index}`, speciesId, sold: false }));
  const enemies = (dayConfig.enemies || []).map((enemyId, index) => makeEnemy(enemyId, index)).filter(Boolean);
  gameState.enemyFormation = { front: enemies.filter((e) => e.row === 'front'), back: enemies.filter((e) => e.row === 'back') };
  gameState.mode = 'planning';
  gameState.selectedUnitId = null;
  gameState.selectedMergeId = null;
  gameState.battle = null;
  gameState.report = null;
  gameState.economy = { reward: rewardForDay(gameState.day), replacementCosts: 0, profit: 0 };
  gameState.message = 'Enemy formation revealed. Hire only what the contract needs.';
}

function rewardForDay(day) {
  return CONFIG.economy.baseReward + (Math.max(1, day) - 1) * CONFIG.economy.dayReward;
}

function livingArmy() {
  return gameState.army.filter((u) => u && u.alive !== false);
}

function deployedArmy() {
  return livingArmy().filter((u) => u.row === 'front' || u.row === 'back');
}

function byId(id) {
  return gameState.army.find((u) => u && u.id === id) || null;
}

function unitsInRow(row) {
  return livingArmy().filter((u) => u.row === row).sort((a, b) => (a.slot || 0) - (b.slot || 0));
}

function startGame() {
  gameState.phase = 'playing';
  gameState.day = 1;
  gameState.gold = CONFIG.game.startingGold;
  gameState.army = [];
  gameState.counters.unit = 1;
  prepareDay();
}

function hire(marketId) {
  if (gameState.phase !== 'playing' || gameState.mode !== 'planning') return;
  const card = gameState.market.find((item) => item && item.id === marketId);
  const base = card ? CONFIG.monsters[card.speciesId] : null;
  if (!card || card.sold || !base) return;
  if (gameState.gold < base.hireCost) {
    gameState.message = `Insufficient gold for ${base.name}.`;
    return;
  }
  const unit = makeMonster(card.speciesId, false);
  if (!unit) return;
  gameState.gold -= base.hireCost;
  card.sold = true;
  gameState.army.push(unit);
  gameState.message = `${unit.name} hired. Replacement liability: ${unit.hireCost * CONFIG.economy.replacementMultiplier}g.`;
}

function selectUnit(unitId) {
  const unit = byId(unitId);
  if (!unit || gameState.mode !== 'planning') return;
  if (gameState.selectedMergeId && gameState.selectedMergeId !== unitId) {
    tryMerge(gameState.selectedMergeId, unitId);
    return;
  }
  gameState.selectedUnitId = unitId;
  gameState.selectedMergeId = unitId;
  gameState.message = `${unit.name} selected. Click same species to merge or a slot to deploy.`;
}

function tryMerge(firstId, secondId) {
  const a = byId(firstId);
  const b = byId(secondId);
  if (!a || !b || a.id === b.id) return;
  if (a.speciesId !== b.speciesId || a.merged || b.merged) {
    gameState.selectedMergeId = secondId;
    gameState.selectedUnitId = secondId;
    gameState.message = 'Merge denied: only two unmerged monsters of the same species can merge.';
    return;
  }
  const merged = makeMonster(a.speciesId, true);
  if (!merged) return;
  merged.row = a.row || b.row || null;
  merged.slot = Number.isInteger(a.slot) ? a.slot : b.slot;
  gameState.army = gameState.army.filter((u) => u && u.id !== a.id && u.id !== b.id);
  gameState.army.push(merged);
  normalizeFormation();
  gameState.selectedUnitId = merged.id;
  gameState.selectedMergeId = null;
  gameState.message = `${a.name} + ${b.name} merged into ${merged.name}.`;
}

function assignSlot(row, slot) {
  if (gameState.mode !== 'planning') return;
  const unit = byId(gameState.selectedUnitId);
  if (!unit || !['front', 'back'].includes(row) || !Number.isInteger(slot)) return;
  const max = row === 'front' ? CONFIG.formation.frontSlots : CONFIG.formation.backSlots;
  if (slot < 0 || slot >= max) return;
  const occupant = livingArmy().find((u) => u && u.row === row && u.slot === slot);
  if (occupant) {
    occupant.row = unit.row;
    occupant.slot = unit.slot;
  }
  unit.row = row;
  unit.slot = slot;
  normalizeFormation();
  gameState.message = `${unit.name} assigned to ${row} slot ${slot + 1}.`;
}

function benchSelected() {
  const unit = byId(gameState.selectedUnitId);
  if (!unit || gameState.mode !== 'planning') return;
  unit.row = null;
  unit.slot = null;
  gameState.message = `${unit.name} returned to bench.`;
}

function normalizeFormation() {
  ['front', 'back'].forEach((row) => {
    const max = row === 'front' ? CONFIG.formation.frontSlots : CONFIG.formation.backSlots;
    const seen = new Set();
    livingArmy().forEach((unit) => {
      if (!unit || unit.row !== row) return;
      if (!Number.isInteger(unit.slot) || unit.slot < 0 || unit.slot >= max || seen.has(unit.slot)) {
        unit.row = null;
        unit.slot = null;
      } else {
        seen.add(unit.slot);
      }
    });
  });
}

function startBattle() {
  if (gameState.mode !== 'planning') return;
  normalizeFormation();
  if (deployedArmy().length <= 0) {
    gameState.message = 'Deploy at least one monster before battle.';
    return;
  }
  const enemies = [...gameState.enemyFormation.front, ...gameState.enemyFormation.back].filter(Boolean);
  if (enemies.length <= 0) return;
  gameState.mode = 'battle';
  gameState.battle = { elapsed: 0, tick: 0, log: ['Battle started. Front row will be targeted first.'], enemies };
  gameState.message = 'Battle in progress. No commander input accepted.';
}

function getCombatants(side) {
  if (side === 'army') return deployedArmy().filter((u) => u.alive !== false && u.hp > 0);
  const battleEnemies = gameState.battle && Array.isArray(gameState.battle.enemies) ? gameState.battle.enemies : [];
  return battleEnemies.filter((u) => u && u.alive !== false && u.hp > 0);
}

function chooseTarget(targets) {
  if (!Array.isArray(targets) || targets.length <= 0) return null;
  const front = targets.filter((u) => u && u.row === 'front');
  const pool = CONFIG.combat.targetFrontFirst && front.length ? front : targets;
  return pool.slice().sort((a, b) => (a.slot || 0) - (b.slot || 0))[0] || null;
}

function deterministicHit(attacker, defender, tick) {
  if (!attacker || !defender) return false;
  let accuracy = CONFIG.combat.baseAccuracy;
  if (Array.isArray(defender.traits) && defender.traits.includes('evasion')) accuracy -= CONFIG.combat.evasionAccuracyPenalty;
  const seed = (String(attacker.id).length * 31 + String(defender.id).length * 17 + tick * 13) % 100;
  return seed / 100 <= accuracy;
}

function calculateDamage(attacker, defender) {
  if (!attacker || !defender) return 0;
  let damage = Number(attacker.attack) || 0;
  if (attacker.traits && attacker.traits.includes('humanSlayer') && defender.unitType === 'enemy') damage += CONFIG.traits.humanSlayer.bonusVsHuman;
  if (defender.traits && defender.traits.includes('physicalResistance') && attacker.damageType === 'physical') damage *= CONFIG.combat.resistancePhysicalMultiplier;
  damage -= Number(defender.armor) || 0;
  return Math.max(1, Math.round(damage));
}

function applyDamage(target, damage) {
  if (!target || !Number.isFinite(damage)) return;
  target.hp = Math.max(0, (Number(target.hp) || 0) - damage);
  if (target.hp <= 0) target.alive = false;
}

function doAttack(attacker, side) {
  if (!attacker || attacker.alive === false || attacker.hp <= 0) return;
  const targets = getCombatants(side === 'army' ? 'enemy' : 'army');
  const target = chooseTarget(targets);
  const log = gameState.battle && Array.isArray(gameState.battle.log) ? gameState.battle.log : [];
  if (!target) return;
  if (!deterministicHit(attacker, target, gameState.battle.tick)) {
    log.unshift(`${attacker.name} missed ${target.name}.`);
    return;
  }
  const damage = calculateDamage(attacker, target);
  applyDamage(target, damage);
  log.unshift(`${attacker.name} hit ${target.name} for ${damage}.`);
  if (attacker.traits && attacker.traits.includes('areaAttack')) {
    targets.filter((u) => u && u.id !== target.id).slice(0, CONFIG.combat.splashTargets).forEach((splash) => {
      const splashDamage = Math.max(1, Math.round(damage * CONFIG.combat.areaSplashMultiplier));
      applyDamage(splash, splashDamage);
      log.unshift(`${attacker.name} splashed ${splash.name} for ${splashDamage}.`);
    });
  }
  if (target.alive === false) log.unshift(`${target.name} fell.`);
  while (log.length > CONFIG.combat.battleLogLimit) log.pop();
}

function enemySupportActions() {
  const enemies = getCombatants('enemy');
  const log = gameState.battle && Array.isArray(gameState.battle.log) ? gameState.battle.log : [];
  enemies.forEach((enemy) => {
    if (!enemy || enemy.enemyId !== 'healer') return;
    const wounded = enemies.filter((ally) => ally && ally.hp > 0 && ally.hp < ally.maxHp).sort((a, b) => a.hp - b.hp)[0];
    if (wounded) {
      wounded.hp = Math.min(wounded.maxHp, wounded.hp + CONFIG.combat.healerAmount);
      log.unshift(`${enemy.name} restored ${wounded.name}.`);
    }
  });
}

function battleTick() {
  if (!gameState.battle) return;
  gameState.battle.tick += 1;
  enemySupportActions();
  const actors = [
    ...getCombatants('army').map((u) => ({ side: 'army', unit: u })),
    ...getCombatants('enemy').map((u) => ({ side: 'enemy', unit: u })),
  ].sort((a, b) => ((a.unit.speed || 1) - (b.unit.speed || 1)) || String(a.unit.id).localeCompare(String(b.unit.id)));
  actors.forEach((actor) => doAttack(actor.unit, actor.side));
  safeCleanup();
  const armyAlive = getCombatants('army').length;
  const enemyAlive = getCombatants('enemy').length;
  if (enemyAlive <= 0 || armyAlive <= 0 || gameState.battle.tick >= CONFIG.combat.maxTicks) finishBattle(enemyAlive <= 0 && armyAlive > 0);
}

function finishBattle(victory) {
  const dead = gameState.army.filter((unit) => unit && unit.alive === false);
  const replacementCosts = dead.reduce((sum, unit) => sum + (Number(unit.hireCost) || 0) * CONFIG.economy.replacementMultiplier, 0);
  const reward = victory ? rewardForDay(gameState.day) + CONFIG.economy.victoryBonus : 0;
  const profit = reward - replacementCosts;
  gameState.gold += profit;
  gameState.economy = { reward, replacementCosts, profit };
  gameState.report = { victory, dead: dead.map((unit) => unit.name), survived: livingArmy().map((unit) => unit.name) };
  gameState.army = livingArmy().map((unit) => ({ ...unit, hp: unit.maxHp, row: unit.row, slot: unit.slot }));
  normalizeFormation();
  gameState.mode = 'report';
  gameState.message = victory ? 'Contract complete. Review profit before continuing.' : 'Contract failed. Bad hiring decisions are expensive.';
  if (gameState.gold <= 0 || livingArmy().length <= 0) {
    gameState.phase = 'gameover';
    gameState.message = gameState.gold <= 0 ? 'Defeat: gold depleted.' : 'Defeat: no deployable units remain.';
  } else if (victory && gameState.day >= CONFIG.game.maxDay) {
    gameState.phase = 'gameover';
    gameState.message = 'Victory: survived Day 10 and kept the dispatch center solvent.';
  }
}

function continueDay() {
  if (gameState.phase !== 'playing' || gameState.mode !== 'report') return;
  gameState.day += 1;
  prepareDay();
}

function safeCleanup() {
  gameState.army = Array.isArray(gameState.army) ? gameState.army.filter(Boolean) : [];
  gameState.market = Array.isArray(gameState.market) ? gameState.market.filter(Boolean) : [];
  const battle = gameState.battle;
  if (battle && Array.isArray(battle.enemies)) battle.enemies = battle.enemies.filter(Boolean);
}

function processAction(action) {
  if (!action || !action.type) return;
  if (action.type === 'start') startGame();
  if (action.type === 'hire') hire(action.id);
  if (action.type === 'selectUnit') selectUnit(action.id);
  if (action.type === 'slot') assignSlot(action.row, action.slot);
  if (action.type === 'bench') benchSelected();
  if (action.type === 'battle') startBattle();
  if (action.type === 'continue') continueDay();
  if (action.type === 'restart') startGame();
}

function update(deltaMs) {
  safeCleanup();
  const actions = Array.isArray(gameState.input.actions) ? gameState.input.actions.splice(0) : [];
  actions.forEach(processAction);
  if (gameState.phase === 'playing' && gameState.gold <= 0) {
    gameState.phase = 'gameover';
    gameState.message = 'Defeat: gold depleted.';
  }
  if (gameState.phase === 'playing' && gameState.mode === 'battle' && gameState.battle) {
    gameState.battle.elapsed += deltaMs;
    while (gameState.battle && gameState.battle.elapsed >= CONFIG.combat.tickMs && gameState.mode === 'battle') {
      gameState.battle.elapsed -= CONFIG.combat.tickMs;
      battleTick();
    }
  }
}

function safeDrawImage(context, image, x, y, w, h, fallback) {
  try {
    if (context && image && image.dataset && image.dataset.loaded === 'true' && image.complete) {
      context.drawImage(image, x, y, w, h);
      return true;
    }
  } catch (error) {
    if (fallback) fallback();
    return false;
  }
  if (fallback) fallback();
  return false;
}

function rect(x, y, w, h, fill, stroke = CONFIG.ui.line) {
  if (!ctx) return;
  ctx.fillStyle = fill;
  ctx.strokeStyle = stroke;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, 12);
  ctx.fill();
  ctx.stroke();
}

function text(value, x, y, size = 16, color = CONFIG.ui.text, align = 'left', weight = '500') {
  if (!ctx) return;
  ctx.fillStyle = color;
  ctx.font = `${weight} ${size}px Inter, system-ui, sans-serif`;
  ctx.textAlign = align;
  ctx.textBaseline = 'top';
  ctx.fillText(String(value ?? ''), x, y);
}

function button(id, label, x, y, w, h, action, enabled = true) {
  const mouse = gameState.input.mouse || { x: -1, y: -1 };
  const hover = enabled && mouse.x >= x && mouse.x <= x + w && mouse.y >= y && mouse.y <= y + h;
  rect(x, y, w, h, enabled ? (hover ? CONFIG.ui.buttonHover : CONFIG.ui.button) : CONFIG.ui.disabled, enabled ? '#d88457' : '#5d4b58');
  text(label, x + w / 2, y + 13, 16, enabled ? CONFIG.ui.text : CONFIG.ui.muted, 'center', '700');
  gameState.input.buttons.push({ id, x, y, w, h, action, enabled });
}

function drawPanel(title, x, y, w, h) {
  rect(x, y, w, h, CONFIG.ui.panel);
  text(title, x + 14, y + 12, 18, CONFIG.ui.gold, 'left', '800');
}

function traitLabels(traits) {
  return (Array.isArray(traits) ? traits : []).map((trait) => (CONFIG.traits[trait] && CONFIG.traits[trait].label) || trait);
}

function drawUnit(unit, x, y, w, h, selected = false) {
  if (!unit) return;
  rect(x, y, w, h, selected ? '#493044' : CONFIG.ui.panel2, selected ? CONFIG.ui.gold : CONFIG.ui.line);
  const imageKey = unit.unitType === 'enemy' ? `monsters.${unit.enemyId}.${unit.row}.idle` : `monsters.${unit.speciesId}.${CONFIG.monsters[unit.speciesId]?.preferredRow || 'front'}.idle`;
  safeDrawImage(ctx, gameState.assets.images[imageKey], x + 8, y + 8, 52, 52, () => {
    ctx.fillStyle = unit.color || '#999';
    ctx.beginPath();
    ctx.arc(x + 34, y + 34, 24, 0, Math.PI * 2);
    ctx.fill();
    text(unit.icon || '?', x + 34, y + 25, 13, '#111', 'center', '900');
  });
  text(unit.name, x + 68, y + 8, 15, CONFIG.ui.text, 'left', '800');
  text(`HP ${Math.max(0, unit.hp)}/${unit.maxHp}  ATK ${unit.attack}`, x + 68, y + 29, 13, CONFIG.ui.muted);
  text(traitLabels(unit.traits).join(', '), x + 68, y + 48, 12, CONFIG.ui.blue);
  if (unit.unitType === 'monster') text(`Cost ${unit.hireCost}g | Replace ${unit.hireCost * CONFIG.economy.replacementMultiplier}g`, x + 8, y + h - 20, 12, CONFIG.ui.gold);
}

function drawStart() {
  text('Demon Army Dispatch Center', 640, 165, 42, CONFIG.ui.gold, 'center', '900');
  text('You are not a commander. You are a hiring manager with a casualty budget.', 640, 222, 20, CONFIG.ui.text, 'center');
  text('Analyze the visible enemy roster, hire efficient monsters, merge only when it saves money, and survive Day 10.', 640, 258, 17, CONFIG.ui.muted, 'center');
  button('start', 'Open Dispatch Center', 505, 330, 270, 54, { type: 'start' });
}

function drawHeader() {
  text(`Gold: ${gameState.gold}g`, 26, 18, 22, CONFIG.ui.gold, 'left', '900');
  text(`Day ${gameState.day} / ${CONFIG.game.maxDay}`, 210, 20, 20, CONFIG.ui.text, 'left', '800');
  text(`Phase: ${gameState.mode}`, 360, 22, 16, CONFIG.ui.muted);
  text(gameState.message, 1250, 22, 16, CONFIG.ui.text, 'right');
}

function drawEnemyPanel() {
  drawPanel('Enemy Formation (fully visible)', 20, 58, 390, 262);
  text('Front row is targeted first by both sides.', 34, 88, 13, CONFIG.ui.muted);
  [...gameState.enemyFormation.front, ...gameState.enemyFormation.back].forEach((enemy, index) => drawUnit(enemy, 34, 112 + index * 72, 342, 62));
}

function drawMarketPanel() {
  drawPanel('Recruitment Market', 430, 58, 400, 370);
  gameState.market.forEach((card, index) => {
    const monster = CONFIG.monsters[card.speciesId];
    if (!monster) return;
    const x = 444;
    const y = 96 + index * 64;
    rect(x, y, 368, 56, card.sold ? '#2a2530' : CONFIG.ui.panel2, card.sold ? '#4d4652' : CONFIG.ui.line);
    const imageKey = `cards.${monster.id}.${monster.preferredRow}.idle`;
    safeDrawImage(ctx, gameState.assets.images[imageKey], x + 8, y + 7, 42, 42, () => {
      ctx.fillStyle = monster.color;
      ctx.fillRect(x + 11, y + 10, 36, 36);
      text(monster.icon, x + 29, y + 19, 10, '#111', 'center', '900');
    });
    text(card.sold ? `${monster.name} - HIRED` : monster.name, x + 60, y + 7, 15, card.sold ? CONFIG.ui.muted : CONFIG.ui.text, 'left', '800');
    text(`${monster.preferredRow} | Cost ${monster.hireCost}g | Replace ${monster.hireCost * CONFIG.economy.replacementMultiplier}g`, x + 60, y + 27, 12, CONFIG.ui.gold);
    text(traitLabels(monster.traits).join(', '), x + 220, y + 8, 12, CONFIG.ui.blue);
    gameState.input.cards.push({ x, y, w: 368, h: 56, action: { type: 'hire', id: card.id }, enabled: !card.sold });
  });
}

function drawFormationPanel() {
  drawPanel('Army Formation', 20, 340, 810, 310);
  text('Click a unit, then a slot. Click two same-species unmerged units to merge.', 34, 370, 13, CONFIG.ui.muted);
  const slotW = 236;
  ['front', 'back'].forEach((row, rowIndex) => {
    text(row === 'front' ? 'Front Row' : 'Back Row', 34, 400 + rowIndex * 96, 15, CONFIG.ui.gold, 'left', '800');
    const max = row === 'front' ? CONFIG.formation.frontSlots : CONFIG.formation.backSlots;
    for (let slot = 0; slot < max; slot += 1) {
      const x = 118 + slot * (slotW + 10);
      const y = 392 + rowIndex * 96;
      const unit = livingArmy().find((u) => u && u.row === row && u.slot === slot);
      rect(x, y, slotW, 82, '#1e1523', unit ? CONFIG.ui.line : '#4c3341');
      if (unit) drawUnit(unit, x + 4, y + 4, slotW - 8, 74, gameState.selectedUnitId === unit.id);
      else text(`Empty ${row} ${slot + 1}`, x + slotW / 2, y + 30, 14, CONFIG.ui.muted, 'center');
      gameState.input.slots.push({ x, y, w: slotW, h: 82, action: { type: 'slot', row, slot }, enabled: true });
    }
  });
  text('Bench', 34, 590, 15, CONFIG.ui.gold, 'left', '800');
  livingArmy().filter((u) => !u.row).forEach((unit, index) => {
    const x = 92 + index * 152;
    const y = 574;
    drawUnit(unit, x, y, 144, 66, gameState.selectedUnitId === unit.id);
    gameState.input.cards.push({ x, y, w: 144, h: 66, action: { type: 'selectUnit', id: unit.id }, enabled: true });
  });
  livingArmy().filter((u) => u.row).forEach((unit) => {
    const rowIndex = unit.row === 'front' ? 0 : 1;
    const x = 118 + (unit.slot || 0) * (slotW + 10) + 4;
    const y = 392 + rowIndex * 96 + 4;
    gameState.input.cards.push({ x, y, w: slotW - 8, h: 74, action: { type: 'selectUnit', id: unit.id }, enabled: true });
  });
  button('bench', 'Return Selected to Bench', 34, 614, 210, 34, { type: 'bench' }, Boolean(gameState.selectedUnitId) && gameState.mode === 'planning');
  button('battle', 'Start Auto Battle', 620, 614, 190, 34, { type: 'battle' }, gameState.mode === 'planning' && deployedArmy().length > 0);
}

function drawReportPanel() {
  drawPanel('Battle Report', 850, 58, 400, 270);
  const log = gameState.battle && Array.isArray(gameState.battle.log) ? gameState.battle.log : [];
  if (gameState.report) {
    text(gameState.report.victory ? 'Result: Victory' : 'Result: Defeat', 864, 92, 18, gameState.report.victory ? CONFIG.ui.green : CONFIG.ui.red, 'left', '900');
    text(`Casualties: ${gameState.report.dead.length ? gameState.report.dead.join(', ') : 'None'}`, 864, 124, 14, CONFIG.ui.text);
    text(`Survivors: ${gameState.report.survived.length ? gameState.report.survived.join(', ') : 'None'}`, 864, 150, 14, CONFIG.ui.muted);
  } else {
    text(gameState.mode === 'battle' ? 'Auto battle running...' : 'No battle report yet.', 864, 92, 16, CONFIG.ui.muted);
  }
  log.slice(0, 6).forEach((entry, index) => text(entry, 864, 188 + index * 22, 13, CONFIG.ui.text));
}

function drawEconomyPanel() {
  drawPanel('Economy Summary', 850, 350, 400, 300);
  text(`Contract reward: ${gameState.economy.reward}g`, 870, 392, 20, CONFIG.ui.gold, 'left', '900');
  text(`Replacement costs: ${gameState.economy.replacementCosts}g`, 870, 430, 20, CONFIG.ui.red, 'left', '900');
  const profitColor = gameState.economy.profit >= 0 ? CONFIG.ui.green : CONFIG.ui.red;
  text(`Profit: ${gameState.economy.profit}g`, 870, 468, 24, profitColor, 'left', '900');
  text('Profit = Reward - Replacement Costs', 870, 506, 14, CONFIG.ui.muted);
  text('No permanent attack or HP upgrades exist.', 870, 532, 14, CONFIG.ui.muted);
  if (gameState.mode === 'report' && gameState.phase === 'playing') button('continue', 'Continue to Next Day', 870, 584, 220, 42, { type: 'continue' });
  if (gameState.phase === 'gameover') button('restart', 'Restart Dispatch Center', 870, 584, 235, 42, { type: 'restart' });
}

function render() {
  if (!ctx) return;
  gameState.input.buttons = [];
  gameState.input.cards = [];
  gameState.input.slots = [];
  ctx.clearRect(0, 0, CONFIG.canvas.width, CONFIG.canvas.height);
  ctx.fillStyle = '#170f1b';
  ctx.fillRect(0, 0, CONFIG.canvas.width, CONFIG.canvas.height);
  if (gameState.phase === 'start') {
    drawStart();
    return;
  }
  drawHeader();
  drawEnemyPanel();
  drawMarketPanel();
  drawFormationPanel();
  drawReportPanel();
  drawEconomyPanel();
}

function queueCanvasAction(event) {
  if (!canvas) return;
  const bounds = canvas.getBoundingClientRect();
  const scaleX = CONFIG.canvas.width / Math.max(1, bounds.width);
  const scaleY = CONFIG.canvas.height / Math.max(1, bounds.height);
  const x = (event.clientX - bounds.left) * scaleX;
  const y = (event.clientY - bounds.top) * scaleY;
  const pools = [gameState.input.buttons, gameState.input.cards, gameState.input.slots];
  for (const pool of pools) {
    const hit = (Array.isArray(pool) ? pool : []).find((item) => item && item.enabled !== false && x >= item.x && x <= item.x + item.w && y >= item.y && y <= item.y + item.h);
    if (hit && hit.action) {
      gameState.input.actions.push(hit.action);
      return;
    }
  }
}

function trackMouse(event) {
  if (!canvas) return;
  const bounds = canvas.getBoundingClientRect();
  gameState.input.mouse.x = (event.clientX - bounds.left) * (CONFIG.canvas.width / Math.max(1, bounds.width));
  gameState.input.mouse.y = (event.clientY - bounds.top) * (CONFIG.canvas.height / Math.max(1, bounds.height));
}

let lastTime = performance.now();
function loop(now) {
  const delta = Math.min(1000 / 10, now - lastTime);
  lastTime = now;
  update(delta);
  render();
  requestAnimationFrame(loop);
}

ensureImages();
if (canvas) {
  canvas.width = CONFIG.canvas.width;
  canvas.height = CONFIG.canvas.height;
  canvas.addEventListener('click', queueCanvasAction);
  canvas.addEventListener('mousemove', trackMouse);
}
requestAnimationFrame(loop);
