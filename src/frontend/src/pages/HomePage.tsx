import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate } from '@tanstack/react-router';
import { ArrowRight, ChevronDown, ChevronUp } from 'lucide-react';

const categories = [
  {
    name: 'Culinary Arts',
    icon: '/assets/generated/culinary-arts-icon-transparent.dim_64x64.png',
    description: 'Explore culinary and hospitality opportunities',
    fullDescription: 'Provides internship opportunities in professional kitchens, bakeries, and hospitality settings. Students gain hands-on experience in food preparation, safety, and menu development. These experiences help build industry knowledge and teamwork skills.',
  },
  {
    name: 'Networking & Cloud Computing',
    icon: '/assets/generated/networking-cloud-icon-transparent.dim_64x64.png',
    description: 'Network infrastructure and cloud technologies',
    fullDescription: 'Offers internships focused on network systems, cloud services, and IT support. Students develop technical skills in troubleshooting, system management, and cloud platforms. These opportunities prepare students for careers in modern technology environments.',
  },
  {
    name: 'Commercial Photography',
    icon: '/assets/generated/photography-camera-icon-transparent.dim_64x64.png',
    description: 'Professional photography and visual media',
    fullDescription: 'Connects students with internships in studio, product, and marketing photography. Students build technical skills in lighting, editing, and camera operation. These experiences help strengthen creativity and client collaboration skills.',
  },
  {
    name: 'Audio-Video Technology & Film',
    icon: '/assets/generated/film-video-icon-transparent.dim_64x64.png',
    description: 'Film production and multimedia technology',
    fullDescription: 'Provides internships in video production, broadcasting, and film editing. Students learn production workflows including filming, sound design, and post-production. These opportunities help prepare students for careers in media and entertainment.',
  },
  {
    name: 'Music Industry',
    icon: '/assets/generated/music-industry-icon-transparent.dim_64x64.png',
    description: 'Music production and industry careers',
    fullDescription: 'Offers internships in recording studios, event promotion, and music production. Students gain experience in sound engineering, marketing, and music business operations. These opportunities help build professional connections in the entertainment industry.',
  },
  {
    name: 'Graphic Design',
    icon: '/assets/generated/graphic-design-icon-transparent.dim_64x64.png',
    description: 'Visual design and creative media',
    fullDescription: 'Provides internships in branding, advertising, and digital media design. Students strengthen skills in design software, visual communication, and creative development. These experiences prepare students for real-world design projects and marketing work.',
  },
  {
    name: 'Law & Justice',
    icon: '/assets/generated/law-justice-icon-transparent.dim_64x64.png',
    description: 'Legal studies and criminal justice',
    fullDescription: 'Connects students with internships in legal offices, law enforcement agencies, and public service organizations. Students gain exposure to legal procedures, case preparation, and justice system operations. These experiences help develop research, communication, and critical thinking skills.',
  },
  {
    name: 'Veterinary Science',
    icon: '/assets/generated/veterinary-icon-transparent.dim_64x64.png',
    description: 'Animal care and veterinary medicine',
    fullDescription: 'Offers internships in animal clinics, hospitals, shelters, and research facilities. Students gain hands-on experience in animal care, clinical support, and medical procedures. These opportunities help prepare students for careers in veterinary and animal health fields.',
  },
  {
    name: 'Sports Medicine',
    icon: '/assets/generated/sports-medicine-icon-transparent.dim_64x64.png',
    description: 'Athletic training and sports healthcare',
    fullDescription: 'Provides internships focused on athletic training, rehabilitation, and injury prevention. Students gain experience working with athletes, recovery programs, and performance improvement techniques. These opportunities help build knowledge in sports health and physical therapy.',
  },
  {
    name: 'Cybersecurity',
    icon: '/assets/generated/cybersecurity-icon-transparent.dim_64x64.png',
    description: 'Information security and cyber defense',
    fullDescription: 'Connects students with internships in information security, ethical hacking, and risk management. Students develop skills in threat detection, data protection, and network security practices. These experiences prepare students to help protect digital systems and organizations.',
  },
  {
    name: 'Entrepreneurship',
    icon: '/assets/generated/entrepreneurship-icon-transparent.dim_64x64.png',
    description: 'Business development and startups',
    fullDescription: 'Offers internships with startups, small businesses, and innovation-focused organizations. Students learn business planning, marketing strategies, and financial management. These opportunities help develop leadership, creativity, and problem-solving skills.',
  },
  {
    name: 'Exercise Physiology',
    icon: '/assets/generated/exercise-physiology-icon-transparent.dim_64x64.png',
    description: 'Fitness science and human performance',
    fullDescription: 'Provides internships in fitness centers, rehabilitation clinics, and wellness programs. Students gain experience in fitness assessment, program development, and performance analysis. These opportunities help build knowledge in human physiology and health improvement.',
  },
];

export default function HomePage() {
  const navigate = useNavigate();
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  const handleCategoryClick = (categoryName: string) => {
    navigate({ 
      to: '/internships',
      search: { category: categoryName }
    });
  };

  const toggleExpand = (categoryName: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedCategory(expandedCategory === categoryName ? null : categoryName);
  };

  return (
    <div className="container py-12">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Hero Section */}
        <div className="text-center space-y-6">
          <h1 className="text-5xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Discover Your Future Career
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Explore technical internship opportunities across diverse fields. Choose your path and start your professional journey today.
          </p>
          <Button 
            size="lg" 
            onClick={() => navigate({ to: '/internships' })}
            className="gap-2 text-lg px-8 py-6"
          >
            Browse All Internships
            <ArrowRight className="h-5 w-5" />
          </Button>
        </div>

        {/* Categories Grid */}
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight">Explore by Category</h2>
            <p className="text-muted-foreground mt-2">
              Select a field to view relevant internship opportunities
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {categories.map((category) => (
              <Card
                key={category.name}
                className="group transition-all hover:shadow-xl hover:border-primary/50"
              >
                <CardHeader className="space-y-4">
                  <div className="flex items-center justify-center w-16 h-16 mx-auto rounded-2xl bg-primary/10 group-hover:bg-primary/20 transition-colors">
                    <img 
                      src={category.icon} 
                      alt={category.name}
                      className="w-12 h-12 object-contain"
                    />
                  </div>
                  <CardTitle className="text-center text-lg group-hover:text-primary transition-colors">
                    {category.name}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <CardDescription className="text-center">
                    {category.description}
                  </CardDescription>
                  
                  {expandedCategory === category.name && (
                    <div className="pt-2 border-t">
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {category.fullDescription}
                      </p>
                    </div>
                  )}
                  
                  <div className="flex gap-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 gap-1"
                      onClick={(e) => toggleExpand(category.name, e)}
                    >
                      {expandedCategory === category.name ? (
                        <>
                          <ChevronUp className="h-4 w-4" />
                          Less
                        </>
                      ) : (
                        <>
                          <ChevronDown className="h-4 w-4" />
                          More
                        </>
                      )}
                    </Button>
                    <Button
                      size="sm"
                      className="flex-1 gap-1"
                      onClick={() => handleCategoryClick(category.name)}
                    >
                      View Jobs
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Call to Action */}
        <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 rounded-2xl p-12 text-center space-y-4">
          <h2 className="text-3xl font-bold">Ready to Get Started?</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Browse through hundreds of internship opportunities and find the perfect match for your skills and interests.
          </p>
          <Button 
            size="lg" 
            onClick={() => navigate({ to: '/internships' })}
            className="gap-2"
          >
            View All Opportunities
            <ArrowRight className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
