import Swal from 'sweetalert2'
import 'sweetalert2/dist/sweetalert2.min.css'

const ToastDefaults = {
  toast: true,
  position: 'top-end',
  showConfirmButton: false,
  timer: 2500,
  timerProgressBar: true,
}

export async function confirmDialog(text, options = {}) {
  const res = await Swal.fire({
    title: text,
    icon: options.icon || 'question',
    showCancelButton: true,
    confirmButtonText: options.confirmText || 'Sí',
    cancelButtonText: options.cancelText || 'Cancelar',
    reverseButtons: true,
    ...options,
  })
  return !!res.isConfirmed
}

export function toastSuccess(text) {
  return Swal.fire({
    ...ToastDefaults,
    icon: 'success',
    title: text
  })
}

export function toastError(text) {
  return Swal.fire({
    ...ToastDefaults,
    icon: 'error',
    title: text
  })
}

export function alertInfo(text, opts = {}) {
  return Swal.fire({ title: text, icon: opts.icon || 'info', ...opts })
}

export function alertSuccess(text, opts = {}) {
  return Swal.fire({ title: text, icon: 'success', ...opts })
}

export function alertError(text, opts = {}) {
  return Swal.fire({ title: text, icon: 'error', ...opts })
}

export default {
  confirmDialog,
  toastSuccess,
  toastError,
  alertInfo,
  alertSuccess,
  alertError,
}
