// 存储的数据结构
interface StorageItem<T> {
  value: T;
  expiration?: number; // 存储的数据有效期（时间戳）
}

class LocalStorageService {
  private readonly storage: Storage;

  constructor(storage: Storage = localStorage) {
    this.storage = storage;
  }

  // 存储数据
  setItem<T>(key: string, value: T, expirationMinutes=24 * 7): void {
    const item: StorageItem<T> = {
      value,
      expiration: expirationMinutes ? new Date().getTime() + expirationMinutes * 60 * 60 * 1000 : undefined,
    };

    this.storage.setItem(key, JSON.stringify(item));
  }

  // 获取数据
  getItem<T>(key: string): T | null {
    const itemString = this.storage.getItem(key);

    if (!itemString) {
      return null;
    }

    const item: StorageItem<T> = JSON.parse(itemString);

    if (item.expiration && item.expiration < new Date().getTime()) {
      // 数据已过期
      this.removeItem(key);
      return null;
    }

    return item.value;
  }

  // 删除数据
  removeItem(key: string): void {
    this.storage.removeItem(key);
  }
}
const LocalStorage = new LocalStorageService()
export {
  LocalStorage
}
