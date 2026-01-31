# Autenticação e administradores (Firebase)

O app usa **Firebase Authentication** e **Firestore** para:

- **Login**: Google e e-mail/senha
- **Cadastro**: criar conta com e-mail/senha ou com Google
- **Calendário por usuário**: cada usuário só acessa seus próprios eventos (`artifacts/{appId}/users/{uid}/...`)
- **Módulo Admin**: apenas usuários listados como administradores podem acessar o painel Admin

## Versão beta: aprovação de acesso

Nesta versão beta, **apenas usuários autorizados** podem acessar o sistema:

1. **Cadastro**: ao criar conta (e-mail/senha ou Google), o usuário é colocado na fila de **solicitações pendentes** e vê a tela “Cadastro realizado – pendente de aprovação”.
2. **Admin → Solicitações**: no painel Admin, aba **Solicitações**, aparecem todos os usuários que se cadastraram e aguardam aprovação (com busca por e-mail/nome).
3. **Autorizar**: o admin clica em **Autorizar** → o usuário é adicionado à lista de aprovados e removido da fila; no próximo login ele entra no sistema.
4. **Negar**: o admin clica em **Negar** → a Cloud Function `denyUser` exclui a conta do usuário no Firebase Auth e remove o documento da fila; o usuário pode se cadastrar novamente e aguardar nova apreciação.

Estrutura no Firestore:

- **`artifacts/{appId}/config/approved`**: documento com campo `uids` (array) – UIDs dos usuários aprovados para acessar o app.
- **`artifacts/{appId}/pending_users/{uid}`**: um documento por usuário pendente, com `email`, `displayName`, `createdAt`.

Para que **Negar** exclua de fato o cadastro (e permita novo cadastro com o mesmo e-mail), é necessário fazer o deploy da Cloud Function `denyUser` (ver seção 5).

---

## 1. Configurar Authentication no Firebase Console

1. Acesse [Firebase Console](https://console.firebase.google.com/) e selecione o projeto (ex.: **meu-qta**).
2. No menu lateral: **Build** → **Authentication** → **Get started** (se ainda não ativou).
3. Na aba **Sign-in method**:
   - **E-mail/senha**: ative e salve (permite criar conta e login com e-mail no site).
   - **Google**: ative, configure o nome público do projeto e e-mail de suporte, salve.

Com isso, os usuários poderão:

- Criar conta e entrar com **e-mail e senha** direto no site.
- Entrar com **Google** (pop-up).

---

## 2. Definir quem é administrador

Os administradores são definidos em um documento do Firestore. Apenas quem está nessa lista vê e acessa o módulo **Admin** (categorias do sistema, áreas, classes, etc.).

### Caminho no Firestore

```
artifacts / {appId} / config / admins
```

O `appId` do app está em `src/qta/services/firebase.js` (ex.: `sistema-qta-web`).

### Estrutura do documento `admins`

- **ID do documento**: `admins` (único documento na coleção `config`).
- **Campo**: `uids` (array de strings), onde cada string é o **UID** do usuário no Firebase Auth.

Exemplo:

```json
{
  "uids": [
    "abc123uidDoPrimeiroAdmin",
    "def456uidDoSegundoAdmin"
  ]
}
```

### Como criar o primeiro administrador

1. No **Firebase Console**: **Firestore Database** → **Start collection** (ou use a coleção existente).
2. Crie o caminho:
   - Coleção: `artifacts`
   - Documento: `sistema-qta-web` (ou o `appId` que você usa)
   - Coleção: `config`
   - Documento: `admins`
3. No documento `admins`, adicione um campo:
   - Nome: `uids`
   - Tipo: **array**
   - Valores: uma string com o **UID** do primeiro admin (ex.: o UID do seu usuário de teste).

Para descobrir seu UID:

- Faça login no app e veja no canto da tela (o app exibe algo como `UID: xyz12...`), ou
- No Firebase Console: **Authentication** → **Users** → copie o **User UID** do usuário que será admin.

Depois que o documento `admins` existir, um admin pode adicionar outros admins editando esse documento no Console (adicionando mais UIDs ao array `uids`). As regras do Firestore permitem que apenas quem já está em `uids` altere esse documento.

---

## 3. Regras do Firestore

O arquivo `firestore.rules` na raiz do projeto já inclui:

- **config/admins**: leitura para qualquer usuário autenticado; escrita apenas por quem está em `uids`.
- **public/data**: escrita apenas por quem está em `config/admins` (admins).
- **users/{userId}**: leitura/escrita apenas pelo próprio usuário (calendário isolado).

Após alterar as regras localmente, publique no Firebase:

```bash
firebase deploy --only firestore:rules
```

---

## 4. Resumo

| Onde | O que fazer |
|------|-------------|
| Firebase Console → Authentication | Ativar **E-mail/senha** e **Google**. |
| Firestore → `artifacts/{appId}/config/admins` | Criar documento com campo `uids` (array de UIDs dos admins). |
| Firebase Console → Authentication → Users | Copiar UID do primeiro admin para colar em `uids`. |
| `firestore.rules` | Já preparado; fazer deploy com `firebase deploy --only firestore:rules` se necessário. |

Usuários comuns só veem o calendário após aprovação; quem estiver em `config/admins` vê também o botão e o painel **Admin** (e acessa o app mesmo sem estar em `approved`).

---

## 5. Cloud Function “Negar” (denyUser)

Para que o botão **Negar** na aba Solicitações exclua o usuário do Firebase Auth (e permita que ele se cadastre de novo com o mesmo e-mail), faça o deploy da callable function `denyUser`:

```bash
cd functions
npm install
cd ..
firebase deploy --only functions
```

A função verifica se quem chama é admin (`config/admins`), recebe `uid` (e opcionalmente `appId`), exclui o usuário no Auth e remove o documento em `pending_users`. Região usada: `southamerica-east1`.
