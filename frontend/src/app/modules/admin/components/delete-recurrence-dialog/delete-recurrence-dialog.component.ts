import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Recurrence } from '../../../../models/planning.model';

export interface DeleteRecurrenceDialogData {
  recurrence: Recurrence;
}

@Component({
  selector: 'app-delete-recurrence-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './delete-recurrence-dialog.component.html',
  styleUrls: ['./delete-recurrence-dialog.component.scss']
})
export class DeleteRecurrenceDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<DeleteRecurrenceDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DeleteRecurrenceDialogData
  ) {}

  onCancel(): void {
    this.dialogRef.close(null);
  }

  onDeleteFutures(): void {
    this.dialogRef.close(false); // false = supprimer uniquement les futures
  }

  onDeleteAll(): void {
    this.dialogRef.close(true); // true = supprimer toutes les occurrences
  }
}

