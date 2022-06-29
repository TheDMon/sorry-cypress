import {
  CloudDownloadRounded,
  Launch,
  Loop as LoopIcon,
  VisibilityOff as VisibilityOffIcon,
} from '@mui/icons-material';
import { Alert, Grid, Skeleton, Typography } from '@mui/material';
import { Toolbar } from '@sorry-cypress/dashboard/components';
import {
  GetRunQuery,
  useGetRunQuery,
} from '@sorry-cypress/dashboard/generated/graphql';
import { useHideSuccessfulSpecs } from '@sorry-cypress/dashboard/hooks';
import {
  useAutoRefresh,
  useAutoRefreshRate,
} from '@sorry-cypress/dashboard/hooks/useAutoRefresh';
import {
  getProjectPath,
  getRunPath,
  NavItemType,
  setNav,
} from '@sorry-cypress/dashboard/lib/navigation';
import { RunSummary } from '@sorry-cypress/dashboard/run/runSummary/runSummary';
import { environment } from '@sorry-cypress/dashboard/state/environment';
import React, {
  FunctionComponent,
  useEffect,
  useLayoutEffect,
  useState,
} from 'react';
import { useParams } from 'react-router-dom';
import { RunDetails } from './runDetails';

export const RunDetailsView: RunDetailsViewComponent = () => {
  const { id } = useParams();
  const autoRefreshRate = useAutoRefreshRate();
  const [hidePassedSpecs, setHidePassedSpecs] = useHideSuccessfulSpecs();
  const [shouldAutoRefresh, setShouldAutoRefresh] = useAutoRefresh();
  const [reportName, setReportName] = useState('');

  const { loading, error, data } = useGetRunQuery({
    variables: { runId: id! },
    pollInterval: autoRefreshRate,
  });

  updateNav(data);

  const checkReport = (data?: GetRunQuery) => {
    if (!data) {
      return;
    }

    const ciBuildId = data?.run?.meta.ciBuildId.replace('#', '%23');
    fetch(`/artifactrepo/reportname?ciBuildId=${ciBuildId}`)
      .then((response) => response.json())
      .then((result) => {
        if (result.data === 'FOLDER NOT FOUND') {
          setReportName('');
        } else {
          setReportName(result.data);
        }
      });
  };

  useEffect(() => {
    checkReport(data);
  }, [data]);

  const downloadReportHanlder = (data: GetRunQuery) => {
    const ciBuildId = data?.run?.meta.ciBuildId.replace('#', '%23');
    fetch(
      `/artifactrepo/download?ciBuildId=${ciBuildId}&reportName=${reportName}`
    )
      .then((response) => response.json())
      .then((result) => {
        const blob = new Blob([result.body], {
          type: 'text/html',
        });

        const mynavigator: any = navigator;
        if (mynavigator.msSaveBlob) {
          mynavigator.msSaveBlob(blob, reportName);
        } else {
          const link = document.createElement('a');
          const url = URL.createObjectURL(blob);
          link.setAttribute('href', url);
          link.setAttribute('download', reportName);
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }
      })
      .catch((err) => {
        console.log(err);
        alert('something went wrong!');
      });
  };

  if (loading)
    return (
      <>
        <Grid container justifyContent="right" spacing={1}>
          <Grid item>
            <Skeleton
              variant="rectangular"
              height={37}
              width={100}
              sx={{ mb: 2 }}
              animation="wave"
            />
          </Grid>
          <Grid item>
            <Skeleton
              variant="rectangular"
              height={37}
              width={100}
              sx={{ mb: 2 }}
              animation="wave"
            />
          </Grid>
          <Grid item>
            <Skeleton
              variant="rectangular"
              height={37}
              width={100}
              sx={{ mb: 2 }}
              animation="wave"
            />
          </Grid>
          <Grid item>
            <Skeleton
              variant="rectangular"
              height={37}
              width={100}
              sx={{ mb: 2 }}
              animation="wave"
            />
          </Grid>
        </Grid>
        <Skeleton variant="rectangular" height={240} animation="wave" />
        <Skeleton
          variant="text"
          height={32}
          width={100}
          sx={{ my: 5 }}
          animation="wave"
        />
        <Skeleton variant="rectangular" height={400} animation="wave" />
      </>
    );

  if (error)
    return (
      <Alert severity="error" variant="filled">
        {error.toString()}
      </Alert>
    );

  if (!data)
    return (
      <Alert severity="info" variant="filled">
        No data
      </Alert>
    );

  if (!data.run) {
    return (
      <Alert severity="error" variant="filled">
        Non-existing run
      </Alert>
    );
  }

  return (
    <>
      <Toolbar
        actions={[
          {
            key: 'download',
            text: 'Download',
            icon: CloudDownloadRounded,
            toggleButton: true,
            onClick: () => {
              if (reportName !== '') {
                return downloadReportHanlder(data);
              } else {
                alert(
                  'Report is not yet available for download. Please visit later.'
                );
              }
            },
          },
          {
            key: 'openRunLog',
            text: 'Open Jenkins Logs',
            icon: Launch,
            toggleButton: true,
            onClick: () => {
              const ciBuildId = data.run?.meta.ciBuildId;
              const jenkinsRunId = ciBuildId?.substring(
                ciBuildId?.indexOf('#') + 1,
                ciBuildId.length
              );
              let url = `${environment.JENKINS_BASE_URL}/blue/organizations/jenkins/${environment.JENKINS_JOB_FOLDER}%2F${environment.JENKINS_JOB_NAME}/detail/${environment.JENKINS_JOB_NAME}/${jenkinsRunId}/pipeline/`;
              url = url.replace(/ /g, '%20');
              window.open(url, '_blank');
            },
          },
          {
            key: 'hidePassedSpecs',
            text: 'Hide Successful Specs',
            icon: VisibilityOffIcon,
            selected: hidePassedSpecs,
            toggleButton: true,
            onClick: () => {
              setHidePassedSpecs(!hidePassedSpecs);
            },
          },
          {
            key: 'autoRefresh',
            text: 'Auto Refresh',
            icon: LoopIcon,
            toggleButton: true,
            selected: !!shouldAutoRefresh,
            onClick: () => {
              setShouldAutoRefresh(!shouldAutoRefresh);
              window.location.reload();
            },
          },
        ]}
      />
      <RunSummary run={data.run} />
      <Typography
        component="h1"
        variant="h6"
        color="text.primary"
        sx={{ mt: 5, mb: 2 }}
      >
        Spec Files
      </Typography>
      <RunDetails run={data.run} hidePassedSpecs={hidePassedSpecs} />
    </>
  );
};

const updateNav = (data?: GetRunQuery) =>
  useLayoutEffect(() => {
    if (!data?.run) {
      setNav([]);
      return;
    }

    setNav([
      {
        type: NavItemType.project,
        label: data.run.meta.projectId,
        link: getProjectPath(data.run.meta.projectId),
      },
      {
        type: NavItemType.latestRuns,
        label: 'Runs',
        link: getProjectPath(data.run.meta.projectId),
      },
      {
        type: NavItemType.run,
        label: data.run.meta.ciBuildId,
        link: getRunPath(data.run.runId),
      },
    ]);
  }, [data]);

type RunDetailsViewProps = {
  // nothing yet
};
type RunDetailsViewComponent = FunctionComponent<RunDetailsViewProps>;
