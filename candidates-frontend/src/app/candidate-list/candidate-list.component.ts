import { Component, OnDestroy } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { CandidateDataService, Candidate } from '../candidate-data.service';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { CommonModule } from '@angular/common'; // Import CommonModule

@Component({
  selector: 'app-candidate-list',
  standalone: true, // Ensure it's standalone
  imports: [
    CommonModule, // Add CommonModule
    MatTableModule,
  ],
  templateUrl: './candidate-list.component.html',
  styleUrl: './candidate-list.component.scss'
})
export class CandidateListComponent implements OnDestroy {
  dataSource = new MatTableDataSource<Candidate>();
  displayedColumns: string[] = ['name', 'surname', 'seniority', 'years', 'availability'];
  private candidatesSubscription: Subscription;

  constructor(private candidateDataService: CandidateDataService) {
    this.candidatesSubscription = this.candidateDataService.getCandidates().subscribe(candidates => {
      this.dataSource.data = candidates;
    });
  }

  ngOnDestroy(): void {
    if (this.candidatesSubscription) {
      this.candidatesSubscription.unsubscribe();
    }
  }
}
