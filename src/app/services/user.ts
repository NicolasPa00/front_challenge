// services/user.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private apiUrl = 'http://localhost:3017/api';
  private tokenSubject = new BehaviorSubject<string | null>(null);

  constructor(private http: HttpClient, private router: Router) {
    // Inicializar con el token existente
    this.tokenSubject.next(localStorage.getItem('token'));
  }

  // Headers mejorados
  private getHttpOptions(includeAuth: boolean = true) {
    let headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    if (includeAuth) {
      const token = localStorage.getItem('token');
      if (token) {
        headers = headers.set('Authorization', 'Bearer ' + token);
      }
    }

    return { headers };
  }

  // Manejo de errores mejorado
  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'Error desconocido';

    if (error.status === 401) {
      // Token inválido o expirado
      this.logout();
      errorMessage = 'Sesión expirada. Por favor, inicia sesión nuevamente.';
    } else if (error.error instanceof ErrorEvent) {
      errorMessage = `Error: ${error.error.message}`;
    } else {
      errorMessage = error.error?.message || error.message || `Error código: ${error.status}`;
    }

    console.error('Error en la solicitud:', errorMessage);
    return throwError(() => new Error(errorMessage));
  }

  // Guardar token
  setToken(token: string): void {
    localStorage.setItem('token', token);
    this.tokenSubject.next(token);
  }

  // Obtener token
  getToken(): string | null {
    return localStorage.getItem('token');
  }

  // Logout
  logout(): void {
    localStorage.removeItem('token');
    this.tokenSubject.next(null);
    this.router.navigate(['/login']);
  }

  // Verificar autenticación
  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  /**
   * Login mejorado para guardar el token
   */
  login(credentials: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/user/login`, credentials, this.getHttpOptions(false))
      .pipe(
        tap((response: any) => {
          if (response.token) {
            this.setToken(response.token);
            localStorage.setItem('id_usuario', response.id_usuario);
          }
        }),
        catchError(this.handleError)
      );
  }
  /**
   *  Registro de usuario
   * @param userData Datos del usuario a registrar
   * @returns
   */
  register(userData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/user/register`, userData, this.getHttpOptions(false))
      .pipe(catchError(this.handleError));
  }

  // Método para verificar el token con el backend
  verifyToken(): Observable<any> {
    return this.http.get(`${this.apiUrl}/verify-token`, this.getHttpOptions())
      .pipe(catchError(this.handleError));
  }

  /**
   *  Obtener tareas por ID de usuario
   * @param userId ID del usuario para obtener sus tareas
   * @returns
   */
  getTasksByUserId(userId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/actividad/getTasks/${userId}`, this.getHttpOptions())
      .pipe(catchError(this.handleError));
  }

  /**
   *  Guardar una nueva tarea
   * @param taskData Datos de la tarea a guardar
   * @returns
   */
  saveTask(taskData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/actividad/tasks`, taskData, this.getHttpOptions())
      .pipe(catchError(this.handleError));
  }

  /**
   *  Editar una tarea existente
   * @param taskId ID de la tarea a editar
   * @param taskData Datos de la tarea a editar
   * @returns
   */
  editTask(taskId: number, taskData: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/actividad/editTask/${taskId}`, taskData, this.getHttpOptions())
      .pipe(catchError(this.handleError));
  }

  /**
   *  Completar/Pendiente una actividad
   * @param id_actividad ID de la actividad a completar
   * @param estado
   * @returns
   */
  completarActividad(id_actividad: number, estado: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/actividad/completar/${id_actividad}`, { completed: estado }, this.getHttpOptions())
      .pipe(catchError(this.handleError));
  }

  eliminarActividad(id_actividad: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/actividad/delete/${id_actividad}`, this.getHttpOptions())
      .pipe(catchError(this.handleError));
  }
}
