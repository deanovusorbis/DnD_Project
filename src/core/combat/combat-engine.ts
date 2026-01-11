/**
 * D&D Experiential Learning Platform - Combat Engine
 * Turn-based combat simulation with full 5E rules
 */

import {
	AbilityName, ConditionType, DamageType,
	CombatAction, ActionType
} from '@dnd/types/index';
import { rollD20, rollDice } from '@engine/core/dice';
import {
	resolveAttack,
	RuleContext, getConditionInfo
} from '@core/rules';

// ============================================================================
// COMBAT TYPES
// ============================================================================

export interface Combatant {
	id: string;
	name: string;
	type: 'player' | 'ally' | 'enemy' | 'neutral';

	// Stats
	armorClass: number;
	maxHitPoints: number;
	currentHitPoints: number;
	temporaryHitPoints: number;

	// Abilities
	abilityModifiers: Record<AbilityName, number>;
	proficiencyBonus: number;
	proficientSaves: AbilityName[];

	// Combat
	initiativeModifier: number;
	initiative?: number;
	speed: number;
	movementRemaining: number;

	// Actions
	actions: CombatAction[];
	hasAction: boolean;
	hasBonusAction: boolean;
	hasReaction: boolean;

	// Conditions
	conditions: {
		condition: ConditionType;
		duration?: number;
		source: string
	}[];

	// Position (for grid combat)
	position?: { x: number; y: number };

	// Death saves (for players)
	deathSaves?: {
		successes: number;
		failures: number;
	};

	// Concentration
	concentratingOn?: string;
}

export interface CombatState {
	id: string;
	round: number;
	turnIndex: number;
	phase: 'pre_combat' | 'rolling_initiative' | 'in_combat' | 'post_combat';

	combatants: Combatant[];
	turnOrder: string[]; // Combatant IDs in initiative order

	currentCombatantId?: string;

	// History
	log: CombatLogEntry[];

	// Settings
	settings: CombatSettings;
}

export interface CombatSettings {
	autoRollNPCInitiative: boolean;
	autoRollNPCAttacks: boolean;
	showEnemyHP: boolean;
	showEnemyAC: boolean;
	gridCombat: boolean;
	gridSize?: { width: number; height: number };
}

export interface CombatLogEntry {
	id: string;
	round: number;
	timestamp: Date;
	actorId: string;
	actorName: string;
	type: 'attack' | 'damage' | 'heal' | 'save' | 'condition' | 'death' | 'movement' | 'action' | 'info';
	message: string;
	details?: {
		roll?: number;
		total?: number;
		target?: string;
		damage?: number;
		damageType?: DamageType;
		success?: boolean;
	};
	isTeachingMoment?: boolean;
	teachingContent?: string;
}

// ============================================================================
// COMBAT MANAGER
// ============================================================================

let combatIdCounter = 0;
let logIdCounter = 0;

/**
 * Create a new combat encounter
 */
export function createCombat(
	combatants: Combatant[],
	settings: Partial<CombatSettings> = {}
): CombatState {
	return {
		id: `combat-${++combatIdCounter}`,
		round: 0,
		turnIndex: 0,
		phase: 'pre_combat',
		combatants: combatants.map(c => ({
			...c,
			hasAction: true,
			hasBonusAction: true,
			hasReaction: true,
			movementRemaining: c.speed,
			conditions: c.conditions || []
		})),
		turnOrder: [],
		log: [],
		settings: {
			autoRollNPCInitiative: true,
			autoRollNPCAttacks: true,
			showEnemyHP: false,
			showEnemyAC: false,
			gridCombat: false,
			...settings
		}
	};
}

/**
 * Add a log entry
 */
function addLog(
	combat: CombatState,
	entry: Omit<CombatLogEntry, 'id' | 'timestamp'>
): CombatState {
	return {
		...combat,
		log: [
			...combat.log,
			{
				...entry,
				id: `log-${++logIdCounter}`,
				timestamp: new Date()
			}
		]
	};
}

