import {Given, Then, When} from "@cucumber/cucumber";
import { USER_PARTICIPATE} from "../../../../utils/testQuery";

Given(/^John Doe is logged in OpenCTI$/, async function () {
  this.johnDoe = { ...USER_PARTICIPATE }
});
When(/^John Doe create a custom dashboard named My first dashboard$/, function () {

});
Then(/^the custom dashboard is created$/, function () {

});
Then(/^its name is My first dashboard$/, function () {

});