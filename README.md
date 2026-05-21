# TeamTask — API de Gestão de Tarefas Colaborativa

API REST para criação e gestão de workspaces colaborativos com
controlo de acesso por roles e tarefas atribuíveis entre membros.

**API em produção:** https://teamtask-rdxt.onrender.com  
**Documentação interactiva:** https://teamtask-rdxt.onrender.com/docs

---

## O que este sistema resolve

Permite que equipas criem workspaces partilhados, convidem membros,
e distribuam tarefas com controlo de quem pode criar, editar, e apagar
cada tarefa — baseado no role do utilizador dentro do workspace.

---

## Funcionalidades implementadas

- Registo e autenticação JWT
- CRUD completo de workspaces com controlo de acesso por role (OWNER/MEMBER)
- Convite de membros para workspaces pelo OWNER
- CRUD completo de tarefas com permissões por criador e owner
- Mudança de status de tarefa (TODO / IN_PROGRESS / DONE)
- Validação de input com Zod
- Documentação automática com Swagger

---

## Como correr localmente

**Requisitos:** Node.js 18+, Docker

```bash
npm install
cp .env.example .env

docker run --name teamtask-db \
  -e POSTGRES_PASSWORD=docker \
  -e POSTGRES_DB=teamtask \
  -p 5432:5432 \
  -d postgres

npx prisma generate
npx prisma migrate dev --name init
npm run dev
```

## Testes

```bash
npm run test:run
```

---

## Decisões técnicas

**Separação em camadas (Controller/Service)** — os handlers HTTP
tratam só de receber requests e devolver responses. A lógica de negócio
— verificar permissões, validar memberships, aceder à base de dados —
vive nos services. Se a regra de permissão mudar, muda num só sítio.

**Erros customizados** — classes `NotFoundError`, `ForbiddenError`,
`ConflictError` com status HTTP incorporado. O `setErrorHandler` central
interpreta todos os erros sem `try/catch` em cada handler.

**Verificação de membership numa query** — em vez de duas queries
sequenciais (verificar membro, depois buscar tarefas), uma única query
com filtro relacional do Prisma verifica e traz os dados ao mesmo tempo.

**Controlo de acesso contextual** — permissões de tarefa verificadas
dentro do handler com base no contexto (criador da tarefa ou owner do
workspace), não num middleware genérico.
