import { DefaultValues, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { UseMutateFunction } from '@tanstack/react-query';
import { z } from 'zod';

export const useZodForm = <T extends z.ZodType>(
  schema: T,
  mutation: UseMutateFunction<any, Error, z.infer<T>, unknown>,
  defaultValues?: DefaultValues<z.infer<T>>
) => {
  const {
    register,
    watch,
    reset,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues,
  });

  const onFormSubmit = handleSubmit(async values => mutation({ ...values }));

  return { register, watch, reset, onFormSubmit, errors };
};
