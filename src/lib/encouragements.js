export const ENCOURAGEMENTS = [
  "You've got this!",
  "One small step at a time.",
  "Bamboo grows one ring at a time, so do you.",
  "Great focus! Keep it going.",
  "Almost there, snack break soon!",
  "Progress, not perfection.",
  "Future you says thank you!",
  "Deep breath. Next sentence, next line.",
  "Look at you, being productive!",
  "Slow and steady wins the bamboo race.",
  "Every minute counts, and you're counting them well.",
  "Your panda believes in you.",
  "Tiny effort now, big relief later.",
  "You're building something great.",
  "Stay curious, stay cozy.",
  "Focus mode: activated.",
  "That's the spirit!",
  "Starting early is a superpower.",
  "One task. One panda. One bamboo stalk.",
  "Hydrate! Sip of water?",
  "Shoulders down, eyes on the prize.",
  "You're doing better than you think.",
  "Keep going, the forest is growing!",
  "Hard things get easier once you begin.",
  "Distractions can wait. Bamboo can't.",
  "Nice rhythm. Don't stop now.",
  "Rest is part of the plan, too.",
  "A little more and you're done with this block.",
  "Proud of you for showing up.",
  "Finish strong, then munch some bamboo!",
];

export const randomEncouragement = (prev) => {
  let m;
  do m = ENCOURAGEMENTS[Math.floor(Math.random() * ENCOURAGEMENTS.length)];
  while (m === prev && ENCOURAGEMENTS.length > 1);
  return m;
};
