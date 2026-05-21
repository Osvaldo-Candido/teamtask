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

PS C:\Users\OSSAN KABILA\Desktop\spl\teamtask> npm run test:run

> teamtask@1.0.0 test:run
> vitest run

RUN v4.1.0 C:/Users/OSSAN KABILA/Desktop/spl/teamtask

✓ src/tests/tasks.test.ts (8 tests) 3872ms
✓ POST membro do workspace consegue criar tarefas 324ms
✓ criador consegue editar sua tarefa 351ms
✓ Owner consegue editar tarefa que não croiou 481ms
✓ Utilizador sem relação com a tarefa recebe 403 ao editar 345ms
✓ delete funciona para o criador e o owner 558ms
✓ src/tests/workspace.test.ts (4 tests) 1539ms
✓ src/tests/auth.test.ts (2 tests) 929ms

Test Files 3 passed (3)
Tests 14 passed (14)
Start at 20:09:27
Duration 9.70s (transform 336ms, setup 0ms, import 2.07s, tests 6.34s, environment 0ms)

## Arquitectura

O projecto segue uma separação em três camadas:

- **Routes** — recebem o request HTTP e delegam ao service
- **Services** — contêm a lógica de negócio, verificam permissões e regras
- **Repositories** — abstraem o acesso à base de dados

Os services não conhecem o Prisma. Os handlers não conhecem regras de negócio.
Esta separação permite testar a lógica de negócio sem base de dados,
usando repositórios em memória nos testes unitários.
