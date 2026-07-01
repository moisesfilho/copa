const fs = require('fs');

const commitMsgFile = process.argv[2];
if (!commitMsgFile) {
  console.error('❌ ERRO: Arquivo de mensagem de commit não fornecido.');
  process.exit(1);
}

const commitMsg = fs.readFileSync(commitMsgFile, 'utf8').trim().split('\n')[0];

const pattern = /^(feat|fix|chore|test|refactor|docs|style|perf)(\([a-zA-Z0-9_-]+\))?: [a-z].*[^.]$/;

if (commitMsg.length > 72) {
  console.error(`❌ ERRO: A primeira linha do commit tem ${commitMsg.length} caracteres.`);
  console.error(`Ela deve ter no máximo 72 caracteres.`);
  process.exit(1);
}

if (!pattern.test(commitMsg)) {
  console.error('❌ ERRO: Mensagem de commit inválida!');
  console.error('A mensagem deve seguir o formato: <tipo>([escopo opcional]): <descrição>');
  console.error('Tipos permitidos: feat, fix, chore, test, refactor, docs, style, perf');
  console.error('A descrição deve começar com letra minúscula e NÃO terminar com ponto final.');
  console.error('Exemplo: feat(auth): add login feature');
  console.error(`Sua mensagem: "${commitMsg}"`);
  process.exit(1);
}

console.log('✅ Mensagem de commit validada com base na skill "padrao-commits-semanticos"!');
