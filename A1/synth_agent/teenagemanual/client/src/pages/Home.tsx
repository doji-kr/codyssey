import { useEffect, useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Link } from "wouter";

const faqs = [
  {
    id: "free",
    question: "Is it free?",
    answer:
      "Yes. Ask questions every day for free. Pro ($20/mo) lifts the daily limit, unlocks the full mastery curriculum, and uses the smartest model.",
  },
  {
    id: "devices",
    question: "Which devices are supported?",
    answer:
      "All nine: the OP–1, OP–1 field, K.O. II (EP–133), EP–1320, EP–40, TP–7, TX–6, and CM–15. Pick yours and everything is anchored to its real controls.",
  },
  {
    id: "accuracy",
    question: "How accurate are the answers?",
    answer:
      "Every answer is grounded in the official device manual and points at the exact control, with a citation back to the page it came from so you can verify it.",
  },
  {
    id: "languages",
    question: "What languages does it work in?",
    answer:
      "Any. Ask in your own language and you get the answer back in it. The guidance is grounded in the official (English) manuals, but the AI replies in whatever language you write in.",
  },
  {
    id: "mastery",
    question: "What is mastery?",
    answer:
      "Hands-on, interactive tracks that teach your device move by move, with the control lit up on a live diagram for every step. The first track is free; the rest come with Pro or a one-time device pack.",
  },
  {
    id: "affiliated",
    question: "Is this affiliated with teenage engineering?",
    answer:
      "No. teenage manual is an independent project, not affiliated with or endorsed by Teenage Engineering.",
  },
  {
    id: "cancel",
    question: "Can I cancel anytime?",
    answer:
      "Yes. Pro is month-to-month and you can cancel whenever you like, no questions asked.",
  },
];

