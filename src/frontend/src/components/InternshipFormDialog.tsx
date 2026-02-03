import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useAddInternship, useUpdateInternship } from '../hooks/useQueries';
import type { Internship, InternshipInput } from '../backend';

interface InternshipFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  internship?: Internship;
  onSuccess: () => void;
}

export default function InternshipFormDialog({
  open,
  onOpenChange,
  internship,
  onSuccess,
}: InternshipFormDialogProps) {
  const { mutate: addInternship, isPending: isAdding } = useAddInternship();
  const { mutate: updateInternship, isPending: isUpdating } = useUpdateInternship();

  const [formData, setFormData] = useState<InternshipInput>({
    title: '',
    description: '',
    company: '',
    location: '',
    category: '',
    applicationLink: '',
  });

  useEffect(() => {
    if (internship) {
      setFormData({
        title: internship.title,
        description: internship.description,
        company: internship.company,
        location: internship.location,
        category: internship.category,
        applicationLink: internship.applicationLink,
      });
    } else {
      setFormData({
        title: '',
        description: '',
        company: '',
        location: '',
        category: '',
        applicationLink: '',
      });
    }
  }, [internship, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (internship) {
      updateInternship(
        { id: internship.id, input: formData },
        { onSuccess }
      );
    } else {
      addInternship(formData, { onSuccess });
    }
  };

  const isValid = 
    formData.title.trim() &&
    formData.description.trim() &&
    formData.company.trim() &&
    formData.location.trim() &&
    formData.category.trim() &&
    formData.applicationLink.trim();

  const isPending = isAdding || isUpdating;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{internship ? 'Edit Internship' : 'Add New Internship'}</DialogTitle>
          <DialogDescription>
            {internship ? 'Update the internship details below.' : 'Fill in the details to create a new internship listing.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              placeholder="e.g., Software Engineering Intern"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="company">Company *</Label>
            <Input
              id="company"
              placeholder="e.g., Tech Corp"
              value={formData.company}
              onChange={(e) => setFormData({ ...formData, company: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Technical Class *</Label>
              <Input
                id="category"
                placeholder="e.g., Computer Science"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location *</Label>
              <Input
                id="location"
                placeholder="e.g., San Francisco, CA"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              placeholder="Describe the internship role, responsibilities, and requirements..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={5}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="applicationLink">Application Link *</Label>
            <Input
              id="applicationLink"
              type="url"
              placeholder="https://example.com/apply"
              value={formData.applicationLink}
              onChange={(e) => setFormData({ ...formData, applicationLink: e.target.value })}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={!isValid || isPending}>
              {isPending ? 'Saving...' : internship ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
