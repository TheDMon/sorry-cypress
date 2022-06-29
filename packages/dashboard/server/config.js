require('dotenv').config();

exports.PORT = process.env.PORT || 8080;
exports.GRAPHQL_SCHEMA_URL =
  process.env.GRAPHQL_SCHEMA_URL || 'http://localhost:4000';
exports.GRAPHQL_CLIENT_CREDENTIALS =
  process.env.GRAPHQL_CLIENT_CREDENTIALS || '';
exports.CI_URL = process.env.CI_URL || '';
exports.JENKINS_BASE_URL = process.env.JENKINS_BASE_URL || '';
exports.JENKINS_JOB_FOLDER = process.env.JENKINS_JOB_FOLDER || '';
exports.JENKINS_JOB_NAME = process.env.JENKINS_JOB_NAME || '';
exports.JENKINS_JOB_TOKEN = process.env.JENKINS_JOB_TOKEN || '';
exports.ARTIFACTORY_URL = process.env.ARTIFACTORY_URL || '';
exports.ARTIFACT_REPO = process.env.ARTIFACT_REPO || '';
