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

## 📋 Solutions Bronze - Versioning API

### Solution Exercice B7.1 - Headers de Version

```typescript
// src/middleware/versioning.ts
import { Request, Response, NextFunction } from "express";

export interface VersionedRequest extends Request {
  apiVersion: string;
}

export const versionMiddleware = (
  req: VersionedRequest,
  res: Response,
  next: NextFunction
): void => {
  // Version par défaut
  let version = "1.0";

  // Priorité aux headers API-Version
  if (req.headers["api-version"]) {
    version = req.headers["api-version"] as string;
  }
  // Fallback sur Accept header
  else if (req.headers.accept?.includes("application/vnd.api")) {
    const match = req.headers.accept.match(/version=(\d+\.\d+)/);
    if (match) {
      version = match[1];
    }
  }

  // Validation de la version
  const supportedVersions = ["1.0", "1.1", "2.0"];
  if (!supportedVersions.includes(version)) {
    res.status(400).json({
      error: "Version non supportée",
      supportedVersions,
      requested: version,
    });
    return;
  }

  req.apiVersion = version;
  res.setHeader("API-Version", version);
  next();
};
```

### Solution Exercice B7.2 - Routage par Version

```typescript
// src/routes/versioned/index.ts
import { Router } from "express";
import { VersionedRequest } from "../../middleware/versioning";
import { v1ProductRoutes } from "./v1/products";
import { v2ProductRoutes } from "./v2/products";

export const versionedRoutes = Router();

versionedRoutes.use("/products", (req: VersionedRequest, res, next) => {
  switch (req.apiVersion) {
    case "1.0":
    case "1.1":
      return v1ProductRoutes(req, res, next);
    case "2.0":
      return v2ProductRoutes(req, res, next);
    default:
      res.status(400).json({ error: "Version non supportée" });
  }
});
```

```typescript
// src/routes/versioned/v1/products.ts
import { Router } from "express";
import { ProductService } from "../../../services/ProductService";

export const v1ProductRoutes = Router();

// Format V1 - Structure simple
v1ProductRoutes.get("/", async (req, res) => {
  try {
    const products = await ProductService.getAll();

    // Format V1
    const v1Products = products.map((product) => ({
      id: product.id,
      name: product.name,
      price: product.price,
      description: product.description,
      category: product.category,
      stock: product.stock,
    }));

    res.json({
      success: true,
      data: v1Products,
      total: v1Products.length,
    });
  } catch (error) {
    res.status(500).json({ error: "Erreur serveur" });
  }
});

v1ProductRoutes.get("/:id", async (req, res) => {
  try {
    const product = await ProductService.getById(req.params.id);
    if (!product) {
      return res.status(404).json({ error: "Produit non trouvé" });
    }

    // Format V1 simple
    res.json({
      success: true,
      data: {
        id: product.id,
        name: product.name,
        price: product.price,
        description: product.description,
        category: product.category,
        stock: product.stock,
      },
    });
  } catch (error) {
    res.status(500).json({ error: "Erreur serveur" });
  }
});
```

```typescript
// src/routes/versioned/v2/products.ts
import { Router } from "express";
import { ProductService } from "../../../services/ProductService";

export const v2ProductRoutes = Router();

// Format V2 - Structure enrichie avec métadonnées
v2ProductRoutes.get("/", async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const { products, total, hasMore } = await ProductService.getPaginated(
      page,
      limit
    );

    // Format V2 avec pagination et métadonnées
    res.json({
      apiVersion: "2.0",
      timestamp: new Date().toISOString(),
      data: {
        products: products.map((product) => ({
          id: product.id,
          name: product.name,
          price: {
            amount: product.price,
            currency: "EUR",
            formatted: `${product.price}€`,
          },
          description: product.description,
          category: {
            id: product.categoryId,
            name: product.category,
            slug: product.category.toLowerCase().replace(/\s+/g, "-"),
          },
          inventory: {
            stock: product.stock,
            status: product.stock > 0 ? "available" : "out_of_stock",
            lowStock: product.stock < 10,
          },
          images: product.images || [],
          tags: product.tags || [],
          rating: product.rating || null,
          createdAt: product.createdAt,
          updatedAt: product.updatedAt,
        })),
      },
      pagination: {
        page,
        limit,
        total,
        hasMore,
        totalPages: Math.ceil(total / limit),
      },
      links: {
        self: `/api/v2/products?page=${page}&limit=${limit}`,
        next: hasMore
          ? `/api/v2/products?page=${page + 1}&limit=${limit}`
          : null,
        prev:
          page > 1 ? `/api/v2/products?page=${page - 1}&limit=${limit}` : null,
      },
    });
  } catch (error) {
    res.status(500).json({
      error: "Erreur serveur",
      apiVersion: "2.0",
      timestamp: new Date().toISOString(),
    });
  }
});
```

## 🥈 Solutions Silver - Rate Limiting

