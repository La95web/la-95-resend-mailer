// ...existing code...
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { Resend } from 'resend';

dotenv.config();

const app = express();
const port = process.env.PORT || 3002;
const allowedOrigin = process.env.ALLOWED_ORIGIN || 'https://la95truckingshow.com';

if (!process.env.API_KEY_RESEND) {
  console.error('Missing API_KEY_RESEND environment variable');
  // Optionally exit process so deployment fails fast
  // process.exit(1);
}

// Small HTML escaper to avoid injection
function escapeHtml(unsafe) {
  if (!unsafe) return '';
  return String(unsafe)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({ 
  origin: allowedOrigin,
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.options(/.*/, (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', allowedOrigin);
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.sendStatus(204);
});

// Initialize Resend
const resend = new Resend(process.env.API_KEY_RESEND);

// Health check
app.get('/', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Routes
app.post('/send-email', async (req, res) => {
  const { subject, name, email, message } = req.body;

  // Basic validation
  if (!subject || !name || !email || !message) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  const safeName = escapeHtml(name);
  const safeEmail = escapeHtml(email);
  const safeMessage = escapeHtml(message);

  try {
    // Using Resend to send email
    const response = await resend.emails.send({
      from: 'Jose Miguel <noreply@la95truckingshow.com>',
      to: 'luissanteliz22@gmail.com',
      subject,
      text: `Nuevo mensaje de ${safeName} (${safeEmail}):\n\n${safeMessage}`,
      html: `
      <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
        <h2 style="color: #007BFF;">📩 Nuevo mensaje de contacto</h2>
        <p><strong>Nombre:</strong> ${safeName}</p>
        <p><strong>Email:</strong> ${safeEmail}</p>
        <p><strong>Mensaje:</strong></p>
        <div style="background-color: #f9f9f9; padding: 10px; border-left: 4px solid #007BFF;">
          ${safeMessage.replace(/\n/g, '<br>')}
        </div>
        <hr style="margin-top: 30px;">
        <p style="font-size: 12px; color: #999;">Este mensaje fue enviado desde tu sitio: <a href="https://la95truckingshow.com" target="_blank">la95truckingshow.com</a></p>
      </div>
    `,
    });

    console.log('Email sent successfully:', response);
    res.status(200).json({ message: 'Email sent successfully' });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ message: 'Error sending email', error: error?.message || String(error) });
  }
});

// Start server (bind to 0.0.0.0 for container platforms)
app.listen(port, '0.0.0.0', () => {
  console.log(`Server running at http://0.0.0.0:${port}`);
});
// ...existing code...