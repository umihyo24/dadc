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
    humanSlayer: { label: '人間特攻', bonusVsHuman: 9 },
    evasion: { label: '回避' },
    physicalResistance: { label: '物理耐性' },
    areaAttack: { label: '範囲攻撃' },
  },
  monsters: {
    orc: {
      id: 'orc', name: 'オーク', mergedName: 'オーク隊長', preferredRow: 'front', hireCost: 24,
      hp: 58, attack: 15, speed: 2, damageType: 'physical', traits: ['humanSlayer'], color: '#7ac45f', icon: 'ORC', role: '前衛アタッカー', specialty: '人間キラー', statement: '「人間相手なら誰にも負けません！」',
    },
    goblin: {
      id: 'goblin', name: 'ゴブリン', mergedName: 'ゴブリン隊長', preferredRow: 'back', hireCost: 16,
      hp: 36, attack: 10, speed: 1, damageType: 'physical', traits: ['evasion'], color: '#93e35f', icon: 'GOB', role: '後衛アタッカー', specialty: '回避の達人', statement: '「小回りには自信があります！」',
    },
    ghost: {
      id: 'ghost', name: 'ゴースト', mergedName: 'ゴースト隊長', preferredRow: 'front', hireCost: 20,
      hp: 46, attack: 12, speed: 2, damageType: 'spirit', traits: ['physicalResistance'], color: '#b8d8ff', icon: 'GHO', role: '前衛タンク', specialty: '物理耐性', statement: '「物理攻撃はほとんど効きません。」',
    },
    dragon: {
      id: 'dragon', name: 'ドラゴン', mergedName: 'エルダードラゴン', preferredRow: 'back', hireCost: 42,
      hp: 52, attack: 21, speed: 3, damageType: 'fire', traits: ['areaAttack'], color: '#ff704f', icon: 'DRG', role: '後衛アタッカー', specialty: '空中爆撃', statement: '「空からすべてを焼き尽くします。」',
    },
  },
  enemies: {
    knight: { id: 'knight', name: '騎士', faction: '騎士', hp: 54, attack: 12, speed: 2, row: 'front', armor: 2, traits: ['重装人間'], color: '#b8b6aa', icon: 'KNT' },
    archer: { id: 'archer', name: '弓兵', faction: '弓兵', hp: 32, attack: 11, speed: 1, row: 'back', armor: 0, traits: ['遠隔人間'], color: '#d7a45f', icon: 'ARC' },
    healer: { id: 'healer', name: '治療師', faction: '治療師', hp: 30, attack: 6, speed: 2, row: 'back', armor: 0, traits: ['味方回復'], color: '#f0df8d', icon: 'HEA' },
    captain: { id: 'captain', name: '隊長', faction: '隊長', hp: 72, attack: 15, speed: 3, row: 'front', armor: 3, traits: ['人間指揮官'], color: '#ffcc66', icon: 'CAP' },
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
  message: 'ようこそ、派遣責任者。採用前に敵を分析してください。',
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
  gameState.message = '敵編成が公開されました。契約に必要な戦力だけを雇いましょう。';
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
    gameState.message = `${base.name}を雇うゴールドが足りません。`;
    return;
  }
  const unit = makeMonster(card.speciesId, false);
  if (!unit) return;
  gameState.gold -= base.hireCost;
  card.sold = true;
  gameState.army.push(unit);
  gameState.message = `${unit.name}を雇用しました。死亡時の交換費用: ${unit.hireCost * CONFIG.economy.replacementMultiplier}g。`;
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
  gameState.message = `${unit.name}を選択中。同種族をクリックで合成、枠をクリックで配置。`;
}

