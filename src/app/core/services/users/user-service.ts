import { Service, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { UserCreate } from '../../models/users/user-create';
import { UserUpdate } from '../../models/users/user-update';
import { UserResponse } from '../../models/users/user-response';
import { UserFilter } from '../../models/users/user-filter';
import { ApiErrorResponse } from '../../models/api-error-response';
import { Page } from '../../models/Page';

@Service()
export class UserService {
    private readonly API_URL = 'http://localhost:8080';
    private readonly http = inject(HttpClient);


    create(userCreate: UserCreate): Observable<UserResponse> {
        return this.http
            .post<UserResponse>(`${this.API_URL}/api/v1/users`, userCreate)
            .pipe(
                catchError((errorResponse: HttpErrorResponse) => {
                    const apiError = errorResponse.error as ApiErrorResponse;
                    const message =
                        apiError?.message ||
                        'An unexpected error occurred while registering the user.';
                    return throwError(() => new Error(message));
                })
            );
    }

    update(userId: string, userUpdate: UserUpdate): Observable<UserResponse> {

        return this.http
            .patch<UserResponse>(`${this.API_URL}/api/v1/users/${userId}`, userUpdate)
            .pipe(
                catchError((errorResponse: HttpErrorResponse) => {
                    const apiError = errorResponse.error as ApiErrorResponse;
                    const message =
                        apiError?.message ||
                        'An unexpected error occurred while updating the user.';
                    return throwError(() => new Error(message));
                })
            );
    }

    delete(userId: string): Observable<UserResponse> {

        return this.http
            .delete<UserResponse>(`${this.API_URL}/api/v1/users/${userId}`)
            .pipe(
                catchError((errorResponse: HttpErrorResponse) => {
                    const apiError = errorResponse.error as ApiErrorResponse;
                    const message =
                        apiError?.message ||
                        'An unexpected error occurred while deleting the user.';
                    return throwError(() => new Error(message));
                })
            );
    }

    searchUsers(userId: string | undefined, pageIndex: number, pageSize: number, sort: string): Observable<Page<UserResponse>> {
        const params = new URLSearchParams({
            page: pageIndex.toString(),
            size: pageSize.toString()
        });

        return this.http
            .get<Page<UserResponse>>(`${this.API_URL}/api/v1/users?${params}`)
            .pipe(
                catchError((errorResponse: HttpErrorResponse) => {
                    const apiError = errorResponse.error as ApiErrorResponse;
                    const message =
                        apiError?.message ||
                        'An unexpected error occurred while searching for users.';
                    return throwError(() => new Error(message));
                })
            );
    }

    searchUsersFilter(userFilter: UserFilter, pageIndex: number, pageSize: number, sort: string): Observable<Page<UserResponse>> {
        const params = new URLSearchParams({
            page: pageIndex.toString(),
            size: pageSize.toString()
        });

        // Add filter parameters if they exist
        if (userFilter.email) {
            params.set('email', userFilter.email);
        }
        if (userFilter.type) {
            params.set('type', userFilter.type);
        }
        if (userFilter.status) {
            params.set('status', userFilter.status);
        }

        return this.http
            .get<Page<UserResponse>>(`${this.API_URL}/api/v1/users/filter?${params}`)
            .pipe(
                catchError((errorResponse: HttpErrorResponse) => {
                    const apiError = errorResponse.error as ApiErrorResponse;
                    const message =
                        apiError?.message ||
                        'An unexpected error occurred while searching for users.';
                    return throwError(() => new Error(message));
                })
            );
    }
}
