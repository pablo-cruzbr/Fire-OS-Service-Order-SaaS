/** Props every modal opened through GlobalModal receives. */
export type EntityModalProps<T> = {
  data: T;
  onClose: () => void;
};
