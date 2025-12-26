export interface Country {
  code: string;
  name: string;
  flag: string;
  dialCode: string;
}

export interface PhoneNumber {
  id: string;
  number: string;
  countryCode: string;
  available: boolean;
}

export interface VerificationCode {
  id: string;
  service: string;
  code: string;
  timestamp: Date;
  expired: boolean;
}