function tryMerge(firstId, secondId) {
  const a = byId(firstId);
  const b = byId(secondId);
  if (!a || !b || a.id === b.id) return;
  if (a.speciesId !== b.speciesId || a.merged || b.merged) {
    gameState.selectedMergeId = secondId;
    gameState.selectedUnitId = secondId;
    gameState.message = '合成不可: 同種族かつ未合成の2体だけが合成できます。';
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
  gameState.message = `${a.name} + ${b.name} を合成して ${merged.name} になりました。`;
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
  gameState.message = `${unit.name}を${rowLabel(row)}${slot + 1}番へ配置しました。`;
}

function benchSelected() {
  const unit = byId(gameState.selectedUnitId);
  if (!unit || gameState.mode !== 'planning') return;
  unit.row = null;
  unit.slot = null;
  gameState.message = `${unit.name}を控えに戻しました。`;
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
    gameState.message = '戦闘前に最低1体のモンスターを配置してください。';
    return;
  }
  const enemies = [...gameState.enemyFormation.front, ...gameState.enemyFormation.back].filter(Boolean);
  if (enemies.length <= 0) return;
  gameState.mode = 'battle';
  gameState.battle = { elapsed: 0, tick: 0, log: ['契約履行開始。採用メンバーを評価します。'], enemies, stats: {} };
  deployedArmy().forEach((unit) => { gameState.battle.stats[unit.id] = { name: unit.name, kills: 0, damage: 0 }; });
  gameState.message = '戦闘中です。指揮入力は受け付けません。';
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
    log.unshift(`${attacker.name}の攻撃は${target.name}に外れた。`);
    return;
  }
  const damage = calculateDamage(attacker, target);
  const targetHpBefore = Math.max(0, target.hp || 0);
  applyDamage(target, damage);
  recordContribution(attacker, Math.min(damage, targetHpBefore), target.alive === false);
  log.unshift(`${attacker.name}が${target.name}に${damage}ダメージ。`);
  if (attacker.traits && attacker.traits.includes('areaAttack')) {
    targets.filter((u) => u && u.id !== target.id).slice(0, CONFIG.combat.splashTargets).forEach((splash) => {
      const splashDamage = Math.max(1, Math.round(damage * CONFIG.combat.areaSplashMultiplier));
      const splashHpBefore = Math.max(0, splash.hp || 0);
      applyDamage(splash, splashDamage);
      recordContribution(attacker, Math.min(splashDamage, splashHpBefore), splash.alive === false);
      log.unshift(`${attacker.name}の範囲攻撃が${splash.name}に${splashDamage}ダメージ。`);
    });
  }
  if (target.alive === false) log.unshift(`${target.name}が倒れた。`);
  while (log.length > CONFIG.combat.battleLogLimit) log.pop();
}

function recordContribution(attacker, damage, killed) {
  if (!attacker || attacker.unitType !== 'monster' || !gameState.battle || !gameState.battle.stats) return;
  if (!gameState.battle.stats[attacker.id]) gameState.battle.stats[attacker.id] = { name: attacker.name, kills: 0, damage: 0 };
  gameState.battle.stats[attacker.id].damage += Math.max(0, Math.round(damage || 0));
  if (killed) gameState.battle.stats[attacker.id].kills += 1;
}

function allEnemies() {
  const battleEnemies = gameState.battle && Array.isArray(gameState.battle.enemies) ? gameState.battle.enemies : null;
  return (battleEnemies || [...gameState.enemyFormation.front, ...gameState.enemyFormation.back]).filter(Boolean);
}

function enemyIntelligence() {
  const enemies = allEnemies();
  const total = Math.max(1, enemies.length);
  const front = enemies.filter((e) => e.row === 'front');
  const back = enemies.filter((e) => e.row === 'back');
  const healers = enemies.filter((e) => e.enemyId === 'healer');
  const humanPresence = Math.round((enemies.filter((e) => e.unitType === 'enemy').length / total) * 100);
  const frontlineThreat = front.reduce((sum, e) => sum + (e.attack || 0) + (e.maxHp || e.hp || 0) / 8 + (e.armor || 0) * 3, 0);
  const backlineThreat = back.reduce((sum, e) => sum + (e.attack || 0) * 1.5 + (e.enemyId === 'archer' ? 8 : 0), 0);
  const healingPresence = healers.length;
  const recommended = [];
  if (humanPresence >= 70) recommended.push('人間特攻');
  if (frontlineThreat >= backlineThreat) recommended.push('前衛タンク');
  if (back.length >= 2) recommended.push('範囲攻撃');
  if (healingPresence) recommended.push('高火力で治療師を突破');
  if (!recommended.length) recommended.push('バランス採用');
  return { humanPresence, frontlineThreat, backlineThreat, healingPresence, recommended };
}

function threatStars(value, maxValue = 80) {
  const filled = Math.max(1, Math.min(5, Math.ceil((value / maxValue) * 5)));
  return '★★★★★'.slice(0, filled) + '☆☆☆☆☆'.slice(0, 5 - filled);
}

