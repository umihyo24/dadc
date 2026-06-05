# Demon Army Dispatch Center

A browser-based contract dispatch management game where the player runs a monster staffing company for the Demon King's Army.

The player does **not** build the strongest army. The core question is:

> Who should I dispatch for this contract, and how cheaply can I complete it?

## Core Decisions

Each contract asks the player to balance:

- contract budget
- enemy composition
- monster wage / labor cost
- expected casualties and replacement costs
- short-term profit
- long-term reputation
- bonus objectives

Winning is not enough. A successful contract can still be bad business if the dispatched team was too expensive.

## Contract Types

- **Commercial Contract**: high profit, low reputation.
- **Military Contract**: medium profit, medium reputation.
- **Honor Contract**: low or even negative profit, high reputation.
- **Scout Contract**: low profit, unlocks or expands monster personnel.

Scout contracts use the same automatic battle system as every other contract. They are not a separate exploration mode.

## Profit vs. Reputation

Profit is short-term business health.

Reputation is long-term access to better clients, higher-tier contracts, rare species, and scout opportunities.

```text
profit = baseReward + bonusReward - laborCost - replacementCosts
```

Reputation never increases combat stats.

## Monster Personnel

Monsters are company personnel, not fusion materials. Multiple individuals of the same species can exist, such as:

- Orc #004
- Orc #005
- Goblin #001
- Dragon #012

Each individual tracks wage, fatigue, injury recovery time, dispatch count, kills, survival count, MVP count, and total profit contribution. These records create attachment and business history, but never increase combat stats.

## Removed Systems

The game has no:

- fusion or merging
- leveling
- skill trees
- permanent attack upgrades
- permanent HP upgrades
- random absence
- permanent death

## Availability, Fatigue, and Injury

There is no random absence. A monster is unavailable only when exhausted or temporarily injured.

- Deployment increases fatigue.
- Benched personnel recover fatigue after each contract.
- High fatigue shows a warning.
- Fatigue at the limit makes the monster unavailable until recovered.
- Low-HP survivors and downed personnel can become injured for several contracts.
- Injuries recover automatically.

## Company Growth

Company upgrades improve options, not combat power:

- Recruitment Advertising: increases new personnel candidates.
- Contract Desk: increases contract choices.
- Information Department: improves enemy intelligence and prediction.
- Scout Network: increases scout contract appearance and rare species access.

## Screen Flow

```text
gameState.mode = "contractSelect" | "preparation" | "battle" | "result" | "company"
```

1. Select a contract.
2. Review enemy intelligence and budget pressure.
3. Assign available personnel to the formation board.
4. Watch the automatic battle.
5. Review profit, reputation, injuries, fatigue, MVP, and personnel history.
6. Manage company upgrades and personnel candidates.
