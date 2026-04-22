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

const isLikelyPlaceholderEmail = (value = '') => {
  const normalized = String(value || '').trim().toLowerCase();
  return (
    !normalized ||
    !normalized.includes('@') ||
    normalized.includes('your-domain.com') ||
    normalized.includes('example.com') ||
    normalized === 'resend' ||
    normalized.endsWith('@gmail.com') ||
    normalized.endsWith('@yahoo.com')
  );
};

const repairArabicMojibake = (value = '') => {
  let text = String(value || '');

  if (!text || !/[ÃØÙ]/.test(text)) {
    return text;
  }

  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      const repaired = Buffer.from(text, 'latin1').toString('utf8');
      if (repaired === text) {
        break;
      }
      text = repaired;
      if (/[\u0600-\u06FF]/.test(text) && !/[ÃØÙ]/.test(text)) {
        break;
      }
    } catch (_error) {
      break;
    }
  }

  return text;
};

const sendWithResendApi = async ({ apiKey, fromAddress, fromName, to, subject, html, text }) => {
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: `${fromName} <${fromAddress}>`,
      to: [to],
      subject,
      html,
      text,
    }),
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(payload?.message || `Resend API request failed with status ${response.status}`);
    error.code = 'RESEND_API_ERROR';
    error.response = payload;
    error.responseCode = response.status;
    throw error;
  }

  return payload;
};

