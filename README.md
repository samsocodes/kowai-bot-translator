# Kowai Bot — Sistema Completo de Coleta e Tradução de Histórias Japonesas

Projeto em Node.js criado para estudar automação, web scraping e tradução de textos.

## Funcionalidades

O sistema agora possui **dois módulos principais** que funcionam de forma independente ou integrada:

### 1. ** Coletor de Histórias (`baixador-interativo.js`)**
- Baixa histórias diretamente do site usando apenas o ID da URL
- Menu interativo para selecionar quais histórias baixar
- Extrai automaticamente título e conteúdo
- Salva em arquivos `.txt` organizados
- Lista histórias já baixadas

### 2. **🌐 Tradutor Automático (`traduzir-menu.js`)**
- Traduz histórias do japonês para português brasileiro
- Menu interativo para escolher traduções individuais ou em lote
- Divisão inteligente de textos longos (supera limites da API)
- Verifica automaticamente quais histórias já foram traduzidas
- Mostra prévia das traduções

## 📁 Estrutura do Projeto

```
kowaiBot/
├── historias/                    # Pasta das histórias em japonês
│   ├── 2906_テトラポットには乗るな.txt
│   ├── 14905_おじいさんの奇行.txt
│   └── ...
├── historias_traduzidas/        # Histórias traduzidas (gerado automaticamente)
├── baixador-interativo.js       # Coletor de histórias (com menu)
├── baixar-varias.js            # Coletor em lote (configurável)
├── baixar-rapido.js            # Coletor rápido (para IDs específicos)
├── traduzir-menu.js            # Tradutor principal (com menu)
├── traduzir.js                 # Tradutor automático simples
├── traduzir-corrigido.js       # Tradutor robusto (divisão inteligente)
├── package.json
└── README.md
```

## Como Usar

### Primeiro Passo: Baixar Histórias
```bash
# Opção recomendada - Menu interativo
node baixador-interativo.js

# Opção rápida - Para IDs específicos (edite o arquivo primeiro)
node baixar-rapido.js
```

**No menu interativo:**
1. Escolha entre histórias pré-definidas
2. Ou digite os IDs manualmente (ex: `14905,8883,7675`)
3. As histórias serão salvas na pasta `historias/`

### Segundo Passo: Traduzir Histórias
```bash
# Opção recomendada - Menu interativo
node traduzir-menu.js

# Opção automática
node traduzir.js
```

**No menu do tradutor:**
1. Veja todas as histórias disponíveis
2. Escolha traduzir uma específica
3. Ou traduza todas as não traduzidas de uma vez
4. As traduções serão salvas automaticamente

## Configuração Rápida

### Para baixar histórias específicas:
Edite `baixar-rapido.js` e adicione os IDs:
```javascript
const IDs = [
  14905,  // História 1
  8883,   // História 2  
  7675,   // História 3
  // Adicione mais IDs aqui!
];
```

### Para personalizar a lista de histórias populares:
Edite `baixador-interativo.js`:
```javascript
const HISTORIAS_POPULARES = [
  { id: 2906, nome: "テトラポットには乗るな" },
  { id: 14905, nome: "おじいさんの奇行" },
  // Adicione mais histórias
];
```

## Tecnologias Utilizadas

- **Node.js** - Ambiente de execução
- **Axios** - Requisições HTTP para web scraping
- **Cheerio** - Parsing e extração de conteúdo HTML
- **@iamtraction/google-translate** - Tradução automática
- **File System Module** - Manipulação de arquivos
- **Readline** - Interface de linha de comando interativa

## Aprendizados do Projeto

- **Web scraping** responsável (respeitando o site original)
- **Divisão inteligente** de textos longos para APIs com limite
- **Interfaces CLI** amigáveis com menus interativos
- **Processamento assíncrono** em lote
- **Tratamento de erros** robusto em APIs externas
- **Organização modular** de código

## Observações Importantes

1. **Respeito ao conteúdo original**: As histórias não estão incluídas no repositório
2. **Uso educacional**: Foco no estudo de automação e programação
3. **Limites da API**: O tradutor divide automaticamente textos muito longos
4. **Site fonte**: https://kowaihanasi.ghostmap.jp/

## Limitações

- A API de tradução gratuita tem limites de uso
- Textos muito longos podem exigir múltiplas tentativas
- Depende da disponibilidade do site fonte
- Traduções automáticas podem conter imprecisões

## Fluxo de Trabalho Completo

```
ID da História → Baixador → Arquivo .txt → Tradutor → Arquivo Traduzido
     ↓              ↓           ↓            ↓             ↓
  Ex: 14905   Extrai conteúdo  Salva na   Traduz para  Salva como
              e título         pasta      português    *_PT.txt
```

## 🤝 Contribuições

Sinta-se à vontade para:
- Reportar bugs ou problemas
- Sugerir melhorias nas interfaces
- Otimizar o código de tradução
- Adicionar novas funcionalidades

## 📄 Licença

Projeto para fins educacionais. O conteúdo das histórias pertence aos autores originais.


**Dica**: Comece com `node baixador-interativo.js` para baixar histórias e depois use `node traduzir-menu.js` para traduzi-las! ✨

## Próximos passos possíveis

- [ ] Adicionar suporte a mais idiomas
- [ ] Implementar cache das traduções
- [ ] Criar interface web simples
- [ ] Adicionar sistema de favoritos
- [ ] Exportar em formatos diferentes (PDF, EPUB)

---

*Projeto desenvolvido com ❤️ para estudo de automação e programação em JavaScript.*
