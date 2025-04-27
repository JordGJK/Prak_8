const express = require("express");
const multer = require("multer");
const path = require("path");
const cors = require("cors");

const app = express();


app.use(cors());
app.use(express.urlencoded({ extended: true }));


const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname); 
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, 
  fileFilter: (req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/png", "application/pdf"];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Дозволені лише JPG, PNG, PDF"));
    }
  }
});


const fs = require("fs");
if (!fs.existsSync("uploads")) {
  fs.mkdirSync("uploads");
}


app.use(express.static("public"));

app.post("/upload", upload.single("fileToUpload"), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "Файл не було завантажено" });
    }
    res.json({ 
      message: "Файл успішно завантажено!",
      filename: req.file.filename,
      originalname: req.file.originalname,
      size: req.file.size
    });
  } catch (error) {
    console.error("Помилка завантаження:", error);
    res.status(500).json({ error: "Внутрішня помилка сервера" });
  }
});

app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ error: err.message });
  } else if (err) {
    return res.status(400).json({ error: err.message });
  }
  next();
});


app.listen(5000, () => {
  console.log("Сервер працює на http://localhost:5000");
  console.log("Папка для завантажень:", path.join(__dirname, "uploads"));
});