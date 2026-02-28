import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Badge, StatusBadge } from '../Badge';

describe('Badge', () => {
  it('renders children text', () => {
    render(<Badge>Active</Badge>);
    expect(screen.getByText('Active')).toBeInTheDocument();
  });

  it('applies default gray variant', () => {
    const { container } = render(<Badge>Default</Badge>);
    expect(container.firstChild).toHaveClass('badge-geist-gray');
  });

  it('applies specified variant', () => {
    const { container, rerender } = render(<Badge variant="blue">Blue</Badge>);
    expect(container.firstChild).toHaveClass('badge-geist-blue');

    rerender(<Badge variant="green">Green</Badge>);
    expect(container.firstChild).toHaveClass('badge-geist-green');

    rerender(<Badge variant="red">Red</Badge>);
    expect(container.firstChild).toHaveClass('badge-geist-red');

    rerender(<Badge variant="amber">Amber</Badge>);
    expect(container.firstChild).toHaveClass('badge-geist-amber');

    rerender(<Badge variant="purple">Purple</Badge>);
    expect(container.firstChild).toHaveClass('badge-geist-purple');
  });

  it('applies base badge-geist class', () => {
    const { container } = render(<Badge>Test</Badge>);
    expect(container.firstChild).toHaveClass('badge-geist');
  });

  it('applies custom className', () => {
    const { container } = render(<Badge className="ml-2">Custom</Badge>);
    expect(container.firstChild).toHaveClass('ml-2');
  });
});

describe('StatusBadge', () => {
  it('renders formatted status label', () => {
    render(<StatusBadge status="in_transit" />);
    expect(screen.getByText('In Transit')).toBeInTheDocument();
  });

  it('maps active status to green variant', () => {
    const { container } = render(<StatusBadge status="active" />);
    expect(container.firstChild).toHaveClass('badge-geist-green');
  });

  it('maps pending status to amber variant', () => {
    const { container } = render(<StatusBadge status="pending" />);
    expect(container.firstChild).toHaveClass('badge-geist-amber');
  });

  it('maps cancelled status to red variant', () => {
    const { container } = render(<StatusBadge status="cancelled" />);
    expect(container.firstChild).toHaveClass('badge-geist-red');
  });

  it('maps in_transit status to blue variant', () => {
    const { container } = render(<StatusBadge status="in_transit" />);
    expect(container.firstChild).toHaveClass('badge-geist-blue');
  });

  it('falls back to gray for unknown status', () => {
    const { container } = render(<StatusBadge status="unknown_status" />);
    expect(container.firstChild).toHaveClass('badge-geist-gray');
  });

  it('renders status dot', () => {
    const { container } = render(<StatusBadge status="active" />);
    const dot = container.querySelector('.rounded-full');
    expect(dot).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(<StatusBadge status="active" className="extra" />);
    expect(container.firstChild).toHaveClass('extra');
  });

  it('formats multi-word statuses', () => {
    render(<StatusBadge status="waiting_pickup" />);
    expect(screen.getByText('Waiting Pickup')).toBeInTheDocument();
  });
});
