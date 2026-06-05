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
    panel: '#fff0cf', panel2: '#f6dfb4', line: '#9c6a35', text: '#3b2517', muted: '#775338', gold: '#d88922',
    red: '#d85a4c', green: '#4fa85d', blue: '#3d8bd6', purple: '#7e55b8', orange: '#f29a2e',
    button: '#e29a2e', buttonHover: '#f3b94d', disabled: '#c7ad88', wood: '#8b5529', parchment: '#fff4d6', ink: '#3b2517',
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

function rect(x, y, w, h, fill, stroke = CONFIG.ui.line, radius = 12, lineWidth = 2) {
  if (!ctx) return;
  ctx.fillStyle = fill;
  ctx.strokeStyle = stroke;
  ctx.lineWidth = lineWidth;
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, radius);
  ctx.fill();
  ctx.stroke();
}

function panelFill(x, y, w, h, top, bottom) {
  const gradient = ctx.createLinearGradient(x, y, x, y + h);
  gradient.addColorStop(0, top);
  gradient.addColorStop(1, bottom);
  return gradient;
}

function drawRibbon(label, x, y, w, color = CONFIG.ui.blue, icon = '✦') {
  if (!ctx) return;
  ctx.save();
  ctx.fillStyle = color;
  ctx.strokeStyle = '#6a4327';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x + 10, y);
  ctx.lineTo(x + w - 10, y);
  ctx.lineTo(x + w, y + 16);
  ctx.lineTo(x + w - 10, y + 32);
  ctx.lineTo(x + 10, y + 32);
  ctx.lineTo(x, y + 16);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.restore();
  text(`${icon} ${label}`, x + w / 2, y + 6, 16, '#fff8dc', 'center', '900');
}

function drawPanel(title, x, y, w, h, options = {}) {
  const variant = options.variant || 'parchment';
  const banner = options.banner || CONFIG.ui.gold;
  const icon = options.icon || '✦';
  const fills = {
    parchment: ['#fff7df', '#efd3a2'],
    wood: ['#b7793c', '#7a431f'],
    ledger: ['#fff1b9', '#efc869'],
    contract: ['#fff9e7', '#ead3a6'],
    celebration: ['#fff0b9', '#f3b54c'],
  };
  const pair = fills[variant] || fills.parchment;
  rect(x, y, w, h, panelFill(x, y, w, h, pair[0], pair[1]), '#8a5a2b', 16, 3);
  ctx.save();
  ctx.strokeStyle = 'rgba(255,255,255,0.42)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(x + 7, y + 7, w - 14, h - 14, 12);
  ctx.stroke();
  ctx.restore();
  drawRibbon(title, x + 14, y - 4, Math.min(w - 28, 330), banner, icon);
}

function drawPill(label, x, y, w, color, fg = '#fff8dc') {
  rect(x, y, w, 24, color, '#6a4327', 12, 2);
  text(label, x + w / 2, y + 5, 12, fg, 'center', '900');
}

function wrapText(value, x, y, maxWidth, lineHeight, size = 12, color = CONFIG.ui.text, weight = '700') {
  const words = String(value || '').split('');
  let line = '';
  let currentY = y;
  words.forEach((char) => {
    const test = line + char;
    if (ctx.measureText(test).width > maxWidth && line) {
      text(line, x, currentY, size, color, 'left', weight);
      line = char;
      currentY += lineHeight;
    } else {
      line = test;
    }
  });
  if (line) text(line, x, currentY, size, color, 'left', weight);
}

