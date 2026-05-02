export const example = {
  myInstallmentPlanWas: {
    field: "taxType",
    equal: "installment",
    hidden: false,
    required: true,
  },

  propertyType: {
    rule: (obj) =>
      ["iptu", "itbi"].includes(obj.taxType) &&
      obj.myInstallmentPlanWas === "property",
    hidden: false,
    required: true,
  },

  otherTaxes: {
    rule: (object) => object.taxType === "otherTaxes",
    hidden: false,
    required: true,
  },

  realEstateRegistry: {
    field: "propertyType",
    equal: "urban",
    hidden: false,
    required: true,
  },

  registrationNumber: {
    field: "propertyType",
    equal: "rural",
    hidden: false,
    required: true,
  },

  propertyTypeReadOnlyFromInstallment: {
    field: "myInstallmentPlanWas",
    equal: "property",
    readonly: true,
  },

  propertyTitleAttachment: {
    rule: (obj) =>
      ["iptu", "itbi"].includes(obj.taxType) && obj.propertyType !== null,
    hidden: false,
  },

  accountBankData: {
    field: "requestReason",
    equal: "duplicatedPayment",
    hidden: false,
    required: true,
  },

  secondPaymentReceipt: {
    field: "requestReason",
    equal: "unrecordedPayment",
    hidden: false,
    required: true,
  },

  propertyTypeReadOnlyFromIptu: {
    field: "taxType",
    equal: "iptu",
    readonly: true,
  },

  debtNature: {
    field: "taxType",
    equal: "installment",
    hidden: false,
    required: true,
  },

  propertyTypeLayout: {
    field: "myInstallmentPlanWas",
    equal: "property",
    breakLine: true,
    size: "md",
  },

  realEstateRegistryLayout: {
    field: "myInstallmentPlanWas",
    equal: "property",
    size: "md",
  },

  documentNature: {
    field: "taxType",
    oneOf: ["iss", "movableTaxes"],
    hidden: false,
    required: true,
  },

  cpf: {
    field: "documentNature",
    equal: "cpf",
    hidden: false,
    required: true,
  },

  cnpj: {
    field: "documentNature",
    equal: "cnpj",
    hidden: false,
    required: true,
  },

  fineAttachment: {
    field: "taxType",
    equal: "fines",
    hidden: false,
  },

  fineIdentificationNumber: {
    field: "taxType",
    equal: "fines",
    hidden: false,
  },

  optionalAttachment: {
    field: "taxType",
    equal: "otherTaxes",
    hidden: false,
  },
};
