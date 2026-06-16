import { env } from '../config/env.js';
import { FileRepository } from '../repositories/FileRepository.js';
import { MysqlRepository } from '../repositories/MysqlRepository.js';
import type { IRepository } from '../repositories/interfaces/IRepository.js';

let repository: IRepository | null = null;

export function getRepository(): IRepository {
  if (!repository) {
    repository = env.betaMode ? new FileRepository() : new MysqlRepository();
  }
  return repository;
}
