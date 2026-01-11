/**
 * D&D Experiential Learning Platform - Rules Engine
 * Core rule resolution and validation system
 */

import {
	AbilityName, SkillName, RollType, ConditionType,
	SKILL_ABILITY_MAP
} from '@dnd/types/index';
import { rollCheck, rollAttack, CheckResult, AttackRollResult } from '@engine/core/dice';

// ============================================================================
// RULE DEFINITIONS
// ============================================================================

export interface RuleContext {
	// Actor information
	actorModifiers: Record<AbilityName, number>;
	actorProficiencies: {
		skills: SkillName[];
		savingThrows: AbilityName[];
	};
	actorProficiencyBonus: number;
	actorConditions: ConditionType[];

	// Target information (if applicable)
	targetAC?: number;
	targetConditions?: ConditionType[];

	// Situational modifiers
	coverType?: 'none' | 'half' | 'three_quarters' | 'full';
	lightLevel?: 'bright' | 'dim' | 'darkness';
	range?: 'normal' | 'long' | 'beyond';

	// Advantage sources
	advantageSources: string[];
	disadvantageSources: string[];
}

export interface RuleExplanation {
	ruleName: string;
	shortDescription: string;
	fullExplanation: string;
	example?: string;
	srdReference?: string;
}

// ============================================================================
// ROLL TYPE DETERMINATION
// ============================================================================

/**
 * Determine if a roll has advantage, disadvantage, or neither
 */
export function determineRollType(context: RuleContext): {
	rollType: RollType;
	explanation: string;
	sources: { type: 'advantage' | 'disadvantage'; source: string }[];
} {
	const sources: { type: 'advantage' | 'disadvantage'; source: string }[] = [];

	// Collect all advantage sources
	for (const source of context.advantageSources) {
		sources.push({ type: 'advantage', source });
	}

	// Collect all disadvantage sources
	for (const source of context.disadvantageSources) {
		sources.push({ type: 'disadvantage', source });
	}

	// Check conditions
	if (context.actorConditions.includes('blinded')) {
		sources.push({ type: 'disadvantage', source: 'Blinded condition' });
	}
	if (context.actorConditions.includes('frightened')) {
		// Frightened gives disadvantage on ability checks and attack rolls
		sources.push({ type: 'disadvantage', source: 'Frightened condition' });
	}
	if (context.actorConditions.includes('poisoned')) {
		sources.push({ type: 'disadvantage', source: 'Poisoned condition' });
	}
	if (context.actorConditions.includes('restrained')) {
		sources.push({ type: 'disadvantage', source: 'Restrained condition' });
	}
	if (context.actorConditions.includes('prone')) {
		sources.push({ type: 'disadvantage', source: 'Prone condition (attack roll)' });
	}

	// Check target conditions (advantage against them)
	if (context.targetConditions?.includes('blinded')) {
		sources.push({ type: 'advantage', source: 'Target is blinded' });
	}
	if (context.targetConditions?.includes('paralyzed')) {
		sources.push({ type: 'advantage', source: 'Target is paralyzed' });
	}
	if (context.targetConditions?.includes('stunned')) {
		sources.push({ type: 'advantage', source: 'Target is stunned' });
	}
	if (context.targetConditions?.includes('unconscious')) {
		sources.push({ type: 'advantage', source: 'Target is unconscious' });
	}
	if (context.targetConditions?.includes('restrained')) {
		sources.push({ type: 'advantage', source: 'Target is restrained' });
	}
	if (context.targetConditions?.includes('prone')) {
		sources.push({ type: 'advantage', source: 'Target is prone (melee attack)' });
	}

	// Long range disadvantage
	if (context.range === 'long') {
		sources.push({ type: 'disadvantage', source: 'Long range attack' });
	}

	// Count advantages and disadvantages
	const advantageCount = sources.filter(s => s.type === 'advantage').length;
	const disadvantageCount = sources.filter(s => s.type === 'disadvantage').length;

	// Determine final roll type
	let rollType: RollType = 'normal';
	let explanation = '';

	if (advantageCount > 0 && disadvantageCount > 0) {
		rollType = 'normal';
		explanation = 'Avantaj ve dezavantaj birbirini iptal ediyor - normal atış.';
	} else if (advantageCount > 0) {
		rollType = 'advantage';
		explanation = 'Avantajlı atış - 2d20 at, yüksek olanı kullan.';
	} else if (disadvantageCount > 0) {
		rollType = 'disadvantage';
		explanation = 'Dezavantajlı atış - 2d20 at, düşük olanı kullan.';
	} else {
		rollType = 'normal';
		explanation = 'Normal atış - 1d20 at.';
	}

	return { rollType, explanation, sources };
}

