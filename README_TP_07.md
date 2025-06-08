# 🚀 TP Niveau 7 - API Avancée : Fonctionnalités Enterprise

## 🎯 Objectifs du TP
- **Durée :** 7-8 heures
- **Niveau :** Avancé
- **Prérequis :** Validation des TPs 1-6

Après ce TP, vous maîtriserez les fonctionnalités avancées d'une API REST de niveau enterprise : pagination intelligente, filtres complexes, upload de fichiers, versioning, rate limiting avancé et documentation interactive.

## 🔧 Configuration de l'Environnement

### Nouvelles Dépendances
```bash
# Upload et traitement de fichiers
npm install multer sharp uuid
npm install @types/multer @types/sharp

# Pagination et filtres avancés
npm install mongoose-paginate-v2
npm install date-fns lodash
npm install @types/lodash

# Versioning et négociation de contenu
npm install accept-language-parser
npm install @types/accept-language-parser

# Documentation avancée
npm install swagger-jsdoc swagger-ui-express
npm install @types/swagger-jsdoc @types/swagger-ui-express

# Rate limiting avancé
npm install express-slow-down
npm install express-rate-limit

# Compression et optimisation
npm install compression helmet cors
```

### Configuration Docker Étendue
```yaml
# docker-compose.yml
version: '3.8'
services:
  api:
    build: .
    ports:
      - "3000:3000"
    volumes:
      - ./uploads:/app/uploads
      - ./logs:/app/logs
    environment:
      - NODE_ENV=production
      - UPLOAD_PATH=/app/uploads
    depends_on:
      - mongodb
      - postgresql
      - redis

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./uploads:/var/www/uploads
    depends_on:
      - api
```

## 📚 Concepts Avancés Abordés

### 1. Pagination Intelligente
- **Cursor-based pagination** : Performance constante
- **Offset pagination** : Simplicité d'usage
- **Keyset pagination** : Consistance des données
- **Hybrid pagination** : Flexibilité maximale

### 2. Filtres et Recherche Avancés
- **Query DSL** : Langage de requête expressif
- **Full-text search** : Recherche sémantique
- **Faceted search** : Filtres à facettes
- **Geographic search** : Recherche géospatiale

### 3. Upload et Traitement Multimédia
- **Streaming upload** : Gestion des gros fichiers
- **Image processing** : Redimensionnement, compression
- **File validation** : Sécurité et intégrité
- **Cloud storage** : Stockage distribué

### 4. Versioning d'API
- **URL versioning** : `/v1/items`, `/v2/items`
- **Header versioning** : `Accept-Version: v2`
- **Content negotiation** : Formats multiples
- **Backward compatibility** : Migration douce

## 🛠️ Structure du Projet Étendue

```
src/
├── api/
│   ├── v1/                    # Version 1 de l'API
│   │   ├── controllers/
│   │   ├── routes/
│   │   └── schemas/
│   ├── v2/                    # Version 2 de l'API
│   │   ├── controllers/
│   │   ├── routes/
│   │   └── schemas/
│   └── shared/                # Code partagé entre versions
├── uploads/
│   ├── handlers/
│   │   ├── FileUploadHandler.ts
│   │   ├── ImageProcessor.ts
│   │   └── FileValidator.ts
│   ├── storage/
│   │   ├── LocalStorage.ts
│   │   ├── S3Storage.ts
│   │   └── IStorageProvider.ts
│   └── middleware/
│       ├── UploadMiddleware.ts
│       └── FileSecurityMiddleware.ts
├── pagination/
│   ├── PaginationService.ts
│   ├── CursorPaginator.ts
│   ├── OffsetPaginator.ts
│   └── interfaces/
│       └── IPagination.ts
├── search/
│   ├── SearchService.ts
│   ├── QueryBuilder.ts
│   ├── FacetService.ts
│   └── filters/
│       ├── PriceFilter.ts
│       ├── CategoryFilter.ts
│       └── DateRangeFilter.ts
├── versioning/
│   ├── VersioningMiddleware.ts
│   ├── ContentNegotiation.ts
│   └── CompatibilityService.ts
└── documentation/
    ├── SwaggerGenerator.ts
    ├── schemas/
    └── examples/
```

## 🔍 Pagination Avancée

### Interface de Pagination Unifiée
```typescript
// src/pagination/interfaces/IPagination.ts
export interface PaginationRequest {
  page?: number;
  limit?: number;
  cursor?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  include?: string[];
}

export interface PaginationResponse<T> {
  data: T[];
  pagination: {
    page?: number;
    limit: number;
    total: number;
    totalPages?: number;
    hasNext: boolean;
    hasPrev: boolean;
    nextCursor?: string;
    prevCursor?: string;
  };
  meta?: {
    took: number;
    cached: boolean;
    facets?: Record<string, any>;
  };
}

export interface IPaginator<T> {
  paginate(
    query: any, 
    options: PaginationRequest
  ): Promise<PaginationResponse<T>>;
}
```