function monsterCounterValue(monster) {
  if (!monster) return 0;
  const intel = enemyIntelligence();
  let value = 1;
  if (monster.traits.includes('humanSlayer')) value += Math.round(intel.humanPresence / 25);
  if (monster.traits.includes('physicalResistance')) value += Math.ceil(intel.frontlineThreat / 30);
  if (monster.traits.includes('areaAttack')) value += Math.max(1, Math.ceil((allEnemies().length - 2) / 2));
  if (monster.traits.includes('evasion')) value += Math.ceil(intel.backlineThreat / 35);
  return Math.max(1, Math.min(5, value));
}

function contractPrediction() {
  const army = deployedArmy();
  const enemies = allEnemies();
  const intel = enemyIntelligence();
  const armyPower = army.reduce((sum, unit) => {
    let power = (unit.maxHp || unit.hp || 0) * 0.36 + (unit.attack || 0) * 4.6 + (unit.speed || 1) * 5;
    if (unit.traits.includes('humanSlayer')) power += intel.humanPresence * 0.28;
    if (unit.traits.includes('physicalResistance')) power += intel.frontlineThreat * 0.16;
    if (unit.traits.includes('areaAttack')) power += enemies.length * 10;
    if (unit.traits.includes('evasion')) power += intel.backlineThreat * 0.14;
    return sum + power;
  }, 0);
  const enemyPower = enemies.reduce((sum, enemy) => sum + (enemy.maxHp || enemy.hp || 0) * 0.32 + (enemy.attack || 0) * 5 + (enemy.armor || 0) * 7 + (enemy.enemyId === 'healer' ? 22 : 0) + (enemy.enemyId === 'captain' ? 14 : 0), 0);
  const chance = army.length ? Math.max(8, Math.min(92, Math.round(50 + (armyPower - enemyPower) / Math.max(6, enemyPower) * 45))) : 0;
  const expectedDead = army.length ? Math.max(0, Math.min(army.length, Math.round((100 - chance) / 35))) : 0;
  const averageReplacement = army.length ? army.reduce((sum, unit) => sum + unit.hireCost * CONFIG.economy.replacementMultiplier, 0) / army.length : 0;
  const projectedProfit = Math.round((rewardForDay(gameState.day) + CONFIG.economy.victoryBonus) * (chance / 100) - expectedDead * averageReplacement);
  const summary = chance >= 70 ? '有望な採用計画です。利益確保を狙えます。' : chance >= 45 ? '五分の契約です。対策要員の追加を検討。' : '危険な人員計画です。採用を見直してください。';
  return { chance, expectedDead, projectedProfit, summary };
}

function reportEvaluation() {
  if (!gameState.report) return null;
  let score = gameState.report.victory ? 3 : 1;
  if (gameState.economy.profit > 35) score += 2;
  else if (gameState.economy.profit > 0) score += 1;
  if (gameState.report.dead.length === 0) score += 1;
  if (!gameState.report.victory) score = Math.min(score, 2);
  score = Math.max(1, Math.min(5, score));
  const labels = ['要改善の採用判断', '危険な採用判断', '堅実な採用判断', '優秀な採用判断', 'Excellent Recruitment Decision'];
  return { score, stars: '★★★★★'.slice(0, score) + '☆☆☆☆☆'.slice(0, 5 - score), label: labels[score - 1] };
}

function employeeOfTheDay() {
  const stats = gameState.battle && gameState.battle.stats ? Object.values(gameState.battle.stats) : [];
  const best = stats.sort((a, b) => (b.kills - a.kills) || (b.damage - a.damage))[0];
  if (!best) return { name: '該当者なし', kills: 0, contribution: '配置メンバーがいません。' };
  const totalDamage = Math.max(1, stats.reduce((sum, item) => sum + (item.damage || 0), 0));
  return { name: best.name, kills: best.kills || 0, contribution: `総ダメージ貢献 ${Math.round((best.damage || 0) / totalDamage * 100)}%` };
}

