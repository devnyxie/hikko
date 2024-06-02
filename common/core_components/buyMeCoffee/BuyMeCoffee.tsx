import React from "react";
import module from "./BuyMeCoffee.module.css";
import Image from "next/image";
import coffeeSVG from "./coffee.svg";
import Link from "next/link";

interface NavbarOptions {
  url: string;
}

interface NavbarProps {
  options: NavbarOptions;
}

const BuyMeCoffeeButton: React.FC<NavbarProps> = ({ options }) => {
  return (
    <div className={module.main}>
      <Link
        className={module.link}
        target="_blank"
        href={options.url}
        rel="noopener noreferrer"
      >
        <Image
          width={30}
          height={30}
          src={coffeeSVG}
          alt="Buy me a coffee!"
          className={module.img}
        />
      </Link>
    </div>
  );
};

export default BuyMeCoffeeButton;
