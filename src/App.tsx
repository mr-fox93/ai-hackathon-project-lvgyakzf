import React, { useEffect } from "react";
import { fetchChatCompletion, createPromptForOpenAI } from "./apiService";
import styles from "./app.module.css";
import { addProduct, getProducts, removeProduct } from "./database";
import { useStore } from "./store/useStore";
import SpeechToText from "./SpeechTotext";

const App: React.FC = () => {
  const {
    inputProduct,
    setInputProduct,
    products,
    setProducts,
    showQuickMealPanel,
    setShowQuickMealPanel,
    quickMealInput,
    setQuickMealInput,
    setResult,
    results,
  } = useStore();

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    console.log(results);
  }, [results]);

  const fetchProducts = async () => {
    const items = await getProducts();
    setProducts(items);
  };

  const handleAddProduct = async () => {
    if (inputProduct.trim() !== "") {
      const newProduct = await addProduct({ name: inputProduct });
      if (newProduct.id) {
        setProducts((prevProducts) => [...prevProducts, newProduct]);
        setInputProduct("");
      }
    }
  };

  const handleDeleteProduct = async (id: IDBValidKey | IDBKeyRange) => {
    await removeProduct(id);
    fetchProducts();
  };

  const toggleQuickMealPanel = () => {
    setShowQuickMealPanel(!showQuickMealPanel);
    setQuickMealInput(inputProduct);
  };

  const handleTranscription = (transcript: string) => {
    setInputProduct(transcript);
  };

  const handleClear = () => {
    setInputProduct("");
  };

  const handleGenerateMeal = async () => {
    const prompt = createPromptForOpenAI(quickMealInput);
    const response = await fetchChatCompletion(prompt);
    console.log(response); //Tutaj możesz przetworzyć odpowiedź, np. wyświetlić ją użytkownikowi
    setResult(response);
  };

  return (
    <div className={styles.container}>
      <div className={styles.actionsWrapper}>
        <button>SPICHLERZ</button>
        <button>JADŁOSPISY</button>
      </div>
      {!showQuickMealPanel && (
        <div className={styles.mainWrapper}>
          <SpeechToText
            onTranscript={handleTranscription}
            onClear={handleClear}
          />

          <textarea
            className={styles.textarea}
            value={inputProduct}
            onChange={(e) => setInputProduct(e.target.value)}
            placeholder="Enter products..."
            style={{ width: "100%", minHeight: "50px" }}
          />
          <div className={styles.buttonsWrapper}>
            <button onClick={handleAddProduct}>DODAJ DO SPICHLERZA</button>
            <button onClick={toggleQuickMealPanel}>SZYBKIE JEDZONKO</button>
          </div>
        </div>
      )}

      {showQuickMealPanel && (
        <div className={styles.popupWrapper}>
          <textarea
            className={styles.popupTextarea}
            value={quickMealInput}
            onChange={(e) => setQuickMealInput(e.target.value)}
          />
          <div className={styles.popupButtons}>
            <button onClick={() => setShowQuickMealPanel(false)}>
              ZAMKNIJ
            </button>
            <button onClick={handleGenerateMeal}>GENERUJ POSIŁEK</button>
          </div>
        </div>
      )}

      <ul>
        {products.map((product) => (
          <li key={product.id}>
            {product.name}
            <button onClick={() => handleDeleteProduct(product.id)}>
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default App;
