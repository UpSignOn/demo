const CONFIG_VERSION = '2';

const monptitShopFields = [
  { type: 'firstname', key: 'firstname', mandatory: true },
  { type: 'lastname', key: 'lastname', mandatory: true },
  { type: 'title', key: 'title', mandatory: false },
  { type: 'dateOfBirth', key: 'dateOfBirth', mandatory: false },
  { type: 'email', key: 'email1', mandatory: true },
  { type: 'email', key: 'email2', mandatory: false },
  { type: 'phoneNumber', key: 'phoneNumber', mandatory: true },
  { type: 'postalAddress', key: 'deliveryAddress', mandatory: true },
  { type: 'postalAddress', key: 'billingAddress', mandatory: false },
  { type: 'iban', key: 'iban', mandatory: false },
  { type: 'newsletterConsent', key: 'newsletterConsent', mandatory: false },
];
const raoulFields = [
  { type: 'firstname', key: 'firstname', mandatory: true },
  { type: 'lastname', key: 'lastname', mandatory: true },
  { type: 'email', key: 'email1', mandatory: true },
  { type: 'phoneNumber', key: 'phoneNumber', mandatory: true },
  { type: 'postalAddress', key: 'deliveryAddress', mandatory: true },
];
const maPayeFields = [{ type: 'email', key: 'email', mandatory: true }];

export const buttonConfigs = {
  RAOUL1: {
    fields: raoulFields,
    forceFormDisplay: false,
    generalConfigVersion: CONFIG_VERSION,
  },
  RAOUL2: {
    fields: raoulFields,
    forceFormDisplay: true,
    generalConfigVersion: CONFIG_VERSION,
    disableAccountCreation: true,
  },
  SHOP1: {
    fields: monptitShopFields,
    forceFormDisplay: false,
    generalConfigVersion: CONFIG_VERSION,
  },
  SHOP2: {
    fields: monptitShopFields,
    forceFormDisplay: true,
    generalConfigVersion: CONFIG_VERSION,
    disableAccountCreation: true,
  },
  MAPAYE1: {
    fields: maPayeFields,
    forceFormDisplay: false,
    generalConfigVersion: CONFIG_VERSION,
  },
  MAPAYE2: {
    fields: maPayeFields,
    forceFormDisplay: true,
    generalConfigVersion: CONFIG_VERSION,
    disableAccountCreation: true,
  },
};
export const configs = {
  raoul: {
    version: CONFIG_VERSION,
    legalTerms: [],
    fields: [
      { type: 'firstname', key: 'firstname', mandatory: true },
      { type: 'lastname', key: 'lastname', mandatory: true },
      {
        type: 'email',
        key: 'email1',
        mandatory: true,
        variant: 'custom',
        customLabel: 'Email perso',
      },
      { type: 'phoneNumber', key: 'phoneNumber', mandatory: true },
      {
        type: 'postalAddress',
        key: 'deliveryAddress',
        mandatory: true,
        variant: 'custom',
        customLabel: 'Delivery address',
      },
    ],
  },

  monptitshop: {
    version: CONFIG_VERSION,
    legalTerms: [
      {
        id: '1',
        date: '2020-01-01',
        link: 'https://upsignon.eu/terms-of-service/fr/20200209.pdf',
        translatedText: 'CGU',
      },
    ],
    fields: [
      { type: 'firstname', key: 'firstname', mandatory: true },
      { type: 'lastname', key: 'lastname', mandatory: true },
      { type: 'title', key: 'title', mandatory: false },
      { type: 'dateOfBirth', key: 'dateOfBirth', mandatory: false },
      {
        type: 'email',
        key: 'email1',
        mandatory: true,
        variant: 'custom',
        customLabel: 'Email perso',
      },
      {
        type: 'email',
        key: 'email2',
        mandatory: false,
        variant: 'custom',
        customLabel: 'Email pro',
      },
      { type: 'phoneNumber', key: 'phoneNumber', mandatory: true },
      {
        type: 'postalAddress',
        key: 'deliveryAddress',
        mandatory: true,
        variant: 'custom',
        customLabel: 'Delivery address',
        maxSize: 3,
      },
      {
        type: 'postalAddress',
        key: 'billingAddress',
        mandatory: false,
        variant: 'custom',
        customLabel: 'Billing address',
        maxSize: 1,
      },
      { type: 'iban', key: 'iban', mandatory: false },
      { type: 'newsletterConsent', key: 'newsletterConsent', mandatory: false },
    ],
  },

  mapaye: {
    version: CONFIG_VERSION,
    legalTerms: [],
    fields: [
      {
        type: 'email',
        key: 'email',
        mandatory: true,
        variant: 'custom',
        customLabel: 'Email pro',
      },
    ],
  },
};
