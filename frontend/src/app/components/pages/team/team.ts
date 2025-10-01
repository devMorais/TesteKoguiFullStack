import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PokemonService } from '../../../services/pokemon';
import { PokemonCardComponent } from '../../shared/pokemon-card/pokemon-card';

@Component({
  selector: 'app-team',
  standalone: true,
  imports: [CommonModule, PokemonCardComponent],
  templateUrl: './team.html',
  styleUrls: ['./team.scss']
})
export class TeamComponent implements OnInit {
  team: any[] = [];

  constructor(private pokemonService: PokemonService) { }

  ngOnInit(): void {
    this.pokemonService.getTeam().subscribe(response => {
      this.team = response;
    });
  }
}
