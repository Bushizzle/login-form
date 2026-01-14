import type { AuthResult } from '../auth/types';

type MockRouteHandler = (request: Request) => Promise<Response>;

function jsonResponse(body: unknown, init?: ResponseInit): Response {
  return new Response(JSON.stringify(body), {
    headers: {
      'content-type': 'application/json; charset=utf-8',
      ...(init?.headers ?? {}),
    },
    ...init,
  });
}

function randomDelay(minMs: number, maxMs: number): Promise<void> {
  const delay = Math.floor(Math.random() * (maxMs - minMs + 1)) + minMs;
  return new Promise((resolve) => setTimeout(resolve, delay));
}

function isSignInUrl(url: URL): boolean {
  // Supports both dev (/) and GH Pages base path (/login-form/)
  return url.pathname.endsWith('/api/auth/sign-in');
}

function createRoutes(): { signIn: MockRouteHandler } {
  const DEMO_EMAIL = 'demo@example.com';
  const DEMO_PASSWORD = 'password123';
  const NETWORK_ERROR_CHANCE = 0.1;

  const signIn: MockRouteHandler = async (request) => {
    if (request.method !== 'POST') {
      return jsonResponse({ success: false, error: 'NETWORK_ERROR' } satisfies AuthResult, {
        status: 405,
      });
    }

    await randomDelay(500, 900);

    if (Math.random() < NETWORK_ERROR_CHANCE) {
      // Simulate fetch() failing (network error)
      throw new TypeError('Network error');
    }

    const body = (await request.json().catch(() => null)) as null | {
      email?: unknown;
      password?: unknown;
    };

    const email = typeof body?.email === 'string' ? body.email : '';
    const password = typeof body?.password === 'string' ? body.password : '';

    if (email === DEMO_EMAIL && password === DEMO_PASSWORD) {
      return jsonResponse({ success: true } satisfies AuthResult, { status: 200 });
    }

    return jsonResponse(
      { success: false, error: 'INVALID_CREDENTIALS' } satisfies AuthResult,
      { status: 401 }
    );
  };

  return { signIn };
}

/**
 * Installs a mocked fetch() implementation (idempotent).
 * Used to keep the SPA fully static (no backend) while still using fetch() in API clients.
 */
export function installMockFetch(): void {
  const g = globalThis as unknown as { fetch?: typeof fetch; __mockFetchInstalled?: boolean };
  if (g.__mockFetchInstalled) {
    return;
  }

  const originalFetch = g.fetch?.bind(globalThis);
  if (!originalFetch) {
    // In browsers fetch always exists; in tests you can polyfill/mock it.
    throw new Error('globalThis.fetch is not available');
  }

  const routes = createRoutes();

  g.fetch = (async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    const request = new Request(input, init);
    const url = new URL(request.url, window.location.origin);

    if (isSignInUrl(url)) {
      return routes.signIn(request);
    }

    return originalFetch(request);
  }) as typeof fetch;

  g.__mockFetchInstalled = true;
}


