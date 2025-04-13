import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Получаем название магазина из URL параметра
const urlParams = new URLSearchParams(window.location.search);
const shopName = urlParams.get('shop') || 'BiomX_Shop';

// Устанавливаем заголовок страницы с названием магазина
document.title = `${shopName} - Free Fire Магазин Алмазов`;

// Создаем корневой элемент React
createRoot(document.getElementById("root")!).render(<App />);