### Solution Exercice S7.1 - Rate Limiting Basique

```typescript
// src/middleware/rateLimiter.ts
import { Request, Response, NextFunction } from "express";
import { Redis } from "ioredis";

interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  keyGenerator?: (req: Request) => string;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
}

export class RateLimiter {
  private redis: Redis;
  private config: RateLimitConfig;

  constructor(redis: Redis, config: RateLimitConfig) {
    this.redis = redis;
    this.config = config;
  }

  middleware() {
    return async (req: Request, res: Response, next: NextFunction) => {
      try {
        const key = this.generateKey(req);
        const window = Math.floor(Date.now() / this.config.windowMs);
        const redisKey = `rate_limit:${key}:${window}`;

        // Incrémenter le compteur
        const current = await this.redis.incr(redisKey);

        // Définir l'expiration sur la première requête
        if (current === 1) {
          await this.redis.expire(
            redisKey,
            Math.ceil(this.config.windowMs / 1000)
          );
        }

        // Calculer les headers
        const remaining = Math.max(0, this.config.maxRequests - current);
        const resetTime = (window + 1) * this.config.windowMs;

        // Ajouter les headers de rate limiting
        res.set({
          "X-RateLimit-Limit": this.config.maxRequests.toString(),
          "X-RateLimit-Remaining": remaining.toString(),
          "X-RateLimit-Reset": new Date(resetTime).toISOString(),
          "X-RateLimit-Window": this.config.windowMs.toString(),
        });

        // Vérifier la limite
        if (current > this.config.maxRequests) {
          const retryAfter = Math.ceil((resetTime - Date.now()) / 1000);

          res.status(429).json({
            error: "Too Many Requests",
            message: `Limite de ${this.config.maxRequests} requêtes par ${
              this.config.windowMs / 1000
            }s dépassée`,
            retryAfter,
            resetTime: new Date(resetTime).toISOString(),
          });
          return;
        }

        next();
      } catch (error) {
        console.error("Erreur rate limiting:", error);
        next(); // Continue en cas d'erreur Redis
      }
    };
  }

  private generateKey(req: Request): string {
    if (this.config.keyGenerator) {
      return this.config.keyGenerator(req);
    }

    // Clé par défaut basée sur l'IP
    return req.ip || "unknown";
  }
}

// Configuration par défaut
export const createBasicRateLimiter = (redis: Redis) => {
  return new RateLimiter(redis, {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 100,
  });
};

// Rate limiter pour authentification
export const createAuthRateLimiter = (redis: Redis) => {
  return new RateLimiter(redis, {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 5,
    keyGenerator: (req) => `auth:${req.ip}`,
  });
};

// Rate limiter par utilisateur
export const createUserRateLimiter = (redis: Redis) => {
  return new RateLimiter(redis, {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 60,
    keyGenerator: (req) => {
      const userId = req.user?.id || req.ip;
      return `user:${userId}`;
    },
  });
};
```

### Solution Exercice S7.2 - Rate Limiting Adaptatif

