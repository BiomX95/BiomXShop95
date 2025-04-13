import React from "react";
import { FaWhatsapp } from "react-icons/fa";

export default function MinimalHome() {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <header className="bg-red-600 text-white p-4">
        <div className="container mx-auto">
          <h1 className="text-2xl font-bold">BiomX Shop</h1>
          <p className="text-sm">Магазин алмазов Free Fire</p>
        </div>
      </header>
      
      <main className="flex-1 py-8">
        <div className="container mx-auto px-4">
          <div className="bg-white p-6 rounded shadow-lg mb-8">
            <h2 className="text-xl font-bold mb-4">Добро пожаловать в магазин алмазов Free Fire</h2>
            <p className="mb-4">
              Здесь вы можете приобрести алмазы для игры Free Fire по выгодным ценам.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-6 rounded shadow-lg">
              <h3 className="text-lg font-bold mb-2">100 + 5 алмазов</h3>
              <p className="text-red-600 font-bold mb-2">90₽</p>
              <button className="bg-red-600 text-white px-4 py-2 rounded w-full">Купить</button>
            </div>
            
            <div className="bg-white p-6 rounded shadow-lg">
              <h3 className="text-lg font-bold mb-2">310 + 16 алмазов</h3>
              <p className="text-red-600 font-bold mb-2">260₽</p>
              <button className="bg-red-600 text-white px-4 py-2 rounded w-full">Купить</button>
            </div>
            
            <div className="bg-white p-6 rounded shadow-lg">
              <h3 className="text-lg font-bold mb-2">520 + 26 алмазов</h3>
              <p className="text-red-600 font-bold mb-2">429₽</p>
              <button className="bg-red-600 text-white px-4 py-2 rounded w-full">Купить</button>
            </div>
          </div>
          
          {/* Секция менеджера-помощника */}
          <div className="bg-white p-6 rounded shadow-lg">
            <div className="flex flex-col sm:flex-row items-center">
              <div className="flex items-center mb-4 sm:mb-0 sm:mr-6">
                <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center text-white mr-3">Т</div>
                <div>
                  <h3 className="font-bold">Тимерлан</h3>
                  <p className="text-gray-600 text-sm">Менеджер-помощник</p>
                </div>
              </div>
              <a 
                href="https://wa.me/+79899282649" 
                target="_blank"
                rel="noopener noreferrer" 
                className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-full flex items-center"
              >
                <FaWhatsapp className="mr-2" />
                <span>Написать в WhatsApp</span>
              </a>
            </div>
          </div>
        </div>
      </main>
      
      <footer className="bg-gray-800 text-white p-6">
        <div className="container mx-auto">
          <div className="text-center">
            <p>&copy; {new Date().getFullYear()} BiomX Shop. Все права защищены.</p>
            <p className="text-sm text-gray-400 mt-1">
              Free Fire является зарегистрированной торговой маркой Garena
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}