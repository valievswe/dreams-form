document.querySelectorAll("form").forEach((form) => {
  form.addEventListener("submit", function (e) {
    e.preventDefault(); // Prevent full page reload

    const formData = new FormData(this);
    const data = Object.fromEntries(formData.entries());

    // Validate Uzbekistan phone format
    const phoneRegex = /^\+998\s?\d{2}\s?\d{3}\s?\d{2}\s?\d{2}$/;
    if (!phoneRegex.test(data.phone)) {
      alert(
        "Telefon raqam formati noto‘g‘ri. To‘g‘ri format: +998 90 123 45 67"
      );
      return;
    }

    // Determine target URL
    let url;
    switch (this.id) {
      case "imtihon":
        url = "/imtihonregister";
        break;
      case "president":
        url = "/presidentregister";
        break;
      case "mental":
        url = "/mentalregister";
        break;
      default:
        url = "/mkregister";
    }

    // Check if Telegram.WebApp is defined (check only in Telegram Mini App)
    if (typeof Telegram !== "undefined" && Telegram.WebApp) {
      const initData = Telegram.WebApp.initData;

      // Log initData to inspect the data
      console.log("initData from Telegram:", initData);

      // Send the form data along with Telegram initData
      fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "CSRF-Token": data._csrf, // CSRF token for security
        },
        body: JSON.stringify({
          ...data,
          initData, // attach Telegram signature
        }),
      })
        .then(async (res) => {
          if (!res.ok) {
            const errorBody = await res.json(); // try to read JSON body
            throw new Error(errorBody.error || "Yuborishda xatolik");
          }
          return res.json();
        })
        .then((res) => {
          alert("Muvaffaqiyatli yuborildi!");
          this.reset();
        })
        .catch((err) => {
          alert("Xatolik yuz berdi: " + err.message);
        });
    } else {
      alert("Telegram Web App not detected. Please try again in Telegram.");
    }
  });
});
