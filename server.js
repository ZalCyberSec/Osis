const express = require("express");
const cors = require("cors");
const fs = require("fs-extra");
const path = require("path");
const app = express();
const PORT = 3003;
const votesFile = path.join(__dirname, "votes.json");
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

async function loadVotes() {
  try {
    return await fs.readJson(votesFile);
  } catch (err) {
    return { "1": 0, "2": 0 };
  }
}

async function saveVotes(votes) {
  await fs.writeJson(votesFile, votes, { spaces: 2 });
}

app.get("/api/votes", async (req, res) => {
  const votes = await loadVotes();
  res.json(votes);
});

app.post("/api/votes", async (req, res) => {
  const { name, candidate } = req.body;

  if (!name || !candidate) {
    return res.status(400).json({ error: "Nama dan kandidat wajib diisi" });
  }

  const votes = await loadVotes();
  if (!votes[candidate]) votes[candidate] = 0;
  votes[candidate]++;

  await saveVotes(votes);

  res.json({ success: true, votes });
});


app.post("/api/reset", async (req, res) => {
  const { admin } = req.body;
  if (admin !== "adminsma6") {
    return res.status(403).json({ error: "Hanya admin yang boleh reset" });
  }

  const votes = { "1": 0, "2": 0 };
  await saveVotes(votes);
  res.json({ success: true, message: "Voting berhasil direset", votes });
});

app.listen(PORT, () => {
  console.log(`Server jalan di http://localhost:${PORT}`);
});