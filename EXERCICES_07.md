# 🚀 Exercices TP-07 : API Avancée - Fonctionnalités Enterprise

## 📋 Vue d'ensemble

Ces exercices vous guideront dans l'implémentation de fonctionnalités avancées pour une API REST de niveau enterprise. Chaque exercice comprend plusieurs niveaux de difficulté (Bronze 🥉, Silver 🥈, Gold 🥇).

**Durée totale estimée :** 7-8 heures

---

## 🥉 Exercice 1 : Pagination Intelligente (Bronze)

**Durée :** 90 minutes

### Objectif

Implémenter un système de pagination flexible supportant offset, cursor et métadonnées avancées.

### 📝 Tâches

#### 1.1 Service de Pagination Basique

```typescript
// src/services/pagination.service.ts
interface PaginationOptions {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

interface PaginationResult<T> {
  data: T[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}
```

**À implémenter :**

- [ ] Créer le service de pagination avec validation des paramètres
- [ ] Gérer les limites (max 100 items par page)
- [ ] Calculer automatiquement les métadonnées
- [ ] Supporter le tri sur plusieurs champs

#### 1.2 Intégration dans les Contrôleurs

```typescript
// src/controllers/items.controller.ts
// GET /api/items?page=1&limit=10&sortBy=createdAt&sortOrder=desc
```

**À implémenter :**

- [ ] Modifier le contrôleur `getItems` pour utiliser la pagination
- [ ] Valider les paramètres de query avec Zod
- [ ] Retourner les métadonnées dans les headers HTTP
- [ ] Gérer les erreurs de pagination (page inexistante, etc.)

#### 1.3 Tests de Pagination

**À implémenter :**

- [ ] Tests unitaires du service de pagination
- [ ] Tests d'intégration des endpoints paginés
- [ ] Tests de validation des paramètres
- [ ] Tests de performance avec grandes collections

### ✅ Critères de Validation

- ✅ Pagination fonctionnelle avec métadonnées complètes
- ✅ Validation robuste des paramètres
- ✅ Headers HTTP appropriés (X-Total-Count, Link, etc.)
- ✅ Tests passants avec couverture > 80%

---

## 🥈 Exercice 2 : Pagination Cursor (Silver)

**Durée :** 120 minutes

### Objectif

Implémenter la pagination par cursor pour de meilleures performances sur de gros datasets.

### 📝 Tâches

#### 2.1 Service de Pagination Cursor

```typescript
// src/services/cursor-pagination.service.ts
interface CursorPaginationOptions {
  cursor?: string;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

interface CursorPaginationResult<T> {
  data: T[];
  cursors: {
    before?: string;
    after?: string;
  };
  hasNext: boolean;
  hasPrev: boolean;
}
```

**À implémenter :**

- [ ] Encoder/décoder les cursors (Base64 + JWT pour sécurité)
- [ ] Gérer la navigation bidirectionnelle
- [ ] Optimiser les requêtes avec index sur les champs de tri
- [ ] Supporter les cursors temporels pour les données time-series

#### 2.2 Comparaison des Performances

**À implémenter :**

- [ ] Benchmark offset vs cursor sur 100k+ enregistrements
- [ ] Métriques de performance (temps de réponse, utilisation mémoire)
- [ ] Recommandations automatiques (offset < 1000, cursor > 1000)

### ✅ Critères de Validation

- ✅ Cursors sécurisés et non manipulables
- ✅ Performance supérieure sur grands datasets
- ✅ Navigation fluide avant/arrière
- ✅ Benchmarks documentés

---

## 🥇 Exercice 3 : Recherche et Filtres Avancés (Gold)

**Durée :** 150 minutes

### Objectif

Implémenter un système de recherche avancée avec filtres complexes, facettes et suggestions.

### 📝 Tâches

#### 3.1 Moteur de Recherche

```typescript
// src/services/search.service.ts
interface SearchOptions {
  q?: string; // Recherche textuelle
  filters?: Record<string, any>; // Filtres par champs
  facets?: string[]; // Facettes à calculer
  fuzzy?: boolean; // Recherche floue
  suggestions?: boolean; // Auto-complétion
}

interface SearchResult<T> {
  data: T[];
  facets: Record<string, FacetResult>;
  suggestions: string[];
  totalMatches: number;
  searchTime: number;
}
```

**À implémenter :**

- [ ] Recherche full-text avec scoring
- [ ] Filtres composites (AND, OR, NOT)
- [ ] Recherche par plages (dates, prix)
- [ ] Filtres géographiques (si applicable)

#### 3.2 Système de Facettes

```typescript
interface FacetResult {
  values: Array<{
    value: string;
    count: number;
    selected: boolean;
  }>;
  type: "terms" | "range" | "date_histogram";
}
```

**À implémenter :**

- [ ] Facettes par catégorie, tags, prix
- [ ] Facettes temporelles (par mois/année)
- [ ] Facettes numériques avec ranges automatiques
- [ ] Cache des facettes pour performance

