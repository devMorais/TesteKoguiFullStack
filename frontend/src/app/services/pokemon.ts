import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PokemonService {
  private apiUrl = 'http://127.0.0.1:5000';

  constructor(private http: HttpClient) { }

  getPokemons(page: number = 1): Observable<any> {
    return this.http.get(`${this.apiUrl}/pokemons?page=${page}`);
  }

  favoritePokemon(pokemonData: any): Observable<any> {
    const token = localStorage.getItem('access_token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    return this.http.post(`${this.apiUrl}/user/pokemon`, pokemonData, { headers: headers });
  }

  setTeam(teamCodigos: string[]): Observable<any> {
    const token = localStorage.getItem('access_token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    const body = { team_codigos: teamCodigos };
    return this.http.post(`${this.apiUrl}/user/team`, body, { headers: headers });
  }

  getTeam(): Observable<any> {
    const token = localStorage.getItem('access_token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    return this.http.get(`${this.apiUrl}/user/team`, { headers: headers });
  }

  getPokemonDetails(url: string): Observable<any> {
    return this.http.get(url);
  }
}
