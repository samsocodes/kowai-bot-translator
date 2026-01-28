import fs from "fs";
import path from "path";
import readline from "readline";
import { fileURLToPath } from "url";
import translate from "@iamtraction/google-translate";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PASTA_HISTORIAS = path.join(__dirname, "historias");

// Criar interface para perguntas
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

async function perguntar(texto) {
  return new Promise(resolve => rl.question(texto, resolve));
}

// FUNÇÃO PRINCIPAL
async function main() {
  console.log("=".repeat(60));
  console.log("🤖 TRADUTOR DE HISTÓRIAS JAPONESAS");
  console.log("=".repeat(60));
  console.log("Pasta das histórias:", PASTA_HISTORIAS);
  
  // 1. Verificar se a pasta existe
  if (!fs.existsSync(PASTA_HISTORIAS)) {
    console.log("\n❌ Pasta 'historias' não encontrada!");
    console.log("📁 Criando pasta...");
    fs.mkdirSync(PASTA_HISTORIAS, { recursive: true });
    console.log("✅ Pasta criada!");
    console.log("\n📝 COMO USAR:");
    console.log("1. Coloque seus arquivos .txt na pasta 'historias'");
    console.log("2. Execute este script novamente");
    console.log("3. Escolha qual arquivo traduzir");
    rl.close();
    return;
  }
  
  // 2. Listar arquivos na pasta
  const arquivos = fs.readdirSync(PASTA_HISTORIAS)
    .filter(arquivo => arquivo.endsWith('.txt'))
    .map(arquivo => {
      const caminho = path.join(PASTA_HISTORIAS, arquivo);
      const stats = fs.statSync(caminho);
      const jaTraduzido = arquivo.includes('_PT') || arquivo.includes('_TRAD');
      
      return {
        nome: arquivo,
        caminho: caminho,
        tamanho: stats.size,
        traduzido: jaTraduzido
      };
    });
  
  if (arquivos.length === 0) {
    console.log("\n❌ Nenhum arquivo .txt encontrado na pasta!");
    console.log("\n📝 O QUE FAZER:");
    console.log("1. Baixe histórias com seu outro script");
    console.log("2. Ou copie arquivos .txt para esta pasta:");
    console.log("   " + PASTA_HISTORIAS);
    rl.close();
    return;
  }
  
  // 3. Mostrar menu
  console.log("\n📁 ARQUIVOS ENCONTRADOS:");
  console.log("-".repeat(50));
  
  arquivos.forEach((arquivo, i) => {
    const kb = Math.round(arquivo.tamanho / 1024);
    const status = arquivo.traduzido ? "✓ JÁ TRADUZIDO" : "⏳ PARA TRADUZIR";
    console.log(`${i + 1}. ${arquivo.nome} (${kb} KB) - ${status}`);
  });
  
  console.log("-".repeat(50));
  
  // 4. Perguntar o que fazer
  console.log("\n🎯 O QUE VOCÊ QUER FAZER?");
  console.log("1. Traduzir UM arquivo específico");
  console.log("2. Traduzir TODOS os não traduzidos");
  console.log("3. Sair");
  
  const opcao = await perguntar("\nDigite o número (1-3): ");
  
  if (opcao === '3') {
    console.log("👋 Até logo!");
    rl.close();
    return;
  }
  
  if (opcao === '1') {
    // Traduzir UM arquivo
    const numero = await perguntar(`\nQual arquivo? (1-${arquivos.length}): `);
    const index = parseInt(numero) - 1;
    
    if (isNaN(index) || index < 0 || index >= arquivos.length) {
      console.log("❌ Número inválido!");
      rl.close();
      return;
    }
    
    const arquivo = arquivos[index];
    
    if (arquivo.traduzido) {
      const confirmar = await perguntar(`⚠️  "${arquivo.nome}" já foi traduzido. Traduzir de novo? (s/n): `);
      if (confirmar.toLowerCase() !== 's') {
        console.log("❌ Cancelado!");
        rl.close();
        return;
      }
    }
    
    await traduzirUmArquivo(arquivo);
    
  } else if (opcao === '2') {
    // Traduzir TODOS os não traduzidos
    const naoTraduzidos = arquivos.filter(a => !a.traduzido);
    
    if (naoTraduzidos.length === 0) {
      console.log("✅ Todos os arquivos já foram traduzidos!");
      rl.close();
      return;
    }
    
    console.log(`\n🚀 Vou traduzir ${naoTraduzidos.length} arquivo(s)...`);
    
    for (const arquivo of naoTraduzidos) {
      console.log(`\n📄 Traduzindo: ${arquivo.nome}`);
      await traduzirUmArquivo(arquivo);
      
      // Aguardar entre arquivos
      if (naoTraduzidos.length > 1) {
        console.log("⏸️  Aguardando 3 segundos...");
        await new Promise(resolve => setTimeout(resolve, 3000));
      }
    }
    
    console.log("\n🎉 TODOS OS ARQUIVOS TRADUZIDOS!");
    
  } else {
    console.log("❌ Opção inválida!");
  }
  
  rl.close();
}

