# Système de TP : APIs REST TypeScript 🚀

## 📚 Formation Complète - 8 TPs Progressifs

Un système de formation complet pour maîtriser le développement d'APIs REST avec TypeScript, de l'initiation au déploiement en production enterprise.

### 🎯 Parcours d'Apprentissage

```
🥉 Bronze (Fondamentaux)     🥈 Silver (Maîtrise)        🥇 Gold (Expertise)
     20-30h                      30-40h                      40-60h
      ⬇️                          ⬇️                          ⬇️
 TP-01: Fondamentaux        TP-04: Tests & Qualité     TP-07: API Avancée
 TP-02: Routes/Middleware   TP-05: Sécurité           TP-08: Déploiement
 TP-03: Validation/Erreurs  TP-06: Base de données    
```

### 🏆 Progression par Niveau

#### 🥉 **Niveau Bronze** - Développeur API Junior
- **Durée** : 20-30 heures
- **Public** : Débutants Node.js/TypeScript
- **Objectif** : Maîtriser les fondamentaux du développement d'API REST

#### 🥈 **Niveau Silver** - Développeur API Confirmé  
- **Durée** : 30-40 heures (cumulative)
- **Public** : Développeurs avec bases Node.js
- **Objectif** : Développer des APIs robustes et sécurisées

#### 🥇 **Niveau Gold** - Expert API Enterprise
- **Durée** : 40-60 heures (cumulative)
- **Public** : Développeurs expérimentés
- **Objectif** : Concevoir et déployer des APIs enterprise-grade

## 📋 Liste des TPs Disponibles

| TP | Titre | Niveau | Durée | Statut |
|----|-------|--------|-------|--------|
| [TP-01](./README_TP_01.md) | Fondamentaux Node.js/TypeScript | 🥉 Bronze | 4-6h | ✅ Complet |
| [TP-02](./README_TP_02.md) | Routes et Middleware Avancés | 🥉 Bronze | 5-7h | ✅ Complet |
| [TP-03](./README_TP_03.md) | Validation et Gestion d'Erreurs | 🥉 Bronze | 4-6h | ✅ Complet |
| [TP-04](./README_TP_04.md) | Tests et Qualité de Code | 🥈 Silver | 6-8h | ✅ Complet |
| [TP-05](./README_TP_05.md) | Sécurité et Authentification | 🥈 Silver | 6-8h | ✅ Complet |
| [TP-06](./README_TP_06.md) | Base de Données et Performance | 🥈 Silver | 8-10h | ✅ Complet |
| [TP-07](./README_TP_07.md) | API Avancée et Optimisations | 🥇 Gold | 8-10h | ✅ Complet |
| [TP-08](./README_TP_08.md) | Déploiement et Production | 🥇 Gold | 10-12h | ✅ Complet |

## 🎓 Livrables par TP

### Fichiers Disponibles
Chaque TP dispose d'un ensemble complet de ressources :

- **📖 README_TP_XX.md** - Documentation théorique et concepts
- **💻 EXERCICES_XX.md** - Exercices pratiques par niveau
- **✅ SOLUTIONS_XX.md** - Solutions complètes et expliquées  
- **🎯 OBJECTIFS_XX.md** - Objectifs pédagogiques et évaluation

### Structure Complète
```
📁 universal-rest-api/
├── 📖 GUIDE_COMPLET.md         # Vue d'ensemble de la formation
├── 📋 Documentations par TP/
│   ├── README_TP_01.md → README_TP_08.md
│   ├── EXERCICES_01.md → EXERCICES_08.md  
│   ├── SOLUTIONS_01.md → SOLUTIONS_08.md
│   └── OBJECTIFS_01.md → OBJECTIFS_08.md
└── 💻 Code Source/
    ├── src/ (implémentation de référence)
    ├── tests/ (suite de tests complète)
    └── docker/ (conteneurisation)
```

## 🚀 Fonctionnalités Développées

### Au terme de la formation, les étudiants maîtrisent :

#### 🛠️ **Stack Technique Complete**
- **Backend** : Node.js 18+, TypeScript 5.x, Express.js
- **Base de Données** : PostgreSQL + MongoDB, cache Redis
- **Tests** : Jest, Supertest, TDD, couverture >90%
- **Sécurité** : JWT, RBAC, bcrypt, audit de sécurité
- **Performance** : Pagination, cache, optimisations
- **DevOps** : Docker, CI/CD, Terraform, monitoring

