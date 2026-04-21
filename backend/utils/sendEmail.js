const nodemailer = require('nodemailer');

const stripHtml = (html = '') =>
  String(html)
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const isPlaceholderValue = (value = '') => {
  const normalized = String(value || '').trim().toLowerCase();
  return !normalized || ['placeholder', 'replace_with_email_password', 'changeme'].includes(normalized);
};

const sendEmail = async ({ to, subject, type, data }) => {
  if (
    !process.env.EMAIL_HOST ||
    !process.env.EMAIL_USER ||
    !process.env.EMAIL_PASS ||
    isPlaceholderValue(process.env.EMAIL_PASS)
  ) {
    console.warn(
      `Email skipped for "${subject}" because SMTP settings are missing or still using a placeholder password.`
    );
    return false;
  }

  const smtpPort = Number(process.env.EMAIL_PORT || 465);
  const smtpSecure = String(process.env.EMAIL_SECURE || '').trim()
    ? String(process.env.EMAIL_SECURE).trim().toLowerCase() === 'true'
    : smtpPort === 465;

  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: smtpPort,
    secure: smtpSecure,
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 15000,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  let htmlContent = '';

  switch (type) {
    case 'welcome':
      htmlContent = `
        <div style="font-family: Arial, sans-serif; text-align: center;">
          <h1 style="color: #C6A75E;">Welcome to Melora, ${data.name}!</h1>
          <p>We are thrilled to have you join our luxury boutique community.</p>
          <p>Explore our latest handbag collections today.</p>
        </div>
      `;
      break;
    case 'orderConfirmation':
      htmlContent = `
        <div style="font-family: Arial, sans-serif;">
          <h2 style="color: #1E1E1E;">Order Received</h2>
          <p>Thank you for your purchase, ${data.name}!</p>
          <p><strong>Order ID:</strong> ${data.orderId}</p>
          <p><strong>Total Amount:</strong> ${data.total}</p>
          <p>We will notify you once it ships.</p>
        </div>
      `;
      break;
    case 'shippingUpdate':
      htmlContent = `
        <div style="font-family: Arial, sans-serif;">
          <h2 style="color: #1E1E1E;">Your Order has Shipped!</h2>
          <p>Great news! Your order <strong>${data.orderId}</strong> is on its way.</p>
          <p><strong>Tracking Number:</strong> ${data.trackingNumber}</p>
        </div>
      `;
      break;
    case 'orderStatusUpdate':
      htmlContent = `
        <div style="font-family: Arial, sans-serif; background:#f7f3ee; padding:32px 16px; direction:${data.language === 'ar' ? 'rtl' : 'ltr'};">
          <div style="max-width:620px; margin:0 auto; background:#ffffff; border:1px solid #eadcc8; border-radius:18px; overflow:hidden;">
            <div style="background:linear-gradient(135deg,#2f2117,#8b5e34); color:#fff8ef; padding:28px 32px;">
              <div style="font-size:11px; letter-spacing:0.28em; text-transform:uppercase; opacity:0.86;">Melora</div>
              <h2 style="margin:14px 0 0; font-size:28px; line-height:1.3;">${data.title || 'Melora Order Update'}</h2>
            </div>
            <div style="padding:30px 32px; color:#2b1a12;">
              <p style="margin:0 0 14px; font-size:16px;">${data.greeting || 'Hello'} ${data.customerName || 'Melora customer'},</p>
              <p style="margin:0 0 18px; font-size:15px; line-height:1.9; color:#5c4939;">${data.message}</p>
              <div style="background:#fcf8f3; border:1px solid #eadcc8; border-radius:14px; padding:18px 20px; margin:18px 0;">
                <p style="margin:0 0 8px; font-size:14px;"><strong>Order ID:</strong> ${data.orderId}</p>
                ${data.trackingNumber ? `<p style="margin:0; font-size:14px;"><strong>Tracking Number:</strong> ${data.trackingNumber}</p>` : ''}
              </div>
              ${data.trackUrl ? `<div style="margin-top:24px;"><a href="${data.trackUrl}" style="display:inline-block; background:#2f2117; color:#fff8ef; text-decoration:none; padding:14px 22px; border-radius:999px; font-size:13px; font-weight:700; letter-spacing:0.08em;">${data.cta || 'View order status'}</a></div>` : ''}
            </div>
          </div>
        </div>
      `;
      break;
    case 'passwordReset':
      htmlContent = `
        <div style="font-family: Arial, sans-serif; text-align: center;">
          <h2 style="color: #1E1E1E;">Password Reset Request</h2>
          <p>Click the button below to reset your password. This link is valid for 1 hour.</p>
          <a href="${data.resetUrl}" style="background-color: #1E1E1E; color: white; padding: 12px 24px; text-decoration: none; display: inline-block; margin-top: 20px;">Reset Password</a>
        </div>
      `;
      break;
    case 'adminBankTransferAlert':
      htmlContent = `
        <div style="font-family: Arial, sans-serif;">
          <h2 style="color: #1E1E1E;">New IBAN Order Submitted</h2>
          <p><strong>Order ID:</strong> ${data.orderId}</p>
          <p><strong>Customer:</strong> ${data.customerName || 'Guest customer'}</p>
          <p><strong>Phone:</strong> ${data.customerPhone || 'N/A'}</p>
          <p><strong>Total:</strong> ${data.total}</p>
          <p><strong>Receipt:</strong> ${data.receiptImage || 'Uploaded to server'}</p>
        </div>
      `;
      break;
    default:
      htmlContent = `<p>Hello from Melora</p>`;
  }

  const fromAddress = process.env.EMAIL_FROM || process.env.STORE_EMAIL || process.env.EMAIL_USER;
  const fromName = process.env.STORE_NAME || 'Melora Boutique';
  const mailOptions = {
    from: `"${fromName}" <${fromAddress}>`,
    to,
    subject,
    html: htmlContent,
    text: stripHtml(htmlContent),
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`Email sent: ${info.messageId}`);
    return true;
  } catch (error) {
    console.error('Email sending failed:', error);
    return false;
  }
};

module.exports = sendEmail;
