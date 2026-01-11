/**
 * D&D Experiential Learning Platform - Learning Path Manager
 * Manages prerequisite-based progression through learning modules
 */

import {
	LearningPath,
	LearningPathNode,
	UserLearningProgress
} from '@dnd/types/pedagogy.types';
import { UserMasteryProfile } from '@dnd/types/pedagogy.types';

// ============================================================================
// PROGRESS FACTORY
// ============================================================================

export function createLearningProgress(userId: string, pathId: string): UserLearningProgress {
	return {
		userId,
		pathId,
		completedNodes: [],
		skippedNodes: [],
		startedAt: new Date().toISOString(),
		lastActivityAt: new Date().toISOString(),
		totalTimeSpent: 0,
		completionPercentage: 0,
		estimatedTimeRemaining: 0
	};
}

// ============================================================================
// NODE STATUS
// ============================================================================

/**
 * Get available nodes that can be started now
 */
export function getAvailableNodes(
	path: LearningPath,
	progress: UserLearningProgress
): LearningPathNode[] {
	return path.nodes.filter(node => {
		// Already completed or skipped
		if (progress.completedNodes.includes(node.id)) return false;
		if (progress.skippedNodes.includes(node.id)) return false;

		// Check prerequisites
		const prereqsMet = node.prerequisites.every(prereqId =>
			progress.completedNodes.includes(prereqId) ||
			progress.skippedNodes.includes(prereqId)
		);

		return prereqsMet;
	});
}

/**
 * Check if a specific node is unlocked
 */
export function isNodeUnlocked(
	path: LearningPath,
	progress: UserLearningProgress,
	nodeId: string
): boolean {
	const node = path.nodes.find(n => n.id === nodeId);
	if (!node) return false;

	if (progress.completedNodes.includes(nodeId)) return true;

	return node.prerequisites.every(prereqId =>
		progress.completedNodes.includes(prereqId) ||
		progress.skippedNodes.includes(prereqId)
	);
}

/**
 * Get node status
 */
export function getNodeStatus(
	path: LearningPath,
	progress: UserLearningProgress,
	nodeId: string
): LearningPathNode['status'] {
	if (progress.completedNodes.includes(nodeId)) return 'completed';
	if (progress.skippedNodes.includes(nodeId)) return 'skipped';
	if (progress.currentNode === nodeId) return 'in_progress';
	if (isNodeUnlocked(path, progress, nodeId)) return 'available';
	return 'locked';
}

// ============================================================================
// PROGRESSION
// ============================================================================

/**
 * Start a node
 */
export function startNode(
	progress: UserLearningProgress,
	nodeId: string
): UserLearningProgress {
	return {
		...progress,
		currentNode: nodeId,
		lastActivityAt: new Date().toISOString()
	};
}

/**
 * Complete a node
 */
export function completeNode(
	progress: UserLearningProgress,
	nodeId: string,
	timeSpent: number = 0
): UserLearningProgress {
	const completedNodes = progress.completedNodes.includes(nodeId)
		? progress.completedNodes
		: [...progress.completedNodes, nodeId];

	return {
		...progress,
		completedNodes,
		currentNode: nodeId === progress.currentNode ? undefined : progress.currentNode,
		lastActivityAt: new Date().toISOString(),
		totalTimeSpent: progress.totalTimeSpent + timeSpent
	};
}

/**
 * Skip a node (if allowed)
 */
export function skipNode(
	path: LearningPath,
	progress: UserLearningProgress,
	nodeId: string
): UserLearningProgress | null {
	const node = path.nodes.find(n => n.id === nodeId);

	// Can't skip required nodes
	if (!node || node.required) return null;

	return {
		...progress,
		skippedNodes: [...progress.skippedNodes, nodeId],
		lastActivityAt: new Date().toISOString()
	};
}

// ============================================================================
// PROGRESS CALCULATION
// ============================================================================

/**
 * Calculate completion percentage
 */
export function calculateCompletion(
	path: LearningPath,
	progress: UserLearningProgress
): number {
	const requiredNodes = path.nodes.filter(n => n.required);
	const completedRequired = requiredNodes.filter(n =>
		progress.completedNodes.includes(n.id)
	);

	if (requiredNodes.length === 0) {
		// If no required nodes, count all
		return (progress.completedNodes.length / path.nodes.length) * 100;
	}

	return (completedRequired.length / requiredNodes.length) * 100;
}

/**
 * Check if path is complete
 */
export function isPathComplete(
	path: LearningPath,
	progress: UserLearningProgress
): boolean {
	// All completion nodes must be done
	return path.completionNodes.every(nodeId =>
		progress.completedNodes.includes(nodeId)
	);
}

/**
 * Get next recommended node
 */
export function getNextRecommendedNode(
	path: LearningPath,
	progress: UserLearningProgress,
	_mastery?: UserMasteryProfile
): LearningPathNode | null {
	const available = getAvailableNodes(path, progress);
	if (available.length === 0) return null;

	// Prioritize: required nodes first, then by order in path
	const sorted = available.sort((a, b) => {
		if (a.required && !b.required) return -1;
		if (!a.required && b.required) return 1;
		return path.nodes.indexOf(a) - path.nodes.indexOf(b);
	});

	return sorted[0] ?? null;
}

// ============================================================================
// PATH ANALYTICS
// ============================================================================

export interface PathAnalytics {
	totalNodes: number;
	completedNodes: number;
	skippedNodes: number;
	remainingNodes: number;
	completionPercentage: number;
	estimatedTimeRemaining: number;
	currentStreak: number;
}

export function getPathAnalytics(
	path: LearningPath,
	progress: UserLearningProgress
): PathAnalytics {
	const totalNodes = path.nodes.length;
	const completedNodes = progress.completedNodes.length;
	const skippedNodes = progress.skippedNodes.length;
	const remainingNodes = totalNodes - completedNodes - skippedNodes;
	const completionPercentage = calculateCompletion(path, progress);

	// Rough estimate: 10 minutes per remaining node
	const estimatedTimeRemaining = remainingNodes * 10;

	return {
		totalNodes,
		completedNodes,
		skippedNodes,
		remainingNodes,
		completionPercentage,
		estimatedTimeRemaining,
		currentStreak: 0 // Would track consecutive days of activity
	};
}
