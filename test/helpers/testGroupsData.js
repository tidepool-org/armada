var testGroupsData = {

    relatedSet : {},
    individual : {}
};

// A related set of careteams / groups

testGroupsData.relatedSet = [{
    name : 'family',
    owners: ['99999','222222'],
    members: ['99999','222222','4982883'],
    patient : '12345'
},
{
    name : 'medical',
    owners: ['3343','5555'],
    members: ['3343','5555','4982883'],
    patient : '12345'
},
{
    name : 'careteam',
    owners: ['3343','8898'],
    members: ['3343','8898','4982883'],
    patient : '8876'
},
{
    name : 'test_deluser',
    owners: ['111'],
    members: ['111','88sjjs88'],
    patient : '99'
}];

// One off group with no other related groups

testGroupsData.individual = {
    name : 'test create for 201',
    owners: ['99999','222222'],
    members: ['99999','222222','33333212'],
    patient : '444444'
};


module.exports = testGroupsData;