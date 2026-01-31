# 🚀 Configurar Firebase Emulator para Desenvolvimento Local

## Por que usar o Emulator?

O Firebase Emulator permite desenvolver localmente sem precisar:
- Configurar regras de segurança no Firestore real
- Gastar recursos do Firebase
- Ter conexão com a internet (após a primeira instalação)

## 📦 Instalação

### 1. Instalar Firebase CLI (se ainda não tiver)

```bash
npm install -g firebase-tools
```

### 2. Fazer login no Firebase

```bash
firebase login
```

### 3. Instalar dependências do projeto

```bash
npm install
```

## 🎯 Como Usar

### Iniciar os Emuladores

Em um terminal, execute:

```bash
npm run emulators
```

Ou:

```bash
firebase emulators:start
```

Isso iniciará:
- **Firestore Emulator** na porta `8080`
- **Auth Emulator** na porta `9099`
- **Emulator UI** na porta `4000` (interface visual para gerenciar dados)

### Iniciar a Aplicação

Em outro terminal, execute:

```bash
npm run dev
```

A aplicação estará disponível em `http://localhost:5173` e se conectará automaticamente aos emuladores.

## 🎨 Emulator UI

Acesse `http://localhost:4000` para:
- Ver dados do Firestore em tempo real
- Criar/editar/deletar documentos manualmente
- Ver usuários autenticados
- Testar regras de segurança

## 📝 Criar Departamentos Padrão Manualmente

Se os departamentos padrão não forem criados automaticamente, você pode criá-los manualmente no Emulator UI:

1. Acesse `http://localhost:4000`
2. Vá em **Firestore**
3. Navegue até: `artifacts` → `sistema-qta-web` → `public` → `data` → `departments`
4. Clique em **Add collection** ou adicione documentos com os seguintes dados:

### Departamento 1:
- **ID**: (deixe o Firebase gerar)
- **name**: `Desbravadores`
- **order**: `1`

### Departamento 2:
- **ID**: (deixe o Firebase gerar)
- **name**: `Aventureiros`
- **order**: `2`

### Departamento 3:
- **ID**: (deixe o Firebase gerar)
- **name**: `Jovens`
- **order**: `3`

## 🔧 Arquivos Configurados

- `firebase.json` - Configuração dos emuladores
- `.firebaserc` - Projeto Firebase padrão
- `firestore.rules` - Regras de segurança (usadas pelo emulador)
- `src/qta/services/firebase.js` - Configurado para conectar aos emuladores em desenvolvimento

## ⚠️ Importante

- Os emuladores rodam apenas localmente
- Os dados são temporários (perdidos ao parar os emuladores)
- Para produção, você precisará configurar as regras no Firebase Console real
- O código detecta automaticamente se está em desenvolvimento e usa os emuladores

## 🐛 Troubleshooting

### Erro: "Emulators not available"
- Certifique-se de que `npm run emulators` está rodando
- Verifique se as portas 8080, 9099 e 4000 estão livres

### Erro: "Permission denied"
- O emulador usa as regras do arquivo `firestore.rules`
- As regras já estão configuradas para permitir acesso autenticado

### Dados não aparecem
- Verifique no Emulator UI (`http://localhost:4000`) se os dados foram criados
- Recarregue a página da aplicação
