'use strict';

const CONFIG = Object.freeze({
  canvas: { width: 1280, height: 820 },
  game: { startingGold: 180, baseApplicantSlots: 5, baseContractChoices: 3, winRank: 'A' },
  formation: { frontSlots: 3, backSlots: 3 },
  economy: { replacementMultiplier: 2 },
  personnel: { fatiguePerDeployment: 20, fatigueUnavailableAt: 100, fatigueRecoveryPerContract: 15, injuryHpRatio: 0.22, injuryContracts: 2 },
  combat: {
    tickMs: 380, maxTicks: 110, minBattleMs: 3500, baseAccuracy: 0.92, evasionPenalty: 0.25,
    physicalResistanceMultiplier: 0.55, areaSplashMultiplier: 0.45, healerAmount: 8,
    attackCooldownBaseMs: 1780, attackCooldownSpeedStepMs: 190, minAttackCooldownMs: 700,
  },
  ui: {
    ink: '#3b2517', muted: '#7c5a38', parchment: '#fff4d6', panel: '#ffe6ad', wood: '#7f4a24',
    gold: '#d88922', red: '#c94f45', green: '#3d9b5f', blue: '#2f83bd', purple: '#8652b8', dark: '#181512', trait: '#ffe05f',
  },
  traits: {
    humanSlayer: { label: '人間特攻', description: '人間系の敵へ追加ダメージ' },
    evasion: { label: '回避', description: '命中率を下げる' },
    backlineAttack: { label: '後衛狙い', description: '敵後衛を優先攻撃' },
    physicalResistance: { label: '物理耐性', description: '物理ダメージ軽減' },
    areaAttack: { label: '範囲攻撃', description: '複数の敵へ飛び火' },
  },
  monsters: {
    orc: { id: 'orc', name: 'オーク', preferredRow: 'front', hireCost: 24, hp: 58, attack: 15, speed: 2, damageType: 'physical', traits: ['humanSlayer'], color: '#7ac45f', icon: 'ORC', role: '前衛アタッカー', specialty: '対人契約', statement: '「人間相手なら任せてください。」' },
    goblin: { id: 'goblin', name: 'ゴブリン', preferredRow: 'back', hireCost: 16, hp: 36, attack: 10, speed: 1, damageType: 'physical', traits: ['evasion'], color: '#93e35f', icon: 'GOB', role: '低コスト遊撃', specialty: '利益確保', statement: '「安く、しぶとく、逃げ足も速く！」' },
    ghost: { id: 'ghost', name: 'ゴースト', preferredRow: 'front', hireCost: 20, hp: 46, attack: 12, speed: 2, damageType: 'spirit', traits: ['physicalResistance'], color: '#b8d8ff', icon: 'GHO', role: '物理受け', specialty: '騎士対策', statement: '「剣では私を止められません。」' },
    dragon: { id: 'dragon', name: 'ドラゴン', preferredRow: 'back', hireCost: 42, hp: 52, attack: 21, speed: 3, damageType: 'fire', traits: ['areaAttack'], color: '#ff704f', icon: 'DRG', role: '範囲火力', specialty: '多人数制圧', statement: '「高額ですが、群れを焼けます。」' },
  },
  enemies: {
    knight: { id: 'knight', name: '騎士', faction: 'Human', hp: 54, attack: 12, speed: 2, row: 'front', armor: 2, traits: ['重装人間'], color: '#b8b6aa', icon: 'KNT' },
    archer: { id: 'archer', name: '弓兵', faction: 'Human', hp: 32, attack: 11, speed: 1, row: 'back', armor: 0, traits: ['遠隔人間', 'backlineAttack'], color: '#d7a45f', icon: 'ARC' },
    healer: { id: 'healer', name: '治療師', faction: 'Human', hp: 30, attack: 6, speed: 2, row: 'back', armor: 0, traits: ['味方回復'], color: '#f0df8d', icon: 'HEA' },
    captain: { id: 'captain', name: '隊長', faction: 'Human', hp: 72, attack: 15, speed: 3, row: 'front', armor: 3, traits: ['人間指揮官'], color: '#ffcc66', icon: 'CAP' },
  },
  ranks: [
    { rank: 'E', reputation: 0, unlock: 'Local Defense Contracts' },
    { rank: 'D', reputation: 40, unlock: 'Border Raid Contracts' },
    { rank: 'C', reputation: 95, unlock: 'Holy Knight Contracts' },
    { rank: 'B', reputation: 170, unlock: 'Elite Operations' },
    { rank: 'A', reputation: 270, unlock: 'Hero Elimination Contracts' },
    { rank: 'S', reputation: 420, unlock: 'Demon King Priority Desk' },
  ],
  contractTemplates: [
    { title: '村境防衛の人員派遣', client: '魔王軍 第七守備隊', reward: 120, difficulty: 1, risk: 'Low', enemies: ['knight', 'archer'], bonusObjective: 'No Casualties', bonusReward: 45, recommendedCounter: 'ゴーストで物理攻撃を受け、安価な後衛で利益を残す', minRank: 'E' },
    { title: '巡礼弓兵隊の攪乱', client: '黒牙補給隊', reward: 145, difficulty: 1, risk: 'Low', enemies: ['archer', 'archer', 'knight'], bonusObjective: 'Deploy 3 Units Or Less', bonusReward: 55, recommendedCounter: '少数精鋭。ドラゴンの範囲攻撃が有効', minRank: 'E' },
    { title: '前線治療班の排除', client: '魔王軍 医療妨害課', reward: 180, difficulty: 2, risk: 'Medium', enemies: ['knight', 'healer', 'archer'], bonusObjective: 'Use Human Slayer', bonusReward: 60, recommendedCounter: 'オークの人間特攻で前衛を早く崩す', minRank: 'D' },
    { title: '城門守備隊への増援派遣', client: '骸骨城 兵站局', reward: 220, difficulty: 2, risk: 'Medium', enemies: ['knight', 'knight', 'healer'], bonusObjective: 'Profit Above 100G', bonusReward: 75, recommendedCounter: '雇用費を抑え、物理耐性で交換費を避ける', minRank: 'D' },
    { title: 'Holy Knight Interception', client: '魔王軍 西方司令部', reward: 300, difficulty: 3, risk: 'Medium', enemies: ['captain', 'knight', 'archer'], bonusObjective: 'Use Human Slayer', bonusReward: 100, recommendedCounter: 'オークを軸に、後衛狙い対策の前衛を厚くする', minRank: 'C' },
    { title: '補給線制圧の短期契約', client: '闇商会 物流部', reward: 320, difficulty: 3, risk: 'High', enemies: ['captain', 'healer', 'archer', 'archer'], bonusObjective: 'Deploy 3 Units Or Less', bonusReward: 110, recommendedCounter: '高単価でもドラゴンで短期決着を狙う', minRank: 'C' },
    { title: '聖都外郭の威力偵察', client: '魔王軍 情報参謀室', reward: 390, difficulty: 4, risk: 'High', enemies: ['captain', 'knight', 'knight', 'healer'], bonusObjective: 'No Casualties', bonusReward: 140, recommendedCounter: 'ゴースト複数で前衛を耐え、損耗ゼロを狙う', minRank: 'B' },
    { title: '勇者護衛隊の分断作戦', client: '魔王直属 特務課', reward: 460, difficulty: 4, risk: 'High', enemies: ['captain', 'captain', 'archer', 'healer'], bonusObjective: 'Profit Above 100G', bonusReward: 155, recommendedCounter: '過剰雇用を避け、対人火力と範囲火力を混ぜる', minRank: 'B' },
    { title: 'Hero Elimination Contract', client: 'Demon King', reward: 620, difficulty: 5, risk: 'Extreme', enemies: ['captain', 'captain', 'knight', 'archer', 'healer', 'archer'], bonusObjective: 'Profit Above 100G', bonusReward: 220, recommendedCounter: '疲労の少ない最適人員を総動員。高額社員の損耗に注意', minRank: 'A', heroContract: true },
  ],
  investments: [
    { id: 'recruitmentAdvertising', name: 'Recruitment Advertising', cost: 90, description: '+ Applicant Slots', maxLevel: 3 },
    { id: 'informationDepartment', name: 'Information Department', cost: 120, description: '+ Better Enemy Analysis', maxLevel: 2 },
    { id: 'contractOffice', name: 'Contract Office', cost: 160, description: '+ More Contract Choices', maxLevel: 2 },
    { id: 'scoutNetwork', name: 'Scout Network', cost: 130, description: '+ Rare Applicant Chance', maxLevel: 2 },
  ],
});

