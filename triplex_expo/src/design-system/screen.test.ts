import { scrollPadding } from './Screen';

const insets = { top: 53, bottom: 24 };

describe('scrollPadding', () => {
  it('iOS gets NOTHING — UIKit insets the scroll view itself, and extra padding double-counts', () => {
    expect(scrollPadding('ios', insets, true)).toEqual({ top: 0, bottom: 0 });
    expect(scrollPadding('ios', insets, false)).toEqual({ top: 0, bottom: 0 });
    expect(scrollPadding('ios', insets, false, 90)).toEqual({ top: 0, bottom: 0 });
  });

  it('Android without a header: clear the status bar and the gesture bar', () => {
    expect(scrollPadding('android', insets, false)).toEqual({ top: 53, bottom: 24 });
  });

  it('Android under the drawn header: the header is in the layout flow and already clears the status bar', () => {
    expect(scrollPadding('android', insets, true)).toEqual({ top: 0, bottom: 24 });
  });

  it('Android inside tabs: clear the whole floating tab bar (it already includes the gesture bar)', () => {
    expect(scrollPadding('android', insets, true, 96)).toEqual({ top: 0, bottom: 96 });
  });
});
