import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import type { DataStore } from '../src/models/types.js';
import { MysqlRepository } from '../src/repositories/MysqlRepository.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function seed() {
  const repo = new MysqlRepository();
  const existing = await repo.findUserByEmail('user@example.com');
  if (existing) {
    console.log('Seed skipped — demo user already exists.');
    return;
  }

  const raw = await fs.readFile(path.resolve(__dirname, '../data/data.json'), 'utf-8');
  const data = JSON.parse(raw) as DataStore;

  for (const user of data.users) {
    await repo.createUser(user);
  }
  for (const member of data.familyMembers) {
    await repo.createFamilyMember(member);
  }
  for (const item of data.familyMemberItems) {
    const owner = data.familyMembers.find((m) => m.id === item.familyMemberId);
    if (!owner) continue;
    await repo.createFamilyMemberItem(item, owner.userId);
  }
  for (const list of data.packingLists) {
    await repo.createPackingList(list);
  }
  for (const item of data.listItems) {
    await repo.createListItem(item);
  }

  console.log('Seed completed from data/data.json.');
}

seed().catch((error) => {
  console.error('Seed failed:', error);
  process.exit(1);
});
