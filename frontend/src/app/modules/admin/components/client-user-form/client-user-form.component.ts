import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { ClientUserService } from '../../../../services/client-user.service';
import { ClientUser, CreateClientUserRequest } from '../../../../models/societe.model';

export interface ClientUserFormData {
  societeId: number;
  user?: ClientUser;
}

@Component({
  selector: 'app-client-user-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSnackBarModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSlideToggleModule
  ],
  templateUrl: './client-user-form.component.html',
  styleUrls: ['./client-user-form.component.scss']
})
export class ClientUserFormComponent implements OnInit {
  userForm: FormGroup;
  isEditMode: boolean;
  isLoading = false;
  hidePassword = true;

  constructor(
    private fb: FormBuilder,
    private clientUserService: ClientUserService,
    private snackBar: MatSnackBar,
    private dialogRef: MatDialogRef<ClientUserFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ClientUserFormData
  ) {
    this.isEditMode = !!data?.user;
    this.userForm = this.fb.group({
      prenom: ['', [Validators.required, Validators.maxLength(100)]],
      nom: ['', [Validators.required, Validators.maxLength(100)]],
      posteOccupe: ['', [Validators.maxLength(100)]],
      email: ['', [Validators.required, Validators.email]],
      telephone: ['', [Validators.maxLength(20)]],
      password: [''],
      temporaryPassword: [true]
    });

    const passwordControl = this.userForm.get('password');
    if (passwordControl) {
      const validators = [Validators.minLength(8)];
      if (!this.isEditMode) {
        validators.push(Validators.required);
      }
      passwordControl.setValidators(validators);
    }
  }

  ngOnInit(): void {
    if (this.isEditMode && this.data.user) {
      this.userForm.patchValue({
        prenom: this.data.user.prenom,
        nom: this.data.user.nom,
        posteOccupe: this.data.user.posteOccupe,
        email: this.data.user.email,
        telephone: this.data.user.telephone
      });
    }
  }

  submit(): void {
    if (this.userForm.invalid) {
      this.userForm.markAllAsTouched();
      return;
    }

    const { password, temporaryPassword, ...rest } = this.userForm.value;

    const payload: CreateClientUserRequest = {
      ...rest,
      societeId: this.data.user?.societeId ?? this.data.societeId,
      password: password || undefined,
      temporaryPassword
    };

    this.isLoading = true;
    const request$ = this.isEditMode && this.data.user
      ? this.clientUserService.updateUser(this.data.user.id, payload)
      : this.clientUserService.createUser(this.data.societeId, payload);

    request$.subscribe({
      next: (user) => {
        this.snackBar.open(
          `Utilisateur ${this.isEditMode ? 'mis à jour' : 'créé'} avec succès`,
          'Fermer',
          { duration: 3000 }
        );
        this.dialogRef.close(user);
      },
      error: (error) => {
        console.error('Erreur sauvegarde utilisateur', error);
        this.snackBar.open('Erreur lors de la sauvegarde', 'Fermer', { duration: 3000 });
        this.isLoading = false;
      }
    });
  }

  cancel(): void {
    this.dialogRef.close();
  }

  getErrorMessage(field: string): string {
    const control = this.userForm.get(field);
    if (!control) {
      return '';
    }
    if (control.hasError('required')) {
      if (field === 'password') {
        return 'Le mot de passe est obligatoire';
      }
      return 'Champ obligatoire';
    }
    if (control.hasError('email')) {
      return 'Email invalide';
    }
    if (control.hasError('maxlength')) {
      return 'Taille maximale dépassée';
    }
    if (control.hasError('minlength')) {
      if (field === 'password') {
        return 'Le mot de passe doit contenir au moins 8 caractères';
      }
      return 'Taille minimale non atteinte';
    }
    return '';
  }
}

