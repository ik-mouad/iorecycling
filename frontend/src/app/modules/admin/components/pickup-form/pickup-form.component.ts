import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AdminPickupService, CreatePickupRequest, PickupItem } from '../../../services/admin-pickup.service';
import { Client } from '../../../services/admin-client.service';

export interface PickupFormData {
  pickup?: any;
  clients: Client[];
}

@Component({
  selector: 'app-pickup-form',
  templateUrl: './pickup-form.component.html',
  styleUrls: ['./pickup-form.component.scss']
})
export class PickupFormComponent implements OnInit {
  
  pickupForm: FormGroup;
  isEditMode = false;
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private adminPickupService: AdminPickupService,
    private snackBar: MatSnackBar,
    private dialogRef: MatDialogRef<PickupFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: PickupFormData
  ) {
    this.isEditMode = !!data.pickup;
    
    this.pickupForm = this.fb.group({
      clientId: ['', Validators.required],
      date: ['', Validators.required],
      type: ['BANAL', Validators.required],
      siteId: [''],
      kgValorisables: [0, [Validators.min(0)]],
      kgBanals: [0, [Validators.min(0)]],
      kgDangereux: [0, [Validators.min(0)]],
      items: this.fb.array([])
    });
  }

  ngOnInit(): void {
    if (this.isEditMode && this.data.pickup) {
      this.pickupForm.patchValue({
        clientId: this.data.pickup.clientId,
        date: this.data.pickup.date,
        type: this.data.pickup.type,
        siteId: this.data.pickup.siteId,
        kgValorisables: this.data.pickup.kgValorisables || 0,
        kgBanals: this.data.pickup.kgBanals || 0,
        kgDangereux: this.data.pickup.kgDangereux || 0
      });
    }
  }

  get itemsArray(): FormArray {
    return this.pickupForm.get('items') as FormArray;
  }

  addItem(): void {
    const itemForm = this.fb.group({
      material: ['', Validators.required],
      qtyKg: [0, [Validators.required, Validators.min(0.001)]],
      priceMadPerKg: [0, [Validators.required, Validators.min(0)]]
    });
    this.itemsArray.push(itemForm);
  }

  removeItem(index: number): void {
    this.itemsArray.removeAt(index);
  }

  onSubmit(): void {
    if (this.pickupForm.valid) {
      this.isLoading = true;
      const formData: CreatePickupRequest = this.pickupForm.value;
      
      const operation = this.isEditMode 
        ? this.adminPickupService.updatePickup(this.data.pickup!.id, formData)
        : this.adminPickupService.createPickup(formData);
      
      operation.subscribe({
        next: (pickup) => {
          this.snackBar.open(
            `Enlèvement ${this.isEditMode ? 'modifié' : 'créé'} avec succès`, 
            'Fermer', 
            { duration: 3000 }
          );
          this.dialogRef.close(pickup);
        },
        error: (error) => {
          console.error('Erreur lors de la sauvegarde:', error);
          this.snackBar.open(
            `Erreur lors de la ${this.isEditMode ? 'modification' : 'création'} de l'enlèvement`, 
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
    Object.keys(this.pickupForm.controls).forEach(key => {
      const control = this.pickupForm.get(key);
      control?.markAsTouched();
    });
  }

  getErrorMessage(fieldName: string): string {
    const control = this.pickupForm.get(fieldName);
    if (control?.hasError('required')) {
      return 'Ce champ est obligatoire';
    }
    if (control?.hasError('min')) {
      return 'La valeur doit être positive';
    }
    return '';
  }
}
