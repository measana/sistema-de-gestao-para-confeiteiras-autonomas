import { Component, DestroyRef, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-menu',
  standalone: true,
  styleUrl: './menu.css',
  templateUrl: './menu.html',
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
})
export class Menu {
  private readonly mobileBreakpoint = window.matchMedia('(max-width: 1024px)');
  private readonly destroyRef = inject(DestroyRef);
  protected readonly menuOpen = signal(!this.mobileBreakpoint.matches);

  constructor() {
    const syncWithViewport = (event: MediaQueryListEvent) => {
      this.menuOpen.set(!event.matches);
    };

    this.mobileBreakpoint.addEventListener('change', syncWithViewport);
    this.destroyRef.onDestroy(() => {
      this.mobileBreakpoint.removeEventListener('change', syncWithViewport);
    });
  }

  protected toggleMenu(): void {
    this.menuOpen.update((open) => !open);
  }
}