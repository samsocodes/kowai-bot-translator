import fs from "fs";
import path from "path";
import axios from "axios";
import * as cheerio from "cheerio";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// CONFIGURAÇÃO
const PASTA_HISTORIAS = path.join(__dirname, "historias");
const HISTORIAS_PARA_BAIXAR = [
  // Adicione os IDs das histórias que quer baixar
  { id: 17958, nome: "historia_1" },
  { id: 23031, nome: "historia_2" },
  { id: 6238, nome: "historia_3" },
  // Adicione mais aqui! Exemplo:
  // { id: 1234, nome: "minha_historia" },
];

// Criar pasta se não existir
if (!fs.existsSync(PASTA_HISTORIAS)) {
  fs.mkdirSync(PASTA_HISTORIAS, { recursive: true });
}

// Função para baixar HTML
async function baixarHTML(url) {
  try {
    const response = await axios.get(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "ja,en-US;q=0.9,en;q=0.8",
        "Referer": "https://kowaihanasi.ghostmap.jp/",
      },
      timeout: 30000
    });
    return response.data;
  } catch (erro) {
    throw new Error(`Falha ao baixar ${url}: ${erro.message}`);
  }
}

// Função para extrair título e história
function extrairConteudo(html) {
  const $ = cheerio.load(html);
  
  // Extrair título
  const tituloElement = $("#title_image_value");
  let titulo = tituloElement.text().trim();
  
  if (!titulo) {
    titulo = $("title").text().trim() || "História sem título";
  }
  
  // Limpar título (remover caracteres inválidos para nome de arquivo)
  titulo = titulo.replace(/[\\/:*?"<>|]/g, "_").substring(0, 100);
  
  // Extrair história (do elemento #detail)
  const conteudoElement = $("#detail");
  let historia = "";
  
  if (conteudoElement.length > 0) {
    historia = conteudoElement.html();
    
    // Converter HTML para texto limpo
    historia = historia.replace(/<br\s*\/?>/gi, '\n');
    historia = historia.replace(/<\/p>|<\/div>/gi, '\n\n');
    historia = historia.replace(/<[^>]*>/g, '');
    historia = historia.replace(/&nbsp;/g, ' ');
    historia = historia.trim();
    
    // Limpar espaços extras
    historia = historia.replace(/\n\s*\n\s*\n/g, '\n\n');
    historia = historia.replace(/[ \t]+/g, ' ');
  } else {
    // Fallback: procurar em outros lugares
    const textoCompleto = $("body").text();
    const linhas = textoCompleto.split('\n')
      .map(l => l.trim())
      .filter(l => l.length > 10 && !l.includes('ホーム') && !l.includes('ログイン'));
    historia = linhas.join('\n');
  }
  
  return { titulo, historia };
}

// Função para salvar a história
function salvarHistoria(id, titulo, historia) {
  // Criar nome do arquivo seguro
  const nomeArquivo = `${id}_${titulo}.txt`
    .replace(/\s+/g, '_')
    .replace(/[\\/:*?"<>|]/g, '_');
  
  const caminho = path.join(PASTA_HISTORIAS, nomeArquivo);
  
  // Adicionar título no início do arquivo
  const conteudoCompleto = `Título: ${titulo}\nID: ${id}\n\n${historia}`;
  
  fs.writeFileSync(caminho, conteudoCompleto, 'utf8');
  return { nomeArquivo, caminho, tamanho: conteudoCompleto.length };
}

// Função principal
async function baixarTodas() {
  console.log("=".repeat(70));
  console.log("📚 BAIXADOR DE VÁRIAS HISTÓRIAS");
  console.log("=".repeat(70));
  console.log(`\n📁 Pasta de destino: ${PASTA_HISTORIAS}`);
  console.log(`📦 Total de histórias para baixar: ${HISTORIAS_PARA_BAIXAR.length}`);
  
  const resultados = [];
  
  for (const historia of HISTORIAS_PARA_BAIXAR) {
    const url = `https://kowaihanasi.ghostmap.jp/hanasi.php?cd=${historia.id}`;
    
    console.log(`\n${"-".repeat(70)}`);
    console.log(`🎯 História #${historia.id} (${historia.nome})`);
    console.log(`🔗 URL: ${url}`);
    
    try {
      // Baixar
      console.log("📥 Baixando...");
      const html = await baixarHTML(url);
      
      // Extrair conteúdo
      console.log("🔍 Extraindo título e história...");
      const { titulo, historia: texto } = extrairConteudo(html);
      
      if (!texto || texto.length < 100) {
        console.log("❌ História muito curta ou vazia, pulando...");
        resultados.push({ id: historia.id, sucesso: false, erro: "História vazia" });
        continue;
      }
      
      console.log(`📝 Título: ${titulo}`);
      console.log(`📏 Texto: ${texto.length} caracteres`);
      
      // Salvar
      console.log("💾 Salvando...");
      const arquivo = salvarHistoria(historia.id, titulo, texto);
      
      console.log(`✅ Salvo como: ${arquivo.nomeArquivo}`);
      console.log(`   📍 ${arquivo.caminho}`);
      
      resultados.push({
        id: historia.id,
        sucesso: true,
        titulo: titulo,
        arquivo: arquivo.nomeArquivo,
        tamanho: arquivo.tamanho
      });
      
      // Aguardar entre downloads (para não sobrecarregar o site)
      if (HISTORIAS_PARA_BAIXAR.length > 1) {
        console.log("⏸️  Aguardando 2 segundos...");
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
      
    } catch (erro) {
      console.error(`❌ ERRO: ${erro.message}`);
      resultados.push({ id: historia.id, sucesso: false, erro: erro.message });
    }
  }
  
  // Relatório final
  console.log("\n" + "=".repeat(70));
  console.log("📊 RELATÓRIO FINAL");
  console.log("=".repeat(70));
  
  const sucessos = resultados.filter(r => r.sucesso).length;
  const falhas = resultados.filter(r => !r.sucesso).length;
  
  console.log(`\n✅ Baixadas com sucesso: ${sucessos}`);
  console.log(`❌ Falhas: ${falhas}`);
  
  if (sucessos > 0) {
    console.log("\n📁 ARQUIVOS BAIXADOS:");
    console.log("-".repeat(50));
    resultados.filter(r => r.sucesso).forEach(r => {
      console.log(`📄 ${r.arquivo} (${r.titulo.substring(0, 40)}...)`);
    });
  }
  
  if (falhas > 0) {
    console.log("\n❌ FALHAS:");
    console.log("-".repeat(50));
    resultados.filter(r => !r.sucesso).forEach(r => {
      console.log(`ID ${r.id}: ${r.erro}`);
    });
  }
  
  console.log(`\n📂 Todos os arquivos estão em: ${PASTA_HISTORIAS}`);
  console.log("\n🎉 Processo concluído!");
}

// Executar
baixarTodas().catch(erro => {
  console.error("💥 ERRO FATAL:", erro);
});
