import React, { useState } from 'react';
import styles from './Checkbox.module.css'; // Importuj styl CSS dla checkboxa

interface CheckboxProps {
    id: string;
    label: string;
    checked: boolean;
    onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    disabled?: boolean;
}

const Checkbox = ({ id, label, checked= true, onChange, disabled }: CheckboxProps) => {
  const [isChecked, setIsChecked] = useState(checked);

  const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setIsChecked(event.target.checked); // Zaktualizuj stan w oparciu o aktualną wartość checkboxa
    onChange(event); // Wywołaj funkcję onChange przekazaną przez propsy
  };

  return (
    <label htmlFor={id} className={styles.label} onClick={() => handleCheckboxChange}>
      <input 
        id={id} 
        type="checkbox" 
        checked={isChecked} 
        onChange={handleCheckboxChange} 
        disabled={disabled} 
        className={styles.checkbox} // Upewnij się, że nazwa klasy jest poprawna
      />
      <div className={styles.customCheckbox}></div> {/* Użyj poprawnej nazwy klasy dla Twojego niestandardowego wyglądu */}
      {label}
    </label>
  );
};

export default Checkbox;
