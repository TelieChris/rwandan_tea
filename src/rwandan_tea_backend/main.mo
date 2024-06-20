import Array "mo:base/Array";
import Principal "mo:base/Principal";
import Debug "mo:base/Debug";
import Nat "mo:base/Nat";

actor rwanda_tea {

  // Define roles
  type Role = {
    #Farmer;
    #Distributor;
    #Retailer;
    #Consumer;
  };

  // Define a stakeholder
  type Stakeholder = {
    id: Nat;
    role: Role;
    name: Text;
  };

  // Define a tea batch
  type TeaBatch = {
    id: Nat;
    farmer: Text;
    distributor: ?Text;
    retailer: ?Text;
    quantity: Nat;
    status: Text;
    qrCode: Text;
  };

  // Array to store stakeholders and tea batches
  var stakeholders: [Stakeholder] = [];
  var teaBatches: [TeaBatch] = [];

  var nextBatchId: Nat = 1;
  var nextId: Nat = 1;

  // Function to register a stakeholder
  public func registerStakeholder(_role: Role, _name: Text): async Nat {
    Debug.print("Registering stakeholder...");
    let stakeId = nextId;
    nextId += 1;
    let newStakeholder: Stakeholder = {
      id = stakeId; 
      role = _role; 
      name = _name};
    stakeholders := Array.append(stakeholders, [newStakeholder]);
    Debug.print("Stakeholder registered successfully." # Nat.toText(stakeId));
    return stakeId;
  };

  // A public method that returns the principal of the caller
  public shared(msg) func owner(): async Principal {
    Debug.print("Returning the principal of the caller...");
    return msg.caller;
  };

  // Function to create a new tea batch
  public func createTeaBatch(farmer: Text, quantity: Nat): async Nat {
    Debug.print("Creating a new tea batch...");
    let batchId = nextBatchId;
    nextBatchId += 1;
    let qrCode = generateQRCode(batchId);
    let newTeaBatch: TeaBatch = {
      id = batchId;
      farmer = farmer;
      distributor = null;
      retailer = null;
      quantity = quantity;
      status = "Created";
      qrCode = qrCode;
    };
    teaBatches := Array.append(teaBatches, [newTeaBatch]);
    Debug.print("Tea batch created successfully with ID " # Nat.toText(batchId));
    return batchId;
  };

  // Generate QR code for a tea batch (Placeholder function)
  private func generateQRCode(batchId: Nat): Text {
    Debug.print("Generating QR code for batch ID " # Nat.toText(batchId) # "...");
    return "QRCode-" # Nat.toText(batchId);
  };

  // Function to assign distributor
  public func assignDistributor(batchId: Nat, distributor: Text): async Bool {
    Debug.print("Assigning distributor...");
    let batchOpt = Array.find<TeaBatch>(teaBatches, func(batch) { batch.id == batchId });
    switch (batchOpt) {
      case (null) { 
        Debug.print("Error: Tea batch not found.");
        return false 
      };
      case (?batch) {
        let updatedBatches = Array.map<TeaBatch, TeaBatch>(teaBatches, func(b) {
          if (b.id == batchId) {
            {
              id = b.id;
              farmer = b.farmer;
              distributor = ?distributor;
              retailer = b.retailer;
              quantity = b.quantity;
              status = "Assigned to Distributor";
              qrCode = b.qrCode;
            };
          } else {
            b;
          }
        });
        teaBatches := updatedBatches;
        Debug.print("Distributor assigned successfully.");
        return true;
      }
    }
  };

  // Function to assign retailer
  public func assignRetailer(batchId: Nat, retailer: Text) : async Bool {
    let batchOpt = Array.find<TeaBatch>(teaBatches, func(batch) { batch.id == batchId });
     switch (batchOpt) {
      case (null) { 
        Debug.print("Error: Tea batch not found.");
        return false 
      };
      case null { return false };
      case (?index) {
        let updatedBatches = Array.map<TeaBatch, TeaBatch>(teaBatches, func(b) {
          if (b.id == batchId) {
            {
              id = b.id;
              farmer = b.farmer;
              distributor = b.distributor;
              retailer = ?retailer;
              quantity = b.quantity;
              status = "Assigned to Retailer";
              qrCode = b.qrCode;
            };
          }else {
            b;
          }
        });
        teaBatches := updatedBatches;
        Debug.print("Retailer assigned successfully.");
        return true;
      }
    }
  };

  // Function to trace tea batch
  public query func traceTeaBatch(batchId: Nat) : async ?TeaBatch {
    return Array.find<TeaBatch>(teaBatches, func(batch) { batch.id == batchId });
  };
  // Function to retrieve all stakeholders
  public query func getStakeholders(): async [Stakeholder] {
    Debug.print("Fetching all Stakeholders...");
    return stakeholders;
  };



  // Function to fetch all tea batches
  public query func getTeaBatches(): async [TeaBatch] {
    Debug.print("Fetching all tea batches...");
    return teaBatches;
  };
  public query func getTeaBatchesId(): async [TeaBatch] {
    return Array.tabulate<TeaBatch>(teaBatches.size(), func (i) {teaBatches[i]});
  };

  public query func getStakeholdersByRole(role: Role): async [Stakeholder] {
    return Array.filter<Stakeholder>(stakeholders, func (s) { s.role == role });
  };
  

  // Function to update stakeholder details
public func updateStakeholder(stakeId: Nat, _role: Role, _name: Text): async Bool {
  Debug.print("Updating stakeholder...");
  let stakeOpt = Array.find<Stakeholder>(stakeholders, func(stake) { stake.id == stakeId });
  switch (stakeOpt) {
    case (null) {
      Debug.print("Error: Stakeholder not found.");
      return false;
    };
    case (?stake) {
      let updatedStakeholder = {
        id = stakeId;
        role = _role;
        name = _name;
      };
      stakeholders := Array.map<Stakeholder, Stakeholder>(stakeholders, func(s) {
        if (s.id == stakeId) updatedStakeholder else s
      });
      Debug.print("Stakeholder updated successfully.");
      return true;
    };
  };
};


// Function to delete a stakeholder
public func deleteStakeholder(stakeId: Nat): async Bool {
  Debug.print("Deleting stakeholder...");
  
  let stakeOpt = Array.find<Stakeholder>(stakeholders, func(stake) { stake.id == stakeId });
  
  switch (stakeOpt) {
    case (null) {
      Debug.print("Error: Stakeholder not found.");
      return false;
    };
    case (?stake) {
      let updatedStakeholders = Array.filter<Stakeholder>(stakeholders, func(s) { s.id != stakeId });
      stakeholders := updatedStakeholders;
      Debug.print("Stakeholder deleted successfully.");
      return true;
    };
  };
};



};
