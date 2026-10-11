import { createFileRoute } from "@tanstack/react-router";
import { WebsiteEditor } from '@/components/website-editor';
export const Route = createFileRoute("/")({
  head: () => ({meta:[{title:'Folio — Your website, beautifully in focus'},{name:'description',content:'A considered workspace for creating, editing and publishing beautiful business websites.'},{property:'og:title',content:'Folio — Your website, beautifully in focus'},{property:'og:description',content:'A considered workspace for creating, editing and publishing beautiful business websites.'},{property:'og:type',content:'website'},{name:'twitter:card',content:'summary_large_image'}]}),
  component: WebsiteEditor,
});
