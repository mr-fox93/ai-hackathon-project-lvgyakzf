import { create } from 'zustand'

interface Product {
	id: number
	name: string
}

interface Result {
	id: string
	message: string
}

interface StoreProps {
	inputProduct: string
	setInputProduct: (inputProduct: string) => void
	products: Product[]
	setProducts: (products: Product[] | ((prevProducts: Product[]) => Product[])) => void
	quickMealInput: string
	setQuickMealInput: (quickMealInput: string) => void
	results: Result[]
	setResult: (result: Result[] | ((prevResults: Result[]) => Result[])) => void
	showPantry: boolean
	setShowPantry: (showPantry: boolean) => void
	showMealPlan: boolean
	setShowMealPlan: (showMealPlan: boolean) => void
}

export const useStore = create<StoreProps>(set => ({
	inputProduct: '',
	setInputProduct: (inputProduct: string) => set({ inputProduct }),
	products: [],
	setProducts: (products: Product[] | ((prevProducts: Product[]) => Product[])) =>
		set(state => ({
			products: typeof products === 'function' ? products(state.products) : products,
		})),
	quickMealInput: '',
	setQuickMealInput: (quickMealInput: string) => set({ quickMealInput }),
	results: [],
	setResult: (results: Result[] | ((prevResults: Result[]) => Result[])) =>
		set(state => ({
			results: typeof results === 'function' ? results(state.results) : results,
		})),
	showPantry: false,
	setShowPantry: (showPantry: boolean) => set({ showPantry }),
	showMealPlan: false,
	setShowMealPlan: (showMealPlan: boolean) => set({ showMealPlan }),
}))
