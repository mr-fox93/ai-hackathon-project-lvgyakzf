import React from "react";
import styles from "./Copyright.module.css";

type Props = {};

const Copyright = (props: Props) => {
  const currentYear = new Date().getFullYear();

  return (
    <div className={styles.copy}>
      {" "}
      <p>Made with 💜 by buty z kalkuty</p>
    </div>
  );
};

export default Copyright;
