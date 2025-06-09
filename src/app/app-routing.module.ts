import { NgModule }            from '@angular/core';
import { RouterModule, Routes }from '@angular/router';
import { LoginComponent }      from './auth/login/login.component';
import { RegisterComponent }   from './auth/register/register.component';
import { DashboardComponent }  from './pages/teacher/dashboard/dashboard.component';
import { AuthGuard }           from './auth/auth.guard';
import { ClassroomComponent }  from './pages/teacher/classroom/classroom.component';
import { ConfirmComponent }    from './features/confirm/confirm.component';
import {QuizComponent} from "./pages/child/quiz/quiz.component";
import {QuizDoneComponent} from "./pages/child/quiz/done/quiz-done.component";  // <-- import

export const routes: Routes = [
  { path: '',          redirectTo: 'login',    pathMatch: 'full' },
  { path: 'login',     component: LoginComponent },
  { path: 'register',  component: RegisterComponent },
  { path: 'quiz',     component: QuizComponent, canActivate: [AuthGuard] },
  { path: 'quiz/done', component: QuizDoneComponent, canActivate: [AuthGuard] },
  { path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard] },
  { path: 'classroom', component: ClassroomComponent,  canActivate: [AuthGuard] },
  { path: 'confirm',   component: ConfirmComponent },
  { path: '**',        redirectTo: 'login',},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
