import { useEffect, useState } from 'react';
import { Keyboard, Platform } from 'react-native';

/**
 * How far the software keyboard covers the bottom of the screen (0 when it is down), for lifting the composer.
 *
 * Why not `KeyboardAvoidingView`: inside a native form sheet it measured the sheet *before* the sheet grew to
 * full height for the keyboard, and left the composer underneath it (found on iOS 26.5). The sheet's bottom
 * edge is the screen's once it has grown, so the keyboard's own height is the right padding. Android resizes
 * the window itself (`adjustResize`), so there is nothing to add there (unverified — Android is out of scope for Task 8).
 */
export function useKeyboardHeight(): number {
  const [height, setHeight] = useState(0);
  useEffect(() => {
    if (Platform.OS !== 'ios') return undefined;
    const frame = Keyboard.addListener('keyboardWillChangeFrame', (event) => setHeight(event.endCoordinates.height));
    const hide = Keyboard.addListener('keyboardWillHide', () => setHeight(0));
    return () => {
      frame.remove();
      hide.remove();
    };
  }, []);
  return height;
}
