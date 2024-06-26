import { openDB } from 'idb';

const DATABASE_NAME = 'FoodInventoryDBNew';
const STORE_NAME = 'products';
const MEAL_PLAN_STORE_NAME = 'mealPlans';
const VERSION = 1;

async function initDB() {
    const db = await openDB(DATABASE_NAME, VERSION, {
      upgrade(db, oldVersion, newVersion, transaction) {
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
        }
        if (!db.objectStoreNames.contains(MEAL_PLAN_STORE_NAME)) {
          db.createObjectStore(MEAL_PLAN_STORE_NAME, { keyPath: 'id', autoIncrement: true });
        }
      },
    });
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
  
  export async function addMealPlan(name: string, content: string) {
    const db = await initDB();
    const tx = db.transaction(MEAL_PLAN_STORE_NAME, 'readwrite');
    const store = tx.objectStore(MEAL_PLAN_STORE_NAME);
    const id = await store.add({ name, content });
    await tx.done;
    console.log("Added meal plan with ID:", id);
    return { name, content, id: id as number };
  }


export async function getMealPlans() {
    const db = await initDB();
    const tx = db.transaction(MEAL_PLAN_STORE_NAME, 'readonly');
    const store = tx.objectStore(MEAL_PLAN_STORE_NAME);
    const mealPlans = await store.getAll();
    console.log("Retrieved meal plans:", mealPlans);
    return mealPlans;
}

export async function removeMealPlan(id: IDBValidKey | IDBKeyRange) {
    console.log("Attempting to remove meal plan with ID:", id);
    const db = await initDB();
    const tx = db.transaction(MEAL_PLAN_STORE_NAME, 'readwrite');
    const store = tx.objectStore(MEAL_PLAN_STORE_NAME);
    await store.delete(id);
    await tx.done;
    console.log("Meal plan removed successfully");
}

export async function removeAllProducts() {
  const db = await initDB();
  const tx = db.transaction(STORE_NAME, 'readwrite');
  const store = tx.objectStore(STORE_NAME);
  await store.clear(); // Usuwa wszystkie wpisy ze sklepu
  await tx.done;
  console.log("All products have been removed");
}


export async function removeAllMealPlans() {
  const db = await initDB();
  const tx = db.transaction(MEAL_PLAN_STORE_NAME, 'readwrite');
  const store = tx.objectStore(MEAL_PLAN_STORE_NAME);
  await store.clear(); // Usuwa wszystkie wpisy ze sklepu
  await tx.done;
  console.log("All meal plans have been removed");
}
