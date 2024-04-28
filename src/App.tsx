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
import Checkbox from "./components/Checkbox/Checkbox";
import Loader from "./components/Loader/Loader";
import Header from "./components/Header/Header";
import CloseIcon from "./assets/CloseIcon";

interface MealPlan {

	id: number
	name: string // Add name field
	content: string
}

const App: React.FC = () => {
	const [loading, setLoading] = useState(false)
	const [response, setResponse] = useState('')
	const [mealPlans, setMealPlans] = useState([] as MealPlan[])
	const [showProductNames, setShowProductNames] = useState(false)
	const [showAddFavorite, setShowAddFavorite] = useState(false)
	const [favoriteName, setFavoriteName] = useState('')
	const [showMealPlanSingle, setShowMealPlanSingle] = useState<number | null>(null)
  const [searchTerm, setSearchTerm] = useState("");


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
	} = useStore()


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

  const togglePantry = () => {
    setShowPantry(!showPantry);
  };

  const toggleMealPlan = () => {
    setShowMealPlan(!showMealPlan);
  };


	const handleTranscription = (transcript: string) => {
		setQuickMealInput(transcript)
	}


  const handleClear = () => {
    setQuickMealInput("");
    setResponse("");
  };


	const handleGenerateMeal = async () => {
		setLoading(true)
		await fetchChatCompletion(
			`Bazując na tych składnikach: ${
				showProductNames ? quickMealInput + ', ' + products.map(product => product.name).join(', ') : quickMealInput
			}, podaj mi prosty i szybki przepis do zrobienia.`,
			(response: React.SetStateAction<string>) => {
				setResponse(response)
				setLoading(false)
			},
			setLoading
		)
	}


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

  const handleUptadeTextArea = (value: string) => {
    setQuickMealInput(value);
    setInputProduct(value);
  };


	const handleSaveFavorite = async () => {
		if (favoriteName && response) {
			const newMealPlan = await addMealPlan(favoriteName, response)
			setMealPlans(prev => [...prev, newMealPlan])
			setFavoriteName('')
			setShowAddFavorite(false)
		}
	}


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
		setShowMealPlanSingle(prev => prev === id ? null : id);
	  };
  const handleDeletePantry = async () => {
    await deleteDatabase(() => {
        setProducts([]);
        console.log('All data has been cleared from UI');
    });
}

	return (
		<div className={styles.container}>
        <Header />
			{loading && <Loader />}
			{response && !showMealPlan && (
				<div className={styles.responseWrapper}>
					<p className={styles.response}>{response}</p>
					<button onClick={() => setShowAddFavorite(true)}>DODAJ DO ULUBIONYCH</button>
					<button onClick={handleGenerateMeal}>GENERUJ INNE JEDZONKO</button>
				</div>
			)}

			{showAddFavorite && (
				<div
					style={{
						position: 'fixed',
						zIndex: 999,
						top: '50%',
						left: '50%',
						transform: 'translate(-50%, -50%)',
						backgroundColor: 'white',
						padding: '20px',
					}}>
					<input value={favoriteName} onChange={e => setFavoriteName(e.target.value)} placeholder='Wymyśl nazwę' />
					<button onClick={handleSaveFavorite}>Zapisz</button>
				</div>
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
            <button className={styles.addButton} onClick={handleAddProduct}>
              DODAJ DO SPICHLERZA
            </button>
            <div className={styles.buttonsWrapper}>
              <button onClick={handleGenerateMeal}>SZYBKIE JEDZONKO</button>
              <button onClick={handleGenerateMealPlan}>
                KONKRETNE JEDZONKO
              </button>
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
                onChange={e => setSearchTerm(e.target.value)}
                className={styles.searchInput}
            />
             {searchTerm && (
        <button className={styles.clearButton} onClick={() => setSearchTerm("")}>
            &times;
        </button>
    )}
       </div>
        <ul className={styles.pantryList}>
        {products.filter(product => product.name.toLowerCase().startsWith(searchTerm.toLowerCase())).map(product => (
            <li key={product.id}>
                {product.name}
                <button onClick={() => handleDeleteProduct(product.id)}>Delete</button>
            </li>
        ))}
        </ul>
        <div className={styles.pantryBtnWrapper}>
            <button className={styles.pantryBtn} onClick={togglePantry}>ZAMKNIJ SPICHLERZ</button>
            <button className={styles.pantryBtn} onClick={handleDeletePantry}>CLEAR ALL</button>
        </div>
    </div>
          )}

			{showMealPlan && (
				<div className={styles.mealPlanContainer}>
					<button className={styles.closeMealsBtn} onClick={toggleMealPlan}>
						ZAMKNIJ JADŁOSPISY
					</button>
					<div className={styles.flexWrapper}>
					{mealPlans.map((plan, index) => (
      <div className={styles.mealWrapper} key={index}>
        <h3 onClick={() => handleToggleMealPlanDisplay(plan.id)}>{plan.name}</h3>
        {showMealPlanSingle === plan.id && <p>{plan.content}</p>}
        <button onClick={(e) => {
          e.stopPropagation();
          handleDeleteMealPlan(plan.id);
        }}>Delete</button>
      </div>
    ))}
					</div>
				</div>
			)}
		</div>
	)
}


export default App;
