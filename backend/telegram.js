const LINE = "━━━━━━━━━━━━━━━━━━";

const SITE_NAME = process.env.TELEGRAM_SITE_NAME || "Halila";

// "halila-article-oshqozon" -> "oshqozon"
function topicFromSource(source) {
  if (typeof source !== "string" || !source) return "—";
  return source.replace(/^halila-article-/, "").replace(/^halila-/, "");
}

function formatDate(iso) {
  const d = new Date(iso);
  const pad = (n) => String(n).padStart(2, "0");
  return (
    `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ` +
    `${pad(d.getHours())}:${pad(d.getMinutes())}`
  );
}

export function buildLeadMessage(lead) {
  return [
    LINE,
    "📥 ЯНГИ МИЖОЗ",
    `🌐 Сайт: ${SITE_NAME}`,
    `👤 Исм: ${lead.name}`,
    `📞 Тел рақам: ${lead.phone}`,
    `📝 Мавзу: ${topicFromSource(lead.source)}`,
    `👨‍👩‍👧 Ким учун: ${lead.relationLabel || lead.relation || "—"}`,
    `🕒 Сана: ${formatDate(lead.createdAt)}`,
    LINE,
  ].join("\n");
}

export async function notifyTelegram(lead) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) return;

  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text: buildLeadMessage(lead) }),
    });
    if (!res.ok) {
      console.error("Telegram notify failed:", await res.text());
    }
  } catch (err) {
    console.error("Telegram notify error:", err.message);
  }
}
