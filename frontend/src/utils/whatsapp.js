export const MELORA_WHATSAPP_NUMBER = '905057777723';

export const normalizeWhatsAppNumber = (value) => {
  const digits = String(value || '').replace(/\D/g, '');

  if (digits.startsWith('90') && digits.length === 12) {
    return digits;
  }

  if (digits.startsWith('0') && digits.length === 11) {
    return `90${digits.slice(1)}`;
  }

  if (digits.startsWith('5') && digits.length === 10) {
    return `90${digits}`;
  }

  return MELORA_WHATSAPP_NUMBER;
};

export const toWhatsAppUrl = (value, message = '') => {
  if (typeof value === 'string' && value.startsWith('http')) {
    return value;
  }

  const baseUrl = `https://wa.me/${normalizeWhatsAppNumber(value)}`;
  return message ? `${baseUrl}?text=${encodeURIComponent(message)}` : baseUrl;
};
