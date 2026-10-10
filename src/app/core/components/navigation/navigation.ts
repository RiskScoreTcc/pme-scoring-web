import {
  Component,
  DestroyRef,
  HostListener,
  OnInit,
  computed,
  inject,
  signal
} from '@angular/core';

import { CommonModule } from '@angular/common';

import {
  NavigationEnd,
  Router,
  RouterModule
} from '@angular/router';

import {
  filter
} from 'rxjs';

import {
  takeUntilDestroyed,
  toSignal
} from '@angular/core/rxjs-interop';

import { AuthService } from '../../services/auth/auth-service';
import { JwtDecoderService } from '../../services/jwt-decoder/jwt-decoder-service';

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

  private readonly router = inject(Router);

  private readonly authService =
    inject(AuthService);

  private readonly jwtDecoderService =
    inject(JwtDecoderService);

  private readonly destroyRef =
    inject(DestroyRef);


  /**
   * Define se a navegação está aberta.
   *
   * Desktop:
   * true  -> expandida
   * false -> recolhida
   *
   * Mobile:
   * true  -> aberta
   * false -> fechada
   */
  isNavigationOpen = false;


  /**
   * Define se o menu do usuário
   * está aberto.
   */
  readonly isUserMenuOpen =
    signal(false);


  /**
   * Breakpoint utilizado para
   * comportamento mobile.
   */
  private readonly mobileBreakpoint = 768;


  /**
   * Usuário autenticado obtido
   * através do JWT.
   */
  readonly currentUser =
    toSignal(
      this.jwtDecoderService.user$,
      {
        initialValue:
          this.jwtDecoderService.getUser()
      }
    );


  /**
   * Verifica se o usuário possui
   * perfil administrativo.
   */
  readonly isAdmin =
    computed(() => {

      return this.currentUser()?.role === 'ADMIN';

    });


  /**
   * Identificação do usuário.
   *
   * Atualmente o JWT utiliza o
   * campo "sub" como identificação.
   */
  readonly currentUserEmail =
    computed(() => {

      return this.currentUser()?.sub
        ?? 'Usuário';

    });


  /**
   * Nome apresentado no cabeçalho.
   *
   * Como o JWT atual possui "sub"
   * como identificação, utilizamos
   * esse valor até existir um nome
   * próprio no token.
   */
  readonly currentUserName =
    computed(() => {

      return this.currentUserEmail();

    });


  /**
   * Texto amigável da função
   * do usuário.
   */
  readonly currentUserRole =
    computed(() => {

      const role =
        this.currentUser()?.role;

      switch (role) {

        case 'ADMIN':
          return 'Administrador';

        case 'CREDIT_ANALYST':
          return 'Analista de Crédito';

        default:
          return role ?? 'Usuário';

      }

    });


  /**
   * Gera as iniciais utilizadas
   * no avatar.
   */
  readonly currentUserInitials =
    computed(() => {

      const email =
        this.currentUserEmail();

      if (!email) {
        return 'US';
      }

      const username =
        email.split('@')[0];

      if (!username) {
        return 'US';
      }

      const cleanUsername =
        username.replace(
          /[^a-zA-ZÀ-ÿ0-9]/g,
          ''
        );

      if (!cleanUsername) {
        return 'US';
      }

      return cleanUsername
        .substring(0, 2)
        .toUpperCase();

    });


  ngOnInit(): void {

    /**
     * O menu inicia recolhido.
     */
    this.isNavigationOpen = false;


    /**
     * Fecha o menu no mobile
     * após mudança de rota.
     */
    this.router.events
      .pipe(
        filter(
          event =>
            event instanceof NavigationEnd
        ),
        takeUntilDestroyed(
          this.destroyRef
        )
      )
      .subscribe(() => {

        if (this.isMobile()) {
          this.closeNavigation();
        }

        this.closeUserMenu();

      });

  }


  /**
   * Abre ou fecha a navegação.
   */
  toggleNavigation(): void {

    this.isNavigationOpen =
      !this.isNavigationOpen;

  }


  /**
   * Fecha a navegação.
   */
  closeNavigation(): void {

    this.isNavigationOpen = false;

  }


  /**
   * Abre ou fecha o menu do usuário.
   */
  toggleUserMenu(): void {

    this.isUserMenuOpen.update(
      isOpen => !isOpen
    );

  }


  /**
   * Fecha o menu do usuário.
   */
  closeUserMenu(): void {

    this.isUserMenuOpen.set(false);

  }


  /**
   * Realiza logout da aplicação.
   */
  logout(): void {

    this.closeUserMenu();

    this.closeNavigation();

    this.authService.logout();

    this.router.navigateByUrl('/login');

  }


  /**
   * Fecha menus através da tecla ESC.
   */
  @HostListener(
    'document:keydown.escape'
  )
  onEscape(): void {

    /**
     * Primeiro fecha o menu do usuário.
     */
    if (this.isUserMenuOpen()) {

      this.closeUserMenu();

      return;

    }


    /**
     * Depois fecha a navegação mobile.
     */
    if (
      this.isMobile() &&
      this.isNavigationOpen
    ) {

      this.closeNavigation();

    }

  }


  /**
   * Ajusta o comportamento da navegação
   * quando o tamanho da janela muda.
   */
  @HostListener('window:resize')
  onResize(): void {

    /**
     * No desktop o menu permanece
     * recolhido conforme o estado atual.
     */
    if (!this.isMobile()) {
      this.isNavigationOpen = false;
    }

  }


  /**
   * Verifica se a viewport está
   * em modo mobile.
   */
  private isMobile(): boolean {

    return window.innerWidth <=
      this.mobileBreakpoint;

  }

}