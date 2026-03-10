export function getBookingConfirmationEmail(
  fullName: string,
  companyName?: string,
  businessName?: string,
): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Booking Confirmation</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f7fa;">
    <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f5f7fa;">
        <tr>
            <td align="center" style="padding: 40px 20px;">
                <table role="presentation" style="max-width: 600px; width: 100%; border-collapse: collapse; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.07);">
                    
                    <!-- Header with gradient -->
                    <tr>
                        <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center;">
                            <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">
                                ✓ Booking Confirmed
                            </h1>
                        </td>
                    </tr>
                    
                    <!-- Main Content -->
                    <tr>
                        <td style="padding: 40px 30px;">
                            <p style="margin: 0 0 20px; color: #1a202c; font-size: 18px; font-weight: 600;">
                                Hi ${fullName},
                            </p>
                            
                            <p style="margin: 0 0 20px; color: #4a5568; font-size: 16px; line-height: 1.6;">
                                Thank you for reaching out! We've received your consultation request and are excited to connect with you.
                            </p>
                            
                            ${
                              businessName
                                ? `
                            <div style="background-color: #edf2f7; border-left: 4px solid #4299e1; padding: 16px 20px; margin: 24px 0; border-radius: 4px;">
                                <p style="margin: 0; color: #2d3748; font-size: 14px; font-weight: 600;">
                                    Business: <span style="font-weight: 400;">${businessName}</span>
                                </p>
                            </div>
                            `
                                : ""
                            }
                            
                            ${
                              companyName
                                ? `
                            <div style="background-color: #f7fafc; border-left: 4px solid #667eea; padding: 16px 20px; margin: 24px 0; border-radius: 4px;">
                                <p style="margin: 0; color: #2d3748; font-size: 14px; font-weight: 600;">
                                    Company: <span style="font-weight: 400;">${companyName}</span>
                                </p>
                            </div>
                            `
                                : ""
                            }
                            
                            <!-- What's Next Section -->
                            <div style="margin: 32px 0;">
                                <h2 style="margin: 0 0 16px; color: #1a202c; font-size: 20px; font-weight: 700;">
                                    What happens next?
                                </h2>
                                
                                <div style="margin-bottom: 16px;">
                                    <table role="presentation" style="width: 100%;">
                                        <tr>
                                            <td style="width: 32px; vertical-align: top; padding-top: 2px;">
                                                <div style="width: 24px; height: 24px; background-color: #667eea; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 12px;">1</div>
                                            </td>
                                            <td style="padding-left: 12px;">
                                                <p style="margin: 0; color: #4a5568; font-size: 15px; line-height: 1.5;">
                                                    Our team will review your request carefully
                                                </p>
                                            </td>
                                        </tr>
                                    </table>
                                </div>
                                
                                <div style="margin-bottom: 16px;">
                                    <table role="presentation" style="width: 100%;">
                                        <tr>
                                            <td style="width: 32px; vertical-align: top; padding-top: 2px;">
                                                <div style="width: 24px; height: 24px; background-color: #667eea; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 12px;">2</div>
                                            </td>
                                            <td style="padding-left: 12px;">
                                                <p style="margin: 0; color: #4a5568; font-size: 15px; line-height: 1.5;">
                                                    We'll reach out within <strong style="color: #667eea;">24 hours</strong> to schedule your free consultation
                                                </p>
                                            </td>
                                        </tr>
                                    </table>
                                </div>
                                
                                <div>
                                    <table role="presentation" style="width: 100%;">
                                        <tr>
                                            <td style="width: 32px; vertical-align: top; padding-top: 2px;">
                                                <div style="width: 24px; height: 24px; background-color: #667eea; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 12px;">3</div>
                                            </td>
                                            <td style="padding-left: 12px;">
                                                <p style="margin: 0; color: #4a5568; font-size: 15px; line-height: 1.5;">
                                                    Have a friendly conversation about your needs
                                                </p>
                                            </td>
                                        </tr>
                                    </table>
                                </div>
                            </div>
                            
                            <!-- Info Box -->
                            <div style="background: linear-gradient(135deg, #667eea15 0%, #764ba215 100%); border: 1px solid #667eea30; border-radius: 8px; padding: 20px; margin: 28px 0;">
                                <p style="margin: 0; color: #2d3748; font-size: 14px; line-height: 1.6; text-align: center;">
                                    <strong style="color: #667eea;">💡 Pro Tip:</strong> Keep an eye on your inbox and spam folder for our response!
                                </p>
                            </div>
                            
                            <p style="margin: 24px 0 0; color: #4a5568; font-size: 16px; line-height: 1.6;">
                                We're looking forward to speaking with you!
                            </p>
                            
                            <p style="margin: 16px 0 0; color: #2d3748; font-size: 16px; font-weight: 600;">
                                Best regards,<br>
                                <span style="color: #667eea;">The Team</span>
                            </p>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="background-color: #f7fafc; padding: 30px; text-align: center; border-top: 1px solid #e2e8f0;">
                            <p style="margin: 0 0 8px; color: #718096; font-size: 13px;">
                                No spam, no sales pressure. Just a friendly conversation.
                            </p>
                            <p style="margin: 0; color: #a0aec0; font-size: 12px;">
                                © ${new Date().getFullYear()} Your Company. All rights reserved.
                            </p>
                        </td>
                    </tr>
                    
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
`;
}