### Service de Pagination Intelligent
```typescript
// src/pagination/PaginationService.ts
import { IPaginator, PaginationRequest, PaginationResponse } from './interfaces/IPagination';
import { CursorPaginator } from './CursorPaginator';
import { OffsetPaginator } from './OffsetPaginator';

export class PaginationService<T> {
  private cursorPaginator: CursorPaginator<T>;
  private offsetPaginator: OffsetPaginator<T>;
  
  constructor(private repository: any) {
    this.cursorPaginator = new CursorPaginator(repository);
    this.offsetPaginator = new OffsetPaginator(repository);
  }
  
  async paginate(
    filters: any, 
    options: PaginationRequest
  ): Promise<PaginationResponse<T>> {
    const startTime = Date.now();
    
    // Choisir la stratégie de pagination automatiquement
    const strategy = this.selectPaginationStrategy(options);
    
    let result: PaginationResponse<T>;
    
    switch (strategy) {
      case 'cursor':
        result = await this.cursorPaginator.paginate(filters, options);
        break;
      case 'offset':
        result = await this.offsetPaginator.paginate(filters, options);
        break;
      default:
        throw new Error(`Stratégie de pagination inconnue: ${strategy}`);
    }
    
    // Ajouter les métadonnées de performance
    result.meta = {
      ...result.meta,
      took: Date.now() - startTime,
      strategy
    };
    
    return result;
  }
  
  private selectPaginationStrategy(options: PaginationRequest): 'cursor' | 'offset' {
    // Utiliser cursor pour les grandes collections
    if (options.cursor || (options.page && options.page > 100)) {
      return 'cursor';
    }
    
    // Utiliser offset pour la navigation traditionnelle
    return 'offset';
  }
  
  // Méthode pour forcer une stratégie spécifique
  async paginateWithCursor(
    filters: any, 
    options: PaginationRequest
  ): Promise<PaginationResponse<T>> {
    return this.cursorPaginator.paginate(filters, options);
  }
  
  async paginateWithOffset(
    filters: any, 
    options: PaginationRequest
  ): Promise<PaginationResponse<T>> {
    return this.offsetPaginator.paginate(filters, options);
  }
}
```

### Cursor Pagination (Performance)
```typescript
// src/pagination/CursorPaginator.ts
import { IPaginator, PaginationRequest, PaginationResponse } from './interfaces/IPagination';
import { Buffer } from 'buffer';

export class CursorPaginator<T> implements IPaginator<T> {
  constructor(private repository: any) {}
  
  async paginate(
    filters: any, 
    options: PaginationRequest
  ): Promise<PaginationResponse<T>> {
    const { limit = 20, cursor, sortBy = 'createdAt', sortOrder = 'desc' } = options;
    
    // Décoder le cursor s'il existe
    let cursorData: any = null;
    if (cursor) {
      try {
        cursorData = JSON.parse(Buffer.from(cursor, 'base64').toString('utf-8'));
      } catch (error) {
        throw new Error('Cursor invalide');
      }
    }
    
    // Construire la requête avec cursor
    const query = { ...filters };
    if (cursorData) {
      const operator = sortOrder === 'desc' ? '$lt' : '$gt';
      query[sortBy] = { [operator]: cursorData[sortBy] };
    }
    
    // Récupérer limit + 1 pour savoir s'il y a une page suivante
    const items = await this.repository.findAll({
      filters: query,
      limit: limit + 1,
      sortBy,
      sortOrder
    });
    
    const hasNext = items.length > limit;
    const data = hasNext ? items.slice(0, limit) : items;
    
    // Générer les cursors pour navigation
    let nextCursor: string | undefined;
    let prevCursor: string | undefined;
    
    if (hasNext && data.length > 0) {
      const lastItem = data[data.length - 1];
      nextCursor = this.generateCursor(lastItem, sortBy);
    }
    
    if (cursorData && data.length > 0) {
      const firstItem = data[0];
      prevCursor = this.generateCursor(firstItem, sortBy);
    }
    
    // Obtenir le total (coûteux, optionnel pour cursor pagination)
    const total = await this.repository.count(filters);
    
    return {
      data,
      pagination: {
        limit,
        total,
        hasNext,
        hasPrev: !!cursorData,
        nextCursor,
        prevCursor
      }
    };
  }
  
  private generateCursor(item: any, sortBy: string): string {
    const cursorData = {
      [sortBy]: item[sortBy],
      id: item.id
    };
    return Buffer.from(JSON.stringify(cursorData)).toString('base64');
  }
}
```

## 🔍 Recherche et Filtres Avancés