#### 🏗️ **Architecture Enterprise**
- **Design Patterns** : Repository, Factory, Observer
- **API Design** : RESTful, versioning, documentation Swagger
- **Microservices** : Découplage, communication async
- **Observabilité** : Logs structurés, métriques, traces

#### 🎯 **Compétences Métier**
- **E-commerce API** : Utilisateurs, produits, commandes, paiements
- **Recherche Avancée** : Facettes, suggestions, elasticsearch
- **Upload & Media** : Fichiers, images, traitement
- **Analytics** : Métriques business, dashboards temps réel

## 📁 Architecture du Code Source

```
src/
├── index.js                    # Point d'entrée principal
├── config/
│   ├── environment.js         # Configuration des variables d'environnement
│   └── database.js            # Configuration base de données multi-provider
├── controllers/
│   ├── index.js               # Export centralisé des contrôleurs
│   └── items.controller.js    # Contrôleur CRUD avec pagination/recherche
├── framework/
│   ├── factory.js             # Factory pour sélection du framework
│   ├── express/
│   │   ├── adapter.js         # Adaptateur Express avec Swagger
│   │   └── server.js          # Configuration serveur Express optimisé
│   └── fastify/
│       ├── adapter.js         # Adaptateur Fastify avec Swagger
│       └── server.js          # Configuration serveur Fastify performant
├── middleware/
│   ├── index.js               # Export centralisé des middlewares
│   ├── auth.middleware.js     # Authentification JWT/RBAC/API Key
│   ├── validation.middleware.js # Validation Joi multi-schémas
│   ├── rateLimit.middleware.js # Rate limiting intelligent
│   └── error.middleware.js    # Gestion centralisée des erreurs
├── routes/
│   ├── index.js               # Configuration routes avec versioning
│   └── items.routes.js        # Routes CRUD + recherche + upload
├── schemas/
│   ├── items.schema.js        # Schémas Joi pour validation complète
│   └── validation.js          # Schémas de validation génériques
├── services/
│   ├── index.js               # Export centralisé des services
│   ├── items.service.js       # Service métier avec cache et optimisations
│   ├── auth.service.js        # Service d'authentification JWT
│   ├── upload.service.js      # Service d'upload avec traitement images
│   └── search.service.js      # Service de recherche avancée
└── swagger/
    ├── swagger.config.js      # Configuration OpenAPI 3 complète
    └── definitions/
        └── items.yaml         # Définitions Swagger par ressource

tests/
├── unit/                      # Tests unitaires avec mocks
├── integration/               # Tests d'intégration API
├── e2e/                      # Tests end-to-end complets
└── fixtures/                 # Données de test et factories

docker/
├── Dockerfile                # Image production optimisée
├── docker-compose.yml        # Stack développement complète
└── docker-compose.prod.yml   # Configuration production
```

## 🎯 Démarrage Rapide

### Prérequis
- Node.js 18+ et npm/yarn
- Docker et Docker Compose
- PostgreSQL et Redis (ou via Docker)

### Installation Locale
```bash
# Cloner le repository
git clone <repo-url>
cd universal-rest-api

# Installer les dépendances
npm install

# Configuration environnement
cp .env.example .env
# Éditer .env avec vos paramètres

# Démarrer les services (PostgreSQL, Redis)
docker-compose up -d postgres redis

# Démarrer l'application
npm run dev
```

### Avec Docker (Recommandé)
```bash
# Démarrer la stack complète
docker-compose up -d

# Accéder à l'API
curl http://localhost:3000/health

# Documentation Swagger
open http://localhost:3000/docs
```

## 🧪 Tests et Qualité

### Lancer les Tests
```bash
# Tests unitaires
npm run test:unit

# Tests d'intégration  
npm run test:integration

# Tests end-to-end
npm run test:e2e

# Couverture de code
npm run test:coverage

# Linter et formatting
npm run lint
npm run format
```

### Métriques de Qualité
- **Couverture** : >90% sur le code métier
- **Performance** : <100ms P95 sur endpoints CRUD
- **Sécurité** : Audit automatisé, 0 vulnérabilité critique
- **Documentation** : 100% endpoints documentés

## 🎓 Utilisation Pédagogique

