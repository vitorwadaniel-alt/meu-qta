@echo off
REM Script para Windows - Iniciar emuladores e aplicação automaticamente

echo Iniciando emuladores do Firebase...
start "Firebase Emulators" cmd /k "firebase emulators:start"

echo Aguardando emuladores ficarem prontos...
timeout /t 10 /nobreak >nul

echo Iniciando aplicacao...
npm run dev:app
