import { findHostByTestId, pressHost, renderElement } from '@/test/render-element';

import { DeviceClockTamperPanel } from './device-clock-tamper-panel';

describe('DeviceClockTamperPanel', () => {
  it('lets the parent own reconnect', () => {
    const onReconnect = jest.fn();
    const tree = renderElement(<DeviceClockTamperPanel onReconnect={onReconnect} />);
    expect(findHostByTestId(tree, 'device-clock-tamper-panel')).toBeTruthy();
    expect(tree.root.findByProps({ children: 'Your device time changed' })).toBeTruthy();
    pressHost(findHostByTestId(tree, 'device-clock-reconnect-button'));
    expect(onReconnect).toHaveBeenCalledTimes(1);
  });
});
