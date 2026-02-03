import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Target, Heart, Handshake } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="container py-12">
      <div className="max-w-4xl mx-auto space-y-12">
        {/* Hero Section */}
        <div className="text-center space-y-4">
          <h1 className="text-5xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            About The Bridge Project
          </h1>
          <p className="text-xl text-muted-foreground">
            Connecting Grayson Tech students with real-world opportunities
          </p>
        </div>

        {/* Mission Statement */}
        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2">
              <Target className="h-6 w-6 text-primary" />
              Our Mission
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-lg leading-relaxed">
            <p>
              The Bridge Project serves as a vital connection between Grayson Technical High School students and the professional world. We are dedicated to providing technical education students with meaningful internship opportunities that align with their career aspirations and academic pursuits.
            </p>
            <p>
              Our platform bridges the gap between classroom learning and real-world experience, helping students discover their potential and build the foundation for successful careers in their chosen technical fields.
            </p>
          </CardContent>
        </Card>

        {/* Key Features Grid */}
        <div className="grid gap-6 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                For Students
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Grayson Tech students gain access to curated internship opportunities across 12 technical disciplines, from Culinary Arts to Cybersecurity.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Handshake className="h-5 w-5 text-primary" />
                Community Partners
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Local businesses and organizations partner with us to provide hands-on learning experiences and help shape the next generation of skilled professionals.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="h-5 w-5 text-primary" />
                Building Futures
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                We believe in the power of experiential learning to transform lives and strengthen our community through meaningful career pathways.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Technical Programs */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Technical Programs We Serve</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {[
                'Culinary Arts',
                'Networking & Cloud Computing',
                'Commercial Photography',
                'Audio-Video Technology & Film',
                'Music Industry',
                'Graphic Design',
                'Law & Justice',
                'Veterinary Science',
                'Sports Medicine',
                'Cybersecurity',
                'Entrepreneurship',
                'Exercise Physiology',
              ].map((program) => (
                <div
                  key={program}
                  className="flex items-center gap-2 p-3 rounded-lg bg-primary/5 border border-primary/10"
                >
                  <div className="h-2 w-2 rounded-full bg-primary" />
                  <span className="text-sm font-medium">{program}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Call to Action */}
        <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 rounded-2xl p-8 text-center space-y-4">
          <h2 className="text-2xl font-bold">Join Us in Building Bridges</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Whether you're a student seeking opportunities or a business looking to invest in the future workforce, The Bridge Project is here to connect you with the right resources.
          </p>
        </div>
      </div>
    </div>
  );
}