// FUNÇÃO QUE TRADUZ UM ÚNICO ARQUIVO
async function traduzirUmArquivo(arquivo) {
  try {
    console.log(`\n📖 Lendo: ${arquivo.nome}`);
    const texto = fs.readFileSync(arquivo.caminho, 'utf8');
    console.log(`📏 Tamanho: ${texto.length} caracteres`);
    
    // Verificar se parece japonês
    const temJapones = /[ぁ-んァ-ン一-龯]/.test(texto);
    if (!temJapones) {
      console.log("⚠️  Aviso: Pode não estar em japonês");
    }
    
    console.log("🌐 Traduzindo japonês → português...");
    console.log("⏳ Isso pode levar alguns minutos...");
    
    const inicio = Date.now();
    
    // DIVIDIR TEXTO LONGO 
    let textoTraduzido;
    if (texto.length > 1500) {
      console.log("📦 Texto longo, dividindo...");
      
      // Dividir em partes
      const partes = [];
      const tamanhoParte = 1800;
      const frases = texto.split(/(?<=[。.!?！？\n])/);
      
      let parteAtual = "";
      for (const frase of frases) {
        if ((parteAtual + frase).length > tamanhoParte && parteAtual) {
          partes.push(parteAtual.trim());
          parteAtual = frase;
        } else {
          parteAtual += frase;
        }
      }
      if (parteAtual.trim()) partes.push(parteAtual.trim());
      
      console.log(`📦 Dividido em ${partes.length} partes`);
      
      // Traduzir cada parte
      const partesTraduzidas = [];
      for (let i = 0; i < partes.length; i++) {
        console.log(`🔄 Traduzindo parte ${i + 1}/${partes.length}...`);
        
        try {
          const resultado = await translate(partes[i], { from: 'ja', to: 'pt' });
          partesTraduzidas.push(resultado.text);
          
          // Aguardar entre partes
          if (i < partes.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 1500));
          }
        } catch (erro) {
          console.log(`❌ Erro na parte ${i + 1}: ${erro.message}`);
          partesTraduzidas.push(partes[i]); // Mantém original
        }
      }
      
      textoTraduzido = partesTraduzidas.join('\n\n');
    } else {
      // Texto curto, traduzir de uma vez
      const resultado = await translate(texto, { from: 'ja', to: 'pt' });
      textoTraduzido = resultado.text;
    }
    
    const tempo = Math.round((Date.now() - inicio) / 1000);
    
    // SALVAR
    const nomeTraduzido = arquivo.nome.replace('.txt', '_PT.txt');
    const caminhoTraduzido = path.join(PASTA_HISTORIAS, nomeTraduzido);
    
    fs.writeFileSync(caminhoTraduzido, textoTraduzido, 'utf8');
    
    console.log("\n" + "=".repeat(50));
    console.log("✅ TRADUÇÃO CONCLUÍDA!");
    console.log("=".repeat(50));
    console.log(`\n📊 Resultado:`);
    console.log(`   Tempo: ${tempo} segundos`);
    console.log(`   Original: ${texto.length} caracteres`);
    console.log(`   Traduzido: ${textoTraduzido.length} caracteres`);
    console.log(`   Arquivo: ${nomeTraduzido}`);
    console.log(`   Pasta: ${PASTA_HISTORIAS}`);
    
    // Mostrar uma prévia
    console.log("\n📖 Primeiras linhas:");
    console.log("-".repeat(50));
    const linhas = textoTraduzido.split('\n');
    for (let i = 0; i < Math.min(3, linhas.length); i++) {
      console.log(linhas[i].substring(0, 100) + (linhas[i].length > 100 ? "..." : ""));
    }
    console.log("-".repeat(50));
    
  } catch (erro) {
    console.error(`\n💥 ERRO ao traduzir "${arquivo.nome}":`, erro.message);
  }
}

// Executar
main().catch(erro => {
  console.error("💥 ERRO FATAL:", erro);
  rl.close();
});
