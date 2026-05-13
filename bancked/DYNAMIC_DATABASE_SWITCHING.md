# Dynamic Database Switching

The backend uses Prisma for persistence and keeps database-specific behavior behind:

- `config/databaseProvider.js`
- `config/prisma.js`
- `config/db.js`
- `repositories/base.repository.js`
- provider-aware repository modules in `repositories/*.repository.js`
- generated Prisma schema at `prisma/generated/schema.prisma`

Controllers should continue calling services and services should continue calling repositories. Controllers must not import Prisma directly or branch on MongoDB/MySQL.

## Provider Selection

Set both:

- `DB_PROVIDER`: `mongodb` or `mysql`
- `DATABASE_URL`: connection string for the selected provider

`DATABASE_URL` decides where Prisma connects. `DB_PROVIDER` decides which schema is generated and how repository filters/IDs are normalized. Changing only `DATABASE_URL` is not enough when switching between MongoDB and MySQL.

## Generated Files

`npm run prisma:schema:*` reads the canonical schema at:

- `prisma/schema.prisma`

and writes the provider-specific generated schema to:

- `prisma/generated/schema.prisma`

MongoDB generation preserves ObjectId fields and Mongo collection mappings. MySQL generation switches IDs to string UUIDs, removes Mongo `@db.ObjectId` and `_id` mapping attributes, and converts Prisma scalar lists such as `String[]` into `Json?` because MySQL does not support Mongo-style scalar list fields.

## MongoDB Flow

```powershell
cd bancked
$env:DB_PROVIDER="mongodb"
$env:DATABASE_URL="mongodb://localhost:27017/nfa-project"
npm run prisma:generate:mongodb
npm run prisma:push:mongodb
npm run start:mongodb
```

## MySQL Flow

```powershell
cd bancked
$env:DB_PROVIDER="mysql"
$env:DATABASE_URL="mysql://USER:PASSWORD@HOST:3306/DATABASE"
npm run prisma:generate:mysql
npm run prisma:push:mysql
npm run start:mysql
```

## When To Run Commands

Run `prisma generate` through the package scripts whenever:

- `DB_PROVIDER` changes
- `prisma/schema.prisma` changes
- dependencies are reinstalled
- deployment builds a fresh backend image

Run `prisma db push` through the package scripts whenever:

- creating a new local database
- schema fields or indexes change
- switching a database provider for an environment

Do not point a MySQL `DATABASE_URL` at a client generated from the MongoDB schema, or the reverse.
