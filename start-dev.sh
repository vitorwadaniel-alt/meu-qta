#!/bin/bash

# Script para iniciar emuladores e aplicação automaticamente

echo "🚀 Iniciando emuladores do Firebase..."
firebase emulators:start > /tmp/firebase-emulators.log 2>&1 &
EMULATOR_PID=$!

echo "⏳ Aguardando emuladores ficarem prontos..."
sleep 5

# Verificar se os emuladores estão rodando
until curl -s http://localhost:4100 > /dev/null 2>&1; do
  echo "   Aguardando emuladores..."
  sleep 2
done

echo "✅ Emuladores prontos!"
echo "⚡ Iniciando aplicação..."

# Iniciar Vite
npm run dev:app

# Limpar ao sair
trap "kill $EMULATOR_PID 2>/dev/null" EXIT
