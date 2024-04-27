import React, { useEffect, useState } from "react";
import { fetchChatCompletion } from "./apiService";
import styles from "./app.module.css";
import {
  addProduct,
  getProducts,
  removeProduct,
  deleteDatabase,
  getMealPlans,
  addMealPlan,
  removeMealPlan,
} from "./database";
import { useStore } from "./store/useStore";
import SpeechToText from "./SpeechTotext";
import { knownProducts } from "./knownProducts";
import Loader from "./components/Loader/Loader"

interface MealPlan {
  id: number;
  content: string;
}


const App: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState("");
  const [mealPlans, setMealPlans] = useState([] as MealPlan[]);

  useEffect(() => {
    getMealPlans();
  }, []);


  const {
    inputProduct,
    setInputProduct,
    products,
    setProducts,
    quickMealInput,
    setQuickMealInput,
    setResult,
    results,
    showMealPlan,
    setShowMealPlan,
    showPantry,
    setShowPantry,
  } = useStore();

  const normalizeText = (text: string) =>
    text
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    loadMealPlans();
  }, []);

  useEffect(() => {
    console.log(results);
  }, [results]);

  const fetchProducts = async () => {
    const items = await getProducts();
    setProducts(items);
  };


  const handleAddProduct = async () => {
    let inputLower = normalizeText(quickMealInput);
    const productsToAdd = [];

    // Check for known products and add them separately
    for (const product of knownProducts) {
      const normalizedProduct = normalizeText(product);
      if (inputLower.includes(normalizedProduct)) {
        productsToAdd.push(product); // Add the original name, not normalized
        inputLower = inputLower.replace(new RegExp(normalizedProduct, "g"), "");
      }
    }

    // Add remaining single word products
    inputLower.split(" ").forEach((word) => {
      if (word.trim() !== "") productsToAdd.push(word);
    });

    // Add each product to the database and state
    for (const product of productsToAdd) {
      const newProduct = await addProduct({ name: product });
      if (newProduct.id) {
        setProducts((prev) => [...prev, newProduct]);
      }
    }

    setQuickMealInput("");
  };

  

  const handleDeleteProduct = async (id: IDBValidKey | IDBKeyRange) => {
    await removeProduct(id);
    fetchProducts();
  };

  const handleTranscription = (transcript: string) => {
    setQuickMealInput(transcript);
  };

  const handleClear = () => {
    setQuickMealInput("");
    setResponse("");
  };

  const togglePantry = () => {
    setShowPantry(!showPantry);
  };

  const toggleMealPlan = () => {
    setShowMealPlan(!showMealPlan);
  };

  // PROMPTY I STRZAŁ DO API

  const promptQuciky = `Bazując na tych składnikach: ${quickMealInput}, podaj mi prosty i szybki przepis do zrobienia.`;
  // const granaryQuick = `Bazując na tych składnikach: ${inputProduct}, podaj mi prosty i szybki przepis do zrobienia.`;

  const handleGenerateMeal = async () => {
    setLoading(true);
    await fetchChatCompletion(
      promptQuciky,
      (response: React.SetStateAction<string>) => {
        setResponse(response);
        setLoading(false);
      },
      setLoading
    );
  };


  const handleGenerateGranaryMeal = async () => {
    setLoading(true);
    try {
      const products = await getProducts(); // Pobieranie produktów z bazy danych
      const productNames = products.map((product) => product.name).join(", "); // Przygotowanie stringa ze składnikami
      const granaryQuick = `Bazując na tych składnikach: ${productNames}, podaj mi prosty i szybki przepis do zrobienia.`;

      await fetchChatCompletion(
        granaryQuick,
        (response: React.SetStateAction<string>) => {
          setResponse(response);
          setLoading(false);
        },
        setLoading
      );
    } catch (error) {
      console.error("Error fetching products:", error);
      setLoading(false);
    }
  };

  const handleUptadeTextArea = (value: string) => {
    setQuickMealInput(value);
    setInputProduct(value);
  };


  const handleAddToFavorites = async () => {
    if (response) {
      const newMealPlan = await addMealPlan(response);
      setMealPlans(prev => [...prev, newMealPlan]);
    }
  };

  const loadMealPlans = async () => {
    const loadedMealPlans = await getMealPlans();
    setMealPlans(loadedMealPlans);
    console.log("Meal plans loaded:", loadedMealPlans);
  };
  
  
const handleDeleteMealPlan = async (id: IDBValidKey | IDBKeyRange) => {
  await removeMealPlan(id);
  loadMealPlans(); 
};


  return (
    <div className={styles.container}>
      {loading && <Loader />}
      {response && (
        <>
          <p>{response}</p>
          <button onClick={handleAddToFavorites}>Add to Favorites</button>
        </>
      )}
      {!showPantry && !showMealPlan && (
        <div className={styles.actionsWrapper}>
          <button onClick={togglePantry}>SPICHLERZ</button>
          <button onClick={toggleMealPlan}>JADŁOSPISY</button>
        </div>
      )}

      {!showPantry && !showMealPlan && (
        <div className={styles.mainWrapper}>
          <SpeechToText
            onTranscript={handleTranscription}
            onClear={handleClear}
          />
          <textarea
            className={styles.textarea}
            value={quickMealInput}
            onChange={(e) => handleUptadeTextArea(e.target.value)}
            placeholder="Enter products..."
          />
          <div className={styles.buttonsWrapper}>
            <button onClick={handleAddProduct}>DODAJ DO SPICHLERZA</button>
            <button onClick={handleGenerateMeal}>SZYBKIE JEDZONKO</button>
            <button onClick={handleGenerateGranaryMeal}>
              Jedzonko z Spichlerza
            </button>
          </div>
        </div>
      )}

      {showPantry && (
        <div>
          <div className={styles.pantryContainer}>
            <div className={styles.productList}>
              {products.map((product) => (
                <div className={styles.productTag} key={product.id}>
                  {product.name}
                  <button
                    className={styles.deleteButton}
                    onClick={() => handleDeleteProduct(product.id)}
                  >
                    <span className={styles.xIcon}>&times;</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
          <div className={styles.actions}>
            <button className={styles.closeButton} onClick={togglePantry}>
              ZAMKNIJ SPICHLERZ
            </button>
            <button className={styles.clearButton} onClick={deleteDatabase}>
              CLEAR ALL
            </button>
          </div>
        </div>
      )}

      {showMealPlan && (
        <div className={styles.mealPlanContainer}>
          {mealPlans.map((plan, index) => (
          <div key={index}>
            <p>{plan.content}</p>
            <button onClick={() => handleDeleteMealPlan(plan.id)}>Delete</button>
          </div>
        ))}
          <button onClick={toggleMealPlan}>ZAMKNIJ JADŁOSPISY</button>
        </div>
      )}
    </div>
  );
};

export default App;
