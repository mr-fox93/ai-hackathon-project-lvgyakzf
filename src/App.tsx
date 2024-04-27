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

	useEffect(() => {
		fetchProducts()
	}, [])
	const fetchProducts = async () => {
		const items = await getProducts()
		setProducts(items)
	}

	const handleAddProduct = async () => {
		if (inputProduct.trim() !== '') {
			const newProduct = await addProduct({ name: inputProduct })
			if (newProduct.id) {
				setProducts(prevProducts => [...prevProducts, newProduct])
			}
			setInputProduct('')
		}
	}

	const handleDeleteProduct = async (id: IDBValidKey | IDBKeyRange) => {
		await removeProduct(id)
		fetchProducts()
	}

	const toggleQuickMealPanel = () => {
		setShowQuickMealPanel(!showQuickMealPanel)
		setQuickMealInput(inputProduct)
	}

	return (
		<div className={styles.container}>
			<div className={styles.actionsWrapper}>
				<button>SPICHLERZ</button>
				<button>JADŁOSPISY</button>
			</div>
			{!showQuickMealPanel && (
				<div className={styles.mainWrapper}>
					<SpeechToText onTranscript={setInputProduct} onClear={() => setInputProduct('')} />
					<textarea
						className={styles.textarea}
						value={inputProduct}
						onChange={e => setInputProduct(e.target.value)}
						placeholder='Enter products...'
						style={{ width: '100%', minHeight: '50px' }}
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

			<ul>
				{products.map(product => (
					<li key={product.id}>
						{product.name}
						<button onClick={() => handleDeleteProduct(product.id)}>Delete</button>
					</li>
				))}
			</ul>
		</div>
	)
}

export default App
