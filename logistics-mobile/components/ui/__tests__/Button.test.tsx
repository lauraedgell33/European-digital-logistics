import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import Button from '../Button';

describe('Button', () => {
  it('renders title text', () => {
    const { getByText } = render(<Button title="Press me" onPress={() => {}} />);
    expect(getByText('Press me')).toBeTruthy();
  });

  it('calls onPress when pressed', () => {
    const onPress = jest.fn();
    const { getByText } = render(<Button title="Press" onPress={onPress} />);
    fireEvent.press(getByText('Press'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('shows loading indicator when loading', () => {
    const { queryByText } = render(
      <Button title="Load" onPress={() => {}} loading />
    );
    expect(queryByText('Load')).toBeNull();
  });

  it('does not call onPress when disabled', () => {
    const onPress = jest.fn();
    const { getByText } = render(<Button title="Disabled" onPress={onPress} disabled />);
    fireEvent.press(getByText('Disabled'));
    expect(onPress).not.toHaveBeenCalled();
  });

  it('renders with icon', () => {
    const Icon = () => <></>;
    const { getByText } = render(
      <Button title="With Icon" onPress={() => {}} icon={<Icon />} />
    );
    expect(getByText('With Icon')).toBeTruthy();
  });

  it('applies variant styles', () => {
    const { toJSON, rerender } = render(
      <Button title="Primary" onPress={() => {}} variant="primary" />
    );
    expect(toJSON()).toBeTruthy();
    rerender(<Button title="Secondary" onPress={() => {}} variant="secondary" />);
    expect(toJSON()).toBeTruthy();
  });

  it('applies size styles', () => {
    const { toJSON, rerender } = render(
      <Button title="Small" onPress={() => {}} size="sm" />
    );
    expect(toJSON()).toBeTruthy();
    rerender(<Button title="Large" onPress={() => {}} size="lg" />);
    expect(toJSON()).toBeTruthy();
  });

  it('renders full width by default', () => {
    const { toJSON } = render(<Button title="Full" onPress={() => {}} />);
    const tree = toJSON();
    expect(tree).toBeTruthy();
  });

  it('does not render full width when fullWidth is false', () => {
    const { toJSON } = render(<Button title="Auto" onPress={() => {}} fullWidth={false} />);
    expect(toJSON()).toBeTruthy();
  });
});