const canvas = document.getElementById('gameCanvas');
const ctx = canvas ? canvas.getContext('2d') : null;

const gameState = {
  phase: 'start', mode: 'contractSelect', day: 1, gold: CONFIG.game.startingGold,
  market: [], army: [], contractOffers: [], currentContract: null, enemyFormation: { front: [], back: [] },
  company: { reputation: 0, rank: 'E', totalProfit: 0, completedContracts: 0 },
  investments: { recruitmentAdvertising: 0, informationDepartment: 0, contractOffice: 0, scoutNetwork: 0 },
  selectedUnitId: null, battle: null, report: null,
  economy: { reward: 0, bonusReward: 0, replacementCosts: 0, profit: 0, reputationGain: 0, bonusAchieved: false },
  message: '契約を選び、必要な魔物だけを採用する派遣会社へようこそ。',
  input: { buttons: [], cards: [], slots: [], actions: [], mouse: { x: 0, y: 0 } },
  counters: { employee: { orc: 34, goblin: 117, ghost: 12, dragon: 7 }, unit: 1 },
};

function rankIndex(rank) { return CONFIG.ranks.findIndex((item) => item.rank === rank); }
function rankForReputation(rep) { return CONFIG.ranks.slice().reverse().find((item) => rep >= item.reputation)?.rank || 'E'; }
function applicantSlots() { return CONFIG.game.baseApplicantSlots + (gameState.investments.recruitmentAdvertising || 0); }
function contractChoiceCount() { return CONFIG.game.baseContractChoices + (gameState.investments.contractOffice || 0); }
function livingArmy() { return gameState.army.filter((u) => u && u.alive !== false); }
function availableArmy() { return livingArmy().filter((u) => isAvailable(u)); }
function deployedArmy() { return availableArmy().filter((u) => u.row === 'front' || u.row === 'back'); }
function byId(id) { return gameState.army.find((u) => u && u.id === id) || null; }
function rowLabel(row) { return row === 'front' ? '前衛' : '後衛'; }
function traitLabels(traits) { return (traits || []).map((t) => CONFIG.traits[t]?.label || t).join(' / '); }
function objectiveLabel(key) { return ({ 'No Casualties': 'No Casualties', 'Profit Above 100G': 'Profit Above 100G', 'Use Human Slayer': 'Use Human Slayer', 'Deploy 3 Units Or Less': 'Deploy 3 Units Or Less' })[key] || key; }
function isAvailable(unit) { return unit && (unit.fatigue || 0) < CONFIG.personnel.fatigueUnavailableAt && (unit.injuryContracts || 0) <= 0; }
function employeeName(speciesId, serial) { return `${CONFIG.monsters[speciesId].name} #${String(serial).padStart(3, '0')}`; }
function nextEmployeeSerial(speciesId) { gameState.counters.employee[speciesId] = (gameState.counters.employee[speciesId] || 0) + 1; return gameState.counters.employee[speciesId]; }

function makeMonster(speciesId) {
  const base = CONFIG.monsters[speciesId];
  if (!base) return null;
  const serial = nextEmployeeSerial(speciesId);
  return {
    unitType: 'monster', id: `u${gameState.counters.unit++}`, employeeId: `${speciesId}-${String(serial).padStart(3, '0')}`,
    speciesId, serial, name: employeeName(speciesId, serial), row: null, slot: null, alive: true,
    hp: base.hp, maxHp: base.hp, attack: base.attack, speed: base.speed, damageType: base.damageType,
    hireCost: base.hireCost, traits: [...base.traits], color: base.color, icon: base.icon,
    dispatchCount: 0, kills: 0, survivalCount: 0, totalProfitContribution: 0, fatigue: 0, injuryContracts: 0,
  };
}

function makeEnemy(enemyId, index, difficulty = 1) {
  const base = CONFIG.enemies[enemyId];
  if (!base) return null;
  const scale = 1 + (Math.max(1, difficulty) - 1) * 0.1;
  return { unitType: 'enemy', id: `e${gameState.day}_${index}`, enemyId, name: base.name, faction: base.faction, row: base.row, slot: index,
    alive: true, hp: Math.round(base.hp * scale), maxHp: Math.round(base.hp * scale), attack: Math.round(base.attack * scale), speed: base.speed,
    armor: base.armor, traits: [...base.traits], color: base.color, icon: base.icon };
}

