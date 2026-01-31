# 🔧 Troubleshooting - Emuladores Firebase

## ❌ Erro: "Não foi possível conectar ao servidor" nas portas 9099/8080

### Problema
O código está tentando conectar aos emuladores, mas eles não estão rodando.

### Solução

1. **Verifique se os emuladores estão rodando**:
   - Abra um terminal e execute: `npm run emulators`
   - Você deve ver algo como:
     ```
     ✔  All emulators ready! It is now safe to connect.
     i  Emulator UI logging to http://localhost:4000
     ```

2. **Se os emuladores não iniciarem**, verifique:
   - Firebase CLI está instalado: `firebase --version`
   - Você fez login: `firebase login`
   - As portas 8080, 9099 e 4000 estão livres

3. **Ordem correta de execução**:
   ```bash
   # Terminal 1 - PRIMEIRO
   npm run emulators
   
   # Terminal 2 - DEPOIS (aguarde os emuladores iniciarem)
   npm run dev
   ```

4. **Verifique o arquivo `.env`**:
   - Deve conter: `VITE_USE_EMULATORS=true`
   - Se não existir, crie na raiz do projeto

5. **Teste se os emuladores estão acessíveis**:
   - Acesse: http://localhost:4000 (Emulator UI)
   - Se não abrir, os emuladores não estão rodando

## ✅ Checklist

- [ ] Firebase CLI instalado (`firebase --version`)
- [ ] Login feito (`firebase login`)
- [ ] Arquivo `.env` existe com `VITE_USE_EMULATORS=true`
- [ ] Emuladores rodando (`npm run emulators` em um terminal)
- [ ] Aplicação rodando (`npm run dev` em outro terminal)
- [ ] Emulator UI acessível (http://localhost:4000)

## 🔍 Verificar Portas

Se as portas estiverem ocupadas:

```bash
# macOS/Linux - Verificar portas
lsof -i :8080
lsof -i :9099
lsof -i :4000

# Se estiverem ocupadas, pare os processos ou mude as portas no firebase.json
```

## 🆘 Se ainda não funcionar

1. **Pare tudo** (Ctrl+C em ambos os terminais)
2. **Limpe o cache do Vite**:
   ```bash
   rm -rf node_modules/.vite
   ```
3. **Reinicie os emuladores**:
   ```bash
   npm run emulators
   ```
4. **Em outro terminal, reinicie a aplicação**:
   ```bash
   npm run dev
   ```
