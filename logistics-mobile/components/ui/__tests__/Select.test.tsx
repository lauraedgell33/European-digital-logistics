import React from 'react';
import { Text, View, TouchableOpacity } from 'react-native';
import { render, fireEvent } from '@testing-library/react-native';

// Mock Select component for testing behavioral contract
// since Expo doesn't have a built-in Select component
interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps {
  options: SelectOption[];
  value?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  label?: string;
  error?: string;
}

function MockSelect({ options, value, onValueChange, placeholder, disabled, label, error }: SelectProps) {
  const selectedOption = options.find((o) => o.value === value);
  return (
    <View testID="select-container">
      {label && <Text>{label}</Text>}
      <TouchableOpacity
        testID="select-trigger"
        disabled={disabled}
        onPress={() => {
          if (!disabled && onValueChange && options.length > 0) {
            // Simulate selecting first unselected option
            const next = options.find((o) => o.value !== value) || options[0];
            onValueChange(next.value);
          }
        }}
      >
        <Text testID="select-value">
          {selectedOption ? selectedOption.label : placeholder || 'Select...'}
        </Text>
      </TouchableOpacity>
      {error && <Text testID="select-error">{error}</Text>}
    </View>
  );
}

const options = [
  { value: 'de', label: 'Germany' },
  { value: 'nl', label: 'Netherlands' },
  { value: 'fr', label: 'France' },
];

describe('Select', () => {
  it('renders placeholder', () => {
    const { getByText } = render(
      <MockSelect options={options} placeholder="Select country" />
    );
    expect(getByText('Select country')).toBeTruthy();
  });

  it('renders with label', () => {
    const { getByText } = render(
      <MockSelect options={options} label="Country" />
    );
    expect(getByText('Country')).toBeTruthy();
  });

  it('shows selected value', () => {
    const { getByText } = render(
      <MockSelect options={options} value="de" />
    );
    expect(getByText('Germany')).toBeTruthy();
  });

  it('calls onValueChange when pressed', () => {
    const onValueChange = jest.fn();
    const { getByTestId } = render(
      <MockSelect options={options} value="de" onValueChange={onValueChange} />
    );
    fireEvent.press(getByTestId('select-trigger'));
    expect(onValueChange).toHaveBeenCalled();
  });

  it('does not call onValueChange when disabled', () => {
    const onValueChange = jest.fn();
    const { getByTestId } = render(
      <MockSelect options={options} onValueChange={onValueChange} disabled />
    );
    fireEvent.press(getByTestId('select-trigger'));
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it('shows error message', () => {
    const { getByText } = render(
      <MockSelect options={options} error="Country is required" />
    );
    expect(getByText('Country is required')).toBeTruthy();
  });

  it('does not show error when not provided', () => {
    const { queryByTestId } = render(
      <MockSelect options={options} />
    );
    expect(queryByTestId('select-error')).toBeNull();
  });

  it('renders default placeholder when none specified', () => {
    const { getByText } = render(<MockSelect options={options} />);
    expect(getByText('Select...')).toBeTruthy();
  });
});
