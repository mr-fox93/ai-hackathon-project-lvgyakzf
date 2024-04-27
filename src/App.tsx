// import React, { useEffect, useState } from "react";
// import { fetchChatCompletion } from "./apiService";
// import { saveAs } from "file-saver";
// import SpeechToText from "./SpeechTotext";
// import { deleteAllResponses, saveResponse } from "./services/supabaseService";
// import MessageDisplay from "./MessageDisplay";
// import { addProduct, getProducts, removeProduct } from "./database";
// import './style.css';

// interface Product {
//   name: string;
// }

// const App: React.FC = () => {
//   const [input, setInput] = useState("");
//   const [response, setResponse] = useState({});

//   const handleTranscription = (transcript: string) => {
//     setInput(transcript);
//   };

//   const handleSubmit = async () => {
//     const result = await fetchChatCompletion(input);
//     await saveResponse(result);
//     setResponse(result);
//     //saveResponseToFile(result);
//     console.log('response', response);
//   };

//   const handleClear = () => {
//     setInput("");
//     setResponse({});
//   };

//   return (
//     <div>
//       <button onClick={() => deleteAllResponses().catch(console.error)}>
//         Delete
//       </button>
//       <SpeechToText onTranscript={handleTranscription} onClear={handleClear} />
//       <input
//         type="text"
//         value={input}
//         onChange={(e) => setInput(e.target.value)}
//       />
//       <button onClick={handleSubmit}>Send</button>
//       {/* <pre>{JSON.stringify(response, null, 2)}</pre> */}
//       <MessageDisplay />

import React, { useEffect, useState } from 'react'
import { fetchChatCompletion } from './apiService'
import styles from './app.module.css'
import SpeechToText from './SpeechTotext'

import { addProduct, getProducts, removeProduct, deleteDatabase } from './database'
import { knownProducts } from './knownProducts'

interface Product {
	id: number
	name: string
}

const App: React.FC = () => {
	const [input, setInput] = useState('')
	const [inputProduct, setInputProduct] = useState('') // Oddzielny stan dla inputu produktów
	const [response, setResponse] = useState({})
	const [products, setProducts] = useState<Product[]>([])
	const [showQuickMealPanel, setShowQuickMealPanel] = useState(false)
	const [quickMealInput, setQuickMealInput] = useState('')
	const [showPantry, setShowPantry] = useState(false)
	const [showMealPlan, setShowMealPlan] = useState(false)
  const normalizeText = (text: string) => text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  
	useEffect(() => {
		fetchProducts()
	}, [])
	const fetchProducts = async () => {
		const items = await getProducts()
		setProducts(items)
	}

  const handleAddProduct = async () => {
    let inputLower = normalizeText(inputProduct);
    const productsToAdd = [];

    // Check for known products and add them separately
    for (const product of knownProducts) {
      const normalizedProduct = normalizeText(product);
      if (inputLower.includes(normalizedProduct)) {
        productsToAdd.push(product); // Add the original name, not normalized
        inputLower = inputLower.replace(new RegExp(normalizedProduct, 'g'), '');
      }
    }

    inputLower.split(' ').forEach(word => {
      if (word.trim() !== '') productsToAdd.push(word);
    });

    for (const product of productsToAdd) {
      const newProduct = await addProduct({ name: product });
      if (newProduct.id) {
        setProducts(prev => [...prev, newProduct]);
      }
    }

    setInputProduct('');
  };

	const handleDeleteProduct = async (id: IDBValidKey | IDBKeyRange) => {
		await removeProduct(id)
		fetchProducts()
	}

	const toggleQuickMealPanel = () => {
		setShowQuickMealPanel(!showQuickMealPanel)
		setQuickMealInput(inputProduct)
	}
	const togglePantry = () => {
		setShowPantry(!showPantry)
	}

	const toggleMealPlan = () => {
		setShowMealPlan(!showMealPlan)
	}

	return (
		<div className={styles.container}>
			{!showPantry && !showMealPlan && !showQuickMealPanel && (
				<div className={styles.actionsWrapper}>
					<button onClick={togglePantry}>SPICHLERZ</button>
					<button onClick={toggleMealPlan}>JADŁOSPISY</button>
				</div>
			)}

			{!showPantry && !showMealPlan && !showQuickMealPanel && (
				<div className={styles.mainWrapper}>
					<SpeechToText onTranscript={setInputProduct} onClear={() => setInputProduct('')} />
					<textarea
						className={styles.textarea}
						value={inputProduct}
						onChange={e => setInputProduct(e.target.value)}
						placeholder='Enter products...'
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
						onChange={e => setQuickMealInput(e.target.value)}
					/>
					<div className={styles.popupButtons}>
						<button onClick={() => setShowQuickMealPanel(false)}>ZAMKNIJ</button>
						<button onClick={() => console.log('Generating meal...')}>GENERUJ POSIŁEK</button>
					</div>
				</div>
			)}

			{showPantry && (
				<div className={styles.pantryContainer}>
					<ul>
						{products.map(product => (
							<li key={product.id}>
								{product.name}
								<button onClick={() => handleDeleteProduct(product.id)}>Delete</button>
							</li>
						))}
					</ul>
					<button onClick={togglePantry}>ZAMKNIJ SPICHLERZ</button>
				</div>
			)}

			{showMealPlan && (
				<div className={styles.mealPlanContainer}>
					<button onClick={toggleMealPlan}>ZAMKNIJ JADŁOSPISY</button>
				</div>
			)}
		</div>
	)
}

export default App
