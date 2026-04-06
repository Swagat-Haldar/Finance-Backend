const swaggerJSDoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.3',
    info: {
      title: 'Finance Dashboard Backend API',
      version: '1.0.0',
      description:
        [
          'Backend APIs for users/roles, financial records, and dashboard analytics (JWT + RBAC + soft delete + rate limiting).',
          '',
          '## Swagger “Try it out” quick start',
          '1. Run DB + seed (once): `npx prisma migrate dev` then `npx prisma db seed`.',
          '2. Start server: `npm run dev`.',
          '3. Open Swagger UI: `/docs`.',
          '4. Get admin token: **Auth → POST /auth/login** with:',
          '   - email: `finance-admin@example.com`',
          '   - password: `Admin123!`',
          '5. Click **Authorize** (top-right) and paste: `Bearer <token>`.',
          '6. Now try protected endpoints (Users/Records/Dashboard).',
          '',
          '**RBAC summary**:',
          '- VIEWER: Dashboard only',
          '- ANALYST: GET /records + Dashboard',
          '- ADMIN: Full access + /users + record mutations',
          '',
          '**Soft delete**: `DELETE /records/{id}` sets `deletedAt` and hides the record from lists and dashboard.'
        ].join('\n')
    },
    servers: [{ url: 'http://localhost:3000' }],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    },
    security: [{ bearerAuth: [] }],
    tags: [
      { name: 'Health' },
      { name: 'Auth' },
      { name: 'Users' },
      { name: 'Records' },
      { name: 'Dashboard' }
    ]
  },
  apis: ['src/routes/*.js']
};

module.exports = swaggerJSDoc(options);

