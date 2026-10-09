export const policyVersion = '2026-10-10';
export const operatorName = process.env.NEXT_PUBLIC_OPERATOR_NAME?.trim() || 'อินทัช นิรมาณ (Inthat Niramarn)';
export const privacyEmail = process.env.NEXT_PUBLIC_PRIVACY_EMAIL?.trim() || 'first260549@gmail.com';
export const operatorCountry = process.env.NEXT_PUBLIC_OPERATOR_COUNTRY?.trim() || 'Thailand';
export const legalIdentityReady = Boolean(operatorName && privacyEmail && operatorCountry);
