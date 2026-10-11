export type SitePage = {
  id: string;
  name: string;
  slug: string;
  eyebrow: string;
  title: string;
  description: string;
  cta: string;
  sectionTitle: string;
  sectionText: string;
  image?: string;
  inNavigation: boolean;
};

export const initialPages: [SitePage, SitePage, SitePage, SitePage] = [
  { id: 'home', name: 'Home', slug: '', eyebrow: 'ARCHITECTURE & INTERIOR DESIGN', title: 'Spaces for\na life well lived.', description: 'Thoughtful architecture. Meaningful interiors.\nWe design spaces that feel like you.', cta: 'Explore our work', sectionTitle: 'Good design starts\nwith a conversation.', sectionText: 'We are Forma, an independent architecture and interior design studio. We bring a considered approach to every space, creating places that are as personal as they are timeless.', inNavigation: true },
  { id: 'about', name: 'About', slug: 'about', eyebrow: 'THE PEOPLE BEHIND THE SPACES', title: 'A shared vision.\nA personal approach.', description: 'An independent studio with a simple belief:\nthe best spaces begin with the people in them.', cta: 'Meet our studio', sectionTitle: 'Considered in every detail.', sectionText: 'Our small, collaborative team brings architecture and interiors together. From the first sketch to the finishing touches, we listen closely and design with intention.', inNavigation: true },
  { id: 'services', name: 'Services', slug: 'services', eyebrow: 'FROM FIRST IDEA TO FINAL DETAIL', title: 'Your vision.\nBeautifully realized.', description: 'Architecture, interiors, and everything in between.\nA seamless journey from concept to completion.', cta: 'Start a project', sectionTitle: 'A complete perspective.', sectionText: 'Residential architecture · Interior design · Renovation & restoration. We work across disciplines to create a cohesive whole, balancing beautiful materials with the rhythms of everyday life.', inNavigation: true },
  { id: 'contact', name: 'Contact', slug: 'contact', eyebrow: 'LET’S MAKE SOMETHING MEANINGFUL', title: 'Every great space\nstarts with hello.', description: 'A new home. A fresh perspective. A possibility.\nWe would love to hear what you have in mind.', cta: 'Let’s talk', sectionTitle: 'Tell us what you’re imagining.', sectionText: 'Whether your project is a fully formed vision or just the beginning of an idea, we would love to start a conversation.', inNavigation: true },
];

export function parsePages(value: unknown): SitePage[] {
  if (!Array.isArray(value)) return [];
  return value.filter((page): page is SitePage => typeof page === 'object' && page !== null && typeof page.id === 'string' && typeof page.name === 'string' && typeof page.title === 'string' && typeof page.description === 'string' && typeof page.slug === 'string' && typeof page.eyebrow === 'string' && typeof page.cta === 'string' && typeof page.sectionTitle === 'string' && typeof page.sectionText === 'string' && typeof page.inNavigation === 'boolean');
}