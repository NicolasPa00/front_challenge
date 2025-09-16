// services/mensaje_service/mensaje-service.ts
import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';

export interface MensajeConfig {
  type: 'success' | 'error' | 'warning' | 'info' | 'confirm';
  title: string;
  message: string;
  duration?: number;
  showButton?: boolean;
}
// services/mensaje_service/mensaje-service.ts
@Injectable({
  providedIn: 'root'
})
export class MensajeService {
  private mensajeSubject = new Subject<MensajeConfig>();
  private confirmacionSubject = new Subject<boolean>();

  // Cambia el tipo de retorno para que siempre devuelva Observable<boolean>
  mostrarMensaje(config: MensajeConfig): Observable<boolean> {
    this.mensajeSubject.next(config);

    // Siempre devolvemos un observable
    return new Observable<boolean>(observer => {
      const subscription = this.confirmacionSubject.subscribe(confirmado => {
        observer.next(confirmado);
        observer.complete();
        subscription.unsubscribe();
      });

      // Auto-cierre si hay duración especificada
      if (config.duration && config.duration > 0) {
        setTimeout(() => {
          this.cerrarMensaje(true);
        }, config.duration);
      }
    });
  }

  cerrarMensaje(confirmado: boolean = true) {
    this.confirmacionSubject.next(confirmado);
  }

  getMensajes(): Observable<MensajeConfig> {
    return this.mensajeSubject.asObservable();
  }
}
