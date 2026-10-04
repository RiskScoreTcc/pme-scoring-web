import {
  Component,
  ElementRef,
  HostListener,
  OnInit,
  ViewChild,
  computed,
  inject,
  signal,
  DestroyRef
} from '@angular/core';

import {
  toObservable,
  takeUntilDestroyed
} from '@angular/core/rxjs-interop';

import {
  combineLatest,
  debounceTime,
  switchMap,
  distinctUntilChanged,
  BehaviorSubject
} from 'rxjs';

import {
  FormBuilder,
  FormsModule,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';

import { UserResponse } from '../../core/models/users/user-response';
import { UserUpdate } from '../../core/models/users/user-update';
import { UserType } from '../../core/models/users/user-type';
import { ModalTypeUser } from '../../core/models/users/modal-type-user';
import { UserService } from '../../core/services/users/user-service';
import { NotificationService } from '../../shared/services/notification/notification-service';
import { Page } from '../../core/models/Page';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule
  ],
  templateUrl: './users.html',
  styleUrl: './users.css'
})
export class Users implements OnInit {

  private readonly formBuilder = inject(FormBuilder);
  private readonly userService = inject(UserService);
  private readonly notificationService = inject(NotificationService);
  private readonly destroyRef = inject(DestroyRef); // Injetado

  @ViewChild('modalFirstControl')
  private modalFirstControl?: ElementRef<HTMLElement>;

  protected readonly users = signal<Page<UserResponse> | null>(null);

  protected readonly isLoading = signal(false);

  protected readonly currentPage = signal(0);

  protected readonly pageSize = signal(20);

  protected readonly searchTerm = signal('');

  protected readonly selectedType =
    signal<UserType | ''>('');

  protected readonly selectedStatus =
    signal<UserResponse['status'] | ''>('ACTIVE');

  private readonly forceReload$ = new BehaviorSubject<number>(0);

  private readonly searchTerm$ = toObservable(this.searchTerm);
  private readonly selectedType$ = toObservable(this.selectedType);
  private readonly selectedStatus$ = toObservable(this.selectedStatus);
  private readonly currentPage$ = toObservable(this.currentPage);
  private readonly pageSize$ = toObservable(this.pageSize);

  selectedUser: UserResponse | null = null;

  activeModal: ModalTypeUser = null;

  openUserActions: number | null = null;

  private modalTrigger: HTMLElement | null = null;

  readonly userForm = this.formBuilder.group({

    email: [
      '',
      [
        Validators.required,
        Validators.email
      ]
    ],

    password: [
      '',
      [
        Validators.minLength(8)
      ]
    ],

    type: [
      '' as UserType | '',
      Validators.required
    ],

    isDeactivate: [
      false
    ]

  });


  protected readonly totalUsers =
    computed(() =>
      this.users()?.totalElements ?? 0
    );

  protected readonly activeUsers =
    computed(() =>
      this.users()?.content.filter(
        user => user.status === 'ACTIVE'
      ).length ?? 0
    );

  protected readonly adminUsers =
    computed(() =>
      this.users()?.content.filter(
        user => user.type === 'ADMIN'
      ).length ?? 0
    );

  protected readonly analystUsers =
    computed(() =>
      this.users()?.content.filter(
        user => user.type === 'CREDIT_ANALYST'
      ).length ?? 0
    );

  ngOnInit(): void {
    this.setupReactiveSearchPipeline();
  }


