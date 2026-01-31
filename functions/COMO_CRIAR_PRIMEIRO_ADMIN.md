# Como criar o primeiro admin (uma vez)

O script `create-first-admin.js` já está pronto e usa seu UID: **DtnZ90p2pwPL4moox5vcZUQOdje2**.

Falta **só um passo** que só você pode fazer no navegador:

## 1. Baixar a chave do Firebase (uma vez)

1. Abra: **https://console.firebase.google.com**
2. Selecione o projeto **Meu QTA Demo** (meu-qta-demo)
3. Clique no **ícone de engrenagem** (⚙️) ao lado de "Visão geral do projeto"
4. Clique em **Configurações do projeto**
5. Vá na aba **Contas de serviço** (Service accounts)
6. Role a página até a parte **Firebase Admin SDK**
7. Clique em **Gerar nova chave privada** → **Gerar chave**
8. Vai baixar um arquivo JSON (nome tipo `meu-qta-demo-firebase-adminsdk-xxxxx.json`)
9. **Renomeie** esse arquivo para: **serviceAccountKey.json**
10. **Mova** (ou copie) o arquivo **serviceAccountKey.json** para dentro da pasta **functions** deste projeto  
    (a mesma pasta onde está o arquivo `create-first-admin.js`)

## 2. Rodar o script no terminal

Na pasta **raiz do projeto** (onde está o `package.json`), rode:

```bash
cd functions
node create-first-admin.js DtnZ90p2pwPL4moox5vcZUQOdje2
```

Se der certo, vai aparecer algo como:

- ✓ artifacts/sistema-qta-web
- ✓ artifacts/sistema-qta-web/config/admins (seu UID como admin)
- ✓ artifacts/sistema-qta-web/config/approved (seu UID aprovado)
- Pronto! Faça logout e login de novo no app para ver o painel Admin.

## 3. Testar no app

1. Abra **https://meu-qta-demo.web.app**
2. Clique em **Sair** (logout)
3. Entre de novo (login)
4. Você deve ver o calendário e o painel **Admin**

---

**Importante:** o arquivo **serviceAccountKey.json** é secreto. Não compartilhe e não faça commit no Git (ele já está no .gitignore).
