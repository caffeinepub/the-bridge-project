import { useState } from 'react';
import { useSubmitCompanySurvey } from '../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { CheckCircle2, Loader2, Upload, X, FileText } from 'lucide-react';
import { fileToExternalBlob, formatFileSize } from '../utils/fileToExternalBlob';
import type { ExternalBlob } from '../backend';

interface SurveyFormData {
  businessName: string;
  contactPerson: string;
  emailPhone: string;
  industryType: string;
  industryTypeOther: string;
  awareOfPrograms: string;
  internshipInterest: string;
  helpTypes: string[];
  helpTypesOther: string;
  numberOfInterns: string;
  importantSkills: string;
  suggestions: string;
  followUpContact: string;
}

interface SelectedFile {
  file: File;
  blob?: ExternalBlob;
  uploadProgress: number;
}

export default function CompanyPortalPage() {
  const { mutate: submitSurvey, isPending, isSuccess } = useSubmitCompanySurvey();

  const [formData, setFormData] = useState<SurveyFormData>({
    businessName: '',
    contactPerson: '',
    emailPhone: '',
    industryType: '',
    industryTypeOther: '',
    awareOfPrograms: '',
    internshipInterest: '',
    helpTypes: [],
    helpTypesOther: '',
    numberOfInterns: '',
    importantSkills: '',
    suggestions: '',
    followUpContact: '',
  });

  const [selectedFiles, setSelectedFiles] = useState<SelectedFile[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.businessName.trim()) newErrors.businessName = 'Business name is required';
    if (!formData.contactPerson.trim()) newErrors.contactPerson = 'Contact person is required';
    if (!formData.emailPhone.trim()) newErrors.emailPhone = 'Email/Phone is required';
    if (!formData.industryType) newErrors.industryType = 'Please select an industry type';
    if (formData.industryType === 'Other' && !formData.industryTypeOther.trim()) {
      newErrors.industryTypeOther = 'Please specify the industry type';
    }
    if (!formData.awareOfPrograms) newErrors.awareOfPrograms = 'Please answer this question';
    if (!formData.internshipInterest) newErrors.internshipInterest = 'Please answer this question';
    if (formData.helpTypes.length === 0) newErrors.helpTypes = 'Please select at least one option';
    if (formData.helpTypes.includes('Other') && !formData.helpTypesOther.trim()) {
      newErrors.helpTypesOther = 'Please specify the type of help';
    }
    if (!formData.numberOfInterns) newErrors.numberOfInterns = 'Please select an option';
    if (!formData.importantSkills.trim()) newErrors.importantSkills = 'This field is required';
    if (!formData.followUpContact) newErrors.followUpContact = 'Please answer this question';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newFiles: SelectedFile[] = Array.from(files).map(file => ({
      file,
      uploadProgress: 0,
    }));

    setSelectedFiles(prev => [...prev, ...newFiles]);

    // Convert files to ExternalBlobs
    for (let i = 0; i < newFiles.length; i++) {
      const fileIndex = selectedFiles.length + i;
      try {
        const blob = await fileToExternalBlob(newFiles[i].file, (progress) => {
          setSelectedFiles(prev => {
            const updated = [...prev];
            if (updated[fileIndex]) {
              updated[fileIndex] = { ...updated[fileIndex], uploadProgress: progress };
            }
            return updated;
          });
        });

        setSelectedFiles(prev => {
          const updated = [...prev];
          if (updated[fileIndex]) {
            updated[fileIndex] = { ...updated[fileIndex], blob, uploadProgress: 100 };
          }
          return updated;
        });
      } catch (error) {
        console.error('Failed to process file:', error);
        setSelectedFiles(prev => prev.filter((_, idx) => idx !== fileIndex));
      }
    }

    // Reset input
    e.target.value = '';
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, idx) => idx !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      // Map the detailed survey data to the backend's expected format
      const industryDisplay = formData.industryType === 'Other' 
        ? `Other: ${formData.industryTypeOther}` 
        : formData.industryType;
      
      const helpTypesDisplay = formData.helpTypes.includes('Other')
        ? [...formData.helpTypes.filter(t => t !== 'Other'), `Other: ${formData.helpTypesOther}`]
        : formData.helpTypes;

      const internshipDetails = `
Industry: ${industryDisplay}
Aware of Programs: ${formData.awareOfPrograms}
Internship Interest: ${formData.internshipInterest}
Help Types: ${helpTypesDisplay.join(', ')}
Number of Interns: ${formData.numberOfInterns}
Important Skills: ${formData.importantSkills}
      `.trim();

      // Collect all successfully converted blobs
      const legalDocuments = selectedFiles
        .filter(sf => sf.blob)
        .map(sf => sf.blob!);

      submitSurvey({
        companyName: formData.businessName,
        contactPerson: formData.contactPerson,
        email: formData.emailPhone,
        internshipDetails,
        partnershipInterest: formData.followUpContact === 'Yes',
        additionalComments: formData.suggestions || 'No additional comments provided',
        legalDocuments,
      });
    }
  };

  const handleHelpTypeChange = (value: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      helpTypes: checked ? [...prev.helpTypes, value] : prev.helpTypes.filter((t) => t !== value),
    }));
    if (errors.helpTypes) setErrors({ ...errors, helpTypes: '' });
  };

  if (isSuccess) {
    return (
      <div className="container py-12 flex items-center justify-center min-h-[60vh]">
        <Card className="max-w-md">
          <CardContent className="pt-6 flex flex-col items-center text-center space-y-4">
            <CheckCircle2 className="h-16 w-16 text-green-600" />
            <h2 className="text-2xl font-bold">Survey Submitted!</h2>
            <p className="text-muted-foreground">
              Thank you for your interest in partnering with Grayson Tech students. We will review your submission and
              contact you soon.
            </p>
            <Button onClick={() => window.location.reload()} className="mt-4">
              Submit Another Survey
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container py-12">
      <div className="max-w-3xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Company Partnership Survey</CardTitle>
            <CardDescription className="text-base">
              This survey was created by students at Grayson Tech to understand local business needs and explore
              possible student internship or service partnerships.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Section A - Business Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Section A — Business Information</h3>
                <Separator />

                <div className="space-y-2">
                  <Label htmlFor="businessName">Business/Organization Name *</Label>
                  <Input
                    id="businessName"
                    value={formData.businessName}
                    onChange={(e) => {
                      setFormData({ ...formData, businessName: e.target.value });
                      if (errors.businessName) setErrors({ ...errors, businessName: '' });
                    }}
                  />
                  {errors.businessName && <p className="text-sm text-destructive">{errors.businessName}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contactPerson">Contact Person *</Label>
                  <Input
                    id="contactPerson"
                    value={formData.contactPerson}
                    onChange={(e) => {
                      setFormData({ ...formData, contactPerson: e.target.value });
                      if (errors.contactPerson) setErrors({ ...errors, contactPerson: '' });
                    }}
                  />
                  {errors.contactPerson && <p className="text-sm text-destructive">{errors.contactPerson}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="emailPhone">Email/Phone *</Label>
                  <Input
                    id="emailPhone"
                    value={formData.emailPhone}
                    onChange={(e) => {
                      setFormData({ ...formData, emailPhone: e.target.value });
                      if (errors.emailPhone) setErrors({ ...errors, emailPhone: '' });
                    }}
                  />
                  {errors.emailPhone && <p className="text-sm text-destructive">{errors.emailPhone}</p>}
                </div>

                <div className="space-y-3">
                  <Label>Type of Industry *</Label>
                  <RadioGroup
                    value={formData.industryType}
                    onValueChange={(value) => {
                      setFormData({ ...formData, industryType: value });
                      if (errors.industryType) setErrors({ ...errors, industryType: '' });
                    }}
                  >
                    {['Restaurant/Food Service', 'Media/Marketing', 'Technology/IT', 'Design/Creative', 'Law/Public Safety', 'Other'].map((type) => (
                      <div key={type} className="flex items-center space-x-2">
                        <RadioGroupItem value={type} id={`industry-${type}`} />
                        <Label htmlFor={`industry-${type}`} className="font-normal cursor-pointer">
                          {type}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                  {formData.industryType === 'Other' && (
                    <Input
                      placeholder="Please specify"
                      value={formData.industryTypeOther}
                      onChange={(e) => {
                        setFormData({ ...formData, industryTypeOther: e.target.value });
                        if (errors.industryTypeOther) setErrors({ ...errors, industryTypeOther: '' });
                      }}
                    />
                  )}
                  {errors.industryType && <p className="text-sm text-destructive">{errors.industryType}</p>}
                  {errors.industryTypeOther && <p className="text-sm text-destructive">{errors.industryTypeOther}</p>}
                </div>
              </div>

              {/* Section B - Awareness & Interest */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Section B — Awareness & Interest</h3>
                <Separator />

                <div className="space-y-3">
                  <Label>Before this survey, were you aware that Grayson Tech offers career pathway programs? *</Label>
                  <RadioGroup
                    value={formData.awareOfPrograms}
                    onValueChange={(value) => {
                      setFormData({ ...formData, awareOfPrograms: value });
                      if (errors.awareOfPrograms) setErrors({ ...errors, awareOfPrograms: '' });
                    }}
                  >
                    {['Yes', 'No'].map((option) => (
                      <div key={option} className="flex items-center space-x-2">
                        <RadioGroupItem value={option} id={`aware-${option}`} />
                        <Label htmlFor={`aware-${option}`} className="font-normal cursor-pointer">
                          {option}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                  {errors.awareOfPrograms && <p className="text-sm text-destructive">{errors.awareOfPrograms}</p>}
                </div>

                <div className="space-y-3">
                  <Label>Would you be interested in working with high school students for internships or project-based help? *</Label>
                  <RadioGroup
                    value={formData.internshipInterest}
                    onValueChange={(value) => {
                      setFormData({ ...formData, internshipInterest: value });
                      if (errors.internshipInterest) setErrors({ ...errors, internshipInterest: '' });
                    }}
                  >
                    {['Yes', 'Maybe', 'Not at this time'].map((option) => (
                      <div key={option} className="flex items-center space-x-2">
                        <RadioGroupItem value={option} id={`interest-${option}`} />
                        <Label htmlFor={`interest-${option}`} className="font-normal cursor-pointer">
                          {option}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                  {errors.internshipInterest && <p className="text-sm text-destructive">{errors.internshipInterest}</p>}
                </div>
              </div>

              {/* Section C - Business Needs */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Section C — Business Needs</h3>
                <Separator />

                <div className="space-y-3">
                  <Label>What types of help could students provide? (Check all that apply) *</Label>
                  <div className="space-y-2">
                    {['Photography/Media Content', 'Graphic Design', 'Website or Tech Support', 'Culinary Services', 'Marketing/Social Media', 'Other'].map((type) => (
                      <div key={type} className="flex items-center space-x-2">
                        <Checkbox
                          id={`help-${type}`}
                          checked={formData.helpTypes.includes(type)}
                          onCheckedChange={(checked) => handleHelpTypeChange(type, checked as boolean)}
                        />
                        <Label htmlFor={`help-${type}`} className="font-normal cursor-pointer">
                          {type}
                        </Label>
                      </div>
                    ))}
                  </div>
                  {formData.helpTypes.includes('Other') && (
                    <Input
                      placeholder="Please specify"
                      value={formData.helpTypesOther}
                      onChange={(e) => {
                        setFormData({ ...formData, helpTypesOther: e.target.value });
                        if (errors.helpTypesOther) setErrors({ ...errors, helpTypesOther: '' });
                      }}
                    />
                  )}
                  {errors.helpTypes && <p className="text-sm text-destructive">{errors.helpTypes}</p>}
                  {errors.helpTypesOther && <p className="text-sm text-destructive">{errors.helpTypesOther}</p>}
                </div>

                <div className="space-y-3">
                  <Label>How many student interns or helpers might you consider per semester? *</Label>
                  <RadioGroup
                    value={formData.numberOfInterns}
                    onValueChange={(value) => {
                      setFormData({ ...formData, numberOfInterns: value });
                      if (errors.numberOfInterns) setErrors({ ...errors, numberOfInterns: '' });
                    }}
                  >
                    {['1–2', '3–5', '5+'].map((option) => (
                      <div key={option} className="flex items-center space-x-2">
                        <RadioGroupItem value={option} id={`interns-${option}`} />
                        <Label htmlFor={`interns-${option}`} className="font-normal cursor-pointer">
                          {option}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                  {errors.numberOfInterns && <p className="text-sm text-destructive">{errors.numberOfInterns}</p>}
                </div>
              </div>

              {/* Section D - Feedback */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Section D — Feedback</h3>
                <Separator />

                <div className="space-y-2">
                  <Label htmlFor="importantSkills">What skills are most important for students to have in your workplace? *</Label>
                  <Textarea
                    id="importantSkills"
                    rows={4}
                    value={formData.importantSkills}
                    onChange={(e) => {
                      setFormData({ ...formData, importantSkills: e.target.value });
                      if (errors.importantSkills) setErrors({ ...errors, importantSkills: '' });
                    }}
                  />
                  {errors.importantSkills && <p className="text-sm text-destructive">{errors.importantSkills}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="suggestions">Any suggestions for how students can best support your business?</Label>
                  <Textarea
                    id="suggestions"
                    rows={4}
                    value={formData.suggestions}
                    onChange={(e) => setFormData({ ...formData, suggestions: e.target.value })}
                  />
                </div>
              </div>

              {/* Legal Documents Upload Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Legal Document Submissions</h3>
                <Separator />
                
                <div className="space-y-3">
                  <Label htmlFor="legalDocuments">Upload Legal Documents (Optional)</Label>
                  <p className="text-sm text-muted-foreground">
                    Upload any legal documents related to your internship program (e.g., agreements, liability waivers, etc.)
                  </p>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => document.getElementById('legalDocuments')?.click()}
                      className="gap-2"
                    >
                      <Upload className="h-4 w-4" />
                      Select Files
                    </Button>
                    <Input
                      id="legalDocuments"
                      type="file"
                      multiple
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                  </div>

                  {/* Selected Files List */}
                  {selectedFiles.length > 0 && (
                    <div className="space-y-2 mt-4">
                      <p className="text-sm font-medium">Selected Files ({selectedFiles.length})</p>
                      <div className="space-y-2">
                        {selectedFiles.map((selectedFile, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-3 border rounded-lg bg-muted/50"
                          >
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                              <FileText className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">{selectedFile.file.name}</p>
                                <p className="text-xs text-muted-foreground">
                                  {formatFileSize(selectedFile.file.size)}
                                  {selectedFile.uploadProgress < 100 && ` • ${selectedFile.uploadProgress}%`}
                                </p>
                              </div>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeFile(index)}
                              className="flex-shrink-0"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Section E - Follow-Up */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Section E — Follow-Up</h3>
                <Separator />

                <div className="space-y-3">
                  <Label>Would you like a student or teacher to contact you about partnership opportunities? *</Label>
                  <RadioGroup
                    value={formData.followUpContact}
                    onValueChange={(value) => {
                      setFormData({ ...formData, followUpContact: value });
                      if (errors.followUpContact) setErrors({ ...errors, followUpContact: '' });
                    }}
                  >
                    {['Yes', 'No'].map((option) => (
                      <div key={option} className="flex items-center space-x-2">
                        <RadioGroupItem value={option} id={`followup-${option}`} />
                        <Label htmlFor={`followup-${option}`} className="font-normal cursor-pointer">
                          {option}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                  {errors.followUpContact && <p className="text-sm text-destructive">{errors.followUpContact}</p>}
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={isPending}>
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  'Submit Survey'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
