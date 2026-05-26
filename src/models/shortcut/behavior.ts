import { Apply } from "../pure/metadata-transform";

const BEHAVIOR_DEFINITION = {
    omitted: { hidden: true, required: false, readOnly: false },
    mandatory: { hidden: false, required: true, readOnly: false },
    editable: { hidden: false, required: false, readOnly: false },
    displayed: { hidden: false, required: false, readOnly: true },
};

type Behavior = {
    behavior: "omitted" | "displayed" | "mandatory" | "editable";
};

type BehaviorApply = Apply & {
    behavior?: Behavior;
}

// Se encontrar, subtituir