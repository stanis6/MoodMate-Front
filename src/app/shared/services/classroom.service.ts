import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {Classroom} from "../models/classroom.model";
import {ChildAccountRequest} from "../models/child-account-request.model";

@Injectable({
  providedIn: 'root',
})
export class ClassroomService {
  private baseUrl = 'http://localhost:8080/api/teacher';

  constructor(private http: HttpClient) {}

  getClassroom(): Observable<Classroom> {
    console.log(this.http.get<Classroom>(`${this.baseUrl}/classroom`))
    return this.http.get<Classroom>(`${this.baseUrl}/classroom`);
  }

  createChild(request: ChildAccountRequest): Observable<string> {
    return this.http.post(
      `${this.baseUrl}/create-child`,
      request,
      { responseType: 'text' }
    );
  }
}
