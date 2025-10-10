import React from 'react';
import pkg from '../../package.json';

const Footer = () => {
  const appVersion = import.meta.env.VITE_APP_VERSION || pkg.version;
  return (
    <footer className="bg-gray-800 text-white py-4">
      <div className="container mx-auto px-4 text-center">
        <p>
          &copy; {new Date().getFullYear()} Lembre+. Todos os direitos reservados.
          <span className="text-gray-300 ml-2">Versão v{appVersion}</span>
        </p>
      </div>
    </footer>
  );
};

export default Footer;