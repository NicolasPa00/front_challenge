import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule, DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import { ApiService } from '../../services/user';
import { MensajeService } from '../../services/mensaje_service/mensaje-service';

interface Task {
  id: number;
  title: string;
  description: string;
  createdAt: Date;
  completed: boolean;
  id_act_usuario: number;
}

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.scss'],
  imports: [CommonModule, ReactiveFormsModule, DatePipe],
  standalone: true // Si estás usando componentes standalone
})
export class DashboardComponent implements OnInit {
  taskForm: FormGroup;
  editForm: FormGroup;
  tasks: Task[] = [];
  filteredTasks: Task[] = [];
  editingTask: Task | null = null;
  currentFilter: 'all' | 'pending' | 'completed' = 'all';

  // Estadísticas
  totalTasks = 0;
  completedTasks = 0;
  pendingTasks = 0;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private ApiService: ApiService,
    private MensajeService: MensajeService
  ) {
    this.taskForm = this.fb.group({
      title: ['', Validators.required],
      description: ['']
    });

    this.editForm = this.fb.group({
      title: ['', Validators.required],
      description: ['']
    });
  }

  ngOnInit(): void {
    this.loadTasks();
    this.updateStats();
  }

  addTask(): void {
    if (this.taskForm.valid) {
      const taskData = {
        titulo: this.taskForm.value.title,
        description: this.taskForm.value.description,
        id_usuario: localStorage.getItem('id_usuario') // lo mandamos desde storage
      };

      this.ApiService.saveTask(taskData).subscribe({
        next: (res) => {
          const savedTask: Task = {
            id: res.actividad.id_actividad,
            title: res.actividad.titulo,
            description: res.actividad.description,
            createdAt: new Date(res.actividad.createdAt ?? new Date()),
            completed: false
            , id_act_usuario: res.id_act_usuario
          };
          this.MensajeService.mostrarMensaje({
            type: 'success',
            title: 'Tarea creada',
            message: 'La tarea se ha creado exitosamente.',
            duration: 3000,
            showButton: false
          }).subscribe();

          this.tasks.unshift(savedTask);
          this.taskForm.reset();
          this.applyFilter();
          this.updateStats();
        },
        error: (err) => {
          console.error('Error guardando tarea', err);
          this.MensajeService.mostrarMensaje({
            type: 'error',
            title: 'Error de login',
            message: err.error?.message || 'Ocurrió un error inesperado.',
            duration: 5000,
            showButton: true
          }).subscribe();
        }
      });
    }
  }

