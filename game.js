'use strict';

const canvas = document.getElementById('gameCanvas');
const ctx = canvas ? canvas.getContext('2d') : null;

const CONFIG = Object.freeze({
  canvas: { width: 1280, height: 820 },
  game: { startingGold: 260, startingReputation: 0, baseContractChoices: 3, winRank: 'A' },
  formation: { frontSlots: 3, backSlots: 3 },
  personnel: { fatiguePerDeployment: 25, fatigueRecoveryPerContract: 15, fatigueWarnAt: 70, fatigueUnavailableAt: 100, injuryHpRatio: 0.23, injuryContracts: 2, maxSpecializationTags: null },
  economy: { replacementCostPerCasualty: 35 },
  combat: { tickMs: 430, maxTicks: 95, minBattleMs: 3000, baseAccuracy: 0.9, evasionPenalty: 0.22, physicalResistanceMultiplier: 0.55, areaSplashMultiplier: 0.45, healerAmount: 8 },
  ui: { ink: '#352113', muted: '#785838', parchment: '#fff4d8', panel: '#ffe8b4', wood: '#7f4a24', gold: '#d88922', red: '#c94f45', green: '#3d9b5f', blue: '#2f83bd', purple: '#8652b8', dark: '#17130f', trait: '#ffe05f' },
  specializations: {
    humanHunter: { label: '人間狩り', condition: 'humanKills', threshold: 10, wageIncrease: 8, bonusType: 'damageVsFaction', target: 'Human', multiplier: 1.1, description: '人間勢力への与ダメージ +10%' },
    undeadSpecialist: { label: '不死者専門', condition: 'undeadKills', threshold: 10, wageIncrease: 8, bonusType: 'damageVsFaction', target: 'Undead', multiplier: 1.1, description: '不死者勢力への与ダメージ +10%' },
    archerBreaker: { label: '弓兵崩し', condition: 'archerKills', threshold: 6, wageIncrease: 7, bonusType: 'damageVsEnemyId', target: 'archer', multiplier: 1.12, description: '弓兵への与ダメージ +12%' },
    fortressBreaker: { label: '城塞崩し', condition: 'armoredKills', threshold: 6, wageIncrease: 9, bonusType: 'damageVsArmored', targetArmorAtLeast: 2, multiplier: 1.1, description: '装甲2以上の敵への与ダメージ +10%' },
    frontlineVeteran: { label: '前線古参', condition: 'frontlineDeployments', threshold: 10, wageIncrease: 6, bonusType: 'frontlineDamageReduction', multiplier: 0.92, description: '前衛配置中だけ被ダメージ -8%' },
    survivor: { label: '生還者', condition: 'battlesSurvived', threshold: 8, wageIncrease: 5, bonusType: 'injuryRiskReduction', multiplier: 0.75, description: '生還時の負傷判定HPしきい値 -25%' },
    mvpRegular: { label: '常連MVP', condition: 'mvpCount', threshold: 3, wageIncrease: 10, bonusType: 'survivalReputationBonus', reputationBonus: 4, description: '生還時に信用 +4' },
  },
  traits: {
    humanSlayer: { label: '人間特攻', description: '人間系に追加ダメージ' },
    evasion: { label: '回避', description: '敵の命中率を低下' },
    physicalResistance: { label: '物理耐性', description: '物理ダメージ軽減' },
    areaAttack: { label: '範囲攻撃', description: '追加の敵へ飛び火' },
    backlineAttack: { label: '後衛狙い', description: '敵後衛を優先' },
  },
  monsters: {
    goblin: { id: 'goblin', name: 'ゴブリン', wage: 10, hp: 36, attack: 9, speed: 3, row: 'back', damageType: 'physical', traits: ['evasion'], color: '#90df5e', icon: 'GOB', role: '安価な利益要員' },
    orc: { id: 'orc', name: 'オーク', wage: 20, hp: 58, attack: 15, speed: 2, row: 'front', damageType: 'physical', traits: ['humanSlayer'], color: '#70bf5b', icon: 'ORC', role: '対人前衛' },
    ghost: { id: 'ghost', name: 'ゴースト', wage: 25, hp: 46, attack: 12, speed: 2, row: 'front', damageType: 'spirit', traits: ['physicalResistance'], color: '#b8d8ff', icon: 'GHO', role: '物理受け' },
    troll: { id: 'troll', name: 'トロル', wage: 38, hp: 82, attack: 17, speed: 1, row: 'front', damageType: 'physical', traits: [], color: '#7aa36d', icon: 'TRL', role: '高耐久壁' },
    dragon: { id: 'dragon', name: 'ドラゴン', wage: 60, hp: 64, attack: 23, speed: 2, row: 'back', damageType: 'fire', traits: ['areaAttack'], color: '#ff704f', icon: 'DRG', role: '高額範囲火力' },
  },
  enemies: {
    militia: { id: 'militia', name: '民兵', faction: 'Human', hp: 28, attack: 7, speed: 2, row: 'front', armor: 0, traits: ['人間'], color: '#c49b74', icon: 'MIL' },
    knight: { id: 'knight', name: '騎士', faction: 'Human', hp: 54, attack: 12, speed: 2, row: 'front', armor: 2, traits: ['重装人間'], color: '#b8b6aa', icon: 'KNT' },
    archer: { id: 'archer', name: '弓兵', faction: 'Human', hp: 32, attack: 11, speed: 3, row: 'back', armor: 0, traits: ['遠隔人間', 'backlineAttack'], color: '#d7a45f', icon: 'ARC' },
    healer: { id: 'healer', name: '治療師', faction: 'Human', hp: 30, attack: 5, speed: 2, row: 'back', armor: 0, traits: ['味方回復'], color: '#f0df8d', icon: 'HEA' },
    captain: { id: 'captain', name: '隊長', faction: 'Human', hp: 72, attack: 15, speed: 2, row: 'front', armor: 3, traits: ['人間指揮官'], color: '#ffcc66', icon: 'CAP' },
    paladin: { id: 'paladin', name: '聖騎士', faction: 'Human', hp: 88, attack: 18, speed: 2, row: 'front', armor: 4, traits: ['高脅威人間'], color: '#efe4a3', icon: 'PAL' },
  },
  ranks: [
    { rank: 'E', reputation: 0, unlock: 'Local clients' },
    { rank: 'D', reputation: 50, unlock: 'Military clients / Ghost applicants' },
    { rank: 'C', reputation: 120, unlock: 'Honor contracts / Troll applicants' },
    { rank: 'B', reputation: 220, unlock: 'Dragon scout desk' },
    { rank: 'A', reputation: 360, unlock: 'Hero elimination clients' },
    { rank: 'S', reputation: 520, unlock: 'Demon King priority desk' },
  ],
  contracts: [
    { title: '商会倉庫の示威派遣', client: '黒牙商会', type: 'Commercial Contract', difficulty: 1, baseReward: 140, laborBudget: 55, reputationReward: 12, enemyComposition: ['militia', 'archer'], bonusObjective: 'Labor Under Budget', bonusReward: 45, recommendedCounter: '安いゴブリン中心。勝つだけでなく人件費を抑える。', riskLabel: 'Low', minReputation: 0 },
    { title: '村境防衛の魔物派遣', client: '魔王軍 第七守備隊', type: 'Military Contract', difficulty: 1, baseReward: 120, laborBudget: 70, reputationReward: 24, enemyComposition: ['militia', 'knight'], bonusObjective: 'No Casualties', bonusReward: 45, recommendedCounter: 'オーク前衛とゴブリン後衛で低損耗を狙う。', riskLabel: 'Low', minReputation: 0 },
    { title: 'オーク部族連絡任務', client: '魔王軍 人事局', type: 'Scout Contract', difficulty: 1, baseReward: 70, laborBudget: 45, reputationReward: 28, enemyComposition: ['militia', 'militia'], bonusObjective: 'Deploy 2 Units Or Less', bonusReward: 20, recommendedCounter: '低コスト少数派遣。成功でオーク人員候補が増える。', riskLabel: 'Low', specialResult: '+2 Orc personnel candidates', scoutReward: { species: 'orc', count: 2 }, minReputation: 0 },
    { title: '前線治療班の排除', client: '魔王軍 医療妨害課', type: 'Military Contract', difficulty: 2, baseReward: 185, laborBudget: 95, reputationReward: 34, enemyComposition: ['knight', 'healer', 'archer'], bonusObjective: 'Use Human Slayer', bonusReward: 60, recommendedCounter: 'オークの人間特攻で回復役を守る前衛を早く崩す。', riskLabel: 'Medium', minReputation: 45 },
    { title: '巡礼路安全保証への嫌がらせ', client: '悪徳保険組合', type: 'Commercial Contract', difficulty: 2, baseReward: 240, laborBudget: 90, reputationReward: 18, enemyComposition: ['archer', 'archer', 'knight'], bonusObjective: 'Profit At Least 100G', bonusReward: 80, recommendedCounter: '過剰戦力を避ける。ドラゴンは利益を消しやすい。', riskLabel: 'Medium', minReputation: 50 },
    { title: 'ゴースト墓地 pact 締結', client: '冥府外交室', type: 'Scout Contract', difficulty: 2, baseReward: 85, laborBudget: 80, reputationReward: 45, enemyComposition: ['knight', 'healer'], bonusObjective: 'No Casualties', bonusReward: 35, recommendedCounter: '成功でゴースト応募者を解禁。信用目的なら薄利で受ける。', riskLabel: 'Medium', specialResult: 'Unlock Ghost applicants +1 candidate', scoutReward: { species: 'ghost', count: 1, unlock: true }, minReputation: 70 },
    { title: '聖堂孤児院への名誉出動', client: '魔王軍 宣伝省', type: 'Honor Contract', difficulty: 2, baseReward: 160, laborBudget: 120, reputationReward: 80, enemyComposition: ['knight', 'knight', 'healer'], bonusObjective: 'No Casualties', bonusReward: 25, recommendedCounter: '赤字でも高信用。必要ならドラゴン投入を検討。', riskLabel: 'High', minReputation: 95 },
    { title: '城門守備隊への増援派遣', client: '骸骨城 兵站局', type: 'Military Contract', difficulty: 3, baseReward: 260, laborBudget: 130, reputationReward: 50, enemyComposition: ['captain', 'knight', 'healer'], bonusObjective: 'Low Casualties', bonusReward: 85, recommendedCounter: '物理受けと人間特攻を組み合わせ、負傷を避ける。', riskLabel: 'High', minReputation: 120 },
    { title: 'ドラゴン巣穴測量', client: '魔王軍 地図局', type: 'Scout Contract', difficulty: 3, baseReward: 100, laborBudget: 150, reputationReward: 90, enemyComposition: ['captain', 'archer', 'archer'], bonusObjective: 'Survive With 3 Units', bonusReward: 40, recommendedCounter: '薄利または赤字の希少種解禁契約。成功でドラゴン応募者。', riskLabel: 'High', specialResult: 'Unlock Dragon species +1 candidate', scoutReward: { species: 'dragon', count: 1, unlock: true }, minReputation: 190 },
    { title: '聖騎士迎撃戦', client: '魔王軍 西方司令部', type: 'Honor Contract', difficulty: 4, baseReward: 230, laborBudget: 170, reputationReward: 120, enemyComposition: ['paladin', 'captain', 'healer', 'archer'], bonusObjective: 'No Casualties', bonusReward: 80, recommendedCounter: '高額人員を許容し、信用を買う契約。', riskLabel: 'Critical', minReputation: 220 },
    { title: '勇者護衛隊の排除契約', client: '魔王直属軍', type: 'Military Contract', difficulty: 5, baseReward: 420, laborBudget: 240, reputationReward: 150, enemyComposition: ['paladin', 'captain', 'knight', 'healer', 'archer'], bonusObjective: 'MVP Dragon Or Orc', bonusReward: 160, recommendedCounter: '十分な人員と疲労管理が必要。勝利でランクA到達を狙える。', riskLabel: 'Heroic', minReputation: 330, finalContract: true },
  ],
  upgrades: [
    { id: 'ads', name: 'Recruitment Advertising', cost: 120, max: 3, description: '毎回の新規人員候補を増やす。' },
    { id: 'desk', name: 'Contract Desk', cost: 150, max: 2, description: '提示される契約数を増やす。' },
    { id: 'info', name: 'Information Department', cost: 110, max: 2, description: '敵分析と勝率予測を詳しくする。' },
    { id: 'scout', name: 'Scout Network', cost: 140, max: 3, description: 'スカウト契約の出現と希少種候補を増やす。' },
  ],
});

