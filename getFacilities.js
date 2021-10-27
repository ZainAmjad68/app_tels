const accessToken = require("./accessToken");
const request = require("./request");
const _ = require("lodash");

let url = "https://services.tels.net/customers/v1/contacts";

// each organization gets one of these and using it, we can get all the facilities formed for that org in TELS
let personId = 2605055;

async function getAllFacilities() {
  let access_token = await accessToken.refreshAccessToken();
  console.log("Access Token is:", access_token);

  url = `${url}/${personId}/facilities`;
  let response = await request.get(url, access_token);

  console.log(response);
  if (_.isArray(response)) {
    return response;
  }
}

async function getUserFacility(facilityName) {
  let allFacilities = await getAllFacilities();
  let userFacility = _.find(allFacilities, (facility) => {
    return facility.name === facilityName;
  });
  return userFacility.businessUnitId;
}

async function test() {
  let answer = await getUserFacility("TELS Integration Test");
  console.log(answer);
}

test();

module.exports = {
  getUserFacility: getUserFacility,
};
