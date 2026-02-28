import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import Input from '../Input';

describe('Input', () => {
  it('renders with placeholder', () => {
    const { getByPlaceholderText } = render(
      <Input placeholder="Enter email" />
    );
    expect(getByPlaceholderText('Enter email')).toBeTruthy();
  });

  it('renders with label', () => {
    const { getByText } = render(
      <Input label="Email Address" placeholder="Enter email" />
    );
    expect(getByText('Email Address')).toBeTruthy();
  });

  it('handles text input', () => {
    const onChangeText = jest.fn();
    const { getByPlaceholderText } = render(
      <Input placeholder="Type here" onChangeText={onChangeText} />
    );
    fireEvent.changeText(getByPlaceholderText('Type here'), 'Hello');
    expect(onChangeText).toHaveBeenCalledWith('Hello');
  });

  it('shows error message', () => {
    const { getByText } = render(
      <Input error="This field is required" placeholder="Input" />
    );
    expect(getByText('This field is required')).toBeTruthy();
  });

  it('applies error border style', () => {
    const { toJSON } = render(
      <Input error="Error" placeholder="Input" />
    );
    expect(toJSON()).toBeTruthy();
  });

  it('renders without error text when no error', () => {
    const { queryByText } = render(
      <Input placeholder="Input" />
    );
    expect(queryByText('required')).toBeNull();
  });

  it('renders with left icon', () => {
    const { toJSON } = render(
      <Input leftIcon="search" placeholder="Search" />
    );
    expect(toJSON()).toBeTruthy();
  });

  it('renders with right icon', () => {
    const { toJSON } = render(
      <Input rightIcon={<></>} placeholder="Input" />
    );
    expect(toJSON()).toBeTruthy();
  });

  it('applies custom container style', () => {
    const { toJSON } = render(
      <Input containerStyle={{ marginTop: 10 }} placeholder="Styled" />
    );
    expect(toJSON()).toBeTruthy();
  });

  it('passes through TextInput props', () => {
    const { getByPlaceholderText } = render(
      <Input
        placeholder="Email"
        keyboardType="email-address"
        autoCapitalize="none"
      />
    );
    expect(getByPlaceholderText('Email')).toBeTruthy();
  });
});
