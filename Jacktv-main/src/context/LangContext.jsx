import { createContext, useState } from 'react';

export const LangContext = createContext();

export const LangProvider = ({ children }) => {
  const [lang, setLang] = useState(localStorage.getItem('jacktv_lang') || 'en');

  const changeLang = (newLang) => {
    setLang(newLang);
    localStorage.setItem('jacktv_lang', newLang);
  };

  return (
    <LangContext.Provider value={{ lang, changeLang }}>
      {children}
    </LangContext.Provider>
  );
};
