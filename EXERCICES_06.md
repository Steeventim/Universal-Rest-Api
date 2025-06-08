# 🧪 TP Niveau 6 - Base de données : Exercices Pratiques

## 🎯 Vue d'ensemble des Exercices

**Durée totale :** 6-7 heures  
**Progression :** Bronze → Silver → Gold  
**Objectif :** Maîtriser l'intégration des bases de données dans les APIs REST

---

## 🥉 **NIVEAU BRONZE** - Configuration de Base (2-3h)

### Exercice 1 : Setup MongoDB avec Mongoose (45min)

#### 🎯 Objectif

Configurer MongoDB et créer vos premiers modèles avec Mongoose.

#### 📋 Instructions

1. **Installation et configuration**

   ```bash
   # Installer les dépendances MongoDB
   npm install mongodb mongoose @types/mongoose

   # Démarrer MongoDB avec Docker
   docker run -d --name mongo-tp -p 27017:27017 mongo:6.0
   ```

2. **Créer la configuration MongoDB**

   - Implémenter `src/database/config/mongodb.ts`
   - Pattern Singleton pour la connexion
   - Gestion des erreurs de connexion

3. **Créer le modèle Item pour MongoDB**

   ```typescript
   // Schéma avec validation complète
   - name: string (requis, max 100 chars)
   - description: string (optionnel, max 500 chars)
   - price: number (requis, positif)
   - category: enum ['electronique', 'vetement', 'livre', 'autre']
   - tags: string[] (optionnel)
   - isActive: boolean (défaut: true)
   - timestamps automatiques
   ```

4. **Créer des index pour la performance**
   - Index de recherche textuelle sur name/description
   - Index composé sur category/isActive
   - Index simple sur price

#### ✅ Tests de Validation

```bash
# Test de connexion
curl http://localhost:3000/api/health/mongodb

# Test CRUD basique
curl -X POST http://localhost:3000/api/items \
  -H "Content-Type: application/json" \
  -d '{"name":"Test MongoDB","price":99.99,"category":"electronique"}'

# Vérifier dans MongoDB
mongosh
> use api_tp
> db.items.find()
```

#### 🎯 Critères de Réussite

- [ ] Connexion MongoDB stable
- [ ] Modèle Mongoose avec validation
- [ ] Index créés et fonctionnels
- [ ] CRUD basique opérationnel

---

### Exercice 2 : Setup PostgreSQL avec Prisma (45min)

#### 🎯 Objectif

Configurer PostgreSQL et utiliser Prisma comme ORM moderne.

#### 📋 Instructions

1. **Installation et initialisation**

   ```bash
   # Installer Prisma
   npm install prisma @prisma/client
   npm install --save-dev @types/pg

   # Initialiser Prisma
   npx prisma init

   # Démarrer PostgreSQL
   docker run -d --name postgres-tp \
     -e POSTGRES_DB=api_tp \
     -e POSTGRES_USER=postgres \
     -e POSTGRES_PASSWORD=password \
     -p 5432:5432 postgres:15
   ```

2. **Définir le schéma Prisma**

   ```prisma
   // prisma/schema.prisma
   model Item {
     id          Int      @id @default(autoincrement())
     name        String   @db.VarChar(100)
     description String?  @db.VarChar(500)
     price       Decimal  @db.Decimal(10, 2)
     category    Category
     tags        String[]
     isActive    Boolean  @default(true)
     createdAt   DateTime @default(now())
     updatedAt   DateTime @updatedAt

     @@index([category, isActive])
     @@index([price])
     @@map("items")
   }
   ```

3. **Générer et exécuter les migrations**

   ```bash
   npx prisma migrate dev --name init
   npx prisma generate
   ```

4. **Créer la configuration PostgreSQL**
   - Client Prisma avec logging
   - Méthodes de connexion/déconnexion
   - Gestion des erreurs

#### ✅ Tests de Validation

