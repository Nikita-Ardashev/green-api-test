import { useId, type InputHTMLAttributes } from 'react';

type TextFieldProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'> & {
  label: string;
  value: string;
  onChange: (value: string) => void;
};

export function TextField({ label, value, onChange, ...inputProps }: TextFieldProps) {
  const id = useId();
  return (
    <div className="text-field">
      <input
        {...inputProps}
        id={id}
        className="text-field__input"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder=" "
        autoComplete="off"
        spellCheck={false}
      />
      <label className="text-field__label" htmlFor={id}>
        {label}
      </label>
    </div>
  );
}
