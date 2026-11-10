// Adapt the existing Japanese-to-English bank for English-to-Japanese play.
// Validate data and use deterministic option order so every client sees the same answers.
export function prepareMinigame1(rawQuestions) {
  if (!Array.isArray(rawQuestions)) throw new Error('Question bank must be a list.');
  const entries = rawQuestions.map(q => {
    const match = /^What does\s+(.+?)\s+mean\?$/i.exec(String(q.question || '').trim());
    const index = Number(q.correctAnswer);
    const english = Array.isArray(q.options) && Number.isInteger(index) ? q.options[index] : null;
    return match && typeof english === 'string' && english.trim()
      ? { id: String(q.id), english: english.trim(), answer: match[1].trim() }
      : null;
  }).filter(Boolean).sort((a,b) => a.id.localeCompare(b.id));
  const unique = entries.filter((q,i) => entries.findIndex(x => x.answer === q.answer) === i);
  if (unique.length < 4) throw new Error('Minigame 1 requires four distinct valid translation questions.');
  return unique.map((q, i) => {
    const pool = unique.filter(x => x.id !== q.id).map(x => x.answer);
    const start = i % pool.length;
    const distractors = [...pool.slice(start), ...pool.slice(0,start)].slice(0,3);
    const options = [q.answer, ...distractors];
    // Deterministic rotation, not client-side randomness.
    const rotate = i % options.length;
    return { ...q, options: [...options.slice(rotate), ...options.slice(0,rotate)] };
  });
}
