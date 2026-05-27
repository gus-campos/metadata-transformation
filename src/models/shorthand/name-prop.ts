import { isPlainObject } from "../../utils/is-plain-object";
import { NameProp } from "../pure/metadata-transform";

export type ShorthandNameProp = NameProp | string;

function toNameProp(shorthandNameProp: ShorthandNameProp): NameProp {
  if (isPlainObject(shorthandNameProp)) return shorthandNameProp;
  return { pt: shorthandNameProp, _current: shorthandNameProp };
}
