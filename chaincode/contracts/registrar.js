'use strict';

const { Contract } = require('fabric-contract-api');

class RegistrarContract extends Contract {

    constructor() {
        // Provide a custom name to refer to this smart contract
        super('org.property-registration-network.regnet');
    }

    /* ****** All custom functions are defined below ***** */

    // This is a basic user defined function used at the time of instantiating the smart contract
    // to print the success message on console
    async instantiate(ctx) {
        console.log('Regnet Smart Contract Instantiated');
    }

    /**
     * Create a new user account on the network
     * @param ctx - The transaction context object
     * @param userID - ID to be used for creating a new user account
     * @returns
     */
    async approveNewUser(ctx, userID) {
        // Step 1 - Get the user object from blockchain
        const userKey = ctx.stub.createCompositeKey('org.property-registration-network.regnet.user-request', [userId]);
        // Return value of user account from blockchain
        let userBuffer = await ctx.stub
            .getState(userKey)
            .catch(err => console.log(err));
        const user = JSON.parse(userBuffer.toString());


        //Step 2 - Create a new composite key for the new user account
        const userKey = ctx.stub.createCompositeKey('org.property-registration-network.regnet.user', [userID]);

        // Create a user object to be stored in blockchain
        let newUserObject = {
            userId: user.userID,
            name: user.name,
            email: user.email,
            phone: user.phone,
            aadhar: user.aadhar,
            created_at: user.created_at,
            upgradCoins: 0,
        };

        // Convert the JSON object to a buffer and send it to blockchain for storage
        let dataBuffer = Buffer.from(JSON.stringify(newUserObject));
        await ctx.stub.putState(userKey, dataBuffer);
        // Return value of new user account created to user
        return newUserObject;
    }

    /**
     * Approve the property registration request on the network
     * @param ctx - The transaction context object
     * @param propertyID 
     * @returns
     */
    async approvePropertyRegistration(ctx, propertyID) {
        // Step 1 - Get the property object from blockchain
        const propertyRequestKey = ctx.stub.createCompositeKey('org.property-registration-network.regnet.property-request', [propertyID]);
        // Return value of object from blockchain
        let propertyBuffer = await ctx.stub
            .getState(propertyRequestKey)
            .catch(err => console.log(err));
        const property = JSON.parse(propertyBuffer.toString());


        //Step 2 - Create a new composite key for the new property
        const propertyKey = ctx.stub.createCompositeKey('org.property-registration-network.regnet.property', [propertyID]);

        // Create a property object to be stored in blockchain
        let propertyObject = {
            propertyId: property.propertyID,
            owner: property.ownerKey,
            price: property.price,
            status: property.status,
            name: property.name,
            aadhar: property.aadhar,
            created_at: property.created_at,
        };

        // Convert the JSON object to a buffer and send it to blockchain for storage
        let dataBuffer = Buffer.from(JSON.stringify(propertyObject));
        await ctx.stub.putState(userKey, dataBuffer);
        // Return value of new property created to user
        return propertyObject;
    }

    /**
     * Get a user account's details from the blockchain
     * @param ctx - The transaction context
     * @param userId - user ID for which to fetch details
     * @returns
     */
    async viewUser(ctx, userId) {
        // Create the composite key required to fetch record from blockchain
        const userKey = ctx.stub.createCompositeKey('org.property-registration-network.regnet.user', [userId]);

        // Return value of user account from blockchain
        let userBuffer = await ctx.stub
            .getState(userKey)
            .catch(err => console.log(err));
        return JSON.parse(userBuffer.toString());
    }

    /**
     * Get a property  details from the blockchain
     * @param ctx - The transaction context
     * @param propertyID - property ID for which to fetch details
     * @returns
     */
    async viewProperty(ctx, propertyID) {
        // Create the composite key required to fetch record from blockchain
        const propertyKey = ctx.stub.createCompositeKey('org.property-registration-network.regnet.property', [propertyID]);

        // Return value of property account from blockchain
        let propertyBuffer = await ctx.stub
            .getState(propertyKey)
            .catch(err => console.log(err));
        return JSON.parse(propertyBuffer.toString());
    }

}

module.exports = RegistrarContract;