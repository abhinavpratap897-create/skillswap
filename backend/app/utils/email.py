"""Email sending utilities."""

import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from app.config import settings


def send_email(to_email: str, subject: str, html_body: str) -> bool:
    """Send an email using SMTP. Returns True if successful."""
    if not settings.SMTP_USER or not settings.SMTP_PASSWORD:
        print(f"[EMAIL STUB] To: {to_email} | Subject: {subject}")
        return True

    try:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = subject
        msg["From"] = settings.EMAIL_FROM
        msg["To"] = to_email
        msg.attach(MIMEText(html_body, "html"))

        with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT) as server:
            server.starttls()
            server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
            server.sendmail(settings.EMAIL_FROM, to_email, msg.as_string())
        return True
    except Exception as e:
        print(f"[EMAIL ERROR] {e}")
        return False


def send_verification_email(to_email: str, token: str):
    link = f"{settings.FRONTEND_URL}/verify-email?token={token}"
    html = f"""
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #6366f1;">Welcome to SkillSwap!</h2>
        <p>Please verify your email address by clicking the button below:</p>
        <a href="{link}" style="display: inline-block; padding: 12px 24px; background: #6366f1;
           color: white; text-decoration: none; border-radius: 8px; margin: 16px 0;">
           Verify Email
        </a>
        <p style="color: #666; font-size: 14px;">This link expires in 24 hours.</p>
    </div>
    """
    send_email(to_email, "Verify your SkillSwap account", html)


def send_reset_password_email(to_email: str, token: str):
    link = f"{settings.FRONTEND_URL}/reset-password?token={token}"
    html = f"""
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #6366f1;">Reset Your Password</h2>
        <p>Click the button below to reset your password:</p>
        <a href="{link}" style="display: inline-block; padding: 12px 24px; background: #6366f1;
           color: white; text-decoration: none; border-radius: 8px; margin: 16px 0;">
           Reset Password
        </a>
        <p style="color: #666; font-size: 14px;">This link expires in 1 hour. If you didn't request this, ignore this email.</p>
    </div>
    """
    send_email(to_email, "Reset your SkillSwap password", html)
