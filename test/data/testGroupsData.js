var testGroupsData = {

    relatedSet : {},
    individual : {}
};

// A related becuse they have a member in common
testGroupsData.relatedSet = [{
    members: ['99999','222222','4982883']
},
{
    members: ['3343','5555','4982883']
},
{
    members: ['3343','8898','4982883']
},
{
    members: ['111','88sjjs88','4982883']
}];

// One off group with no other related groups
testGroupsData.individual = {
    members: ['99999','222222','33333212']
};


module.exports = testGroupsData;