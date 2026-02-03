import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { AccountType, UserProfile } from '../backend';
import { GraduationCap, Building2 } from 'lucide-react';

interface ProfileSetupModalProps {
  onSave: (profile: UserProfile) => void;
}

export default function ProfileSetupModal({ onSave }: ProfileSetupModalProps) {
  const [name, setName] = useState('');
  const [accountType, setAccountType] = useState<AccountType | ''>('');
  const [email, setEmail] = useState('');
  const [emailType, setEmailType] = useState<'personal' | 'school'>('personal');
  const [errors, setErrors] = useState<{ name?: string; email?: string; accountType?: string }>({});

  const validateForm = (): boolean => {
    const newErrors: { name?: string; email?: string; accountType?: string } = {};

    if (!name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!accountType) {
      newErrors.accountType = 'Please select an account type';
    }

    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!email.includes('@')) {
      newErrors.email = 'Please enter a valid email address';
    } else if (accountType === AccountType.student && emailType === 'school') {
      if (!email.endsWith('@g.gcksp12.org')) {
        newErrors.email = 'School email must end with @g.gcksp12.org';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm() && accountType) {
      onSave({
        name: name.trim(),
        email: email.trim(),
        accountType: accountType as AccountType,
      });
    }
  };

  return (
    <Dialog open={true}>
      <DialogContent className="sm:max-w-md" onPointerDownOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>Welcome to The Bridge Project</DialogTitle>
          <DialogDescription>
            Please complete your profile to get started.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Your Name *</Label>
            <Input
              id="name"
              placeholder="Enter your name"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (errors.name) setErrors({ ...errors, name: undefined });
              }}
              autoFocus
            />
            {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
          </div>

          {/* Account Type */}
          <div className="space-y-3">
            <Label>Account Type *</Label>
            <RadioGroup
              value={accountType}
              onValueChange={(value) => {
                setAccountType(value as AccountType);
                if (errors.accountType) setErrors({ ...errors, accountType: undefined });
              }}
              className="grid grid-cols-2 gap-4"
            >
              <div>
                <RadioGroupItem value={AccountType.student} id="student" className="peer sr-only" />
                <Label
                  htmlFor="student"
                  className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                >
                  <GraduationCap className="mb-3 h-6 w-6" />
                  <span className="text-sm font-medium">Student</span>
                </Label>
              </div>
              <div>
                <RadioGroupItem value={AccountType.company} id="company" className="peer sr-only" />
                <Label
                  htmlFor="company"
                  className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                >
                  <Building2 className="mb-3 h-6 w-6" />
                  <span className="text-sm font-medium">Company</span>
                </Label>
              </div>
            </RadioGroup>
            {errors.accountType && <p className="text-sm text-destructive">{errors.accountType}</p>}
          </div>

          {/* Email - Student */}
          {accountType === AccountType.student && (
            <div className="space-y-3">
              <Label>Email Type *</Label>
              <RadioGroup value={emailType} onValueChange={(value) => setEmailType(value as 'personal' | 'school')}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="personal" id="personal" />
                  <Label htmlFor="personal" className="font-normal cursor-pointer">Personal Email</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="school" id="school" />
                  <Label htmlFor="school" className="font-normal cursor-pointer">School Email (@g.gcksp12.org)</Label>
                </div>
              </RadioGroup>
              <Input
                id="email"
                type="email"
                placeholder={emailType === 'school' ? 'yourname@g.gcksp12.org' : 'your.email@example.com'}
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email) setErrors({ ...errors, email: undefined });
                }}
              />
              {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
            </div>
          )}

          {/* Email - Company */}
          {accountType === AccountType.company && (
            <div className="space-y-2">
              <Label htmlFor="email">Company Contact Email *</Label>
              <Input
                id="email"
                type="email"
                placeholder="contact@company.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email) setErrors({ ...errors, email: undefined });
                }}
              />
              {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
            </div>
          )}

          <Button type="submit" className="w-full">
            Complete Profile
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