function availableContracts() {
  const rank = rankIndex(gameState.company.rank);
  return CONFIG.contractTemplates.filter((c) => rankIndex(c.minRank) <= rank);
}
function cloneContract(template, index) {
  return { id: `c${gameState.day}_${index}`, ...template, enemyFormation: [...template.enemies] };
}
function generateContractOffers() {
  const pool = availableContracts().sort((a, b) => (a.difficulty - b.difficulty) || a.title.localeCompare(b.title));
  const offset = (gameState.day + gameState.company.completedContracts - 1) % Math.max(1, pool.length);
  const offers = [];
  for (let i = 0; i < Math.min(contractChoiceCount(), pool.length); i += 1) offers.push(cloneContract(pool[(offset + i) % pool.length], i));
  return offers;
}
function generateMarket(contract) {
  const preferred = [];
  if (contract.bonusObjective === 'Use Human Slayer') preferred.push('orc', 'orc');
  if (contract.bonusObjective === 'No Casualties') preferred.push('ghost', 'goblin');
  if (contract.bonusObjective === 'Deploy 3 Units Or Less') preferred.push('dragon', 'orc');
  if (contract.bonusObjective === 'Profit Above 100G') preferred.push('goblin', 'ghost');
  const rare = (gameState.investments.scoutNetwork || 0) > 0 ? ['dragon'] : [];
  const rotation = ['orc', 'goblin', 'ghost', 'dragon', ...rare];
  const desired = applicantSlots();
  const cursor = (gameState.day + contract.difficulty + gameState.company.completedContracts) % rotation.length;
  return Array.from({ length: desired }, (_, index) => ({ id: `m${gameState.day}_${index}`, speciesId: preferred[index] || rotation[(cursor + index) % rotation.length], sold: false }));
}
function setEnemyFormation(contract) {
  const enemies = (contract?.enemyFormation || []).map((id, index) => makeEnemy(id, index, contract.difficulty)).filter(Boolean);
  gameState.enemyFormation = { front: enemies.filter((e) => e.row === 'front'), back: enemies.filter((e) => e.row === 'back') };
}

function recoverPersonnel() {
  livingArmy().forEach((unit) => {
    unit.fatigue = Math.max(0, (unit.fatigue || 0) - CONFIG.personnel.fatigueRecoveryPerContract);
    if ((unit.injuryContracts || 0) > 0) unit.injuryContracts -= 1;
    if (!isAvailable(unit)) { unit.row = null; unit.slot = null; }
  });
  normalizeFormation();
}
function prepareDay() {
  recoverPersonnel();
  gameState.contractOffers = generateContractOffers();
  gameState.currentContract = null; gameState.market = []; gameState.enemyFormation = { front: [], back: [] };
  gameState.mode = 'contractSelect'; gameState.selectedUnitId = null; gameState.battle = null; gameState.report = null;
  gameState.economy = { reward: 0, bonusReward: 0, replacementCosts: 0, profit: 0, reputationGain: 0, bonusAchieved: false };
  gameState.message = '契約ボードから案件を選択してください。敵情報はすべて公開されています。';
}
function startGame() {
  Object.assign(gameState, { phase: 'playing', mode: 'contractSelect', day: 1, gold: CONFIG.game.startingGold, market: [], army: [], contractOffers: [], currentContract: null,
    enemyFormation: { front: [], back: [] }, company: { reputation: 0, rank: 'E', totalProfit: 0, completedContracts: 0 },
    investments: { recruitmentAdvertising: 0, informationDepartment: 0, contractOffice: 0, scoutNetwork: 0 }, selectedUnitId: null, battle: null, report: null,
    counters: { employee: { orc: 34, goblin: 117, ghost: 12, dragon: 7 }, unit: 1 } });
  prepareDay();
}
function selectContract(id) {
  if (gameState.phase !== 'playing' || gameState.mode !== 'contractSelect') return;
  const contract = gameState.contractOffers.find((c) => c.id === id); if (!contract) return;
  gameState.currentContract = contract; gameState.market = generateMarket(contract); setEnemyFormation(contract); gameState.mode = 'formation';
  gameState.economy.reward = contract.reward; gameState.economy.bonusReward = contract.bonusReward;
  gameState.message = `${contract.title}を受注。敵編成・推奨カウンター・応募者を照合してください。`;
}
function hire(id) {
  if (gameState.mode !== 'formation') return;
  const card = gameState.market.find((m) => m.id === id); const base = card && CONFIG.monsters[card.speciesId];
  if (!card || card.sold || !base) return;
  if (gameState.gold < base.hireCost) { gameState.message = `${base.name}の採用費${base.hireCost}Gが不足しています。`; return; }
  const unit = makeMonster(card.speciesId); gameState.gold -= base.hireCost; card.sold = true; gameState.army.push(unit);
  gameState.message = `${unit.name}を採用。能力成長はありません。履歴と疲労だけを管理します。`;
}
function selectUnit(id) {
  const unit = byId(id); if (!unit || gameState.mode !== 'formation') return;
  if (!isAvailable(unit)) { gameState.message = `${unit.name}は疲労または負傷で今回派遣できません。`; return; }
  gameState.selectedUnitId = id; gameState.message = `${unit.name}を選択中。枠をクリックして配置します。合成・レベルアップはありません。`;
}
function assignSlot(row, slot) {
  if (gameState.mode !== 'formation') return;
  const unit = byId(gameState.selectedUnitId); if (!unit || !isAvailable(unit)) return;
  const max = row === 'front' ? CONFIG.formation.frontSlots : CONFIG.formation.backSlots; if (slot < 0 || slot >= max) return;
  const occupant = availableArmy().find((u) => u.row === row && u.slot === slot);
  if (occupant) { occupant.row = unit.row; occupant.slot = unit.slot; }
  unit.row = row; unit.slot = slot; normalizeFormation(); gameState.message = `${unit.name}を${rowLabel(row)}${slot + 1}番へ配置しました。`;
}
function benchSelected() { const unit = byId(gameState.selectedUnitId); if (unit) { unit.row = null; unit.slot = null; gameState.message = `${unit.name}を控えへ戻しました。`; } }
function normalizeFormation() {
  ['front', 'back'].forEach((row) => { const max = row === 'front' ? CONFIG.formation.frontSlots : CONFIG.formation.backSlots; const seen = new Set();
    livingArmy().forEach((u) => { if (u.row !== row) return; if (!isAvailable(u) || !Number.isInteger(u.slot) || u.slot < 0 || u.slot >= max || seen.has(u.slot)) { u.row = null; u.slot = null; } else seen.add(u.slot); }); });
}

