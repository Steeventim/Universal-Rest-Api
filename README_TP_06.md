# 🗄️ TP Niveau 6 - Base de données : Intégration et Persistance

## 🎯 Objectifs du TP

- **Durée :** 6-7 heures
- **Niveau :** Intermédiaire à Avancé
- **Prérequis :** Validation des TPs 1-5

Après ce TP, vous maîtriserez l'intégration des bases de données dans vos APIs REST, la gestion des migrations, l'optimisation des requêtes et les bonnes pratiques de persistance.

## 🔧 Configuration de l'Environnement

### Prérequis Techniques

```bash
# Installation des dépendances base de données
npm install mongodb mongoose
npm install pg sequelize
npm install prisma @prisma/client
npm install redis ioredis

# Outils de développement
npm install --save-dev @types/pg
```

### Configuration Docker (Optionnel)

```yaml
# docker-compose.yml pour les services de données
version: "3.8"
services:
  mongodb:
    image: mongo:6.0
    ports:
      - "27017:27017"
    environment:
      MONGO_INITDB_ROOT_USERNAME: admin
      MONGO_INITDB_ROOT_PASSWORD: password

  postgres:
    image: postgres:15
    ports:
      - "5432:5432"
    environment:
      POSTGRES_DB: api_tp
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
```

## 📚 Concepts Clés Abordés

### 1. Types de Bases de Données

- **NoSQL (MongoDB)** : Documents flexibles, scalabilité horizontale
- **SQL (PostgreSQL)** : Relations strictes, ACID compliance
- **Cache (Redis)** : Performance et sessions temporaires

### 2. Patterns de Persistance

- **Repository Pattern** : Abstraction de l'accès aux données
- **Active Record** : Modèles avec logique métier intégrée
- **Data Mapper** : Séparation modèle/persistance

### 3. Gestion des Migrations

- **Schema Evolution** : Évolution contrôlée de la structure
- **Seeders** : Données initiales et de test
- **Rollback** : Retour en arrière sécurisé

## 🛠️ Structure du Projet Étendue

```
src/
├── database/
│   ├── config/
│   │   ├── mongodb.ts      # Configuration MongoDB
│   │   ├── postgres.ts     # Configuration PostgreSQL
│   │   └── redis.ts        # Configuration Redis
│   ├── models/             # Modèles de données
│   │   ├── mongodb/
│   │   │   ├── Item.ts     # Modèle Mongoose
│   │   │   └── User.ts
│   │   ├── postgres/
│   │   │   ├── Item.ts     # Modèle Sequelize/Prisma
│   │   │   └── User.ts
│   │   └── interfaces/
│   │       └── IItem.ts    # Interface commune
│   ├── repositories/       # Couche d'accès aux données
│   │   ├── IItemRepository.ts
│   │   ├── MongoItemRepository.ts
│   │   └── PostgresItemRepository.ts
│   ├── migrations/         # Scripts de migration
│   │   ├── 001_init_schema.sql
│   │   └── 002_add_indexes.sql
│   └── seeders/           # Données initiales
│       ├── items.ts
│       └── users.ts
├── cache/
│   ├── RedisClient.ts     # Client Redis
│   └── CacheService.ts    # Service de mise en cache
└── services/
    ├── ItemService.ts     # Logique métier mise à jour
    └── CacheService.ts    # Intégration cache
```

## 🎮 Exercices Progressifs

### Phase 1 : Configuration de Base (2h)

1. **Setup MongoDB avec Mongoose**

   - Configurer la connexion MongoDB
   - Créer le premier modèle Item avec Mongoose
   - Implémenter CRUD basique avec validation

2. **Setup PostgreSQL avec Prisma**

   - Initialiser Prisma dans le projet
   - Définir le schéma de données
   - Générer les migrations initiales

3. **Configuration Multi-Base**
   - Créer un système de sélection de base de données
   - Implémenter le pattern Repository
   - Tests de connectivité

### Phase 2 : Intégration Avancée (4h)

