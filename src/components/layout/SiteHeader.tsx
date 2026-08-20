"use client";

import Link from "next/link";
import { Building2, Heart, Menu, ShieldCheck, X } from "lucide-react";
import { useState } from "react";

export function SiteHeader({ appName }: { appName: string }) {
  const [open, setOpen] = useState(false);
  return <header className="site-header">
    <div className="container header-inner">
      <Link className="brand" href="/" aria-label={`${appName} home`}><span className="brand-mark"><Building2 size={22} /></span><span>{appName}</span></Link>
      <button className="mobile-menu" type="button" aria-expanded={open} aria-controls="primary-nav" onClick={() => setOpen(!open)}>{open ? <X /> : <Menu />}<span className="sr-only">Toggle menu</span></button>
      <nav id="primary-nav" className={open ? "primary-nav open" : "primary-nav"} aria-label="Primary navigation">
        <Link href="/search">Find a rental</Link><Link href="/safety"><ShieldCheck size={16} /> Safety</Link><Link href="/provider">List a property</Link><Link href="/saved"><Heart size={16} /> Saved</Link><Link className="nav-sign-in" href="/sign-in">Sign in</Link>
      </nav>
    </div>
  </header>;
}
