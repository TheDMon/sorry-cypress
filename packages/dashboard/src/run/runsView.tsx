import {
  AddToQueueTwoTone,
  Bolt as BoltIcon,
  Compress as CompressIcon,
  HourglassDisabled,
  Loop as LoopIcon,
} from '@mui/icons-material';
import {
  AlertModal,
  AlertType,
  Toolbar,
} from '@sorry-cypress/dashboard/components';
import {
  getProjectPath,
  NavItemType,
  setNav,
} from '@sorry-cypress/dashboard/lib/navigation';
import React, {
  FunctionComponent,
  useEffect,
  useLayoutEffect,
  useState,
} from 'react';
import { useParams } from 'react-router-dom';
import { useAutoRefresh } from '../hooks';
import { RunsFeed } from './runsFeed/runsFeed';

export const RunsView: RunsViewComponent = () => {
  const { projectId } = useParams();

  const [search, setSearch] = useState('');
  const [showActions, setShowActions] = useState(false);
  const [compactView, setCompactView] = useState(false);
  const [shouldAutoRefresh, setShouldAutoRefresh] = useAutoRefresh();
  const [enableRun, setEnableRun] = useState(true);
  const [shouldShowModal, setShowModal] = React.useState(false);
  const [alertTitle, setAlertTitle] = React.useState('');
  const [alertMessage, setAlertMessage] = React.useState('');
  const [alertType, setAlertType] = React.useState(AlertType.Success);

  const getJenkinsBuildStatus = () => {
    fetch('/jenkins/buildStatus')
      .then((response) => response.json())
      .then((result) => {
        if (result.body.toLowerCase() === 'in progress') {
          setEnableRun(false);
        } else {
          setEnableRun(true);
        }
      });
  };

  useEffect(() => {
    getJenkinsBuildStatus();
    const pollJenkins = setInterval(getJenkinsBuildStatus, 20000);

    return () => {
      clearInterval(pollJenkins);
    };
  }, []);

  useLayoutEffect(() => {
    setNav([
      {
        type: NavItemType.project,
        label: projectId,
        link: getProjectPath(projectId),
      },
      {
        type: NavItemType.latestRuns,
        label: 'Latest runs',
      },
    ]);
  }, []);

  const jobQueueHandler = () => {
    if (enableRun) {
      fetch('/jenkins/run').then((response) => {
        if (response.status === 500) {
          setAlertTitle('Something went wrong');
          setAlertMessage(
            `Unable to queue a Job. Please ensure the job is setup to be triggered remotely.`
          );
          setAlertType(AlertType.Error);
          setShowModal(true);
        } else {
          setEnableRun(false);
          setAlertTitle('Job Queued');
          setAlertMessage(`Test execution job has been queued successfully! 
                            Please wait a while for it to appear on the dashboard. 
                            Hit 'Auto Refresh' on to see live updates.`);
          setAlertType(AlertType.Success);
          setShowModal(true);
        }
      });
    } else {
      setAlertTitle('Please wait');
      setAlertMessage(
        'A test execution job is already in progress. Please wait until it is finished.'
      );
      setAlertType(AlertType.Information);
      setShowModal(true);
    }
  };

  return (
    <>
      <Toolbar
        actions={[
          {
            key: 'queueRun',
            text: enableRun ? 'Queue A Run' : 'Please wait',
            icon: enableRun ? AddToQueueTwoTone : HourglassDisabled,
            primary: enableRun,
            selected: enableRun,
            toggleButton: true,
            onClick: () => {
              return jobQueueHandler();
            },
          },
          {
            key: 'showActions',
            text: 'Show actions',
            icon: BoltIcon,
            selected: showActions,
            toggleButton: true,
            onClick: () => {
              setShowActions(!showActions);
            },
          },
          {
            key: 'compactView',
            text: 'Compact view',
            showInMenuBreakpoint: ['xs'],
            icon: CompressIcon,
            toggleButton: true,
            selected: compactView,
            onClick: () => {
              setCompactView(!compactView);
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
        searchPlaceholder="Enter run build id"
        onSearch={setSearch}
      />
      <RunsFeed
        projectId={projectId!}
        search={search}
        showActions={showActions}
        compact={compactView}
      />
      <AlertModal
        open={shouldShowModal}
        title={alertTitle}
        message={alertMessage}
        type={alertType}
        onClose={() => {
          setShowModal(false);
        }}
      />
    </>
  );
};

type RunsViewProps = {
  // nothing
};
type RunsViewComponent = FunctionComponent<RunsViewProps>;
