import { toast } from 'sonner';
import { getErrorMessage } from './errorService';

const defaultOptions = {
  position: 'top-right',
  duration: 3000,
};

export const showSuccessToast = (message, options = {}) => {
  toast.success(typeof message === 'string' ? message : String(message ?? 'Success'), {
    ...defaultOptions,
    ...options,
  });
};

export const showErrorToast = (message, options = {}) => {
  if (message?.toastShown) return;

  toast.error(getErrorMessage(message), {
    ...defaultOptions,
    ...options,
  });
};

export const showInfoToast = (message, options = {}) => {
  toast(typeof message === 'string' ? message : String(message ?? ''), {
    ...defaultOptions,
    ...options,
  });
};

export const showCustomToast = (content, options = {}) => {
  toast(content, {
    ...defaultOptions,
    duration: 5000,
    position: 'bottom-center',
    ...options,
  });
};

export const showLoadingToast = (message, options = {}) => {
  return toast.loading(message, {
    ...defaultOptions,
    ...options,
  });
};

export const dismissToast = (toastId) => {
  toast.dismiss(toastId);
};
