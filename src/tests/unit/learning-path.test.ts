import { describe, it, expect } from 'vitest';
import {
	createLearningProgress,
	getAvailableNodes,
	getNodeStatus,
	completeNode,
	skipNode,
	calculateCompletion,
	isPathComplete,
	getNextRecommendedNode
} from '../../pedagogy/learning-path-manager';
import { LearningPath } from '../../types/pedagogy.types';

// Mock learning path
const mockPath: LearningPath = {
	id: 'beginner-path',
	name: 'Beginner Adventure',
	description: 'Learn D&D basics',
	targetRole: 'player',
	nodes: [
		{ id: 'intro', moduleId: 'm1', prerequisites: [], unlocks: ['dice'], status: 'available', required: true },
		{ id: 'dice', moduleId: 'm2', prerequisites: ['intro'], unlocks: ['combat'], status: 'locked', required: true },
		{ id: 'combat', moduleId: 'm3', prerequisites: ['dice'], unlocks: [], status: 'locked', required: true },
		{ id: 'optional', moduleId: 'm4', prerequisites: ['intro'], unlocks: [], status: 'locked', required: false }
	],
	startNodes: ['intro'],
	completionNodes: ['combat'],
	estimatedHours: 2
};

describe('Learning Path Manager', () => {
	it('should create initial progress', () => {
		const progress = createLearningProgress('user-1', 'beginner-path');
		expect(progress.completedNodes).toHaveLength(0);
		expect(progress.completionPercentage).toBe(0);
	});

	it('should identify available nodes based on prerequisites', () => {
		const progress = createLearningProgress('user-1', 'beginner-path');
		const available = getAvailableNodes(mockPath, progress);

		// Only 'intro' should be available initially
		expect(available).toHaveLength(1);
		expect(available[0]?.id).toBe('intro');
	});

	it('should unlock nodes after completing prerequisites', () => {
		let progress = createLearningProgress('user-1', 'beginner-path');
		progress = completeNode(progress, 'intro');

		const available = getAvailableNodes(mockPath, progress);

		// After intro, 'dice' and 'optional' should be available
		expect(available).toHaveLength(2);
		expect(available.map(n => n.id)).toContain('dice');
		expect(available.map(n => n.id)).toContain('optional');
	});

	it('should track node status correctly', () => {
		let progress = createLearningProgress('user-1', 'beginner-path');

		expect(getNodeStatus(mockPath, progress, 'intro')).toBe('available');
		expect(getNodeStatus(mockPath, progress, 'dice')).toBe('locked');

		progress = completeNode(progress, 'intro');
		expect(getNodeStatus(mockPath, progress, 'intro')).toBe('completed');
		expect(getNodeStatus(mockPath, progress, 'dice')).toBe('available');
	});

	it('should not allow skipping required nodes', () => {
		const progress = createLearningProgress('user-1', 'beginner-path');
		const result = skipNode(mockPath, progress, 'intro'); // Required node
		expect(result).toBeNull();
	});

	it('should allow skipping optional nodes', () => {
		let progress = createLearningProgress('user-1', 'beginner-path');
		progress = completeNode(progress, 'intro');

		const result = skipNode(mockPath, progress, 'optional');
		expect(result).not.toBeNull();
		expect(result?.skippedNodes).toContain('optional');
	});

	it('should calculate completion based on required nodes', () => {
		let progress = createLearningProgress('user-1', 'beginner-path');

		// 0/3 required nodes
		expect(calculateCompletion(mockPath, progress)).toBe(0);

		// 1/3 required nodes
		progress = completeNode(progress, 'intro');
		expect(calculateCompletion(mockPath, progress)).toBeCloseTo(33.33, 1);

		// 3/3 required nodes
		progress = completeNode(progress, 'dice');
		progress = completeNode(progress, 'combat');
		expect(calculateCompletion(mockPath, progress)).toBe(100);
	});

	it('should detect path completion', () => {
		let progress = createLearningProgress('user-1', 'beginner-path');
		expect(isPathComplete(mockPath, progress)).toBe(false);

		progress = completeNode(progress, 'intro');
		progress = completeNode(progress, 'dice');
		progress = completeNode(progress, 'combat');

		expect(isPathComplete(mockPath, progress)).toBe(true);
	});

	it('should recommend next node prioritizing required ones', () => {
		let progress = createLearningProgress('user-1', 'beginner-path');
		progress = completeNode(progress, 'intro');

		const next = getNextRecommendedNode(mockPath, progress);

		// Should recommend 'dice' (required) over 'optional'
		expect(next?.id).toBe('dice');
	});
});