```bash
# Test de connexion
curl http://localhost:3000/api/health/postgresql

# Test avec Prisma Studio
npx prisma studio

# Test CRUD
curl -X POST http://localhost:3000/api/items \
  -H "Content-Type: application/json" \
  -d '{"name":"Test PostgreSQL","price":149.99,"category":"livre"}'
```

#### 🎯 Critères de Réussite

- [ ] PostgreSQL connecté via Prisma
- [ ] Schéma de données migré
- [ ] Client Prisma configuré
- [ ] Prisma Studio accessible

---

### Exercice 3 : Interface Repository Pattern (60min)

#### 🎯 Objectif

Implémenter le pattern Repository pour abstraire l'accès aux données.

#### 📋 Instructions

1. **Créer l'interface IItemRepository**

   ```typescript
   interface IItemRepository {
     findAll(options?: FindAllOptions): Promise<IItem[]>;
     findById(id: string): Promise<IItem | null>;
     create(item: Omit<IItem, "id">): Promise<IItem>;
     update(id: string, item: Partial<IItem>): Promise<IItem | null>;
     delete(id: string): Promise<boolean>;
     findByCategory(category: string): Promise<IItem[]>;
     search(query: string): Promise<IItem[]>;
     count(filter?: any): Promise<number>;
   }
   ```

2. **Implémenter MongoItemRepository**

   - Toutes les méthodes avec Mongoose
   - Gestion des erreurs spécifiques MongoDB
   - Optimisations des requêtes

3. **Implémenter PostgresItemRepository**

   - Toutes les méthodes avec Prisma
   - Conversion des types Prisma vers interface
   - Gestion des erreurs PostgreSQL

4. **Créer un Factory Pattern**
   ```typescript
   class RepositoryFactory {
     static createItemRepository(): IItemRepository {
       const dbType = process.env.DB_TYPE || "mongodb";

       switch (dbType) {
         case "mongodb":
           return new MongoItemRepository();
         case "postgres":
           return new PostgresItemRepository();
         default:
           throw new Error(`Database type ${dbType} not supported`);
       }
     }
   }
   ```

#### ✅ Tests de Validation

```bash
# Test avec MongoDB
DB_TYPE=mongodb npm run test:repository

# Test avec PostgreSQL
DB_TYPE=postgres npm run test:repository

# Test du factory pattern
npm run test:factory
```

#### 🎯 Critères de Réussite

- [ ] Interface Repository complète
- [ ] Implémentations MongoDB et PostgreSQL
- [ ] Factory pattern fonctionnel
- [ ] Tests passants pour les deux bases

---

## 🥈 **NIVEAU SILVER** - Intégration Avancée (3-4h)

### Exercice 4 : Cache Layer avec Redis (90min)

#### 🎯 Objectif

Intégrer Redis pour améliorer les performances avec un système de cache intelligent.

#### 📋 Instructions

1. **Setup Redis**

   ```bash
   # Installer Redis
   npm install redis ioredis @types/ioredis

   # Démarrer Redis
   docker run -d --name redis-tp -p 6379:6379 redis:7-alpine
   ```

2. **Créer RedisClient avec Singleton**

   ```typescript
   // Configuration avec retry et monitoring
   - Connexion avec options avancées
   - Gestion des événements (connect, error, ready)
   - Pool de connexions si nécessaire
   ```

3. **Implémenter CacheService**

   ```typescript
   // Méthodes de cache
   - getItem(id): IItem | null
   - setItem(id, item, ttl): void
   - deleteItem(id): void
   - getItemsList(key): IItem[] | null
   - setItemsList(key, items, ttl): void
   - invalidateItem(id): void
   - invalidateListsCache(): void
   - getCacheStats(): CacheStats
   ```

4. **Stratégies de cache**
   - Cache-aside pattern
   - TTL adaptatif selon le type de donnée
   - Invalidation en cascade
   - Compression pour gros objets

#### ✅ Tests de Validation

```bash
# Test de performance sans cache
time curl http://localhost:3000/api/items

# Test de performance avec cache
time curl http://localhost:3000/api/items # 2ème appel

# Vérifier Redis
redis-cli
> KEYS *
> GET "item:1"

# Stats du cache
curl http://localhost:3000/api/cache/stats
```

