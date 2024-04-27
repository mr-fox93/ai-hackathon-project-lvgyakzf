import React, { useEffect } from 'react'
import { fetchChatCompletion, createPromptForOpenAI } from './apiService'
import styles from './app.module.css'
import { addProduct, getProducts, removeProduct, deleteDatabase } from './database'
import { useStore } from './store/useStore'
import SpeechToText from './SpeechTotext'
import { knownProducts } from './knownProducts'

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
		showMealPlan,
		setShowMealPlan,
		showPantry,
		setShowPantry,
	} = useStore()

  const normalizeText = (text: string) =>
		text
			.normalize('NFD')
			.replace(/[\u0300-\u036f]/g, '')
			.toLowerCase()

	useEffect(() => {
		fetchProducts()
	}, [])

	useEffect(() => {
		console.log(results)
	}, [results])

	const fetchProducts = async () => {
		const items = await getProducts()
		setProducts(items)
	}

const handleAddProduct = async () => {
		let inputLower = normalizeText(inputProduct)
		const productsToAdd = []

		// Check for known products and add them separately
		for (const product of knownProducts) {
			const normalizedProduct = normalizeText(product)
			if (inputLower.includes(normalizedProduct)) {
				productsToAdd.push(product) // Add the original name, not normalized
				inputLower = inputLower.replace(new RegExp(normalizedProduct, 'g'), '')
			}
		}

		// Add remaining single word products
		inputLower.split(' ').forEach(word => {
			if (word.trim() !== '') productsToAdd.push(word)
		})

		// Add each product to the database and state
		for (const product of productsToAdd) {
			const newProduct = await addProduct({ name: product })
			if (newProduct.id) {
				setProducts(prev => [...prev, newProduct])
			}
		}

		setInputProduct('')
	}


	const handleDeleteProduct = async (id: IDBValidKey | IDBKeyRange) => {
		await removeProduct(id)
		fetchProducts()
	}

	const toggleQuickMealPanel = () => {
		setShowQuickMealPanel(!showQuickMealPanel)
		setQuickMealInput(inputProduct)
	}

	const handleTranscription = (transcript: string) => {
		setInputProduct(transcript)
	}

	const handleClear = () => {
		setInputProduct('')
	}

	const handleGenerateMeal = async () => {
		const prompt = createPromptForOpenAI(quickMealInput)
		const response = await fetchChatCompletion(prompt)
		console.log(response) //Tutaj możesz przetworzyć odpowiedź, np. wyświetlić ją użytkownikowi
		setResult(response)
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
  <SpeechToText onTranscript={handleTranscription} onClear={handleClear} />
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
          <button onClick={handleGenerateMeal}>GENERUJ POSIŁEK</button>
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
