// Wait for the DOM to load
document.addEventListener("DOMContentLoaded", () => {
  // Add event listeners to buttons
  document.getElementById("maktab").addEventListener("click", () => {
    window.location.href = "/maktab"; // Redirect to the maktab page
    // You can also send a request to the backend here if needed
  });

  document.getElementById("president").addEventListener("click", () => {
    window.location.href = "/president"; // Redirect to the prezident-m page
  });

  document.getElementById("mental").addEventListener("click", () => {
    window.location.href = "/mental"; // Redirect to the mental-m page
  });

  document.getElementById("imtihon").addEventListener("click", () => {
    window.location.href = "/imtihon"; // Redirect to the test-imtihon page
  });
});
