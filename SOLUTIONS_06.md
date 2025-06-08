# 💡 TP Niveau 6 - Base de données : Solutions Détaillées

## 🎯 Guide des Solutions
Ce document contient les solutions complètes et explications détaillées pour tous les exercices du TP-06 Base de données.

---

## 🥉 **SOLUTIONS NIVEAU BRONZE**

### Solution 1 : Setup MongoDB avec Mongoose

#### Configuration MongoDB
```typescript
// src/database/config/mongodb.ts
import mongoose from 'mongoose';

export class MongoDBConfig {
  private static instance: MongoDBConfig;
  private isConnected: boolean = false;
  
  private constructor() {}
  
  static getInstance(): MongoDBConfig {
    if (!MongoDBConfig.instance) {
      MongoDBConfig.instance = new MongoDBConfig();
    }
    return MongoDBConfig.instance;
  }
  
  async connect(): Promise<void> {
    if (this.isConnected) {
      console.log('📦 MongoDB déjà connecté');
      return;
    }
    
    try {
      const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/api_tp';
      
      await mongoose.connect(mongoUri, {
        // Options de connexion optimisées
        maxPoolSize: 10,          // Limite du pool de connexions
        minPoolSize: 2,           // Minimum de connexions
        maxIdleTimeMS: 30000,     // Fermer après 30s d'inactivité
        serverSelectionTimeoutMS: 5000, // Timeout sélection serveur
        socketTimeoutMS: 45000,   // Timeout socket
        family: 4                 // Utiliser IPv4
      });
      
      this.isConnected = true;
      console.log('✅ MongoDB connecté avec succès');
      
      // Gestion des événements de connexion
      mongoose.connection.on('disconnected', () => {
        console.log('⚠️ MongoDB déconnecté');
        this.isConnected = false;
      });
      
      mongoose.connection.on('error', (error) => {
        console.error('❌ Erreur MongoDB:', error);
      });
      
      mongoose.connection.on('reconnected', () => {
        console.log('🔄 MongoDB reconnecté');
        this.isConnected = true;
      });
      
    } catch (error) {
      console.error('❌ Erreur connexion MongoDB:', error);
      throw error;
    }
  }
  
  async disconnect(): Promise<void> {
    if (this.isConnected) {
      await mongoose.disconnect();
      this.isConnected = false;
      console.log('🔌 MongoDB déconnecté');
    }
  }
  
  getConnectionState(): string {
    const states = {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting'
    };
    return states[mongoose.connection.readyState as keyof typeof states] || 'unknown';
  }
}
```

#### Interface IItem
```typescript
// src/database/models/interfaces/IItem.ts
export interface IItem {
  id?: string;
  name: string;
  description?: string;
  price: number;
  category: 'electronique' | 'vetement' | 'livre' | 'autre';
  tags: string[];
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IItemFilters {
  category?: string;
  priceMin?: number;
  priceMax?: number;
  isActive?: boolean;
  tags?: string[];
  search?: string;
}
```

#### Modèle Mongoose avec validation avancée
```typescript
// src/database/models/mongodb/Item.ts
import { Schema, model, Document } from 'mongoose';
import { IItem } from '../interfaces/IItem';

export interface IItemDocument extends IItem, Document {
  createdAt: Date;
  updatedAt: Date;
}

const ItemSchema = new Schema<IItemDocument>({
  name: {
    type: String,
    required: [true, 'Le nom est obligatoire'],
    trim: true,
    maxlength: [100, 'Le nom ne peut dépasser 100 caractères'],
    minlength: [2, 'Le nom doit contenir au moins 2 caractères']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'La description ne peut dépasser 500 caractères']
  },
  price: {
    type: Number,
    required: [true, 'Le prix est obligatoire'],
    min: [0, 'Le prix doit être positif'],
    max: [999999.99, 'Le prix ne peut dépasser 999 999.99'],
    validate: {
      validator: function(value: number) {
        // Validation pour 2 décimales maximum
        return Math.round(value * 100) === value * 100;
      },
      message: 'Le prix ne peut avoir plus de 2 décimales'
    }
  },
  category: {
    type: String,
    required: [true, 'La catégorie est obligatoire'],
    enum: {
      values: ['electronique', 'vetement', 'livre', 'autre'],
      message: '{VALUE} n\'est pas une catégorie valide'
    },
    lowercase: true
  },
  tags: [{
    type: String,
    trim: true,
    maxlength: [50, 'Un tag ne peut dépasser 50 caractères']
  }],
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,  // Ajoute createdAt et updatedAt automatiquement
  versionKey: false, // Supprime le champ __v
  toJSON: {
    transform: function(doc, ret) {
      ret.id = ret._id;
      delete ret._id;
      return ret;
    }
  }
});

// Index pour les performances et recherche
ItemSchema.index({ 
  name: 'text', 
  description: 'text' 
}, {
  weights: { name: 10, description: 5 },  // Priorité au nom
  name: 'search_index'
});

ItemSchema.index({ category: 1, isActive: 1 }, { name: 'category_active_index' });
ItemSchema.index({ price: 1 }, { name: 'price_index' });
ItemSchema.index({ tags: 1 }, { name: 'tags_index' });
ItemSchema.index({ createdAt: -1 }, { name: 'created_at_index' });

// Middleware pre-save pour validation supplémentaire
ItemSchema.pre('save', function(next) {
  // Nettoyer les tags
  if (this.tags) {
    this.tags = this.tags
      .filter(tag => tag && tag.trim().length > 0)
      .map(tag => tag.trim().toLowerCase())
      .filter((tag, index, arr) => arr.indexOf(tag) === index); // Supprimer doublons
  }
  
  // Valider la cohérence prix/catégorie (exemple business logic)
  if (this.category === 'livre' && this.price > 200) {
    return next(new Error('Un livre ne peut coûter plus de 200€'));
  }
  
  next();
});

// Méthodes d'instance
ItemSchema.methods.toSafeObject = function() {
  const obj = this.toObject();
  // Supprimer des champs sensibles si nécessaire
  return obj;
};

// Méthodes statiques
ItemSchema.statics.findByPriceRange = function(min: number, max: number) {
  return this.find({
    price: { $gte: min, $lte: max },
    isActive: true
  });
};

ItemSchema.statics.getCategories = function() {
  return this.distinct('category');
};

export const ItemModel = model<IItemDocument>('Item', ItemSchema);
```

