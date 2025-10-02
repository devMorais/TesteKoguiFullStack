import { Component, OnInit } from '@angular/core';
import { CommonModule, TitleCasePipe } from '@angular/common';
import { PokemonService } from '../../../services/pokemon';
import { PokemonCardComponent } from '../../shared/pokemon-card/pokemon-card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { HeaderComponent } from '../../shared/header/header';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar'; // Importar MatSnackBar
import { MatButtonModule } from '@angular/material/button'; // Certifique-se deste import

@Component({
  selector: 'app-pokedex',
  standalone: true,
  imports: [CommonModule, PokemonCardComponent, MatProgressSpinnerModule, TitleCasePipe, HeaderComponent, MatButtonModule, MatSnackBarModule],
  templateUrl: './pokedex.html',
  styleUrls: ['./pokedex.scss']
})
export class PokedexComponent implements OnInit {
  pokemons: any[] = [];
  selectedType: string = 'all';
  isLoading: boolean = true;
  private maxTeamSize = 6;
  public currentTeamCount: number = 0;

  constructor(
    private pokemonService: PokemonService,
    private snackBar: MatSnackBar
  ) { }

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
        this.snackBar.open('Erro ao carregar Pokémon da API.', 'Fechar');
      }
    });
  }

  updateTeamCount(): void {
    this.currentTeamCount = this.pokemons.filter(p => p.isInTeam).length;
  }

  handleFavorite(pokemon: any): void {
    const codigo = pokemon.url ? pokemon.url.split('/')[6] : pokemon.codigo_pokemon;
    let message: string;

    if (pokemon.isFavorite) {
      this.pokemonService.unfavoritePokemon(codigo).subscribe({
        next: () => {
          pokemon.isFavorite = false;
          message = `${pokemon.name || pokemon.nome_pokemon} removido dos favoritos!`;
          this.snackBar.open(message, 'OK', { duration: 3000 });
        },
        error: (err) => this.snackBar.open(err.error?.message || 'Erro ao remover dos favoritos.', 'Fechar')
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
          message = `${pokemon.name || pokemon.nome_pokemon} adicionado aos favoritos!`;
          this.snackBar.open(message, 'YAY!', { duration: 3000 });
        },
        error: (err) => this.snackBar.open(err.error?.message || 'Erro ao adicionar aos favoritos.', 'Fechar')
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
        this.snackBar.open('ERRO: Sua equipe de batalha já tem 6 Pokémon!', 'Fechar', { duration: 5000 });
        return;
      }
      newTeam.push(codigo);
    }

    this.pokemonService.setTeam(newTeam).subscribe({
      next: () => {
        pokemon.isInTeam = !pokemon.isInTeam;
        this.updateTeamCount();

        const action = pokemon.isInTeam ? 'adicionado' : 'removido';
        const message = `${pokemon.name || pokemon.nome_pokemon} foi ${action} da sua equipe!`;
        this.snackBar.open(message, 'OK', { duration: 3000 });
        if (pokemon.isInTeam) {
          pokemon.isFavorite = true;
        }
      },
      error: (err) => this.snackBar.open(err.error?.message || 'Erro ao atualizar equipe.', 'Fechar')
    });
  }

}
