export interface OptionPickerOption<T extends string> {
  value: T;
  label: string;
}

export interface OptionPickerProps<T extends string> {
  /** Accessible name of the whole control ("Theme"). */
  label: string;
  value: T;
  options: readonly OptionPickerOption<T>[];
  onChange: (value: T) => void;
}
