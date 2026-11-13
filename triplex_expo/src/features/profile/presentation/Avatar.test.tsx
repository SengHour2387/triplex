import { render, screen } from '@testing-library/react-native';

import { Avatar } from './Avatar';

describe('Avatar', () => {
  it('shows no upload UI when idle', async () => {
    await render(<Avatar user={{ avatar_url: null }} />);
    expect(screen.queryByRole('progressbar')).toBeNull();
  });

  it('while uploading: a progressbar with the percentage', async () => {
    await render(<Avatar user={{ avatar_url: null }} uploadProgress={42} />);
    const bar = screen.getByRole('progressbar');
    expect(bar.props.accessibilityValue).toMatchObject({ min: 0, max: 100, now: 42 });
    expect(screen.getByText('42%')).toBeTruthy();
  });

  it('while preparing (0 %) there is no misleading "0%" label', async () => {
    await render(<Avatar user={{ avatar_url: null }} uploadProgress={0} />);
    expect(screen.getByRole('progressbar')).toBeTruthy();
    expect(screen.queryByText('0%')).toBeNull();
  });
});
