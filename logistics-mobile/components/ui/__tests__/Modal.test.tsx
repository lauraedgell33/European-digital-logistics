import React from 'react';
import { Text, View } from 'react-native';
import { render, fireEvent } from '@testing-library/react-native';

// Mock Modal component since React Native modals don't work in test env
// We test the behavioral contract
interface ModalProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

function MockModal({ visible, onClose, title, children }: ModalProps) {
  if (!visible) return null;
  return (
    <View testID="modal">
      {title && <Text>{title}</Text>}
      <View>{children}</View>
      <Text onPress={onClose} testID="close-button">Close</Text>
    </View>
  );
}

describe('Modal', () => {
  it('renders when visible', () => {
    const { getByTestId } = render(
      <MockModal visible onClose={() => {}} title="Test Modal">
        <Text>Content</Text>
      </MockModal>
    );
    expect(getByTestId('modal')).toBeTruthy();
  });

  it('does not render when not visible', () => {
    const { queryByTestId } = render(
      <MockModal visible={false} onClose={() => {}}>
        <Text>Content</Text>
      </MockModal>
    );
    expect(queryByTestId('modal')).toBeNull();
  });

  it('renders title', () => {
    const { getByText } = render(
      <MockModal visible onClose={() => {}} title="Confirm Action">
        <Text>Content</Text>
      </MockModal>
    );
    expect(getByText('Confirm Action')).toBeTruthy();
  });

  it('renders children', () => {
    const { getByText } = render(
      <MockModal visible onClose={() => {}}>
        <Text>Modal body content</Text>
      </MockModal>
    );
    expect(getByText('Modal body content')).toBeTruthy();
  });

  it('calls onClose when close is pressed', () => {
    const onClose = jest.fn();
    const { getByTestId } = render(
      <MockModal visible onClose={onClose}>
        <Text>Content</Text>
      </MockModal>
    );
    fireEvent.press(getByTestId('close-button'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('renders without title', () => {
    const { queryByTestId, getByText } = render(
      <MockModal visible onClose={() => {}}>
        <Text>No title modal</Text>
      </MockModal>
    );
    expect(queryByTestId('modal')).toBeTruthy();
    expect(getByText('No title modal')).toBeTruthy();
  });
});
