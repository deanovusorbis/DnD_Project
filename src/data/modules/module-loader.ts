/**
 * Module Loader
 * Loads and manages learning module data
 */

import { LearningModule, ModuleCategory } from '../../types/module-types.ts';
import humanModule from './species/human.json';
import introModule from './basics/intro.json';
import abilitiesModule from './basics/abilities.json';
import diceModule from './basics/dice.json';
import combatModule from './basics/combat.json';
import skillsModule from './basics/skills.json';
import magicModule from './basics/magic.json';
import restingModule from './basics/resting.json';
import savingThrowsModule from './basics/saving-throws.json';
import equipmentModule from './basics/equipment.json';
import roleplayModule from './basics/roleplay.json';

class ModuleLoader {
	private modules: Map<string, LearningModule> = new Map();

	constructor() {
		this.loadModules();
	}

	private loadModules(): void {
		// Load species modules
		this.modules.set('human-basics', humanModule as unknown as LearningModule);

		// Load basics modules
		this.modules.set('game-intro', introModule as unknown as LearningModule);
		this.modules.set('basics-abilities', abilitiesModule as unknown as LearningModule);
		this.modules.set('basics-dice', diceModule as unknown as LearningModule);
		this.modules.set('basics-combat', combatModule as unknown as LearningModule);
		this.modules.set('basics-skills', skillsModule as unknown as LearningModule);
		this.modules.set('basics-magic', magicModule as unknown as LearningModule);
		this.modules.set('basics-resting', restingModule as unknown as LearningModule);
		this.modules.set('basics-saving-throws', savingThrowsModule as unknown as LearningModule);
		this.modules.set('basics-equipment', equipmentModule as unknown as LearningModule);
		this.modules.set('basics-roleplay', roleplayModule as unknown as LearningModule);

		// TODO: Add more modules as they are created
		// this.modules.set('elf-basics', elfModule as LearningModule);
		// this.modules.set('dwarf-basics', dwarfModule as LearningModule);
	}

	public getModule(id: string): LearningModule | undefined {
		return this.modules.get(id);
	}

	public getAllModules(): LearningModule[] {
		return Array.from(this.modules.values());
	}

	public getModulesByCategory(category: ModuleCategory): LearningModule[] {
		return this.getAllModules().filter(m => m.category === category);
	}
}

export const moduleLoader = new ModuleLoader();