toggleTask(id_act_usuario: number): void {
  const task = this.tasks.find(t => t.id_act_usuario === id_act_usuario);

  if (task) {
    const estadoAnterior = task.completed;
    task.completed = !task.completed;
    this.applyFilter();
    this.updateStats();

    const status = task.completed ? 'Completada' : 'Pendiente';
    this.ApiService.completarActividad(task.id_act_usuario, status).subscribe({
        next: () => {
          this.loadTasks();
          this.updateStats();
          this.applyFilter();
          // Éxito - Mostrar mensaje de confirmación
          this.MensajeService.mostrarMensaje({
            type: 'success',
            title: task.completed ? 'Tarea completada' : 'Tarea pendiente',
            message: task.completed ? 'La tarea ha sido marcada como completada.' : 'La tarea ha sido marcada como pendiente.',
            duration: 3000,
            showButton: false
          }).subscribe();
        },
        error: (err) => {
          console.error('Error actualizando estado de tarea', err);
          task.completed = estadoAnterior;
          this.loadTasks();
          this.applyFilter();
          this.updateStats();
          this.MensajeService.mostrarMensaje({
            type: 'error',
            title: 'Error',
            message: err.error?.message || 'Error al actualizar el estado de la tarea',
            duration: 5000,
            showButton: true
          }).subscribe();
        }
      });
    }
  }
  // dashboard.ts
  editTask(task: Task): void {
    this.editingTask = task;
    this.editForm.patchValue({
      title: task.title,
      description: task.description
    });
  }

  saveEdit(): void {
    if (this.editingTask && this.editForm.valid) {
      this.editingTask.title = this.editForm.value.title;
      this.editingTask.description = this.editForm.value.description;
      this.ApiService.editTask(this.editingTask.id, {
        titulo: this.editingTask.title,
        description: this.editingTask.description
      }).subscribe({
        next: () => {
          this.updateStats();
        },
        error: (err) => {
          console.error('Error actualizando tarea', err);
          this.MensajeService.mostrarMensaje({
            type: 'error',
            title: 'Error de login',
            message: err.error?.message || 'Ocurrió un error inesperado.',
            duration: 5000,
            showButton: true
          }).subscribe();
        }
      });
      this.MensajeService.mostrarMensaje({
        type: 'success',
        title: 'Tarea actualizada',
        message: 'La tarea se ha actualizado exitosamente.',
        duration: 3000,
        showButton: false
      }).subscribe();
      this.cancelEdit();
      this.applyFilter();
    }
  }

  cancelEdit(): void {
    this.editingTask = null;
    this.editForm.reset();
  }

  confirmDelete(task: Task): void {
  this.MensajeService.mostrarMensaje({
    type: 'confirm',
    title: 'Confirmar eliminación',
    message: `¿Estás seguro de que quieres eliminar la tarea "${task.title}"? Esta acción no se puede deshacer.`,
    duration: 0,
    showButton: true
  }).subscribe((confirmado: boolean) => {
    if (confirmado) {
      this.deleteTask(task.id);
    }
  });
}

  deleteTask(id: number): void {
  // Guardar la tarea por si hay error para revertir
  const taskToDelete = this.tasks.find(t => t.id === id);

  if (!taskToDelete) return;

  // Eliminación optimista (remover inmediatamente para feedback visual)
  this.tasks = this.tasks.filter(task => task.id !== id);
  this.applyFilter();
  this.updateStats();

  // Llamar al servicio para eliminar en la base de datos
  this.ApiService.eliminarActividad(id).subscribe({
    next: () => {
      // Éxito - Mostrar mensaje de confirmación
      this.MensajeService.mostrarMensaje({
        type: 'success',
        title: 'Tarea eliminada',
        message: 'La tarea ha sido eliminada correctamente.',
        duration: 3000,
        showButton: false
      }).subscribe();
    },
    error: (err: any) => {
      console.error('Error eliminando tarea', err);

      // Revertir la eliminación optimista por el error
      if (taskToDelete) {
        this.tasks = [...this.tasks, taskToDelete];
        this.applyFilter();
        this.updateStats();
      }

      // Mostrar mensaje de error
      this.MensajeService.mostrarMensaje({
        type: 'error',
        title: 'Error',
        message: err.error?.message || 'Error al eliminar la tarea',
        duration: 5000,
        showButton: true
      }).subscribe();
    }
  });
}

  setFilter(filter: 'all' | 'pending' | 'completed'): void {
    this.currentFilter = filter;
    this.applyFilter();
  }

  applyFilter(): void {
    switch (this.currentFilter) {
      case 'pending':
        this.filteredTasks = this.tasks.filter(task => !task.completed);
        break;
      case 'completed':
        this.filteredTasks = this.tasks.filter(task => task.completed);
        break;
      default:
        this.filteredTasks = [...this.tasks];
    }
  }

  updateStats(): void {
    this.totalTasks = this.tasks.length;
    this.completedTasks = this.tasks.filter(task => task.completed).length;
    this.pendingTasks = this.totalTasks - this.completedTasks;
  }

  loadTasks(): void {
    this.ApiService.getTasksByUserId(localStorage.getItem('id_usuario') || '').subscribe({
      next: (res) => {
        this.tasks = res.actividades.map((actividad: any) => ({
          id: actividad.actividad.id_actividad,
          title: actividad.actividad.titulo,
          description: actividad.actividad.description,
          createdAt: actividad.fecha_creacion ,
          completed: actividad.status == 'Completada' ? true : false,
          id_act_usuario: actividad.id_act_usuario
        }));
        this.applyFilter();
        this.updateStats();
      },
      error: (err) => {
        console.error('Error cargando tareas', err);
      }
    });
    this.applyFilter();
  }

  logout(): void {
    // Lógica para cerrar sesión
    this.router.navigate(['/login']);
  }
}
