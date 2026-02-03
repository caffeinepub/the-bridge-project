import { useState } from 'react';
import { useGetInternships, useDeleteInternship, useIsCallerAdmin, usePromoteAdminUsers, useSeedPartnerInternships } from '../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Pencil, Trash2, Loader2, Building2, MapPin, ShieldAlert, FileText, UserPlus, Sprout } from 'lucide-react';
import InternshipFormDialog from '../components/InternshipFormDialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import type { Internship } from '../backend';
import { useNavigate } from '@tanstack/react-router';

export default function AdminDashboard() {
  const { data: internships = [], isLoading } = useGetInternships();
  const { data: isAdmin, isLoading: adminLoading } = useIsCallerAdmin();
  const { mutate: deleteInternship, isPending: isDeleting } = useDeleteInternship();
  const { mutate: promoteAdmins, isPending: isPromoting } = usePromoteAdminUsers();
  const { mutate: seedPartners, isPending: isSeeding } = useSeedPartnerInternships();
  const [editingInternship, setEditingInternship] = useState<Internship | null>(null);
  const [deletingInternship, setDeletingInternship] = useState<Internship | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const navigate = useNavigate();

  const handleDelete = () => {
    if (deletingInternship) {
      deleteInternship(deletingInternship.id, {
        onSuccess: () => setDeletingInternship(null),
      });
    }
  };

  const handlePromoteAdmins = () => {
    promoteAdmins();
  };

  const handleSeedPartners = () => {
    seedPartners();
  };

  if (isLoading || adminLoading) {
    return (
      <div className="container py-12 flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="container py-12 flex items-center justify-center min-h-[60vh]">
        <Card className="max-w-md">
          <CardHeader>
            <div className="flex items-center gap-2">
              <ShieldAlert className="h-6 w-6 text-destructive" />
              <CardTitle>Access Denied</CardTitle>
            </div>
            <CardDescription>
              You do not have permission to access this page. Admin privileges are required.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate({ to: '/' })} className="w-full">
              Return to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container py-12">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
            <p className="text-muted-foreground mt-1">
              Manage internship listings ({internships.length} total)
            </p>
          </div>
          <Button onClick={() => setShowAddDialog(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Internship
          </Button>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Access admin tools and review submissions</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-3">
            <Button
              onClick={() => navigate({ to: '/admin/company-submissions' })}
              variant="outline"
              className="gap-2"
            >
              <FileText className="h-4 w-4" />
              Review Company Surveys
            </Button>
            <Button
              onClick={handlePromoteAdmins}
              variant="outline"
              className="gap-2"
              disabled={isPromoting}
            >
              {isPromoting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <UserPlus className="h-4 w-4" />
              )}
              Promote Pending Admins
            </Button>
            <Button
              onClick={handleSeedPartners}
              variant="outline"
              className="gap-2"
              disabled={isSeeding}
            >
              {isSeeding ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Sprout className="h-4 w-4" />
              )}
              Seed Partner Internships
            </Button>
          </CardContent>
        </Card>

        {/* Internships List */}
        {internships.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <p className="text-muted-foreground text-center mb-4">
                No internships yet. Add your first internship to get started.
              </p>
              <Button onClick={() => setShowAddDialog(true)} className="gap-2">
                <Plus className="h-4 w-4" />
                Add Internship
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {internships.map((internship) => (
              <Card key={Number(internship.id)}>
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <CardTitle className="text-xl">{internship.title}</CardTitle>
                        <Badge variant="secondary">{internship.category}</Badge>
                      </div>
                      <CardDescription className="flex items-center gap-4 flex-wrap">
                        <span className="flex items-center gap-1">
                          <Building2 className="h-4 w-4" />
                          {internship.company}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {internship.location}
                        </span>
                      </CardDescription>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setEditingInternship(internship)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setDeletingInternship(internship)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-muted-foreground">{internship.description}</p>
                  <div className="pt-2">
                    <a
                      href={internship.applicationLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-primary hover:underline"
                    >
                      {internship.applicationLink}
                    </a>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Add Dialog */}
      <InternshipFormDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        onSuccess={() => setShowAddDialog(false)}
      />

      {/* Edit Dialog */}
      {editingInternship && (
        <InternshipFormDialog
          open={!!editingInternship}
          onOpenChange={(open) => !open && setEditingInternship(null)}
          internship={editingInternship}
          onSuccess={() => setEditingInternship(null)}
        />
      )}

      {/* Delete Confirmation */}
      <AlertDialog open={!!deletingInternship} onOpenChange={(open) => !open && setDeletingInternship(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Internship</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deletingInternship?.title}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={isDeleting}>
              {isDeleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
