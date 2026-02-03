import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Nat "mo:core/Nat";
import Iter "mo:core/Iter";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";
import Text "mo:core/Text";
import Storage "blob-storage/Storage";
import MixinStorage "blob-storage/Mixin";
import Char "mo:core/Char";
import Migration "migration";

(with migration = Migration.run)
actor {
  include MixinStorage();

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // User Profile Types
  public type UserProfile = {
    name : Text;
    email : Text;
    accountType : AccountType;
  };

  public type AccountType = { #student; #company };

  // Company Portal Types
  public type CompanySubmission = {
    id : Nat;
    companyName : Text;
    contactPerson : Text;
    email : Text;
    internshipDetails : Text;
    partnershipInterest : Bool;
    additionalComments : Text;
    submittedAt : Int;
    submittedBy : Principal;
    legalDocuments : [Storage.ExternalBlob];
  };

  public type CompanySubmissionInput = {
    companyName : Text;
    contactPerson : Text;
    email : Text;
    internshipDetails : Text;
    partnershipInterest : Bool;
    additionalComments : Text;
    legalDocuments : [Storage.ExternalBlob];
  };

  // Internship Types
  public type Internship = {
    id : Nat;
    title : Text;
    description : Text;
    company : Text;
    location : Text;
    category : Text;
    applicationLink : Text;
  };

  public type InternshipInput = {
    title : Text;
    description : Text;
    company : Text;
    location : Text;
    category : Text;
    applicationLink : Text;
  };

  // Contact Form Types
  public type ContactFormSubmission = {
    name : Text;
    email : Text;
    message : Text;
    submittedAt : Int;
  };

  public type ContactFormInput = {
    name : Text;
    email : Text;
    message : Text;
  };

  public type CategoryCount = {
    category : Text;
    count : Nat;
  };

  // Constants for injected admin emails
  let adminEmail1 = "shutterplug@gmail.com";
  let adminEmail2 = "bahtokocan22@gmail.com";

  // State Variables
  let userProfiles = Map.empty<Principal, UserProfile>();
  let companySubmissions = Map.empty<Nat, CompanySubmission>();
  let internships = Map.empty<Nat, Internship>();
  let contactFormSubmissions = Map.empty<Nat, ContactFormSubmission>();
  var nextSubmissionId = 0;
  var nextInternshipId = 0;
  var nextContactFormId = 0;

  // Track pending admin promotions (users who saved admin email but couldn't be promoted yet)
  let pendingAdminPromotions = Map.empty<Principal, Bool>();

  // User Profile Functions
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };

    validateEmail(profile.accountType, profile.email);
    userProfiles.add(caller, profile);

    // Check if this user should be an admin based on email
    if (isAdminEmail(profile.email)) {
      // Mark for promotion - an existing admin will need to call promoteAdminUsers
      // or the user can use the bootstrap initialize flow
      pendingAdminPromotions.add(caller, true);

      // If caller is already admin (re-saving profile), this is fine
      // If caller is not admin yet, they need to be promoted by existing admin
      // or use initialize() bootstrap
    };
  };

  // Special function for existing admins to promote users with admin emails
  public shared ({ caller }) func promoteAdminUsers() : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can promote users");
    };

    var promotedCount = 0;

    // Iterate through all pending promotions
    for ((principal, _) in pendingAdminPromotions.entries()) {
      // Verify the user still has an admin email in their profile
      switch (userProfiles.get(principal)) {
        case (?profile) {
          if (isAdminEmail(profile.email) and not AccessControl.isAdmin(accessControlState, principal)) {
            AccessControl.assignRole(accessControlState, caller, principal, #admin);
            promotedCount += 1;
          };
        };
        case (null) {};
      };
    };

    promotedCount;
  };

  func isAdminEmail(email : Text) : Bool {
    let normalizedEmail = normalizeEmail(email);
    let normalizedAdmin1 = normalizeEmail(adminEmail1);
    let normalizedAdmin2 = normalizeEmail(adminEmail2);

    normalizedEmail == normalizedAdmin1 or normalizedEmail == normalizedAdmin2;
  };

  func normalizeEmail(email : Text) : Text {
    // Converts to lowercase and trims whitespace
    let lowercased = toLowercase(email);
    lowercased.trim(#char ' ');
  };

  func toLowercase(text : Text) : Text {
    text.map(
      func(c) {
        let code = c.toNat32();
        if (code >= 65 and code <= 90) {
          // 'A' to 'Z'
          Char.fromNat32(code + 32);
        } else {
          c;
        };
      }
    );
  };

  func validateEmail(accountType : AccountType, email : Text) {
    switch (accountType) {
      case (#student) {
        if (not isValidStudentEmail(email)) {
          Runtime.trap("Invalid student email. Must be a valid personal or gcksp12.org email");
        };
      };
      case (#company) {
        if (not isValidCompanyEmail(email)) {
          Runtime.trap("Invalid company email format");
        };
      };
    };
  };

  func isValidStudentEmail(email : Text) : Bool {
    email.contains(#text "@") and
    (email.contains(#text "g.gcksp12.org") or not email.contains(#text "gcksp12.org"))
  };

  func isValidCompanyEmail(email : Text) : Bool {
    email.contains(#text "@");
  };

  // Company Portal Functions
  public shared ({ caller }) func submitCompanySurvey(input : CompanySubmissionInput) : async Nat {
    // First check: Must be authenticated user
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can submit company surveys");
    };

    // Second check: Must have a company account profile
    let profile = switch (userProfiles.get(caller)) {
      case (null) {
        Runtime.trap("Unauthorized: User profile not found. Please create a company profile first");
      };
      case (?p) { p };
    };

    // Third check: Profile must be a company account
    if (profile.accountType != #company) {
      Runtime.trap("Unauthorized: Only company accounts can submit surveys");
    };

    validateCompanySurveyInput(input);

    let id = nextSubmissionId;
    let submission : CompanySubmission = {
      id;
      companyName = input.companyName;
      contactPerson = input.contactPerson;
      email = input.email;
      internshipDetails = input.internshipDetails;
      partnershipInterest = input.partnershipInterest;
      additionalComments = input.additionalComments;
      submittedAt = 0;
      submittedBy = caller;
      legalDocuments = input.legalDocuments;
    };

    companySubmissions.add(id, submission);
    nextSubmissionId += 1;
    id;
  };

  func validateCompanySurveyInput(input : CompanySubmissionInput) {
    if (input.companyName.size() == 0) {
      Runtime.trap("Company name is required");
    };
    if (input.contactPerson.size() == 0) {
      Runtime.trap("Contact person is required");
    };
    if (not isValidCompanyEmail(input.email)) {
      Runtime.trap("Invalid company email format");
    };
    if (input.internshipDetails.size() == 0) {
      Runtime.trap("Internship details are required");
    };
  };

  // Admin-only: Get all company survey submissions
  public query ({ caller }) func getAllCompanySubmissions() : async [CompanySubmission] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view company submissions");
    };
    companySubmissions.values().toArray();
  };

  // Admin-only: Add new internship
  public shared ({ caller }) func addInternship(input : InternshipInput) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can add internships");
    };

    let id = nextInternshipId;
    let internship : Internship = {
      id;
      title = input.title;
      description = input.description;
      company = input.company;
      location = input.location;
      category = input.category;
      applicationLink = input.applicationLink;
    };

    internships.add(id, internship);
    nextInternshipId += 1;
    id;
  };

  // Admin-only: Update existing internship
  public shared ({ caller }) func updateInternship(id : Nat, input : InternshipInput) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update internships");
    };

    switch (internships.get(id)) {
      case (null) {
        Runtime.trap("Internship not found");
      };
      case (?_) {
        let internship : Internship = {
          id;
          title = input.title;
          description = input.description;
          company = input.company;
          location = input.location;
          category = input.category;
          applicationLink = input.applicationLink;
        };
        internships.add(id, internship);
      };
    };
  };

  // Admin-only: Delete internship
  public shared ({ caller }) func deleteInternship(id : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can delete internships");
    };

    switch (internships.get(id)) {
      case (null) {
        Runtime.trap("Internship not found");
      };
      case (?_) {};
    };
    internships.remove(id);
  };

  // Secure Internship Listing APIs (Require Login)
  public query ({ caller }) func getInternships() : async [Internship] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Please log in to view internship listings");
    };
    internships.values().toArray();
  };

  public query ({ caller }) func getInternship(id : Nat) : async ?Internship {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Please log in to view internship details");
    };
    internships.get(id);
  };

  public query ({ caller }) func getInternshipsByCategory(category : Text) : async [Internship] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Please log in to view internships by category");
    };
    let filtered = internships.values().filter(
      func(internship) {
        internship.category == category;
      }
    );
    filtered.toArray();
  };

  // Public API for Category Counts Only (No Authentication Needed)
  public query ({ caller }) func getCategoryCounts() : async [CategoryCount] {
    let categoryMap = Map.empty<Text, Nat>();

    for ((_, internship) in internships.entries()) {
      let category = internship.category;
      let count = switch (categoryMap.get(category)) {
        case (null) { 0 };
        case (?c) { c };
      };
      categoryMap.add(category, count + 1);
    };

    let results = categoryMap.toArray().map(
      func((category, count)) {
        { category; count };
      }
    );
    results;
  };

  // Contact Form Function - No Authentication Required
  public shared ({ caller }) func submitContactForm(input : ContactFormInput) : async () {
    let submissionId = nextContactFormId;
    let submission : ContactFormSubmission = {
      name = input.name;
      email = input.email;
      message = input.message;
      submittedAt = 0;
    };

    contactFormSubmissions.add(submissionId, submission);
    nextContactFormId += 1;
  };

  // Admin-only: Get all contact form submissions
  public query ({ caller }) func getAllContactFormSubmissions() : async [ContactFormSubmission] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view contact form submissions");
    };
    contactFormSubmissions.values().toArray();
  };
};
