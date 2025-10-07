# 🎮 Neon Pong - The Ultimate Retro-Futuristic Arcade

> A modern take on the classic Pong game with a sleek neon aesthetic, comprehensive user management, and advanced gaming features.

![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)

## 🌟 Overview

**Neon Pong** is a sophisticated Single Page Application (SPA) that reimagines the classic Pong game with modern web technologies. Built with TypeScript and featuring a stunning neon-themed UI, this project delivers an immersive gaming experience with comprehensive user management, statistics tracking, and social features.

### 🎯 Key Highlights

- **Pure TypeScript SPA** - No frameworks, just clean, efficient code
- **Retro-Futuristic Design** - Stunning neon aesthetics with CSS animations
- **Comprehensive User System** - Complete profile management with secure features
- **Advanced Analytics** - Detailed dashboards with data visualization
- **Social Features** - Friends system, match history, and achievements
- **Responsive Design** - Perfect experience across all devices
- **Accessibility First** - Screen reader support and keyboard navigation

## 🚀 Features

### 🎮 Game Features
- **Classic Pong Gameplay** - Smooth, responsive controls
- **Tournament System** - Competitive multiplayer tournaments
- **Multiple Game Modes** - 1v1 matches and tournament play
- **Real-time Statistics** - Live game tracking and scoring

### 👤 User Management
- **Secure Authentication** - Login and registration system
- **Profile Customization** - Avatar upload, display names, and bios
- **Account Security** - Profile deletion with confirmation safeguards
- **Skill Level Tracking** - Beginner to Advanced progression

### 📊 Analytics & Dashboard
- **Performance KPIs** - Win rate, ranking, streaks, and play time
- **Data Visualization** - Interactive charts and graphs
  - Weekly performance bar charts
  - Skill progression line graphs
  - Achievement progress tracking
- **Advanced Statistics** - Perfect games, comebacks, average scores
- **Historical Data** - Complete match history with detailed records

### 🏆 Social & Achievements
- **Friends System** - Add friends, view online status, challenge players
- **Achievement System** - Unlock badges and track progress
  - Win Streak Master
  - Century Club (100 games)
  - Perfect Player
  - Social Butterfly
- **Match History** - Detailed game records with opponent info
- **Leaderboards** - Global ranking system

### 🎨 User Interface
- **Neon Theme** - Cyberpunk-inspired design with glowing effects
- **Smooth Animations** - CSS transitions and keyframe animations
- **Interactive Elements** - Hover effects, loading states, modals
- **Modern Layout** - Card-based design with intuitive navigation
- **Dark Mode** - Easy on the eyes with neon accents

## 🏗️ Project Architecture

### 📁 Project Structure
```
neon-pong/
├── Front-end/                    # Main application directory
│   ├── src/
│   │   ├── components/           # Reusable UI components
│   │   │   └── ProfileSettings.ts    # Profile management component
│   │   ├── services/             # External services
│   │   │   └── api.ts               # API service layer
│   │   ├── styles/               # CSS styling
│   │   │   ├── style.css            # Main stylesheet (3,700+ lines)
│   │   │   ├── auth-forms.css       # Authentication form styles
│   │   │   ├── profile-settings.css # Profile component styles
│   │   │   └── tournaments.css      # Tournament page styles
│   │   ├── types/                # TypeScript definitions
│   │   │   └── index.ts             # Type definitions for User, Match, etc.
│   │   ├── utils/                # Utility functions
│   │   │   └── helpers.ts           # Common helper functions
│   │   └── main.ts               # Application entry point (1,800+ lines)
│   ├── public/                   # Static assets
│   │   ├── vite.svg             # Vite logo
│   │   └── *.png                # Game images and avatars
│   ├── docs/                    # Documentation
│   ├── dist/                    # Build output
│   ├── index.html               # Main HTML file
│   ├── package.json             # Dependencies and scripts
│   ├── tsconfig.json            # TypeScript configuration
│   └── vite.config.ts           # Vite build configuration
└── README.md                    # This file
```

### 🛠️ Technology Stack

#### Core Technologies
- **TypeScript** - Type-safe JavaScript with modern ES6+ features
- **Vite** - Fast build tool and development server
- **CSS3** - Advanced styling with animations and grid/flexbox
- **HTML5** - Semantic markup with accessibility features

#### Development Tools
- **ESLint** - Code linting and style enforcement
- **TypeScript Compiler** - Static type checking
- **Font Awesome** - Icon library for UI elements
- **Google Fonts** - Typography (Poppins, Inter, Orbitron, Rajdhani)

#### Key Libraries & APIs
- **Canvas API** - Game rendering (future implementation)
- **History API** - SPA routing without page refreshes
- **Local Storage** - Client-side data persistence
- **Fetch API** - HTTP requests for backend communication

## 🚀 Getting Started

### Prerequisites
- **Node.js** (v16 or higher)
- **npm** or **yarn**
- Modern web browser (Chrome, Firefox, Safari, Edge)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/hankhali/Final_Transcendence.git
   cd Final_Transcendence
   ```

2. **Setup the project** (installs dependencies and generates SSL certificates)
   ```bash
   make setup
   make certs
   ```

3. **Build and start the application**
   ```bash
   make all
   ```

4. **Open in browser**
   Navigate to `https://localhost` (SSL enabled)

> **Note**: SSL certificates are automatically generated locally and are **not** included in the repository for security reasons. The `make certs` command will create self-signed certificates for local development.