#### 3.3 Auto-complétion et Suggestions

**À implémenter :**

- [ ] Index des termes populaires
- [ ] Corrections orthographiques ("did you mean")
- [ ] Suggestions contextuelles
- [ ] Historique de recherche (optionnel)

### ✅ Critères de Validation

- ✅ Recherche rapide (<200ms) sur 10k+ items
- ✅ Facettes calculées dynamiquement
- ✅ Suggestions pertinentes
- ✅ Interface utilisateur conviviale

---

## 🥉 Exercice 4 : Upload de Fichiers (Bronze)

**Durée :** 120 minutes

### Objectif

Implémenter un système d'upload sécurisé avec validation et traitement des fichiers.

### 📝 Tâches

#### 4.1 Configuration Multer

```typescript
// src/middleware/upload.middleware.ts
const uploadConfig = {
  destination: "./uploads/",
  fileSize: 5 * 1024 * 1024, // 5MB
  allowedTypes: ["image/jpeg", "image/png", "application/pdf"],
};
```

**À implémenter :**

- [ ] Configuration sécurisée de Multer
- [ ] Validation des types de fichiers
- [ ] Limites de taille par type
- [ ] Nommage unique des fichiers (UUID)

#### 4.2 Endpoints d'Upload

```typescript
// POST /api/files/upload
// GET /api/files/:id
// DELETE /api/files/:id
```

**À implémenter :**

- [ ] Upload unique et multiple
- [ ] Métadonnées des fichiers (taille, type, date)
- [ ] Serving sécurisé des fichiers
- [ ] Suppression avec nettoyage

#### 4.3 Traitement d'Images

**À implémenter :**

- [ ] Redimensionnement automatique (Sharp)
- [ ] Génération de thumbnails
- [ ] Optimisation (compression, format WebP)
- [ ] Extraction de métadonnées EXIF

### ✅ Critères de Validation

- ✅ Upload sécurisé sans vulnérabilités
- ✅ Validation stricte des fichiers
- ✅ Traitement d'images efficace
- ✅ Gestion propre des erreurs

---

## 🥈 Exercice 5 : Versioning d'API (Silver)

**Durée :** 100 minutes

### Objectif

Implémenter un système de versioning robuste pour maintenir la compatibilité ascendante.

### 📝 Tâches

#### 5.1 Stratégies de Versioning

```typescript
// Header: Accept: application/vnd.api+json; version=2
// URL: /api/v2/items
// Query: /api/items?version=2
```

**À implémenter :**

- [ ] Support des 3 stratégies simultanément
- [ ] Détection automatique de la version
- [ ] Version par défaut configurable
- [ ] Middleware de routage par version

#### 5.2 Transformateurs de Données

```typescript
// src/transformers/v1-to-v2.transformer.ts
interface VersionTransformer {
  transformRequest(data: any, fromVersion: string, toVersion: string): any;
  transformResponse(data: any, fromVersion: string, toVersion: string): any;
}
```

**À implémenter :**

- [ ] Transformateurs bidirectionnels
- [ ] Mapping des champs obsolètes
- [ ] Validation des données transformées
- [ ] Cache des transformations

#### 5.3 Documentation par Version

**À implémenter :**

- [ ] Swagger séparé par version
- [ ] Changelog automatique
- [ ] Notes de migration
- [ ] Politique de dépréciation

### ✅ Critères de Validation

- ✅ Compatibilité ascendante préservée
- ✅ Transitions transparentes entre versions
- ✅ Documentation claire des changements
- ✅ Tests de non-régression

---

## 🥇 Exercice 6 : Rate Limiting Avancé (Gold)

**Durée :** 120 minutes

### Objectif

Implémenter un système de rate limiting sophistiqué avec quotas personnalisés et analytics.

### 📝 Tâches

#### 6.1 Rate Limiting Multi-niveaux

```typescript
// src/middleware/advanced-rate-limit.middleware.ts
interface RateLimitConfig {
  global: { requests: number; window: string };
  perUser: { requests: number; window: string };
  perEndpoint: Record<string, { requests: number; window: string }>;
  premium: { multiplier: number };
}
```

**À implémenter :**

- [ ] Limites globales et par utilisateur
- [ ] Limites spécifiques par endpoint
- [ ] Quotas premium/freemium
- [ ] Fenêtres glissantes vs fixes

#### 6.2 Algorithmes Sophistiqués

**À implémenter :**

- [ ] Token Bucket Algorithm
- [ ] Sliding Window Log
- [ ] Leaky Bucket
- [ ] Adaptive Rate Limiting

#### 6.3 Analytics et Monitoring

```typescript
interface RateLimitAnalytics {
  requestCount: number;
  rejectedCount: number;
  averageResponseTime: number;
  topUsers: Array<{ userId: string; requests: number }>;
  endpointStats: Record<string, EndpointStats>;
}
```

