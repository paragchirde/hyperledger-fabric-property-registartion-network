'use strict';

const { Contract } = require('fabric-contract-api');

class UserContract extends Contract {

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
     * Create a new user request on the network
     * @param ctx - The transaction context object
     * @param userID - ID to be used for creating a new user account
     * @param name - Name of the user
     * @param email - Email ID of the user
     * @param phone - Phone Number of the user
     * @param aadhar - Aadhar Number Number of the user
     * @returns
     */
    async requestNewUser(ctx, userID, name, email, phone, aadhar) {
        // Create a new composite key for the new user account
        const userKey = ctx.stub.createCompositeKey('org.property-registration-network.regnet.user-request', [userID]);

        // Create a user object to be stored in blockchain
        let newUserRequestObject = {
            userId: userID,
            name: name,
            email: email,
            phone: phone,
            aadhar: aadhar,
            created_at: new Date()
        };

        // Convert the JSON object to a buffer and send it to blockchain for storage
        let dataBuffer = Buffer.from(JSON.stringify(newUserRequestObject));
        await ctx.stub.putState(userKey, dataBuffer);
        // Return value of request object account created
        return newUserRequestObject;
    }

    /**
     * Recharge the user account for coins on the network
     * @param ctx - The transaction context object
     * @param userID - ID to be used for creating a new user account
     * @param name - Name of the user
     * @param aadhar - Aadhar Number Number of the user
     * @param bank_tx_id - Bank Transaction ID of the transaction done by the user to buy coins
     * @returns
     */
    async rechargeAccount(ctx, userID, name, aadhar, bank_tx_id) {
        // Create a new composite key for the new user account
        // const userKey = ctx.stub.createCompositeKey('org.property-registration-network.regnet.user', [userID]);
        //Check for the predefined set of bank transaction Ids
        var upgradCoinsNew = 0;
        var user = null;
        if (bank_tx_id == "upg100") {
            upgradCoinsNew = 100;
        } else if (bank_tx_id == "upg500") {
            upgradCoinsNew = 500;
        } else if (bank_tx_id == "upg1000") {
            upgradCoinsNew = 1000;
        } else {
            //Throw error 
            throw new Error("Invalid Bank Transaction ID");
        }
        // Get the current user details account from blockchain
        user = await getUser(userID);
        // Create a user object to be stored in blockchain
        let updatedUserObject = {
            userId: user.userID,
            name: user.name,
            email: user.email,
            phone: user.phone,
            aadhar: user.aadhar,
            created_at: user.created_at,
            upgradCoins: user.upgradCoins + upgradCoinsNew
        };

        // Convert the JSON object to a buffer and send it to blockchain for storage
        let dataBuffer = Buffer.from(JSON.stringify(updatedUserObject));
        await ctx.stub.putState(userKey, dataBuffer);
        // Return value of updated user object account created
        return updatedUserObject;
    }

    /**
     * Create a new property registration request on the network
     * @param ctx - The transaction context object
     * @param propertyID - ID to be used for creating a new property registration request
     * @param owner - Owner of the property
     * @param price - Price of the property
     * @param status - Status of the property. It can have two values as "registered" or "onSale"
     * @returns
     */
    async propertyRegistrationRequest(ctx, propertyID, name, aadhar, price, status) {
        // Create a new composite key for the new owner
        const ownerKey = ctx.stub.createCompositeKey('org.property-registration-network.regnet.property-owner', [name]);
        const propertyKey = ctx.stub.createCompositeKey('org.property-registration-network.regnet.property-request', [propertyID]);

        // Create a user object to be stored in blockchain
        let newPropertyRequestObject = {
            propertyId: propertyID,
            owner: ownerKey,
            price: price,
            status: status,
            name: name,
            aadhar: aadhar,
            created_at: new Date()
        };

        // Convert the JSON object to a buffer and send it to blockchain for storage
        let dataBuffer = Buffer.from(JSON.stringify(newPropertyRequestObject));
        await ctx.stub.putState(propertyKey, dataBuffer);
        // Return value of request object account created
        return newPropertyRequestObject;
    }

    /**
     * Get a user account's details from the blockchain
     * @param ctx - The transaction context
     * @param userId - user ID for which to fetch details
     * @returns
     */
    async getUser(ctx, userId) {
        // Create the composite key required to fetch record from blockchain
        const userKey = ctx.stub.createCompositeKey('org.property-registration-network.regnet.user', [userId]);

        // Return value of user request account from blockchain
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

    /**
     * Update a property  details from the blockchain
     * @param ctx - The transaction context
     * @param propertyID - property ID for which to fetch details
     * @param name - Name of the owner
     * @param aadhar - Aadhar Number Number of the owner
     * @param status - Status of the property. It can have two values as "registered" or "onSale"
     * @returns
     */
    async updateProperty(ctx, propertyID, name, aadhar, status) {
        // Create the composite key required to fetch record from blockchain
        const propertyKey = ctx.stub.createCompositeKey('org.property-registration-network.regnet.property', [propertyID]);
        const ownerKey = ctx.stub.createCompositeKey('org.property-registration-network.regnet.property-owner', [name]);

        // Get the current property details account from blockchain
        const property = await getProperty(propertyID);
        // Check for the owner of the property
        if (property.ownerKey != ownerKey) {
            //Throw error
            throw new Error("You are not authorized to update this property");
        } else {
            // Create a property object to be stored in blockchain
            let updatedPropertyObject = {
                propertyId: property.propertyId,
                owner: ownerKey,
                price: property.price,
                status: status,
                name: name,
                aadhar: aadhar,
                created_at: property.created_at
            };

            // Convert the JSON object to a buffer and send it to blockchain for storage
            let dataBuffer = Buffer.from(JSON.stringify(updatedPropertyObject));
            await ctx.stub.putState(propertyKey, dataBuffer);
            // Return value of updated property object account created
            return updatedPropertyObject;
        }
    }

    /**
     * Purchase a property  details from the blockchain
     * @param ctx - The transaction context
     * @param propertyID - property ID for which to fetch details
     * @param name - Name of the owner
     * @param aadhar - Aadhar Number Number of the owner
     * @param status - Status of the property. It can have two values as "registered" or "onSale"
     * @returns
     */
    async purchaseProperty(ctx, propertyID, new_owner_name, new_owner_aadhar) {
        // Create the composite key required to fetch record from blockchain
        const propertyKey = ctx.stub.createCompositeKey('org.property-registration-network.regnet.property', [propertyID]);
        // Get the current property details account from blockchain
        const property = await getProperty(propertyID);
        // Check for the owner of the property
        if (property.status == "registered") {
            //Throw error
            throw new Error("This property is not available for purchase");
        } else {
            const newOwnerKey = ctx.stub.createCompositeKey('org.property-registration-network.regnet.property-owner', [new_owner_name]);
            // Update a property object to be stored in blockchain
            let updatedPropertyObject = {
                propertyId: property.propertyId,
                owner: newOwnerKey,
                price: property.price,
                status: "registered",
                name: new_owner_name,
                aadhar: new_owner_aadhar,
                created_at: property.created_at
            };

            // Convert the JSON object to a buffer and send it to blockchain for storage
            let dataBuffer = Buffer.from(JSON.stringify(updatedPropertyObject));
            await ctx.stub.putState(propertyKey, dataBuffer);
            // Return value of updated property object account created
            return updatedPropertyObject;
        }
    }

}

module.exports = UserContract;