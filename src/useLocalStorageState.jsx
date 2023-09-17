import { useEffect, useState } from "react";

const useLocalStorageState = (initialState, key) => {
  const [value, setValue] = useState(() => {
    const localWatched = JSON.parse(localStorage.getItem(key));
    return localWatched ? localWatched : initialState;
  });

  useEffect(() => {
    localStorage.setItem("value", JSON.stringify(value));
  }, [value, key]);
  return [value, setValue];
};

export default useLocalStorageState;