### Pour les Étudiants
1. **Suivre les TPs dans l'ordre** (TP-01 → TP-08)
2. **Commencer par le niveau Bronze** de chaque TP
3. **Valider avec les tests** avant de passer au niveau suivant
4. **Consulter les solutions** uniquement après tentatives

### Pour les Formateurs
1. **Adapter le rythme** selon le niveau de l'audience
2. **Utiliser les grilles d'évaluation** fournies
3. **Organiser des code reviews** entre étudiants
4. **Proposer des défis** bonus pour les plus avancés

### Organisation Recommandée
- **Séances** : 3h minimum par TP
- **Projet fil rouge** : API e-commerce évolutive
- **Évaluation** : Continue + projet final
- **Certification** : Badge par niveau atteint

## 📚 Ressources d'Apprentissage

### Documentation Officielle
- [Node.js Documentation](https://nodejs.org/docs/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Express.js Guide](https://expressjs.com/guide/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)

### Outils de Développement
- [Postman Collection](./postman/) - Tests API prêts à l'emploi
- [VS Code Workspace](./vscode/) - Configuration recommandée
- [Docker Configs](./docker/) - Environnements standardisés

### Ressources Avancées
- [Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [API Design Best Practices](https://github.com/microsoft/api-guidelines)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)

## 🏆 Débouchés et Certification

### Métiers Visés
- **Développeur Backend** Node.js/TypeScript (35-55k€)
- **Développeur Full-Stack** avec spécialisation API (40-65k€)  
- **Lead Developer** / Tech Lead (60-85k€)
- **DevOps Engineer** (50-80k€)
- **Architecte Logiciel** (70-100k€)

### Certifications Préparées
- **AWS Certified Developer**
- **Google Cloud Professional Developer** 
- **Microsoft Azure Developer Associate**
- **Kubernetes Application Developer (CKAD)**

## 🤝 Contribution

### Comment Contribuer
1. **Fork** le repository
2. **Créer une branche** feature/improvement
3. **Développer** avec tests
4. **Ouvrir une Pull Request** avec description détaillée

### Roadmap 2024-2025
- [ ] Module GraphQL (TP-09)
- [ ] Module gRPC (TP-10)  
- [ ] Module Serverless (TP-11)
- [ ] Module Microservices (TP-12)

### Feedback Apprécié
- 🐛 **Bugs** : Issues GitHub
- 💡 **Améliorations** : Discussions GitHub
- 📚 **Documentation** : Pull Requests
- 🎓 **Retours pédagogiques** : Email formateurs

---

## 📞 Support et Contact

### Support Technique
- **Issues GitHub** : Bugs et questions techniques
- **Discussions** : Partage d'expériences
- **Wiki** : FAQ et troubleshooting

### Équipe Pédagogique
- **Auteur Principal** : Expert Node.js/TypeScript
- **Reviewers** : Développeurs Senior et Formateurs
- **Community** : Étudiants et professionnels

---

**🎯 Objectif : Former la nouvelle génération de développeurs API TypeScript avec un niveau enterprise et des compétences immédiatement opérationnelles en entreprise.**
├── schemas/ # Schémas de validation
├── middleware/ # Middleware pour la gestion des requêtes et des erreurs
├── framework/ # Adaptations spécifiques aux frameworks
├── swagger/ # Configuration et définitions Swagger
└── config/ # Configuration de l'application

```

## 🛠️ Installation

```bash
# Cloner le projet
git clone <repository-url>
cd universal-rest-api

# Installer les dépendances
npm install

# Configurer l'environnement
cp .env.example .env
# Éditer le fichier .env selon vos besoins
```

## ⚙️ Configuration

Créez un fichier `.env` à la racine du projet :

```env
# Framework à utiliser (express, fastify)
FRAMEWORK=express

# Port du serveur
PORT=3001

# Clé secrète JWT
JWT_SECRET=your-secret-key

# Environnement
NODE_ENV=development
```

## 🚀 Utilisation

### Démarrage du serveur

```bash
# Mode développement avec nodemon
npm run dev

# Mode production
npm start
```

Le serveur démarre sur le port configuré (3001 par défaut).

### API Endpoints

| Méthode | Endpoint         | Description              |
| ------- | ---------------- | ------------------------ |
| GET     | `/api/items`     | Récupérer tous les items |
| GET     | `/api/items/:id` | Récupérer un item par ID |
| POST    | `/api/items`     | Créer un nouvel item     |
| PUT     | `/api/items/:id` | Mettre à jour un item    |
| DELETE  | `/api/items/:id` | Supprimer un item        |

### Documentation Swagger

Une fois le serveur démarré, accédez à la documentation interactive :

- **Swagger UI** : http://localhost:3001/docs

### Exemples d'utilisation

#### Récupérer tous les items

```bash
curl http://localhost:3001/api/items
```

#### Créer un nouvel item

```bash
curl -X POST http://localhost:3001/api/items \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Nouvel Item",
    "description": "Description de l'item",
    "price": 29.99,
    "category": "electronics"
  }'
```

#### Avec authentification JWT

```bash
curl -X POST http://localhost:3001/api/items \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"name": "Item sécurisé", "description": "Nécessite auth", "price": 99.99, "category": "premium"}'
```

## 🔧 Ajouter un nouveau framework

Le template est conçu pour être facilement extensible. Voici comment ajouter un nouveau framework :

### 1. Créer l'adaptateur

```javascript
// src/framework/hapi/adapter.js
export class HapiAdapter {
  constructor() {
    // Initialisation du serveur Hapi
  }

  configureRoutes() {
    // Configuration des routes Hapi
  }

  configureSwagger() {
    // Configuration Swagger pour Hapi
  }

  async listen(port, callback) {
    // Démarrage du serveur
  }
}
```

### 2. Mettre à jour la factory

```javascript
// src/framework/factory.js
import { HapiAdapter } from "./hapi/adapter.js";

export class FrameworkFactory {
  static create(framework) {
    switch (framework) {
      case "express":
        return new ExpressAdapter();
      case "fastify":
        return new FastifyAdapter();
      case "hapi":
        return new HapiAdapter(); // Nouveau framework
      default:
        throw new Error(`Framework "${framework}" not supported`);
    }
  }
}
```

### 3. Configurer l'environnement

```env
FRAMEWORK=hapi
```

npm run dev

```

## Accéder à la documentation Swagger
La documentation de l'API est accessible à l'adresse suivante :
```

http://localhost:3000/docs

````

## Fonctionnalités
- CRUD générique pour la ressource "items" (GET, POST, PUT, DELETE).
- Validation des requêtes et des réponses.
- Gestion centralisée des erreurs.
- Middleware pour l'authentification (JWT, API Key).
- Système d'injection de dépendances pour intégrer des services personnalisés.

## 📝 Validation et schémas

Le template utilise Zod pour la validation avec des schémas réutilisables :

```javascript
// src/schemas/items.schema.js
import { z } from 'zod';

export const createItemSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().min(1, 'Description is required'),
  price: z.number().positive('Price must be positive'),
  category: z.enum(['electronics', 'books', 'clothing', 'other'])
});
````

