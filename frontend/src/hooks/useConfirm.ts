import { useState } from "react";

export default function useConfirm() {

  const [open, setOpen] =
    useState(false);

  const [callback, setCallback] =
    useState<
      (() => void) | null
    >(null);

  function confirm(
    fn: () => void
  ) {

    setCallback(() => fn);

    setOpen(true);

  }

  function onConfirm() {

    callback?.();

    setOpen(false);

  }

  function onCancel() {

    setOpen(false);

  }

  return {

    open,

    confirm,

    onConfirm,

    onCancel,

  };

}