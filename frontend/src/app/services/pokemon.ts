import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PokemonService {
  private apiUrl = 'http://127.0.0.1:5000';

  constructor(private http: HttpClient) { }

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('access_token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  getPokemons(page: number = 1, tipo: string | null = null): Observable<any> {
    let url = `${this.apiUrl}/pokemons?page=${page}`;
    if (tipo && tipo !== 'all') {
      url += `&tipo=${tipo}`;
    }
    return this.http.get(url, { headers: this.getAuthHeaders() });
  }

  favoritePokemon(pokemonData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/user/pokemon`, pokemonData, { headers: this.getAuthHeaders() });
  }

  unfavoritePokemon(codigo: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/user/pokemon/${codigo}`, { headers: this.getAuthHeaders() });
  }

  setTeam(teamCodigos: string[]): Observable<any> {
    const body = { team_codigos: teamCodigos };
    return this.http.post(`${this.apiUrl}/user/team`, body, { headers: this.getAuthHeaders() });
  }

  getTeam(): Observable<any> {
    return this.http.get(`${this.apiUrl}/user/team`, { headers: this.getAuthHeaders() });
  }

  getFavorites(): Observable<any> {
    return this.http.get(`${this.apiUrl}/user/favorites`, { headers: this.getAuthHeaders() });
  }

  getPokemonDetails(url: string): Observable<any> {
    return this.http.get(url);
  }

}
