// Navbar.tsx
import React from "react";
import module from "./Navbar.module.css";
import ThemeToggler from "../themeToggler/ThemeToggler";

interface Link {
  title: string | null;
  url: string;
}

interface NavbarOptions {
  siteTitle?: string;
  links?: Link[];
  themeToggle?: boolean;
}

interface NavbarProps {
  options: NavbarOptions;
}

const Navbar: React.FC<NavbarProps> = ({ options }) => {
  return (
    <div className={module.navbar}>
      <div>{options.siteTitle}</div>
      <div className={module.menu}>
        <div>
          {/* If links are present, render them: */}
          {options.links &&
            options.links.length > 0 &&
            options.links.map((link, index) => (
              <a key={index} href={link.url}>
                {link.title}
              </a>
            ))}
        </div>
        {/* If themeToggler option is true, render it: */}
        {options.themeToggle && <ThemeToggler />}
      </div>
    </div>
  );
};

export default Navbar;