// ============================================================================
// SKILL CHECK RESOLUTION
// ============================================================================

export interface SkillCheckRequest {
	skill: SkillName;
	dc: number;
	context: RuleContext;
}

export interface SkillCheckResult {
	check: CheckResult;
	success: boolean;
	margin: number;
	rollType: RollType;
	totalBonus: number;
	bonusBreakdown: { source: string; value: number }[];
	explanation: RuleExplanation;
}

/**
 * Resolve a skill check with full explanation
 */
export function resolveSkillCheck(request: SkillCheckRequest): SkillCheckResult {
	const { skill, dc, context } = request;
	const ability = SKILL_ABILITY_MAP[skill];

	// Calculate bonus
	const bonusBreakdown: { source: string; value: number }[] = [];

	const abilityMod = context.actorModifiers[ability];
	bonusBreakdown.push({ source: `${ability} modifier`, value: abilityMod });

	let totalBonus = abilityMod;

	if (context.actorProficiencies.skills.includes(skill)) {
		bonusBreakdown.push({ source: 'Proficiency bonus', value: context.actorProficiencyBonus });
		totalBonus += context.actorProficiencyBonus;
	}

	// Determine roll type
	const { rollType } = determineRollType(context);

	// Make the roll
	const check = rollCheck(totalBonus, rollType);
	const success = check.success(dc);
	const margin = check.margin(dc);

	// Generate explanation
	const explanation: RuleExplanation = {
		ruleName: 'Yetenek Kontrolü (Skill Check)',
		shortDescription: `${skill} (${ability}) kontrolü, DC ${dc}`,
		fullExplanation: `Bir ${skill} kontrolü yapmak için d20 atıp ${ability} modifiyerini ekliyorsun.${context.actorProficiencies.skills.includes(skill)
			? ' Bu yetenekte ustalığın olduğu için proficiency bonusunu da ekliyorsun.'
			: ''
			} Sonuç (${check.total}) DC'yi (${dc}) ${success ? 'geçerse başarılı' : 'geçmezse başarısız'}.`,
		example: `d20 (${check.d20Roll}) + ${totalBonus} = ${check.total} vs DC ${dc}`
	};

	return {
		check,
		success,
		margin,
		rollType,
		totalBonus,
		bonusBreakdown,
		explanation
	};
}

// ============================================================================
// ATTACK RESOLUTION
// ============================================================================

export interface AttackRequest {
	attackBonus: number;
	context: RuleContext;
	isMelee: boolean;
}

export interface AttackResult {
	attack: AttackRollResult;
	hits: boolean;
	isCritical: boolean;
	isCriticalMiss: boolean;
	effectiveAC: number;
	rollType: RollType;
	explanation: RuleExplanation;
}

/**
 * Calculate effective AC with cover
 */
export function calculateEffectiveAC(baseAC: number, coverType: string): number {
	switch (coverType) {
		case 'half': return baseAC + 2;
		case 'three_quarters': return baseAC + 5;
		case 'full': return Infinity; // Cannot be targeted
		default: return baseAC;
	}
}

/**
 * Resolve an attack roll with full explanation
 */
export function resolveAttack(request: AttackRequest): AttackResult {
	const { attackBonus, context, isMelee } = request;

	if (!context.targetAC) {
		throw new Error('Target AC required for attack resolution');
	}

	// Calculate effective AC with cover
	const effectiveAC = calculateEffectiveAC(
		context.targetAC,
		context.coverType || 'none'
	);

	// Adjust advantage/disadvantage for prone (different for melee vs ranged)
	const modifiedContext = { ...context };
	if (context.targetConditions?.includes('prone')) {
		if (isMelee) {
			modifiedContext.advantageSources = [...context.advantageSources, 'Target is prone (melee)'];
		} else {
			modifiedContext.disadvantageSources = [...context.disadvantageSources, 'Target is prone (ranged)'];
		}
	}

	// Determine roll type
	const { rollType, explanation: rollExplanation } = determineRollType(modifiedContext);

	// Make the attack roll
	const attack = rollAttack(attackBonus, rollType);
	const hits = attack.hits(effectiveAC);

	// Generate explanation
	const explanation: RuleExplanation = {
		ruleName: 'Saldırı Atışı (Attack Roll)',
		shortDescription: `Saldırı vs AC ${effectiveAC}`,
		fullExplanation: `Saldırı atışı yapmak için d20 atıp saldırı bonusunu ekliyorsun. ${rollExplanation} Sonuç (${attack.total}) hedefin AC'sini (${effectiveAC}) ${hits ? 'geçerse isabet' : 'geçmezse ıskalama'}. ${attack.isCriticalHit ? 'Doğal 20! Kritik isabet - hasar zarlarını iki kere at!' : ''
			}${attack.isCriticalMiss ? 'Doğal 1! Otomatik ıskalama.' : ''}`,
		example: `d20 (${attack.d20Roll}) + ${attackBonus} = ${attack.total} vs AC ${effectiveAC}`
	};

	return {
		attack,
		hits,
		isCritical: attack.isCriticalHit,
		isCriticalMiss: attack.isCriticalMiss,
		effectiveAC,
		rollType,
		explanation
	};
}

