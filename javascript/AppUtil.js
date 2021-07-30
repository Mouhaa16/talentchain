exports.buildCAClient = () => {};

exports.registerAndEnrollUser = (caClient, wallet, mspOrg1, org1UserId) => {
  "use strict";

 


  // capture network variables from config.json
  // const configPath = path.join(process.cwd(), './www/blockchain/config.json');
  const configPath = path.join(process.cwd(), "./config.json");
  const configJSON = fs.readFileSync(configPath, "utf8");
  const config = JSON.parse(configJSON);
  // let connection_file = config.connection_file;
  let appAdmin = caClient;
  let orgMSPID = mspOrg1;
  // let userName = config.userName;
  let gatewayDiscovery = config.gatewayDiscovery;

  // const ccpPath = path.join(process.cwd(), './www/blockchain/ibpConnection.json');
  const ccpPath = path.join(process.cwd(), "./ibpConnection.json");
  const ccpJSON = fs.readFileSync(ccpPath, "utf8");
  const ccp = JSON.parse(ccpJSON);


    try {
      // Create a new file system based wallet for managing identities.
    //   const walletPath = path.join(process.cwd(), "wallet");
    //   const wallet = new FileSystemWallet(walletPath);
      console.log(`Wallet path: ${walletPath}`);

      // Check to see if we've already enrolled the user.
      const userExists = await wallet.exists(org1UserId);
      if (userExists) {
        console.log(
          `An identity for the user ${org1UserId} already exists in the wallet`
        );
        return;
      }

      // Check to see if we've already enrolled the admin user.
      const adminExists = await wallet.exists(appAdmin);
      if (!adminExists) {
        console.log(
          `An identity for the admin user ${appAdmin} does not exist in the wallet`
        );
        console.log("Run the enrollAdmin.js application before retrying");
        return;
      }

      // Create a new gateway for connecting to our peer node.
      const gateway = new Gateway();
      await gateway.connect(ccp, {
       wallet,
       identity: org1UserId,
       discovery: { enabled: true, asLocalhost: true },
      });

      // Get the CA client object from the gateway for interacting with the CA.
      const ca = gateway.getClient().getCertificateAuthority();
      const adminIdentity = gateway.getCurrentIdentity();
      console.log(`AdminIdentity: + ${adminIdentity}`);

      // Register the user, enroll the user, and import the new identity into the wallet.
      const secret = await ca.register(
        { affiliation: "org1", enrollmentID: userName, role: "client" },
        adminIdentity
      );

      const enrollment = await ca.enroll({
        enrollmentID: userName,
        enrollmentSecret: secret,
      });
      const userIdentity = X509WalletMixin.createIdentity(
        orgMSPID,
        enrollment.certificate,
        enrollment.key.toBytes()
      );
      wallet.import(userName, userIdentity);
      console.log(
        "Successfully registered and enrolled admin user " +
          userName +
          " and imported it into the wallet"
      );
      return;
    } catch (error) {
      console.error(`Failed to register user + ${userName} + : ${error}`);
      process.exit(1);
    }
  


};

exports.enrollAdmin = (caClient,wallet,mspOrg1) => {
  /*
   * SPDX-License-Identifier: Apache-2.0
   */

  "use strict";

  const FabricCAServices = require("fabric-ca-client");
  const { FileSystemWallet, X509WalletMixin } = require("fabric-network");
  const fs = require("fs");
  const path = require("path");

  // capture network variables from config.json
  const configPath = path.join(process.cwd(), "./config.json");
  const configJSON = fs.readFileSync(configPath, "utf8");
  const config = JSON.parse(configJSON);

  // let connection_file = config.connection_file;
//   let appAdmin = config.appAdmin;
//   let appAdminSecret = config.appAdminSecret;

  let caName = caClient;

  // const ccpPath = path.join(process.cwd(), './www/blockchain/ibpConnection.json');
  // const ccpPath = path.join(process.cwd(), './ibpConnection.json');
  // const ccpJSON = fs.readFileSync(ccpPath, 'utf8');
  // const ccp = JSON.parse(ccpJSON);


    try {
      // Create a new CA client for interacting with the CA.
      const caURL = caName;
      const ca = new FabricCAServices(caURL);

      // Create a new file system based wallet for managing identities.
    //   const walletPath = path.join(process.cwd(), "wallet");
    //   const wallet = new FileSystemWallet(walletPath);
      console.log(`Wallet path: ${walletPath}`);

      // Check to see if we've already enrolled the admin user.
      const adminExists = await wallet.exists(appAdmin);
      if (adminExists) {
        console.log(
          'An identity for the admin user "admin" already exists in the wallet'
        );
        return;
      }

      // Enroll the admin user, and import the new identity into the wallet.
      const enrollment = await ca.enroll({
        enrollmentID: appAdmin,
        enrollmentSecret: appAdminSecret,
      });
      const identity = X509WalletMixin.createIdentity(
      mspOrg1,
        enrollment.certificate,
        enrollment.key.toBytes()
      );
      wallet.import(appAdmin, identity);
      console.log(
        "msg: Successfully enrolled admin user " +
          appAdmin +
          " and imported it into the wallet"
      );
    } catch (error) {
      console.error(`Failed to enroll admin user ' + ${appAdmin} + : ${error}`);
      process.exit(1);
    }

};
