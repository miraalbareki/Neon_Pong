// Translation system for Neon Pong
export interface Translations {
  // Navigation
  nav: {
    home: string;
    games: string;
    logout: string;
    profile: string;
    account: string;
  };

  // Language preferences
  language: {
    confirmTitle: string;
    confirmMessage: string;
    yes: string;
    no: string;
    setSuccess: string;
  };

  // Font size controls
  fontControls: {
    label: string;
    decrease: string;
    increase: string;
  };

  // Home page
  home: {
    title: string;
    tagline: string;
    description: string;
    registerNow: string;
    meetTheTeam: string;
  };

  // Games page (tournaments and 1v1)
  games: {
    title: string;
    subtitle: string;
    back: string;
    oneVsOne: {
      title: string;
      subtitle: string;
      description: string;
      features: {
        instant: string;
        ranked: string;
        skill: string;
      };
      playNow: string;
      findMatch: string;
      usernameModal: {
        title: string;
        placeholder: string;
        startMatch: string;
      };
    };
    ai: {
      title: string;
      subtitle: string;
      description: string;
      features: {
        adaptive: string;
        practice: string;
        skills: string;
      };
      playNow: string;
      difficultyModal: {
        title: string;
        subtitle: string;
        easy: {
          name: string;
          description: string;
          details: string;
        };
        medium: {
          name: string;
          description: string;
          details: string;
        };
        hard: {
          name: string;
          description: string;
          details: string;
        };
        cancel: string;
      };
    };
    tournaments: {
      title: string;
      subtitle: string;
      description: string;
      features: {
        strategic: string;
        prestige: string;
        competition: string;
      };
      joinTournament: string;
      createTournament: string;
      modal: {
        title: string;
        bracketSetup: string;
        generateBracket: string;
        startTournament: string;
        selectPlayer: string;
        selectAlias: string;
        creating: string;
        matchmaking: string;
        bracketTitle: string;
        bracketSubtitle: string;
        champion: string;
        duplicateNames: string;
        errorTryAgain: string;
        match1Semifinal: string;
        match2Semifinal: string;
        championshipFinal: string;
        startMatch: string;
        startFinal: string;
        vs: string;
        winnerOfMatch1: string;
        winnerOfMatch2: string;
      };
    };
    stats: {
      activePlayers: string;
      ongoingMatches: string;
      tournaments: string;
    };
    loginRequired: {
      title: string;
      description: string;
      button: string;
    };
  };

  // Profile page
  profile: {
    title: string;
    tabs: {
      dashboard: string;
      settings: string;
      statistics: string;
      friends: string;
      history: string;
    };
    dashboard: {
      welcome: string;
      overview: string;
      rank: string;
      of: string;
      players: string;
      winRate: string;
      streak: string;
      best: string;
      playTime: string;
      avg: string;
      analytics: string;
      weekly: string;
      wins: string;
      losses: string;
      rating: string;
      recent: string;
      viewAll: string;
      advanced: string;
      avgScore: string;
      perfectGames: string;
      comebacks: string;
      achievements: string;
      winStreakMaster: string;
      winStreakDesc: string;
      centuryClub: string;
      centuryDesc: string;
      perfectPlayer: string;
      perfectDesc: string;
      socialButterfly: string;
      socialDesc: string;
    };
    settings: {
      changeAvatar: string;
      username: string;
      displayName: string;
      skillLevel: string;
      beginner: string;
      intermediate: string;
      expert: string;
      bio: string;
      bioPlaceholder: string;
      advancedSettings: string;
      newPassword: string;
      passwordPlaceholder: string;
      confirmPassword: string;
      confirmPasswordPlaceholder: string;
      gameHistory: string;
      clearHistory: string;
      accountDeletion: string;
      deleteAccount: string;
      deleteWarning: string;
      warningTitle: string;
      warningDescription: string;
      saveChanges: string;
    };
    statistics: {
      title: string;
      gamesPlayed: string;
      wins: string;
      losses: string;
      winRate: string;
    };
    friends: {
      title: string;
      addFriend: string;
      online: string;
      lastSeen: string;
      challenge: string;
    };
    history: {
      title: string;
      victory: string;
      defeat: string;
      match1v1: string;
      tournament: string;
      min: string;
    };
  };

  // Auth pages
  auth: {
    login: {
      title: string;
      username: string;
      password: string;
      button: string;
      backToHome: string;
      noAccount: string;
      createAccount: string;
    };
    register: {
      title: string;
      email: string;
      username: string;
      password: string;
      confirmPassword: string;
      button: string;
      backToHome: string;
      hasAccount: string;
      signIn: string;
    };
  };

  // Common
  common: {
    loading: string;
    neonPong: string;
  };

  // Language names
  languages: {
    english: string;
    french: string;
    spanish: string;
  };
}

