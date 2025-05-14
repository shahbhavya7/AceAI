import { Controller, Control, FieldValues, Path } from "react-hook-form";
// FormField is a component which is used to create a form field and manage its state
import {
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

// interface is a TypeScript feature which is used to define the shape of an object i.e. the properties and their types
interface FormFieldProps<T extends FieldValues> { // FormFieldProps is a generic interface which takes a type parameter T which extends FieldValues 
  control: Control<T>; // Control is a type from react-hook-form which is used to control the form state and manage its validation , it is used to pass the control object to the form field
  name: Path<T>; // Path is a type from react-hook-form which is used to get the path of the form field ,it is used to get the name of the form field
  label: string; // label is a string which is used to display the label of the form field
  placeholder?: string; // placeholder is a string which is used to display the placeholder of the form field
  type?: "text" | "email" | "password";
}

const FormField = <T extends FieldValues>({ // FormField is a generic component which takes a type parameter T which extends FieldValues
  control,
  name,
  label,
  placeholder,
  type = "text",
}: FormFieldProps<T>) => { // FormField is a functional component which takes the props defined in the FormFieldProps interface
  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel className="label">{label}</FormLabel>
          <FormControl>
            <Input
              className="input"
              type={type}
              placeholder={placeholder}
              {...field}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default FormField;
