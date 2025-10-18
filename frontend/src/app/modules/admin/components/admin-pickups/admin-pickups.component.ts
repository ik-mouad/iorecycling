import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AdminPickupService, Pickup, PickupFilters } from '../../../services/admin-pickup.service';
import { AdminClientService, Client } from '../../../services/admin-client.service';
import { PickupFormComponent } from '../pickup-form/pickup-form.component';

@Component({
  selector: 'app-admin-pickups',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatDialogModule,
    MatSnackBarModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatChipsModule,
    MatTooltipModule,
    MatProgressSpinnerModule
  ],
  providers: [
    AdminPickupService,
    AdminClientService
  ],
  templateUrl: './admin-pickups.component.html',
  styleUrls: ['./admin-pickups.component.scss']
})
export class AdminPickupsComponent implements OnInit {
  
  displayedColumns: string[] = ['id', 'date', 'type', 'tonnage', 'site', 'client', 'actions'];
  dataSource = new MatTableDataSource<Pickup>();
  
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  
  isLoading = false;
  clients: Client[] = [];
  
  // Filters
  filters: PickupFilters = {
    page: 0,
    size: 20
  };
  
  totalElements = 0;
  totalPages = 0;

  constructor(
    private adminPickupService: AdminPickupService,
    private adminClientService: AdminClientService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadClients();
    this.loadPickups();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  loadClients(): void {
    this.adminClientService.getClients().subscribe({
      next: (clients: Client[]) => {
        this.clients = clients;
      },
      error: (error: any) => {
        console.error('Erreur lors du chargement des clients:', error);
      }
    });
  }

  loadPickups(): void {
    this.isLoading = true;
    this.adminPickupService.getPickups(this.filters).subscribe({
      next: (response: any) => {
        this.dataSource.data = response.content;
        this.totalElements = response.totalElements;
        this.totalPages = response.totalPages;
        this.isLoading = false;
      },
      error: (error: any) => {
        console.error('Erreur lors du chargement des enlèvements:', error);
        this.snackBar.open('Erreur lors du chargement des enlèvements', 'Fermer', { duration: 3000 });
        this.isLoading = false;
      }
    });
  }

  applyFilters(): void {
    this.filters.page = 0;
    this.loadPickups();
  }

  clearFilters(): void {
    this.filters = {
      page: 0,
      size: 20
    };
    this.loadPickups();
  }

  onPageChange(event: any): void {
    this.filters.page = event.pageIndex;
    this.filters.size = event.pageSize;
    this.loadPickups();
  }

  openPickupForm(pickup?: Pickup): void {
    const dialogRef = this.dialog.open(PickupFormComponent, {
      width: '600px',
      data: { 
        pickup,
        clients: this.clients
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadPickups();
      }
    });
  }

  deletePickup(pickup: Pickup): void {
    if (confirm(`Êtes-vous sûr de vouloir supprimer cet enlèvement ?`)) {
      this.adminPickupService.deletePickup(pickup.id).subscribe({
        next: () => {
          this.snackBar.open('Enlèvement supprimé avec succès', 'Fermer', { duration: 3000 });
          this.loadPickups();
        },
        error: (error: any) => {
          console.error('Erreur lors de la suppression:', error);
          this.snackBar.open('Erreur lors de la suppression de l\'enlèvement', 'Fermer', { duration: 3000 });
        }
      });
    }
  }

  getTypeColor(type: string): string {
    switch (type.toLowerCase()) {
      case 'recyclable': return 'primary';
      case 'banal': return 'accent';
      case 'dangereux': return 'warn';
      default: return 'basic';
    }
  }

  getTypeIcon(type: string): string {
    switch (type.toLowerCase()) {
      case 'recyclable': return 'autorenew';
      case 'banal': return 'inventory';
      case 'dangereux': return 'warning';
      default: return 'help';
    }
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('fr-FR');
  }

  formatTonnage(tonnage: number): string {
    return new Intl.NumberFormat('fr-FR', {
      minimumFractionDigits: 1,
      maximumFractionDigits: 2
    }).format(tonnage);
  }
}
