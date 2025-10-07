import { apiService } from "../services/api.js";

export async function renderMatchHistory(tournamentId: any, containerId: string = "match-history") {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = "<h3>Loading match history...</h3>";
  try {
    const { data, error } = await apiService.tournaments.getMatchHistory(tournamentId);
    if (error) {
      container.innerHTML = `<div class='error'>Error loading match history: ${error}</div>`;
      return;
    }
    const matches = data.matches || [];
    if (matches.length === 0) {
      container.innerHTML = "<div>No matches played yet.</div>";
      return;
    }
    container.innerHTML = `
      <h3>Match History</h3>
      <table class="match-history-table">
        <thead>
          <tr>
            <th>Match ID</th>
            <th>Player 1</th>
            <th>Player 2</th>
            <th>Score 1</th>
            <th>Score 2</th>
            <th>Winner</th>
            <th>Round</th>
            <th>Played At</th>
          </tr>
        </thead>
        <tbody>
          ${matches.map((match: any) => `
            <tr>
              <td>${match.id}</td>
              <td>${match.user_id}</td>
              <td>${match.opponent_id}</td>
              <td>${match.user_score}</td>
              <td>${match.opponent_score}</td>
              <td>${match.winner_id || '-'}</td>
              <td>${match.round}</td>
              <td>${match.played_at ? new Date(match.played_at).toLocaleString() : '-'}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
  } catch (err: unknown) {
    const error = err as Error;
    container.innerHTML = `<div class='error'>Error loading match history: ${error.message}</div>`;
  }
}