  private setupReactiveSearchPipeline(): void {

    combineLatest([
      this.searchTerm$,
      this.selectedType$,
      this.selectedStatus$,
      this.currentPage$,
      this.pageSize$,
      this.forceReload$
    ]).pipe(
      debounceTime(300),
      distinctUntilChanged((prev, curr) => JSON.stringify(prev) === JSON.stringify(curr)),
      switchMap(([email, type, status, page, size]) => {

        this.isLoading.set(true);

        const filter = {
          email: email || undefined,
          type: type || undefined,
          status: status || undefined
        };

        return this.userService.searchUsersFilter(
          filter,
          page,
          size,
          'email,asc'
        );
      }),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({

      next: page => {

        this.users.set(page);

        this.isLoading.set(false);
      },

      error: error => {

        console.error(
          'Error fetching users:',
          error
        );

        this.isLoading.set(false);

        this.notificationService.error(
          'Falha ao carregar usuários',
          'Não foi possível carregar a lista de usuários.'
        );
      }

    });
  }


  private reloadUsersManually(): void {
    this.forceReload$.next(Date.now());
  }

  changePage(page: number): void {

    const currentPage =
      this.users();

    if (!currentPage) {
      return;
    }

    if (
      page < 0 ||
      page >= currentPage.totalPages ||
      page === this.currentPage()
    ) {
      return;
    }

    this.currentPage.set(page);
  }

  openDetails(user: UserResponse): void {

    this.captureModalTrigger();

    this.selectedUser = user;

    this.activeModal = 'details';

    this.focusModal();
  }

  openNewUser(): void {

    this.captureModalTrigger();

    this.selectedUser = null;

    this.activeModal = 'new';

    this.userForm.controls.password.setValidators([
      Validators.required,
      Validators.minLength(8)
    ]);

    this.userForm.controls.password.updateValueAndValidity();

    this.userForm.reset({
      email: '',
      password: '',
      type: '',
      isDeactivate: false
    });

    this.focusModal();
  }

  openEdit(user: UserResponse): void {

    this.captureModalTrigger();

    this.selectedUser = user;

    this.activeModal = 'edit';

    this.userForm.controls.password.setValidators([
      Validators.minLength(8)
    ]);

    this.userForm.controls.password.updateValueAndValidity();

    this.userForm.reset({
      email: user.email,
      password: '',
      type: user.type,
      isDeactivate:
        user.status === 'INACTIVE'
    });

    this.focusModal();
  }

  openDeleteConfirmation(
    user: UserResponse
  ): void {

    this.captureModalTrigger();

    this.selectedUser = user;

    this.activeModal = 'delete';

    this.focusModal();
  }

  closeModal(): void {

    this.activeModal = null;

    this.selectedUser = null;

    this.userForm.reset({
      email: '',
      password: '',
      type: '',
      isDeactivate: false
    });

    this.restoreModalTrigger();
  }

  clearFilters(): void {

    this.searchTerm.set('');

    this.selectedType.set('');

    this.selectedStatus.set('');

    this.currentPage.set(0);
  }

  isInvalid(controlName: string): boolean {

    const control =
      this.userForm.get(controlName);

    return !!control &&
      control.invalid &&
      control.touched;
  }

  getTypeLabel(type: UserType): string {

    const labels: Record<UserType, string> = {

      ADMIN:
        'Administrador',

      CREDIT_ANALYST:
        'Analista de Crédito'

    };

    return labels[type];
  }

  getTypeClass(type: UserType): string {

    const classes: Record<UserType, string> = {

      ADMIN:
        'user-type-admin',

      CREDIT_ANALYST:
        'user-type-credit-analyst'

    };

    return classes[type];
  }

  getStatusLabel(
    status: UserResponse['status']
  ): string {

    if (status === 'ACTIVE') {
      return 'Ativo'
    } else {
      return status === 'INACTIVE' ? 'Inativo' : 'Deletado';
    }
  }

  getStatusClass(
    status: UserResponse['status']
  ): string {

    if (status === 'ACTIVE') {
      return 'status-active'
    } else {
      return status === 'INACTIVE' ? 'status-inactive' : 'status-deleted';
    }
  }

  formatDate(date: string): string {

    return new Intl.DateTimeFormat(
      'pt-BR',
      {
        dateStyle: 'short'
      }
    ).format(
      new Date(date)
    );
  }

  formatLastAccess(
    date: string
  ): string {

    return new Intl.DateTimeFormat(
      'pt-BR',
      {
        dateStyle: 'short',
        timeStyle: 'short'
      }
    ).format(
      new Date(date)
    );
  }

  getFirstResult(
    page: Page<UserResponse>
  ): number {

    if (page.totalElements === 0) {
      return 0;
    }

    return (
      page.number * page.size
    ) + 1;
  }

  getLastResult(
    page: Page<UserResponse>
  ): number {

    return (
      page.number * page.size
    ) + page.numberOfElements;
  }

  onSubmit(): void {

    if (this.userForm.invalid) {

      this.userForm.markAllAsTouched();

      this.focusFirstInvalidControl();

      return;
    }

    const formValue =
      this.userForm.getRawValue();

    const payload = {

      email:
        formValue.email!,

      password:
        formValue.password!,

      type:
        formValue.type as UserType

    };

    this.isLoading.set(true);

    this.userService
      .create(payload)
      .subscribe({

        next: async response => {

          this.isLoading.set(false);

          await this.notificationService.success(
            'Usuário cadastrado',
            `Usuário ${response.email} criado com sucesso.`
          );

          this.closeModal();

          this.reloadUsersManually();
        },

        error: error => {

          this.isLoading.set(false);

          this.notificationService.error(
            'Falha no cadastro',
            error.message ||
            'Não foi possível cadastrar o usuário.'
          );
        }

      });
  }

  updateUser(): void {

    if (!this.selectedUser) {
      return;
    }

    if (this.userForm.invalid) {

      this.userForm.markAllAsTouched();

      this.focusFirstInvalidControl();

      return;
    }

    const formValue =
      this.userForm.getRawValue();

    const request: Partial<UserUpdate> = {};

    if (formValue.email && formValue.email !== this.selectedUser.email) {
      request.email = formValue.email;
    }

    if (formValue.type && formValue.type !== this.selectedUser.type) {
      request.type = formValue.type as UserType;
    }

    const isCurrentlyInactive = this.selectedUser.status === 'INACTIVE';
    if (formValue.isDeactivate !== null && formValue.isDeactivate !== isCurrentlyInactive) {
      request.isDeactivate = formValue.isDeactivate;
    }

    if (formValue.password && formValue.password.trim() !== '') {
      request.password = formValue.password;
    }

    this.isLoading.set(true);

    this.userService
      .update(
        this.selectedUser.id.toString(),
        request
      )
      .subscribe({

        next: async response => {

          this.isLoading.set(false);

          await this.notificationService.success(
            'Usuário atualizado',
            `Usuário ${response.email} atualizado com sucesso.`
          );

          this.closeModal();

          this.reloadUsersManually();
        },

        error: error => {

          this.isLoading.set(false);

          this.notificationService.error(
            'Falha na atualização',
            error.message ||
            'Não foi possível atualizar o usuário.'
          );
        }

      });
  }

  deleteUser(): void {

    if (!this.selectedUser) {
      return;
    }

    const userId =
      this.selectedUser.id.toString();

    const userEmail = this.selectedUser.email;

    this.isLoading.set(true);

    this.userService
      .delete(userId)
      .subscribe({

        next: () => {

          this.isLoading.set(false);

          this.notificationService.success(
            'Usuário excluído',
            `Usuário ${userEmail} excluído com sucesso.`
          );

          this.closeModal();

          this.reloadUsersManually();
        },

        error: error => {

          this.isLoading.set(false);

          this.notificationService.error(
            'Falha na exclusão',
            error.message ||
            'Não foi possível excluir o usuário.'
          );
        }

      });
  }

  @HostListener('document:keydown.escape')

  onEscape(): void {

    if (!this.activeModal) {
      return;
    }

    this.closeModal();
  }

  private captureModalTrigger(): void {

    const activeElement =
      document.activeElement;

    if (
      activeElement instanceof HTMLElement
    ) {
      this.modalTrigger =
        activeElement;
    }
  }

  private focusModal(): void {

    setTimeout(() => {

      this.modalFirstControl
        ?.nativeElement
        .focus();

    });
  }

  private restoreModalTrigger(): void {

    setTimeout(() => {

      this.modalTrigger?.focus();

      this.modalTrigger = null;

    });
  }

  private focusFirstInvalidControl(): void {

    setTimeout(() => {

      const firstInvalid =
        document.querySelector<HTMLElement>(
          '.modal [aria-invalid="true"]'
        );

      firstInvalid?.focus();

    });
  }

  toggleActions(userId: number): void {
    this.openUserActions =
      this.openUserActions === userId
        ? null
        : userId;
  }

  closeActions(): void {
    this.openUserActions = null;
  }
}