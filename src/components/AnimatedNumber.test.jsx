import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import AnimatedNumber from './AnimatedNumber.jsx';

describe('AnimatedNumber', () => {
  it('renders the value at the requested precision', () => {
    render(<AnimatedNumber value={3.17} decimals={1} />);
    expect(screen.getByText('3.2')).toBeInTheDocument();
  });

  it('keeps the animated digits out of the accessibility tree', () => {
    const { container } = render(<AnimatedNumber value={12.95} decimals={0} />);
    const [animated, readable] = container.querySelectorAll('span > span');
    expect(animated).toHaveAttribute('aria-hidden', 'true');
    expect(readable).toHaveClass('sr-only');
    expect(readable).toHaveTextContent('13');
  });
});
