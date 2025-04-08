const formData = new FormData(form);
const data = Object.fromEntries(formData.entries());

fetch("/mkregister", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "CSRF-Token": data._csrf,
  },
  body: JSON.stringify(data),
});
