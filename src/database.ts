import { openDB } from 'idb';

const DATABASE_NAME = 'FoodInventoryDBNew';
const STORE_NAME = 'products';
const VERSION = 1;

async function initDB() {
    const db = await openDB(DATABASE_NAME, VERSION, {
      upgrade(db, oldVersion, newVersion, transaction) {
        console.log("Upgrading or creating new database");
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
        }
      },
    });
    console.log("Database initialized");
    return db;
  }
  

export async function addProduct(product: any) {
    const db = await initDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const id = await store.add(product); // Zwracane ID powinno być typu number
    await tx.done;
    console.log("Added product with ID:", id);
    return { ...product, id }; // Zwróć produkt z dodanym id
  }


// POKAŻ PRODUKTY
export async function getProducts() {
    const db = await initDB();
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const products = await store.getAll();
    console.log("Retrieved products:", products); 
    return products;
  }


//WYPIERDOL PRODUKT
export async function removeProduct(id: IDBKeyRange | IDBValidKey) {
    const db = await initDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    await store.delete(id);
    await tx.done;
  }

  //wypierdol baze
  // Funkcja do usuwania całej bazy danych
export async function deleteDatabase() {
    await openDB(DATABASE_NAME).then(db => {
      db.close();
      const deleteDBRequest = indexedDB.deleteDatabase(DATABASE_NAME);
      deleteDBRequest.onerror = function(event) {
        console.error("Error deleting database.");
      };
      deleteDBRequest.onsuccess = function(event) {
        console.log("Database deleted successfully");
      };
    });
  }
  