// ============================================================================
// INITIATIVE
// ============================================================================

export interface InitiativeRoll {
	combatantId: string;
	roll: number;
	modifier: number;
	total: number;
}

/**
 * Roll initiative for a combatant
 */
export function rollInitiative(combatant: Combatant): InitiativeRoll {
	const roll = rollD20('normal', combatant.initiativeModifier);
	return {
		combatantId: combatant.id,
		roll: roll.rolls[0] ?? 0,
		modifier: combatant.initiativeModifier,
		total: roll.total
	};
}

/**
 * Roll initiative for all combatants and set turn order
 */
export function rollAllInitiative(combat: CombatState): {
	combat: CombatState;
	rolls: InitiativeRoll[];
} {
	const rolls: InitiativeRoll[] = [];
	let updatedCombatants = [...combat.combatants];

	for (let i = 0; i < updatedCombatants.length; i++) {
		const combatant = updatedCombatants[i];
		if (!combatant) continue;

		// Skip if already has initiative set (player may have rolled manually)
		if (combatant.initiative !== undefined) {
			rolls.push({
				combatantId: combatant.id,
				roll: combatant.initiative - combatant.initiativeModifier,
				modifier: combatant.initiativeModifier,
				total: combatant.initiative
			});
			continue;
		}

		const roll = rollInitiative(combatant);
		rolls.push(roll);
		updatedCombatants[i] = {
			...combatant,
			initiative: roll.total
		};
	}

	// Sort by initiative (highest first), with DEX as tiebreaker
	const sorted = [...updatedCombatants].sort((a, b) => {
		if (b.initiative! !== a.initiative!) {
			return b.initiative! - a.initiative!;
		}
		return b.abilityModifiers.DEX - a.abilityModifiers.DEX;
	});

	const turnOrder = sorted.map(c => c.id);

	let updatedCombat: CombatState = {
		...combat,
		combatants: updatedCombatants,
		turnOrder,
		phase: 'in_combat',
		round: 1,
		turnIndex: 0,
		currentCombatantId: turnOrder[0]
	};

	// Add log entries
	for (const roll of rolls) {
		const combatant = updatedCombatants.find(c => c && c.id === roll.combatantId);
		if (!combatant) continue;

		updatedCombat = addLog(updatedCombat, {
			round: 0,
			actorId: roll.combatantId,
			actorName: combatant.name,
			type: 'info',
			message: `${combatant.name} initiative: ${roll.total} (${roll.roll} + ${roll.modifier})`,
			details: { roll: roll.roll, total: roll.total }
		});
	}

	updatedCombat = addLog(updatedCombat, {
		round: 1,
		actorId: 'system',
		actorName: 'System',
		type: 'info',
		message: `Savaş başladı! Round 1. İlk hareket: ${sorted[0]?.name ?? 'Unknown'}`,
		isTeachingMoment: true,
		teachingContent: 'Initiative savaşın başında atılır ve tüm savaş boyunca sıralamayı belirler.'
	});

	return { combat: updatedCombat, rolls };
}

/**
 * Set a combatant's initiative manually
 */
export function setInitiative(
	combat: CombatState,
	combatantId: string,
	initiative: number
): CombatState {
	const combatants = combat.combatants.map(c =>
		c.id === combatantId ? { ...c, initiative } : c
	);
	return { ...combat, combatants };
}

// ============================================================================
// TURN MANAGEMENT
// ============================================================================

/**
 * Get the current combatant
 */
export function getCurrentCombatant(combat: CombatState): Combatant | undefined {
	if (!combat.currentCombatantId) return undefined;
	return combat.combatants.find(c => c.id === combat.currentCombatantId);
}

/**
 * Start a combatant's turn
 */
