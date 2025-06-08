# 🚀 Solutions TP-07 : API Avancée - Fonctionnalités Enterprise

## 📋 Vue d'ensemble

Ce document contient les solutions complètes et détaillées pour tous les exercices du TP-07. Chaque solution inclut le code complet, les explications et les bonnes pratiques.

---

## 🥉 Solution 1 : Pagination Intelligente (Bronze)

### 1.1 Service de Pagination Basique

```typescript
// src/services/pagination.service.ts
import { z } from "zod";

export interface PaginationOptions {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface PaginationResult<T> {
  data: T[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNext: boolean;
    hasPrev: boolean;
    startIndex: number;
    endIndex: number;
  };
}

// Schéma de validation
export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  sortBy: z.string().optional().default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

export class PaginationService {
  /**
   * Valide et normalise les options de pagination
   */
  static validateOptions(options: any): PaginationOptions {
    return paginationSchema.parse(options);
  }

  /**
   * Calcule les métadonnées de pagination
   */
  static calculateMetadata(
    currentPage: number,
    limit: number,
    totalItems: number
  ) {
    const totalPages = Math.ceil(totalItems / limit);
    const startIndex = (currentPage - 1) * limit;
    const endIndex = Math.min(startIndex + limit - 1, totalItems - 1);

    return {
      currentPage,
      totalPages,
      totalItems,
      itemsPerPage: limit,
      hasNext: currentPage < totalPages,
      hasPrev: currentPage > 1,
      startIndex,
      endIndex,
    };
  }

  /**
   * Applique la pagination à une requête MongoDB
   */
  static async paginateMongoQuery<T>(
    query: any,
    options: PaginationOptions
  ): Promise<PaginationResult<T>> {
    const { page, limit, sortBy, sortOrder } = this.validateOptions(options);

    // Construction du tri
    const sort: Record<string, 1 | -1> = {};
    sort[sortBy!] = sortOrder === "asc" ? 1 : -1;

    // Exécution des requêtes en parallèle pour optimiser les performances
    const [data, totalItems] = await Promise.all([
      query
        .sort(sort)
        .skip((page - 1) * limit)
        .limit(limit)
        .exec(),
      query.model.countDocuments(query.getFilter()),
    ]);

    const pagination = this.calculateMetadata(page, limit, totalItems);

    return {
      data,
      pagination,
    };
  }

  /**
   * Génère les headers HTTP pour la pagination
   */
  static generateHeaders(
    pagination: PaginationResult<any>["pagination"],
    baseUrl: string
  ) {
    const { currentPage, totalPages, totalItems, itemsPerPage } = pagination;

    const headers: Record<string, string> = {
      "X-Total-Count": totalItems.toString(),
      "X-Total-Pages": totalPages.toString(),
      "X-Current-Page": currentPage.toString(),
      "X-Per-Page": itemsPerPage.toString(),
    };

    // Construction des liens de navigation (RFC 5988)
    const links: string[] = [];

    if (pagination.hasNext) {
      links.push(
        `<${baseUrl}?page=${currentPage + 1}&limit=${itemsPerPage}>; rel="next"`
      );
      links.push(
        `<${baseUrl}?page=${totalPages}&limit=${itemsPerPage}>; rel="last"`
      );
    }

    if (pagination.hasPrev) {
      links.push(
        `<${baseUrl}?page=${currentPage - 1}&limit=${itemsPerPage}>; rel="prev"`
      );
      links.push(`<${baseUrl}?page=1&limit=${itemsPerPage}>; rel="first"`);
    }

    if (links.length > 0) {
      headers["Link"] = links.join(", ");
    }

    return headers;
  }
}
```

### 1.2 Intégration dans les Contrôleurs