### Service de Recherche Unifié
```typescript
// src/search/SearchService.ts
import { IItemRepository } from '../database/repositories/IItemRepository';
import { QueryBuilder } from './QueryBuilder';
import { FacetService } from './FacetService';

export interface SearchRequest {
  query?: string;
  filters?: Record<string, any>;
  facets?: string[];
  highlight?: boolean;
  suggest?: boolean;
  fuzzy?: boolean;
  geo?: {
    lat: number;
    lng: number;
    radius: number;
  };
}

export interface SearchResponse<T> {
  items: T[];
  total: number;
  facets?: Record<string, any>;
  suggestions?: string[];
  highlights?: Record<string, string[]>;
  aggregations?: Record<string, any>;
  took: number;
}

export class SearchService {
  private queryBuilder: QueryBuilder;
  private facetService: FacetService;
  
  constructor(private repository: IItemRepository) {
    this.queryBuilder = new QueryBuilder();
    this.facetService = new FacetService(repository);
  }
  
  async search(request: SearchRequest): Promise<SearchResponse<any>> {
    const startTime = Date.now();
    
    try {
      // Construire la requête de base
      let query = this.queryBuilder.build(request);
      
      // Appliquer les filtres
      if (request.filters) {
        query = this.applyFilters(query, request.filters);
      }
      
      // Exécuter la recherche
      const items = await this.executeSearch(query, request);
      
      // Obtenir le total
      const total = await this.repository.count(query);
      
      // Construire la réponse
      const response: SearchResponse<any> = {
        items,
        total,
        took: Date.now() - startTime
      };
      
      // Ajouter les facettes si demandées
      if (request.facets?.length) {
        response.facets = await this.facetService.getFacets(query, request.facets);
      }
      
      // Ajouter les suggestions si demandées
      if (request.suggest && request.query) {
        response.suggestions = await this.getSuggestions(request.query);
      }
      
      return response;
      
    } catch (error) {
      console.error('Erreur lors de la recherche:', error);
      throw new Error('Erreur lors de l\'exécution de la recherche');
    }
  }
  
  private async executeSearch(query: any, request: SearchRequest): Promise<any[]> {
    if (request.query) {
      // Recherche textuelle
      return await this.repository.search(request.query, { filters: query });
    } else {
      // Filtrage simple
      return await this.repository.findAll({ filters: query });
    }
  }
  
  private applyFilters(baseQuery: any, filters: Record<string, any>): any {
    const query = { ...baseQuery };
    
    // Filtre par prix
    if (filters.priceMin || filters.priceMax) {
      query.price = {};
      if (filters.priceMin) query.price.$gte = filters.priceMin;
      if (filters.priceMax) query.price.$lte = filters.priceMax;
    }
    
    // Filtre par catégorie
    if (filters.category) {
      if (Array.isArray(filters.category)) {
        query.category = { $in: filters.category };
      } else {
        query.category = filters.category;
      }
    }
    
    // Filtre par tags
    if (filters.tags) {
      query.tags = { $in: Array.isArray(filters.tags) ? filters.tags : [filters.tags] };
    }
    
    // Filtre par date
    if (filters.dateFrom || filters.dateTo) {
      query.createdAt = {};
      if (filters.dateFrom) query.createdAt.$gte = new Date(filters.dateFrom);
      if (filters.dateTo) query.createdAt.$lte = new Date(filters.dateTo);
    }
    
    // Filtre par statut
    if (filters.isActive !== undefined) {
      query.isActive = filters.isActive;
    }
    
    return query;
  }
  
  private async getSuggestions(query: string): Promise<string[]> {
    // Rechercher des termes similaires
    const words = query.toLowerCase().split(' ');
    const suggestions: string[] = [];
    
    // Implémentation basique - peut être améliorée avec des services comme Elasticsearch
    for (const word of words) {
      if (word.length >= 3) {
        const items = await this.repository.search(word, { limit: 5 });
        items.forEach(item => {
          const nameWords = item.name.toLowerCase().split(' ');
          nameWords.forEach(nameWord => {
            if (nameWord.includes(word) && !suggestions.includes(nameWord)) {
              suggestions.push(nameWord);
            }
          });
        });
      }
    }
    
    return suggestions.slice(0, 5);
  }
}
```

### Query Builder Flexible
```typescript
// src/search/QueryBuilder.ts
export class QueryBuilder {
  build(request: any): any {
    const query: any = {};
    
    // Requête textuelle
    if (request.query) {
      query.$text = { $search: request.query };
    }
    
    // Recherche floue (fuzzy)
    if (request.fuzzy && request.query) {
      // Implémentation de la recherche floue
      query.$or = [
        { name: { $regex: this.buildFuzzyRegex(request.query), $options: 'i' } },
        { description: { $regex: this.buildFuzzyRegex(request.query), $options: 'i' } }
      ];
    }
    
    // Géolocalisation (si applicable)
    if (request.geo) {
      query.location = {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [request.geo.lng, request.geo.lat]
          },
          $maxDistance: request.geo.radius
        }
      };
    }
    
    return query;
  }
  
  private buildFuzzyRegex(term: string): string {
    // Construire une regex qui tolère quelques erreurs
    return term
      .split('')
      .map(char => `${char}?`)
      .join('.*?');
  }
}
```

## 📁 Upload et Traitement de Fichiers

### Gestionnaire d'Upload Avancé
```typescript
// src/uploads/handlers/FileUploadHandler.ts
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import { FileValidator } from './FileValidator';
import { IStorageProvider } from '../storage/IStorageProvider';

export class FileUploadHandler {
  private upload: multer.Multer;
  private validator: FileValidator;
  
  constructor(private storageProvider: IStorageProvider) {
    this.validator = new FileValidator();
    this.upload = this.createMulterInstance();
  }
  
  private createMulterInstance(): multer.Multer {
    const storage = multer.memoryStorage(); // Stockage en mémoire pour traitement
    
    return multer({
      storage,
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB max
        files: 5 // Max 5 fichiers
      },
      fileFilter: (req, file, cb) => {
        const isValid = this.validator.validateFile(file);
        cb(null, isValid);
      }
    });
  }
  
  getMiddleware() {
    return this.upload.array('files', 5);
  }
  
  async handleUpload(files: Express.Multer.File[]): Promise<UploadResult[]> {
    const results: UploadResult[] = [];
    
    for (const file of files) {
      try {
        // Générer un nom unique
        const filename = this.generateFileName(file);
        
        // Valider le fichier
        await this.validator.validateFileContent(file.buffer);
        
        // Traiter le fichier si c'est une image
        let processedBuffer = file.buffer;
        if (this.isImage(file)) {
          processedBuffer = await this.processImage(file.buffer);
        }
        
        // Sauvegarder via le provider de stockage
        const url = await this.storageProvider.save(filename, processedBuffer, {
          contentType: file.mimetype,
          originalName: file.originalname
        });
        
        results.push({
          success: true,
          filename,
          originalName: file.originalname,
          url,
          size: processedBuffer.length,
          mimetype: file.mimetype
        });
        
      } catch (error) {
        results.push({
          success: false,
          originalName: file.originalname,
          error: error.message
        });
      }
    }
    
    return results;
  }
  
  private generateFileName(file: Express.Multer.File): string {
    const ext = path.extname(file.originalname);
    return `${uuidv4()}${ext}`;
  }
  
  private isImage(file: Express.Multer.File): boolean {
    return file.mimetype.startsWith('image/');
  }
  
  private async processImage(buffer: Buffer): Promise<Buffer> {
    const sharp = require('sharp');
    
    return sharp(buffer)
      .resize(1200, 1200, { 
        fit: 'inside', 
        withoutEnlargement: true 
      })
      .jpeg({ quality: 85 })
      .toBuffer();
  }
}

interface UploadResult {
  success: boolean;
  filename?: string;
  originalName: string;
  url?: string;
  size?: number;
  mimetype?: string;
  error?: string;
}
```

