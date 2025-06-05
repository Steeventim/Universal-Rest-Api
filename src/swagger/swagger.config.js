export const swaggerConfig = {
  openapi: "3.0.0",
  info: {
    title: "Universal REST API",
    version: "1.0.0",
    description:
      "API REST universelle pour tous frameworks Node.js avec Swagger",
  },
  servers: [
    {
      url: "http://localhost:3001",
      description: "Serveur de développement",
    },
  ],
  paths: {
    "/api/items": {
      get: {
        summary: "Récupérer tous les items",
        tags: ["Items"],
        responses: {
          200: {
            description: "Liste des items",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean" },
                    data: {
                      type: "array",
                      items: { $ref: "#/components/schemas/Item" },
                    },
                  },
                },
              },
            },
          },
        },
      },
      post: {
        summary: "Créer un nouvel item",
        tags: ["Items"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/CreateItem" },
            },
          },
        },
        responses: {
          201: {
            description: "Item créé avec succès",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean" },
                    data: { $ref: "#/components/schemas/Item" },
                  },
                },
              },
            },
          },
          400: {
            description: "Erreur de validation",
          },
        },
      },
    },
    "/api/items/{id}": {
      get: {
        summary: "Récupérer un item par ID",
        tags: ["Items"],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
            description: "ID de l'item",
          },
        ],
        responses: {
          200: {
            description: "Item trouvé",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean" },
                    data: { $ref: "#/components/schemas/Item" },
                  },
                },
              },
            },
          },
          404: {
            description: "Item non trouvé",
          },
        },
      },
      put: {
        summary: "Mettre à jour un item",
        tags: ["Items"],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
            description: "ID de l'item",
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/UpdateItem" },
            },
          },
        },
        responses: {
          200: {
            description: "Item mis à jour avec succès",
          },
          400: {
            description: "Erreur de validation",
          },
          404: {
            description: "Item non trouvé",
          },
        },
      },
      delete: {
        summary: "Supprimer un item",
        tags: ["Items"],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
            description: "ID de l'item",
          },
        ],
        responses: {
          204: {
            description: "Item supprimé avec succès",
          },
          404: {
            description: "Item non trouvé",
          },
        },
      },
    },
  },
  components: {
    schemas: {
      Item: {
        type: "object",
        properties: {
          id: {
            type: "string",
            description: "Identifiant unique de l'item",
          },
          name: {
            type: "string",
            description: "Nom de l'item",
          },
          description: {
            type: "string",
            description: "Description de l'item",
          },
          price: {
            type: "number",
            description: "Prix de l'item",
          },
          category: {
            type: "string",
            description: "Catégorie de l'item",
          },
        },
      },
      CreateItem: {
        type: "object",
        required: ["name", "price", "category"],
        properties: {
          name: {
            type: "string",
            description: "Nom de l'item",
          },
          description: {
            type: "string",
            description: "Description de l'item",
          },
          price: {
            type: "number",
            minimum: 0,
            description: "Prix de l'item (doit être positif)",
          },
          category: {
            type: "string",
            enum: [
              "electronics",
              "books",
              "clothing",
              "home",
              "sports",
              "toys",
            ],
            description: "Catégorie de l'item",
          },
        },
      },
      UpdateItem: {
        type: "object",
        properties: {
          name: {
            type: "string",
            description: "Nom de l'item",
          },
          description: {
            type: "string",
            description: "Description de l'item",
          },
          price: {
            type: "number",
            minimum: 0,
            description: "Prix de l'item (doit être positif)",
          },
          category: {
            type: "string",
            enum: [
              "electronics",
              "books",
              "clothing",
              "home",
              "sports",
              "toys",
            ],
            description: "Catégorie de l'item",
          },
        },
      },
    },
  },
};
