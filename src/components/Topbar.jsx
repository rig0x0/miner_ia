import React, { useEffect, useState } from "react";
import feather from "feather-icons";
import { useTranslation } from "react-i18next"; // <-- Solo necesitamos este hook
import "../components/ComponentsStyles/Modal.css";
// Ya no es necesario importar 'i18n from "i18next";' directamente aquí
// porque lo obtendremos del hook useTranslation.

export const Topbar = () => {
  const { t, i18n } = useTranslation();

  // Agrega este console.log para ver el idioma actual al cargar el componente
  useEffect(() => {
    console.log("Idioma actual al renderizar Topbar:", i18n.language);
    feather.replace(); // Mantén tu inicialización de feather-icons
    // ... tu lógica de tema
    const savedTheme = localStorage.getItem("theme") || "light";
    document.body.classList.add(savedTheme === "dark" ? "dark-theme" : "light-theme");
    setIsDarkMode(savedTheme === "dark");
  }, [i18n.language]); // Asegúrate de que este useEffect se ejecute cuando el idioma cambie también,
                      // aunque para la traducción automática no es estrictamente necesario,
                      // sí lo es si tienes efectos secundarios que dependan del idioma.


  const toggleLanguage = () => {
    console.log("Botón de cambio de idioma presionado.");
    console.log("Idioma ANTES del cambio:", i18n.language);
    const newLang = i18n.language === "es" ? "en" : "es";
    i18n.changeLanguage(newLang)
      .then(() => {
        console.log("Idioma DESPUÉS del cambio (promesa resuelta):", i18n.language);
      })
      .catch((err) => {
        console.error("Error al cambiar el idioma:", err);
      });
    console.log("Solicitud de cambio de idioma enviada a:", newLang);
  };

  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    feather.replace();

    const savedTheme = localStorage.getItem("theme") || "light";
    document.body.classList.add(savedTheme === "dark" ? "dark-theme" : "light-theme");
    setIsDarkMode(savedTheme === "dark");
  }, []);

  const toggleTheme = () => {
    const newTheme = isDarkMode ? "light" : "dark";
    document.body.classList.remove(isDarkMode ? "dark-theme" : "light-theme");
    document.body.classList.add(newTheme === "dark" ? "dark-theme" : "light-theme");
    localStorage.setItem("theme", newTheme);
    setIsDarkMode(!isDarkMode);
  };

  // ¡Hemos eliminado el estado 'language' y el useEffect que lo actualizaba!
  // useTranslation se encarga de que los textos se actualicen automáticamente.

  const navItems = [
    { icon: "pie-chart", label: t("topbar.dashboard"), href: "/tablero" },
    {
      icon: "globe",
      label: t("topbar.language"),
      href: "#!",
      onClick: toggleLanguage,
    },
  ];

  return (
    <nav className="navbar navbar-top fixed-top navbar-expand" id="navbarDefault">
      <div className="collapse navbar-collapse justify-content-between">
        <div className="navbar-logo">
          <button className="btn navbar-toggler navbar-toggler-humburger-icon hover-bg-transparent" type="button" data-bs-toggle="collapse" data-bs-target="#navbarVerticalCollapse" aria-controls="navbarVerticalCollapse" aria-expanded="false" aria-label="Toggle Navigation">
            <span className="navbar-toggle-icon"><span className="toggle-line"></span></span>
          </button>
          <a className="navbar-brand me-1 me-sm-3" href="/">
            <div className="d-flex align-items-center">
              <h5 className="logo-text ms-2 d-none d-sm-block">MinerIA</h5>
            </div>
          </a>
        </div>

        <ul className="navbar-nav navbar-nav-icons flex-row">
          <li className="nav-item">
            <div className="theme-control-toggle fa-icon-wait px-2">
              <input className="form-check-input ms-0 theme-control-toggle-input" type="checkbox" data-theme-control="phoenixTheme" value="dark" onChange={toggleTheme} id="themeControlToggle" />
              <label className="mb-0 theme-control-toggle-label theme-control-toggle-light" htmlFor="themeControlToggle" style={{ height: "32px", width: "32px" }}>
                <span className="icon" data-feather="sun"></span>
              </label>
              <label className="mb-0 theme-control-toggle-label theme-control-toggle-dark" htmlFor="themeControlToggle" style={{ height: "32px", width: "32px" }}>
                <span className="icon" data-feather="moon"></span>
              </label>
            </div>
          </li>

          <li className="nav-item dropdown">
            <a className="nav-link lh-1 pe-0" id="navbarDropdownUser" href="#!" role="button" data-bs-toggle="dropdown" data-bs-auto-close="outside" aria-haspopup="true" aria-expanded="false">
              <div className="avatar avatar-l">
                <img className="rounded-circle" src="assets/img/team/40x40/avatar.webp" alt="User Avatar" />
              </div>
            </a>
            <div className="dropdown-menu dropdown-menu-end navbar-dropdown-caret py-0 dropdown-profile shadow border" aria-labelledby="navbarDropdownUser">
              <div className="card position-relative border-0">
                <div className="card-body p-0">
                  <div className="text-center pt-4 pb-3">
                    <div className="avatar avatar-xl">
                      <img className="rounded-circle" src="assets/img/team/72x72/avatar.webp" alt="User Avatar Large" />
                    </div>
                  </div>
                </div>
                <div className="overflow-auto iconos dropdown-icons" style={{ height: "10rem" }}>
                  <ul className="nav d-flex flex-column mb-2 pb-1">
                    {navItems.map((item, index) => (
                      <li className="nav-item" key={index}>
                        <a
                          className="nav-link px-3 d-block"
                          href={item.href}
                          onClick={item.onClick || undefined}
                        >
                          <span className="me-2 icono-feather align-bottom" data-feather={item.icon}></span>
                          {item.label}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="border-translucent">
                  <hr />
                  <div>
                    <a className="btn fondoBtnVista d-flex flex-center w-100" href="/login">
                      <span className="me-2" data-feather="log-out"></span> {t("topbar.logout")}
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </li>
        </ul>
      </div>
    </nav>
  );
};