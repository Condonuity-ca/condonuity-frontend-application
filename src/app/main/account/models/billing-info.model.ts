export class BillingInfo {
    billingDetails:{
        street:string;
        city:string;
        province:string;
        postalCode:string;
    };
    paymentDetails:{
        cardName:string;
        cardNumber:string;
        expiryDate:string;
        securityCode:string;
    };
}