```typescript
// src/middleware/adaptiveRateLimit.ts
import { Request, Response, NextFunction } from "express";
import { Redis } from "ioredis";

interface UserTier {
  name: string;
  requestsPerMinute: number;
  requestsPerHour: number;
  requestsPerDay: number;
  burstLimit: number;
}

const USER_TIERS: Record<string, UserTier> = {
  free: {
    name: "Free",
    requestsPerMinute: 10,
    requestsPerHour: 200,
    requestsPerDay: 1000,
    burstLimit: 20,
  },
  premium: {
    name: "Premium",
    requestsPerMinute: 60,
    requestsPerHour: 2000,
    requestsPerDay: 10000,
    burstLimit: 100,
  },
  enterprise: {
    name: "Enterprise",
    requestsPerMinute: 200,
    requestsPerHour: 10000,
    requestsPerDay: 100000,
    burstLimit: 500,
  },
};

export class AdaptiveRateLimiter {
  private redis: Redis;

  constructor(redis: Redis) {
    this.redis = redis;
  }

  middleware() {
    return async (req: Request, res: Response, next: NextFunction) => {
      try {
        const userId = req.user?.id || req.ip;
        const userTier = this.getUserTier(req);
        const tier = USER_TIERS[userTier];

        // Vérification multi-window
        const checks = await Promise.all([
          this.checkLimit(userId, "minute", tier.requestsPerMinute, 60),
          this.checkLimit(userId, "hour", tier.requestsPerHour, 3600),
          this.checkLimit(userId, "day", tier.requestsPerDay, 86400),
          this.checkBurstLimit(userId, tier.burstLimit),
        ]);

        const [minuteCheck, hourCheck, dayCheck, burstCheck] = checks;

        // Trouver la limite la plus restrictive
        const mostRestrictive = [
          minuteCheck,
          hourCheck,
          dayCheck,
          burstCheck,
        ].filter((check) => !check.allowed)[0];

        if (mostRestrictive) {
          res.status(429).json({
            error: "Rate limit exceeded",
            tier: tier.name,
            limit: mostRestrictive.limit,
            window: mostRestrictive.window,
            retryAfter: mostRestrictive.retryAfter,
            usage: {
              minute: minuteCheck.current,
              hour: hourCheck.current,
              day: dayCheck.current,
              burst: burstCheck.current,
            },
            limits: {
              minute: tier.requestsPerMinute,
              hour: tier.requestsPerHour,
              day: tier.requestsPerDay,
              burst: tier.burstLimit,
            },
          });
          return;
        }

        // Ajouter les headers informatifs
        res.set({
          "X-RateLimit-Tier": tier.name,
          "X-RateLimit-Minute-Limit": tier.requestsPerMinute.toString(),
          "X-RateLimit-Minute-Remaining": (
            tier.requestsPerMinute - minuteCheck.current
          ).toString(),
          "X-RateLimit-Hour-Limit": tier.requestsPerHour.toString(),
          "X-RateLimit-Hour-Remaining": (
            tier.requestsPerHour - hourCheck.current
          ).toString(),
          "X-RateLimit-Day-Limit": tier.requestsPerDay.toString(),
          "X-RateLimit-Day-Remaining": (
            tier.requestsPerDay - dayCheck.current
          ).toString(),
        });

        next();
      } catch (error) {
        console.error("Erreur adaptive rate limiting:", error);
        next();
      }
    };
  }

  private async checkLimit(
    userId: string,
    window: string,
    limit: number,
    seconds: number
  ) {
    const now = Date.now();
    const windowStart = Math.floor(now / (seconds * 1000)) * seconds * 1000;
    const key = `rate_limit:${userId}:${window}:${windowStart}`;

    const current = await this.redis.incr(key);
    if (current === 1) {
      await this.redis.expire(key, seconds);
    }

    return {
      allowed: current <= limit,
      current,
      limit,
      window,
      retryAfter: windowStart + seconds * 1000 - now,
    };
  }

  private async checkBurstLimit(userId: string, limit: number) {
    const now = Date.now();
    const window = 10000; // 10 secondes pour le burst
    const windowStart = Math.floor(now / window) * window;
    const key = `burst_limit:${userId}:${windowStart}`;

    const current = await this.redis.incr(key);
    if (current === 1) {
      await this.redis.expire(key, 10);
    }

    return {
      allowed: current <= limit,
      current,
      limit,
      window: "burst",
      retryAfter: windowStart + window - now,
    };
  }

  private getUserTier(req: Request): string {
    if (req.user?.tier) {
      return req.user.tier;
    }

    // Détection basée sur l'API key ou autres critères
    const apiKey = req.headers["x-api-key"];
    if (apiKey) {
      // Logique pour déterminer le tier basé sur l'API key
      return "premium";
    }

    return "free";
  }
}
```

## 🥇 Solutions Gold - Documentation Interactive

### Solution Exercice G7.1 - Documentation OpenAPI

