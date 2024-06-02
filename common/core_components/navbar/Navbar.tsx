// Navbar.tsx
import React from "react";
import module from "./Navbar.module.css";
import ThemeToggler from "../themeToggler/ThemeToggler";
import BuyMeCoffeeButton from "../buyMeCoffee/BuyMeCoffee";

interface Link {
  title: string | null;
  url: string;
}

interface NavbarOptions {
  siteTitle?: string;
  links?: Link[];
  themeToggle?: boolean;
  buyMeCoffee?: boolean;
  buyMeCoffeeUrl?: string;
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
        {/* If buyMeCoffee option is true and username is present, render it: */}
        {options.buyMeCoffee && options.buyMeCoffeeUrl && (
          <BuyMeCoffeeButton options={{ url: options.buyMeCoffeeUrl }} />
        )}
        {/* If themeToggler option is true, render it: */}
        {options.themeToggle && <ThemeToggler />}
      </div>
    </div>
  );
};

export default Navbar;
