import React, { useState } from 'react';
import {
  AccessCheckout,
  CardDetails,
  CVC,
  CvcOnlyValidationConfig,
  CvcOnlyValidationEventListener,
  Sessions,
  useCvcOnlyValidation,
} from '../../../access-checkout-react-native-sdk/src';
import CvcField from '../common/CvcField';
import HView from '../common/HView';
import Spinner from '../common/Spinner';
import SubmitButton from '../common/SubmitButton';
import VView from '../common/VView';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import styles from '../card-flow/style.js';
import { Text } from 'react-native';
import SessionLabel from '../common/SessionLabel';
import CvcOnlyFlowE2eStates from '../cvc-flow/CvcOnlyFlow.e2e.states';
import ErrorView from '../common/ErrorView';

export default function CvcFlow() {
  const [cvcValue, setCvc] = useState<string>('');
  const [cvcIsValid, setCvcIsValid] = useState<boolean>(false);

  const [submitBtnEnabled, setSubmitBtnEnabled] = useState<boolean>(false);
  const [showSpinner, setShowSpinner] = useState<boolean>(false);
  const [isEditable, setIsEditable] = useState<boolean>(true);

  const [cvcSession, setCvcSession] = useState('');

  const [error, setError] = useState<Error>();
  
  const accessCheckout = new AccessCheckout({
    baseUrl: 'https://npe.access.worldpay.com',
    merchantId: 'identity',
  });

  const cvcOnlyValidationConfig = new CvcOnlyValidationConfig({
    cvcId: 'cvcInput',
  });

  const cvcOnlyValidationEventListener: CvcOnlyValidationEventListener = {
    onCvcValidChanged(isValid: boolean): void {
      setCvcIsValid(isValid);
      if (!isValid) {
        setSubmitBtnEnabled(false);
      }
    },

    onValidationSuccess() {
      setSubmitBtnEnabled(true);
    },
  };

  const { initialiseCvcOnlyValidation } = useCvcOnlyValidation(
    accessCheckout,
    cvcOnlyValidationConfig,
    cvcOnlyValidationEventListener
  );

  const onLayout = () => {
    initialiseCvcOnlyValidation()
      .then(() => {
        console.info('Cvc Only Validation successfully initialised');
      })
      .catch((e) => {
        setError(e);
      });
  };

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
        console.info('Successfully generated session(s)');

        if (sessions.cvc) {
          setCvcSession(sessions.cvc);
        }
      })
      .catch((e) => {
        setError(e);
      })
      .finally(() => {
        setShowSpinner(false);
        setIsEditable(true);
        setSubmitBtnEnabled(true);
      });
  }

  let cvcSessionComponent;
  let errorComponent;

  if (cvcSession) {
    cvcSessionComponent = (
      <SessionLabel
        testID="cvcSession"
        label="Cvc session:"
        session={cvcSession}
      />
    );
  }

  if (error) {
    errorComponent = <ErrorView error={error} />;
  }
  
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  return (
    <VView style={styles.cardFlow} onLayout={onLayout}>
      <Spinner testID="spinner" show={showSpinner} />
      {errorComponent}
      <HView>
        <CvcField
          testID="cvcInput"
          isEditable={isEditable}
          isValid={cvcIsValid}
          onChange={setCvc}
        />
      </HView>
      <VView style={{ marginTop: '8%' }}>
        <SubmitButton
          testID="submitButton"
          onPress={generateSession}
          enabled={submitBtnEnabled}
        />
      </VView>
      <VView style={{ marginTop: '8%', marginLeft: '4%' }}>
        <Text style={{ fontWeight: 'bold' }}>Sessions</Text>
        {cvcSessionComponent}
      </VView>
      <CvcOnlyFlowE2eStates
        testID="cvcOnlyFlowE2eStates"
        cvcIsValid={cvcIsValid}
        submitButtonEnabled={submitBtnEnabled}
      />
    </VView>
  );
}