```typescript
// src/docs/swagger.ts
import swaggerJSDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import { Express } from "express";

const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "API E-commerce Universal",
      version: "2.0.0",
      description: `
        API REST complète pour une plateforme e-commerce moderne.
        
        ## Fonctionnalités
        
        - 🛍️ Gestion des produits avec recherche avancée
        - 👥 Authentification JWT et gestion des utilisateurs  
        - 🛒 Panier et commandes
        - 💳 Intégration paiements
        - 📊 Analytics et reporting
        - 🔍 Recherche intelligente avec facettes
        - 📤 Upload de fichiers optimisé
        - 🚀 Cache multi-niveaux
        - 📈 Rate limiting adaptatif
        - 🔄 Versioning API
        
        ## Authentification
        
        Cette API utilise JWT (JSON Web Tokens) pour l'authentification.
        Incluez le token dans le header Authorization: \`Bearer <token>\`
        
        ## Rate Limiting
        
        - **Free**: 10 req/min, 200 req/h, 1000 req/jour
        - **Premium**: 60 req/min, 2000 req/h, 10000 req/jour  
        - **Enterprise**: 200 req/min, 10000 req/h, 100000 req/jour
        
        ## Versioning
        
        Utilisez le header \`API-Version\` pour spécifier la version:
        - v1.0: Format simple
        - v2.0: Format enrichi avec métadonnées
      `,
      contact: {
        name: "Support API",
        email: "support@example.com",
        url: "https://example.com/support",
      },
      license: {
        name: "MIT",
        url: "https://opensource.org/licenses/MIT",
      },
    },
    servers: [
      {
        url: "http://localhost:3000/api",
        description: "Serveur de développement",
      },
      {
        url: "https://api-staging.example.com",
        description: "Serveur de staging",
      },
      {
        url: "https://api.example.com",
        description: "Serveur de production",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "Token JWT obtenu via /auth/login",
        },
        apiKey: {
          type: "apiKey",
          in: "header",
          name: "X-API-Key",
          description: "Clé API pour les intégrations",
        },
      },
      schemas: {
        User: {
          type: "object",
          required: ["email", "firstName", "lastName"],
          properties: {
            id: {
              type: "string",
              format: "uuid",
              description: "Identifiant unique de l'utilisateur",
            },
            email: {
              type: "string",
              format: "email",
              description: "Adresse email (unique)",
            },
            firstName: {
              type: "string",
              minLength: 2,
              maxLength: 50,
              description: "Prénom",
            },
            lastName: {
              type: "string",
              minLength: 2,
              maxLength: 50,
              description: "Nom de famille",
            },
            role: {
              type: "string",
              enum: ["user", "admin", "moderator"],
              description: "Rôle de l'utilisateur",
            },
            tier: {
              type: "string",
              enum: ["free", "premium", "enterprise"],
              description: "Niveau d'abonnement",
            },
            avatar: {
              type: "string",
              format: "uri",
              description: "URL de l'avatar",
            },
            isActive: {
              type: "boolean",
              description: "Compte actif ou suspendu",
            },
            createdAt: {
              type: "string",
              format: "date-time",
              description: "Date de création",
            },
            updatedAt: {
              type: "string",
              format: "date-time",
              description: "Dernière modification",
            },
          },
        },
        Product: {
          type: "object",
          required: ["name", "price", "categoryId"],
          properties: {
            id: {
              type: "string",
              format: "uuid",
              description: "Identifiant unique du produit",
            },
            name: {
              type: "string",
              minLength: 2,
              maxLength: 200,
              description: "Nom du produit",
            },
            description: {
              type: "string",
              maxLength: 2000,
              description: "Description détaillée",
            },
            price: {
              type: "number",
              minimum: 0,
              multipleOf: 0.01,
              description: "Prix en euros",
            },
            categoryId: {
              type: "string",
              format: "uuid",
              description: "ID de la catégorie",
            },
            category: {
              type: "string",
              description: "Nom de la catégorie",
            },
            stock: {
              type: "integer",
              minimum: 0,
              description: "Quantité en stock",
            },
            images: {
              type: "array",
              items: {
                type: "string",
                format: "uri",
              },
              description: "URLs des images",
            },
            tags: {
              type: "array",
              items: {
                type: "string",
              },
              description: "Tags pour la recherche",
            },
            rating: {
              type: "number",
              minimum: 0,
              maximum: 5,
              description: "Note moyenne",
            },
            isActive: {
              type: "boolean",
              description: "Produit visible dans le catalogue",
            },
          },
        },
        Order: {
          type: "object",
          properties: {
            id: {
              type: "string",
              format: "uuid",
            },
            userId: {
              type: "string",
              format: "uuid",
            },
            status: {
              type: "string",
              enum: [
                "pending",
                "confirmed",
                "shipped",
                "delivered",
                "cancelled",
              ],
            },
            items: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  productId: { type: "string", format: "uuid" },
                  quantity: { type: "integer", minimum: 1 },
                  price: { type: "number", minimum: 0 },
                  total: { type: "number", minimum: 0 },
                },
              },
            },
            totalAmount: {
              type: "number",
              minimum: 0,
            },
            shippingAddress: {
              type: "object",
              properties: {
                street: { type: "string" },
                city: { type: "string" },
                postalCode: { type: "string" },
                country: { type: "string" },
              },
            },
          },
        },
        Error: {
          type: "object",
          properties: {
            error: {
              type: "string",
              description: "Message d'erreur",
            },
            code: {
              type: "string",
              description: "Code d'erreur",
            },
            details: {
              type: "object",
              description: "Détails supplémentaires",
            },
            timestamp: {
              type: "string",
              format: "date-time",
            },
          },
        },
        Pagination: {
          type: "object",
          properties: {
            page: {
              type: "integer",
              minimum: 1,
              description: "Page courante",
            },
            limit: {
              type: "integer",
              minimum: 1,
              maximum: 100,
              description: "Éléments par page",
            },
            total: {
              type: "integer",
              minimum: 0,
              description: "Total d'éléments",
            },
            totalPages: {
              type: "integer",
              minimum: 0,
              description: "Nombre total de pages",
            },
            hasMore: {
              type: "boolean",
              description: "Y a-t-il d'autres pages ?",
            },
          },
        },
      },
      responses: {
        BadRequest: {
          description: "Requête invalide",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/Error" },
              example: {
                error: "Données invalides",
                code: "VALIDATION_ERROR",
                details: {
                  field: "email",
                  message: "Format email invalide",
                },
              },
            },
          },
        },
        Unauthorized: {
          description: "Non autorisé",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/Error" },
              example: {
                error: "Token manquant ou invalide",
                code: "UNAUTHORIZED",
              },
            },
          },
        },
        Forbidden: {
          description: "Accès interdit",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/Error" },
              example: {
                error: "Permissions insuffisantes",
                code: "FORBIDDEN",
              },
            },
          },
        },
        NotFound: {
          description: "Ressource non trouvée",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/Error" },
              example: {
                error: "Ressource non trouvée",
                code: "NOT_FOUND",
              },
            },
          },
        },
        TooManyRequests: {
          description: "Trop de requêtes",
          headers: {
            "X-RateLimit-Limit": {
              schema: { type: "integer" },
              description: "Limite de requêtes",
            },
            "X-RateLimit-Remaining": {
              schema: { type: "integer" },
              description: "Requêtes restantes",
            },
            "X-RateLimit-Reset": {
              schema: { type: "string", format: "date-time" },
              description: "Reset de la limite",
            },
          },
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/Error" },
              example: {
                error: "Limite de requêtes dépassée",
                code: "RATE_LIMIT_EXCEEDED",
                retryAfter: 60,
              },
            },
          },
        },
        InternalServerError: {
          description: "Erreur serveur",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/Error" },
              example: {
                error: "Erreur interne du serveur",
                code: "INTERNAL_ERROR",
              },
            },
          },
        },
      },
      parameters: {
        PageParam: {
          name: "page",
          in: "query",
          description: "Numéro de page (défaut: 1)",
          schema: {
            type: "integer",
            minimum: 1,
            default: 1,
          },
        },
        LimitParam: {
          name: "limit",
          in: "query",
          description: "Éléments par page (défaut: 10, max: 100)",
          schema: {
            type: "integer",
            minimum: 1,
            maximum: 100,
            default: 10,
          },
        },
        SortParam: {
          name: "sort",
          in: "query",
          description: "Tri (ex: name:asc, price:desc)",
          schema: {
            type: "string",
            pattern: "^[a-zA-Z]+:(asc|desc)$",
          },
        },
        SearchParam: {
          name: "search",
          in: "query",
          description: "Terme de recherche",
          schema: {
            type: "string",
            minLength: 2,
            maxLength: 100,
          },
        },
      },
    },
    security: [{ bearerAuth: [] }],
    tags: [
      {
        name: "Auth",
        description: "Authentification et gestion des sessions",
      },
      {
        name: "Users",
        description: "Gestion des utilisateurs",
      },
      {
        name: "Products",
        description: "Catalogue des produits",
      },
      {
        name: "Orders",
        description: "Commandes et panier",
      },
      {
        name: "Search",
        description: "Recherche et filtrage",
      },
      {
        name: "Upload",
        description: "Upload de fichiers",
      },
      {
        name: "Analytics",
        description: "Statistiques et reporting",
      },
    ],
  },
  apis: ["./src/routes/*.ts", "./src/routes/**/*.ts", "./src/models/*.ts"],
};

