declare namespace google.payments.api {
  interface PaymentData {
    apiVersion: number;
    apiVersionMinor: number;
    paymentMethodData: {
      type: string;
      description: string;
      info: {
        cardNetwork: string;
        cardDetails: string;
      };
      tokenizationData: {
        type: string;
        token: string;
      };
    };
  }
}