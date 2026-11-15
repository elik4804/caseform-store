// Minimal order endpoint. Set TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID as environment variables.
const express = require("express");
const path = require("path");
const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname)));
app.post("/api/order", async (req, res) => {
  const d = req.body || {};
  const required = ["name","phone","model","color","delivery","branch","payment"];
  if (required.some(k => !String(d[k] || "").trim())) return res.status(400).json({error:"Missing fields"});
  if (!process.env.TELEGRAM_BOT_TOKEN || !process.env.TELEGRAM_CHAT_ID) {
    return res.status(503).json({error:"Telegram is not configured"});
  }
  const safe = v => String(v || "—").replace(/[<>]/g, "");
  const message = [
    "🛍 НОВЕ ЗАМОВЛЕННЯ CASEFORM",
    `Ім'я: ${safe(d.name)}`,
    `Телефон: ${safe(d.phone)}`,
    `Модель: ${safe(d.model)}`,
    `Колір: ${safe(d.color)}`,
    `Доставка: ${safe(d.delivery)}`,
    `Відділення: ${safe(d.branch)}`,
    `Оплата: ${safe(d.payment)}`,
    `Коментар: ${safe(d.comment)}`,
    `Кількість: ${Number(d.quantity) || 1}`,
    `Сума: ${333 * (Number(d.quantity) || 1)} грн`
  ].join("\\n");
  try {
    const r = await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method:"POST", headers:{"Content-Type":"application/json"},
      body:JSON.stringify({chat_id:process.env.TELEGRAM_CHAT_ID,text:message})
    });
    if (!r.ok) throw new Error("Telegram API error");
    res.json({ok:true});
  } catch (e) { res.status(502).json({error:"Could not send Telegram notification"}); }
});
const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`CASEFORM running on ${port}`));
