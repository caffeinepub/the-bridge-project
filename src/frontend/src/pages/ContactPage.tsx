import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Mail, Send, CheckCircle2, Loader2 } from 'lucide-react';
import { useSubmitContactForm } from '../hooks/useQueries';

export default function ContactPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const { mutate: submitForm, isPending } = useSubmitContactForm();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    submitForm(
      { name, email, message },
      {
        onSuccess: () => {
          setSubmitted(true);
          setName('');
          setEmail('');
          setMessage('');
          setTimeout(() => setSubmitted(false), 5000);
        },
      }
    );
  };

  const isFormValid = name.trim() && email.trim() && message.trim();

  return (
    <div className="container py-12">
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Hero Section */}
        <div className="text-center space-y-4">
          <h1 className="text-5xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Contact Us
          </h1>
          <p className="text-xl text-muted-foreground">
            We'd love to hear from you. Get in touch with The Bridge Project team.
          </p>
        </div>

        {/* Contact Email Card */}
        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-primary" />
              Email Us Directly
            </CardTitle>
            <CardDescription>
              For immediate inquiries, reach out to us at:
            </CardDescription>
          </CardHeader>
          <CardContent>
            <a
              href="mailto:gtpthebridge@gmail.com"
              className="text-lg font-semibold text-primary hover:underline"
            >
              gtpthebridge@gmail.com
            </a>
          </CardContent>
        </Card>

        {/* Contact Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Send className="h-5 w-5 text-primary" />
              Send Us a Message
            </CardTitle>
            <CardDescription>
              Fill out the form below and we'll get back to you as soon as possible.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {submitted ? (
              // Success View
              <div className="flex flex-col items-center justify-center py-12 space-y-4">
                <CheckCircle2 className="h-16 w-16 text-green-500" />
                <h3 className="text-2xl font-semibold">Thank You!</h3>
                <p className="text-muted-foreground text-center">
                  Your message has been received. We'll get back to you soon.
                </p>
              </div>
            ) : (
              // Contact Form
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Your full name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your.email@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">Message *</Label>
                  <Textarea
                    id="message"
                    placeholder="Tell us how we can help you..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={6}
                    required
                  />
                </div>

                <Button
                  type="submit"
                  size="lg"
                  className="w-full gap-2"
                  disabled={!isFormValid || isPending}
                >
                  {isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      Send Message
                    </>
                  )}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>

        {/* Additional Info */}
        <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 rounded-2xl p-8 text-center space-y-2">
          <h3 className="text-xl font-semibold">Questions About Internships?</h3>
          <p className="text-muted-foreground">
            Whether you're a student looking for opportunities or a business interested in partnering with us, we're here to help connect you with the right resources.
          </p>
        </div>
      </div>
    </div>
  );
}
