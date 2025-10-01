import { Component, OnInit } from '@angular/core';
import { CommonModule, TitleCasePipe } from '@angular/common';
import { PokemonService } from '../../../services/pokemon';
import { PokemonCardComponent } from '../../shared/pokemon-card/pokemon-card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { HeaderComponent } from '../../shared/header/header';

@Component({
  selector: 'app-pokedex',
  standalone: true,
  imports: [CommonModule, PokemonCardComponent, MatProgressSpinnerModule, TitleCasePipe, HeaderComponent],
  templateUrl: './pokedex.html',
  styleUrls: ['./pokedex.scss']
})
export class PokedexComponent implements OnInit {
  pokemons: any[] = [];
  selectedType: string = 'all';
  isLoading: boolean = true;
  private maxTeamSize = 6;
  public currentTeamCount: number = 0;

  constructor(private pokemonService: PokemonService) { }

  ngOnInit(): void {
    this.loadPokemons();
  }

  loadPokemons(): void {
    this.isLoading = true;
    this.pokemonService.getPokemons(1, this.selectedType).subscribe({
      next: (response) => {
        this.pokemons = response.results;
        this.updateTeamCount();
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Erro ao carregar Pokémon:', err);
        this.isLoading = false;
      }
    });
  }

  updateTeamCount(): void {
    this.currentTeamCount = this.pokemons.filter(p => p.isInTeam).length;
  }

  handleFavorite(pokemon: any): void {
    const codigo = pokemon.url ? pokemon.url.split('/')[6] : pokemon.codigo_pokemon;

    if (pokemon.isFavorite) {
      this.pokemonService.unfavoritePokemon(codigo).subscribe({
        next: () => {
          pokemon.isFavorite = false;
          console.log(`${pokemon.name || pokemon.nome_pokemon} removido dos favoritos!`);
        },
        error: (err) => console.error(err)
      });
    } else {
      const pokemonData = {
        codigo_pokemon: codigo,
        nome_pokemon: pokemon.name || pokemon.nome_pokemon,
        imagem_url: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${codigo}.png`
      };

      this.pokemonService.favoritePokemon(pokemonData).subscribe({
        next: () => {
          pokemon.isFavorite = true;
          console.log(`${pokemon.name || pokemon.nome_pokemon} foi adicionado aos favoritos!`);
        },
        error: (err) => console.error(err)
      });
    }
  }

  filterByType(type: string): void {
    this.selectedType = type;
    this.loadPokemons();
  }

  handleAddToTeam(pokemon: any): void {
    const codigo = pokemon.url ? pokemon.url.split('/')[6] : pokemon.codigo_pokemon;
    let newTeam = this.pokemons
      .filter(p => p.isInTeam)
      .map(p => p.url ? p.url.split('/')[6] : p.codigo_pokemon);

    if (pokemon.isInTeam) {
      newTeam = newTeam.filter((id: string) => id !== codigo);
    } else {
      if (newTeam.length >= this.maxTeamSize) {
        console.warn('Sua equipe já tem 6 Pokémon!');
        return;
      }
      newTeam.push(codigo);
    }

    this.pokemonService.setTeam(newTeam).subscribe({
      next: () => {
        pokemon.isInTeam = !pokemon.isInTeam;
        this.updateTeamCount();
        console.log(`${pokemon.name || pokemon.nome_pokemon} foi ${pokemon.isInTeam ? 'adicionado' : 'removido'} da sua equipe!`);

        // Caso o Pokémon tenha sido adicionado, se ele não era favorito, agora é (Regra do Backend)
        if (pokemon.isInTeam) {
          pokemon.isFavorite = true;
        }
      },
      error: (err) => console.error(err)
    });
  }

}
