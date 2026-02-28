import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Select } from '../Select';

const options = [
  { value: 'de', label: 'Germany' },
  { value: 'nl', label: 'Netherlands' },
  { value: 'fr', label: 'France' },
];

describe('Select', () => {
  it('renders a select element', () => {
    render(<Select options={options} />);
    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });

  it('renders with label', () => {
    render(<Select label="Country" options={options} />);
    expect(screen.getByLabelText('Country')).toBeInTheDocument();
  });

  it('renders options', () => {
    render(<Select options={options} />);
    expect(screen.getByText('Germany')).toBeInTheDocument();
    expect(screen.getByText('Netherlands')).toBeInTheDocument();
    expect(screen.getByText('France')).toBeInTheDocument();
  });

  it('renders placeholder option', () => {
    render(<Select options={options} placeholder="Select a country" />);
    expect(screen.getByText('Select a country')).toBeInTheDocument();
  });

  it('handles selection change', () => {
    const onChange = jest.fn();
    render(<Select options={options} onChange={onChange} />);
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'nl' } });
    expect(onChange).toHaveBeenCalled();
  });

  it('is disabled when disabled prop is set', () => {
    render(<Select options={options} disabled />);
    expect(screen.getByRole('combobox')).toBeDisabled();
  });

  it('shows error message', () => {
    render(<Select options={options} error="Country is required" />);
    expect(screen.getByText('Country is required')).toBeInTheDocument();
  });

  it('applies error styling', () => {
    render(<Select options={options} error="Error" />);
    const select = screen.getByRole('combobox');
    expect(select).toHaveClass('shadow-[0_0_0_1px_var(--ds-red-700)]');
  });

  it('generates id from label', () => {
    render(<Select label="Shipping Country" options={options} />);
    const select = screen.getByLabelText('Shipping Country');
    expect(select).toHaveAttribute('id', 'shipping-country');
  });

  it('uses provided id over generated one', () => {
    render(<Select label="Country" id="custom-select" options={options} />);
    const select = screen.getByLabelText('Country');
    expect(select).toHaveAttribute('id', 'custom-select');
  });

  it('renders children instead of options', () => {
    render(
      <Select label="Choice">
        <option value="a">Option A</option>
        <option value="b">Option B</option>
      </Select>
    );
    expect(screen.getByText('Option A')).toBeInTheDocument();
    expect(screen.getByText('Option B')).toBeInTheDocument();
  });

  it('shows required indicator', () => {
    render(<Select label="Country" options={options} required />);
    expect(screen.getByText('*')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(<Select options={options} className="custom-select" />);
    const select = screen.getByRole('combobox');
    expect(select).toHaveClass('custom-select');
  });
});
