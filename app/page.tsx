"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { useStore } from "@/lib/store"
import { Wallet, Scale, BarChart3, Users, Shield, Zap, Star, ArrowRight, CheckCircle, TrendingUp, DollarSign, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
  const [email, setEmail] = useState("")

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

  const handleLogin = () => {
    router.push("/auth/login")
  }

  const handleEmailSignup = (e: React.FormEvent) => {
    e.preventDefault()
    if (email.trim()) {
      router.push(`/auth/signup?email=${encodeURIComponent(email)}`)
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
      <div ref={announceRef} className="bg-primary text-primary-foreground border-b">
        <div className="container mx-auto px-4 py-2 flex items-center justify-between">
          <span className="text-sm font-medium">
            🎉 New: Roomy Partner Program — earn rewards for referrals
          </span>
          <div className="hidden sm:flex gap-4 text-sm">
            <button onClick={() => scrollToId("faq")} className="hover:underline">FAQ</button>
            <button onClick={() => setShowContactDialog(true)} className="hover:underline">Contact</button>
            <button onClick={() => scrollToId("features")} className="hover:underline">Features</button>
          </div>
        </div>
      </div>

      {/* Sticky Nav */}
      <nav className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Brand logo */}
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">R</span>
            </div>
            <span className="font-bold text-xl text-foreground">Roomy</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium">
            <button onClick={() => scrollToId("features")} className="text-muted-foreground hover:text-foreground transition-colors">Features</button>
            <button onClick={() => scrollToId("how")} className="text-muted-foreground hover:text-foreground transition-colors">How it works</button>
            <button onClick={() => scrollToId("faq")} className="text-muted-foreground hover:text-foreground transition-colors">FAQ</button>
            <button onClick={() => setShowContactDialog(true)} className="text-muted-foreground hover:text-foreground transition-colors">Contact</button>
          </div>
          <div className="flex gap-3">
            {!user && <Button size="sm" variant="outline" onClick={handleLogin} className="font-medium">Log In</Button>}
            <Button size="sm" onClick={handleGetStarted} className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium">Get Started</Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 md:py-32">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left: Content */}
          <div ref={heroTextRef} className="space-y-8">
            <div className="space-y-6">
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-foreground leading-tight">
                Split expenses
                <span className="block text-primary">
                  effortlessly
                </span>
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl leading-relaxed">
                Fast, user-friendly and engaging — turn expense sharing into seamless collaboration with your own branded group wallet.
              </p>
            </div>

            {/* Email Signup Form */}
            <div ref={heroCtaRef} className="space-y-4">
              <form onSubmit={handleEmailSignup} className="flex flex-col sm:flex-row gap-3 max-w-md">
                <Input
                  type="email"
                  placeholder="Enter work email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1 h-12 px-4 text-base border-border focus:border-primary focus:ring-primary"
                  required
                />
                <Button type="submit" size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground h-12 px-8 font-medium">
                  Get Started
                </Button>
              </form>
              <p className="text-sm text-muted-foreground">
                Free 14-day trial. No credit card required.
              </p>
            </div>

            {/* Social Proof Stats */}
            <div className="grid grid-cols-2 gap-8 pt-8">
              <div>
                <div className="text-3xl font-bold text-foreground">98.5%</div>
                <div className="text-sm text-muted-foreground">Average user satisfaction</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-foreground">~15k</div>
                <div className="text-sm text-muted-foreground">Active users monthly</div>
              </div>
            </div>

            {/* Rating */}
            <div className="flex items-center gap-3 pt-4">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                ))}
                <span className="ml-2 text-sm font-medium text-foreground">4.8</span>
              </div>
              <span className="text-sm text-muted-foreground">Average user rating</span>
            </div>
          </div>

          {/* Right: Visual Mockup */}
          <div ref={heroImageRef} className="relative">
            <div className="relative w-full max-w-lg mx-auto">
              {/* Phone Mockup */}
              <div className="relative bg-gradient-to-br from-muted to-muted-foreground rounded-[2.5rem] p-2 shadow-2xl">
                <div className="bg-background rounded-[2rem] overflow-hidden">
                  {/* Phone Screen Content */}
                  <div className="p-6 space-y-6">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-primary rounded-lg"></div>
                        <span className="font-semibold text-foreground">Roomy</span>
                      </div>
                      <div className="w-8 h-8 bg-muted rounded-full"></div>
                    </div>

                    {/* Balance Card */}
                    <div className="bg-primary rounded-2xl p-6 text-primary-foreground">
                      <div className="space-y-2">
                        <p className="text-primary-foreground/70 text-sm">Group Balance</p>
                        <p className="text-3xl font-bold">$2,847.50</p>
                        <p className="text-primary-foreground/70 text-sm">Available to spend</p>
                      </div>
                      <div className="mt-4 flex gap-2">
                        <div className="w-12 h-8 bg-primary-foreground/20 rounded"></div>
                        <div className="w-12 h-8 bg-primary-foreground/20 rounded"></div>
                      </div>
                    </div>

                    {/* Recent Transactions */}
                    <div className="space-y-4">
                      <h3 className="font-semibold text-foreground">Recent Activity</h3>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 bg-muted rounded-xl">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                              <CheckCircle className="w-5 h-5 text-green-600" />
                            </div>
                            <div>
                              <p className="font-medium text-foreground text-sm">Electricity Bill</p>
                              <p className="text-muted-foreground text-xs">Approved by 3/4 members</p>
                            </div>
                          </div>
                          <span className="font-semibold text-foreground text-sm">-$127.50</span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-muted rounded-xl">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center">
                              <Clock className="w-5 h-5 text-primary" />
                            </div>
                            <div>
                              <p className="font-medium text-foreground text-sm">Internet Bill</p>
                              <p className="text-muted-foreground text-xs">Pending approval</p>
                            </div>
                          </div>
                          <span className="font-semibold text-foreground text-sm">-$89.99</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating Elements */}
              <div className="absolute -top-4 -right-4 bg-background rounded-xl shadow-lg p-4 border border-border">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                  <span className="text-sm font-medium text-foreground">+12% savings</span>
                </div>
              </div>
              <div className="absolute -bottom-4 -left-4 bg-white rounded-xl shadow-lg p-4 border border-slate-200">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-600" />
                  <span className="text-sm font-medium text-slate-900">4 active members</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof Section */}
      <section className="bg-white border-y border-slate-200 py-16">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-12">
            <div>
              <p className="text-slate-600 font-medium mb-8">Trusted by innovative companies</p>
              <div className="flex items-center justify-center gap-12 opacity-60">
                <div className="text-2xl font-bold text-slate-400">Klarna</div>
                <div className="text-2xl font-bold text-slate-400">Coinbase</div>
                <div className="text-2xl font-bold text-slate-400">Instacart</div>
                <div className="text-2xl font-bold text-slate-400">Stripe</div>
              </div>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <div className="text-center">
                <div className="text-4xl font-bold text-slate-900 mb-2">180K+</div>
                <div className="text-slate-600">Expenses managed</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-slate-900 mb-2">15K+</div>
                <div className="text-slate-600">Active groups</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-slate-900 mb-2">$2.1M+</div>
                <div className="text-slate-600">Money managed</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground">
              Experience that grows
              <span className="block text-primary">
                with your needs
              </span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Design a financial operating system that works for your group and streamlined cash flow management tools.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="feature-card group">
              <div className="bg-card rounded-2xl p-8 border border-border hover:border-primary/30 hover:shadow-xl transition-all duration-300">
                <div className="w-12 h-12 bg-secondary rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Wallet className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-3">Smart Wallets</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Create shared wallets with built-in governance. Automatic expense splitting and transparent fund management.
                </p>
              </div>
            </div>

            <div className="feature-card group">
              <div className="bg-card rounded-2xl p-8 border border-border hover:border-primary/30 hover:shadow-xl transition-all duration-300">
                <div className="w-12 h-12 bg-secondary rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Shield className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-3">Unmatched Security</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Bank-level encryption with multi-signature approval. Your organization with MFA, card locking, and account level controls.
                </p>
              </div>
            </div>

            <div className="feature-card group">
              <div className="bg-card rounded-2xl p-8 border border-border hover:border-primary/30 hover:shadow-xl transition-all duration-300">
                <div className="w-12 h-12 bg-secondary rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Zap className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-3">Lightning Fast</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Instant notifications and real-time balance updates. Streamline your group's financial operations.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="bg-secondary py-20">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground">How Roomy works</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Get started in minutes with our simple three-step process
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="how-step text-center">
              <div className="bg-card rounded-2xl p-8 border border-border hover:shadow-lg transition-shadow">
                <div className="w-16 h-16 bg-primary text-primary-foreground rounded-2xl flex items-center justify-center mx-auto mb-6 text-2xl font-bold">
                  1
                </div>
                <h3 className="text-xl font-bold text-foreground mb-4">Create Your Group</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Invite roommates, set spending rules, and open a shared smart wallet in under 2 minutes.
                </p>
              </div>
            </div>

            <div className="how-step text-center">
              <div className="bg-card rounded-2xl p-8 border border-border hover:shadow-lg transition-shadow">
                <div className="w-16 h-16 bg-primary text-primary-foreground rounded-2xl flex items-center justify-center mx-auto mb-6 text-2xl font-bold">
                  2
                </div>
                <h3 className="text-xl font-bold text-foreground mb-4">Propose & Vote</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Add bills and expenses, vote together as a group, and approve payments transparently.
                </p>
              </div>
            </div>

            <div className="how-step text-center">
              <div className="bg-card rounded-2xl p-8 border border-border hover:shadow-lg transition-shadow">
                <div className="w-16 h-16 bg-primary text-primary-foreground rounded-2xl flex items-center justify-center mx-auto mb-6 text-2xl font-bold">
                  3
                </div>
                <h3 className="text-xl font-bold text-foreground mb-4">Track Everything</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Monitor balances, transactions, and budgets in real-time with detailed analytics.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary py-20">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto space-y-8">
            <h2 className="text-4xl md:text-5xl font-bold text-primary-foreground">
              Ready to transform your group finances?
            </h2>
            <p className="text-xl text-primary-foreground/80">
              Join thousands of groups already using Roomy to manage their shared expenses effortlessly.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" onClick={handleGetStarted} className="bg-background text-foreground hover:bg-secondary font-medium px-8">
                Get Started Free
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button size="lg" className="bg-secondary text-foreground hover:bg-secondary/80 font-medium px-8">
                Schedule Demo
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <div className="text-center space-y-4 mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-foreground">Frequently Asked Questions</h2>
              <p className="text-xl text-muted-foreground">
                Everything you need to know about Roomy
              </p>
            </div>

            <Accordion type="single" collapsible className="space-y-4">
              <AccordionItem value="item-1" className="bg-card rounded-xl border border-border px-6">
                <AccordionTrigger className="text-left font-semibold text-foreground hover:no-underline">
                  What is Roomy and how does it work?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed">
                  Roomy helps groups manage shared expenses through smart wallets, voting on proposals, and transparent tracking. Create a group, propose expenses, vote, and pay — all in one seamless platform.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-2" className="bg-card rounded-xl border border-border px-6">
                <AccordionTrigger className="text-left font-semibold text-foreground hover:no-underline">
                  Do I need a crypto wallet to use Roomy?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed">
                  No. We abstract the complexity with account abstraction and custodial options. You just sign in and start managing shared expenses; funds are handled securely behind the scenes.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-3" className="bg-card rounded-xl border border-border px-6">
                <AccordionTrigger className="text-left font-semibold text-foreground hover:no-underline">
                  How are payments approved and tracked?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed">
                  Expenses are proposed, voted on by group members, and once approved, payments are executed from the shared wallet. Everything is logged with clear histories and real-time balance updates.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-4" className="bg-card rounded-xl border border-border px-6">
                <AccordionTrigger className="text-left font-semibold text-foreground hover:no-underline">
                  Can I invite new members and set custom rules?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed">
                  Yes. You can invite members via email or link, configure voting thresholds, set spending limits, and define custom rules to match your group's specific needs and preferences.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-muted text-foreground py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <span className="text-primary-foreground font-bold text-sm">R</span>
                </div>
                <span className="font-bold text-xl">Roomy</span>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                The modern way to manage group expenses and shared finances.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <div className="space-y-2 text-muted-foreground">
                <button onClick={() => scrollToId("features")} className="block hover:text-foreground transition-colors">Features</button>
                <button onClick={() => scrollToId("how")} className="block hover:text-foreground transition-colors">How it works</button>
                <div className="block hover:text-foreground transition-colors cursor-pointer">Pricing</div>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <div className="space-y-2 text-muted-foreground">
                <button onClick={() => scrollToId("faq")} className="block hover:text-foreground transition-colors">FAQ</button>
                <button onClick={() => setShowContactDialog(true)} className="block hover:text-foreground transition-colors">Contact</button>
                <div className="block hover:text-foreground transition-colors cursor-pointer">Help Center</div>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <div className="space-y-2 text-muted-foreground">
                <div className="block hover:text-foreground transition-colors cursor-pointer">About</div>
                <div className="block hover:text-foreground transition-colors cursor-pointer">Blog</div>
                <div className="block hover:text-foreground transition-colors cursor-pointer">Careers</div>
              </div>
            </div>
          </div>
          
          <div className="border-t border-border mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-muted-foreground text-sm">
              © 2024 Roomy. All rights reserved.
            </p>
            <div className="flex gap-6 text-muted-foreground text-sm mt-4 md:mt-0">
              <div className="hover:text-foreground transition-colors cursor-pointer">Privacy Policy</div>
              <div className="hover:text-foreground transition-colors cursor-pointer">Terms of Service</div>
            </div>
          </div>
        </div>
      </footer>

      <ContactDialog open={showContactDialog} onOpenChange={setShowContactDialog} />
    </div>
  )
}
