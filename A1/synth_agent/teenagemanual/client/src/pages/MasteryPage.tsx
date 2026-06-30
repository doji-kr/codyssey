import { useParams, Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckCircle } from "lucide-react";

export default function MasteryPage() {
  const params = useParams<{ slug: string }>();
  const slug = params?.slug || "";

  const { data: device, isLoading: deviceLoading } = trpc.devices.getBySlug.useQuery(
    { slug },
    { enabled: !!slug }
  );

  const { data: guides = [], isLoading: guidesLoading } = trpc.guides.listByDevice.useQuery(
    { deviceId: device?.id || 0 },
    { enabled: !!device?.id }
  );

  if (deviceLoading || guidesLoading) {
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

  const masteryTracks = guides.filter(guide => guide.category === "mastery");
  const otherGuides = guides.filter(guide => guide.category !== "mastery");

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-200 sticky top-0 bg-white z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold text-black hover:opacity-80">
              teenage manual
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-sm font-semibold">{device.displayName}</span>
            <Link href={`/${slug}`} className="text-sm text-gray-600 hover:text-black">Back to Device</Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 py-12 text-center">
        <h1 className="text-4xl font-bold mb-4">Master Your {device.displayName}</h1>
        <p className="text-lg text-gray-700 max-w-2xl mx-auto mb-8">
          Follow step-by-step mastery tracks and guides to unlock the full potential of your {device.displayName}.
        </p>
      </section>

      {/* Mastery Tracks */}
      {masteryTracks.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 py-8">
          <h2 className="text-3xl font-bold mb-6">Mastery Tracks</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {masteryTracks.map((guide) => (
              <Link key={guide.id} href={`/${slug}/guides/${guide.slug}`} className="block">
                  <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer border border-gray-200">
                    <div className="flex items-center mb-3">
                      <CheckCircle className="w-5 h-5 text-orange-500 mr-2" />
                      <h3 className="font-bold text-xl">{guide.title}</h3>
                    </div>
                    <p className="text-gray-600 text-sm">{guide.description}</p>
                    {!guide.isFree && (
                      <span className="mt-3 inline-block bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded-full">Pro Only</span>
                    )}
                  </Card>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Other Guides */}
      {otherGuides.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 py-8">
          <h2 className="text-3xl font-bold mb-6">Other Guides</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {otherGuides.map((guide) => (
              <Link key={guide.id} href={`/${slug}/guides/${guide.slug}`} className="block">
                  <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer border border-gray-200">
                    <h3 className="font-bold text-xl mb-3">{guide.title}</h3>
                    <p className="text-gray-600 text-sm">{guide.description}</p>
                    {!guide.isFree && (
                      <span className="mt-3 inline-block bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded-full">Pro Only</span>
                    )}
                  </Card>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* No Guides Message */}
      {masteryTracks.length === 0 && otherGuides.length === 0 && (
        <section className="max-w-7xl mx-auto px-4 py-12 text-center text-gray-500">
          <p>No mastery tracks or guides available for this device yet.</p>
        </section>
      )}

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
