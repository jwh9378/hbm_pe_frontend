import { CONFIG } from 'src/config-global';

import { RaspberryDashboardView } from 'src/sections/raspberry/view/ate-dashboard-view';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <title>{`RaspberryPi ATE Dashboard - ${CONFIG.appName}`}</title>
      <RaspberryDashboardView />
    </>
  );
}