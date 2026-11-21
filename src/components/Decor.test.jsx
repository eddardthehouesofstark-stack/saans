import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import Atmosphere from './Atmosphere';
import Grain from './Grain';
import Particulates from './Particulates';
import Skyline from './Skyline';

describe('decorative layers', () => {
  it('renders the skyline and particles as aria-hidden decoration', () => {
    const { container } = render(
      <>
        <Skyline />
        <Particulates />
      </>
    );
    expect(container.querySelectorAll('svg').length).toBeGreaterThanOrEqual(3);
    for (const layer of container.children) {
      expect(layer).toHaveAttribute('aria-hidden', 'true');
    }
  });

  it('renders the atmosphere, which thins with savings', () => {
    const { container, rerender } = render(<Atmosphere clearing={0} />);
    expect(container.firstChild).toHaveClass('fixed');
    rerender(<Atmosphere clearing={1} />);
    expect(container.firstChild).toHaveAttribute('aria-hidden', 'true');
  });

  it('overlays the grain texture', () => {
    const { container } = render(<Grain />);
    expect(container.firstChild).toBeInTheDocument();
  });
});
