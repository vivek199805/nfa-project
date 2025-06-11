import { toast } from 'sonner';

const defaultOptions = {
  position: 'top-right',
  duration: 3000,
};

export const showSuccessToast = (message, options = {}) => {
  toast.success(message, {
    ...defaultOptions,
    ...options,
  });
};

export const showErrorToast = (message, options = {}) => {
  toast.error(message, {
    ...defaultOptions,
    ...options,
  });
};

export const showInfoToast = (message, options = {}) => {
  toast(message, {
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