#### Tests d'intégration MongoDB
```typescript
// tests/integration/mongodb.test.ts
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import { ItemModel } from '../../src/database/models/mongodb/Item';

describe('MongoDB Integration Tests', () => {
  let mongoServer: MongoMemoryServer;
  
  beforeAll(async () => {
    // Créer une instance MongoDB en mémoire pour les tests
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);
  });
  
  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });
  
  beforeEach(async () => {
    // Nettoyer la base avant chaque test
    await ItemModel.deleteMany({});
  });
  
  describe('Item Model Validation', () => {
    test('should create valid item', async () => {
      const itemData = {
        name: 'Smartphone Test',
        description: 'Un excellent smartphone pour les tests',
        price: 599.99,
        category: 'electronique',
        tags: ['test', 'smartphone'],
        isActive: true
      };
      
      const item = new ItemModel(itemData);
      const savedItem = await item.save();
      
      expect(savedItem._id).toBeDefined();
      expect(savedItem.name).toBe(itemData.name);
      expect(savedItem.price).toBe(itemData.price);
      expect(savedItem.createdAt).toBeDefined();
      expect(savedItem.updatedAt).toBeDefined();
    });
    
    test('should validate required fields', async () => {
      const item = new ItemModel({});
      
      try {
        await item.save();
        fail('Should have thrown validation error');
      } catch (error: any) {
        expect(error.errors.name).toBeDefined();
        expect(error.errors.price).toBeDefined();
        expect(error.errors.category).toBeDefined();
      }
    });
    
    test('should validate price constraints', async () => {
      const item = new ItemModel({
        name: 'Test Item',
        price: -10, // Prix négatif
        category: 'autre'
      });
      
      try {
        await item.save();
        fail('Should have thrown validation error');
      } catch (error: any) {
        expect(error.errors.price.message).toContain('positif');
      }
    });
    
    test('should validate category enum', async () => {
      const item = new ItemModel({
        name: 'Test Item',
        price: 100,
        category: 'invalid_category'
      });
      
      try {
        await item.save();
        fail('Should have thrown validation error');
      } catch (error: any) {
        expect(error.errors.category).toBeDefined();
      }
    });
    
    test('should clean and deduplicate tags', async () => {
      const item = new ItemModel({
        name: 'Test Item',
        price: 100,
        category: 'autre',
        tags: ['  Tag1  ', 'tag2', 'TAG1', '', 'tag2'] // Avec espaces et doublons
      });
      
      const saved = await item.save();
      expect(saved.tags).toEqual(['tag1', 'tag2']); // Nettoyé et dédupliqué
    });
  });
  
  describe('Indexes and Search', () => {
    beforeEach(async () => {
      // Créer des données de test
      await ItemModel.create([
        {
          name: 'iPhone 14',
          description: 'Smartphone Apple dernière génération',
          price: 999,
          category: 'electronique',
          tags: ['apple', 'smartphone']
        },
        {
          name: 'Samsung Galaxy S23',
          description: 'Smartphone Android performant',
          price: 899,
          category: 'electronique',
          tags: ['samsung', 'android']
        },
        {
          name: 'Clean Code',
          description: 'Livre sur les bonnes pratiques de programmation',
          price: 45,
          category: 'livre',
          tags: ['programmation', 'martin']
        }
      ]);
    });
    
    test('should search by text', async () => {
      const results = await ItemModel.find({ $text: { $search: 'smartphone' } });
      expect(results).toHaveLength(2);
    });
    
    test('should filter by category and active status', async () => {
      const results = await ItemModel.find({ 
        category: 'electronique', 
        isActive: true 
      });
      expect(results).toHaveLength(2);
    });
    
    test('should find by price range using static method', async () => {
      const results = await ItemModel.findByPriceRange(800, 1000);
      expect(results).toHaveLength(2); // iPhone et Samsung
    });
    
    test('should get distinct categories', async () => {
      const categories = await ItemModel.getCategories();
      expect(categories).toContain('electronique');
      expect(categories).toContain('livre');
    });
  });
});
```

#### Explication détaillée des solutions

**1. Pattern Singleton pour la connexion**
- Assure une seule instance de connexion MongoDB
- Gère la reconnexion automatique
- Monitoring des états de connexion

**2. Schéma Mongoose optimisé**
- Validation métier au niveau du modèle
- Index composés pour les requêtes fréquentes
- Middleware pour la logique pré-sauvegarde
- Transformation JSON automatique

