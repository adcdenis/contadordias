# Contador de Dias

Uma aplicação web para acompanhar eventos importantes da sua vida, permitindo visualizar quanto tempo falta ou já passou desde datas específicas.

## Funcionalidades

- **Autenticação de Usuários**: Registro, login e gerenciamento de perfil
- **Gerenciamento de Contadores**: Criar, visualizar, editar e excluir contadores de dias
 - **Categorização**: Organizar contadores por categorias
- **Contagem em Tempo Real**: Visualização de dias, horas, minutos e segundos
- **Painel Administrativo**: Gerenciamento de usuários (apenas para administradores)
- **Interface Responsiva**: Experiência otimizada em dispositivos móveis e desktop

## Tecnologias Utilizadas

### Backend
- Node.js
- Express.js
- MongoDB com Mongoose
- JWT para autenticação
- Bcrypt para criptografia de senhas

### Frontend
- React.js
- React Router para navegação
- Context API para gerenciamento de estado
- Axios para requisições HTTP
- Tailwind CSS para estilização
- date-fns para manipulação de datas

## Como Executar

### Pré-requisitos
- Node.js (v14 ou superior)
- MongoDB (local ou Atlas)

### Configuração

1. Clone o repositório:
```
git clone https://github.com/seu-usuario/contadordias.git
cd contadordias
```

2. Instale as dependências:
```
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

3. Configure as variáveis de ambiente:
Crie um arquivo `.env` na pasta backend com:
```
PORT=5000
MONGO_URI=sua_conexao_mongodb
JWT_SECRET=seu_segredo_jwt
```

4. Inicie a aplicação:
```
# Backend (em um terminal)
cd backend
npm start

# Frontend (em outro terminal)
cd frontend
npm start
```

5. Acesse a aplicação em `http://localhost:3000`

## Estrutura do Projeto

```
contadordias/
├── backend/
│   ├── controllers/    # Controladores da API
│   ├── middleware/     # Middleware de autenticação
│   ├── models/         # Modelos de dados (Mongoose)
│   ├── routes/         # Rotas da API
│   └── server.js       # Ponto de entrada do servidor
└── frontend/
    ├── public/         # Arquivos estáticos
    └── src/
        ├── components/ # Componentes React reutilizáveis
        ├── context/    # Context API para gerenciamento de estado
        ├── pages/      # Páginas da aplicação
        └── utils/      # Utilitários e helpers
```

Aplicativo web responsivo para gerenciar contadores de tempo (countdowns/countups).

## Funcionalidades

- Gestão de contadores de tempo (criar, editar, excluir)
- Visualização em tempo real dos contadores
- Sistema de autenticação de usuários
- Interface responsiva para desktop e dispositivos móveis
- Categorização e filtragem de contadores
- Recursos extras: categorias personalizadas

## Tecnologias Utilizadas

- **Frontend**: React + TailwindCSS
- **Backend**: Node.js (Express)
- **Banco de Dados**: MongoDB
- **Autenticação**: JWT (JSON Web Token)

## Instalação e Execução

### Pré-requisitos
- Node.js (v14+)
- MongoDB

### Backend
```bash
cd backend
npm install
npm start
```

### Frontend
```bash
cd frontend
npm install
npm start
```

## Estrutura do Projeto
- `/backend` - API RESTful e lógica de servidor
- `/frontend` - Interface de usuário React