const swaggerSpec = swaggerJSDoc(swaggerOptions);

export const setupSwagger = (app: Express): void => {
  // Documentation JSON
  app.get("/api/docs.json", (req, res) => {
    res.setHeader("Content-Type", "application/json");
    res.send(swaggerSpec);
  });

  // Interface Swagger UI
  app.use(
    "/api/docs",
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec, {
      explorer: true,
      customCss: `
      .swagger-ui .topbar { display: none; }
      .swagger-ui .info { margin: 20px 0; }
      .swagger-ui .scheme-container { margin: 20px 0; }
    `,
      customSiteTitle: "API E-commerce - Documentation",
      swaggerOptions: {
        persistAuthorization: true,
        displayRequestDuration: true,
        docExpansion: "list",
        filter: true,
        showExtensions: true,
        showCommonExtensions: true,
        tryItOutEnabled: true,
      },
    })
  );
};

export default swaggerSpec;
```

### Solution Exercice G7.2 - Documentation Routes Annotées

```typescript
// src/routes/products.ts avec annotations OpenAPI
import { Router } from "express";
import { ProductService } from "../services/ProductService";
import { auth } from "../middleware/auth";
import { validateRequest } from "../middleware/validation";
import { productSchemas } from "../schemas/productSchemas";

const router = Router();

