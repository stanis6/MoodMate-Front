// src/app/features/quiz/quiz.component.ts
import { Component, OnInit } from '@angular/core';
import { HttpClient }        from '@angular/common/http';
import { Router }            from '@angular/router';
import { CommonModule }      from '@angular/common';
import { AuthService }       from '../../../shared/services/auth.service';
import { QuestionDto }       from '../../../shared/models/question.model';

@Component({
  selector: 'app-quiz',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './quiz.component.html',
})
export class QuizComponent implements OnInit {
  questions: QuestionDto[] = [];
  answers: Record<string, string> = {};
  currentStepIndex = 0;

  constructor(
    private http: HttpClient,
    private router: Router,
    private auth: AuthService
  ) {}

  ngOnInit() {
    this.http.get<{ completed: boolean }>(
      'http://localhost:8080/api/quiz/completed'
    ).subscribe({
      next: (res) => {
        if (res.completed) {
          this.router.navigate(['/quiz/done']);
        } else {
          this.loadQuestions();
        }
      },
      error: () => {
        this.router.navigate(['/login']);
      }
    });
  }

  private loadQuestions() {
    this.http.get<QuestionDto[]>('http://localhost:8080/api/quiz/today')
      .subscribe(qs => {
        this.questions = qs.sort((a, b) => a.orderIndex - b.orderIndex);
      });
  }

  selectEmoji(q: QuestionDto, emoji: 'sad' | 'neutral' | 'happy') {
    this.answers[q.id] = emoji;
    // if positive, skip follow-ups
    if (emoji === 'happy') {
      this.skipFollowUps(q.id);
    }
    this.nextStep();
  }

  selectYesNo(q: QuestionDto, yn: 'yes' | 'no') {
    this.answers[q.id] = yn;
    if (yn === 'yes') {
      this.skipFollowUps(q.id);
    }
    this.nextStep();
  }

  private skipFollowUps(parentId: string) {
    for (let qq of this.questions) {
      if (
        qq.parentQuestionId === parentId &&
        (qq.condition === 'EMOJI_NEGATIVE' || qq.condition === 'YES_NO_NO')
      ) {
        this.answers[qq.id] = 'SKIPPED';
      }
    }
  }

  nextStep() {
    this.currentStepIndex++;
    while (this.currentStepIndex < this.questions.length) {
      const q = this.questions[this.currentStepIndex];
      const alreadyAnswered = !!this.answers[q.id];
      const shouldHide = this.isHidden(q);
      if (alreadyAnswered || shouldHide) {
        this.currentStepIndex++;
      } else {
        break;
      }
    }
    if (this.currentStepIndex >= this.questions.length) {
      this.submitAll();
    }
  }

  submitAll() {
    const childId = this.auth.getUserId();
    if (!childId) {
      this.router.navigate(['/login']);
      return;
    }
    const payload = {
      childId,
      quizDate: new Date().toISOString().substring(0, 10),
      answers: Object.entries(this.answers)
        .filter(([_, ans]) => ans !== 'SKIPPED')
        .map(([qid, ans]) => ({
          questionId: qid,
          answer: ans
        }))
    };

    this.http.post('http://localhost:8080/api/quiz/submit', payload).subscribe({
      next: () => this.router.navigate(['/quiz/done']),
      error: () => alert('A apărut o eroare. Încearcă din nou.')
    });
  }

  isHidden(q: QuestionDto): boolean {
    if (this.answers[q.id] === 'SKIPPED') return true;
    if (!q.isPrimary && q.parentQuestionId) {
      const parentAns = this.answers[q.parentQuestionId];
      if (q.condition === 'EMOJI_NEGATIVE') {
        return parentAns !== 'sad' && parentAns !== 'neutral';
      }
      if (q.condition === 'YES_NO_NO') {
        return parentAns !== 'no';
      }
    }
    return false;
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }
}
