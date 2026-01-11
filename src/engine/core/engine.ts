/**
 * D&D Experiential Learning Platform - Game Engine
 * The central controller for the game loop, orchestrating actions, rules, and pedagogy.
 */

import { GameAction, ActionResult } from './actions';
import { resolveAction, ResolutionContext } from '../rules/resolver';
import { useGameStore } from './store';
import { Actor } from '../../types/actor.types';

export class GameEngine {
	// private isRunning: boolean = false;

	// TODO: Pedagogy Module
	// private pedagogy: PedagogySystem;

	constructor() {
		// Initialize
	}

	/**
	 * Main entry point for any change in the game state driven by a user or system action
	 */
	public async dispatch(action: GameAction): Promise<ActionResult> {
		const store = useGameStore.getState();

		console.log(`[Engine] Dispatching action: ${action.type}`, action);

		// 1. Pedagogy Interception (Pre-Action)
		// e.g. "Wait! You have Disadvantage because..."

		// 2. Build Context
		// We need to gather all relevant actors. 
		// For now, we grab the active character and maybe a dummy target if needed.
		const context: ResolutionContext = {
			actors: new Map<string, Actor>()
		};

		// Add Player
		if (store.campaign.activeCharacter) {
			context.actors.set(store.campaign.activeCharacter.id, store.campaign.activeCharacter);
		}

		// Add Target (if in action)
		// Real implementation would look this up from a "World" or "Encounter" state
		if ('targetId' in action && action.targetId) {
			// Mock finding target
			// context.actors.set(action.targetId, findActor(action.targetId));
		}

		// 3. Resolve Action
		let result: ActionResult;
		try {
			result = resolveAction(action, context);
		} catch (error) {
			console.error("Action resolution failed:", error);
			throw error;
		}

		// 4. Apply Results to State
		this.applyResult(result);

		// 5. Pedagogy Feedback (Post-Action)
		// e.g. "Did you notice that you rolled 2d6?"

		return result;
	}

	private applyResult(result: ActionResult): void {
		// const store = useGameStore.getState();

		// Apply damage, consume resources, etc.

		// This requires the Store to have actions like `damageActor`, `consumeResource`

		console.log(`[Engine] Applying result: ${result.narration}`);

		// Log to console/UI
		// store.addLog(result.narration);
	}
}

export const gameEngine = new GameEngine();