/**
 * @openapi
 * /products:
 *   get:
 *     summary: Obtenir la liste des produits
 *     description: |
 *       Récupère une liste paginée de produits avec possibilité de filtrage et tri.
 *
 *       ## Filtres disponibles
 *       - `category`: Filtrer par catégorie
 *       - `minPrice` / `maxPrice`: Fourchette de prix
 *       - `inStock`: Produits en stock uniquement
 *       - `search`: Recherche textuelle
 *
 *       ## Tri disponible
 *       - `name:asc|desc`: Par nom
 *       - `price:asc|desc`: Par prix
 *       - `createdAt:asc|desc`: Par date de création
 *       - `rating:asc|desc`: Par note
 *     tags: [Products]
 *     parameters:
 *       - $ref: '#/components/parameters/PageParam'
 *       - $ref: '#/components/parameters/LimitParam'
 *       - $ref: '#/components/parameters/SortParam'
 *       - $ref: '#/components/parameters/SearchParam'
 *       - name: category
 *         in: query
 *         description: Filtrer par catégorie
 *         schema:
 *           type: string
 *       - name: minPrice
 *         in: query
 *         description: Prix minimum
 *         schema:
 *           type: number
 *           minimum: 0
 *       - name: maxPrice
 *         in: query
 *         description: Prix maximum
 *         schema:
 *           type: number
 *           minimum: 0
 *       - name: inStock
 *         in: query
 *         description: Produits en stock uniquement
 *         schema:
 *           type: boolean
 *     responses:
 *       200:
 *         description: Liste des produits
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Product'
 *                 pagination:
 *                   $ref: '#/components/schemas/Pagination'
 *                 filters:
 *                   type: object
 *                   description: Filtres appliqués
 *             examples:
 *               success:
 *                 summary: Succès avec produits
 *                 value:
 *                   success: true
 *                   data:
 *                     - id: "123e4567-e89b-12d3-a456-426614174000"
 *                       name: "iPhone 15 Pro"
 *                       price: 999.99
 *                       category: "Smartphones"
 *                       stock: 50
 *                   pagination:
 *                     page: 1
 *                     limit: 10
 *                     total: 150
 *                     totalPages: 15
 *                     hasMore: true
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       429:
 *         $ref: '#/components/responses/TooManyRequests'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get("/", async (req, res) => {
  // Implémentation...
});

/**
 * @openapi
 * /products/{id}:
 *   get:
 *     summary: Obtenir un produit par ID
 *     description: Récupère les détails complets d'un produit spécifique
 *     tags: [Products]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: Identifiant unique du produit
 *         schema:
 *           type: string
 *           format: uuid
 *         example: "123e4567-e89b-12d3-a456-426614174000"
 *     responses:
 *       200:
 *         description: Détails du produit
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Product'
 *             example:
 *               success: true
 *               data:
 *                 id: "123e4567-e89b-12d3-a456-426614174000"
 *                 name: "iPhone 15 Pro"
 *                 description: "Smartphone haut de gamme avec puce A17 Pro"
 *                 price: 999.99
 *                 category: "Smartphones"
 *                 stock: 50
 *                 images: ["https://example.com/image1.jpg"]
 *                 rating: 4.8
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.get("/:id", async (req, res) => {
  // Implémentation...
});

/**
 * @openapi
 * /products:
 *   post:
 *     summary: Créer un nouveau produit
 *     description: |
 *       Crée un nouveau produit dans le catalogue.
 *
 *       ## Permissions requises
 *       - Rôle: admin ou moderator
 *       - Token JWT valide
 *
 *       ## Validation
 *       - Nom unique dans la catégorie
 *       - Prix > 0
 *       - Catégorie existante
 *       - Images au format JPG/PNG uniquement
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, price, categoryId]
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 200
 *                 description: Nom du produit (unique dans la catégorie)
 *               description:
 *                 type: string
 *                 maxLength: 2000
 *                 description: Description détaillée
 *               price:
 *                 type: number
 *                 minimum: 0.01
 *                 multipleOf: 0.01
 *                 description: Prix en euros
 *               categoryId:
 *                 type: string
 *                 format: uuid
 *                 description: ID de la catégorie
 *               stock:
 *                 type: integer
 *                 minimum: 0
 *                 default: 0
 *                 description: Quantité en stock
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: uri
 *                 description: URLs des images
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Tags pour la recherche
 *           examples:
 *             smartphone:
 *               summary: Nouveau smartphone
 *               value:
 *                 name: "Samsung Galaxy S24"
 *                 description: "Smartphone Android dernière génération"
 *                 price: 899.99
 *                 categoryId: "cat-smartphones-123"
 *                 stock: 100
 *                 images: ["https://example.com/galaxy-s24.jpg"]
 *                 tags: ["android", "samsung", "5g"]
 *     responses:
 *       201:
 *         description: Produit créé avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Product'
 *                 message:
 *                   type: string
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       409:
 *         description: Conflit - Produit déjà existant
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: "Un produit avec ce nom existe déjà dans cette catégorie"
 *               code: "DUPLICATE_PRODUCT"
 */
router.post(
  "/",
  auth,
  validateRequest(productSchemas.create),
  async (req, res) => {
    // Implémentation...
  }
);

export default router;
```

### Solution Exercice G7.3 - Tests de Documentation

```typescript
// src/tests/documentation.test.ts
import request from "supertest";
import { app } from "../app";
import swaggerSpec from "../docs/swagger";
import { validate } from "jsonschema";

