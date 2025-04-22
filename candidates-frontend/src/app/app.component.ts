import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CandidateFormComponent } from './candidate-form/candidate-form.component'; // Import CandidateFormComponent
import { CandidateListComponent } from './candidate-list/candidate-list.component'; // Import CandidateListComponent

@Component({
  selector: 'app-root',
  standalone: true, // Ensure it's standalone
  imports: [
    RouterOutlet,
    CandidateFormComponent, // Add CandidateFormComponent
    CandidateListComponent, // Add CandidateListComponent
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'candidates-frontend';
}
