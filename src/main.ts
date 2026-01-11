/**
 * D&D Experiential Learning Platform - App Orchestrator
 * This file is the central entry point that connects the engine to the UI.
 */

import './ui/styles/main.css';
import { useGameStore } from './engine/core/store.ts';
import { GameEngine } from './engine/core/engine.ts';
import { registry } from './engine/core/registry.ts';
import { MainLayout } from './ui/layout/MainLayout.ts';

// View Imports
import { SidebarView } from './ui/views/SidebarView.ts';
import { CharacterBuilderView } from './ui/views/CharacterBuilderView.ts';
import { CombatView } from './ui/views/CombatView.ts';
import { TraitsView } from './ui/views/TraitsView.ts';

class App {
  private layout: MainLayout;
  private engine: GameEngine;
  private currentView: 'builder' | 'combat' = 'builder';

  private views: {
    sidebar: SidebarView;
    builder: CharacterBuilderView;
    combat: CombatView;
    traits: TraitsView;
  };

  constructor() {
    // 1. Initialize Engine & Registry
    this.engine = new GameEngine();
    registry.initialize(); // Ensure data is loaded

    // 2. Initialize Layout
    this.layout = new MainLayout('app');
    this.layout.render();

    // 3. Initialize Views
    const mainElement = this.layout.getMain();
    const sidebarElement = this.layout.getSidebar();
    const traitsElement = this.layout.getTraits();

    if (!mainElement || !sidebarElement || !traitsElement) {
      throw new Error('Critical UI Elements missing');
    }

    this.views = {
      sidebar: new SidebarView(sidebarElement, (view) => this.navigateTo(view as any)),
      builder: new CharacterBuilderView(mainElement),
      combat: new CombatView(mainElement, this.engine),
      traits: new TraitsView(traitsElement)
    };

    // 4. Setup State Subscriptions
    this.setupSubscriptions();

    // 5. Initial Navigation
    this.navigateTo('builder');
  }

  private setupSubscriptions(): void {
    // Update sidebar whenever the game state changes
    useGameStore.subscribe((_state) => {
      this.views.sidebar.render();
      this.views.traits.render(); // Update traits when state changes
      // If the current view needs refreshing on state change, do it here
      if (this.currentView === 'builder') this.views.builder.render();
    });
  }

  private navigateTo(view: 'builder' | 'combat'): void {
    this.currentView = view;

    if (view === 'builder') {
      this.views.builder.render();
    } else if (view === 'combat') {
      this.views.combat.render();
    }

    // Highlight active nav in sidebar (sidebar rerender will handle this)
    this.views.sidebar.render();
    this.views.traits.render(); // Update traits panel
  }
}

// Start the Application
document.addEventListener('DOMContentLoaded', () => {
  (window as any).app = new App();
});
