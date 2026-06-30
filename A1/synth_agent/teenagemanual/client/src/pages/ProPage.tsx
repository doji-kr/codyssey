import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Check } from "lucide-react";

export default function ProPage() {
  const features = [
    {
      category: "Free",
      price: "$0",
      description: "Get started with the basics",
      features: [
        "Ask questions every day",
        "Access to all 9 devices",
        "Basic guides",
        "Community support",
      ],
      cta: "Current Plan",
      highlighted: false,
    },
    {
      category: "Pro",
      price: "$20",
      period: "/month",
      description: "Everything you need to master your gear",
      features: [
        "Unlimited questions",
        "Full mastery curriculum",
        "Smartest AI model",
        "Priority support",
        "Advanced guides",
        "Cancel anytime",
      ],
      cta: "Upgrade to Pro",
      highlighted: true,
    },
  ];

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
            <Link href="/">
              <a className="text-sm text-gray-600 hover:text-black">HOME</a>
            </Link>
            <a href="#" className="text-sm text-gray-600 hover:text-black">
              SIGN IN
            </a>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-4 py-16 md:py-24">
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            Go further,
            <br />
            <span className="text-orange-500">unlimited.</span>
          </h1>
          <p className="text-xl text-gray-700 max-w-2xl mx-auto">
            Unlock the full potential of your Teenage Engineering device with Pro. Get unlimited
            questions, the complete mastery curriculum, and access to the smartest AI model.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-16">
          {features.map((plan) => (
            <div
              key={plan.category}
              className={`rounded-lg border-2 p-8 transition-all ${
                plan.highlighted
                  ? "border-orange-500 bg-orange-50 shadow-lg"
                  : "border-gray-200 bg-white"
              }`}
            >
              <h2 className="text-2xl font-bold mb-2">{plan.category}</h2>
              <p className="text-gray-600 text-sm mb-6">{plan.description}</p>

              <div className="mb-8">
                <span className="text-4xl font-bold">{plan.price}</span>
                {plan.period && <span className="text-gray-600">{plan.period}</span>}
              </div>

              <Button
                size="lg"
                className={`w-full mb-8 ${
                  plan.highlighted
                    ? "bg-black text-white hover:bg-gray-800"
                    : "border border-gray-300 bg-white text-black hover:bg-gray-50"
                }`}
              >
                {plan.cta}
              </Button>

              <div className="space-y-4">
                {plan.features.map((feature) => (
                  <div key={feature} className="flex gap-3 items-start">
                    <Check className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold mb-12 text-center">Questions about Pro?</h2>

          <div className="space-y-8">
            <div>
              <h3 className="text-xl font-bold mb-3">Can I cancel anytime?</h3>
              <p className="text-gray-700">
                Yes. Pro is month-to-month and you can cancel whenever you like, no questions
                asked. Your access continues until the end of your billing period.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-bold mb-3">What's included in the mastery curriculum?</h3>
              <p className="text-gray-700">
                The mastery curriculum includes step-by-step guided tracks for each device. You'll
                learn move by move with interactive diagrams showing exactly which control to use.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-bold mb-3">What's the difference in the AI model?</h3>
              <p className="text-gray-700">
                Pro uses our smartest AI model, which provides more detailed and nuanced answers
                grounded in the official device manuals. Free users get accurate answers too, but
                with a daily question limit.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-bold mb-3">Do I get priority support?</h3>
              <p className="text-gray-700">
                Yes. Pro members get priority email support. We'll respond to your questions and
                feedback faster than free users.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-bold mb-3">Can I upgrade from free to Pro?</h3>
              <p className="text-gray-700">
                Absolutely. You can upgrade anytime from your account settings. Your upgrade takes
                effect immediately.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-bold mb-3">Is there a refund policy?</h3>
              <p className="text-gray-700">
                We offer a 7-day money-back guarantee. If you're not satisfied with Pro, contact
                us within 7 days of your purchase for a full refund.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-orange-50 py-16 my-16">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to master your gear?</h2>
          <p className="text-lg text-gray-700 mb-8">
            Join thousands of musicians who use teenage manual to learn their devices faster.
          </p>
          <Button size="lg" className="bg-black text-white hover:bg-gray-800">
            Upgrade to Pro Now
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div>
              <p className="font-bold mb-4">Product</p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>
                  <Link href="/">
                    <a className="hover:text-black">Home</a>
                  </Link>
                </li>
                <li>
                  <Link href="/pro">
                    <a className="hover:text-black">Pro</a>
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <p className="font-bold mb-4">Legal</p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>
                  <a href="#" className="hover:text-black">
                    Terms
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-black">
                    Privacy
                  </a>
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
