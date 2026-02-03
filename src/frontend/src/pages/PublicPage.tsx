import { useState, useMemo, useEffect } from 'react';
import { useGetInternships, useGetCategoryCounts } from '../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ExternalLink, MapPin, Building2, Loader2, Lock } from 'lucide-react';
import type { Internship } from '../backend';
import { useSearch } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';

export default function PublicPage() {
  const { identity, login, loginStatus } = useInternetIdentity();
  const isAuthenticated = !!identity;
  
  const { data: internships = [], isLoading: internshipsLoading } = useGetInternships();
  const { data: categoryCounts = [], isLoading: countsLoading } = useGetCategoryCounts();
  
  const search = useSearch({ strict: false }) as { category?: string };
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // For authenticated users: derive categories from internships
  const authenticatedCategories = useMemo(() => {
    if (!isAuthenticated) return [];
    const cats = new Set(internships.map((i) => i.category));
    return ['all', ...Array.from(cats).sort()];
  }, [internships, isAuthenticated]);

  // For unauthenticated users: derive categories from counts
  const unauthenticatedCategories = useMemo(() => {
    if (isAuthenticated) return [];
    const cats = categoryCounts.map(c => c.category).sort();
    return ['all', ...cats];
  }, [categoryCounts, isAuthenticated]);

  const categories = isAuthenticated ? authenticatedCategories : unauthenticatedCategories;

  // Set initial category from URL search params
  useEffect(() => {
    if (search?.category && categories.includes(search.category)) {
      setSelectedCategory(search.category);
    }
  }, [search?.category, categories]);

  const filteredInternships = useMemo(() => {
    if (!isAuthenticated) return [];
    if (selectedCategory === 'all') return internships;
    return internships.filter((i) => i.category === selectedCategory);
  }, [internships, selectedCategory, isAuthenticated]);

  // Calculate count for selected category (unauthenticated view)
  const selectedCategoryCount = useMemo(() => {
    if (isAuthenticated) return 0;
    if (selectedCategory === 'all') {
      return categoryCounts.reduce((sum, cat) => sum + Number(cat.count), 0);
    }
    const categoryData = categoryCounts.find(c => c.category === selectedCategory);
    return categoryData ? Number(categoryData.count) : 0;
  }, [selectedCategory, categoryCounts, isAuthenticated]);

  const isLoading = isAuthenticated ? internshipsLoading : countsLoading;

  const handleLogin = async () => {
    try {
      await login();
    } catch (error: any) {
      console.error('Login error:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="container py-12 flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading internships...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-12">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Hero Section */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold tracking-tight">Find Your Perfect Internship</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Explore technical internship opportunities across various fields and companies
          </p>
        </div>

        {/* Category Filter */}
        <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="w-full">
          <TabsList className="w-full justify-start overflow-x-auto flex-wrap h-auto gap-2 bg-muted/50 p-2">
            {categories.map((cat) => (
              <TabsTrigger key={cat} value={cat} className="capitalize">
                {cat === 'all' ? 'All Categories' : cat}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value={selectedCategory} className="mt-8">
            {!isAuthenticated ? (
              // Unauthenticated View: Show count and login CTA
              <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-primary/10">
                <CardContent className="flex flex-col items-center justify-center py-16 space-y-6">
                  <div className="rounded-full bg-primary/10 p-6">
                    <Lock className="h-12 w-12 text-primary" />
                  </div>
                  <div className="text-center space-y-2">
                    <h3 className="text-2xl font-bold">
                      {selectedCategoryCount} internship{selectedCategoryCount !== 1 ? 's' : ''} available
                      {selectedCategory !== 'all' && ` in ${selectedCategory}`}!
                    </h3>
                    <p className="text-muted-foreground max-w-md">
                      Log in or sign up to view full internship details, company information, and application links.
                    </p>
                  </div>
                  <Button 
                    size="lg" 
                    onClick={handleLogin}
                    disabled={loginStatus === 'logging-in'}
                    className="gap-2"
                  >
                    {loginStatus === 'logging-in' ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Logging in...
                      </>
                    ) : (
                      'Log in / Sign up'
                    )}
                  </Button>
                </CardContent>
              </Card>
            ) : filteredInternships.length === 0 ? (
              // Authenticated View: No internships
              <Card className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <p className="text-muted-foreground text-center">
                    No internships available in this category yet.
                  </p>
                </CardContent>
              </Card>
            ) : (
              // Authenticated View: Show internship cards
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredInternships.map((internship) => (
                  <InternshipCard key={Number(internship.id)} internship={internship} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function InternshipCard({ internship }: { internship: Internship }) {
  return (
    <Card className="flex flex-col hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-lg line-clamp-2">{internship.title}</CardTitle>
          <Badge variant="secondary" className="shrink-0">
            {internship.category}
          </Badge>
        </div>
        <CardDescription className="flex items-center gap-2 mt-2">
          <Building2 className="h-4 w-4" />
          {internship.company}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col gap-4">
        <p className="text-sm text-muted-foreground line-clamp-3">{internship.description}</p>
        
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <MapPin className="h-4 w-4" />
          {internship.location}
        </div>

        <Button asChild className="w-full mt-auto gap-2">
          <a href={internship.applicationLink} target="_blank" rel="noopener noreferrer">
            Apply Now
            <ExternalLink className="h-4 w-4" />
          </a>
        </Button>
      </CardContent>
    </Card>
  );
}
