import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CandidateService } from '../candidate.service';
import { CandidateDataService, Candidate } from '../candidate-data.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { CommonModule } from '@angular/common'; // Import CommonModule

@Component({
  selector: 'app-candidate-form',
  standalone: true, // Ensure it's standalone
  imports: [
    CommonModule, // Add CommonModule
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
  ],
  templateUrl: './candidate-form.component.html',
  styleUrl: './candidate-form.component.scss'
})
export class CandidateFormComponent {
  candidateForm: FormGroup;
  selectedFile: File | null = null;

  constructor(
    private fb: FormBuilder,
    private candidateService: CandidateService,
    private candidateDataService: CandidateDataService
  ) {
    this.candidateForm = this.fb.group({
      name: ['', Validators.required],
      surname: ['', Validators.required],
      candidateFile: [null, Validators.required]
    });
  }

  onFileSelected(event: Event): void {
    const element = event.target as HTMLInputElement;
    if (element.files && element.files.length > 0) {
      this.selectedFile = element.files[0];
      this.candidateForm.patchValue({ candidateFile: this.selectedFile });
      // Optional: Update validity if needed, though Validators.required on the form control should handle it
      this.candidateForm.get('candidateFile')?.updateValueAndValidity();
    } else {
      this.selectedFile = null;
      this.candidateForm.patchValue({ candidateFile: null });
      this.candidateForm.get('candidateFile')?.updateValueAndValidity();
    }
  }

  onSubmit(): void {
    if (this.candidateForm.valid && this.selectedFile) {
      const { name, surname } = this.candidateForm.value;
      this.candidateService.uploadCandidate(name, surname, this.selectedFile).subscribe({
        next: (newCandidate: Candidate) => {
          this.candidateDataService.addCandidate(newCandidate);
          this.candidateForm.reset();
          this.selectedFile = null;
          // Reset file input manually if needed, depending on the template implementation
          const fileInput = document.getElementById('candidateFile') as HTMLInputElement;
          if (fileInput) {
            fileInput.value = '';
          }
        },
        error: (error) => {
          console.error('Error uploading candidate:', error);
          // Handle error, e.g., show an error message to the user
        }
      });
    }
  }
}
