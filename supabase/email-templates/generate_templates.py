#!/usr/bin/env python3
"""Generate all remaining Zenflix email templates for Supabase"""

import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

BASE = """<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{TITLE} - Zenflix</title>
</head>
<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;background:#0f0f12;color:#fff;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;margin:0 auto;padding:40px 20px;">
    <tr>
      <td style="background:linear-gradient(135deg,#1a1a2e 0%,#16213e 100%);border-radius:16px;padding:40px;border:1px solid rgba(139,92,246,0.2);">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td style="text-align:center;padding-bottom:32px;">
              <div style="font-size:28px;font-weight:800;background:linear-gradient(135deg,#8B5CF6,#EC4899);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;letter-spacing:-0.5px;">ZENFLIX</div>
              <p style="margin:8px 0 0;color:rgba(255,255,255,0.5);font-size:14px;">Streaming Film Premium</p>
            </td>
          </tr>
        </table>
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td style="text-align:center;padding-bottom:24px;">
              <h1 style="margin:0 0 16px;font-size:24px;font-weight:700;color:#fff;">{HEADING}</h1>
              <p style="margin:0;color:rgba(255,255,255,0.7);font-size:16px;line-height:1.6;">{BODY}</p>
            </td>
          </tr>
        </table>
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td style="text-align:center;padding:24px 0;">
              <a href="{{ .ConfirmationURL }}" style="display:inline-block;background:linear-gradient(135deg,#8B5CF6,#EC4899);color:#fff;text-decoration:none;padding:16px 32px;border-radius:12px;font-weight:600;font-size:16px;box-shadow:0 4px 20px rgba(139,92,246,0.4);">{BUTTON}</a>
            </td>
          </tr>
        </table>
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td style="text-align:center;padding-top:16px;">
              <p style="margin:0;color:rgba(255,255,255,0.5);font-size:13px;">Tombol tidak bisa diklik? Salin link ini ke browser:</p>
              <p style="margin:8px 0 0;color:#8B5CF6;font-size:13px;word-break:break-all;">{{ .ConfirmationURL }}</p>
            </td>
          </tr>
        </table>
        {EXTRA}
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td style="padding-top:32px;text-align:center;color:rgba(255,255,255,0.4);font-size:12px;">
              <p style="margin:0 0 8px;">Butuh bantuan? <a href="mailto:support@zenflix.app" style="color:#8B5CF6;text-decoration:none;">support@zenflix.app</a></p>
              <p style="margin:0;">© 2025 Zenflix. All rights reserved.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>"""

WARN_BLOCK = """
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td style="padding-top:24px;">
              <div style="background:rgba(239,68,68,0.1);border-radius:12px;padding:20px;border-left:4px solid #EF4444;">
                <p style="margin:0 0 8px;font-weight:600;color:#EF4444;font-size:14px;">⚠️ {WARN_TITLE}:</p>
                <p style="margin:0;color:rgba(255,255,255,0.7);font-size:13px;line-height:1.8;">{WARN_BODY}</p>
              </div>
            </td>
          </tr>
        </table>
"""

TEMPLATES = {
    "reset-password": {
        "TITLE": "Reset Password",
        "HEADING": "Lupa Password?",
        "BODY": "Klik tombol di bawah untuk mengatur ulang password akun Anda.",
        "BUTTON": "Atur Ulang Password",
        "EXTRA": WARN_BLOCK.format(WARN_TITLE="Keamanan", WARN_BODY="Link ini berlaku <strong>1 jam</strong>. Jika Anda tidak meminta reset ini, abaikan email ini."),
    },
    "reauthentication": {
        "TITLE": "Verifikasi Keamanan",
        "HEADING": "Verifikasi Keamanan Diperlukan",
        "BODY": "Untuk mengamankan akun Anda, silakan verifikasi dengan magic link di bawah ini.",
        "BUTTON": "Verifikasi Sekarang",
        "EXTRA": "",
    },
    "password-changed": {
        "TITLE": "Password Berubah",
        "HEADING": "Password Anda Telah Berubah",
        "BODY": "Password akun Zenflix Anda baru saja diubah. Jika ini bukan Anda, segera hubungi support.",
        "BUTTON": "Buka Zenflix",
        "EXTRA": WARN_BLOCK.format(WARN_TITLE="Keamanan", WARN_BODY="Jika Anda tidak melakukan perubahan ini, hubungi <a href='mailto:support@zenflix.app' style='color:#8B5CF6;'>support@zenflix.app</a> segera."),
    },
    "email-changed": {
        "TITLE": "Email Berubah",
        "HEADING": "Email Akun Telah Diubah",
        "BODY": "Alamat email akun Zenflix Anda baru saja diubah. Jika ini bukan Anda, segera hubungi support.",
        "BUTTON": "Buka Zenflix",
        "EXTRA": WARN_BLOCK.format(WARN_TITLE="Keamanan", WARN_BODY="Jika Anda tidak melakukan perubahan ini, hubungi support segera."),
    },
    "phone-changed": {
        "TITLE": "Nomor Ponsel Berubah",
        "HEADING": "Nomor Ponsel Telah Diubah",
        "BODY": "Nomor ponsel akun Zenflix Anda baru saja diubah. Jika ini bukan Anda, segera hubungi support.",
        "BUTTON": "Buka Zenflix",
        "EXTRA": WARN_BLOCK.format(WARN_TITLE="Keamanan", WARN_BODY="Jika Anda tidak melakukan perubahan ini, hubungi support segera."),
    },
    "signin-linked": {
        "TITLE": "Metode Masuk Terkait",
        "HEADING": "Metode Masuk Baru Ditambahkan",
        "BODY": "Metode masuk baru telah ditautkan ke akun Zenflix Anda (Google, Apple, atau lainnya).",
        "BUTTON": "Buka Zenflix",
        "EXTRA": WARN_BLOCK.format(WARN_TITLE="Keamanan", WARN_BODY="Jika Anda tidak menambahkan metode ini, hubungi support segera."),
    },
    "signin-removed": {
        "TITLE": "Metode Masuk Dihapus",
        "HEADING": "Metode Masuk Dihapus",
        "BODY": "Sebuah metode masuk telah dihapus dari akun Zenflix Anda.",
        "BUTTON": "Buka Zenflix",
        "EXTRA": WARN_BLOCK.format(WARN_TITLE="Keamanan", WARN_BODY="Jika Anda tidak menghapus metode ini, hubungi support segera."),
    },
    "mfa-added": {
        "TITLE": "MFA Ditambahkan",
        "HEADING": "Keamanan Dua Langkah Aktif",
        "BODY": "Autentikasi dua faktor (MFA) telah diaktifkan di akun Zenflix Anda.",
        "BUTTON": "Buka Zenflix",
        "EXTRA": "",
    },
    "mfa-removed": {
        "TITLE": "MFA Dihapus",
        "HEADING": "Keamanan Dua Langkah Dinonaktifkan",
        "BODY": "Autentikasi dua faktor (MFA) telah dinonaktifkan di akun Zenflix Anda.",
        "BUTTON": "Buka Zenflix",
        "EXTRA": WARN_BLOCK.format(WARN_TITLE="Keamanan", WARN_BODY="Jika Anda tidak menonaktifkan MFA, hubungi support segera."),
    },
}

if __name__ == "__main__":
    for name, params in TEMPLATES.items():
        html = BASE.format(**params)
        path = os.path.join(BASE_DIR, f"{name}.html")
        with open(path, "w", encoding="utf-8") as f:
            f.write(html)
        print(f"Generated {name}.html ({len(html)} bytes)")
    print("All templates generated!")