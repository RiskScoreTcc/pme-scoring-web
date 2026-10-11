# PME Scoring Web — Frontend

Interface web do **PME Scoring**, uma aplicação de apoio à análise de risco de crédito de pequenas e médias empresas (PMEs). O frontend oferece telas para autenticação, visão geral, consulta e gerenciamento de empresas, ocorrências, pesos de avaliação e usuários.

> O frontend depende da API PME Scoring para operações com dados e regras de negócio. A interface, sozinha, não inicia o backend nem o banco de dados.

## Repositórios e imagem Docker

- **Frontend:** [RiskScoreTcc/pme-scoring-web](https://github.com/RiskScoreTcc/pme-scoring-web)
- **Backend:** [RiskScoreTcc/pme-scoring](https://github.com/RiskScoreTcc/pme-scoring)
- **Imagem Docker publicada:** [`riskscore/pme-scoring-web`](https://hub.docker.com/repository/docker/riskscore/pme-scoring-web/general)
- **Imagem Docker do backend:** [`riskscore/pme-scoring`](https://hub.docker.com/repository/docker/riskscore/pme-scoring/general)

Os exemplos usam a tag `latest`. Caso a imagem esteja publicada com outra tag, substitua `latest` pela tag exibida no Docker Hub.

## Sumário

- [Funcionalidades](#funcionalidades)
- [Tecnologias](#tecnologias)
- [Arquitetura](#arquitetura)
- [Executar a imagem publicada](#executar-a-imagem-publicada)
- [Executar o sistema completo](#executar-o-sistema-completo)
- [Desenvolvimento local](#desenvolvimento-local)
- [Configuração e comunicação com a API](#configuração-e-comunicação-com-a-api)
- [Build e testes](#build-e-testes)
- [Estrutura do projeto](#estrutura-do-projeto)
- [Boas práticas](#boas-práticas)
- [Solução de problemas](#solução-de-problemas)

## Funcionalidades

- **Autenticação:** tela de login integrada à autenticação JWT.
- **Visão geral:** dashboard com indicadores resumidos.
- **Empresas:** pesquisa, filtros, paginação e ações relacionadas à avaliação de risco.
- **Ocorrências:** consulta e acompanhamento de ocorrências de inadimplência.
- **Configuração de pesos:** interface para administrar os pesos usados no cálculo de risco.
- **Usuários e acessos:** interface de gerenciamento de usuários e seus tipos de acesso.
- **Exportação CSV:** acesso à exportação de relatórios, de acordo com as funcionalidades e permissões oferecidas pela API.

A disponibilidade das ações depende da versão do backend, das permissões do usuário e da configuração do ambiente.

## Tecnologias

| Tecnologia | Uso |
|---|---|
| Angular 22 | Framework de interface |
| TypeScript 6 | Linguagem principal |
| Angular Router | Navegação entre páginas |
| Angular Forms | Formulários e validação |
| HttpClient | Comunicação HTTP com a API |
| RxJS | Fluxos assíncronos |
| jwt-decode | Leitura de informações do token JWT no cliente |
| SweetAlert2 | Alertas e diálogos |
| CSS | Estilização e responsividade |
| Nginx | Servir o build e encaminhar chamadas da API no container |
| Docker | Empacotamento e distribuição da aplicação |
| Vitest | Testes unitários configurados no projeto |

As dependências e os scripts estão definidos em `package.json`.

## Arquitetura

```text
Navegador
   |
   v
Nginx (porta 80)
   |-- Arquivos compilados do Angular
   |
   | chamadas /api/*
   v
Backend Spring Boot (serviço Docker: app, porta 8080)
   |
   v
PostgreSQL
```

A imagem publicada contém o frontend compilado e o Nginx. No ambiente Docker integrado, o Nginx encaminha caminhos `/api/` para `http://app:8080`. Para esse nome ser resolvido, o frontend e o backend precisam compartilhar uma rede Docker e o serviço backend deve estar acessível como `app`.

## Executar a imagem publicada

### Pré-requisitos

- Docker Engine instalado e iniciado.
- Backend e PostgreSQL disponíveis se quiser usar as funcionalidades que consultam ou alteram dados.

### 1. Baixar a imagem

```bash
docker pull riskscore/pme-scoring-web:latest
```

### 2. Iniciar o container

```bash
docker run -d \
  --name pme-scoring-web \
  --restart unless-stopped \
  -p 8081:80 \
  riskscore/pme-scoring-web:latest
```

Acesse **http://localhost:8081**.

Esse comando publica a interface na porta `8081` do computador. Se o container estiver isolado, as requisições à API podem não funcionar: o proxy Nginx espera alcançar o serviço `app` na rede Docker. Para executar a solução completa, use o Compose descrito na próxima seção.

Para acompanhar os logs e parar o container:

```bash
docker logs -f pme-scoring-web
docker stop pme-scoring-web
docker rm pme-scoring-web
```

## Executar o sistema completo

O jeito recomendado de executar frontend, backend e banco em conjunto é usar o Docker Compose documentado no [README do backend](https://github.com/RiskScoreTcc/pme-scoring). O Compose integrado deve:

- usar `riskscore/pme-scoring-web:latest` para o frontend;
- usar `riskscore/pme-scoring:latest` para a API;
- criar um serviço PostgreSQL persistente;
- colocar os serviços na mesma rede Docker;
- manter o backend acessível pelo nome `app` na porta interna `8080`;
- configurar as variáveis necessárias para banco, JWT, administrador inicial e CORS.

Na pasta que contém o arquivo Compose e o `.env`, execute:

```bash
docker compose pull
docker compose up -d
docker compose ps
```

Em uma configuração que publica o frontend na porta 80, acesse **http://localhost/**. A API normalmente fica disponível em `http://localhost:8080/`, e o Swagger UI em `http://localhost:8080/swagger-ui/index.html` se estiver habilitado.

Não exponha o serviço publicamente com credenciais de exemplo, segredos JWT fracos ou CORS excessivamente permissivo.

## Desenvolvimento local

### Pré-requisitos

- Node.js compatível com a versão usada no projeto (a imagem de build utiliza Node.js 22).
- npm; o projeto declara `npm@11.19.0` como gerenciador de pacotes.
- Git.
- Backend em execução para testar fluxos integrados.

### 1. Clonar o repositório

```bash
git clone https://github.com/RiskScoreTcc/pme-scoring-web.git
cd pme-scoring-web
```

### 2. Instalar dependências

```bash
npm ci
```

O comando usa as versões registradas no `package-lock.json`.

### 3. Iniciar o servidor de desenvolvimento

```bash
npm start
```

A aplicação ficará disponível em **http://localhost:4200** e será atualizada automaticamente durante o desenvolvimento.

> Executar o Angular localmente não inicia a API nem o PostgreSQL. Confira os arquivos de ambiente e configure a URL base do backend para o ambiente local.

## Configuração e comunicação com a API

- Confira as configurações em `src/environments/` e os serviços HTTP antes de alterar a URL da API.
- Ao executar o frontend por meio do Nginx em Docker, as chamadas para `/api/` são encaminhadas para `http://app:8080` dentro da rede Docker configurada.
- Não use `http://app:8080` como hostname diretamente no navegador do usuário: `app` é o nome do serviço dentro da rede Docker.
- Não inclua senhas, segredos JWT ou credenciais privadas no frontend. Variáveis incluídas no bundle Angular podem ser inspecionadas no navegador.
- A autorização deve ser validada pelo backend; decodificar um JWT no cliente não comprova, por si só, a validade ou as permissões do usuário.

## Build e testes

### Build de produção

```bash
npm run build
```

Os arquivos compilados são gerados em `dist/`. O Dockerfile do projeto copia o build de produção para a imagem Nginx.

### Build de desenvolvimento com observação de alterações

```bash
npm run watch
```

### Testes unitários

```bash
npm test
```

Os testes são configurados com Vitest. O Angular CLI não inclui, por padrão, uma estrutura de testes end-to-end; configure uma ferramenta adicional se esse tipo de teste for necessário.

### Construir uma imagem local

Na raiz do repositório:

```bash
docker build -f docker/Dockerfile -t pme-scoring-web:local .
docker run --rm --name pme-scoring-web -p 8081:80 pme-scoring-web:local
```

Acesse http://localhost:8081. A integração com a API depende da rede Docker e da configuração do proxy Nginx.

## Estrutura do projeto

```text
pme-scoring-web/
├── docker/
│   ├── Dockerfile
│   └── nginx.conf
├── public/                 # Arquivos públicos estáticos
├── src/
│   ├── app/                # Componentes, rotas, modelos e serviços
│   ├── environments/       # Configurações de ambiente
│   ├── index.html
│   ├── main.ts             # Ponto de entrada Angular
│   └── styles.css          # Estilos globais
├── angular.json            # Configuração do Angular CLI
├── package.json            # Dependências e scripts npm
├── package-lock.json       # Versões resolvidas das dependências
└── tsconfig.json           # Configuração TypeScript
```

A estrutura pode evoluir com o desenvolvimento; consulte a árvore atual do repositório.

## Boas práticas

- Apresente scores, valores financeiros e classificações com formatação consistente.
- Não use somente cores para comunicar risco ou estado; inclua texto ou outro indicador acessível.
- Trate estados de carregamento, sucesso, ausência de dados e falhas de API.
- Preserve acessibilidade de formulários, tabelas, mensagens e navegação.
- Verifique a responsividade em diferentes larguras de tela.
- Não armazene segredos no frontend e não trate dados decodificados do JWT como autorização confiável.

## Solução de problemas

### A página abre, mas os dados não carregam

Verifique se o backend está em execução, se o frontend consegue resolver o serviço `app` na rede Docker e se o Nginx está encaminhando `/api/` para a API. Confira também os logs do backend e a configuração de CORS.

### `docker pull` não encontra a tag

Abra a página da imagem no Docker Hub e confira as tags disponíveis. Substitua `latest` pela tag efetivamente publicada.

### A porta 8081 já está ocupada

Troque o mapeamento de porta, por exemplo, de `-p 8081:80` para `-p 8082:80`, e acesse `http://localhost:8082`.

### Atualizar a imagem publicada

```bash
docker pull riskscore/pme-scoring-web:latest
docker stop pme-scoring-web
docker rm pme-scoring-web
docker run -d --name pme-scoring-web --restart unless-stopped -p 8081:80 riskscore/pme-scoring-web:latest
```

Se estiver usando Docker Compose, prefira `docker compose pull` seguido de `docker compose up -d`.

## Links

- [Repositório frontend no GitHub](https://github.com/RiskScoreTcc/pme-scoring-web)
- [Imagem frontend no Docker Hub](https://hub.docker.com/repository/docker/riskscore/pme-scoring-web/general)
- [Repositório backend no GitHub](https://github.com/RiskScoreTcc/pme-scoring)
- [Imagem backend no Docker Hub](https://hub.docker.com/repository/docker/riskscore/pme-scoring/general)
