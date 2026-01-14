import { useState } from "react";

interface SelectionOptions {
  max?: number;
}

const useSelection = <K, T>(
  initialValues: Map<K, T> = new Map(),
  options?: SelectionOptions
) => {
  const [selected, setSelected] = useState<Map<K, T>>(() => {
    return new Map(initialValues);
  });
  const { max = Infinity } = options || {};

  const toggle = (id: K, value: T) => {
    setSelected((prev) => {
      const next = new Map(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        if (next.size >= max) {
          return prev;
        }
        next.set(id, value);
      }
      return next;
    });
  };

  const add = (id: K, value: T) => {
    setSelected((prev) => new Map(prev).set(id, value));
  };

  const remove = (id: K) => {
    setSelected((prev) => {
      const next = new Map(prev);
      next.delete(id);
      return next;
    });
  };

  const reset = () => {
    setSelected(new Map());
  };

  return {
    selected: selected as ReadonlyMap<K, T>,
    isSelected: (id: K) => selected.has(id),
    toggle,
    add,
    remove,
    reset,
  };
};

export default useSelection;
