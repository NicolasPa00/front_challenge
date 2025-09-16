// app.ts
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ModalComponent } from '../app/components/modal/modal.component/modal.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    ModalComponent
  ],
  template: `
    <router-outlet></router-outlet>
     <app-modal></app-modal>
  `,
  styleUrls: ['./app.css']
})
export class App {
  protected readonly title = 'front_challenge_app';
}
