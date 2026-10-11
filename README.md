# PME Scoring Web

Interface web do **PME Scoring**, uma aplicação de apoio à análise de risco de crédito de pequenas e médias empresas (PMEs). O frontend permite acessar os recursos da plataforma por meio de uma interface organizada para consulta e gerenciamento de empresas, ocorrências, configurações de pesos e usuários.

> Este repositório contém o frontend Angular. As operações que dependem de dados persistidos e regras de negócio precisam do backend PME Scoring em execução.

## Sumário

- [Visão geral](#visão-geral)
- [Funcionalidades](#funcionalidades)
- [Tecnologias](#tecnologias)
- [Arquitetura](#arquitetura)
- [Pré-requisitos](#pré-requisitos)
- [Executar localmente](#executar-localmente)
- [Configuração da API](#configuração-da-api)
- [Executar com Docker](#executar-com-docker)
- [Build e testes](#build-e-testes)
- [Estrutura do projeto](#estrutura-do-projeto)
- [Fluxo de desenvolvimento](#fluxo-de-desenvolvimento)
- [Repositórios relacionados](#repositórios-relacionados)
- [Solução de problemas](#solução-de-problemas)

## Visão geral

O PME Scoring Web foi desenvolvido em Angular e utiliza uma API REST para acessar os recursos do sistema. A interface foi organizada para favorecer clareza, consistência e leitura de informações relevantes à análise de crédito.

### Funcionalidades

- **Autenticação:** tela de login e integração com autenticação baseada em token JWT.
- **Visão geral:** dashboard com indicadores resumidos de risco e empresas avaliadas.
- **Gestão de empresas:** consulta, pesquisa, filtros, paginação e acesso às ações relacionadas à avaliação de risco.
- **Ocorrências:** consulta e acompanhamento de ocorrências de inadimplência.
- **Configuração de pesos:** interface para administrar os pesos usados na composição da avaliação de risco.
- **Usuários e acessos:** interface para gerenciamento de usuários e seus tipos de acesso.
- **Exportação de dados:** acesso à exportação de relatórios de empresas em CSV, conforme as permissões e funcionalidades disponibilizadas pela API.

A disponibilidade de cada ação depende da versão do backend, das permissões do usuário autenticado e da configuração do ambiente.

## Tecnologias

| Tecnologia | Uso |
|---|---|
| Angular 22 | Framework da aplicação web |
| TypeScript 6 | Linguagem principal |
| Angular Router | Navegação entre páginas |
| Angular Forms | Formulários e validação |
| HttpClient | Comunicação HTTP com a API |
| RxJS | Fluxos assíncronos |
| jwt-decode | Leitura de informações do token JWT no cliente |
| SweetAlert2 | Alertas e diálogos de interação |
| CSS | Estilização e responsividade |
| Nginx | Servir os arquivos compilados e encaminhar requisições da API no Docker |
| Docker | Empacotamento e execução em contêiner |
| Vitest | Testes unitários configurados pelo Angular CLI |

As dependências e scripts do projeto estão definidos em `package.json`.

## Arquitetura

Em ambiente de produção com Docker, a arquitetura prevista é:

```text
Navegador
   |
   v
Frontend Angular compilado
   |
   v
Nginx (porta 80)
   |                  \
   | páginas           \ /api/*
   v                    v
Arquivos estáticos   Backend Spring Boot (porta 8080)
                          |
                          v
                    PostgreSQL
```

O Nginx serve a aplicação Angular e encaminha caminhos iniciados por `/api/` para o serviço backend chamado `app` na porta `8080`. Para que esse encaminhamento funcione, o frontend e o backend devem estar na mesma rede Docker e o serviço backend precisa estar disponível com esse nome — como ocorre na configuração integrada do projeto.

## Pré-requisitos

Para executar o frontend localmente:

- Node.js compatível com o projeto; a imagem Docker de build utiliza Node.js 22.
- npm (o projeto declara `npm@11.19.0` como gerenciador de pacotes).
- Git.
- Backend PME Scoring em execução para utilizar as funcionalidades que dependem da API.

Para executar em contêiner:

- Docker Engine.
- Docker Compose, caso vá subir o ambiente integrado a partir do repositório backend.

## Executar localmente

### 1. Clonar o repositório

```bash
git clone https://github.com/RiskScoreTcc/pme-scoring-web.git
cd pme-scoring-web
```

### 2. Instalar as dependências

```bash
npm ci
```

O comando `npm ci` instala as versões registradas no `package-lock.json`.

### 3. Iniciar o servidor de desenvolvimento

```bash
npm start
```

Ou, usando o Angular CLI diretamente:

```bash
npx ng serve
```

A aplicação ficará disponível, por padrão, em:

- Frontend: `http://localhost:4200`

O servidor de desenvolvimento recarrega a aplicação quando os arquivos-fonte são alterados.

> **Atenção:** iniciar o frontend não inicia automaticamente a API nem o banco de dados. Para login, consultas e operações integradas, configure e execute o backend separadamente.

## Configuração da API

A comunicação com o backend depende dos arquivos de ambiente Angular e da configuração HTTP utilizada pelos serviços da aplicação.

- Confira os arquivos de ambiente em `src/environments/`.
- Para desenvolvimento local, configure a URL base da API conforme o endereço em que o backend está acessível no seu computador.
- Ao executar o frontend por meio do Nginx no Docker, as chamadas para `/api/` são encaminhadas para `http://app:8080` dentro da rede Docker configurada.

Não use `http://app:8080` como endereço de API diretamente no navegador: `app` é o nome DNS do serviço dentro da rede Docker, não um hostname que normalmente seja resolvido pelo computador do usuário.

Não armazene senhas, chaves JWT ou outros segredos nos arquivos de ambiente do frontend. Valores incorporados ao bundle Angular podem ser inspecionados por qualquer pessoa que tenha acesso à aplicação compilada. A validação de autenticação e autorização deve ser realizada pelo backend.

## Executar com Docker

O repositório possui um Dockerfile multi-stage em `docker/Dockerfile`. Ele instala dependências, compila a aplicação com a configuração de produção e copia os arquivos gerados para uma imagem Nginx.

### 1. Construir a imagem

Na raiz do repositório frontend:

```bash
docker build -f docker/Dockerfile -t pme-scoring-web:local .
```

### 2. Executar o contêiner

```bash
docker run --rm --name pme-scoring-web -p 8081:80 pme-scoring-web:local
```

Acesse `http://localhost:8081`.

**Importante:** a execução isolada acima disponibiliza os arquivos do frontend, mas a integração com a API só funcionará se o contêiner estiver conectado a uma rede Docker que tenha o backend acessível pelo nome `app`, na porta `8080`. Para executar o sistema completo, prefira a configuração Docker Compose do repositório backend, que coordena os serviços da aplicação e do banco de dados.

### Executar o ambiente integrado

Consulte o repositório [PME Scoring Backend](https://github.com/RiskScoreTcc/pme-scoring) e siga as instruções do `docker-compose.yml` e do arquivo `.env.example` desse projeto. Antes de iniciar, configure as variáveis de ambiente necessárias e revise os valores de exemplo; não reutilize senhas demonstrativas em ambientes compartilhados ou de produção.

Se o Compose construir a imagem do frontend localmente, confirme que o contexto de build aponta para este repositório ou para o diretório correto do frontend e que o serviço Nginx consegue resolver o backend pelo nome `app`.

## Build e testes

### Build de produção

```bash
npm run build
```

Os arquivos compilados são gerados em `dist/`. A imagem Docker utiliza a saída `dist/pme-scoring-web/browser/`.

### Build em modo de desenvolvimento com observação de alterações

```bash
npm run watch
```

### Testes unitários

```bash
npm test
```

O script executa os testes configurados pelo Angular CLI com Vitest. Para adicionar ou executar testes específicos, consulte a configuração de testes e os arquivos de teste existentes no projeto.

### Comandos úteis do Angular CLI

```bash
# Gerar um componente
npx ng generate component features/example

# Consultar comandos disponíveis
npx ng generate --help
```

## Estrutura do projeto

A organização exata pode evoluir com o desenvolvimento. Os diretórios principais incluem:

```text
pme-scoring-web/
├── docker/
│   ├── Dockerfile
│   └── nginx.conf
├── public/                 # Arquivos públicos estáticos
├── src/
│   ├── app/                # Aplicação, componentes, rotas e serviços
│   ├── environments/       # Configurações por ambiente
│   ├── index.html
│   ├── main.ts             # Ponto de entrada Angular
│   └── styles.css          # Estilos globais
├── angular.json            # Configuração do Angular CLI
├── package.json            # Dependências e scripts npm
├── package-lock.json       # Versões resolvidas das dependências
├── tsconfig.json           # Configuração TypeScript
└── README.md
```

## Fluxo de desenvolvimento

1. Crie uma branch para a alteração.
2. Mantenha componentes, serviços e modelos com responsabilidades bem definidas.
3. Trate estados de carregamento, sucesso, ausência de dados e erros da API.
4. Preserve a acessibilidade dos formulários, tabelas, mensagens e controles de navegação.
5. Valide a responsividade em diferentes larguras de tela.
6. Execute `npm test` e `npm run build` antes de abrir um pull request.

### Boas práticas de interface

- Apresente valores financeiros, pontuações e classificações de risco de forma consistente.
- Não use apenas cores para diferenciar estados; combine cores com texto ou ícones acessíveis.
- Exiba mensagens claras para erros de validação e falhas de comunicação.
- Não considere informações decodificadas no frontend como prova de autorização; o backend deve validar permissões.

## Repositórios relacionados

- **Frontend:** [RiskScoreTcc/pme-scoring-web](https://github.com/RiskScoreTcc/pme-scoring-web)
- **Backend:** [RiskScoreTcc/pme-scoring](https://github.com/RiskScoreTcc/pme-scoring)

## Solução de problemas

### `npm ci` falha

Confira a versão do Node.js e do npm e tente novamente após garantir que está na raiz do repositório e que `package-lock.json` está presente:

```bash
node --version
npm --version
npm ci
```

### A página abre, mas as chamadas à API falham

- Verifique se o backend está em execução.
- Confira a URL base da API nos arquivos de ambiente e serviços HTTP.
- Se estiver usando Docker, confirme que os contêineres compartilham uma rede e que o backend está acessível pelo nome `app` na porta `8080`.
- Verifique os logs do backend e do Nginx e as mensagens da aba **Network** nas ferramentas de desenvolvedor do navegador.

### Atualizar a página em uma rota interna retorna erro 404

A configuração Nginx do projeto usa `try_files` com fallback para `index.html`, permitindo que o Angular Router processe as rotas da aplicação. Confirme que o contêiner está usando `docker/nginx.conf` deste repositório.

### O login não funciona

Confirme se a API está disponível e se as credenciais de desenvolvimento foram configuradas no backend. Não presuma credenciais padrão em um ambiente já existente; consulte a configuração segura do backend e os logs de inicialização.

## Licença

Nenhuma licença específica é declarada neste README. Antes de reutilizar ou redistribuir o código, confira se o repositório define uma licença aplicável.
