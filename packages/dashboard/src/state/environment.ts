export interface Environment {
  GRAPHQL_CLIENT_CREDENTIALS: string;
  GRAPHQL_SCHEMA_URL: string;
  CI_URL: string;
  JENKINS_BASE_URL: string;
  JENKINS_JOB_FOLDER: string;
  JENKINS_JOB_NAME: string;
}

export const environment: Environment = {
  ...{
    GRAPHQL_CLIENT_CREDENTIALS: '',
    GRAPHQL_SCHEMA_URL: 'http://localhost:4000',
    CI_URL: '',
    JENKINS_BASE_URL: '',
    JENKINS_JOB_FOLDER: '',
    JENKINS_JOB_NAME: '',
  },
  ...((window.__sorryCypressEnvironment as Environment) || {}),
};