1. **Repository Pattern Complet**

   - Interface commune IRepository
   - Implémentations MongoDB et PostgreSQL
   - Factory pattern pour sélection dynamique

2. **Migrations et Seeders**

   - Scripts de migration PostgreSQL
   - Seeders pour données de test
   - Gestion des versions de schéma

3. **Cache Layer avec Redis**
   - Configuration Redis
   - Cache des requêtes fréquentes
   - Invalidation intelligente du cache

### Phase 3 : Optimisation et Production (2h)

1. **Performance et Monitoring**

   - Indexation optimale
   - Query performance monitoring
   - Connection pooling

2. **Backup et Recovery**
   - Scripts de sauvegarde automatisés
   - Stratégies de récupération
   - Tests de disaster recovery

## 🔍 MongoDB avec Mongoose

### Configuration Initiale

```typescript
// src/database/config/mongodb.ts
import mongoose from "mongoose";

export class MongoDBConfig {
  private static instance: MongoDBConfig;

  private constructor() {}

  static getInstance(): MongoDBConfig {
    if (!MongoDBConfig.instance) {
      MongoDBConfig.instance = new MongoDBConfig();
    }
    return MongoDBConfig.instance;
  }

  async connect(): Promise<void> {
    try {
      const mongoUri =
        process.env.MONGODB_URI || "mongodb://localhost:27017/api_tp";
      await mongoose.connect(mongoUri);
      console.log("✅ MongoDB connecté avec succès");
    } catch (error) {
      console.error("❌ Erreur connexion MongoDB:", error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    await mongoose.disconnect();
    console.log("🔌 MongoDB déconnecté");
  }
}
```

### Modèle Mongoose

```typescript
// src/database/models/mongodb/Item.ts
import { Schema, model, Document } from "mongoose";
import { IItem } from "../interfaces/IItem";

export interface IItemDocument extends IItem, Document {
  createdAt: Date;
  updatedAt: Date;
}

const ItemSchema = new Schema<IItemDocument>(
  {
    name: {
      type: String,
      required: [true, "Le nom est obligatoire"],
      trim: true,
      maxlength: [100, "Le nom ne peut dépasser 100 caractères"],
    },
    description: {
      type: String,
      maxlength: [500, "La description ne peut dépasser 500 caractères"],
    },
    price: {
      type: Number,
      required: [true, "Le prix est obligatoire"],
      min: [0, "Le prix doit être positif"],
    },
    category: {
      type: String,
      required: [true, "La catégorie est obligatoire"],
      enum: ["electronique", "vetement", "livre", "autre"],
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Index pour la recherche
ItemSchema.index({ name: "text", description: "text" });
ItemSchema.index({ category: 1, isActive: 1 });
ItemSchema.index({ price: 1 });

export const ItemModel = model<IItemDocument>("Item", ItemSchema);
```

## 🐘 PostgreSQL avec Prisma

### Schema Prisma

```prisma
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

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

enum Category {
  electronique
  vetement
  livre
  autre
}
```

### Configuration Prisma

```typescript
// src/database/config/postgres.ts
import { PrismaClient } from "@prisma/client";

export class PostgreSQLConfig {
  private static instance: PostgreSQLConfig;
  private prisma: PrismaClient;

  private constructor() {
    this.prisma = new PrismaClient({
      log: ["query", "info", "warn", "error"],
    });
  }

  static getInstance(): PostgreSQLConfig {
    if (!PostgreSQLConfig.instance) {
      PostgreSQLConfig.instance = new PostgreSQLConfig();
    }
    return PostgreSQLConfig.instance;
  }

  getPrisma(): PrismaClient {
    return this.prisma;
  }

  async connect(): Promise<void> {
    try {
      await this.prisma.$connect();
      console.log("✅ PostgreSQL connecté avec succès");
    } catch (error) {
      console.error("❌ Erreur connexion PostgreSQL:", error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    await this.prisma.$disconnect();
    console.log("🔌 PostgreSQL déconnecté");
  }
}
```

## 🔄 Repository Pattern

