const { response } = require('express');
const express = require('express');
const path = require('path');
const request = require('request');
const app = (exports.app = express());
const {
  GRAPHQL_CLIENT_CREDENTIALS,
  GRAPHQL_SCHEMA_URL,
  CI_URL,
  JENKINS_BASE_URL,
  JENKINS_JOB_FOLDER,
  JENKINS_JOB_NAME,
  JENKINS_JOB_TOKEN,
  ARTIFACTORY_URL,
  ARTIFACT_REPO,
} = require('./config');

const SORRY_CYPRESS_ENVIRONMENT = JSON.stringify({
  GRAPHQL_CLIENT_CREDENTIALS,
  GRAPHQL_SCHEMA_URL,
  CI_URL,
  JENKINS_BASE_URL,
  JENKINS_JOB_FOLDER,
  JENKINS_JOB_NAME,
  JENKINS_JOB_TOKEN,
  ARTIFACTORY_URL,
  ARTIFACT_REPO,
});

/**************** Proxy for Jenkins and Artificatory **************** */
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  next();
});

app.get('/jenkins/run', (req, res) => {
  let jobRemoteRunUrl = `${JENKINS_BASE_URL}/job/${JENKINS_JOB_FOLDER}/job/${JENKINS_JOB_NAME}/build?token=${JENKINS_JOB_TOKEN}`;
  jobRemoteRunUrl = jobRemoteRunUrl.replace(/ /g, '%20');

  console.log('logging from jenkins proxy. joburl = ', jobRemoteRunUrl);

  request({ url: jobRemoteRunUrl }, (error, response, body) => {
    if (error || (response.statusCode !== 200 && response.statusCode !== 201)) {
      return res.status(500).json({ type: 'error', message: error?.message });
    }

    res.json({
      message: 'Build triggered successfully!',
      data: response,
      body: body,
    });
  });
});

app.get('/jenkins/buildStatus', (req, res) => {
  const jobUrl = `${JENKINS_BASE_URL}/buildStatus/text?job=${JENKINS_JOB_FOLDER}/${JENKINS_JOB_NAME}`;

  request({ url: jobUrl }, (error, response, body) => {
    if (error || (response.statusCode !== 200 && response.statusCode !== 201)) {
      return res.status(500).json({ type: 'error', message: error?.message });
    }

    res.json({ message: 'Build Status Response!', data: response, body: body });
  });
});

app.get('/artifactrepo/reportname', (req, res) => {
  let ciBuildId = req.query.ciBuildId?.replace('#', '%23');
  if (ciBuildId === undefined) {
    console.log(
      'logging from artifactory proxy. Inside if condiiton. ciBuildId is ' +
        ciBuildId
    );
    return res
      .status(500)
      .json({
        message: `${ciBuildId} is undefined`,
        data: `${ciBuildId} is undefined`,
      });
  }

  console.log('logging from artifactory proxy. ciBuildId is ' + ciBuildId);
  const artifactReportUrl = `${ARTIFACTORY_URL}/${ARTIFACT_REPO}/${ciBuildId}/html-report/`;
  request(
    {
      url: artifactReportUrl,
      headers: {
        authorization: 'Basic ' + btoa('adas333:Kolkata-3'),
      },
    },
    (error, response, body) => {
      if (response.statusCode === 404) {
        return res
          .status(200)
          .json({
            message: 'Report folder is not present in artifactrepo!',
            data: 'FOLDER NOT FOUND',
          });
      }

      if (error || response.statusCode !== 200) {
        return res.status(500).json({ type: 'error', message: error?.message });
      }

      const startPos = body.indexOf('UCT_Regression_Test_Report_');
      const endPos = body.indexOf('.html');
      const reportName = body.substring(startPos, endPos) + '.html';

      res
        .status(response.statusCode)
        .json({
          message: 'Received report name from artifactrepo!',
          data: reportName,
        });
    }
  );
});

app.get('/artifactrepo/download', (req, res) => {
  let ciBuildId = req.query.ciBuildId.replace('#', '%23');
  let reportName = req.query.reportName;
  const artifactDownloadUrl = `${ARTIFACTORY_URL}/${ARTIFACT_REPO}/${ciBuildId}/html-report/${reportName}`;
  request(
    {
      url: artifactDownloadUrl,
      headers: {
        authorization: 'Basic ' + btoa('adas333:Kolkata-3'),
      },
    },
    (error, response, body) => {
      if (error || response.statusCode !== 200) {
        return res.status(500).json({ type: 'error', message: error?.message });
      }

      res.json({
        message: 'Received report html from artifactrepo!',
        data: response,
        body: body,
      });
    }
  );
});

/*************************************** */

app.set('view engine', 'ejs');
app.set('view options', { delimiter: '?' });
app.set('views', path.join(__dirname, '../dist/views'));

app.use(express.static(path.join(__dirname, '../dist')));
app.use(express.static(path.join(__dirname, './static')));

if (process.env.NODE_ENV !== 'production') {
  const { dev } = require('./dev');
  app.use(dev);
}

app.use((_, res) =>
  res.render('index.ejs', {
    SORRY_CYPRESS_ENVIRONMENT,
  })
);
