import { Component } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink, MatToolbarModule, MatButtonModule, MatIconModule],
  templateUrl: './header.html',
  styleUrls: ['./header.scss']
})
export class HeaderComponent {

  constructor(private router: Router) { }

  logout(): void {
    localStorage.removeItem('access_token');
    this.router.navigate(['/login']);
  }
}