**3. Gestion des erreurs robuste**
- Messages d'erreur localisés en français
- Validation business logic dans le middleware
- Gestion des timeouts et reconnexions

**4. Tests complets**
- MongoDB en mémoire pour isolation
- Tests de validation, index et recherche
- Couverture des cas d'erreur

---

### Solution 2 : Setup PostgreSQL avec Prisma

#### Configuration .env
```bash
# .env
DATABASE_URL="postgresql://postgres:password@localhost:5432/api_tp?schema=public"
MONGODB_URI="mongodb://localhost:27017/api_tp"
DB_TYPE="postgres" # ou "mongodb"
```

#### Schéma Prisma complet
```prisma
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
  binaryTargets = ["native", "debian-openssl-1.1.x"]
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
  isActive    Boolean  @default(true) @map("is_active")
  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @updatedAt @map("updated_at")

  // Index pour optimiser les requêtes fréquentes
  @@index([category, isActive], name: "idx_category_active")
  @@index([price], name: "idx_price")
  @@index([createdAt], name: "idx_created_at")
  @@map("items")
}

enum Category {
  electronique
  vetement
  livre
  autre
}

// Modèle pour tracking des migrations
model Migration {
  id        Int      @id @default(autoincrement())
  name      String   @unique
  executed  DateTime @default(now())
  
  @@map("migrations")
}
```

#### Configuration PostgreSQL
```typescript
// src/database/config/postgres.ts
import { PrismaClient } from '@prisma/client';

export class PostgreSQLConfig {
  private static instance: PostgreSQLConfig;
  private prisma: PrismaClient;
  private isConnected: boolean = false;
  
  private constructor() {
    this.prisma = new PrismaClient({
      log: [
        { level: 'query', emit: 'event' },
        { level: 'error', emit: 'stdout' },
        { level: 'info', emit: 'stdout' },
        { level: 'warn', emit: 'stdout' },
      ],
      datasources: {
        db: {
          url: process.env.DATABASE_URL
        }
      },
      errorFormat: 'pretty'
    });
    
    // Logging des requêtes lentes
    this.prisma.$on('query', (e) => {
      if (e.duration > 1000) { // Plus de 1 seconde
        console.warn(`🐌 Requête lente détectée (${e.duration}ms):`, e.query);
      }
    });
    
    // Gestion des erreurs
    this.prisma.$on('error', (e) => {
      console.error('❌ Erreur Prisma:', e);
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
    if (this.isConnected) {
      console.log('📦 PostgreSQL déjà connecté');
      return;
    }
    
    try {
      // Test de connexion
      await this.prisma.$connect();
      
      // Vérifier que la base est accessible
      await this.prisma.$queryRaw`SELECT 1`;
      
      this.isConnected = true;
      console.log('✅ PostgreSQL connecté avec succès');
      
    } catch (error) {
      console.error('❌ Erreur connexion PostgreSQL:', error);
      throw error;
    }
  }
  
  async disconnect(): Promise<void> {
    if (this.isConnected) {
      await this.prisma.$disconnect();
      this.isConnected = false;
      console.log('🔌 PostgreSQL déconnecté');
    }
  }
  
  async getConnectionInfo(): Promise<any> {
    const result = await this.prisma.$queryRaw`
      SELECT 
        current_database() as database,
        current_user as user,
        version() as version,
        pg_size_pretty(pg_database_size(current_database())) as size
    `;
    return result;
  }
  
  async getTableStats(): Promise<any> {
    const result = await this.prisma.$queryRaw`
      SELECT 
        schemaname,
        tablename,
        attname,
        n_distinct,
        correlation
      FROM pg_stats 
      WHERE tablename = 'items'
      ORDER BY tablename, attname
    `;
    return result;
  }
}
```

#### Migration initiale avec SQL brut
```sql
-- prisma/migrations/001_init/migration.sql
-- CreateEnum
CREATE TYPE "Category" AS ENUM ('electronique', 'vetement', 'livre', 'autre');

-- CreateTable
CREATE TABLE "items" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "description" VARCHAR(500),
    "price" DECIMAL(10,2) NOT NULL,
    "category" "Category" NOT NULL,
    "tags" TEXT[],
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "items_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_category_active" ON "items"("category", "is_active");

-- CreateIndex
CREATE INDEX "idx_price" ON "items"("price");

-- CreateIndex
CREATE INDEX "idx_created_at" ON "items"("created_at");

-- Trigger pour updated_at automatique
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

-- Index pour recherche full-text (à ajouter plus tard)
CREATE INDEX items_search_idx ON items 
USING gin(to_tsvector('french', name || ' ' || COALESCE(description, '')));

-- Contraintes supplémentaires
ALTER TABLE items ADD CONSTRAINT check_price_positive CHECK (price >= 0);
ALTER TABLE items ADD CONSTRAINT check_name_length CHECK (length(name) >= 2);
```

#### Scripts d'initialisation
```typescript
// scripts/init-database.ts
import { PostgreSQLConfig } from '../src/database/config/postgres';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

async function initDatabase() {
  console.log('🚀 Initialisation de la base de données...');
  
  try {
    // 1. Générer le client Prisma
    console.log('📦 Génération du client Prisma...');
    await execAsync('npx prisma generate');
    
    // 2. Appliquer les migrations
    console.log('🔄 Application des migrations...');
    await execAsync('npx prisma migrate deploy');
    
    // 3. Tester la connexion
    console.log('🔍 Test de connexion...');
    const config = PostgreSQLConfig.getInstance();
    await config.connect();
    
    const info = await config.getConnectionInfo();
    console.log('📊 Informations de connexion:', info);
    
    await config.disconnect();
    
    console.log('✅ Base de données initialisée avec succès');
    
  } catch (error) {
    console.error('❌ Erreur lors de l\'initialisation:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  initDatabase();
}
```

