const parseOrigins = (value) =>
  String(value || '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);

const defaultProductionOrigins = [
  'https://meloramoda.com',
  'https://www.meloramoda.com',
];

const validateEnv = () => {
  const missing = [];

  ['MONGODB_URI', 'JWT_SECRET', 'JWT_REFRESH_SECRET'].forEach((key) => {
    if (!process.env[key]) {
      missing.push(key);
    }
  });

  if (process.env.NODE_ENV === 'production' && !process.env.CLIENT_URL && !process.env.CLIENT_URLS) {
    missing.push('CLIENT_URL or CLIENT_URLS');
  }

  if (missing.length) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }

  const emailKeys = ['EMAIL_HOST', 'EMAIL_USER', 'EMAIL_PASS'];
  const configuredEmailKeys = emailKeys.filter((key) => Boolean(process.env[key]));
  const hasPartialEmailConfig = configuredEmailKeys.length > 0 && configuredEmailKeys.length < emailKeys.length;

  if (hasPartialEmailConfig) {
    console.warn(
      `Email configuration is incomplete. Set ${emailKeys.join(', ')} together to enable outgoing emails.`
    );
  }

  return {
    allowedOrigins: Array.from(
      new Set([
        ...parseOrigins(process.env.CLIENT_URLS),
        ...parseOrigins(process.env.CLIENT_URL),
        ...defaultProductionOrigins,
        'http://localhost:5173',
        'http://127.0.0.1:5173',
      ])
    ),
  };
};

module.exports = validateEnv;
