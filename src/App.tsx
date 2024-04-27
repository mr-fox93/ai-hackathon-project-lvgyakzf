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


//   interface Product {
//     id: number;
//     name: string;
//   }
  

//     const [input2, setInput2] = useState('');
//     const [products, setProducts] = useState<Product[]>([]);
  
//     useEffect(() => {
//       fetchProducts();
//     }, []);
  
//     async function fetchProducts() {
//       const items = await getProducts();
//       setProducts(items);
//     }
  
//     async function handleAddProduct() {
//       if (input2.trim() !== '') {
//         await addProduct({ name: input2 });
//         setInput2('');
//         fetchProducts();
//       }
//     }
  
//     async function handleDeleteProduct(id: any) {
//       await removeProduct(id);
//       fetchProducts();
//     }
  

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

//       <div>
//       <input
//         type="text"
//         value={input}
//         onChange={(e) => setInput(e.target.value)}
//         placeholder="Add a product..."
//       />
//       <button onClick={handleAddProduct}>Add Product</button>
//       <ul>
//         {products.map(product => (
//           <li key={product.id} onClick={() => handleDeleteProduct(product.id)} className="chip">
//             {product.name}
//           </li>
//         ))}
//       </ul>
     
//     </div>
//     </div>
//   );
// };

// export default App;


import React, { useEffect, useState } from "react";
import { fetchChatCompletion } from "./apiService";
import styles from './app.module.css'
import SpeechToText from "./SpeechTotext";

import { addProduct, getProducts, removeProduct, deleteDatabase } from "./database";

interface Product {
  id: number; // Ustalamy, że id musi być zawsze obecne
  name: string;
}

const App: React.FC = () => {
  const [input, setInput] = useState("");
  const [inputProduct, setInputProduct] = useState(""); // Oddzielny stan dla inputu produktów
  const [response, setResponse] = useState({});
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    fetchProducts();
  }, []);

  async function fetchProducts() {
    const items = await getProducts();
    setProducts(items);
  }

  async function handleAddProduct() {
    if (inputProduct.trim() !== '') {
      const newProduct = await addProduct({ name: inputProduct });
      if (newProduct.id) {
        setProducts(prevProducts => [...prevProducts, newProduct]); // Dodajemy produkt do istniejącej listy
      }
      setInputProduct(''); // Czyść input produktów, a nie główny input
    }
  }
  async function handleDeleteProduct(id: IDBKeyRange | IDBValidKey | undefined) {
    console.log("Deleting product with ID:", id); // Sprawdź, czy ID jest poprawnie wyświetlane
    if (id !== undefined) {
      await removeProduct(id);
      fetchProducts();
    } else {
      console.error("Product ID is undefined.");
    }
  }




  return (
    <div>

      <SpeechToText onTranscript={setInput} onClear={() => { setInput(""); setResponse({}); }} />
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Type your message..."
      />
      <button onClick={() => console.log(input)}>Send</button>


      <div>
        <input
          type="text"
          value={inputProduct}
          onChange={(e) => setInputProduct(e.target.value)}
          placeholder="Add a product..."
        />
        <button onClick={handleAddProduct}>Add Product</button>
        <ul>
          {products.map(product => (
            <li key={product.id}  className={styles.chip}>
              {product.name}<div onClick={() => handleDeleteProduct(product.id!)}>USUŃMNIE</div>
            </li>
          ))}
        </ul>
      </div>
      <button onClick={() => deleteDatabase()}>wyczyszc magazyn</button>
    </div>
  );
};

export default App;