#### Tests Prisma
```typescript
// tests/integration/postgres.test.ts
import { PostgreSQLConfig } from '../../src/database/config/postgres';
import { PrismaClient } from '@prisma/client';

describe('PostgreSQL Integration Tests', () => {
  let config: PostgreSQLConfig;
  let prisma: PrismaClient;
  
  beforeAll(async () => {
    config = PostgreSQLConfig.getInstance();
    await config.connect();
    prisma = config.getPrisma();
  });
  
  afterAll(async () => {
    await config.disconnect();
  });
  
  beforeEach(async () => {
    // Nettoyer les données de test
    await prisma.item.deleteMany();
  });
  
  describe('Connection and Setup', () => {
    test('should connect to PostgreSQL', async () => {
      const result = await prisma.$queryRaw`SELECT 1 as connected`;
      expect(result).toBeDefined();
    });
    
    test('should get connection info', async () => {
      const info = await config.getConnectionInfo();
      expect(info).toBeDefined();
      expect(info[0].database).toBe('api_tp');
    });
  });
  
  describe('CRUD Operations', () => {
    test('should create item', async () => {
      const itemData = {
        name: 'Test PostgreSQL Item',
        description: 'Item de test pour PostgreSQL',
        price: new Decimal(299.99),
        category: 'electronique' as const,
        tags: ['test', 'postgres']
      };
      
      const created = await prisma.item.create({
        data: itemData
      });
      
      expect(created.id).toBeDefined();
      expect(created.name).toBe(itemData.name);
      expect(created.price.toNumber()).toBe(299.99);
    });
    
    test('should update item', async () => {
      const item = await prisma.item.create({
        data: {
          name: 'Original Name',
          price: new Decimal(100),
          category: 'autre'
        }
      });
      
      const updated = await prisma.item.update({
        where: { id: item.id },
        data: { name: 'Updated Name' }
      });
      
      expect(updated.name).toBe('Updated Name');
      expect(updated.updatedAt.getTime()).toBeGreaterThan(item.updatedAt.getTime());
    });
    
    test('should filter by category', async () => {
      await prisma.item.createMany({
        data: [
          { name: 'Book', price: new Decimal(20), category: 'livre' },
          { name: 'Phone', price: new Decimal(500), category: 'electronique' },
          { name: 'Shirt', price: new Decimal(30), category: 'vetement' }
        ]
      });
      
      const books = await prisma.item.findMany({
        where: { category: 'livre' }
      });
      
      expect(books).toHaveLength(1);
      expect(books[0].name).toBe('Book');
    });
  });
  
  describe('Advanced Queries', () => {
    beforeEach(async () => {
      await prisma.item.createMany({
        data: [
          { name: 'Expensive Phone', price: new Decimal(1000), category: 'electronique' },
          { name: 'Cheap Phone', price: new Decimal(200), category: 'electronique' },
          { name: 'Book', price: new Decimal(25), category: 'livre' }
        ]
      });
    });
    
    test('should filter by price range', async () => {
      const items = await prisma.item.findMany({
        where: {
          price: {
            gte: new Decimal(100),
            lte: new Decimal(500)
          }
        }
      });
      
      expect(items).toHaveLength(1);
      expect(items[0].name).toBe('Cheap Phone');
    });
    
    test('should use full-text search', async () => {
      const items = await prisma.$queryRaw`
        SELECT * FROM items 
        WHERE to_tsvector('french', name || ' ' || COALESCE(description, '')) 
        @@ plainto_tsquery('french', 'phone')
      `;
      
      expect(items).toHaveLength(2);
    });
    
    test('should aggregate by category', async () => {
      const stats = await prisma.item.groupBy({
        by: ['category'],
        _count: { id: true },
        _avg: { price: true },
        _min: { price: true },
        _max: { price: true }
      });
      
      const electroniqueStats = stats.find(s => s.category === 'electronique');
      expect(electroniqueStats?._count.id).toBe(2);
      expect(electroniqueStats?._avg.price?.toNumber()).toBe(600);
    });
  });
});
```

#### Explication des solutions PostgreSQL

**1. Configuration Prisma optimisée**
- Logging des requêtes lentes pour monitoring
- Configuration des timeouts et pools
- Gestion des erreurs avec contexte

**2. Schéma avec contraintes métier**
- Contraintes de validation au niveau base
- Index composés pour requêtes fréquentes
- Triggers pour automatisation

**3. Tests d'intégration robustes**
- Tests de connexion et configuration
- CRUD complet avec validation
- Requêtes avancées (full-text, agrégation)

---

### Solution 3 : Repository Pattern avec Factory

