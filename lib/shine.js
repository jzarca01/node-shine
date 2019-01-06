const { createApolloFetch } = require('apollo-fetch');
const axios = require('axios');
const faker = require('faker');

class Shine {
  constructor(device = {}) {
    this.graphRequest = createApolloFetch({
      uri: 'https://shine-163816.appspot-preview.com/v2/graphql'
    });

    this.request = axios.create({
      baseURL: 'https://shine-163816.appspot-preview.com/v2'
    });
    this.device = {
      uuid: device.uuid ? device.uuid : faker.random.uuid(),
      model: device.model ? device.model : 'iPhone 6',
      name: device.name ? device.name : `${faker.name.firstName()}'s iPhone`
    };
    this.accessToken = null;
  }

  setAccessToken(accessToken) {
    this.graphRequest.use(({ request, options }, next) => {
      if (!options.headers) {
        options.headers = {};
      }
      options.headers['authorization'] = `Bearer ${accessToken}`;
      next();
    });
    //this.accessToken = accessToken;
  }

  async startAuth(phoneNumber, passcode) {
    try {
      const auth = await this.request({
        method: 'POST',
        url: `/authentication/phone/${encodeURI(phoneNumber)}/start`,
        data: {
          deviceToken: this.device.uuid,
          model: this.device.model,
          name: this.device.name,
          passcode: passcode
        }
      });
      if (auth.data.tokens) {
        const { access_token } = auth.data.tokens;
        this.setAccessToken(access_token);
      }
      return auth.data;
    } catch (err) {
      console.log('error with startAuth', err);
    }
  }

  async authNewDevice(phoneNumber, passcode, authCode) {
    try {
      const auth = await this.request({
        method: 'POST',
        url: `/authentication/phone/${encodeURI(phoneNumber)}/auth`,
        data: {
          deviceToken: this.device.deviceToken,
          model: this.device.model,
          name: this.device.name,
          passcode: passcode,
          code: authCode
        }
      });
      const { access_token } = auth.data;
      this.setAccessToken(access_token);
      return auth.data;
    } catch (err) {
      console.log('error with startAuth', err);
    }
  }

  async sendQuery({ operationName, query, variables = {} }) {
    try {
      const result = await this.graphRequest({
        operationName: operationName,
        query: query,
        variables: variables
      });
      return result.data;
    } catch (err) {
      console.log('error with sendQuery', err);
    }
  }

  async getCompanyProfile() {
    try {
      const companyQuery = {
        operationName: 'ProfileQuery',
        query: `query ProfileQuery {
            viewer {
              uid, 
              company {
                ...CompanyProfile, 
                __typename, 
              }, 
              __typename
            }
          } 
          fragment CompanyProfile on CompanyProfile {companyProfileId, uid, country, activityType, hasAccre, hasPrelevLib, taxFrequency, isMicro, legalForm, legalRegistrationNumber, legalShareCapital, registrationDate,   legalVATNumber,   tradeName,   legalName,   city,   street,   zip,   updatedAt,   __typename}`,
        variables: {}
      };
      return await this.sendQuery(companyQuery);
    } catch (err) {
      console.log('error with getCompanyProfile', err);
    }
  }

  async getProfile() {
    try {
      const profile = {
        operationName: 'ProfileQuery',
        query: `query ProfileQuery {
            viewer {
              uid,
              profile {
                ...UserProfile,
                __typename
              }
            },
            __typename  
          }
          fragment UserProfile on UserProfile {uid,   birthdate,   birthCountry,   birthCity,   city,   country,   createdAt,   email,   firstName,   lastName,   gender,   nationality,   phone,   street,   zip,   __typename}`,
        variables: {}
      };
      return await this.sendQuery(profile);
    } catch (err) {
      console.log('error with getProfile', err);
    }
  }

  async searchCompany(searchTerm) {
    try {
      const results = {
        operationName: 'ExternalCompanyLookupQuery',
        query: `query ExternalCompanyLookupQuery($q: String!) {
            externalCompanyLookup(q: $q) {
              ...ExternalCompany,
              __typename
            }
          }
        fragment ExternalCompany on ExternalCompany {legalName, legalRegistrationNumber,  street,   zip,   city,   tradeName,   __typename, }`,
        variables: {
          q: searchTerm
        }
      };
      return await this.sendQuery(results);
    } catch (err) {
      console.log('error with searchCompany', err);
    }
  }
}

module.exports = Shine;
