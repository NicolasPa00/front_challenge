import { Component } from '@angular/core';
import { FormBuilder, Validators, AbstractControl, ValidationErrors, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ApiService } from '../../../services/user';
import { MensajeService } from '../../../services/mensaje_service/mensaje-service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './register.html',
  styleUrls: ['./register.scss']
})
export class RegisterComponent {
  registerForm: FormGroup;
  isLoading = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private apiService: ApiService,
    private mensajeService: MensajeService
  ) {
    this.registerForm = this.fb.group(
      {
        name: ['', Validators.required],
        apellido: ['', Validators.required],
        documento: ['', Validators.required],
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, Validators.minLength(6)]],
        confirmPassword: ['', Validators.required],
      },
      { validators: this.passwordMatchValidator }
    );
  }

  get name() { return this.registerForm.get('name'); }
  get apellido() { return this.registerForm.get('apellido'); }
  get documento() { return this.registerForm.get('documento'); }
  get email() { return this.registerForm.get('email'); }
  get password() { return this.registerForm.get('password'); }
  get confirmPassword() { return this.registerForm.get('confirmPassword'); }

  passwordMatchValidator(group: AbstractControl): ValidationErrors | null {
    const password = group.get('password')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { passwordMismatch: true };
  }

  onSubmit() {
    if (this.registerForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';

      const userData = {
        nombre: this.registerForm.value.name,
        apellido: this.registerForm.value.apellido,
        email: this.registerForm.value.email,
        password: this.registerForm.value.password,
        credential: this.registerForm.value.documento
      };

      this.apiService.register(userData).subscribe({
        next: (response) => {
          this.isLoading = false;
          console.log('Registro exitoso', response);

          // Mensaje de éxito con suscripción
          this.mensajeService.mostrarMensaje({
            type: 'success',
            title: 'Registro Exitoso',
            message: 'Te has registrado correctamente. Haz clic en Aceptar para ir al login.',
            showButton: true,
            duration: 0
          }).subscribe((aceptado: boolean) => {
            if (aceptado) {
              this.router.navigate(['/login']);
            }
          });
        },
        error: (error) => {
          this.isLoading = false;
          this.errorMessage = error.message || 'Error en el registro';

          // Mensaje de error
          this.mensajeService.mostrarMensaje({
            type: 'error',
            title: 'Error de Registro',
            message: this.errorMessage,
            duration: 5000,
            showButton: true
          }).subscribe();

          console.error('Error en el registro', error);
        }
      });
    }
  }
}
