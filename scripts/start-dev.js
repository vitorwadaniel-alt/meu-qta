#!/usr/bin/env node

import { spawn } from 'child_process';
import http from 'http';

console.log('🔥 Iniciando emuladores do Firebase...');

// Iniciar emuladores (npx usa o firebase-tools do projeto)
const emulators = spawn('npx', ['firebase', 'emulators:start'], {
  stdio: 'inherit'
});

// Função para verificar se os emuladores estão prontos
function checkEmulatorsReady() {
  return new Promise((resolve) => {
    const check = () => {
      const req = http.get('http://localhost:4100', (res) => {
        if (res.statusCode === 200) {
          resolve(true);
        } else {
          setTimeout(check, 2000);
        }
      });
      
      req.on('error', () => {
        setTimeout(check, 2000);
      });
      
      req.setTimeout(1000, () => {
        req.destroy();
        setTimeout(check, 2000);
      });
    };
    
    check();
  });
}

// Aguardar emuladores ficarem prontos
console.log('⏳ Aguardando emuladores ficarem prontos...');
checkEmulatorsReady().then(() => {
  console.log('✅ Emuladores prontos!');
  console.log('⚡ Iniciando aplicação...\n');
  
  // Iniciar Vite
  const vite = spawn('npm', ['run', 'dev:app'], {
    stdio: 'inherit'
  });
  
  // Limpar ao sair
  process.on('SIGINT', () => {
    console.log('\n🛑 Parando emuladores e aplicação...');
    emulators.kill();
    vite.kill();
    process.exit();
  });
  
  process.on('SIGTERM', () => {
    emulators.kill();
    vite.kill();
    process.exit();
  });
});
