declare type BridgeSessions = {
    card: string;
    cvc: string;
};
declare type AccessCheckoutReactNativeType = {
    generateSessions(config: any): Promise<BridgeSessions>;
    initialiseCardValidation(config: any): Promise<boolean>;
    initialiseCvcOnlyValidation(config: any): Promise<boolean>;
    addListener: (eventType: string) => void;
    removeListeners: (count: number) => void;
};
export declare const AccessCheckoutReactNative: any;
declare const _default: AccessCheckoutReactNativeType;
export default _default;
