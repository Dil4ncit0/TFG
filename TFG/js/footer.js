// footer.js
document.addEventListener("DOMContentLoaded", function () {
    fetch("footer.html")
    .then((response) => response.text())
    .then((html) => {
document.getElementById("footer-placeholder").innerHTML = html;
    })
    .catch((err) => console.error("Error al cargar el footer:", err));
});
