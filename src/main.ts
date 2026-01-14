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
import { CharacterBuilderView } from './ui/views/CharacterBuilderView.ts';
import { HomeView } from './ui/views/HomeView.ts';
import { ModulesView } from './ui/views/ModulesView.ts';
import { ModulePlayView } from './ui/views/ModulePlayView.ts';
import { TraitsView } from './ui/views/TraitsView.ts';
import { CharacterListView } from './ui/views/CharacterListView.ts';
import { CharacterSheetView } from './ui/views/CharacterSheetView.ts';
import { ProfileView } from './ui/views/ProfileView.ts';
import { CharacterManager } from './engine/character/character-manager.ts';
import { moduleLoader } from './data/modules/module-loader.ts';

class App {
  private layout: MainLayout;
  private currentView: 'home' | 'builder' | 'modules' | 'module-play' | 'list' | 'sheet' | 'profile' = 'home';

  private views: {
    home: HomeView;
    builder: CharacterBuilderView;
    modules: ModulesView;
    modulePlay: ModulePlayView | null;
    traits: TraitsView;
    list: CharacterListView;
    sheet: CharacterSheetView | null;
    profile: ProfileView;
  };

  constructor() {
    // 1. Initialize Engine & Registry
    new GameEngine();
    registry.initialize(); // Ensure data is loaded

    // 2. Initialize Layout
    this.layout = new MainLayout('app');
    this.layout.render();

    // 3. Initialize Views
    const mainElement = this.layout.getMain();
    const traitsElement = this.layout.getTraits();

    if (!mainElement || !traitsElement) {
      throw new Error('Critical UI Elements missing');
    }

    this.views = {
      home: new HomeView(mainElement, (view) => {
        if (view === 'create') this.createCharacter();
        else this.navigateTo(view as any);
      }),

      builder: new CharacterBuilderView(mainElement, (view) => this.navigateTo(view as any)),

      modules: new ModulesView(mainElement, (view, moduleId) => {
        if (view === 'module-play' && moduleId) {
          this.playModule(moduleId);
        } else {
          this.navigateTo(view as any);
        }
      }),

      modulePlay: null, // Created dynamically when needed

      traits: new TraitsView(traitsElement),

      list: new CharacterListView(
        mainElement,
        (charId) => this.loadCharacter(charId),
        () => this.createCharacter()
      ),



      sheet: null, // Created dynamically when needed

      profile: new ProfileView(mainElement)
    };

    // 4. Setup State Subscriptions
    this.setupSubscriptions();

    // 5. Setup Action Listeners (Nav)
    this.setupNavigation();

    // 6. Initial Navigation
    // Check if we have saved characters
    // const hasCharacters = CharacterManager.getAllCharacters().length > 0;
    // this.navigateTo(hasCharacters ? 'list' : 'builder');
    this.navigateTo('home');
  }

  private setupNavigation(): void {
    const navButtons = document.querySelectorAll('.nav-btn');
    navButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const target = (e.target as HTMLElement).getAttribute('data-target');
        if (target) {
          this.navigateTo(target as any);
        }
      });
    });
  }

  private setupSubscriptions(): void {
    // Update sidebar whenever the game state changes
    useGameStore.subscribe((_state) => {
      this.views.traits.render(); // Update traits when state changes

      // If the current view needs refreshing on state change, do it here
      if (this.currentView === 'builder') this.views.builder.render();
      if (this.currentView === 'list') this.views.list.render();
      if (this.currentView === 'sheet' && this.views.sheet) this.views.sheet.render();
    });
  }

  private navigateTo(view: 'home' | 'builder' | 'modules' | 'module-play' | 'list' | 'sheet' | 'profile'): void {
    this.currentView = view;
    // Clear main element (handled by views mostly, but good practice if needed)
    const mainElement = this.layout.getMain();
    if (mainElement) {
      mainElement.style.cssText = '';
    }

    if (view === 'home') {
      this.views.home.render();
    } else if (view === 'builder') {
      this.views.builder.render();
    } else if (view === 'modules') {
      this.views.modules.render();
    } else if (view === 'module-play' && this.views.modulePlay) {
      this.views.modulePlay.render();
    } else if (view === 'list') {
      this.views.list.render();
    } else if (view === 'sheet' && this.views.sheet) {
      this.views.sheet.render();
    } else if (view === 'profile') {
      this.views.profile.render();
    }


    // Update Layout (Sidebar Visibility)
    const appElement = document.getElementById('app');
    if (appElement) {
      if (view === 'builder') {
        appElement.classList.remove('layout-full-width');
      } else {
        appElement.classList.add('layout-full-width');
      }
    }

    // Highlight active nav in sidebar (sidebar rerender will handle this)
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

  private playModule(moduleId: string): void {
    const module = moduleLoader.getModule(moduleId);
    if (module) {
      const mainElement = this.layout.getMain();
      if (mainElement) {
        this.views.modulePlay = new ModulePlayView(
          mainElement,
          module,
          () => {
            // On complete
            useGameStore.getState().addNotification('Modül tamamlandı! 🎉', 'success');
            this.navigateTo('modules');
          },
          () => {
            // On exit
            this.navigateTo('modules');
          }
        );
        this.navigateTo('module-play');
      }
    }
  }
}

// Start the Application
document.addEventListener('DOMContentLoaded', () => {
  (window as any).app = new App();
});
