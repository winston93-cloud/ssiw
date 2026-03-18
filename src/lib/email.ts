import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: 'avisos_no-replay@winston93.edu.mx',
    pass: 'cuvdrophbizdprmb',
  },
});

interface EmailConfirmacionParams {
  email: string;
  nombreTutor: string;
  nombreAlumno: string;
  fecha: string;
  token: string;
}

export async function enviarCorreoConfirmacion({
  email,
  nombreTutor,
  nombreAlumno,
  fecha,
  token,
}: EmailConfirmacionParams) {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  const urlConfirmacion = `${baseUrl}/confirmar/${token}`;

  const fechaFormateada = new Date(fecha).toLocaleDateString('es-MX', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #333;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        .header {
          background: linear-gradient(135deg, #003366 0%, #1e5091 100%);
          color: white;
          padding: 30px;
          text-align: center;
          border-radius: 10px 10px 0 0;
        }
        .content {
          background: #f8f9fa;
          padding: 30px;
          border-radius: 0 0 10px 10px;
        }
        .button {
          display: inline-block;
          padding: 15px 30px;
          background: #003366;
          color: white;
          text-decoration: none;
          border-radius: 5px;
          margin: 20px 0;
          font-weight: bold;
        }
        .info-box {
          background: white;
          padding: 20px;
          border-left: 4px solid #6ca82e;
          margin: 20px 0;
        }
        .footer {
          text-align: center;
          margin-top: 30px;
          font-size: 12px;
          color: #666;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Instituto Winston Churchill</h1>
          <p>Sistema de Salida Institucional</p>
        </div>
        <div class="content">
          <h2>Confirmación de Registro de Salida</h2>
          <p>Estimado/a <strong>${nombreTutor}</strong>,</p>
          
          <p>Ha solicitado registrar una salida a pie para el alumno:</p>
          
          <div class="info-box">
            <p><strong>Alumno:</strong> ${nombreAlumno}</p>
            <p><strong>Fecha:</strong> ${fechaFormateada}</p>
            <p><strong>Tutor:</strong> ${nombreTutor}</p>
          </div>
          
          <p>Para confirmar este registro, por favor haga clic en el siguiente botón:</p>
          
          <center>
            <a href="${urlConfirmacion}" class="button">Confirmar Registro</a>
          </center>
          
          <p style="margin-top: 20px; font-size: 14px; color: #666;">
            Si no puede hacer clic en el botón, copie y pegue el siguiente enlace en su navegador:
            <br>
            <a href="${urlConfirmacion}">${urlConfirmacion}</a>
          </p>
          
          <p style="margin-top: 30px; font-weight: bold; color: #e63946;">
            IMPORTANTE: Este enlace expirará en 24 horas.
          </p>
          
          <p style="margin-top: 20px; font-size: 14px; color: #666;">
            Si usted no solicitó este registro, por favor ignore este correo.
          </p>
        </div>
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} Instituto Winston Churchill</p>
          <p>Este es un correo automático, por favor no responder.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const info = await transporter.sendMail({
    from: '"Instituto Winston Churchill" <avisos_no-replay@winston93.edu.mx>',
    to: email,
    subject: `Confirmación de Salida a Pie - ${nombreAlumno}`,
    html,
  });

  return info;
}
