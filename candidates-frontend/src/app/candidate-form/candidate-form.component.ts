import { Component, ElementRef, ViewChild, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CandidateService } from '../candidate.service';
import { CandidateDataService, Candidate } from '../candidate-data.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { CommonModule } from '@angular/common';
import * as XLSX from 'xlsx'; // Import the xlsx library
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-candidate-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
  ],
  templateUrl: './candidate-form.component.html',
  styleUrl: './candidate-form.component.scss'
})
export class CandidateFormComponent implements OnDestroy {
  candidateForm: FormGroup;
  selectedFile: File | null = null;
  fileUploadError: string | null = null;
  uploadSuccessMessage: string | null = null; // New property for success message
  @ViewChild('fileInput') fileInput!: ElementRef;
  private candidates: Candidate[] = [];
  private candidatesSubscription: Subscription;

  constructor(
    private fb: FormBuilder,
    private candidateService: CandidateService,
    private candidateDataService: CandidateDataService
  ) {
    this.candidateForm = this.fb.group({
      name: ['', Validators.required],
      surname: ['', Validators.required],
      candidateFile: [null, [Validators.required, this.excelFileValidator.bind(this)]]
    });

    this.candidatesSubscription = this.candidateDataService.getCandidates().subscribe(
      (candidates) => {
        this.candidates = candidates;
      }
    );
  }

  ngOnDestroy(): void {
    if (this.candidatesSubscription) {
      this.candidatesSubscription.unsubscribe();
    }
  }

  onFileSelected(event: Event): void {
    const element = event.target as HTMLInputElement;
    if (element.files && element.files.length > 0) {
      this.handleFile(element.files[0]);
    } else {
      this.selectedFile = null;
      this.candidateForm.patchValue({ candidateFile: null });
      this.candidateForm.get('candidateFile')?.updateValueAndValidity();
      this.fileUploadError = null;
      this.uploadSuccessMessage = null; // Clear success message on new file selection
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    const targetElement = event.target as HTMLElement;
    targetElement.classList.add('drag-over');
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    const targetElement = event.target as HTMLElement;
    targetElement.classList.remove('drag-over');
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
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
    // Update validity to trigger the validator
    const candidateFileControl = this.candidateForm.get('candidateFile');
    candidateFileControl?.updateValueAndValidity();

    // Check for errors after validation runs
    if (candidateFileControl?.errors) {
      if (candidateFileControl.hasError('invalidFileType')) {
        this.fileUploadError = 'El archivo debe ser un archivo Excel (.xlsx o .xls).';
      }
      // Add checks for other potential errors from a more complex validator if implemented later
      else {
         this.fileUploadError = 'Error de validación del archivo.'; // Generic error
      }
    } else {
      this.fileUploadError = null; // Clear error if valid
      this.uploadSuccessMessage = null; // Clear success message if file is valid
    }
  }

  excelFileValidator(control: any): { [key: string]: any } | null {
    const file = control.value as File;
    if (!file) {
      return null; // Let Validators.required handle the absence of a file
    }

    const allowedExtensions = ['.xlsx', '.xls'];
    const fileExtension = file.name.toLowerCase().slice(file.name.lastIndexOf('.'));

    if (!allowedExtensions.includes(fileExtension)) {
      return { invalidFileType: true };
    }

    return null; // File type is valid
  }


  onSubmit(): void {
    this.candidateForm.markAllAsTouched();

    if (this.candidateForm.valid && this.selectedFile && !this.fileUploadError) {
      const { name, surname } = this.candidateForm.value;

      // Check for duplicates before uploading
      const currentCandidates = this.candidateDataService.getCurrentCandidates();
      const isDuplicate = currentCandidates.some(candidate =>
        candidate.name.toLowerCase() === name.toLowerCase() &&
        candidate.surname.toLowerCase() === surname.toLowerCase()
      );

      if (isDuplicate) {
        this.fileUploadError = `El candidato ${name} ${surname} ya existe.`;
        console.log('Duplicate candidate detected.');
        return;
      }


      this.candidateService.uploadCandidate(name, surname, this.selectedFile).subscribe({
        next: (newCandidate: Candidate) => {
          this.candidateDataService.addCandidate(newCandidate);
          this.uploadSuccessMessage = `Candidato ${newCandidate.name} ${newCandidate.surname} añadido exitosamente.`; // Set success message
          this.fileUploadError = null; // Clear any previous error message
          this.candidateForm.reset();
          this.selectedFile = null;
          if (this.fileInput) {
            this.fileInput.nativeElement.value = '';
          }
        },
        error: (error) => {
          console.error('Error uploading candidate:', error);
          this.fileUploadError = 'Error al subir el candidato. Revisa la estructura del excel';
          this.uploadSuccessMessage = null; // Clear success message on error
        }
      });
    } else {
      console.log('Formulario inválido o archivo no válido.');
    }
  }
}
