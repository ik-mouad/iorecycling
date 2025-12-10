import { Component, Inject, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule, provideNativeDateAdapter } from '@angular/material/core';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { DocumentService } from '../../../../services/document.service';
import { DocumentInfo } from '../../../../models/enlevement.model';

export interface DocumentUploadData {
  enlevementId?: number;
  societeId?: number;
  type: 'enlevement' | 'mensuel';
}

@Component({
  selector: 'app-document-upload',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSnackBarModule,
    MatProgressSpinnerModule
  ],
  providers: [provideNativeDateAdapter()],
  templateUrl: './document-upload.component.html',
  styleUrls: ['./document-upload.component.scss']
})
export class DocumentUploadComponent implements OnInit, AfterViewInit {
  @ViewChild('fileInput', { static: false }) fileInputRef!: ElementRef<HTMLInputElement>;
  
  uploadForm!: FormGroup;
  selectedFile: File | null = null;
  isLoading = false;
  today = new Date();

  // Types de documents selon le contexte
  documentTypesEnlevement = [
    { value: 'BSDI', label: 'BSDI (Bordereau de Suivi des Déchets Industriels)' },
    { value: 'PV_DESTRUCTION', label: 'PV de Destruction' },
    { value: 'AUTRE', label: 'Autre' }
  ];

  documentTypesMensuel = [
    { value: 'ATTESTATION_VALORISATION', label: 'Attestation de Valorisation' },
    { value: 'ATTESTATION_ELIMINATION', label: 'Attestation d\'Élimination' },
    { value: 'FACTURE', label: 'Facture' }
  ];

  get documentTypes() {
    return this.data.type === 'enlevement' 
      ? this.documentTypesEnlevement 
      : this.documentTypesMensuel;
  }

  constructor(
    private fb: FormBuilder,
    private documentService: DocumentService,
    private snackBar: MatSnackBar,
    private dialogRef: MatDialogRef<DocumentUploadComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DocumentUploadData
  ) {}

  ngOnInit(): void {
    this.uploadForm = this.fb.group({
      typeDocument: ['', Validators.required],
      periodeMois: ['']
    });

    // Période obligatoire pour les documents mensuels
    if (this.data.type === 'mensuel') {
      this.uploadForm.get('periodeMois')?.setValidators([Validators.required]);
    }
  }

  ngAfterViewInit(): void {
    // S'assurer que l'input file est accessible après l'initialisation de la vue
    console.log('ViewChild fileInput:', this.fileInputRef);
  }

  openFileDialog(): void {
    // Utiliser setTimeout pour s'assurer que le DOM est prêt
    setTimeout(() => {
      if (this.fileInputRef?.nativeElement) {
        this.fileInputRef.nativeElement.click();
      } else {
        // Fallback: chercher l'élément dans le DOM
        const fileInput = document.getElementById('fileInput') as HTMLInputElement;
        if (fileInput) {
          fileInput.click();
        } else {
          console.error('Input file non trouvé');
        }
      }
    }, 0);
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
      console.log('Fichier sélectionné:', this.selectedFile.name);
    }
  }



  submit(): void {
    if (this.uploadForm.invalid || !this.selectedFile) {
      this.snackBar.open('Veuillez remplir tous les champs et sélectionner un fichier', 'Fermer', { duration: 3000 });
      return;
    }

    this.isLoading = true;

    const typeDocument = this.uploadForm.value.typeDocument;

    if (this.data.type === 'enlevement' && this.data.enlevementId) {
      this.uploadDocumentEnlevement(this.data.enlevementId, typeDocument, this.selectedFile!);
    } else if (this.data.type === 'mensuel' && this.data.societeId) {
      const periodeMois = this.uploadForm.value.periodeMois;
      this.uploadDocumentMensuel(this.data.societeId, typeDocument, periodeMois, this.selectedFile!);
    } else {
      this.snackBar.open('Données manquantes pour l\'upload', 'Fermer', { duration: 3000 });
      this.isLoading = false;
    }
  }

  private uploadDocumentEnlevement(enlevementId: number, typeDocument: string, file: File): void {
    this.documentService.uploadDocumentEnlevement(enlevementId, typeDocument, file).subscribe({
      next: (document) => {
        this.snackBar.open('Document uploadé avec succès', 'Fermer', { duration: 3000 });
        this.dialogRef.close(document);
      },
      error: (error) => {
        console.error('Erreur upload document:', error);
        this.snackBar.open('Erreur lors de l\'upload', 'Fermer', { duration: 3000 });
        this.isLoading = false;
      }
    });
  }

  private uploadDocumentMensuel(societeId: number, typeDocument: string, periodeMois: string, file: File): void {
    this.documentService.uploadDocumentMensuel(societeId, typeDocument, periodeMois, file).subscribe({
      next: (document) => {
        this.snackBar.open('Document uploadé avec succès', 'Fermer', { duration: 3000 });
        this.dialogRef.close(document);
      },
      error: (error) => {
        console.error('Erreur upload document mensuel:', error);
        this.snackBar.open('Erreur lors de l\'upload', 'Fermer', { duration: 3000 });
        this.isLoading = false;
      }
    });
  }

  cancel(): void {
    this.dialogRef.close();
  }
}