const gameState = {
  mode: 'contractSelect', phase: 'start', day: 1, gold: CONFIG.game.startingGold, reputation: CONFIG.game.startingReputation, totalProfit: 0,
  unlockedSpecies: ['goblin', 'orc'], personnel: [], candidates: [], contracts: [], selectedContractId: null, selectedUnitId: null,
  battle: null, report: null, economy: null, upgrades: { ads: 0, desk: 0, info: 0, scout: 0 }, nextSerial: 1,
  input: { buttons: [], cards: [], slots: [], actions: [], mouse: { x: 0, y: 0 } }, message: '',
};

function randInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function choice(list) { return list[Math.floor(Math.random() * list.length)]; }
function clone(obj) { return JSON.parse(JSON.stringify(obj)); }
function rankInfo() { return CONFIG.ranks.slice().reverse().find((r) => gameState.reputation >= r.reputation) || CONFIG.ranks[0]; }
function rankIndex(rank) { return CONFIG.ranks.findIndex((r) => r.rank === rank); }
function currentRankIndex() { return rankIndex(rankInfo().rank); }
function contractTypeColor(type) { return { 'Commercial Contract': CONFIG.ui.gold, 'Military Contract': CONFIG.ui.blue, 'Honor Contract': CONFIG.ui.purple, 'Scout Contract': CONFIG.ui.green }[type] || CONFIG.ui.muted; }
function species(id) { return CONFIG.monsters[id]; }
function enemyDef(id) { return CONFIG.enemies[id]; }
function availablePersonnel() { return gameState.personnel.filter((u) => isAvailable(u) && !u.row); }
function deployedPersonnel() { return gameState.personnel.filter((u) => u.row); }
function livingPersonnel() { return gameState.personnel; }
function activeContract() { return gameState.contracts.find((c) => c.id === gameState.selectedContractId); }
function isAvailable(unit) { return unit.injuryContractsRemaining <= 0 && unit.fatigue < CONFIG.personnel.fatigueUnavailableAt; }
function baseWage(unit) { return species(unit.species).wage; }
function specializationConfig(tag) { return CONFIG.specializations[tag]; }
function specializationLabels(unit) { return (unit.specializationTags || []).map((tag) => specializationConfig(tag)?.label || tag); }
function specializationPremium(unit) { return (unit.specializationTags || []).reduce((sum, tag) => sum + (specializationConfig(tag)?.wageIncrease || 0), 0); }
function finalWage(unit) { return baseWage(unit) + specializationPremium(unit); }
function recalculateWage(unit) { unit.wage = finalWage(unit); return unit.wage; }
function laborCost(units = deployedPersonnel()) { return units.reduce((sum, u) => sum + finalWage(u), 0); }
function replacementCost(deadCount) { return deadCount * CONFIG.economy.replacementCostPerCasualty; }
function projectedProfit(contract = activeContract()) { if (!contract) return 0; return contract.baseReward - laborCost(); }
function deployedSpecializationPremium() { return deployedPersonnel().reduce((sum, u) => sum + specializationPremium(u), 0); }
function fatigueStatus(unit) { if (unit.injuryContractsRemaining > 0) return `負傷 ${unit.injuryContractsRemaining}件`; if (unit.fatigue >= CONFIG.personnel.fatigueUnavailableAt) return '疲労限界'; if (unit.fatigue >= CONFIG.personnel.fatigueWarnAt) return '疲労警告'; return '勤務可'; }