#### Interface Repository complète
```typescript
// src/database/repositories/IItemRepository.ts
import { IItem, IItemFilters } from '../models/interfaces/IItem';

export interface FindAllOptions {
  limit?: number;
  offset?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  filters?: IItemFilters;
}

export interface IItemRepository {
  // CRUD de base
  findAll(options?: FindAllOptions): Promise<IItem[]>;
  findById(id: string): Promise<IItem | null>;
  create(item: Omit<IItem, 'id'>): Promise<IItem>;
  update(id: string, item: Partial<IItem>): Promise<IItem | null>;
  delete(id: string): Promise<boolean>;
  
  // Requêtes spécialisées
  findByCategory(category: string, options?: FindAllOptions): Promise<IItem[]>;
  search(query: string, options?: FindAllOptions): Promise<IItem[]>;
  findByPriceRange(min: number, max: number, options?: FindAllOptions): Promise<IItem[]>;
  findByTags(tags: string[], options?: FindAllOptions): Promise<IItem[]>;
  
  // Agrégations et statistiques
  count(filters?: IItemFilters): Promise<number>;
  getCategories(): Promise<string[]>;
  getCategoryStats(): Promise<Array<{category: string, count: number, avgPrice: number}>>;
  
  // Opérations en lot
  createMany(items: Omit<IItem, 'id'>[]): Promise<IItem[]>;
  updateMany(filter: IItemFilters, update: Partial<IItem>): Promise<number>;
  deleteMany(filter: IItemFilters): Promise<number>;
}
```

#### Implémentation MongoDB Repository
```typescript
// src/database/repositories/MongoItemRepository.ts
import { IItemRepository, FindAllOptions } from './IItemRepository';
import { ItemModel } from '../models/mongodb/Item';
import { IItem, IItemFilters } from '../models/interfaces/IItem';
import { FilterQuery, SortOrder } from 'mongoose';

export class MongoItemRepository implements IItemRepository {
  
  async findAll(options: FindAllOptions = {}): Promise<IItem[]> {
    const {
      limit = 20,
      offset = 0,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      filters = {}
    } = options;
    
    const mongoFilter = this.buildMongoFilter(filters);
    const sortObj: { [key: string]: SortOrder } = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };
    
    const items = await ItemModel
      .find(mongoFilter)
      .sort(sortObj)
      .skip(offset)
      .limit(limit)
      .lean()
      .exec();
      
    return items.map(this.transformMongoItem);
  }
  
  async findById(id: string): Promise<IItem | null> {
    try {
      const item = await ItemModel.findById(id).lean().exec();
      return item ? this.transformMongoItem(item) : null;
    } catch (error) {
      // Invalid ObjectId
      return null;
    }
  }
  
  async create(itemData: Omit<IItem, 'id'>): Promise<IItem> {
    const item = new ItemModel(itemData);
    const saved = await item.save();
    return this.transformMongoItem(saved.toObject());
  }
  
  async update(id: string, itemData: Partial<IItem>): Promise<IItem | null> {
    try {
      const updated = await ItemModel
        .findByIdAndUpdate(id, itemData, { 
          new: true, 
          runValidators: true 
        })
        .lean()
        .exec();
        
      return updated ? this.transformMongoItem(updated) : null;
    } catch (error) {
      return null;
    }
  }
  
  async delete(id: string): Promise<boolean> {
    try {
      const result = await ItemModel.findByIdAndDelete(id);
      return result !== null;
    } catch (error) {
      return false;
    }
  }
  
  async findByCategory(category: string, options: FindAllOptions = {}): Promise<IItem[]> {
    const filters = { ...options.filters, category };
    return this.findAll({ ...options, filters });
  }
  
  async search(query: string, options: FindAllOptions = {}): Promise<IItem[]> {
    const {
      limit = 20,
      offset = 0,
      sortBy = 'score',
      filters = {}
    } = options;
    
    const mongoFilter = this.buildMongoFilter(filters);
    
    // Recherche full-text avec score
    const items = await ItemModel
      .find(
        { 
          $and: [
            { $text: { $search: query } },
            mongoFilter
          ]
        },
        { score: { $meta: "textScore" } }
      )
      .sort(sortBy === 'score' ? { score: { $meta: "textScore" } } : { [sortBy]: -1 })
      .skip(offset)
      .limit(limit)
      .lean()
      .exec();
      
    return items.map(this.transformMongoItem);
  }
  
  async findByPriceRange(min: number, max: number, options: FindAllOptions = {}): Promise<IItem[]> {
    const filters = { 
      ...options.filters, 
      priceMin: min, 
      priceMax: max 
    };
    return this.findAll({ ...options, filters });
  }
  
  async findByTags(tags: string[], options: FindAllOptions = {}): Promise<IItem[]> {
    const filters = { 
      ...options.filters, 
      tags 
    };
    return this.findAll({ ...options, filters });
  }
  
  async count(filters: IItemFilters = {}): Promise<number> {
    const mongoFilter = this.buildMongoFilter(filters);
    return await ItemModel.countDocuments(mongoFilter);
  }
  
  async getCategories(): Promise<string[]> {
    return await ItemModel.distinct('category');
  }
  
  async getCategoryStats(): Promise<Array<{category: string, count: number, avgPrice: number}>> {
    const stats = await ItemModel.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          avgPrice: { $avg: '$price' },
          minPrice: { $min: '$price' },
          maxPrice: { $max: '$price' }
        }
      },
      {
        $project: {
          category: '$_id',
          count: 1,
          avgPrice: { $round: ['$avgPrice', 2] },
          minPrice: 1,
          maxPrice: 1,
          _id: 0
        }
      },
      { $sort: { count: -1 } }
    ]);
    
    return stats;
  }
  
  async createMany(items: Omit<IItem, 'id'>[]): Promise<IItem[]> {
    const created = await ItemModel.insertMany(items);
    return created.map(item => this.transformMongoItem(item.toObject()));
  }
  
  async updateMany(filter: IItemFilters, update: Partial<IItem>): Promise<number> {
    const mongoFilter = this.buildMongoFilter(filter);
    const result = await ItemModel.updateMany(mongoFilter, update);
    return result.modifiedCount;
  }
  
  async deleteMany(filter: IItemFilters): Promise<number> {
    const mongoFilter = this.buildMongoFilter(filter);
    const result = await ItemModel.deleteMany(mongoFilter);
    return result.deletedCount;
  }
  
  // Méthodes utilitaires privées
  private buildMongoFilter(filters: IItemFilters): FilterQuery<any> {
    const mongoFilter: FilterQuery<any> = {};
    
    if (filters.category) {
      mongoFilter.category = filters.category;
    }
    
    if (filters.isActive !== undefined) {
      mongoFilter.isActive = filters.isActive;
    }
    
    if (filters.priceMin !== undefined || filters.priceMax !== undefined) {
      mongoFilter.price = {};
      if (filters.priceMin !== undefined) {
        mongoFilter.price.$gte = filters.priceMin;
      }
      if (filters.priceMax !== undefined) {
        mongoFilter.price.$lte = filters.priceMax;
      }
    }
    
    if (filters.tags && filters.tags.length > 0) {
      mongoFilter.tags = { $in: filters.tags };
    }
    
    if (filters.search) {
      mongoFilter.$text = { $search: filters.search };
    }
    
    return mongoFilter;
  }
  
  private transformMongoItem(item: any): IItem {
    return {
      id: item._id.toString(),
      name: item.name,
      description: item.description,
      price: item.price,
      category: item.category,
      tags: item.tags || [],
      isActive: item.isActive,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt
    };
  }
}
```

