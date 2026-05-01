import express from "express";
import fs from "fs";
import { exec } from "child_process";
import { v4 as uuidv4 } from "uuid";

const app = express();
app.use(express.json({ limit: "10mb" }));

app.post("/compile", async (req, res) => {
  const tex = req.body.code;

  if (!tex) {
    return res.status(400).send("Missing LaTeX code");
  }

  const id = uuidv4();
  const dir = `/tmp/${id}`;

  fs.mkdirSync(dir);
  fs.writeFileSync(`${dir}/cv.tex`, tex);

  exec(
    `cd ${dir} && pdflatex -interaction=nonstopmode cv.tex`,
    (err, stdout, stderr) => {
      if (err) {
        console.error(stderr);
        return res.status(500).send("LaTeX compilation failed");
      }

      const pdfPath = `${dir}/cv.pdf`;

      if (!fs.existsSync(pdfPath)) {
        return res.status(500).send("PDF not generated");
      }

      const pdf = fs.readFileSync(pdfPath);

      res.setHeader("Content-Type", "application/pdf");
      res.send(pdf);
    },
  );
});

app.get("/", (req, res) => {
  res.send("LaTeX Compiler Service is running ✅");
});

app.listen(3000, () => {
  console.log("LaTeX service running on port 3000");
});
