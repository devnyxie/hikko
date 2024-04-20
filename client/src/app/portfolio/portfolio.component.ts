import { CommonModule, NgFor } from '@angular/common';
import { Component } from '@angular/core';

interface Item {
  name: string;
  description: string;
  languages?: string[];
  url: string;
}

@Component({
  selector: 'app-portfolio',
  standalone: true,
  imports: [NgFor, CommonModule],
  templateUrl: './portfolio.component.html',
  styleUrl: './portfolio.component.css',
})
export class PortfolioComponent {
  contributions: Item[] = [
    {
      name: 'PTerm',
      description:
        'A modern Go TUI module. Featuring charts, progressbars, tables,  trees, text input, select menus and much more.',
      languages: ['Go'],
      url: 'https://github.com/pterm/pterm',
    },
    {
      name: 'Next.js',
      description: 'Next.js stands out as a leading JavaScript framework.',
      languages: ['JavaScript'],
      url: 'https://github.com/vercel/next.js',
    },
  ];

  projects: Item[] = [
    {
      name: 'harugo-ssg',
      description:
        'Interactive Golang CLI: Build Next.js static sites with custom themes, pages, and components.',
      languages: ['Go', 'JavaScript'],
      url: 'https://github.com/devnyxie/harugo-ssg',
    },
    {
      name: 'dev-link',
      description:
        'React and Express.js powered webapp for fast team discovery in collaborative portfolio.',
      languages: ['TypeScript'],
      url: 'https://github.com/devnyxie/dev-link',
    },
    {
      name: 'nigiri',
      description:
        'The Nigiri Next.js Blog template allows you to create a personalized blog with ease. ',
      languages: ['JavaScript'],
      url: 'https://github.com/devnyxie/nigiri',
    },
    {
      name: 'GetFavicon',
      description: "Simple python package to grab site's favicons.",
      languages: ['Python'],
      url: 'https://github.com/devnyxie/GetFavicon',
    },
  ];
}
