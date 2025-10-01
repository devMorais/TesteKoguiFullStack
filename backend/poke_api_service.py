import requests

BASE_URL = "https://pokeapi.co/api/v2/"
DEFAULT_LIMIT = 20 

def get_pokemon_list(page=1, per_page=DEFAULT_LIMIT, tipo=None):
    """
    Busca uma lista paginada de Pokémon na PokéAPI.
    Se 'tipo' for fornecido, busca todos os Pokémon daquele tipo.
    """
    if tipo and tipo.lower() != 'all': 
        type_url = f"{BASE_URL}type/{tipo.lower()}"
        
        try:
            response = requests.get(type_url)
            response.raise_for_status()
            data = response.json()
            
            results = [{"name": p['pokemon']['name'], "url": p['pokemon']['url']} 
                       for p in data.get('pokemon', [])]
            
            return {"results": results, "count": len(results)}

        except requests.exceptions.RequestException as e:
            print(f"Erro ao acessar a PokéAPI com filtro '{tipo}': {e}")
            return None

    else:
        offset = (page - 1) * per_page
        url = f"{BASE_URL}pokemon?offset={offset}&limit={per_page}"

        try:
            response = requests.get(url)
            response.raise_for_status()
            return response.json()
        
        except requests.exceptions.RequestException as e:
            print(f"Erro ao acessar a PokéAPI: {e}")
            return None