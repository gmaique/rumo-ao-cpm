# Rumo ao CPM — 6º ano 🎖️

App de estudo gamificado para o **concurso de admissão ao 6º ano do Colégio da Polícia Militar do Paraná (CPM-PR)**. Feito para uma criança que terminou o 5º ano estudar de forma leve e motivadora, no celular.

Mesmo motor do app de estudos PND, com conteúdo trocado para o nível de 5º ano nas 5 matérias da prova: **Português, Matemática, Ciências, Geografia e História**.

## O que tem
- **Repetição espaçada (SRS)**: as questões que erra voltam mais cedo; as que acerta espaçam.
- **XP, níveis e ofensiva (streak)** com gelo (freeze) — para criar hábito diário.
- **Jornada até o CPM**: contagem regressiva e fases até a data da prova (29/11/2026).
- **Treino por matéria** e **painel de acertos** por matéria.
- **Simulado (modo prova)**: questões embaralhadas, cronômetro, resultado por matéria só no fim.
- **PWA**: instala como app no celular e funciona offline.

## Rodar local
`python3 -m http.server 8000` e abrir http://localhost:8000

## Testes
`node --test`

## Conteúdo
- `data/questoes.json` — banco de questões (nível 5º ano), campos: `tema` (portugues/matematica/ciencias/geografia/historia), `enunciado`, `alternativas`, `correta` (índice), `explicacao`, `dificuldade` (1-3).
- Para adicionar questões, edite o JSON seguindo o mesmo formato e dê `git push`. `node --test` valida o schema.

> A data da prova (29/11/2026) é uma estimativa baseada na última edição (30/11/2025). Ajuste em `src/logic.js` (`DATA_PROVA`) quando sair o edital oficial.
