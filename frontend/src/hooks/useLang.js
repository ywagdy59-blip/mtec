import { useContext } from "react";
import { LangContext } from "../context/LangContext";

export function useLang() {
  const context = useContext(LangContext);
  if (!context) throw new Error("useLang must be used inside <LangProvider>");
  return context;
}