**À implémenter :**

- [ ] Métriques en temps réel
- [ ] Alertes de seuils
- [ ] Dashboard d'analytics
- [ ] Export des données

### ✅ Critères de Validation

- ✅ Protection efficace contre les abus
- ✅ Performance maintenue sous charge
- ✅ Métriques précises et exploitables
- ✅ Configuration flexible

---

## 🚀 Exercice 7 : Documentation Interactive Avancée

**Durée :** 90 minutes

### Objectif

Créer une documentation Swagger/OpenAPI complète avec exemples interactifs et tests intégrés.

### 📝 Tâches

#### 7.1 Configuration Swagger Avancée

```typescript
// src/swagger/config.ts
const swaggerConfig = {
  info: {
    title: "Universal REST API",
    version: "2.0.0",
    description: "API Enterprise avec fonctionnalités avancées",
  },
  servers: [
    { url: "http://localhost:3000/api/v1", description: "Development v1" },
    { url: "http://localhost:3000/api/v2", description: "Development v2" },
  ],
};
```

**À implémenter :**

- [ ] Définitions complètes des schémas
- [ ] Exemples de requêtes/réponses
- [ ] Documentation des erreurs
- [ ] Authentification interactive

#### 7.2 Tests Intégrés

**À implémenter :**

- [ ] Collection Postman auto-générée
- [ ] Tests de charge intégrés
- [ ] Validation des schémas en temps réel
- [ ] Scenarios de tests utilisateur

#### 7.3 Documentation Vivante

**À implémenter :**

- [ ] Synchronisation code -> documentation
- [ ] Génération automatique via CI/CD
- [ ] Versioning de la documentation
- [ ] Métriques d'utilisation de l'API

### ✅ Critères de Validation

- ✅ Documentation complète et à jour
- ✅ Exemples fonctionnels
- ✅ Tests intégrés passants
- ✅ Interface utilisateur intuitive

---

## 🎯 Projet Final : Intégration Complète

### Scenario : E-commerce API Enterprise

**Durée :** 2-3 heures

Créez une API complète pour un système e-commerce utilisant toutes les fonctionnalités développées :

#### Fonctionnalités Requises

1. **Catalogue Produits**

   - Recherche avancée avec facettes (catégorie, prix, marque)
   - Pagination cursor pour performances
   - Images produits avec thumbnails

2. **Gestion Utilisateurs**

   - Upload d'avatars
   - Historique de recherches
   - Quotas API personnalisés

3. **API Versioning**

   - v1: Structure basique
   - v2: Ajout de métadonnées enrichies
   - Compatibilité ascendante maintenue

4. **Monitoring et Analytics**
   - Métriques de performance
   - Usage par endpoint
   - Rate limiting adaptatif

#### Livrables

- [ ] API fonctionnelle avec tous les endpoints
- [ ] Documentation Swagger interactive
- [ ] Suite de tests complète (>90% couverture)
- [ ] Dashboard de monitoring
- [ ] Guide de migration v1->v2

### ✅ Critères d'Évaluation Final

- **Performance** : <200ms en moyenne, support 1000+ req/min
- **Sécurité** : Validation stricte, rate limiting efficace
- **Maintenabilité** : Code propre, tests complets, documentation
- **Évolutivité** : Architecture modulaire, versioning, monitoring

---

## 📊 Grille d'Évaluation Globale

| Critère             | Bronze (60%)          | Silver (75%)       | Gold (90%)               |
| ------------------- | --------------------- | ------------------ | ------------------------ |
| **Fonctionnalités** | Basiques implémentées | Avancées complètes | Innovations personnelles |
| **Performance**     | Acceptable            | Optimisée          | Excellente               |
| **Code Quality**    | Fonctionnel           | Propre et organisé | Exemplaire               |
| **Tests**           | Basiques              | Complets           | Exhaustifs + Performance |
| **Documentation**   | Suffisante            | Détaillée          | Interactive + Exemples   |

**Seuil de réussite :** 70% minimum
**Excellence :** 85% et plus

---

## 🔧 Ressources et Outils

### Documentation Technique

- [Swagger/OpenAPI 3.0](https://swagger.io/specification/)
- [MongoDB Aggregation](https://docs.mongodb.com/manual/aggregation/)
- [Redis Patterns](https://redis.io/topics/data-types)

### Outils de Test

- [Artillery.io](https://artillery.io/) - Tests de charge
- [Postman](https://postman.com/) - Tests API
- [Newman](https://learning.postman.com/docs/collections/using-newman-cli/) - Tests automatisés

### Monitoring

- [Prometheus](https://prometheus.io/) - Métriques
- [Grafana](https://grafana.com/) - Dashboards
- [Winston](https://github.com/winstonjs/winston) - Logging

---

_Bonne chance pour ce TP avancé ! N'hésitez pas à expérimenter et à aller au-delà des exigences de base. 🚀_
