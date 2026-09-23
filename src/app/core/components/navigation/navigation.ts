import {
  Component,
  DestroyRef,
  HostListener,
  OnInit,
  inject
} from '@angular/core';

import { CommonModule } from '@angular/common';
import {
  NavigationEnd,
  Router,
  RouterModule
} from '@angular/router';

import { filter } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-navigation',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule
  ],
  templateUrl: './navigation.html',
  styleUrl: './navigation.css'
})
export class Navigation implements OnInit {

  /**
   * Define se a navegação principal está aberta.
   *
   * Desktop:
   * - true  → navegação expandida
   * - false → navegação recolhida
   *
   * Mobile:
   * - true  → menu aberto
   * - false → menu fechado
   */
  isNavigationOpen = true;

  private readonly mobileBreakpoint = 768;

  private readonly destroyRef = inject(DestroyRef);

  constructor(
    private readonly router: Router
  ) {}

  ngOnInit(): void {

    /*
     * No desktop a navegação começa aberta.
     * No mobile começa fechada.
     */
    this.isNavigationOpen = !this.isMobile();


    /*
     * Fecha a navegação automaticamente após
     * uma mudança de rota no mobile.
     */
    this.router.events
      .pipe(
        filter(
          event => event instanceof NavigationEnd
        ),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(() => {

        if (this.isMobile()) {
          this.closeNavigation();
        }

      });
  }


  /**
   * Alterna o estado da navegação.
   */
  toggleNavigation(): void {
    this.isNavigationOpen = !this.isNavigationOpen;
  }


  /**
   * Fecha a navegação.
   */
  closeNavigation(): void {
    this.isNavigationOpen = false;
  }


  /**
   * Fecha a navegação ao pressionar ESC
   * quando estiver utilizando dispositivo mobile.
   */
  @HostListener('document:keydown.escape')
  onEscape(): void {

    if (
      this.isMobile() &&
      this.isNavigationOpen
    ) {
      this.closeNavigation();
    }

  }


  /**
   * Mantém a navegação aberta no desktop.
   */
  @HostListener('window:resize')
  onResize(): void {

    if (!this.isMobile()) {
      this.isNavigationOpen = true;
    }

  }


  /**
   * Verifica se a aplicação está em viewport mobile.
   */
  private isMobile(): boolean {
    return window.innerWidth <= this.mobileBreakpoint;
  }

}