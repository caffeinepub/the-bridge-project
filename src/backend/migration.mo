import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Principal "mo:core/Principal";
import Storage "blob-storage/Storage";

module {
  type OldCompanySubmission = {
    id : Nat;
    companyName : Text;
    contactPerson : Text;
    email : Text;
    internshipDetails : Text;
    partnershipInterest : Bool;
    additionalComments : Text;
    submittedAt : Int;
    submittedBy : Principal;
  };

  type NewCompanySubmission = {
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

  public type OldActor = {
    companySubmissions : Map.Map<Nat, OldCompanySubmission>;
  };

  public type NewActor = {
    companySubmissions : Map.Map<Nat, NewCompanySubmission>;
  };

  public func run(old : OldActor) : NewActor {
    let newSubmissions = old.companySubmissions.map<Nat, OldCompanySubmission, NewCompanySubmission>(
      func(_id, oldSubmission) {
        { oldSubmission with legalDocuments = [] };
      }
    );
    { companySubmissions = newSubmissions };
  };
};
