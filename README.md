# Demon Army Dispatch Center

A browser-based fantasy recruitment agency game where the player runs a monster staffing company for the Demon King's Army.

The player is not a battlefield commander. The player is a recruitment and dispatch manager who chooses contracts, studies fully visible enemy intelligence, hires the right monster individuals, deploys a formation, and reviews whether the contract was profitable.

## Design Pillars

1. **Enemy Intelligence** - all enemy information is visible before deployment.
2. **Recruitment** - the core decision is selecting the correct personnel for the contract.
3. **Contracts** - every automatic battle starts from a contract offer with reward, risk, enemy composition, bonus objective, and recommended counter.
4. **Profit** - a win can still be bad business if replacement costs erase revenue.
5. **Reputation** - profitable, low-casualty, bonus-completing work raises company rank from E to S.

## Removed Systems

The game has no unit fusion, merges, leveling, skill trees, or permanent stat growth. Orc + Orc never becomes Captain, and Dragon + Dragon never becomes Elder Dragon. Monsters remain individuals with histories, not collectible upgrade materials.

## Monster Individuals

Every hired monster receives an individual identity, such as `オーク #035` or `ゴブリン #118`, and tracks:

- dispatch count
- kills
- survival rate
- total profit contribution
- fatigue
- temporary injury status

These records create attachment and staffing context, but never increase combat stats.

## Current Core Loop

1. Select one of the available contracts.
2. Read enemy intelligence, risk, bonus objective, and recommended counter.
3. Hire from the applicant market.
4. Place available monsters into frontline/backline formation.
5. Watch the fully automatic battle.
6. Review success, reward, bonus reward, replacement costs, profit, reputation gain, grade, MVP employee, casualties, injuries, and employee histories.
7. Invest profit into company growth that increases options only.

## Company Growth

Allowed upgrades improve decisions rather than combat power:

- Recruitment Advertising: more applicant slots.
- Information Department: better enemy analysis text.
- Contract Office: more contract choices.
- Scout Network: improved rare applicant availability.

## Win Condition

Reach company rank A or complete the Hero Elimination Contract.
