// Next.js resolves the real "server-only" package (which throws when
// imported from a Client Component) via its own bundler alias. Vitest runs
// outside that bundler, so this no-op stub takes its place in tests —
// see vitest.config.ts.
export {};
