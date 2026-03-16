import { CONFIG } from 'src/config-global';

import { RaspberryView } from 'src/sections/raspberry/view/raspberry-view';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <title>{`Raspberry - ${CONFIG.appName}`}</title>

      <RaspberryView />
    </>
  );
}