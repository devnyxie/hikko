import React from "react";
import module from "./BuyMeCoffee.module.css";
import Image from "next/image";
import coffeeSVG from "./coffee.svg";
import Link from "next/link";
import Button from "@mui/joy/Button";
import { IconButton } from "@mui/joy";

interface NavbarOptions {
  url: string;
}

interface NavbarProps {
  options: NavbarOptions;
}

const BuyMeCoffeeButton: React.FC<NavbarProps> = ({ options }) => {
  return (
    <div className={module.main}>
      <IconButton
        variant="plain"
        component="a"
        className={module.link}
        target="_blank"
        href={options.url}
        rel="noopener noreferrer"
        sx={
          {
            backgroundColor: "#ff813f",
            "&:hover": {
              backgroundColor: "#db692c",
            },
          } as any
        }
      >
        <Image
          width={30}
          height={30}
          src={coffeeSVG}
          alt="Buy me a coffee!"
          className={module.img}
        />
      </IconButton>
    </div>
  );
};

export default BuyMeCoffeeButton;