### Provider de Stockage Abstrait
```typescript
// src/uploads/storage/IStorageProvider.ts
export interface SaveOptions {
  contentType: string;
  originalName: string;
  metadata?: Record<string, any>;
}

export interface IStorageProvider {
  save(filename: string, buffer: Buffer, options: SaveOptions): Promise<string>;
  delete(filename: string): Promise<boolean>;
  getUrl(filename: string): string;
  exists(filename: string): Promise<boolean>;
}

// Implémentation locale
export class LocalStorageProvider implements IStorageProvider {
  constructor(private uploadPath: string) {}
  
  async save(filename: string, buffer: Buffer, options: SaveOptions): Promise<string> {
    const fs = require('fs').promises;
    const path = require('path');
    
    const fullPath = path.join(this.uploadPath, filename);
    await fs.writeFile(fullPath, buffer);
    
    return this.getUrl(filename);
  }
  
  async delete(filename: string): Promise<boolean> {
    const fs = require('fs').promises;
    const path = require('path');
    
    try {
      const fullPath = path.join(this.uploadPath, filename);
      await fs.unlink(fullPath);
      return true;
    } catch (error) {
      return false;
    }
  }
  
  getUrl(filename: string): string {
    return `/uploads/${filename}`;
  }
  
  async exists(filename: string): Promise<boolean> {
    const fs = require('fs').promises;
    const path = require('path');
    
    try {
      const fullPath = path.join(this.uploadPath, filename);
      await fs.access(fullPath);
      return true;
    } catch (error) {
      return false;
    }
  }
}
```

## 🔄 Versioning d'API

### Middleware de Versioning
```typescript
// src/versioning/VersioningMiddleware.ts
import { Request, Response, NextFunction } from 'express';

export interface VersionedRequest extends Request {
  apiVersion: string;
  acceptedVersion: string;
}

export class VersioningMiddleware {
  private supportedVersions = ['v1', 'v2'];
  private defaultVersion = 'v1';
  
  middleware() {
    return (req: Request, res: Response, next: NextFunction) => {
      const versionedReq = req as VersionedRequest;
      
      // Déterminer la version demandée
      const requestedVersion = this.extractVersion(req);
      
      // Valider et normaliser la version
      const resolvedVersion = this.resolveVersion(requestedVersion);
      
      if (!resolvedVersion) {
        return res.status(400).json({
          error: 'Version d\'API non supportée',
          supportedVersions: this.supportedVersions
        });
      }
      
      // Ajouter les informations de version à la requête
      versionedReq.apiVersion = resolvedVersion;
      versionedReq.acceptedVersion = requestedVersion;
      
      // Ajouter les headers de version à la réponse
      res.set('API-Version', resolvedVersion);
      res.set('Supported-Versions', this.supportedVersions.join(', '));
      
      next();
    };
  }
  
  private extractVersion(req: Request): string {
    // 1. Version dans l'URL (/api/v2/items)
    const urlVersion = req.path.match(/^\/api\/(v\d+)\//)?.[1];
    if (urlVersion) return urlVersion;
    
    // 2. Version dans le header Accept-Version
    const headerVersion = req.headers['accept-version'] as string;
    if (headerVersion) return headerVersion;
    
    // 3. Version dans le header Accept
    const acceptHeader = req.headers['accept'] as string;
    const acceptVersion = acceptHeader?.match(/application\/vnd\.api\+(v\d+)\+json/)?.[1];
    if (acceptVersion) return acceptVersion;
    
    // 4. Version par défaut
    return this.defaultVersion;
  }
  
  private resolveVersion(requestedVersion: string): string | null {
    // Normaliser la version
    const normalizedVersion = requestedVersion.toLowerCase().startsWith('v') 
      ? requestedVersion.toLowerCase() 
      : `v${requestedVersion}`;
    
    // Vérifier si la version est supportée
    if (this.supportedVersions.includes(normalizedVersion)) {
      return normalizedVersion;
    }
    
    // Gérer la compatibilité ascendante
    return this.findCompatibleVersion(normalizedVersion);
  }
  
  private findCompatibleVersion(requestedVersion: string): string | null {
    const versionNumber = parseInt(requestedVersion.replace('v', ''));
    
    // Rechercher la version la plus récente compatible
    const compatibleVersions = this.supportedVersions
      .filter(v => parseInt(v.replace('v', '')) >= versionNumber)
      .sort();
    
    return compatibleVersions[0] || null;
  }
}
```

### Routage par Version
```typescript
// src/api/shared/VersionedRouter.ts
import { Router } from 'express';
import { VersionedRequest } from '../../versioning/VersioningMiddleware';

export class VersionedRouter {
  private routers: Map<string, Router> = new Map();
  
  constructor() {
    this.initializeRouters();
  }
  
  private initializeRouters() {
    // Importer les routeurs par version
    const v1Router = require('../v1/routes').default;
    const v2Router = require('../v2/routes').default;
    
    this.routers.set('v1', v1Router);
    this.routers.set('v2', v2Router);
  }
  
  getRouter(): Router {
    const mainRouter = Router();
    
    mainRouter.use((req, res, next) => {
      const versionedReq = req as VersionedRequest;
      const version = versionedReq.apiVersion;
      
      const versionRouter = this.routers.get(version);
      if (!versionRouter) {
        return res.status(500).json({
          error: `Routeur non trouvé pour la version ${version}`
        });
      }
      
      // Déléguer à la version appropriée
      versionRouter(req, res, next);
    });
    
    return mainRouter;
  }
}
```