function enemySupportActions() {
  const enemies = getCombatants('enemy');
  const log = gameState.battle && Array.isArray(gameState.battle.log) ? gameState.battle.log : [];
  enemies.forEach((enemy) => {
    if (!enemy || enemy.enemyId !== 'healer') return;
    const wounded = enemies.filter((ally) => ally && ally.hp > 0 && ally.hp < ally.maxHp).sort((a, b) => a.hp - b.hp)[0];
    if (wounded) {
      wounded.hp = Math.min(wounded.maxHp, wounded.hp + CONFIG.combat.healerAmount);
      log.unshift(`${enemy.name}が${wounded.name}を回復。`);
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
  gameState.message = victory ? '契約完了。次へ進む前に利益を確認してください。' : '契約失敗。悪い採用判断は高くつきます。';
  if (gameState.gold <= 0 || livingArmy().length <= 0) {
    gameState.phase = 'gameover';
    gameState.message = gameState.gold <= 0 ? '敗北: ゴールドが尽きました。' : '敗北: 配置可能なユニットが残っていません。';
  } else if (victory && gameState.day >= CONFIG.game.maxDay) {
    gameState.phase = 'gameover';
    gameState.message = '勝利: 10日目を生き残り、派遣センターの資金繰りを守りました。';
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
    gameState.message = '敗北: ゴールドが尽きました。';
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


function rowLabel(row) {
  return row === 'front' ? '前列' : row === 'back' ? '後列' : '未配置';
}

function modeLabel(mode) {
  const labels = { planning: '採用・編成', battle: '自動戦闘', report: '報告確認' };
  return labels[mode] || '開始前';
}

function traitLabels(traits) {
  return (Array.isArray(traits) ? traits : []).map((trait) => (CONFIG.traits[trait] && CONFIG.traits[trait].label) || trait);
}

function drawUnit(unit, x, y, w, h, selected = false) {
  if (!unit) return;
  rect(x, y, w, h, selected ? '#493044' : CONFIG.ui.panel2, selected ? CONFIG.ui.gold : CONFIG.ui.line);
  const imageKey = unit.unitType === 'enemy' ? `monsters.${unit.enemyId}.${unit.row}.idle` : `monsters.${unit.speciesId}.${CONFIG.monsters[unit.speciesId]?.preferredRow || 'front'}.idle`;
  if (w < 110) {
    safeDrawImage(ctx, gameState.assets.images[imageKey], x + 16, y + 8, w - 32, Math.max(30, h - 34), () => {
      ctx.fillStyle = unit.color || '#999';
      ctx.beginPath();
      ctx.arc(x + w / 2, y + 30, 20, 0, Math.PI * 2);
      ctx.fill();
      text(unit.icon || '?', x + w / 2, y + 22, 11, '#111', 'center', '900');
    });
    text(unit.name, x + w / 2, y + h - 20, 12, CONFIG.ui.text, 'center', '900');
    return;
  }
  if (h < 62) {
    safeDrawImage(ctx, gameState.assets.images[imageKey], x + 6, y + 6, 36, 36, () => {
      ctx.fillStyle = unit.color || '#999';
      ctx.fillRect(x + 8, y + 8, 32, 32);
      text(unit.icon || '?', x + 24, y + 17, 9, '#111', 'center', '900');
    });
    text(unit.name, x + 48, y + 7, 13, CONFIG.ui.text, 'left', '900');
    text(`${unit.attack}ATK / ${traitLabels(unit.traits)[0] || '標準'}`, x + 48, y + 27, 11, CONFIG.ui.muted);
    return;
  }
  safeDrawImage(ctx, gameState.assets.images[imageKey], x + 8, y + 8, 52, 52, () => {
    ctx.fillStyle = unit.color || '#999';
    ctx.beginPath();
    ctx.arc(x + 34, y + 34, 24, 0, Math.PI * 2);
    ctx.fill();
    text(unit.icon || '?', x + 34, y + 25, 13, '#111', 'center', '900');
  });
  text(unit.name, x + 68, y + 8, 15, CONFIG.ui.text, 'left', '800');
  text(`HP ${Math.max(0, unit.hp)}/${unit.maxHp}  攻撃 ${unit.attack}`, x + 68, y + 29, 13, CONFIG.ui.muted);
  text(traitLabels(unit.traits).join(', '), x + 68, y + 48, 12, CONFIG.ui.blue);
  if (unit.unitType === 'monster') text(`雇用 ${unit.hireCost}g | 交換 ${unit.hireCost * CONFIG.economy.replacementMultiplier}g`, x + 8, y + h - 20, 12, CONFIG.ui.gold);
}

function drawStart() {
  text('魔軍派遣センター', 640, 165, 42, CONFIG.ui.gold, 'center', '900');
  text('あなたは指揮官ではありません。損耗予算を背負った採用責任者です。', 640, 222, 20, CONFIG.ui.text, 'center');
  text('公開された敵名簿を分析し、効率的に雇い、節約になる時だけ合成し、10日目を生き残りましょう。', 640, 258, 17, CONFIG.ui.muted, 'center');
  button('start', '派遣センターを開く', 505, 330, 270, 54, { type: 'start' });
}

function drawHeader() {
  text(`所持金: ${gameState.gold}g`, 26, 18, 22, CONFIG.ui.gold, 'left', '900');
  text(`${gameState.day}日目 / ${CONFIG.game.maxDay}日`, 210, 20, 20, CONFIG.ui.text, 'left', '800');
  text(`状態: ${modeLabel(gameState.mode)}`, 360, 22, 16, CONFIG.ui.muted);
  text(gameState.message, 1250, 22, 16, CONFIG.ui.text, 'right');
}

function drawTag(label, x, y, w, color = CONFIG.ui.blue) {
  rect(x, y, w, 22, 'rgba(20, 12, 18, 0.82)', color);
  text(label, x + w / 2, y + 4, 12, CONFIG.ui.text, 'center', '800');
}

function drawBar(label, value, maxValue, x, y, w, color) {
  text(label, x, y, 13, CONFIG.ui.muted, 'left', '700');
  rect(x + 126, y - 1, w, 14, '#140d18', '#3f2a37');
  const fillW = Math.max(3, Math.min(w, (value / Math.max(1, maxValue)) * w));
  ctx.fillStyle = color;
  ctx.fillRect(x + 128, y + 1, fillW - 4, 10);
  text(label === '人間存在率' ? `${value}%` : threatStars(value), x + 126 + w + 8, y - 2, 13, color, 'left', '800');
}

function drawEnemyPanel() {
  drawPanel('敵軍インテリジェンスレポート', 20, 58, 410, 252);
  text('敵の構成分析と対策提案', 34, 86, 13, CONFIG.ui.muted);
  const enemies = [...gameState.enemyFormation.front, ...gameState.enemyFormation.back];
  enemies.slice(0, 4).forEach((enemy, index) => drawUnit(enemy, 34 + index * 94, 108, 86, 82));
  if (enemies.length > 4) text(`+${enemies.length - 4} 追加部隊`, 365, 170, 12, CONFIG.ui.gold, 'right', '800');
  const intel = enemyIntelligence();
  drawBar('人間存在率', intel.humanPresence, 100, 34, 204, 92, CONFIG.ui.red);
  drawBar('前線脅威', intel.frontlineThreat, 90, 34, 228, 92, CONFIG.ui.gold);
  drawBar('後方火力', intel.backlineThreat, 80, 34, 252, 92, CONFIG.ui.blue);
  drawBar('回復支援', intel.healingPresence * 28, 84, 34, 276, 92, intel.healingPresence ? CONFIG.ui.green : CONFIG.ui.muted);
  rect(250, 204, 162, 86, '#1c121e', '#8a5a3d');
  text('推奨カウンター', 262, 214, 13, CONFIG.ui.gold, 'left', '800');
  intel.recommended.slice(0, 3).forEach((item, index) => text(`✦ ${item}`, 262, 238 + index * 18, 12, CONFIG.ui.text));
}

function drawMarketPanel() {
  drawPanel('モンスター応募者', 450, 58, 810, 252);
  text('敵情報をもとに優秀な人材を採用（カードをクリック）', 674, 74, 13, CONFIG.ui.muted);
  gameState.market.forEach((card, index) => {
    const monster = CONFIG.monsters[card.speciesId];
    if (!monster) return;
    const x = 464 + index * 156;
    const y = 96;
    rect(x, y, 146, 196, card.sold ? '#2a2530' : CONFIG.ui.panel2, card.sold ? '#4d4652' : (monster.preferredRow === 'front' ? '#a87045' : '#4f7fa8'));
    drawTag(monster.role, x + 8, y + 8, 92, monster.preferredRow === 'front' ? '#a87045' : '#4f7fa8');
    text(card.sold ? '雇用済' : `${monster.hireCost}g`, x + 134, y + 10, 14, CONFIG.ui.gold, 'right', '900');
    const imageKey = `cards.${monster.id}.${monster.preferredRow}.idle`;
    safeDrawImage(ctx, gameState.assets.images[imageKey], x + 14, y + 36, 118, 70, () => {
      ctx.fillStyle = monster.color;
      ctx.fillRect(x + 24, y + 42, 98, 58);
      text(monster.icon, x + 73, y + 62, 18, '#111', 'center', '900');
    });
    text(monster.name, x + 10, y + 108, 18, card.sold ? CONFIG.ui.muted : CONFIG.ui.text, 'left', '900');
    text(`専門: ${monster.specialty}`, x + 10, y + 132, 12, CONFIG.ui.blue, 'left', '800');
    text(`対策価値 ${'★'.repeat(monsterCounterValue(monster))}${'☆'.repeat(5 - monsterCounterValue(monster))}`, x + 10, y + 150, 12, CONFIG.ui.gold, 'left', '800');
    rect(x + 8, y + 168, 130, 20, '#efe2c8', '#b98a58');
    text(monster.statement, x + 73, y + 171, 10, '#281a1a', 'center', '900');
    gameState.input.cards.push({ x, y, w: 146, h: 196, action: { type: 'hire', id: card.id }, enabled: !card.sold });
  });
}

function drawFormationPanel() {
  drawPanel('軍団編成 - 派遣スタッフ配置', 20, 330, 540, 430);
  text('FRONTLINE / BACKLINEを明確に分け、役割に合わせて配置します。', 34, 360, 13, CONFIG.ui.muted);
  const slotW = 136;
  ['front', 'back'].forEach((row, rowIndex) => {
    const y = 392 + rowIndex * 108;
    const rowTitle = row === 'front' ? 'FRONTLINE' : 'BACKLINE';
    const rowSub = row === 'front' ? '盾・近接・被弾担当' : '遠距離・爆撃・支援担当';
    rect(34, y, 108, 86, row === 'front' ? '#38251f' : '#1c2c3d', row === 'front' ? '#a87045' : '#4f7fa8');
    text(rowTitle, 88, y + 16, 15, CONFIG.ui.gold, 'center', '900');
    text(rowSub, 88, y + 45, 10, CONFIG.ui.muted, 'center', '700');
    const max = row === 'front' ? CONFIG.formation.frontSlots : CONFIG.formation.backSlots;
    for (let slot = 0; slot < max; slot += 1) {
      const x = 152 + slot * (slotW + 8);
      const unit = livingArmy().find((u) => u && u.row === row && u.slot === slot);
      rect(x, y, slotW, 86, '#1e1523', unit ? CONFIG.ui.line : '#4c3341');
      drawTag(`${row === 'front' ? '前衛' : '後衛'} SLOT ${slot + 1}`, x + 8, y + 8, 82, row === 'front' ? '#a87045' : '#4f7fa8');
      if (unit) drawUnit(unit, x + 6, y + 32, slotW - 12, 48, gameState.selectedUnitId === unit.id);
      else text('空き採用枠', x + slotW / 2, y + 48, 13, CONFIG.ui.muted, 'center');
      gameState.input.slots.push({ x, y, w: slotW, h: 86, action: { type: 'slot', row, slot }, enabled: true });
    }
  });
  text('ベンチ（予備要員）', 34, 622, 15, CONFIG.ui.gold, 'left', '800');
  livingArmy().filter((u) => !u.row).slice(0, 5).forEach((unit, index) => {
    const x = 34 + index * 100;
    const y = 648;
    drawUnit(unit, x, y, 92, 54, gameState.selectedUnitId === unit.id);
    gameState.input.cards.push({ x, y, w: 92, h: 54, action: { type: 'selectUnit', id: unit.id }, enabled: true });
  });
  livingArmy().filter((u) => u.row).forEach((unit) => {
    const rowIndex = unit.row === 'front' ? 0 : 1;
    const x = 152 + (unit.slot || 0) * (slotW + 8) + 6;
    const y = 392 + rowIndex * 108 + 32;
    gameState.input.cards.push({ x, y, w: slotW - 12, h: 48, action: { type: 'selectUnit', id: unit.id }, enabled: true });
  });
  button('bench', '控えへ戻す', 34, 714, 150, 34, { type: 'bench' }, Boolean(gameState.selectedUnitId) && gameState.mode === 'planning');
  button('battle', '契約へ派遣', 388, 714, 150, 34, { type: 'battle' }, gameState.mode === 'planning' && deployedArmy().length > 0);
}

function drawPredictionPanel() {
  drawPanel('契約予測（戦闘前シミュレーション）', 580, 330, 680, 120);
  const prediction = contractPrediction();
  text('予想勝率', 610, 370, 15, CONFIG.ui.muted, 'left', '800');
  text(`${prediction.chance}%`, 610, 392, 34, prediction.chance >= 60 ? CONFIG.ui.green : CONFIG.ui.red, 'left', '900');
  text('予想損耗', 790, 370, 15, CONFIG.ui.muted, 'left', '800');
  text(`${prediction.expectedDead}体`, 790, 398, 28, CONFIG.ui.text, 'left', '900');
  text('予想利益', 960, 370, 15, CONFIG.ui.muted, 'left', '800');
  text(`${prediction.projectedProfit >= 0 ? '+' : ''}${prediction.projectedProfit}g`, 960, 398, 28, prediction.projectedProfit >= 0 ? CONFIG.ui.green : CONFIG.ui.red, 'left', '900');
  text(prediction.summary, 1118, 386, 13, CONFIG.ui.muted, 'left', '700');
}

function drawReportPanel() {
  drawPanel('戦闘結果 - 採用評価', 580, 470, 300, 290);
  if (gameState.report) {
    const evaluation = reportEvaluation();
    text(evaluation.stars, 604, 512, 28, CONFIG.ui.gold, 'left', '900');
    text(evaluation.label, 604, 548, 18, gameState.report.victory ? CONFIG.ui.green : CONFIG.ui.red, 'left', '900');
    text(`損耗: ${gameState.report.dead.length ? gameState.report.dead.join('、') : 'なし'}`, 604, 586, 14, CONFIG.ui.text);
    text(`利益: ${gameState.economy.profit >= 0 ? '+' : ''}${gameState.economy.profit}g`, 604, 614, 18, gameState.economy.profit >= 0 ? CONFIG.ui.green : CONFIG.ui.red, 'left', '900');
    const summary = gameState.report.victory ? '敵情報に基づく人員配置が契約成功につながりました。' : '採用計画が敵戦力を下回りました。対策価値を重視しましょう。';
    text(summary, 604, 650, 13, CONFIG.ui.muted);
  } else {
    text(gameState.mode === 'battle' ? '契約履行中。評価を集計しています...' : '戦闘後に採用評価を表示します。', 604, 512, 16, CONFIG.ui.muted);
  }
}

function drawMvpPanel() {
  drawPanel('本日の優秀社員', 900, 470, 180, 290);
  const mvp = gameState.report ? employeeOfTheDay() : null;
  text('Employee of the Day', 916, 504, 13, CONFIG.ui.gold, 'left', '800');
  if (mvp) {
    text(mvp.name, 916, 536, 22, CONFIG.ui.text, 'left', '900');
    text(`撃破数: ${mvp.kills}`, 916, 576, 16, CONFIG.ui.gold, 'left', '800');
    text(mvp.contribution, 916, 606, 13, CONFIG.ui.muted);
    text('採用台帳に金印を押しました。', 916, 682, 12, CONFIG.ui.gold);
  } else {
    text('戦闘後にMVPを発表', 916, 536, 15, CONFIG.ui.muted);
  }
}

function drawEconomyPanel() {
  drawPanel('経済サマリー', 1100, 470, 160, 290);
  text('所持金', 1116, 510, 13, CONFIG.ui.muted, 'left', '800');
  text(`${gameState.gold}g`, 1116, 532, 24, CONFIG.ui.gold, 'left', '900');
  text(`報酬 ${gameState.economy.reward}g`, 1116, 582, 15, CONFIG.ui.gold, 'left', '800');
  text(`補填 -${gameState.economy.replacementCosts}g`, 1116, 612, 15, CONFIG.ui.red, 'left', '800');
  const profitColor = gameState.economy.profit >= 0 ? CONFIG.ui.green : CONFIG.ui.red;
  text(`純利益`, 1116, 650, 13, CONFIG.ui.muted, 'left', '800');
  text(`${gameState.economy.profit >= 0 ? '+' : ''}${gameState.economy.profit}g`, 1116, 672, 24, profitColor, 'left', '900');
  if (gameState.mode === 'report' && gameState.phase === 'playing') button('continue', '翌日へ', 1116, 714, 124, 34, { type: 'continue' });
  if (gameState.phase === 'gameover') button('restart', '再開', 1116, 714, 124, 34, { type: 'restart' });
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
  drawPredictionPanel();
  drawReportPanel();
  drawMvpPanel();
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
