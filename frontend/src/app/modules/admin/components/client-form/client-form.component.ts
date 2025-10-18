import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AdminClientService, Client, CreateClientRequest } from '../../../services/admin-client.service';

export interface ClientFormData {
  client?: Client;
}

@Component({
  selector: 'app-client-form',
  templateUrl: './client-form.component.html',
  styleUrls: ['./client-form.component.scss']
})
export class ClientFormComponent implements OnInit {
  
  clientForm: FormGroup;
  isEditMode = false;
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private adminClientService: AdminClientService,
    private snackBar: MatSnackBar,
    private dialogRef: MatDialogRef<ClientFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ClientFormData
  ) {
    this.isEditMode = !!data.client;
    
    this.clientForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      code: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(10)]]
    });
  }

  ngOnInit(): void {
    if (this.isEditMode && this.data.client) {
      this.clientForm.patchValue({
        name: this.data.client.name,
        code: this.data.client.code
      });
    }
  }

  onSubmit(): void {
    if (this.clientForm.valid) {
      this.isLoading = true;
      const formData: CreateClientRequest = this.clientForm.value;
      
      const operation = this.isEditMode 
        ? this.adminClientService.updateClient(this.data.client!.id, formData)
        : this.adminClientService.createClient(formData);
      
      operation.subscribe({
        next: (client) => {
          this.snackBar.open(
            `Client ${this.isEditMode ? 'modifié' : 'créé'} avec succès`, 
            'Fermer', 
            { duration: 3000 }
          );
          this.dialogRef.close(client);
        },
        error: (error) => {
          console.error('Erreur lors de la sauvegarde:', error);
          this.snackBar.open(
            `Erreur lors de la ${this.isEditMode ? 'modification' : 'création'} du client`, 
            'Fermer', 
            { duration: 3000 }
          );
          this.isLoading = false;
        }
      });
    } else {
      this.markFormGroupTouched();
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  private markFormGroupTouched(): void {
    Object.keys(this.clientForm.controls).forEach(key => {
      const control = this.clientForm.get(key);
      control?.markAsTouched();
    });
  }

  getErrorMessage(fieldName: string): string {
    const control = this.clientForm.get(fieldName);
    if (control?.hasError('required')) {
      return `${fieldName === 'name' ? 'Le nom' : 'Le code'} est obligatoire`;
    }
    if (control?.hasError('minlength')) {
      return `${fieldName === 'name' ? 'Le nom' : 'Le code'} doit contenir au moins 2 caractères`;
    }
    if (control?.hasError('maxlength')) {
      return 'Le code ne peut pas dépasser 10 caractères';
    }
    return '';
  }
}
