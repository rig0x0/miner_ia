import React, { useState } from 'react';
import { Card, Button, Form, Row, Col, ButtonGroup } from 'react-bootstrap';
import { useQuery } from '@tanstack/react-query';
import clienteAxios from '../config/axios';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useTranslation } from 'react-i18next';

export const Ejemplo = () => {
   const { t } = useTranslation();

  return (
    <div className="container m-0">
      <p>{t("topbar.logout")}</p>
      {console.log("Idioma actual:", i18n.language)}
    </div>
  );
};
