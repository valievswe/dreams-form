// Wait for the DOM to load
document.addEventListener("DOMContentLoaded", () => {
  // Add event listeners to buttons
  document.getElementById("maktab").addEventListener("click", () => {
    window.location.href = "/maktab"; // Redirect to the maktab page
    // You can also send a request to the backend here if needed
  });

  document.getElementById("prezident-m").addEventListener("click", () => {
    window.location.href = "/prezident-m"; // Redirect to the prezident-m page
  });

  document.getElementById("mental-m").addEventListener("click", () => {
    window.location.href = "/mental-m"; // Redirect to the mental-m page
  });

  document.getElementById("test-imtihon").addEventListener("click", () => {
    window.location.href = "/test-imtihon"; // Redirect to the test-imtihon page
  });
});
