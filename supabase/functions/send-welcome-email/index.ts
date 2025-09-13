import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { Webhook } from "https://esm.sh/standardwebhooks@1.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
const hookSecret = Deno.env.get("SEND_EMAIL_HOOK_SECRET") as string;

const handler = async (req: Request): Promise<Response> => {
  if (req.method !== 'POST') {
    return new Response('not allowed', { status: 400 });
  }

  try {
    // Verify webhook signature
    const payload = await req.text();
    const headers = Object.fromEntries(req.headers);
    const wh = new Webhook(hookSecret);
    
    const {
      user,
      email_data: { token, token_hash, redirect_to, email_action_type },
    } = wh.verify(payload, headers) as {
      user: {
        email: string;
        user_metadata: {
          first_name?: string;
        };
      };
      email_data: {
        token: string;
        token_hash: string;
        redirect_to: string;
        email_action_type: string;
      };
    };

    const firstName = user.user_metadata?.first_name || "Usuário";
    const confirmationUrl = `${Deno.env.get("SUPABASE_URL")}/auth/v1/verify?token=${token_hash}&type=${email_action_type}&redirect_to=${redirect_to}`;

    const htmlContent = `
      <!DOCTYPE html>
      <html lang="pt-BR">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Bem-vindo ao Cofrin!</title>
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            margin: 0;
            padding: 20px;
            color: #333;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            background: white;
            border-radius: 20px;
            overflow: hidden;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
          }
          .header {
            background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);
            color: white;
            padding: 40px 30px;
            text-align: center;
          }
          .header h1 {
            margin: 0;
            font-size: 28px;
            font-weight: 700;
          }
          .header p {
            margin: 10px 0 0;
            font-size: 16px;
            opacity: 0.9;
          }
          .content {
            padding: 40px 30px;
          }
          .welcome-message {
            text-align: center;
            margin-bottom: 30px;
          }
          .welcome-message h2 {
            color: #333;
            font-size: 24px;
            margin-bottom: 15px;
          }
          .confirm-button {
            display: inline-block;
            background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);
            color: white;
            text-decoration: none;
            padding: 15px 30px;
            border-radius: 50px;
            font-weight: bold;
            font-size: 16px;
            margin: 20px 0;
            box-shadow: 0 4px 15px rgba(76, 175, 80, 0.3);
            transition: all 0.3s ease;
          }
          .confirm-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(76, 175, 80, 0.4);
          }
          .features {
            background: #f8f9fa;
            border-radius: 15px;
            padding: 30px;
            margin: 30px 0;
          }
          .features h3 {
            color: #333;
            margin-bottom: 20px;
            text-align: center;
          }
          .feature-list {
            list-style: none;
            padding: 0;
          }
          .feature-list li {
            padding: 10px 0;
            border-bottom: 1px solid #eee;
            position: relative;
            padding-left: 30px;
          }
          .feature-list li:before {
            content: "✅";
            position: absolute;
            left: 0;
            top: 10px;
          }
          .footer {
            background: #f8f9fa;
            padding: 30px;
            text-align: center;
            color: #666;
            font-size: 14px;
          }
          .footer a {
            color: #4CAF50;
            text-decoration: none;
          }
          .trial-badge {
            background: linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%);
            color: white;
            padding: 10px 20px;
            border-radius: 25px;
            display: inline-block;
            font-weight: bold;
            margin: 15px 0;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🐷 Bem-vindo ao Cofrin!</h1>
            <p>Transforme suas finanças com inteligência</p>
          </div>
          
          <div class="content">
            <div class="welcome-message">
              <h2>Olá, ${firstName}! 👋</h2>
              <p>Que bom ter você conosco! Sua conta foi criada com sucesso.</p>
              <div class="trial-badge">🎉 30 dias grátis para testar</div>
            </div>

            <div style="text-align: center; margin: 30px 0;">
              <p style="font-size: 18px; margin-bottom: 20px;">
                <strong>Confirme seu email para ativar sua conta:</strong>
              </p>
              <a href="${confirmationUrl}" class="confirm-button">
                ✉️ Confirmar Email e Começar
              </a>
              <p style="font-size: 14px; color: #666; margin-top: 15px;">
                Este link expira em 24 horas
              </p>
            </div>

            <div class="features">
              <h3>🚀 O que você pode fazer com o Cofrin:</h3>
              <ul class="feature-list">
                <li>Gerenciar despesas e receitas via WhatsApp</li>
                <li>Visualizar relatórios detalhados no dashboard</li>
                <li>Definir metas financeiras mensais</li>
                <li>Acompanhar pagamentos parcelados</li>
                <li>Exportar dados para análise</li>
                <li>Receber notificações inteligentes</li>
              </ul>
            </div>

            <div style="background: #e8f5e8; border-radius: 10px; padding: 20px; text-align: center;">
              <p style="margin: 0; color: #2e7d32;">
                <strong>💡 Dica:</strong> Após confirmar seu email, você será redirecionado para o dashboard onde poderá começar a usar todas as funcionalidades imediatamente!
              </p>
            </div>
          </div>

          <div class="footer">
            <p>
              <strong>Cofrin - Sua assistente financeira inteligente</strong><br>
              Precisa de ajuda? Entre em contato conosco!<br>
              <a href="mailto:suporte@xn--automatiza-t8a.com">suporte@xn--automatiza-t8a.com</a>
            </p>
            <p style="margin-top: 20px; font-size: 12px;">
              Se você não criou esta conta, pode ignorar este email.
            </p>
          </div>
        </div>
      </body>
      </html>
    `;

    const { error } = await resend.emails.send({
      from: "Cofrin - Bem-vindo <noreply@xn--automatiza-t8a.com>",
      to: [user.email],
      subject: `🐷 Bem-vindo ao Cofrin, ${firstName}! Confirme seu email`,
      html: htmlContent,
    });

    if (error) {
      throw error;
    }

    console.log("Welcome email sent successfully via webhook");

  } catch (error: any) {
    console.error("Error in send-welcome-email function:", error);
    return new Response(
      JSON.stringify({
        error: {
          http_code: error.code,
          message: error.message,
        },
      }),
      {
        status: 401,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  return new Response(JSON.stringify({}), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
};

serve(handler);