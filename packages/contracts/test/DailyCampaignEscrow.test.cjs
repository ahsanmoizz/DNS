const DailyCampaignEscrow = artifacts.require("DailyCampaignEscrow");
contract("DailyCampaignEscrow", ([admin, marketer, recipient]) => {
  it("keeps platform fees separate from refundable rewards", async () => {
    const escrow = await DailyCampaignEscrow.new(admin, admin); const campaignId = web3.utils.soliditySha3("campaign-1");
    await escrow.fund(campaignId, web3.utils.toWei("1"), Math.floor(Date.now() / 1000) + 3600, { from: marketer, value: web3.utils.toWei("1.1") });
    const campaign = await escrow.campaigns(campaignId); assert.equal(campaign.rewardBudget.toString(), web3.utils.toWei("1")); assert.equal(campaign.platformFee.toString(), web3.utils.toWei("0.1"));
    await escrow.payReward(campaignId, recipient, web3.utils.toWei("0.25"), { from: admin }); assert.equal((await escrow.campaigns(campaignId)).rewardBudget.toString(), web3.utils.toWei("0.75"));
  });
});