function drawMonsterFallback(unit, x, y, w, h) {
  const type = unit.speciesId || unit.enemyId || 'monster';
  const body = unit.color || '#94c45f';
  ctx.save();
  ctx.fillStyle = 'rgba(255,255,255,0.25)';
  ctx.beginPath();
  ctx.ellipse(x + w / 2, y + h * 0.86, w * 0.33, h * 0.08, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = body;
  ctx.strokeStyle = '#4b2b1b';
  ctx.lineWidth = 3;
  if (type === 'dragon') {
    ctx.beginPath(); ctx.ellipse(x + w * 0.52, y + h * 0.58, w * 0.28, h * 0.25, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#f7c15b'; ctx.beginPath(); ctx.moveTo(x + w * 0.76, y + h * 0.5); ctx.lineTo(x + w * 0.98, y + h * 0.44); ctx.lineTo(x + w * 0.82, y + h * 0.58); ctx.fill();
  } else if (type === 'ghost') {
    ctx.beginPath(); ctx.arc(x + w * 0.5, y + h * 0.42, w * 0.22, Math.PI, 0); ctx.lineTo(x + w * 0.72, y + h * 0.76); ctx.quadraticCurveTo(x + w * 0.58, y + h * 0.68, x + w * 0.5, y + h * 0.78); ctx.quadraticCurveTo(x + w * 0.4, y + h * 0.68, x + w * 0.28, y + h * 0.76); ctx.closePath(); ctx.fill(); ctx.stroke();
  } else {
    ctx.beginPath(); ctx.ellipse(x + w * 0.5, y + h * 0.56, w * 0.22, h * 0.27, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#f0d071'; ctx.beginPath(); ctx.moveTo(x + w * 0.36, y + h * 0.32); ctx.lineTo(x + w * 0.28, y + h * 0.18); ctx.lineTo(x + w * 0.46, y + h * 0.29); ctx.fill();
    ctx.beginPath(); ctx.moveTo(x + w * 0.64, y + h * 0.32); ctx.lineTo(x + w * 0.72, y + h * 0.18); ctx.lineTo(x + w * 0.54, y + h * 0.29); ctx.fill();
  }
  ctx.fillStyle = '#1f1712';
  ctx.beginPath(); ctx.arc(x + w * 0.43, y + h * 0.44, Math.max(2, w * 0.025), 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(x + w * 0.57, y + h * 0.44, Math.max(2, w * 0.025), 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}

function text(value, x, y, size = 16, color = CONFIG.ui.text, align = 'left', weight = '500') {
  if (!ctx) return;
  ctx.fillStyle = color;
  ctx.font = `${weight} ${size}px "Trebuchet MS", "Noto Sans JP", system-ui, sans-serif`;
  ctx.textAlign = align;
  ctx.textBaseline = 'top';
  ctx.fillText(String(value ?? ''), x, y);
}

function button(id, label, x, y, w, h, action, enabled = true) {
  const mouse = gameState.input.mouse || { x: -1, y: -1 };
  const hover = enabled && mouse.x >= x && mouse.x <= x + w && mouse.y >= y && mouse.y <= y + h;
  const fill = enabled ? (hover ? panelFill(x, y, w, h, '#ffd86b', '#ef941e') : panelFill(x, y, w, h, '#ffc34f', '#d9821f')) : panelFill(x, y, w, h, '#d3c0a3', '#b69a74');
  rect(x, y, w, h, fill, enabled ? '#8a4b18' : '#8c765b', 12, 3);
  text(label, x + w / 2, y + Math.max(8, h / 2 - 9), 16, enabled ? '#3b2517' : '#7b6751', 'center', '900');
  gameState.input.buttons.push({ id, x, y, w, h, action, enabled });
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
  const isEnemy = unit.unitType === 'enemy';
  const species = unit.speciesId ? CONFIG.monsters[unit.speciesId] : null;
  const imageKey = isEnemy ? `monsters.${unit.enemyId}.${unit.row}.idle` : `monsters.${unit.speciesId}.${CONFIG.monsters[unit.speciesId]?.preferredRow || 'front'}.idle`;
  const roleColor = isEnemy ? CONFIG.ui.red : ((species && species.preferredRow === 'front') ? CONFIG.ui.green : CONFIG.ui.blue);
  rect(x, y, w, h, panelFill(x, y, w, h, selected ? '#fff1a8' : '#fff9e6', selected ? '#f1c574' : '#ead0a2'), selected ? '#f5a623' : '#9c6a35', 14, selected ? 4 : 2);

  if (w < 110) {
    rect(x + 8, y + 8, w - 16, Math.max(34, h - 30), panelFill(x, y, w, h, '#dff2ff', '#b9dcf5'), '#9c6a35', 10, 2);
    safeDrawImage(ctx, gameState.assets.images[imageKey], x + 15, y + 10, w - 30, Math.max(30, h - 38), () => drawMonsterFallback(unit, x + 10, y + 6, w - 20, h - 26));
    text(unit.name, x + w / 2, y + h - 20, 12, CONFIG.ui.ink, 'center', '900');
    return;
  }

  if (h < 62) {
    rect(x + 5, y + 5, 42, 42, '#e8f4ff', '#9c6a35', 10, 2);
    safeDrawImage(ctx, gameState.assets.images[imageKey], x + 7, y + 6, 38, 38, () => drawMonsterFallback(unit, x + 5, y + 2, 42, 45));
    text(unit.name, x + 54, y + 6, 13, CONFIG.ui.ink, 'left', '900');
    text(`${traitLabels(unit.traits)[0] || '標準'} ・ ATK ${unit.attack}`, x + 54, y + 27, 11, roleColor, 'left', '800');
    return;
  }

  rect(x + 8, y + 8, Math.max(58, w * 0.48), h - 50, panelFill(x, y, w, h, '#dff2ff', '#bfdff0'), '#9c6a35', 12, 2);
  safeDrawImage(ctx, gameState.assets.images[imageKey], x + 12, y + 12, Math.max(50, w * 0.48 - 8), h - 58, () => drawMonsterFallback(unit, x + 8, y + 6, Math.max(58, w * 0.48), h - 48));
  const infoX = x + Math.max(72, w * 0.52);
  text(unit.name, infoX, y + 10, 17, CONFIG.ui.ink, 'left', '900');
  drawPill(isEnemy ? '脅威' : ((species && species.role) || rowLabel(unit.row)), infoX, y + 36, Math.min(98, w - (infoX - x) - 8), roleColor);
  text(traitLabels(unit.traits)[0] || '標準', infoX, y + 66, 12, roleColor, 'left', '900');
  text(`HP ${Math.max(0, unit.hp)}/${unit.maxHp}`, infoX, y + 84, 12, CONFIG.ui.muted, 'left', '800');
  text(`ATK ${unit.attack}`, infoX + 74, y + 84, 12, CONFIG.ui.muted, 'left', '800');
  if (unit.unitType === 'monster') text(`雇用 ${unit.hireCost}g`, x + 12, y + h - 24, 13, CONFIG.ui.gold, 'left', '900');
}

function drawStart() {
  ctx.fillStyle = panelFill(0, 0, CONFIG.canvas.width, CONFIG.canvas.height, '#95d5f5', '#f5cf8a');
  ctx.fillRect(0, 0, CONFIG.canvas.width, CONFIG.canvas.height);
  rect(300, 130, 680, 220, panelFill(300, 130, 680, 220, '#9c622f', '#623719'), '#4c2b17', 22, 5);
  text('魔王軍派遣センター', 640, 165, 44, '#ffd965', 'center', '900');
  text('～ 魔物人材で勝利と利益を掴め！ ～', 640, 220, 22, '#fff2bd', 'center', '900');
  text('敵を分析し、カードから採用し、卓上ボードへ配置して契約へ派遣しましょう。', 640, 282, 17, '#fff7de', 'center', '800');
  button('start', '求人ボードを開く', 505, 400, 270, 58, { type: 'start' });
}

function drawHeader() {
  drawRibbon(`Day ${gameState.day} / ${CONFIG.game.maxDay}　${modeLabel(gameState.mode)}`, 320, 12, 330, CONFIG.ui.purple, '📅');
  rect(26, 10, 250, 40, panelFill(26, 10, 250, 40, '#5e3a1d', '#321e12'), '#8a5a2b', 12, 3);
  text('魔王軍派遣センター', 44, 20, 21, '#ffe58b', 'left', '900');
  rect(1060, 10, 190, 40, panelFill(1060, 10, 190, 40, '#fff0b8', '#f3b743'), '#8a5a2b', 12, 3);
  text(`🪙 ${gameState.gold}G`, 1155, 18, 24, '#563414', 'center', '900');
  text(gameState.message, 675, 48, 14, CONFIG.ui.ink, 'center', '800');
}

function drawTag(label, x, y, w, color = CONFIG.ui.blue) {
  drawPill(label, x, y, w, color);
}

function drawBar(label, value, maxValue, x, y, w, color) {
  text(label, x, y, 13, CONFIG.ui.ink, 'left', '900');
  rect(x + 126, y - 1, w, 14, '#f9e8c1', '#a97943', 8, 2);
  const fillW = Math.max(3, Math.min(w, (value / Math.max(1, maxValue)) * w));
  ctx.fillStyle = color;
  ctx.fillRect(x + 128, y + 1, Math.max(2, fillW - 4), 10);
  text(label === '人間存在率' ? `${value}%` : threatStars(value), x + 126 + w + 8, y - 2, 13, color, 'left', '800');
}

function drawEnemyPanel() {
  drawPanel('敵軍インテリジェンス', 20, 64, 410, 246, { variant: 'parchment', banner: CONFIG.ui.red, icon: '⚔' });
  const enemies = [...gameState.enemyFormation.front, ...gameState.enemyFormation.back];
  const intel = enemyIntelligence();
  text(`Human Presence: ${intel.humanPresence >= 75 ? 'High' : intel.humanPresence >= 45 ? 'Medium' : 'Low'}`, 38, 96, 17, CONFIG.ui.red, 'left', '900');
  enemies.slice(0, 4).forEach((enemy, index) => {
    const x = 36 + index * 94;
    rect(x, 122, 82, 72, '#fff7df', '#b8844b', 12, 2);
    drawUnit(enemy, x + 6, 128, 70, 58);
    drawPill(`×${enemies.filter((e) => e.enemyId === enemy.enemyId).length}`, x + 52, 126, 28, CONFIG.ui.red);
  });
  if (enemies.length > 4) text(`+${enemies.length - 4}`, 398, 150, 18, CONFIG.ui.gold, 'center', '900');
  drawBar('人間存在率', intel.humanPresence, 100, 38, 212, 86, CONFIG.ui.red);
  drawBar('前線脅威', intel.frontlineThreat, 90, 38, 236, 86, CONFIG.ui.orange);
  drawBar('後方火力', intel.backlineThreat, 80, 38, 260, 86, CONFIG.ui.blue);
  rect(256, 208, 156, 82, panelFill(256, 208, 156, 82, '#fff3cb', '#f5d9a3'), '#d85a4c', 14, 3);
  text('おすすめ採用', 270, 218, 14, CONFIG.ui.red, 'left', '900');
  intel.recommended.slice(0, 3).forEach((item, index) => text(`✦ ${item}`, 270, 242 + index * 17, 12, CONFIG.ui.ink, 'left', '800'));
}

function drawMarketPanel() {
  drawPanel('モンスター応募者（求人市場）', 450, 64, 810, 246, { variant: 'parchment', banner: CONFIG.ui.blue, icon: '☄' });
  text('カードをクリックして採用：役割・特性を先に見て、数字はあとで確認。', 674, 96, 13, CONFIG.ui.muted, 'left', '800');
  gameState.market.forEach((card, index) => {
    const monster = CONFIG.monsters[card.speciesId];
    if (!monster) return;
    const x = 464 + index * 156;
    const y = 112;
    const frameColor = monster.preferredRow === 'front' ? CONFIG.ui.green : CONFIG.ui.blue;
    rect(x, y, 146, 180, panelFill(x, y, 146, 180, card.sold ? '#dcc9aa' : '#fff9e6', card.sold ? '#bfa988' : '#efd09b'), card.sold ? '#9b8464' : frameColor, 16, 3);
    text(monster.name, x + 73, y + 10, 20, card.sold ? CONFIG.ui.muted : CONFIG.ui.ink, 'center', '900');
    drawPill(monster.role, x + 14, y + 36, 118, frameColor);
    rect(x + 14, y + 64, 118, 82, panelFill(x, y, 118, 82, '#dff2ff', '#bcdcf0'), '#9c6a35', 12, 2);
    const imageKey = `cards.${monster.id}.${monster.preferredRow}.idle`;
    safeDrawImage(ctx, gameState.assets.images[imageKey], x + 16, y + 60, 114, 88, () => drawMonsterFallback({ ...monster, speciesId: monster.id, color: monster.color }, x + 16, y + 58, 114, 90));
    drawPill(card.sold ? '雇用済' : `${monster.hireCost}G`, x + 90, y + 154, 44, CONFIG.ui.gold, '#3b2517');
    drawPill(monster.specialty, x + 12, y + 154, 72, CONFIG.ui.purple);
    wrapText(monster.statement, x + 14, y + 181, 118, 13, 10, '#5d3a1f', '900');
    gameState.input.cards.push({ x, y, w: 146, h: 180, action: { type: 'hire', id: card.id }, enabled: !card.sold });
  });
}

function drawFormationPanel() {
  drawPanel('自軍編成ボード', 20, 334, 540, 426, { variant: 'wood', banner: CONFIG.ui.blue, icon: '▦' });
  text('卓上の配置枠へドラッグ感覚でクリック配置。空き枠も派遣準備中です。', 38, 366, 13, '#fff2bd', 'left', '800');
  const slotW = 136;
  ['front', 'back'].forEach((row, rowIndex) => {
    const y = 402 + rowIndex * 106;
    const rowTitle = row === 'front' ? 'FRONTLINE' : 'BACKLINE';
    const rowSub = row === 'front' ? '盾・近接' : '遠距離・支援';
    rect(34, y, 108, 82, panelFill(34, y, 108, 82, row === 'front' ? '#b76e36' : '#4a91c9', row === 'front' ? '#76411f' : '#266497'), '#f3d18a', 14, 3);
    text(rowTitle, 88, y + 15, 15, '#fff7df', 'center', '900');
    text(rowSub, 88, y + 44, 12, '#ffe9b8', 'center', '800');
    const max = row === 'front' ? CONFIG.formation.frontSlots : CONFIG.formation.backSlots;
    for (let slot = 0; slot < max; slot += 1) {
      const x = 152 + slot * (slotW + 8);
      const unit = livingArmy().find((u) => u && u.row === row && u.slot === slot);
      rect(x, y, slotW, 82, unit ? '#fff6df' : 'rgba(255,246,223,0.55)', unit ? '#f5c04f' : '#d8bd8d', 14, 3);
      drawTag(`${row === 'front' ? '前衛' : '後衛'} ${slot + 1}`, x + 12, y + 8, 72, row === 'front' ? CONFIG.ui.orange : CONFIG.ui.blue);
      if (unit) drawUnit(unit, x + 8, y + 34, slotW - 16, 42, gameState.selectedUnitId === unit.id);
      else {
        text('◇', x + slotW / 2, y + 36, 24, '#b69a74', 'center', '900');
        text('空きスロット', x + slotW / 2, y + 59, 12, '#7c5a38', 'center', '800');
      }
      gameState.input.slots.push({ x, y, w: slotW, h: 82, action: { type: 'slot', row, slot }, enabled: true });
    }
  });
  rect(34, 618, 504, 82, panelFill(34, 618, 504, 82, '#f8e6c0', '#dcb982'), '#8a5a2b', 14, 3);
  text('BENCH（控えメンバー）', 50, 630, 15, CONFIG.ui.ink, 'left', '900');
  livingArmy().filter((u) => !u.row).slice(0, 5).forEach((unit, index) => {
    const x = 48 + index * 96;
    const y = 652;
    drawUnit(unit, x, y, 88, 40, gameState.selectedUnitId === unit.id);
    gameState.input.cards.push({ x, y, w: 88, h: 40, action: { type: 'selectUnit', id: unit.id }, enabled: true });
  });
  livingArmy().filter((u) => u.row).forEach((unit) => {
    const rowIndex = unit.row === 'front' ? 0 : 1;
    const x = 152 + (unit.slot || 0) * (slotW + 8) + 8;
    const y = 402 + rowIndex * 106 + 34;
    gameState.input.cards.push({ x, y, w: slotW - 16, h: 42, action: { type: 'selectUnit', id: unit.id }, enabled: true });
  });
  button('bench', '控えへ戻す', 34, 714, 150, 34, { type: 'bench' }, Boolean(gameState.selectedUnitId) && gameState.mode === 'planning');
  button('battle', '⚔ 派遣開始！', 370, 714, 168, 34, { type: 'battle' }, gameState.mode === 'planning' && deployedArmy().length > 0);
}

function drawPredictionPanel() {
  drawPanel('契約予測', 580, 334, 680, 116, { variant: 'contract', banner: CONFIG.ui.blue, icon: '📜' });
  const prediction = contractPrediction();
  const items = [
    ['⚔', '勝率', `${prediction.chance}%`, prediction.chance >= 60 ? CONFIG.ui.green : CONFIG.ui.red],
    ['☠', '損耗', `${prediction.expectedDead}体`, CONFIG.ui.ink],
    ['🪙', '利益', `${prediction.projectedProfit >= 0 ? '+' : ''}${prediction.projectedProfit}G`, prediction.projectedProfit >= 0 ? CONFIG.ui.green : CONFIG.ui.red],
  ];
  items.forEach(([icon, label, value, color], index) => {
    const x = 604 + index * 176;
    rect(x, 374, 160, 56, '#fffaf0', '#d4a15e', 12, 2);
    text(icon, x + 20, 387, 24, color, 'center', '900');
    text(label, x + 48, 382, 13, CONFIG.ui.muted, 'left', '900');
    text(value, x + 48, 398, 26, color, 'left', '900');
  });
  rect(1130, 374, 108, 56, '#fff0cf', '#d4a15e', 12, 2);
  wrapText(prediction.summary, 1142, 386, 84, 14, 11, CONFIG.ui.ink, '800');
}

function drawReportPanel() {
  drawPanel('前回の戦闘結果', 580, 474, 300, 286, { variant: 'celebration', banner: CONFIG.ui.purple, icon: '★' });
  if (gameState.report) {
    const evaluation = reportEvaluation();
    text('★★★★★ Hiring Evaluation', 604, 510, 18, '#8a4b18', 'left', '900');
    text(evaluation.stars, 604, 540, 30, '#ffcf33', 'left', '900');
    drawPill(gameState.report.victory ? '契約成功' : '契約失敗', 604, 580, 112, gameState.report.victory ? CONFIG.ui.green : CONFIG.ui.red);
    text(`Profit ${gameState.economy.profit >= 0 ? '+' : ''}${gameState.economy.profit}G`, 604, 616, 24, gameState.economy.profit >= 0 ? CONFIG.ui.green : CONFIG.ui.red, 'left', '900');
    text(`損耗: ${gameState.report.dead.length ? gameState.report.dead.join('、') : 'なし'}`, 604, 650, 13, CONFIG.ui.ink, 'left', '800');
    wrapText(gameState.report.victory ? '完璧な採用だったよ！損耗ゼロなら大勝利！' : '対策カードを優先して次の契約へ備えよう。', 604, 682, 248, 16, 13, '#5d3a1f', '900');
  } else {
    text('戦闘後に採用評価を表示', 604, 530, 18, '#8a4b18', 'left', '900');
    text('★★★★★', 604, 568, 28, '#d6ba7c', 'left', '900');
  }
}

function drawMvpPanel() {
  drawPanel('MVP Employee', 900, 474, 180, 286, { variant: 'parchment', banner: CONFIG.ui.green, icon: '👑' });
  const mvp = gameState.report ? employeeOfTheDay() : null;
  if (mvp) {
    const base = CONFIG.monsters[mvp.speciesId] || {};
    rect(920, 520, 140, 118, panelFill(920, 520, 140, 118, '#dff2ff', '#bddded'), '#9c6a35', 14, 2);
    drawMonsterFallback({ ...mvp, color: mvp.color || base.color }, 924, 514, 132, 124);
    text(mvp.name, 990, 648, 20, CONFIG.ui.ink, 'center', '900');
    drawPill(`撃破 ${mvp.kills}`, 932, 678, 96, CONFIG.ui.gold, '#3b2517');
    wrapText(mvp.contribution, 920, 712, 136, 15, 12, CONFIG.ui.muted, '800');
  } else {
    text('戦闘後に発表', 990, 536, 16, CONFIG.ui.muted, 'center', '900');
    text('👑', 990, 582, 44, CONFIG.ui.gold, 'center', '900');
  }
}

function drawEconomyPanel() {
  drawPanel('経済サマリー', 1100, 474, 160, 286, { variant: 'ledger', banner: CONFIG.ui.orange, icon: '🪙' });
  text('所持ゴールド', 1118, 512, 13, '#6a4327', 'left', '900');
  text(`${gameState.gold}G`, 1118, 534, 26, '#8a4b18', 'left', '900');
  rect(1118, 580, 124, 82, '#fff8df', '#d4a15e', 12, 2);
  text(`報酬 +${gameState.economy.reward}G`, 1130, 594, 13, CONFIG.ui.green, 'left', '900');
  text(`補填 -${gameState.economy.replacementCosts}G`, 1130, 622, 13, CONFIG.ui.red, 'left', '900');
  const profitColor = gameState.economy.profit >= 0 ? CONFIG.ui.green : CONFIG.ui.red;
  text('純利益', 1118, 678, 13, '#6a4327', 'left', '900');
  text(`${gameState.economy.profit >= 0 ? '+' : ''}${gameState.economy.profit}G`, 1118, 698, 27, profitColor, 'left', '900');
  if (gameState.mode === 'report' && gameState.phase === 'playing') button('continue', '翌日へ', 1118, 728, 124, 26, { type: 'continue' });
  if (gameState.phase === 'gameover') button('restart', '再開', 1118, 728, 124, 26, { type: 'restart' });
}

function render() {
  if (!ctx) return;
  gameState.input.buttons = [];
  gameState.input.cards = [];
  gameState.input.slots = [];
  ctx.clearRect(0, 0, CONFIG.canvas.width, CONFIG.canvas.height);
  ctx.fillStyle = panelFill(0, 0, CONFIG.canvas.width, CONFIG.canvas.height, '#9ed8f6', '#f4cf92');
  ctx.fillRect(0, 0, CONFIG.canvas.width, CONFIG.canvas.height);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
  ctx.beginPath(); ctx.arc(112, 82, 38, 0, Math.PI * 2); ctx.arc(156, 76, 48, 0, Math.PI * 2); ctx.arc(206, 88, 34, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#8fc36d';
  ctx.beginPath(); ctx.moveTo(0, 820); ctx.lineTo(0, 760); ctx.quadraticCurveTo(360, 704, 720, 760); ctx.quadraticCurveTo(1020, 804, 1280, 746); ctx.lineTo(1280, 820); ctx.closePath(); ctx.fill();
  rect(14, 54, 1252, 718, 'rgba(255, 246, 223, 0.34)', 'rgba(138, 90, 43, 0.28)', 18, 2);
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
