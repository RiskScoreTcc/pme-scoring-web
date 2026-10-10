import {
  Component,
  inject,
  signal,
  OnInit
} from '@angular/core';

import {
  NavigationEnd,
  Router,
  RouterOutlet
} from '@angular/router';

import { filter, map, startWith } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';
import { Navigation } from './core/components/navigation/navigation';
import { AuthService } from './core/services/auth/auth-service';

@Component({
  selector: 'app-root',

  imports: [
    RouterOutlet,
    Navigation
  ],

  styleUrl: './app.css',
  templateUrl: './app.html'
})
export class App implements OnInit {

  protected readonly title = signal('pme-scoring-web');

  private readonly router = inject(Router);
  private readonly authService = inject(AuthService)

  readonly isLoginPage = toSignal(
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd),
      map(event => event.urlAfterRedirects.split('?')[0].startsWith('/login')),
      startWith(window.location.pathname.startsWith('/login'))
    ),
    { initialValue: window.location.pathname.startsWith('/login') }
  );

  ngOnInit(): void {
    this.authService.checkSession();
  }

}