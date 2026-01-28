import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { translate } from "@vitalets/google-translate-api";

// resolver __dirname no ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const pastaHistorias = path.join(__dirname, "historias");
const pastaTraduzidas = path.join(__dirname, "historias_traduzidas");

// cria pasta de saída se não existir
if (!fs.existsSync(pastaTraduzidas)) {
  fs.mkdirSync(pastaTraduzidas);
  console.log("📁 Pasta 'historias_traduzidas' criada");
}

console.log("📖 Lendo arquivos de histórias...");

const arquivos = fs.readdirSync(pastaHistorias).filter(f => f.endsWith(".txt"));

if (arquivos.length === 0) {
  console.log("⚠️ Nenhum arquivo .txt encontrado");
  process.exit();
}

for (const arquivo of arquivos) {
  try {
    console.log(`🔄 Traduzindo: ${arquivo}`);

    const caminho = path.join(pastaHistorias, arquivo);
    const texto = fs.readFileSync(caminho, "utf-8");

    const resultado = await translate(texto, {
      from: "ja",
      to: "pt"
    });

    const novoNome = arquivo.replace(".txt", "_pt.txt");
    const caminhoSaida = path.join(pastaTraduzidas, novoNome);

    fs.writeFileSync(caminhoSaida, resultado.text, "utf-8");

    console.log(`✅ Tradução salva: ${novoNome}`);
  } catch (erro) {
    console.error(`❌ Erro em ${arquivo}:`, erro.message);
  }
}

console.log("🏁 Processo finalizado.");
