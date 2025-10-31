/**
 * Utilitários para manipulação de texto
 */

/**
 * Trunca um texto para um número máximo de caracteres
 * @param {string} text - O texto a ser truncado
 * @param {number} maxLength - O número máximo de caracteres
 * @param {string} suffix - O sufixo a ser adicionado quando o texto for truncado (padrão: '...')
 * @returns {string} O texto truncado
 */
export const truncateText = (text, maxLength, suffix = '...') => {
  if (!text || typeof text !== 'string') {
    return '';
  }
  
  if (text.length <= maxLength) {
    return text;
  }
  
  return text.substring(0, maxLength - suffix.length) + suffix;
};

/**
 * Trunca texto especificamente para dispositivos móveis (32 caracteres)
 * @param {string} text - O texto a ser truncado
 * @returns {string} O texto truncado para mobile
 */
export const truncateForMobile = (text) => {
  return truncateText(text, 30);
};