export const translations: Record<string, Translations> = {
  en: {
    nav: {
      home: "HOME",
      games: "GAMES",
      logout: "LOGOUT",
      profile: "PROFILE",
      account: "ACCOUNT"
    },
    language: {
      confirmTitle: "Language Preference",
      confirmMessage: "Would you like to set English as your preferred language?",
      yes: "Yes, set as preferred",
      no: "Cancel",
      setSuccess: "Language preference saved!"
    },
    fontControls: {
      label: "Font size:",
      decrease: "DECREASE FONT SIZE",
      increase: "INCREASE FONT SIZE"
    },
    home: {
      title: "NEON PONG",
      tagline: "THE ULTIMATE RETRO-FUTURISTIC ARCADE EXPERIENCE.",
      description: "Challenge your friends in a fast-paced game of skill and reflexes.",
      registerNow: "REGISTER NOW",
      meetTheTeam: "MEET THE TEAM"
    },
  games: {
    title: 'Games',
    subtitle: 'Choose your battle',
    back: 'Back',
    oneVsOne: {
      title: '1v1 Battle',
      subtitle: 'Face your opponent',
      description: 'Challenge a friend or random player to an intense one-on-one ping pong match. Quick games, instant action!',
      features: {
        instant: 'Instant matchmaking',
        ranked: 'Ranked competitive play',
        skill: 'Skill-based matching'
      },
      playNow: 'PLAY NOW',
      findMatch: 'FIND MATCH',
      usernameModal: {
        title: 'Enter opponent username',
        placeholder: 'Opponent username',
        startMatch: 'Start Match'
      }
    },
    ai: {
      title: 'AI Challenge',
      subtitle: 'Face the machine',
      description: 'Test your skills against our advanced AI opponents with different difficulty levels.',
      features: {
        adaptive: 'Adaptive difficulty',
        practice: 'Perfect for practice',
        skills: 'Improve your skills'
      },
      playNow: 'PLAY AI',
      difficultyModal: {
        title: '🤖 Choose AI Difficulty',
        subtitle: 'Select the challenge level for your AI opponent',
        easy: {
          name: 'Easy',
          description: 'Perfect for beginners',
          details: 'Slower reactions, more mistakes'
        },
        medium: {
          name: 'Medium',
          description: 'Balanced challenge',
          details: 'Moderate skill level'
        },
        hard: {
          name: 'Hard',
          description: 'Expert level',
          details: 'Fast reactions, strategic play'
        },
        cancel: 'Cancel'
      }
    },      tournaments: {
        title: "TOURNAMENTS",
        subtitle: "Elite competition awaits",
        description: "Join exclusive tournaments and compete against the best players for ultimate glory.",
        features: {
          strategic: "Strategic bracket system",
          prestige: "Prestige rewards",
          competition: "Elite competition"
        },
        joinTournament: "JOIN TOURNAMENT",
        createTournament: "CREATE TOURNAMENT",
        modal: {
          title: "TOURNAMENT",
          bracketSetup: "4-PLAYER BRACKET SETUP",
          generateBracket: "⚡ GENERATE BRACKET ⚡",
          startTournament: "🏆 START TOURNAMENT 🏆",
          selectPlayer: "WHICH PLAYER ARE YOU?",
          selectAlias: "SELECT YOUR TOURNAMENT ALIAS",
          creating: "🔥 CREATING TOURNAMENT... 🔥",
          matchmaking: "🎰 TOURNAMENT MATCHMAKING 🎰",
          bracketTitle: "🏆 TOURNAMENT BRACKET",
          bracketSubtitle: "✨ 4-Player Single Elimination Championship ✨",
          champion: "🏆 TOURNAMENT CHAMPION! 🏆",
          duplicateNames: "❌ DUPLICATE NAMES FOUND",
          errorTryAgain: "❌ ERROR - TRY AGAIN",
          match1Semifinal: "🥊 Match 1 - Semifinal",
          match2Semifinal: "🥊 Match 2 - Semifinal",
          championshipFinal: "🏆 CHAMPIONSHIP FINAL 🏆",
          startMatch: "Start Match",
          startFinal: "Start Final",
          vs: "VS",
          winnerOfMatch1: "Winner of Match 1",
          winnerOfMatch2: "Winner of Match 2"
        }
      },
      stats: {
        activePlayers: "ACTIVE PLAYERS",
        ongoingMatches: "ONGOING MATCHES", 
        tournaments: "LIVE TOURNAMENTS"
      },
      loginRequired: {
        title: "Access Required",
        description: "Login to unlock all game modes and compete with players worldwide",
        button: "LOGIN TO PLAY"
      }
    },
    profile: {
      title: "USER PROFILE",
      tabs: {
        dashboard: "DASHBOARD",
        settings: "PROFILE SETTINGS",
        statistics: "STATISTICS",
        friends: "FRIENDS",
        history: "MATCH HISTORY"
      },
      dashboard: {
        welcome: "WELCOME BACK, PRO PLAYER!",
        overview: "Here's your gaming overview and performance insights",
        rank: "Current Rank",
        of: "of",
        players: "players",
        winRate: "Win Rate",
        streak: "Current Streak",
        best: "Best:",
        playTime: "Total Play Time",
        avg: "Avg:",
        analytics: "PERFORMANCE ANALYTICS",
        weekly: "Weekly Performance",
        wins: "Wins",
        losses: "Losses",
        rating: "Skill Rating Progression",
        recent: "Recent Matches",
        viewAll: "VIEW ALL MATCHES",
        advanced: "Advanced Statistics",
        avgScore: "AVERAGE SCORE",
        perfectGames: "PERFECT GAMES",
        comebacks: "COMEBACKS",
        achievements: "ACHIEVEMENTS & GOALS",
        winStreakMaster: "Win Streak Master",
        winStreakDesc: "Win 10 games in a row",
        centuryClub: "Century Club",
        centuryDesc: "Play 100 total games",
        perfectPlayer: "Perfect Player",
  perfectDesc: "Win a game 5-0",
        socialButterfly: "Social Butterfly",
        socialDesc: "Add 10 friends"
      },
      settings: {
        changeAvatar: "CHANGE AVATAR",
        username: "USERNAME",
        displayName: "DISPLAY NAME",
        skillLevel: "SKILL LEVEL",
        beginner: "BEGINNER",
        intermediate: "INTERMEDIATE",
        expert: "EXPERT",
        bio: "BIO (OPTIONAL)",
        bioPlaceholder: "Tell others about yourself...",
        advancedSettings: "ADVANCED SETTINGS",
        newPassword: "New Password",
        passwordPlaceholder: "Leave blank to keep current",
        confirmPassword: "Confirm Password",
        confirmPasswordPlaceholder: "Confirm your new password",
        gameHistory: "GAME HISTORY",
        clearHistory: "Clear History",
        accountDeletion: "ACCOUNT DELETION",
        deleteAccount: "Delete Account",
        deleteWarning: "⚠️ This action cannot be undone",
        warningTitle: "Warning: Permanent Action",
        warningDescription: "Once you delete your profile, there is no going back. This action cannot be undone and will permanently remove:",
        saveChanges: "SAVE CHANGES"
      },
      statistics: {
        title: "PLAYER STATISTICS",
        gamesPlayed: "GAMES PLAYED",
        wins: "WINS",
        losses: "LOSSES",
        winRate: "WIN RATE"
      },
      friends: {
        title: "FRIENDS LIST",
        addFriend: "ADD FRIEND",
        online: "Online",
        lastSeen: "Last seen",
        challenge: "CHALLENGE"
      },
      history: {
        title: "MATCH HISTORY",
        victory: "Victory",
        defeat: "Defeat",
        match1v1: "1v1 Match",
        tournament: "Tournament",
        min: "min"
      }
    },
    auth: {
      login: {
        title: "Login to Neon Pong",
        username: "USERNAME",
        password: "PASSWORD",
        button: "LOGIN",
        backToHome: "BACK TO HOME",
        noAccount: "Don't have an account?",
        createAccount: "Create an ACCOUNT"
      },
      register: {
        title: "Register for Neon Pong",
        email: "EMAIL",
        username: "USERNAME",
        password: "PASSWORD",
        confirmPassword: "CONFIRM PASSWORD",
        button: "REGISTER",
        backToHome: "BACK TO HOME",
        hasAccount: "Already have an account?",
        signIn: "Sign in to existing ACCOUNT"
      }
    },
    common: {
      loading: "Loading...",
      neonPong: "Neon Pong"
    },
    languages: {
      english: "English",
      french: "Français",
      spanish: "Español"
    }
  },

  fr: {
    nav: {
      home: "ACCUEIL",
      games: "JEUX",
      logout: "DÉCONNEXION",
      profile: "PROFIL",
      account: "COMPTE"
    },
    language: {
      confirmTitle: "Préférence de langue",
      confirmMessage: "Voulez-vous définir le français comme votre langue préférée ?",
      yes: "Oui, définir comme préférée",
      no: "Annuler",
      setSuccess: "Préférence de langue sauvegardée !"
    },
    fontControls: {
      label: "Taille de police:",
      decrease: "DIMINUER LA TAILLE",
      increase: "AUGMENTER LA TAILLE"
    },
    home: {
      title: "NEON PONG",
      tagline: "L'EXPÉRIENCE ARCADE RÉTRO-FUTURISTE ULTIME.",
      description: "Défiez vos amis dans un jeu rapide d'adresse et de réflexes.",
      registerNow: "S'INSCRIRE MAINTENANT",
      meetTheTeam: "RENCONTRER L'ÉQUIPE"
    },
    games: {
      title: "MODES DE JEU",
      subtitle: "Choisissez votre chemin vers la gloire",
      back: "Retour",
      oneVsOne: {
        title: "COMBATS 1V1",
        subtitle: "Matchs rapides, action instantanée",
        description: "Lancez-vous dans des combats un contre un à rythme effréné. Perfectionnez vos compétences et grimpez l'échelle classée.",
        features: {
          instant: "Matchmaking instantané",
          ranked: "Progression classée",
          skill: "Correspondance par compétence"
        },
        playNow: "JOUER MAINTENANT",
        findMatch: "TROUVER UN MATCH",
        usernameModal: {
          title: 'Entrez le nom d\'utilisateur de l\'adversaire',
          placeholder: 'Nom d\'utilisateur de l\'adversaire',
          startMatch: 'Commencer le Match'
        }
      },
      ai: {
        title: "Défi IA",
        subtitle: "Affrontez la machine",
        description: "Testez vos compétences contre nos adversaires IA avancés avec différents niveaux de difficulté.",
        features: {
          adaptive: "Difficulté adaptative",
          practice: "Parfait pour s'entraîner",
          skills: "Améliorez vos compétences"
        },
        playNow: "JOUER CONTRE IA",
        difficultyModal: {
          title: '🤖 Choisir la Difficulté IA',
          subtitle: 'Sélectionnez le niveau de défi pour votre adversaire IA',
          easy: {
            name: 'Facile',
            description: 'Parfait pour les débutants',
            details: 'Réactions plus lentes, plus d\'erreurs'
          },
          medium: {
            name: 'Moyen',
            description: 'Défi équilibré',
            details: 'Niveau de compétence modéré'
          },
          hard: {
            name: 'Difficile',
            description: 'Niveau expert',
            details: 'Réactions rapides, jeu stratégique'
          },
          cancel: 'Annuler'
        }
      },
      tournaments: {
        title: "TOURNOIS",
        subtitle: "La compétition d'élite vous attend",
        description: "Rejoignez des tournois exclusifs et affrontez les meilleurs joueurs pour la gloire ultime.",
        features: {
          strategic: "Système de bracket stratégique",
          prestige: "Récompenses de prestige",
          competition: "Compétition d'élite"
        },
        joinTournament: "REJOINDRE TOURNOI",
        createTournament: "CRÉER TOURNOI",
        modal: {
          title: "TOURNOI",
          bracketSetup: "CONFIGURATION BRACKET 4 JOUEURS",
          generateBracket: "⚡ GÉNÉRER BRACKET ⚡",
          startTournament: "🏆 COMMENCER TOURNOI 🏆",
          selectPlayer: "QUEL JOUEUR ÊTES-VOUS?",
          selectAlias: "SÉLECTIONNEZ VOTRE ALIAS DE TOURNOI",
          creating: "🔥 CRÉATION DU TOURNOI... 🔥",
          matchmaking: "🎰 MATCHMAKING DE TOURNOI 🎰",
          bracketTitle: "🏆 BRACKET DE TOURNOI",
          bracketSubtitle: "✨ Championnat à Élimination Simple 4 Joueurs ✨",
          champion: "🏆 CHAMPION DU TOURNOI! 🏆",
          duplicateNames: "❌ NOMS DUPLIQUÉS TROUVÉS",
          errorTryAgain: "❌ ERREUR - RÉESSAYEZ",
          match1Semifinal: "🥊 Match 1 - Demi-finale",
          match2Semifinal: "🥊 Match 2 - Demi-finale",
          championshipFinal: "🏆 FINALE DU CHAMPIONNAT 🏆",
          startMatch: "Commencer Match",
          startFinal: "Commencer Finale",
          vs: "CONTRE",
          winnerOfMatch1: "Gagnant du Match 1",
          winnerOfMatch2: "Gagnant du Match 2"
        }
      },
      stats: {
        activePlayers: "JOUEURS ACTIFS",
        ongoingMatches: "MATCHS EN COURS",
        tournaments: "TOURNOIS EN DIRECT"
      },
      loginRequired: {
        title: "Accès Requis",
        description: "Connectez-vous pour débloquer tous les modes de jeu et affronter des joueurs du monde entier",
        button: "SE CONNECTER POUR JOUER"
      }
    },
    profile: {
      title: "PROFIL UTILISATEUR",
      tabs: {
        dashboard: "TABLEAU DE BORD",
        settings: "PARAMÈTRES DU PROFIL",
        statistics: "STATISTIQUES",
        friends: "AMIS",
        history: "HISTORIQUE DES MATCHS"
      },
      dashboard: {
        welcome: "BON RETOUR, JOUEUR PRO !",
        overview: "Voici votre aperçu de jeu et vos informations de performance",
        rank: "Rang Actuel",
        of: "sur",
        players: "joueurs",
        winRate: "Taux de Victoire",
        streak: "Série Actuelle",
        best: "Meilleur:",
        playTime: "Temps de Jeu Total",
        avg: "Moy:",
        analytics: "ANALYSES DE PERFORMANCE",
        weekly: "Performance Hebdomadaire",
        wins: "Victoires",
        losses: "Défaites",
        rating: "Progression du Classement",
        recent: "Matchs Récents",
        viewAll: "VOIR TOUS LES MATCHS",
        advanced: "Statistiques Avancées",
        avgScore: "SCORE MOYEN",
        perfectGames: "JEUX PARFAITS",
        comebacks: "RETOURS",
        achievements: "SUCCÈS ET OBJECTIFS",
        winStreakMaster: "Maître des Séries",
        winStreakDesc: "Gagner 10 jeux d'affilée",
        centuryClub: "Club du Centenaire",
        centuryDesc: "Jouer 100 jeux au total",
        perfectPlayer: "Joueur Parfait",
  perfectDesc: "Gagner un jeu 5-0",
        socialButterfly: "Papillon Social",
        socialDesc: "Ajouter 10 amis"
      },
      settings: {
        changeAvatar: "CHANGER L'AVATAR",
        username: "NOM D'UTILISATEUR",
        displayName: "NOM D'AFFICHAGE",
        skillLevel: "NIVEAU DE COMPÉTENCE",
        beginner: "DÉBUTANT",
        intermediate: "INTERMÉDIAIRE",
        expert: "EXPERT",
        bio: "BIO (OPTIONNEL)",
        bioPlaceholder: "Parlez de vous aux autres...",
        advancedSettings: "PARAMÈTRES AVANCÉS",
        newPassword: "Nouveau mot de passe",
        passwordPlaceholder: "Laisser vide pour conserver l'actuel",
        confirmPassword: "Confirmer le mot de passe",
        confirmPasswordPlaceholder: "Confirmez votre nouveau mot de passe",
        gameHistory: "HISTORIQUE DU JEU",
        clearHistory: "Effacer l'historique",
        accountDeletion: "SUPPRESSION DU COMPTE",
        deleteAccount: "Supprimer le compte",
        deleteWarning: "⚠️ Cette action ne peut pas être annulée",
        warningTitle: "Attention : Action permanente",
        warningDescription: "Une fois que vous supprimez votre profil, il n'y a pas de retour en arrière. Cette action ne peut pas être annulée et supprimera définitivement :",
        saveChanges: "SAUVEGARDER LES MODIFICATIONS"
      },
      statistics: {
        title: "STATISTIQUES DU JOUEUR",
        gamesPlayed: "JEUX JOUÉS",
        wins: "VICTOIRES",
        losses: "DÉFAITES",
        winRate: "TAUX DE VICTOIRE"
      },
      friends: {
        title: "LISTE D'AMIS",
        addFriend: "AJOUTER UN AMI",
        online: "En ligne",
        lastSeen: "Vu pour la dernière fois",
        challenge: "DÉFIER"
      },
      history: {
        title: "HISTORIQUE DES MATCHS",
        victory: "Victoire",
        defeat: "Défaite",
        match1v1: "Match 1v1",
        tournament: "Tournoi",
        min: "min"
      }
    },
    auth: {
      login: {
        title: "Connexion à Neon Pong",
        username: "NOM D'UTILISATEUR",
        password: "MOT DE PASSE",
        button: "CONNEXION",
        backToHome: "RETOUR À L'ACCUEIL",
        noAccount: "Vous n'avez pas de compte ?",
        createAccount: "Créer un COMPTE"
      },
      register: {
        title: "S'inscrire à Neon Pong",
        email: "EMAIL",
        username: "NOM D'UTILISATEUR",
        password: "MOT DE PASSE",
        confirmPassword: "CONFIRMER LE MOT DE PASSE",
        button: "S'INSCRIRE",
        backToHome: "RETOUR À L'ACCUEIL",
        hasAccount: "Vous avez déjà un compte ?",
        signIn: "Se connecter au COMPTE existant"
      }
    },
    common: {
      loading: "Chargement...",
      neonPong: "Neon Pong"
    },
    languages: {
      english: "English",
      french: "Français",
      spanish: "Español"
    }
  },

  es: {
    nav: {
      home: "INICIO",
      games: "JUEGOS",
      logout: "CERRAR SESIÓN",
      profile: "PERFIL",
      account: "CUENTA"
    },
    language: {
      confirmTitle: "Preferencia de idioma",
      confirmMessage: "¿Te gustaría establecer el español como tu idioma preferido?",
      yes: "Sí, establecer como preferido",
      no: "Cancelar",
      setSuccess: "¡Preferencia de idioma guardada!"
    },
    fontControls: {
      label: "Tamaño de fuente:",
      decrease: "DISMINUIR TAMAÑO",
      increase: "AUMENTAR TAMAÑO"
    },
    home: {
      title: "NEON PONG",
      tagline: "LA EXPERIENCIA ARCADE RETRO-FUTURISTA DEFINITIVA.",
      description: "Desafía a tus amigos en un juego rápido de habilidad y reflejos.",
      registerNow: "REGISTRARSE AHORA",
      meetTheTeam: "CONOCER AL EQUIPO"
    },
    games: {
      title: "MODOS DE JUEGO",
      subtitle: "Elige tu camino hacia la gloria",
      back: "Volver",
      oneVsOne: {
        title: "BATALLAS 1V1",
        subtitle: "Partidas rápidas, acción instantánea",
        description: "Sumérgete en batallas uno contra uno de ritmo acelerado. Perfecciona tus habilidades y escala la clasificación.",
        features: {
          instant: "Emparejamiento instantáneo",
          ranked: "Progresión clasificada",
          skill: "Emparejamiento por habilidad"
        },
        playNow: "JUGAR AHORA",
        findMatch: "BUSCAR PARTIDA",
        usernameModal: {
          title: 'Ingresa el nombre de usuario del oponente',
          placeholder: 'Nombre de usuario del oponente',
          startMatch: 'Iniciar Partida'
        }
      },
      ai: {
        title: "Desafío IA",
        subtitle: "Enfrenta a la máquina",
        description: "Pon a prueba tus habilidades contra nuestros oponentes IA avanzados con diferentes niveles de dificultad.",
        features: {
          adaptive: "Dificultad adaptativa",
          practice: "Perfecto para practicar",
          skills: "Mejora tus habilidades"
        },
        playNow: "JUGAR CONTRA IA",
        difficultyModal: {
          title: '🤖 Elegir Dificultad IA',
          subtitle: 'Selecciona el nivel de desafío para tu oponente IA',
          easy: {
            name: 'Fácil',
            description: 'Perfecto para principiantes',
            details: 'Reacciones más lentas, más errores'
          },
          medium: {
            name: 'Medio',
            description: 'Desafío equilibrado',
            details: 'Nivel de habilidad moderado'
          },
          hard: {
            name: 'Difícil',
            description: 'Nivel experto',
            details: 'Reacciones rápidas, juego estratégico'
          },
          cancel: 'Cancelar'
        }
      },
      tournaments: {
        title: "TORNEOS",
        subtitle: "La competencia élite te espera",
        description: "Únete a torneos exclusivos y compite contra los mejores jugadores por la gloria definitiva.",
        features: {
          strategic: "Sistema de bracket estratégico",
          prestige: "Recompensas de prestigio",
          competition: "Competencia élite"
        },
        joinTournament: "UNIRSE A TORNEO",
        createTournament: "CREAR TORNEO",
        modal: {
          title: "TORNEO",
          bracketSetup: "CONFIGURACIÓN BRACKET 4 JUGADORES",
          generateBracket: "⚡ GENERAR BRACKET ⚡",
          startTournament: "🏆 INICIAR TORNEO 🏆",
          selectPlayer: "¿QUÉ JUGADOR ERES TÚ?",
          selectAlias: "SELECCIONA TU ALIAS DE TORNEO",
          creating: "🔥 CREANDO TORNEO... 🔥",
          matchmaking: "🎰 EMPAREJAMIENTO DE TORNEO 🎰",
          bracketTitle: "🏆 BRACKET DE TORNEO",
          bracketSubtitle: "✨ Campeonato de Eliminación Simple 4 Jugadores ✨",
          champion: "🏆 ¡CAMPEÓN DEL TORNEO! 🏆",
          duplicateNames: "❌ NOMBRES DUPLICADOS ENCONTRADOS",
          errorTryAgain: "❌ ERROR - INTÉNTALO DE NUEVO",
          match1Semifinal: "🥊 Partido 1 - Semifinal",
          match2Semifinal: "🥊 Partido 2 - Semifinal",
          championshipFinal: "🏆 FINAL DEL CAMPEONATO 🏆",
          startMatch: "Iniciar Partido",
          startFinal: "Iniciar Final",
          vs: "CONTRA",
          winnerOfMatch1: "Ganador del Partido 1",
          winnerOfMatch2: "Ganador del Partido 2"
        }
      },
      stats: {
        activePlayers: "JUGADORES ACTIVOS",
        ongoingMatches: "PARTIDAS EN CURSO",
        tournaments: "TORNEOS EN VIVO"
      },
      loginRequired: {
        title: "Acceso Requerido",
        description: "Inicia sesión para desbloquear todos los modos de juego y competir con jugadores de todo el mundo",
        button: "INICIAR SESIÓN PARA JUGAR"
      }
    },
    profile: {
      title: "PERFIL DE USUARIO",
      tabs: {
        dashboard: "PANEL DE CONTROL",
        settings: "CONFIGURACIÓN DEL PERFIL",
        statistics: "ESTADÍSTICAS",
        friends: "AMIGOS",
        history: "HISTORIAL DE PARTIDAS"
      },
      dashboard: {
        welcome: "¡BIENVENIDO DE VUELTA, JUGADOR PRO!",
        overview: "Aquí está tu resumen de juego e información de rendimiento",
        rank: "Rango Actual",
        of: "de",
        players: "jugadores",
        winRate: "Tasa de Victoria",
        streak: "Racha Actual",
        best: "Mejor:",
        playTime: "Tiempo Total de Juego",
        avg: "Prom:",
        analytics: "ANÁLISIS DE RENDIMIENTO",
        weekly: "Rendimiento Semanal",
        wins: "Victorias",
        losses: "Derrotas",
        rating: "Progresión de Clasificación",
        recent: "Partidas Recientes",
        viewAll: "VER TODAS LAS PARTIDAS",
        advanced: "Estadísticas Avanzadas",
        avgScore: "PUNTUACIÓN PROMEDIO",
        perfectGames: "JUEGOS PERFECTOS",
        comebacks: "REMONTAS",
        achievements: "LOGROS Y OBJETIVOS",
        winStreakMaster: "Maestro de Rachas",
        winStreakDesc: "Ganar 10 juegos seguidos",
        centuryClub: "Club del Centenario",
        centuryDesc: "Jugar 100 juegos en total",
        perfectPlayer: "Jugador Perfecto",
  perfectDesc: "Ganar un juego 5-0",
        socialButterfly: "Mariposa Social",
        socialDesc: "Agregar 10 amigos"
      },
      settings: {
        changeAvatar: "CAMBIAR AVATAR",
        username: "NOMBRE DE USUARIO",
        displayName: "NOMBRE PARA MOSTRAR",
        skillLevel: "NIVEL DE HABILIDAD",
        beginner: "PRINCIPIANTE",
        intermediate: "INTERMEDIO",
        expert: "EXPERTO",
        bio: "BIO (OPCIONAL)",
        bioPlaceholder: "Cuéntales a otros sobre ti...",
        advancedSettings: "CONFIGURACIÓN AVANZADA",
        newPassword: "Nueva contraseña",
        passwordPlaceholder: "Dejar en blanco para mantener la actual",
        confirmPassword: "Confirmar contraseña",
        confirmPasswordPlaceholder: "Confirma tu nueva contraseña",
        gameHistory: "HISTORIAL DEL JUEGO",
        clearHistory: "Borrar historial",
        accountDeletion: "ELIMINACIÓN DE CUENTA",
        deleteAccount: "Eliminar cuenta",
        deleteWarning: "⚠️ Esta acción no se puede deshacer",
        warningTitle: "Advertencia: Acción permanente",
        warningDescription: "Una vez que elimines tu perfil, no hay vuelta atrás. Esta acción no se puede deshacer y eliminará permanentemente:",
        saveChanges: "GUARDAR CAMBIOS"
      },
      statistics: {
        title: "ESTADÍSTICAS DEL JUGADOR",
        gamesPlayed: "JUEGOS JUGADOS",
        wins: "VICTORIAS",
        losses: "DERROTAS",
        winRate: "TASA DE VICTORIA"
      },
      friends: {
        title: "LISTA DE AMIGOS",
        addFriend: "AGREGAR AMIGO",
        online: "En línea",
        lastSeen: "Visto por última vez",
        challenge: "DESAFIAR"
      },
      history: {
        title: "HISTORIAL DE PARTIDAS",
        victory: "Victoria",
        defeat: "Derrota",
        match1v1: "Partida 1v1",
        tournament: "Torneo",
        min: "min"
      }
    },
    auth: {
      login: {
        title: "Iniciar Sesión en Neon Pong",
        username: "NOMBRE DE USUARIO",
        password: "CONTRASEÑA",
        button: "INICIAR SESIÓN",
        backToHome: "VOLVER AL INICIO",
        noAccount: "¿No tienes una cuenta?",
        createAccount: "Crear una CUENTA"
      },
      register: {
        title: "Registrarse en Neon Pong",
        email: "EMAIL",
        username: "NOMBRE DE USUARIO",
        password: "CONTRASEÑA",
        confirmPassword: "CONFIRMAR CONTRASEÑA",
        button: "REGISTRARSE",
        backToHome: "VOLVER AL INICIO",
        hasAccount: "¿Ya tienes una cuenta?",
        signIn: "Iniciar sesión en CUENTA existente"
      }
    },
    common: {
      loading: "Cargando...",
      neonPong: "Neon Pong"
    },
    languages: {
      english: "English",
      french: "Français",
      spanish: "Español"
    }
  }
};

