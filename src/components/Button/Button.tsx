"use client";
import styles from "./Button.module.css";
import React from "react";

interface ButtonProps {
  variant?: "primary" | "long";
  children: React.ReactNode;
  onClick?: () => void;
  onMouseDown?: () => void;
  onMouseUp?: () => void;
}

const Button: React.FC<ButtonProps> = ({
  variant = "primary",
  children,
  onClick,
}) => {
  const variantClass = styles[variant] || styles.primary;

  return (
    <button className={`${styles.button} ${variantClass}`}>{children}</button>
  );
};

export default Button;