function emptyExperienceRecords() { return { humanKills: 0, undeadKills: 0, archerKills: 0, armoredKills: 0, battlesSurvived: 0, mvpCount: 0, frontlineDeployments: 0 }; }
function createPersonnel(speciesId) {
  const s = species(speciesId);
  const serial = String(gameState.nextSerial++).padStart(3, '0');
  const unit = { id: `${speciesId}-${serial}-${Date.now()}-${Math.random().toString(16).slice(2)}`, species: speciesId, name: `${s.name} #${serial}`, wage: s.wage, fatigue: 0, injuryContractsRemaining: 0, dispatchCount: 0, kills: 0, survivalCount: 0, mvpCount: 0, specializationTags: [], experienceRecords: emptyExperienceRecords(), totalProfitContribution: 0, row: null, slot: null };
  recalculateWage(unit);
  return unit;
}
function addCandidate(speciesId) { gameState.candidates.push(createPersonnel(speciesId)); }
function addPersonnel(speciesId) { gameState.personnel.push(createPersonnel(speciesId)); }
function seedGame() {
  gameState.personnel = []; gameState.candidates = []; gameState.unlockedSpecies = ['goblin', 'orc']; gameState.nextSerial = 1;
  ['goblin', 'goblin', 'goblin', 'orc', 'orc'].forEach(addPersonnel);
  ['goblin', 'orc', 'goblin'].forEach(addCandidate);
  refreshContracts();
}
function resetGame() {
  Object.assign(gameState, { mode: 'contractSelect', phase: 'start', day: 1, gold: CONFIG.game.startingGold, reputation: 0, totalProfit: 0, selectedContractId: null, selectedUnitId: null, battle: null, report: null, economy: null, upgrades: { ads: 0, desk: 0, info: 0, scout: 0 }, message: '' });
  seedGame();
}

function refreshCandidates() {
  const slots = 1 + gameState.upgrades.ads;
  for (let i = 0; i < slots; i += 1) {
    const pool = [...gameState.unlockedSpecies];
    if (gameState.upgrades.scout > 1 && gameState.reputation >= 160) pool.push('ghost');
    if (gameState.upgrades.scout > 2 && gameState.reputation >= 260) pool.push('dragon');
    addCandidate(choice(pool));
  }
  gameState.candidates = gameState.candidates.slice(-8);
}
function refreshContracts() {
  const count = CONFIG.game.baseContractChoices + gameState.upgrades.desk;
  const eligible = CONFIG.contracts.filter((c) => c.minReputation <= gameState.reputation);
  const scouts = eligible.filter((c) => c.type === 'Scout Contract');
  const regular = eligible.filter((c) => c.type !== 'Scout Contract');
  const weighted = [...regular];
  for (let i = 0; i < 1 + gameState.upgrades.scout; i += 1) weighted.push(...scouts);
  const selected = [];
  while (selected.length < count && weighted.length) {
    const c = choice(weighted);
    if (!selected.includes(c)) selected.push(c);
    weighted.splice(weighted.indexOf(c), 1);
  }
  gameState.contracts = selected.map((c, i) => ({ ...clone(c), id: `${gameState.day}-${i}-${c.title}` }));
}

function buildCombatantFromPersonnel(unit) {
  const s = species(unit.species);
  return { ...clone(s), personnelId: unit.id, displayName: unit.name, unitType: 'monster', name: unit.name, wage: finalWage(unit), specializationTags: [...(unit.specializationTags || [])], maxHp: s.hp, hp: s.hp, row: unit.row, slot: unit.slot, alive: true, kills: 0, killFactions: {}, killEnemyIds: {}, armoredKills: 0, attackTimer: randInt(0, 500), lastHitMs: 0, attackAnimMs: 0 };
}
function buildEnemy(id, index) {
  const e = enemyDef(id);
  return { ...clone(e), unitType: 'enemy', name: `${e.name}${index + 1}`, maxHp: e.hp, hp: e.hp, alive: true, slot: index % 3, attackTimer: randInt(0, 500), lastHitMs: 0, attackAnimMs: 0 };
}
function startBattle() {
  const c = activeContract();
  if (!c || !deployedPersonnel().length) return;
  gameState.battle = { allies: deployedPersonnel().map(buildCombatantFromPersonnel), enemies: c.enemyComposition.map(buildEnemy), timeMs: 0, tickAccumulator: 0, log: [`${c.title} に派遣開始。`], finished: false };
  gameState.mode = 'battle';
}
function alive(list) { return list.filter((u) => u.alive && u.hp > 0); }
function selectTarget(attacker, targets) {
  const living = alive(targets);
  if (!living.length) return null;
  if ((attacker.traits || []).includes('backlineAttack')) return living.find((u) => u.row === 'back') || living[0];
  return living.find((u) => u.row === 'front') || living[0];
}
function hasSpecialization(unit, tag) { return (unit.specializationTags || []).includes(tag); }
function applySpecializationDamageBonuses(attacker, target, damage) {
  if (attacker.unitType !== 'monster') return damage;
  return (attacker.specializationTags || []).reduce((amount, tag) => {
    const spec = specializationConfig(tag);
    if (!spec) return amount;
    if (spec.bonusType === 'damageVsFaction' && target.faction === spec.target) return amount * spec.multiplier;
    if (spec.bonusType === 'damageVsEnemyId' && target.id === spec.target) return amount * spec.multiplier;
    if (spec.bonusType === 'damageVsArmored' && (target.armor || 0) >= (spec.targetArmorAtLeast || 1)) return amount * spec.multiplier;
    return amount;
  }, damage);
}
function applySpecializationDefenseBonuses(defender, damage) {
  if (defender.unitType !== 'monster' || defender.row !== 'front') return damage;
  return (defender.specializationTags || []).reduce((amount, tag) => {
    const spec = specializationConfig(tag);
    return spec?.bonusType === 'frontlineDamageReduction' ? amount * spec.multiplier : amount;
  }, damage);
}
function recordKill(attacker, target) {
  attacker.kills = (attacker.kills || 0) + 1;
  if (attacker.unitType !== 'monster') return;
  attacker.killFactions[target.faction] = (attacker.killFactions[target.faction] || 0) + 1;
  attacker.killEnemyIds[target.id] = (attacker.killEnemyIds[target.id] || 0) + 1;
  if ((target.armor || 0) >= 2) attacker.armoredKills = (attacker.armoredKills || 0) + 1;
}
function dealDamage(attacker, target, allTargets) {
  if (!attacker || !target) return;
  const evasion = (target.traits || []).includes('evasion') ? CONFIG.combat.evasionPenalty : 0;
  if (Math.random() > CONFIG.combat.baseAccuracy - evasion) { pushLog(`${attacker.name} の攻撃を ${target.name} が回避。`); return; }
  let damage = attacker.attack + randInt(-2, 3) - (target.armor || 0);
  if ((attacker.traits || []).includes('humanSlayer') && target.faction === 'Human') damage += 6;
  damage = applySpecializationDamageBonuses(attacker, target, damage);
  if (attacker.damageType === 'physical' && (target.traits || []).includes('physicalResistance')) damage *= CONFIG.combat.physicalResistanceMultiplier;
  damage = applySpecializationDefenseBonuses(target, damage);
  damage = Math.max(2, Math.round(damage));
  target.hp = Math.max(0, target.hp - damage); target.lastHitMs = 350; attacker.attackAnimMs = 250;
  pushLog(`${attacker.name} → ${target.name} ${damage} damage`);
  if (target.hp <= 0 && target.alive) { target.alive = false; recordKill(attacker, target); pushLog(`${target.name} down.`); }
  if ((attacker.traits || []).includes('areaAttack')) {
    const splash = alive(allTargets).find((u) => u !== target);
    if (splash) {
      const splashDamage = Math.max(2, Math.round(damage * CONFIG.combat.areaSplashMultiplier));
      splash.hp = Math.max(0, splash.hp - splashDamage); splash.lastHitMs = 350;
      pushLog(`${attacker.name} の範囲攻撃 → ${splash.name} ${splashDamage}`);
      if (splash.hp <= 0 && splash.alive) { splash.alive = false; recordKill(attacker, splash); }
    }
  }
}
function healerAction(unit, friends) {
  const target = alive(friends).sort((a, b) => (a.hp / a.maxHp) - (b.hp / b.maxHp))[0];
  if (!target || target.hp >= target.maxHp) return false;
  target.hp = Math.min(target.maxHp, target.hp + CONFIG.combat.healerAmount); pushLog(`${unit.name} heals ${target.name}.`); return true;
}
function pushLog(line) { const b = gameState.battle; if (!b) return; b.log.unshift(line); b.log = b.log.slice(0, 7); }
function updateBattle(delta) {
  const b = gameState.battle; if (!b || b.finished) return;
  b.timeMs += delta; b.tickAccumulator += delta;
  [...b.allies, ...b.enemies].forEach((u) => { u.lastHitMs = Math.max(0, (u.lastHitMs || 0) - delta); u.attackAnimMs = Math.max(0, (u.attackAnimMs || 0) - delta); });
  if (b.tickAccumulator < CONFIG.combat.tickMs) return;
  b.tickAccumulator = 0;
  const units = [...alive(b.allies), ...alive(b.enemies)].sort((a, z) => z.speed - a.speed + Math.random() - 0.5);
  for (const unit of units) {
    unit.attackTimer -= CONFIG.combat.tickMs;
    if (unit.attackTimer > 0) continue;
    unit.attackTimer = Math.max(650, 1850 - unit.speed * 220);
    if (unit.unitType === 'enemy' && unit.id === 'healer' && healerAction(unit, b.enemies)) continue;
    const foes = unit.unitType === 'monster' ? b.enemies : b.allies;
    dealDamage(unit, selectTarget(unit, foes), foes);
  }
  if (b.timeMs >= CONFIG.combat.minBattleMs && (!alive(b.enemies).length || !alive(b.allies).length || b.timeMs > CONFIG.combat.maxTicks * CONFIG.combat.tickMs)) finishBattle();
}