function makeBattleStat(unit) { return { id: unit.id, name: unit.name, speciesId: unit.speciesId, color: unit.color, kills: 0, damageDealt: 0, damageTaken: 0, survived: true, traitHits: {} }; }
function getCombatants(side) { const source = side === 'army' ? deployedArmy() : (gameState.battle?.enemies || []); return source.filter((u) => u && u.alive !== false && u.hp > 0); }
function attackCooldownMs(unit) { return Math.max(CONFIG.combat.minAttackCooldownMs, CONFIG.combat.attackCooldownBaseMs - (unit.speed || 1) * CONFIG.combat.attackCooldownSpeedStepMs); }
function hasTrait(unit, trait) { return Array.isArray(unit.traits) && unit.traits.includes(trait); }
function chooseTarget(attacker, side) {
  const enemies = getCombatants(side === 'army' ? 'enemy' : 'army'); if (!enemies.length) return null;
  if (hasTrait(attacker, 'backlineAttack')) return enemies.find((u) => u.row === 'back') || enemies[0];
  return enemies.find((u) => u.row === 'front') || enemies[0];
}
function chooseAreaTargets(primary, side) { const enemies = getCombatants(side === 'army' ? 'enemy' : 'army').filter((u) => u.id !== primary.id); return [primary, ...enemies.slice(0, 1)]; }
function calculateDamage(attacker, target, splash = false) {
  let damage = Math.max(1, (attacker.attack || 1) - (target.armor || 0));
  if (attacker.unitType === 'monster' && hasTrait(attacker, 'humanSlayer') && target.faction === 'Human') { damage += 9; recordTrait(attacker, 'humanSlayer'); }
  if (attacker.damageType === 'physical' && hasTrait(target, 'physicalResistance')) { damage = Math.max(1, Math.round(damage * CONFIG.combat.physicalResistanceMultiplier)); recordTrait(target, 'physicalResistance'); }
  if (splash) damage = Math.max(1, Math.round(damage * CONFIG.combat.areaSplashMultiplier));
  return damage;
}
function applyDamage(attacker, target, amount) {
  target.hp = Math.max(0, target.hp - amount); target.lastHitMs = 260; recordDamage(attacker, target, amount);
  if (target.hp <= 0 && target.alive !== false) { target.alive = false; target.deathAnimMs = 560; if (attacker.unitType === 'monster') { gameState.battle.stats[attacker.id].kills += 1; } pushBattleLog(`${attacker.name}が${target.name}を撃破。`); }
}
function recordDamage(attacker, target, amount) { const stats = gameState.battle?.stats || {}; if (attacker.unitType === 'monster' && stats[attacker.id]) stats[attacker.id].damageDealt += amount; if (target.unitType === 'monster' && stats[target.id]) stats[target.id].damageTaken += amount; }
function recordTrait(unit, trait) { const stat = gameState.battle?.stats?.[unit.id]; if (stat) stat.traitHits[trait] = (stat.traitHits[trait] || 0) + 1; }
function pushBattleLog(line) { const log = gameState.battle?.log; if (!log) return; log.unshift(line); log.splice(7); }
function healEnemy(enemy) { const target = getCombatants('enemy').filter((u) => u.hp < u.maxHp).sort((a, b) => a.hp - b.hp)[0]; if (!target) return false; target.hp = Math.min(target.maxHp, target.hp + CONFIG.combat.healerAmount); pushBattleLog(`${enemy.name}が${target.name}を回復。`); return true; }
function doAttack(unit, side) {
  if (side === 'enemy' && unit.enemyId === 'healer' && healEnemy(unit)) return;
  const target = chooseTarget(unit, side); if (!target) return;
  let chance = CONFIG.combat.baseAccuracy - (hasTrait(target, 'evasion') ? CONFIG.combat.evasionPenalty : 0);
  const roll = ((gameState.battle.tick * 37 + String(unit.id).length * 17 + String(target.id).length * 11) % 100) / 100;
  unit.attackAnimMs = 240;
  if (roll > chance) { pushBattleLog(`${unit.name}の攻撃を${target.name}が回避。`); return; }
  if (hasTrait(unit, 'areaAttack')) { recordTrait(unit, 'areaAttack'); chooseAreaTargets(target, side).forEach((t, i) => applyDamage(unit, t, calculateDamage(unit, t, i > 0))); }
  else applyDamage(unit, target, calculateDamage(unit, target));
}
function battleTick(deltaMs) {
  const battle = gameState.battle; if (!battle) return; battle.tick += 1; battle.timeMs += deltaMs;
  [...deployedArmy(), ...(battle.enemies || [])].forEach((u) => { u.attackAnimMs = Math.max(0, (u.attackAnimMs || 0) - deltaMs); u.lastHitMs = Math.max(0, (u.lastHitMs || 0) - deltaMs); u.deathAnimMs = Math.max(0, (u.deathAnimMs || 0) - deltaMs); });
  if (battle.completed) return;
  const actors = [...getCombatants('army').map((u) => ['army', u]), ...getCombatants('enemy').map((u) => ['enemy', u])].sort((a, b) => (b[1].speed - a[1].speed) || a[1].id.localeCompare(b[1].id));
  actors.forEach(([side, unit]) => { unit.cooldown = Math.max(0, (unit.cooldown || 0) - deltaMs); if (unit.cooldown <= 0 && unit.alive !== false) { doAttack(unit, side); unit.cooldown = attackCooldownMs(unit); } });
  if (!getCombatants('enemy').length) resolveBattle(true);
  else if (!getCombatants('army').length || battle.tick >= CONFIG.combat.maxTicks) resolveBattle(false);
}
function startBattle() {
  if (gameState.mode !== 'formation') return; normalizeFormation(); const army = deployedArmy();
  if (!army.length) { gameState.message = '最低1体の派遣社員を配置してください。'; return; }
  const enemies = [...gameState.enemyFormation.front, ...gameState.enemyFormation.back].filter(Boolean); if (!enemies.length) return;
  gameState.battle = { timeMs: 0, tick: 0, enemies, stats: {}, log: ['自動戦闘開始。採用判断を検証します。'], completed: false, victory: false };
  army.forEach((u) => { u.dispatchCount += 1; u.fatigue += CONFIG.personnel.fatiguePerDeployment; u.cooldown = 0; gameState.battle.stats[u.id] = makeBattleStat(u); });
  gameState.mode = 'battle'; gameState.message = '戦闘は全自動です。HP、損耗、特性発動を観察してください。';
}
function resolveBattle(victory) { const b = gameState.battle; if (!b || b.completed) return; b.completed = true; b.victory = Boolean(victory); pushBattleLog('戦況収束。結果レポートを作成中…'); }

