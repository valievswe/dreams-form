const formData = new FormData(form);
const data = Object.fromEntries(formData.entries());
const initData = Telegram.WebApp.initData;

fetch("/mkregister", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "CSRF-Token": data._csrf,
  },
  body: JSON.stringify(data),
});