### Interface Repository

```typescript
// src/database/repositories/IItemRepository.ts
import { IItem } from "../models/interfaces/IItem";

export interface IItemRepository {
  findAll(options?: FindAllOptions): Promise<IItem[]>;
  findById(id: string): Promise<IItem | null>;
  create(item: Omit<IItem, "id">): Promise<IItem>;
  update(id: string, item: Partial<IItem>): Promise<IItem | null>;
  delete(id: string): Promise<boolean>;
  findByCategory(category: string): Promise<IItem[]>;
  search(query: string): Promise<IItem[]>;
  count(filter?: any): Promise<number>;
}

export interface FindAllOptions {
  limit?: number;
  offset?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  filter?: any;
}
```

### Repository MongoDB

```typescript
// src/database/repositories/MongoItemRepository.ts
import { IItemRepository, FindAllOptions } from "./IItemRepository";
import { ItemModel } from "../models/mongodb/Item";
import { IItem } from "../models/interfaces/IItem";

export class MongoItemRepository implements IItemRepository {
  async findAll(options: FindAllOptions = {}): Promise<IItem[]> {
    const {
      limit = 10,
      offset = 0,
      sortBy = "createdAt",
      sortOrder = "desc",
      filter = {},
    } = options;

    const sortObj = { [sortBy]: sortOrder === "asc" ? 1 : -1 };

    return (await ItemModel.find(filter)
      .sort(sortObj)
      .skip(offset)
      .limit(limit)
      .lean()) as IItem[];
  }

  async findById(id: string): Promise<IItem | null> {
    return (await ItemModel.findById(id).lean()) as IItem | null;
  }

  async create(itemData: Omit<IItem, "id">): Promise<IItem> {
    const item = new ItemModel(itemData);
    const savedItem = await item.save();
    return savedItem.toObject() as IItem;
  }

  async update(id: string, itemData: Partial<IItem>): Promise<IItem | null> {
    const updated = await ItemModel.findByIdAndUpdate(id, itemData, {
      new: true,
      runValidators: true,
    }).lean();
    return updated as IItem | null;
  }

  async delete(id: string): Promise<boolean> {
    const result = await ItemModel.findByIdAndDelete(id);
    return result !== null;
  }

  async findByCategory(category: string): Promise<IItem[]> {
    return (await ItemModel.find({
      category,
      isActive: true,
    }).lean()) as IItem[];
  }

  async search(query: string): Promise<IItem[]> {
    return (await ItemModel.find(
      { $text: { $search: query } },
      { score: { $meta: "textScore" } }
    )
      .sort({ score: { $meta: "textScore" } })
      .lean()) as IItem[];
  }

  async count(filter: any = {}): Promise<number> {
    return await ItemModel.countDocuments(filter);
  }
}
```

## 📈 Cache avec Redis

### Configuration Redis

```typescript
// src/cache/RedisClient.ts
import Redis from "ioredis";

export class RedisClient {
  private static instance: RedisClient;
  private redis: Redis;

  private constructor() {
    this.redis = new Redis({
      host: process.env.REDIS_HOST || "localhost",
      port: parseInt(process.env.REDIS_PORT || "6379"),
      retryDelayOnFailover: 100,
      maxRetriesPerRequest: 3,
    });

    this.redis.on("connect", () => {
      console.log("✅ Redis connecté");
    });

    this.redis.on("error", (error) => {
      console.error("❌ Erreur Redis:", error);
    });
  }

  static getInstance(): RedisClient {
    if (!RedisClient.instance) {
      RedisClient.instance = new RedisClient();
    }
    return RedisClient.instance;
  }

  getClient(): Redis {
    return this.redis;
  }

  async disconnect(): Promise<void> {
    await this.redis.disconnect();
  }
}
```

### Service de Cache

