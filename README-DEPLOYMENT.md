# Guia de Deploy no Vercel - Contador de Dias

## Pré-requisitos

1. Conta no [Vercel](https://vercel.com)
2. Conta no [MongoDB Atlas](https://www.mongodb.com/atlas) (para banco de dados na nuvem)
3. Repositório Git (GitHub, GitLab ou Bitbucket)

## Passos para Deploy

### 1. Preparar o Banco de Dados

1. Acesse [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Crie um novo cluster (gratuito)
3. Configure o acesso de rede (adicione 0.0.0.0/0 para permitir acesso de qualquer lugar)
4. Crie um usuário de banco de dados
5. Obtenha a string de conexão (MongoDB URI)

### 2. Fazer Push do Código

```bash
git add .
git commit -m "Preparar para deploy no Vercel"
git push origin main
```

### 3. Deploy no Vercel

1. Acesse [Vercel](https://vercel.com) e faça login
2. Clique em "New Project"
3. Importe seu repositório do GitHub/GitLab/Bitbucket
4. Configure as variáveis de ambiente:

#### Variáveis de Ambiente Necessárias:

- `MONGODB_URI`: String de conexão do MongoDB Atlas
- `JWT_SECRET`: Uma string secreta para JWT (ex: "meu-jwt-secret-super-seguro-123")
- `FRONTEND_URL`: URL do seu frontend (será fornecida pelo Vercel após o deploy)

### 4. Configurar Variáveis de Ambiente no Vercel

1. No dashboard do projeto no Vercel, vá para "Settings"
2. Clique em "Environment Variables"
3. Clique em "Add New" para cada variável
4. Adicione as seguintes variáveis de ambiente:

**Nome:** `MONGODB_URI`  
**Valor:** `mongodb+srv://usuario:senha@cluster.mongodb.net/contadordias`

**Nome:** `JWT_SECRET`  
**Valor:** `seu-jwt-secret-aqui`

**Nome:** `FRONTEND_URL`  
**Valor:** `https://seu-app.vercel.app`

**Importante:** 
- Use os nomes EXATOS das variáveis (em maiúsculas)
- Substitua os valores pelos seus dados reais
- Para o `FRONTEND_URL`, use a URL que o Vercel gerar após o primeiro deploy

### 5. Atualizar URL da API no Frontend

Após o deploy, atualize o arquivo `.env.production` no frontend com a URL correta da API:

```
REACT_APP_API_URL=https://seu-app.vercel.app/api
```

### 6. Redeploy

Após configurar as variáveis de ambiente, faça um novo deploy:

1. Vá para a aba "Deployments"
2. Clique nos três pontos do último deployment
3. Selecione "Redeploy"

## Estrutura do Projeto para Vercel

```
contadordias/
├── api/
│   └── index.js          # API principal para Vercel
├── frontend/
│   ├── src/
│   ├── public/
│   └── package.json
├── backend/              # Código original do backend
├── vercel.json          # Configuração do Vercel
├── package.json         # Dependências principais
└── .vercelignore       # Arquivos a ignorar no deploy
```

## Testando o Deploy

1. Acesse a URL fornecida pelo Vercel
2. Teste o registro de usuário
3. Teste o login
4. Teste a criação de contadores
5. Verifique se todas as funcionalidades estão funcionando

## Troubleshooting

### Erro de CORS
- Verifique se a variável `FRONTEND_URL` está configurada corretamente
- Certifique-se de que a URL não tem barra no final

### Erro de Conexão com MongoDB
- Verifique se a string de conexão está correta
- Confirme se o IP 0.0.0.0/0 está liberado no MongoDB Atlas
- Verifique se o usuário e senha estão corretos

### Erro 404 nas rotas da API
- Verifique se o arquivo `vercel.json` está na raiz do projeto
- Confirme se as rotas estão configuradas corretamente

### Frontend não carrega
- Verifique se o build do React foi executado corretamente
- Confirme se a variável `REACT_APP_API_URL` está configurada

## Comandos Úteis

```bash
# Instalar dependências
npm run install-all

# Executar localmente
npm start

# Build do frontend
npm run build

# Build para Vercel
npm run vercel-build
```

## Monitoramento

- Use o dashboard do Vercel para monitorar logs e performance
- Configure alertas no MongoDB Atlas para monitorar o banco de dados
- Considere usar ferramentas como Sentry para monitoramento de erros

## Atualizações Futuras

Para fazer atualizações:

1. Faça as alterações no código
2. Commit e push para o repositório
3. O Vercel fará o deploy automaticamente
4. Verifique se tudo está funcionando corretamente

## Custos

- Vercel: Gratuito para projetos pessoais (com limitações)
- MongoDB Atlas: Gratuito até 512MB (cluster M0)
- Domínio personalizado: Opcional (custo adicional)