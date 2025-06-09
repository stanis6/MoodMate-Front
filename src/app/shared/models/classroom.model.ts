import { Child } from './child.model';
export interface Classroom {
  id: string;
  name: string;
  teacherId: string;
  students: Child[];
}
