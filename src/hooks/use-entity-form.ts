import { useState, useCallback } from "react";
import type { z } from "zod";
import { validate } from "@/lib/validations";

export function useEntityForm<TForm>(
  schema: z.ZodType<TForm>,
  defaultForm: TForm,
) {
  const [formData, setFormData] = useState<TForm>(defaultForm);
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof TForm, string>>>({});

  const resetForm = useCallback(() => {
    setFormData(defaultForm);
    setFieldErrors({});
  }, [defaultForm]);

  const validateForm = useCallback((data: TForm = formData): boolean => {
    const errors = validate(schema, data);
    if (errors) {
      setFieldErrors(errors);
      return false;
    }
    setFieldErrors({});
    return true;
  }, [schema, formData]);

  return {
    formData,
    setFormData,
    fieldErrors,
    setFieldErrors,
    resetForm,
    validateForm,
  };
}
