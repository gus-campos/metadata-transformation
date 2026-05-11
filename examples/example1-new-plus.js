
export const transform = {
  
  otherTaxes: {
    _field: "taxType",
    _is: "otherTaxes",
    behavior: "mandatory",
  },

  optionalAttachment: {
    _field: "taxType",
    _is: "otherTaxes",
    behavior: "displayed",
  },

  myInstallmentPlanWas: {
    _field: "taxType",
    _is: "installment",
    behavior: "mandatory",
  },

  debtNature: {
    _field: "taxType",
    _is: "installment",
    behavior: "mandatory",
  },

  propertyType: [
    {
      _if: (obj) =>
        ["iptu", "itbi"].includes(obj.taxType) ||
        obj.myInstallmentPlanWas === "property",
      required: true
    },
    {
      _if: (obj) =>
        obj.taxType === "installment" &&
        obj.myInstallmentPlanWas === "property",
      breakLine: true,
      size: "md",
    },
    {
      _if: (obj) =>
        obj.myInstallmentPlanWas === "property" || obj.taxType === "iptu",
      readonly: true
    },
  ],

  realEstateRegistry: [
    {
      _if: (obj) =>
        obj.taxType === "installment" &&
        obj.myInstallmentPlanWas === "property",
      size: "md",
    },
    {
      _field: "propertyType",
      _is: "urban",
      behavior: "mandatory",
    },
  ],

  registrationNumber: {
    _field: "propertyType",
    _is: "rural",
    behavior: "mandatory",
  },

  propertyTitleAttachment: {
    _if: (obj) => ["iptu", "itbi"].includes(obj.taxType) && obj.propertyType,
    behavior: "displayed",
  },

  secondPaymentReceipt: {
    _field: "requestReason",
    _is: "duplicatedPayment",
    behavior: "mandatory",
  },

  accountBankData: {
    _field: "requestReason",
    _is: "duplicatedPayment",
    behavior: "mandatory",
  },

  documentNature: {
    _field: "taxType",
    _isIn: ["iss", "movableTaxes"],
    behavior: "mandatory",
  },

  cpf: {
    _field: "documentNature",
    _is: "cpf",
    behavior: "mandatory",
  },

  cnpj: {
    _field: "documentNature",
    _is: "cnpj",
    behavior: "mandatory",
  },

  fineAttachment: {
    _field: "taxType",
    _is: "fines",
    behavior: "displayed",
  },

  fineIdentificationNumber: {
    _field: "taxType",
    _is: "fines",
    behavior: "displayed",
  },
};