#### 🎯 Critères de Réussite

- [ ] Redis connecté et stable
- [ ] Cache service complet
- [ ] Amélioration mesurable des performances
- [ ] Invalidation du cache fonctionnelle

---

### Exercice 5 : Service Intégré avec Cache (60min)

#### 🎯 Objectif

Modifier le ItemService pour intégrer transparentement le cache.

#### 📋 Instructions

1. **Modifier ItemService**

   ```typescript
   // Pattern cache-aside dans chaque méthode
   getById(id):
     1. Vérifier cache
     2. Si pas trouvé → base de données
     3. Mettre en cache le résultat

   getAll(options):
     1. Créer clé de cache basée sur options
     2. Vérifier cache
     3. Si pas trouvé → base de données + cache

   create(item):
     1. Créer en base
     2. Mettre en cache
     3. Invalider les listes

   update(id, data):
     1. Modifier en base
     2. Mettre à jour le cache
     3. Invalider les listes

   delete(id):
     1. Supprimer de la base
     2. Invalider le cache
   ```

2. **Gestion intelligente du cache**

   - TTL différencié par type d'opération
   - Cache conditionnel selon la taille des données
   - Monitoring des hit/miss ratios

3. **Fallback et résilience**
   - Fonctionnement si Redis est down
   - Circuit breaker pattern
   - Logs de performance

#### ✅ Tests de Validation

```bash
# Test de performance complète
npm run benchmark:api

# Test de résilience (arrêter Redis)
docker stop redis-tp
curl http://localhost:3000/api/items # Doit fonctionner

# Redémarrer Redis
docker start redis-tp
curl http://localhost:3000/api/items # Cache doit se reconstruire
```

#### 🎯 Critères de Réussite

- [ ] Service avec cache transparent
- [ ] Performance améliorée significativement
- [ ] Résilience si cache indisponible
- [ ] Monitoring des performances

---

### Exercice 6 : Migrations et Seeders (90min)

#### 🎯 Objectif

Créer un système complet de migrations et de données de test.

#### 📋 Instructions

1. **Scripts de migration PostgreSQL**

   ```sql
   -- migrations/001_init_schema.sql
   CREATE TYPE category_enum AS ENUM (...);
   CREATE TABLE items (...);
   CREATE INDEX ...;

   -- migrations/002_add_full_text_search.sql
   CREATE INDEX idx_items_search ON items
   USING gin(to_tsvector('french', name || ' ' || description));

   -- migrations/003_add_audit_fields.sql
   ALTER TABLE items ADD COLUMN created_by INTEGER;
   ALTER TABLE items ADD COLUMN updated_by INTEGER;
   ```

2. **Seeders avec données réalistes**

   ```typescript
   // Créer 1000+ items variés
   - Différentes catégories équilibrées
   - Prix réalistes par catégorie
   - Tags pertinents
   - Descriptions détaillées
   ```

3. **Scripts de gestion**

   ```typescript
   // scripts/migrate.ts
   - Exécution séquentielle des migrations
   - Tracking des versions appliquées
   - Rollback si erreur

   // scripts/seed.ts
   - Nettoyage optionnel des données existantes
   - Insertion par batch pour performance
   - Progression et statistiques
   ```

4. **Migration MongoDB équivalente**
   ```typescript
   // Système de versions pour MongoDB
   - Collection migrations pour tracking
   - Scripts d'évolution du schéma
   - Validation des données existantes
   ```

#### ✅ Tests de Validation

```bash
# Migration PostgreSQL
npm run db:migrate

# Seeding
npm run db:seed

# Vérification des données
curl http://localhost:3000/api/items?limit=100

# Test de performance avec gros dataset
time curl http://localhost:3000/api/items/search?q=smartphone

# Rollback et re-migration
npm run db:rollback
npm run db:migrate
```

#### 🎯 Critères de Réussite