function objectiveAchieved(victory, dead, baseProfit) {
  const c = gameState.currentContract; if (!victory || !c) return false; const deployed = deployedArmy();
  if (c.bonusObjective === 'No Casualties') return dead.length === 0;
  if (c.bonusObjective === 'Deploy 3 Units Or Less') return deployed.length <= 3;
  if (c.bonusObjective === 'Use Human Slayer') return deployed.some((u) => hasTrait(u, 'humanSlayer'));
  if (c.bonusObjective === 'Profit Above 100G') return baseProfit > 100;
  return false;
}
function calculateReputationGain(victory, bonus, profit, dead) { if (!victory || !gameState.currentContract) return 0; let gain = 10 + gameState.currentContract.difficulty * 6; if (bonus) gain += 12; if (profit >= 100) gain += 10; else if (profit > 0) gain += 4; if (!dead.length) gain += 8; else if (dead.length === 1) gain += 3; return gain; }
function reportEvaluation() { if (!gameState.report) return { score: 1, label: '未評価', stars: '★☆☆☆☆' }; let score = 1; if (gameState.report.victory) score += 1; if (gameState.economy.profit > 0) score += 1; if (gameState.economy.bonusAchieved) score += 1; if (gameState.report.dead.length === 0) score += 1; score = Math.min(5, score); return { score, label: ['危険', '最低限', '良好', '優秀', '完璧'][score - 1], stars: '★★★★★'.slice(0, score) + '☆☆☆☆☆'.slice(score) }; }
function gradeFromReport() { return ['D', 'C', 'B', 'A', 'S'][reportEvaluation().score - 1]; }
function employeeOfTheDay() { const stats = Object.values(gameState.battle?.stats || {}); stats.forEach((s) => { s.mvpScore = s.kills * 3 + s.damageDealt + (s.survived ? 12 : 0); }); return stats.sort((a, b) => b.mvpScore - a.mvpScore)[0] || null; }
function finishBattle(victory) {
  const deployed = deployedArmy(); const dead = deployed.filter((u) => u.alive === false || u.hp <= 0);
  deployed.forEach((u) => { const stat = gameState.battle.stats[u.id]; stat.survived = !dead.includes(u); u.kills += stat.kills; if (stat.survived) u.survivalCount += 1; const lowHp = stat.survived && (u.hp / u.maxHp) <= CONFIG.personnel.injuryHpRatio; if (lowHp) u.injuryContracts = CONFIG.personnel.injuryContracts; });
  const replacementCosts = dead.reduce((sum, u) => sum + u.hireCost * CONFIG.economy.replacementMultiplier, 0); const baseReward = victory && gameState.currentContract ? gameState.currentContract.reward : 0; const baseProfit = baseReward - replacementCosts;
  const bonusAchieved = objectiveAchieved(victory, dead, baseProfit); const bonusReward = bonusAchieved ? gameState.currentContract.bonusReward : 0; const reward = baseReward + bonusReward; const profit = reward - replacementCosts; const rep = calculateReputationGain(victory, bonusAchieved, profit, dead);
  gameState.gold += profit; gameState.company.totalProfit += profit; if (victory) gameState.company.completedContracts += 1; gameState.company.reputation += rep; gameState.company.rank = rankForReputation(gameState.company.reputation);
  deployed.forEach((u) => { const share = Math.round(profit / Math.max(1, deployed.length)); u.totalProfitContribution += share; });
  const mvp = employeeOfTheDay(); gameState.economy = { reward: baseReward, bonusReward, replacementCosts, profit, reputationGain: rep, bonusAchieved };
  gameState.report = { victory, bonusAchieved, dead: dead.map((u) => u.name), injured: deployed.filter((u) => u.injuryContracts > 0).map((u) => u.name), contractTitle: gameState.currentContract?.title || '契約', grade: 'D', mvpName: mvp?.name || '該当者なし' };
  gameState.report.grade = gradeFromReport(); gameState.army = livingArmy().map((u) => ({ ...u, hp: u.maxHp, row: u.row, slot: u.slot })); normalizeFormation(); gameState.mode = 'result'; gameState.message = victory ? '契約完了。利益、信用、社員履歴を確認してください。' : '契約失敗。隠し情報はありません。採用判断を見直しましょう。';
  if (gameState.currentContract?.heroContract && victory) { gameState.phase = 'gameover'; gameState.message = '勝利: Hero Elimination Contractを完了しました。'; } else if (rankIndex(gameState.company.rank) >= rankIndex(CONFIG.game.winRank)) { gameState.phase = 'gameover'; gameState.message = `勝利: 信用ランク${CONFIG.game.winRank}に到達しました。`; } else if (gameState.gold <= 0) { gameState.phase = 'gameover'; gameState.message = '敗北: 運転資金が尽きました。'; }
}
function continueDay() { if (gameState.mode !== 'result') return; gameState.day += 1; prepareDay(); }
function purchaseInvestment(id) { if (gameState.mode !== 'contractSelect') return; const inv = CONFIG.investments.find((i) => i.id === id); if (!inv) return; const level = gameState.investments[id] || 0; if (level >= inv.maxLevel) { gameState.message = `${inv.name}は導入上限です。`; return; } if (gameState.gold < inv.cost) { gameState.message = `${inv.name}には${inv.cost}G必要です。`; return; } gameState.gold -= inv.cost; gameState.investments[id] = level + 1; gameState.contractOffers = generateContractOffers(); gameState.message = `${inv.name}を導入。戦闘力ではなく選択肢が増えました。`; }

