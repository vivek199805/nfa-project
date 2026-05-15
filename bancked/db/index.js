import { getOrmProvider, ORM_PROVIDERS } from "../config/ormProvider.js";
import prismaAdapter, {
  connect as connectPrismaAdapter,
  disconnect as disconnectPrismaAdapter,
} from "../adapters/prisma/index.js";
import mongooseAdapter, {
  connect as connectMongooseAdapter,
  disconnect as disconnectMongooseAdapter,
} from "../adapters/mongoose/index.js";
import sequelizeAdapter, {
  connect as connectSequelizeAdapter,
  disconnect as disconnectSequelizeAdapter,
} from "../adapters/sequelize/index.js";

const adapterByProvider = {
  [ORM_PROVIDERS.PRISMA]: prismaAdapter,
  [ORM_PROVIDERS.MONGOOSE]: mongooseAdapter,
  [ORM_PROVIDERS.SEQUELIZE]: sequelizeAdapter,
};

const connectByProvider = {
  [ORM_PROVIDERS.PRISMA]: connectPrismaAdapter,
  [ORM_PROVIDERS.MONGOOSE]: connectMongooseAdapter,
  [ORM_PROVIDERS.SEQUELIZE]: connectSequelizeAdapter,
};

const disconnectByProvider = {
  [ORM_PROVIDERS.PRISMA]: disconnectPrismaAdapter,
  [ORM_PROVIDERS.MONGOOSE]: disconnectMongooseAdapter,
  [ORM_PROVIDERS.SEQUELIZE]: disconnectSequelizeAdapter,
};

export const getDb = () => adapterByProvider[getOrmProvider()];

export const connectOrm = async () => connectByProvider[getOrmProvider()]();

export const disconnectOrm = async () => disconnectByProvider[getOrmProvider()]();

export default getDb();
