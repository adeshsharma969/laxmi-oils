import React from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Clock, User } from "lucide-react";
import { BLOG_POSTS } from "../data/blog";

export default function BlogDetail() {
  const params = useParams();
  if (!params) return <div className="p-16 text-center"><div className="font-display font-black text-4xl text-[#1F3D2B]">Loading...</div></div>;
  const { id } = params;
  const post = BLOG_POSTS[id];
  if (!post) return (
    <div className="p-16 text-center">
      <div className="font-display font-black text-4xl text-[#1F3D2B]">Story not found.</div>
      <Link to="/" className="inline-block mt-4 underline font-bold">Back home</Link>
    </div>
  );
  const related = Object.values(BLOG_POSTS).filter(b=>String(b.id)!==String(id)).slice(0,2);

  return (
    <article className="px-4 sm:px-5 md:px-10 py-6 md:py-10 max-w-4xl mx-auto" data-testid={`blog-${post.id}`}>
      <Link to="/" className="touch-target-sm inline-flex items-center gap-2 text-[10px] sm:text-xs font-black uppercase tracking-[0.3em] text-[#1F3D2B] hover:text-[#B8431A]"><ArrowLeft size={14} strokeWidth={3}/> Back</Link>
      <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{duration:0.6}} className="mt-4 sm:mt-6">
        <div className="text-[10px] sm:text-xs font-black uppercase tracking-[0.3em] text-[#B8431A]">{post.tag}</div>
        <h1 className="font-display font-black text-3xl sm:text-4xl lg:text-5xl xl:text-6xl text-[#1F3D2B] tracking-tighter leading-[0.95] mt-2">{post.title}</h1>
        <div className="mt-3 sm:mt-4 flex flex-wrap items-center gap-2 sm:gap-4 text-[10px] sm:text-xs font-black uppercase tracking-widest text-[#1F3D2B]/60">
          <span className="flex items-center gap-1.5"><User size={12} strokeWidth={3}/> {post.author}</span>
          <span className="hidden sm:inline">·</span>
          <span className="hidden sm:inline">{post.date}</span>
          <span>·</span>
          <span className="flex items-center gap-1.5"><Clock size={12} strokeWidth={3}/> {post.read}</span>
        </div>
      </motion.div>

      <motion.div initial={{opacity:0}} animate={{opacity:1}} transition={{delay:0.15}} className="mt-6 sm:mt-8 border-[3px] border-[#1F3D2B] brutal-shadow overflow-hidden">
        <img src={post.image} alt={post.title} className="w-full h-56 sm:h-72 md:h-80 lg:h-[420px] object-cover"/>
      </motion.div>

      <div className="mt-8 sm:mt-10 prose-laxmi">
        {post.body.map((block,i)=>{
          if (typeof block === "string") return <p key={i} className="text-[#1F3D2B] text-base sm:text-lg leading-relaxed mt-4 first:mt-0">{block}</p>;
          if (Array.isArray(block)) return <ul key={i} className="list-disc pl-5 sm:pl-6 mt-4 space-y-1.5 text-[#1F3D2B] text-sm sm:text-base leading-relaxed">{block.map((li,j)=><li key={j}>{li}</li>)}</ul>;
          if (block.h) return <h2 key={i} className="font-display font-black text-xl sm:text-2xl md:text-3xl text-[#1F3D2B] tracking-tight mt-8 sm:mt-10 mb-2 border-l-[4px] sm:border-l-[6px] border-[#D98F00] pl-3 sm:pl-4">{block.h}</h2>;
          return null;
        })}
      </div>

      <div className="mt-12 sm:mt-16 border-t-[3px] border-[#1F3D2B] pt-8 sm:pt-10">
        <div className="font-display font-black text-xl sm:text-2xl text-[#1F3D2B] mb-4 sm:mb-5">Keep reading.</div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
          {related.map(b=>(
            <Link key={b.id} to={`/blog/${b.id}`} className="brutal-card block group">
              <div className="h-40 sm:h-48 border-b-[3px] border-[#1F3D2B] overflow-hidden">
                <img src={b.image} alt={b.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"/>
              </div>
              <div className="p-4 sm:p-5">
                <div className="text-[10px] font-black uppercase tracking-[0.3em] text-[#1F3D2B]/70">{b.tag} · {b.read}</div>
                <div className="font-display font-black text-lg sm:text-xl text-[#1F3D2B] mt-1">{b.title}</div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </article>
  );
}
