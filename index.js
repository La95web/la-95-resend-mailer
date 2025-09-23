import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { Resend } from 'resend';

dotenv.config();

const app = express();
const port = 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({ origin: 'http://localhost:5500' }));

const resend = new Resend(process.env.API_KEY_RESEND);

// Routes
app.post('/send-email', async (req, res) => {
  const { subject, name, email, message} = req.body;

  try {
    // Using Resend to send email
    const response = await resend.emails.send({
      from: 'Luis Santeliz <noreply@luissanteliz.dev>',
      to: 'la95truckingshow@gmail.com',
      subject: subject,
      html: `
      <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
        <h2 style="color: #007BFF;">📩 Nuevo mensaje de contacto</h2>
        <p><strong>Nombre:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Mensaje:</strong></p>
        <div style="background-color: #f9f9f9; padding: 10px; border-left: 4px solid #007BFF;">
          ${message}
        </div>
        <hr style="margin-top: 30px;">
        <p style="font-size: 12px; color: #999;">Este mensaje fue enviado desde tu portafolio: <a href="https://luissanteliz.dev" target="_blank">luissanteliz.dev</a></p>
      </div>
    `,
    });

    console.log('Email sent successfully:', response);
    res.status(200).json({ message: 'Email sent successfully', response });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ message: 'Error sending email', error });
  }
});

// Start server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
}); 