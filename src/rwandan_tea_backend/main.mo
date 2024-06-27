import Array "mo:base/Array";
import Principal "mo:base/Principal";
import Debug "mo:base/Debug";
import Nat "mo:base/Nat";


actor rwanda_tea {

  // Define roles
  type Role = {
    #Farmer;
    #Factory;
    #Distributor;
    #Retailer;
    #Consumer;
    #Admin;
  };

  // Define a stakeholder
  type Stakeholder = {
    id: Nat;
    role: Role;
    name: Text;
    principalId: Text;
  };

  // Define a tea batch
  type TeaBatch = {
    id: Nat;
    farmer: Text;
    factory: ?Text;
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
  public func registerStakeholder(_role: Role, _name: Text, _principalId: Text): async Nat {
    Debug.print("Registering stakeholder...");
    let stakeId = nextId;
    nextId += 1;
    let newStakeholder: Stakeholder = {
      id = stakeId;
      role = _role;
      name = _name;
      principalId = _principalId
    };
    stakeholders := Array.append(stakeholders, [newStakeholder]);
    Debug.print("Stakeholder registered successfully." # Nat.toText(stakeId));
    return stakeId;
  };

  // Function to log in a stakeholder
  public query func login(name: Text, principalId: Text): async ?Stakeholder {
    Debug.print("Attempting login...");
    let stakeOpt = Array.find<Stakeholder>(stakeholders, func(stake) { stake.name == name and stake.principalId == principalId });
    switch (stakeOpt) {
      case (null) {
        Debug.print("Login failed: Stakeholder not found.");
        return null;
      };
      case (?stake) {
        Debug.print("Login successful.");
        return ?stake;
      };
    }
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
      factory = null;
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
              factory = b.factory;
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

   // Function to assign distributor
  public func assignFactory(batchId: Nat, factory: Text): async Bool {
    Debug.print("Assigning factory...");
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
              factory = ?factory;
              distributor = b.distributor;
              retailer = b.retailer;
              quantity = b.quantity;
              status = "Assigned to Factory";
              qrCode = b.qrCode;
            };
          } else {
            b;
          }
        });
        teaBatches := updatedBatches;
        Debug.print("Factory assigned successfully.");
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
              factory = b.factory;
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
  public func updateStakeholder(stakeId: Nat, _role: Role, _name: Text, _principalId: Text): async Bool {
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
          principalId = _principalId;
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
