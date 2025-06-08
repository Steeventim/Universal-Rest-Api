# Universal REST API Template

Un template générique d'API REST en Node.js compatible avec n'importe quel framework (Express, Fastify, NestJS, Hapi, etc.) avec une architecture clean et modulable.

## 🚀 Fonctionnalités

- ✅ **Architecture modulaire** - Clean architecture avec séparation des responsabilités
- ✅ **Multi-framework** - Compatible Express, Fastify (extensible à d'autres frameworks)
- ✅ **Documentation Swagger** - OpenAPI 3 dynamique accessible à `/docs`
- ✅ **CRUD générique** - Ressource "items" avec validation complète
- ✅ **Validation robuste** - Zod, Joi, AJV avec gestion d'erreurs centralisée
- ✅ **Authentification** - Middleware JWT et API Key
- ✅ **Injection de dépendances** - Factory pattern pour intégrer facilement de nouveaux frameworks
- ✅ **Configuration flexible** - Variables d'environnement avec dotenv
- ✅ **Modules ES6** - Support complet des modules ECMAScript

## 📁 Structure du projet

```
src/
├── index.js                    # Point d'entrée principal
├── config/
│   ├── environment.js         # Configuration des variables d'environnement
│   └── database.js            # Configuration base de données (optionnel)
├── controllers/
│   ├── index.js               # Export centralisé des contrôleurs
│   └── items.controller.js    # Contrôleur CRUD pour les items
├── framework/
│   ├── factory.js             # Factory pour sélection du framework
│   ├── express/
│   │   ├── adapter.js         # Adaptateur Express avec Swagger
│   │   └── server.js          # Configuration serveur Express
│   └── fastify/
│       ├── adapter.js         # Adaptateur Fastify avec Swagger
│       └── server.js          # Configuration serveur Fastify
├── middleware/
│   ├── index.js               # Export centralisé des middlewares
│   ├── auth.middleware.js     # Authentification JWT/API Key
│   ├── validation.middleware.js # Validation Zod générique
│   └── error.middleware.js    # Gestion centralisée des erreurs
├── routes/
│   ├── index.js               # Configuration routes principales
│   └── items.routes.js        # Routes CRUD pour les items
├── schemas/
│   ├── items.schema.js        # Schémas Zod pour validation items
│   └── validation.js          # Schémas de validation génériques
├── services/
│   ├── index.js               # Export centralisé des services
│   └── items.service.js       # Service métier pour les items
└── swagger/
    ├── swagger.config.js      # Configuration OpenAPI 3
    └── definitions/
        └── items.yaml         # Définitions Swagger pour items
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

## 🎓 Système de Formation Complet - Status ✅

Ce repository contient maintenant un **système complet de formation API REST** avec 8 TPs progressifs :

### 📚 TPs Disponibles

| TP | Titre | Branche | Statut | Durée |
|----|-------|---------|--------|-------|
| **TP-01** | [Découverte](./README_TP_01.md) | `tp-01-decouverte` | ✅ Complet | 8h |
| **TP-02** | [Premiers Pas](./README_TP_02.md) | `tp-02-premiers-pas` | ✅ Complet | 10h |
| **TP-03** | [Validation & Middleware](./README_TP_03.md) | `tp-03-validation` | ✅ Complet | 8h |
| **TP-04** | [Tests & Qualité](./README_TP_04.md) | `tp-04-tests` | ✅ Complet | 12h |
| **TP-05** | [Sécurité](./README_TP_05.md) | `tp-05-securite` | ✅ Complet | 10h |
| **TP-06** | [Base de Données](./README_TP_06.md) | `tp-06-database` | ✅ Complet | 12h |
| **TP-07** | [API Avancée](./README_TP_07.md) | `tp-07-api-avancee` | ✅ Complet | 15h |
| **TP-08** | [Déploiement](./README_TP_08.md) | `tp-08-deploiement` | ✅ Complet | 10h |

### 📊 Métriques du Système

- **Total heures** : 85h de formation progressive
- **Niveaux** : Bronze (40h) → Silver (60h) → Gold (85h)
- **Documents** : 32 fichiers de documentation
- **Solutions** : +15 000 lignes de code d'exemples
- **Tests** : 50+ tests automatisés
- **Portfolio** : API e-commerce enterprise-grade

### 🚀 Démarrage Rapide Formation

```bash
# Cloner le repository
git clone https://github.com/Steeventim/Universal-Rest-Api.git
cd Universal-Rest-Api

# Accéder à un TP spécifique
git checkout tp-01-decouverte  # Commencer par le TP-01

# Consulter la documentation
cat README_TP_01.md           # Documentation théorique
cat EXERCICES_01.md           # Exercices pratiques
cat SOLUTIONS_01.md           # Solutions détaillées
cat OBJECTIFS_01.md           # Grille d'évaluation

# Installation des dépendances
npm install

# Lancer les tests
npm test

# Démarrer le serveur
npm start
```

### 📖 Guide Complet

Pour une vue d'ensemble complète du système de formation, consultez le [Guide Complet](./GUIDE_COMPLET.md).

---
