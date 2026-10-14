import { createFileRoute, notFound, Link } from '@tanstack/react-router';
import { queryOptions, useSuspenseQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { getPublishedSite } from '@/lib/cms.functions';
import { parsePages } from '@/lib/cms-model';
import { SiteCanvas } from '@/components/site-canvas';

const publishedQuery = (id: string) => queryOptions({queryKey:['published-site',id],queryFn:()=>getPublishedSite({data:{id}})});
export const Route = createFileRoute('/site/$siteId')({
  loader: async ({params,context})=>{if(!/^[0-9a-f-]{36}$/i.test(params.siteId))throw notFound();const site=await context.queryClient.ensureQueryData(publishedQuery(params.siteId));if(!site)throw notFound();},
  head: ()=>({meta:[{title:'Studio Website — Hex'},{name:'description',content:'A thoughtfully designed business website, published with Hex.'},{property:'og:title',content:'Studio Website — Hex'},{property:'og:description',content:'A thoughtfully designed business website, published with Hex.'},{property:'og:type',content:'website'},{name:'twitter:card',content:'summary_large_image'}]}),
  component: PublishedWebsite,
  notFoundComponent:()=> <div className="min-h-screen grid place-content-center gap-4 text-center"><h1 className="text-2xl">This website isn’t published yet.</h1><Link to="/">Back to Hex</Link></div>,
});
function PublishedWebsite(){const {siteId}=Route.useParams();const {data}=useSuspenseQuery(publishedQuery(siteId));const pages=parsePages(data?.pages);const [selected,setSelected]=useState('home');const page=pages.find(p=>p.id===selected)??pages[0];if(!page||!data)return null;return <div className="public-site"><SiteCanvas page={page} pages={pages} siteName={data.name} onSelect={setSelected}/></div>;}