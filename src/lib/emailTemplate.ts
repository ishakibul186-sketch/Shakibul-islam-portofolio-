/**
 * Generates high-compatibility, responsive, inline-styled HTML for email dispatch & live preview
 */
export interface GenerateEmailOptions {
  recipientName?: string;
  title: string;
  bodyHtml: string;
  buttonText?: string;
  buttonUrl?: string;
  replyToMessageSnippet?: string;
}

export function generateBrandedEmailHtml(options: GenerateEmailOptions): string {
  const {
    recipientName = "",
    title,
    bodyHtml,
    buttonText = "Visit My Portfolio",
    buttonUrl = "https://shakibul-islam-portofolio.vercel.app",
    replyToMessageSnippet,
  } = options;

  const currentYear = 2026;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
  <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f1f5f9; padding: 30px 10px;">
    <tr>
      <td align="center">
        <!-- Main Email Container -->
        <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 620px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.08), 0 8px 10px -6px rgba(0, 0, 0, 0.04); border: 1px solid #e2e8f0;">
          
          <!-- Branded Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4338ca 100%); padding: 32px 28px; text-align: left;">
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td width="64" valign="middle">
                    <img 
                      src="https://shakibul-islam-portofolio.vercel.app/prohor.png" 
                      alt="Shakibul Islam Prohor" 
                      width="58" 
                      height="58" 
                      style="border-radius: 50%; border: 2.5px solid #818cf8; display: block; object-fit: cover; background-color: #1e1b4b;"
                    />
                  </td>
                  <td style="padding-left: 18px;" valign="middle">
                    <h1 style="margin: 0; color: #ffffff; font-size: 20px; font-weight: 700; letter-spacing: -0.3px;">
                      Shakibul Islam Prohor
                    </h1>
                    <p style="margin: 4px 0 0 0; color: #c7d2fe; font-size: 13px; font-weight: 500;">
                      Full Stack Developer &amp; Software Engineer
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Optional Greeting & Title Banner -->
          <tr>
            <td style="padding: 28px 32px 10px 32px; background-color: #ffffff;">
              ${
                recipientName
                  ? `<p style="margin: 0 0 12px 0; color: #64748b; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Hello ${recipientName},</p>`
                  : ""
              }
              <h2 style="margin: 0 0 18px 0; color: #0f172a; font-size: 22px; font-weight: 700; line-height: 1.35; letter-spacing: -0.4px;">
                ${title}
              </h2>
            </td>
          </tr>

          <!-- Main Content Body -->
          <tr>
            <td style="padding: 0 32px 24px 32px; background-color: #ffffff; color: #334155; font-size: 15px; line-height: 1.7;">
              
              ${
                replyToMessageSnippet
                  ? `<div style="background-color: #f8fafc; border-left: 4px solid #10b981; padding: 14px 18px; margin-bottom: 22px; border-radius: 6px; font-size: 13px; color: #475569;">
                      <p style="margin: 0 0 4px 0; font-weight: 600; color: #059669; text-transform: uppercase; font-size: 11px; letter-spacing: 0.5px;">In Reference to Your Message:</p>
                      <p style="margin: 0; font-style: italic;">"${replyToMessageSnippet}"</p>
                    </div>`
                  : ""
              }

              <!-- User Rich Content -->
              <div style="color: #334155; font-size: 15px; line-height: 1.7;">
                ${bodyHtml}
              </div>

              ${
                buttonUrl && buttonText
                  ? `<div style="margin: 30px 0 10px 0; text-align: left;">
                      <a 
                        href="${buttonUrl}" 
                        target="_blank" 
                        style="display: inline-block; background: linear-gradient(135deg, #4f46e5 0%, #6366f1 100%); color: #ffffff; text-decoration: none; padding: 12px 26px; border-radius: 10px; font-size: 14px; font-weight: 600; box-shadow: 0 4px 12px rgba(79, 70, 229, 0.25);"
                      >
                        ${buttonText} &rarr;
                      </a>
                    </div>`
                  : ""
              }
            </td>
          </tr>

          <!-- Subtle Divider -->
          <tr>
            <td style="padding: 0 32px;">
              <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 0;" />
            </td>
          </tr>

          <!-- Branded Footer -->
          <tr>
            <td style="background-color: #f8fafc; padding: 24px 32px; border-top: 1px solid #f1f5f9;">
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td>
                    <p style="margin: 0 0 8px 0; font-size: 13px; font-weight: 600; color: #1e293b;">
                      Shakibul Islam Prohor
                    </p>
                    <p style="margin: 0 0 12px 0; font-size: 12px; color: #64748b; line-height: 1.6;">
                      Phone: <a href="tel:018129282535" style="color: #4f46e5; text-decoration: none; font-weight: 500;">018129282535</a> &nbsp;|&nbsp;
                      Email: <a href="mailto:ishakibul186@gmail.com" style="color: #4f46e5; text-decoration: none; font-weight: 500;">ishakibul186@gmail.com</a>
                    </p>
                    <p style="margin: 0 0 12px 0; font-size: 12px; color: #64748b;">
                      Direct Web: <a href="https://shakibul-islam-portofolio.vercel.app" target="_blank" style="color: #4f46e5; text-decoration: underline; font-weight: 500;">shakibul-islam-portofolio.vercel.app</a>
                    </p>
                    <p style="margin: 0; font-size: 11px; color: #94a3b8;">
                      &copy; ${currentYear} Shakibul Islam Prohor Portfolio. All rights reserved.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