export default function Home() {
  const { user, isAuthenticated } = useAuth();
  const { data: devices = [], isLoading } = trpc.devices.list.useQuery();
  const [selectedDevice, setSelectedDevice] = useState<string | null>(null);

  useEffect(() => {
    if (devices.length > 0 && !selectedDevice) {
      setSelectedDevice(devices[0]?.slug || null);
    }
  }, [devices, selectedDevice]);

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/">
            <a className="text-2xl font-bold text-black hover:opacity-80">
              teenage manual
            </a>
          </Link>
          <nav className="flex gap-6 items-center">
            <Link href="/changelog">
              <a className="text-sm text-gray-600 hover:text-black">CHANGELOG</a>
            </Link>
            <Link href="/love">
              <a className="text-sm text-gray-600 hover:text-black">WALL OF LOVE</a>
            </Link>
            {isAuthenticated ? (
              <div className="flex gap-4 items-center">
                <span className="text-sm text-gray-600">{user?.name}</span>
                <Link href="/account">
                  <a className="text-sm text-gray-600 hover:text-black">ACCOUNT</a>
                </Link>
              </div>
            ) : (
              <a href={getLoginUrl()} className="text-sm text-gray-600 hover:text-black">
                SIGN IN
              </a>
            )}
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 py-16 md:py-24">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-4">
              THE FIELD GUIDE TO SMALL MACHINES
            </p>
            <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
              learn your <br />
              machine, by <br />
              <span className="text-orange-500">doing.</span>
            </h1>
            <p className="text-lg text-gray-700 mb-8 leading-relaxed">
              Pick up your device. Ask it anything, follow a hands-on track, or browse
              straight answers, all anchored to the buttons in front of you.
            </p>
            {selectedDevice && (
              <Link href={`/${selectedDevice}`}>
                <a>
                  <Button size="lg" className="bg-black text-white hover:bg-gray-800">
                    start with {devices.find(d => d.slug === selectedDevice)?.displayName}
                  </Button>
                </a>
              </Link>
            )}
            <p className="text-xs text-gray-500 mt-6">
              USED BY NEARLY 5,000 MUSICIANS
              <br />
              ASK IN ANY LANGUAGE
            </p>
          </div>

          {/* Device showcase - placeholder */}
          <div className="bg-gray-100 rounded-lg h-96 flex items-center justify-center">
            <div className="text-center">
              <p className="text-gray-400 text-sm">Device Image</p>
              {selectedDevice && (
                <p className="text-gray-600 font-semibold mt-2">
                  {devices.find(d => d.slug === selectedDevice)?.displayName}
                </p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Device Selection */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4">
          <p className="text-xs text-gray-500 uppercase tracking-wide mb-8">
            CHOOSE YOUR DEVICE · {devices.length} TOTAL
          </p>
          {isLoading ? (
            <div className="text-center text-gray-400">Loading devices...</div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {devices.map((device) => (
                <Link key={device.id} href={`/${device.slug}`}>
                  <a>
                    <Card className="p-4 hover:shadow-lg transition-shadow cursor-pointer border border-gray-200">
                      <div className="bg-gray-200 rounded h-32 mb-3 flex items-center justify-center">
                        <span className="text-gray-400 text-xs">Image</span>
                      </div>
                      <h3 className="font-bold text-sm mb-1">{device.displayName}</h3>
                      <p className="text-xs text-gray-600">{device.shortDescription}</p>
                    </Card>
                  </a>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Why Teenage Manual */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold mb-12">the best way to learn your machine.</h2>

        <div className="grid md:grid-cols-2 gap-12 mb-16">
          <div>
            <p className="text-sm font-bold text-orange-500 mb-2">ASK</p>
            <h3 className="text-xl font-bold mb-4">ask it anything, get a real answer</h3>
            <p className="text-gray-700 leading-relaxed">
              Ask in plain language and get an answer that's grounded in the official manual,
              pointed right at the control you need.
            </p>
            <div className="mt-6 p-4 bg-gray-50 rounded">
              <p className="text-sm font-semibold mb-2">How do I sample on the K.O. II?</p>
              <p className="text-sm text-gray-700">
                Hold <strong>sample</strong>, then tap a pad to record straight from the
                line-in.
              </p>
              <p className="text-xs text-gray-500 mt-2">§ sampling · p.14</p>
            </div>
          </div>

          <div>
            <p className="text-sm font-bold text-orange-500 mb-2">ANCHORED</p>
            <h3 className="text-xl font-bold mb-4">anchored to the buttons in front of you</h3>
            <p className="text-gray-700 leading-relaxed">
              Every answer lights up the control on a live diagram of your device.
            </p>
            <div className="mt-6 bg-gray-100 rounded h-40 flex items-center justify-center">
              <span className="text-gray-400 text-sm">Interactive Diagram</span>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-12">
          <div>
            <p className="text-sm font-bold text-orange-500 mb-2">LEARN</p>
            <h3 className="text-xl font-bold mb-4">learn by doing</h3>
            <p className="text-gray-700 leading-relaxed">
              Hands-on tracks walk you through your first beat, move by move.
            </p>
            <p className="text-xs text-gray-500 mt-4">STEP 2 OF 6 · FIRST BEAT</p>
          </div>

          <div>
            <p className="text-sm font-bold text-orange-500 mb-2">CITED</p>
            <h3 className="text-xl font-bold mb-4">always cited</h3>
            <p className="text-gray-700 leading-relaxed">
              Every claim links back to the page it came from.
            </p>
            <div className="flex gap-2 mt-4 text-xs text-gray-500">
              <span>§ sampling</span>
              <span>§ sequencer</span>
              <span>§ fx</span>
            </div>
          </div>
        </div>
      </section>

      {/* Pro Section */}
      <section className="bg-orange-50 py-16 my-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="max-w-2xl">
            <h2 className="text-3xl font-bold mb-4">go further, unlimited</h2>
            <p className="text-gray-700 mb-6">
              Unlimited questions, the full mastery curriculum, and the smartest model, all
              in one subscription.
            </p>
            <div className="flex gap-8 mb-8">
              <div>
                <p className="text-sm font-semibold text-gray-600">UNLIMITED AI</p>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-600">ALL TRACKS</p>
              </div>
            </div>
            <Link href="/pro">
              <a>
                <Button size="lg" className="bg-black text-white hover:bg-gray-800">
                  $20/mo
                </Button>
              </a>
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="max-w-3xl mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold mb-12">good to know.</h2>

        <Accordion type="single" collapsible className="w-full">
          {faqs.map((faq) => (
            <AccordionItem key={faq.id} value={faq.id}>
              <AccordionTrigger className="text-left hover:no-underline">
                <span className="font-semibold">{faq.question}</span>
              </AccordionTrigger>
              <AccordionContent className="text-gray-700">{faq.answer}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 mt-16 py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <p className="font-bold mb-4">devices</p>
              <ul className="space-y-2 text-sm text-gray-600">
                {devices.map((device) => (
                  <li key={device.id}>
                    <Link href={`/${device.slug}`}>
                      <a className="hover:text-black">{device.displayName}</a>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="font-bold mb-4">product</p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>
                  <Link href="/pro">
                    <a className="hover:text-black">pro</a>
                  </Link>
                </li>
                <li>
                  <Link href="/love">
                    <a className="hover:text-black">wall of love</a>
                  </Link>
                </li>
                <li>
                  <Link href="/changelog">
                    <a className="hover:text-black">changelog</a>
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <p className="font-bold mb-4">legal</p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>
                  <Link href="/terms">
                    <a className="hover:text-black">terms</a>
                  </Link>
                </li>
                <li>
                  <Link href="/privacy">
                    <a className="hover:text-black">privacy</a>
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <p className="text-xs text-gray-500">
                built by{" "}
                <a href="https://ivan.codes" className="hover:text-black">
                  ivan.codes
                </a>
                <br />
                not affiliated with{" "}
                <a href="https://teenage.engineering" className="hover:text-black">
                  TE
                </a>
              </p>
            </div>
          </div>
          <div className="border-t border-gray-200 pt-8 text-xs text-gray-500 text-center">
            <p>teenage manual</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