## 🔐 Authentification

Deux méthodes d'authentification sont supportées :

### JWT Token

```javascript
// Header
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### API Key

```javascript
// Header
X-API-Key: your-api-key-here
```

## 🧪 Tests

```bash
# Tests unitaires
npm test

# Tests d'intégration
npm run test:integration

# Coverage
npm run test:coverage
```

## 📊 Monitoring et logging

Le template inclut un système de logging configuré :

```javascript
// Les logs sont automatiquement générés
console.log("🚀 Server running on port 3001");
console.log("📚 Swagger documentation available at http://localhost:3001/docs");
console.log("🔧 Framework: express");
```

## 🚀 Déploiement

### Docker

```dockerfile
# Dockerfile inclus pour containerisation
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3001
CMD ["npm", "start"]
```

```bash
# Build et run
docker build -t universal-rest-api .
docker run -p 3001:3001 universal-rest-api
```

### Heroku

```bash
# Déploiement Heroku
heroku create your-app-name
git push heroku main
```

## 🤝 Contribution

1. Fork le projet
2. Créer une branche feature (`git checkout -b feature/nouvelle-fonctionnalite`)
3. Commit les changements (`git commit -am 'Ajout nouvelle fonctionnalité'`)
4. Push la branche (`git push origin feature/nouvelle-fonctionnalite`)
5. Créer une Pull Request

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier [LICENSE](LICENSE) pour plus de détails.

## 🆘 Support

- 📚 [Documentation Swagger](http://localhost:3001/docs)

---

**Développé avec ❤️ pour la communauté Node.js**
