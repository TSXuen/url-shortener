const express = require("express")
const bodyParser = require("body-parser")
const cors = require("cors")
const fs = require("fs")
const QRCode = require("qrcode")

const app = express()
const PORT = 3000

app.use(cors())
app.use(bodyParser.json())
app.use(express.static("public"))

const dbFile = "database.json"

let db = {}

if (fs.existsSync(dbFile)) {
  db = JSON.parse(fs.readFileSync(dbFile))
}

function saveDB() {
  fs.writeFileSync(dbFile, JSON.stringify(db, null, 2))
}

function generateCode() {
  return Math.random().toString(36).substring(2, 8)
}

app.post("/shorten", async (req, res) => {

  const { url, custom } = req.body

  if (!url) {
    return res.json({ error: "URL required" })
  }

  let code = custom ? custom.toLowerCase() : generateCode()

  if (db[code]) {
    return res.json({ error: "Short code already exists" })
  }

  db[code] = {
    longUrl: url,
    clicks: 0
  }

  saveDB()

  const shortUrl = `http://localhost:${PORT}/${code}`

  const qr = await QRCode.toDataURL(shortUrl)

  res.json({
    shortUrl: shortUrl,
    qrCode: qr
  })

})

app.get("/urls", (req, res) => {
  res.json(db)
})

app.delete("/delete/:code", (req, res) => {

  const code = req.params.code

  if (db[code]) {
    delete db[code]
    saveDB()
  }

  res.json({ success: true })

})

app.get("/:code", (req, res) => {

  const code = req.params.code

  if (!db[code]) {
    return res.send("Short URL not found")
  }

  db[code].clicks += 1
  saveDB()

  res.redirect(db[code].longUrl)

})

app.listen(PORT, () => {
  console.log(`Server running http://localhost:${PORT}`)
})  