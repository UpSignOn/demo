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

export const definitions = {
  raoul: {
    config: {
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

    button1: {
      name: 'RAOUL1',
      config: {
        fields: raoulFields,
        forceFormDisplay: false,
        generalConfigVersion: CONFIG_VERSION,
      },
    },
    button2: {
      name: 'RAOUL2',
      config: {
        fields: raoulFields,
        forceFormDisplay: true,
        generalConfigVersion: CONFIG_VERSION,
        disableAccountCreation: true,
      },
    },
  },
  monptitshop: {
    config: {
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
    button1: {
      name: 'SHOP1',
      config: {
        fields: monptitShopFields,
        forceFormDisplay: false,
        generalConfigVersion: CONFIG_VERSION,
      },
    },
    button2: {
      name: 'SHOP2',
      config: {
        fields: monptitShopFields,
        forceFormDisplay: true,
        generalConfigVersion: CONFIG_VERSION,
        disableAccountCreation: true,
      },
    },
  },
  mapaye: {
    config: {
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

    button1: {
      name: 'MAPAYE1',
      config: {
        fields: maPayeFields,
        forceFormDisplay: false,
        generalConfigVersion: CONFIG_VERSION,
      },
    },
    button2: {
      name: 'MAPAYE2',
      config: {
        fields: maPayeFields,
        forceFormDisplay: true,
        generalConfigVersion: CONFIG_VERSION,
        disableAccountCreation: true,
      },
    },
  },
};
