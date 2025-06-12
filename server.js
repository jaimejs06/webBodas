import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import session from "express-session";
import multer from "multer";
import sharp from "sharp";
import fs from "fs";

// === Ajustes para __dirname en ESModules ===
const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

// === Asegura que exista uploads/ ===
const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);

const app = express();
const PORT = 3000;
const ACCESS_CODE = "CyB2025";

// === Multer en memoria ===
const upload = multer({ storage: multer.memoryStorage() });

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
  secret: "aaB089cVx1234uUiIpkr",
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 3600000 }
}));

// Protege /album.html y /uploads
app.use((req, res, next) => {
  if (req.path === "/album.html" || req.path.startsWith("/uploads")) {
    if (req.session.authenticated) return next();
    return res.redirect("/");
  }
  next();
});

// Públicos
app.use(express.static(path.join(__dirname, "public")));
app.use("/uploads", express.static(uploadsDir));

// Acceso
app.get("/", (req, res) =>
  res.sendFile(path.join(__dirname, "public", "acceso.html"))
);
app.post("/api/check-code", (req, res) => {
  if (req.body.code === ACCESS_CODE) {
    req.session.authenticated = true;
    return res.json({ success: true });
  }
  return res.status(401).json({ success: false, message: "Código incorrecto" });
});

// --- SUBIDA ---
app.post("/api/upload", upload.array("photos", 10), async (req, res) => {
  const finalNames = [];

  for (const file of req.files) {
    const safeName = file.originalname.replace(/\s+/g, "_");
    const fullPath = path.join(uploadsDir, `${Date.now()}_${safeName}`);
    fs.writeFileSync(fullPath, file.buffer);
    finalNames.push(path.basename(fullPath));
  }
  return res.json({ success: true, files: finalNames });
});

// Listado de fotos (ahora incluye .jpg .png .heic convertido)
app.get("/api/photos", (req, res) => {
  fs.readdir(uploadsDir, (err, files) => {
    if (err) return res.status(500).json({ success: false });
    // Solo formatos que el navegador puede mostrar
    const images = files.filter(f =>
      /\.(jpg|jpeg|png|gif|webp)$/i.test(f)
    );
    res.json({ success: true, images });
  });
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});

