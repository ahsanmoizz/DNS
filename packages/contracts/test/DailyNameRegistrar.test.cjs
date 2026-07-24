const DailyRegistry = artifacts.require("DailyRegistry");
const DailyNameRegistrar = artifacts.require("DailyNameRegistrar");

contract("DailyNameRegistrar catalogue", ([admin]) => {
  it("enforces premium, blocked, and keyword catalogue policy", async () => {
    const registry = await DailyRegistry.new(admin);
    const registrar = await DailyNameRegistrar.new("Daily dly", "DDLY", "dly", registry.address, web3.utils.soliditySha3("dly"), admin, admin);
    const premium = web3.utils.soliditySha3("oracle");
    await registrar.setCatalog(premium, 1, { from: admin });
    assert.equal((await registrar.categoryFor("oracle")).toString(), "1");
    await registrar.setCatalogRule(0, "bank", 4, 3, true, { from: admin });
    assert.equal((await registrar.categoryFor("mybankname")).toString(), "4");
    await registrar.setCatalogRule(1, "official", 3, 1, true, { from: admin });
    assert.equal((await registrar.categoryFor("officialnews")).toString(), "3");
  });
});
