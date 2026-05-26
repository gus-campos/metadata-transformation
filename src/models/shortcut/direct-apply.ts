// Esperar um apply com array ou string invés de objeto
// se vier, primeiro colocar dentro de um array unitário se for o caso
// depois, mapear para props, se for boolean cria um chave com true
// se for behavior criar um chave behavior com o valor passado

import { Apply } from "../pure/metadata-transform";

type DirectApply =
  | Apply
  | {
      _apply?: string | string[];
    };
