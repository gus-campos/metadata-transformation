const metadata = {
  id: {
    readonly: true,
    size: "sm",
  },
  name: {
    _field: "hasName",
    _is: true,
    required: true,
    size: "md",
  },
  nickname: {
    _field: "hasNickname",
    _isNot: true,
    hidden: true,
  },
  country: {
    _field: "region",
    _isIn: ["LATAM", "EU"],
    required: true,
  },
  passport: {
    _field: "country",
    _isNotIn: ["BR"],
    required: true,
  },
  fullName: {
    _fields: ["firstName", "lastName"],
    _are: ["", ""],
    hidden: true,
  },
  warning: {
    _fields: ["statusA", "statusB", "statusC"],
    _someIs: "error",
    breakLine: true,
  },
  discount: {
    _if: (obj) => obj.total > 500 && obj.customerType === "vip",
    required: true,
  },

  document: [
    {
      _field: "country",
      _is: "BR",
      required: true,
      size: "lg",
    },
    {
      _field: "country",
      _isNot: "BR",
      hidden: true,
    },
  ],

  contact: [
    {
      _field: "contactPreference",
      _is: "email",
      required: true,
    },
    {
      _field: "contactPreference",
      _is: "phone",
      required: true,
    },
    {
      _field: "contactPreference",
      _isNotIn: ["email", "phone"],
      hidden: true,
    },
  ],

  address: [
    {
      _fields: ["street", "city", "zip"],
      _are: ["", "", ""],
      hidden: true,
    },
    {
      _fields: ["street", "city", "zip"],
      _someIs: "",
      required: true,
    },
  ],

  approval: [
    {
      _if: (obj) => obj.amount > 1000,
      required: true,
    },
    {
      _if: (obj) => obj.amount <= 1000,
      hidden: true,
    },
  ],
  notes: {
    size: "lg",
    breakLine: true,
  },
  complexField: {
    _if: (obj) => isReady(obj),
    required: true,
    size: "lg",
  },
};

function isReady(obj) {
  const validStatus = ["approved", "pending"].includes(obj.status);
  const highValue = obj.total > 1000;
  return validStatus && highValue;
}