### Build for Production

```bash
# Build the application
npm run build

# Preview the production build
npm run preview
```

### Development Commands (Cross-Platform Compatible)

```bash
# Start development server (works on Windows, macOS, Linux)
npm run dev
# or
npm start

# Build for production
npm run build

# Lint code
npm run lint

# Preview production build
npm run preview
```

### University/Lab Setup (No Shell Scripts Required)

This project is designed to work on any machine without shell scripts:

1. **On any OS (Windows, macOS, Linux)**:
   ```bash
   cd Front-end
   npm install
   npm run build
   ```

2. **Start with Docker (Recommended for university labs)**:
   ```bash
   docker-compose up -d
   ```

3. **Access the application**:
   - Open browser to `https://localhost`
   - Accept the self-signed certificate warning

## 🎮 How to Use

### 🏠 Home Page
- **Welcome Interface** - Learn about the game and features
- **Navigation** - Access all sections via the top navigation bar
- **Responsive Design** - Optimized for desktop, tablet, and mobile

### 🔐 Authentication
- **Register** - Create a new account with username and password
- **Login** - Access your existing account
- **Validation** - Real-time form validation with error messages

### 👤 Profile Management
Navigate to the Profile section to access five main tabs:

1. **📊 Dashboard** (Default)
   - Performance overview with KPI cards
   - Interactive charts showing weekly performance and skill progression
   - Recent matches summary
   - Achievement progress tracking

2. **⚙️ Profile Settings**
   - Update username, display name, and bio
   - Upload custom avatar
   - Set skill level (Beginner, Intermediate, Advanced)
   - **Danger Zone** - Secure profile deletion with confirmation

3. **📈 Statistics**
   - Detailed performance metrics
   - Win/loss ratios and game counts
   - Win rate calculations

4. **👥 Friends**
   - Add and manage friends
   - View online status
   - Challenge friends to matches
   - Remove friends

5. **📜 Match History**
   - Complete game history
   - Opponent information
   - Scores and game duration
   - Game types (1v1, Tournament)

### 🏆 Tournaments
- **Browse Tournaments** - View available competitions
- **Create Tournament** - Host your own tournament
- **Join Tournament** - Participate in existing tournaments
- **Tournament Management** - Track progress and results

## 🎨 Design Philosophy

### Visual Identity
- **Neon Aesthetic** - Cyan and magenta color scheme with glowing effects
- **Retro-Futuristic** - 80s cyberpunk inspired with modern UX principles
- **Dark Theme** - Reduces eye strain for extended gaming sessions
- **Smooth Animations** - Enhances user experience with subtle transitions

### User Experience
- **Intuitive Navigation** - Clear, logical information architecture
- **Responsive Design** - Seamless experience across all device sizes
- **Accessibility** - WCAG compliant with screen reader support
- **Performance** - Optimized loading times and smooth interactions

### Code Quality
- **TypeScript First** - Type safety and better developer experience
- **Modular Architecture** - Reusable components and clear separation of concerns
- **Clean Code** - Readable, maintainable, and well-documented
- **Modern Standards** - ES6+, CSS Grid/Flexbox, semantic HTML

## 📊 Technical Specifications

### Performance Metrics
- **Build Size** - Optimized bundle with tree shaking
  - CSS: ~87KB (compressed: ~16KB)
  - JavaScript: ~49KB (compressed: ~13KB)
- **Load Time** - Sub-second initial page load
- **Lighthouse Score** - 90+ across all categories

### Browser Support
- **Chrome** 88+
- **Firefox** 85+
- **Safari** 14+
- **Edge** 88+

### Accessibility Features
- **ARIA Labels** - Comprehensive screen reader support
- **Keyboard Navigation** - Full keyboard accessibility
- **Color Contrast** - WCAG AA compliant contrast ratios
- **Focus Management** - Clear focus indicators and logical tab order

## 🔮 Future Enhancements

### Planned Features
- **Real-time Multiplayer** - WebSocket-based live gameplay
- **Advanced AI** - Different difficulty levels for single-player
- **Mobile App** - Progressive Web App (PWA) capabilities
- **Sound Effects** - Immersive audio experience
- **Customization** - Themes, paddle colors, and game settings

### Technical Improvements
- **Backend Integration** - REST API for data persistence
- **Real-time Updates** - WebSocket for live features
- **Caching Strategy** - Service worker for offline functionality
- **Testing Suite** - Unit and integration tests
- **CI/CD Pipeline** - Automated deployment and testing

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### Development Guidelines
- Follow TypeScript best practices
- Maintain consistent code style
- Add comments for complex logic
- Test your changes thoroughly
- Update documentation as needed

## 📄 License

This project is part of the 42 School curriculum and follows their guidelines for student projects.

## 🙏 Acknowledgments

- **42 School** - For the project requirements and educational framework
- **Vite Team** - For the excellent build tool
- **Font Awesome** - For the comprehensive icon library
- **Google Fonts** - For the beautiful typography
- **CSS Tricks** & **MDN** - For invaluable web development resources

## 📞 Contact

**Project Repository**: [Final_Transcendence](https://github.com/hankhali/Final_Transcendence)

**Developer**: hankhali

---

<div align="center">

**Built with ❤️ and lots of ☕**

*Experience the future of retro gaming with Neon Pong!*

</div>

after registration u have to login
 hanieh check