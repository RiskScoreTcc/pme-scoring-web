import { Component, inject } from '@angular/core';
import {
  FormBuilder,
  FormsModule,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';

import { User } from '../../core/models/users/user';
import { UserType } from '../../core/models/users/user-type';
import { ModalTypeUser } from '../../core/models/users/modal-type-user';


@Component({
  selector: 'app-users',
  imports: [FormsModule, ReactiveFormsModule],
  templateUrl: './users.html',
  styleUrl: './users.css'
})
export class Users {

  private readonly fb = inject(FormBuilder);

  readonly users: User[] = [
    {
      id: 1,
      email: 'admin@pmescoring.com',
      type: 'ADMIN',
      status: 'active',
      createdAt: '2026-01-15',
      lastAccess: '2026-09-22T14:32:00'
    },
    {
      id: 2,
      email: 'analista@pmescoring.com',
      type: 'ANALYST',
      status: 'active',
      createdAt: '2026-03-10',
      lastAccess: '2026-09-22T11:18:00'
    },
    {
      id: 3,
      email: 'credito@pmescoring.com',
      type: 'CREDIT_ANALYST',
      status: 'active',
      createdAt: '2026-04-02',
      lastAccess: '2026-09-21T16:45:00'
    },
    {
      id: 4,
      email: 'operacao@pmescoring.com',
      type: 'ANALYST',
      status: 'inactive',
      createdAt: '2026-05-18',
      lastAccess: '2026-08-30T09:21:00'
    }
  ];

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
        Validators.minLength(8)
      ]
    ],

    type: [
      '' as UserType | '',
      Validators.required
    ]
  });

  selectedUser: User | null = null;
  activeModal: ModalTypeUser = null;

  searchTerm = '';
  selectedType = '';
  selectedStatus = '';

  get filteredUsers(): User[] {
    const term = this.searchTerm.trim().toLowerCase();

    return this.users.filter(user => {
      const matchesSearch =
        !term ||
        user.email.toLowerCase().includes(term);

      const matchesType =
        !this.selectedType ||
        user.type === this.selectedType;

      const matchesStatus =
        !this.selectedStatus ||
        user.status === this.selectedStatus;

      return (
        matchesSearch &&
        matchesType &&
        matchesStatus
      );
    });
  }

  get totalUsers(): number {
    return this.users.length;
  }

  get activeUsers(): number {
    return this.users.filter(
      user => user.status === 'active'
    ).length;
  }

  get adminUsers(): number {
    return this.users.filter(
      user => user.type === 'ADMIN'
    ).length;
  }

  get analystUsers(): number {
    return this.users.filter(
      user =>
        user.type === 'ANALYST' ||
        user.type === 'CREDIT_ANALYST'
    ).length;
  }

  openDetails(user: User): void {
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

  openEdit(user: User): void {
    this.selectedUser = user;

    this.userForm.reset({
      email: user.email,
      password: '',
      type: user.type
    });

    this.activeModal = 'edit';
  }

  openDeleteConfirmation(user: User): void {
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
      ANALYST: 'Analista',
      CREDIT_ANALYST: 'Analista de Crédito'
    };

    return labels[type];
  }

  getTypeClass(type: UserType): string {
    return `user-type-${type.toLowerCase()}`;
  }

  getStatusLabel(status: User['status']): string {
    return status === 'active'
      ? 'Ativo'
      : 'Inativo';
  }

  getStatusClass(status: User['status']): string {
    return `status-${status}`;
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

    const request = {
      email: formValue.email,
      password: formValue.password || undefined,
      type: formValue.type
    };

    console.log('Novo usuário:', request);

    // Futuramente:
    // this.userService.create(request).subscribe(...)

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
      email: formValue.email,
      password: formValue.password || undefined,
      type: formValue.type
    };

    console.log(
      'Atualizar usuário:',
      this.selectedUser.id,
      request
    );

    // Futuramente:
    // this.userService.update(this.selectedUser.id, request)

    this.closeModal();
  }

  deleteUser(): void {
    if (!this.selectedUser) {
      return;
    }

    console.log(
      'Excluir usuário:',
      this.selectedUser.id
    );

    // Futuramente:
    // this.userService.delete(this.selectedUser.id)

    this.closeModal();
  }
}