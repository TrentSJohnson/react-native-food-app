import { clerkMiddleware, requireAuth as clerkRequireAuth } from '@clerk/express';

export const clerkInit = clerkMiddleware();
export const requireAuth = clerkRequireAuth();
