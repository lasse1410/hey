const express = require('express');
const mongoose = require('mongoose');
const app = express();
const port = 3004;

app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

mongoose.connect('mongodb://localhost:27017/deineDatenbank', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const reportSchema = new mongoose.Schema({
  teamMember: String,
  playerName: String,
  date: String,
  report: String,
});

const Report = mongoose.model('Report', reportSchema);

app.get('/', async (req, res) => {
  const searchTerm = req.query.search || '';

  let filteredReports = await Report.find();

  if (searchTerm) {
    filteredReports = await Report.find({
      $or: [
        { teamMember: { $regex: searchTerm, $options: 'i' } },
        { playerName: { $regex: searchTerm, $options: 'i' } },
        { date: { $regex: searchTerm, $options: 'i' } },
        { report: { $regex: searchTerm, $options: 'i' } },
      ],
    });
  }

  let reportListHTML = `
    <h2>Berichte</h2>
    <form action="/" method="get">
      <label for="search">Suche nach:</label>
      <input type="text" id="search" name="search" placeholder="Spielername, Teammitglied, Datum, Bericht" value="${searchTerm}">
      <button type="submit">Suchen</button>
    </form>
    <a href="/create" class="to-create-button">Neuen Bericht erstellen</a>
    <link rel="stylesheet" type="text/css" href="/report-style.css">
    <ul>
  `;

  filteredReports.forEach(report => {
    reportListHTML += `
      <li>
        <a href="/report/${report._id}">
          <strong>${report.teamMember}</strong> hat <strong>${report.playerName}</strong> am ${report.date} gebannt/gekickt: ${report.report}
        </a>
      </li>`;
  });

  reportListHTML += '</ul>';
  res.send(reportListHTML);
});

app.post('/addReport', async (req, res) => {
  const { teamMember, playerName, date, report } = req.body;
  const reportObject = new Report({ teamMember, playerName, date, report });
  await reportObject.save();
  res.redirect('/');
});

app.get('/report/:id', async (req, res) => {
  const id = req.params.id;
  const report = await Report.findById(id);
  const reportHTML = `
    <h2>Berichtsakte</h2>
    <link rel="stylesheet" type="text/css" href="/report-stylesheet.css">
    <h3>${report.teamMember} hat ${report.playerName} am ${report.date} gebannt/gekickt:</h3>
    <p>${report.report}</p>`;
  res.send(reportHTML);
});

app.get('/create', (req, res) => {
  const createFormHTML = `
    <html>
      <head>
        <title>Ban/Kick Bericht erstellen</title>
        <link rel="stylesheet" type="text/css" href="/style.css">
      </head>
      <body>
        <h2>Ban/Kick Bericht erstellen</h2>
        <form action="/addReport" method="post">
          <label for="teamMember">Teammitglied:</label>
          <input type="text" id="teamMember" name="teamMember" placeholder="Name des Teammitglieds" required>
          <br>
          <label for="playerName">Spielername:</label>
          <input type="text" id="playerName" name="playerName" placeholder="Spielername" required>
          <br>
          <label for="date">Datum:</label>
          <input type="date" id="date" name="date" required>
          <br>
          <label for="report">Bericht:</label>
          <textarea id="report" name="report" placeholder="Gib hier deinen Bericht ein..." required></textarea>
          <br>
          <button type="submit">Hinzufügen</button>
        </form>
      </body>
    </html>`;

  res.send(createFormHTML);
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
