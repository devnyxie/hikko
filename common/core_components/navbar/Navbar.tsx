"use client";
// Navbar.tsx
import React from "react";
import module from "./Navbar.module.css";
import ThemeToggler from "../themeToggler/ThemeToggler";
import BuyMeCoffeeButton from "../buyMeCoffee/BuyMeCoffee";
import Link from "next/link";

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
  // site title
  const SiteTitleComponent = options.siteTitle ? (
    <div>{options.siteTitle}</div>
  ) : (
    <></>
  );

  return (
    <div className={module.navbar}>
      {SiteTitleComponent}
      <div className={module.menu}>
        <div>
          {/* If links are present, render them: */}
          {options.links &&
            options.links.length > 0 &&
            options.links.map((link, index) => (
              <Link key={index} href={link.url} className={module.link}>
                {link.title}
              </Link>
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
