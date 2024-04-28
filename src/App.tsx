import React, { useEffect, useState } from "react";
import { fetchChatCompletion } from "./apiService";
import styles from "./app.module.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import {
	addProduct,
	getProducts,
	removeProduct,
	deleteDatabase,
	getMealPlans,
	addMealPlan,
	removeMealPlan,
} from './database'
import { useStore } from './store/useStore'
import SpeechToText from './SpeechTotext'
import { knownProducts } from './knownProducts'
import Checkbox from './components/Checkbox/Checkbox'
import Loader from './components/Loader/Loader'
import Header from './components/Header/Header'
import CloseIcon from './assets/CloseIcon'
import LeftArrow from './assets/LeftArrow'
import Modal from './components/Modal/Modal'

interface MealPlan {
	id: number
	name: string // Add name field
	content: string
}

const App: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState("");
  const [mealPlans, setMealPlans] = useState([] as MealPlan[]);
  const [showProductNames, setShowProductNames] = useState(true);
  const [showAddFavorite, setShowAddFavorite] = useState(false);
  const [favoriteName, setFavoriteName] = useState("");
  const [showMealPlanSingle, setShowMealPlanSingle] = useState<number | null>(
    null
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const notifyGranary = () => toast("Dodano do spichlerza");
  const notifyMealPlan = () => toast("Dodano do planu posiłków");

  const toggleDropdown = () => {
    setDropdownVisible(!dropdownVisible);
  };

  useEffect(() => {
    getMealPlans();
  }, []);

  const {
    inputProduct,
    setInputProduct,
    products,
    setProducts,
    quickMealInput,
    setShowMealPlan,
    showMealPlan,
    setQuickMealInput,
    setResult,
    results,
    showPantry,
    setShowPantry,
    setModalResponse,
    modalResponse,
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
    notifyGranary();
  };

  const handleDeleteProduct = async (id: IDBValidKey | IDBKeyRange) => {
    await removeProduct(id);
    fetchProducts();
  };

  const togglePantry = () => {
    setShowPantry(!showPantry);
  };

  const toggleMealPlan = () => {
    setShowMealPlan(!showMealPlan);
  };

  const handleTranscription = (transcript: string) => {
    setQuickMealInput(transcript);
  };

  const handleClear = () => {
    setQuickMealInput("");
    setResponse("");
  };

  const handleUptadeTextArea = (value: string) => {
    setQuickMealInput(value);
    setInputProduct(value);
  };

  const handleSaveFavorite = async () => {
    if (favoriteName && response) {
      const newMealPlan = await addMealPlan(favoriteName, response);
      setMealPlans((prev) => [...prev, newMealPlan]);
      setFavoriteName("");
      setShowAddFavorite(false);
      notifyMealPlan();
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

  const handleToggleMealPlanDisplay = (id: number) => {
    setShowMealPlanSingle((prev) => (prev === id ? null : id));
  };
  const handleDeletePantry = async () => {
    await deleteDatabase(() => {
      setProducts([]);
      console.log("All data has been cleared from UI");
    });
  };

  // PROMPTY I FUNKCJE DO WALENIA W GPT!!!

  const checkToDoAgain = async (plan: string) => {
    setLoading(true);
    const products = await getProducts(); // Pobierz produkty za pomocą funkcji getProducts

    if (products.length === 0) {
      // alert('TWÓJ SPICHLERZ JEST PUSTY MÓJ PANIE')
      setModalResponse("TWÓJ SPICHLERZ JEST PUSTY MÓJ PANIE");

      setLoading(false);
      return;
    }

    const productNames = products.map((product) => product.name).join(", "); // Przyjmijmy, że każdy produkt ma pole 'name'

    await fetchChatCompletion(
      `Czy mogę wykonać ten przepis: ${plan} bazując na składnikach, które mam w moim spichlerzu: ${productNames}. Sprawdź dokładnie to co mam i czy zgadza się z tym czego wymaga przepis. Jeśli mam część składników wymień te których nie mam. Jak mam zupełnie inne zaproponuj przepis do zrobienia z tego co mam.`,

      // (response: React.SetStateAction<string>) => {
      (response: string) => {
        // Zmień tutaj typ na string

        // alert(response)
        setModalResponse(response);

        setLoading(false);
      },
      setLoading
    );
  };

  const handleGenerateMeal = async () => {
    setLoading(true);
    await fetchChatCompletion(
      `Bazując na tych składnikach: ${
        showProductNames
          ? quickMealInput +
            ", " +
            products.map((product) => product.name).join(", ")
          : quickMealInput
      }, podaj mi prosty i szybki przepis do zrobienia.`,
      (response: React.SetStateAction<string>) => {
        setResponse(response);
        setLoading(false);
      },
      setLoading
    );
  };

  const handleGenerateMealPlan = async () => {
    setLoading(true);
    await fetchChatCompletion(
      `Bazując na tych składnikach: ${
        showProductNames
          ? quickMealInput +
            ", " +
            products.map((product) => product.name).join(", ")
          : quickMealInput
      }, podaj mi jadłospis na cały dzień. jeśli składników jest za mało zasugeruj coś na zakupy`,
      (response: React.SetStateAction<string>) => {
        setResponse(response);
        setLoading(false);
      },
      setLoading
    );
  };

  const handleGenerateHealthyMeal = async () => {
    setLoading(true);
    await fetchChatCompletion(
      `Bazując na tych składnikach: ${
        showProductNames
          ? quickMealInput +
            ", " +
            products.map((product) => product.name).join(", ")
          : quickMealInput
      }, podaj mi prosty i ZDROWY przepis do zrobienia, i dorzuć jakąś przyjacielską zdrowostkę.`,
      (response: React.SetStateAction<string>) => {
        setResponse(response);
        setLoading(false);
      },
      setLoading
    );
  };

  const handleGenerateDinner = async () => {
    setLoading(true);
    await fetchChatCompletion(
      `Bazując na tych składnikach: ${
        showProductNames
          ? quickMealInput +
            ", " +
            products.map((product) => product.name).join(", ")
          : quickMealInput
      }, podaj mi prosty przepis na jakiś smaczny ciepły syty obiadek`,
      (response: React.SetStateAction<string>) => {
        setResponse(response);
        setLoading(false);
      },
      setLoading
    );
  };

  const closeModal = () => {
    setModalResponse(""); // Clear the modal response to hide the modal
  };

  const handleGenerateBreakfast = async () => {
    setLoading(true);
    await fetchChatCompletion(
      `Bazując na tych składnikach: ${
        showProductNames
          ? quickMealInput +
            ", " +
            products.map((product) => product.name).join(", ")
          : quickMealInput
      }, podaj mi prosty i smaczny przepis na super śniadanie`,
      (response: React.SetStateAction<string>) => {
        setResponse(response);
        setLoading(false);
      },
      setLoading
    );
  };

  return (
    <div className={styles.container}>
      <Header />
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />

      {loading && <Loader />}

      {modalResponse && <Modal message={modalResponse} onClose={closeModal} />}

      {response && !showMealPlan && (
        <div className={styles.responseWrapper}>
          <p className={styles.response}>{response}</p>
          <div className={styles.responseButtons}>
            <button
              onClick={() => {
                setShowAddFavorite(true);
              }}
            >
              DODAJ DO JADŁOSPISU
            </button>

            <button onClick={handleGenerateMeal}>GENERUJ INNE JEDZONKO</button>
            <button onClick={handleClear}>ZAMKNIJ</button>
          </div>
        </div>
      )}

      {showAddFavorite && (
        <div
          style={{
            position: "fixed",
            zIndex: 999,
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            backgroundColor: "white",
            padding: "20px",
          }}
        >
          <input
            value={favoriteName}
            onChange={(e) => setFavoriteName(e.target.value)}
            placeholder="Wymyśl nazwę"
          />
          <button onClick={handleSaveFavorite}>ZAPISZ</button>
        </div>
      )}

      {!showPantry && !showMealPlan && !response && (
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
            placeholder="Wpisz produkty..."
          />
          <button
            className={styles.addButton}
            onClick={handleAddProduct}
            disabled={quickMealInput.length < 1 || inputProduct.length < 1}
          >
            DODAJ DO SPICHLERZA
          </button>
          <div className={styles.buttonsWrapper}>
            <button className={styles.buttonMain} onClick={handleGenerateMeal}>
              SZYBKIE JEDZONKO
            </button>
            <div className={styles.dropdownWrapper}>
              {dropdownVisible && (
                <div className={`${styles.dropdown} ${styles.dropdownUp}`}>
                  <button
                    className={styles.dropdownButton}
                    onClick={handleGenerateHealthyMeal}
                  >
                    <LeftArrow />
                    ZDROWE JEDZONKO
                  </button>
                  <button
                    className={styles.dropdownButton}
                    onClick={handleGenerateMealPlan}
                  >
                    <LeftArrow />
                    JADŁOSPIS NA CAŁY DZIEŃ
                  </button>
                  <button
                    className={styles.dropdownButton}
                    onClick={handleGenerateBreakfast}
                  >
                    <LeftArrow />
                    SMACZNE ŚNIADANKO
                  </button>
                  <button
                    className={styles.dropdownButton}
                    onClick={handleGenerateDinner}
                  >
                    <LeftArrow />
                    SYTY OBIADEK
                  </button>
                </div>
              )}
              <button className={styles.buttonMain} onClick={toggleDropdown}>
                KONKRETNE JEDZONKO
              </button>
            </div>
          </div>
          <Checkbox
            id="showProductNames"
            label="uwzględnij spichlerz"
            checked={showProductNames}
            onChange={(e) => setShowProductNames(e.target.checked)}
          />
        </div>
      )}

      {showPantry && (
        <div className={styles.pantryContainer}>
          <div className={styles.searchBox}>
            <input
              type="text"
              placeholder="Szukaj produktu..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button
                className={styles.clearButton}
                onClick={() => setSearchTerm("")}
              >
                &times;
              </button>
            )}
          </div>
          <ul className={styles.pantryList}>
            {products
              .filter((product) =>
                product.name.toLowerCase().startsWith(searchTerm.toLowerCase())
              )
              .map((product) => (
                <li key={product.id}>
                  {product.name}
                  <button onClick={() => handleDeleteProduct(product.id)}>
                    USUŃ
                  </button>
                </li>
              ))}
          </ul>
          <div className={styles.pantryBtnWrapper}>
            <button className={styles.pantryBtn} onClick={togglePantry}>
              ZAMKNIJ SPICHLERZ
            </button>
            <button className={styles.pantryBtn} onClick={handleDeletePantry}>
              WYCZYŚĆ SPICHLERZ
            </button>
          </div>
        </div>
      )}

      {showMealPlan && (
        <div className={styles.mealPlanContainer}>
          <button className={styles.closeMealsBtn} onClick={toggleMealPlan}>
            ZAMKNIJ JADŁOSPISY
          </button>
          <div className={styles.mealsWrapper}>
            {mealPlans.map((plan, index) => (
              <div className={styles.mealWrapper} key={index}>
                <h3 onClick={() => handleToggleMealPlanDisplay(plan.id)}>
                  {plan.name}
                </h3>
                {showMealPlanSingle === plan.id && <p>{plan.content}</p>}
                <div className={styles.mealButtons}>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteMealPlan(plan.id);
                    }}
                  >
                    USUŃ
                  </button>
                  <button onClick={() => checkToDoAgain(plan.content)}>
                    SPRAWDŹ CZY MOŻESZ
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
