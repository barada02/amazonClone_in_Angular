import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoginComponent } from '../login/login.component';
import { SignupComponent } from '../signup/signup.component';

@Component({
  selector: 'app-auth-modal',
  standalone: true,
  imports: [CommonModule, LoginComponent, SignupComponent],
  templateUrl: './auth-modal.component.html',
  styleUrls: ['./auth-modal.component.css']
})
export class AuthModalComponent {
  @Output() close = new EventEmitter<void>();
  activeTab: 'login' | 'signup' = 'login';

  switchTab(tab: 'login' | 'signup') {
    this.activeTab = tab;
  }

  closeModal() {
    this.close.emit();
  }

  onLoginSuccess() {
    this.closeModal();
  }

  onSignupSuccess() {
    this.switchTab('login');
  }
}
