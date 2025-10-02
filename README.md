Desafio Full Stack (Python/Flask & Angular)
A aplicação está dividida em duas partes:
backend/: API RESTful desenvolvida em Python com Flask, utilizando SQLite e JWT para autenticação.
frontend/: Aplicação Single Page Application (SPA) em Angular para a interface do usuário.

Requisitos:

Python 3.x
pip (Gerenciador de pacotes Python)
Node.js e npm (ou yarn)
Angular CLI (Instale globalmente se ainda não tiver: npm install -g @angular/cli)

Rodar a Aplicação:

Passo 1: Iniciar o Back-End (API Flask)
O Back-End é responsável por gerenciar usuários, favoritos/equipe e fazer a integração com a PokeAPI.

Navegue até o diretório do Back-End:

cd backend/

Ative o Ambiente Virtual (venv):
Assumindo que você já criou e configurou o ambiente virtual, ative-o:

# No Windows (Comum):
.\venv\Scripts\activate

(Se estiver no Linux/macOS, use: source venv/bin/activate)

Instale as Dependências:
Se esta for a primeira vez, instale as bibliotecas necessárias.

pip install -r requirements.txt
# (Se não tiver o arquivo requirements.txt, instale manualmente: pip install flask flask-sqlalchemy flask-migrate flask-cors flask-jwt-extended requests)

Execute as Migrações (Configuração do Banco de Dados):
Certifique-se de que o banco de dados pokedex.db e as tabelas (usuario, pokemon_usuario, etc.) estejam criadas.

flask db upgrade

Inicie o Servidor Flask:
O servidor será iniciado na porta padrão http://127.0.0.1:5000.

flask run

Mantenha este terminal aberto e funcionando.

Passo 2: Iniciar o Front-End (Aplicação Angular)
O Front-End consome a API Flask e exibe a interface no navegador.

Navegue para o diretório do Front-End:
Abra um novo terminal e vá para o diretório do Angular:

cd frontend/

Instale as Dependências (Node/NPM):

npm install

Inicie o Servidor de Desenvolvimento Angular:
O Front-End será iniciado na porta http://localhost:4200 e abrirá automaticamente no seu navegador.

ng serve --open

Aplicação Pronta!
Acesse http://localhost:4200/ no seu navegador.

Se for a primeira vez, clique em Novo Cadastro para criar um usuário.

Faça o login para começar a gerenciar seus Pokémon!

