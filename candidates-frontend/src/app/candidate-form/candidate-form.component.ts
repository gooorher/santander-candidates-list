import { Component, ElementRef, ViewChild } from '@angular/core';
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
  @ViewChild('fileInput') fileInput!: ElementRef;


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
      this.handleFile(element.files[0]);
    } else {
      this.selectedFile = null;
      this.candidateForm.patchValue({ candidateFile: null });
      this.candidateForm.get('candidateFile')?.updateValueAndValidity();
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    // Add a CSS class to indicate drag over
    const targetElement = event.target as HTMLElement;
    targetElement.classList.add('drag-over');
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    // Remove the CSS class
    const targetElement = event.target as HTMLElement;
    targetElement.classList.remove('drag-over');
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    // Remove the CSS class
    const targetElement = event.target as HTMLElement;
    targetElement.classList.remove('drag-over');

    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.handleFile(files[0]);
    }
  }

  handleFile(file: File): void {
    this.selectedFile = file;
    this.candidateForm.patchValue({ candidateFile: this.selectedFile });
    this.candidateForm.get('candidateFile')?.updateValueAndValidity();

    // Optional: Display file name to the user
    console.log('File selected:', file.name);
  }


  onSubmit(): void {
    // Mark all fields as touched to display validation messages
    this.candidateForm.markAllAsTouched();

    if (this.candidateForm.valid && this.selectedFile) {
      const { name, surname } = this.candidateForm.value;
      this.candidateService.uploadCandidate(name, surname, this.selectedFile).subscribe({
        next: (newCandidate: Candidate) => {
          this.candidateDataService.addCandidate(newCandidate);
          this.candidateForm.reset();
          this.selectedFile = null;
          // Reset file input manually if needed
          if (this.fileInput) {
            this.fileInput.nativeElement.value = '';
          }
        },
        error: (error) => {
          console.error('Error uploading candidate:', error);
          // Handle error, e.g., show an error message to the user
        }
      });
    } else {
      console.log('Form is invalid or file not selected');
      // Optionally, display a general error message to the user
    }
  }
}
