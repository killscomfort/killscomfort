import { SITE } from "@/lib/constants";

const COLORS = {
  bg: "#000000",
  panel: "#0e0e0e",
  text: "#ffffff",
  muted: "rgba(255,255,255,0.55)",
  border: "rgba(255,255,255,0.12)",
  buttonBg: "#ffffff",
  buttonText: "#000000",
} as const;

export function escapeHtml(value: unknown): string {
  if (value == null) return "";
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function emailParagraph(html: string) {
  return `<p style="margin:0 0 16px;font-family:Georgia,'Times New Roman',serif;font-size:16px;line-height:1.7;color:${COLORS.text};opacity:0.88;">${html}</p>`;
}

export function emailButton(href: string, label: string) {
  return `
    <table role="presentation" cellpadding="0" cellspacing="0" style="margin:8px 0 20px;">
      <tr>
        <td style="background:${COLORS.buttonBg};">
          <a href="${href}" style="display:inline-block;padding:14px 28px;font-family:Georgia,'Times New Roman',serif;font-size:12px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;color:${COLORS.buttonText};text-decoration:none;">${escapeHtml(label)}</a>
        </td>
      </tr>
    </table>
  `;
}

export function emailDetailBlock(rows: { label: string; value: string }[]) {
  const rowsHtml = rows
    .filter((row) => row.value)
    .map(
      (row) => `
        <tr>
          <td style="padding:14px 0;border-bottom:1px solid ${COLORS.border};">
            <p style="margin:0;font-family:Georgia,'Times New Roman',serif;font-size:10px;letter-spacing:0.22em;text-transform:uppercase;color:${COLORS.text};opacity:0.45;">${escapeHtml(row.label)}</p>
            <p style="margin:6px 0 0;font-family:Georgia,'Times New Roman',serif;font-size:15px;line-height:1.5;color:${COLORS.text};">${row.value}</p>
          </td>
        </tr>
      `
    )
    .join("");

  return `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 20px;">
      ${rowsHtml}
    </table>
  `;
}

export function emailList(items: string[]) {
  return `
    <ul style="margin:0 0 20px;padding-left:18px;font-family:Georgia,'Times New Roman',serif;font-size:15px;line-height:1.6;color:${COLORS.text};opacity:0.88;">
      ${items.map((item) => `<li style="margin-bottom:8px;">${item}</li>`).join("")}
    </ul>
  `;
}

type EmailLayoutOptions = {
  title: string;
  content: string;
  preheader?: string;
};

export function renderEmailLayout({ title, content, preheader }: EmailLayoutOptions) {
  const siteHost = SITE.url.replace(/^https?:\/\//, "");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(title)}</title>
  ${preheader ? `<span style="display:none;max-height:0;overflow:hidden;opacity:0;">${escapeHtml(preheader)}</span>` : ""}
</head>
<body style="margin:0;padding:0;background:${COLORS.bg};">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${COLORS.bg};">
    <tr>
      <td align="center" style="padding:40px 16px;">
        <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;background:${COLORS.panel};border:1px solid ${COLORS.border};">
          <tr>
            <td style="padding:28px 28px 0;">
              <p style="margin:0;font-family:Georgia,'Times New Roman',serif;font-size:11px;letter-spacing:0.32em;text-transform:uppercase;color:${COLORS.text};opacity:0.7;">${SITE.name}</p>
            </td>
          </tr>
          <tr>
            <td style="padding:24px 28px 8px;">
              <h1 style="margin:0;font-family:Georgia,'Times New Roman',serif;font-size:28px;font-weight:700;line-height:1.15;letter-spacing:0.02em;color:${COLORS.text};">${escapeHtml(title)}</h1>
            </td>
          </tr>
          <tr>
            <td style="padding:8px 28px 28px;">
              ${content}
            </td>
          </tr>
          <tr>
            <td style="padding:24px 28px;border-top:1px solid ${COLORS.border};">
              <p style="margin:0;font-family:Georgia,'Times New Roman',serif;font-size:13px;line-height:1.6;color:${COLORS.text};opacity:0.5;">${escapeHtml(SITE.tagline)}</p>
              <p style="margin:14px 0 0;font-family:Georgia,'Times New Roman',serif;font-size:11px;letter-spacing:0.18em;text-transform:uppercase;">
                <a href="${SITE.url}" style="color:${COLORS.text};text-decoration:none;opacity:0.65;">${siteHost}</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
