/**
 * D&D Experiential Learning Platform - Core Type Definitions
 * SRD 5.2.1 Compatible
 */

// ============================================================================
// TEMEL ENUM'LAR
// ============================================================================

export type AbilityName = 'STR' | 'DEX' | 'CON' | 'INT' | 'WIS' | 'CHA';

export type SkillName =
  | 'acrobatics' | 'animal_handling' | 'arcana' | 'athletics'
  | 'deception' | 'history' | 'insight' | 'intimidation'
  | 'investigation' | 'medicine' | 'nature' | 'perception'
  | 'performance' | 'persuasion' | 'religion' | 'sleight_of_hand'
  | 'stealth' | 'survival';

export type Size = 'tiny' | 'small' | 'medium' | 'large' | 'huge' | 'gargantuan';

export type DamageType =
  | 'bludgeoning' | 'piercing' | 'slashing'  // Physical
  | 'acid' | 'cold' | 'fire' | 'lightning' | 'thunder'  // Elemental
  | 'force' | 'necrotic' | 'poison' | 'psychic' | 'radiant';  // Magical

export type ConditionType =
  | 'blinded' | 'charmed' | 'deafened' | 'exhaustion'
  | 'frightened' | 'grappled' | 'incapacitated' | 'invisible'
  | 'paralyzed' | 'petrified' | 'poisoned' | 'prone'
  | 'restrained' | 'stunned' | 'unconscious';

export type SpellSchool =
  | 'abjuration' | 'conjuration' | 'divination' | 'enchantment'
  | 'evocation' | 'illusion' | 'necromancy' | 'transmutation';

export type ArmorType = 'light' | 'medium' | 'heavy' | 'shield';
export type WeaponCategory = 'simple' | 'martial';
export type WeaponProperty =
  | 'ammunition' | 'finesse' | 'heavy' | 'light' | 'loading'
  | 'range' | 'reach' | 'special' | 'thrown' | 'two_handed' | 'versatile';

// ============================================================================
// ABILITY SCORES
// ============================================================================

export interface AbilityScores {
  STR: number;
  DEX: number;
  CON: number;
  INT: number;
  WIS: number;
  CHA: number;
}

export interface AbilityModifiers {
  STR: number;
  DEX: number;
  CON: number;
  INT: number;
  WIS: number;
  CHA: number;
}

// ============================================================================
// DICE SYSTEM
// ============================================================================

export type DieType = 'd4' | 'd6' | 'd8' | 'd10' | 'd12' | 'd20' | 'd100';

export interface DiceExpression {
  count: number;
  die: DieType;
  modifier?: number;
}

export interface DiceRollResult {
  expression: DiceExpression;
  rolls: number[];
  total: number;
  criticalHit?: boolean;
  criticalMiss?: boolean;
}

export type RollType = 'normal' | 'advantage' | 'disadvantage';

// ============================================================================
// COMBAT TYPES
// ============================================================================

export type ActionType = 'action' | 'bonus_action' | 'reaction' | 'free' | 'legendary' | 'lair';

export interface AttackRoll {
  baseRoll: number;
  modifier: number;
  total: number;
  rollType: RollType;
  criticalHit: boolean;
  criticalMiss: boolean;
}

export interface DamageRoll {
  dice: DiceExpression;
  damageType: DamageType;
  result: DiceRollResult;
  isCritical: boolean;
}

export interface CombatAction {
  id: string;
  name: string;
  actionType: ActionType;
  description: string;
  range?: { normal: number; long?: number };
  attackBonus?: number;
  damage?: DiceExpression[];
  damageType?: DamageType;
  savingThrow?: {
    ability: AbilityName;
    dc: number;
    effect: 'half' | 'none';
  };
}

// ============================================================================
// IDENTIFIABLE BASE
// ============================================================================

export interface Identifiable {
  id: string;
  name: string;
  source: 'srd' | 'homebrew' | 'official';
}

export interface Describable {
  description: string;
  shortDescription?: string;
}

// ============================================================================
// SKILL & ABILITY MAPPING
// ============================================================================

export const SKILL_ABILITY_MAP: Record<SkillName, AbilityName> = {
  acrobatics: 'DEX',
  animal_handling: 'WIS',
  arcana: 'INT',
  athletics: 'STR',
  deception: 'CHA',
  history: 'INT',
  insight: 'WIS',
  intimidation: 'CHA',
  investigation: 'INT',
  medicine: 'WIS',
  nature: 'INT',
  perception: 'WIS',
  performance: 'CHA',
  persuasion: 'CHA',
  religion: 'INT',
  sleight_of_hand: 'DEX',
  stealth: 'DEX',
  survival: 'WIS'
};
