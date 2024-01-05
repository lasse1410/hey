const express = require('express');
const app = express();
const port = 3001;

app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

let reports = [];

app.get('/', (req, res) => {
  let reportListHTML = '<h2>Berichte</h2>';
  reportListHTML += '<a href="/create" class="to-create-button">Neuen Bericht erstellen</a>';
  reportListHTML += '<link rel="stylesheet" type="text/css" href="/report-style.css">';
  reportListHTML += '<ul>';

  reports.forEach((report, index) => {
    reportListHTML += `
      <li>
        <a href="/report/${index}">
          <strong>${report.teamMember}</strong> hat <strong>${report.playerName}</strong> am ${report.date} gebannt/gekickt: ${report.report}
        </a>
      </li>`;
  });

  reportListHTML += '</ul>';

  res.send(reportListHTML);
});

app.post('/addReport', (req, res) => {
  const { teamMember, playerName, date, report } = req.body;
  const reportObject = { teamMember, playerName, date, report };
  reports.push(reportObject);
  res.redirect('/');
});

app.get('/report/:id', (req, res) => {
  const id = req.params.id;
  const report = reports[id];
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
