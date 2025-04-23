import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface Candidate {
  name: string;
  surname: string;
  seniority: string;
  years: number;
  availability: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class CandidateDataService {
  private candidatesSubject = new BehaviorSubject<Candidate[]>([]);
  candidates$: Observable<Candidate[]> = this.candidatesSubject.asObservable();

  constructor() { }

  addCandidate(candidate: Candidate): void {
    const currentCandidates = this.candidatesSubject.value;
    this.candidatesSubject.next([...currentCandidates, candidate]);
  }

  getCandidates(): Observable<Candidate[]> {
    return this.candidates$;
  }

  getCurrentCandidates(): Candidate[] {
    return this.candidatesSubject.value;
  }
}
