import { useParams, Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";

export default function DeviceDetail() {
  const params = useParams<{ slug: string }>();
  const slug = params?.slug || "";

  const { data: device, isLoading: deviceLoading } = trpc.devices.getBySlug.useQuery(
    { slug },
    { enabled: !!slug }
  );

  const { data: guides = [] } = trpc.guides.listByDevice.useQuery(
    { deviceId: device?.id || 0 },
    { enabled: !!device?.id }
  );

  const { data: faqs = [] } = trpc.faqs.listByDevice.useQuery(
    { deviceId: device?.id || 0 },
    { enabled: !!device?.id }
  );

  if (deviceLoading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <Skeleton className="h-12 w-32 mb-8" />
          <Skeleton className="h-96 w-full mb-8" />
        </div>
      </div>
    );
  }

  if (!device) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Device not found</h1>
          <Link href="/">
            <a>
              <Button>Back to home</Button>
            </a>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header with device selector */}
      <header className="border-b border-gray-200 sticky top-0 bg-white z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/">
            <a className="text-2xl font-bold text-black hover:opacity-80">
              teenage manual
            </a>
          </Link>
          <nav className="flex gap-6 items-center">
            <Link href={`/${slug}/ask`}>
              <a className="text-sm text-gray-600 hover:text-black">ASK AI</a>
            </Link>
            <Link href={`/${slug}/mastery`}>
              <a className="text-sm text-gray-600 hover:text-black">MASTERY</a>
            </Link>
            <a href="#" className="text-sm text-gray-600 hover:text-black">
              SIGN IN
            </a>
          </nav>
        </div>
      </header>

      {/* Device Hero */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid md:grid-cols-2 gap-12 items-start">
          {/* Device Image */}
          <div className="bg-gray-100 rounded-lg h-96 flex items-center justify-center">
            <div className="text-center">
              <p className="text-gray-400 text-sm">Device Image</p>
              <p className="text-gray-600 font-semibold mt-2">{device.displayName}</p>
            </div>
          </div>

          {/* Device Info */}
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">
              {device.category}
            </p>
            <h1 className="text-4xl font-bold mb-4">{device.displayName}</h1>
            <p className="text-lg text-gray-700 mb-8">{device.description}</p>

            <div className="space-y-4">
              <Link href={`/${slug}/ask`}>
                <a>
                  <Button size="lg" className="w-full bg-black text-white hover:bg-gray-800">
                    ◆ Ask AI
                  </Button>
                </a>
              </Link>
              <Link href={`/${slug}/mastery`}>
                <a>
                  <Button size="lg" variant="outline" className="w-full">
                    ▦ Mastery
                  </Button>
                </a>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Tabs for Guides and FAQs */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <Tabs defaultValue="guides" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="guides">How-To Guides</TabsTrigger>
            <TabsTrigger value="faqs">Common Questions</TabsTrigger>
          </TabsList>

          {/* Guides Tab */}
          <TabsContent value="guides">
            <div className="space-y-4">
              {guides.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No guides available yet.</p>
              ) : (
                guides.map((guide) => (
                  <Link key={guide.id} href={`/${slug}/guides/${guide.slug}`}>
                    <a>
                      <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer border border-gray-200">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-bold text-lg mb-2">{guide.title}</h3>
                            <p className="text-gray-600 text-sm">{guide.description}</p>
                          </div>
                          <span className="text-xs bg-gray-100 px-3 py-1 rounded">
                            {guide.category}
                          </span>
                        </div>
                      </Card>
                    </a>
                  </Link>
                ))
              )}
            </div>
          </TabsContent>

          {/* FAQs Tab */}
          <TabsContent value="faqs">
            <div className="space-y-4">
              {faqs.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No FAQs available yet.</p>
              ) : (
                faqs.map((faq) => (
                  <Card key={faq.id} className="p-6 border border-gray-200">
                    <h3 className="font-bold text-lg mb-3">{faq.question}</h3>
                    <p className="text-gray-700 leading-relaxed">{faq.answer}</p>
                    {faq.category && (
                      <p className="text-xs text-gray-500 mt-3">Category: {faq.category}</p>
                    )}
                  </Card>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 mt-16 py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center text-sm text-gray-500">
            <p>teenage manual - the field guide to small machines</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
