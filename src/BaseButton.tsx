import React, { ReactNode, Ref, useCallback } from 'react';
import { TouchableOpacity, Text, View, ViewStyle, TextStyle } from 'react-native';
import type { GestureResponderEvent } from 'react-native';

export interface CustomBaseButtonProps<AsType> {
  /** Provide a React element or component to render as the underlying button. Note: for accessibility compliance, almost always you should use a `button` element, or a component that renders an underlying button. */
  as?: AsType;
  /** Any ReactNode elements. */
  children: ReactNode;
  /** Press event handler. Default behaviour triggers unless prevented */
  onPress?: (event?: GestureResponderEvent) => void | boolean;
  /** A default `onPress` behavior */
  defaultOnPress?: (event?: GestureResponderEvent) => void | boolean;
  /** A `ref` to the underlying button */
  buttonRef?: Ref<any>;
  /** Button disabled state */
  disabled?: boolean;
  /** Button style */
  style?: ViewStyle;
  /** Text style for children if they are text */
  textStyle?: TextStyle;
}

export type BaseButtonProps<AsType extends React.ComponentType<any> = typeof TouchableOpacity> =
  CustomBaseButtonProps<AsType> & {
    [key: string]: any;
  };

export function BaseButton<AsType extends React.ComponentType<any> = typeof TouchableOpacity>({
  as,
  onPress,
  defaultOnPress,
  children,
  buttonRef,
  disabled = false,
  style,
  textStyle,
  ...passthroughProps
}: BaseButtonProps<AsType>): React.ReactElement {

  const handleOnPress = useCallback(
    (event?: GestureResponderEvent) => {
      if (onPress) {
        const pressShouldContinue = onPress(event);
        if (typeof pressShouldContinue === 'boolean' && pressShouldContinue === false) {
          return;
        }
      }

      defaultOnPress?.(event);
    },
    [defaultOnPress, onPress],
  );

  const Component = as || TouchableOpacity;

  const defaultStyle: ViewStyle = {
    backgroundColor: disabled ? '#ccc' : '#007AFF',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
    opacity: disabled ? 0.6 : 1,
  };

  const defaultTextStyle: TextStyle = {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  };

  // Handle different component types
  if (Component === TouchableOpacity || !as) {
    return (
      <TouchableOpacity
        ref={buttonRef}
        onPress={handleOnPress}
        disabled={disabled}
        style={[defaultStyle, style]}
        accessibilityRole="button"
        {...passthroughProps}
      >
        {typeof children === 'string' ? (
          <Text style={[defaultTextStyle, textStyle]}>{children}</Text>
        ) : (
          children
        )}
      </TouchableOpacity>
    );
  }

  // For custom components
  return (
    <Component
      ref={buttonRef}
      onPress={handleOnPress}
      disabled={disabled}
      style={[defaultStyle, style]}
      {...passthroughProps}
    >
      {children}
    </Component>
  );
}