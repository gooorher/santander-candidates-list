import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Candidate } from './candidate-data.service'; // Import the Candidate interface

@Injectable({
  providedIn: 'root'
})
export class CandidateService {
  private apiUrl = 'http://localhost:3000/candidates'; // Assuming backend runs on port 3000

  constructor(private http: HttpClient) { }

  uploadCandidate(name: string, surname: string, file: File): Observable<Candidate> {
    const formData = new FormData();
    formData.append('name', name);
    formData.append('surname', surname);
    formData.append('candidateFile', file);

    return this.http.post<Candidate>(this.apiUrl, formData);
  }
}
