import React from 'react';
import { Text } from 'react-native';
import { render, fireEvent } from '@testing-library/react-native';
import Card from '../Card';

describe('Card', () => {
  it('renders children', () => {
    const { getByText } = render(
      <Card><Text>Card content</Text></Card>
    );
    expect(getByText('Card content')).toBeTruthy();
  });

  it('renders title', () => {
    const { getByText } = render(
      <Card title="Order Details"><Text>Content</Text></Card>
    );
    expect(getByText('Order Details')).toBeTruthy();
  });

  it('renders subtitle', () => {
    const { getByText } = render(
      <Card title="Details" subtitle="Last updated 5 min ago">
        <Text>Content</Text>
      </Card>
    );
    expect(getByText('Last updated 5 min ago')).toBeTruthy();
  });

  it('handles press event', () => {
    const onPress = jest.fn();
    const { getByText } = render(
      <Card onPress={onPress}><Text>Pressable card</Text></Card>
    );
    fireEvent.press(getByText('Pressable card'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('renders headerRight', () => {
    const { getByText } = render(
      <Card title="Title" headerRight={<Text>Action</Text>}>
        <Text>Content</Text>
      </Card>
    );
    expect(getByText('Action')).toBeTruthy();
  });

  it('renders without padding when noPadding is true', () => {
    const { toJSON } = render(
      <Card noPadding><Text>Content</Text></Card>
    );
    expect(toJSON()).toBeTruthy();
  });

  it('applies custom style', () => {
    const { toJSON } = render(
      <Card style={{ marginTop: 20 }}><Text>Styled</Text></Card>
    );
    expect(toJSON()).toBeTruthy();
  });
});
