export const apiSchemaRegistry: Record<string, any> = {
  // Új info létrehozása
  '/api/info': {
    post: {
      summary: 'Új információs kártya létrehozása (térképpel és fájlokkal)',
      requestBody: {
        content: {
          'multipart/form-data': {
            schema: {
              type: 'object',
              properties: {
                title: { type: 'string', example: 'Tábori szabályzat' },
                icon: { type: 'string', example: 'description' },
                content: { type: 'string', example: 'Kérjük, tartsátok be...' },
                'map[show]': { type: 'boolean' },
                'map[lat]': { type: 'number' },
                'map[lng]': { type: 'number' },
                'map[zoom]': { type: 'number' },
                files: {
                  type: 'array',
                  items: { type: 'string', format: 'binary' },
                  description: 'Feltöltendő képek vagy PDF fájlok'
                },
              },
            },
          },
        },
      },
    },
  },

  // Info frissítése (Figyelem: az útvonal itt már tartalmazza az ID-t!)
  '/api/info/{id}': {
    put: {
      summary: 'Információs kártya frissítése és média kezelése',
      requestBody: {
        content: {
          'multipart/form-data': {
            schema: {
              type: 'object',
              properties: {
                title: { type: 'string' },
                icon: { type: 'string' },
                content: { type: 'string' },
                'map[show]': { type: 'boolean' },
                'map[lat]': { type: 'number' },
                'map[lng]': { type: 'number' },
                'map[zoom]': { type: 'number' },
                // Új fájlok hozzáadása
                files: {
                  type: 'array',
                  items: { type: 'string', format: 'binary' },
                  description: 'Újonnan hozzáadandó fájlok'
                },
                // Régi fájlok törlése ID alapján
                deletedMediaIds: {
                  type: 'array',
                  items: { type: 'integer' },
                  description: 'A törlésre kijelölt Media rekordok ID-jai',
                  example: [1, 5, 12]
                }
              },
            },
          },
        },
      },
      responses: {
        200: {
          description: 'Sikeres frissítés',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  id: { type: 'integer' },
                  title: { type: 'string' },
                  media: { type: 'array', items: { type: 'object' } }
                }
              }
            }
          }
        },
        404: { description: 'A megadott ID-val nem található elem' }
      }
    }
  }
};