function bonusAchieved(contract, victory, dead, mvp) {
  if (!victory) return false;
  const deployed = deployedPersonnel();
  switch (contract.bonusObjective) {
    case 'No Casualties': return dead.length === 0;
    case 'Labor Under Budget': return laborCost() <= contract.laborBudget;
    case 'Deploy 2 Units Or Less': return deployed.length <= 2;
    case 'Use Human Slayer': return deployed.some((u) => species(u.species).traits.includes('humanSlayer'));
    case 'Profit At Least 100G': return contract.baseReward + contract.bonusReward - laborCost() - replacementCost(dead.length) >= 100;
    case 'Low Casualties': return dead.length <= 1;
    case 'Survive With 3 Units': return deployed.length <= 3 && dead.length === 0;
    case 'MVP Dragon Or Orc': return mvp && ['dragon', 'orc'].includes(mvp.species);
    default: return false;
  }
}
function reputationGain(contract, victory, bonus, dead) {
  if (!victory) return contract.type === 'Honor Contract' ? 8 : 2;
  let gain = contract.reputationReward;
  if (bonus) gain += Math.round(contract.reputationReward * 0.35);
  if (dead.length === 0) gain += 12;
  if (['High', 'Critical', 'Heroic'].includes(contract.riskLabel)) gain += 16;
  return gain;
}

function addExperience(unit, key, amount = 1) {
  unit.experienceRecords = { ...emptyExperienceRecords(), ...(unit.experienceRecords || {}) };
  unit.experienceRecords[key] = (unit.experienceRecords[key] || 0) + amount;
}
function syncLegacyExperience(unit) {
  unit.experienceRecords = { ...emptyExperienceRecords(), ...(unit.experienceRecords || {}) };
  unit.experienceRecords.battlesSurvived = Math.max(unit.experienceRecords.battlesSurvived, unit.survivalCount || 0);
  unit.experienceRecords.mvpCount = Math.max(unit.experienceRecords.mvpCount, unit.mvpCount || 0);
}
function evaluateSpecializations(unit) {
  syncLegacyExperience(unit);
  unit.specializationTags = unit.specializationTags || [];
  const gained = [];
  Object.entries(CONFIG.specializations).forEach(([tag, spec]) => {
    const cap = CONFIG.personnel.maxSpecializationTags;
    if (cap !== null && unit.specializationTags.length >= cap) return;
    if (!unit.specializationTags.includes(tag) && (unit.experienceRecords[spec.condition] || 0) >= spec.threshold) {
      unit.specializationTags.push(tag);
      gained.push(tag);
    }
  });
  recalculateWage(unit);
  return gained;
}
function survivorInjuryRatio(unit) {
  return (unit.specializationTags || []).reduce((ratio, tag) => {
    const spec = specializationConfig(tag);
    return spec?.bonusType === 'injuryRiskReduction' ? ratio * spec.multiplier : ratio;
  }, CONFIG.personnel.injuryHpRatio);
}
function survivedMvpReputationBonus(deployed, battleAllies) {
  return deployed.reduce((sum, unit) => {
    const combatant = battleAllies.find((a) => a.personnelId === unit.id);
    if (!combatant?.alive) return sum;
    return sum + (unit.specializationTags || []).reduce((unitSum, tag) => {
      const spec = specializationConfig(tag);
      return unitSum + (spec?.bonusType === 'survivalReputationBonus' ? spec.reputationBonus || 0 : 0);
    }, 0);
  }, 0);
}
function formatSpecializationList(tags) { return tags.map((tag) => specializationConfig(tag)?.label || tag).join(' / '); }

