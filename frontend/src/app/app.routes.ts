import { Routes } from '@angular/router';
import { LoginComponent } from './components/pages/login/login';
import { PokedexComponent } from './components/pages/pokedex/pokedex';
import { TeamComponent } from './components/pages/team/team';
import { RegisterComponent } from './components/pages/register/register';


export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'pokedex', component: PokedexComponent },
  { path: 'team', component: TeamComponent },
];
