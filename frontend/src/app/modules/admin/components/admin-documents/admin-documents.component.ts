import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-admin-documents',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule
  ],
  templateUrl: './admin-documents.component.html',
  styleUrls: ['./admin-documents.component.scss']
})
export class AdminDocumentsComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