```typescript
// src/cache/CacheService.ts
import { RedisClient } from "./RedisClient";
import { IItem } from "../database/models/interfaces/IItem";

export class CacheService {
  private redis = RedisClient.getInstance().getClient();
  private defaultTTL = 300; // 5 minutes

  // Cache pour les items
  async getItem(id: string): Promise<IItem | null> {
    const cached = await this.redis.get(`item:${id}`);
    return cached ? JSON.parse(cached) : null;
  }

  async setItem(
    id: string,
    item: IItem,
    ttl: number = this.defaultTTL
  ): Promise<void> {
    await this.redis.setex(`item:${id}`, ttl, JSON.stringify(item));
  }

  async deleteItem(id: string): Promise<void> {
    await this.redis.del(`item:${id}`);
  }

  // Cache pour les listes
  async getItemsList(key: string): Promise<IItem[] | null> {
    const cached = await this.redis.get(`list:${key}`);
    return cached ? JSON.parse(cached) : null;
  }

  async setItemsList(
    key: string,
    items: IItem[],
    ttl: number = this.defaultTTL
  ): Promise<void> {
    await this.redis.setex(`list:${key}`, ttl, JSON.stringify(items));
  }

  // Invalidation du cache
  async invalidateItem(id: string): Promise<void> {
    await this.redis.del(`item:${id}`);
    // Invalider aussi les listes qui pourraient contenir cet item
    await this.invalidateListsCache();
  }

  async invalidateListsCache(): Promise<void> {
    const keys = await this.redis.keys("list:*");
    if (keys.length > 0) {
      await this.redis.del(...keys);
    }
  }

  // Statistiques du cache
  async getCacheStats(): Promise<any> {
    const info = await this.redis.info("memory");
    const keys = await this.redis.dbsize();

    return {
      memoryUsage: info,
      totalKeys: keys,
      timestamp: new Date().toISOString(),
    };
  }
}
```

## 🔄 Service Intégré

### Service Item avec Cache

```typescript
// src/services/ItemService.ts (version mise à jour)
import { IItemRepository } from "../database/repositories/IItemRepository";
import { CacheService } from "../cache/CacheService";
import { IItem } from "../database/models/interfaces/IItem";

export class ItemService {
  constructor(
    private itemRepository: IItemRepository,
    private cacheService: CacheService
  ) {}

  async getAll(options: any = {}): Promise<IItem[]> {
    const cacheKey = `all:${JSON.stringify(options)}`;

    // Vérifier le cache d'abord
    let items = await this.cacheService.getItemsList(cacheKey);

    if (!items) {
      // Si pas en cache, récupérer de la base
      items = await this.itemRepository.findAll(options);

      // Mettre en cache
      await this.cacheService.setItemsList(cacheKey, items);
    }

    return items;
  }

  async getById(id: string): Promise<IItem | null> {
    // Vérifier le cache d'abord
    let item = await this.cacheService.getItem(id);

    if (!item) {
      // Si pas en cache, récupérer de la base
      item = await this.itemRepository.findById(id);

      if (item) {
        // Mettre en cache
        await this.cacheService.setItem(id, item);
      }
    }

    return item;
  }

  async create(itemData: Omit<IItem, "id">): Promise<IItem> {
    const item = await this.itemRepository.create(itemData);

    // Mettre en cache le nouvel item
    await this.cacheService.setItem(item.id!, item);

    // Invalider les caches de listes
    await this.cacheService.invalidateListsCache();

    return item;
  }

  async update(id: string, itemData: Partial<IItem>): Promise<IItem | null> {
    const item = await this.itemRepository.update(id, itemData);

    if (item) {
      // Mettre à jour le cache
      await this.cacheService.setItem(id, item);

      // Invalider les caches de listes
      await this.cacheService.invalidateListsCache();
    }

    return item;
  }

  async delete(id: string): Promise<boolean> {
    const deleted = await this.itemRepository.delete(id);

    if (deleted) {
      // Invalider le cache de cet item
      await this.cacheService.invalidateItem(id);
    }

    return deleted;
  }

  async searchItems(query: string): Promise<IItem[]> {
    const cacheKey = `search:${query}`;

    let items = await this.cacheService.getItemsList(cacheKey);

    if (!items) {
      items = await this.itemRepository.search(query);
      await this.cacheService.setItemsList(cacheKey, items, 60); // Cache court pour recherche
    }

    return items;
  }
}
```

