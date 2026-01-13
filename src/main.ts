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
import { CharacterListView } from './ui/views/CharacterListView.ts';
import { CharacterSheetView } from './ui/views/CharacterSheetView.ts';
import { CharacterManager } from './engine/character/character-manager.ts';

class App {
  private layout: MainLayout;
  private engine: GameEngine;
  private currentView: 'builder' | 'combat' | 'list' | 'sheet' = 'list';

  private views: {
    sidebar: SidebarView;
    builder: CharacterBuilderView;
    combat: CombatView;
    traits: TraitsView;
    list: CharacterListView;
    sheet: CharacterSheetView | null;
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

      builder: new CharacterBuilderView(mainElement, (view) => this.navigateTo(view as any)),

      combat: new CombatView(mainElement, this.engine),

      traits: new TraitsView(traitsElement),

      list: new CharacterListView(
        mainElement,
        (charId) => this.loadCharacter(charId),
        () => this.createCharacter()
      ),

      sheet: null // Created dynamically when needed
    };

    // 4. Setup State Subscriptions
    this.setupSubscriptions();

    // 5. Initial Navigation
    // Check if we have saved characters
    const hasCharacters = CharacterManager.getAllCharacters().length > 0;
    this.navigateTo(hasCharacters ? 'list' : 'builder');
  }

  private setupSubscriptions(): void {
    // Update sidebar whenever the game state changes
    useGameStore.subscribe((_state) => {
      this.views.sidebar.render();
      this.views.traits.render(); // Update traits when state changes

      // If the current view needs refreshing on state change, do it here
      if (this.currentView === 'builder') this.views.builder.render();
      if (this.currentView === 'list') this.views.list.render();
      if (this.currentView === 'sheet' && this.views.sheet) this.views.sheet.render();
    });
  }

  private navigateTo(view: 'builder' | 'combat' | 'list' | 'sheet'): void {
    this.currentView = view;
    // Clear main element (handled by views mostly, but good practice if needed)

    if (view === 'builder') {
      this.views.builder.render();
    } else if (view === 'combat') {
      this.views.combat.render();
    } else if (view === 'list') {
      this.views.list.render();
    } else if (view === 'sheet' && this.views.sheet) {
      this.views.sheet.render();
    }

    // Highlight active nav in sidebar (sidebar rerender will handle this)
    this.views.sidebar.render();
    this.views.traits.render(); // Update traits panel
  }

  private loadCharacter(id: string): void {
    const char = CharacterManager.loadCharacter(id);
    if (char) {
      useGameStore.getState().setActiveCharacter(char);

      // Create a new CharacterSheetView instance
      const mainElement = this.layout.getMain();
      if (mainElement) {
        this.views.sheet = new CharacterSheetView(
          mainElement,
          char,
          () => this.navigateTo('list') // Back to list callback
        );
        this.navigateTo('sheet');
      }

      useGameStore.getState().addNotification(`${char.name} yüklendi!`, 'success');
    }
  }

  private createCharacter(): void {
    // Reset state logic is already handled in CharacterBuilderView usually, 
    // but good to ensure we start fresh.
    useGameStore.getState().updateCharacterCreation({
      step: 'species',
      isComplete: false,
      characterName: undefined,
      // ... clear other fields if needed
    });
    this.navigateTo('builder');
  }
}

// Start the Application
document.addEventListener('DOMContentLoaded', () => {
  (window as any).app = new App();
});
