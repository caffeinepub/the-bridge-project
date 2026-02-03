import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export class ExternalBlob {
    getBytes(): Promise<Uint8Array<ArrayBuffer>>;
    getDirectURL(): string;
    static fromURL(url: string): ExternalBlob;
    static fromBytes(blob: Uint8Array<ArrayBuffer>): ExternalBlob;
    withUploadProgress(onProgress: (percentage: number) => void): ExternalBlob;
}
export interface InternshipInput {
    title: string;
    description: string;
    company: string;
    category: string;
    location: string;
    applicationLink: string;
}
export interface CompanySubmission {
    id: bigint;
    additionalComments: string;
    contactPerson: string;
    submittedAt: bigint;
    submittedBy: Principal;
    email: string;
    companyName: string;
    partnershipInterest: boolean;
    legalDocuments: Array<ExternalBlob>;
    internshipDetails: string;
}
export interface ContactFormSubmission {
    name: string;
    submittedAt: bigint;
    email: string;
    message: string;
}
export interface Internship {
    id: bigint;
    title: string;
    description: string;
    company: string;
    category: string;
    location: string;
    applicationLink: string;
}
export interface CompanySubmissionInput {
    additionalComments: string;
    contactPerson: string;
    email: string;
    companyName: string;
    partnershipInterest: boolean;
    legalDocuments: Array<ExternalBlob>;
    internshipDetails: string;
}
export interface ContactFormInput {
    name: string;
    email: string;
    message: string;
}
export interface UserProfile {
    name: string;
    email: string;
    accountType: AccountType;
}
export interface CategoryCount {
    count: bigint;
    category: string;
}
export enum AccountType {
    company = "company",
    student = "student"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addInternship(input: InternshipInput): Promise<bigint>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    deleteInternship(id: bigint): Promise<void>;
    getAllCompanySubmissions(): Promise<Array<CompanySubmission>>;
    getAllContactFormSubmissions(): Promise<Array<ContactFormSubmission>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getCategoryCounts(): Promise<Array<CategoryCount>>;
    getInternship(id: bigint): Promise<Internship | null>;
    getInternships(): Promise<Array<Internship>>;
    getInternshipsByCategory(category: string): Promise<Array<Internship>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    promoteAdminUsers(): Promise<bigint>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    submitCompanySurvey(input: CompanySubmissionInput): Promise<bigint>;
    submitContactForm(input: ContactFormInput): Promise<void>;
    updateInternship(id: bigint, input: InternshipInput): Promise<void>;
}
