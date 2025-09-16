// components/modal/modal.component.ts
import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MensajeService } from '../../../services/mensaje_service/mensaje-service';
import { Subscription } from 'rxjs';

export type ModalType = 'success' | 'error' | 'warning' | 'info' | 'confirm';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.scss']
})
export class ModalComponent implements OnInit, OnDestroy {
  @Input() type: ModalType = 'info';
  @Input() title: string = '';
  @Input() message: string = '';
  @Input() show: boolean = false;
  @Input() showButton: boolean = false;
  @Input() duration?: number;
  @Output() closed = new EventEmitter<boolean>();

  private subscription: Subscription = new Subscription();

  constructor(private mensajeService: MensajeService) {}

  ngOnInit() {
    // Suscribirse a los mensajes del servicio
    this.subscription = this.mensajeService.getMensajes().subscribe(config => {
      this.type = config.type;
      this.title = config.title;
      this.message = config.message;
      this.showButton = config.showButton || false;
      this.duration = config.duration;
      this.show = true;

      // Auto-cierre si hay duración
      if (this.duration && this.duration > 0) {
        setTimeout(() => {
          this.close(true);
        }, this.duration);
      }
    });
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  close(confirmed: boolean = true) {
    this.show = false;
    this.closed.emit(confirmed);
    this.mensajeService.cerrarMensaje(confirmed);
  }

  get iconClass(): string {
    const icons = {
      success: 'fa-check-circle',
      error: 'fa-exclamation-circle',
      warning: 'fa-exclamation-triangle',
      info: 'fa-info-circle',
      confirm: 'fa-question-circle'
    };
    return icons[this.type];
  }

  get modalClass(): string {
    const classes = {
      success: 'modal-success',
      error: 'modal-error',
      warning: 'modal-warning',
      info: 'modal-info',
      confirm: 'modal-confirm'
    };
    return classes[this.type];
  }
}
