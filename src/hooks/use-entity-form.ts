import { useState } from "react";
import type { z } from "zod";
import { validate } from "@/lib/validations";

export function useEntityForm<TForm>(
  schema: z.ZodType<TForm>,
  defaultForm: TForm,
) {
  const [formData, setFormData] = useState<TForm>(defaultForm);
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof TForm, string>>>({});

  const resetForm = () => {
    setFormData(defaultForm);
    setFieldErrors({});
  };

  const validateForm = (): boolean => {
    const errors = validate(schema, formData);
    if (errors) {
      setFieldErrors(errors);
      return false;
    }
    setFieldErrors({});
    return true;
  };

  return {
    formData,
    setFormData,
    fieldErrors,
    setFieldErrors,
    resetForm,
    validateForm,
  };
}