```typescript
// src/controllers/items.controller.ts
import { Request, Response, NextFunction } from "express";
import { PaginationService } from "../services/pagination.service.js";
import { ItemService } from "../services/items.service.js";

export class ItemsController {
  /**
   * Récupère les items avec pagination
   * GET /api/items?page=1&limit=10&sortBy=createdAt&sortOrder=desc
   */
  static async getItems(req: Request, res: Response, next: NextFunction) {
    try {
      // Validation des paramètres de pagination
      const paginationOptions = PaginationService.validateOptions(req.query);

      // Construction de la requête avec filtres optionnels
      const filters = ItemsController.buildFilters(req.query);
      const query = ItemService.buildQuery(filters);

      // Application de la pagination
      const result = await PaginationService.paginateMongoQuery(
        query,
        paginationOptions
      );

      // Génération des headers de pagination
      const baseUrl = `${req.protocol}://${req.get("host")}${req.path}`;
      const headers = PaginationService.generateHeaders(
        result.pagination,
        baseUrl
      );

      // Application des headers
      Object.entries(headers).forEach(([key, value]) => {
        res.set(key, value);
      });

      res.json({
        success: true,
        data: result.data,
        pagination: result.pagination,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Construction des filtres à partir des paramètres de query
   */
  private static buildFilters(query: any) {
    const filters: Record<string, any> = {};

    // Filtres de base
    if (query.category) {
      filters.category = query.category;
    }

    if (query.search) {
      filters.$text = { $search: query.search };
    }

    // Filtres de prix
    if (query.minPrice || query.maxPrice) {
      filters.price = {};
      if (query.minPrice) filters.price.$gte = parseFloat(query.minPrice);
      if (query.maxPrice) filters.price.$lte = parseFloat(query.maxPrice);
    }

    // Filtres de date
    if (query.dateFrom || query.dateTo) {
      filters.createdAt = {};
      if (query.dateFrom) filters.createdAt.$gte = new Date(query.dateFrom);
      if (query.dateTo) filters.createdAt.$lte = new Date(query.dateTo);
    }

    return filters;
  }
}
```

### 1.3 Tests de Pagination

```typescript
// tests/unit/pagination.service.test.ts
import { describe, it, expect, beforeEach, jest } from "@jest/globals";
import { PaginationService } from "../../src/services/pagination.service.js";

describe("PaginationService", () => {
  describe("validateOptions", () => {
    it("should validate and normalize pagination options", () => {
      const options = PaginationService.validateOptions({
        page: "2",
        limit: "15",
        sortBy: "name",
        sortOrder: "asc",
      });

      expect(options).toEqual({
        page: 2,
        limit: 15,
        sortBy: "name",
        sortOrder: "asc",
      });
    });

    it("should apply default values", () => {
      const options = PaginationService.validateOptions({});

      expect(options).toEqual({
        page: 1,
        limit: 20,
        sortBy: "createdAt",
        sortOrder: "desc",
      });
    });

    it("should enforce limits", () => {
      expect(() => {
        PaginationService.validateOptions({ limit: 200 });
      }).toThrow();

      expect(() => {
        PaginationService.validateOptions({ page: 0 });
      }).toThrow();
    });
  });

  describe("calculateMetadata", () => {
    it("should calculate pagination metadata correctly", () => {
      const metadata = PaginationService.calculateMetadata(2, 10, 25);

      expect(metadata).toEqual({
        currentPage: 2,
        totalPages: 3,
        totalItems: 25,
        itemsPerPage: 10,
        hasNext: true,
        hasPrev: true,
        startIndex: 10,
        endIndex: 19,
      });
    });

    it("should handle edge cases", () => {
      // Première page
      const firstPage = PaginationService.calculateMetadata(1, 10, 25);
      expect(firstPage.hasPrev).toBe(false);
      expect(firstPage.hasNext).toBe(true);

      // Dernière page
      const lastPage = PaginationService.calculateMetadata(3, 10, 25);
      expect(lastPage.hasPrev).toBe(true);
      expect(lastPage.hasNext).toBe(false);
      expect(lastPage.endIndex).toBe(24);
    });
  });

  describe("generateHeaders", () => {
    it("should generate correct pagination headers", () => {
      const pagination = {
        currentPage: 2,
        totalPages: 5,
        totalItems: 100,
        itemsPerPage: 20,
        hasNext: true,
        hasPrev: true,
        startIndex: 20,
        endIndex: 39,
      };

      const headers = PaginationService.generateHeaders(
        pagination,
        "http://api.example.com/items"
      );

      expect(headers["X-Total-Count"]).toBe("100");
      expect(headers["X-Current-Page"]).toBe("2");
      expect(headers["Link"]).toContain('rel="next"');
      expect(headers["Link"]).toContain('rel="prev"');
    });
  });
});
```

---

## 🥈 Solution 2 : Pagination Cursor (Silver)

### 2.1 Service de Pagination Cursor

```typescript
// src/services/cursor-pagination.service.ts
import { z } from "zod";
import jwt from "jsonwebtoken";

export interface CursorPaginationOptions {
  cursor?: string;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface CursorPaginationResult<T> {
  data: T[];
  cursors: {
    before?: string;
    after?: string;
  };
  hasNext: boolean;
  hasPrev: boolean;
  totalEstimate?: number;
}

interface CursorData {
  value: any;
  id: string;
  timestamp: number;
}

export const cursorPaginationSchema = z.object({
  cursor: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  sortBy: z.string().default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

export class CursorPaginationService {
  private static readonly SECRET =
    process.env.CURSOR_SECRET || "cursor-secret-key";

  /**
   * Encode un cursor de manière sécurisée
   */
  static encodeCursor(value: any, id: string): string {
    const cursorData: CursorData = {
      value,
      id,
      timestamp: Date.now(),
    };

    return jwt.sign(cursorData, this.SECRET, {
      expiresIn: "24h",
      algorithm: "HS256",
    });
  }

  /**
   * Décode un cursor de manière sécurisée
   */
  static decodeCursor(cursor: string): CursorData | null {
    try {
      return jwt.verify(cursor, this.SECRET) as CursorData;
    } catch (error) {
      return null;
    }
  }

  /**
   * Valide les options de pagination cursor
   */
  static validateOptions(options: any): CursorPaginationOptions {
    return cursorPaginationSchema.parse(options);
  }

  /**
   * Applique la pagination cursor à une requête MongoDB
   */
  static async paginateMongoQuery<T extends { _id: any; [key: string]: any }>(
    baseQuery: any,
    options: CursorPaginationOptions
  ): Promise<CursorPaginationResult<T>> {
    const { cursor, limit, sortBy, sortOrder } = this.validateOptions(options);

    // Construction du tri
    const sort: Record<string, 1 | -1> = {};
    sort[sortBy!] = sortOrder === "asc" ? 1 : -1;
    sort["_id"] = sortOrder === "asc" ? 1 : -1; // Garantit l'unicité du tri

    let query = baseQuery.clone();

    // Application du cursor s'il est fourni
    if (cursor) {
      const cursorData = this.decodeCursor(cursor);
      if (!cursorData) {
        throw new Error("Invalid cursor");
      }

      // Construction de la condition de cursor
      const cursorCondition = this.buildCursorCondition(
        sortBy!,
        cursorData.value,
        cursorData.id,
        sortOrder!
      );

      query = query.find(cursorCondition);
    }

    // Récupération des données avec une limite +1 pour détecter hasNext
    const data = await query
      .sort(sort)
      .limit(limit + 1)
      .exec();

    // Détection de hasNext et nettoyage des données
    const hasNext = data.length > limit;
    if (hasNext) {
      data.pop(); // Supprime l'élément supplémentaire
    }

    // Génération des cursors
    const cursors: CursorPaginationResult<T>["cursors"] = {};

    if (data.length > 0) {
      const firstItem = data[0];
      const lastItem = data[data.length - 1];

      cursors.before = this.encodeCursor(
        firstItem[sortBy!],
        firstItem._id.toString()
      );

      cursors.after = this.encodeCursor(
        lastItem[sortBy!],
        lastItem._id.toString()
      );
    }

    // Estimation du total (optionnel, coûteux sur de gros datasets)
    let totalEstimate;
    if (data.length < 1000) {
      // Seulement pour les petits datasets
      totalEstimate = await baseQuery.model.countDocuments(
        baseQuery.getFilter()
      );
    }

    return {
      data,
      cursors,
      hasNext,
      hasPrev: !!cursor,
      totalEstimate,
    };
  }

  /**
   * Construction de la condition de cursor pour MongoDB
   */
  private static buildCursorCondition(
    sortBy: string,
    cursorValue: any,
    cursorId: string,
    sortOrder: "asc" | "desc"
  ) {
    const operator = sortOrder === "asc" ? "$gt" : "$lt";
    const equalOperator = sortOrder === "asc" ? "$gte" : "$lte";

    return {
      $or: [
        { [sortBy]: { [operator]: cursorValue } },
        {
          [sortBy]: cursorValue,
          _id: { [operator]: cursorId },
        },
      ],
    };
  }

  /**
   * Benchmark entre pagination offset et cursor
   */
  static async benchmark(
    model: any,
    testSizes: number[] = [1000, 10000, 50000]
  ) {
    const results: Array<{
      size: number;
      offset: { time: number; memory: number };
      cursor: { time: number; memory: number };
    }> = [];

    for (const size of testSizes) {
      console.log(`Benchmarking pagination with ${size} documents...`);

      // Test pagination offset
      const offsetStart = process.hrtime.bigint();
      const offsetMemStart = process.memoryUsage().heapUsed;

      await model
        .find()
        .skip(size / 2)
        .limit(20)
        .exec();

      const offsetEnd = process.hrtime.bigint();
      const offsetMemEnd = process.memoryUsage().heapUsed;

      // Test pagination cursor
      const cursorStart = process.hrtime.bigint();
      const cursorMemStart = process.memoryUsage().heapUsed;

      const middleDoc = await model
        .findOne()
        .skip(size / 2)
        .exec();
      if (middleDoc) {
        const cursor = this.encodeCursor(
          middleDoc.createdAt,
          middleDoc._id.toString()
        );
        await this.paginateMongoQuery(model.find(), { cursor, limit: 20 });
      }

      const cursorEnd = process.hrtime.bigint();
      const cursorMemEnd = process.memoryUsage().heapUsed;

      results.push({
        size,
        offset: {
          time: Number(offsetEnd - offsetStart) / 1000000, // Convert to ms
          memory: offsetMemEnd - offsetMemStart,
        },
        cursor: {
          time: Number(cursorEnd - cursorStart) / 1000000,
          memory: cursorMemEnd - cursorMemStart,
        },
      });
    }

    return results;
  }

  /**
   * Recommandation automatique du type de pagination
   */
  static recommendPaginationType(
    totalItems: number,
    requestedPage: number
  ): {
    recommended: "offset" | "cursor";
    reason: string;
  } {
    if (totalItems < 1000) {
      return {
        recommended: "offset",
        reason: "Small dataset, offset pagination is sufficient",
      };
    }

    if (requestedPage * 20 > 1000) {
      // Assuming 20 items per page
      return {
        recommended: "cursor",
        reason:
          "Deep pagination detected, cursor pagination recommended for performance",
      };
    }

    return {
      recommended: "offset",
      reason: "Shallow pagination, offset is acceptable",
    };
  }
}
```

### 2.2 Contrôleur avec Support Dual

```typescript
// src/controllers/items.controller.ts (extension)
export class ItemsController {
  /**
   * Endpoint intelligent qui choisit automatiquement le type de pagination
   * GET /api/items?cursor=... OU ?page=...
   */
  static async getItemsIntelligent(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const hasCursor = !!req.query.cursor;
      const hasPage = !!req.query.page;

      if (hasCursor && hasPage) {
        return res.status(400).json({
          error: "Cannot use both cursor and page parameters simultaneously",
        });
      }

      let result;
      let paginationType: "offset" | "cursor";

      if (hasCursor) {
        // Utilisation de la pagination cursor
        result = await CursorPaginationService.paginateMongoQuery(
          ItemService.buildQuery(ItemsController.buildFilters(req.query)),
          req.query
        );
        paginationType = "cursor";
      } else {
        // Utilisation de la pagination offset avec recommandation
        const totalItems = await ItemService.countDocuments(
          ItemsController.buildFilters(req.query)
        );

        const page = parseInt(req.query.page as string) || 1;
        const recommendation = CursorPaginationService.recommendPaginationType(
          totalItems,
          page
        );

        result = await PaginationService.paginateMongoQuery(
          ItemService.buildQuery(ItemsController.buildFilters(req.query)),
          req.query
        );
        paginationType = "offset";

        // Ajout de la recommandation dans les headers
        res.set("X-Pagination-Recommendation", JSON.stringify(recommendation));
      }

      res.json({
        success: true,
        data: result.data,
        pagination: paginationType === "offset" ? result.pagination : undefined,
        cursors: paginationType === "cursor" ? result.cursors : undefined,
        hasNext: result.hasNext,
        hasPrev: result.hasPrev,
        paginationType,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }
}
```

---

## 🥇 Solution 3 : Recherche et Filtres Avancés (Gold)

### 3.1 Service de Recherche Avancée

```typescript
// src/services/search.service.ts
import { z } from "zod";
import Redis from "ioredis";
import { performance } from "perf_hooks";

export interface SearchOptions {
  q?: string;
  filters?: Record<string, any>;
  facets?: string[];
  fuzzy?: boolean;
  suggestions?: boolean;
  boost?: Record<string, number>;
}

export interface FacetResult {
  values: Array<{
    value: string;
    count: number;
    selected: boolean;
  }>;
  type: "terms" | "range" | "date_histogram";
  total: number;
}

export interface SearchResult<T> {
  data: T[];
  facets: Record<string, FacetResult>;
  suggestions: string[];
  totalMatches: number;
  searchTime: number;
  query: {
    normalized: string;
    terms: string[];
    filters: Record<string, any>;
  };
}

const searchSchema = z.object({
  q: z.string().optional(),
  filters: z.record(z.any()).default({}),
  facets: z.array(z.string()).default([]),
  fuzzy: z.boolean().default(false),
  suggestions: z.boolean().default(true),
  boost: z.record(z.number()).default({}),
});

export class SearchService {
  private static redis = new Redis(
    process.env.REDIS_URL || "redis://localhost:6379"
  );
  private static readonly CACHE_TTL = 300; // 5 minutes

  /**
   * Recherche avancée avec facettes et suggestions
   */
  static async search<T>(
    model: any,
    options: SearchOptions
  ): Promise<SearchResult<T>> {
    const startTime = performance.now();
    const validatedOptions = searchSchema.parse(options);

    // Génération de la clé de cache
    const cacheKey = this.generateCacheKey(validatedOptions);

    // Tentative de récupération depuis le cache
    const cachedResult = await this.getCachedResult(cacheKey);
    if (cachedResult) {
      cachedResult.searchTime = performance.now() - startTime;
      return cachedResult;
    }

    // Construction de la requête de recherche
    const searchQuery = this.buildSearchQuery(validatedOptions);

    // Exécution des requêtes en parallèle
    const [searchResults, facetResults, suggestions] = await Promise.all([
      this.executeSearchQuery(model, searchQuery, validatedOptions),
      this.calculateFacets(model, searchQuery, validatedOptions.facets),
      validatedOptions.suggestions
        ? this.generateSuggestions(validatedOptions.q)
        : [],
    ]);

    const result: SearchResult<T> = {
      data: searchResults.data,
      facets: facetResults,
      suggestions,
      totalMatches: searchResults.total,
      searchTime: performance.now() - startTime,
      query: {
        normalized: this.normalizeQuery(validatedOptions.q || ""),
        terms: this.extractTerms(validatedOptions.q || ""),
        filters: validatedOptions.filters,
      },
    };

    // Mise en cache du résultat
    await this.cacheResult(cacheKey, result);

    return result;
  }

  /**
   * Construction de la requête de recherche MongoDB
   */
  private static buildSearchQuery(options: SearchOptions) {
    const query: any = {};

    // Recherche textuelle
    if (options.q) {
      if (options.fuzzy) {
        // Recherche floue avec regex
        const fuzzyPattern = this.buildFuzzyPattern(options.q);
        query.$or = [
          { $text: { $search: options.q } },
          { name: { $regex: fuzzyPattern, $options: "i" } },
          { description: { $regex: fuzzyPattern, $options: "i" } },
        ];
      } else {
        query.$text = { $search: options.q };
      }
    }

    // Application des filtres
    Object.entries(options.filters || {}).forEach(([field, value]) => {
      if (Array.isArray(value)) {
        query[field] = { $in: value };
      } else if (
        (typeof value === "object" && value.min !== undefined) ||
        value.max !== undefined
      ) {
        // Filtre de plage
        query[field] = {};
        if (value.min !== undefined) query[field].$gte = value.min;
        if (value.max !== undefined) query[field].$lte = value.max;
      } else {
        query[field] = value;
      }
    });

    return query;
  }

  /**
   * Exécution de la requête de recherche avec scoring
   */
  private static async executeSearchQuery(
    model: any,
    query: any,
    options: SearchOptions
  ) {
    let mongoQuery = model.find(query);

    // Application du scoring pour la recherche textuelle
    if (options.q) {
      mongoQuery = mongoQuery.select({ score: { $meta: "textScore" } });
      mongoQuery = mongoQuery.sort({ score: { $meta: "textScore" } });
    }

    const [data, total] = await Promise.all([
      mongoQuery.exec(),
      model.countDocuments(query),
    ]);

    return { data, total };
  }

  /**
   * Calcul des facettes
   */
  private static async calculateFacets(
    model: any,
    baseQuery: any,
    facetFields: string[]
  ): Promise<Record<string, FacetResult>> {
    const facets: Record<string, FacetResult> = {};

    for (const field of facetFields) {
      const facetConfig = this.getFacetConfig(field);

      if (facetConfig.type === "terms") {
        facets[field] = await this.calculateTermsFacet(model, baseQuery, field);
      } else if (facetConfig.type === "range") {
        facets[field] = await this.calculateRangeFacet(
          model,
          baseQuery,
          field,
          facetConfig.ranges
        );
      } else if (facetConfig.type === "date_histogram") {
        facets[field] = await this.calculateDateHistogramFacet(
          model,
          baseQuery,
          field,
          facetConfig.interval
        );
      }
    }

    return facets;
  }

  /**
   * Calcul des facettes de termes
   */
  private static async calculateTermsFacet(
    model: any,
    baseQuery: any,
    field: string
  ): Promise<FacetResult> {
    const pipeline = [
      { $match: baseQuery },
      { $group: { _id: `$${field}`, count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 20 },
    ];

    const results = await model.aggregate(pipeline);

    return {
      type: "terms",
      total: results.length,
      values: results.map((r) => ({
        value: r._id,
        count: r.count,
        selected: false, // À déterminer selon les filtres actifs
      })),
    };
  }

  /**
   * Calcul des facettes de plages
   */
  private static async calculateRangeFacet(
    model: any,
    baseQuery: any,
    field: string,
    ranges: Array<{ min?: number; max?: number; label: string }>
  ): Promise<FacetResult> {
    const facetQueries = ranges.map(async (range) => {
      const rangeQuery = { ...baseQuery };

      if (range.min !== undefined || range.max !== undefined) {
        rangeQuery[field] = {};
        if (range.min !== undefined) rangeQuery[field].$gte = range.min;
        if (range.max !== undefined) rangeQuery[field].$lte = range.max;
      }

      const count = await model.countDocuments(rangeQuery);
      return {
        value: range.label,
        count,
        selected: false,
      };
    });

    const values = await Promise.all(facetQueries);

    return {
      type: "range",
      total: values.length,
      values,
    };
  }

  /**
   * Génération de suggestions et auto-complétion
   */
  private static async generateSuggestions(query?: string): Promise<string[]> {
    if (!query || query.length < 2) return [];

    const cacheKey = `suggestions:${query.toLowerCase()}`;
    const cached = await this.redis.get(cacheKey);

    if (cached) {
      return JSON.parse(cached);
    }

    // Recherche de termes similaires dans un index de suggestions
    const suggestions = await this.findSimilarTerms(query);

    // Mise en cache des suggestions
    await this.redis.setex(
      cacheKey,
      this.CACHE_TTL,
      JSON.stringify(suggestions)
    );

    return suggestions;
  }

  /**
   * Recherche de termes similaires (implémentation simplifiée)
   */
  private static async findSimilarTerms(query: string): Promise<string[]> {
    // Dans un vrai système, ceci utiliserait un index de recherche comme Elasticsearch
    const suggestions: string[] = [];

    // Suggestions basées sur des termes populaires pré-indexés
    const popularTerms = await this.redis.zrevrange(
      "popular_search_terms",
      0,
      10
    );

    for (const term of popularTerms) {
      if (term.toLowerCase().includes(query.toLowerCase())) {
        suggestions.push(term);
      }
    }

    // Correction orthographique simple (distance de Levenshtein)
    if (suggestions.length === 0) {
      suggestions.push(...this.generateSpellingSuggestions(query));
    }

    return suggestions.slice(0, 5);
  }

  /**
   * Génération de suggestions orthographiques
   */
  private static generateSpellingSuggestions(query: string): string[] {
    // Implémentation simplifiée - dans un vrai système, utiliser une bibliothèque comme node-spell-checker
    const commonMisspellings: Record<string, string> = {
      eletronic: "electronic",
      compter: "computer",
      sofware: "software",
    };

    return Object.entries(commonMisspellings)
      .filter(
        ([wrong]) => this.levenshteinDistance(query.toLowerCase(), wrong) <= 2
      )
      .map(([, correct]) => correct);
  }

  /**
   * Calcul de la distance de Levenshtein
   */
  private static levenshteinDistance(str1: string, str2: string): number {
    const matrix = Array(str2.length + 1)
      .fill(null)
      .map(() => Array(str1.length + 1).fill(null));

    for (let i = 0; i <= str1.length; i += 1) {
      matrix[0][i] = i;
    }

    for (let j = 0; j <= str2.length; j += 1) {
      matrix[j][0] = j;
    }

    for (let j = 1; j <= str2.length; j += 1) {
      for (let i = 1; i <= str1.length; i += 1) {
        const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[j][i] = Math.min(
          matrix[j][i - 1] + 1,
          matrix[j - 1][i] + 1,
          matrix[j - 1][i - 1] + indicator
        );
      }
    }

    return matrix[str2.length][str1.length];
  }

  /**
   * Configuration des facettes par champ
   */
  private static getFacetConfig(field: string) {
    const configs: Record<string, any> = {
      category: { type: "terms" },
      brand: { type: "terms" },
      price: {
        type: "range",
        ranges: [
          { max: 50, label: "Under $50" },
          { min: 50, max: 100, label: "$50 - $100" },
          { min: 100, max: 500, label: "$100 - $500" },
          { min: 500, label: "Over $500" },
        ],
      },
      createdAt: {
        type: "date_histogram",
        interval: "month",
      },
    };

    return configs[field] || { type: "terms" };
  }

  /**
   * Utilitaires de cache
   */
  private static generateCacheKey(options: SearchOptions): string {
    return `search:${Buffer.from(JSON.stringify(options)).toString("base64")}`;
  }

  private static async getCachedResult(
    key: string
  ): Promise<SearchResult<any> | null> {
    const cached = await this.redis.get(key);
    return cached ? JSON.parse(cached) : null;
  }

  private static async cacheResult(
    key: string,
    result: SearchResult<any>
  ): Promise<void> {
    await this.redis.setex(key, this.CACHE_TTL, JSON.stringify(result));
  }

  private static normalizeQuery(query: string): string {
    return query.toLowerCase().trim().replace(/\s+/g, " ");
  }

  private static extractTerms(query: string): string[] {
    return this.normalizeQuery(query)
      .split(" ")
      .filter((term) => term.length > 1);
  }

  private static buildFuzzyPattern(query: string): string {
    // Génère un pattern regex pour la recherche floue
    return query.split("").join(".*?");
  }
}
```

---

## 🥉 Solution 4 : Upload de Fichiers (Bronze)

### 4.1 Middleware d'Upload

```typescript
// src/middleware/upload.middleware.ts
import multer from "multer";
import sharp from "sharp";
import { v4 as uuidv4 } from "uuid";
import path from "path";
import fs from "fs/promises";
import { Request, Response, NextFunction } from "express";

export interface UploadConfig {
  destination: string;
  maxFileSize: number;
  allowedMimeTypes: string[];
  allowedExtensions: string[];
  imageProcessing?: {
    resize?: { width: number; height: number };
    quality?: number;
    format?: "jpeg" | "png" | "webp";
    thumbnail?: { width: number; height: number };
  };
}

export interface ProcessedFile {
  originalName: string;
  filename: string;
  path: string;
  size: number;
  mimeType: string;
  extension: string;
  checksum: string;
  metadata?: any;
  thumbnail?: {
    filename: string;
    path: string;
    size: number;
  };
}

export class UploadMiddleware {
  private static readonly configs: Record<string, UploadConfig> = {
    images: {
      destination: "./uploads/images/",
      maxFileSize: 5 * 1024 * 1024, // 5MB
      allowedMimeTypes: ["image/jpeg", "image/png", "image/gif", "image/webp"],
      allowedExtensions: [".jpg", ".jpeg", ".png", ".gif", ".webp"],
      imageProcessing: {
        resize: { width: 1200, height: 1200 },
        quality: 85,
        format: "jpeg",
        thumbnail: { width: 300, height: 300 },
      },
    },
    documents: {
      destination: "./uploads/documents/",
      maxFileSize: 10 * 1024 * 1024, // 10MB
      allowedMimeTypes: [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ],
      allowedExtensions: [".pdf", ".doc", ".docx"],
    },
    avatars: {
      destination: "./uploads/avatars/",
      maxFileSize: 2 * 1024 * 1024, // 2MB
      allowedMimeTypes: ["image/jpeg", "image/png"],
      allowedExtensions: [".jpg", ".jpeg", ".png"],
      imageProcessing: {
        resize: { width: 400, height: 400 },
        quality: 90,
        format: "jpeg",
        thumbnail: { width: 100, height: 100 },
      },
    },
  };

  /**
   * Crée un middleware d'upload pour un type de fichier donné
   */
  static create(type: keyof typeof UploadMiddleware.configs) {
    const config = this.configs[type];
    if (!config) {
      throw new Error(`Upload configuration not found for type: ${type}`);
    }

    // Configuration du storage Multer
    const storage = multer.diskStorage({
      destination: async (req, file, cb) => {
        try {
          await fs.mkdir(config.destination, { recursive: true });
          cb(null, config.destination);
        } catch (error) {
          cb(error as Error, "");
        }
      },
      filename: (req, file, cb) => {
        const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
        cb(null, uniqueName);
      },
    });

    // Configuration des filtres
    const fileFilter = (
      req: Request,
      file: Express.Multer.File,
      cb: multer.FileFilterCallback
    ) => {
      // Validation du type MIME
      if (!config.allowedMimeTypes.includes(file.mimetype)) {
        return cb(
          new Error(
            `File type ${
              file.mimetype
            } not allowed. Allowed types: ${config.allowedMimeTypes.join(", ")}`
          )
        );
      }

      // Validation de l'extension
      const extension = path.extname(file.originalname).toLowerCase();
      if (!config.allowedExtensions.includes(extension)) {
        return cb(
          new Error(
            `File extension ${extension} not allowed. Allowed extensions: ${config.allowedExtensions.join(
              ", "
            )}`
          )
        );
      }

      cb(null, true);
    };

    const upload = multer({
      storage,
      fileFilter,
      limits: {
        fileSize: config.maxFileSize,
        files: 5, // Maximum 5 fichiers par requête
      },
    });

    // Middleware de traitement après upload
    return {
      single: (fieldName: string) => [
        upload.single(fieldName),
        this.processUploadedFiles(config),
      ],
      multiple: (fieldName: string, maxCount: number = 5) => [
        upload.array(fieldName, maxCount),
        this.processUploadedFiles(config),
      ],
      fields: (fields: Array<{ name: string; maxCount?: number }>) => [
        upload.fields(fields),
        this.processUploadedFiles(config),
      ],
    };
  }

  /**
   * Middleware de traitement des fichiers uploadés
   */
  private static processUploadedFiles(config: UploadConfig) {
    return async (req: Request, res: Response, next: NextFunction) => {
      try {
        const files = this.extractFiles(req);
        const processedFiles: ProcessedFile[] = [];

        for (const file of files) {
          const processedFile = await this.processFile(file, config);
          processedFiles.push(processedFile);
        }

        // Ajout des fichiers traités à la requête
        (req as any).processedFiles = processedFiles;

        next();
      } catch (error) {
        // Nettoyage des fichiers en cas d'erreur
        await this.cleanupFiles(this.extractFiles(req));
        next(error);
      }
    };
  }

  /**
   * Traitement d'un fichier individuel
   */
  private static async processFile(
    file: Express.Multer.File,
    config: UploadConfig
  ): Promise<ProcessedFile> {
    const processedFile: ProcessedFile = {
      originalName: file.originalname,
      filename: file.filename,
      path: file.path,
      size: file.size,
      mimeType: file.mimetype,
      extension: path.extname(file.originalname).toLowerCase(),
      checksum: await this.calculateChecksum(file.path),
    };

    // Traitement des images si configuré
    if (config.imageProcessing && file.mimetype.startsWith("image/")) {
      const imageProcessing = await this.processImage(
        file.path,
        config.imageProcessing
      );
      processedFile.metadata = imageProcessing.metadata;
      processedFile.thumbnail = imageProcessing.thumbnail;
    }

    return processedFile;
  }

  /**
   * Traitement d'images avec Sharp
   */
  private static async processImage(
    filePath: string,
    processingConfig: NonNullable<UploadConfig["imageProcessing"]>
  ) {
    const image = sharp(filePath);
    const metadata = await image.metadata();

    // Redimensionnement si nécessaire
    if (processingConfig.resize) {
      await image
        .resize(processingConfig.resize.width, processingConfig.resize.height, {
          fit: "inside",
          withoutEnlargement: true,
        })
        .jpeg({ quality: processingConfig.quality || 85 })
        .toFile(filePath + ".processed");

      // Remplacement du fichier original
      await fs.rename(filePath + ".processed", filePath);
    }

    // Génération de thumbnail
    let thumbnail;
    if (processingConfig.thumbnail) {
      const thumbnailPath = filePath.replace(/(\.[^.]+)$/, "_thumb$1");
      const thumbnailBuffer = await image
        .resize(
          processingConfig.thumbnail.width,
          processingConfig.thumbnail.height,
          {
            fit: "cover",
          }
        )
        .jpeg({ quality: 80 })
        .toBuffer();

      await fs.writeFile(thumbnailPath, thumbnailBuffer);

      thumbnail = {
        filename: path.basename(thumbnailPath),
        path: thumbnailPath,
        size: thumbnailBuffer.length,
      };
    }

    return {
      metadata: {
        width: metadata.width,
        height: metadata.height,
        format: metadata.format,
        channels: metadata.channels,
        hasAlpha: metadata.hasAlpha,
      },
      thumbnail,
    };
  }

  /**
   * Calcul du checksum d'un fichier
   */
  private static async calculateChecksum(filePath: string): Promise<string> {
    const crypto = await import("crypto");
    const fileBuffer = await fs.readFile(filePath);
    return crypto.createHash("sha256").update(fileBuffer).digest("hex");
  }

  /**
   * Extraction des fichiers de la requête
   */
  private static extractFiles(req: Request): Express.Multer.File[] {
    const files: Express.Multer.File[] = [];

    if (req.file) {
      files.push(req.file);
    }

    if (req.files) {
      if (Array.isArray(req.files)) {
        files.push(...req.files);
      } else {
        Object.values(req.files).forEach((fileArray) => {
          if (Array.isArray(fileArray)) {
            files.push(...fileArray);
          }
        });
      }
    }

    return files;
  }

  /**
   * Nettoyage des fichiers en cas d'erreur
   */
  private static async cleanupFiles(
    files: Express.Multer.File[]
  ): Promise<void> {
    for (const file of files) {
      try {
        await fs.unlink(file.path);
        // Nettoyage du thumbnail s'il existe
        const thumbnailPath = file.path.replace(/(\.[^.]+)$/, "_thumb$1");
        try {
          await fs.unlink(thumbnailPath);
        } catch {
          // Ignore si le thumbnail n'existe pas
        }
      } catch (error) {
        console.error(`Failed to cleanup file: ${file.path}`, error);
      }
    }
  }
}
```

### 4.2 Service de Gestion des Fichiers

```typescript
// src/services/file.service.ts
import { ProcessedFile } from "../middleware/upload.middleware.js";
import fs from "fs/promises";
import path from "path";

export interface FileDocument {
  _id: string;
  originalName: string;
  filename: string;
  path: string;
  url: string;
  size: number;
  mimeType: string;
  extension: string;
  checksum: string;
  metadata?: any;
  thumbnail?: {
    filename: string;
    path: string;
    url: string;
    size: number;
  };
  uploadedBy: string;
  uploadedAt: Date;
  downloads: number;
  isPublic: boolean;
}

export class FileService {
  private static model: any; // Votre modèle de base de données

  /**
   * Sauvegarde les métadonnées des fichiers en base
   */
  static async saveFiles(
    processedFiles: ProcessedFile[],
    uploadedBy: string,
    isPublic: boolean = false
  ): Promise<FileDocument[]> {
    const savedFiles: FileDocument[] = [];

    for (const file of processedFiles) {
      const fileDoc: Omit<FileDocument, "_id"> = {
        originalName: file.originalName,
        filename: file.filename,
        path: file.path,
        url: this.generateFileUrl(file.filename),
        size: file.size,
        mimeType: file.mimeType,
        extension: file.extension,
        checksum: file.checksum,
        metadata: file.metadata,
        thumbnail: file.thumbnail
          ? {
              filename: file.thumbnail.filename,
              path: file.thumbnail.path,
              url: this.generateFileUrl(file.thumbnail.filename),
              size: file.thumbnail.size,
            }
          : undefined,
        uploadedBy,
        uploadedAt: new Date(),
        downloads: 0,
        isPublic,
      };

      const saved = await this.model.create(fileDoc);
      savedFiles.push(saved);
    }

    return savedFiles;
  }

  /**
   * Récupération d'un fichier par ID
   */
  static async getFileById(
    fileId: string,
    userId?: string
  ): Promise<FileDocument | null> {
    const file = await this.model.findById(fileId);

    if (!file) return null;

    // Vérification des permissions
    if (!file.isPublic && file.uploadedBy !== userId) {
      throw new Error("Access denied");
    }

    return file;
  }

  /**
   * Servir un fichier avec gestion des permissions
   */
  static async serveFile(fileId: string, userId?: string) {
    const file = await this.getFileById(fileId, userId);

    if (!file) {
      throw new Error("File not found");
    }

    // Vérification de l'existence du fichier sur le disque
    try {
      await fs.access(file.path);
    } catch {
      throw new Error("File not found on disk");
    }

    // Incrémentation du compteur de téléchargements
    await this.model.findByIdAndUpdate(fileId, { $inc: { downloads: 1 } });

    return {
      path: file.path,
      filename: file.originalName,
      mimeType: file.mimeType,
      size: file.size,
    };
  }

  /**
   * Suppression d'un fichier
   */
  static async deleteFile(fileId: string, userId: string): Promise<void> {
    const file = await this.model.findById(fileId);

    if (!file) {
      throw new Error("File not found");
    }

    if (file.uploadedBy !== userId) {
      throw new Error("Access denied");
    }

    // Suppression du fichier sur le disque
    try {
      await fs.unlink(file.path);

      // Suppression du thumbnail s'il existe
      if (file.thumbnail) {
        try {
          await fs.unlink(file.thumbnail.path);
        } catch {
          // Ignore si le thumbnail n'existe pas
        }
      }
    } catch (error) {
      console.error(`Failed to delete file from disk: ${file.path}`, error);
    }

    // Suppression de l'enregistrement en base
    await this.model.findByIdAndDelete(fileId);
  }

  /**
   * Listage des fichiers d'un utilisateur
   */
  static async getUserFiles(
    userId: string,
    options: {
      page?: number;
      limit?: number;
      mimeType?: string;
      search?: string;
    } = {}
  ) {
    const query: any = { uploadedBy: userId };

    if (options.mimeType) {
      query.mimeType = { $regex: options.mimeType, $options: "i" };
    }

    if (options.search) {
      query.originalName = { $regex: options.search, $options: "i" };
    }

    const page = options.page || 1;
    const limit = options.limit || 20;
    const skip = (page - 1) * limit;

    const [files, total] = await Promise.all([
      this.model
        .find(query)
        .sort({ uploadedAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.model.countDocuments(query),
    ]);

    return {
      files,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: limit,
      },
    };
  }

  /**
   * Nettoyage des fichiers orphelins
   */
  static async cleanupOrphanedFiles(): Promise<number> {
    const uploadDirs = [
      "./uploads/images/",
      "./uploads/documents/",
      "./uploads/avatars/",
    ];
    let deletedCount = 0;

    for (const dir of uploadDirs) {
      try {
        const files = await fs.readdir(dir);

        for (const filename of files) {
          const filePath = path.join(dir, filename);

          // Vérification si le fichier existe en base
          const existsInDB = await this.model.exists({
            $or: [{ filename }, { "thumbnail.filename": filename }],
          });

          if (!existsInDB) {
            await fs.unlink(filePath);
            deletedCount++;
            console.log(`Deleted orphaned file: ${filePath}`);
          }
        }
      } catch (error) {
        console.error(`Error cleaning directory ${dir}:`, error);
      }
    }

    return deletedCount;
  }

  /**
   * Génération de l'URL publique d'un fichier
   */
  private static generateFileUrl(filename: string): string {
    const baseUrl = process.env.BASE_URL || "http://localhost:3000";
    return `${baseUrl}/api/files/serve/${filename}`;
  }

  /**
   * Validation de la taille totale des fichiers d'un utilisateur
   */
  static async validateUserQuota(
    userId: string,
    newFileSize: number
  ): Promise<boolean> {
    const maxQuota = 100 * 1024 * 1024; // 100MB par utilisateur

    const pipeline = [
      { $match: { uploadedBy: userId } },
      { $group: { _id: null, totalSize: { $sum: "$size" } } },
    ];

    const result = await this.model.aggregate(pipeline);
    const currentUsage = result[0]?.totalSize || 0;

    return currentUsage + newFileSize <= maxQuota;
  }
}
```

---

_Cette solution continue avec les autres exercices... Le document complet ferait plus de 10 000 lignes. Souhaitez-vous que je continue avec les solutions restantes (Versioning, Rate Limiting, Documentation) ou préférez-vous passer aux objectifs et au TP-08 ?_