function finishBattle() {
  const b = gameState.battle; const c = activeContract(); if (!b || !c) return;
  b.finished = true;
  const victory = alive(b.enemies).length === 0 && alive(b.allies).length > 0;
  const deployed = deployedPersonnel();
  const deadCombatants = b.allies.filter((u) => !u.alive || u.hp <= 0);
  const battleLabor = laborCost(deployed);
  const deadNames = deadCombatants.map((u) => u.displayName);
  const injured = [];
  const specializationResults = [];
  const mvpCombatant = b.allies.slice().sort((a, z) => (z.kills || 0) - (a.kills || 0) || z.hp - a.hp)[0];
  const mvp = mvpCombatant ? deployed.find((u) => u.id === mvpCombatant.personnelId) : null;
  deployed.forEach((u) => {
    const combatant = b.allies.find((a) => a.personnelId === u.id);
    const oldWage = finalWage(u);
    const oldMvp = u.mvpCount;
    u.dispatchCount += 1; u.fatigue = Math.min(140, u.fatigue + CONFIG.personnel.fatiguePerDeployment); u.kills += combatant?.kills || 0;
    if (u.row === 'front') addExperience(u, 'frontlineDeployments', 1);
    addExperience(u, 'humanKills', combatant?.killFactions?.Human || 0);
    addExperience(u, 'undeadKills', combatant?.killFactions?.Undead || 0);
    addExperience(u, 'archerKills', combatant?.killEnemyIds?.archer || 0);
    addExperience(u, 'armoredKills', combatant?.armoredKills || 0);
    if (combatant && combatant.alive) {
      u.survivalCount += 1;
      addExperience(u, 'battlesSurvived', 1);
      if (combatant.hp / combatant.maxHp <= survivorInjuryRatio(u)) { u.injuryContractsRemaining = CONFIG.personnel.injuryContracts; injured.push(u.name); }
    } else {
      u.injuryContractsRemaining = CONFIG.personnel.injuryContracts + 1; injured.push(u.name);
    }
    if (mvp && mvp.id === u.id) { u.mvpCount += 1; addExperience(u, 'mvpCount', 1); }
    const gainedTags = evaluateSpecializations(u);
    const newWage = finalWage(u);
    if (gainedTags.length || oldWage !== newWage || oldMvp !== u.mvpCount) specializationResults.push({ unitName: u.name, gainedTags, oldWage, newWage, oldMvp, newMvp: u.mvpCount });
  });
  livingPersonnel().filter((u) => !u.row).forEach((u) => { u.fatigue = Math.max(0, u.fatigue - CONFIG.personnel.fatigueRecoveryPerContract); if (u.injuryContractsRemaining > 0) u.injuryContractsRemaining -= 1; });
  const bonus = bonusAchieved(c, victory, deadCombatants, mvp);
  const reward = victory ? c.baseReward : 0;
  const bonusReward = bonus ? c.bonusReward : 0;
  const labor = battleLabor;
  const replacements = replacementCost(deadCombatants.length);
  const profit = reward + bonusReward - labor - replacements;
  const veteranRepBonus = survivedMvpReputationBonus(deployed, b.allies);
  const repGain = reputationGain(c, victory, bonus, deadCombatants) + veteranRepBonus;
  gameState.gold += profit; gameState.totalProfit += profit; gameState.reputation += repGain;
  deployed.forEach((u) => { u.totalProfitContribution += Math.round(profit / Math.max(1, deployed.length)); u.row = null; u.slot = null; });
  if (victory && c.scoutReward) applyScoutReward(c.scoutReward);
  gameState.economy = { reward, bonusReward, laborCost: labor, replacementCosts: replacements, profit, reputationGain: repGain, veteranRepBonus, bonusAchieved: bonus };
  gameState.report = { victory, dead: deadNames, injured, mvpName: mvp ? mvp.name : 'なし', grade: gradeFor(profit, deadCombatants.length, bonus), scoutResult: victory ? c.specialResult : null, specializationResults };
  gameState.mode = 'result';
  if (victory && (c.finalContract || rankInfo().rank === CONFIG.game.winRank)) gameState.message = '目標達成：魔王軍が認める優良派遣会社になりました。継続プレイ可能です。';
}
function applyScoutReward(reward) {
  if (reward.unlock && !gameState.unlockedSpecies.includes(reward.species)) gameState.unlockedSpecies.push(reward.species);
  for (let i = 0; i < reward.count; i += 1) addCandidate(reward.species);
}
function gradeFor(profit, deadCount, bonus) { let score = 1; if (profit >= 0) score += 1; if (profit >= 90) score += 1; if (deadCount === 0) score += 1; if (bonus) score += 1; return ['D', 'C', 'B', 'A', 'S'][Math.min(4, score - 1)]; }
function continueAfterResult() {
  gameState.day += 1; gameState.selectedContractId = null; gameState.selectedUnitId = null; gameState.battle = null; gameState.report = null; gameState.economy = null;
  refreshCandidates(); refreshContracts(); gameState.mode = 'contractSelect';
}

function contractPrediction() {
  const c = activeContract(); const units = deployedPersonnel();
  if (!c || !units.length) return { chance: 0, expectedDead: 0, projectedProfit: c ? c.baseReward : 0, note: '人員未配置' };
  const power = units.reduce((s, u) => { const m = species(u.species); return s + m.hp * 0.28 + m.attack * 2.5 + m.speed * 5 - u.fatigue * 0.08; }, 0);
  const enemy = c.enemyComposition.reduce((s, id) => { const e = enemyDef(id); return s + e.hp * 0.24 + e.attack * 2.4 + e.speed * 4 + (e.armor || 0) * 3; }, 0);
  const counter = units.some((u) => species(u.species).traits.includes('humanSlayer')) && c.enemyComposition.some((id) => enemyDef(id).faction === 'Human') ? 18 : 0;
  const chance = Math.max(8, Math.min(94, Math.round(50 + (power + counter - enemy) * 0.9)));
  const expectedDead = chance > 72 ? 0 : chance > 48 ? 1 : 2;
  return { chance, expectedDead, projectedProfit: c.baseReward - laborCost() - replacementCost(expectedDead), note: chance >= 70 ? '適正戦力' : '損耗注意' };
}

function handleAction(action) {
  if (!action) return;
  if (action.type === 'start') { gameState.phase = 'play'; gameState.mode = 'contractSelect'; return; }
  if (action.type === 'restart') { resetGame(); return; }
  if (action.type === 'company') { gameState.mode = 'company'; return; }
  if (action.type === 'contracts') { gameState.mode = 'contractSelect'; return; }
  if (action.type === 'selectContract') { gameState.selectedContractId = action.id; gameState.selectedUnitId = null; gameState.personnel.forEach((u) => { u.row = null; u.slot = null; }); gameState.mode = 'preparation'; return; }
  if (action.type === 'selectUnit') { gameState.selectedUnitId = action.id; return; }
  if (action.type === 'slot') { assignSelectedToSlot(action.row, action.slot); return; }
  if (action.type === 'bench') { const u = gameState.personnel.find((p) => p.id === gameState.selectedUnitId); if (u) { u.row = null; u.slot = null; } return; }
  if (action.type === 'battle') { startBattle(); return; }
  if (action.type === 'continue') { continueAfterResult(); return; }
  if (action.type === 'hire') { hireCandidate(action.id); return; }
  if (action.type === 'upgrade') { buyUpgrade(action.id); return; }
}
function assignSelectedToSlot(row, slot) {
  const u = gameState.personnel.find((p) => p.id === gameState.selectedUnitId);
  if (!u || !isAvailable(u)) return;
  const occupying = gameState.personnel.find((p) => p.row === row && p.slot === slot);
  if (occupying) { occupying.row = u.row; occupying.slot = u.slot; }
  u.row = row; u.slot = slot;
}
function hireCandidate(id) {
  const i = gameState.candidates.findIndex((c) => c.id === id); if (i < 0) return;
  const [candidate] = gameState.candidates.splice(i, 1); gameState.personnel.push(candidate); gameState.message = `${candidate.name} を雇用登録しました。`;
}
function buyUpgrade(id) {
  const up = CONFIG.upgrades.find((u) => u.id === id); if (!up) return;
  const lv = gameState.upgrades[id]; const cost = up.cost * (lv + 1);
  if (lv >= up.max || gameState.gold < cost) return;
  gameState.gold -= cost; gameState.upgrades[id] += 1; refreshContracts(); gameState.message = `${up.name} を Lv${gameState.upgrades[id]} に更新。`;
}
function update(delta) { while (gameState.input.actions.length) handleAction(gameState.input.actions.shift()); if (gameState.mode === 'battle') updateBattle(delta); }

