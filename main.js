import { processMetadata } from "./src/processing.js";

import { getPathValueFromObject } from "./src/common.js";

const _metadata = {
  fields: {
    taxType: {
      readonly: false,
      required: false,
      hidden: false,
      breakLine: false,
      size: "sm",
    },
    documentType: {
      readonly: false,
      required: false,
      hidden: false,
      breakLine: false,
      size: "sm",
    },
    adress: {
      readonly: false,
      required: false,
      hidden: false,
      breakLine: false,
      size: "sm",
    },
    propertyType: {
      readonly: false,
      required: false,
      hidden: false,
      breakLine: false,
      size: "sm",
    },
    cityIdentification: {
      readonly: false,
      required: false,
      hidden: false,
      breakLine: false,
      size: "sm",
    },
  },
};

const _object = {
  taxType: "iptu",
  documentType: "cpf",
  adress: {
    cep: "36000-000",
    street: "",
  },
  propertyType: "urban",
  cityIdentification: "",
};

///////////////////////////////////////////////////////////////

const metadataTransform = {
  taxType: {
    _is: null,
    hidden: true,
    required: false,
  },
  documentType: {
    _valueOf: "adress",
    _isNot: null,
    hidden: true,
    required: false,
  },
  adress: {
    _if: (obj) => isValidCep(obj.cep),
    readonly: true,
    size: "lg",
  },
  // Aplica todas que forem verdadeiras, em ordem
  propertyType: [
    {
      _valueOf: "taxType",
      _is: null,
      hidden: true,
    },
    {
      _valueOf: "taxType",
      _in: ["iptu", "itbi"],
      readonly: true,
    },
  ],
  // Compara dois a dois
  cityIdentification: {
    _valueOfs: ["propertyType", "documentType"],
    _are: ["urban", "cpf"],
    hidden: false,
    required: true,
  },
};

processMetadata(metadataTransform, _metadata, _object);

///////////////////////////////////////////////////////////////

console.log("\n\n\n");
console.log(_metadata);
console.log("\n\n\n");

const fieldValue = {
  _match: {
    campo1: "valor1",
    campo2: "valor2",
    _not: {
      campo3: null,
      campo4: null,
    },
  },
  _apply: {
    behavior: "omitted",
  },
};

const metadataTransform = {

  // Todas as configurações
  "campo1": {

    _apply: {
      readonly: true,
      required: true,
      hidden: true,
      breakLine: true,
      size: "md",
      valueOptions: [],
      query: {},
    }
  },

  // Behavior
  "campo2": {

    _apply: {
      behavior: "omitted",
      size: "md",
      valueOptions: [],
      query: {},
    }
  },

  // matches compostos, dificulmente será necessário tudo
  // sempre começa com _match? 
  // Limita a só ter um na raíz?
  // Fazer exemplos mais práticos e curtos, pra passar a sensação da coisa
  // match é SEMPRE na raíz, pra dentro ele sempre fica implícito
  // Sempre é um "all" as múltiplas chaves
  "campo2": {

    _match: { 

      "campo0": null,
        
      _some: {
        "campo1": "cnpj",

        _not: {
          "campo4": null,
        }
      }
    },

    _apply: {
      // ...
    }
  },

  // Draft
  "campo2": {
    
    _match: {
      _changed: "campo0",
      _anyChanged: ["campo0", "campo3"],
      "campo1": "cpf",
    },

    _setValue: "novoValor do campo"
  },

  // Múltiplos casos
  "campo2": [
    {
      _match: {
        _changed: "campo0",
        _anyChanged: ["campo0", "campo3"],
        "campo1": "cpf",
      },
      
      _setValue: "valor 1"
    },
    {
      _match: {
        _changed: "campo4",
      },
      
      _setValue: "valor 2"
    },
  ],
};

const fieldChange = {
  _matchAll: {
    _changed: ["campo1, campo2"],

    _matchChange: {
      campo1: {
        from: "valor1",
      },

      campo2: {
        to: "valor2",
      },

      // Não dá pra negar valor, mas não precisa
      campo3: {
        from: "valor1",
        to: "valor2",
      },

      campo2: "valor2",

      _not: {
        campo3: null,
        campo4: null,
      },
    },
  },

  _apply: {
    behavior: "omitted",
  },
};

///////////////////////////////////////////////////////////////

if (!_object.taxType) {
  _metadata.fields.taxType.hidden = true;
  _metadata.fields.taxType.required = true;
}

if (_object.adress.cep) {
  _metadata.fields.documentType.hidden = true;
  _metadata.fields.documentType.required = true;
}

if (isValidCep(_object.cep)) {
  _metadata.fields.adress.readonly = true;
  _metadata.fields.adress.size = "lg";
}

if (!_object.taxType) {
  _metadata.fields.documentType.hidden = true;
}

if (["iptu", "itbi"].includes(_object.taxType)) {
  _metadata.fields.documentType.hidden = true;
}

if (_object.propertyType === "urban" && _object.documentType === "cpf") {
  _metadata.fields.cityIdentification.hidden = false;
  _metadata.fields.cityIdentification.required = true;
}

///////////////////////////////////////////////////////////////

function isValidCep() {
  return true;
}
