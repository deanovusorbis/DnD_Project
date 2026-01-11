/**
 * D&D Experiential Learning Platform - NPC Manager
 * Handles NPC interactions, dialogue, and quest management
 */

// ============================================================================
// TYPES
// ============================================================================

export interface NPC {
	id: string;
	name: string;
	role: 'merchant' | 'sage' | 'authority' | 'healer' | 'informant' | 'commoner' | 'entertainer';
	location: string;
	description: string;
	personality: string[];
	knowledge: string[];
	services: string[];
	dialogue: NPCDialogue;
	quests?: string[];
	inventory?: string[];
}

export interface NPCDialogue {
	greeting: string;
	farewell: string;
	topics: Record<string, string>;
}

export interface DialogueOption {
	id: string;
	text: string;
	type: 'topic' | 'service' | 'quest' | 'farewell' | 'special';
	requires?: DialogueRequirement;
	effects?: DialogueEffect[];
}

export interface DialogueRequirement {
	type: 'item' | 'gold' | 'quest_complete' | 'reputation' | 'skill_check';
	value: string | number;
}

export interface DialogueEffect {
	type: 'give_item' | 'take_item' | 'give_gold' | 'take_gold' | 'start_quest' | 'complete_quest' | 'change_reputation';
	value: string | number;
}

export interface DialogueState {
	npcId: string;
	currentTopic: string | null;
	availableOptions: DialogueOption[];
	conversationHistory: { speaker: 'npc' | 'player'; text: string }[];
	isActive: boolean;
}

export interface NPCRelationship {
	npcId: string;
	reputation: number; // -100 to 100
	hasMetBefore: boolean;
	questsGiven: string[];
	questsCompleted: string[];
	lastInteraction: string;
}

// ============================================================================
// DIALOGUE MANAGEMENT
// ============================================================================

export function startNPCDialogue(npc: NPC, relationship?: NPCRelationship): DialogueState {
	const greeting = relationship?.hasMetBefore
		? `Welcome back! ${npc.dialogue.greeting}`
		: npc.dialogue.greeting;

	return {
		npcId: npc.id,
		currentTopic: null,
		availableOptions: generateDialogueOptions(npc, relationship),
		conversationHistory: [{ speaker: 'npc', text: greeting }],
		isActive: true
	};
}

export function generateDialogueOptions(npc: NPC, relationship?: NPCRelationship): DialogueOption[] {
	const options: DialogueOption[] = [];

	// Add topic options
	for (const topic of Object.keys(npc.dialogue.topics)) {
		options.push({
			id: `topic_${topic}`,
			text: formatTopicPrompt(topic),
			type: 'topic'
		});
	}

	// Add service options
	for (const service of npc.services) {
		options.push({
			id: `service_${service}`,
			text: formatServicePrompt(service),
			type: 'service'
		});
	}

	// Add quest options if NPC has quests
	if (npc.quests) {
		for (const questId of npc.quests) {
			const isCompleted = relationship?.questsCompleted.includes(questId);
			const isActive = relationship?.questsGiven.includes(questId) && !isCompleted;

			if (!isActive && !isCompleted) {
				options.push({
					id: `quest_${questId}`,
					text: 'Do you need any help?',
					type: 'quest'
				});
			} else if (isActive) {
				options.push({
					id: `quest_report_${questId}`,
					text: 'I have news about the task you gave me.',
					type: 'quest'
				});
			}
		}
	}

	// Always add farewell
	options.push({
		id: 'farewell',
		text: 'Goodbye.',
		type: 'farewell'
	});

	return options;
}

function formatTopicPrompt(topic: string): string {
	const prompts: Record<string, string> = {
		rumors: 'Have you heard any rumors lately?',
		lodging: 'Do you have rooms available?',
		town: 'Tell me about this town.',
		weapons: 'What weapons do you have for sale?',
		monsters: 'What do you know about the monsters around here?',
		craft: 'Tell me about your craft.',
		magic: 'Tell me about magic.',
		undead: 'What do you know about the undead?',
		prophecy: 'Have you had any visions?',
		bounties: 'Are there any bounties I could claim?',
		threats: 'What threats does the town face?',
		help: 'How can I help?',
		healing: 'I need healing.',
		blessing: 'May I receive a blessing?',
		information: 'I need information.',
		underground: 'Tell me about the criminal underworld.',
		secrets: 'What secrets do you know?',
		problem: 'You seem troubled. What\'s wrong?',
		farm: 'Tell me about your farm.',
		legends: 'Do you know any legends?',
		inspiration: 'Can you inspire us with a song?'
	};
	return prompts[topic] || `Ask about ${topic}`;
}

