import React, { useEffect, useState } from "react";
import feather from "feather-icons";
import { useTranslation } from "react-i18next";
import { useAuth } from "../context/AuthContext"; // <-- Asegúrate que la ruta sea correcta
import "../components/ComponentsStyles/Modal.css";

// URLs de las banderas
const flags = {
  es: "https://flagcdn.com/w40/mx.png", // México
  en: "https://flagcdn.com/w40/us.png", // Estados Unidos
};

export const Topbar = () => {
  const { t, i18n } = useTranslation();
  // Obtenemos al usuario y la función de logout del contexto
  const { user, logout } = useAuth(); 

  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    feather.replace();
    const savedTheme = localStorage.getItem("theme") || "light";
    document.body.classList.toggle("dark-theme", savedTheme === "dark");
    document.body.classList.toggle("light-theme", savedTheme === "light");
    setIsDarkMode(savedTheme === "dark");
  }, []);

  const toggleLanguage = () => {
    i18n.changeLanguage(i18n.language === "es" ? "en" : "es");
  };

  const toggleTheme = () => {
    setIsDarkMode((prevMode) => {
      const newMode = !prevMode;
      const newTheme = newMode ? "dark" : "light";
      localStorage.setItem("theme", newTheme);
      document.body.className = `${newTheme}-theme`; // Forma más simple de cambiar la clase
      feather.replace(); // Re-ejecutar para los íconos de sol/luna
      return newMode;
    });
  };

  return (
    <nav className="navbar navbar-top fixed-top navbar-expand" id="navbarDefault">
      <div className="collapse navbar-collapse justify-content-between">
        <div className="navbar-logo">
          <button
            className="btn navbar-toggler navbar-toggler-humburger-icon hover-bg-transparent"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarVerticalCollapse"
            aria-controls="navbarVerticalCollapse"
            aria-expanded="false"
            aria-label="Toggle Navigation"
          >
            <span className="navbar-toggle-icon">
              <span className="toggle-line"></span>
            </span>
          </button>
          <a className="navbar-brand me-1 me-sm-3" href="/">
            <div className="d-flex align-items-center">
              <h5 className="logo-text ms-2 d-none d-sm-block">MinerIA</h5>
            </div>
          </a>
        </div>

        {/* --- Iconos y Acciones a la Derecha --- */}
        <ul className="navbar-nav navbar-nav-icons flex-row align-items-center">
          {/* Selector de Tema */}
          <li className="nav-item">
            <div className="theme-control-toggle fa-icon-wait px-2">
              <input
                className="form-check-input ms-0 theme-control-toggle-input"
                type="checkbox"
                onChange={toggleTheme}
                checked={isDarkMode}
                id="themeControlToggle"
              />
              <label className="mb-0 theme-control-toggle-label theme-control-toggle-light" htmlFor="themeControlToggle">
                <span className="icon" data-feather="sun"></span>
              </label>
              <label className="mb-0 theme-control-toggle-label theme-control-toggle-dark" htmlFor="themeControlToggle">
                <span className="icon" data-feather="moon"></span>
              </label>
            </div>
          </li>

          {/* Selector de Idioma con Bandera */}
          <li className="nav-item">
            <button
              className="btn-language-toggle"
              onClick={toggleLanguage}
              title={t("topbar.language")}
            >
              <img
                src={flags[i18n.language]}
                alt={i18n.language}
                width="28"
              />
            </button>
          </li>
          
          {/* --- NUEVO: Información del Usuario Directa --- */}
          {user && (
            <li className="nav-item ms-3">
              <div className="d-flex align-items-center">
                {/* Nombre y Rol (visible en pantallas medianas y grandes) */}
                <div className="d-none d-md-block ms-2 text-end">
                  <p className="mb-0 fw-bold lh-1 h6">{user.name}</p>
                  <small className="text-muted lh-1 ">{user.rol.name}</small>
                </div>
              </div>
            </li>
          )}
        </ul>
      </div>
      <style>
        {`
        /* Estilos para el botón de cambio de idioma */
.btn-language-toggle {
  background: none;
  border: none;
  padding: 0;
  margin: 0 0.5rem; /* Espacio ajustado */
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  overflow: hidden;
  width: 32px;
  height: 32px;
  transition: transform 0.2s ease-in-out, box-shadow 0.2s;
}

.btn-language-toggle:hover {
  transform: scale(1.1);
  box-shadow: 0 0 8px rgba(0, 0, 0, 0.2);
}

.btn-language-toggle img {
  width: 100%;
  height: auto;
  object-fit: cover;
}`}
      </style>
    </nav>
  );
};