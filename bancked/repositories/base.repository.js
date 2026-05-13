import { getDatabaseProvider } from "../config/databaseProvider.js";
import prisma from "../config/prisma.js";
import {
  normalizeId,
  normalizeWhere,
  stripUndefined,
} from "./prisma.mapper.js";

export class BaseRepository {
  constructor(delegateName, { client = prisma, provider = getDatabaseProvider() } = {}) {
    this.client = client;
    this.delegateName = delegateName;
    this.provider = provider;
  }

  get delegate() {
    const delegate = this.client[this.delegateName];
    if (!delegate) {
      throw new Error(`Prisma delegate "${this.delegateName}" is not available. Regenerate the Prisma client.`);
    }
    return delegate;
  }

  normalizeId(id) {
    return normalizeId(id, this.provider);
  }

  normalizeWhere(where = {}) {
    return normalizeWhere(where, this.provider);
  }

  create(data) {
    return this.delegate.create({ data: stripUndefined(data) });
  }

  findUniqueById(id, options = {}) {
    return this.delegate.findUnique({
      where: { id: this.normalizeId(id) },
      ...options,
    });
  }

  findFirst(where = {}, options = {}) {
    return this.delegate.findFirst({
      where: this.normalizeWhere(where),
      ...options,
    });
  }

  findMany(where = {}, options = {}) {
    return this.delegate.findMany({
      where: this.normalizeWhere(where),
      ...options,
    });
  }

  updateById(id, data, options = {}) {
    return this.delegate.update({
      where: { id: this.normalizeId(id) },
      data: stripUndefined(data),
      ...options,
    });
  }

  deleteById(id, options = {}) {
    return this.delegate.delete({
      where: { id: this.normalizeId(id) },
      ...options,
    });
  }

  upsert(args) {
    return this.delegate.upsert(args);
  }
}

export default BaseRepository;