## 📊 Rate Limiting Avancé

### Rate Limiter Intelligent
```typescript
// src/middleware/AdvancedRateLimiter.ts
import rateLimit from 'express-rate-limit';
import slowDown from 'express-slow-down';
import { RedisClient } from '../cache/RedisClient';

export class AdvancedRateLimiter {
  private redis = RedisClient.getInstance().getClient();
  
  // Rate limiting par endpoint
  createEndpointLimiter(endpoint: string, maxRequests: number, windowMs: number) {
    return rateLimit({
      windowMs,
      max: maxRequests,
      message: {
        error: `Trop de requêtes sur ${endpoint}`,
        retryAfter: Math.ceil(windowMs / 1000)
      },
      standardHeaders: true,
      legacyHeaders: false,
      store: this.createRedisStore(),
      keyGenerator: (req) => `ratelimit:${endpoint}:${this.getClientId(req)}`
    });
  }
  
  // Rate limiting par utilisateur avec niveaux
  createUserLimiter() {
    return rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: async (req) => {
        const userLevel = await this.getUserLevel(req);
        switch (userLevel) {
          case 'premium': return 1000;
          case 'standard': return 500;
          case 'basic': return 100;
          default: return 50; // Anonymous
        }
      },
      message: (req) => ({
        error: 'Limite de requêtes dépassée',
        userLevel: req.user?.level || 'anonymous',
        upgradeInfo: 'Upgradez votre compte pour plus de requêtes'
      }),
      store: this.createRedisStore()
    });
  }
  
  // Slow down progressif
  createSlowDown() {
    return slowDown({
      windowMs: 15 * 60 * 1000, // 15 minutes
      delayAfter: 50, // Commencer à ralentir après 50 requêtes
      delayMs: 500, // Délai initial de 500ms
      maxDelayMs: 10000, // Délai maximum de 10s
      store: this.createRedisStore()
    });
  }
  
  // Rate limiting spécialisé pour l'upload
  createUploadLimiter() {
    return rateLimit({
      windowMs: 60 * 60 * 1000, // 1 heure
      max: 20, // 20 uploads par heure
      message: {
        error: 'Limite d\'upload dépassée',
        retryAfter: '1 heure'
      },
      store: this.createRedisStore(),
      keyGenerator: (req) => `upload:${this.getClientId(req)}`
    });
  }
  
  private createRedisStore() {
    const RedisStore = require('rate-limit-redis');
    return new RedisStore({
      client: this.redis,
      prefix: 'rl:'
    });
  }
  
  private getClientId(req: any): string {
    return req.user?.id || 
           req.headers['x-api-key'] || 
           req.ip || 
           'anonymous';
  }
  
  private async getUserLevel(req: any): Promise<string> {
    if (!req.user) return 'anonymous';
    
    // Récupérer le niveau depuis la base ou le cache
    const cached = await this.redis.get(`user:level:${req.user.id}`);
    if (cached) return cached;
    
    // Par défaut
    return 'basic';
  }
}
```

## 📝 Documentation Interactive Avancée

