import { Service } from '@angular/core';
import Swal from 'sweetalert2';

@Service()
export class NotificationService {

success(title: string, message: string): Promise < any > {
    return Swal.fire({
        icon: 'success',
        title,
        text: message,
        confirmButtonColor: '#10b981',
        confirmButtonText: 'OK'
    });
}

// Alerta Modal de Erro
error(title: string, message: string): Promise < any > {
    return Swal.fire({
        icon: 'error',
        title,
        text: message,
        confirmButtonColor: '#ef4444',
        confirmButtonText: 'Entendi'
    });
}

// Notificação discreta estilo "Toast" no canto superior direito
toast(icon: 'success' | 'error' | 'warning' | 'info', title: string): void {
    const Toast = Swal.mixin({
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true
    });

    Toast.fire({ icon, title });
}
}
