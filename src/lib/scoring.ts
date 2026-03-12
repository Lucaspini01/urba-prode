import type { Pick, Margin } from "@prisma/client";

export function calculatePoints(
  homeScore: number,
  awayScore: number,
  pick: Pick,
  margin: Margin
): number {
  // Determinar resultado real
  let realPick: Pick;
  if (homeScore > awayScore) {
    realPick = "HOME";
  } else if (awayScore > homeScore) {
    realPick = "AWAY";
  } else {
    realPick = "DRAW";
  }

  // Determinar margen real
  const diff = Math.abs(homeScore - awayScore);
  const realMargin: Margin = diff > 7 ? "MORE_7" : "LESS_7";

  const pickCorrect = pick === realPick;
  const marginCorrect = margin === realMargin;

  if (pickCorrect && marginCorrect) return 5;
  if (pickCorrect) return 4;
  return 0;
}
