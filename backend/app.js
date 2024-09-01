require('dotenv').config();
const express = require('express');
const path = require('path');
const app = express();
const jwt = require('jsonwebtoken');
const port = process.env.PORT;

function authenticateToken(req, res, next) {
  const path = req.path;
  if (path === '/auth/login' || path === '/auth/register' || path == "/auth/refresh-token" || path == "/auth/revoke-token") {
    return next();
  }

  const token = req.headers['authorization']?.split(' ')[1];

  if (!token) return res.sendStatus(401);

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);

    req.user = user;
    next();
  });
}


/**
 * Middleware
 */
app.use(express.json())
app.use(authenticateToken);

/**
 * Routes
 */

app.use("/", require("./routes/root"));
app.use('/auth', require("./routes/auth"))

/**
 * Basic setup
 */

app.use((err, req, res, next) => {
  console.error("Error:", err.message || err);
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error'
  });
});

app.use("/", express.static(path.join(__dirname, "public")));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, "views", "index.html"));
});

app.all("*", (req, res) => {
  res.status(400);
  if (req.accepts("html")) {
    res.sendFile(path.join(__dirname, "views", "404.html"));
  } else if (req.accepts("json")) {
    res.json({ message: "404 Not Found" });
  } else {
    res.type("txt").send("404 Not Found");
  }
});

app.listen(port, () => {
  console.log(`server is running at port ${port}...
    http://localhost:${port}
    `);
});
