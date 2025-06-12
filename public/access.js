document.getElementById("enter-btn").addEventListener("click", async () => {
  const code = document.getElementById("access-code").value.trim();
  const errorMsg = document.getElementById("error-message");
  errorMsg.textContent = "";

  if (!code) {
    errorMsg.textContent = "Por favor, introduce el código";
    return;
  }

  try {
    const response = await fetch("/api/check-code", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code }),
    });

    if (response.ok) {
      const data = await response.json();
      if (data.success) {
        window.location.href = "album.html"; // redirige al álbum
      } else {
        errorMsg.textContent = "Código incorrecto";
      }
    } else {
      const errorData = await response.json();
      errorMsg.textContent = errorData.message || "Error en la validación";
    }
  } catch {
    errorMsg.textContent = "Error de conexión con el servidor";
  }
});

