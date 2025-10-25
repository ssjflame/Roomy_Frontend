"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { useStore } from "@/lib/store"
import { Wallet, Scale, BarChart3 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { AuthDialog } from "@/components/auth-dialog"
import { ContactDialog } from "@/components/contact-dialog"
import Image from "next/image"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { ScrollToPlugin } from "gsap/ScrollToPlugin"
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion"

gsap.registerPlugin(ScrollTrigger, ScrollToPlugin)

export default function HomePage() {
  const router = useRouter()
  const { user } = useStore()
  const [showAuthDialog, setShowAuthDialog] = useState(false)
  const [showContactDialog, setShowContactDialog] = useState(false)

  const heroTextRef = useRef<HTMLDivElement>(null)
  const heroCtaRef = useRef<HTMLDivElement>(null)
  const heroImageRef = useRef<HTMLDivElement>(null)
  const announceRef = useRef<HTMLDivElement>(null)

  const handleGetStarted = () => {
    if (user) {
      router.push("/dashboard")
    } else {
      router.push("/auth/signup")
    }
  }

  useEffect(() => {
    // Hero intro animations
    if (heroTextRef.current && heroCtaRef.current && heroImageRef.current) {
      gsap.from([heroTextRef.current, heroCtaRef.current], {
        opacity: 0,
        y: 30,
        duration: 0.8,
        ease: "power3.out",
        stagger: 0.1,
      })
      gsap.from(heroImageRef.current, {
        opacity: 0,
        x: 30,
        duration: 0.9,
        ease: "power3.out",
        delay: 0.1,
      })
    }

    // Announcement bar slide-in
    if (announceRef.current) {
      gsap.from(announceRef.current, {
        y: -20,
        opacity: 0,
        duration: 0.6,
        ease: "power2.out",
      })
    }

    // Parallax on hero image
    if (heroImageRef.current) {
      gsap.to(heroImageRef.current, {
        y: -20,
        scale: 1.02,
        ease: "none",
        scrollTrigger: {
          trigger: heroImageRef.current,
          start: "top bottom",
          end: "bottom top",
          scrub: true,
        },
      })
    }

    // Feature cards stagger reveal
    gsap.from(".feature-card", {
      opacity: 0,
      y: 30,
      duration: 0.5,
      stagger: 0.15,
      ease: "power2.out",
      scrollTrigger: {
        trigger: "#features",
        start: "top 80%",
        once: true,
      },
    })

    // How steps stagger reveal
    gsap.from(".how-step", {
      opacity: 0,
      y: 24,
      duration: 0.5,
      stagger: 0.12,
      ease: "power2.out",
      scrollTrigger: {
        trigger: "#how",
        start: "top 80%",
        once: true,
      },
    })

    // Generic reveal for remaining elements
    const elements = gsap.utils.toArray<HTMLElement>(".reveal")
    elements.forEach((el) => {
      gsap.from(el, {
        opacity: 0,
        y: 40,
        duration: 0.6,
        ease: "power2.out",
        scrollTrigger: {
          trigger: el,
          start: "top 85%",
          once: true,
        },
      })
    })
  }, [])

  // Smooth anchor scrolling via GSAP ScrollToPlugin with offset for sticky nav
  const scrollToId = (id: string) => {
    const el = document.getElementById(id)
    if (!el) return
    gsap.to(window, {
      duration: 0.7,
      ease: "power2.out",
      scrollTo: { y: el, offsetY: 72 },
    })
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Announcement Bar */}
      <div ref={announceRef} className="bg-secondary text-secondary-foreground border-b">
        <div className="container mx-auto px-4 py-2 flex items-center justify-between">
          <span className="text-sm">
            New: Roomy Partner Program — earn rewards for referrals
          </span>
          <div className="hidden sm:flex gap-4 text-sm">
            <button onClick={() => scrollToId("faq")} className="hover:underline">FAQ</button>
            <button onClick={() => setShowContactDialog(true)} className="hover:underline">Contact</button>
            <button onClick={() => scrollToId("features")} className="hover:underline">Features</button>
          </div>
        </div>
      </div>

      {/* Sticky Nav */}
      <nav className="sticky top-0 z-40 bg-card border-b">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center">
              <Wallet className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-bold">Roomy</span>
          </div>
          <div className="hidden md:flex items-center gap-6 text-sm">
            <button onClick={() => scrollToId("features")} className="hover:text-primary">Features</button>
            <button onClick={() => scrollToId("how")} className="hover:text-primary">How it works</button>
            <button onClick={() => scrollToId("faq")} className="hover:text-primary">FAQ</button>
            <button onClick={() => setShowContactDialog(true)} className="hover:text-primary">Contact</button>
          </div>
          <div className="flex gap-2">
            <Button size="sm" onClick={handleGetStarted}>Get Started</Button>
          </div>
        </div>
      </nav>

      {/* Hero – two-column like the reference */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          {/* Left: Big headline and copy */}
          <div ref={heroTextRef}>
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6">
              Spend smarter, together
            </h1>
            <p className="text-lg text-muted-foreground max-w-xl">
              Create shared smart wallets, vote on expenses, and keep your home finances fair and transparent.
            </p>
            <div ref={heroCtaRef} className="mt-8 flex flex-col sm:flex-row gap-4">
              <Button size="lg" onClick={handleGetStarted} className="text-lg px-8">Get Started</Button>
              <Button size="lg" variant="outline" className="text-lg px-8">Learn More</Button>
            </div>
          </div>

          {/* Right: Illustration */}
          <div ref={heroImageRef} className="relative w-full h-[360px] md:h-[440px]">
            <Image src="/images/hero.png" alt="Roomy hero" fill priority className="object-cover rounded-xl" />
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="reveal container mx-auto px-4 py-12">
        <div className="rounded-2xl bg-gradient-to-br from-muted/30 to-transparent p-6 border">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="feature-card p-6 rounded-xl bg-card border border-border hover:shadow-md transition-shadow">
              <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-3">
                <Wallet className="w-5 h-5" />
              </div>
              <h3 className="font-semibold mb-2 text-card-foreground">Smart Wallets</h3>
              <p className="text-sm text-muted-foreground">Create group wallets and manage shared expenses effortlessly.</p>
            </div>
            <div className="feature-card p-6 rounded-xl bg-card border border-border hover:shadow-md transition-shadow">
              <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-3">
                <Scale className="w-5 h-5" />
              </div>
              <h3 className="font-semibold mb-2 text-card-foreground">Fair Decisions</h3>
              <p className="text-sm text-muted-foreground">Vote on expenses with transparent, democratic decision-making.</p>
            </div>
            <div className="feature-card p-6 rounded-xl bg-card border border-border hover:shadow-md transition-shadow">
              <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-3">
                <BarChart3 className="w-5 h-5" />
              </div>
              <h3 className="font-semibold mb-2 text-card-foreground">Easy Management</h3>
              <p className="text-sm text-muted-foreground">Track bills, proposals, and payments in one dashboard.</p>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="reveal container mx-auto px-4 py-12">
        <div className="rounded-xl bg-card border p-8">
          <h2 className="text-2xl font-bold mb-6">How it works</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="how-step p-4 rounded-lg bg-muted/40">
              <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center mb-2 font-semibold">1</div>
              <h4 className="font-semibold">Create a group</h4>
              <p className="text-sm text-muted-foreground">Invite roommates, set rules, and open a shared smart wallet.</p>
            </div>
            <div className="how-step p-4 rounded-lg bg-muted/40">
              <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center mb-2 font-semibold">2</div>
              <h4 className="font-semibold">Propose expenses</h4>
              <p className="text-sm text-muted-foreground">Add bills, vote together, and approve payments transparently.</p>
            </div>
            <div className="how-step p-4 rounded-lg bg-muted/40">
              <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center mb-2 font-semibold">3</div>
              <h4 className="font-semibold">Track everything</h4>
              <p className="text-sm text-muted-foreground">Follow balances, transactions, and budgets in real time.</p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="reveal container mx-auto px-4 py-12">
        <div className="rounded-xl bg-card border p-8">
          <h2 className="text-2xl font-bold mb-6">FAQ</h2>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger>What is Roomy and how does it work?</AccordionTrigger>
              <AccordionContent>
                Roomy helps groups manage shared expenses through smart wallets, voting on proposals, and transparent tracking. Create a group, propose expenses, vote, and pay.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
              <AccordionTrigger>Do I need a crypto wallet to use Roomy?</AccordionTrigger>
              <AccordionContent>
                No. We abstract the complexity with account abstraction and custodial options. You just sign in and start managing shared expenses; funds are handled securely.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3">
              <AccordionTrigger>How are payments approved and tracked?</AccordionTrigger>
              <AccordionContent>
                Expenses are proposed, voted on, and once approved, payments are executed from the shared wallet. Everything is logged with clear histories and balances for the group.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-4">
              <AccordionTrigger>Can I invite new members and set rules?</AccordionTrigger>
              <AccordionContent>
                Yes. You can invite members via email or link, configure voting thresholds, and define spending rules to match your group’s needs.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="reveal container mx-auto px-4 py-12">
        <div className="rounded-xl bg-card border p-8 text-center">
          <h2 className="text-2xl font-bold mb-2">Contact</h2>
          <p className="text-sm text-muted-foreground mb-6">Questions or feedback? We’d love to hear from you.</p>
          <Button onClick={() => setShowContactDialog(true)} className="px-6">Open Contact Form</Button>
        </div>
      </section>

      {/* Remove AuthDialog from landing */}
      {/* <AuthDialog open={showAuthDialog} onOpenChange={setShowAuthDialog} /> */}
      <ContactDialog open={showContactDialog} onOpenChange={setShowContactDialog} />
    </div>
  )
}
