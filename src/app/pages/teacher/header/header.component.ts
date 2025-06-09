import { Component } from '@angular/core';
import { Router, NavigationEnd, RouterModule } from '@angular/router';
import { filter } from 'rxjs/operators';
import { AuthService } from '../../../shared/services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './header.component.html',
})
export class HeaderComponent {
  title = 'Dashboard';

  constructor(
    private router: Router,
    private auth: AuthService
  ) {
    this.router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
      .subscribe(e => {
        this.title = e.urlAfterRedirects === '/classroom'
          ? 'Classroom'
          : 'Dashboard';
      });
  }

  logout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
