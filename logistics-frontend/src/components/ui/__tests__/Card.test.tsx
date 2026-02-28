import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Card, CardHeader, StatCard } from '../Card';

describe('Card', () => {
  it('renders children', () => {
    render(<Card>Card content</Card>);
    expect(screen.getByText('Card content')).toBeInTheDocument();
  });

  it('applies geist-card class by default', () => {
    const { container } = render(<Card>Content</Card>);
    expect(container.firstChild).toHaveClass('geist-card');
  });

  it('applies interactive class when interactive prop is set', () => {
    const { container } = render(<Card interactive>Content</Card>);
    expect(container.firstChild).toHaveClass('geist-card-interactive');
  });

  it('applies flat class when flat prop is set', () => {
    const { container } = render(<Card flat>Content</Card>);
    expect(container.firstChild).toHaveClass('geist-card-flat');
  });

  it('handles click events', () => {
    const onClick = jest.fn();
    render(<Card onClick={onClick}>Clickable</Card>);
    fireEvent.click(screen.getByText('Clickable'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('has button role when clickable', () => {
    const onClick = jest.fn();
    render(<Card onClick={onClick}>Clickable</Card>);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('supports keyboard navigation when clickable', () => {
    const onClick = jest.fn();
    render(<Card onClick={onClick}>Clickable</Card>);
    const card = screen.getByRole('button');
    fireEvent.keyDown(card, { key: 'Enter' });
    expect(onClick).toHaveBeenCalledTimes(1);
    fireEvent.keyDown(card, { key: ' ' });
    expect(onClick).toHaveBeenCalledTimes(2);
  });

  it('has tabIndex when clickable', () => {
    const onClick = jest.fn();
    render(<Card onClick={onClick}>Clickable</Card>);
    expect(screen.getByRole('button')).toHaveAttribute('tabindex', '0');
  });

  it('applies custom className', () => {
    const { container } = render(<Card className="custom-class">Content</Card>);
    expect(container.firstChild).toHaveClass('custom-class');
  });
});

describe('CardHeader', () => {
  it('renders title', () => {
    render(<CardHeader title="Test Title" />);
    expect(screen.getByText('Test Title')).toBeInTheDocument();
  });

  it('renders description', () => {
    render(<CardHeader title="Title" description="Description text" />);
    expect(screen.getByText('Description text')).toBeInTheDocument();
  });

  it('renders subtitle as description', () => {
    render(<CardHeader title="Title" subtitle="Subtitle text" />);
    expect(screen.getByText('Subtitle text')).toBeInTheDocument();
  });

  it('renders action slot', () => {
    render(<CardHeader title="Title" action={<button>Action</button>} />);
    expect(screen.getByRole('button', { name: 'Action' })).toBeInTheDocument();
  });

  it('renders children when provided', () => {
    render(<CardHeader><span>Custom header</span></CardHeader>);
    expect(screen.getByText('Custom header')).toBeInTheDocument();
  });
});

describe('StatCard', () => {
  it('renders title and value', () => {
    render(<StatCard title="Revenue" value="$12,345" />);
    expect(screen.getByText('Revenue')).toBeInTheDocument();
    expect(screen.getByText('$12,345')).toBeInTheDocument();
  });

  it('renders numeric value', () => {
    render(<StatCard title="Orders" value={42} />);
    expect(screen.getByText('42')).toBeInTheDocument();
  });

  it('renders change indicator', () => {
    render(<StatCard title="Revenue" value="$1,000" change="+12%" changeType="positive" />);
    expect(screen.getByText('+12%')).toBeInTheDocument();
  });

  it('shows loading skeleton', () => {
    const { container } = render(<StatCard title="Revenue" value="$1,000" loading />);
    expect(container.querySelectorAll('.skeleton-geist').length).toBeGreaterThan(0);
  });

  it('does not show value when loading', () => {
    render(<StatCard title="Revenue" value="$1,000" loading />);
    expect(screen.queryByText('$1,000')).not.toBeInTheDocument();
  });
});
