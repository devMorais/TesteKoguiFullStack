import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PokemonService } from '../../../services/pokemon';
import { PokemonCardComponent } from '../../shared/pokemon-card/pokemon-card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { RouterLink } from '@angular/router';
import { HeaderComponent } from '../../shared/header/header';

@Component({
  selector: 'app-favorites',
  standalone: true,
  imports: [CommonModule, PokemonCardComponent, MatProgressSpinnerModule, RouterLink, HeaderComponent],
  templateUrl: './favorites.html',
  styleUrls: ['./favorites.scss']
})
export class FavoritesComponent implements OnInit {
  favorites: any[] = [];
  isLoading: boolean = true;

  constructor(private pokemonService: PokemonService) { }

  ngOnInit(): void {
    this.loadFavorites();
  }

  loadFavorites(): void {
    this.isLoading = true;
    this.pokemonService.getFavorites().subscribe({
      next: (response) => {
        this.favorites = response.map((p: any) => ({
          ...p,
          isFavorite: p.favorito,
          isInTeam: p.grupo_batalha,
          url: `https://pokeapi.co/api/v2/pokemon/${p.codigo_pokemon}/`
        }));
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Erro ao carregar favoritos:', err);
        this.isLoading = false;
      }
    });
  }

  handleFavorite(pokemon: any): void {
    const codigo = pokemon.codigo_pokemon;
    this.pokemonService.unfavoritePokemon(codigo).subscribe({
      next: () => {
        this.favorites = this.favorites.filter(p => p.codigo_pokemon !== codigo);
        console.log(`${pokemon.nome_pokemon} removido dos favoritos!`);
      },
      error: (err) => console.error(err)
    });
  }

  handleAddToTeam(pokemon: any): void {
    const codigo = pokemon.codigo_pokemon;
    let newTeam = this.favorites
      .filter(p => p.isInTeam)
      .map(p => p.codigo_pokemon.toString());

    if (pokemon.isInTeam) {
      newTeam = newTeam.filter((id: string) => id !== codigo.toString());
    } else {
      if (newTeam.length >= 6) {
        console.warn('Sua equipe já tem 6 Pokémon!');
        return;
      }
      newTeam.push(codigo.toString());
    }

    this.pokemonService.setTeam(newTeam).subscribe({
      next: () => {
        pokemon.isInTeam = !pokemon.isInTeam;
        console.log(`${pokemon.nome_pokemon} foi ${pokemon.isInTeam ? 'adicionado' : 'removido'} da sua equipe!`);
      },
      error: (err) => console.error(err)
    });
  }
}