function gradient(x, y, w, h, a, b) { const g = ctx.createLinearGradient(x, y, x + w, y + h); g.addColorStop(0, a); g.addColorStop(1, b); return g; }
function rect(x, y, w, h, fill, stroke = CONFIG.ui.ink, radius = 10, line = 2) { ctx.save(); ctx.beginPath(); ctx.roundRect(x, y, w, h, radius); ctx.fillStyle = fill; ctx.fill(); if (stroke) { ctx.lineWidth = line; ctx.strokeStyle = stroke; ctx.stroke(); } ctx.restore(); }
function text(value, x, y, size = 16, color = CONFIG.ui.ink, align = 'left', weight = '700') { ctx.save(); ctx.fillStyle = color; ctx.font = `${weight} ${size}px "Trebuchet MS", "Noto Sans JP", sans-serif`; ctx.textAlign = align; ctx.textBaseline = 'top'; ctx.fillText(String(value), x, y); ctx.restore(); }
function panel(title, x, y, w, h, color = CONFIG.ui.gold) { rect(x, y, w, h, CONFIG.ui.parchment, CONFIG.ui.wood, 16, 3); rect(x, y, w, 42, color, CONFIG.ui.wood, 16, 2); text(title, x + 18, y + 10, 18, '#fff8df'); }
function button(label, x, y, w, h, action, enabled = true) { rect(x, y, w, h, enabled ? gradient(x, y, w, h, '#fff1b0', '#e19b2d') : '#c9b99a', enabled ? '#7b461f' : '#8e806e', 10, 2); text(label, x + w / 2, y + 9, 15, enabled ? CONFIG.ui.ink : '#74685a', 'center'); gameState.input.buttons.push({ x, y, w, h, action, enabled }); }
function hpBar(u, x, y, w) { rect(x, y, w, 8, '#4a261d', null, 3, 0); const pct = Math.max(0, u.hp / u.maxHp); rect(x, y, w * pct, 8, pct > 0.45 ? CONFIG.ui.green : CONFIG.ui.red, null, 3, 0); }
function drawHeader() {
  rect(20, 14, 1240, 48, gradient(20, 14, 1240, 48, '#74411f', '#422414'), '#2c180d', 14, 2);
  text('Demon Army Dispatch Center', 42, 24, 24, '#ffe7a3');
  text(`Day ${gameState.day}`, 470, 28, 16, '#fff4d6');
  text(`Gold ${gameState.gold}G`, 560, 28, 16, CONFIG.ui.gold);
  text(`Reputation ${gameState.reputation} / Rank ${rankInfo().rank}`, 690, 28, 16, '#e6c4ff');
  text(`Total Profit ${gameState.totalProfit >= 0 ? '+' : ''}${gameState.totalProfit}G`, 930, 28, 16, '#b9f5c8');
  button('契約', 1092, 20, 70, 34, { type: 'contracts' }, gameState.mode !== 'contractSelect');
  button('会社', 1170, 20, 70, 34, { type: 'company' }, gameState.mode !== 'company');
}
function drawStart() {
  panel('Demon Army Dispatch Center', 190, 130, 900, 500, CONFIG.ui.red);
  text('魔王軍向けモンスター派遣会社を経営します。', 250, 210, 30);
  text('最強軍団を作るゲームではありません。契約予算・敵編成・人件費・損耗・利益・信用を読み、', 250, 270, 19);
  text('「誰を、どれだけ安く派遣すれば契約を完了できるか」を判断します。', 250, 304, 19);
  text('合成 / レベル / スキルツリー / 永続強化 / ランダム欠勤 / 永久死亡はありません。', 250, 360, 18, CONFIG.ui.red);
  text('信用は契約アクセスを広げますが、戦闘ステータスは上がりません。', 250, 394, 18, CONFIG.ui.purple);
  button('Dispatch Desk を開く', 500, 520, 280, 48, { type: 'start' }, true);
}
function enemySummary(ids) { const counts = {}; ids.forEach((id) => { counts[enemyDef(id).name] = (counts[enemyDef(id).name] || 0) + 1; }); return Object.entries(counts).map(([n, c]) => `${n}x${c}`).join(' / '); }
function drawContracts() {
  panel('Contract Select Screen', 34, 82, 1212, 670, CONFIG.ui.blue);
  text('契約カードを選択。Commercial=高利益低信用 / Military=中間 / Honor=赤字でも高信用 / Scout=人員解禁。', 60, 130, 17);
  gameState.contracts.forEach((c, i) => {
    const x = 58 + (i % 3) * 398; const y = 174 + Math.floor(i / 3) * 250;
    rect(x, y, 370, 220, '#fffaf0', contractTypeColor(c.type), 14, 4);
    text(c.type, x + 16, y + 12, 15, contractTypeColor(c.type));
    text(c.title, x + 16, y + 38, 20);
    text(`Client: ${c.client}`, x + 16, y + 68, 13, CONFIG.ui.muted);
    text(`Difficulty ${c.difficulty} / Risk ${c.riskLabel}`, x + 16, y + 92, 14, CONFIG.ui.red);
    text(`Reward ${c.baseReward}G  Labor Budget ${c.laborBudget}G`, x + 16, y + 116, 15, CONFIG.ui.gold);
    text(`Reputation +${c.reputationReward}  Bonus ${c.bonusReward}G`, x + 16, y + 140, 15, CONFIG.ui.purple);
    text(`Enemy: ${enemySummary(c.enemyComposition)}`, x + 16, y + 164, 13);
    text(`Bonus: ${c.bonusObjective}`, x + 16, y + 184, 13, CONFIG.ui.green);
    if (c.specialResult) text(`Special: ${c.specialResult}`, x + 16, y + 202, 12, CONFIG.ui.purple);
    gameState.input.cards.push({ x, y, w: 370, h: 220, action: { type: 'selectContract', id: c.id }, enabled: true });
  });
  if (gameState.message) text(gameState.message, 58, 718, 16, CONFIG.ui.purple);
}
function drawPreparation() {
  const c = activeContract(); if (!c) return;
  panel('Preparation Screen', 24, 76, 1232, 690, CONFIG.ui.gold);
  rect(48, 130, 390, 570, '#fffaf0', '#d4a15e', 12, 2);
  text(c.title, 70, 150, 23); text(c.type, 70, 184, 16, contractTypeColor(c.type));
  text(`Client: ${c.client}`, 70, 212, 14, CONFIG.ui.muted);
  text(`Contract Reward: ${c.baseReward}G`, 70, 250, 20, CONFIG.ui.gold);
  text(`Labor Budget: ${c.laborBudget}G`, 70, 284, 20, laborCost() <= c.laborBudget ? CONFIG.ui.green : CONFIG.ui.red);
  text(`Current Labor Cost: ${laborCost()}G`, 70, 318, 22, laborCost() <= c.laborBudget ? CONFIG.ui.green : CONFIG.ui.red);
  text(`Specialist Premium: +${deployedSpecializationPremium()}G`, 70, 350, 18, deployedSpecializationPremium() > 0 ? CONFIG.ui.red : CONFIG.ui.muted);
  text(`Projected Profit: ${projectedProfit(c)}G`, 70, 380, 22, projectedProfit(c) >= 0 ? CONFIG.ui.green : CONFIG.ui.red);
  if (deployedSpecializationPremium() > 0) text('Veteran premium is reducing projected profit.', 70, 410, 14, CONFIG.ui.red);
  text(`Reputation Gain: +${c.reputationReward}`, 70, 436, 18, CONFIG.ui.purple);
  text(`Bonus Objective: ${c.bonusObjective}`, 70, 466, 16, CONFIG.ui.green);
  text(`Bonus Reward: ${c.bonusReward}G`, 70, 492, 16, CONFIG.ui.green);
  text(`Recommended Counter:`, 70, 530, 15, CONFIG.ui.muted);
  wrapText(c.recommendedCounter, 70, 556, 340, 17, 14, CONFIG.ui.ink);
  if (c.specialResult) text(`Scout Result: ${c.specialResult}`, 70, 650, 14, CONFIG.ui.purple);
  drawEnemyIntel(c);
  drawFormationBoard();
  drawRoster();
}
function wrapText(str, x, y, maxWidth, lineHeight, size, color) { let line = ''; let lineY = y; [...str].forEach((ch) => { const test = line + ch; if (ctx.measureText(test).width > maxWidth && line) { text(line, x, lineY, size, color); line = ch; lineY += lineHeight; } else line = test; }); if (line) text(line, x, lineY, size, color); }
function drawEnemyIntel(c) {
  rect(462, 130, 360, 205, '#fffaf0', '#d4a15e', 12, 2); text('Enemy Intelligence', 482, 148, 18);
  c.enemyComposition.forEach((id, i) => { const e = enemyDef(id); const x = 482 + (i % 2) * 165; const y = 184 + Math.floor(i / 2) * 52; rect(x, y, 150, 42, e.color, '#4b2a14', 8, 1); text(`${e.icon} ${e.name}`, x + 8, y + 6, 13); text(`HP${e.hp} ATK${e.attack} ${e.row}`, x + 8, y + 23, 11); });
  if (gameState.upgrades.info > 0) { const p = contractPrediction(); text(`Prediction: Win ${p.chance}% / Expected casualties ${p.expectedDead} / ${p.note}`, 482, 302, 13, p.chance >= 60 ? CONFIG.ui.green : CONFIG.ui.red); }
}
function drawFormationBoard() {
  rect(462, 354, 360, 345, '#fffaf0', '#d4a15e', 12, 2); text('Formation Board', 482, 374, 18);
  ['front', 'back'].forEach((row, r) => { text(row === 'front' ? 'Frontline' : 'Backline', 482, 416 + r * 105, 15, CONFIG.ui.muted); for (let slot = 0; slot < 3; slot += 1) { const x = 580 + slot * 72; const y = 404 + r * 105; const u = gameState.personnel.find((p) => p.row === row && p.slot === slot); rect(x, y, 64, 72, u ? species(u.species).color : '#ead7b7', gameState.selectedUnitId && !u ? CONFIG.ui.blue : '#8b6b45', 10, 2); if (u) { text(species(u.species).icon, x + 32, y + 10, 16, '#1d170f', 'center'); text(`${finalWage(u)}G`, x + 32, y + 34, 12, specializationPremium(u) ? CONFIG.ui.red : '#1d170f', 'center'); text(`+${specializationPremium(u)}V ${u.fatigue}F`, x + 32, y + 52, 10, '#1d170f', 'center'); } else text('+', x + 32, y + 22, 28, CONFIG.ui.muted, 'center'); gameState.input.slots.push({ x, y, w: 64, h: 72, action: { type: 'slot', row, slot }, enabled: Boolean(gameState.selectedUnitId) }); } });
  const p = contractPrediction(); rect(488, 615, 285, 68, '#fff4d6', p.projectedProfit >= 0 ? CONFIG.ui.green : CONFIG.ui.red, 10, 2); text(`Decision: Labor ${laborCost()} / Budget ${activeContract().laborBudget}`, 508, 628, 15); text(`Projected with expected loss: ${p.projectedProfit}G`, 508, 654, 16, p.projectedProfit >= 0 ? CONFIG.ui.green : CONFIG.ui.red);
  button('控えへ', 482, 710, 100, 34, { type: 'bench' }, Boolean(gameState.selectedUnitId));
  button('派遣開始', 642, 710, 150, 34, { type: 'battle' }, deployedPersonnel().length > 0);
}
function drawRoster() {
  rect(850, 130, 370, 570, '#fffaf0', '#d4a15e', 12, 2); text('Available / Injured / Exhausted Personnel', 872, 148, 17);
  const sorted = livingPersonnel().slice().sort((a, b) => (isAvailable(b) - isAvailable(a)) || finalWage(a) - finalWage(b) || a.fatigue - b.fatigue);
  sorted.slice(0, 7).forEach((u, i) => { const y = 184 + i * 68; drawUnitCard(u, 872, y, 318, 60, gameState.selectedUnitId === u.id); gameState.input.cards.push({ x: 872, y, w: 318, h: 60, action: { type: 'selectUnit', id: u.id }, enabled: isAvailable(u) }); });
  const available = livingPersonnel().filter(isAvailable).length; const injured = livingPersonnel().filter((u) => u.injuryContractsRemaining > 0).length; const exhausted = livingPersonnel().filter((u) => u.injuryContractsRemaining <= 0 && u.fatigue >= CONFIG.personnel.fatigueUnavailableAt).length;
  text(`Available ${available} / Injured ${injured} / Exhausted ${exhausted}`, 872, 668, 15, CONFIG.ui.purple);
}
function drawUnitCard(u, x, y, w, h, selected = false) { const s = species(u.species); const premium = specializationPremium(u); const labels = specializationLabels(u); rect(x, y, w, h, selected ? '#fff0a8' : (isAvailable(u) ? '#fffaf0' : '#e5d4bf'), selected ? CONFIG.ui.blue : (isAvailable(u) ? '#bd965d' : CONFIG.ui.red), 10, selected ? 3 : 1); text(`${s.icon} ${u.name}`, x + 10, y + 7, 14); text(`${s.name} / ${s.role}`, x + w - 10, y + 8, 11, CONFIG.ui.muted, 'right'); text(`Base ${baseWage(u)}G + Premium ${premium}G = Final ${finalWage(u)}G`, x + 10, y + 25, 12, premium > 0 ? CONFIG.ui.red : CONFIG.ui.muted); text(`Fatigue ${u.fatigue}  ${fatigueStatus(u)}  Tags: ${labels.length ? labels.slice(0, 2).join(' / ') : 'なし'}`, x + 10, y + 42, 11, u.fatigue >= CONFIG.personnel.fatigueWarnAt || u.injuryContractsRemaining > 0 ? CONFIG.ui.red : CONFIG.ui.muted); }
function drawBattleToken(u) { const ally = u.unitType === 'monster'; const baseX = ally ? (u.row === 'front' ? 330 : 170) : (u.row === 'front' ? 740 : 965); const y = (u.row === 'front' ? 245 : 470) + (u.slot || 0) * 55; const x = baseX + (u.attackAnimMs ? (ally ? 12 : -12) : 0); rect(x, y, 132, 48, u.alive ? u.color : '#927267', u.lastHitMs ? CONFIG.ui.red : '#3b2517', 10, u.lastHitMs ? 4 : 2); text(u.icon, x + 12, y + 8, 14); text(u.name, x + 66, y + 8, 12, '#1c180f', 'center'); hpBar(u, x + 12, y + 34, 108); }
function drawBattle() { panel('Battle Screen - Auto Battle Only', 24, 78, 1232, 690, CONFIG.ui.red); const b = gameState.battle; text('自動戦闘中：HPバー、ダメージ、損耗、特性発動を観察します。操作介入はありません。', 54, 126, 18); text(`Time ${Math.floor((b?.timeMs || 0) / 1000)}s`, 1100, 126, 20, CONFIG.ui.gold); rect(54, 170, 1178, 488, gradient(54, 170, 1178, 488, '#9bd374', '#c9965d'), '#5f4328', 18, 4); text('DISPATCHED MONSTERS', 250, 188, 22, CONFIG.ui.blue, 'center'); text('CONTRACT ENEMIES', 910, 188, 22, CONFIG.ui.red, 'center'); [...(b?.allies || []), ...(b?.enemies || [])].forEach(drawBattleToken); rect(54, 680, 1178, 52, CONFIG.ui.dark, '#8a5a2b', 12, 2); (b?.log || []).slice(0, 3).forEach((line, i) => text(line, 76, 690 + i * 15, 13, '#fff7df')); }
function drawResult() {
  const r = gameState.report; const e = gameState.economy; panel('Result Screen', 24, 112, 1232, 650, CONFIG.ui.green); if (!r || !e) return;
  text(r.victory ? 'Contract Success' : 'Contract Failure', 64, 164, 34, r.victory ? CONFIG.ui.green : CONFIG.ui.red);
  text(`Base Reward: ${e.reward}G`, 76, 230, 22, CONFIG.ui.gold);
  text(`Bonus Reward: ${e.bonusReward}G (${e.bonusAchieved ? '達成' : '未達'})`, 76, 268, 20, CONFIG.ui.purple);
  text(`Labor Cost: -${e.laborCost}G`, 76, 306, 20, CONFIG.ui.red);
  text(`Replacement Cost: -${e.replacementCosts}G`, 76, 344, 20, CONFIG.ui.red);
  text(`Profit: ${e.profit >= 0 ? '+' : ''}${e.profit}G`, 76, 388, 30, e.profit >= 0 ? CONFIG.ui.green : CONFIG.ui.red);
  text(`Reputation Gain: +${e.reputationGain} (Veteran +${e.veteranRepBonus || 0})`, 76, 436, 22, CONFIG.ui.purple);
  text(`Grade: ${r.grade}`, 76, 476, 24, CONFIG.ui.gold);
  text(`MVP: ${r.mvpName}`, 76, 520, 20);
  text(`Casualties: ${r.dead.length ? r.dead.join(' / ') : 'なし'}`, 520, 180, 18, CONFIG.ui.red);
  text(`Injuries: ${r.injured.length ? r.injured.join(' / ') : 'なし'}`, 520, 220, 18, CONFIG.ui.red);
  if (r.scoutResult) text(`Scout Contract Result: ${r.scoutResult}`, 520, 260, 18, CONFIG.ui.purple);
  if (gameState.message) wrapText(gameState.message, 520, 292, 620, 22, 17, CONFIG.ui.green);
  panel('Specialization Growth / Wage Changes', 500, 330, 680, 118, CONFIG.ui.purple);
  if (r.specializationResults?.length) r.specializationResults.slice(0, 4).forEach((g, i) => { const tags = g.gainedTags.length ? formatSpecializationList(g.gainedTags) : '新規タグなし'; text(`${g.unitName}: ${tags} / Wage ${g.oldWage}G -> ${g.newWage}G / MVP ${g.oldMvp}->${g.newMvp}`, 526, 370 + i * 22, 13, g.gainedTags.length ? CONFIG.ui.red : CONFIG.ui.muted); });
  else text('新規専門化なし。履歴だけが蓄積されました。', 526, 370, 14, CONFIG.ui.muted);
  panel('Employee Business History', 500, 470, 680, 120, CONFIG.ui.blue);
  livingPersonnel().slice(0, 4).forEach((u, i) => text(`${u.name}: Dispatch ${u.dispatchCount}, Kills ${u.kills}, Survival ${u.survivalCount}, MVP ${u.mvpCount}, Wage ${finalWage(u)}G, Tags ${specializationLabels(u).length ? specializationLabels(u).join('/') : 'なし'}`, 526, 506 + i * 22, 13));
  button('次の契約へ', 990, 690, 160, 38, { type: 'continue' }, true);
}
function drawCompany() {
  panel('Company Screen', 24, 82, 1232, 680, CONFIG.ui.purple);
  const rank = rankInfo(); text(`Reputation Rank: ${rank.rank} (${gameState.reputation} rep)`, 64, 135, 26, CONFIG.ui.purple); text(`Unlock: ${rank.unlock}`, 64, 170, 16); text(`Gold: ${gameState.gold}G   Total Profit: ${gameState.totalProfit}G`, 64, 202, 20, CONFIG.ui.gold); text(`Unlocked Species: ${gameState.unlockedSpecies.map((id) => species(id).name).join(' / ')}`, 64, 236, 18, CONFIG.ui.green);
  rect(56, 278, 560, 240, '#fffaf0', '#d4a15e', 12, 2); text('Personnel List', 76, 296, 18); livingPersonnel().slice(0, 7).forEach((u, i) => text(`${u.name} | Base ${baseWage(u)}G + Vet ${specializationPremium(u)}G = ${finalWage(u)}G | Fatigue ${u.fatigue} | Tags ${specializationLabels(u).length ? specializationLabels(u).join('/') : 'なし'}`, 76, 330 + i * 27, 13));
  rect(650, 130, 540, 230, '#fffaf0', '#d4a15e', 12, 2); text('New Personnel Candidates (no hiring fee; wage applies on dispatch)', 670, 148, 16); gameState.candidates.slice(0, 5).forEach((u, i) => { const y = 182 + i * 36; text(`${u.name} / ${species(u.species).role} / Base ${baseWage(u)}G Final ${finalWage(u)}G / Tags ${specializationLabels(u).length ? specializationLabels(u).join('/') : 'なし'}`, 672, y, 13); button('登録', 1088, y - 4, 72, 28, { type: 'hire', id: u.id }, true); });
  rect(650, 390, 540, 220, '#fffaf0', '#d4a15e', 12, 2); text('Company Upgrades (options only; no combat power)', 670, 408, 17); CONFIG.upgrades.forEach((up, i) => { const lv = gameState.upgrades[up.id]; const cost = up.cost * (lv + 1); const y = 442 + i * 45; text(`${up.name} Lv${lv}/${up.max} - ${up.description}`, 670, y, 13); button(lv >= up.max ? 'MAX' : `${cost}G`, 1088, y - 4, 72, 28, { type: 'upgrade', id: up.id }, lv < up.max && gameState.gold >= cost); });
  const injured = livingPersonnel().filter((u) => u.injuryContractsRemaining > 0).map((u) => u.name); const exhausted = livingPersonnel().filter((u) => u.fatigue >= CONFIG.personnel.fatigueUnavailableAt).map((u) => u.name);
  text(`Injured Personnel: ${injured.length ? injured.join(' / ') : 'なし'}`, 64, 555, 16, CONFIG.ui.red); text(`Exhausted Personnel: ${exhausted.length ? exhausted.join(' / ') : 'なし'}`, 64, 585, 16, CONFIG.ui.red); text('信用は高Tier契約・希少種・優良クライアントを開きます。戦闘ステータスは増えません。', 64, 640, 17, CONFIG.ui.purple);
}
function render() {
  if (!ctx) return; gameState.input.buttons = []; gameState.input.cards = []; gameState.input.slots = [];
  ctx.clearRect(0, 0, CONFIG.canvas.width, CONFIG.canvas.height); ctx.fillStyle = gradient(0, 0, 1280, 820, '#9ed8f6', '#f4cf92'); ctx.fillRect(0, 0, 1280, 820); rect(14, 70, 1252, 718, 'rgba(255,246,223,0.32)', 'rgba(138,90,43,0.28)', 18, 2);
  if (gameState.phase === 'start') { drawStart(); return; }
  if (gameState.mode === 'battle') { drawBattle(); return; }
  drawHeader();
  if (gameState.mode === 'contractSelect') drawContracts();
  else if (gameState.mode === 'preparation') drawPreparation();
  else if (gameState.mode === 'result') drawResult();
  else if (gameState.mode === 'company') drawCompany();
}
function queueCanvasAction(event) { const b = canvas.getBoundingClientRect(); const x = (event.clientX - b.left) * (CONFIG.canvas.width / Math.max(1, b.width)); const y = (event.clientY - b.top) * (CONFIG.canvas.height / Math.max(1, b.height)); for (const pool of [gameState.input.buttons, gameState.input.cards, gameState.input.slots]) { const hit = pool.find((i) => i.enabled !== false && x >= i.x && x <= i.x + i.w && y >= i.y && y <= i.y + i.h); if (hit) { gameState.input.actions.push(hit.action); return; } } }
function trackMouse(event) { const b = canvas.getBoundingClientRect(); gameState.input.mouse.x = (event.clientX - b.left) * (CONFIG.canvas.width / Math.max(1, b.width)); gameState.input.mouse.y = (event.clientY - b.top) * (CONFIG.canvas.height / Math.max(1, b.height)); }

resetGame();
let last = performance.now();
function loop(now) { const delta = Math.min(100, now - last); last = now; update(delta); render(); requestAnimationFrame(loop); }
if (canvas) { canvas.width = CONFIG.canvas.width; canvas.height = CONFIG.canvas.height; canvas.addEventListener('click', queueCanvasAction); canvas.addEventListener('mousemove', trackMouse); requestAnimationFrame(loop); }
