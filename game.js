'use strict';

const CONFIG = Object.freeze({
  canvas: { width: 1280, height: 820, fps: 60 },
  game: { startingGold: 120, baseMarketSize: 5, baseContractSlots: 3, winRank: 'A' },
  BATTLE: { MIN_DURATION_MS: 5000 },
  formation: { frontSlots: 3, backSlots: 3 },
  economy: { replacementMultiplier: 2 },
  combat: {
    difficultyStatGrowth: 0.1,
    mergedStatMultiplier: 1.7,
    mergedCostMultiplier: 2,
    splashTargets: 2,
    battleLogLimit: 7,
    tickMs: 420,
    maxTicks: 90,
    battleMaxMs: 70000,
    attackCooldownBaseMs: 1850,
    attackCooldownSpeedStepMs: 210,
    minAttackCooldownMs: 720,
    healerCooldownMs: 2400,
    effectDurationMs: 860,
    attackBumpMs: 260,
    deathFadeMs: 620,
    slashDurationMs: 280,
    projectileDurationMs: 360,
    casualtyFlashMs: 360,
    survivedBonus: 12,
    mvpKillWeight: 3,
    mvpDamageWeight: 1,
    mvpHealingWeight: 0.35,
    maxBattleLogLines: 7,
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
    backlineAttack: { label: '後衛攻撃' },
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
    archer: { id: 'archer', name: '弓兵', faction: '弓兵', hp: 32, attack: 11, speed: 1, row: 'back', armor: 0, traits: ['遠隔人間', 'backlineAttack'], color: '#d7a45f', icon: 'ARC' },
    healer: { id: 'healer', name: '治療師', faction: '治療師', hp: 30, attack: 6, speed: 2, row: 'back', armor: 0, traits: ['味方回復'], color: '#f0df8d', icon: 'HEA' },
    captain: { id: 'captain', name: '隊長', faction: '隊長', hp: 72, attack: 15, speed: 3, row: 'front', armor: 3, traits: ['人間指揮官'], color: '#ffcc66', icon: 'CAP' },
  },

  ranks: [
    { rank: 'E', reputation: 0 },
    { rank: 'D', reputation: 40 },
    { rank: 'C', reputation: 95 },
    { rank: 'B', reputation: 170 },
    { rank: 'A', reputation: 270 },
    { rank: 'S', reputation: 420 },
  ],
  contractTemplates: [
    { title: '聖騎士小隊の足止め', reward: 120, difficulty: 1, enemies: ['knight', 'archer'], bonusObjective: 'No Casualties', bonusReward: 45, minRank: 'E' },
    { title: '巡礼弓兵隊の攪乱', reward: 145, difficulty: 1, enemies: ['archer', 'archer', 'knight'], bonusObjective: 'Deploy 3 Units Or Less', bonusReward: 55, minRank: 'E' },
    { title: '前線治療班の排除', reward: 180, difficulty: 2, enemies: ['knight', 'healer', 'archer'], bonusObjective: 'Use Human Slayer', bonusReward: 60, minRank: 'D' },
    { title: '城門守備隊への増援派遣', reward: 220, difficulty: 2, enemies: ['knight', 'knight', 'healer'], bonusObjective: 'Finish With Profit Above 100G', bonusReward: 75, minRank: 'D' },
    { title: '聖堂精鋭の迎撃契約', reward: 280, difficulty: 3, enemies: ['captain', 'knight', 'archer'], bonusObjective: 'Complete Without Merged Units', bonusReward: 95, minRank: 'C' },
    { title: '補給線制圧の短期契約', reward: 320, difficulty: 3, enemies: ['captain', 'healer', 'archer', 'archer'], bonusObjective: 'Deploy 3 Units Or Less', bonusReward: 110, minRank: 'C' },
    { title: '聖都外郭の威力偵察', reward: 390, difficulty: 4, enemies: ['captain', 'knight', 'knight', 'healer'], bonusObjective: 'No Casualties', bonusReward: 140, minRank: 'B' },
    { title: '勇者護衛隊の分断作戦', reward: 460, difficulty: 4, enemies: ['captain', 'captain', 'archer', 'healer'], bonusObjective: 'Use Human Slayer', bonusReward: 155, minRank: 'B' },
    { title: 'Hero Elimination Contract', reward: 620, difficulty: 5, enemies: ['captain', 'captain', 'knight', 'archer', 'healer', 'archer'], bonusObjective: 'Finish With Profit Above 100G', bonusReward: 220, minRank: 'A', heroContract: true },
  ],
  investments: [
    { id: 'recruitmentAd', name: 'Recruitment Ad', cost: 100, description: '+1 Market Candidate', maxLevel: 2 },
    { id: 'agencyPartnership', name: 'Agency Partnership', cost: 200, description: 'Choose one species preference', maxLevel: 1 },
    { id: 'premiumContractDesk', name: 'Premium Contract Desk', cost: 300, description: 'Unlock higher-tier contracts', maxLevel: 1 },
  ],
  ui: {
    panel: '#fff0cf', panel2: '#f6dfb4', line: '#9c6a35', text: '#3b2517', muted: '#775338', gold: '#d88922',
    red: '#d85a4c', green: '#4fa85d', blue: '#3d8bd6', purple: '#7e55b8', orange: '#f29a2e',
    darkPanel: '#181512', damage: '#f05a36', heal: '#49d36f', trait: '#ffe05f',
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
  mode: 'contractSelect',
  market: [],
  army: [],
  contractOffers: [],
  currentContract: null,
  company: { reputation: 0, rank: 'E', totalProfit: 0, completedContracts: 0 },
  investments: { recruitmentAd: 0, agencyPartnership: 0, premiumContractDesk: 0 },
  speciesPreference: null,
  enemyFormation: { front: [], back: [] },
  selectedUnitId: null,
  selectedMergeId: null,
  battle: null,
  report: null,
  economy: { reward: 0, bonusReward: 0, replacementCosts: 0, profit: 0, reputationGain: 0, bonusAchieved: false },
  message: 'ようこそ、採用責任者。契約を選び、必要な魔物だけを採用してください。',
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

function makeEnemy(enemyId, index, difficulty = 1) {
  const base = CONFIG.enemies[enemyId];
  if (!base) return null;
  const difficultyScale = 1 + (Math.max(1, difficulty) - 1) * CONFIG.combat.difficultyStatGrowth;
  return {
    unitType: 'enemy', id: `e${gameState.day}_${index}`, enemyId, name: base.name, faction: base.faction,
    row: base.row, slot: index, alive: true, hp: Math.round(base.hp * difficultyScale), maxHp: Math.round(base.hp * difficultyScale),
    attack: Math.round(base.attack * difficultyScale), speed: base.speed, armor: base.armor, traits: [...base.traits], color: base.color, icon: base.icon,
  };
}


function rankIndex(rank) {
  return CONFIG.ranks.findIndex((item) => item.rank === rank);
}

function rankForReputation(reputation) {
  return CONFIG.ranks.slice().reverse().find((item) => reputation >= item.reputation)?.rank || 'E';
}

function marketSize() {
  return CONFIG.game.baseMarketSize + (gameState.investments.recruitmentAd || 0);
}

function contractSlotCount() {
  return CONFIG.game.baseContractSlots + (gameState.investments.premiumContractDesk ? 1 : 0);
}

function availableContracts() {
  const rank = rankIndex(gameState.company.rank);
  const premium = gameState.investments.premiumContractDesk ? 1 : 0;
  return CONFIG.contractTemplates.filter((contract) => rankIndex(contract.minRank) <= rank + premium);
}

function cloneContract(template, index) {
  return {
    id: `c${gameState.day}_${index}`,
    title: template.title,
    reward: template.reward,
    difficulty: template.difficulty,
    enemyFormation: [...template.enemies],
    bonusObjective: template.bonusObjective,
    bonusReward: template.bonusReward,
    heroContract: Boolean(template.heroContract),
  };
}

function generateContractOffers() {
  const pool = availableContracts().sort((a, b) => (a.difficulty - b.difficulty) || a.title.localeCompare(b.title));
  const offset = (gameState.company.completedContracts + gameState.day - 1) % Math.max(1, pool.length);
  const offers = [];
  for (let i = 0; i < Math.min(contractSlotCount(), pool.length); i += 1) {
    offers.push(cloneContract(pool[(offset + i) % pool.length], i));
  }
  return offers;
}

function generateMarket(contract) {
  const preferred = [];
  if (contract.bonusObjective === 'Use Human Slayer') preferred.push('orc', 'orc');
  if (contract.bonusObjective === 'No Casualties') preferred.push('ghost', 'dragon');
  if (contract.bonusObjective === 'Deploy 3 Units Or Less') preferred.push('dragon', 'orc');
  if (contract.bonusObjective === 'Complete Without Merged Units') preferred.push('goblin', 'ghost', 'orc');
  if (contract.bonusObjective === 'Finish With Profit Above 100G') preferred.push('goblin', 'ghost');
  if (gameState.speciesPreference) preferred.unshift(gameState.speciesPreference, gameState.speciesPreference);
  const rotation = ['orc', 'goblin', 'ghost', 'dragon'];
  const desired = marketSize();
  const list = [];
  let cursor = (gameState.day + (contract?.difficulty || 1)) % rotation.length;
  while (list.length < desired) {
    list.push(preferred[list.length] || rotation[(cursor + list.length) % rotation.length]);
  }
  return list.slice(0, desired).map((speciesId, index) => ({ id: `m${gameState.day}_${index}`, speciesId, sold: false }));
}

function setEnemyFormation(contract) {
  const enemies = ((contract && contract.enemyFormation) || []).map((enemyId, index) => makeEnemy(enemyId, index, contract.difficulty)).filter(Boolean);
  gameState.enemyFormation = { front: enemies.filter((e) => e.row === 'front'), back: enemies.filter((e) => e.row === 'back') };
}

function prepareDay() {
  gameState.contractOffers = generateContractOffers();
  gameState.currentContract = null;
  gameState.market = [];
  gameState.enemyFormation = { front: [], back: [] };
  gameState.mode = 'contractSelect';
  gameState.selectedUnitId = null;
  gameState.selectedMergeId = null;
  gameState.battle = null;
  gameState.report = null;
  gameState.economy = { reward: 0, bonusReward: 0, replacementCosts: 0, profit: 0, reputationGain: 0, bonusAchieved: false };
  gameState.message = '契約オファーを比較し、採用方針に合う案件を選んでください。';
}

function selectContract(contractId) {
  if (gameState.phase !== 'playing' || gameState.mode !== 'contractSelect') return;
  const contract = gameState.contractOffers.find((item) => item.id === contractId);
  if (!contract) return;
  gameState.currentContract = contract;
  gameState.market = generateMarket(contract);
  setEnemyFormation(contract);
  gameState.mode = 'formation';
  gameState.economy = { reward: contract.reward, bonusReward: contract.bonusReward, replacementCosts: 0, profit: 0, reputationGain: 0, bonusAchieved: false };
  gameState.message = `${contract.title}を受注。敵情報とボーナス条件を見て応募者を採用しましょう。`;
}

function currentReward() {
  return gameState.currentContract ? gameState.currentContract.reward : 0;
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
  gameState.company = { reputation: 0, rank: 'E', totalProfit: 0, completedContracts: 0 };
  gameState.investments = { recruitmentAd: 0, agencyPartnership: 0, premiumContractDesk: 0 };
  gameState.speciesPreference = null;
  gameState.currentContract = null;
  gameState.contractOffers = [];
  gameState.counters.unit = 1;
  prepareDay();
}

function hire(marketId) {
  if (gameState.phase !== 'playing' || gameState.mode !== 'formation') return;
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
  if (!unit || gameState.mode !== 'formation') return;
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
  if (gameState.mode !== 'formation') return;
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
  if (!unit || gameState.mode !== 'formation') return;
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
  if (gameState.mode !== 'formation') return;
  normalizeFormation();
  if (deployedArmy().length <= 0) {
    gameState.message = '戦闘前に最低1体のモンスターを配置してください。';
    return;
  }
  const enemies = [...gameState.enemyFormation.front, ...gameState.enemyFormation.back].filter(Boolean);
  if (enemies.length <= 0) return;
  gameState.mode = 'battle';
  const army = deployedArmy();
  gameState.battle = {
    elapsed: 0,
    timeMs: 0,
    tick: 0,
    log: ['契約履行開始。採用メンバーを評価します。'],
    enemies,
    stats: {},
    effects: [],
    completed: false,
    victory: null,
    resolvedAtMs: null,
  };
  [...army, ...enemies].forEach((unit) => {
    if (!unit) return;
    unit.battleCooldownMs = Math.round(attackCooldownMs(unit) * (0.35 + stableUnitRoll(unit.id, 1) * 0.35));
    unit.attackAnimMs = 0;
    unit.deathAnimMs = 0;
    unit.lastHitMs = 0;
  });
  army.forEach((unit) => {
    gameState.battle.stats[unit.id] = makeBattleStat(unit);
  });
  gameState.message = '戦闘中です。指揮入力は受け付けません。採用判断の結果を見守りましょう。';
}

function makeBattleStat(unit) {
  return {
    name: unit?.name || '不明', speciesId: unit?.speciesId || null, color: unit?.color || CONFIG.ui.muted,
    kills: 0, damageDealt: 0, damage: 0, damageTaken: 0, healingDone: 0, survived: false,
    traitHits: {},
  };
}

function getCombatants(side) {
  if (side === 'army') return deployedArmy().filter((u) => u && u.alive !== false && u.hp > 0);
  const battleEnemies = gameState.battle && Array.isArray(gameState.battle.enemies) ? gameState.battle.enemies : [];
  return battleEnemies.filter((u) => u && u.alive !== false && u.hp > 0);
}

function attackCooldownMs(unit) {
  const speed = Math.max(1, Number(unit?.speed) || 1);
  return Math.max(CONFIG.combat.minAttackCooldownMs, CONFIG.combat.attackCooldownBaseMs - speed * CONFIG.combat.attackCooldownSpeedStepMs);
}

function stableUnitRoll(id, salt = 0) {
  const value = String(id || '').split('').reduce((sum, char) => sum + char.charCodeAt(0), 0) + salt * 97 + (gameState.battle?.tick || 0) * 13;
  return (value % 100) / 100;
}

function hasTrait(unit, trait) {
  return Boolean(unit && Array.isArray(unit.traits) && unit.traits.includes(trait));
}

function chooseTarget(attacker, targets) {
  if (!attacker || !Array.isArray(targets) || targets.length <= 0) return null;
  const canReachBack = hasTrait(attacker, 'areaAttack') || hasTrait(attacker, 'backlineAttack');
  const front = targets.filter((u) => u && u.row === 'front');
  const back = targets.filter((u) => u && u.row === 'back');
  const pool = CONFIG.combat.targetFrontFirst && front.length && !canReachBack ? front : (canReachBack && back.length ? [...front, ...back] : targets);
  return pool.slice().sort((a, b) => (a.row === b.row ? (a.slot || 0) - (b.slot || 0) : (a.row === 'front' ? -1 : 1)))[0] || null;
}

function chooseAreaTargets(attacker, primary, targets) {
  if (!attacker || !primary || !Array.isArray(targets)) return [];
  if (!hasTrait(attacker, 'areaAttack')) return [primary];
  const others = targets.filter((u) => u && u.id !== primary.id);
  return [primary, ...others.slice(0, CONFIG.combat.splashTargets)];
}

function deterministicHit(attacker, defender) {
  if (!attacker || !defender) return false;
  let accuracy = CONFIG.combat.baseAccuracy;
  if (hasTrait(defender, 'evasion')) accuracy -= CONFIG.combat.evasionAccuracyPenalty;
  return stableUnitRoll(`${attacker.id}:${defender.id}`, 2) <= accuracy;
}

function calculateDamage(attacker, defender, options = {}) {
  if (!attacker || !defender) return { amount: 0, traits: [] };
  let damage = Number(attacker.attack) || 0;
  const traits = [];
  if (hasTrait(attacker, 'humanSlayer') && defender.unitType === 'enemy') {
    damage += CONFIG.traits.humanSlayer.bonusVsHuman;
    traits.push('humanSlayer');
  }
  if (options.splash) {
    damage *= CONFIG.combat.areaSplashMultiplier;
    traits.push('areaAttack');
  }
  if (hasTrait(defender, 'physicalResistance') && attacker.damageType === 'physical') {
    damage *= CONFIG.combat.resistancePhysicalMultiplier;
    traits.push('physicalResistance');
  }
  damage -= Number(defender.armor) || 0;
  return { amount: Math.max(1, Math.round(damage)), traits };
}

function applyDamage(attacker, target, damage, traits = []) {
  if (!target || !Number.isFinite(damage)) return 0;
  const targetHpBefore = Math.max(0, Number(target.hp) || 0);
  const dealt = Math.min(Math.max(0, Math.round(damage)), targetHpBefore);
  target.hp = Math.max(0, targetHpBefore - dealt);
  target.lastHitMs = CONFIG.combat.casualtyFlashMs;
  recordDamageTaken(target, dealt);
  recordContribution(attacker, dealt, false);
  addBattleEffect({ type: 'damage', targetId: target.id, value: dealt, color: CONFIG.ui.damage, durationMs: CONFIG.combat.effectDurationMs });
  traits.forEach((trait) => showTraitText(trait, attacker, target));
  if (target.hp <= 0 && target.alive !== false) {
    target.alive = false;
    target.deathAnimMs = CONFIG.combat.deathFadeMs;
    recordContribution(attacker, 0, true);
    addBattleEffect({ type: 'trait', targetId: target.id, text: 'DOWN!', color: CONFIG.ui.red, durationMs: CONFIG.combat.effectDurationMs });
    pushBattleLog(`${target.name}が倒れた。`);
  }
  return dealt;
}

function healUnit(healer, target, amount) {
  if (!healer || !target || target.alive === false || target.hp <= 0) return 0;
  const before = Math.max(0, Number(target.hp) || 0);
  target.hp = Math.min(target.maxHp || before, before + Math.max(0, Math.round(amount || 0)));
  const healed = target.hp - before;
  if (healed > 0) {
    recordHealing(healer, healed);
    addBattleEffect({ type: 'heal', targetId: target.id, value: healed, color: CONFIG.ui.heal, durationMs: CONFIG.combat.effectDurationMs });
    showTraitText('heal', healer, target);
    pushBattleLog(`${healer.name}が${target.name}を${healed}回復。`);
  }
  return healed;
}

function showTraitText(trait, actor, target) {
  const labels = {
    humanSlayer: 'HUMAN SLAYER!',
    physicalResistance: 'RESIST!',
    areaAttack: 'BREATH!',
    evasion: 'EVADE!',
    heal: 'HEAL!',
  };
  const textValue = labels[trait];
  if (!textValue) return;
  addBattleEffect({ type: 'trait', targetId: target?.id || actor?.id, sourceId: actor?.id, text: textValue, color: trait === 'heal' ? CONFIG.ui.heal : CONFIG.ui.trait, durationMs: CONFIG.combat.effectDurationMs });
  recordTrait(actor, trait);
}

function addBattleEffect(effect) {
  const battle = gameState.battle;
  if (!battle || !Array.isArray(battle.effects)) return;
  battle.effects.push({ ...effect, ageMs: 0, durationMs: effect.durationMs || CONFIG.combat.effectDurationMs });
}

function pushBattleLog(message) {
  const log = gameState.battle && Array.isArray(gameState.battle.log) ? gameState.battle.log : [];
  log.unshift(message);
  while (log.length > CONFIG.combat.maxBattleLogLines) log.pop();
}

function doAttack(attacker, side) {
  if (!attacker || attacker.alive === false || attacker.hp <= 0) return;
  const targets = getCombatants(side === 'army' ? 'enemy' : 'army');
  const target = chooseTarget(attacker, targets);
  if (!target) return;
  attacker.attackAnimMs = CONFIG.combat.attackBumpMs;
  addBattleEffect({ type: attacker.damageType === 'physical' ? 'slash' : 'projectile', sourceId: attacker.id, targetId: target.id, color: attacker.color || CONFIG.ui.damage, durationMs: CONFIG.combat.slashDurationMs });
  if (!deterministicHit(attacker, target)) {
    if (hasTrait(target, 'evasion')) showTraitText('evasion', target, target);
    pushBattleLog(`${target.name}が${attacker.name}の攻撃を回避。`);
    return;
  }
  const hitTargets = chooseAreaTargets(attacker, target, targets);
  if (hasTrait(attacker, 'areaAttack')) showTraitText('areaAttack', attacker, target);
  hitTargets.forEach((hitTarget, index) => {
    if (!hitTarget || hitTarget.alive === false || hitTarget.hp <= 0) return;
    const result = calculateDamage(attacker, hitTarget, { splash: index > 0 });
    const dealt = applyDamage(attacker, hitTarget, result.amount, result.traits);
    pushBattleLog(`${attacker.name}が${hitTarget.name}に${dealt}ダメージ。`);
  });
}

function recordContribution(attacker, damage, killed) {
  if (!attacker || attacker.unitType !== 'monster' || !gameState.battle || !gameState.battle.stats) return;
  if (!gameState.battle.stats[attacker.id]) gameState.battle.stats[attacker.id] = makeBattleStat(attacker);
  const stat = gameState.battle.stats[attacker.id];
  stat.damageDealt += Math.max(0, Math.round(damage || 0));
  stat.damage = stat.damageDealt;
  if (killed) stat.kills += 1;
}

function recordDamageTaken(target, damage) {
  if (!target || target.unitType !== 'monster' || !gameState.battle?.stats) return;
  if (!gameState.battle.stats[target.id]) gameState.battle.stats[target.id] = makeBattleStat(target);
  gameState.battle.stats[target.id].damageTaken += Math.max(0, Math.round(damage || 0));
}

function recordHealing(healer, amount) {
  if (!healer || healer.unitType !== 'monster' || !gameState.battle?.stats) return;
  if (!gameState.battle.stats[healer.id]) gameState.battle.stats[healer.id] = makeBattleStat(healer);
  gameState.battle.stats[healer.id].healingDone += Math.max(0, Math.round(amount || 0));
}

function recordTrait(actor, trait) {
  if (!actor || actor.unitType !== 'monster' || !gameState.battle?.stats) return;
  if (!gameState.battle.stats[actor.id]) gameState.battle.stats[actor.id] = makeBattleStat(actor);
  const traitHits = gameState.battle.stats[actor.id].traitHits || {};
  traitHits[trait] = (traitHits[trait] || 0) + 1;
  gameState.battle.stats[actor.id].traitHits = traitHits;
}

function enemySupportActions(enemy) {
  if (!enemy || enemy.enemyId !== 'healer') return false;
  const enemies = getCombatants('enemy');
  const wounded = enemies.filter((ally) => ally && ally.hp > 0 && ally.hp < ally.maxHp).sort((a, b) => (a.hp || 0) - (b.hp || 0))[0];
  if (wounded) healUnit(enemy, wounded, CONFIG.combat.healerAmount);
  return Boolean(wounded);
}

function updateBattleEffects(deltaMs) {
  const battle = gameState.battle;
  if (!battle) return;
  [...getCombatants('army'), ...getCombatants('enemy'), ...(battle.enemies || [])].forEach((unit) => {
    if (!unit) return;
    unit.attackAnimMs = Math.max(0, (unit.attackAnimMs || 0) - deltaMs);
    unit.deathAnimMs = Math.max(0, (unit.deathAnimMs || 0) - deltaMs);
    unit.lastHitMs = Math.max(0, (unit.lastHitMs || 0) - deltaMs);
  });
  battle.effects = (battle.effects || []).map((effect) => ({ ...effect, ageMs: (effect.ageMs || 0) + deltaMs })).filter((effect) => (effect.ageMs || 0) <= (effect.durationMs || CONFIG.combat.effectDurationMs));
}

function battleTick(deltaMs = CONFIG.combat.tickMs) {
  if (!gameState.battle) return;
  const battle = gameState.battle;
  battle.tick += 1;
  battle.timeMs += deltaMs;
  updateBattleEffects(deltaMs);
  if (battle.completed) return;
  const actors = [
    ...getCombatants('army').map((u) => ({ side: 'army', unit: u })),
    ...getCombatants('enemy').map((u) => ({ side: 'enemy', unit: u })),
  ].sort((a, b) => ((b.unit.speed || 1) - (a.unit.speed || 1)) || String(a.unit.id).localeCompare(String(b.unit.id)));
  actors.forEach((actor) => {
    const unit = actor.unit;
    if (!unit || unit.alive === false || unit.hp <= 0) return;
    unit.battleCooldownMs = Math.max(0, (unit.battleCooldownMs || 0) - deltaMs);
    if (unit.battleCooldownMs > 0) return;
    if (actor.side === 'enemy' && unit.enemyId === 'healer' && enemySupportActions(unit)) {
      unit.attackAnimMs = CONFIG.combat.attackBumpMs;
      unit.battleCooldownMs = CONFIG.combat.healerCooldownMs;
      return;
    }
    doAttack(unit, actor.side);
    unit.battleCooldownMs = attackCooldownMs(unit);
  });
  safeCleanup();
  const armyAlive = getCombatants('army').length;
  const enemyAlive = getCombatants('enemy').length;
  if (enemyAlive <= 0 || armyAlive <= 0 || battle.timeMs >= CONFIG.combat.battleMaxMs) resolveBattle(enemyAlive <= 0 && armyAlive > 0);
}

function allEnemies() {
  const battleEnemies = gameState.battle && Array.isArray(gameState.battle.enemies) ? gameState.battle.enemies : null;
  return (battleEnemies || [...gameState.enemyFormation.front, ...gameState.enemyFormation.back]).filter(Boolean);
}

function enemyIntelligence() {
  const enemies = allEnemies();
  const total = Math.max(1, enemies.length);
  const front = enemies.filter((e) => e && e.row === 'front');
  const back = enemies.filter((e) => e && e.row === 'back');
  const healers = enemies.filter((e) => e && e.enemyId === 'healer');
  const humanPresence = Math.round((enemies.filter((e) => e && e.unitType === 'enemy').length / total) * 100);
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
  if (!monster || !Array.isArray(monster.traits)) return 0;
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
  const projectedBase = currentReward() + (gameState.currentContract ? gameState.currentContract.bonusReward * 0.55 : 0);
  const projectedProfit = Math.round(projectedBase * (chance / 100) - expectedDead * averageReplacement);
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
  stats.forEach((stat) => {
    stat.mvpScore = (stat.kills || 0) * CONFIG.combat.mvpKillWeight + (stat.damageDealt || stat.damage || 0) * CONFIG.combat.mvpDamageWeight + (stat.healingDone || 0) * CONFIG.combat.mvpHealingWeight + (stat.survived ? CONFIG.combat.survivedBonus : 0);
  });
  const best = stats.slice().sort((a, b) => (b.mvpScore - a.mvpScore) || ((b.kills || 0) - (a.kills || 0)) || ((b.damageDealt || b.damage || 0) - (a.damageDealt || a.damage || 0)))[0];
  if (!best) return { name: '該当者なし', kills: 0, damageDealt: 0, contribution: '配置メンバーがいません。', reason: '採用メンバーが戦闘に参加しませんでした。' };
  const traitHits = best.traitHits || {};
  const reason = traitHits.humanSlayer ? `${best.kills || 0}体を撃破し、人間特攻を${traitHits.humanSlayer}回発動。`
    : traitHits.areaAttack ? `範囲ブレスで合計${best.damageDealt || best.damage || 0}ダメージを記録。`
      : best.survived ? `生存しながら${best.damageDealt || best.damage || 0}ダメージを与えました。`
        : `${best.damageDealt || best.damage || 0}ダメージで契約に貢献。`;
  return { name: best.name, speciesId: best.speciesId, color: best.color, kills: best.kills || 0, damageDealt: best.damageDealt || best.damage || 0, healingDone: best.healingDone || 0, survived: best.survived, contribution: `与ダメ ${best.damageDealt || best.damage || 0} / 被ダメ ${best.damageTaken || 0}`, reason };
}

function objectiveAchieved(victory, dead, baseProfit) {
  const contract = gameState.currentContract;
  if (!victory || !contract) return false;
  const deployed = deployedArmy();
  switch (contract.bonusObjective) {
    case 'No Casualties': return dead.length === 0;
    case 'Deploy 3 Units Or Less': return deployed.length <= 3;
    case 'Use Human Slayer': return deployed.some((unit) => unit.traits && unit.traits.includes('humanSlayer'));
    case 'Finish With Profit Above 100G': return baseProfit > 100;
    case 'Complete Without Merged Units': return deployed.every((unit) => !unit.merged);
    default: return false;
  }
}

function calculateReputationGain(victory, bonusAchieved, profit, dead) {
  if (!victory || !gameState.currentContract) return 0;
  let gain = 10 + gameState.currentContract.difficulty * 6;
  if (bonusAchieved) gain += 12;
  if (profit >= 100) gain += 10;
  else if (profit > 0) gain += 4;
  if (dead.length === 0) gain += 8;
  else if (dead.length <= 1) gain += 3;
  return gain;
}

function gradeFromReport() {
  const evaluation = reportEvaluation();
  if (!evaluation) return '未評価';
  return ['D', 'C', 'B', 'A', 'S'][evaluation.score - 1];
}

function purchaseInvestment(id) {
  if (gameState.phase !== 'playing' || gameState.mode !== 'contractSelect') return;
  const investment = CONFIG.investments.find((item) => item.id === id);
  if (!investment) return;
  const level = gameState.investments[id] || 0;
  if (level >= investment.maxLevel) {
    gameState.message = `${investment.name}は上限まで導入済みです。`;
    return;
  }
  if (gameState.gold < investment.cost) {
    gameState.message = `${investment.name}の導入には${investment.cost}G必要です。`;
    return;
  }
  gameState.gold -= investment.cost;
  gameState.investments[id] = level + 1;
  if (id === 'agencyPartnership') gameState.speciesPreference = 'orc';
  gameState.contractOffers = generateContractOffers();
  gameState.message = `${investment.name}を導入。戦闘力ではなく、採用・契約の選択肢が広がりました。`;
}

function cycleSpeciesPreference() {
  if (!gameState.investments.agencyPartnership || gameState.mode !== 'contractSelect') return;
  const species = Object.keys(CONFIG.monsters);
  const current = species.indexOf(gameState.speciesPreference);
  gameState.speciesPreference = species[(current + 1) % species.length];
  gameState.message = `提携エージェンシーの優先種族を${CONFIG.monsters[gameState.speciesPreference].name}に変更しました。`;
}


function resolveBattle(victory) {
  const battle = gameState.battle;
  if (!battle || battle.completed) return;
  battle.completed = true;
  battle.victory = Boolean(victory);
  battle.resolvedAtMs = battle.timeMs;
  pushBattleLog('戦況は収束。契約レポートを集計中…');
  gameState.message = '戦闘観測中です。最低表示時間が終わるまで、最終レポートは伏せられています。';
}

function finishBattle(victory) {
  if (gameState.battle && gameState.battle.stats) {
    gameState.army.filter(Boolean).forEach((unit) => {
      if (!gameState.battle.stats[unit.id]) gameState.battle.stats[unit.id] = makeBattleStat(unit);
      gameState.battle.stats[unit.id].survived = unit.alive !== false && unit.hp > 0;
    });
  }
  const dead = gameState.army.filter((unit) => unit && unit.alive === false);
  const replacementCosts = dead.reduce((sum, unit) => sum + (Number(unit.hireCost) || 0) * CONFIG.economy.replacementMultiplier, 0);
  const baseReward = victory && gameState.currentContract ? gameState.currentContract.reward : 0;
  const baseProfit = baseReward - replacementCosts;
  const bonusAchieved = objectiveAchieved(victory, dead, baseProfit);
  const bonusReward = bonusAchieved && gameState.currentContract ? gameState.currentContract.bonusReward : 0;
  const reward = baseReward + bonusReward;
  const profit = reward - replacementCosts;
  const reputationGain = calculateReputationGain(victory, bonusAchieved, profit, dead);
  gameState.gold += profit;
  gameState.company.totalProfit += profit;
  if (victory) gameState.company.completedContracts += 1;
  gameState.company.reputation += reputationGain;
  gameState.company.rank = rankForReputation(gameState.company.reputation);
  gameState.economy = { reward: baseReward, bonusReward, replacementCosts, profit, reputationGain, bonusAchieved };
  gameState.report = {
    victory,
    bonusAchieved,
    dead: dead.map((unit) => unit.name),
    survived: livingArmy().map((unit) => unit.name),
    contractTitle: gameState.currentContract ? gameState.currentContract.title : '未選択契約',
    grade: '未評価',
  };
  gameState.report.grade = gradeFromReport();
  gameState.army = livingArmy().map((unit) => ({ ...unit, hp: unit.maxHp, row: unit.row, slot: unit.slot }));
  normalizeFormation();
  gameState.mode = 'result';
  gameState.message = victory ? '契約評価が届きました。利益・信用・投資余力を確認してください。' : '契約失敗。信用は増えません。採用判断を見直しましょう。';
  if (gameState.currentContract && gameState.currentContract.heroContract && victory) {
    gameState.phase = 'gameover';
    gameState.message = '勝利: Hero Elimination Contractを完了し、魔物 staffing 業界の頂点に立ちました。';
  } else if (rankIndex(gameState.company.rank) >= rankIndex(CONFIG.game.winRank)) {
    gameState.phase = 'gameover';
    gameState.message = `勝利: 信用ランク${CONFIG.game.winRank}に到達し、最も尊敬される魔物派遣会社になりました。`;
  } else if (gameState.gold <= 0) {
    gameState.phase = 'gameover';
    gameState.message = '敗北: 運転資金が尽きました。';
  }
}

function continueDay() {
  if (gameState.phase !== 'playing' || gameState.mode !== 'result') return;
  gameState.day += 1;
  prepareDay();
}

function safeCleanup() {
  gameState.army = Array.isArray(gameState.army) ? gameState.army.filter(Boolean) : [];
  gameState.market = Array.isArray(gameState.market) ? gameState.market.filter(Boolean) : [];
  const battle = gameState.battle;
  if (battle && Array.isArray(battle.enemies)) battle.enemies = battle.enemies.filter((unit) => unit && (unit.alive !== false || (unit.deathAnimMs || 0) > 0));
}

function processAction(action) {
  if (!action || !action.type) return;
  if (action.type === 'start') startGame();
  if (action.type === 'hire') hire(action.id);
  if (action.type === 'contract') selectContract(action.id);
  if (action.type === 'investment') purchaseInvestment(action.id);
  if (action.type === 'speciesPreference') cycleSpeciesPreference();
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
  if (gameState.phase === 'playing' && gameState.gold <= 0 && gameState.mode !== 'result' && gameState.mode !== 'battle') {
    gameState.phase = 'gameover';
    gameState.message = '敗北: 運転資金が尽きました。';
  }
  if (gameState.phase === 'playing' && gameState.mode === 'battle' && gameState.battle) {
    gameState.battle.elapsed += deltaMs;
    battleTick(deltaMs);
    if (gameState.battle.completed && gameState.battle.timeMs >= CONFIG.BATTLE.MIN_DURATION_MS) {
      finishBattle(gameState.battle.victory);
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
  const labels = { contractSelect: '契約選定', recruit: '採用', formation: '採用・編成', battle: '戦闘観測', result: '契約結果' };
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
  text('Demon Army Dispatch Center', 640, 165, 40, '#ffd965', 'center', '900');
  text('～ 魔王軍へ兵力を供給する魔物人材会社 ～', 640, 220, 22, '#fff2bd', 'center', '900');
  text('契約を選び、敵情報を読み、効率よく採用して信用ランクAを目指しましょう。', 640, 282, 17, '#fff7de', 'center', '800');
  button('start', '契約デスクを開く', 505, 400, 270, 58, { type: 'start' });
}

function drawHeader() {
  drawRibbon(`Contract ${gameState.day}　${modeLabel(gameState.mode)}`, 320, 12, 330, CONFIG.ui.purple, '📜');
  rect(26, 10, 250, 40, panelFill(26, 10, 250, 40, '#5e3a1d', '#321e12'), '#8a5a2b', 12, 3);
  text('Demon Army Dispatch Center', 44, 20, 18, '#ffe58b', 'left', '900');
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
  drawPanel('Today’s Contract / Enemy Intelligence', 20, 64, 410, 246, { variant: 'parchment', banner: CONFIG.ui.red, icon: '⚔' });
  const enemies = [...gameState.enemyFormation.front, ...gameState.enemyFormation.back];
  const intel = enemyIntelligence();
  const contract = gameState.currentContract;
  text(contract ? contract.title : '契約を選択してください', 38, 94, 15, CONFIG.ui.ink, 'left', '900');
  if (contract) text(`Reward ${contract.reward}G / Bonus ${contract.bonusReward}G: ${contract.bonusObjective}`, 38, 112, 12, CONFIG.ui.gold, 'left', '900');
  text(`Human Presence: ${intel.humanPresence >= 75 ? 'High' : intel.humanPresence >= 45 ? 'Medium' : 'Low'}`, 38, 128, 14, CONFIG.ui.red, 'left', '900');
  enemies.slice(0, 4).forEach((enemy, index) => {
    const x = 36 + index * 94;
    rect(x, 146, 82, 54, '#fff7df', '#b8844b', 12, 2);
    drawUnit(enemy, x + 6, 150, 70, 44);
    drawPill(`×${enemies.filter((e) => e.enemyId === enemy.enemyId).length}`, x + 52, 148, 28, CONFIG.ui.red);
  });
  if (enemies.length > 4) text(`+${enemies.length - 4}`, 398, 168, 18, CONFIG.ui.gold, 'center', '900');
  drawBar('人間存在率', intel.humanPresence, 100, 38, 212, 86, CONFIG.ui.red);
  drawBar('前線脅威', intel.frontlineThreat, 90, 38, 236, 86, CONFIG.ui.orange);
  drawBar('後方火力', intel.backlineThreat, 80, 38, 260, 86, CONFIG.ui.blue);
  rect(256, 208, 156, 82, panelFill(256, 208, 156, 82, '#fff3cb', '#f5d9a3'), '#d85a4c', 14, 3);
  text('おすすめ採用', 270, 218, 14, CONFIG.ui.red, 'left', '900');
  intel.recommended.slice(0, 3).forEach((item, index) => text(`✦ ${item}`, 270, 242 + index * 17, 12, CONFIG.ui.ink, 'left', '800'));
}

function drawMarketPanel() {
  if (gameState.mode === 'contractSelect') {
    drawPanel('契約オファー / Company Investments', 450, 64, 810, 246, { variant: 'contract', banner: CONFIG.ui.purple, icon: '📜' });
    text('案件を選ぶ前に、利益を使って採用・契約の選択肢だけを拡張できます（戦闘ボーナスなし）。', 476, 96, 13, CONFIG.ui.muted, 'left', '800');
    gameState.contractOffers.forEach((contract, index) => {
      const x = 468 + index * 188;
      const y = 124;
      rect(x, y, 174, 114, '#fff9e7', '#8a5a2b', 14, 3);
      text(contract.title, x + 10, y + 12, 14, CONFIG.ui.ink, 'left', '900');
      text(`Reward ${contract.reward}G`, x + 10, y + 38, 13, CONFIG.ui.green, 'left', '900');
      text(`Difficulty ${'★'.repeat(contract.difficulty)}`, x + 10, y + 58, 12, CONFIG.ui.red, 'left', '800');
      text(`Bonus +${contract.bonusReward}G`, x + 10, y + 78, 12, CONFIG.ui.gold, 'left', '900');
      wrapText(contract.bonusObjective, x + 96, y + 76, 66, 12, 10, CONFIG.ui.purple, '900');
      gameState.input.cards.push({ x, y, w: 174, h: 114, action: { type: 'contract', id: contract.id }, enabled: true });
    });
    CONFIG.investments.forEach((investment, index) => {
      const x = 468 + index * 188;
      const y = 248;
      const level = gameState.investments[investment.id] || 0;
      const enabled = level < investment.maxLevel && gameState.gold >= investment.cost;
      button(`invest_${investment.id}`, `${investment.name} ${investment.cost}G`, x, y, 174, 24, { type: 'investment', id: investment.id }, enabled);
      text(`Lv ${level}/${investment.maxLevel} ${investment.description}`, x, y + 30, 11, CONFIG.ui.muted, 'left', '800');
    });
    if (gameState.investments.agencyPartnership) {
      const monster = CONFIG.monsters[gameState.speciesPreference] || CONFIG.monsters.orc;
      button('speciesPreference', `優先: ${monster.name}`, 1048, 248, 174, 24, { type: 'speciesPreference' }, true);
    }
    return;
  }
  drawPanel('Monster Applicants（応募者）', 450, 64, 810, 246, { variant: 'parchment', banner: CONFIG.ui.blue, icon: '☄' });
  text('カードをクリックして採用：契約条件に合う応募者だけを効率よく雇用。', 674, 96, 13, CONFIG.ui.muted, 'left', '800');
  const cardW = Math.max(106, Math.floor(760 / Math.max(1, gameState.market.length)) - 8);
  const gap = 8;
  gameState.market.forEach((card, index) => {
    const monster = CONFIG.monsters[card.speciesId];
    if (!monster) return;
    const x = 464 + index * (cardW + gap);
    const y = 112;
    const frameColor = monster.preferredRow === 'front' ? CONFIG.ui.green : CONFIG.ui.blue;
    rect(x, y, cardW, 180, panelFill(x, y, 146, 180, card.sold ? '#dcc9aa' : '#fff9e6', card.sold ? '#bfa988' : '#efd09b'), card.sold ? '#9b8464' : frameColor, 16, 3);
    text(monster.name, x + cardW / 2, y + 10, 20, card.sold ? CONFIG.ui.muted : CONFIG.ui.ink, 'center', '900');
    drawPill(monster.role, x + 8, y + 36, cardW - 16, frameColor);
    rect(x + 10, y + 64, cardW - 20, 82, panelFill(x, y, 118, 82, '#dff2ff', '#bcdcf0'), '#9c6a35', 12, 2);
    const imageKey = `cards.${monster.id}.${monster.preferredRow}.idle`;
    safeDrawImage(ctx, gameState.assets.images[imageKey], x + 12, y + 60, cardW - 24, 88, () => drawMonsterFallback({ ...monster, speciesId: monster.id, color: monster.color }, x + 12, y + 58, cardW - 24, 90));
    drawPill(card.sold ? '済' : `${monster.hireCost}G`, x + cardW - 52, y + 154, 44, CONFIG.ui.gold, '#3b2517');
    drawPill(monster.specialty, x + 8, y + 154, Math.min(72, cardW - 62), CONFIG.ui.purple);
    wrapText(monster.statement, x + 10, y + 181, cardW - 20, 13, 10, '#5d3a1f', '900');
    gameState.input.cards.push({ x, y, w: cardW, h: 180, action: { type: 'hire', id: card.id }, enabled: !card.sold });
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
  button('bench', '控えへ戻す', 34, 714, 150, 34, { type: 'bench' }, Boolean(gameState.selectedUnitId) && gameState.mode === 'formation');
  button('battle', '⚔ 派遣開始！', 370, 714, 168, 34, { type: 'battle' }, gameState.mode === 'formation' && deployedArmy().length > 0);
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
  drawPanel('戦闘結果サマリー', 580, 474, 300, 286, { variant: 'celebration', banner: CONFIG.ui.purple, icon: '★' });
  if (gameState.report) {
    const evaluation = reportEvaluation();
    text('Contract Evaluation', 604, 506, 18, '#8a4b18', 'left', '900');
    text(`${evaluation.stars} Grade ${gameState.report.grade}`, 604, 530, 22, '#ffcf33', 'left', '900');
    drawPill(gameState.report.victory ? 'Contract Success' : 'Contract Failure', 604, 562, 130, gameState.report.victory ? CONFIG.ui.green : CONFIG.ui.red);
    drawPill(gameState.economy.bonusAchieved ? 'Bonus +達成' : 'Bonus未達', 744, 562, 96, gameState.economy.bonusAchieved ? CONFIG.ui.purple : CONFIG.ui.muted);
    text(`Reward ${gameState.economy.reward}G / Bonus ${gameState.economy.bonusReward}G`, 604, 598, 14, CONFIG.ui.gold, 'left', '900');
    text(`Replacement Costs -${gameState.economy.replacementCosts}G`, 604, 620, 14, CONFIG.ui.red, 'left', '900');
    text(`Profit ${gameState.economy.profit >= 0 ? '+' : ''}${gameState.economy.profit}G`, 604, 644, 22, gameState.economy.profit >= 0 ? CONFIG.ui.green : CONFIG.ui.red, 'left', '900');
    text(`Reputation Gain +${gameState.economy.reputationGain}`, 604, 674, 15, CONFIG.ui.purple, 'left', '900');
    text(`Hiring Evaluation: ${evaluation.label}`, 604, 698, 13, CONFIG.ui.ink, 'left', '900');
    text(`損耗: ${gameState.report.dead.length ? gameState.report.dead.join('、') : 'なし'}`, 604, 720, 13, CONFIG.ui.ink, 'left', '800');
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
    text(mvp.name, 990, 646, 18, CONFIG.ui.ink, 'center', '900');
    drawPill(`撃破 ${mvp.kills}`, 920, 674, 64, CONFIG.ui.gold, '#3b2517');
    drawPill(`与${mvp.damageDealt}`, 994, 674, 60, CONFIG.ui.red);
    wrapText(mvp.reason || mvp.contribution, 920, 706, 136, 15, 12, CONFIG.ui.muted, '800');
  } else {
    text('戦闘後に発表', 990, 536, 16, CONFIG.ui.muted, 'center', '900');
    text('👑', 990, 582, 44, CONFIG.ui.gold, 'center', '900');
  }
}


function drawEconomyPanel() {
  drawPanel('Company Reputation', 1100, 474, 160, 286, { variant: 'ledger', banner: CONFIG.ui.orange, icon: '🏢' });
  text('所持ゴールド', 1118, 512, 13, '#6a4327', 'left', '900');
  text(`${gameState.gold}G`, 1118, 534, 26, '#8a4b18', 'left', '900');
  text('信用ランク', 1118, 568, 13, '#6a4327', 'left', '900');
  text(gameState.company.rank, 1118, 590, 34, CONFIG.ui.purple, 'left', '900');
  text(`Rep ${gameState.company.reputation}`, 1174, 586, 14, CONFIG.ui.ink, 'left', '900');
  rect(1118, 620, 124, 76, '#fff8df', '#d4a15e', 12, 2);
  text(`総利益 ${gameState.company.totalProfit}G`, 1130, 634, 12, CONFIG.ui.green, 'left', '900');
  text(`完了 ${gameState.company.completedContracts}`, 1130, 656, 12, CONFIG.ui.ink, 'left', '900');
  text(`今回Rep +${gameState.economy.reputationGain}`, 1130, 678, 12, CONFIG.ui.purple, 'left', '900');
  const profitColor = gameState.economy.profit >= 0 ? CONFIG.ui.green : CONFIG.ui.red;
  text('今回純利益', 1118, 708, 13, '#6a4327', 'left', '900');
  text(`${gameState.economy.profit >= 0 ? '+' : ''}${gameState.economy.profit}G`, 1118, 728, 23, profitColor, 'left', '900');
  if (gameState.mode === 'result' && gameState.phase === 'playing') button('continue', '次の契約へ', 1118, 752, 124, 26, { type: 'continue' });
  if (gameState.phase === 'gameover') button('restart', '再開', 1118, 752, 124, 26, { type: 'restart' });
}

function battleUnitById(id) {
  if (!id) return null;
  const armyUnit = gameState.army.find((unit) => unit && unit.id === id);
  if (armyUnit) return armyUnit;
  const enemies = gameState.battle && Array.isArray(gameState.battle.enemies) ? gameState.battle.enemies : [];
  return enemies.find((unit) => unit && unit.id === id) || null;
}

function battleUnitPosition(unit) {
  const side = unit?.unitType === 'enemy' ? 'enemy' : 'army';
  const row = unit?.row === 'back' ? 'back' : 'front';
  const slot = Number.isInteger(unit?.slot) ? unit.slot : 0;
  const yBase = row === 'front' ? 275 : 495;
  const xBase = side === 'army' ? (row === 'front' ? 230 : 150) : (row === 'front' ? 820 : 900);
  const direction = side === 'army' ? 1 : -1;
  const x = xBase + slot * 88 * direction;
  const bump = unit?.attackAnimMs ? (unit.attackAnimMs / CONFIG.combat.attackBumpMs) * 24 * direction : 0;
  const shake = unit?.lastHitMs ? Math.sin((unit.lastHitMs / CONFIG.combat.casualtyFlashMs) * Math.PI * 8) * 4 : 0;
  return { x: x + bump + shake, y: yBase + slot * 10, direction };
}

function drawHpBar(unit, x, y, w) {
  const hp = Math.max(0, Number(unit?.hp) || 0);
  const maxHp = Math.max(1, Number(unit?.maxHp) || 1);
  rect(x, y, w, 12, '#1d1713', '#4a2a18', 6, 1);
  ctx.fillStyle = hp / maxHp > 0.45 ? CONFIG.ui.green : CONFIG.ui.red;
  ctx.fillRect(x + 2, y + 2, Math.max(0, (w - 4) * hp / maxHp), 8);
  text(`${hp}/${maxHp}`, x + w / 2, y - 2, 10, '#fff8dc', 'center', '900');
}

function drawBattleToken(unit) {
  if (!unit) return;
  const pos = battleUnitPosition(unit);
  const opacity = unit.alive === false ? Math.max(0.25, (unit.deathAnimMs || 0) / CONFIG.combat.deathFadeMs) : 1;
  const size = unit.speciesId === 'dragon' ? 128 : 104;
  const isEnemy = unit.unitType === 'enemy';
  const imageKey = isEnemy ? `monsters.${unit.enemyId}.${unit.row}.idle` : `monsters.${unit.speciesId}.${CONFIG.monsters[unit.speciesId]?.preferredRow || 'front'}.idle`;
  ctx.save();
  ctx.globalAlpha = opacity;
  ctx.fillStyle = 'rgba(38, 22, 12, 0.25)';
  ctx.beginPath();
  ctx.ellipse(pos.x, pos.y + size * 0.44, size * 0.42, 16, 0, 0, Math.PI * 2);
  ctx.fill();
  safeDrawImage(ctx, gameState.assets.images[imageKey], pos.x - size / 2, pos.y - size / 2, size, size, () => drawMonsterFallback(unit, pos.x - size / 2, pos.y - size / 2, size, size));
  const nameW = 116;
  rect(pos.x - nameW / 2, pos.y - size / 2 - 36, nameW, 30, 'rgba(24, 20, 16, 0.86)', unit.unitType === 'enemy' ? CONFIG.ui.red : CONFIG.ui.blue, 10, 2);
  const badge = traitLabels(unit.traits)[0] || (unit.unitType === 'enemy' ? '人間' : '標準');
  text(unit.name, pos.x, pos.y - size / 2 - 32, 13, '#fff7de', 'center', '900');
  text(badge, pos.x, pos.y - size / 2 - 17, 10, unit.unitType === 'enemy' ? '#ffb9ad' : '#bde1ff', 'center', '900');
  drawHpBar(unit, pos.x - 54, pos.y - size / 2 - 48, 108);
  ctx.restore();
}

function drawBattleEffect(effect) {
  if (!effect) return;
  const source = battleUnitById(effect.sourceId);
  const target = battleUnitById(effect.targetId);
  const sourcePos = source ? battleUnitPosition(source) : null;
  const targetPos = target ? battleUnitPosition(target) : null;
  const progress = Math.max(0, Math.min(1, (effect.ageMs || 0) / Math.max(1, effect.durationMs || CONFIG.combat.effectDurationMs)));
  ctx.save();
  ctx.globalAlpha = 1 - progress * 0.75;
  if ((effect.type === 'slash' || effect.type === 'projectile') && sourcePos && targetPos) {
    const x = sourcePos.x + (targetPos.x - sourcePos.x) * Math.min(1, progress * 1.5);
    const y = sourcePos.y + (targetPos.y - sourcePos.y) * Math.min(1, progress * 1.5);
    ctx.strokeStyle = effect.color || CONFIG.ui.damage;
    ctx.lineWidth = effect.type === 'slash' ? 7 : 5;
    ctx.beginPath();
    ctx.moveTo(x - 22, y - 12);
    ctx.lineTo(x + 22, y + 12);
    ctx.stroke();
    if (effect.type === 'projectile') {
      ctx.fillStyle = effect.color || CONFIG.ui.orange;
      ctx.beginPath(); ctx.arc(x, y, 10, 0, Math.PI * 2); ctx.fill();
    }
  }
  if ((effect.type === 'damage' || effect.type === 'heal' || effect.type === 'trait') && targetPos) {
    const yOffset = -70 - progress * 42;
    const label = effect.type === 'trait' ? effect.text : `${effect.type === 'heal' ? '+' : '-'}${effect.value}`;
    const color = effect.color || (effect.type === 'heal' ? CONFIG.ui.heal : CONFIG.ui.damage);
    text(label, targetPos.x, targetPos.y + yOffset, effect.type === 'trait' ? 24 : 28, color, 'center', '900');
    ctx.strokeStyle = 'rgba(55,25,12,0.45)';
  }
  ctx.restore();
}

function drawBattleLogPanel() {
  drawPanel('戦闘ログ', 1010, 368, 238, 300, { variant: 'parchment', banner: CONFIG.ui.purple, icon: '✎' });
  const log = gameState.battle && Array.isArray(gameState.battle.log) ? gameState.battle.log : [];
  log.slice(0, CONFIG.combat.maxBattleLogLines).forEach((line, index) => {
    wrapText(line, 1030, 410 + index * 34, 198, 15, 12, index === 0 ? CONFIG.ui.ink : CONFIG.ui.muted, '900');
  });
  text('… 戦闘中 …', 1129, 642, 13, CONFIG.ui.muted, 'center', '900');
}


function drawResultScene() {
  drawHeader();
  const evaluation = reportEvaluation() || { stars: '☆☆☆☆☆', label: '未評価' };
  const report = gameState.report || { victory: false, grade: '未評価', dead: [] };
  const mvp = employeeOfTheDay();
  const profitColor = gameState.economy.profit >= 0 ? CONFIG.ui.green : CONFIG.ui.red;

  drawPanel('Post-Battle Contract Report', 120, 86, 1040, 626, { variant: 'celebration', banner: report.victory ? CONFIG.ui.green : CONFIG.ui.red, icon: '📋' });
  text(report.contractTitle || '未選択契約', 160, 128, 26, CONFIG.ui.ink, 'left', '900');
  drawPill(report.victory ? 'Contract Success' : 'Contract Failure', 160, 172, 170, report.victory ? CONFIG.ui.green : CONFIG.ui.red);
  text('Contract Evaluation Grade', 370, 166, 14, CONFIG.ui.muted, 'left', '900');
  text(`${evaluation.stars} Grade ${report.grade}`, 370, 188, 26, '#ffcf33', 'left', '900');
  text(`Hiring Evaluation: ${evaluation.label}`, 160, 224, 16, CONFIG.ui.ink, 'left', '900');

  drawPanel('Contract Settlement', 160, 270, 450, 306, { variant: 'ledger', banner: CONFIG.ui.orange, icon: '🪙' });
  const rows = [
    ['Base Reward', `${gameState.economy.reward}G`, CONFIG.ui.gold],
    ['Bonus Reward', `${gameState.economy.bonusReward}G`, gameState.economy.bonusAchieved ? CONFIG.ui.purple : CONFIG.ui.muted],
    ['Replacement Costs', `-${gameState.economy.replacementCosts}G`, CONFIG.ui.red],
    ['Profit', `${gameState.economy.profit >= 0 ? '+' : ''}${gameState.economy.profit}G`, profitColor],
    ['Reputation Gain', `+${gameState.economy.reputationGain}`, CONFIG.ui.purple],
    ['Company Rank', gameState.company.rank, CONFIG.ui.blue],
  ];
  rows.forEach(([label, value, color], index) => {
    const y = 318 + index * 38;
    text(label, 192, y, 17, CONFIG.ui.muted, 'left', '900');
    text(value, 530, y - 4, 23, color, 'right', '900');
  });
  text(`損耗: ${report.dead.length ? report.dead.join('、') : 'なし'}`, 192, 550, 14, CONFIG.ui.ink, 'left', '800');

  drawPanel('MVP Employee', 650, 270, 430, 306, { variant: 'parchment', banner: CONFIG.ui.green, icon: '👑' });
  if (mvp) {
    const base = CONFIG.monsters[mvp.speciesId] || {};
    rect(686, 318, 160, 148, panelFill(686, 318, 160, 148, '#dff2ff', '#bddded'), '#9c6a35', 14, 2);
    drawMonsterFallback({ ...mvp, color: mvp.color || base.color }, 698, 312, 136, 154);
    text(mvp.name, 884, 318, 25, CONFIG.ui.ink, 'left', '900');
    drawPill(`撃破 ${mvp.kills}`, 884, 362, 86, CONFIG.ui.gold, '#3b2517');
    drawPill(`与ダメ ${mvp.damageDealt}`, 984, 362, 86, CONFIG.ui.red);
    text(`回復 ${mvp.healingDone || 0}`, 884, 408, 16, CONFIG.ui.green, 'left', '900');
    wrapText(mvp.reason || mvp.contribution, 884, 442, 156, 18, 13, CONFIG.ui.muted, '900');
  }

  button('continue', '次の契約へ', 482, 626, 316, 46, { type: 'continue' }, gameState.phase === 'playing');
  if (gameState.phase === 'gameover') button('restart', '最初から再開', 836, 626, 180, 46, { type: 'restart' }, true);
}

function drawBattleScene() {
  drawHeader();
  const battleEnemies = gameState.battle && Array.isArray(gameState.battle.enemies) ? gameState.battle.enemies : [];
  const casualties = gameState.army.filter((unit) => unit && unit.alive === false).length;
  const livingAllies = getCombatants('army').length;
  const livingEnemies = getCombatants('enemy').length;
  const elapsed = Math.floor((gameState.battle?.timeMs || 0) / 1000);
  const minimumSeconds = Math.ceil(CONFIG.BATTLE.MIN_DURATION_MS / 1000);

  drawPanel('Live Battle Observation', 24, 72, 300, 160, { variant: 'parchment', banner: CONFIG.ui.blue, icon: '👁' });
  text('経過時間', 48, 106, 14, CONFIG.ui.muted, 'left', '900');
  text(`${String(Math.floor(elapsed / 60)).padStart(2, '0')}:${String(elapsed % 60).padStart(2, '0')}`, 48, 128, 34, CONFIG.ui.ink, 'left', '900');
  text(`最低観測 ${minimumSeconds}秒`, 210, 138, 14, CONFIG.ui.blue, 'left', '900');
  text(`現在損耗: ${casualties}体`, 48, 178, 18, casualties > 0 ? CONFIG.ui.red : CONFIG.ui.green, 'left', '900');
  text(gameState.battle?.completed ? '戦況収束・集計待機' : '交戦中・結果未確定表示', 48, 204, 14, CONFIG.ui.purple, 'left', '900');

  drawPanel('Live Unit Counts', 946, 72, 308, 160, { variant: 'parchment', banner: CONFIG.ui.red, icon: '☠' });
  text(`生存味方: ${livingAllies}体`, 970, 112, 24, CONFIG.ui.blue, 'left', '900');
  text(`生存敵: ${livingEnemies}体`, 970, 152, 24, CONFIG.ui.red, 'left', '900');
  text('HPバーとログだけで戦況を観測します。', 970, 196, 13, CONFIG.ui.muted, 'left', '800');

  rect(344, 72, 602, 92, panelFill(344, 72, 602, 92, '#201c18', '#11100f'), '#8a5a2b', 18, 4);
  text('戦闘観測中…', 645, 88, 32, CONFIG.ui.trait, 'center', '900');
  text(`${String(Math.floor(elapsed / 60)).padStart(2, '0')}:${String(elapsed % 60).padStart(2, '0')}`, 645, 124, 32, '#fff7de', 'center', '900');

  rect(34, 246, 1200, 428, panelFill(34, 246, 1200, 428, '#9bd374', '#c9965d'), '#5f4328', 20, 4);
  ctx.fillStyle = 'rgba(255,255,255,0.18)';
  ctx.beginPath(); ctx.moveTo(34, 375); ctx.bezierCurveTo(340, 330, 690, 350, 1234, 312); ctx.lineTo(1234, 246); ctx.lineTo(34, 246); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.35)';
  ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(640, 250); ctx.lineTo(640, 672); ctx.stroke();
  text('自軍 FRONTLINE', 236, 252, 18, '#143b5f', 'center', '900');
  text('自軍 BACKLINE', 184, 472, 18, '#143b5f', 'center', '900');
  text('敵軍 FRONTLINE', 846, 252, 18, '#76251f', 'center', '900');
  text('敵軍 BACKLINE', 976, 472, 18, '#76251f', 'center', '900');

  [...gameState.army.filter((unit) => unit && unit.row), ...battleEnemies].filter(Boolean).sort((a, b) => (a.row === b.row ? (a.slot || 0) - (b.slot || 0) : (a.row === 'back' ? 1 : -1))).forEach(drawBattleToken);
  (gameState.battle?.effects || []).forEach(drawBattleEffect);

  rect(42, 700, 500, 52, panelFill(42, 700, 500, 52, '#164b75', '#0d2c45'), '#8a5a2b', 14, 3);
  text(`自軍　生存:${livingAllies}体　現在損耗:${casualties}体`, 66, 716, 22, '#fff7de', 'left', '900');
  rect(738, 700, 500, 52, panelFill(738, 700, 500, 52, '#8c2e25', '#4a1612'), '#8a5a2b', 14, 3);
  text(`敵軍　生存:${livingEnemies}体`, 762, 716, 22, '#fff7de', 'left', '900');
  text('VS', 640, 704, 42, CONFIG.ui.trait, 'center', '900');
  drawBattleLogPanel();
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
  if (gameState.mode === 'battle') {
    drawBattleScene();
    return;
  }
  if (gameState.mode === 'result') {
    drawResultScene();
    return;
  }
  drawHeader();
  drawEnemyPanel();
  drawMarketPanel();
  if (gameState.mode === 'formation' || gameState.mode === 'recruit') {
    drawFormationPanel();
    drawPredictionPanel();
  }
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
