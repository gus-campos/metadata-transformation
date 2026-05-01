
export const metadataTransform = {
  myInstallmentPlanWas: {
    // field: "taxType",
    // equal: "installment",
    hidden: false,
    required: true,
  },
  propertyTypeReadOnlyFromInstallment: {
    field: "myInstallmentPlanWas",
    equal: "property",
    readonly: true,
  },
  propertyTypeReadOnlyFromIptu: {
    field: "taxType",
    equal: "iptu",
    readonly: true,
  },
  realEstateRegistryLayout: {
    field: "myInstallmentPlanWas",
    equal: "property",
    size: "md",
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

// export const example: MetadataTransform = {
//   myInstallmentPlanWas: {
//     field: "taxType",
//     equal: "installment",
//     changes: { hidden: false, required: true },
//   },
//   propertyType: {
//     conditions: [
//       { field: "taxType", some: ["iptu", "itbi"] },
//       { field: "myInstallmentPlanWas", equal: "property" },
//     ],
//     changes: { hidden: false, required: true },
//   },
//   otherTaxes: {
//     predicate: (object) => object.taxType === "otherTaxes",
//     changes: { hidden: false, required: true },
//     equal: "qualquer coisa", /////////////////////////////////
//   },
//   realEstateRegistry: {
//     field: "propertyType",
//     equal: "urban",
//     changes: { hidden: false, required: true },
//   },
//   registrationNumber: {
//     field: "propertyType",
//     equal: "rural",
//     changes: { hidden: false, required: true },
//   },
//   propertyTypeReadOnlyFromInstallment: {
//     field: "myInstallmentPlanWas",
//     equal: "property",
//     readonly: true,
//   },
//   propertyTitleAttachment: {
//     conditions: [
//       { field: "taxType", some: ["iptu", "itbi"] },
//       { field: "propertyType", notEqual: null },
//     ],
//     hidden: false,
//   },
//   accountBankData: {
//     field: "requestReason",
//     equal: "duplicatedPayment",
//     changes: { hidden: false, required: true },
//   },
//   secondPaymentReceipt: {
//     field: "requestReason",
//     equal: "unrecordedPayment",
//     changes: { hidden: false, required: true },
//   },
//   propertyTypeReadOnlyFromIptu: {
//     field: "taxType",
//     equal: "iptu",
//     readonly: true,
//   },
//   debtNature: {
//     field: "taxType",
//     equal: "installment",
//     changes: { hidden: false, required: true },
//   },
//   propertyTypeLayout: {
//     field: "myInstallmentPlanWas",
//     equal: "property",
//     changes: { breakLine: true, size: "md" },
//   },
//   realEstateRegistryLayout: {
//     field: "myInstallmentPlanWas",
//     equal: "property",
//     size: "md",
//   },
//   documentNature: {
//     field: "taxType",
//     some: ["iss", "movableTaxes"],
//     changes: { hidden: false, required: true },
//   },
//   cpf: {
//     field: "documentNature",
//     equal: "cpf",
//     changes: { hidden: false, required: true },
//   },
//   cnpj: {
//     field: "documentNature",
//     equal: "cnpj",
//     changes: { hidden: false, required: true },
//   },
//   fineAttachment: {
//     field: "taxType",
//     equal: "fines",
//     hidden: false,
//   },
//   fineIdentificationNumber: {
//     field: "taxType",
//     equal: "fines",
//     hidden: false,
//   },
//   optionalAttachment: {
//     field: "taxType",
//     equal: "otherTaxes",
//     hidden: false,
//   },
// };
