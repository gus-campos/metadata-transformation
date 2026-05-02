export const example = {
  myInstallmentPlanWas: {
    _field: "taxType",
    _is: "installment",
    hidden: false,
    required: true,
  },

  propertyType: {
    _if: (obj) =>
      ["iptu", "itbi"].includes(obj.taxType) &&
      obj.myInstallmentPlanWas === "property",
    hidden: false,
    required: true,
  },

  otherTaxes: {
    _if: (object) => object.taxType === "otherTaxes",
    hidden: false,
    required: true,
  },

  realEstateRegistry: {
    _field: "propertyType",
    _is: "urban",
    hidden: false,
    required: true,
  },

  registrationNumber: {
    _field: "propertyType",
    _is: "rural",
    hidden: false,
    required: true,
  },

  propertyTypeReadOnlyFromInstallment: {
    _field: "myInstallmentPlanWas",
    _is: "property",
    readonly: true,
  },

  propertyTitleAttachment: {
    _if: (obj) =>
      ["iptu", "itbi"].includes(obj.taxType) && obj.propertyType !== null,
    hidden: false,
  },

  accountBankData: {
    _field: "requestReason",
    _is: "duplicatedPayment",
    hidden: false,
    required: true,
  },

  secondPaymentReceipt: {
    _field: "requestReason",
    _is: "unrecordedPayment",
    hidden: false,
    required: true,
  },

  propertyTypeReadOnlyFromIptu: {
    _field: "taxType",
    _is: "iptu",
    readonly: true,
  },

  debtNature: {
    _field: "taxType",
    _is: "installment",
    hidden: false,
    required: true,
  },

  propertyTypeLayout: {
    _field: "myInstallmentPlanWas",
    _is: "property",
    breakLine: true,
    size: "md",
  },

  realEstateRegistryLayout: {
    _field: "myInstallmentPlanWas",
    _is: "property",
    size: "md",
  },

  documentNature: {
    _field: "taxType",
    _isIn: ["iss", "movableTaxes"],
    hidden: false,
    required: true,
  },

  cpf: {
    _field: "documentNature",
    _is: "cpf",
    hidden: false,
    required: true,
  },

  cnpj: {
    _field: "documentNature",
    _is: "cnpj",
    hidden: false,
    required: true,
  },

  fineAttachment: {
    _field: "taxType",
    _is: "fines",
    hidden: false,
  },

  fineIdentificationNumber: {
    _field: "taxType",
    _is: "fines",
    hidden: false,
  },

  optionalAttachment: {
    _field: "taxType",
    _is: "otherTaxes",
    hidden: false,
  },
};
