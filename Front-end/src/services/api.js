// hanieh added: AI match endpoints
const ai = {
  submitResult: async (playerScore, aiScore) => {
    return fetchApi('/ai/finish', {
      method: 'POST',
      body: JSON.stringify({ playerScore, aiScore })
    });
  }
};

// hanieh added: Standalone 1v1 match endpoints
const onevone = {
  start: async (player2Username) => {
    return fetchApi('/onevone/start', {
      method: 'POST',
      body: JSON.stringify({ player2Username })
    });
  },
  submitResult: async (matchId, player1Score, player2Score) => {
    return fetchApi('/onevone/finish', {
      method: 'POST',
      body: JSON.stringify({ matchId, player1Score, player2Score })
    });
  }
};



// Base API URL - use relative URLs to go through nginx proxy
const API_BASE_URL = ''; 

// Generic fetch wrapper
async function fetchApi(endpoint, options){
  try {
    const url = `${API_BASE_URL}${endpoint}`;
    
    // Only set Content-Type if body is present and method is not DELETE
    const headers = { ...options.headers };
    if (options.method !== "DELETE" && options.body) {
      headers["Content-Type"] = "application/json";
    }

    const token = sessionStorage.getItem("token");
    if(token){
      headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    return {
      data,
      error: null,
      loading: false
    };
  } catch (error) {
    console.error("API request failed:", error);
    return {
      data: null,
      error: error instanceof Error ? error.message : "Unknown error occurred",
      loading: false
    };
  }
}

// API services
const apiService = {
  // User endpoints
  users: {
    //User registration 
    register: async (username, password, email)=> {
      return fetchApi("/api/register", {
        method: "POST",
        body: JSON.stringify({
          username,
          password,
          email })
      });
    },

    //setting user alias 
    setAlias: async (alias) => {
      return fetchApi("/set-alias", {
        method: "POST",
        body: JSON.stringify({ alias })
      });
    },

    // Login
    login: async (username, password) => {
      return fetchApi("/api/login", {
        method: "POST",
        body: JSON.stringify({
          username,
          password })
      });
    },

    // Logout
    logout: async () => {
      return fetchApi("/logout", {
        method: "POST"
      });
    },

    // Update user profile (send only provided fields)
    updateProfile: async (profileData) => {
      // profileData: { username?, email?, alias?, password?, avatar? }
      return fetchApi("/me", {
        method: "PATCH",
        body: JSON.stringify(profileData)
      });
    },

    // Get user own profile (returns avatar URL if present)
    getMyProfile: async () => {
      const result = await fetchApi("/me", {
        method: "GET"
      });
      // result.data.avatar may contain the avatar filename or URL
      return result;
    },

    // Get another user's public profile (returns avatar URL if present)
    getOthersProfile: async (userId) => {
      const result = await fetchApi(`/users/${userId}`, {
        method: "GET"
      });
      // result.data.avatar may contain the avatar filename or URL
      return result;
    },


    searchForFriends: async () => {
      return fetchApi("/search-friends", {
        method: "GET"
      });
    },

    addFriends: async (friendId) => {
      return fetchApi("/add-friends", {
        method: "POST",
        body: JSON.stringify({ friendId })
      });
    },

    removeFriend: async (friendId) => {
      return fetchApi(`/friends/${friendId}`, {
        method: "DELETE"
      });
    },

    currentStatus: async (userId) => {
      try {
        const result = await fetchApi(`/friends-status/${userId}`, {
          method: "GET"
        });
        return result;
      } catch (error) {
        console.error('[❌ API SERVICE] currentStatus error:', error);
        throw error;
      }
    },


    sendRequestResponse: async (requestId, action) => {
      return fetchApi(`/friend/requests/${requestId}/respond`, {
        method: "POST",
        body: JSON.stringify({ action })
      });
    },


    listRequests: async () => {
      return fetchApi("/friend/requests", {
        method: "GET"
      })
    },

      // hanieh changed: Add sent requests API for sender
      listSentRequests: async () => {
        return fetchApi("/friend/requests/sent", {
          method: "GET"
        });
      },
    
    // Upload avatar (expects a File object, returns uploaded filename)
    uploadAvatar: async (file) => {
      const token = sessionStorage.getItem("token");
      const formData = new FormData();
      formData.append("avatar", file);
      const response = await fetch(`${API_BASE_URL}/uploads`, {
        method: "POST",
        // Do NOT set Content-Type header; browser will set it for FormData
        headers: token ? { "Authorization": `Bearer ${token}` } : {},
        body: formData
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `API error: ${response.status} ${response.statusText}`);
      }
      // Response: { message, file } where file is the avatar filename
      return response.json();
    },

    // Remove avatar (reset to default)
    removeAvatar: async () => {
      return fetchApi("/me/avatar", {
        method: "DELETE"
      });
    }
  },

  // Tournament related endpoints
  tournaments: {
    //Create tournament (local, with 4 player names)
    create: async (name, min_players, max_players, creator_alias) => {
      return fetchApi("/tournaments", {
        method: "POST",
        body: JSON.stringify({ 
          name,
          min_players,
          max_players,
          creator_alias
        })
      });
    },


    // Join tournament with a single alias
    join: async (tournamentId, tournamentAlias) => {
      return fetchApi(`/tournament/join`, {
        method: "POST",
        body: JSON.stringify({ 
          tournamentId,
          tournamentAlias
        })
      });
    },

    //start a tournament
    start: async (tournamentId) => {
      return fetchApi(`/tournaments/${tournamentId}/start`, {
        method: "POST",
      })
    },

    // Get tournament by ID with matches
    getById: async (tournamentId) => {
      return fetchApi(`/tournaments/${tournamentId}`, {
        method: "GET",
      })
    },


    // Update user profile (send only provided fields)
    updateProfile: async (profileData) => {
        return fetchApi("/me", {
        method: "PATCH",
        body: JSON.stringify(profileData)
      });
    },

    // Get match history for tournaments (uses general user match history)
    getMatchHistory: async (tournamentId) => {
      // For now, use the user's general match history from /me endpoint
      // which already includes tournament matches
      const userResult = await fetchApi("/me", {
        method: "GET"
      });
      
      if (userResult.data && userResult.data.matchHistory) {
        // Filter for tournament matches only if tournamentId is provided
        const matches = tournamentId 
          ? userResult.data.matchHistory.filter(match => match.gameType === 'tournament')
          : userResult.data.matchHistory;
        
        return {
          data: { matches },
          error: null,
          loading: false
        };
      }
      
      return {
        data: { matches: [] },
        error: null,
        loading: false
      };
    },

    // Finish/update tournament match results
    finish: async (tournamentId, matchData) => {
      const { matchId, userScore, opponentScore } = matchData;
      return fetchApi(`/tournaments/${tournamentId}/finish`, {
        method: "POST",
        body: JSON.stringify({ matchId, userScore, opponentScore })
      });
    }
  }
};


export { fetchApi, apiService, onevone, ai }; // cleaned up exports
