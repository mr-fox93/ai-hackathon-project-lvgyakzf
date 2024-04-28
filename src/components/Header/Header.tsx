"use client";
import React from "react";
import styles from "./Header.module.css";
import logo from "../../assets/GastroGuru.png";

type Props = {};

const Header = (props: Props) => {
  return (
    <>
      <header className={styles.header}>
        <img src={logo} alt="AI ShopMate Logo" />
      </header>
    </>
  );
};
export default Header;