// ============================================================================
// SAVING THROW RESOLUTION
// ============================================================================

export interface SavingThrowRequest {
	ability: AbilityName;
	dc: number;
	context: RuleContext;
	source: string;
}

export interface SavingThrowResult {
	check: CheckResult;
	success: boolean;
	margin: number;
	rollType: RollType;
	totalBonus: number;
	bonusBreakdown: { source: string; value: number }[];
	explanation: RuleExplanation;
}

/**
 * Resolve a saving throw with full explanation
 */
export function resolveSavingThrow(request: SavingThrowRequest): SavingThrowResult {
	const { ability, dc, context, source } = request;

	// Calculate bonus
	const bonusBreakdown: { source: string; value: number }[] = [];

	const abilityMod = context.actorModifiers[ability];
	bonusBreakdown.push({ source: `${ability} modifier`, value: abilityMod });

	let totalBonus = abilityMod;

	if (context.actorProficiencies.savingThrows.includes(ability)) {
		bonusBreakdown.push({ source: 'Saving throw proficiency', value: context.actorProficiencyBonus });
		totalBonus += context.actorProficiencyBonus;
	}

	// Determine roll type
	const { rollType } = determineRollType(context);

	// Make the roll
	const check = rollCheck(totalBonus, rollType);
	const success = check.success(dc);
	const margin = check.margin(dc);

	// Generate explanation
	const explanation: RuleExplanation = {
		ruleName: 'Kurtulma Atışı (Saving Throw)',
		shortDescription: `${ability} kurtulma atışı vs DC ${dc}`,
		fullExplanation: `${source} etkisine karşı ${ability} kurtulma atışı yapıyorsun. d20 atıp ${ability} modifiyerini ekliyorsun.${context.actorProficiencies.savingThrows.includes(ability)
			? ' Bu kurtulma atışında ustalığın var, proficiency bonusunu da ekliyorsun.'
			: ''
			} Sonuç (${check.total}) DC'yi (${dc}) ${success ? 'geçerse etkiden kurtulursun veya azaltılmış etki alırsın' : 'geçmezse tam etkiyi alırsın'}.`,
		example: `d20 (${check.d20Roll}) + ${totalBonus} = ${check.total} vs DC ${dc}`
	};

	return {
		check,
		success,
		margin,
		rollType,
		totalBonus,
		bonusBreakdown,
		explanation
	};
}

// ============================================================================
// CONDITION EFFECTS
// ============================================================================

export interface ConditionEffect {
	condition: ConditionType;
	effects: string[];
	endConditions: string[];
}

