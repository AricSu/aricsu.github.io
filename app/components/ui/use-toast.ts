import { useToastContext } from "./toast-provider";

export function useToast() {
  const { addToast } = useToastContext();
  return {
    toast: addToast,
  };
}
