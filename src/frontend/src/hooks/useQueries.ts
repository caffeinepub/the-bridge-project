import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { Internship, InternshipInput, UserProfile, ContactFormInput, CompanySubmissionInput, CompanySubmission, CategoryCount } from '../backend';
import { toast } from 'sonner';
import { partnerInternships } from '../data/seedPartnerInternships';
import { safeExternalLink } from '../utils/safeExternalLink';
import { useInternetIdentity } from './useInternetIdentity';

// User Profile Queries
export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error('Actor not available');
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
      toast.success('Profile saved successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to save profile: ${error.message}`);
    },
  });
}

// Public Category Counts Query (No Authentication Required)
export function useGetCategoryCounts() {
  const { actor, isFetching } = useActor();

  return useQuery<CategoryCount[]>({
    queryKey: ['categoryCounts'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getCategoryCounts();
    },
    enabled: !!actor && !isFetching,
  });
}

// Internship Queries (Authentication Required)
export function useGetInternships() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery<Internship[]>({
    queryKey: ['internships'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getInternships();
    },
    enabled: !!actor && !isFetching && !!identity,
  });
}

export function useGetInternshipsByCategory(category: string) {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery<Internship[]>({
    queryKey: ['internships', 'category', category],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getInternshipsByCategory(category);
    },
    enabled: !!actor && !isFetching && !!category && !!identity,
  });
}

export function useAddInternship() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: InternshipInput) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addInternship(input);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['internships'] });
      queryClient.invalidateQueries({ queryKey: ['categoryCounts'] });
      toast.success('Internship added successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to add internship: ${error.message}`);
    },
  });
}

export function useUpdateInternship() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, input }: { id: bigint; input: InternshipInput }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateInternship(id, input);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['internships'] });
      queryClient.invalidateQueries({ queryKey: ['categoryCounts'] });
      toast.success('Internship updated successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update internship: ${error.message}`);
    },
  });
}

export function useDeleteInternship() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteInternship(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['internships'] });
      queryClient.invalidateQueries({ queryKey: ['categoryCounts'] });
      toast.success('Internship deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete internship: ${error.message}`);
    },
  });
}

export function useIsCallerAdmin() {
  const { actor, isFetching } = useActor();

  return useQuery<boolean>({
    queryKey: ['isAdmin'],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !isFetching,
  });
}

// Admin Promotion Mutation
export function usePromoteAdminUsers() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.promoteAdminUsers();
    },
    onSuccess: (count) => {
      if (count > 0n) {
        toast.success(`Successfully promoted ${count} user${count === 1n ? '' : 's'} to admin`);
      } else {
        toast.info('No pending admin promotions found');
      }
    },
    onError: (error: Error) => {
      toast.error(`Failed to promote admins: ${error.message}`);
    },
  });
}

// Seed Partner Internships Mutation
export function useSeedPartnerInternships() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error('Actor not available');

      // Get existing internships to check for duplicates
      const existingInternships = await actor.getInternships();
      
      // Create a set of existing internship keys for quick lookup
      const existingKeys = new Set(
        existingInternships.map(i => 
          `${i.title.toLowerCase()}|${i.company.toLowerCase()}|${i.location.toLowerCase()}|${i.category.toLowerCase()}`
        )
      );

      // Filter out internships that already exist
      const newInternships = partnerInternships.filter(partner => {
        const key = `${partner.title.toLowerCase()}|${partner.company.toLowerCase()}|${partner.location.toLowerCase()}|${partner.category.toLowerCase()}`;
        return !existingKeys.has(key);
      });

      if (newInternships.length === 0) {
        return { added: 0, skipped: partnerInternships.length, failed: 0 };
      }

      // Add each new internship
      let addedCount = 0;
      let failedCount = 0;

      for (const internship of newInternships) {
        try {
          const safeInternship: InternshipInput = {
            ...internship,
            applicationLink: safeExternalLink(internship.applicationLink),
          };
          await actor.addInternship(safeInternship);
          addedCount++;
        } catch (error) {
          console.error(`Failed to add internship: ${internship.title}`, error);
          failedCount++;
        }
      }

      return { 
        added: addedCount, 
        skipped: partnerInternships.length - newInternships.length,
        failed: failedCount 
      };
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['internships'] });
      queryClient.invalidateQueries({ queryKey: ['categoryCounts'] });
      
      if (result.added > 0) {
        toast.success(
          `Successfully seeded ${result.added} partner internship${result.added === 1 ? '' : 's'}` +
          (result.skipped > 0 ? ` (${result.skipped} already existed)` : '')
        );
      } else if (result.skipped > 0) {
        toast.info('All partner internships already exist in the system');
      }
      
      if (result.failed > 0) {
        toast.warning(`${result.failed} internship${result.failed === 1 ? '' : 's'} failed to add`);
      }
    },
    onError: (error: Error) => {
      toast.error(`Failed to seed partner internships: ${error.message}`);
    },
  });
}

// Contact Form Mutation (No Authentication Required)
export function useSubmitContactForm() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async (input: ContactFormInput) => {
      if (!actor) throw new Error('Actor not available');
      return actor.submitContactForm(input);
    },
    onSuccess: () => {
      toast.success('Message sent successfully!');
    },
    onError: (error: Error) => {
      const message = error.message.replace('Uncaught Error: ', '').replace('Uncaught ', '');
      toast.error(`Failed to send message: ${message}`);
    },
  });
}

// Company Survey Mutation
export function useSubmitCompanySurvey() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async (input: CompanySubmissionInput) => {
      if (!actor) throw new Error('Actor not available');
      return actor.submitCompanySurvey(input);
    },
    onSuccess: () => {
      toast.success('Survey submitted successfully!');
    },
    onError: (error: Error) => {
      const message = error.message.replace('Uncaught Error: ', '').replace('Uncaught ', '');
      toast.error(`Failed to submit survey: ${message}`);
    },
  });
}

// Company Submissions Query (Admin only)
export function useGetAllCompanySubmissions() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<CompanySubmission[]>({
    queryKey: ['companySubmissions'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      try {
        return await actor.getAllCompanySubmissions();
      } catch (error: any) {
        const message = error.message?.replace('Uncaught Error: ', '').replace('Uncaught ', '') || 'Failed to fetch submissions';
        throw new Error(message);
      }
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });
}
