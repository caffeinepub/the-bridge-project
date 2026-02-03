import { useGetAllCompanySubmissions } from '../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, Building2, Mail, User, FileText, CheckCircle2, XCircle, Download, File } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

export default function AdminCompanySubmissionsPage() {
  const { data: submissions = [], isLoading, error } = useGetAllCompanySubmissions();

  if (isLoading) {
    return (
      <div className="container py-12 flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading submissions...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-12">
        <Card className="max-w-2xl mx-auto border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">Error Loading Submissions</CardTitle>
            <CardDescription>
              {error instanceof Error ? error.message : 'Failed to load company submissions'}
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="container py-12">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Company Survey Submissions</h1>
          <p className="text-muted-foreground mt-1">
            Review partnership interest and internship opportunities ({submissions.length} total)
          </p>
        </div>

        {/* Submissions List */}
        {submissions.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Building2 className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground text-center">
                No company survey submissions yet. Companies can submit surveys through the Company Portal.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {submissions.map((submission) => (
              <Card key={Number(submission.id)} className="overflow-hidden">
                <CardHeader className="bg-muted/50">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <CardTitle className="text-xl">{submission.companyName}</CardTitle>
                        <Badge variant={submission.partnershipInterest ? 'default' : 'secondary'}>
                          {submission.partnershipInterest ? (
                            <span className="flex items-center gap-1">
                              <CheckCircle2 className="h-3 w-3" />
                              Interested in Partnership
                            </span>
                          ) : (
                            <span className="flex items-center gap-1">
                              <XCircle className="h-3 w-3" />
                              Not Interested
                            </span>
                          )}
                        </Badge>
                      </div>
                      <CardDescription className="text-xs">
                        Submission ID: {Number(submission.id)}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4 pt-6">
                  {/* Contact Information */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm font-medium">
                        <User className="h-4 w-4 text-muted-foreground" />
                        Contact Person
                      </div>
                      <p className="text-sm text-muted-foreground pl-6">{submission.contactPerson}</p>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm font-medium">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        Email
                      </div>
                      <a
                        href={`mailto:${submission.email}`}
                        className="text-sm text-primary hover:underline pl-6 block"
                      >
                        {submission.email}
                      </a>
                    </div>
                  </div>

                  <Separator />

                  {/* Internship Details */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      Internship Details
                    </div>
                    <p className="text-sm text-muted-foreground pl-6 whitespace-pre-wrap">
                      {submission.internshipDetails}
                    </p>
                  </div>

                  {/* Legal Documents */}
                  <Separator />
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <File className="h-4 w-4 text-muted-foreground" />
                      Legal Documents
                    </div>
                    {submission.legalDocuments && submission.legalDocuments.length > 0 ? (
                      <div className="space-y-2 pl-6">
                        {submission.legalDocuments.map((doc, index) => {
                          const directUrl = doc.getDirectURL();
                          const fileName = `Document_${index + 1}`;
                          
                          return (
                            <div
                              key={index}
                              className="flex items-center justify-between p-3 border rounded-lg bg-muted/30"
                            >
                              <div className="flex items-center gap-3">
                                <FileText className="h-5 w-5 text-muted-foreground" />
                                <div>
                                  <p className="text-sm font-medium">{fileName}</p>
                                  <p className="text-xs text-muted-foreground">Legal document</p>
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => window.open(directUrl, '_blank')}
                                  className="gap-2"
                                >
                                  <Download className="h-4 w-4" />
                                  View/Download
                                </Button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground pl-6 italic">
                        No documents uploaded
                      </p>
                    )}
                  </div>

                  {/* Additional Comments */}
                  {submission.additionalComments && submission.additionalComments.trim() !== '' && (
                    <>
                      <Separator />
                      <div className="space-y-2">
                        <div className="text-sm font-medium">Additional Comments</div>
                        <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                          {submission.additionalComments}
                        </p>
                      </div>
                    </>
                  )}

                  {/* Metadata */}
                  <Separator />
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Submitted by: {submission.submittedBy.toString().slice(0, 20)}...</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
