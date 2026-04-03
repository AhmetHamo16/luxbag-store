const nodemailer = require('nodemailer');

const sendEmail = async ({ to, subject, type, data }) => {
  if (!process.env.EMAIL_HOST || !process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.warn(`Email skipped for "${subject}" because email environment variables are not fully configured.`);
    return false;
  }

  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT || 465,
    secure: true,
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

  const mailOptions = {
    from: `"Melora Boutique" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html: htmlContent,
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
