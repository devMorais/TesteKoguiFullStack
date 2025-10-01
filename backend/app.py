import os
from datetime import datetime
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_cors import CORS
from flask import request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity 
from poke_api_service import get_pokemon_list

# --- CONFIGURAÇÃO DA APLICAÇÃO ---
app = Flask(__name__)

basedir = os.path.abspath(os.path.dirname(__file__))
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///' + os.path.join(basedir, 'pokedex.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['JWT_SECRET_KEY'] = 'uma-chave-secreta-bem-forte'

db = SQLAlchemy(app)
migrate = Migrate(app, db)
jwt = JWTManager(app)
CORS(app)

# --- TABELA DE ASSOCIAÇÃO PARA A RELAÇÃO N...N ---
# Esta tabela conecta PokemonUsuario com TipoPokemon
pokemon_tipo_associacao = db.Table('pokemon_tipo_associacao',
    db.Column('pokemon_usuario_id', db.Integer, db.ForeignKey('pokemon_usuario.id_pokemon_usuario'), primary_key=True),
    db.Column('tipo_pokemon_id', db.Integer, db.ForeignKey('tipo_pokemon.id_tipo_pokemon'), primary_key=True)
)

# --- MODELOS DO BANCO DE DADOS (FIEL AO DIAGRAMA) ---

