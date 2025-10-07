// Type definitions for API services

interface ApiResponse<T = any> {
  data?: T;
  error?: string | null;
  loading?: boolean;
}

declare module '../services/api.js' {
  interface OneVOneAPI {
    start: (player2Username: string) => Promise<ApiResponse>;
    submitResult: (matchId: number, player1Score: number, player2Score: number) => Promise<ApiResponse>;
  }

  interface AIAPI {
    submitResult: (playerScore: number, aiScore: number) => Promise<ApiResponse>;
  }

  interface UserService {
    register: (username: string, password: string, email: string) => Promise<ApiResponse>;
    setAlias: (alias: string) => Promise<ApiResponse>;
    login: (username: string, password: string) => Promise<ApiResponse>;
    updateProfile: (profileData: any) => Promise<ApiResponse>;
    getMyProfile: () => Promise<ApiResponse>;
    getOthersProfile: (userId: string) => Promise<ApiResponse>;
    searchForFriends: () => Promise<ApiResponse>;
    addFriends: (friendId: string) => Promise<ApiResponse>;
    sendRequestResponse: (requestId: string, action: string) => Promise<ApiResponse>;
    listRequests: () => Promise<ApiResponse>;
    listSentRequests: () => Promise<ApiResponse>;
    uploadAvatar: (file: File) => Promise<ApiResponse>;
  }

  interface TournamentService {
    create: (name: string, creator_alias: string, min_players: number, max_players: number) => Promise<ApiResponse>;
    getAll: () => Promise<ApiResponse>;
    getById: (tournamentId: string) => Promise<ApiResponse>;
    join: (tournamentId: string, tournament_alias: string) => Promise<ApiResponse>;
    joinGuest: (tournamentId: string, tournament_alias: string) => Promise<ApiResponse>;
    start: (tournamentId: string) => Promise<ApiResponse>;
    leave: (tournamentId: string, playerId: string) => Promise<ApiResponse>;
    deleteAll: () => Promise<ApiResponse>;
    submitMatchResult: (tournamentId: string, matchId: string, player1Score: number, player2Score: number) => Promise<ApiResponse>;
  }

  interface ApiService {
    users: UserService;
    tournaments: TournamentService;
  }

  export function fetchApi(endpoint: string, options?: RequestInit): Promise<any>;
  export const apiService: ApiService;
  export const onevone: OneVOneAPI;
  export const ai: AIAPI;
}
