// Use packages
const express = require('express');
const path = require('path');
const cookieSession = require('cookie-session');
const createError = require('http-errors');
const bodyParser = require('body-parser');

const FeedbackService = require('./services/FeedbackService');
const SpeakersService = require('./services/SpeakerService');

const feedbackService = new FeedbackService('./data/feedback.json');
const speakersService = new SpeakersService('./data/speakers.json');
const routes = require('./routes');

const app = express(); // Serve the app

const port = 3000;

app.set('trust proxy', 1); // This makes Express trust cookies that are passed through a reverse proxy

app.use(
  cookieSession({
    name: 'session',
    keys: ['Ghdur687399s7w', 'hhjjdf89s866799'],
  })
);

app.use(bodyParser.urlencoded({ extended: true })); // Parses requests sent in the browser
app.use(bodyParser.json()); // Required for sending API requests

// Setup templating engine, views must have an extension of .ejs instead of .html
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, './views'));

// Global template variables
app.locals.siteName = 'ROUX Meetups';

app.use(express.static(path.join(__dirname, './static'))); // Serve static files in the specified directory

// Variables defined here are available to any template and layout files
app.use(async (request, response, next) => {
  try {
    const names = await speakersService.getNames();
    // Make it available to all templates and layouts
    response.locals.speakerNames = names;
    // console.log(response.locals); // Get JSON output
    return next();
  } catch (error) {
    return next(error);
  }
});

app.use(
  '/',
  routes({
    feedbackService,
    speakersService,
  })
);

app.use((request, response, next) => {
  return next(createError(404, 'File not found'));
});

app.use((error, request, response, next) => {
  response.locals.message = error.message;
  console.error(error);
  const status = error.status || 500;
  response.locals.status = status;
  response.status(status);
  response.render('error');
});

app.listen(port, () => {
  console.log(`Express server listening on port ${port}!`);
});
