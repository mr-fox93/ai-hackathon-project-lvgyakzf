import styles from "./Modal.module.css";

interface ModalProps {
  message: string;
  onClose: () => void;
}

const Modal = ({ message, onClose }: ModalProps) => {
  return (
    <div className={styles.modalBackdrop}>
      <div className={styles.modalContent}>
        <div>{message}</div>
        <button onClick={onClose}>Zamknij</button>
      </div>
    </div>
  );
};

export default Modal;
