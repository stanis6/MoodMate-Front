import {ChangeDetectorRef, Component, NgZone} from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../shared/services/auth.service';
import {Router, RouterLink} from "@angular/router";
import { NgClass, NgIf } from "@angular/common";

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    NgIf,
    NgClass
  ],
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  registerForm: FormGroup;
  error: string | null = null;
  formSubmitted = false;

  constructor(private fb: FormBuilder,
              private authService: AuthService,
              private router: Router) {
    this.registerForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      username: ['', Validators.required],
      password: [
        '',
        [
          Validators.required,
          Validators.minLength(8),
          Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)
        ]
      ],
      email: ['', [Validators.required, Validators.email]],
    });
  }

  onSubmit() {
    this.formSubmitted = true;
    this.error = null;

    if (this.registerForm.valid) {
      const formErrors = this.getFormErrors();
      if (formErrors) {
        this.error = formErrors;
        return;
      }

      console.log(this.registerForm.value)

      this.authService.register(this.registerForm.value).subscribe({
        next: (response) => {
          console.log('Registration successful', response);
          this.formSubmitted = false;
          this.registerForm.reset();

          if (response.token) {
            this.authService.saveToken(response.token);
            console.log('Redirecting to dashboard...');
            this.router.navigate(['/dashboard']);
          } else {
            this.error = 'Register failed. Token not found in response.';
          }
        },
        error: (err) => {
          console.log(err)
          this.error = err.error.error || 'Registration failed. Please try again.';
          this.formSubmitted = false;
        }
      });
    } else {
      this.error = this.getFormErrors();
      this.formSubmitted = false;
    }
  }

  private getFormErrors(): string {
    const controls = this.registerForm.controls;

    if (controls['firstName']?.hasError('required')) {
      return 'Prenumele este obligatoriu.';
    }
    if (controls['lastName']?.hasError('required')) {
      return 'Numele de familie este obligatoriu.';
    }
    if (controls['username']?.hasError('required')) {
      return 'Numele de utilizator este obligatoriu.';
    }
    if (controls['password']?.hasError('required')) {
      return 'Parola este obligatorie.';
    }
    if (controls['password']?.hasError('minlength')) {
      return 'Parola trebuie să conțină cel puțin 8 caractere.';
    }
    if (controls['password']?.hasError('pattern')) {
      return 'Parola trebuie să conțină cel puțin o majusculă, o minusculă, un număr și un caracter special.';
    }
    if (controls['email']?.hasError('required')) {
      return 'Adresa de e-mail este obligatorie.';
    }
    if (controls['email']?.hasError('email')) {
      return 'Adresa de e-mail nu este validă.';
    }

    return '';
  }
}