function contractPrediction() { const c = gameState.currentContract; const allies = deployedArmy(); const enemies = [...gameState.enemyFormation.front, ...gameState.enemyFormation.back]; if (!c || !allies.length) return { chance: 0, expectedDead: 0, projectedProfit: 0, summary: '配置すると予測が出ます。' }; const allyPower = allies.reduce((s, u) => s + u.attack * (hasTrait(u, 'areaAttack') ? 1.4 : 1) + u.maxHp * (hasTrait(u, 'physicalResistance') ? 1.25 : 1) / 5 + (hasTrait(u, 'humanSlayer') ? 10 : 0), 0); const enemyPower = enemies.reduce((s, e) => s + e.attack + e.maxHp / 5 + (e.enemyId === 'healer' ? 16 : 0), 0) * (1 + c.difficulty * 0.06); const chance = Math.max(5, Math.min(95, Math.round(50 + (allyPower - enemyPower) * 1.2))); const expectedDead = Math.max(0, Math.min(allies.length, Math.round((100 - chance) / 32))); const projectedProfit = c.reward + ((c.bonusObjective === 'Profit Above 100G' || c.bonusObjective === 'Use Human Slayer') ? c.bonusReward : 0) - allies.slice(0, expectedDead).reduce((s, u) => s + u.hireCost * CONFIG.economy.replacementMultiplier, 0); return { chance, expectedDead, projectedProfit, summary: chance >= 70 ? '採用方針は良好です。' : 'カウンター不足または過少配置です。' }; }
function enemyIntelligence() { const enemies = [...gameState.enemyFormation.front, ...gameState.enemyFormation.back]; if (!enemies.length) return ['契約を選ぶと敵情報を表示。']; const counts = {}; enemies.forEach((e) => { counts[e.name] = (counts[e.name] || 0) + 1; }); const details = Object.entries(counts).map(([name, count]) => `${name} x${count}`).join(' / '); const advanced = (gameState.investments.informationDepartment || 0) > 0 ? `  弱点: ${gameState.currentContract?.recommendedCounter || '公開情報なし'}` : ''; return [`敵構成: ${details}`, `危険度: ${gameState.currentContract?.risk || '-'} / 難度 ${gameState.currentContract?.difficulty || '-'}.${advanced}`]; }

function processAction(a) { if (!a) return; if (a.type === 'start' || a.type === 'restart') startGame(); if (a.type === 'contract') selectContract(a.id); if (a.type === 'hire') hire(a.id); if (a.type === 'selectUnit') selectUnit(a.id); if (a.type === 'slot') assignSlot(a.row, a.slot); if (a.type === 'bench') benchSelected(); if (a.type === 'battle') startBattle(); if (a.type === 'continue') continueDay(); if (a.type === 'investment') purchaseInvestment(a.id); }
function update(deltaMs) { const actions = gameState.input.actions.splice(0); actions.forEach(processAction); if (gameState.mode === 'battle' && gameState.battle) { battleTick(deltaMs); if (gameState.battle.completed && gameState.battle.timeMs >= CONFIG.combat.minBattleMs) finishBattle(gameState.battle.victory); } }

function rect(x, y, w, h, fill = '#fff', stroke = '#000', radius = 12, line = 2) { ctx.save(); ctx.beginPath(); ctx.roundRect(x, y, w, h, radius); ctx.fillStyle = fill; ctx.fill(); ctx.strokeStyle = stroke; ctx.lineWidth = line; ctx.stroke(); ctx.restore(); }
function gradient(x, y, w, h, a, b) { const g = ctx.createLinearGradient(x, y, x, y + h); g.addColorStop(0, a); g.addColorStop(1, b); return g; }
function text(value, x, y, size = 16, color = CONFIG.ui.ink, align = 'left', weight = '800') { ctx.font = `${weight} ${size}px Trebuchet MS, Noto Sans JP, sans-serif`; ctx.fillStyle = color; ctx.textAlign = align; ctx.textBaseline = 'top'; ctx.fillText(String(value), x, y); }
function wrapText(value, x, y, maxWidth, lineHeight, size = 14, color = CONFIG.ui.ink, weight = '700') { const words = String(value).split(''); let line = ''; let yy = y; words.forEach((ch) => { const test = line + ch; if (ctx.measureText(test).width > maxWidth && line) { text(line, x, yy, size, color, 'left', weight); line = ch; yy += lineHeight; } else line = test; }); if (line) text(line, x, yy, size, color, 'left', weight); }
function button(label, x, y, w, h, action, enabled = true) { rect(x, y, w, h, enabled ? gradient(x, y, w, h, '#f3b94d', '#d88922') : '#c7ad88', '#7a4a25', 12, 2); text(label, x + w / 2, y + 9, 15, enabled ? '#3b2517' : '#7c5a38', 'center', '900'); gameState.input.buttons.push({ x, y, w, h, action, enabled }); }
function pill(label, x, y, color = CONFIG.ui.blue, width = 86) { rect(x, y, width, 22, color, 'rgba(0,0,0,0.22)', 999, 1); text(label, x + width / 2, y + 4, 11, '#fff7df', 'center', '900'); }
function panel(title, x, y, w, h, color = CONFIG.ui.gold) { rect(x, y, w, h, gradient(x, y, w, h, '#fff8df', '#ead09b'), '#8a5a2b', 16, 3); rect(x + 14, y - 14, Math.min(w - 28, 270), 32, color, '#6b3d1d', 10, 2); text(title, x + 26, y - 6, 16, '#fff7df', 'left', '900'); }
function hpBar(unit, x, y, w) { rect(x, y, w, 8, '#5b241f', 'rgba(0,0,0,0.25)', 5, 1); ctx.fillStyle = unit.hp > 0 ? '#49d36f' : '#77251d'; ctx.fillRect(x + 1, y + 1, Math.max(0, (w - 2) * (unit.hp / unit.maxHp)), 6); }
function drawUnitCard(unit, x, y, w, h, selected = false) { rect(x, y, w, h, selected ? '#fff0b8' : '#fffaf0', selected ? '#f05a36' : '#d4a15e', 12, selected ? 4 : 2); rect(x + 8, y + 9, 48, h - 18, unit.color, '#70421f', 10, 2); text(unit.icon, x + 32, y + h / 2 - 10, 16, '#1c180f', 'center', '900'); text(unit.name, x + 66, y + 8, 15, CONFIG.ui.ink, 'left', '900'); text(`${unit.hp}/${unit.maxHp}HP  ATK${unit.attack}  ${traitLabels(unit.traits)}`, x + 66, y + 29, 12, CONFIG.ui.muted); text(`疲労 ${unit.fatigue || 0}/100  派遣${unit.dispatchCount} 撃破${unit.kills} 生存${unit.dispatchCount ? Math.round((unit.survivalCount / unit.dispatchCount) * 100) : 100}%`, x + 66, y + 47, 12, isAvailable(unit) ? CONFIG.ui.blue : CONFIG.ui.red); if (unit.injuryContracts > 0) pill(`負傷 ${unit.injuryContracts}`, x + w - 74, y + 8, CONFIG.ui.red, 62); }
function drawHeader() { panel('Dispatch Office', 24, 72, 1232, 92, CONFIG.ui.wood); text(`Day ${gameState.day}`, 48, 96, 28); text(`Gold ${gameState.gold}G`, 170, 100, 22, CONFIG.ui.gold); text(`Rank ${gameState.company.rank}`, 300, 100, 22, CONFIG.ui.purple); text(`Rep ${gameState.company.reputation}`, 405, 100, 18, CONFIG.ui.purple); text(`Total Profit ${gameState.company.totalProfit}G`, 520, 100, 18, CONFIG.ui.green); wrapText(gameState.message, 740, 96, 460, 18, 14, CONFIG.ui.ink); }

