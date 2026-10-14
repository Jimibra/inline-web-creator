import { createFileRoute } from "@tanstack/react-router";
import { WebsiteEditor } from '@/components/website-editor';
export const Route = createFileRoute("/")({
  head: () => ({meta:[{title:'Hex — Website editor'},{name:'description',content:'Your Hex workspace for creating, editing and publishing beautiful business websites.'},{property:'og:title',content:'Hex — Website editor'},{property:'og:description',content:'Your Hex workspace for creating, editing and publishing beautiful business websites.'},{property:'og:type',content:'website'},{name:'twitter:card',content:'summary_large_image'}]}),
  component: WebsiteEditor,
});