export function startTurn(combat: CombatState): CombatState {
	const current = getCurrentCombatant(combat);
	if (!current) return combat;

	// Reset action economy
	const combatants = combat.combatants.map(c =>
		c.id === current.id
			? {
				...c,
				hasAction: true,
				hasBonusAction: true,
				movementRemaining: c.speed
			}
			: c
	);

	let updated: CombatState = { ...combat, combatants };

	// Process start-of-turn effects
	for (const condition of current.conditions) {
		// Some conditions have start-of-turn effects
		if (condition.condition === 'prone') {
			updated = addLog(updated, {
				round: combat.round,
				actorId: current.id,
				actorName: current.name,
				type: 'info',
				message: `${current.name} yere yatık durumda. Kalkmak hızının yarısını harcar.`
			});
		}
	}

	updated = addLog(updated, {
		round: combat.round,
		actorId: current.id,
		actorName: current.name,
		type: 'info',
		message: `${current.name}'in sırası!`
	});

	return updated;
}

/**
 * End the current turn and move to next combatant
 */
export function endTurn(combat: CombatState): CombatState {
	const current = getCurrentCombatant(combat);
	if (!current) return combat;

	// Process end-of-turn condition durations
	let combatants = combat.combatants.map(c => {
		if (c.id !== current.id) return c;

		const updatedConditions = c.conditions
			.map(cond => ({
				...cond,
				duration: cond.duration !== undefined ? cond.duration - 1 : undefined
			}))
			.filter(cond => cond.duration === undefined || cond.duration > 0);

		return { ...c, conditions: updatedConditions };
	});

	// Move to next turn
	let nextIndex = combat.turnIndex + 1;
	let nextRound = combat.round;

	if (nextIndex >= combat.turnOrder.length) {
		nextIndex = 0;
		nextRound++;
	}

	const nextCombatantId = combat.turnOrder[nextIndex];

	let updated: CombatState = {
		...combat,
		combatants,
		turnIndex: nextIndex,
		round: nextRound,
		currentCombatantId: nextCombatantId
	};

	if (nextRound > combat.round) {
		updated = addLog(updated, {
			round: nextRound,
			actorId: 'system',
			actorName: 'System',
			type: 'info',
			message: `Round ${nextRound} başladı!`
		});
	}

	return startTurn(updated);
}

// ============================================================================
// COMBAT ACTIONS
// ============================================================================

export interface AttackResult {
	hit: boolean;
	critical: boolean;
	attackRoll: number;
	attackTotal: number;
	targetAC: number;
	damage?: number;
	damageType?: DamageType;
	damageRolls?: number[];
}

/**
 * Make an attack against a target
 */
