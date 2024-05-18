import React from "react";
import module from "./Portfolio.module.css";

interface PortfolioOptions {
  title?: string;
  items?: {
    title: string;
    description: string;
    image?: string;
    url?: string;
  }[];
}

interface PortfolioProps {
  options?: PortfolioOptions;
}

function Portfolio({ options }: PortfolioProps) {
  return (
    <div>
      {options ? (
        <>
          {options.title && <h1>{options.title}</h1>}
          <div className={module.portfolioContainer}>
            {options.items &&
              options.items.length > 0 &&
              options.items.map((item, index) => (
                <div key={index}>
                  {item.url ? (
                    <a href={item.url}>
                      <h2>{item.title}</h2>
                    </a>
                  ) : (
                    <h2>{item.title}</h2>
                  )}
                  <p>{item.description}</p>
                  <img src={item.image} alt={item.title} />
                </div>
              ))}
          </div>
        </>
      ) : (
        "No data provided for portfolio component :)"
      )}
    </div>
  );
}

export default Portfolio;
