import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatChipsModule } from '@angular/material/chips';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { PlanningService } from '../../../../services/planning.service';
import { PlanningEnlevement, StatutPlanning } from '../../../../models/planning.model';

/**
 * Composant : Calendrier mensuel du planning
 */
@Component({
  selector: 'app-planning-calendar',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatFormFieldModule,
    MatChipsModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatDialogModule
  ],
  templateUrl: './planning-calendar.component.html',
  styleUrls: ['./planning-calendar.component.scss']
})
export class PlanningCalendarComponent implements OnInit {
  currentDate = new Date();
  currentMonth = this.currentDate.getMonth() + 1;
  currentYear = this.currentDate.getFullYear();
  
  planning: PlanningEnlevement[] = [];
  loading = false;
  
  daysInMonth: number[] = [];
  weeks: Date[][] = [];

  constructor(
    private planningService: PlanningService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadPlanning();
    this.generateCalendar();
  }

  generateCalendar(): void {
    const firstDay = new Date(this.currentYear, this.currentMonth - 1, 1);
    const lastDay = new Date(this.currentYear, this.currentMonth, 0);
    const daysInMonth = lastDay.getDate();
    
    // Premier jour de la semaine (0 = dimanche, 1 = lundi, etc.)
    const startDay = firstDay.getDay();
    const adjustedStartDay = startDay === 0 ? 6 : startDay - 1; // Lundi = 0
    
    this.daysInMonth = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    
    // Générer les semaines
    this.weeks = [];
    let week: Date[] = [];
    
    // Remplir les jours avant le 1er du mois
    for (let i = 0; i < adjustedStartDay; i++) {
      week.push(new Date(this.currentYear, this.currentMonth - 1, -i));
    }
    
    // Ajouter les jours du mois
    for (let day = 1; day <= daysInMonth; day++) {
      week.push(new Date(this.currentYear, this.currentMonth - 1, day));
      
      if (week.length === 7) {
        this.weeks.push(week);
        week = [];
      }
    }
    
    // Remplir les jours après le dernier du mois
    if (week.length > 0) {
      while (week.length < 7) {
        const lastDayOfMonth = new Date(this.currentYear, this.currentMonth - 1, daysInMonth);
        const nextDay = new Date(lastDayOfMonth);
        nextDay.setDate(nextDay.getDate() + (week.length - adjustedStartDay + 1));
        week.push(nextDay);
      }
      this.weeks.push(week);
    }
  }

  loadPlanning(): void {
    this.loading = true;
    this.planningService.getPlanningDuMois(this.currentYear, this.currentMonth).subscribe({
      next: (planning) => {
        this.planning = planning;
        this.loading = false;
      },
      error: (error) => {
        console.error('Erreur chargement planning:', error);
        this.snackBar.open('Erreur lors du chargement du planning', 'Fermer', { duration: 3000 });
        this.loading = false;
      }
    });
  }

  previousMonth(): void {
    if (this.currentMonth === 1) {
      this.currentMonth = 12;
      this.currentYear--;
    } else {
      this.currentMonth--;
    }
    this.generateCalendar();
    this.loadPlanning();
  }

  nextMonth(): void {
    if (this.currentMonth === 12) {
      this.currentMonth = 1;
      this.currentYear++;
    } else {
      this.currentMonth++;
    }
    this.generateCalendar();
    this.loadPlanning();
  }

  goToToday(): void {
    this.currentDate = new Date();
    this.currentMonth = this.currentDate.getMonth() + 1;
    this.currentYear = this.currentDate.getFullYear();
    this.generateCalendar();
    this.loadPlanning();
  }

  getPlanningForDate(date: Date): PlanningEnlevement[] {
    const dateStr = date.toISOString().split('T')[0];
    return this.planning.filter(p => p.datePrevue === dateStr);
  }

  isToday(date: Date): boolean {
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
  }

  isCurrentMonth(date: Date): boolean {
    return date.getMonth() === this.currentMonth - 1 &&
           date.getFullYear() === this.currentYear;
  }

  getMonthName(): string {
    const months = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
                   'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
    return months[this.currentMonth - 1];
  }

  getStatutClass(statut: string): string {
    const classes: { [key: string]: string } = {
      'PLANIFIE': 'statut-planifie',
      'CONFIRME': 'statut-confirme',
      'REALISE': 'statut-realise',
      'ANNULE': 'statut-annule'
    };
    return classes[statut] || '';
  }
}