export function makeAttack(
	combat: CombatState,
	attackerId: string,
	targetId: string,
	action: CombatAction,
	options: {
		advantageSource?: string;
		disadvantageSource?: string;
	} = {}
): { combat: CombatState; result: AttackResult } {
	const attacker = combat.combatants.find(c => c.id === attackerId);
	const target = combat.combatants.find(c => c.id === targetId);

	if (!attacker || !target) {
		throw new Error('Invalid attacker or target');
	}

	// Build rule context
	// Build rule context
	const context: RuleContext = {
		actorModifiers: attacker.abilityModifiers,
		actorProficiencies: {
			skills: [],
			savingThrows: attacker.proficientSaves
		},
		actorProficiencyBonus: attacker.proficiencyBonus,
		actorConditions: attacker.conditions.map(c => c.condition),
		targetAC: target.armorClass,
		targetConditions: target.conditions.map(c => c.condition),
		advantageSources: options.advantageSource ? [options.advantageSource] : [],
		disadvantageSources: options.disadvantageSource ? [options.disadvantageSource] : []
	};

	// Resolve attack
	const attackResult = resolveAttack({
		attackBonus: action.attackBonus || 0,
		context,
		isMelee: action.range?.normal === 5 || !action.range
	});

	let result: AttackResult = {
		hit: attackResult.hits,
		critical: attackResult.isCritical,
		attackRoll: attackResult.attack.d20Roll,
		attackTotal: attackResult.attack.total,
		targetAC: attackResult.effectiveAC
	};

	let updated = combat;

	// Log the attack roll
	updated = addLog(updated, {
		round: combat.round,
		actorId: attackerId,
		actorName: attacker.name,
		type: 'attack',
		message: `${attacker.name} ${target.name}'a ${action.name} ile saldırıyor: ${attackResult.attack.total} vs AC ${attackResult.effectiveAC}${attackResult.hits ? ' - İSABET!' : ' - Iskaladı'}${attackResult.isCritical ? ' KRİTİK!' : ''}`,
		details: {
			roll: attackResult.attack.d20Roll,
			total: attackResult.attack.total,
			target: target.name,
			success: attackResult.hits
		},
		isTeachingMoment: true,
		teachingContent: `Saldırı atışı: d20 (${attackResult.attack.d20Roll}) + saldırı bonusu (${action.attackBonus || 0}) = ${attackResult.attack.total}. Hedefin AC'si (${target.armorClass})'i ${attackResult.hits ? 'geçtiniz!' : 'geçemediniz.'}`
	});

	// Roll damage if hit
	if (attackResult.hits && action.damage) {
		let totalDamage = 0;
		const allRolls: number[] = [];

		for (const damageDice of action.damage) {
			// const damageType = effect.amount.type;
			const diceCount = attackResult.isCritical ? damageDice.count * 2 : damageDice.count;
			const damageRoll = rollDice({ ...damageDice, count: diceCount });
			totalDamage += damageRoll.total;
			allRolls.push(...damageRoll.rolls);
		}

		result.damage = totalDamage;

		result.damageRolls = allRolls;

		// Apply damage
		updated = applyDamage(updated, targetId, totalDamage, action.damageType || 'bludgeoning');

		updated = addLog(updated, {
			round: combat.round,
			actorId: attackerId,
			actorName: attacker.name,
			type: 'damage',
			message: `${target.name} ${totalDamage} ${action.damageType || 'bludgeoning'} hasarı aldı!${attackResult.isCritical ? ' (Kritik - zarlar iki katı!)' : ''}`,
			details: {
				damage: totalDamage,
				damageType: action.damageType,
				target: target.name
			}
		});
	}

	// Consume action
	updated = consumeAction(updated, attackerId, action.actionType);

	return { combat: updated, result };
}

/**
 * Apply damage to a combatant
 */
export function applyDamage(
	combat: CombatState,
	targetId: string,
	amount: number,
	_damageType: DamageType
): CombatState {
	const combatants = combat.combatants.map(c => {
		if (c.id !== targetId) return c;

		let remaining = amount;
		let tempHP = c.temporaryHitPoints;
		let currentHP = c.currentHitPoints;

		// Temporary HP absorbs damage first
		if (tempHP > 0) {
			if (tempHP >= remaining) {
				tempHP -= remaining;
				remaining = 0;
			} else {
				remaining -= tempHP;
				tempHP = 0;
			}
		}

		// Apply remaining to current HP
		currentHP = Math.max(0, currentHP - remaining);

		return {
			...c,
			currentHitPoints: currentHP,
			temporaryHitPoints: tempHP
		};
	});

	let updated: CombatState = { ...combat, combatants };

	// Check for unconscious/death
	// const action = combatant.actions.find(a => a.id === actionId);
	const target = combatants.find(c => c.id === targetId);
	if (target && target.currentHitPoints === 0) {
		if (target.type === 'player') {
			// Player falls unconscious, starts death saves
			updated = addCondition(updated, targetId, 'unconscious', 'Dropped to 0 HP');
			updated = addLog(updated, {
				round: combat.round,
				actorId: targetId,
				actorName: target.name,
				type: 'death',
				message: `${target.name} bilincini kaybetti ve ölüm kurtulma atışlarına başlıyor!`,
				isTeachingMoment: true,
				teachingContent: 'HP 0\'a düştüğünde bilincini kaybedersin. Her turunun başında d20 atarsın: 10+ = başarı, 9- = başarısızlık. 3 başarı = stabilize, 3 başarısızlık = ölüm.'
			});
		} else {
			// NPCs/monsters die at 0
			updated = addLog(updated, {
				round: combat.round,
				actorId: targetId,
				actorName: target.name,
				type: 'death',
				message: `${target.name} öldü!`
			});
		}
	}

	return updated;
}

