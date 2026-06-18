import { prepareDb } from '../src/config/db.js';

prepareDb()
  .then(() => {
    console.log('Migracje zakończone pomyślnie.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Migracja nie powiodła się:', error);
    process.exit(1);
  });
