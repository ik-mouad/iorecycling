import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AdminClientService, Client, Site } from '../../../services/admin-client.service';
import { ClientFormComponent } from '../client-form/client-form.component';

@Component({
  selector: 'app-admin-clients',
  templateUrl: './admin-clients.component.html',
  styleUrls: ['./admin-clients.component.scss']
})
export class AdminClientsComponent implements OnInit {
  
  displayedColumns: string[] = ['id', 'name', 'code', 'sites', 'createdAt', 'actions'];
  dataSource = new MatTableDataSource<Client>();
  
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  
  isLoading = false;
  searchTerm = '';

  constructor(
    private adminClientService: AdminClientService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadClients();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  loadClients(): void {
    this.isLoading = true;
    this.adminClientService.getClients().subscribe({
      next: (clients) => {
        this.dataSource.data = clients;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des clients:', error);
        this.snackBar.open('Erreur lors du chargement des clients', 'Fermer', { duration: 3000 });
        this.isLoading = false;
      }
    });
  }

  applyFilter(): void {
    this.dataSource.filter = this.searchTerm.trim().toLowerCase();
  }

  openClientForm(client?: Client): void {
    const dialogRef = this.dialog.open(ClientFormComponent, {
      width: '500px',
      data: { client }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadClients();
      }
    });
  }

  deleteClient(client: Client): void {
    if (confirm(`Êtes-vous sûr de vouloir supprimer le client "${client.name}" ?`)) {
      this.adminClientService.deleteClient(client.id).subscribe({
        next: () => {
          this.snackBar.open('Client supprimé avec succès', 'Fermer', { duration: 3000 });
          this.loadClients();
        },
        error: (error) => {
          console.error('Erreur lors de la suppression:', error);
          this.snackBar.open('Erreur lors de la suppression du client', 'Fermer', { duration: 3000 });
        }
      });
    }
  }

  getSitesCount(sites: Site[]): number {
    return sites ? sites.length : 0;
  }

  getSitesNames(sites: Site[]): string {
    if (!sites || sites.length === 0) {
      return 'Aucun site';
    }
    return sites.map(site => site.name).join(', ');
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('fr-FR');
  }
}