describe("Documentation API", () => {
  describe("Swagger Spec", () => {
    test("should have valid OpenAPI 3.0 specification", () => {
      expect(swaggerSpec.openapi).toBe("3.0.0");
      expect(swaggerSpec.info).toBeDefined();
      expect(swaggerSpec.info.title).toBeDefined();
      expect(swaggerSpec.info.version).toBeDefined();
      expect(swaggerSpec.paths).toBeDefined();
    });

    test("should have all required components", () => {
      expect(swaggerSpec.components.schemas).toBeDefined();
      expect(swaggerSpec.components.responses).toBeDefined();
      expect(swaggerSpec.components.parameters).toBeDefined();
      expect(swaggerSpec.components.securitySchemes).toBeDefined();
    });

    test("should have consistent error responses", () => {
      const errorResponses = [
        "BadRequest",
        "Unauthorized",
        "Forbidden",
        "NotFound",
        "TooManyRequests",
        "InternalServerError",
      ];

      errorResponses.forEach((responseKey) => {
        expect(swaggerSpec.components.responses[responseKey]).toBeDefined();
      });
    });
  });

  describe("Documentation Endpoints", () => {
    test("GET /api/docs.json should return OpenAPI spec", async () => {
      const response = await request(app)
        .get("/api/docs.json")
        .expect("Content-Type", /json/)
        .expect(200);

      expect(response.body.openapi).toBe("3.0.0");
      expect(response.body.info).toBeDefined();
      expect(response.body.paths).toBeDefined();
    });

    test("GET /api/docs should return Swagger UI", async () => {
      const response = await request(app)
        .get("/api/docs/")
        .expect("Content-Type", /html/)
        .expect(200);

      expect(response.text).toContain("swagger-ui");
      expect(response.text).toContain("API E-commerce");
    });
  });

  describe("Response Schema Validation", () => {
    test("Products list response should match schema", async () => {
      const response = await request(app)
        .get("/api/products?limit=5")
        .expect(200);

      const schema = {
        type: "object",
        required: ["success", "data", "pagination"],
        properties: {
          success: { type: "boolean" },
          data: {
            type: "array",
            items: {
              type: "object",
              required: ["id", "name", "price"],
              properties: {
                id: { type: "string" },
                name: { type: "string" },
                price: { type: "number" },
              },
            },
          },
          pagination: {
            type: "object",
            required: ["page", "limit", "total"],
            properties: {
              page: { type: "number" },
              limit: { type: "number" },
              total: { type: "number" },
            },
          },
        },
      };

      const validation = validate(response.body, schema);
      expect(validation.valid).toBe(true);
    });

    test("Error responses should match error schema", async () => {
      const response = await request(app)
        .get("/api/products/invalid-id")
        .expect(404);

      const errorSchema = {
        type: "object",
        required: ["error"],
        properties: {
          error: { type: "string" },
          code: { type: "string" },
          details: { type: "object" },
          timestamp: { type: "string" },
        },
      };

      const validation = validate(response.body, errorSchema);
      expect(validation.valid).toBe(true);
    });
  });

  describe("Examples Validation", () => {
    test("All schema examples should be valid", () => {
      const schemas = swaggerSpec.components.schemas;

      Object.entries(schemas).forEach(([schemaName, schema]: [string, any]) => {
        if (schema.example) {
          const validation = validate(schema.example, schema);
          expect(validation.valid).toBe(
            true,
            `Example for ${schemaName} is invalid: ${validation.errors
              .map((e) => e.message)
              .join(", ")}`
          );
        }
      });
    });

    test("Response examples should match schemas", () => {
      const responses = swaggerSpec.components.responses;

      Object.entries(responses).forEach(
        ([responseName, response]: [string, any]) => {
          if (response.content?.["application/json"]?.example) {
            const example = response.content["application/json"].example;
            const schema = response.content["application/json"].schema;

            if (schema.$ref) {
              // Résoudre la référence
              const refPath = schema.$ref.replace("#/components/schemas/", "");
              const resolvedSchema = swaggerSpec.components.schemas[refPath];

              if (resolvedSchema) {
                const validation = validate(example, resolvedSchema);
                expect(validation.valid).toBe(
                  true,
                  `Example for response ${responseName} is invalid`
                );
              }
            }
          }
        }
      );
    });
  });

  describe("API Coverage", () => {
    test("All routes should be documented", () => {
      const documentedPaths = Object.keys(swaggerSpec.paths);
      const requiredPaths = [
        "/auth/login",
        "/auth/register",
        "/users",
        "/users/{id}",
        "/products",
        "/products/{id}",
        "/orders",
        "/orders/{id}",
        "/search",
        "/upload",
      ];

      requiredPaths.forEach((path) => {
        expect(documentedPaths).toContain(path);
      });
    });

    test("All HTTP methods should be documented for main resources", () => {
      const productPaths = swaggerSpec.paths["/products"];
      expect(productPaths.get).toBeDefined();
      expect(productPaths.post).toBeDefined();

      const productByIdPaths = swaggerSpec.paths["/products/{id}"];
      expect(productByIdPaths.get).toBeDefined();
      expect(productByIdPaths.put).toBeDefined();
      expect(productByIdPaths.delete).toBeDefined();
    });
  });

  describe("Security Documentation", () => {
    test("Protected endpoints should specify security requirements", () => {
      const protectedPaths = ["/products", "/orders", "/users"];

      protectedPaths.forEach((path) => {
        const pathObj = swaggerSpec.paths[path];
        if (pathObj.post || pathObj.put || pathObj.delete) {
          const method = pathObj.post || pathObj.put || pathObj.delete;
          expect(method.security).toBeDefined();
          expect(method.security).toContainEqual({ bearerAuth: [] });
        }
      });
    });

    test("Security schemes should be properly defined", () => {
      const securitySchemes = swaggerSpec.components.securitySchemes;

      expect(securitySchemes.bearerAuth).toBeDefined();
      expect(securitySchemes.bearerAuth.type).toBe("http");
      expect(securitySchemes.bearerAuth.scheme).toBe("bearer");

      expect(securitySchemes.apiKey).toBeDefined();
      expect(securitySchemes.apiKey.type).toBe("apiKey");
      expect(securitySchemes.apiKey.in).toBe("header");
    });
  });
});
```

## 🔄 Solutions Complètes TP-07

### Configuration complète

```typescript
// src/app.ts - Application principale avec toutes les fonctionnalités
import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import { createServer } from "http";
import { Server as SocketIOServer } from "socket.io";
import Redis from "ioredis";

