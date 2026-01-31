# 🔧 Configurar Regras do Firestore

## ⚠️ IMPORTANTE

Se você está vendo erros de "permission-denied", você tem **duas opções**:

### ✅ Opção 1: Usar Emuladores (Recomendado para desenvolvimento)

1. Crie um arquivo `.env` na raiz do projeto:
   ```
   VITE_USE_EMULATORS=true
   ```

2. Execute em um terminal:
   ```bash
   npm run emulators
   ```

3. Em outro terminal:
   ```bash
   npm run dev
   ```

Os emuladores não precisam de regras configuradas e funcionam localmente!

### ✅ Opção 2: Configurar Regras no Firestore Real

Se você preferir usar o Firestore real (não recomendado para desenvolvimento local):

## Problema
O aplicativo está retornando erros de "permission-denied" porque as regras de segurança do Firestore não estão configuradas.

## Solução

### Passo 1: Acessar o Firebase Console
1. Acesse: https://console.firebase.google.com/
2. Selecione o projeto: **meu-qta**

### Passo 2: Configurar as Regras
1. No menu lateral, clique em **Firestore Database**
2. Clique na aba **Regras** (Rules)
3. Substitua o conteúdo atual pelas regras abaixo:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Helper function para verificar se o usuário está autenticado
    function isAuthenticated() {
      return request.auth != null;
    }
    
    // Regras para dados públicos (departments, classes, system_categories)
    match /artifacts/{appId}/public/data/{document=**} {
      // Permitir leitura para usuários autenticados
      allow read: if isAuthenticated();
      
      // Permitir escrita para usuários autenticados (para criar departamentos padrão)
      allow write: if isAuthenticated();
    }
    
    // Regras para dados do usuário (categories, tags, events)
    match /artifacts/{appId}/users/{userId}/{document=**} {
      // Permitir leitura e escrita apenas para o próprio usuário
      allow read, write: if isAuthenticated() && request.auth.uid == userId;
    }
  }
}
```

### Passo 3: Publicar as Regras
1. Clique no botão **Publicar** (Publish)
2. Aguarde a confirmação de que as regras foram atualizadas

### Passo 4: Testar
1. Recarregue a aplicação no navegador
2. Os departamentos padrão (Desbravadores, Aventureiros, Jovens) devem ser criados automaticamente
3. Verifique o console do navegador - não deve haver mais erros de permissão

## ⚠️ Importante

**ATENÇÃO**: As regras acima permitem que **qualquer usuário autenticado** possa ler e escrever nos dados públicos (departments, classes, system_categories). 

Se você quiser restringir a escrita apenas para administradores, você precisará:
1. Adicionar um campo `isAdmin: true` nos documentos de usuário
2. Modificar as regras para verificar esse campo antes de permitir escrita

**Exemplo de regras mais restritivas (apenas leitura pública, escrita apenas para admins):**

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    function isAuthenticated() {
      return request.auth != null;
    }
    
    function isAdmin() {
      return isAuthenticated() && 
             get(/databases/$(database)/documents/artifacts/$(appId)/users/$(request.auth.uid)).data.isAdmin == true;
    }
    
    match /artifacts/{appId}/public/data/{document=**} {
      allow read: if isAuthenticated();
      allow write: if isAdmin(); // Apenas admins podem escrever
    }
    
    match /artifacts/{appId}/users/{userId}/{document=**} {
      allow read, write: if isAuthenticated() && request.auth.uid == userId;
    }
  }
}
```

## 📝 Notas

- O arquivo `firestore.rules` foi criado na raiz do projeto para referência
- Após configurar as regras, os departamentos padrão serão criados automaticamente na primeira execução
- Se ainda houver problemas, verifique o console do navegador para mais detalhes