### Générateur Swagger Intelligent
```typescript
// src/documentation/SwaggerGenerator.ts
import swaggerJsdoc from 'swagger-jsdoc';
import { OpenAPIV3 } from 'openapi-types';

export class SwaggerGenerator {
  private baseSpec: OpenAPIV3.Document;
  
  constructor() {
    this.baseSpec = this.createBaseSpec();
  }
  
  generateSpec(version: string = 'v1'): OpenAPIV3.Document {
    const options: swaggerJsdoc.Options = {
      definition: {
        ...this.baseSpec,
        info: {
          ...this.baseSpec.info,
          version: version === 'v1' ? '1.0.0' : '2.0.0'
        },
        servers: [
          {
            url: `http://localhost:3000/api/${version}`,
            description: `Serveur de développement ${version.toUpperCase()}`
          }
        ]
      },
      apis: [
        `./src/api/${version}/routes/*.ts`,
        `./src/api/${version}/controllers/*.ts`
      ]
    };
    
    return swaggerJsdoc(options);
  }
  
  private createBaseSpec(): OpenAPIV3.Document {
    return {
      openapi: '3.0.0',
      info: {
        title: 'API REST Avancée - TP Niveau 7',
        description: `
## API REST Enterprise avec fonctionnalités avancées

Cette API démontre les fonctionnalités avancées d'une API REST de niveau enterprise :

### 🚀 Fonctionnalités
- **Pagination intelligente** : Cursor et offset pagination
- **Recherche avancée** : Full-text, filtres, facettes
- **Upload de fichiers** : Traitement d'images, validation
- **Versioning** : Support multi-versions avec compatibilité
- **Rate limiting** : Limitation intelligente par utilisateur/endpoint
- **Cache Redis** : Performance optimisée
- **Documentation interactive** : Swagger UI avec exemples

### 🔐 Authentification
Utilisez l'une de ces méthodes :
- **Bearer Token** : \`Authorization: Bearer <jwt_token>\`
- **API Key** : \`X-API-Key: <your_api_key>\`

### 📊 Rate Limits
- **Utilisateurs anonymes** : 50 req/15min
- **Utilisateurs basic** : 100 req/15min
- **Utilisateurs premium** : 1000 req/15min

### 🔄 Versioning
- **URL** : \`/api/v1/\` ou \`/api/v2/\`
- **Header** : \`Accept-Version: v2\`
- **Content-Type** : \`application/vnd.api+v2+json\`
        `,
        contact: {
          name: 'Support API',
          email: 'support@api.com'
        },
        license: {
          name: 'MIT',
          url: 'https://opensource.org/licenses/MIT'
        }
      },
      components: {
        securitySchemes: {
          bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT'
          },
          apiKeyAuth: {
            type: 'apiKey',
            in: 'header',
            name: 'X-API-Key'
          }
        },
        schemas: this.generateSchemas(),
        responses: this.generateResponses(),
        parameters: this.generateParameters()
      },
      security: [
        { bearerAuth: [] },
        { apiKeyAuth: [] }
      ],
      tags: [
        {
          name: 'Items',
          description: 'Gestion des items avec fonctionnalités avancées'
        },
        {
          name: 'Search',
          description: 'Recherche et filtres avancés'
        },
        {
          name: 'Upload',
          description: 'Upload et traitement de fichiers'
        },
        {
          name: 'Admin',
          description: 'Fonctionnalités d\'administration'
        }
      ]
    };
  }
  
  private generateSchemas(): Record<string, OpenAPIV3.SchemaObject> {
    return {
      Item: {
        type: 'object',
        required: ['name', 'price', 'category'],
        properties: {
          id: { type: 'string', example: '64a7b8c9d1e2f3a4b5c6d7e8' },
          name: { 
            type: 'string', 
            minLength: 2, 
            maxLength: 100,
            example: 'iPhone 14 Pro'
          },
          description: { 
            type: 'string', 
            maxLength: 500,
            example: 'Smartphone Apple avec écran ProMotion'
          },
          price: { 
            type: 'number', 
            minimum: 0,
            example: 1199.99
          },
          category: {
            type: 'string',
            enum: ['electronique', 'vetement', 'livre', 'autre'],
            example: 'electronique'
          },
          tags: {
            type: 'array',
            items: { type: 'string' },
            example: ['apple', 'smartphone', 'premium']
          },
          isActive: { type: 'boolean', default: true },
          images: {
            type: 'array',
            items: { $ref: '#/components/schemas/FileInfo' }
          },
          createdAt: { 
            type: 'string', 
            format: 'date-time',
            example: '2023-12-25T10:30:00.000Z'
          },
          updatedAt: { 
            type: 'string', 
            format: 'date-time',
            example: '2023-12-25T15:45:00.000Z'
          }
        }
      },
      
      PaginatedResponse: {
        type: 'object',
        properties: {
          data: {
            type: 'array',
            items: { $ref: '#/components/schemas/Item' }
          },
          pagination: {
            type: 'object',
            properties: {
              page: { type: 'integer', example: 1 },
              limit: { type: 'integer', example: 20 },
              total: { type: 'integer', example: 150 },
              totalPages: { type: 'integer', example: 8 },
              hasNext: { type: 'boolean', example: true },
              hasPrev: { type: 'boolean', example: false },
              nextCursor: { type: 'string', example: 'eyJpZCI6IjY0YTdiOGM5ZDF...' },
              prevCursor: { type: 'string', example: null }
            }
          },
          meta: {
            type: 'object',
            properties: {
              took: { type: 'integer', description: 'Temps de traitement en ms', example: 45 },
              cached: { type: 'boolean', example: true },
              strategy: { type: 'string', enum: ['offset', 'cursor'], example: 'offset' }
            }
          }
        }
      },
      
      SearchResponse: {
        type: 'object',
        properties: {
          items: {
            type: 'array',
            items: { $ref: '#/components/schemas/Item' }
          },
          total: { type: 'integer', example: 42 },
          facets: {
            type: 'object',
            additionalProperties: {
              type: 'object',
              additionalProperties: { type: 'integer' }
            },
            example: {
              category: { electronique: 25, livre: 12, vetement: 5 },
              price_range: { "0-100": 15, "100-500": 20, "500+": 7 }
            }
          },
          suggestions: {
            type: 'array',
            items: { type: 'string' },
            example: ['smartphone', 'iphone', 'samsung']
          },
          took: { type: 'integer', example: 87 }
        }
      },
      
      FileInfo: {
        type: 'object',
        properties: {
          filename: { type: 'string', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890.jpg' },
          originalName: { type: 'string', example: 'iphone-photo.jpg' },
          url: { type: 'string', example: '/uploads/a1b2c3d4-e5f6-7890-abcd-ef1234567890.jpg' },
          size: { type: 'integer', example: 2048576 },
          mimetype: { type: 'string', example: 'image/jpeg' }
        }
      },
      
      Error: {
        type: 'object',
        properties: {
          error: { type: 'string', example: 'Message d\'erreur' },
          code: { type: 'string', example: 'VALIDATION_ERROR' },
          details: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                field: { type: 'string', example: 'name' },
                message: { type: 'string', example: 'Le nom est obligatoire' }
              }
            }
          }
        }
      }
    };
  }
  
  private generateResponses(): Record<string, OpenAPIV3.ResponseObject> {
    return {
      BadRequest: {
        description: 'Requête invalide',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/Error' }
          }
        }
      },
      Unauthorized: {
        description: 'Non autorisé',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                error: { type: 'string', example: 'Token invalide ou expiré' }
              }
            }
          }
        }
      },
      NotFound: {
        description: 'Ressource non trouvée',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                error: { type: 'string', example: 'Item non trouvé' }
              }
            }
          }
        }
      },
      TooManyRequests: {
        description: 'Trop de requêtes',
        headers: {
          'Retry-After': {
            description: 'Nombre de secondes à attendre',
            schema: { type: 'integer' }
          }
        },
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                error: { type: 'string', example: 'Limite de requêtes dépassée' },
                retryAfter: { type: 'integer', example: 900 }
              }
            }
          }
        }
      }
    };
  }
  
  private generateParameters(): Record<string, OpenAPIV3.ParameterObject> {
    return {
      PageParam: {
        name: 'page',
        in: 'query',
        description: 'Numéro de page (pagination offset)',
        schema: { type: 'integer', minimum: 1, default: 1 },
        example: 1
      },
      LimitParam: {
        name: 'limit',
        in: 'query',
        description: 'Nombre d\'éléments par page',
        schema: { type: 'integer', minimum: 1, maximum: 100, default: 20 },
        example: 20
      },
      CursorParam: {
        name: 'cursor',
        in: 'query',
        description: 'Curseur pour pagination (base64)',
        schema: { type: 'string' },
        example: 'eyJpZCI6IjY0YTdiOGM5ZDFlMmYzYTRiNWM2ZDdlOCIsImNyZWF0ZWRBdCI6IjIwMjMtMTItMjVUMTA6MzA6MDAuMDAwWiJ9'
      },
      SortByParam: {
        name: 'sortBy',
        in: 'query',
        description: 'Champ pour le tri',
        schema: {
          type: 'string',
          enum: ['name', 'price', 'createdAt', 'updatedAt'],
          default: 'createdAt'
        },
        example: 'createdAt'
      },
      SortOrderParam: {
        name: 'sortOrder',
        in: 'query',
        description: 'Ordre de tri',
        schema: {
          type: 'string',
          enum: ['asc', 'desc'],
          default: 'desc'
        },
        example: 'desc'
      }
    };
  }
}
```

## 🎮 Contrôleurs V2 avec Fonctionnalités Avancées

### Contrôleur Items V2
```typescript
// src/api/v2/controllers/ItemController.ts
import { Request, Response } from 'express';
import { ItemService } from '../../../services/ItemService';
import { PaginationService } from '../../../pagination/PaginationService';
import { SearchService } from '../../../search/SearchService';
import { FileUploadHandler } from '../../../uploads/handlers/FileUploadHandler';

