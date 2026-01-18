import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule, provideNativeDateAdapter } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { RecurrenceService } from '../../../../services/recurrence.service';
import { SocieteService } from '../../../../services/societe.service';
import { SiteService } from '../../../../services/site.service';
import { CreateRecurrenceRequest, TypeRecurrence } from '../../../../models/planning.model';
import { Societe, Site } from '../../../../models/societe.model';
import { TranslatePipe } from '../../../../pipes/translate.pipe';
import { I18nService } from '../../../../services/i18n.service';

export interface RecurrenceFormData {
  societeId?: number;
}

@Component({
  selector: 'app-recurrence-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    TranslatePipe
  ],
  providers: [provideNativeDateAdapter()],
  templateUrl: './recurrence-form.component.html',
  styleUrls: ['./recurrence-form.component.scss']
})
export class RecurrenceFormComponent implements OnInit {
  recurrenceForm!: FormGroup;
  societes: Societe[] = [];
  sites: Site[] = [];
  loading = false;
  loadingSites = false;

  typeRecurrenceOptions: { value: TypeRecurrence; label: string }[] = [];
  jourSemaineOptions: { value: string; label: string }[] = [];

  constructor(
    private fb: FormBuilder,
    private recurrenceService: RecurrenceService,
    private societeService: SocieteService,
    private siteService: SiteService,
    private snackBar: MatSnackBar,
    private dialogRef: MatDialogRef<RecurrenceFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: RecurrenceFormData,
    private i18n: I18nService
  ) {
    this.initOptions();
  }

  initOptions(): void {
    this.typeRecurrenceOptions = [
      { value: TypeRecurrence.HEBDOMADAIRE, label: this.i18n.t('recurrence.hebdomadaire') },
      { value: TypeRecurrence.BIMENSUELLE, label: this.i18n.t('recurrence.bimensuelle') },
      { value: TypeRecurrence.MENSUELLE, label: this.i18n.t('recurrence.mensuelle') }
    ];

    this.jourSemaineOptions = [
      { value: 'LUNDI', label: this.i18n.t('recurrence.monday') },
      { value: 'MARDI', label: this.i18n.t('recurrence.tuesday') },
      { value: 'MERCREDI', label: this.i18n.t('recurrence.wednesday') },
      { value: 'JEUDI', label: this.i18n.t('recurrence.thursday') },
      { value: 'VENDREDI', label: this.i18n.t('recurrence.friday') },
      { value: 'SAMEDI', label: this.i18n.t('recurrence.saturday') },
      { value: 'DIMANCHE', label: this.i18n.t('recurrence.sunday') }
    ];
  }

  ngOnInit(): void {
    this.initForm();
    this.loadSocietes();
    
    if (this.data?.societeId) {
      this.recurrenceForm.patchValue({ societeId: this.data.societeId });
      this.loadSites(this.data.societeId);
    }
  }

  initForm(): void {
    this.recurrenceForm = this.fb.group({
      societeId: ['', Validators.required],
      siteId: ['', Validators.required],
      typeRecurrence: ['', Validators.required],
      jourSemaine: [''],
      joursSemaneBimensuel: [''],
      jourMois: [''],
      heurePrevue: [''],
      dateDebut: ['', Validators.required],
      dateFin: ['']
    });

    // Écouter les changements de type de récurrence
    this.recurrenceForm.get('typeRecurrence')?.valueChanges.subscribe(type => {
      this.updateValidators(type);
    });

    // Écouter les changements de société pour charger les sites
    this.recurrenceForm.get('societeId')?.valueChanges.subscribe(societeId => {
      if (societeId) {
        this.loadSites(societeId);
      } else {
        this.sites = [];
        this.recurrenceForm.patchValue({ siteId: '' });
      }
    });
  }

  updateValidators(type: string): void {
    const jourSemaineControl = this.recurrenceForm.get('jourSemaine');
    const joursSemaneBimensuelControl = this.recurrenceForm.get('joursSemaneBimensuel');
    const jourMoisControl = this.recurrenceForm.get('jourMois');

    // Réinitialiser les validators
    jourSemaineControl?.clearValidators();
    joursSemaneBimensuelControl?.clearValidators();
    jourMoisControl?.clearValidators();

    // Ajouter les validators selon le type
    if (type === TypeRecurrence.HEBDOMADAIRE) {
      jourSemaineControl?.setValidators([Validators.required]);
    } else if (type === TypeRecurrence.BIMENSUELLE) {
      joursSemaneBimensuelControl?.setValidators([Validators.required]);
    } else if (type === TypeRecurrence.MENSUELLE) {
      jourMoisControl?.setValidators([Validators.required, Validators.min(1), Validators.max(31)]);
    }

    jourSemaineControl?.updateValueAndValidity();
    joursSemaneBimensuelControl?.updateValueAndValidity();
    jourMoisControl?.updateValueAndValidity();
  }

  loadSocietes(): void {
    this.societeService.getAllSocietes(0, 1000).subscribe({
      next: (page) => {
        this.societes = page.content;
      },
      error: (error) => {
        console.error('Erreur chargement sociétés:', error);
      }
    });
  }

  loadSites(societeId: number): void {
    this.loadingSites = true;
    this.siteService.getSitesBySociete(societeId).subscribe({
      next: (sites) => {
        this.sites = sites;
        this.loadingSites = false;
      },
      error: (error) => {
        console.error('Erreur chargement sites:', error);
        this.loadingSites = false;
      }
    });
  }

  submit(): void {
    if (this.recurrenceForm.invalid) {
      this.snackBar.open(this.i18n.t('recurrence.fixErrors'), this.i18n.t('common.close'), { duration: 3000 });
      return;
    }

    this.loading = true;

    const formValue = this.recurrenceForm.value;
    const request: CreateRecurrenceRequest = {
      societeId: formValue.societeId,
      siteId: formValue.siteId,
      typeRecurrence: formValue.typeRecurrence,
      jourSemaine: formValue.jourSemaine || undefined,
      joursSemaneBimensuel: formValue.joursSemaneBimensuel || undefined,
      jourMois: formValue.jourMois || undefined,
      heurePrevue: formValue.heurePrevue || undefined,
      dateDebut: formValue.dateDebut instanceof Date 
        ? formValue.dateDebut.toISOString().split('T')[0]
        : formValue.dateDebut,
      dateFin: formValue.dateFin 
        ? (formValue.dateFin instanceof Date 
            ? formValue.dateFin.toISOString().split('T')[0]
            : formValue.dateFin)
        : undefined
    };

    this.recurrenceService.createRecurrence(request).subscribe({
      next: () => {
        this.snackBar.open(this.i18n.t('recurrence.createSuccess'), this.i18n.t('common.close'), { duration: 3000 });
        this.dialogRef.close(true);
      },
      error: (error) => {
        console.error('Erreur création récurrence:', error);
        this.snackBar.open(this.i18n.t('recurrence.createError'), this.i18n.t('common.close'), { duration: 3000 });
        this.loading = false;
      }
    });
  }

  cancel(): void {
    this.dialogRef.close(false);
  }

  getTypeRecurrence(): string {
    return this.recurrenceForm.get('typeRecurrence')?.value || '';
  }
}

