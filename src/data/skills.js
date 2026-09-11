// ============================================================
// Skills Data — Tanish Jaswal (Python-first ordering)
// ============================================================

export const skillCategories = [
  { id: 'all', label: 'All Skills', color: '#8b5cf6' },
  { id: 'python', label: 'Python & Backend', color: '#3b82f6' },
  { id: 'ml', label: 'AI & Machine Learning', color: '#06b6d4' },
  { id: 'tools', label: 'Tools & Platforms', color: '#10b981' },
]

export const skills = [
  // Python & Backend — PRIMARY FOCUS
  {
    name: 'Python',
    proficiency: 95,
    category: 'python',
    icon: '🐍',
    color: '#3b82f6',
    description: 'Primary language — data science, ML, scripting, automation',
    years: 2,
  },
  {
    name: 'Flask',
    proficiency: 80,
    category: 'python',
    icon: '🌐',
    color: '#3b82f6',
    description: 'REST APIs, web apps, database integration',
    years: 1,
  },
  {
    name: 'REST APIs',
    proficiency: 78,
    category: 'python',
    icon: '🔌',
    color: '#3b82f6',
    description: 'Building and consuming RESTful services',
    years: 1,
  },
  {
    name: 'SQL & Databases',
    proficiency: 72,
    category: 'python',
    icon: '🗄️',
    color: '#3b82f6',
    description: 'Relational databases, queries, data management',
    years: 1,
  },
  {
    name: 'HTML & CSS',
    proficiency: 75,
    category: 'python',
    icon: '🎨',
    color: '#3b82f6',
    description: 'Frontend markup and styling',
    years: 1,
  },
  {
    name: 'C',
    proficiency: 70,
    category: 'python',
    icon: '⚙️',
    color: '#64748b',
    description: 'Systems programming, algorithms',
    years: 2,
  },
  {
    name: 'C++',
    proficiency: 68,
    category: 'python',
    icon: '⚙️',
    color: '#64748b',
    description: 'OOP, data structures, competitive programming',
    years: 2,
  },

  // AI & Machine Learning
  {
    name: 'Machine Learning',
    proficiency: 85,
    category: 'ml',
    icon: '🤖',
    color: '#06b6d4',
    description: 'Classification, regression, clustering, recommendation systems',
    years: 1,
  },
  {
    name: 'NumPy & Pandas',
    proficiency: 88,
    category: 'ml',
    icon: '📊',
    color: '#06b6d4',
    description: 'Data manipulation, numerical computing',
    years: 1,
  },
  {
    name: 'Scikit-learn',
    proficiency: 85,
    category: 'ml',
    icon: '🔬',
    color: '#06b6d4',
    description: 'ML pipelines, model training, evaluation',
    years: 1,
  },
  {
    name: 'Deep Learning',
    proficiency: 75,
    category: 'ml',
    icon: '🧠',
    color: '#8b5cf6',
    description: 'Neural networks, DL fundamentals',
    years: 1,
  },
  {
    name: 'Generative AI',
    proficiency: 72,
    category: 'ml',
    icon: '✨',
    color: '#8b5cf6',
    description: 'Generative models, prompt engineering concepts',
    years: 1,
  },

  // Tools & Platforms
  {
    name: 'Git & GitHub',
    proficiency: 85,
    category: 'tools',
    icon: '🔀',
    color: '#10b981',
    description: 'Version control, collaboration, open source',
    years: 2,
  },
  {
    name: 'Jupyter Notebook',
    proficiency: 90,
    category: 'tools',
    icon: '📓',
    color: '#10b981',
    description: 'Data exploration, ML experiments, documentation',
    years: 1,
  },
  {
    name: 'VS Code',
    proficiency: 90,
    category: 'tools',
    icon: '💻',
    color: '#10b981',
    description: 'Primary IDE with Python/ML extensions',
    years: 2,
  },
]

export const featuredProjects = [
  {
    id: 1,
    title: 'Movie Recommendation & Information Website',
    description:
      'Web application where users can search movies and view key information — genre, director, cast, ratings, and streaming availability. Features recommendation logic based on movie category, director, and related attributes.',
    tech: ['Python', 'Flask', 'Machine Learning', 'REST APIs', 'SQL', 'HTML', 'CSS'],
    highlights: [
      'Built recommendation logic based on category & director attributes',
      'Integrated external APIs for movie data retrieval',
      'Python + Flask backend with database integration',
    ],
    type: 'personal',
    category: 'ml',
    github: 'https://github.com/WARRIORXR',
  },
  {
    id: 2,
    title: 'Machine Learning Practice Portfolio',
    description:
      'Comprehensive ML practice collection using academic datasets. Covers full ML pipeline from data preprocessing to model evaluation.',
    tech: ['Python', 'Pandas', 'Scikit-learn', 'NumPy', 'Jupyter Notebook'],
    highlights: [
      'KNN, Decision Trees, Random Forest, Naive Bayes, SVM',
      'Data preprocessing, feature scaling, train-test splitting',
      'Model evaluation and performance comparison',
    ],
    type: 'personal',
    category: 'ml',
    github: 'https://github.com/WARRIORXR',
  },
]
