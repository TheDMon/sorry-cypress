import {
  AddToQueueTwoTone,
  Bolt as BoltIcon,
  Compress as CompressIcon,
  HourglassDisabled,
  Loop as LoopIcon,
} from '@mui/icons-material';
import { Toolbar } from '@sorry-cypress/dashboard/components';
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
              if (enableRun) {
                fetch('/jenkins/run').then((response) => {
                  if (response.status === 500) {
                    alert('Something is not right');
                  } else {
                    window.alert(
                      'Test execution job has been queued successfully!'
                    );
                    setEnableRun(false);
                  }
                });
              } else {
                window.alert(
                  'A run is in progress, please wait until it finishes..'
                );
              }
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
    </>
  );
};

type RunsViewProps = {
  // nothing
};
type RunsViewComponent = FunctionComponent<RunsViewProps>;
