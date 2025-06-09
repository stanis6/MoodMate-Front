import { Component, OnInit }     from '@angular/core';
import { HttpClient }            from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import {NgIf, NgClass, NgSwitch, NgSwitchCase} from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';

interface ConfirmationResponse {
  childId: string;
  username: string;
  firstName: string;
  lastName: string;
}

@Component({
  selector: 'app-confirm',
  standalone: true,
  imports: [NgIf, NgClass, ReactiveFormsModule, NgSwitch, NgSwitchCase],
  templateUrl: './confirm.component.html',
  styleUrls: ['./confirm.component.css']
})
export class ConfirmComponent implements OnInit {
  status: 'pending' | 'showForm' | 'success' | 'error' = 'pending';
  message = '';

  childUsername = '';
  childId = '';
  childFirstName = '';
  childLastName = '';

  setPasswordForm: FormGroup;

  constructor(
    private http:   HttpClient,
    private route:  ActivatedRoute,
    private router: Router,
    fb:             FormBuilder
  ) {
    this.setPasswordForm = fb.group({
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    }, {
      validators: this.passwordsMatch
    });
  }

  ngOnInit() {
    const token = this.route.snapshot.queryParamMap.get('token');
    if (!token) {
      this.status = 'error';
      this.message = 'No confirmation token provided.';
      return;
    }

    this.http
      .get<ConfirmationResponse>(
        `http://localhost:8080/api/teacher/confirm?token=${token}`
      )
      .subscribe({
        next: (res) => {
          this.childUsername   = res.username;
          this.childId         = res.childId;
          this.childFirstName  = res.firstName;
          this.childLastName   = res.lastName;
          this.status          = 'showForm';
        },
        error: (err) => {
          this.status = 'error';
          if (err.error && err.error.error) {
            this.message = err.error.error;
          } else {
            this.message = 'An unexpected error occurred.';
          }
        }
      });
  }

  private passwordsMatch(group: FormGroup) {
    const p1 = group.get('newPassword')?.value;
    const p2 = group.get('confirmPassword')?.value;
    return p1 === p2 ? null : { mismatch: true };
  }

  onSubmitPassword() {
    if (this.setPasswordForm.invalid) return;

    const payload = {
      childId: this.childId,
      newPassword: this.setPasswordForm.value.newPassword
    };

    this.http
      .post(
        'http://localhost:8080/api/teacher/set-child-password',
        payload
      )
      .subscribe({
        next: (resp: any) => {
          this.status = 'success';
          this.message = resp.message || 'Password updated!';
        },
        error: (err) => {
          this.status = 'error';
          if (err.error && err.error.error) {
            this.message = err.error.error;
          } else {
            this.message = 'Failed to set password.';
          }
        }
      });
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }
}
