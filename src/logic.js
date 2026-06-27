export const INTERVALOS = [0, 1, 3, 7, 21]; // dias por caixa (caixa 1..5)

export const DATA_PROVA = '2026-11-29';

export function diasAteProva(hojeISO, dataProva = DATA_PROVA) {
  const a = Date.UTC(...hojeISO.split('-').map((n, i) => i === 1 ? Number(n) - 1 : Number(n)));
  const b = Date.UTC(...dataProva.split('-').map((n, i) => i === 1 ? Number(n) - 1 : Number(n)));
  return Math.round((b - a) / 86400000);
}

export function faseRetaFinal(hojeISO, dataProva = DATA_PROVA) {
  const dias = diasAteProva(hojeISO, dataProva);
  if (dias > 30)
    return { fase: 'Aquecendo os motores', emoji: '🚀', dica: 'Estude um pouquinho todo dia, de todas as matérias. Pouco e sempre vale mais que muito de uma vez!', metaRecomendada: 8 };
  if (dias > 15)
    return { fase: 'Pegando o ritmo', emoji: '🔥', dica: 'Aumente as questões por dia e faça simulados. Capriche nas matérias que você mais erra.', metaRecomendada: 12 };
  if (dias > 7)
    return { fase: 'Reta final', emoji: '🎯', dica: 'Revise as questões que você errou e faça simulados cronometrados para treinar o tempo.', metaRecomendada: 15 };
  if (dias > 0)
    return { fase: 'Véspera', emoji: '😴', dica: 'Calma! Revise pouquinho, durma bem e prepare o material. Você consegue!', metaRecomendada: 6 };
  return { fase: 'É hoje!', emoji: '🏆', dica: 'É o grande dia (ou já passou). Confie em você — estudou bastante!', metaRecomendada: 0 };
}

export const NOMES_CONQUISTAS = {
  'primeiro-passo': '🚀 Primeiro passo',
  'q-100': '💯 Centurião (100 questões)',
  'streak-7': '🔥 Semana perfeita (7 dias)',
};

export function addDias(iso, n) {
  const [y, m, d] = iso.split('-').map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d + n));
  return dt.toISOString().slice(0, 10);
}

export function srsNext(item, acertou, hojeISO) {
  const atual = item?.caixa ?? 1;
  const caixa = acertou ? Math.min(atual + 1, 5) : 1;
  return { caixa, proximaRevisao: addDias(hojeISO, INTERVALOS[caixa - 1]) };
}

export function estaVencida(item, hojeISO) {
  if (!item || !item.proximaRevisao) return true;
  return item.proximaRevisao <= hojeISO;
}

export function xpPorResposta(acertou, dificuldade) {
  return acertou ? 10 * dificuldade : 2;
}

export const NIVEIS = [0, 100, 250, 450, 700, 1000];
export function nivelDe(xp) {
  let nivel = 1;
  for (let i = 0; i < NIVEIS.length; i++) if (xp >= NIVEIS[i]) nivel = i + 1;
  const base = NIVEIS[nivel - 1];
  const prox = NIVEIS[nivel];
  if (prox === undefined) {
    // nível máximo: barra cheia, sem divisão por zero
    return { nivel, xpNoNivel: 1, xpProxNivel: 1, maxed: true };
  }
  return { nivel, xpNoNivel: xp - base, xpProxNivel: prox - base, maxed: false };
}

function diffDias(de, ate) {
  const a = Date.UTC(...de.split('-').map((n,i)=> i===1? Number(n)-1 : Number(n)));
  const b = Date.UTC(...ate.split('-').map((n,i)=> i===1? Number(n)-1 : Number(n)));
  return Math.round((b - a) / 86400000);
}

export function semanaISO(iso) {
  // retorna string "YYYY-Www" da semana ISO da data iso (YYYY-MM-DD), em UTC.
  const [y,m,d] = iso.split('-').map(Number);
  const dt = new Date(Date.UTC(y, m-1, d));
  const day = dt.getUTCDay() || 7;            // domingo=7
  dt.setUTCDate(dt.getUTCDate() + 4 - day);   // quinta da semana ISO
  const yearStart = new Date(Date.UTC(dt.getUTCFullYear(),0,1));
  const week = Math.ceil((((dt - yearStart)/86400000)+1)/7);
  return `${dt.getUTCFullYear()}-W${String(week).padStart(2,'0')}`;
}

export function bumpStreak(state, hojeISO) {
  const { ultimoDia, streak = 0 } = state;
  const sem = semanaISO(hojeISO);
  // Se a semana ISO mudou em relação à última registrada, os freezes da semana são zerados.
  // Se semanaFreeze é null/undefined (estado antigo), mantém freezesUsadosSemana como está
  // para preservar compatibilidade (equivalente a "freeze já usado na semana atual").
  const prevSem = state.semanaFreeze ?? null;
  const freezesValidos = (prevSem !== null && prevSem !== sem) ? 0 : (state.freezesUsadosSemana ?? 0);
  if (!ultimoDia) return { streak: 1, ultimoDia: hojeISO, freezesUsadosSemana: freezesValidos, semanaFreeze: sem };
  const d = diffDias(ultimoDia, hojeISO);
  if (d <= 0) return { ...state };
  if (d === 1) return { streak: streak + 1, ultimoDia: hojeISO, freezesUsadosSemana: freezesValidos, semanaFreeze: sem };
  if (d === 2 && freezesValidos < 1)
    return { streak, ultimoDia: hojeISO, freezesUsadosSemana: freezesValidos + 1, semanaFreeze: sem };
  return { streak: 1, ultimoDia: hojeISO, freezesUsadosSemana: freezesValidos, semanaFreeze: sem };
}

export function montarFila(questoes, srsMap, hojeISO, meta) {
  const vencidas = questoes
    .filter(q => srsMap[q.id] && estaVencida(srsMap[q.id], hojeISO))
    .sort((a, b) => (srsMap[a.id].proximaRevisao).localeCompare(srsMap[b.id].proximaRevisao));
  const novas = questoes.filter(q => !srsMap[q.id]);
  return [...vencidas, ...novas].slice(0, meta);
}

export function checarConquistas(estado) {
  const totalResp = Object.values(estado.respostas ?? {}).reduce((s,r)=>s+r.acertos+r.erros,0);
  const ganhas = new Set(estado.conquistas ?? []);
  const candidatas = [];
  if (totalResp >= 1) candidatas.push('primeiro-passo');
  if (totalResp >= 100) candidatas.push('q-100');
  if ((estado.streak ?? 0) >= 7) candidatas.push('streak-7');
  return candidatas.filter(c => !ganhas.has(c));
}

export function proficienciaTema(estado, questoes, tema) {
  let num = 0, den = 0;
  for (const q of questoes) {
    if (q.tema !== tema) continue;
    const r = estado.respostas?.[q.id];
    if (!r) continue;
    num += q.dificuldade * r.acertos;
    den += q.dificuldade * (r.acertos + r.erros);
  }
  return den ? Math.round(num / den * 100) : null;
}

export function proficienciaGlobal(estado, questoes) {
  let num = 0, den = 0;
  for (const q of questoes) {
    const r = estado.respostas?.[q.id];
    if (!r) continue;
    num += q.dificuldade * r.acertos;
    den += q.dificuldade * (r.acertos + r.erros);
  }
  return den ? Math.round(num / den * 100) : null;
}
