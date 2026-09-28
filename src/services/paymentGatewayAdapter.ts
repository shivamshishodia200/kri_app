/**
 * Payment Gateway Adapter (Razorpay / UPI / NetBanking)
 * 
 * Boundary interface for future Razorpay Checkout Integration.
 * NOTE: Production payments require server-side HMAC SHA256 signature verification 
 * and server-initiated Razorpay order generation (razorpay_order_id).
 */

export interface RazorpayOrderPayload {
  amountInPaise: number;
  currency: 'INR';
  receipt: string;
  notes?: Record<string, string>;
  customer: {
    name: string;
    email?: string;
    contact: string;
  };
}

export interface RazorpayOrderResponse {
  success: boolean;
  orderId?: string;
  amount?: number;
  currency?: string;
  keyId?: string;
  error?: string;
  isBackendConfigured: boolean;
}

export interface PaymentVerificationPayload {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

export interface PaymentVerificationResponse {
  verified: boolean;
  transactionId?: string;
  message: string;
}

export type PaymentFlowType =
  | 'CONTACT_UNLOCK'
  | 'SUBSCRIPTION_PLAN'
  | 'PAY_RENT'
  | 'PAY_BILLS'
  | 'SERVICE_BOOKING';

class PaymentGatewayAdapter {
  private isGatewayConfigured: boolean = false;

  /**
   * Status check for gateway integration
   */
  isConfigured(): boolean {
    return this.isGatewayConfigured;
  }

  /**
   * Initiate order request to secure backend
   */
  async createOrder(
    flowType: PaymentFlowType,
    payload: RazorpayOrderPayload,
  ): Promise<RazorpayOrderResponse> {
    // In production, this performs: POST /api/v1/payments/create-order
    if (!this.isGatewayConfigured) {
      return {
        success: false,
        isBackendConfigured: false,
        error:
          'Payment gateway (Razorpay) is pending backend setup. Test transactions cannot be completed in local demo mode.',
      };
    }

    return {
      success: true,
      orderId: `order_mock_${Date.now()}`,
      amount: payload.amountInPaise,
      currency: 'INR',
      keyId: 'rzp_test_placeholder',
      isBackendConfigured: true,
    };
  }

  /**
   * Verify signature with secure backend
   */
  async verifyPayment(
    payload: PaymentVerificationPayload,
  ): Promise<PaymentVerificationResponse> {
    // In production, this performs: POST /api/v1/payments/verify-signature
    if (!this.isGatewayConfigured) {
      return {
        verified: false,
        message: 'Backend payment verification endpoint is not connected.',
      };
    }

    return {
      verified: true,
      transactionId: `tx_${Date.now()}`,
      message: 'Payment verified successfully.',
    };
  }
}

export const paymentGateway = new PaymentGatewayAdapter();