## 📊 Migrations et Seeders

### Script de Migration PostgreSQL

```sql
-- migrations/001_init_schema.sql
CREATE TYPE category_enum AS ENUM ('electronique', 'vetement', 'livre', 'autre');

CREATE TABLE IF NOT EXISTS items (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description VARCHAR(500),
    price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
    category category_enum NOT NULL,
    tags TEXT[],
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index pour les performances
CREATE INDEX idx_items_category_active ON items(category, is_active);
CREATE INDEX idx_items_price ON items(price);
CREATE INDEX idx_items_name_search ON items USING gin(to_tsvector('french', name));

-- Trigger pour updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_items_updated_at
    BEFORE UPDATE ON items
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
```

### Seeder pour Données de Test

```typescript
// src/database/seeders/items.ts
import { IItem } from "../models/interfaces/IItem";

export const itemsSeeds: Omit<IItem, "id">[] = [
  {
    name: "Smartphone Galaxy S23",
    description: "Smartphone Android haute performance avec écran AMOLED",
    price: 899.99,
    category: "electronique",
    tags: ["samsung", "android", "smartphone"],
    isActive: true,
  },
  {
    name: "MacBook Pro M2",
    description: "Ordinateur portable professionnel Apple avec puce M2",
    price: 2499.99,
    category: "electronique",
    tags: ["apple", "laptop", "m2"],
    isActive: true,
  },
  {
    name: "T-shirt Bio Coton",
    description: "T-shirt en coton biologique, coupe regular",
    price: 29.99,
    category: "vetement",
    tags: ["coton", "bio", "casual"],
    isActive: true,
  },
  {
    name: "Clean Code",
    description: "Guide des bonnes pratiques de développement logiciel",
    price: 45.5,
    category: "livre",
    tags: ["programmation", "clean-code", "robert-martin"],
    isActive: true,
  },
  {
    name: "Casque Audio Premium",
    description: "Casque sans fil avec réduction de bruit active",
    price: 299.99,
    category: "electronique",
    tags: ["audio", "wireless", "noise-cancelling"],
    isActive: true,
  },
];

export async function seedItems(repository: any): Promise<void> {
  console.log("🌱 Début du seeding des items...");

  for (const itemData of itemsSeeds) {
    try {
      await repository.create(itemData);
      console.log(`✅ Item créé: ${itemData.name}`);
    } catch (error) {
      console.error(`❌ Erreur création item ${itemData.name}:`, error);
    }
  }

  console.log("🌱 Seeding terminé");
}
```

## 🧪 Tests d'Intégration Base de Données

### Tests MongoDB

```typescript
// tests/integration/mongodb.test.ts
import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import { MongoItemRepository } from "../src/database/repositories/MongoItemRepository";

describe("MongoDB Integration Tests", () => {
  let mongoServer: MongoMemoryServer;
  let repository: MongoItemRepository;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);
    repository = new MongoItemRepository();
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  beforeEach(async () => {
    await mongoose.connection.db.dropDatabase();
  });

  test("should create and retrieve item", async () => {
    const itemData = {
      name: "Test Item",
      description: "Test description",
      price: 99.99,
      category: "electronique" as const,
      tags: ["test"],
      isActive: true,
    };

    const created = await repository.create(itemData);
    expect(created.id).toBeDefined();
    expect(created.name).toBe(itemData.name);

    const retrieved = await repository.findById(created.id!);
    expect(retrieved).not.toBeNull();
    expect(retrieved!.name).toBe(itemData.name);
  });

  test("should search items by text", async () => {
    await repository.create({
      name: "Smartphone Samsung",
      description: "Latest Android phone",
      price: 599,
      category: "electronique",
      tags: ["samsung"],
      isActive: true,
    });

    const results = await repository.search("Samsung");
    expect(results).toHaveLength(1);
    expect(results[0].name).toContain("Samsung");
  });
});
```

