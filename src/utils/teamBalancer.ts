export interface Player {
  id: string;
  level: 'Beginner' | 'Intermediate' | 'Pro';
  age: number;
}

const levelWeights = {
  'Beginner': 1,
  'Intermediate': 2,
  'Pro': 3
};

export function balanceTeams(players: Player[]) {
  // Sort players by skill level descending, then age descending
  const sortedPlayers = [...players].sort((a, b) => {
    const weightDiff = levelWeights[b.level] - levelWeights[a.level];
    if (weightDiff !== 0) return weightDiff;
    return b.age - a.age; // Tie-breaker by age
  });

  const teamA: Player[] = [];
  const teamB: Player[] = [];
  let scoreA = 0;
  let scoreB = 0;

  for (const player of sortedPlayers) {
    const playerWeight = levelWeights[player.level];
    
    // Assign to the team with the lower current score
    if (scoreA <= scoreB) {
      teamA.push(player);
      scoreA += playerWeight;
    } else {
      teamB.push(player);
      scoreB += playerWeight;
    }
  }

  return { teamA, teamB };
}
