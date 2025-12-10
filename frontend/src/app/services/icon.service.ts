import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class IconService {
  private iconMap: { [key: string]: string } = {
    // Icônes principales
    'camion': 'local_shipping',
    'recyclables': 'autorenew',
    'banals': 'delete',
    'dangereux': 'warning',
    'revenu': 'payments',
    'doc': 'description',
    'filtre': 'tune',
    'download': 'download',
    
    // Icônes de navigation
    'home': 'home',
    'dashboard': 'dashboard',
    'profile': 'account_circle',
    'settings': 'settings',
    'logout': 'logout',
    'login': 'login',
    
    // Icônes d'actions
    'add': 'add',
    'edit': 'edit',
    'delete': 'delete',
    'save': 'save',
    'cancel': 'cancel',
    'search': 'search',
    'filter': 'filter_list',
    'sort': 'sort',
    'refresh': 'refresh',
    
    // Icônes de statut
    'success': 'check_circle',
    'error': 'error',
    'warning': 'warning',
    'info': 'info',
    'loading': 'hourglass_empty',
    
    // Icônes de recyclage
    'recycling': 'recycling',
    'eco': 'eco',
    'green': 'park',
    'waste': 'delete_sweep',
    
    // Icônes de données
    'chart': 'bar_chart',
    'graph': 'show_chart',
    'table': 'table_chart',
    'list': 'list',
    'grid': 'grid_view',
    
    // Icônes de communication
    'email': 'email',
    'phone': 'phone',
    'message': 'message',
    'notification': 'notifications',
    
    // Icônes de fichiers
    'file': 'description',
    'pdf': 'picture_as_pdf',
    'excel': 'table_chart',
    'image': 'image',
    
    // Icônes de géolocalisation
    'location': 'location_on',
    'map': 'map',
    'gps': 'my_location',
    
    // Icônes de temps
    'calendar': 'calendar_today',
    'time': 'access_time',
    'date': 'event',
    
    // Icônes de sécurité
    'lock': 'lock',
    'unlock': 'lock_open',
    'security': 'security',
    'key': 'vpn_key'
  };

  getIcon(iconName: string): string {
    return this.iconMap[iconName] || 'help_outline';
  }

  getAllIcons(): { [key: string]: string } {
    return { ...this.iconMap };
  }
}