function drawStart() { panel('Demon Army Dispatch Center', 190, 150, 890, 470, CONFIG.ui.purple); text('魔王軍専門・モンスター人材派遣会社', 640, 190, 34, CONFIG.ui.ink, 'center', '900'); wrapText('あなたは戦場指揮官ではありません。契約を読み、敵情報を確認し、利益が残る正しい人員を派遣する採用責任者です。合成・レベル・永続強化はありません。', 260, 255, 750, 26, 20, CONFIG.ui.muted); text('Core Loop: Contract → Intelligence → Recruitment → Formation → Auto Battle → Profit & Reputation', 640, 390, 18, CONFIG.ui.blue, 'center'); button('契約ボードを開く', 520, 500, 240, 48, { type: 'start' }, true); }
function drawContracts() { panel('Contract Board', 24, 190, 820, 560, CONFIG.ui.gold); gameState.contractOffers.forEach((c, i) => { const y = 220 + i * 102; rect(46, y, 780, 88, '#fffaf0', '#d4a15e', 12, 2); text(c.title, 64, y + 10, 18); text(`Client: ${c.client}`, 64, y + 34, 13, CONFIG.ui.muted); text(`Reward ${c.reward}G + Bonus ${c.bonusReward}G`, 358, y + 12, 15, CONFIG.ui.gold); pill(`Risk ${c.risk}`, 360, y + 38, c.risk === 'Low' ? CONFIG.ui.green : c.risk === 'Medium' ? CONFIG.ui.gold : CONFIG.ui.red, 88); text(`Bonus: ${objectiveLabel(c.bonusObjective)}`, 470, y + 38, 13, CONFIG.ui.purple); text(`Enemy: ${c.enemies.map((id) => CONFIG.enemies[id].name).join(' / ')}`, 64, y + 60, 13, CONFIG.ui.ink); button('受注', 738, y + 24, 70, 34, { type: 'contract', id: c.id }, true); }); panel('Company Growth', 870, 190, 386, 560, CONFIG.ui.green); CONFIG.investments.forEach((inv, i) => { const level = gameState.investments[inv.id] || 0; const y = 225 + i * 90; rect(892, y, 330, 72, '#fffaf0', '#d4a15e', 12, 2); text(inv.name, 910, y + 8, 16); text(`${inv.description}  Lv ${level}/${inv.maxLevel}`, 910, y + 31, 12, CONFIG.ui.muted); button(`${inv.cost}G`, 1140, y + 22, 70, 30, { type: 'investment', id: inv.id }, level < inv.maxLevel && gameState.gold >= inv.cost); }); text('成長は戦闘力ではなく選択肢だけを増やします。', 910, 610, 14, CONFIG.ui.green); }
function drawEnemyPanel() { panel('Enemy Intelligence', 24, 190, 392, 160, CONFIG.ui.blue); enemyIntelligence().forEach((line, i) => wrapText(line, 46, 222 + i * 44, 348, 18, 14, CONFIG.ui.ink)); if (gameState.currentContract) { text(`Recommended: ${gameState.currentContract.recommendedCounter}`, 46, 306, 12, CONFIG.ui.purple); } }
function drawMarket() { panel('Hiring Desk / Applicant Market', 24, 374, 392, 376, CONFIG.ui.gold); gameState.market.forEach((card, i) => { const base = CONFIG.monsters[card.speciesId]; const y = 404 + i * 62; rect(44, y, 350, 52, card.sold ? '#d8c6a0' : '#fffaf0', '#d4a15e', 12, 2); text(`${base.name} Applicant`, 58, y + 8, 15); text(`${base.role} / ${traitLabels(base.traits)} / Cost ${base.hireCost}G`, 58, y + 29, 12, CONFIG.ui.muted); button(card.sold ? '採用済' : '採用', 320, y + 12, 58, 28, { type: 'hire', id: card.id }, !card.sold && gameState.gold >= base.hireCost); }); }
function drawFormation() { panel('Formation & Employee Records', 440, 190, 816, 560, CONFIG.ui.purple); ['front', 'back'].forEach((row, ri) => { const y = 228 + ri * 96; text(rowLabel(row), 464, y + 28, 16, row === 'front' ? CONFIG.ui.red : CONFIG.ui.blue); const max = row === 'front' ? CONFIG.formation.frontSlots : CONFIG.formation.backSlots; for (let slot = 0; slot < max; slot += 1) { const x = 536 + slot * 178; const u = availableArmy().find((unit) => unit.row === row && unit.slot === slot); rect(x, y, 160, 72, u ? '#fffaf0' : 'rgba(255,250,240,0.55)', '#d4a15e', 12, 2); if (u) { drawUnitCard(u, x + 4, y + 4, 152, 64, gameState.selectedUnitId === u.id); gameState.input.cards.push({ x, y, w: 160, h: 72, action: { type: 'selectUnit', id: u.id }, enabled: true }); } else text('空き枠', x + 80, y + 28, 16, CONFIG.ui.muted, 'center'); gameState.input.slots.push({ x, y, w: 160, h: 72, action: { type: 'slot', row, slot }, enabled: true }); } }); text('Roster / Bench', 464, 426, 16); availableArmy().filter((u) => !u.row).slice(0, 6).forEach((u, i) => { const x = 464 + (i % 2) * 390; const y = 454 + Math.floor(i / 2) * 70; drawUnitCard(u, x, y, 370, 60, gameState.selectedUnitId === u.id); gameState.input.cards.push({ x, y, w: 370, h: 60, action: { type: 'selectUnit', id: u.id }, enabled: true }); }); const unavailable = livingArmy().filter((u) => !isAvailable(u)); if (unavailable.length) text(`Unavailable: ${unavailable.map((u) => `${u.name}(${u.injuryContracts > 0 ? '負傷' : '疲労'})`).join(' / ')}`, 464, 668, 12, CONFIG.ui.red); const p = contractPrediction(); rect(1040, 430, 170, 118, '#fffaf0', '#d4a15e', 12, 2); text('Prediction', 1058, 442, 16); text(`勝率 ${p.chance}%`, 1058, 470, 18, p.chance >= 60 ? CONFIG.ui.green : CONFIG.ui.red); text(`損耗 ${p.expectedDead}体`, 1058, 498, 15); text(`利益 ${p.projectedProfit}G`, 1058, 524, 15, p.projectedProfit >= 0 ? CONFIG.ui.green : CONFIG.ui.red); button('控えへ', 464, 710, 100, 34, { type: 'bench' }, Boolean(gameState.selectedUnitId)); button('派遣開始', 1060, 710, 150, 34, { type: 'battle' }, deployedArmy().length > 0); }
function drawBattleToken(u) { const ally = u.unitType === 'monster'; const baseX = ally ? (u.row === 'front' ? 360 : 180) : (u.row === 'front' ? 760 : 960); const y = (u.row === 'front' ? 292 : 500) + (u.slot || 0) * 36; const x = baseX + (u.attackAnimMs ? (ally ? 12 : -12) : 0); rect(x, y, 110, 54, u.alive === false ? '#886b60' : u.color, u.lastHitMs ? CONFIG.ui.red : '#3b2517', 12, u.lastHitMs ? 4 : 2); text(u.icon, x + 55, y + 8, 18, '#1c180f', 'center'); text(u.name, x + 55, y + 29, 11, '#1c180f', 'center'); hpBar(u, x + 10, y + 45, 90); }
function drawBattle() { panel('Live Battle Observation', 24, 72, 1232, 700, CONFIG.ui.red); const b = gameState.battle; text('自動戦闘中：HPバー、損耗、特性発動を観察してください。', 54, 108, 18); text(`Time ${Math.floor((b?.timeMs || 0) / 1000)}s`, 1100, 108, 20, CONFIG.ui.gold); rect(54, 170, 1178, 490, gradient(54, 170, 1178, 490, '#9bd374', '#c9965d'), '#5f4328', 18, 4); text('FRIENDLY', 230, 184, 22, CONFIG.ui.blue, 'center'); text('ENEMY', 920, 184, 22, CONFIG.ui.red, 'center'); [...deployedArmy(), ...(b?.enemies || [])].forEach(drawBattleToken); rect(54, 680, 1178, 52, CONFIG.ui.dark, '#8a5a2b', 12, 2); (b?.log || []).slice(0, 3).forEach((line, i) => text(line, 76, 690 + i * 15, 13, '#fff7df')); }
function drawResult() { panel('Result Screen', 24, 190, 1232, 560, CONFIG.ui.green); const r = gameState.report; if (!r) return; text(r.victory ? 'Contract Success' : 'Contract Failure', 70, 230, 34, r.victory ? CONFIG.ui.green : CONFIG.ui.red); text(`Reward ${gameState.economy.reward}G`, 76, 292, 22, CONFIG.ui.gold); text(`Bonus ${gameState.economy.bonusReward}G (${gameState.economy.bonusAchieved ? '達成' : '未達'})`, 76, 330, 20, CONFIG.ui.purple); text(`Replacement Costs -${gameState.economy.replacementCosts}G`, 76, 368, 20, CONFIG.ui.red); text(`Profit ${gameState.economy.profit >= 0 ? '+' : ''}${gameState.economy.profit}G`, 76, 408, 28, gameState.economy.profit >= 0 ? CONFIG.ui.green : CONFIG.ui.red); text(`Reputation Gain +${gameState.economy.reputationGain}`, 76, 456, 22, CONFIG.ui.purple); text(`Evaluation Grade ${r.grade}  ${reportEvaluation().stars}`, 76, 500, 24, CONFIG.ui.gold); text(`MVP Employee: ${r.mvpName}`, 76, 548, 20); text(`Casualties: ${r.dead.length ? r.dead.join(' / ') : 'なし'}`, 560, 250, 18, CONFIG.ui.red); text(`Injuries: ${r.injured.length ? r.injured.join(' / ') : 'なし'}`, 560, 286, 18, CONFIG.ui.red); panel('Employee History', 540, 350, 660, 180, CONFIG.ui.blue); livingArmy().slice(0, 5).forEach((u, i) => text(`${u.name}: Dispatches ${u.dispatchCount}, Kills ${u.kills}, Survival ${u.dispatchCount ? Math.round((u.survivalCount / u.dispatchCount) * 100) : 100}%, Profit ${u.totalProfitContribution}G, Fatigue ${u.fatigue}`, 566, 382 + i * 28, 14)); button(gameState.phase === 'gameover' ? '再スタート' : '次の契約へ', 990, 690, 160, 38, { type: gameState.phase === 'gameover' ? 'restart' : 'continue' }, true); }
function render() { if (!ctx) return; gameState.input.buttons = []; gameState.input.cards = []; gameState.input.slots = []; ctx.clearRect(0, 0, CONFIG.canvas.width, CONFIG.canvas.height); ctx.fillStyle = gradient(0, 0, 1280, 820, '#9ed8f6', '#f4cf92'); ctx.fillRect(0, 0, 1280, 820); rect(14, 54, 1252, 718, 'rgba(255,246,223,0.32)', 'rgba(138,90,43,0.28)', 18, 2); if (gameState.phase === 'start') { drawStart(); return; } if (gameState.mode === 'battle') { drawBattle(); return; } drawHeader(); if (gameState.mode === 'contractSelect') drawContracts(); else if (gameState.mode === 'formation') { drawEnemyPanel(); drawMarket(); drawFormation(); } else if (gameState.mode === 'result') drawResult(); }

