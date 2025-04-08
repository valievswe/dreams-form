document.querySelectorAll("form").forEach((form) => {
  form.addEventListener("submit", function (e) {
    e.preventDefault(); // Important to prevent full form reload

    const formData = new FormData(this);
    const data = Object.fromEntries(formData.entries());

    // Optional: Uzbekistan phone format check
    const phoneRegex = /^\+998\s?\d{2}\s?\d{3}\s?\d{2}\s?\d{2}$/;
    if (!phoneRegex.test(data.phone)) {
      alert(
        "Telefon raqam formati noto‘g‘ri. To‘g‘ri format: +998 90 123 45 67"
      );
      return;
    }

    // Determine the target URL based on the form ID
    let url;
    if (this.id === "imtihon") {
      url = "/imtihonregister";
    } else if (this.id === "president") {
      url = "/presidentregister";
    } else if (this.id === "mental") {
      url = "/mentalregister";
    } else {
      url = "/mkregister"; // Default URL if no match
    }

    fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "CSRF-Token": data._csrf, // <-- extract from form field
      },
      body: JSON.stringify(data),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Yuborishda xatolik");
        return res.json();
      })
      .then((res) => {
        alert("Muvaffaqiyatli yuborildi!");
        this.reset();
      })
      .catch((err) => {
        alert("Xatolik yuz berdi: " + err.message);
      });
  });
});