export const CONDITION_EFFECTS: Record<ConditionType, ConditionEffect> = {
	blinded: {
		condition: 'blinded',
		effects: [
			'Görme gerektiren yetenek kontrollerinde otomatik başarısız',
			'Saldırı atışlarında dezavantaj',
			'Sana karşı saldırılarda avantaj'
		],
		endConditions: ['Görme yetisi geri kazanılınca']
	},
	charmed: {
		condition: 'charmed',
		effects: [
			'Büyüleyene saldıramaz veya zarar veremez',
			'Büyüleyen sosyal etkileşimlerde avantaj kazanır'
		],
		endConditions: ['Büyü süresi dolunca', 'Büyüleyen zarar verince']
	},
	deafened: {
		condition: 'deafened',
		effects: [
			'Duyma gerektiren yetenek kontrollerinde otomatik başarısız'
		],
		endConditions: ['Duyma yetisi geri kazanılınca']
	},
	frightened: {
		condition: 'frightened',
		effects: [
			'Korku kaynağını görebildiği sürece yetenek kontrolü ve saldırılarda dezavantaj',
			'Korku kaynağına gönüllü olarak yaklaşamaz'
		],
		endConditions: ['Korku kaynağı görüş alanından çıkınca']
	},
	grappled: {
		condition: 'grappled',
		effects: [
			'Hız 0 olur',
			'Hareket etme bonuslarından yararlanamaz'
		],
		endConditions: ['Tutma sona erince', 'Kaçış aksiyonu ile']
	},
	incapacitated: {
		condition: 'incapacitated',
		effects: [
			'Aksiyon veya reaksiyon alamaz'
		],
		endConditions: ['Duruma neden olan etki sona erince']
	},
	invisible: {
		condition: 'invisible',
		effects: [
			'Normal görüşle görülemez',
			'Saldırı atışlarında avantaj',
			'Sana karşı saldırılarda dezavantaj'
		],
		endConditions: ['Görünürlük geri kazanılınca']
	},
	paralyzed: {
		condition: 'paralyzed',
		effects: [
			'Hareketsiz (Incapacitated)',
			'Hareket edemez veya konuşamaz',
			'STR ve DEX kurtulma atışlarında otomatik başarısız',
			'Saldırılarda avantaj',
			'5 feet içinden isabet kritik isabet'
		],
		endConditions: ['Felç eden etki sona erince']
	},
	petrified: {
		condition: 'petrified',
		effects: [
			'Taşa dönüşür',
			'Ağırlık 10 katına çıkar',
			'Yaşlanmaz',
			'Hareketsiz, farkındalık yok',
			'Saldırılarda avantaj',
			'STR ve DEX kurtulma atışlarında otomatik başarısız',
			'Hasara dirençli',
			'Zehir ve hastalığa bağışık'
		],
		endConditions: ['Taşlaştırma kaldırılınca']
	},
	poisoned: {
		condition: 'poisoned',
		effects: [
			'Saldırı atışlarında dezavantaj',
			'Yetenek kontrollerinde dezavantaj'
		],
		endConditions: ['Zehir etkisi geçince']
	},
	prone: {
		condition: 'prone',
		effects: [
			'Sadece emekleyerek hareket (her feet 2 feet maliyetli)',
			'Saldırılarda dezavantaj',
			'5 feet içinden saldırılarda avantaj',
			'5 feet dışından saldırılarda dezavantaj'
		],
		endConditions: ['Ayağa kalkınca (hızın yarısı kadar hareket harcar)']
	},
	restrained: {
		condition: 'restrained',
		effects: [
			'Hız 0',
			'Saldırılarda dezavantaj',
			'DEX kurtulma atışlarında dezavantaj',
			'Saldırılarda avantaj'
		],
		endConditions: ['Kısıtlama sona erince']
	},
	stunned: {
		condition: 'stunned',
		effects: [
			'Hareketsiz (Incapacitated)',
			'Anlaşılır konuşamaz',
			'STR ve DEX kurtulma atışlarında otomatik başarısız',
			'Saldırılarda avantaj'
		],
		endConditions: ['Sersemletme sona erince']
	},
	unconscious: {
		condition: 'unconscious',
		effects: [
			'Hareketsiz (Incapacitated)',
			'Farkındalık yok, yere düşer (Prone)',
			'Elindeki her şeyi düşürür',
			'STR ve DEX kurtulma atışlarında otomatik başarısız',
			'Saldırılarda avantaj',
			'5 feet içinden isabet kritik isabet'
		],
		endConditions: ['Hasar alınca veya uyandırılınca']
	},
	exhaustion: {
		condition: 'exhaustion',
		effects: [
			'1. Seviye: Yetenek kontrollerinde dezavantaj',
			'2. Seviye: Hız yarıya düşer',
			'3. Seviye: Saldırı ve kurtulma atışlarında dezavantaj',
			'4. Seviye: HP maksimumu yarıya düşer',
			'5. Seviye: Hız 0',
			'6. Seviye: Ölüm'
		],
		endConditions: ['Uzun dinlenme ile 1 seviye azalır']
	}
};

/**
 * Get condition effects and explanation
 */
export function getConditionInfo(condition: ConditionType): ConditionEffect & { explanation: string } {
	const effect = CONDITION_EFFECTS[condition];
	return {
		...effect,
		explanation: `${condition.charAt(0).toUpperCase() + condition.slice(1)} durumundayken:\n${effect.effects.map(e => `• ${e}`).join('\n')
			}\n\nBitiş koşulları:\n${effect.endConditions.map(e => `• ${e}`).join('\n')}`
	};
}
