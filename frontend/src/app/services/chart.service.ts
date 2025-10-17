import { Injectable } from '@angular/core';
import { Chart, ChartConfiguration, ChartType, registerables } from 'chart.js';

@Injectable({
  providedIn: 'root'
})
export class ChartService {
  private chartInstances: Map<string, Chart> = new Map();

  constructor() {
    Chart.register(...registerables);
  }

  createSparklineChart(
    canvas: HTMLCanvasElement,
    data: number[],
    labels: string[],
    color: string = '#0E9F6E'
  ): Chart {
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Impossible d\'obtenir le contexte du canvas');
    }

    // Détruire le graphique existant s'il y en a un
    const existingChart = this.chartInstances.get(canvas.id);
    if (existingChart) {
      existingChart.destroy();
    }

    const config: ChartConfiguration = {
      type: 'line' as ChartType,
      data: {
        labels: labels,
        datasets: [{
          data: data,
          borderColor: color,
          backgroundColor: color + '20', // 20% d'opacité
          borderWidth: 2,
          fill: true,
          tension: 0.4,
          pointRadius: 0,
          pointHoverRadius: 4,
          pointHoverBackgroundColor: color,
          pointHoverBorderColor: '#ffffff',
          pointHoverBorderWidth: 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            enabled: true,
            mode: 'index',
            intersect: false,
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            titleColor: '#ffffff',
            bodyColor: '#ffffff',
            borderColor: color,
            borderWidth: 1,
            cornerRadius: 8,
            displayColors: false,
            callbacks: {
              title: (context) => {
                return context[0].label;
              },
              label: (context) => {
                const value = context.parsed.y;
                return new Intl.NumberFormat('fr-MA', {
                  style: 'currency',
                  currency: 'MAD',
                  minimumFractionDigits: 0
                }).format(value);
              }
            }
          }
        },
        scales: {
          x: {
            display: false
          },
          y: {
            display: false
          }
        },
        interaction: {
          intersect: false,
          mode: 'index'
        },
        elements: {
          point: {
            hoverBackgroundColor: color,
            hoverBorderColor: '#ffffff',
            hoverBorderWidth: 2
          }
        }
      }
    };

    const chart = new Chart(ctx, config);
    this.chartInstances.set(canvas.id, chart);
    
    return chart;
  }

  createMiniBarChart(
    canvas: HTMLCanvasElement,
    data: number[],
    labels: string[],
    color: string = '#0E9F6E'
  ): Chart {
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Impossible d\'obtenir le contexte du canvas');
    }

    const existingChart = this.chartInstances.get(canvas.id);
    if (existingChart) {
      existingChart.destroy();
    }

    const config: ChartConfiguration = {
      type: 'bar' as ChartType,
      data: {
        labels: labels,
        datasets: [{
          data: data,
          backgroundColor: color + '40',
          borderColor: color,
          borderWidth: 1,
          borderRadius: 4,
          borderSkipped: false
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            enabled: true,
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            titleColor: '#ffffff',
            bodyColor: '#ffffff',
            borderColor: color,
            borderWidth: 1,
            cornerRadius: 8,
            displayColors: false
          }
        },
        scales: {
          x: {
            display: false
          },
          y: {
            display: false
          }
        }
      }
    };

    const chart = new Chart(ctx, config);
    this.chartInstances.set(canvas.id, chart);
    
    return chart;
  }

  destroyChart(canvasId: string): void {
    const chart = this.chartInstances.get(canvasId);
    if (chart) {
      chart.destroy();
      this.chartInstances.delete(canvasId);
    }
  }

  destroyAllCharts(): void {
    this.chartInstances.forEach((chart) => {
      chart.destroy();
    });
    this.chartInstances.clear();
  }

  updateChartData(canvasId: string, newData: number[]): void {
    const chart = this.chartInstances.get(canvasId);
    if (chart) {
      chart.data.datasets[0].data = newData;
      chart.update('none'); // Animation désactivée pour les mises à jour rapides
    }
  }
}
