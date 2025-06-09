// src/app/auth/login/login.component.ts
import { Component } from '@angular/core';
import { AuthService } from '../../shared/services/auth.service';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from "@angular/common";
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from "@angular/forms";

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  loginForm: FormGroup;
  error: string | null = null;
  formSubmitted = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  onSubmit() {
    this.formSubmitted = true;
    this.error = null;

    if (!this.loginForm.valid) {
      this.error = 'Username and password are required.';
      this.formSubmitted = false;
      return;
    }

    this.authService.login(this.loginForm.value).subscribe({
      next: (response: any) => {
        this.formSubmitted = false;
        this.loginForm.reset();

        if (!response.token) {
          this.error = 'Login failed. Token not found in response.';
          return;
        }

        this.authService.saveToken(response.token);

        // DEBUG: log the decoded payload to confirm structure
        const payload = JSON.parse(atob(response.token.split('.')[1]));
        console.log('JWT payload:', payload);

        // Grab the "roles" claim (we expect 'CHILD' or 'TEACHER')
        const role = this.authService.getUserRole();
        console.log('Detected role:', role);

        if (role === 'CHILD') {
          this.router.navigate(['/quiz']);
        } else {
          this.router.navigate(['/dashboard']);
        }
      },
      error: (err) => {
        this.formSubmitted = false;
        this.error = err.error?.error || 'Login failed. Please try again.';
      }
    });
  }
}
