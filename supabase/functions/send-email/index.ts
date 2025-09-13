import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { Webhook } from "https://esm.sh/standardwebhooks@1.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
const hookSecret = Deno.env.get("SEND_EMAIL_HOOK_SECRET") as string;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface EmailRequest {
  to: string;
  subject: string;
  html: string;
  from?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Check if it's a webhook request (auth confirmation)
  const contentType = req.headers.get("content-type");
  const isWebhook = req.headers.get("webhook-signature") || req.headers.get("x-supabase-signature");
  
  if (isWebhook) {
    // Handle Supabase Auth webhook for email confirmation
    try {
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
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Bem-vindo ao Cofrin</title>
        </head>
        <body style="margin: 0; padding: 0; background-color: #f5f5f5; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center;">
              <div style="display: inline-block; width: 80px; height: 80px; background-color: #fff; border-radius: 50%; padding: 20px; margin-bottom: 20px;">
                <div style="font-size: 40px;">🐷</div>
              </div>
              <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700;">Bem-vindo ao Cofrin!</h1>
              <p style="color: #e8f0fe; margin: 10px 0 0 0; font-size: 16px;">Sua jornada financeira começa agora</p>
            </div>
            
            <!-- Content -->
            <div style="padding: 40px 30px;">
              <h2 style="color: #333333; font-size: 24px; margin-bottom: 20px;">Olá, ${firstName}! 👋</h2>
              
              <p style="color: #666666; font-size: 16px; line-height: 1.6; margin-bottom: 25px;">
                Que alegria ter você conosco! O Cofrin é sua ferramenta para transformar a gestão das suas finanças em algo simples e intuitivo.
              </p>
              
              <div style="background-color: #f8f9ff; border-left: 4px solid #667eea; padding: 20px; margin: 25px 0; border-radius: 0 8px 8px 0;">
                <h3 style="color: #667eea; margin: 0 0 10px 0; font-size: 18px;">🎯 O que você pode fazer no Cofrin:</h3>
                <ul style="color: #666666; margin: 0; padding-left: 20px; line-height: 1.8;">
                  <li>📊 Acompanhar seus gastos em tempo real</li>
                  <li>💡 Definir metas financeiras inteligentes</li>
                  <li>📈 Visualizar relatórios detalhados</li>
                  <li>🎯 Controlar pagamentos parcelados</li>
                </ul>
              </div>
              
              <p style="color: #666666; font-size: 16px; line-height: 1.6; margin-bottom: 30px;">
                Para começar, você precisa confirmar seu email clicando no botão abaixo:
              </p>
              
              <!-- CTA Button -->
              <div style="text-align: center; margin: 30px 0;">
                <a href="${confirmationUrl}" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; padding: 16px 32px; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4); transition: transform 0.2s;">
                  ✅ Confirmar meu email
                </a>
              </div>
              
              <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; border-radius: 8px; padding: 15px; margin: 25px 0;">
                <p style="color: #856404; margin: 0; font-size: 14px; text-align: center;">
                  🚀 <strong>Dica:</strong> Após a confirmação, você terá 30 dias de teste gratuito para explorar todas as funcionalidades!
                </p>
              </div>
              
              <p style="color: #999999; font-size: 14px; line-height: 1.6; margin-top: 30px;">
                Se você não conseguir clicar no botão, copie e cole este link no seu navegador:<br>
                <a href="${confirmationUrl}" style="color: #667eea; word-break: break-all;">${confirmationUrl}</a>
              </p>
              
              <hr style="border: none; border-top: 1px solid #eeeeee; margin: 30px 0;">
              
              <p style="color: #999999; font-size: 14px; text-align: center; margin: 0;">
                Se você não criou uma conta no Cofrin, pode ignorar este email com segurança.
              </p>
            </div>
            
            <!-- Footer -->
            <div style="background-color: #f8f9fa; padding: 20px 30px; text-align: center; border-top: 1px solid #eeeeee;">
              <p style="color: #666666; font-size: 14px; margin: 0;">
                Atenciosamente,<br>
                <strong>Equipe Cofrin</strong> 🐷
              </p>
              <p style="color: #999999; font-size: 12px; margin: 10px 0 0 0;">
                © 2024 Cofrin. Todos os direitos reservados.
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
      return new Response(JSON.stringify({}), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });

    } catch (error: any) {
      console.error("Error in webhook email:", error);
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
  }

  // Handle regular email requests
  try {
    const { to, subject, html, from }: EmailRequest = await req.json();

    // Use your validated domain
    const defaultFrom = from || "noreply@xn--automatiza-t8a.com";

    const emailResponse = await resend.emails.send({
      from: defaultFrom,
      to: [to],
      subject: subject,
      html: html,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);