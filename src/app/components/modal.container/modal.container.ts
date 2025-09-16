// src/app/components/modal-container/modal-container.component.ts
import { Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalComponent } from '../modal/modal.component/modal.component'; // Ajusta la ruta según tu estructura
import { MensajeService } from '../../services/mensaje_service/mensaje-service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-modal-container',
  standalone: true,
  imports: [CommonModule, ModalComponent],
  template: `
    <app-modal
      [type]="currentModal?.type || 'info'"
      [title]="currentModal?.title || ''"
      [message]="currentModal?.message || ''"
      [show]="showModal"
      [showButton]="currentModal?.showButton || false"
      [duration]="currentModal?.duration"
      (closed)="onModalClosed($event)">
    </app-modal>
  `
})
export class ModalContainerComponent implements OnDestroy {
  showModal = false;
  currentModal: any = null;
  private subscription: Subscription;

  constructor(private mensajeService: MensajeService) {
    this.subscription = this.mensajeService.getMensajes().subscribe(config => {
      this.currentModal = config;
      this.showModal = true;
    });
  }

  onModalClosed(confirmed: boolean) {
    this.showModal = false;
    this.mensajeService.cerrarMensaje(confirmed);
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