// Middleware personnalisés
import { versionMiddleware } from "./middleware/versioning";
import { AdaptiveRateLimiter } from "./middleware/adaptiveRateLimit";
import { errorHandler } from "./middleware/errorHandler";
import { requestLogger } from "./middleware/requestLogger";

// Routes
import { authRoutes } from "./routes/auth";
import { versionedRoutes } from "./routes/versioned";
import { uploadRoutes } from "./routes/upload";
import { searchRoutes } from "./routes/search";
import { analyticsRoutes } from "./routes/analytics";

// Documentation
import { setupSwagger } from "./docs/swagger";

// Configuration
import { config } from "./config";

const app = express();
const server = createServer(app);
const io = new SocketIOServer(server, {
  cors: {
    origin: config.cors.origin,
    credentials: true,
  },
});

// Redis pour cache et rate limiting
const redis = new Redis(config.redis.url);

// Middleware de sécurité
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        imgSrc: ["'self'", "data:", "https:"],
        scriptSrc: ["'self'"],
      },
    },
    crossOriginEmbedderPolicy: false,
  })
);

app.use(
  cors({
    origin: config.cors.origin,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "API-Version",
      "X-API-Key",
    ],
  })
);

app.use(compression());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Middleware de logging
app.use(requestLogger);

// Rate limiting adaptatif
const rateLimiter = new AdaptiveRateLimiter(redis);
app.use("/api", rateLimiter.middleware());

// Versioning
app.use("/api", versionMiddleware);

// Documentation
setupSwagger(app);

// Routes
app.use("/api/auth", authRoutes);
app.use("/api", versionedRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/search", searchRoutes);
app.use("/api/analytics", analyticsRoutes);

// Health check
app.get("/health", (req, res) => {
  res.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || "1.0.0",
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || "development",
  });
});

// Gestion d'erreurs
app.use(errorHandler);

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({
    error: "Route non trouvée",
    path: req.originalUrl,
    method: req.method,
    timestamp: new Date().toISOString(),
  });
});

// Gestion WebSocket pour notifications temps réel
io.on("connection", (socket) => {
  console.log("Client connecté:", socket.id);

  socket.on("join-room", (userId) => {
    socket.join(`user-${userId}`);
  });

  socket.on("disconnect", () => {
    console.log("Client déconnecté:", socket.id);
  });
});

export { app, server, io, redis };
```

## 📊 Synthèse TP-07

### Objectifs Atteints

✅ **Versioning API**

- Headers de version personnalisés
- Routage conditionnel par version
- Formats de réponse adaptés par version
- Rétrocompatibilité assurée

✅ **Rate Limiting Avancé**

- Limitation par IP, utilisateur et tier
- Windows multiples (minute/heure/jour)
- Protection contre les bursts
- Headers informatifs

✅ **Documentation Interactive**

- Spécification OpenAPI 3.0 complète
- Interface Swagger UI personnalisée
- Exemples détaillés pour tous les endpoints
- Tests de validation automatisés

✅ **Fonctionnalités Enterprise**

- Monitoring temps réel
- Gestion d'erreurs centralisée
- Logging structuré
- Sécurité renforcée

### Métriques

- **Lignes de code**: ~2000
- **Endpoints documentés**: 25+
- **Schémas OpenAPI**: 8
- **Tests**: 15+
- **Couverture fonctionnelle**: 100%

### Prochaines Étapes