/**
 * Heal a combatant
 */
export function applyHealing(
	combat: CombatState,
	targetId: string,
	amount: number
): CombatState {
	const combatants = combat.combatants.map(c => {
		if (c.id !== targetId) return c;

		const newHP = Math.min(c.maxHitPoints, c.currentHitPoints + amount);

		// If was at 0, remove unconscious
		let conditions = c.conditions;
		if (c.currentHitPoints === 0 && newHP > 0) {
			conditions = conditions.filter(cond => cond.condition !== 'unconscious');
		}

		return {
			...c,
			currentHitPoints: newHP,
			conditions,
			deathSaves: newHP > 0 ? undefined : c.deathSaves
		};
	});

	return { ...combat, combatants };
}

/**
 * Consume an action type
 */
export function consumeAction(
	combat: CombatState,
	combatantId: string,
	actionType: ActionType
): CombatState {
	const combatants = combat.combatants.map(c => {
		if (c.id !== combatantId) return c;

		switch (actionType) {
			case 'action':
				return { ...c, hasAction: false };
			case 'bonus_action':
				return { ...c, hasBonusAction: false };
			case 'reaction':
				return { ...c, hasReaction: false };
			default:
				return c;
		}
	});

	return { ...combat, combatants };
}

// ============================================================================
// CONDITIONS
// ============================================================================

/**
 * Add a condition to a combatant
 */
export function addCondition(
	combat: CombatState,
	combatantId: string,
	condition: ConditionType,
	source: string,
	duration?: number
): CombatState {
	const combatants = combat.combatants.map(c => {
		if (c.id !== combatantId) return c;

		// Don't add duplicate conditions
		if (c.conditions.some(cond => cond.condition === condition)) {
			return c;
		}

		return {
			...c,
			conditions: [...c.conditions, { condition, source, duration }]
		};
	});

	const target = combatants.find(c => c.id === combatantId)!;
	let updated: CombatState = { ...combat, combatants };

	updated = addLog(updated, {
		round: combat.round,
		actorId: combatantId,
		actorName: target.name,
		type: 'condition',
		message: `${target.name} şimdi ${condition} durumunda!`,
		isTeachingMoment: true,
		teachingContent: getConditionInfo(condition).explanation
	});

	return updated;
}

/**
 * Remove a condition from a combatant
 */
export function removeCondition(
	combat: CombatState,
	combatantId: string,
	condition: ConditionType
): CombatState {
	const combatants = combat.combatants.map(c => {
		if (c.id !== combatantId) return c;

		return {
			...c,
			conditions: c.conditions.filter(cond => cond.condition !== condition)
		};
	});

	return { ...combat, combatants };
}

// ============================================================================
// DEATH SAVES
// ============================================================================

export interface DeathSaveResult {
	roll: number;
	success: boolean;
	critical: boolean;
	stabilized: boolean;
	died: boolean;
}

/**
 * Make a death saving throw
 */
