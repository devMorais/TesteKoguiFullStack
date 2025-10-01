import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PokemonService } from '../../../services/pokemon';
import { PokemonCardComponent } from '../../shared/pokemon-card/pokemon-card';

@Component({
  selector: 'app-pokedex',
  standalone: true,
  imports: [CommonModule, PokemonCardComponent],
  templateUrl: './pokedex.html',
  styleUrls: ['./pokedex.scss']
})
export class PokedexComponent implements OnInit {
  pokemons: any[] = [];

  constructor(private pokemonService: PokemonService) { }

  ngOnInit(): void {
    this.pokemonService.getPokemons().subscribe(response => {
      this.pokemons = response.results;
    });
  }

  handleFavorite(pokemon: any): void {
    const pokemonData = {
      codigo_pokemon: pokemon.url.split('/')[6],
      nome_pokemon: pokemon.name,
      imagem_url: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemon.url.split('/')[6]}.png`
    };

    this.pokemonService.favoritePokemon(pokemonData).subscribe({
      next: (response) => {
        console.log(response.message);
        alert(`${pokemon.name} foi adicionado aos favoritos!`);
      },
      error: (err) => console.error(err)
    });
  }

  handleAddToTeam(pokemon: any): void {
    const pokemonId = pokemon.url.split('/')[6];
    this.pokemonService.setTeam([pokemonId]).subscribe({
      next: (response) => {
        console.log(response.message);
        alert(`${pokemon.name} foi adicionado à sua equipe!`);
      },
      error: (err) => console.error(err)
    });
  }
}