#### Implémentation PostgreSQL Repository
```typescript
// src/database/repositories/PostgresItemRepository.ts
import { IItemRepository, FindAllOptions } from './IItemRepository';
import { PostgreSQLConfig } from '../config/postgres';
import { IItem, IItemFilters } from '../models/interfaces/IItem';
import { PrismaClient, Prisma } from '@prisma/client';

export class PostgresItemRepository implements IItemRepository {
  private prisma: PrismaClient;
  
  constructor() {
    this.prisma = PostgreSQLConfig.getInstance().getPrisma();
  }
  
  async findAll(options: FindAllOptions = {}): Promise<IItem[]> {
    const {
      limit = 20,
      offset = 0,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      filters = {}
    } = options;
    
    const where = this.buildPrismaFilter(filters);
    const orderBy = { [sortBy]: sortOrder };
    
    const items = await this.prisma.item.findMany({
      where,
      orderBy,
      skip: offset,
      take: limit
    });
    
    return items.map(this.transformPrismaItem);
  }
  
  async findById(id: string): Promise<IItem | null> {
    try {
      const numId = parseInt(id);
      if (isNaN(numId)) return null;
      
      const item = await this.prisma.item.findUnique({
        where: { id: numId }
      });
      
      return item ? this.transformPrismaItem(item) : null;
    } catch (error) {
      return null;
    }
  }
  
  async create(itemData: Omit<IItem, 'id'>): Promise<IItem> {
    const data = {
      name: itemData.name,
      description: itemData.description,
      price: new Prisma.Decimal(itemData.price),
      category: itemData.category as any,
      tags: itemData.tags,
      isActive: itemData.isActive
    };
    
    const created = await this.prisma.item.create({ data });
    return this.transformPrismaItem(created);
  }
  
  async update(id: string, itemData: Partial<IItem>): Promise<IItem | null> {
    try {
      const numId = parseInt(id);
      if (isNaN(numId)) return null;
      
      const data: any = {};
      if (itemData.name !== undefined) data.name = itemData.name;
      if (itemData.description !== undefined) data.description = itemData.description;
      if (itemData.price !== undefined) data.price = new Prisma.Decimal(itemData.price);
      if (itemData.category !== undefined) data.category = itemData.category;
      if (itemData.tags !== undefined) data.tags = itemData.tags;
      if (itemData.isActive !== undefined) data.isActive = itemData.isActive;
      
      const updated = await this.prisma.item.update({
        where: { id: numId },
        data
      });
      
      return this.transformPrismaItem(updated);
    } catch (error) {
      return null;
    }
  }
  
  async delete(id: string): Promise<boolean> {
    try {
      const numId = parseInt(id);
      if (isNaN(numId)) return false;
      
      await this.prisma.item.delete({
        where: { id: numId }
      });
      
      return true;
    } catch (error) {
      return false;
    }
  }
  
  async findByCategory(category: string, options: FindAllOptions = {}): Promise<IItem[]> {
    const filters = { ...options.filters, category };
    return this.findAll({ ...options, filters });
  }
  
  async search(query: string, options: FindAllOptions = {}): Promise<IItem[]> {
    const {
      limit = 20,
      offset = 0,
      filters = {}
    } = options;
    
    // Utiliser la recherche full-text PostgreSQL
    const whereConditions = [];
    
    // Ajouter les filtres normaux
    const standardWhere = this.buildPrismaFilter(filters);
    if (Object.keys(standardWhere).length > 0) {
      whereConditions.push(standardWhere);
    }
    
    // Recherche full-text avec SQL brut
    const items = await this.prisma.$queryRaw`
      SELECT * FROM items 
      WHERE to_tsvector('french', name || ' ' || COALESCE(description, '')) 
      @@ plainto_tsquery('french', ${query})
      ${standardWhere.isActive !== undefined ? Prisma.sql`AND is_active = ${standardWhere.isActive}` : Prisma.empty}
      ${standardWhere.category ? Prisma.sql`AND category = ${standardWhere.category}` : Prisma.empty}
      ORDER BY ts_rank(to_tsvector('french', name || ' ' || COALESCE(description, '')), 
                      plainto_tsquery('french', ${query})) DESC
      LIMIT ${limit} OFFSET ${offset}
    `;
    
    return (items as any[]).map(this.transformPrismaItem);
  }
  
  async findByPriceRange(min: number, max: number, options: FindAllOptions = {}): Promise<IItem[]> {
    const filters = { 
      ...options.filters, 
      priceMin: min, 
      priceMax: max 
    };
    return this.findAll({ ...options, filters });
  }
  
  async findByTags(tags: string[], options: FindAllOptions = {}): Promise<IItem[]> {
    const filters = { 
      ...options.filters, 
      tags 
    };
    return this.findAll({ ...options, filters });
  }
  
  async count(filters: IItemFilters = {}): Promise<number> {
    const where = this.buildPrismaFilter(filters);
    return await this.prisma.item.count({ where });
  }
  
  async getCategories(): Promise<string[]> {
    const result = await this.prisma.item.findMany({
      select: { category: true },
      distinct: ['category']
    });
    
    return result.map(item => item.category);
  }
  
  async getCategoryStats(): Promise<Array<{category: string, count: number, avgPrice: number}>> {
    const stats = await this.prisma.item.groupBy({
      by: ['category'],
      where: { isActive: true },
      _count: { id: true },
      _avg: { price: true },
      _min: { price: true },
      _max: { price: true },
      orderBy: { _count: { id: 'desc' } }
    });
    
    return stats.map(stat => ({
      category: stat.category,
      count: stat._count.id,
      avgPrice: Math.round((stat._avg.price?.toNumber() || 0) * 100) / 100
    }));
  }
  
  async createMany(items: Omit<IItem, 'id'>[]): Promise<IItem[]> {
    const data = items.map(item => ({
      name: item.name,
      description: item.description,
      price: new Prisma.Decimal(item.price),
      category: item.category as any,
      tags: item.tags,
      isActive: item.isActive
    }));
    
    // Prisma ne retourne pas les données créées avec createMany
    // Donc on utilise une transaction avec create multiple
    const created = await this.prisma.$transaction(
      data.map(item => this.prisma.item.create({ data: item }))
    );
    
    return created.map(this.transformPrismaItem);
  }
  
  async updateMany(filter: IItemFilters, update: Partial<IItem>): Promise<number> {
    const where = this.buildPrismaFilter(filter);
    const data: any = {};
    
    if (update.name !== undefined) data.name = update.name;
    if (update.description !== undefined) data.description = update.description;
    if (update.price !== undefined) data.price = new Prisma.Decimal(update.price);
    if (update.category !== undefined) data.category = update.category;
    if (update.tags !== undefined) data.tags = update.tags;
    if (update.isActive !== undefined) data.isActive = update.isActive;
    
    const result = await this.prisma.item.updateMany({
      where,
      data
    });
    
    return result.count;
  }
  
  async deleteMany(filter: IItemFilters): Promise<number> {
    const where = this.buildPrismaFilter(filter);
    const result = await this.prisma.item.deleteMany({ where });
    return result.count;
  }
  
  // Méthodes utilitaires privées
  private buildPrismaFilter(filters: IItemFilters): Prisma.ItemWhereInput {
    const where: Prisma.ItemWhereInput = {};
    
    if (filters.category) {
      where.category = filters.category as any;
    }
    
    if (filters.isActive !== undefined) {
      where.isActive = filters.isActive;
    }
    
    if (filters.priceMin !== undefined || filters.priceMax !== undefined) {
      where.price = {};
      if (filters.priceMin !== undefined) {
        where.price.gte = new Prisma.Decimal(filters.priceMin);
      }
      if (filters.priceMax !== undefined) {
        where.price.lte = new Prisma.Decimal(filters.priceMax);
      }
    }
    
    if (filters.tags && filters.tags.length > 0) {
      where.tags = {
        hasEvery: filters.tags
      };
    }
    
    return where;
  }
  
  private transformPrismaItem(item: any): IItem {
    return {
      id: item.id.toString(),
      name: item.name,
      description: item.description,
      price: item.price.toNumber(),
      category: item.category,
      tags: item.tags || [],
      isActive: item.isActive,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt
    };
  }
}
```

