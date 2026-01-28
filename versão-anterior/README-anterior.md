# Kowai Bot — Tradutor de Histórias Japonesas

Projeto em Node.js criado para estudar automação de arquivos e tradução de textos.

O script lê arquivos `.txt` contendo histórias em japonês e gera versões traduzidas
para português brasileiro, salvando os resultados localmente no computador.

## Sobre as histórias
As histórias utilizadas durante os testes **foram copiadas manualmente** do site:

https://kowaihanasi.ghostmap.jp/

Elas **não estão incluídas neste repositório**, por respeito ao conteúdo original.
Este projeto tem como foco exclusivo o **código**, a automação e o processo de tradução.

## Como funciona
O script realiza as seguintes etapas:
- Lê arquivos `.txt` a partir de uma pasta local
- Traduz o conteúdo do japonês para português brasileiro
- Cria automaticamente uma pasta de saída
- Salva as traduções em novos arquivos `.txt`

## Estrutura esperada
kowaiBot/
├─ historias/
│ ├─ historia_1.txt
├─ historias_traduzidas/
├─ traduzirHistorias.js
├─ package.json

## Observação
Projeto com finalidade educacional e experimental, voltado ao estudo de:

- automação de tarefas
- manipulação de arquivos
- tradução de textos

Não há redistribuição de conteúdo original.

## Tecnologias utilizadas
Node.js
JavaScript (ES Modules)
@vitalets/google-translate-api

## Como executar
Após clonar o repositório e instalar as dependências:

```bash
npm install
node traduzirHistorias.js
