import { useEffect, useState } from 'react';
import { ArrowLeft, ArrowUpRight, ChevronDown, Check, Plus, Monitor, Tablet, Smartphone, Eye, Globe, Home, FileText, MoreHorizontal, Settings2, PanelLeftClose, PanelLeftOpen, Undo2, Redo2, MousePointer2, Layers, Image, Link2, HelpCircle, X, Loader2, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { SiteCanvas } from '@/components/site-canvas';
import { initialPages, parsePages, type SitePage } from '@/lib/cms-model';
import { supabase } from '@/integrations/supabase/client';
import { lovable } from '@/integrations/lovable';
import type { Json } from '@/integrations/supabase/types';

export function WebsiteEditor() {
  const [pages, setPages] = useState(initialPages);
  const [selected, setSelected] = useState('home');
  const [device, setDevice] = useState('desktop');
  const [preview, setPreview] = useState(false);
  const [sidebar, setSidebar] = useState(true);
  const [panel, setPanel] = useState('pages');
  const [modal, setModal] = useState<string | null>(null);
  const [newName, setNewName] = useState('');
  const [siteName, setSiteName] = useState('Forma Studio');
  const [focus, setFocus] = useState('Page');
  const [userId, setUserId] = useState<string | null>(null);
  const [siteId, setSiteId] = useState<string | null>(null);
  const [status, setStatus] = useState('Draft');
  const [busy, setBusy] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [signUp, setSignUp] = useState(false);
  const [authError, setAuthError] = useState('');
  const [publishedUrl, setPublishedUrl] = useState('');
  const [history, setHistory] = useState<SitePage[][]>([]);
  const [future, setFuture] = useState<SitePage[][]>([]);
  const page = pages.find(p => p.id === selected) ?? pages[0] ?? initialPages[0];

  useEffect(() => {
    let active = true;
    const load = async (id: string | null) => {
      if (!active) return;
      setUserId(id);
      if (!id) return;
      const { data, error } = await supabase.from('cms_sites').select('*').eq('owner_id', id).maybeSingle();
      if (!active) return;
      if (error) { toast.error('Your saved site could not be loaded.'); return; }
      if (data) { const loaded = parsePages(data.pages); if(loaded.length) { setPages(loaded); setSelected(loaded[0].id); } setSiteName(data.name); setSiteId(data.id); setStatus('All changes saved'); }
    };
    supabase.auth.getSession().then(({ data }) => load(data.session?.user.id ?? null));
    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => { if(event === 'SIGNED_IN') { load(session?.user.id ?? null); setModal(null); } if(event === 'SIGNED_OUT') { setUserId(null); setSiteId(null); setStatus('Draft'); } });
    return () => { active = false; listener.subscription.unsubscribe(); };
  }, []);

  function change(next: SitePage[]) { setHistory(prev => [...prev.slice(-29), pages]); setFuture([]); setPages(next); setStatus('Unsaved changes'); }
  function edit(field: keyof SitePage, value: string) { if (page[field] === value) return; change(pages.map(p => p.id === page.id ? { ...p, [field]: value } : p)); }
  function undo() { const previous = history.at(-1); if (!previous) return; setFuture(prev => [...prev, pages]); setPages(previous); setHistory(history.slice(0, -1)); setStatus('Unsaved changes'); }
  function redo() { const next = future.at(-1); if (!next) return; setHistory(prev => [...prev, pages]); setPages(next); setFuture(future.slice(0, -1)); setStatus('Unsaved changes'); }
  async function save(publish = false) {
    if (!userId) { setModal('auth'); return; }
    setBusy(true); setStatus('Saving…');
    const { data, error } = await supabase.from('cms_sites').upsert({ ...(siteId ? {id: siteId} : {}), owner_id: userId, name: siteName, pages: pages as unknown as Json, updated_at: new Date().toISOString() }, { onConflict: 'owner_id' }).select('id').single();
    if(error || !data) { setStatus('Save failed'); setBusy(false); toast.error('Could not save your website. Please try again.'); return; }
    setSiteId(data.id); setStatus('All changes saved');
    if(publish) {
      const { error: publishError } = await supabase.from('cms_published').upsert({id:data.id, owner_id:userId, name:siteName, pages:pages as unknown as Json, published_at:new Date().toISOString()});
      if(publishError) toast.error('Saved, but publishing failed. Please try again.');
      else { setPublishedUrl(`${window.location.origin}/site/${data.id}`); setModal('published'); toast.success('Your website snapshot is published.'); }
    } else toast.success('Your website is saved.');
    setBusy(false);
  }
  async function authenticate(e: React.FormEvent) {
    e.preventDefault(); setBusy(true); setAuthError('');
    const result = signUp ? await supabase.auth.signUp({email,password,options:{emailRedirectTo:window.location.origin}}) : await supabase.auth.signInWithPassword({email,password});
    if(result.error) setAuthError(result.error.message);
    else if(signUp && !result.data.session) setAuthError('Check your email to confirm your account, then sign in.');
    else setModal(null);
    setBusy(false);
  }
  function addPage(e: React.FormEvent) { e.preventDefault(); const name = newName.trim(); if(!name) return; const slug = name.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,''); if(pages.some(p=>p.slug === slug)) { toast.error('A page with this address already exists.'); return; } const id=crypto.randomUUID(); change([...pages,{...initialPages[1],id,name,slug,title:name,eyebrow:'FORMA STUDIO',description:'A new perspective on thoughtful spaces.'}]); setSelected(id); setNewName(''); setModal(null); }
  function replaceMedia(file: File) { if(file.size > 3*1024*1024) {toast.error('Choose an image smaller than 3 MB.');return;} if(!file.type.startsWith('image/')) {toast.error('Please choose an image.');return;} const reader = new FileReader(); reader.onload=()=>{if(typeof reader.result === 'string')edit('image',reader.result);};reader.readAsDataURL(file); }

  return <div className={`editor-shell ${preview ? 'preview-mode' : ''}`}>
    <header className="workspace-header">
      <div className="workspace-brand"><span className="brand-mark"><Layers size={19}/></span><span className="brand-name">folio<span className="brand-period">.</span></span><span className="header-divider"/><Button variant="ghost" className="site-switch" onClick={()=>setModal('settings')}>{siteName}<ChevronDown size={13}/></Button><span className="workspace-badge">Website</span></div>
      <div className="device-switcher">{[{id:'desktop',icon:Monitor,label:'Desktop'},{id:'tablet',icon:Tablet,label:'Tablet'},{id:'mobile',icon:Smartphone,label:'Mobile'}].map(({id,icon:Icon,label})=><Button key={id} size="icon" variant="ghost" title={label} aria-label={label} className={device===id?'device-active':''} onClick={()=>setDevice(id)}><Icon/></Button>)}</div>
      <div className="header-actions"><Button variant="ghost" className="save-status" onClick={()=>save()} disabled={busy}>{busy?<Loader2 className="animate-spin"/>:<Check/>}<span>{status}</span></Button><Button variant="ghost" onClick={()=>setPreview(!preview)}><Eye/><span>{preview?'Back to editor':'Preview'}</span></Button><Button className="publish-button" onClick={()=>setModal('publish')}><span>Publish</span><ArrowUpRight/></Button></div>
    </header>
    <div className="editor-body">
      {!preview && <aside className={`workspace-sidebar ${sidebar ? '' : 'collapsed'}`}>
        <div className="sidebar-top"><Button variant="ghost" className="back-link" onClick={()=>setModal('sites')} title="All websites"><ArrowLeft/><span>All websites</span></Button><Button size="icon" variant="ghost" aria-label={sidebar?'Collapse sidebar':'Expand sidebar'} onClick={()=>setSidebar(!sidebar)}>{sidebar?<PanelLeftClose/>:<PanelLeftOpen/>}</Button></div>
        {sidebar && <><div className="site-identity"><div className="site-avatar">f.</div><div><strong>{siteName}</strong><span>formastudio.example <ExternalLink size={10}/></span></div><span className="identity-dot"/></div>
          <div className="sidebar-tabs"><Button variant="ghost" onClick={()=>setPanel('pages')} className={panel==='pages'?'tab-active':''}>Pages</Button><Button variant="ghost" onClick={()=>setPanel('navigation')} className={panel==='navigation'?'tab-active':''}>Navigation</Button></div>
          <div className="page-list-heading"><span>{panel==='pages'?'SITE PAGES':'MAIN NAVIGATION'}</span><span>{pages.length}</span></div>
          <div className="page-list">{pages.map(p=><div className={`page-row ${selected===p.id?'selected':''}`} key={p.id}><Button variant="ghost" className="page-select" onClick={()=>{setSelected(p.id);setFocus('Page');}}>{p.id==='home'?<Home/>:<FileText/>}<span>{p.name}</span>{p.id==='home'&&<span className="home-tag">/</span>}</Button>{panel==='navigation'?<input type="checkbox" aria-label={`Show ${p.name} in navigation`} checked={p.inNavigation} onChange={()=>change(pages.map(item=>item.id===p.id?{...item,inNavigation:!item.inNavigation}:item))}/>:<Button variant="ghost" size="icon" className="page-options" aria-label={`${p.name} settings`} onClick={()=>{setSelected(p.id);setNewName(p.name);setModal('page-settings');}}><MoreHorizontal/></Button>}</div>)}</div>
          <Button variant="ghost" className="add-page" onClick={()=>setModal('add')}><Plus/>Add new page</Button>
          <div className="sidebar-section"><div className="page-list-heading"><span>PAGE SECTIONS</span><Layers size={13}/></div>{[{name:'Header',id:'.site-header'},{name:'Hero',id:'.site-hero'},{name:'About the studio',id:'.site-intro'},{name:'Services',id:'.site-services'},{name:'Footer',id:'.site-footer'}].map((section,i)=><Button key={section.name} variant="ghost" className="section-link" onClick={()=>{document.querySelector(section.id)?.scrollIntoView({behavior:'smooth',block:'start'});setFocus(section.name);}}><span className="section-number">0{i+1}</span>{section.name}</Button>)}</div>
          <div className="sidebar-bottom"><Button variant="ghost" onClick={()=>setModal('settings')}><Settings2/>Site settings</Button><Button variant="ghost" onClick={()=>setModal('help')}><HelpCircle/>Help & resources<ArrowUpRight/></Button><div className="user-profile"><div className="user-avatar">JD</div><div><strong>{userId?'Your workspace':'Personal workspace'}</strong><span>{userId?'Connected to Cloud':'Free plan'}</span></div><Button variant="ghost" size="icon" aria-label="Account" onClick={()=>setModal('auth')}><ChevronDown/></Button></div></div></>}
      </aside>}
      <main className="canvas-workspace">
        <div className="canvas-toolbar"><div className="canvas-breadcrumb"><span>Pages</span><span>/</span><strong>{page.name}</strong><span className="draft-tag">Draft</span></div><div className="canvas-tools">{!preview&&<><Button variant="ghost" size="icon" aria-label="Undo" title="Undo" disabled={!history.length} onClick={undo}><Undo2/></Button><Button variant="ghost" size="icon" aria-label="Redo" title="Redo" disabled={!future.length} onClick={redo}><Redo2/></Button><span className="toolbar-divider"/></>}<span className="canvas-size">{device==='desktop'?'Desktop':device==='tablet'?'768 px':'390 px'}</span><Button variant="ghost" size="icon" aria-label="Page settings" title="Page settings" onClick={()=>{setNewName(page.name);setModal('page-settings');}}><MoreHorizontal/></Button></div></div>
        <div className="canvas-scroll"><div className={`canvas-frame device-${device}`}><div className="browser-bar"><div className="browser-dots"><i/><i/><i/></div><div className="browser-address"><Globe size={11}/><span>formastudio.example{page.slug?`/${page.slug}`:''}</span></div><ArrowUpRight size={12}/></div><SiteCanvas key={page.id} page={page} pages={pages} siteName={siteName} editing={!preview} onSelect={setSelected} onEdit={edit} onMedia={replaceMedia} onFocus={setFocus}/></div><div className="canvas-bottom-mark"><span className="small-brand-mark"><Layers size={12}/></span> Made with folio</div></div>
        <footer className="workspace-footer"><div><span className="edit-mode-dot"/>{preview?'Preview mode':'Editing mode'}<span className="footer-divider">|</span><MousePointer2 size={12}/><span>{focus}</span></div><div><span className="footer-save">{status}</span><span className="footer-divider">|</span><Globe size={12}/>EN</div></footer>
      </main>
    </div>
    <Dialog open={modal!==null} onOpenChange={open=>{if(!open)setModal(null);}}><DialogContent>
      {modal==='add'&&<><DialogTitle>Add a new page</DialogTitle><DialogDescription>A fresh page for your website.</DialogDescription><form onSubmit={addPage} className="dialog-form"><label htmlFor="page-name">Page name</label><Input autoFocus id="page-name" placeholder="e.g. Our projects" value={newName} onChange={e=>setNewName(e.target.value)} required/><Button type="submit"><Plus/>Create page</Button></form></>}
      {modal==='page-settings'&&<><DialogTitle>Page settings</DialogTitle><DialogDescription>{page.name} · /{page.slug}</DialogDescription><form className="dialog-form" onSubmit={e=>{e.preventDefault();if(newName.trim())edit('name',newName.trim());setModal(null);}}><label htmlFor="rename">Page name</label><Input id="rename" value={newName} onChange={e=>setNewName(e.target.value)} required/><Button type="submit">Save changes</Button>{page.id!=='home'&&<Button variant="destructive" type="button" onClick={()=>{change(pages.filter(p=>p.id!==page.id));setSelected('home');setModal(null);}}>Delete page</Button>}</form></>}
      {modal==='settings'&&<><DialogTitle>Site settings</DialogTitle><DialogDescription>Your website identity.</DialogDescription><label htmlFor="site-name">Site name</label><Input id="site-name" value={siteName} onChange={e=>{setSiteName(e.target.value);setStatus('Unsaved changes');}}/><Button onClick={()=>{setModal(null);save();}}>Save website</Button></>}
      {modal==='auth'&&<><DialogTitle>{signUp?'Create your workspace':'Welcome to your workspace'}</DialogTitle><DialogDescription>Sign in to save and publish your website.</DialogDescription><Button variant="outline" onClick={async()=>{const result=await lovable.auth.signInWithOAuth('google',{redirect_uri:window.location.origin});if(result.error)setAuthError(result.error.message);}}>Continue with Google</Button><div className="auth-divider">or use email</div><form className="dialog-form" onSubmit={authenticate}><label htmlFor="email">Email</label><Input id="email" type="email" autoComplete="email" value={email} onChange={e=>setEmail(e.target.value)} required/><label htmlFor="password">Password</label><Input id="password" type="password" autoComplete={signUp?'new-password':'current-password'} minLength={8} value={password} onChange={e=>setPassword(e.target.value)} required/>{authError&&<p className="auth-error">{authError}</p>}<Button disabled={busy}>{busy?<Loader2 className="animate-spin"/>:null}{signUp?'Create account':'Sign in'}</Button></form><Button variant="link" onClick={()=>{setSignUp(!signUp);setAuthError('');}}>{signUp?'Already have an account? Sign in':'New here? Create an account'}</Button></>}
      {modal==='publish'&&<><DialogTitle>Ready for the world?</DialogTitle><DialogDescription>Publish all {pages.length} pages as a public website snapshot. Later edits stay private until you publish again.</DialogDescription><div className="publish-summary"><Globe/><div><strong>{siteName}</strong><p>{pages.length} pages · {pages.filter(p=>p.inNavigation).length} navigation links</p></div></div><Button onClick={()=>save(true)} disabled={busy}>{busy?<Loader2 className="animate-spin"/>:<ArrowUpRight/>}{userId?'Publish website':'Sign in to publish'}</Button></>}
      {modal==='published'&&<><DialogTitle>Your website is published</DialogTitle><DialogDescription>This public snapshot is ready to share. The editor app itself is not yet deployed.</DialogDescription><Input readOnly value={publishedUrl} aria-label="Published website link"/><Button onClick={()=>{navigator.clipboard.writeText(publishedUrl).then(()=>toast.success('Link copied.')).catch(()=>toast.error('Could not copy the link.'));}}><Link2/>Copy link</Button><Button asChild variant="outline"><a href={publishedUrl} target="_blank" rel="noreferrer">Open website<ExternalLink/></a></Button></>}
      {modal==='sites'&&<><DialogTitle>Your websites</DialogTitle><DialogDescription>Personal workspace</DialogDescription><Button className="website-tile" variant="outline" onClick={()=>setModal(null)}><div className="site-avatar">f.</div><span>{siteName}</span><ArrowUpRight/></Button></>}
      {modal==='help'&&<><DialogTitle>A little help, when you need it</DialogTitle><DialogDescription>Select a page, then click any heading or paragraph to edit. Replace a photo with the image button. Save your changes before leaving, and publish when you’re ready to share.</DialogDescription><Button onClick={()=>setModal(null)}>Back to your website</Button></>}
    </DialogContent></Dialog>
  </div>;
}