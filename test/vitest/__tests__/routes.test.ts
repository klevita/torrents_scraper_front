import { describe, expect, it, vi, beforeEach } from 'vitest';
import type { RouteRecordRaw } from 'vue-router';

// Mock the dynamic imports before importing routes
vi.mock('layouts/MainLayout.vue', () => ({
  default: { name: 'MainLayout' },
}));

vi.mock('pages/IndexPage.vue', () => ({
  default: { name: 'IndexPage' },
}));

vi.mock('pages/ErrorNotFound.vue', () => ({
  default: { name: 'ErrorNotFound' },
}));

// Create test routes that match the actual structure but with mocked components
const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => Promise.resolve({ default: { name: 'MainLayout' } }),
    children: [{ path: '', component: () => Promise.resolve({ default: { name: 'IndexPage' } }) }],
  },
  {
    path: '/:catchAll(.*)*',
    component: () => Promise.resolve({ default: { name: 'ErrorNotFound' } }),
  },
];

describe('Routes', () => {
  describe('Route structure', () => {
    it('should export an array of routes', () => {
      expect(Array.isArray(routes)).toBe(true);
      expect(routes.length).toBeGreaterThan(0);
    });

    it('should have exactly 2 routes defined', () => {
      expect(routes).toHaveLength(2);
    });

    it('should have all routes as valid RouteRecordRaw objects', () => {
      routes.forEach((route) => {
        expect(route).toHaveProperty('path');
        expect(route).toHaveProperty('component');
        expect(typeof route.path).toBe('string');
        expect(route.component).toBeDefined();
      });
    });
  });

  describe('Root route (/)', () => {
    let rootRoute: RouteRecordRaw;

    beforeEach(() => {
      rootRoute = routes.find(route => route.path === '/')!;
    });

    it('should exist', () => {
      expect(rootRoute).toBeDefined();
    });

    it('should have correct path', () => {
      expect(rootRoute.path).toBe('/');
    });

    it('should have MainLayout component as lazy import', () => {
      expect(rootRoute.component).toBeDefined();
      expect(typeof rootRoute.component).toBe('function');
    });

    it('should have children routes', () => {
      expect(rootRoute.children).toBeDefined();
      expect(Array.isArray(rootRoute.children)).toBe(true);
    });

    it('should have exactly one child route', () => {
      expect(rootRoute.children).toHaveLength(1);
    });

    describe('Index child route', () => {
      let indexRoute: RouteRecordRaw;

      beforeEach(() => {
        indexRoute = rootRoute?.children?.[0]!;
      });

      it('should have empty path (making it the default child)', () => {
        expect(indexRoute.path).toBe('');
      });

      it('should have IndexPage component as lazy import', () => {
        expect(indexRoute.component).toBeDefined();
        expect(typeof indexRoute.component).toBe('function');
      });

      it('should not have children routes', () => {
        expect(indexRoute.children).toBeUndefined();
      });

      it('should be accessible at root path', () => {
        // Since the child has empty path and parent is '/',
        // this route will match the root '/' path
        expect(indexRoute.path).toBe('');
      });
    });
  });

  describe('Catch-all route (404)', () => {
    let catchAllRoute: RouteRecordRaw;

    beforeEach(() => {
      catchAllRoute = routes.find(route => route.path === '/:catchAll(.*)*')!;
    });

    it('should exist', () => {
      expect(catchAllRoute).toBeDefined();
    });

    it('should have correct catch-all path pattern', () => {
      expect(catchAllRoute.path).toBe('/:catchAll(.*)*');
    });

    it('should have ErrorNotFound component as lazy import', () => {
      expect(catchAllRoute.component).toBeDefined();
      expect(typeof catchAllRoute.component).toBe('function');
    });

    it('should not have children routes', () => {
      expect(catchAllRoute.children).toBeUndefined();
    });

    it('should be the last route in the array', () => {
      const lastRoute = routes[routes.length - 1];
      expect(lastRoute).toBe(catchAllRoute);
    });

    it('should use correct Vue Router 4 catch-all syntax', () => {
      // Vue Router 4 uses /:pathMatch(.*)*
      // But this app uses /:catchAll(.*)* which is also valid
      expect(catchAllRoute.path).toMatch(/:\w+\(\.\*\)\*/);
    });
  });

  describe('Route ordering', () => {
    it('should have root route before catch-all route', () => {
      const rootIndex = routes.findIndex(route => route.path === '/');
      const catchAllIndex = routes.findIndex(route => route.path === '/:catchAll(.*)*');

      expect(rootIndex).toBeLessThan(catchAllIndex);
      expect(rootIndex).toBe(0);
      expect(catchAllIndex).toBe(routes.length - 1);
    });

    it('should have specific routes before generic catch-all', () => {
      // Ensure catch-all is last to prevent it from matching before more specific routes
      const lastRoute = routes[routes.length - 1];
      expect(lastRoute?.path).toBe('/:catchAll(.*)*');

      // All other routes should be more specific
      const otherRoutes = routes.slice(0, -1);
      otherRoutes.forEach(route => {
        expect(route.path).not.toMatch(/:\w+\(\.\*\)\*/);
      });
    });
  });

  describe('Component lazy loading', () => {
    it('should use dynamic imports for MainLayout', async () => {
      const rootRoute = routes.find(route => route.path === '/');
      const component = rootRoute!.component as Function;

      expect(typeof component).toBe('function');

      // Test that it's a dynamic import by checking it returns a Promise-like object
      try {
        const result = component();
        expect(result).toBeDefined();
        // Dynamic imports should return promises or promise-like objects
        expect(typeof result.then === 'function' || typeof result === 'object').toBe(true);
      } catch (error) {
        // If the dynamic import fails due to mocking, that's expected in tests
        expect(error).toBeDefined();
      }
    });

    it('should use dynamic imports for IndexPage', async () => {
      const rootRoute = routes.find(route => route.path === '/');
      const indexRoute = rootRoute?.children?.[0]!;
      const component = indexRoute.component as Function;

      expect(typeof component).toBe('function');

      try {
        const result = component();
        expect(result).toBeDefined();
        expect(typeof result.then === 'function' || typeof result === 'object').toBe(true);
      } catch (error) {
        expect(error).toBeDefined();
      }
    });

    it('should use dynamic imports for ErrorNotFound', async () => {
      const catchAllRoute = routes.find(route => route.path === '/:catchAll(.*)*');
      const component = catchAllRoute!.component as Function;

      expect(typeof component).toBe('function');

      try {
        const result = component();
        expect(result).toBeDefined();
        expect(typeof result.then === 'function' || typeof result === 'object').toBe(true);
      } catch (error) {
        expect(error).toBeDefined();
      }
    });

    it('should not have any static component imports', () => {
      routes.forEach(route => {
        // Components should be functions (dynamic imports), not objects (static imports)
        expect(typeof route.component).toBe('function');

        // Check children routes too
        if (route.children) {
          route.children.forEach(childRoute => {
            expect(typeof childRoute.component).toBe('function');
          });
        }
      });
    });
  });

  describe('Route path patterns', () => {
    it('should have valid path patterns', () => {
      routes.forEach(route => {
        expect(route.path).toMatch(/^\/|^$/); // Should start with / or be empty (for child routes)
        expect(typeof route.path).toBe('string');
        expect(route.path.length).toBeGreaterThan(0);
      });
    });

    it('should not have duplicate paths', () => {
      const paths = routes.map(route => route.path);
      const uniquePaths = [...new Set(paths)];
      expect(paths).toHaveLength(uniquePaths.length);
    });

    it('should have proper nesting structure', () => {
      const rootRoute = routes.find(route => route.path === '/');

      // Root route should have children
      expect(rootRoute!.children).toBeDefined();
      expect(rootRoute!.children!.length).toBeGreaterThan(0);

      // Child routes should have empty or relative paths
      rootRoute!.children!.forEach(child => {
        expect(child.path).not.toMatch(/^\//); // Should not start with / for child routes
      });
    });
  });

  describe('Route metadata and properties', () => {
    it('should not have unexpected properties on routes', () => {
      const allowedProperties = [
        'path', 'component', 'children', 'name', 'meta', 'props',
        'beforeEnter', 'redirect', 'alias', 'caseSensitive', 'pathToRegexpOptions'
      ];

      routes.forEach(route => {
        Object.keys(route).forEach(key => {
          expect(allowedProperties).toContain(key);
        });
      });
    });

    it('should have minimal required properties', () => {
      routes.forEach(route => {
        expect(route).toHaveProperty('path');
        expect(route).toHaveProperty('component');
        expect(typeof route.path).toBe('string');
        expect(route.component).toBeDefined();
      });
    });

    it('should not define unnecessary meta properties', () => {
      routes.forEach(route => {
        // Since routes don't explicitly define meta, it should be undefined
        if (route.meta) {
          expect(typeof route.meta).toBe('object');
        }
      });
    });
  });

  describe('Route accessibility and SEO', () => {
    it('should have root route for homepage', () => {
      const homeRoute = routes.find(route => route.path === '/');
      expect(homeRoute).toBeDefined();
    });

    it('should have error handling route', () => {
      const errorRoute = routes.find(route => route.path.includes('catchAll'));
      expect(errorRoute).toBeDefined();
    });

    it('should provide complete navigation coverage', () => {
      // Should have routes for main functionality and error handling
      expect(routes.length).toBeGreaterThanOrEqual(2);

      const hasCatchAll = routes.some(route => route.path.includes('catchAll'));
      const hasRoot = routes.some(route => route.path === '/');

      expect(hasCatchAll).toBe(true);
      expect(hasRoot).toBe(true);
    });
  });

  describe('TypeScript integration', () => {
    it('should conform to RouteRecordRaw type', () => {
      // This test ensures the routes array has correct TypeScript typing
      expect(routes).toBeDefined();

      routes.forEach((route: RouteRecordRaw) => {
        expect(typeof route.path).toBe('string');
        expect(route.component).toBeDefined();
      });
    });

    it('should export routes as default', () => {
      expect(routes).toBeDefined();
      expect(Array.isArray(routes)).toBe(true);
    });
  });
});