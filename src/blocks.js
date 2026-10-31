// Blocks: a label for sets that contain the same exercises.
// Purely for display. Nothing is saved, and sets and subsets are never reordered or
// changed; the grouping is worked out again from the sets on every render.
// Each lifting day (one lift, or one program day) groups only its own sets, so its
// blocks always start at A.

// 0 -> "A", 25 -> "Z", 26 -> "AA", 701 -> "ZZ", 702 -> "AAA", and so on.
export function blockLabel(index) {
  let label = "";
  let n = index + 1;
  while (n > 0) {
    n--;
    label = String.fromCharCode(65 + (n % 26)) + label;
    n = Math.floor(n / 26);
  }
  return label;
}

// The exercises in a set, ignoring order and every value (reps, weight, RIR).
// [Squat, Lunge] and [Lunge, Squat] match; [Squat, Squat] and [Squat] don't.
function compositionKey(set) {
  return set.subsets
    .map((subset) => subset.exercise.id)
    .sort((a, b) => a - b)
    .join(",");
}

// sets (in position order) -> [{ key, label, sets }]. Blocks come in the order their
// exercises first appear, and each block keeps its sets in their original order.
export function groupSetsIntoBlocks(sets) {
  const blocks = [];
  const blocksByKey = new Map();
  for (const set of sets) {
    const key = compositionKey(set);
    let block = blocksByKey.get(key);
    if (!block) {
      block = { key: key, label: blockLabel(blocks.length), sets: [] };
      blocksByKey.set(key, block);
      blocks.push(block);
    }
    block.sets.push(set);
  }
  return blocks;
}