export class ItemControllerV2 {
  constructor(
    private itemService: ItemService,
    private paginationService: PaginationService,
    private searchService: SearchService,
    private uploadHandler: FileUploadHandler
  ) {}
  
  /**
   * @swagger
   * /api/v2/items:
   *   get:
   *     tags: [Items]
   *     summary: Liste paginée des items avec recherche avancée
   *     parameters:
   *       - $ref: '#/components/parameters/PageParam'
   *       - $ref: '#/components/parameters/LimitParam'
   *       - $ref: '#/components/parameters/CursorParam'
   *       - $ref: '#/components/parameters/SortByParam'
   *       - $ref: '#/components/parameters/SortOrderParam'
   *       - name: search
   *         in: query
   *         description: Terme de recherche
   *         schema:
   *           type: string
   *         example: "smartphone"
   *       - name: category
   *         in: query
   *         description: Filtrer par catégorie(s)
   *         schema:
   *           oneOf:
   *             - type: string
   *             - type: array
   *               items:
   *                 type: string
   *         example: "electronique"
   *       - name: priceMin
   *         in: query
   *         description: Prix minimum
   *         schema:
   *           type: number
   *         example: 100
   *       - name: priceMax
   *         in: query
   *         description: Prix maximum
   *         schema:
   *           type: number
   *         example: 1000
   *       - name: facets
   *         in: query
   *         description: Facettes à inclure
   *         schema:
   *           type: array
   *           items:
   *             type: string
   *             enum: [category, price_range, tags]
   *         style: form
   *         explode: false
   *         example: "category,price_range"
   *     responses:
   *       200:
   *         description: Liste paginée des items
   *         content:
   *           application/json:
   *             schema:
   *               anyOf:
   *                 - $ref: '#/components/schemas/PaginatedResponse'
   *                 - $ref: '#/components/schemas/SearchResponse'
   *             examples:
   *               pagination:
   *                 summary: Réponse avec pagination standard
   *                 value:
   *                   data: []
   *                   pagination:
   *                     page: 1
   *                     limit: 20
   *                     total: 150
   *                     totalPages: 8
   *                     hasNext: true
   *                     hasPrev: false
   *                   meta:
   *                     took: 45
   *                     cached: true
   *                     strategy: "offset"
   *               search:
   *                 summary: Réponse avec recherche et facettes
   *                 value:
   *                   items: []
   *                   total: 42
   *                   facets:
   *                     category:
   *                       electronique: 25
   *                       livre: 12
   *                       vetement: 5
   *                   suggestions: ["smartphone", "iphone"]
   *                   took: 87
   *       400:
   *         $ref: '#/components/responses/BadRequest'
   */
  async getAll(req: Request, res: Response): Promise<void> {
    try {
      const {
        page,
        limit,
        cursor,
        sortBy,
        sortOrder,
        search,
        category,
        priceMin,
        priceMax,
        facets,
        ...otherFilters
      } = req.query;
      
      // Si recherche ou facettes demandées, utiliser SearchService
      if (search || facets) {
        const searchRequest = {
          query: search as string,
          filters: {
            category,
            priceMin: priceMin ? Number(priceMin) : undefined,
            priceMax: priceMax ? Number(priceMax) : undefined,
            ...otherFilters
          },
          facets: facets ? String(facets).split(',') : undefined
        };
        
        const result = await this.searchService.search(searchRequest);
        res.json(result);
        return;
      }
      
      // Sinon, utiliser pagination standard
      const paginationOptions = {
        page: page ? Number(page) : undefined,
        limit: limit ? Number(limit) : undefined,
        cursor: cursor as string,
        sortBy: sortBy as string,
        sortOrder: sortOrder as 'asc' | 'desc',
        filters: {
          category,
          priceMin: priceMin ? Number(priceMin) : undefined,
          priceMax: priceMax ? Number(priceMax) : undefined,
          ...otherFilters
        }
      };
      
      const result = await this.paginationService.paginate({}, paginationOptions);
      res.json(result);
      
    } catch (error) {
      console.error('Erreur lors de la récupération des items:', error);
      res.status(500).json({ 
        error: 'Erreur interne du serveur',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
  
  /**
   * @swagger
   * /api/v2/items/{id}:
   *   get:
   *     tags: [Items]
   *     summary: Récupérer un item par ID avec détails étendus
   *     parameters:
   *       - name: id
   *         in: path
   *         required: true
   *         description: ID de l'item
   *         schema:
   *           type: string
   *         example: "64a7b8c9d1e2f3a4b5c6d7e8"
   *       - name: include
   *         in: query
   *         description: Données additionnelles à inclure
   *         schema:
   *           type: array
   *           items:
   *             type: string
   *             enum: [images, related, stats]
   *         style: form
   *         explode: false
   *         example: "images,related"
   *     responses:
   *       200:
   *         description: Détails de l'item
   *         content:
   *           application/json:
   *             schema:
   *               allOf:
   *                 - $ref: '#/components/schemas/Item'
   *                 - type: object
   *                   properties:
   *                     related:
   *                       type: array
   *                       items:
   *                         $ref: '#/components/schemas/Item'
   *                     stats:
   *                       type: object
   *                       properties:
   *                         views: { type: integer }
   *                         popularity: { type: number }
   *       404:
   *         $ref: '#/components/responses/NotFound'
   */
  async getById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { include } = req.query;
      
      const item = await this.itemService.getById(id);
      if (!item) {
        res.status(404).json({ error: 'Item non trouvé' });
        return;
      }
      
      // Enrichir avec des données additionnelles si demandées
      const result: any = { ...item };
      const includes = include ? String(include).split(',') : [];
      
      if (includes.includes('related')) {
        result.related = await this.itemService.getRelatedItems(id, 5);
      }
      
      if (includes.includes('stats')) {
        result.stats = await this.itemService.getItemStats(id);
      }
      
      res.json(result);
      
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'item:', error);
      res.status(500).json({ error: 'Erreur interne du serveur' });
    }
  }
  
  /**
   * @swagger
   * /api/v2/items:
   *   post:
   *     tags: [Items]
   *     summary: Créer un nouvel item avec upload d'images
   *     requestBody:
   *       content:
   *         multipart/form-data:
   *           schema:
   *             type: object
   *             required: [name, price, category]
   *             properties:
   *               name:
   *                 type: string
   *                 minLength: 2
   *                 maxLength: 100
   *               description:
   *                 type: string
   *                 maxLength: 500
   *               price:
   *                 type: number
   *                 minimum: 0
   *               category:
   *                 type: string
   *                 enum: [electronique, vetement, livre, autre]
   *               tags:
   *                 type: string
   *                 description: Tags séparés par des virgules
   *               files:
   *                 type: array
   *                 items:
   *                   type: string
   *                   format: binary
   *                 description: Images de l'item (max 5 fichiers, 10MB chacun)
   *     responses:
   *       201:
   *         description: Item créé avec succès
   *         content:
   *           application/json:
   *             schema:
   *               allOf:
   *                 - $ref: '#/components/schemas/Item'
   *                 - type: object
   *                   properties:
   *                     uploadResults:
   *                       type: array
   *                       items:
   *                         $ref: '#/components/schemas/FileInfo'
   *       400:
   *         $ref: '#/components/responses/BadRequest'
   */
  async create(req: Request, res: Response): Promise<void> {
    try {
      const files = req.files as Express.Multer.File[];
      
      // Traiter les données du formulaire
      const itemData = {
        name: req.body.name,
        description: req.body.description,
        price: Number(req.body.price),
        category: req.body.category,
        tags: req.body.tags ? req.body.tags.split(',').map((t: string) => t.trim()) : [],
        isActive: req.body.isActive !== 'false'
      };
      
      // Créer l'item
      const item = await this.itemService.create(itemData);
      
      // Traiter les fichiers uploadés s'il y en a
      let uploadResults = [];
      if (files && files.length > 0) {
        uploadResults = await this.uploadHandler.handleUpload(files);
        
        // Associer les images réussies à l'item
        const successfulUploads = uploadResults
          .filter(result => result.success)
          .map(result => ({
            filename: result.filename,
            originalName: result.originalName,
            url: result.url,
            size: result.size,
            mimetype: result.mimetype
          }));
          
        if (successfulUploads.length > 0) {
          await this.itemService.addImages(item.id!, successfulUploads);
        }
      }
      
      // Récupérer l'item complet avec les images
      const fullItem = await this.itemService.getById(item.id!);
      
      res.status(201).json({
        ...fullItem,
        uploadResults
      });
      
    } catch (error) {
      console.error('Erreur lors de la création de l\'item:', error);
      res.status(500).json({ error: 'Erreur interne du serveur' });
    }
  }
}
```

## 🎯 Objectifs et Livrables

### Objectifs Pédagogiques
1. **Maîtriser la pagination avancée** avec strategies multiples
2. **Implémenter la recherche enterprise** avec facettes et suggestions
3. **Gérer l'upload de fichiers** avec traitement et validation
4. **Maîtriser le versioning d'API** avec compatibilité
5. **Optimiser les performances** avec cache et rate limiting

### Livrables Attendus
- API avec pagination cursor et offset
- Système de recherche avec facettes
- Upload d'images avec traitement
- Versioning v1/v2 fonctionnel
- Documentation Swagger interactive
- Tests de performance validés

---

🎯 **Objectif :** Développer une API REST de niveau enterprise avec toutes les fonctionnalités avancées attendues en production.

➡️ **Prochaine étape :** [TP Niveau 8 - Déploiement](./README_TP_08.md)