class Usuario(db.Model):
    __tablename__ = 'usuario'
    id = db.Column('id_usuario', db.Integer, primary_key=True)
    nome = db.Column(db.String(100), nullable=False)
    login = db.Column(db.String(50), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    senha = db.Column(db.String(200), nullable=False)
    dt_inclusao = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    dt_alteracao = db.Column(db.DateTime, onupdate=datetime.utcnow)
    pokemons = db.relationship('PokemonUsuario', backref='usuario', lazy=True, cascade="all, delete-orphan")

class PokemonUsuario(db.Model):
    __tablename__ = 'pokemon_usuario'
    id = db.Column('id_pokemon_usuario', db.Integer, primary_key=True)
    id_usuario = db.Column(db.Integer, db.ForeignKey('usuario.id_usuario'), nullable=False)
    
    codigo_pokemon = db.Column('codigo', db.Integer, nullable=False)
    nome_pokemon = db.Column('nome', db.String(100), nullable=False)
    imagem_url = db.Column('imagem_url', db.String(255))
    
    favorito = db.Column(db.Boolean, default=False)
    grupo_batalha = db.Column(db.Boolean, default=False)

    # A relação N...N com TipoPokemon através da tabela de associação
    tipos = db.relationship('TipoPokemon', secondary=pokemon_tipo_associacao, lazy='subquery',
                            backref=db.backref('pokemons_usuario', lazy=True))

class TipoPokemon(db.Model):
    __tablename__ = 'tipo_pokemon'
    id = db.Column('id_tipo_pokemon', db.Integer, primary_key=True)
    descricao = db.Column('descricao', db.String(50), unique=True, nullable=False)


# --- ROTAS DA API ---
# --- ROTAS DA API ---

@app.route('/register', methods=['POST'])
def register():
    # 1. Pega os dados do corpo da requisição
    data = request.get_json()

    # Pega os campos do JSON
    nome = data.get('nome')
    login = data.get('login')
    email = data.get('email')
    senha = data.get('senha')

    # Validação simples
    if not nome or not login or not email or not senha:
        return jsonify({'message': 'Todos os campos são obrigatórios!'}), 400

    # 2. Verifica se usuário ou email já existem
    if Usuario.query.filter_by(login=login).first() or Usuario.query.filter_by(email=email).first():
        return jsonify({'message': 'Login ou email já cadastrado!'}), 409

    # 3. Cria o hash da senha para segurança
    senha_hash = generate_password_hash(senha, method='pbkdf2:sha256')

    # 4. Cria o novo usuário
    novo_usuario = Usuario(
        nome=nome,
        login=login,
        email=email,
        senha=senha_hash
    )

    # 5. Adiciona e salva no banco de dados
    db.session.add(novo_usuario)
    db.session.commit()

    return jsonify({'message': 'Usuário criado com sucesso!'}), 201


@app.route('/login', methods=['POST'])
def login():
    # 1. Pega os dados da requisição
    data = request.get_json()
    login_identifier = data.get('login') # Pode ser o login ou o email
    senha = data.get('senha')

    if not login_identifier or not senha:
        return jsonify({'message': 'Login/email e senha são obrigatórios!'}), 400

    # 2. Procura o usuário no banco pelo login OU pelo email
    usuario = Usuario.query.filter(
        (Usuario.login == login_identifier) | (Usuario.email == login_identifier)
    ).first()

    # 3. Verifica se o usuário existe e se a senha está correta
    if not usuario or not check_password_hash(usuario.senha, senha):
        return jsonify({'message': 'Credenciais inválidas!'}), 401 # Unauthorized

    # 4. Gera o Token de Acesso JWT
    access_token = create_access_token(identity=str(usuario.id))
    
    return jsonify(access_token=access_token)

@app.route('/pokemons', methods=['GET'])
def handle_pokemons():
    # Pega o número da página dos argumentos da URL (ex: /pokemons?page=2)
    page = request.args.get('page', 1, type=int)

    # Busca os dados usando nosso serviço
    pokemon_data = get_pokemon_list(page=page)

    if pokemon_data:
        return jsonify(pokemon_data)
    else:
        return jsonify({"message": "Não foi possível buscar os dados da PokéAPI."}), 500
    
    
@app.route('/user/pokemon', methods=['POST'])
@jwt_required()
def add_user_pokemon():
    # Pega o ID do usuário a partir do token JWT
    current_user_id = get_jwt_identity()

    # Pega os dados do pokémon que o usuário quer favoritar
    data = request.get_json()
    codigo_pokemon = data.get('codigo_pokemon')
    nome_pokemon = data.get('nome_pokemon')
    imagem_url = data.get('imagem_url')

    if not codigo_pokemon or not nome_pokemon:
        return jsonify({"message": "Código e nome do Pokémon são obrigatórios"}), 400

    # Verifica se o usuário já salvou este pokémon alguma vez
    pokemon = PokemonUsuario.query.filter_by(id_usuario=current_user_id, codigo_pokemon=codigo_pokemon).first()

    if pokemon:
        # Se já existe, apenas marca como favorito
        pokemon.favorito = True
    else:
        # Se não existe, cria um novo registro
        pokemon = PokemonUsuario(
            id_usuario=current_user_id,
            codigo_pokemon=codigo_pokemon,
            nome_pokemon=nome_pokemon,
            imagem_url=imagem_url,
            favorito=True,
            grupo_batalha=False # Padrão
        )
        db.session.add(pokemon)

    db.session.commit()

    return jsonify({"message": f"{nome_pokemon.capitalize()} adicionado aos favoritos!"}), 201


@app.route('/user/favorites', methods=['GET'])
@jwt_required()
def get_favorites():
    """Retorna a lista de Pokémon favoritos do usuário."""
    current_user_id = get_jwt_identity()

    favoritos = PokemonUsuario.query.filter_by(id_usuario=current_user_id, favorito=True).all()

    # Converte a lista de objetos para um formato JSON
    lista_favoritos = []
    for p in favoritos:
        lista_favoritos.append({
            "codigo_pokemon": p.codigo_pokemon,
            "nome_pokemon": p.nome_pokemon,
            "imagem_url": p.imagem_url,
            "favorito": p.favorito,
            "grupo_batalha": p.grupo_batalha
        })

    return jsonify(lista_favoritos)

@app.route('/user/team', methods=['GET'])
@jwt_required()
def get_team():
    """Retorna a equipe de batalha do usuário."""
    current_user_id = get_jwt_identity()

    team = PokemonUsuario.query.filter_by(id_usuario=current_user_id, grupo_batalha=True).all()

    lista_time = []
    for p in team:
        lista_time.append({
            "codigo_pokemon": p.codigo_pokemon,
            "nome_pokemon": p.nome_pokemon,
            "imagem_url": p.imagem_url,
            "favorito": p.favorito,
            "grupo_batalha": p.grupo_batalha
        })

    return jsonify(lista_time)

@app.route('/user/team', methods=['POST'])
@jwt_required()
def set_team():
    """Define ou atualiza a equipe de batalha do usuário."""
    current_user_id = get_jwt_identity()
    data = request.get_json()
    team_codigos = data.get('team_codigos') # Espera uma lista de códigos, ex: [25, 6, 9]

    if not isinstance(team_codigos, list):
        return jsonify({"message": "O corpo da requisição deve ser uma lista de códigos."}), 400

    # Regra: Limite de 6 pokémons na equipe
    if len(team_codigos) > 6:
        return jsonify({"message": "A equipe de batalha não pode ter mais de 6 Pokémon."}), 400

    # Primeiro, remove todos os pokémons da equipe atual
    PokemonUsuario.query.filter_by(id_usuario=current_user_id).update({ "grupo_batalha": False })

    # Depois, adiciona os novos pokémons à equipe
    pokemons_na_equipe = PokemonUsuario.query.filter(
        PokemonUsuario.id_usuario == current_user_id,
        PokemonUsuario.codigo_pokemon.in_(team_codigos)
    ).all()

    for p in pokemons_na_equipe:
        p.grupo_batalha = True

    db.session.commit()

    return jsonify({"message": "Equipe de batalha atualizada com sucesso!"})

@app.route('/')
def index():
    return "API da Pokédex está no ar! (Modelo Fiel)"


# --- INICIALIZAÇÃO DO SERVIDOR ---
if __name__ == '__main__':
    app.run(debug=True)