# Em poke_api_service.py
import requests

BASE_URL = "https://pokeapi.co/api/v2/"

def get_pokemon_list(page=1, per_page=20):
    """Busca uma lista paginada de Pokémon na PokéAPI."""
    offset = (page - 1) * per_page
    url = f"{BASE_URL}pokemon?offset={offset}&limit={per_page}"

    try:
        response = requests.get(url)
        response.raise_for_status()  # Lança um erro para respostas ruins (4xx ou 5xx)
        return response.json()
    except requests.exceptions.RequestException as e:
        # Em um app real, aqui seria um bom lugar para logar o erro
        print(f"Erro ao acessar a PokéAPI: {e}")
        return None