- [ ] Système de migration complet
- [ ] Seeders avec données variées (1000+ items)
- [ ] Scripts de gestion automatisés
- [ ] Performance stable avec gros dataset

---

## 🥇 **NIVEAU GOLD** - Production Ready (2-3h)

### Exercice 7 : Optimisations de Performance (90min)

#### 🎯 Objectif

Optimiser les performances pour un environnement de production.

#### 📋 Instructions

1. **Analyse des performances actuelles**

   ```typescript
   // Middleware de monitoring des requêtes
   - Temps d'exécution par endpoint
   - Analyse des requêtes lentes (>1s)
   - Statistiques de cache hit/miss
   - Monitoring de la mémoire
   ```

2. **Optimisations MongoDB**

   ```typescript
   // Index composés optimisés
   { category: 1, price: 1, isActive: 1 }
   { tags: 1, isActive: 1 }
   { name: "text", description: "text" }

   // Aggregation pipeline pour requêtes complexes
   - Pagination efficace avec $skip/$limit
   - Recherche avec scoring
   - Statistiques par catégorie
   ```

3. **Optimisations PostgreSQL**

   ```sql
   -- Index partiels pour requêtes fréquentes
   CREATE INDEX idx_active_items ON items(category, price)
   WHERE is_active = true;

   -- Index GIN pour recherche full-text
   CREATE INDEX idx_search_items ON items
   USING gin(to_tsvector('french', name || ' ' || description));

   -- Statistiques et VACUUM automatique
   ```

4. **Connection Pooling et Optimisations**

   ```typescript
   // MongoDB avec pool de connexions
   mongoose.connect(uri, {
     maxPoolSize: 10,
     minPoolSize: 2,
     maxIdleTimeMS: 30000,
     serverSelectionTimeoutMS: 5000,
   });

   // PostgreSQL avec Prisma pool
   new PrismaClient({
     datasources: {
       db: {
         url: DATABASE_URL + "?connection_limit=20&pool_timeout=20",
       },
     },
   });
   ```

#### ✅ Tests de Validation

```bash
# Load testing
npm install -g artillery
artillery quick --count 100 --num 10 http://localhost:3000/api/items

# Analyse des index
# MongoDB
db.items.getIndexes()
db.items.explain("executionStats").find({category: "electronique"})

# PostgreSQL
EXPLAIN ANALYZE SELECT * FROM items WHERE category = 'electronique';

# Monitoring continu
npm run performance:monitor
```

#### 🎯 Critères de Réussite

- [ ] Réponse <200ms pour 95% des requêtes
- [ ] Index optimisés et utilisés
- [ ] Connection pooling configuré
- [ ] Load testing réussi (100 users concurrent)

---

### Exercice 8 : Backup et Recovery (60min)

#### 🎯 Objectif

Implémenter une stratégie complète de sauvegarde et récupération.

#### 📋 Instructions

1. **Scripts de backup automatisés**

   ```bash
   #!/bin/bash
   # scripts/backup-mongodb.sh
   mongodump --host localhost:27017 --db api_tp \
     --out /backups/mongodb/$(date +%Y%m%d_%H%M%S)

   # scripts/backup-postgresql.sh
   pg_dump -h localhost -U postgres api_tp \
     > /backups/postgresql/api_tp_$(date +%Y%m%d_%H%M%S).sql
   ```

2. **Stratégie de rétention**

   ```typescript
   // Politique de backup
   - Backup complet quotidien
   - Backup incrémental toutes les 6h
   - Rétention : 7 jours quotidiens, 4 semaines hebdomadaires
   - Backup avant chaque migration
   ```

3. **Scripts de restauration**

   ```bash
   # Test de restauration complète
   # Créer une base de test
   # Restaurer le backup
   # Valider l'intégrité des données
   ```

4. **Monitoring et alertes**
   ```typescript
   // Vérification de l'intégrité
   - Checksum des backups
   - Test de restauration automatique
   - Alertes si backup échoue
   - Métriques de taille et durée
   ```

#### ✅ Tests de Validation

