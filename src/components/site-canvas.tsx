import { useRef, type ElementType } from 'react';
import { ArrowUpRight, ArrowRight, MoveUpRight, ImagePlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { type SitePage } from '@/lib/cms-model';
import villa from '@/assets/studio-villa.jpg';

type Props = {
  page: SitePage;
  pages: SitePage[];
  siteName: string;
  editing?: boolean;
  onSelect: (id: string) => void;
  onEdit?: (field: keyof SitePage, value: string) => void;
  onMedia?: (file: File) => void;
  onFocus?: (label: string) => void;
};

export function SiteCanvas({ page, pages, siteName, editing = false, onSelect, onEdit, onMedia, onFocus }: Props) {
  const uploadRef = useRef<HTMLInputElement>(null);
  function text(field: keyof SitePage, tag: ElementType, className: string) {
    const Tag = tag;
    return <Tag className={`editable ${className}`} contentEditable={editing} suppressContentEditableWarning role={editing ? 'textbox' : undefined} aria-label={editing ? `Edit ${field}` : undefined} onFocus={() => onFocus?.(field)} onBlur={(event: React.FocusEvent<HTMLElement>) => onEdit?.(field, event.currentTarget.innerText)}>{String(page[field])}</Tag>;
  }
  const goToContact = () => { const contact = pages.find(p => p.id === 'contact'); if (contact) onSelect(contact.id); };
  return <div className={`business-site ${editing ? 'is-editing' : ''}`}>
    <nav className="site-header">
      <Button variant="ghost" className="site-wordmark" onClick={() => onSelect(pages[0]?.id ?? page.id)}>{siteName.replace(/ Studio$/, '').toLowerCase()}<span className="wordmark-dot">.</span></Button>
      <div className="site-links">{pages.filter(p => p.inNavigation).map(p => <Button variant="ghost" key={p.id} className={page.id === p.id ? 'site-link active' : 'site-link'} onClick={() => onSelect(p.id)}>{p.name}</Button>)}</div>
      <Button variant="ghost" className="site-contact" onClick={goToContact}>Let’s talk <ArrowUpRight size={15} /></Button>
    </nav>
    <section className="site-hero">
      <img src={page.image || villa} alt="Modern limestone coastal residence with an olive tree" width={1536} height={1024} className="hero-photo" />
      <div className="hero-shade" />
      <div className="hero-copy">
        {text('eyebrow', 'p', 'hero-eyebrow')}
        {text('title', 'h1', 'hero-title')}
        {text('description', 'p', 'hero-description')}
        <Button className="hero-cta" variant="outline" onClick={() => { if (!editing) { if(page.id === 'contact') document.querySelector('.site-intro')?.scrollIntoView({behavior:'smooth'}); else onSelect(page.id === 'home' ? 'services' : 'contact'); } }}><span contentEditable={editing} suppressContentEditableWarning role={editing ? 'textbox' : undefined} aria-label={editing ? 'Edit cta' : undefined} onFocus={() => onFocus?.('Button')} onBlur={e => onEdit?.('cta', e.currentTarget.innerText)}>{page.cta}</span><ArrowUpRight size={17} /></Button>
      </div>
      <div className="hero-caption"><span>FEATURED PROJECT</span><p>The Olive House <ArrowUpRight size={15}/></p></div>
      {editing && <Button variant="secondary" size="icon" className="replace-image" title="Replace image" aria-label="Replace image" onClick={() => uploadRef.current?.click()}><ImagePlus /></Button>}
      <input hidden ref={uploadRef} type="file" accept="image/*" onChange={e => { const file = e.target.files?.[0]; if (file) onMedia?.(file); e.target.value = ''; }} />
    </section>
    <section className="site-intro">
      <div><p className="site-eyebrow">A LITTLE ABOUT US</p>{text('sectionTitle', 'h2', 'intro-title')}</div>
      <div className="intro-details">{text('sectionText', 'p', 'intro-text')}<Button variant="link" className="intro-link" onClick={() => onSelect('about')}>Discover our studio <ArrowRight size={16}/></Button></div>
    </section>
    <section className="site-services"><div><span>01</span><h3>Architecture</h3><MoveUpRight /></div><div><span>02</span><h3>Interior design</h3><MoveUpRight /></div><div><span>03</span><h3>Thoughtful living</h3><MoveUpRight /></div></section>
    <footer className="site-footer"><span>{siteName} © 2026</span><span>Spaces with purpose. Places with soul.</span></footer>
  </div>;
}