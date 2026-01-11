/**
 * D&D Experiential Learning Platform - Action Resolver
 * Processes GameActions and generates ActionResults based on SRD rules.
 */

import { Actor } from '../../types/actor.types';
import { GameAction, ActionResult, AttackAction } from '../core/actions';
import { rollD20, rollDamage, parseDiceExpression } from '../core/dice';
import { registry } from '../core/registry';

export interface ResolutionContext {
	actors: Map<string, Actor>;
	// environment?: Environment; 
}

/**
 * Resolves a game action into a result
 */
export function resolveAction(action: GameAction, context: ResolutionContext): ActionResult {
	const actor = context.actors.get(action.actorId);
	if (!actor) {
		throw new Error(`Actor not found: ${action.actorId}`);
	}

	switch (action.type) {
		case 'attack':
			return resolveAttack(action as AttackAction, actor, context);
		// case 'spell':
		//     return resolveSpell(action, actor, context);
		default:
			throw new Error(`Unsupported action type: ${action.type}`);
	}
}

function resolveAttack(action: AttackAction, actor: Actor, context: ResolutionContext): ActionResult {
	const target = action.targetId ? context.actors.get(action.targetId) : undefined;
	const weapon = registry.getWeapon(action.weaponId);

	const weaponName = weapon?.name || action.weaponId || 'unarmed strike';

	// Default narration
	let narration = `${actor.name} attacks`;
	if (target) narration += ` ${target.name}`;
	narration += ` with ${weaponName}.`;

	// 1. Determine ability modifier
	const strMod = actor.stats.modifiers.STR;
	const dexMod = actor.stats.modifiers.DEX;
	const profBonus = actor.stats.proficiencyBonus;

	let modifier = strMod;
	if (weapon?.weaponRange === 'ranged') {
		modifier = dexMod;
	} else if (weapon?.properties.some(p => p.toLowerCase().includes('finesse'))) {
		modifier = Math.max(strMod, dexMod);
	}

	const attackBonus = modifier + profBonus;

	// 1. Roll Attack
	const attackRoll = rollD20('normal', attackBonus);

	const result: ActionResult = {
		success: false,
		action,
		rolls: {
			attack: attackRoll
		},
		outcomes: {
			damage: [],
			effects: []
		},
		narration
	};

	// 2. Check Hit
	if (target) {
		const ac = target.defense.armorClass;
		const isCrit = attackRoll.criticalHit === true;
		const hits = attackRoll.total >= ac || isCrit;

		result.success = hits;

		if (hits) {
			result.narration += ` It hits! (${attackRoll.total} vs AC ${ac})`;

			// 3. Roll Damage
			let diceExpr;
			try {
				diceExpr = parseDiceExpression(weapon?.damage.dice || '1d4');
			} catch {
				diceExpr = { count: 1, die: 'd4' as any, modifier: 0 };
			}

			// Inject ability modifier into expression
			diceExpr.modifier = modifier;

			const damageResult = rollDamage(diceExpr, isCrit, weapon?.damage.type);
			result.rolls.damage = {
				expression: diceExpr,
				rolls: damageResult.rolls,
				total: damageResult.total
			};

			if (isCrit) result.narration += " Critical Hit!";

			result.outcomes.damage?.push({
				amount: damageResult.total,
				type: (damageResult.damageType as any) || 'bludgeoning',
				targetId: target.id
			});

			result.narration += ` Dealing ${damageResult.total} damage.`;
		} else {
			if (attackRoll.criticalMiss) {
				result.narration += ` Critical Miss! (${attackRoll.total})`;
			} else {
				result.narration += ` It misses. (${attackRoll.total} vs AC ${ac})`;
			}
		}
	} else {
		result.narration += ` (No target selected)`;
	}

	return result;
}
