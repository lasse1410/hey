const express = require('express');
const mongoose = require('mongoose');
const app = express();
const port = 3000;

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
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Berichte</title>
      <style>
        /* CSS für die Berichtsseite */
        body {
          font-family: Arial, sans-serif;
          margin: 0;
          padding: 0;
          background-color: #f4f4f4;
        }

        .container {
          max-width: 800px;
          margin: 50px auto;
          background-color: #fff;
          padding: 20px;
          border-radius: 8px;
          box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        }

        label {
          display: block;
          margin-bottom: 8px;
        }

        input, textarea {
          width: 100%;
          padding: 8px;
          margin-bottom: 16px;
          box-sizing: border-box;
        }

        button {
          background-color: #4caf50;
          color: #fff;
          padding: 10px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        }

        button:hover {
          background-color: #45a049;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h2>Berichte</h2>
        <form action="/" method="get">
          <label for="search">Suche nach:</label>
          <input type="text" id="search" name="search" placeholder="Spielername, Teammitglied, Datum, Bericht" value="${searchTerm}">
          <button type="submit">Suchen</button>
        </form>
        <a href="/create" class="to-create-button">Neuen Bericht erstellen</a>
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

  reportListHTML += `
        </ul>
      </div>
    </body>
    </html>`;

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

  let reportHTML = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Berichtsakte</title>
      <style>
        /* CSS für die Berichtsakte-Seite */
        body {
          font-family: Arial, sans-serif;
          margin: 0;
          padding: 0;
          background-color: #f4f4f4;
        }

        .container {
          max-width: 800px;
          margin: 50px auto;
          background-color: #fff;
          padding: 20px;
          border-radius: 8px;
          box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        }

        h2 {
          color: #3498db;
        }

        h3 {
          color: #333;
        }

        p {
          color: #555;
          line-height: 1.6;
        }

        a {
          color: #3498db;
          text-decoration: none;
        }

        a:hover {
          text-decoration: underline;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h2>Berichtsakte</h2>
        <h3>${report.teamMember} hat ${report.playerName} am ${report.date} gebannt/gekickt:</h3>
        <p>${report.report}</p>
      </div>
    </body>
    </html>`;

  res.send(reportHTML);
});

app.get('/create', (req, res) => {
  let createFormHTML = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Ban/Kick Bericht erstellen</title>
      <style>
        /* CSS für das Berichtsformular */
        body {
          font-family: Arial, sans-serif;
          margin: 0;
          padding: 0;
          background-color: #f4f4f4;
        }

        .container {
          max-width: 800px;
          margin: 50px auto;
          background-color: #fff;
          padding: 20px;
          border-radius: 8px;
          box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        }

        .to-create-button {
          background-color: #3498db;
          color: #fff;
          padding: 10px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          text-decoration: none;
          display: inline-block;
          margin-bottom: 10px;
        }

        .to-create-button:hover {
          background-color: #2980b9;
        }

        ul {
          list-style-type: none;
          padding: 0;
        }

        li {
          border-bottom: 1px solid #ddd;
          padding: 10px 0;
        }

        a {
          text-decoration: none;
          color: #333;
        }

        a:hover {
          text-decoration: underline;
        }

        /* Neue Stile für das Berichtsformular */
        form {
          max-width: 600px;
          margin: 20px auto;
          background-color: #fff;
          padding: 20px;
          border-radius: 8px;
          box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        }

        label {
          display: block;
          margin-bottom: 8px;
        }

        input, textarea {
          width: 100%;
          padding: 8px;
          margin-bottom: 16px;
          box-sizing: border-box;
        }

        button {
          background-color: #4caf50;
          color: #fff;
          padding: 10px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        }

        button:hover {
          background-color: #45a049;
        }
      </style>
    </head>
    <body>
      <div class="container">
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
      </div>
    </body>
    </html>`;

  res.send(createFormHTML);
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
