import { Component, inject, OnInit, signal } from '@angular/core';
import {
  FormBuilder,
  FormsModule,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { Router } from '@angular/router';
import { UserResponse } from '../../core/models/users/user-response';
import { UserType } from '../../core/models/users/user-type';
import { ModalTypeUser } from '../../core/models/users/modal-type-user';
import { UserService } from '../../core/services/users/user-service';
import { NotificationService } from '../../shared/services/notification/notification-service';
import { Page } from '../../core/models/Page';

@Component({
  selector: 'app-users',
  imports: [FormsModule, ReactiveFormsModule],
  templateUrl: './users.html',
  styleUrl: './users.css'
})
export class Users implements OnInit {

  private readonly fb = inject(FormBuilder);
  private readonly userService = inject(UserService);
  private readonly router = inject(Router);
  private readonly notificationService = inject(NotificationService);

  // Estados com Signals
  protected readonly users = signal<Page<UserResponse> | null>(null);
  protected readonly isLoading = signal<boolean>(false);

  // Filtros / Estado da Paginação
  protected readonly currentPage = signal<number>(0);
  protected readonly pageSize = signal<number>(20);
  readonly userForm = this.fb.group({
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
        Validators.required,
        Validators.minLength(8)
      ]
    ],

    type: [
      '' as UserType | '',
      Validators.required
    ]
  });

  selectedUser: UserResponse | null = null;
  activeModal: ModalTypeUser = null;

  searchTerm = '';
  selectedType = '';
  selectedStatus = '';

  ngOnInit(): void {
    this.loadUsers(this.currentPage());
  }

  loadUsers(pageIndex: number): void {
    this.isLoading.set(true);

    // Dispara a busca paginada no backend
    this.userService.searchUsers(undefined, pageIndex, this.pageSize(), 'email,asc').subscribe({
      next: (data) => {
        this.users.set(data);
        this.currentPage.set(data.number);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error fetching users:', err);
        this.isLoading.set(false);
      }
    });
  }

  changePage(newPage: number): void {
    if (newPage >= 0 && newPage !== this.currentPage()) {
      this.loadUsers(newPage);
    }
  }

  get filteredUsers(): UserResponse[] {
    const term = this.searchTerm.trim().toLowerCase();

    return this.users()?.content?.filter(user => {
      const matchesSearch =
        !term ||
        user.email.toLowerCase().includes(term);

      const matchesType =
        !this.selectedType ||
        user.type === this.selectedType;
      /*
            const matchesStatus =
              !this.selectedStatus ||
              user.status === this.selectedStatus;
      */
      return (
        matchesSearch &&
        matchesType /* &&
        matchesStatus*/
      );
    }) ?? [];
  }

  get totalUsers(): number {
    return this.users()?.totalElements || 0;
  }

  get activeUsers(): number {
    /* return this.users()?.content.filter(
       user => user.status === 'active'
     ).length || 0;*/
    return 0;

  }

  get adminUsers(): number {
    return this.users()?.content?.filter(
      user => user.type === 'ADMIN'
    ).length || 0;
  }

  get analystUsers(): number {
    return this.users()?.content?.filter(
      user => user.type === 'CREDIT_ANALYST'
    ).length || 0;
  }

  openDetails(user: UserResponse): void {
    this.selectedUser = user;
    this.activeModal = 'details';
  }

  openNewUser(): void {
    this.selectedUser = null;

    this.userForm.reset({
      email: '',
      password: '',
      type: ''
    });

    this.activeModal = 'new';
  }

  openEdit(user: UserResponse): void {
    this.selectedUser = user;

    this.userForm.reset({
      email: user.email,
      password: '',
      type: user.type
    });

    this.activeModal = 'edit';
  }

  openDeleteConfirmation(user: UserResponse): void {
    this.selectedUser = user;
    this.activeModal = 'delete';
  }

  closeModal(): void {
    this.activeModal = null;
    this.selectedUser = null;
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.selectedType = '';
    this.selectedStatus = '';
  }

  isInvalid(controlName: string): boolean {
    const control = this.userForm.get(controlName);

    return !!control &&
      control.invalid &&
      control.touched;
  }

  getTypeLabel(type: UserType): string {
    const labels: Record<UserType, string> = {
      ADMIN: 'Administrador',
      CREDIT_ANALYST: 'Analista de Crédito'
    };

    return labels[type];
  }

  getTypeClass(type: UserType): string {
    return `user-type-${type.toLowerCase()}`;
  }

  getStatusLabel(status: UserResponse/*['status']*/): string {
    /* return status === 'active'
       ? 'Ativo'
       : 'Inativo';*/
    return '';
  }

  getStatusClass(status: UserResponse/*['status']*/): string {
    /*return `status-${status}`;*/
    return '';
  }

  formatDate(date: string): string {
    return new Intl.DateTimeFormat('pt-BR', {
      dateStyle: 'short'
    }).format(new Date(date));
  }

  formatLastAccess(date: string): string {
    return new Intl.DateTimeFormat('pt-BR', {
      dateStyle: 'short',
      timeStyle: 'short'
    }).format(new Date(date));
  }

  onSubmit(): void {
    if (this.userForm.invalid) {
      this.userForm.markAllAsTouched();
      return;
    }

    const formValue = this.userForm.getRawValue();

    const createPayload = {
      email: formValue.email!,
      password: formValue.password!,
      type: formValue.type as UserType
    };

    this.userService.create(createPayload).subscribe({
      next: async (response) => {
        await this.notificationService.success('Sucesso!', `Usuário ${response.email} criado.`);
        this.loadUsers(this.currentPage());
      },
      error: (err: Error) => {
        this.notificationService.error('Falha no Cadastro', err.message);
      }
    });

    this.closeModal();
  }

  updateUser(): void {
    if (!this.selectedUser) {
      return;
    }

    if (this.userForm.invalid) {
      this.userForm.markAllAsTouched();
      return;
    }

    const formValue = this.userForm.getRawValue();

    const request = {
      email: formValue.email || undefined,
      password: formValue.password || undefined,
      type: (formValue.type || undefined) as UserType | undefined
    };


    this.userService.update(this.selectedUser.id.toString(), request).subscribe({
      next: async (response) => {
        await this.notificationService.success('Sucesso!', `Usuário ${response.email} atualizado.`);
        this.loadUsers(this.currentPage());
      },
      error: (err: Error) => {
        this.notificationService.error('Falha no Cadastro', err.message);
      }
    });

    this.closeModal();
  }

  deleteUser(): void {
    if (!this.selectedUser) {
      return;
    }

    this.userService.delete(this.selectedUser.id.toString()).subscribe({
      next: async (response) => {
        await this.notificationService.success('Sucesso!', `Usuário ${response.email} excluído.`);
      },
      error: (err: Error) => {
        this.notificationService.error('Falha na Exclusão', err.message);
      }
    });
    this.loadUsers(this.currentPage());

    this.closeModal();
  }
}