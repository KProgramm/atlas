// Removed: definePrismaConfig from "prisma/config" requires Prisma 6+.
// This repo is pinned to Prisma 5.22.0, which doesn't ship that module's
// type declarations, so this file was breaking `tsc --noEmit`.
// Re-add if/when the Prisma version is upgraded.
export {};
