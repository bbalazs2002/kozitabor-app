import { Application } from 'express';
import expressListEndpoints from 'express-list-endpoints';
import { apiReference } from '@scalar/express-api-reference';
import { apiSchemaRegistry } from '../types/docs';
import path from 'path';
import fs from 'fs';

export const setupApiDocs = (app: Application, routerMaps: any[]) => {
  if (process.env.IS_DEV) {
    const paths: Record<string, any> = {};

    try {
      // Csak itt, dev módban próbáljuk meg beimportálni a generált sémát
      // Így élesben a require() sorra rá sem néz a Node.js
      const schemaPath = path.join(process.cwd(), 'prisma', 'json-schema.json');

      if (!fs.existsSync(schemaPath)) {
        console.warn('A Prisma JSON séma nem található! Futtasd: npx prisma generate');
        return;
      }

      // Beolvassuk a fájlt és parsoljuk JSON-né
      const rawData = fs.readFileSync(schemaPath, 'utf8');
      const Prismaschema = JSON.parse(rawData);
      const prismaModels = Prismaschema.definitions;

      routerMaps.forEach(({ prefix, router }) => {
        const endpoints = expressListEndpoints(router);

        endpoints.forEach((route) => {
          const fullPath = `${prefix}${route.path}`.replace(/\/+/g, '/');
          const openApiPath = fullPath.replace(/:(\w+)/g, '{$1}');

          if (!paths[openApiPath]) paths[openApiPath] = {};

          route.methods.forEach((method) => {
            const lowerMethod = method.toLowerCase();
            const custom = apiSchemaRegistry[openApiPath]?.[lowerMethod];
            
            // 1. Meghatározzuk az alapértelmezett sikeres státuszkódot
            const defaultStatus = lowerMethod === 'post' ? 201 : 200;
            const defaultDescription = lowerMethod === 'post' ? 'Sikeres létrehozás' : 'Sikeres művelet';

            // 2. Összeállítjuk a válaszokat
            // Ha a docs.ts-ben megadtál saját 'responses' objektumot, azt használjuk, 
            // különben generálunk egyet a Prisma modell alapján.
            const responses = custom?.responses || {
              [defaultStatus]: {
                description: defaultDescription,
                content: {
                  'application/json': {
                    schema: guessModelSchema(openApiPath, prismaModels)
                  }
                }
              }
            };

            // 3. Végpont objektum összeállítása
            paths[openApiPath][lowerMethod] = {
              summary: custom?.summary || `${method} ${openApiPath}`,
              requestBody: custom?.requestBody,
              // Itt adjuk át a dinamikusan kitalált válaszokat
              responses: responses,
              // Ha van a registry-ben egyéb OpenAPI mező (pl. parameters, tags), azt is átvesszük
              ...((({ summary, requestBody, responses, ...rest }) => rest)(custom || {}))
            };
          });
        });
      });

      const openApiSpec = {
        openapi: '3.0.0',
        info: { title: 'Közitábor API', version: '1.0.0' },
        components: { schemas: prismaModels }, // Az ÖSSZES Prisma modell bekerül ide
        paths: paths,
      };

      app.use('/reference', apiReference({ theme: 'purple', content: openApiSpec }));
      
    } catch (err) {
      console.error('Nem sikerült betölteni a JSON sémát. Futtasd: npx prisma generate');
    }
  }
};

// Segédfüggvény, ami az URL-ből megpróbálja kitalálni, melyik Prisma modell kell
function guessModelSchema(path: string, models: any) {
  const segments = path.split('/');
  
  // Megfordítjuk a tömböt és megkeressük az első olyan szót, 
  // ami nem paraméter {id} és nem 'api'
  const modelName = [...segments].reverse().find(s => !s.includes('{') && s !== 'api' && s !== '');
  
  if (!modelName) return { type: 'object' };

  // capitalize (pl. contact-activity -> ContactActivity)
  const formattedName = modelName
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join('');
  
  if (models[formattedName]) {
    return { $ref: `#/components/schemas/${formattedName}` };
  }
  return { type: 'object' };
}