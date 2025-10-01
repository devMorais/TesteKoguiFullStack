import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule, NgIf, TitleCasePipe } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { PokemonService } from '../../../services/pokemon';
import { MatProgressBarModule } from '@angular/material/progress-bar';

@Component({
  selector: 'app-pokemon-card',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule, MatButtonModule, TitleCasePipe, MatProgressBarModule],
  templateUrl: './pokemon-card.html',
  styleUrls: ['./pokemon-card.scss']
})
export class PokemonCardComponent implements OnInit {
  @Input() pokemon: any;
  pokemonDetails: any;

  @Output() onFavorite = new EventEmitter<any>();
  @Output() onAddToTeam = new EventEmitter<any>();

  constructor(private pokemonService: PokemonService) { }

  ngOnInit(): void {
    if (this.pokemon) {
      this.pokemonService.getPokemonDetails(this.pokemon.url || this.pokemon.pokemon.url).subscribe(details => {
        this.pokemonDetails = details;
      });
    }
  }

  getPokemonImage(): string {
    if (this.pokemon.imagem_url) {
      return this.pokemon.imagem_url;
    }
    const number = this.pokemon.url.split('/')[6];
    return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${number}.png`;
  }

  getPokemonNumber(): string {
    if (this.pokemon.codigo_pokemon) {
      return `${this.pokemon.codigo_pokemon}`.padStart(3, '0');
    }
    return this.pokemon.url.split('/')[6].padStart(3, '0');
  }

  favoritar(): void {
    this.onFavorite.emit(this.pokemon);
  }

  adicionarAoTime(): void {
    this.onAddToTeam.emit(this.pokemon);
  }
}
