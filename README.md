# Controlo — Gestão de Finanças Pessoais

Aplicação web completa para gestão de finanças pessoais com controlo de gastos mensais e anuais.

## Stack

| Camada | Tecnologia |
|---|---|
| Frontend | React 18 + Vite + Tailwind CSS + shadcn/ui |
| Backend | Node.js + Express |
| Base de dados | MongoDB + Mongoose |
| Autenticação | JWT (JSON Web Tokens) |
| Gráficos | Recharts |
| Formulários | React Hook Form + Zod |
| Notificações | Sonner |

---

## Funcionalidades

- 🔐 **Autenticação** — Registo, login, logout com JWT
- 💸 **Transações** — Registo de entradas e saídas com categoria, data e descrição
- 📂 **Categorias** — 10 categorias padrão + categorias personalizadas
- 📊 **Dashboard** — Resumo mensal com gráfico de pizza e transações recentes
- 📅 **Relatórios** — Tabela anual e gráfico de barras por mês
- 🌙 **Tema claro/escuro** — Toggle persistido no localStorage
- 📱 **Responsivo** — Sidebar deslizante em mobile

---

## Pré-requisitos

- [Node.js](https://nodejs.org/) v18+
- [MongoDB](https://www.mongodb.com/try/download/community) local ou [MongoDB Atlas](https://www.mongodb.com/atlas) (gratuito)
- npm ou yarn

---

## Instalação e execução

### 1. Clonar / abrir o projeto

```bash
cd "p:\controlo"
```

### 2. Configurar o Backend

```bash
cd backend
npm install
```

Criar o ficheiro `.env` baseado no exemplo:

```bash
cp .env.example .env
```

Editar `backend/.env`:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/controlo
JWT_SECRET=muda_este_valor_para_algo_secreto_e_longo
JWT_EXPIRES_IN=7d
FRONTEND_URL=http://localhost:5173
```

> **MongoDB Atlas (cloud):** Substitui `MONGODB_URI` pela connection string do Atlas, ex:  
> `mongodb+srv://user:password@cluster.mongodb.net/controlo`

Iniciar o backend:

```bash
npm run dev
```

O servidor arranca em `http://localhost:5000`

---

### 3. Configurar o Frontend

```bash
cd ../frontend
npm install
```

Criar `.env` (opcional, o proxy já está configurado no Vite):

```env
VITE_API_URL=http://localhost:5000/api
```

Iniciar o frontend:

```bash
npm run dev
```

A aplicação abre em `http://localhost:5173`

---

## Estrutura do projeto

```
controlo/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js              # Ligação MongoDB
│   │   ├── middleware/
│   │   │   └── auth.js            # Middleware JWT
│   │   ├── models/
│   │   │   ├── User.js            # Modelo utilizador
│   │   │   ├── Transaction.js     # Modelo transação
│   │   │   └── Category.js        # Modelo categoria
│   │   └── routes/
│   │       ├── auth.js            # Rotas autenticação
│   │       ├── transactions.js    # Rotas transações
│   │       └── categories.js      # Rotas categorias
│   ├── server.js                  # Ponto de entrada
│   ├── .env.example
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── ui/                # shadcn/ui components
    │   │   ├── layout/            # Sidebar, Header, Layout
    │   │   ├── dashboard/         # SummaryCards, ExpenseChart, RecentTransactions
    │   │   └── transactions/      # TransactionForm, TransactionTable
    │   ├── contexts/
    │   │   ├── AuthContext.jsx    # Estado de autenticação global
    │   │   └── ThemeContext.jsx   # Estado do tema global
    │   ├── lib/
    │   │   ├── api.js             # Cliente axios + endpoints
    │   │   ├── utils.js           # Helpers (formatação, etc.)
    │   │   └── constants.js       # Constantes (meses, anos, cores)
    │   └── pages/
    │       ├── LoginPage.jsx
    │       ├── RegisterPage.jsx
    │       ├── DashboardPage.jsx
    │       ├── TransactionsPage.jsx
    │       ├── CategoriesPage.jsx
    │       └── ReportsPage.jsx
    ├── index.html
    ├── tailwind.config.js
    ├── vite.config.js
    └── package.json
```

---

## API Endpoints

### Autenticação
| Método | Endpoint | Descrição |
|---|---|---|
| POST | `/api/auth/register` | Criar conta |
| POST | `/api/auth/login` | Fazer login |
| GET | `/api/auth/me` | Dados do utilizador atual |

### Transações
| Método | Endpoint | Descrição |
|---|---|---|
| GET | `/api/transactions` | Listar (filtros: month, year, type, category) |
| GET | `/api/transactions/summary` | Resumo (income, expense, balance, breakdown) |
| GET | `/api/transactions/annual` | Dados anuais por mês |
| POST | `/api/transactions` | Criar transação |
| PUT | `/api/transactions/:id` | Atualizar transação |
| DELETE | `/api/transactions/:id` | Eliminar transação |

### Categorias
| Método | Endpoint | Descrição |
|---|---|---|
| GET | `/api/categories` | Listar categorias do utilizador |
| POST | `/api/categories` | Criar categoria personalizada |
| DELETE | `/api/categories/:id` | Eliminar categoria (não padrão) |

---

## Categorias padrão

Ao registar, são criadas automaticamente 10 categorias:

`Rendas` · `Subscrições` · `Dentista` · `Médico` · `Comida` · `Transporte` · `Lazer` · `Outros` · `Salário` · `Rendimentos Extra`

---

## Scripts disponíveis

### Backend
```bash
npm run dev    # Desenvolvimento com nodemon
npm start      # Produção
```

### Frontend
```bash
npm run dev     # Desenvolvimento (Vite HMR)
npm run build   # Build para produção
npm run preview # Preview do build
```

---

## Segurança

- Passwords com hash bcrypt (salt rounds: 12)
- JWT com expiração configurável
- Rate limiting nas rotas de autenticação (20 req / 15min)
- Rate limiting geral (100 req / 15min)
- Headers de segurança com Helmet
- Validação de todos os inputs com express-validator e Zod
- Todas as rotas protegidas verificam ownership (user ID)
