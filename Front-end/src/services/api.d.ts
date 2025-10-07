export interface ApiService {
  tournaments: {
    start: (tournamentId: number) => Promise<{ data: any; error: any }>;
    finish: (matchId: number, result: any) => Promise<{ data: any; error: any }>;
    submitMatchResult: (tournamentId: number, matchId: number, player1Score: number, player2Score: number) => Promise<{ data: any; error: any }>;
    getMatchHistory: (tournamentId: any) => Promise<{ data: any; error: any }>;
    create: (name: string, min_players: number, max_players: number, creator_alias: string) => Promise<{ data: any; error: any }>;
    getAll: () => Promise<{ data: any; error: any }>;
    getById: (tournamentId: number) => Promise<{ data: any; error: any }>;
    join: (tournamentId: number, tournament_alias: string) => Promise<{ data: any; error: any }>;
    leave: (tournamentId: number, playerId: number) => Promise<{ data: any; error: any }>;
  };
  users: {
    register: (username: string, password: string, email: string) => Promise<{ data: any; error: any }>;
    login: (username: string, password: string) => Promise<{ data: any; error: any }>;
    logout: () => Promise<{ data: any; error: any }>;
    updateProfile: (profileData: any) => Promise<{ data: any; error: any }>;
    getMyProfile: () => Promise<{ data: any; error: any }>;
    getOthersProfile: (userId: number) => Promise<{ data: any; error: any }>;
    deleteMyAccount: () => Promise<{ data: any; error: any }>;
    searchForFriends: () => Promise<{ data: any; error: any }>;
    addFriends: (friendId: number) => Promise<{ data: any; error: any }>;
    removeFriend: (friendId: number) => Promise<{ data: any; error: any }>;
    listRequests: () => Promise<{ data: any; error: any }>;
    listSentRequests: () => Promise<{ data: any; error: any }>;
    sendRequestResponse: (requestId: number, response: string) => Promise<{ data: any; error: any }>;
    uploadAvatar: (file: File) => Promise<{ data: any; error: any }>;
  };
  ai: {
    submitResult: (player1Score: number, player2Score: number) => Promise<{ data: any; error: any; }>;
    start: (difficulty: string) => Promise<{ data: any; error: any }>;
    finish: (matchId: number, result: any) => Promise<{ data: any; error: any }>;
  };
}

export interface OneVOneService {
  start: (player2Username: string) => Promise<{ data: any; error: any }>;
  finish: (matchId: number, result: any) => Promise<{ data: any; error: any }>;
  submitResult: (matchId: number, player1Score: number, player2Score: number) => Promise<{ data: any; error: any }>;
}

export const apiService: ApiService;
export const onevone: OneVOneService;
export const ai: any;
