/**
 * Script para criar o primeiro admin no Firestore (uma vez).
 * Uso: cd functions && node create-first-admin.js SEU_UID
 *
 * Antes: baixe a chave de conta de serviço no Firebase Console
 * (Configurações do projeto → Contas de serviço → Gerar nova chave privada)
 * e salve como serviceAccountKey.json na pasta functions/ ou na raiz do projeto.
 */

import { readFileSync, existsSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

const __dirname = dirname(fileURLToPath(import.meta.url));

const uid = process.argv[2];
if (!uid || uid.length < 10) {
  console.error("Uso: node create-first-admin.js SEU_UID");
  console.error("Exemplo: node create-first-admin.js abc123xyz456...");
  console.error("\nCopie seu UID em: Firebase Console → Authentication → Users → User UID");
  process.exit(1);
}

// Procurar a chave em functions/ ou na raiz do projeto
const keyPathInFunctions = join(__dirname, "serviceAccountKey.json");
const keyPathInRoot = join(__dirname, "..", "serviceAccountKey.json");
let keyPath = existsSync(keyPathInFunctions) ? keyPathInFunctions : keyPathInRoot;

if (!existsSync(keyPath)) {
  console.error("Arquivo serviceAccountKey.json não encontrado.");
  console.error("\nPassos:");
  console.error("1. Firebase Console → ícone de engrenagem → Configurações do projeto");
  console.error("2. Aba 'Contas de serviço'");
  console.error("3. Clique em 'Gerar nova chave privada'");
  console.error("4. Salve o arquivo JSON como 'serviceAccountKey.json' na pasta 'functions' deste projeto");
  process.exit(1);
}

const serviceAccount = JSON.parse(readFileSync(keyPath, "utf8"));

initializeApp({
  credential: cert(serviceAccount),
  projectId: serviceAccount.project_id || "meu-qta-demo",
});

const db = getFirestore();

async function main() {
  try {
    // Documento principal (appId)
    await db.doc("artifacts/sistema-qta-web").set({ placeholder: "x" }, { merge: true });
    console.log("✓ artifacts/sistema-qta-web");

    // Admins
    await db.doc("artifacts/sistema-qta-web/config/admins").set({ uids: [uid] });
    console.log("✓ artifacts/sistema-qta-web/config/admins (seu UID como admin)");

    // Aprovados (beta)
    await db.doc("artifacts/sistema-qta-web/config/approved").set({ uids: [uid] });
    console.log("✓ artifacts/sistema-qta-web/config/approved (seu UID aprovado)");

    console.log("\nPronto! Faça logout e login de novo no app para ver o painel Admin.");
  } catch (err) {
    console.error("Erro:", err.message);
    process.exit(1);
  }
  process.exit(0);
}

main();