```bash
# Test backup complet
npm run backup:all

# Test de restauration
npm run restore:test

# Simulation de disaster recovery
docker stop postgres-tp mongo-tp redis-tp
npm run disaster:recovery

# Validation de l'intégrité
npm run backup:verify
```

#### 🎯 Critères de Réussite

- [ ] Backup automatisé fonctionnel
- [ ] Restauration testée et validée
- [ ] Stratégie de rétention implémentée
- [ ] Tests de disaster recovery réussis

---

### Exercice 9 : Monitoring et Alertes Production (90min)

#### 🎯 Objectif

Mettre en place un monitoring complet pour la production.

#### 📋 Instructions

1. **Métriques de base de données**

   ```typescript
   // Dashboard de métriques
   - Connexions actives
   - Temps de réponse des requêtes
   - Utilisation de la mémoire
   - Taille des bases de données
   - Hit ratio du cache
   ```

2. **Health checks avancés**

   ```typescript
   // Endpoint /health détaillé
   {
     "status": "healthy",
     "databases": {
       "mongodb": { "status": "connected", "latency": "5ms" },
       "postgresql": { "status": "connected", "latency": "3ms" },
       "redis": { "status": "connected", "latency": "1ms" }
     },
     "performance": {
       "avgResponseTime": "150ms",
       "slowQueries": 2,
       "cacheHitRate": "95%"
     }
   }
   ```

3. **Alertes configurables**

   ```typescript
   // Seuils d'alerte
   - Latence > 500ms → Warning
   - Latence > 1000ms → Critical
   - Cache hit rate < 80% → Warning
   - Connexions > 80% pool → Warning
   - Disk space < 20% → Critical
   ```

4. **Logs structurés**
   ```typescript
   // Logging avec Winston
   - Logs de performance par requête
   - Logs d'erreur avec context
   - Logs de sécurité (tentatives d'accès)
   - Rotation automatique des logs
   ```

#### ✅ Tests de Validation

```bash
# Test du monitoring
curl http://localhost:3000/health

# Simulation de charge pour déclencher alertes
npm run stress:test

# Vérification des logs
tail -f logs/api.log | grep ERROR

# Dashboard de métriques
curl http://localhost:3000/metrics
```

#### 🎯 Critères de Réussite

- [ ] Monitoring complet fonctionnel
- [ ] Health checks détaillés
- [ ] Alertes configurées et testées
- [ ] Logs structurés et rotatifs

---

## 🔥 **BONUS - Défis Avancés**

### Défi 1 : Multi-tenant avec bases séparées

```typescript
// Gestion de plusieurs clients avec bases dédiées
- Routing automatique selon le tenant
- Migrations par tenant
- Backup isolé par client
```

### Défi 2 : Réplication Master/Slave

```typescript
// Configuration haute disponibilité
- Master pour écriture, Slaves pour lecture
- Failover automatique
- Consistance éventuelle
```

### Défi 3 : Sharding horizontal

```typescript
// Partitionnement des données
- Stratégie de partitionnement par catégorie
- Router de requêtes automatique
- Gestion des requêtes cross-shard
```

---

## 📊 Grille d'Évaluation Globale

### Bronze (Fondamentaux) - 60 points

- Configuration bases de données : 20 pts
- Repository pattern : 20 pts
- Tests d'intégration : 20 pts

### Silver (Intermédiaire) - 80 points

- Cache Redis intégré : 30 pts
- Migrations/Seeders : 25 pts
- Performance optimisée : 25 pts

### Gold (Production) - 100 points

- Monitoring complet : 35 pts
- Backup/Recovery : 35 pts
- Optimisations avancées : 30 pts

**Score total possible : 240 points**

**Seuils de validation :**

- Bronze : 45+ points (75%)
- Silver : 60+ points (75%)
- Gold : 75+ points (75%)

---

🎯 **Objectif Final :** Maîtriser complètement l'intégration des bases de données dans une API REST de niveau production, avec cache, monitoring et résilience.

➡️ **Prochaine étape :** [TP Niveau 7 - API Avancée](./EXERCICES_07.md)
