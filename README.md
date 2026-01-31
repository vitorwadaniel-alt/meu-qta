# Meu QTA

Sistema de gestão de atividades e requisitos.

## 🚀 Início Rápido

### ✅ Configuração Inicial (Uma vez apenas)

1. **Instalar Firebase CLI** (se ainda não tiver):
   ```bash
   npm install -g firebase-tools
   ```

2. **Fazer login no Firebase**:
   ```bash
   firebase login
   ```

3. **Instalar dependências**:
   ```bash
   npm install
   ```

### 🎯 Desenvolvimento Local (Usando Emuladores)

O projeto está configurado para usar emuladores do Firebase por padrão (arquivo `.env` já criado).

**✅ AUTOMÁTICO: Os emuladores iniciam automaticamente!**

1. **Instalar dependências** (primeira vez apenas):
   ```bash
   npm install
   ```

2. **Iniciar tudo** (emuladores + aplicação):
   ```bash
   npm run dev
   ```
   
   Isso iniciará automaticamente:
   - 🔥 Emuladores do Firebase (Firestore: 8080, Auth: 9099, UI: 4000)
   - ⚡ Aplicação Vite (http://localhost:5173)
   
   A aplicação aguarda os emuladores estarem prontos antes de iniciar.

3. **Acessar**:
   - Aplicação: http://localhost:5173
   - Emulator UI: http://localhost:4000 (para gerenciar dados)

**💡 Dica:** Para iniciar apenas a aplicação (se os emuladores já estiverem rodando):
```bash
npm run dev:app
```

**🔧 Problemas?** Veja o arquivo `TROUBLESHOOTING.md`

### 📋 Scripts Disponíveis

## 📋 Scripts Disponíveis

- `npm run dev` - Inicia o servidor de desenvolvimento (usa emuladores se `.env` estiver configurado)
- `npm run build` - Cria build de produção
- `npm run preview` - Preview do build de produção
- `npm run emulators` - Inicia os emuladores do Firebase (execute antes de `npm run dev`)

## ⚙️ Configuração

### Usar Emuladores (Padrão - já configurado)

O arquivo `.env` já está criado com `VITE_USE_EMULATORS=true`. Para usar emuladores:

1. Execute `npm run emulators` em um terminal
2. Execute `npm run dev` em outro terminal

### Usar Firestore Real (Produção)

Se quiser usar o Firestore real em vez dos emuladores:

1. Remova ou comente a linha no arquivo `.env`:
   ```
   # VITE_USE_EMULATORS=true
   ```

2. Configure as regras do Firestore (veja `CONFIGURAR_FIRESTORE.md`)

3. Execute `npm run dev`

## ⚠️ Importante

- **Para desenvolvimento local**: Use os emuladores (Opção 1)
- **Para produção**: Configure as regras do Firestore (Opção 2)
- Os departamentos padrão (Desbravadores, Aventureiros, Jovens) aparecem automaticamente

## 📁 Estrutura do Projeto

```
src/
  qta/
    components/     # Componentes reutilizáveis
    constants/      # Constantes e configurações
    services/       # Serviços (Firebase)
    utils/          # Funções utilitárias
    QtaApp.jsx      # Componente principal
```

## 🔧 Configuração

- **Firebase Config**: `src/qta/services/firebase.js`
- **Regras Firestore**: `firestore.rules`
- **Emuladores**: `firebase.json`
