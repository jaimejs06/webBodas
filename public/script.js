document.getElementById("uploadForm").addEventListener("submit", async function (event) {
  event.preventDefault();

  const input = document.getElementById("fileInput");
  const mensaje = document.getElementById("mensaje");
  const conversionMessage = document.getElementById("conversionMessage");

  if (input.files.length === 0) {
    mensaje.textContent = "Por favor selecciona al menos una imagen.";
    return;
  }

  // Mostrar mensaje de conversión mientras procesa
  conversionMessage.style.display = "block";
  mensaje.textContent = "";

  const formData = new FormData();

  try {
    for (const file of input.files) {
      const ext = file.name.split(".").pop().toLowerCase();

      if (ext === "heic" || file.type === "image/heic") {
        const convertedBlob = await heic2any({
          blob: file,
          toType: "image/jpeg",
          quality: 0.9
        });

        const convertedFile = new File(
          [convertedBlob],
          file.name.replace(/\.heic$/i, ".jpg"),
          { type: "image/jpeg" }
        );

        formData.append("photos", convertedFile);
      } else {
        formData.append("photos", file);
      }
    }

    // Subir al servidor
    const res = await fetch("/api/upload", {
      method: "POST",
      body: formData
    });

    const result = await res.json();

    if (result.success) {
      mensaje.textContent = "Imágenes subidas correctamente.";
      input.value = ""; // Reset input
      loadGallery(); // Recarga la galería con las nuevas imágenes
    } else {
      mensaje.textContent = "Error en la subida.";
    }
  } catch (error) {
    console.error("Error en la conversión o subida:", error);
    mensaje.textContent = "Ocurrió un error durante la conversión o subida.";
  } finally {
    // Ocultar mensaje de conversión
    conversionMessage.style.display = "none";
  }
});


async function loadGallery() {
  const loadingMessage = document.getElementById("loadingMessage");

  loadingMessage.style.display = "block"; // Mostrar mensaje
  try {
    const res = await fetch("/api/photos");
    const data = await res.json();
    if (data.success) {
      const uploadedGallery = document.getElementById("uploadedGallery");
      uploadedGallery.innerHTML = "";

      data.images.forEach((img) => {
        const container = document.createElement("div");
        container.className = "image-container";

        const imgElem = document.createElement("img");
        imgElem.src = `/uploads/${img}`;
        imgElem.alt = "Foto subida";

        container.appendChild(imgElem);
        uploadedGallery.appendChild(container);
      });
    }
  } catch (e) {
    console.error("Error cargando galería", e);
  } finally {
    loadingMessage.style.display = "none"; // Ocultar mensaje cuando termina
  }
}

// Carga inicial de imágenes
loadGallery();
