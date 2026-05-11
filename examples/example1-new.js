
export const transform = {
  otherTaxes: {
    _field: "taxType",
    _is: "otherTaxes",
    hidden: false,
    required: true,
  },

  optionalAttachment: {
    _field: "taxType",
    _is: "otherTaxes",
    hidden: false,
  },

  myInstallmentPlanWas: {
    _field: "taxType",
    _is: "installment",
    hidden: false,
    required: true,
  },

  debtNature: {
    _field: "taxType",
    _is: "installment",
    hidden: false,
    required: true,
  },

  propertyType: [
    {
      _if: (obj) =>
        ["iptu", "itbi"].includes(obj.taxType) ||
        obj.myInstallmentPlanWas === "property",
      hidden: false,
      required: true,
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
      readonly: true,
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
      hidden: false,
      required: true,
    },
  ],

  registrationNumber: {
    _field: "propertyType",
    _is: "rural",
    hidden: false,
    required: true,
  },

  propertyTitleAttachment: {
    _if: (obj) => ["iptu", "itbi"].includes(obj.taxType) && obj.propertyType,
    hidden: false,
  },
  secondPaymentReceipt: {
    _field: "requestReason",
    _is: "duplicatedPayment",
    hidden: false,
    required: true,
  },

  accountBankData: {
    _field: "requestReason",
    _is: "duplicatedPayment",
    hidden: false,
    required: true,
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
};
