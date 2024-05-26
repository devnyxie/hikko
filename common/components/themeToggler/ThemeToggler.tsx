"use client";

import { useDispatch, useSelector } from "react-redux";
import { toggleDarkMode } from "@/common/redux/features/theme/themeSlice";
import { RootState } from "../../redux/store";
const ThemeToggle = () => {
  const dispatch = useDispatch();
  const darkMode = useSelector((state: RootState) => state.theme.darkMode);
  console.log(darkMode);

  const handleToggleClick = () => {
    dispatch(toggleDarkMode());
  };

  return (
    <div>
      <button onClick={handleToggleClick}>{darkMode ? "Dark" : "Light"}</button>
    </div>
  );
};

export default ThemeToggle;
