import { Component } from '@angular/core';
import options from './options.json';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css',
})
export class NavbarComponent {
  siteTitle: string = 'devnyxie';
  options: any = options;
}