## 🚀 Commandes Utiles

### Scripts Package.json

```json
{
  "scripts": {
    "db:mongo:start": "docker run -d -p 27017:27017 --name mongo-tp mongo:6.0",
    "db:postgres:start": "docker run -d -p 5432:5432 -e POSTGRES_DB=api_tp -e POSTGRES_PASSWORD=password --name postgres-tp postgres:15",
    "db:redis:start": "docker run -d -p 6379:6379 --name redis-tp redis:7-alpine",
    "db:migrate": "prisma migrate dev",
    "db:seed": "tsx src/database/seeders/run.ts",
    "db:reset": "prisma migrate reset && npm run db:seed",
    "test:db": "npm run test:integration",
    "test:integration": "NODE_ENV=test jest tests/integration",
    "cache:clear": "tsx scripts/clear-cache.ts"
  }
}
```

### Variables d'Environnement

```bash
# .env.example
# MongoDB
MONGODB_URI=mongodb://localhost:27017/api_tp

# PostgreSQL
DATABASE_URL=postgresql://postgres:password@localhost:5432/api_tp

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# Configuration
DB_TYPE=mongodb # mongodb | postgres
CACHE_ENABLED=true
CACHE_TTL=300
```

## 📈 Monitoring et Performance

### Métriques de Performance

```typescript
// src/monitoring/DatabaseMetrics.ts
export class DatabaseMetrics {
  private static queryTimes: Map<string, number[]> = new Map();

  static recordQueryTime(operation: string, time: number): void {
    if (!this.queryTimes.has(operation)) {
      this.queryTimes.set(operation, []);
    }
    this.queryTimes.get(operation)!.push(time);
  }

  static getAverageQueryTime(operation: string): number {
    const times = this.queryTimes.get(operation) || [];
    return times.reduce((sum, time) => sum + time, 0) / times.length;
  }

  static getSlowQueries(
    threshold: number = 1000
  ): Array<{ operation: string; avgTime: number }> {
    const slow: Array<{ operation: string; avgTime: number }> = [];

    for (const [operation] of this.queryTimes) {
      const avgTime = this.getAverageQueryTime(operation);
      if (avgTime > threshold) {
        slow.push({ operation, avgTime });
      }
    }

    return slow.sort((a, b) => b.avgTime - a.avgTime);
  }
}
```

## 🎯 Objectifs de Validation

### ✅ Niveau Bronze (Configuration de Base)

- [ ] Connexion MongoDB/PostgreSQL fonctionnelle
- [ ] Modèles de données créés et validés
- [ ] CRUD basique opérationnel
- [ ] Tests d'intégration passants

### ✅ Niveau Silver (Intégration Avancée)

- [ ] Repository pattern implémenté
- [ ] Cache Redis intégré et fonctionnel
- [ ] Migrations et seeders opérationnels
- [ ] Performance monitoring en place

### ✅ Niveau Gold (Production Ready)

- [ ] Optimisations de performance appliquées
- [ ] Stratégie de backup configurée
- [ ] Monitoring complet en place
- [ ] Documentation technique complète

## 📚 Ressources Complémentaires

### Documentation

- [Mongoose Documentation](https://mongoosejs.com/)
- [Prisma Documentation](https://prisma.io/docs)
- [Redis Documentation](https://redis.io/documentation)

### Bonnes Pratiques

- [MongoDB Performance Best Practices](https://docs.mongodb.com/manual/administration/analyzing-mongodb-performance/)
- [PostgreSQL Performance Tuning](https://wiki.postgresql.org/wiki/Performance_Optimization)
- [Redis Best Practices](https://redis.io/docs/manual/clients-guide/)

---

🎯 **Objectif :** Maîtriser l'intégration complète des bases de données dans une API REST moderne, avec cache, optimisations et monitoring de performance.

➡️ **Prochaine étape :** [TP Niveau 7 - API Avancée](./README_TP_07.md)