const sendEmail = async ({ to, subject, type, data }) => {
  const emailHost = String(process.env.EMAIL_HOST || '').trim();
  const emailUser = String(process.env.EMAIL_USER || '').trim();
  const emailPass = String(process.env.EMAIL_PASS || '');
  const resendApiKey = String(process.env.RESEND_API_KEY || '').trim()
    || (String(emailPass || '').trim().startsWith('re_') ? String(emailPass || '').trim() : '');
  const requestedFromAddress = String(
    process.env.EMAIL_FROM || process.env.STORE_EMAIL || emailUser
  ).trim();
  const fromAddress = resendApiKey
    ? 'onboarding@resend.dev'
    : requestedFromAddress;
  const fromName = String(process.env.STORE_NAME || 'Melora Boutique').trim();
  const hasResendApiConfig = Boolean(typeof fetch === 'function' && resendApiKey && fromAddress);
  const hasSmtpConfig = Boolean(
    emailHost &&
    emailUser &&
    emailPass &&
    !isPlaceholderValue(emailPass)
  );

  if (!hasResendApiConfig && !hasSmtpConfig) {
    console.warn(
      `Email skipped for "${subject}" because neither Resend API nor SMTP settings are configured correctly.`,
      {
        emailHost,
        emailUser,
        emailFrom: fromAddress,
        hasResendApiKey: Boolean(resendApiKey),
        hasEmailPass: Boolean(emailPass),
        placeholderPassword: isPlaceholderValue(emailPass),
      }
    );
    return false;
  }

  const smtpPort = Number(process.env.EMAIL_PORT || 465);
  const smtpSecure = String(process.env.EMAIL_SECURE || '').trim()
    ? String(process.env.EMAIL_SECURE).trim().toLowerCase() === 'true'
    : smtpPort === 465;
  const transporter = hasSmtpConfig
    ? nodemailer.createTransport({
        host: emailHost,
        port: smtpPort,
        secure: smtpSecure,
        connectionTimeout: 10000,
        greetingTimeout: 10000,
        socketTimeout: 15000,
        auth: {
          user: emailUser,
          pass: emailPass,
        },
      })
    : null;

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
      const orderStatusCopy = {
        ar: {
          intro: 'تحديث أنيق بخصوص طلبك من ميلورا.',
          noteLabel: 'رسالة خاصة',
          fallbackTitle: 'تحديث طلبك من ميلورا',
          fallbackGreeting: 'مرحباً',
          fallbackCustomer: 'عميل ميلورا',
          detailsLabel: 'تفاصيل الطلب',
          orderIdLabel: 'رقم الطلب',
          trackingLabel: 'رقم التتبع',
          fallbackCta: 'متابعة حالة الطلب',
          footer: 'تفاصيل راقية، خدمة مميزة، وتجربة تسوق أنيقة في كل طلب.',
        },
        tr: {
          intro: 'Melora siparisinizle ilgili ozenli bir guncelleme.',
          noteLabel: 'Size Ozel',
          fallbackTitle: 'Melora Siparis Guncellemesi',
          fallbackGreeting: 'Merhaba',
          fallbackCustomer: 'Melora musterisi',
          detailsLabel: 'Siparis Detaylari',
          orderIdLabel: 'Siparis No',
          trackingLabel: 'Takip Numarasi',
          fallbackCta: 'Siparis durumunu goruntuleyin',
          footer: 'Her sipariste ozenli detaylar, ust duzey hizmet ve rafine bir alisveris deneyimi.',
        },
        en: {
          intro: 'A refined update regarding your Melora order.',
          noteLabel: 'Personal Note',
          fallbackTitle: 'Melora Order Update',
          fallbackGreeting: 'Hello',
          fallbackCustomer: 'Melora customer',
          detailsLabel: 'Order Details',
          orderIdLabel: 'Order ID',
          trackingLabel: 'Tracking Number',
          fallbackCta: 'View order status',
          footer: 'Crafted details, elevated service, and a refined shopping experience in every order.',
        },
      };
      const arabicStatusCopy = {
        intro: 'تحديث أنيق بخصوص طلبك من ميلورا.',
        noteLabel: 'رسالة خاصة',
        fallbackTitle: 'تحديث طلبك من ميلورا',
        fallbackGreeting: 'مرحباً',
        fallbackCustomer: 'عميل ميلورا',
        detailsLabel: 'تفاصيل الطلب',
        orderIdLabel: 'رقم الطلب',
        trackingLabel: 'رقم التتبع',
        fallbackCta: 'متابعة حالة الطلب',
        footer: 'تفاصيل راقية، خدمة مميزة، وتجربة تسوق أنيقة في كل طلب.',
      };
      const copy = data.language === 'ar'
        ? arabicStatusCopy
        : (orderStatusCopy[data.language] || orderStatusCopy.en);
      const localizedCopy = data.language === 'ar'
        ? Object.fromEntries(
            Object.entries(copy).map(([key, value]) => [key, repairArabicMojibake(value)])
          )
        : copy;
      htmlContent = `
        <div style="margin:0; padding:0; background:#f5efe8; direction:${data.language === 'ar' ? 'rtl' : 'ltr'}; font-family:Georgia, 'Times New Roman', serif;">
          <div style="max-width:680px; margin:0 auto; padding:40px 18px;">
            <div style="background:radial-gradient(circle at top,#9a6b3f 0%,#5b3c24 40%,#24170f 100%); border-radius:28px 28px 0 0; padding:26px 34px; color:#fff9f1; box-shadow:0 16px 40px rgba(39,22,13,0.18);">
              <div style="font-size:12px; letter-spacing:0.42em; text-transform:uppercase; opacity:0.78;">Melora</div>
              <div style="margin-top:22px; width:72px; height:1px; background:rgba(255,248,239,0.42);"></div>
              <h2 style="margin:22px 0 10px; font-size:34px; line-height:1.22; font-weight:700;">${data.title || localizedCopy.fallbackTitle}</h2>
              <p style="margin:0; max-width:420px; font-family:Arial, sans-serif; font-size:14px; line-height:1.8; color:rgba(255,248,239,0.88);">${localizedCopy.intro}</p>
            </div>

            <div style="background:#fffdfa; border:1px solid #e8d8c8; border-top:none; border-radius:0 0 28px 28px; padding:34px; box-shadow:0 18px 40px rgba(71,42,23,0.08);">
              <p style="margin:0 0 16px; color:#2b1b12; font-family:Arial, sans-serif; font-size:17px; line-height:1.8;">
                <span style="display:block; font-size:12px; letter-spacing:0.22em; text-transform:uppercase; color:#a27b57; margin-bottom:10px;">${localizedCopy.noteLabel}</span>
                ${data.greeting || localizedCopy.fallbackGreeting} ${data.customerName || localizedCopy.fallbackCustomer},
              </p>

              <p style="margin:0 0 24px; color:#594535; font-family:Arial, sans-serif; font-size:15px; line-height:2;">
                ${data.message}
              </p>

              <div style="border:1px solid #eadfce; border-radius:20px; background:linear-gradient(180deg,#fffdfa 0%,#faf4ed 100%); padding:22px 22px 18px; margin:0 0 26px;">
                <div style="font-size:11px; letter-spacing:0.24em; text-transform:uppercase; color:#ad8764; font-family:Arial, sans-serif; margin-bottom:14px;">${localizedCopy.detailsLabel}</div>
                <table role="presentation" style="width:100%; border-collapse:collapse; font-family:Arial, sans-serif;">
                  <tr>
                    <td style="padding:0 0 10px; color:#7c6451; font-size:13px;">${localizedCopy.orderIdLabel}</td>
                    <td style="padding:0 0 10px; color:#2a1b12; font-size:14px; font-weight:700; text-align:${data.language === 'ar' ? 'left' : 'right'};">${data.orderId}</td>
                  </tr>
                  ${data.trackingNumber ? `
                  <tr>
                    <td style="padding:10px 0 0; border-top:1px solid #efe4d8; color:#7c6451; font-size:13px;">${localizedCopy.trackingLabel}</td>
                    <td style="padding:10px 0 0; border-top:1px solid #efe4d8; color:#2a1b12; font-size:14px; font-weight:700; text-align:${data.language === 'ar' ? 'left' : 'right'};">${data.trackingNumber}</td>
                  </tr>` : ''}
                </table>
              </div>

              ${data.trackUrl ? `
              <div style="margin:0 0 26px;">
                <a href="${data.trackUrl}" style="display:inline-block; padding:15px 28px; border-radius:999px; text-decoration:none; background:linear-gradient(135deg,#2d1d13 0%,#6c492c 100%); color:#fffaf4; font-family:Arial, sans-serif; font-size:13px; font-weight:700; letter-spacing:0.12em; text-transform:uppercase; box-shadow:0 12px 24px rgba(71,42,23,0.18);">
                  ${data.cta || localizedCopy.fallbackCta}
                </a>
              </div>` : ''}

              <div style="padding-top:18px; border-top:1px solid #efe4d8;">
                <p style="margin:0; color:#8a705c; font-family:Arial, sans-serif; font-size:12px; line-height:1.9;">
                  Melora Boutique<br />
                  ${localizedCopy.footer}
                </p>
              </div>
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

  const mailOptions = {
    from: `"${fromName}" <${fromAddress}>`,
    to,
    subject,
    html: htmlContent,
    text: stripHtml(htmlContent),
  };

  const trySmtpDelivery = async (errorContext = null) => {
    if (!transporter) {
      return false;
    }

    if (errorContext) {
      console.warn('Falling back to SMTP after Resend failure.', {
        subject,
        to,
        message: errorContext.message,
        code: errorContext.code,
        responseCode: errorContext.responseCode,
      });
    }

    console.log('Attempting email delivery via SMTP', {
      to,
      subject,
      type,
      fromAddress,
      smtpHost: emailHost,
      smtpPort,
      smtpSecure,
    });

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully via SMTP', {
      messageId: info.messageId,
      accepted: info.accepted,
      rejected: info.rejected,
      response: info.response,
    });
    return true;
  };

  try {
    if (hasResendApiConfig) {
      try {
        console.log('Attempting email delivery via Resend API', {
          to,
          subject,
          type,
          fromAddress,
        });

        const apiResult = await sendWithResendApi({
          apiKey: resendApiKey,
          fromAddress,
          fromName,
          to,
          subject,
          html: htmlContent,
          text: stripHtml(htmlContent),
        });

        console.log('Email sent successfully via Resend API', {
          id: apiResult?.id,
          to,
          subject,
        });
        return true;
      } catch (resendError) {
        if (await trySmtpDelivery(resendError)) {
          return true;
        }
        throw resendError;
      }
    }

    return await trySmtpDelivery();
  } catch (error) {
    console.error('Email sending failed:', {
      message: error.message,
      code: error.code,
      command: error.command,
      response: error.response,
      responseCode: error.responseCode,
      to,
      subject,
      type,
      fromAddress,
      smtpHost: emailHost,
      smtpPort,
      smtpSecure,
    });
    return false;
  }
};

module.exports = sendEmail;
