import { createSiteContext, createDatabaseClient, errorResponse } from './_qoder/backend.mjs';
import { createApplication } from './api.mjs';

// Identidade própria do app: o cookie de sessão é preservado pelo adapter
// (forwardApplicationCredentials) e validado no banco a cada requisição.
const handle = createApplication({ db: createDatabaseClient() });

Deno.serve(async (request) => {
  let context;
  try {
    context = createSiteContext(request, { forwardApplicationCredentials: true });
    return await handle(context);
  } catch (error) {
    return errorResponse(error, context?.requestId);
  }
});
