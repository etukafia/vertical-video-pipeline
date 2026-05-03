import React from "react";
import { normalizeText } from "../utils/normalizeText";

export const BoldHook: React.FC<{ text: string; style?: React.CSSProperties }> = ({ text, style }) => {
  return (
    <h1
      style={{
        fontFamily: "Inter, sans-serif",
        fontWeight: "bold",
        fontSize: "120px",
        textAlign: "center",
        color: "white",
        textShadow: "0px 8px 16px rgba(0,0,0,0.6)",
        margin: 0,
        ...style,
      }}
    >
      {normalizeText(text)}
    </h1>
  );
};

export const LowerThird: React.FC<{ title: string; subtitle?: string; style?: React.CSSProperties }> = ({ title, subtitle, style }) => {
  return (
    <div
      style={{
        position: "absolute",
        bottom: "200px",
        left: "100px",
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        padding: "40px 60px",
        borderRadius: "20px",
        boxShadow: "0px 10px 30px rgba(0,0,0,0.5)",
        ...style,
      }}
    >
      <h2 style={{ fontFamily: "Inter, sans-serif", fontWeight: 800, fontSize: "80px", color: "white", margin: 0 }}>
        {normalizeText(title)}
      </h2>
      {subtitle && (
        <p style={{ fontFamily: "Inter, sans-serif", fontWeight: 400, fontSize: "50px", color: "#ddd", margin: "20px 0 0 0" }}>
          {normalizeText(subtitle)}
        </p>
      )}
    </div>
  );
};

export const Caption: React.FC<{ text: string; style?: React.CSSProperties }> = ({ text, style }) => {
  return (
    <div
      style={{
        fontFamily: "Inter, sans-serif",
        fontWeight: "bold",
        fontSize: "90px",
        textAlign: "center",
        color: "yellow",
        WebkitTextStroke: "4px black",
        textShadow: "0px 10px 20px rgba(0,0,0,0.8)",
        ...style,
      }}
    >
      {normalizeText(text)}
    </div>
  );
};