function queueCanvasAction(event) { const b = canvas.getBoundingClientRect(); const x = (event.clientX - b.left) * (CONFIG.canvas.width / Math.max(1, b.width)); const y = (event.clientY - b.top) * (CONFIG.canvas.height / Math.max(1, b.height)); for (const pool of [gameState.input.buttons, gameState.input.cards, gameState.input.slots]) { const hit = pool.find((i) => i.enabled !== false && x >= i.x && x <= i.x + i.w && y >= i.y && y <= i.y + i.h); if (hit) { gameState.input.actions.push(hit.action); return; } } }
function trackMouse(event) { const b = canvas.getBoundingClientRect(); gameState.input.mouse.x = (event.clientX - b.left) * (CONFIG.canvas.width / Math.max(1, b.width)); gameState.input.mouse.y = (event.clientY - b.top) * (CONFIG.canvas.height / Math.max(1, b.height)); }
let last = performance.now(); function loop(now) { const delta = Math.min(100, now - last); last = now; update(delta); render(); requestAnimationFrame(loop); }
if (canvas) { canvas.width = CONFIG.canvas.width; canvas.height = CONFIG.canvas.height; canvas.addEventListener('click', queueCanvasAction); canvas.addEventListener('mousemove', trackMouse); requestAnimationFrame(loop); }
