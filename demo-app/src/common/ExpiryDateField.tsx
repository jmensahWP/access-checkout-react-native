import React from 'react';

import type UIComponentProps from './UIComponentProps';
import AccessCheckoutTextInput from '../../../access-checkout-react-native-sdk/src/ui/AccessCheckoutTextInput';
import { StyleSheet } from 'react-native';

interface ExpiryDateFieldProps extends UIComponentProps {
  isEditable: boolean;
  isValid: boolean;
}

const styles = StyleSheet.create({
  expiry: {
    flex: 1,
    flexDirection: 'row',
    margin: 12,
    borderWidth: 1,
    borderRadius: 5,
    height: 40,
    paddingHorizontal: 10,
  },
});

const ExpiryDateField = (props: ExpiryDateFieldProps) => {
  const validationColours = props.isValid ? 'green' : 'red';
  const validationColourStyle = props.isEditable ? validationColours : 'silver';

  return (
    <AccessCheckoutTextInput
      nativeID="expiryDateInput"
      testID={props.testID}
      editable={props.isEditable}
      placeholder="MM/YY"
      style={[
        styles.expiry,
        {
          color: validationColourStyle,
          borderColor: validationColourStyle,
        },
      ]}
    />
  );
};

export default ExpiryDateField;
