import { CONFIG } from 'src/config-global';

import { RaspberryView } from 'src/sections/raspberry/view/led-test-view';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <title>{`RaspberryPi LED Test - ${CONFIG.appName}`}</title>

      <RaspberryView />
    </>
  );
}