// Language manager class
export class LanguageManager {
  private currentLanguage: string = 'en';
  private listeners: Array<() => void> = [];

  constructor() {
    // Load saved language from localStorage
    const savedLanguage = localStorage.getItem('neonPongLanguage');
    if (savedLanguage && translations[savedLanguage]) {
      this.currentLanguage = savedLanguage;
    }
  }

  getCurrentLanguage(): string {
    return this.currentLanguage;
  }

  setLanguage(language: string): void {
    if (translations[language]) {
      this.currentLanguage = language;
      localStorage.setItem('neonPongLanguage', language);
      this.notifyListeners();
    }
  }

  setLanguageWithConfirmation(language: string): void {
    if (!translations[language]) return;
    
    // Get translations for the target language to show confirmation in that language
    const targetTranslations = translations[language];
    
    // Create a custom confirmation dialog
    const confirmDialog = document.createElement('div');
    confirmDialog.className = 'language-confirm-dialog';
    confirmDialog.innerHTML = `
      <div class="language-confirm-overlay">
        <div class="language-confirm-content">
          <div class="language-confirm-header">
            <h3>${targetTranslations.language.confirmTitle}</h3>
          </div>
          <div class="language-confirm-message">
            <p>${targetTranslations.language.confirmMessage}</p>
          </div>
          <div class="language-confirm-buttons">
            <button class="language-confirm-yes btn-primary">
              ${targetTranslations.language.yes}
            </button>
            <button class="language-confirm-no btn-secondary">
              ${targetTranslations.language.no}
            </button>
          </div>
        </div>
      </div>
    `;

    // Add styles for the dialog
    const style = document.createElement('style');
    style.textContent = `
      .language-confirm-dialog {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 10000;
        font-family: 'Orbitron', monospace;
      }
      
      .language-confirm-overlay {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        backdrop-filter: blur(10px);
        display: flex;
        align-items: center;
        justify-content: center;
        animation: fadeIn 0.3s ease-out;
      }
      
      .language-confirm-content {
        background: linear-gradient(135deg, rgba(0, 230, 255, 0.1), rgba(255, 0, 255, 0.1));
        border: 2px solid #00E6FF;
        border-radius: 15px;
        padding: 30px;
        max-width: 500px;
        width: 90%;
        box-shadow: 0 20px 40px rgba(0, 230, 255, 0.3);
        animation: slideUp 0.3s ease-out;
      }
      
      .language-confirm-header h3 {
        color: #00E6FF;
        margin: 0 0 20px 0;
        font-size: 1.4rem;
        text-align: center;
        text-transform: uppercase;
        letter-spacing: 2px;
      }
      
      .language-confirm-message p {
        color: #fff;
        margin: 0 0 30px 0;
        font-size: 1.1rem;
        text-align: center;
        line-height: 1.6;
      }
      
      .language-confirm-buttons {
        display: flex;
        gap: 15px;
        justify-content: center;
      }
      
      .language-confirm-buttons button {
        padding: 12px 24px;
        border: none;
        border-radius: 8px;
        font-family: 'Orbitron', monospace;
        font-weight: 600;
        font-size: 0.9rem;
        cursor: pointer;
        transition: all 0.3s ease;
        text-transform: uppercase;
        letter-spacing: 1px;
      }
      
      .language-confirm-yes {
        background: linear-gradient(135deg, #00E6FF, #0099CC);
        color: #000;
      }
      
      .language-confirm-yes:hover {
        background: linear-gradient(135deg, #00CCFF, #0088BB);
        transform: translateY(-2px);
        box-shadow: 0 5px 15px rgba(0, 230, 255, 0.4);
      }
      
      .language-confirm-no {
        background: linear-gradient(135deg, #FF0080, #CC0066);
        color: #fff;
      }
      
      .language-confirm-no:hover {
        background: linear-gradient(135deg, #FF0099, #DD0077);
        transform: translateY(-2px);
        box-shadow: 0 5px 15px rgba(255, 0, 128, 0.4);
      }
      
      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      
      @keyframes slideUp {
        from { 
          opacity: 0;
          transform: translateY(30px);
        }
        to { 
          opacity: 1;
          transform: translateY(0);
        }
      }
    `;
    
    document.head.appendChild(style);
    document.body.appendChild(confirmDialog);

    // Handle button clicks
    const yesButton = confirmDialog.querySelector('.language-confirm-yes') as HTMLButtonElement;
    const noButton = confirmDialog.querySelector('.language-confirm-no') as HTMLButtonElement;
    
    const cleanup = () => {
      document.body.removeChild(confirmDialog);
      document.head.removeChild(style);
    };

    yesButton.addEventListener('click', () => {
      this.setLanguage(language);
      cleanup();
      
      // Show success message in the new language
      if (window.showMessage) {
        setTimeout(() => {
          window.showMessage(targetTranslations.language.setSuccess, 'success');
        }, 100);
      }
    });

    noButton.addEventListener('click', cleanup);
    
    // Close on overlay click
    confirmDialog.addEventListener('click', (e) => {
      if (e.target === confirmDialog || e.target === confirmDialog.querySelector('.language-confirm-overlay')) {
        cleanup();
      }
    });
    
    // Close on Escape key
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        cleanup();
        document.removeEventListener('keydown', handleEscape);
      }
    };
    document.addEventListener('keydown', handleEscape);
  }

  getTranslations(): Translations {
    return translations[this.currentLanguage];
  }

  translate(key: string): string {
    const keys = key.split('.');
    let value: any = this.getTranslations();
    
    for (const k of keys) {
      value = value?.[k];
    }
    
    return value || key;
  }

  addListener(callback: () => void): void {
    this.listeners.push(callback);
  }

  removeListener(callback: () => void): void {
    this.listeners = this.listeners.filter(listener => listener !== callback);
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => listener());
  }
}

// Global language manager instance
export const languageManager = new LanguageManager();
