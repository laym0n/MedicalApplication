import {DataSource} from 'typeorm';
import {Document} from '@shared/db/entity/document';
import SQLite from 'react-native-sqlite-storage';
import { Consultation } from '@shared/db/entity/consultation';

SQLite.enablePromise(true);

const AppDataSource = new DataSource({
  type: 'react-native',
  database: 'myapp3.db',
  location: 'default',
  driver: SQLite,
  entities: [Document, Consultation],
  synchronize: true, // Только в dev!
});

export async function initDatabase() {
  try {
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
      console.log('📦 База данных инициализирована');
    }
  } catch (error) {
    console.error('❌ Ошибка инициализации БД:', error);
  }
}
