import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { Resend } from 'resend';

dotenv.config();

const app = express();

// CORS PRIMERO
app.use(cors({
  origin: 'https://la95truckingshow.com',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type']
}));

app.options('*', cors()); // <-- REQUIRED for preflight

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const resend = new Resend(process.env.API_KEY_RESEND);

app.post('/send-email', async (req, res) => {
  const { subject, name, email, message } = req.body;

  try {
    const response = await resend.emails.send({
      from: 'Jose Miguel <noreply@la95truckingshow.com>',
      to: 'la95truckingshow@gmail.com',
      subject,
      html: `
        <h2>Nuevo mensaje de contacto</h2>
        <p><strong>Nombre:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p>${message}</p>
      `
    });

    res.status(200).json({ message: 'Email sent successfully', response });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ message: 'Error sending email', error });
  }
});

// 🔥 EL PORT CORRECTO PARA RAILWAY
const port = process.env.PORT || 3002;

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
