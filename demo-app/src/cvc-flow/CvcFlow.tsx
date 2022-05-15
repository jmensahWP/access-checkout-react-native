import React, { useState } from 'react';
import {
  AccessCheckout,
  CardDetails,
  CVC,
  Sessions,
} from '../../../access-checkout-react-native-sdk/src';
import CvcField from '../common/CvcField';
import HView from '../common/HView';
import Spinner from '../common/Spinner';
import SubmitButton from '../common/SubmitButton';
import VView from '../common/VView';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import styles from '../card-flow/style.js';
import { Alert, Text } from 'react-native';
import SessionLabel from '../common/SessionLabel';

export default function CvcFlow() {
  const [cvcValue, setCvc] = useState<string>('');

  const [showSpinner, setShowSpinner] = useState<boolean>(false);
  const [isEditable, setIsEditable] = useState<boolean>(true);

  const [cvcSession, setCvcSession] = useState('');

  const accessCheckout = new AccessCheckout({
    baseUrl: 'https://npe.access.worldpay.com',
    merchantId: 'identity',
  });

  function generateSession() {
    const sessionTypes = [CVC];

    setShowSpinner(true);
    setIsEditable(false);

    const cardDetails: CardDetails = {
      cvc: cvcValue,
    };

    accessCheckout
      .generateSessions(cardDetails, sessionTypes)
      .then((sessions: Sessions) => {
        console.info(`Successfully generated session(s)`);

        if (sessions.cvc) {
          setCvcSession(sessions.cvc);
        }
      })
      .catch((reason) => {
        Alert.alert('Error', `${reason}`, [{ text: 'OK' }]);
      })
      .finally(() => {
        setShowSpinner(false);
        setIsEditable(true);
      });
  }

  let cvcSessionComponent;

  if (cvcSession) {
    cvcSessionComponent = (
      <SessionLabel
        testID="cvcSession"
        label="Cvc session:"
        session={cvcSession}
      />
    );
  }

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  return (
    <VView style={styles.cardFlow}>
      <Spinner testID="spinner" show={showSpinner} />
      <HView>
        <CvcField
          testID="cvcInput"
          isEditable={isEditable}
          isValid={true}
          onChange={setCvc}
        />
      </HView>
      <VView style={{ marginTop: '8%' }}>
        <SubmitButton
          testID="submitButton"
          onPress={generateSession}
          enabled={true}
        />
      </VView>
      <VView style={{ marginTop: '8%', marginLeft: '4%' }}>
        <Text style={{ fontWeight: 'bold' }}>Sessions</Text>
        {cvcSessionComponent}
      </VView>
    </VView>
  );
}