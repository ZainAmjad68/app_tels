const accessToken = require("./accessToken");
const request = require("./request");
const userFacility = require("./getFacilities");

let url = "https://services.tels.net/workOrders/v1/workOrders";

let sampleData = {
  //facilityId: userFacility.getUserFacility("TELS Integration Test"),
  title: "Hinge Change",
  description:
    "The Hinge in the Room Door is very squeaky and needs to be repaired",
  priority: 3,
  whereLocated: "ABC 123",
  categoryId: 2,
  customCategory: "string",
  customArea: "string",
  status: 1,
  comments: "Kindly fix this soon.",
};

async function createWorkOrder() {
  let access_token = await accessToken.refreshAccessToken();
  console.log("Access Token is:", access_token);

  let facilityId = await userFacility.getUserFacility("TELS Integration Test");
  sampleData.facilityId = facilityId;

  let response = await request.post(url, access_token, sampleData);

  if (response.wasSuccessful) {
    console.log("Work Order Creation Successfull");
    console.log(
      `Associate the entityIdentifier ${response.entityIdentifier} with the resident who sent the request.`
    );
  }
}

createWorkOrder();