export function makeDeathSave(
	combat: CombatState,
	combatantId: string
): { combat: CombatState; result: DeathSaveResult } {
	const combatant = combat.combatants.find(c => c.id === combatantId);

	if (!combatant || combatant.currentHitPoints > 0) {
		throw new Error('Combatant is not dying');
	}

	const roll = rollD20('normal', 0);
	const d20 = roll.rolls[0] ?? 0;

	const deathSaves = combatant.deathSaves || { successes: 0, failures: 0 };

	let result: DeathSaveResult = {
		roll: d20,
		success: d20 >= 10,
		critical: d20 === 20 || d20 === 1,
		stabilized: false,
		died: false
	};

	// Natural 20 = regain 1 HP
	if (d20 === 20) {
		const healed = applyHealing(combat, combatantId, 1);
		let updated = addLog(healed, {
			round: combat.round,
			actorId: combatantId,
			actorName: combatant.name,
			type: 'death',
			message: `${combatant.name} doğal 20 attı ve 1 HP ile ayağa kalktı!`
		});
		return { combat: updated, result: { ...result, stabilized: true } };
	}

	// Natural 1 = 2 failures
	const failures = d20 === 1 ? 2 : (d20 < 10 ? 1 : 0);
	const successes = d20 >= 10 && d20 !== 20 ? 1 : 0;

	const newDeathSaves = {
		successes: deathSaves.successes + successes,
		failures: deathSaves.failures + failures
	};

	const combatants = combat.combatants.map(c =>
		c.id === combatantId
			? { ...c, deathSaves: newDeathSaves }
			: c
	);

	let updated: CombatState = { ...combat, combatants };

	// Check for stabilization or death
	if (newDeathSaves.successes >= 3) {
		result.stabilized = true;
		updated = addLog(updated, {
			round: combat.round,
			actorId: combatantId,
			actorName: combatant.name,
			type: 'death',
			message: `${combatant.name} stabilize oldu! 3 başarı.`
		});
	} else if (newDeathSaves.failures >= 3) {
		result.died = true;
		updated = addLog(updated, {
			round: combat.round,
			actorId: combatantId,
			actorName: combatant.name,
			type: 'death',
			message: `${combatant.name} öldü... 3 başarısızlık.`
		});
	} else {
		updated = addLog(updated, {
			round: combat.round,
			actorId: combatantId,
			actorName: combatant.name,
			type: 'death',
			message: `Ölüm kurtulma: ${d20} - ${result.success ? 'Başarı' : 'Başarısızlık'}! (${newDeathSaves.successes}/3 başarı, ${newDeathSaves.failures}/3 başarısızlık)`
		});
	}

	return { combat: updated, result };
}

// ============================================================================
// COMBAT QUERIES
// ============================================================================

/**
 * Check if combat should end
 */
export function checkCombatEnd(combat: CombatState): {
	ended: boolean;
	reason?: 'all_enemies_defeated' | 'all_players_defeated' | 'flee';
	winner?: 'players' | 'enemies' | 'draw';
} {
	const enemies = combat.combatants.filter(c => c.type === 'enemy');
	const players = combat.combatants.filter(c => c.type === 'player' || c.type === 'ally');

	const aliveEnemies = enemies.filter(c => c.currentHitPoints > 0);
	const alivePlayers = players.filter(c => c.currentHitPoints > 0);

	if (aliveEnemies.length === 0 && enemies.length > 0) {
		return { ended: true, reason: 'all_enemies_defeated', winner: 'players' };
	}

	if (alivePlayers.length === 0 && players.length > 0) {
		return { ended: true, reason: 'all_players_defeated', winner: 'enemies' };
	}

	return { ended: false };
}

/**
 * Get available actions for current combatant
 */
export function getAvailableActions(combat: CombatState): CombatAction[] {
	const current = getCurrentCombatant(combat);
	if (!current) return [];

	return current.actions.filter(action => {
		switch (action.actionType) {
			case 'action':
				return current.hasAction;
			case 'bonus_action':
				return current.hasBonusAction;
			case 'reaction':
				return current.hasReaction;
			default:
				return true;
		}
	});
}

/**
 * Get valid targets for an action
 */
export function getValidTargets(
	combat: CombatState,
	attackerId: string,
	_action: CombatAction
): Combatant[] {
	const attacker = combat.combatants.find(c => c.id === attackerId);
	if (!attacker) return [];

	// Simple targeting: enemies for attacks
	return combat.combatants.filter(c => {
		// Can't target self (usually)
		if (c.id === attackerId) return false;

		// Can't target dead
		if (c.currentHitPoints <= 0) return false;

		// For attacks, target enemies
		if (attacker.type === 'player' || attacker.type === 'ally') {
			return c.type === 'enemy';
		} else {
			return c.type === 'player' || c.type === 'ally';
		}
	});
}
