# Villa System

Sistema web desenvolvido para auxiliar a gestão de pequenas e médias granjas avícolas.

O Villa System busca substituir anotações manuais por informações organizadas, facilitando o acompanhamento da produção, do manejo e das atividades da granja.

## Estado atual do projeto

Atualmente, o sistema possui:

- autenticação por e-mail e senha;
- controle de acesso por perfil;
- área administrativa;
- área do operador;
- cadastro, edição e listagem de usuários;
- ativação e desativação de usuários;
- proteção contra desativação do próprio usuário;
- proteção para manter pelo menos um administrador ativo;
- bloqueio temporário após várias tentativas incorretas de login;
- tratamento de páginas inexistentes e erros inesperados;
- endpoint para verificar a conexão com o banco de dados.

As funcionalidades específicas de manejo, produção, estoque e financeiro ainda estão em desenvolvimento.

## Tecnologias utilizadas

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS
- Auth.js
- Prisma ORM 7
- MariaDB
- Zod
- bcryptjs

## Requisitos

Antes de executar o projeto, é necessário possuir:

- Node.js 20 ou superior;
- npm;
- um banco MariaDB acessível;
- Visual Studio Code ou outro editor de código.

O desenvolvimento atual utiliza Node.js 22.

## Instalação

Abra o PowerShell na pasta do projeto e instale as dependências:

```powershell
npm install
```

## Variáveis de ambiente

O projeto utiliza duas variáveis:

| Variável | Finalidade |
| --- | --- |
| `DATABASE_URL` | Endereço de conexão com o banco MariaDB |
| `AUTH_SECRET` | Chave utilizada para proteger a autenticação |

Crie o arquivo `.env` a partir do exemplo:

```powershell
Copy-Item .\.env.example .\.env
```

Depois, abra o arquivo:

```powershell
code .\.env
```

Exemplo de configuração:

```dotenv
DATABASE_URL="mysql://usuario:senha@localhost:3306/nome_do_banco"
AUTH_SECRET="sua-chave-secreta"
```

Para gerar uma chave segura para `AUTH_SECRET`, execute:

```powershell
node -e "console.log(require('node:crypto').randomBytes(32).toString('base64url'))"
```

Copie o resultado para o `.env`.

Nunca publique o arquivo `.env` e nunca coloque senhas verdadeiras no `.env.example`.

## Banco de dados

O banco informado em `DATABASE_URL` deve existir e possuir a estrutura representada em:

```text
prisma/schema.prisma
```

Valide o schema:

```powershell
npx prisma validate
```

Gere o Prisma Client:

```powershell
npx prisma generate
```

Para verificar a conexão durante o desenvolvimento, inicie o sistema e acesse:

```text
http://localhost:3000/api/health/database
```

O resultado esperado é:

```json
{
  "status": "ok",
  "database": "connected"
}
```

## Executar em desenvolvimento

```powershell
npm run dev
```

Abra no navegador:

```text
http://localhost:3000
```

## Validações do projeto

Verificar o código com o ESLint:

```powershell
npm run lint
```

Criar a compilação de produção:

```powershell
npm run build
```

Verificar vulnerabilidades conhecidas:

```powershell
npm audit
```

Não utilize `npm audit fix --force` sem analisar as mudanças, pois ele pode instalar versões incompatíveis.

## Rotas principais

| Rota | Descrição |
| --- | --- |
| `/login` | Acesso ao sistema |
| `/admin` | Área do administrador |
| `/admin/usuarios` | Gerenciamento de usuários |
| `/operador` | Área do operador |
| `/api/health/database` | Verificação da conexão com o banco |
| `/api/admin/usuarios` | Consulta administrativa de usuários |

## Organização do código

```text
app/
  Páginas, layouts, componentes, ações e rotas da API

application/
  Regras de aplicação, autorizações e operações de usuários

infrastructure/
  Conexão com o banco, repositórios e recursos de segurança

prisma/
  Schema do banco de dados

public/
  Imagens e arquivos públicos

types/
  Tipagens adicionais do projeto
```

## Segurança implementada

O projeto possui:

- senhas armazenadas com hash bcrypt;
- validação de dados com Zod;
- sessões baseadas em JWT;
- verificação do usuário diretamente no banco;
- bloqueio de usuários inativos;
- separação entre administrador e operador;
- proteção das páginas e ações administrativas;
- limitação de tentativas incorretas de login;
- mensagens genéricas para credenciais inválidas;
- tratamento de erros de banco sem exposição de detalhes internos.

## Limitações conhecidas

### Limitação de tentativas de login

A contagem de tentativas é mantida na memória do servidor. Ela é reiniciada quando o processo é encerrado e não é compartilhada entre vários servidores.

Antes de uma implantação com múltiplas instâncias, essa proteção deverá utilizar um armazenamento compartilhado, como Redis ou banco de dados.

### Dependência interna do Prisma

O `npm audit` ainda informa uma vulnerabilidade na cadeia:

```text
deepmerge-ts → @prisma/config → prisma
```

A correção disponível exige uma versão principal incompatível do `deepmerge-ts`. O projeto aguarda uma atualização oficialmente compatível do Prisma e não utiliza `npm audit fix --force`.

## Perfis de acesso

### Administrador

Responsável pelas configurações administrativas e pelo gerenciamento dos usuários.

### Operador

Responsável pelas atividades operacionais da granja, conforme os módulos forem implementados.

## Projeto acadêmico

Este projeto está sendo desenvolvido como Trabalho de Conclusão de Curso na área de Análise e Desenvolvimento de Sistemas.