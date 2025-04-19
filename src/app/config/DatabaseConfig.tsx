import {DataSource} from 'typeorm';
import {Document} from '@shared/db/entity/document';
import SQLite from 'react-native-sqlite-storage';

SQLite.enablePromise(true);

const AppDataSource = new DataSource({
  type: 'react-native',
  database: 'myapp1.db',
  location: 'default',
  driver: SQLite,
  entities: [Document],
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
