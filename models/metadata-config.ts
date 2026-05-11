// Behavior

export type Behavior = {
  behavior: "omitted" | "mandatory" | "editable" | "displayed";
};
export type BehaviorProps = {
  readonly?: boolean;
  required?: boolean;
  hidden?: boolean;
};
export type BehaviorConfig = Behavior | BehaviorProps;

// Layout

export type LayoutConfig = {
  breakLine?: boolean;
  size?: "sm" | "md" | "lg";
};

// Selection

export type SelectOption = { value: string; identifier: string };
export type SelectOptions = { options?: SelectOption[] };
export type SelectQuery = { query?: unknown };
export type SelectionConfig = SelectOptions & SelectQuery;

// Field

export type MetadataProps = Required<BehaviorProps & LayoutConfig & SelectionConfig>;
export type MetadataConfig = BehaviorConfig & LayoutConfig & SelectionConfig;