function formatServicePrompt(service: string): string {
	const prompts: Record<string, string> = {
		lodging: 'I\'d like to rent a room.',
		food: 'I\'d like to buy some food.',
		information: 'I\'m looking for information.',
		weapons: 'Show me your weapons.',
		armor: 'Show me your armor.',
		repairs: 'I need something repaired.',
		spell_scrolls: 'Do you have any spell scrolls?',
		magic_items: 'Do you have any magic items?',
		lore: 'I seek ancient knowledge.',
		bounties: 'I\'m here about a bounty.',
		safe_passage: 'I need safe passage.',
		healing: 'I need healing.',
		blessings: 'I seek a blessing.',
		holy_water: 'I need holy water.',
		cure_disease: 'Someone is sick and needs help.',
		lockpicks: 'I need... tools.',
		contacts: 'I need to meet someone.',
		fencing: 'I have items to sell, no questions asked.',
		shelter: 'Do you have a place I could rest?',
		local_directions: 'Can you give me directions?',
		entertainment: 'Play us a song!',
		bardic_knowledge: 'What tales do you know?'
	};
	return prompts[service] || `Request ${service}`;
}

// ============================================================================
// DIALOGUE PROGRESSION
// ============================================================================

export function selectDialogueOption(
	state: DialogueState,
	npc: NPC,
	optionId: string
): DialogueState {
	const option = state.availableOptions.find(o => o.id === optionId);
	if (!option) return state;

	const newHistory = [...state.conversationHistory];

	// Add player's choice to history
	newHistory.push({ speaker: 'player', text: option.text });

	// Get NPC response
	let response = '';

	if (option.type === 'topic') {
		const topic = optionId.replace('topic_', '');
		response = npc.dialogue.topics[topic] || 'I don\'t know much about that.';
	} else if (option.type === 'farewell') {
		response = npc.dialogue.farewell;
		return {
			...state,
			conversationHistory: [...newHistory, { speaker: 'npc', text: response }],
			isActive: false
		};
	} else if (option.type === 'service') {
		response = getServiceResponse(npc, optionId.replace('service_', ''));
	} else if (option.type === 'quest') {
		response = 'Yes, there is something you could help with...';
	}

	newHistory.push({ speaker: 'npc', text: response });

	return {
		...state,
		currentTopic: optionId,
		conversationHistory: newHistory
	};
}

function getServiceResponse(npc: NPC, service: string): string {
	const responses: Record<string, Record<string, string>> = {
		merchant: {
			weapons: 'Here\'s what I have in stock. Quality goods at fair prices.',
			armor: 'Take a look at my armor selection. Best protection in town.',
			repairs: 'Hand it over, I\'ll have it good as new.'
		},
		healer: {
			healing: 'Let me see your wounds. The Light will mend what is broken.',
			blessings: 'Kneel, and receive the Light\'s blessing.',
			cure_disease: 'Bring them to me. We will do what we can.'
		},
		sage: {
			lore: 'What knowledge do you seek? I have studied many things.',
			spell_scrolls: 'I have some scrolls available for those with the gold.'
		}
	};

	return responses[npc.role]?.[service] || 'Of course, I can help with that.';
}

// ============================================================================
// RELATIONSHIP MANAGEMENT
// ============================================================================

export function createRelationship(npcId: string): NPCRelationship {
	return {
		npcId,
		reputation: 0,
		hasMetBefore: false,
		questsGiven: [],
		questsCompleted: [],
		lastInteraction: new Date().toISOString()
	};
}

export function updateRelationship(
	relationship: NPCRelationship,
	change: Partial<NPCRelationship>
): NPCRelationship {
	return {
		...relationship,
		...change,
		hasMetBefore: true,
		lastInteraction: new Date().toISOString()
	};
}

export function adjustReputation(
	relationship: NPCRelationship,
	amount: number
): NPCRelationship {
	return {
		...relationship,
		reputation: Math.max(-100, Math.min(100, relationship.reputation + amount)),
		lastInteraction: new Date().toISOString()
	};
}

export function getReputationLevel(reputation: number): 'hostile' | 'unfriendly' | 'neutral' | 'friendly' | 'allied' {
	if (reputation <= -50) return 'hostile';
	if (reputation <= -20) return 'unfriendly';
	if (reputation <= 20) return 'neutral';
	if (reputation <= 50) return 'friendly';
	return 'allied';
}
