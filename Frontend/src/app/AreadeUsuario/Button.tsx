"use client";

import { useFormStatus } from "react-dom";
import styles from "./logindeUsuario.module.scss";

export function Button() {
  const { pending } = useFormStatus();

  return (
    <button 
      type="submit" 
      disabled={pending} 
      className={`${styles.btn} ${styles.solid}`}
    >
      {pending ? <span className={styles.spinner}></span> : "Acessar Sistema"}
    </button>
  );
}