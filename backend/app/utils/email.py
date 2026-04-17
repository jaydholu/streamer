import aiosmtplib
from email.message import EmailMessage

from app.core.settings import settings


async def send_reset_email(to_email: str, reset_token: str) -> bool:
    """
    Send a password reset email with a time-limited link.
    Returns True if sent successfully, False otherwise.
    link opens /reset-password?token=...
    """
    reset_url = f"{settings.FRONTEND_URL}/reset-password?token={reset_token}"

    message = EmailMessage()
    message["From"] = settings.SMTP_USER
    message["To"] = to_email
    message["Subject"] = f"{settings.APP_NAME} – Reset your password"

    # HTML email body
    html_body = f"""
    <!DOCTYPE html>
    <html>
    <body style="font-family: 'DM Sans', Arial, sans-serif; background-color: #0A0A0F; color: #F1F5F9; padding: 40px;">
        <div style="max-width: 480px; margin: 0 auto; background-color: #1A1A2E; border-radius: 12px; padding: 40px;">
            <h1 style="color: #7C3AED; font-family: 'Outfit', sans-serif; margin-top: 0;">
                {settings.APP_NAME}
            </h1>
            <p style="font-size: 16px; line-height: 1.6; color: #94A3B8;">
                We received a request to reset your password. Click the button below to create a new password.
                This link expires in <strong>15 minutes</strong>.
            </p>
            <a href="{reset_url}"
               style="display: inline-block; margin: 24px 0; padding: 14px 32px;
                      background-color: #7C3AED; color: #FFFFFF; text-decoration: none;
                      border-radius: 8px; font-weight: 500; font-size: 16px;">
                Reset Password
            </a>
            <p style="font-size: 13px; color: #64748B; margin-bottom: 0;">
                If you didn't request this, you can safely ignore this email.
            </p>
        </div>
    </body>
    </html>
    """

    message.set_content(
        f"Reset your password: {reset_url}\n\nThis link expires in 15 minutes."
    )
    message.add_alternative(html_body, subtype="html")

    try:
        await aiosmtplib.send(
            message,
            hostname=settings.SMTP_HOST,
            port=settings.SMTP_PORT,
            username=settings.SMTP_USER,
            password=settings.SMTP_PASSWORD.get_secret_value(),
            start_tls=True,
        )
        return True

    except Exception as e:
        print(f"Failed to send reset email to {to_email}: {e}")
        return False
