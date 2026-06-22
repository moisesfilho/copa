export interface TeamStats {
  id: string;
  name: string;
  flagId: string;
  points: number;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  fairPlayPoints: number;
}

export function calculateStandings(matches: any[]): Record<string, TeamStats[]> {
  const groups: Record<string, TeamStats[]> = {};
  
  // 1. Process all matches to calculate basic global stats
  const tempStats: Record<string, Record<string, TeamStats>> = {};

  matches.forEach(m => {
    // We only care about group stage matches
    const stageName = m.StageName?.[0]?.Description;
    const groupName = m.GroupName?.[0]?.Description;
    
    if (!stageName || !groupName || (groupName.toLowerCase().indexOf('group') === -1 && groupName.toLowerCase().indexOf('grupo') === -1)) {
      return; 
    }

    if (!tempStats[groupName]) {
      tempStats[groupName] = {};
    }

    const home = m.Home;
    const away = m.Away;

    if (!home || !away || !home.IdTeam || !away.IdTeam) return;

    // Initialize teams if not exists
    [home, away].forEach(team => {
      if (!tempStats[groupName][team.IdTeam]) {
        tempStats[groupName][team.IdTeam] = {
          id: team.IdTeam,
          name: team.TeamName?.[0]?.Description || '',
          flagId: team.IdCountry || '',
          points: 0, played: 0, won: 0, drawn: 0, lost: 0,
          goalsFor: 0, goalsAgainst: 0, goalDifference: 0,
          fairPlayPoints: 0 // Mock, as we don't have card data
        };
      }
    });

    const homeStats = tempStats[groupName][home.IdTeam];
    const awayStats = tempStats[groupName][away.IdTeam];

    // Only process played matches
    if (m.MatchStatus === 0 && m.HomeTeamScore !== null && m.AwayTeamScore !== null) {
      homeStats.played++;
      awayStats.played++;
      
      homeStats.goalsFor += m.HomeTeamScore;
      homeStats.goalsAgainst += m.AwayTeamScore;
      
      awayStats.goalsFor += m.AwayTeamScore;
      awayStats.goalsAgainst += m.HomeTeamScore;

      if (m.HomeTeamScore > m.AwayTeamScore) {
        homeStats.won++;
        homeStats.points += 3;
        awayStats.lost++;
      } else if (m.HomeTeamScore < m.AwayTeamScore) {
        awayStats.won++;
        awayStats.points += 3;
        homeStats.lost++;
      } else {
        homeStats.drawn++;
        awayStats.drawn++;
        homeStats.points += 1;
        awayStats.points += 1;
      }
    }
  });

  // 2. Compute Goal Difference
  Object.keys(tempStats).forEach(g => {
    Object.values(tempStats[g]).forEach(t => {
      t.goalDifference = t.goalsFor - t.goalsAgainst;
    });
  });

  // 3. Sort teams based on FIFA Rules
  Object.keys(tempStats).forEach(groupName => {
    let teams = Object.values(tempStats[groupName]);

    teams.sort((a, b) => {
      // Rule 1: Points
      if (a.points !== b.points) return b.points - a.points;
      
      // Rule 2: Goal Difference
      if (a.goalDifference !== b.goalDifference) return b.goalDifference - a.goalDifference;
      
      // Rule 3: Goals Scored
      if (a.goalsFor !== b.goalsFor) return b.goalsFor - a.goalsFor;

      // Rule 4, 5, 6: Head-to-Head (Confronto Direto)
      const h2hStats = calculateHeadToHead(matches, [a.id, b.id], groupName);
      if (h2hStats[a.id].points !== h2hStats[b.id].points) {
        return h2hStats[b.id].points - h2hStats[a.id].points;
      }
      if (h2hStats[a.id].goalDifference !== h2hStats[b.id].goalDifference) {
        return h2hStats[b.id].goalDifference - h2hStats[a.id].goalDifference;
      }
      if (h2hStats[a.id].goalsFor !== h2hStats[b.id].goalsFor) {
        return h2hStats[b.id].goalsFor - h2hStats[a.id].goalsFor;
      }

      // Rule 7: Fair Play (Cards)
      if (a.fairPlayPoints !== b.fairPlayPoints) return b.fairPlayPoints - a.fairPlayPoints; // Assuming negative points

      // Rule 8: Drawing of Lots (fallback to name just to be stable)
      return a.name.localeCompare(b.name);
    });

    groups[groupName] = teams;
  });

  // Return sorted alphabetically by group name
  const sortedGroups: Record<string, TeamStats[]> = {};
  Object.keys(groups).sort().forEach(g => {
    sortedGroups[g] = groups[g];
  });

  return sortedGroups;
}

function calculateHeadToHead(matches: any[], teamIds: string[], groupName: string) {
  const stats: Record<string, any> = {};
  teamIds.forEach(id => {
    stats[id] = { points: 0, goalsFor: 0, goalsAgainst: 0, goalDifference: 0 };
  });

  const h2hMatches = matches.filter(m => 
    m.GroupName?.[0]?.Description === groupName &&
    m.MatchStatus === 0 &&
    teamIds.includes(m.Home?.IdTeam) && 
    teamIds.includes(m.Away?.IdTeam)
  );

  h2hMatches.forEach(m => {
    const homeId = m.Home.IdTeam;
    const awayId = m.Away.IdTeam;
    
    stats[homeId].goalsFor += m.HomeTeamScore;
    stats[homeId].goalsAgainst += m.AwayTeamScore;
    stats[awayId].goalsFor += m.AwayTeamScore;
    stats[awayId].goalsAgainst += m.HomeTeamScore;

    if (m.HomeTeamScore > m.AwayTeamScore) {
      stats[homeId].points += 3;
    } else if (m.HomeTeamScore < m.AwayTeamScore) {
      stats[awayId].points += 3;
    } else {
      stats[homeId].points += 1;
      stats[awayId].points += 1;
    }
  });

  teamIds.forEach(id => {
    stats[id].goalDifference = stats[id].goalsFor - stats[id].goalsAgainst;
  });

  return stats;
}
