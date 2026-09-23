import {
  Component,
  DestroyRef,
  inject,
  signal
} from '@angular/core';

import {
  NavigationEnd,
  Router,
  RouterOutlet
} from '@angular/router';

import { filter } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { Navigation } from './core/components/navigation/navigation';

@Component({
  selector: 'app-root',

  imports: [
    RouterOutlet,
    Navigation
  ],

  styleUrl: './app.css',
  templateUrl: './app.html'
})
export class App {

  protected readonly title = signal('pme-scoring-web');

  private readonly router = inject(Router);

  private readonly destroyRef = inject(DestroyRef);

  /**
   * Indica se a rota atual é a página de login.
   */
  readonly isLoginPage = signal(
    this.router.url === '/login'
  );

  constructor() {

    this.router.events
      .pipe(
        filter(
          event => event instanceof NavigationEnd
        ),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(event => {

        this.isLoginPage.set(
          event.urlAfterRedirects === '/login'
        );

      });

  }

}