#### Factory Pattern pour Repository
```typescript
// src/database/repositories/RepositoryFactory.ts
import { IItemRepository } from './IItemRepository';
import { MongoItemRepository } from './MongoItemRepository';
import { PostgresItemRepository } from './PostgresItemRepository';

export type DatabaseType = 'mongodb' | 'postgres';

export class RepositoryFactory {
  private static repositories: Map<DatabaseType, IItemRepository> = new Map();
  
  static createItemRepository(dbType?: DatabaseType): IItemRepository {
    const type = dbType || (process.env.DB_TYPE as DatabaseType) || 'mongodb';
    
    // Pattern Singleton par type de base
    if (!this.repositories.has(type)) {
      switch(type) {
        case 'mongodb':
          this.repositories.set(type, new MongoItemRepository());
          break;
        case 'postgres':
          this.repositories.set(type, new PostgresItemRepository());
          break;
        default:
          throw new Error(`Type de base de données non supporté: ${type}`);
      }
    }
    
    return this.repositories.get(type)!;
  }
  
  static clearCache(): void {
    this.repositories.clear();
  }
  
  static getSupportedDatabases(): DatabaseType[] {
    return ['mongodb', 'postgres'];
  }
}
```

#### Tests du Repository Pattern
```typescript
// tests/integration/repository.test.ts
import { RepositoryFactory } from '../../src/database/repositories/RepositoryFactory';
import { IItemRepository } from '../../src/database/repositories/IItemRepository';
import { MongoDBConfig } from '../../src/database/config/mongodb';
import { PostgreSQLConfig } from '../../src/database/config/postgres';

describe('Repository Pattern Tests', () => {
  let mongoRepo: IItemRepository;
  let postgresRepo: IItemRepository;
  
  beforeAll(async () => {
    // Setup des connexions
    await MongoDBConfig.getInstance().connect();
    await PostgreSQLConfig.getInstance().connect();
    
    mongoRepo = RepositoryFactory.createItemRepository('mongodb');
    postgresRepo = RepositoryFactory.createItemRepository('postgres');
  });
  
  afterAll(async () => {
    await MongoDBConfig.getInstance().disconnect();
    await PostgreSQLConfig.getInstance().disconnect();
  });
  
  const testData = {
    name: 'Test Item Repository',
    description: 'Item pour tester le repository pattern',
    price: 99.99,
    category: 'electronique' as const,
    tags: ['test', 'repository'],
    isActive: true
  };
  
  describe('Factory Pattern', () => {
    test('should create MongoDB repository', () => {
      const repo = RepositoryFactory.createItemRepository('mongodb');
      expect(repo).toBeDefined();
      expect(repo.constructor.name).toBe('MongoItemRepository');
    });
    
    test('should create PostgreSQL repository', () => {
      const repo = RepositoryFactory.createItemRepository('postgres');
      expect(repo).toBeDefined();
      expect(repo.constructor.name).toBe('PostgresItemRepository');
    });
    
    test('should return same instance (singleton)', () => {
      const repo1 = RepositoryFactory.createItemRepository('mongodb');
      const repo2 = RepositoryFactory.createItemRepository('mongodb');
      expect(repo1).toBe(repo2);
    });
  });
  
  describe('Cross-Database Compatibility', () => {
    test('should have identical interface behavior', async () => {
      // Test avec les deux repositories
      for (const repo of [mongoRepo, postgresRepo]) {
        const dbName = repo.constructor.name;
        
        // Nettoyer
        await repo.deleteMany({});
        
        // Créer
        const created = await repo.create(testData);
        expect(created.id).toBeDefined();
        expect(created.name).toBe(testData.name);
        
        // Lire
        const found = await repo.findById(created.id!);
        expect(found).not.toBeNull();
        expect(found!.name).toBe(testData.name);
        
        // Mettre à jour
        const updated = await repo.update(created.id!, { name: 'Updated Name' });
        expect(updated).not.toBeNull();
        expect(updated!.name).toBe('Updated Name');
        
        // Supprimer
        const deleted = await repo.delete(created.id!);
        expect(deleted).toBe(true);
        
        // Vérifier suppression
        const notFound = await repo.findById(created.id!);
        expect(notFound).toBeNull();
        
        console.log(`✅ Test CRUD complet réussi pour ${dbName}`);
      }
    });
    
    test('should handle search consistently', async () => {
      const searchTestData = [
        { ...testData, name: 'iPhone 14', tags: ['apple', 'phone'] },
        { ...testData, name: 'Samsung Galaxy', tags: ['samsung', 'android'] },
        { ...testData, name: 'MacBook Pro', category: 'autre' as const }
      ];
      
      for (const repo of [mongoRepo, postgresRepo]) {
        // Nettoyer et préparer
        await repo.deleteMany({});
        await repo.createMany(searchTestData);
        
        // Test recherche par nom
        const phoneResults = await repo.search('phone');
        expect(phoneResults.length).toBeGreaterThan(0);
        
        // Test filtre par catégorie
        const electroniqueItems = await repo.findByCategory('electronique');
        expect(electroniqueItems.length).toBe(2);
        
        // Test statistiques
        const stats = await repo.getCategoryStats();
        expect(stats.length).toBeGreaterThan(0);
        
        console.log(`✅ Test recherche réussi pour ${repo.constructor.name}`);
      }
    });
  });
});
```

#### Explication des solutions Repository Pattern

**1. Interface commune robuste**
- Toutes les opérations CRUD et métier
- Méthodes de recherche et filtrage avancées
- Opérations en lot pour performance

**2. Implémentations spécialisées**
- Optimisations spécifiques à chaque base
- Gestion des types natifs (ObjectId vs Int)
- Utilisation des fonctionnalités avancées

**3. Factory Pattern intelligent**
- Singleton par type pour éviter les reconnexions
- Configuration via variable d'environnement
- Cache des instances pour performance

**4. Tests de compatibilité croisée**
- Interface identique garantie
- Comportement uniforme validé
- Performance mesurée pour chaque base

---

🚀 **Points clés des solutions Bronze :**
- Configuration robuste des deux bases de données
- Repository Pattern avec abstraction complète
- Tests d'intégration comprehensive
- Factory Pattern pour flexibilité

➡️ **Prochaines étapes :** Solutions Silver avec cache Redis et optimisations avancées.
